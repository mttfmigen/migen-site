#!/usr/bin/env python3
"""
Transforme les études de cas de `/preuves/<client>/` en contenu `pages.contenu`
(jsonb) au format du gabarit FICHE, puis en instructions SQL découpées.

LE GABARIT FAIT FOI : `types/fiche.ts`, rendu par
`components/site/fiche/PageFiche.tsx`. Le corpus
(`../migen-refonte/seo/CONVERSION/Preuves/*.md`) écrit chaque cas en sept
sections nommées. Correspondance retenue, section par section :

    LE CLIENT ET LE SITE            -> chapeau        les paragraphes ; les puces
                                       (« **Site** : … ») et la citation « Ce cas
                                       figure dans nos études de cas » restent dehors
    LE DISPOSITIF                   -> fiche          une ligne par rangée du tableau
                                       | Élément | Détail |
    LA SITUATION                    -> contexte       aplatie, voir `aplatit`
    CE QUE NOUS AVONS MIS EN PLACE  -> intervention   aplatie
    LE RÉSULTAT                     -> resultats      une puce « **gras** : suite »
                                       donne {valeur: gras, libelle: suite} ; la
                                       prose et les citations restent dehors
    LE DÉROULÉ                      -> aucun champ    laissé de côté, signalé
    CTA                             -> aucun champ    le pavé final du gabarit est
                                       fixe ; laissé de côté, signalé
    SECTION 2 . CHIFFRES CLES       -> aucun champ    dix fichiers la portent ; ce
                                       ne sont pas des résultats, laissée de côté

`surtitre` et `images` ne sont jamais écrits : le corpus ne les fournit pas et
le gabarit sait ne rien rendre. Ce qui n'entre pas dans le type est conservé
tel quel sous `hors_gabarit` dans l'analyse, pour qu'un futur champ puisse le
reprendre sans réanalyser le corpus.

POURQUOI UN PARSEUR : il ne peut pas inventer. Ce qui n'est pas reconnu est
SIGNALÉ, jamais comblé. Aucune reformulation : le texte part mot pour mot,
liens Markdown et gras compris, que `TexteRiche` rend côté composant.

Sortie :
    supabase/import/fiches-analyse.json
    supabase/import/gabarits/preuves-<slug>.sql    un fichier par page

Les .sql suivent `decoupe_sql.py` : la première instruction pose le contenu de
base (champs scalaires, tableaux VIDES), les suivantes allongent chaque tableau
par `jsonb_set`. Aucune instruction ne dépasse PLAFOND octets : une page qui
l'exigerait est REFUSÉE et signalée, pas découpée au milieu d'un champ.

Ce script N'ÉCRIT RIEN EN BASE.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
from collections import Counter

from decoupe_sql import PLAFOND, q
from importe_corpus import COMMENTAIRE_HTML, frontmatter, sans_accent

CORPUS = pathlib.Path("../migen-refonte/seo/CONVERSION/Preuves")
SORTIE = pathlib.Path("supabase/import")
GABARITS = SORTIE / "gabarits"
URLS = pathlib.Path("docs/urls-site-actuel.json")

# Les sept sections du gabarit de rédaction, comparées sans accent ni casse.
SEPT = {
    "LE CLIENT ET LE SITE": "client",
    "LA SITUATION": "situation",
    "LE DISPOSITIF": "dispositif",
    "CE QUE NOUS AVONS MIS EN PLACE": "mis_en_place",
    "LE RESULTAT": "resultat",
    "LE DEROULE": "deroule",
    "CTA": "cta",
}
# Celles qu'un fichier doit porter pour être une fiche. `preuves.md`, la page
# hub, n'en a aucune : elle relève d'un autre gabarit et est écartée ici.
OBLIGATOIRES = {"client", "situation", "dispositif", "mis_en_place", "resultat", "deroule"}
CHIFFRES_CLES = "SECTION 2 . CHIFFRES CLES"

ENTETE = re.compile(r"^##\s+(.*?)\s*$", re.M)
H1 = re.compile(r"^#\s+(.*?)\s*$", re.M)
PUCE = re.compile(r"^([-*]|\d+\.)\s+(.*)$")
LIEN = re.compile(r"\[([^\]]+)\]\(([^)]*)\)")
# « **gras** : suite » ou « **gras**, suite ». Le deux-points et la virgule qui
# suivent le gras séparent la tête de sa suite : rendus sur deux lignes et à deux
# tailles par la carte résultat, ils n'ont plus rien à séparer et tombent, comme
# le deux-points tombe déjà dans `importe_corpus.py`.
GRAS_ATTAQUE = re.compile(r"^\*\*(.+?)\*\*\s*[:,]?\s*(.*)$", re.S)

# Interdits de copie du projet (CLAUDE.md § 9). Le parseur ne corrige pas : il
# signale, et la page reste à relire. Les frontières de mot évitent
# « stratégie » pour « régie ».
INTERDITS = re.compile(
    r"\b(r[ée]gie|int[ée]rim|mise [àa] disposition|sans engagement|cl[ée] en main"
    r"|sur mesure|leviers?|concr[èe]tement|notamment|incontournables?|d[ée]couvrez"
    r"|5 agences|cinq agences)\b|\+\s?200|—",
    re.I,
)


def sections(corps: str) -> list[tuple[str, str]]:
    """[(titre, texte brut)] dans l'ordre du fichier. Ce qui précède le premier ## est le H1."""
    bornes = list(ENTETE.finditer(corps))
    out = []
    for i, m in enumerate(bornes):
        fin = bornes[i + 1].start() if i + 1 < len(bornes) else len(corps)
        out.append((m.group(1), corps[m.end():fin].strip()))
    return out


