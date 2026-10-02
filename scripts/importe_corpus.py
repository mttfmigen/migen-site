#!/usr/bin/env python3
"""
Transforme le corpus de pages de vente en contenu `pages.contenu` (jsonb).

POURQUOI UN PARSEUR ET PAS UN MODÈLE : un parseur ne peut pas inventer. Le
corpus porte 116 pages de vente, chacune en dix sections nommées, écrites et
relues. Toute reformulation serait une perte. Ici, ce qui n'est pas reconnu est
SIGNALÉ, jamais comblé.

La forme produite est celle de `types/contenu.ts`, qui fait foi.

Les liens Markdown « [texte](/chemin/) » et le gras « **mot** » sont CONSERVÉS
dans les chaînes : le maillage interne du cocon vit dedans. Un rendu riche les
interprète côté composant.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import unicodedata

CORPUS = pathlib.Path("../migen-refonte/seo/CONVERSION")
SORTIE = pathlib.Path("supabase/import")

# Le numéro de section fait foi, pas son libellé : le corpus écrit tantôt
# « SECTION 2 . CHIFFRES CLES », tantôt « SECTION 2 . LA REPONSE DIRECTE ET LES
# CHIFFRES », tantôt « SECTION 10 . LOGOS CLIENTS ET CTA FINAL ».
TYPE_PAR_NUMERO = {
    1: "heros", 2: "chiffres", 3: "probleme", 4: "offre", 5: "deroule",
    6: "garanties", 7: "cta", 8: "preuves", 9: "objections", 10: "ctaFinal",
}

ENTETE_SECTION = re.compile(r"^##\s+SECTION\s+(\d+)\s*[.·]\s*(.*)$", re.M)


def sans_accent(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


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


def decoupe_sections(corps: str) -> dict[int, str]:
    """Numéro de section -> son texte brut. La dernière va jusqu'au prochain ## quelconque."""
    bornes = [(int(m.group(1)), m.start(), m.end()) for m in ENTETE_SECTION.finditer(corps)]
    out: dict[int, str] = {}
    for i, (numero, debut, fin_entete) in enumerate(bornes):
        fin = bornes[i + 1][1] if i + 1 < len(bornes) else len(corps)
        out[numero] = corps[fin_entete:fin].strip()
    return out


def champ_gras(bloc: str, *noms: str) -> str | None:
    """
    « **Nom** : valeur » en début de ligne, ou « **Nom.** valeur ».

    Le corpus porte deux dialectes de rédaction, l'un avec deux-points et
    l'étiquette hors du gras, l'autre avec le point dans le gras. La
    comparaison ignore donc la ponctuation de fin, les accents et la casse.
    """
    cherches = {sans_accent(n).lower().rstrip(" .:") for n in noms}
    for ligne in bloc.splitlines():
        m = re.match(r"^\*\*(.+?)\*\*\s*:?\s*(.*)$", ligne.strip())
        if not m:
            continue
        etiquette = sans_accent(m.group(1)).lower().strip().rstrip(" .:")
        if etiquette in cherches:
            return m.group(2).strip() or None
    return None


# « > [Faire chiffrer mon étude](/contact/) · 04 78 33 72 05, rappel dans l'heure »
# Le chevron de citation et le champ « **Action** : » sont tous deux optionnels :
# le corpus porte trois dialectes, et seule la forme du lien est constante.
CITATION_ACTION = re.compile(
    r"^(?:>\s*)?(?:\*\*[^*]+\*\*\s*:?\s*)?\[([^\]]+)\]\((/[^)]*)\)\s*(?:[·|•]\s*(.*))?$",
    re.M,
)

# La seule promesse de délai autorisée sur le site : le rappel dans l'heure.
# Aucun délai d'intervention chiffré, nulle part. Le parseur ne retient donc
# qu'une phrase qui parle de rappel.
PHRASE_RAPPEL = re.compile(r"rappel\w*\s+dans\s+l[\u2019']heure", re.I)


