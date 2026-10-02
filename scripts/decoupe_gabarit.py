#!/usr/bin/env python3
"""
Découpe le contenu d'UNE page de gabarit en instructions SQL assez courtes.

    python3 scripts/decoupe_gabarit.py supabase/import/gabarits/implantations.json

Même recette que `decoupe_sql.py`, dont il reprend le plafond et l'échappement :
la première instruction pose les champs scalaires et chaque tableau VIDE, les
suivantes allongent un tableau à la fois par `jsonb_set(... || morceau)`.

CE QUI CHANGE : les gabarits typés (`types/implantations.ts`) portent des
tableaux à plusieurs profondeurs (`couverture.villes`, `international.bureaux`),
là où `decoupe_sql.py` ne connaît qu'une clé de premier niveau. Le parcours est
donc récursif sur les objets. Un tableau rencontré DANS un élément de tableau
(`agences[].adresses`) n'est pas découpé : l'élément est atomique, le couper
produirait un contenu incohérent.

Le fichier .sql est écrit à côté du .json, même nom. Rien d'autre n'est touché :
d'autres pages du même dossier sont écrites en parallèle.
"""

from __future__ import annotations

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from decoupe_sql import PLAFOND, q  # noqa: E402


def dumps(x) -> str:
    # ` ` plutôt que l'espace insécable brut : visible dans le .sql, et
    # le parseur jsonb de Postgres le décode.
    return json.dumps(x, ensure_ascii=False, separators=(",", ":")).replace(" ", "\\u00a0")


def separe(valeur, chemin: tuple[str, ...]):
    """Retourne (copie avec tableaux vidés, [(chemin, éléments)...])."""
    if isinstance(valeur, list):
        return [], [(chemin, valeur)]
    if isinstance(valeur, dict):
        base, tableaux = {}, []
        for cle, v in valeur.items():
            b, t = separe(v, chemin + (cle,))
            base[cle] = b
            tableaux.extend(t)
        return base, tableaux
    return valeur, []


def morceaux(elements: list) -> list[list]:
    out: list[list] = []
    courant: list = []
    for e in elements:
        if courant and len(dumps(courant + [e]).encode()) > PLAFOND:
            out.append(courant)
            courant = []
        courant.append(e)
    if courant:
        out.append(courant)
    return out


def instructions(url: str, contenu: dict) -> list[str]:
    base, tableaux = separe(contenu, ())
    ou = " where path = " + q(url) + ";"
    out = ["update pages set contenu = " + q(dumps(base)) + "::jsonb" + ou]
    for chemin, elements in tableaux:
        acces = "".join("->" + q(c) for c in chemin)
        for m in morceaux(elements):
            out.append(
                "update pages set contenu = jsonb_set(contenu, '{" + ",".join(chemin) + "}', "
                "(contenu" + acces + ") || " + q(dumps(m)) + "::jsonb)" + ou
            )
    return out


def main(source: pathlib.Path) -> int:
    page = json.loads(source.read_text())
    lignes = instructions(page["url"], page["contenu"])
    cible = source.with_suffix(".sql")
    cible.write_text("\n".join(lignes) + "\n")
    tailles = [len(l.encode()) for l in lignes]
    print(f"{page['url']} -> {cible} : {len(lignes)} instructions, la plus longue {max(tailles)} o")
    trop = [t for t in tailles if t > PLAFOND]
    if trop:
        print(f"  ATTENTION, {len(trop)} instruction(s) au-dessus du plafond de {PLAFOND} o")
        return 1
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(pathlib.Path(sys.argv[1])))