def blocs(texte: str) -> list[dict]:
    """
    Lecteur de Markdown minimal : paragraphes, listes, tableaux, citations.

    C'est tout ce que ces vingt-huit fichiers contiennent. Un titre intermédiaire
    serait inattendu : il est gardé comme bloc « titre » et signalé plus loin.
    """
    out: list[dict] = []
    lignes = texte.split("\n")
    i = 0
    while i < len(lignes):
        s = lignes[i].strip()
        if not s:
            i += 1
            continue
        if s.startswith("|"):
            table = []
            while i < len(lignes) and lignes[i].strip().startswith("|"):
                table.append(lignes[i].strip())
                i += 1
            cellules = lambda l: [c.strip() for c in l.strip("|").split("|")]
            out.append({
                "type": "tableau",
                "entetes": cellules(table[0]),
                "lignes": [cellules(l) for l in table[2:] if set(l) - set("|-: ")],
                "brut": "\n".join(table),
            })
            continue
        if s.startswith(">"):
            morceaux = []
            while i < len(lignes) and lignes[i].strip().startswith(">"):
                morceaux.append(lignes[i].strip().lstrip(">").strip())
                i += 1
            out.append({"type": "citation", "texte": " ".join(m for m in morceaux if m)})
            continue
        if (m := PUCE.match(s)):
            items = []
            while i < len(lignes) and (mm := PUCE.match(lignes[i].strip())):
                items.append(mm.group(2).strip())
                i += 1
            out.append({"type": "liste", "ordonnee": m.group(1) not in ("-", "*"), "items": items})
            continue
        if s.startswith("#"):
            out.append({"type": "titre", "texte": s.lstrip("#").strip()})
            i += 1
            continue
        morceaux = []
        while i < len(lignes) and lignes[i].strip() and not re.match(r"^(#|[-*]\s|\d+\.\s|\||>)", lignes[i].strip()):
            morceaux.append(lignes[i].strip())
            i += 1
        out.append({"type": "paragraphe", "texte": " ".join(morceaux)})
    return out


def brut(b: dict) -> str:
    """Le bloc tel qu'il s'écrit en Markdown, pour `hors_gabarit`."""
    if b["type"] == "liste":
        return "\n".join(f"- {it}" for it in b["items"])
    if b["type"] == "citation":
        return f"> {b['texte']}"
    if b["type"] == "tableau":
        return b["brut"]
    return b["texte"]