def action_citee(bloc: str) -> dict | None:
    """L'appel à l'action du second dialecte : un lien en citation, puis le téléphone."""
    m = CITATION_ACTION.search(bloc)
    if not m:
        return None
    out = {"bouton": m.group(1).strip(), "href": m.group(2).strip()}
    if m.group(3) and m.group(3).strip():
        out["rappel"] = m.group(3).strip()
    return out


def premier_titre(bloc: str, niveaux: str) -> str | None:
    """Le premier titre Markdown du bloc, pour les niveaux demandés (« # », « ### »)."""
    for ligne in bloc.splitlines():
        l = ligne.strip()
        for n in niveaux.split():
            if l.startswith(n + " "):
                return l[len(n) + 1:].strip()
    return None


def puces(bloc: str) -> list[dict]:
    """« - **accroche** : texte » ou « - texte ». L'accroche est le gras d'attaque."""
    out = []
    for ligne in bloc.splitlines():
        m = re.match(r"^[-*]\s+(.*)$", ligne.strip())
        if not m:
            continue
        contenu = m.group(1).strip()
        g = re.match(r"^\*\*(.+?)\*\*\s*:?\s*(.*)$", contenu)
        if g and g.group(2).strip():
            out.append({"accroche": g.group(1).strip(), "texte": g.group(2).strip()})
        else:
            out.append({"texte": contenu})
    return out


def paragraphes_prose(bloc: str) -> list[dict]:
    """Paragraphes hors liste, hors tableau, hors champ « **Nom** : ». Gras d'attaque extrait."""
    out = []
    for para in re.split(r"\n\s*\n", bloc):
        p = para.strip()
        if not p or p.startswith(("-", "*", "|", "#")) or re.match(r"^\d+\.", p):
            continue
        if re.match(r"^\*\*[^*]{1,40}\*\*\s*:", p):   # un champ, pas de la prose
            continue
        g = re.match(r"^\*\*(.+?)\*\*\s*(.*)$", p, re.S)
        if g and g.group(2).strip():
            out.append({"accroche": g.group(1).strip(), "texte": g.group(2).strip()})
        else:
            out.append({"texte": p})
    return out


def en_paragraphe(texte: str) -> dict:
    """
    « **Gras d'attaque** : la suite » devient {accroche, texte}.

    Le corpus écrit toutes ses prestations ainsi : un bénéfice en gras, puis la
    méthode. Les blocs rendent les deux séparément, le gras appuyé. Rendre la
    chaîne entière perdrait cette distinction, et la laisser en chaîne brute
    casse le contrat de `types/contenu.ts`.
    """
    s = texte.strip()
    m = re.match(r"^\*\*(.+?)\*\*\s*:?\s*(.*)$", s, re.S)
    if m and m.group(2).strip():
        return {"accroche": m.group(1).strip(), "texte": m.group(2).strip()}
    return {"texte": s}


def tableau(bloc: str) -> dict | None:
    lignes = [l.strip() for l in bloc.splitlines() if l.strip().startswith("|")]
    if len(lignes) < 2:
        return None
    def cellules(l): return [c.strip() for c in l.strip("|").split("|")]
    entetes = cellules(lignes[0])
    corps = [cellules(l) for l in lignes[2:] if set(l) - set("|-: ")]
    if not corps:
        return None
    # Un tableau sans en-tête utile (« | | A | B |ature ») garde ses colonnes vides.
    return {"entetes": entetes, "lignes": [c for c in corps if len(c) == len(entetes)]}


def numerotees(bloc: str) -> list[dict]:
    out = []
    for ligne in bloc.splitlines():
        m = re.match(r"^\d+\.\s+(.*)$", ligne.strip())
        if not m:
            continue
        contenu = m.group(1).strip()
        g = re.match(r"^\*\*(.+?)\*\*\s*:?\s*(.*)$", contenu)
        if g and g.group(2).strip():
            out.append({"titre": g.group(1).strip(), "texte": g.group(2).strip()})
        else:
            out.append({"titre": contenu})
    return out


