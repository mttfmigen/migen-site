"""Régénère `corpus-offre.ts` depuis le corpus de la maquette V3.

    python3 components/site/secteur/extrait-corpus-offre.py

Lit `maquette/contenu/site/Secteurs/secteurs--*.md` (dossier écarté du paquet
de production, d'où la copie en TypeScript) et, pour chaque page, garde sous
`## L’offre` chaque tableau (ses deux en-têtes, puis la PREMIÈRE cellule de
chaque ligne, en Markdown en ligne, gras et liens compris) et les paragraphes
qui suivent les tableaux.
Une entrée qui porte un mot interdit du contrat est écartée (chaîne vide pour
une cellule, retirée pour un paragraphe) : le rendu retombe alors sur la fiche.
"""
import glob, json, os, re

RACINE = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
SOURCE = os.path.join(RACINE, "maquette", "contenu", "site", "Secteurs")
CIBLE = os.path.join(os.path.dirname(__file__), "corpus-offre.ts")
INTERDIT = re.compile(
    r"int[ée]rim|notamment|sur[\s-]mesure|cl[ée]\s+en\s+main|\br[ée]gie\b|\blevier|mise?\s+[àa]\s+disposition"
    r"|mettre\s+[àa]\s+disposition|sans\s+engagement|concr[èe]tement|incontournable|d[ée]couvrez|en\s+savoir\s+plus|—"
    r"|prix\s+mensuel\s+fixe",
    re.I,
)


def propre(texte):
    return "" if INTERDIT.search(texte) else texte


pages = {}
for fichier in sorted(glob.glob(os.path.join(SOURCE, "secteurs--*.md"))):
    lignes = open(fichier, encoding="utf8").read().split("\n")
    url = next(l.split(":", 1)[1].strip() for l in lignes if l.startswith("> URL :"))
    debut = next(i for i, l in enumerate(lignes) if l.strip() in ("## L’offre", "## L'offre"))
    fin = next((i for i in range(debut + 1, len(lignes)) if lignes[i].startswith("## ")), len(lignes))
    bloc = lignes[debut + 1 : fin]
    tableaux, courant = [], None
    for l in bloc:
        if l.startswith("|"):
            if courant is None:
                courant = []
                tableaux.append(courant)
            courant.append([c.strip() for c in l.strip().strip("|").split("|")])
        else:
            courant = None
    apres = bloc[max(i for i, l in enumerate(bloc) if l.startswith("|")) + 1 :]
    prose = [p.strip() for p in "\n".join(apres).split("\n\n") if p.strip()]
    pages[url] = {
        "tableaux": [{"entetes": t[0][:2], "faisons": [propre(c[0]) for c in t[2:]]} for t in tableaux],
        "prose": [p for p in map(propre, prose) if p],
    }

corps = ",\n".join(
    f"  {json.dumps(url, ensure_ascii=False)}: {json.dumps(p, ensure_ascii=False, indent=2)}".replace("\n", "\n  ")
    for url, p in pages.items()
)
open(CIBLE, "w", encoding="utf8").write(
    "/**\n"
    " * « L’offre » des pages secteur, telle que la maquette V3 la rend au téléphone\n"
    " * (`isTb` : chaque tableau, ses en-têtes et la première cellule de chaque\n"
    " * ligne, gras et liens compris, puis les paragraphes qui suivent). Copie mot pour mot de\n"
    " * `maquette/contenu/site/Secteurs/secteurs--*.md`, dossier écarté du paquet de\n"
    " * production. NE PAS ÉDITER : `python3 components/site/secteur/extrait-corpus-offre.py`.\n"
    " */\n"
    "export interface TableauOffre {\n"
    "  /** Les deux en-têtes (« Ce que nous faisons », « Ce que ça change pour vous »). */\n"
    "  readonly entetes: readonly string[];\n"
    "  /** La première cellule de chaque ligne, en Markdown en ligne. */\n"
    "  readonly faisons: readonly string[];\n"
    "}\n\n"
    "export interface CorpusOffreSecteur {\n"
    "  readonly tableaux: readonly TableauOffre[];\n"
    "  /** Les paragraphes sous les tableaux, en Markdown en ligne. */\n"
    "  readonly prose: readonly string[];\n"
    "}\n\n"
    "export const CORPUS_OFFRE: Readonly<Record<string, CorpusOffreSecteur>> = {\n"
    + corps
    + ",\n};\n"
)
print(len(pages), "pages")
