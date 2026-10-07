# Usage : python3 components/site/preuve/extrait-depuis-captures.py
#
# Régénère les 41 fichiers supabase/import/gabarits-maquette/preuves-*.json
# depuis les captures maquette/rendu/preuves--*.html, à relancer quand la
# maquette est ré-exportée et re-capturée. La copie est BYTE-EXACTE depuis le
# rendu ; les phrases qui portent un interdit du contrat sont retirées et
# déclarées sur la sortie ; une page au H1 interdit est exclue et déclarée
# (voir EXCLUES dans verification-preuve.tsx). Après exécution :
#   bun components/site/preuve/verification-preuve.tsx
import json, pathlib, re
from html.parser import HTMLParser

class N:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children = []
    def brut(self):
        out = []
        for c in self.children:
            out.append(c if isinstance(c, str) else c.brut())
        return "".join(out)
    def text(self):
        # Les espaces ENTRE éléments en ligne comptent : « Le <strong>04…</strong> est »
        # perdait ses espaces quand chaque fragment était décapé un à un.
        return re.sub(r"\s+", " ", self.brut()).strip()
    def find_all(self, pred, acc=None):
        if acc is None: acc = []
        for c in self.children:
            if isinstance(c, N):
                if pred(c): acc.append(c)
                c.find_all(pred, acc)
        return acc

VOID = {"img","input","br","hr","meta","link","source"}

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = N("root", [], None); self.cur = self.root
    def handle_starttag(self, tag, attrs):
        n = N(tag, attrs, self.cur); self.cur.children.append(n)
        if tag not in VOID: self.cur = n
    def handle_endtag(self, tag):
        c = self.cur
        while c is not self.root and c.tag != tag: c = c.parent
        if c is not self.root: self.cur = c.parent
    def handle_data(self, data):
        if data.strip(): self.cur.children.append(data)

def style_has(n, frag): return frag in n.attrs.get("style", "")

INTERDITS = ["—", "régie", "intérim", "mise à disposition", "sans engagement",
             "clé en main", "sur mesure", "levier", "concrètement", "notamment",
             "incontournable", "découvrez", "+200", "cinq agences"]

def interdit_dans(texte):
    bas = texte.lower()
    for mot in INTERDITS:
        if mot in bas:
            return mot
    return None

def extrait(chemin):
    h = open(chemin, encoding="utf8").read()
    t = Tree(); t.feed(h[:h.find("<footer")])
    S = {s.attrs.get("data-screen-label"): s for s in t.root.find_all(lambda n: n.tag == "section")}
    c = {"gabarit": "etude-de-cas"}

    hero = S["Étude de cas · héros"]
    c["client"] = [n for n in hero.find_all(lambda n: n.tag == "span" and style_has(n, "font: 700 13px"))][0].text()
    c["chapeau"] = [p.text() for p in hero.find_all(lambda n: n.tag == "p")]
    c["bouton"] = [a for a in hero.find_all(lambda n: n.tag == "a" and n.attrs.get("href") == "#cas-form")][0].text()
    fiche = [n for n in hero.find_all(lambda n: n.tag == "div" and style_has(n, "position: absolute") and style_has(n, "max-width: 330px"))]
    if fiche:
        rows = fiche[0].find_all(lambda n: n.tag == "div" and style_has(n, "grid-template-columns: 104px"))
        c["heroFiche"] = [{"libelle": r.children[0].text(), "valeur": r.children[1].text()} for r in rows]

    cartes = S["Chiffres du dispositif"].find_all(lambda n: n.tag == "div" and style_has(n, "padding: 22px 24px 24px"))
    c["chiffres"] = [{"libelle": k.children[0].text(), "valeur": k.children[1].text()} for k in cartes]

    sit = S["La situation"]
    c["situationTitre"] = sit.find_all(lambda n: n.tag == "h2")[0].text()
    c["situationProse"] = [p.text() for p in sit.find_all(lambda n: n.tag == "p")]
    objs = sit.find_all(lambda n: n.tag == "div" and style_has(n, "grid-template-columns: 40px"))
    out = []
    for o in objs:
        corps = o.children[1]
        d = {"titre": corps.children[0].text()}
        if len(corps.children) > 1:
            d["texte"] = corps.children[1].text()
        out.append(d)
    if out: c["objectifs"] = out

    rep = S["Ce que nous avons mis en place"]
    out = []
    for k in rep.find_all(lambda n: n.tag == "div" and "grid-column: span" in n.attrs.get("style","")):
        inner = k.find_all(lambda n: n.tag == "div" and "flex-direction: column" in n.attrs.get("style",""))[0]
        divs = [x for x in inner.children if isinstance(x, N) and x.tag == "div"]
        out.append({"titre": divs[0].text(), "texte": divs[1].text()})
    c["reponseCartes"] = out

    out = []
    for p in S["Le déroulé"].find_all(lambda n: n.tag == "div" and style_has(n, "padding-right: 8px")):
        divs = [x for x in p.children if isinstance(x, N) and x.tag == "div"]
        out.append({"titre": divs[0].text(), "texte": divs[1].text()})
    c["etapes"] = out

    rows = S["Le dispositif"].find_all(lambda n: n.tag == "div" and style_has(n, "grid-template-columns: minmax(120px, 0.42fr)"))
    c["dispositif"] = [{"libelle": r.children[0].text(), "valeur": r.children[1].text()} for r in rows]

    if "Le résultat" in S:
        out = []
        for it in S["Le résultat"].find_all(lambda n: n.tag == "div" and style_has(n, "border-top: 2px solid var(--acc)")):
            divs = [x for x in it.children if isinstance(x, N) and x.tag == "div"]
            out.append({"titre": divs[0].text(), "texte": divs[1].text()})
        c["resultats"] = out

    if "Complément" in S:
        out = []
        for b in S["Complément"].find_all(lambda n: n.tag == "div" and style_has(n, "min-width: 0px")):
            h3 = b.find_all(lambda n: n.tag == "h3")
            p = b.find_all(lambda n: n.tag == "p")
            d = {}
            if h3: d["titre"] = h3[0].text()
            if p: d["texte"] = p[0].text()
            puces = b.find_all(lambda n: n.tag == "div" and style_has(n, "gap: 11px"))
            if puces:
                d["puces"] = []
                for row in puces:
                    corps = [x for x in row.children if isinstance(x, N) and x.tag == "span"][1]
                    accroche = corps.find_all(lambda n: n.tag == "strong")[0].text()
                    texte = [x for x in corps.children if isinstance(x, N) and x.tag == "span"][-1].text()
                    d["puces"].append({"accroche": accroche, "texte": texte})
            assert "texte" in d or "puces" in d, "bloc Complément sans prose ni coches"
            out.append(d)
        c["complement"] = out

    bes = S["Votre besoin"]
    c["besoinTitre"] = bes.find_all(lambda n: n.tag == "h2")[0].text()
    c["besoinProse"] = [p.text() for p in bes.find_all(lambda n: n.tag == "p")]
    tuiles = bes.find_all(lambda n: n.tag == "div" and style_has(n, "border-radius: 18px"))
    if tuiles:
        c["besoinTuiles"] = [
            {"titre": [x for x in t.children if isinstance(x, N)][0].text(),
             "texte": [x for x in t.children if isinstance(x, N)][1].text()}
            for t in tuiles
        ]
    panneau = bes.find_all(lambda n: n.tag == "div" and style_has(n, "font: 600 20px"))[0].text()
    bouton = bes.find_all(lambda n: n.tag == "button")[0].text()
    assert panneau == c["bouton"] == bouton, ("libellés du formulaire divergents", panneau, c["bouton"], bouton)

    out = []
    for a in S["Pour aller plus loin"].find_all(lambda n: n.tag == "a"):
        sur = a.find_all(lambda n: n.tag == "span" and style_has(n, "font: 600 10.5px"))
        tit = a.find_all(lambda n: n.tag == "span" and style_has(n, "font: 600 16.5px"))
        out.append({"surtitre": sur[0].text(), "titre": tit[0].text(), "href": a.attrs["href"]})
    if out: c["plusLoin"] = out

    return c