LIEN = re.compile(r"\[([^\]]+)\]\((/[^)]*)\)")


def preuves(bloc: str) -> list[dict]:
    out = []
    for p in puces(bloc):
        texte = p.get("texte", "")
        liens = LIEN.findall(texte)
        item = {"titre": p.get("accroche") or texte}
        if p.get("accroche"):
            # Le lien d'étude de cas se détache du texte : il devient le bouton.
            sans_lien = LIEN.sub("", texte).strip(" .·")
            if sans_lien:
                item["texte"] = sans_lien
            if liens:
                item["lienLibelle"], item["lienHref"] = liens[-1][0], liens[-1][1]
        out.append(item)
    return out


def questions(bloc: str) -> list[dict]:
    """« **La question ?** La réponse. » Un paragraphe par couple."""
    out = []
    for para in re.split(r"\n\s*\n", bloc):
        p = para.strip()
        m = re.match(r"^\*\*(.+?)\*\*\s*(.*)$", p, re.S)
        if not m or not m.group(2).strip():
            continue
        q = m.group(1).strip()
        if sans_accent(q).lower().startswith(("titre", "question", "bouton")):
            continue
        out.append({"question": q, "reponse": m.group(2).strip()})
    return out


def chiffres(bloc: str) -> list[dict]:
    """« - **10 %** : des candidats retenus, entretien... » valeur puis libellé."""
    out = []
    for p in puces(bloc):
        if not p.get("accroche"):
            continue
        libelle = p.get("texte", "")
        # Un libellé long porte souvent une phrase d'appui après un point.
        tete, point, suite = libelle.partition(". ")
        item = {"valeur": p["accroche"], "libelle": (tete if point else libelle).strip()}
        if point and suite.strip():
            item["detail"] = suite.strip()
        out.append(item)
    return out


def titre_de_section(bloc: str) -> str | None:
    return champ_gras(bloc, "Titre", "Titre de section", "H2")


def cta(bloc: str) -> dict | None:
    q = champ_gras(bloc, "Question")
    b = champ_gras(bloc, "Bouton", "CTA")
    rappel = champ_gras(bloc, "Rappel telephone", "Rappel", "Telephone")
    href = None

    # Second dialecte : la question est une ligne en gras qui se termine par un
    # point d'interrogation, et le bouton est un lien en citation.
    if not q:
        q = premier_titre(bloc, "### ####")
    if not q:
        for motif in (r"^\*\*(.+\?)\*\*\s*$", r"^\*\*([^*]{12,})\*\*\s*$"):
            for ligne in bloc.splitlines():
                if (m := re.match(motif, ligne.strip())):
                    q = m.group(1).strip()
                    break
            if q:
                break
    if not b and (a := action_citee(bloc)):
        b, href, rappel = a["bouton"], a.get("href"), rappel or a.get("rappel")

    if not q or not b:
        return None
    out = {"question": q, "bouton": b}
    if href:
        out["href"] = href
    if rappel:
        out["rappel"] = rappel
    return out