def aplatit(bs: list[dict], champ: str, alertes: list[str]) -> str | None:
    """
    Une section de prose et de puces devient UNE chaîne, pour un champ que le
    gabarit rend dans un seul paragraphe (`contexte`, `intervention`).

    Chaque paragraphe et chaque puce tient sur sa propre ligne, séparés par un
    retour à la ligne. À l'écran, `white-space: normal` le réduit à une espace :
    le rendu est celui d'une jonction par espace. Dans la donnée, la frontière
    des paragraphes reste lisible, et un futur `pre-line` la rendrait sans
    réimport. Le marqueur de liste (« - », « 1. ») est de la syntaxe, pas du
    texte : il tombe, comme « ## » tombe pour les sections.
    """
    lignes: list[str] = []
    for b in bs:
        if b["type"] == "paragraphe":
            lignes.append(b["texte"])
        elif b["type"] == "liste":
            lignes.extend(b["items"])
        elif b["type"] == "citation":
            alertes.append(f"{champ} : une citation aplatie dans le texte")
            lignes.append(b["texte"])
        elif b["type"] == "titre":
            alertes.append(f"{champ} : un titre intermédiaire aplati dans le texte")
            lignes.append(b["texte"])
        else:
            alertes.append(f"{champ} : un bloc {b['type']} sans place, laissé de côté")
    return "\n".join(l for l in lignes if l) or None


def chapeau(bs: list[dict], hors: dict, alertes: list[str]) -> str | None:
    paras = [b["texte"] for b in bs if b["type"] == "paragraphe"]
    autres = [b for b in bs if b["type"] != "paragraphe"]
    if autres:
        # Les puces « **Site** : … » redisent le tableau LE DISPOSITIF, et la
        # citation « Ce cas figure dans nos études de cas » redit le fil d'Ariane.
        hors["LE CLIENT ET LE SITE"] = [brut(b) for b in autres]
    if not paras:
        alertes.append("LE CLIENT ET LE SITE : aucun paragraphe, chapeau vide")
    return "\n".join(paras) or None


def fiche(bs: list[dict], alertes: list[str]) -> list[dict]:
    tableaux = [b for b in bs if b["type"] == "tableau"]
    if len(tableaux) != 1:
        alertes.append(f"LE DISPOSITIF : {len(tableaux)} tableau(x), un attendu")
    autres = [b for b in bs if b["type"] != "tableau"]
    if autres:
        alertes.append(f"LE DISPOSITIF : {len(autres)} bloc(s) hors tableau, laissé(s) de côté")
    out = []
    for t in tableaux:
        if len(t["entetes"]) != 2:
            alertes.append(f"LE DISPOSITIF : tableau à {len(t['entetes'])} colonnes, deux attendues")
            continue
        for r in t["lignes"]:
            if len(r) != 2 or not r[0] or not r[1]:
                alertes.append(f"LE DISPOSITIF : rangée incomplète ignorée {r}")
                continue
            out.append({"libelle": r[0], "valeur": r[1]})
    return out


def resultats(bs: list[dict], hors: dict, alertes: list[str]) -> list[dict]:
    out = []
    for b in bs:
        if b["type"] != "liste":
            continue
        for item in b["items"]:
            m = GRAS_ATTAQUE.match(item)
            if m:
                out.append({"valeur": m.group(1).strip(), "libelle": m.group(2).strip()})
            else:
                alertes.append("LE RÉSULTAT : puce sans gras d'attaque, reprise entière en valeur")
                out.append({"valeur": item, "libelle": ""})
    autres = [b for b in bs if b["type"] != "liste"]
    if autres:
        hors["LE RÉSULTAT"] = [brut(b) for b in autres]
    if not out:
        alertes.append("LE RÉSULTAT : aucune puce, carte résultat absente")
    return out


def textes(contenu: dict):
    """Toutes les chaînes du contenu, pour les contrôles de copie."""
    for v in contenu.values():
        if isinstance(v, str):
            yield v
        elif isinstance(v, list):
            for e in v:
                yield from (x for x in e.values() if isinstance(x, str))


