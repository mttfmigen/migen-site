#!/usr/bin/env python3
"""
Découpe l'écriture d'une page de GABARIT (expertises, et les suivants) en
instructions assez courtes pour passer la couche de permissions.

Même raison et même méthode que `decoupe_sql.py`, dont ce fichier est le
frère : la couche qui encadre `execute_sql` refuse toute instruction trop
longue, sans message. On pose d'abord le contenu avec TOUS ses tableaux vides,
puis on allonge chaque tableau par morceaux.

CE QUI CHANGE PAR RAPPORT À `decoupe_sql.py` : les gabarits portent plusieurs
tableaux, et à plusieurs profondeurs (`types.cartes`, `dosage.repartition.jeux`).
Le découpage les découvre tous en parcourant le contenu : chaque tableau
rencontré sous un objet (jamais sous un autre tableau) est vidé dans la base et
rempli ensuite par

    jsonb_set(contenu, '{types,cartes}', (contenu->'types'->'cartes') || '[...]')

Un élément de tableau est atomique : ses propres listes (`puces`, `barres`)
partent avec lui, couper un élément produirait du contenu incohérent.

LE PLAFOND SE MESURE SUR LA LIGNE ENTIÈRE, saut de ligne compris, comme le
fait `wc -c` : le doublement des apostrophes et le préfixe SQL comptent. Un
élément seul trop lourd est une erreur, pas un avertissement.

Source : `supabase/import/gabarits-maquette.json`, liste de { url, contenu }.
Sortie : `supabase/import/gabarits/<url>.sql`, un fichier par page. Les autres
fichiers du dossier ne sont pas touchés : d'autres gabarits y écrivent.

    python3 scripts/decoupe_gabarits.py
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

PLAFOND = 3800  # octets par ligne, saut de ligne compris. Voir decoupe_sql.py.

Chemin = tuple[str, ...]


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def compact(valeur: object) -> str:
    return json.dumps(valeur, ensure_ascii=False, separators=(",", ":"))


def octets(ligne: str) -> int:
    """Ce que `wc -c` compterait pour cette ligne, saut de ligne compris."""
    return len(ligne.encode()) + 1


def tableaux(contenu: dict, prefixe: Chemin = ()) -> list[tuple[Chemin, list]]:
    """Tous les tableaux non vides atteignables par des objets, dans l'ordre du JSON."""
    trouves: list[tuple[Chemin, list]] = []
    for cle, valeur in contenu.items():
        chemin = prefixe + (cle,)
        if isinstance(valeur, list):
            if valeur:
                trouves.append((chemin, valeur))
        elif isinstance(valeur, dict):
            trouves.extend(tableaux(valeur, chemin))
    return trouves


def base_vide(contenu: dict) -> dict:
    """Copie du contenu où chaque tableau découvert est vide."""
    base: dict = {}
    for cle, valeur in contenu.items():
        if isinstance(valeur, list):
            base[cle] = []
        elif isinstance(valeur, dict):
            base[cle] = base_vide(valeur)
        else:
            base[cle] = valeur
    return base


def instruction_ajout(url: str, chemin: Chemin, morceau: list) -> str:
    acces = "".join("->" + q(c) for c in chemin)
    return (
        "update pages set contenu = jsonb_set(contenu, '{" + ",".join(chemin) + "}', "
        "(contenu" + acces + ") || " + q(compact(morceau)) + "::jsonb) "
        "where path = " + q(url) + ";"
    )


def instructions(url: str, contenu: dict) -> list[str]:
    """Les instructions SQL d'une page, dans l'ordre d'exécution."""
    out = [
        "update pages set contenu = " + q(compact(base_vide(contenu)))
        + "::jsonb where path = " + q(url) + ";"
    ]
    if octets(out[0]) > PLAFOND:
        raise SystemExit(
            f"{url} : le contenu de base pèse {octets(out[0])} o, au-dessus du plafond"
        )

    for chemin, elements in tableaux(contenu):
        morceau: list = []
        for element in elements:
            seul = instruction_ajout(url, chemin, [element])
            if octets(seul) > PLAFOND:
                raise SystemExit(
                    f"{url} : un élément de {'.'.join(chemin)} pèse {octets(seul)} o seul, "
                    "au-dessus du plafond. Le découper produirait du contenu incohérent."
                )
            if morceau and octets(instruction_ajout(url, chemin, morceau + [element])) > PLAFOND:
                out.append(instruction_ajout(url, chemin, morceau))
                morceau = []
            morceau.append(element)
        if morceau:
            out.append(instruction_ajout(url, chemin, morceau))
    return out


def nom_fichier(url: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", url.strip("/").lower()).strip("-")


def ecris(source: pathlib.Path, dossier: pathlib.Path) -> None:
    pages = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(pages, list) or not pages:
        raise SystemExit(f"{source} : liste non vide de pages attendue")
    dossier.mkdir(parents=True, exist_ok=True)

    total = 0
    plus_longue = 0
    for page in sorted(pages, key=lambda p: p["url"]):
        url, contenu = page["url"], page["contenu"]
        lignes = instructions(url, contenu)
        cible = dossier / f"{nom_fichier(url)}.sql"
        cible.write_text("\n".join(lignes) + "\n", encoding="utf-8")
        tailles = [octets(l) for l in lignes]
        total += len(lignes)
        plus_longue = max(plus_longue, *tailles)
        print(f"{url} -> {cible} : {len(lignes)} instructions, la plus longue {max(tailles)} o")

    # Relecture depuis le disque : ce qui est mesuré est ce qui est écrit.
    for fichier in dossier.glob("*.sql"):
        for ligne in fichier.read_text(encoding="utf-8").split("\n"):
            if ligne.strip() and octets(ligne) > PLAFOND:
                raise SystemExit(f"{fichier} : une ligne pèse {octets(ligne)} o")
    print(f"{len(pages)} pages, {total} instructions, la plus longue {plus_longue} o, plafond {PLAFOND} o")


if __name__ == "__main__":
    racine = pathlib.Path(__file__).resolve().parent.parent
    base = racine / "supabase" / "import"
    source = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else base / "gabarits-maquette.json"
    ecris(source, base / "gabarits")