def construis(numero: int, bloc: str, fm: dict, alertes: list[str]) -> dict | None:
    t = TYPE_PAR_NUMERO[numero]

    if t == "heros":
        h1 = champ_gras(bloc, "H1") or premier_titre(bloc, "#") or fm.get("h1")
        meca = champ_gras(bloc, "Mecanisme (sous-titre)", "Mecanisme", "Sous-titre", "Promesse")
        if not meca:
            # Quatrième dialecte (bloc B01) : le mécanisme est le premier
            # paragraphe de prose du héros, sans étiquette. On écarte les
            # titres, les listes, les citations, les commentaires HTML, la
            # note de visuel en italique et les lignes entièrement en gras,
            # qui sont la punchline et non le mécanisme.
            for para in re.split(r"\n\s*\n", bloc):
                pp = para.strip()
                if not pp or pp.startswith(("#", "-", "*", ">", "|", "<!--")):
                    continue
                if re.match(r"^\*\*[^*]+\*\*\s*$", pp):
                    continue
                # On écarte la LIGNE D'ACTION, pas tout paragraphe contenant un
                # lien : le mécanisme en porte souvent un vers une page sœur, et
                # c'est précisément le maillage interne qu'il faut garder.
                if PHRASE_RAPPEL.search(pp) or CITATION_ACTION.match(pp):
                    continue
                if len(pp) < 60:
                    continue
                meca = re.sub(r"^\*\*[^*]+\*\*\s*:?\s*", "", pp).strip()
                break
        c = champ_gras(bloc, "CTA", "Bouton") or fm.get("cta_principal")
        tel = champ_gras(bloc, "Telephone")
        delai = champ_gras(bloc, "Phrase de delai", "Phrase de delai reelle", "Delai")

        # Second dialecte : le bouton et le téléphone vivent dans une citation,
        # et la phrase de délai est le paragraphe « **Nous vous rappelons...** ».
        if not (tel and delai):
            if (a := action_citee(bloc)):
                c = c or a["bouton"]
                if not tel and a.get("rappel"):
                    if (m := re.search(r"0\d(?:[ .]?\d\d){4}", a["rappel"])):
                        tel = m.group(0)
            for para in re.split(r"\n\s*\n", bloc):
                pp = para.strip()
                if not delai and PHRASE_RAPPEL.search(pp):
                    # On garde le fragment qui porte la promesse, pas tout le
                    # paragraphe : « **Action** : [bouton](/contact/) · 04 ... ·
                    # Nous vous rappelons dans l'heure, du lundi au vendredi. »
                    morceaux = [
                        m.strip(" .") for m in re.split(r"\s*[·|•]\s*", pp)
                        if PHRASE_RAPPEL.search(m)
                    ]
                    brut = morceaux[0] if morceaux else pp
                    delai = re.sub(r"\*\*", "", re.sub(r"^\*\*[^*]+\*\*\s*:?\s*", "", brut)).strip()
                if not tel and (m := re.search(r"0\d(?:[ .]?\d\d){4}", pp)):
                    tel = m.group(0)
        if not (h1 and meca and c and tel and delai):
            alertes.append(f"héros incomplet (h1={bool(h1)} mecanisme={bool(meca)} cta={bool(c)} tel={bool(tel)} delai={bool(delai)})")
            return None
        return {"type": t, "h1": h1, "mecanisme": meca, "cta": c, "telephone": tel, "phraseDelai": delai}

    if t == "chiffres":
        ch = chiffres(bloc)
        if not ch:
            alertes.append("section chiffres sans aucun chiffre reconnu")
            return None
        s = {"type": t, "chiffres": ch}
        if (ti := titre_de_section(bloc)): s["titre"] = ti
        if (rep := paragraphes_prose(bloc)): s["reponse"] = rep
        return s

    if t == "probleme":
        punch = champ_gras(bloc, "Punchline", "Punch") or premier_titre(bloc, "### ##")
        if not punch:
            for ligne in bloc.splitlines():
                if (m := re.match(r"^\*\*([^*]{12,})\*\*\s*$", ligne.strip())):
                    punch = m.group(1).strip()
                    break
        pu = puces(bloc) or paragraphes_prose(bloc)
        if not punch:
            alertes.append("problème sans punchline")
            return None
        return {"type": t, "punchline": punch, "puces": pu}

    if t == "offre":
        tab = tableau(bloc)
        lignes = []
        if tab and len(tab["entetes"]) >= 2:
            lignes = [
                {"prestation": en_paragraphe(l[0]), "benefice": l[1]}
                for l in tab["lignes"] if len(l) >= 2 and l[0].strip()
            ]
        s = {"type": t, "lignes": lignes}
        if (ti := titre_de_section(bloc)): s["titre"] = ti
        if (pr := paragraphes_prose(bloc)): s["prose"] = pr
        if not lignes:
            # Le gabarit admet une offre en puces quand il n'y a pas de duo.
            pu = puces(bloc)
            if pu:
                s["prose"] = pu + s.get("prose", [])
            else:
                alertes.append("offre sans tableau ni puces")
        return s

    if t == "deroule":
        et = numerotees(bloc) or [{"titre": p.get("accroche") or p["texte"], **({"texte": p["texte"]} if p.get("accroche") else {})} for p in puces(bloc)]
        if not et:
            alertes.append("déroulé sans étape")
            return None
        s = {"type": t, "etapes": et}
        if (ti := titre_de_section(bloc)): s["titre"] = ti
        return s

    if t == "garanties":
        pu = puces(bloc)
        if not pu:
            alertes.append("garanties sans puce")
            return None
        s = {"type": t, "puces": pu}
        if (ti := titre_de_section(bloc)): s["titre"] = ti
        return s

    if t in ("cta", "ctaFinal"):
        c = cta(bloc)
        if not c:
            alertes.append(f"{t} sans question ou sans bouton")
            return None
        return {"type": t, **c}

    if t == "preuves":
        pr = preuves(bloc)
        if not pr:
            alertes.append("preuves sans réalisation")
            return None
        s = {"type": t, "preuves": pr}
        if (ti := titre_de_section(bloc)): s["titre"] = ti
        return s

    if t == "objections":
        qs = questions(bloc)
        if not qs:
            alertes.append("objections sans question")
            return None
        s = {"type": t, "questions": qs}
        if (ti := titre_de_section(bloc)): s["titre"] = ti
        return s

    return None