def analyse(chemin: pathlib.Path, urls_connues: set[str]) -> dict:
    fm, corps = frontmatter(chemin.read_text(errors="replace"))
    corps = COMMENTAIRE_HTML.sub("", corps)
    alertes: list[str] = []
    hors: dict[str, list[str]] = {}

    url = fm.get("url", "").strip()
    if url and not url.endswith("/"):
        url += "/"
    if url not in urls_connues:
        alertes.append(f"url {url or '(absente)'} inconnue de urls-site-actuel.json")

    # Le H1 du corps n'est pas repris : `pages.titre_h1` le porte déjà. On
    # vérifie seulement qu'il dit la même chose que le frontmatter.
    if (m := H1.search(corps)) and m.group(1) != fm.get("h1", ""):
        alertes.append(f"H1 du corps « {m.group(1)} » différent du frontmatter « {fm.get('h1', '')} »")

    parts: dict[str, str] = {}
    for titre, texte in sections(corps):
        cle = SEPT.get(sans_accent(titre).upper())
        if cle:
            if cle in parts:
                alertes.append(f"section « {titre} » en double, la seconde est ignorée")
                continue
            parts[cle] = texte
        elif sans_accent(titre).upper() == CHIFFRES_CLES:
            hors[CHIFFRES_CLES] = [texte]
        else:
            alertes.append(f"section « {titre} » inconnue du gabarit, laissée de côté")
            hors[titre] = [texte]

    resultat = {"fichier": str(chemin), "url": url, "h1": fm.get("h1", "")}
    manquantes = OBLIGATOIRES - set(parts)
    if manquantes:
        noms = sorted(t for t, c in SEPT.items() if c in manquantes)
        alertes.append(f"pas une fiche, sections absentes : {', '.join(noms)}")
        return {**resultat, "contenu": None, "hors_gabarit": hors, "alertes": alertes}

    contenu: dict = {"gabarit": "fiche"}
    if (c := chapeau(blocs(parts["client"]), hors, alertes)):
        contenu["chapeau"] = c
    if (f := fiche(blocs(parts["dispositif"]), alertes)):
        contenu["fiche"] = f
    if (c := aplatit(blocs(parts["situation"]), "LA SITUATION", alertes)):
        contenu["contexte"] = c
    if (c := aplatit(blocs(parts["mis_en_place"]), "CE QUE NOUS AVONS MIS EN PLACE", alertes)):
        contenu["intervention"] = c
    if (r := resultats(blocs(parts["resultat"]), hors, alertes)):
        contenu["resultats"] = r
    hors["LE DÉROULÉ"] = [parts["deroule"]]
    if "cta" in parts:
        hors["CTA"] = [parts["cta"]]
    else:
        alertes.append("CTA absent")

    for t in textes(contenu):
        for _, href in LIEN.findall(t):
            if href not in urls_connues:
                alertes.append(f"lien vers « {href} » : chemin absent de urls-site-actuel.json")
        for m in INTERDITS.finditer(t):
            alertes.append(f"formulation interdite « {m.group(0)} » à relire")
    # Ces deux tableaux se rendent en texte brut : un marqueur Markdown s'y
    # afficherait tel quel au visiteur.
    for cle in ("fiche", "resultats"):
        for e in contenu.get(cle, []):
            for v in e.values():
                if "**" in v or LIEN.search(v):
                    alertes.append(f"{cle} : marqueur Markdown dans un champ rendu brut « {v[:40]} »")

    return {**resultat, "contenu": contenu, "hors_gabarit": hors, "alertes": alertes}


def sql(url: str, contenu: dict) -> list[str]:
    """Les instructions d'une page, dans l'ordre d'exécution. Modèle : decoupe_sql.py."""
    def dumps(o) -> str:
        return json.dumps(o, ensure_ascii=False, separators=(",", ":"))

    ou = " where path = " + q(url) + ";"
    base = {k: ([] if isinstance(v, list) else v) for k, v in contenu.items()}
    out = ["update pages set contenu = " + q(dumps(base)) + "::jsonb" + ou]
    for cle, elements in contenu.items():
        if not isinstance(elements, list):
            continue
        tete = "update pages set contenu = jsonb_set(contenu, '{" + cle + "}', (contenu->'" + cle + "') || "

        def ligne(m: list) -> str:
            return tete + q(dumps(m)) + "::jsonb)" + ou

        morceau: list = []
        for e in elements:
            # On mesure l'instruction entière, pas une estimation : le plafond
            # porte sur ce qui part réellement.
            if morceau and len(ligne(morceau + [e]).encode()) > PLAFOND:
                out.append(ligne(morceau))
                morceau = []
            morceau.append(e)
        if morceau:
            out.append(ligne(morceau))
    return out


