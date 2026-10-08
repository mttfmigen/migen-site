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

LE HUB /preuves/ (08/10) porte `vue: "hub"` et deux tableaux, dont un
imbriqué dans l'autre : `categories[i].cas`. Ses chemins se calculent sur la
page (`chemins_de`) : les catégories s'ajoutent avec `cas` vide, puis chaque
`{categories,<i>,cas}` s'allonge à son tour. Une entrée qui porte `titre_h1`
ajoute une instruction sur cette colonne : la capture attend « Preuves : nos
réalisations », la base écrit autre chose.

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
        if isinstance(d, list) and cle.isdigit() and int(cle) < len(d):
            d = d[int(cle)]
        elif isinstance(d, dict) and cle in d:
            d = d[cle]
        else:
            return None
    return d


def chemins_de(contenu: dict) -> tuple[tuple[str, ...], ...]:
    """Les tableaux à allonger, parent avant enfant."""
    if contenu.get("vue") != "hub":
        return CHEMINS
    n = len(contenu.get("categories", []))
    return (("recents",), ("categories",)) + tuple(
        ("categories", str(i), "cas") for i in range(n)
    )


def imbrique(chemin: tuple[str, ...], chemins: tuple[tuple[str, ...], ...]) -> bool:
    """Le tableau vit-il DANS un autre tableau de la liste ?"""
    return any(c != chemin and chemin[: len(c)] == c for c in chemins)


def avec_tableau_vide(d: dict, chemin: tuple[str, ...]) -> dict:
    """Copie de `d` où le tableau au bout de `chemin` est vidé. Rien n'est muté."""
    tete, *reste = chemin
    if not reste:
        return {**d, tete: []}
    return {**d, tete: avec_tableau_vide(d[tete], tuple(reste))}


def sans_sous_tableaux(
    elements: list, chemin: tuple[str, ...], chemins: tuple[tuple[str, ...], ...]
) -> list:
    """Copie des éléments, chaque tableau listé sous l'un d'eux vidé."""
    out = []
    for k, e in enumerate(elements):
        for c in chemins:
            if len(c) == len(chemin) + 2 and c[: len(chemin) + 1] == chemin + (str(k),):
                e = avec_tableau_vide(e, c[-1:])
        out.append(e)
    return out


def instructions(url: str, contenu: dict, titre_h1: str | None = None) -> list[str]:
    """Les instructions SQL d'une page, dans l'ordre d'exécution."""
    chemins = chemins_de(contenu)
    base = contenu
    for chemin in chemins:
        if not imbrique(chemin, chemins) and lit(contenu, chemin) is not None:
            base = avec_tableau_vide(base, chemin)
    out = [
        "update pages set contenu = " + q(compact(base))
        + "::jsonb where path = " + q(url) + ";"
    ]

    for chemin in chemins:
        elements = lit(contenu, chemin)
        if not elements:
            continue
        # Un élément qui porte lui-même un tableau de la liste part avec ce
        # tableau vide : une instruction suivante l'allongera.
        elements = sans_sous_tableaux(elements, chemin, chemins)
        pg = "{" + ",".join(chemin) + "}"
        tete = f"update pages set contenu = jsonb_set(contenu, '{pg}', (contenu #> '{pg}') || "
        queue = "::jsonb) where path = " + q(url) + ";"

        morceaux: list[list] = [[]]
        for element in elements:
            if morceaux[-1] and sum(map(poids, morceaux[-1])) + poids(element) > PLAFOND:
                morceaux.append([])
            morceaux[-1].append(element)
        out.extend(tete + q(compact(m)) + queue for m in morceaux)
    if titre_h1:
        out.append(
            "update pages set titre_h1 = " + q(titre_h1) + " where path = " + q(url) + ";"
        )
    return out


MOTIF_BASE = re.compile(r"^update pages set contenu = '(.*)'::jsonb where path = '([^']*)';$")
MOTIF_AJOUT = re.compile(
    r"^update pages set contenu = jsonb_set\(contenu, '\{([^}]*)\}', "
    r"\(contenu #> '\{[^}]*\}'\) \|\| '(.*)'::jsonb\) where path = '([^']*)';$"
)


MOTIF_TITRE = re.compile(r"^update pages set titre_h1 = '(.*)' where path = '([^']*)';$")


def rejoue(lignes: list[str]) -> tuple[dict, str | None]:
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
    titre = None
    for ligne in lignes[1:]:
        t = MOTIF_TITRE.match(ligne)
        if t:
            titre = t.group(1).replace("''", "'")
            continue
        m = MOTIF_AJOUT.match(ligne)
        assert m, f"instruction d'ajout illisible : {ligne[:80]}"
        chemin = tuple(m.group(1).split(","))
        cible = etat
        for cle in chemin[:-1]:
            cible = cible[int(cle)] if isinstance(cible, list) else cible[cle]
        cible[chemin[-1]] = cible[chemin[-1]] + dejsonne(m.group(2))
    return etat, titre


def main() -> None:
    pages = json.loads(ANALYSE.read_text(encoding="utf-8"))
    DOSSIER.mkdir(parents=True, exist_ok=True)
    tailles: list[int] = []
    for page in pages:
        url, contenu, titre_h1 = page["url"], page["contenu"], page.get("titre_h1")
        lignes = instructions(url, contenu, titre_h1)
        assert rejoue(lignes) == (contenu, titre_h1), f"{url} : le rejeu ne redonne pas le contenu"
        for ligne in lignes:
            assert len(ligne.encode()) <= PLAFOND, f"{url} : {len(ligne.encode())} o > {PLAFOND}"
        nom = re.sub(r"[^a-z0-9]+", "-", url.strip("/").lower()).strip("-")
        (DOSSIER / f"{nom}.sql").write_text("\n".join(lignes) + "\n", encoding="utf-8")
        tailles.extend(len(l.encode()) for l in lignes)
        print(f"{url} -> {DOSSIER / nom}.sql : {len(lignes)} instructions, rejeu conforme")
    print(f"{len(tailles)} instructions, la plus longue {max(tailles)} o, plafond {PLAFOND} o")


if __name__ == "__main__":
    main()
