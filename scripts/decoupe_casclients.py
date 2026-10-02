#!/usr/bin/env python3
"""
Découpe le contenu CAS CLIENTS (/preuves/ et /realisations/) en instructions
assez courtes pour passer la couche de permissions, sur le modèle de
`decoupe_sql.py`, dont il reprend le plafond et l'échappement.

    python3 scripts/decoupe_casclients.py

CE QUI CHANGE PAR RAPPORT AU MODÈLE : ce gabarit porte PLUSIEURS tableaux, et
trois sont imbriqués (`chiffres.cartes`, `chiffres.duo`, `avis.verbatims`). La
première instruction pose tout le scalaire avec chaque tableau VIDE ; les
suivantes allongent un tableau à la fois, désigné par son chemin jsonb :

    update pages set contenu = jsonb_set(contenu, '{chiffres,cartes}',
        (contenu #> '{chiffres,cartes}') || '[...]'::jsonb) where path = ...

Même contrat que le modèle : la première instruction est idempotente, les
suivantes ne le sont pas. Un import partiel se rejoue depuis la première.

Le dossier `gabarits/` est PARTAGÉ avec d'autres pages : ce script n'écrit que
ses fichiers et ne vide rien.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from decoupe_sql import PLAFOND, q  # noqa: E402

ANALYSE = pathlib.Path("supabase/import/casclients-analyse.json")
DOSSIER = pathlib.Path("supabase/import/gabarits")

# Les tableaux de `types/casclients.ts`, dans l'ordre où la page les rend.
CHEMINS: tuple[tuple[str, ...], ...] = (
    ("chiffres", "cartes"),
    ("chiffres", "duo"),
    ("chantiers",),
    ("avis", "verbatims"),
)


def compact(x: object) -> str:
    return json.dumps(x, ensure_ascii=False, separators=(",", ":"))


def poids(x: object) -> int:
    return len(json.dumps(x, ensure_ascii=False).encode())


def lit(d: object, chemin: tuple[str, ...]) -> object:
    for cle in chemin:
        if not isinstance(d, dict) or cle not in d:
            return None
        d = d[cle]
    return d


def avec_tableau_vide(d: dict, chemin: tuple[str, ...]) -> dict:
    """Copie de `d` où le tableau au bout de `chemin` est vidé. Rien n'est muté."""
    tete, *reste = chemin
    if not reste:
        return {**d, tete: []}
    return {**d, tete: avec_tableau_vide(d[tete], tuple(reste))}


def instructions(url: str, contenu: dict) -> list[str]:
    """Les instructions SQL d'une page, dans l'ordre d'exécution."""
    base = contenu
    for chemin in CHEMINS:
        if lit(contenu, chemin) is not None:
            base = avec_tableau_vide(base, chemin)
    out = [
        "update pages set contenu = " + q(compact(base))
        + "::jsonb where path = " + q(url) + ";"
    ]

    for chemin in CHEMINS:
        elements = lit(contenu, chemin)
        if not elements:
            continue
        pg = "{" + ",".join(chemin) + "}"
        tete = f"update pages set contenu = jsonb_set(contenu, '{pg}', (contenu #> '{pg}') || "
        queue = "::jsonb) where path = " + q(url) + ";"

        morceaux: list[list] = [[]]
        for element in elements:
            if morceaux[-1] and sum(map(poids, morceaux[-1])) + poids(element) > PLAFOND:
                morceaux.append([])
            morceaux[-1].append(element)
        out.extend(tete + q(compact(m)) + queue for m in morceaux)
    return out


MOTIF_BASE = re.compile(r"^update pages set contenu = '(.*)'::jsonb where path = '([^']*)';$")
MOTIF_AJOUT = re.compile(
    r"^update pages set contenu = jsonb_set\(contenu, '\{([^}]*)\}', "
    r"\(contenu #> '\{[^}]*\}'\) \|\| '(.*)'::jsonb\) where path = '([^']*)';$"
)


def rejoue(lignes: list[str]) -> dict:
    """
    Rejoue les instructions comme Postgres le ferait, pour PROUVER qu'elles
    reconstruisent le contenu composé. Sans base sous la main, c'est la seule
    porte : un chemin jsonb mal écrit produirait du silence, pas une erreur.
    """
    def dejsonne(s: str) -> object:
        return json.loads(s.replace("''", "'"))

    m = MOTIF_BASE.match(lignes[0])
    assert m, f"première instruction illisible : {lignes[0][:80]}"
    etat = dejsonne(m.group(1))
    for ligne in lignes[1:]:
        m = MOTIF_AJOUT.match(ligne)
        assert m, f"instruction d'ajout illisible : {ligne[:80]}"
        chemin = tuple(m.group(1).split(","))
        cible = etat
        for cle in chemin[:-1]:
            cible = cible[cle]
        cible[chemin[-1]] = cible[chemin[-1]] + dejsonne(m.group(2))
    return etat


def main() -> None:
    pages = json.loads(ANALYSE.read_text(encoding="utf-8"))
    DOSSIER.mkdir(parents=True, exist_ok=True)
    tailles: list[int] = []
    for page in pages:
        url, contenu = page["url"], page["contenu"]
        lignes = instructions(url, contenu)
        assert rejoue(lignes) == contenu, f"{url} : le rejeu ne redonne pas le contenu"
        for ligne in lignes:
            assert len(ligne.encode()) <= PLAFOND, f"{url} : {len(ligne.encode())} o > {PLAFOND}"
        nom = re.sub(r"[^a-z0-9]+", "-", url.strip("/").lower()).strip("-")
        (DOSSIER / f"{nom}.sql").write_text("\n".join(lignes) + "\n", encoding="utf-8")
        tailles.extend(len(l.encode()) for l in lignes)
        print(f"{url} -> {DOSSIER / nom}.sql : {len(lignes)} instructions, rejeu conforme")
    print(f"{len(tailles)} instructions, la plus longue {max(tailles)} o, plafond {PLAFOND} o")


if __name__ == "__main__":
    main()