def purge_interdits(c, slug, trous):
    """Retire toute FEUILLE qui porte un interdit, et la déclare."""
    def purge(valeur):
        if isinstance(valeur, list):
            gardes = []
            for v in valeur:
                mot = interdit_dans(json.dumps(v, ensure_ascii=False))
                if mot:
                    trous.append({"page": slug, "phrase": json.dumps(v, ensure_ascii=False),
                                  "raison": f"interdit du contrat « {mot} » : non rendu"})
                else:
                    gardes.append(v)
            return gardes
        return valeur
    for cle in list(c.keys()):
        c[cle] = purge(c[cle])
        if isinstance(c[cle], list) and not c[cle]:
            del c[cle]
    # champs scalaires obligatoires
    for cle in ("client", "bouton", "situationTitre", "besoinTitre"):
        if cle in c:
            mot = interdit_dans(c[cle])
            if mot:
                raise AssertionError(f"champ obligatoire « {cle} » porte l'interdit « {mot} »")
    return c

R = pathlib.Path("/Users/mehdi/Landing lovable/migen-site")
SORTIE = R / "supabase/import/gabarits-maquette"
index = json.load(open(R / "maquette/contenu/site/index.json"))
pages02 = [p for p in index if (p.get("gabarit") or "").startswith("02")]

trous, exclues, ecrites = [], [], []
for p in sorted(pages02, key=lambda x: x["url"]):
    slug = p["url"].strip("/").split("/")[-1]
    cap = json.load(open(R / "maquette/rendu" / f"preuves--{slug}.json"))
    mot = interdit_dans(cap["h1Rendu"])
    if mot:
        exclues.append({"page": p["url"],
                        "raison": f"le H1 de la capture porte l'interdit « {mot} » : « {cap['h1Rendu']} ». "
                                  "Un H1 ne se retire ni ne se reformule : page NON portée, à arbitrer."})
        continue
    try:
        contenu = extrait(R / "maquette/rendu" / f"preuves--{slug}.html")
        contenu = purge_interdits(contenu, p["url"], trous)
    except Exception as e:
        exclues.append({"page": p["url"], "raison": repr(e)})
        continue
    page = {"url": p["url"], "titre_h1": cap["h1Rendu"], "contenu": contenu}
    out = SORTIE / f"preuves-{slug}.json"
    out.write_text(json.dumps(page, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    ecrites.append(p["url"])

print(f"{len(ecrites)} pages écrites, {len(exclues)} exclues, {len(trous)} phrases retirées")
for e in exclues: print("EXCLUE", e["page"], e["raison"][:160])
for t in trous: print("TROU", t["page"], t["raison"], "::", t["phrase"][:120])