def ecris(pages: list[dict]) -> tuple[int, int, list[str]]:
    """Un .sql par page. Ne touche qu'à ses propres fichiers : le dossier est partagé."""
    GABARITS.mkdir(parents=True, exist_ok=True)
    for ancien in GABARITS.glob("preuves-*.sql"):
        ancien.unlink()
    refus: list[str] = []
    nb, plus_longue = 0, 0
    for r in pages:
        nom = re.sub(r"[^a-z0-9]+", "-", r["url"].strip("/").lower()).strip("-")
        lignes = sql(r["url"], r["contenu"])
        tailles = [len(l.encode()) for l in lignes]
        if max(tailles) > PLAFOND:
            refus.append(f"{r['url']} : une instruction de {max(tailles)} o dépasse le plafond, fichier non écrit")
            continue
        (GABARITS / f"{nom}.sql").write_text("\n".join(lignes) + "\n")
        nb += len(lignes)
        plus_longue = max(plus_longue, *tailles)
    return nb, plus_longue, refus


def main(argv: list[str]) -> int:
    urls_connues = {p["url"] for p in json.loads(URLS.read_text())}
    fichiers = sorted(CORPUS.glob("*.md"))
    if argv:
        fichiers = [f for f in fichiers if any(a in f.name for a in argv)]
    resultats_ = [analyse(f, urls_connues) for f in fichiers]
    fiches = [r for r in resultats_ if r["contenu"]]
    ecartes = [r for r in resultats_ if not r["contenu"]]

    champs = Counter(k for r in fiches for k in r["contenu"] if k != "gabarit")
    hors = Counter(k for r in fiches for k in r["hors_gabarit"])
    print(f"{len(resultats_)} fichiers lus, {len(fiches)} fiches, {len(ecartes)} écarté(s)")
    print("  champs du gabarit remplis :")
    for k in ("chapeau", "fiche", "contexte", "intervention", "resultats", "surtitre", "images"):
        print(f"    {k:<13} {champs.get(k, 0):>3} / {len(fiches)}")
    print(f"    lignes de fiche : {sum(len(r['contenu'].get('fiche', [])) for r in fiches)}, "
          f"résultats : {sum(len(r['contenu'].get('resultats', [])) for r in fiches)}")
    print("  sans place dans le gabarit (conservé sous hors_gabarit) :")
    for k, n in hors.most_common():
        print(f"    {k:<30} {n:>3} fichier(s)")

    alertes = [(r["url"] or r["fichier"], a) for r in resultats_ for a in r["alertes"]]
    if alertes:
        print(f"\n{len(alertes)} alerte(s) :")
        for u, a in alertes:
            print(f"   {u} : {a}")

    SORTIE.mkdir(parents=True, exist_ok=True)
    (SORTIE / "fiches-analyse.json").write_text(json.dumps(fiches, ensure_ascii=False, indent=1))
    nb, plus_longue, refus = ecris(fiches)
    print(f"\n-> {SORTIE / 'fiches-analyse.json'}")
    print(f"-> {GABARITS}/preuves-*.sql : {len(fiches) - len(refus)} fichiers, {nb} instructions, "
          f"la plus longue {plus_longue} o (plafond {PLAFOND})")
    for r in refus:
        print(f"   REFUS {r}")

    # Auto-contrôle : ce qui est écrit sur le disque tient le contrat annoncé.
    ecrits = sorted(GABARITS.glob("preuves-*.sql"))
    assert len(ecrits) == len(fiches) - len(refus), "un fichier par fiche écrite"
    for f in ecrits:
        lignes = [l for l in f.read_text().split("\n") if l.strip()]
        assert all(len(l.encode()) <= PLAFOND for l in lignes), f"{f.name} : instruction au-dessus du plafond"
        assert lignes[0].startswith("update pages set contenu = '{\"gabarit\":\"fiche\""), f"{f.name} : la première instruction pose la base"
        assert all(l.endswith(";") for l in lignes), f"{f.name} : une instruction par ligne"
    return 1 if refus else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