def analyse(chemin: pathlib.Path) -> dict:
    fm, corps = frontmatter(chemin.read_text(errors="replace"))
    sections_brutes = decoupe_sections(corps)
    alertes: list[str] = []
    sections = []
    for numero in sorted(sections_brutes):
        if numero not in TYPE_PAR_NUMERO:
            alertes.append(f"section {numero} inconnue du gabarit, ignorée")
            continue
        s = construis(numero, sections_brutes[numero], fm, alertes)
        if s:
            sections.append(s)
    manquantes = [n for n in TYPE_PAR_NUMERO if n not in sections_brutes]
    return {
        "fichier": str(chemin),
        "url": fm.get("url", ""),
        "h1": fm.get("h1", ""),
        "mot_cle": fm.get("mot_cle", ""),
        "cta_principal": fm.get("cta_principal", ""),
        "contenu": {"sections": sections},
        "alertes": alertes,
        "sections_absentes": manquantes,
    }


def main(argv: list[str]) -> int:
    fichiers = sorted(CORPUS.rglob("*.md"))
    fichiers = [f for f in fichiers if "GABARIT" not in f.name.upper()]
    if argv:
        fichiers = [f for f in fichiers if any(a in str(f) for a in argv)]

    SORTIE.mkdir(parents=True, exist_ok=True)
    resultats = [analyse(f) for f in fichiers]

    sans_url = [r for r in resultats if not r["url"]]
    avec_alerte = [r for r in resultats if r["alertes"]]

    print(f"{len(resultats)} fichiers analysés")
    print(f"  sans url en frontmatter : {len(sans_url)}")
    print(f"  avec au moins une alerte : {len(avec_alerte)}")
    print(f"  sections extraites, total : {sum(len(r['contenu']['sections']) for r in resultats)}")
    from collections import Counter
    c = Counter(s["type"] for r in resultats for s in r["contenu"]["sections"])
    for t in TYPE_PAR_NUMERO.values():
        print(f"    {t:<12} {c.get(t, 0):>4}")
    if avec_alerte:
        print("\nALERTES :")
        for r in avec_alerte[:25]:
            print(f"  {r['url'] or r['fichier']}")
            for a in r["alertes"]:
                print(f"      {a}")

    (SORTIE / "corpus-analyse.json").write_text(json.dumps(resultats, ensure_ascii=False, indent=1))
    print(f"\n-> {SORTIE / 'corpus-analyse.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
