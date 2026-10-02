#!/usr/bin/env python3
"""
Transforme le corpus éditorial en contenu `pages.contenu` (jsonb).

DEUX GABARITS COHABITENT, et c'est voulu :
  · le gabarit de VENTE, dix sections nommées, pour les 126 pages qui vendent
    une offre (voir `importe_corpus.py` et `types/contenu.ts`) ;
  · le gabarit ÉDITORIAL, celui-ci, pour les 59 pages qui expliquent, listent
    ou racontent : les métiers, les ressources, l'entreprise, les hubs.

Le second n'a pas de sections nommées : il suit le fil du texte. Le parseur est
donc un lecteur de Markdown, pas un extracteur de champs. Il ne reconnaît que ce
que le corpus écrit réellement, relevé sur les 193 fichiers :
titres de niveau 2 et 3, paragraphes (avec gras d'attaque), listes à puces et
numérotées, tableaux, citations.

Comme pour le corpus de vente : ce qui n'est pas reconnu est SIGNALÉ, jamais
comblé.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import unicodedata

CORPUS = pathlib.Path("../migen-refonte/seo/contenus")
SORTIE = pathlib.Path("supabase/import")

# Les commentaires de bloc du corpus (« <!-- BLOC B02 : héro éditorial --> »)
# sont des notes de mise en page à l'intention du maquettiste. Ils ne sont pas
# du contenu et ne se rendent pas.
COMMENTAIRE = re.compile(r"<!--.*?-->", re.S)


def frontmatter(texte: str) -> tuple[dict, str]:
    if not texte.startswith("---"):
        return {}, texte
    fin = texte.find("\n---", 3)
    if fin == -1:
        return {}, texte
    champs = {}
    for ligne in texte[3:fin].splitlines():
        if ":" not in ligne:
            continue
        cle, _, valeur = ligne.partition(":")
        champs[cle.strip()] = valeur.strip().strip('"').strip("'")
    return champs, texte[fin + 4:]


def ancre(titre: str, vues: set[str]) -> str:
    """Une ancre stable, lisible, et unique dans la page."""
    base = unicodedata.normalize("NFD", titre.lower())
    base = "".join(c for c in base if unicodedata.category(c) != "Mn")
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:48] or "section"
    candidat, n = base, 2
    while candidat in vues:
        candidat, n = f"{base}-{n}", n + 1
    vues.add(candidat)
    return candidat


def gras_attaque(texte: str) -> dict:
    """« **Un titre** : la suite » devient {accroche, texte}."""
    m = re.match(r"^\*\*(.+?)\*\*\s*:?\s*(.*)$", texte.strip(), re.S)
    if m and m.group(2).strip():
        return {"accroche": m.group(1).strip(), "texte": m.group(2).strip()}
    return {"texte": texte.strip()}


def analyse(chemin: pathlib.Path) -> dict:
    brut = chemin.read_text(errors="replace")
    fm, corps = frontmatter(brut)
    corps = COMMENTAIRE.sub("", corps)

    blocs: list[dict] = []
    alertes: list[str] = []
    vues: set[str] = set()
    chapeau: str | None = None
    h1_vu = False

    lignes = corps.split("\n")
    i = 0
    while i < len(lignes):
        ligne = lignes[i]
        s = ligne.strip()

        if not s:
            i += 1
            continue

        # Titres
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            niveau, titre = len(m.group(1)), m.group(2).strip()
            if niveau == 1:
                # Le H1 est déjà porté par `pages.titre_h1` : le répéter dans le
                # corps donnerait deux H1 à la page, ce que Google et les
                # lecteurs d'écran lisent comme une erreur de structure.
                h1_vu = True
                i += 1
                continue
            blocs.append({
                "type": "titre",
                "niveau": 2 if niveau == 2 else 3,
                "texte": titre,
                "id": ancre(titre, vues),
            })
            i += 1
            continue

        # Tableau : la ligne d'en-tête, la ligne de séparation, puis les lignes
        if s.startswith("|"):
            table = []
            while i < len(lignes) and lignes[i].strip().startswith("|"):
                table.append(lignes[i].strip())
                i += 1
            if len(table) >= 2:
                cellules = lambda l: [c.strip() for c in l.strip("|").split("|")]
                entetes = cellules(table[0])
                corps_table = [cellules(l) for l in table[2:] if set(l) - set("|-: ")]
                corps_table = [c for c in corps_table if len(c) == len(entetes)]
                if corps_table:
                    blocs.append({"type": "tableau", "entetes": entetes, "lignes": corps_table})
                else:
                    alertes.append("tableau sans ligne exploitable")
            continue

        # Citation
        if s.startswith(">"):
            morceaux = []
            while i < len(lignes) and lignes[i].strip().startswith(">"):
                morceaux.append(lignes[i].strip().lstrip(">").strip())
                i += 1
            texte = " ".join(m for m in morceaux if m)
            if texte:
                blocs.append({"type": "citation", "texte": texte})
            continue

        # Listes, à puces ou numérotées
        m = re.match(r"^([-*]|\d+\.)\s+(.*)$", s)
        if m:
            ordonnee = not m.group(1) in ("-", "*")
            items = []
            while i < len(lignes):
                mm = re.match(r"^([-*]|\d+\.)\s+(.*)$", lignes[i].strip())
                if not mm:
                    break
                items.append(gras_attaque(mm.group(2)))
                i += 1
            bloc = {"type": "liste", "items": items}
            if ordonnee:
                bloc["ordonnee"] = True
            blocs.append(bloc)
            continue

        # Paragraphe : jusqu'à la ligne vide
        morceaux = []
        while i < len(lignes) and lignes[i].strip() and not re.match(
            r"^(#{1,4}\s|[-*]\s|\d+\.\s|\||>)", lignes[i].strip()
        ):
            morceaux.append(lignes[i].strip())
            i += 1
        texte = " ".join(morceaux).strip()
        if not texte:
            continue
        # Le premier paragraphe après le H1 est le chapô.
        if chapeau is None and h1_vu and not blocs:
            chapeau = texte
            continue
        blocs.append({"type": "paragraphe", **gras_attaque(texte)})

    if not blocs:
        alertes.append("aucun bloc reconnu")

    contenu = {"gabarit": "editorial", "blocs": blocs}
    if chapeau:
        contenu["chapeau"] = chapeau

    url = fm.get("url", "").strip()
    if url and not url.endswith("/"):
        url += "/"

    return {
        "fichier": str(chemin),
        "url": url,
        "h1": fm.get("h1", ""),
        "mot_cle": fm.get("mot_cle", ""),
        "contenu": contenu,
        "alertes": alertes,
    }


def main(argv: list[str]) -> int:
    # Seules les pages que le gabarit de vente ne couvre pas.
    deja = set()
    analyse_vente = SORTIE / "corpus-analyse.json"
    if analyse_vente.exists():
        deja = {r["url"] for r in json.loads(analyse_vente.read_text()) if r.get("url")}

    fichiers = sorted(CORPUS.rglob("*.md"))
    resultats = [analyse(f) for f in fichiers]
    retenus = [r for r in resultats if r["url"] and r["url"] not in deja and r["contenu"]["blocs"]]

    from collections import Counter
    types = Counter(b["type"] for r in retenus for b in r["contenu"]["blocs"])
    print(f"{len(fichiers)} fichiers lus, {len(retenus)} retenus (les autres ont déjà un gabarit de vente)")
    print(f"  blocs : {sum(types.values())}")
    for t, n in types.most_common():
        print(f"    {t:<12} {n:>5}")
    alertes = [(r["url"], a) for r in retenus for a in r["alertes"]]
    if alertes:
        print(f"\n{len(alertes)} alertes :")
        for u, a in alertes[:15]:
            print(f"   {u} : {a}")

    (SORTIE / "editorial-analyse.json").write_text(json.dumps(retenus, ensure_ascii=False, indent=1))
    print(f"\n-> {SORTIE / 'editorial-analyse.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
