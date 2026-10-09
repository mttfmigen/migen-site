#!/usr/bin/env python3
"""Dédoublonne la banque de photos SUR L'IMAGE, pas sur le nom de fichier.

    python3 scripts/dedoublonne-photos.py              # plan, n'écrit rien
    python3 scripts/dedoublonne-photos.py --applique   # écrit registre et fiches

LE DÉFAUT QU'IL CORRIGE, mesuré et vérifié au pixel le 09/10/2026.
Les 517 fichiers de `public/assets/photos/` ne contiennent que 392 images
réellement distinctes : 125 sont des RÉ-ENCODAGES de la même prise de vue, à
une autre résolution ou sous un autre nom. Leur sha256 diffère, donc le registre
ne pouvait pas les voir, et la règle dure du répartiteur (« jamais deux fois la
même photo dans une page ») porte sur le CHEMIN. Conséquence visible par le
visiteur : 14 pages affichent deux fois la même image sous deux noms, dont
`/preuves/rector-lesage/` et `/preuves/vignal-systems/` où la photo
d'illustration et celle du dispositif sont la même, et 96 partages entre pages
sœurs échappent à tout contrôle par nom.

Exemples vérifiés au pixel, avec témoin négatif à 50,26 de MAD :
  env-technician-maintenance-8.jpg = env-technician-repairing-electrical-appliance.jpg  (MAD 0,00)
  il-meca-cle-plate-machine-verte.jpg = il-technicien-maintenance.jpg                   (MAD 0,29)
  env-industrie-au-crepuscule.jpg = il-site-cheminees-montagnes-aube.jpg                (MAD 0,11)

COMMENT IL DÉCIDE, et pourquoi c'est sûr.
Deux fichiers sont la même image quand la différence absolue moyenne de leurs
vignettes 64x64 en niveaux de gris est sous SEUIL. Le seuil est bas (3 sur 255)
et il est ÉPROUVÉ à chaque exécution : le script mesure aussi des paires
connues DIFFÉRENTES et refuse de tourner si le seuil les confondrait.

QUEL FICHIER SURVIT : la plus haute résolution d'abord, parce que c'est elle qui
sert le mieux un grand cadre. À résolution égale, le fichier le mieux étiqueté
au registre (le plus de thèmes), puis l'ordre alphabétique pour que deux
exécutions donnent le même résultat. LES THÈMES DE TOUT LE GROUPE SONT FUSIONNÉS
sur le survivant : un doublon mal étiqueté enrichit ainsi le survivant au lieu
de disparaître avec son information.

CE QU'IL NE FAIT PAS : il ne supprime aucun fichier du disque. Les doublons
deviennent simplement absents du registre et plus référencés par aucune fiche.
Leur suppression est une décision de Mehdi, et le plan en donne le poids.
"""
import json, os, re, sys
from pathlib import Path
from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
PHOTOS = RACINE / "public/assets/photos"
REGISTRE = PHOTOS / "registre.json"
FICHES = RACINE / "supabase/import/gabarits-maquette"
APPLIQUE = "--applique" in sys.argv

SEUIL = 3.0          # MAD sur vignette 64x64, en niveaux de gris
TAILLE = 64

def vignette(chemin):
    with Image.open(chemin) as im:
        return list(im.convert("L").resize((TAILLE, TAILLE), Image.LANCZOS).getdata())

def mad(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)

def dimensions(chemin):
    with Image.open(chemin) as im:
        return im.size

registre = json.loads(REGISTRE.read_text(encoding="utf-8"))
entrees = registre if isinstance(registre, list) else registre.get("photos", list(registre.values()))
par_fichier = {e["fichier"]: e for e in entrees}

fichiers = sorted(f for f in os.listdir(PHOTOS) if re.search(r"\.jpe?g$|\.png$|\.webp$", f, re.I))
print(f"{len(fichiers)} fichiers, {len(entrees)} entrées au registre")

vignettes = {f: vignette(PHOTOS / f) for f in fichiers}
tailles = {f: dimensions(PHOTOS / f) for f in fichiers}

# LE SEUIL DOIT PROUVER QU'IL SAIT DIRE NON, sinon tout ce qui suit est faux.
TEMOINS_DIFFERENTS = [
    ("env-industrie-au-crepuscule.jpg", "il-meca-cle-plate-machine-verte.jpg"),
    ("elec-salle-cellules-ht-ronde.jpg", "env-pommes-de-terre-sur-convoyeur.jpg"),
]
for a, b in TEMOINS_DIFFERENTS:
    if a in vignettes and b in vignettes:
        d = mad(vignettes[a], vignettes[b])
        if d <= SEUIL:
            sys.exit(f"le seuil {SEUIL} confond deux photos differentes ({a}, {b}, MAD {d:.2f}) : refus de tourner")
        print(f"  temoin negatif OK : {a[:34]} contre {b[:34]} = MAD {d:.1f}")

# Regroupement : une empreinte grossière d'abord, la MAD ensuite.
def empreinte(v):
    moyenne = sum(v) / len(v)
    bits = 0
    for i, p in enumerate(v):
        if p > moyenne:
            bits |= 1 << i
    return bits

seaux = {}
for f in fichiers:
    m = sum(vignettes[f]) / TAILLE ** 2
    seaux.setdefault(round(m / 4), []).append(f)

groupes, vus = [], set()
for seau in seaux.values():
    for i, a in enumerate(seau):
        if a in vus:
            continue
        groupe = [a]
        vus.add(a)
        for b in seau[i + 1:]:
            if b in vus:
                continue
            if mad(vignettes[a], vignettes[b]) < SEUIL:
                groupe.append(b)
                vus.add(b)
        if len(groupe) > 1:
            groupes.append(sorted(groupe))

def rang(f):
    larg, haut = tailles[f]
    return (-(larg * haut), -len(par_fichier.get(f, {}).get("themes", [])), f)

remplace, survivants = {}, {}
for groupe in groupes:
    garde = sorted(groupe, key=rang)[0]
    # LES THEMES RELUS NE SE FONT PAS REPOLLUER. Les 149 photos du lot Envato
    # ont ete reetiquetees le 09/10 EN REGARDANT chaque image : 3,17 themes
    # justes contre 1,38 devines. Fusionner les themes de leurs doublons
    # Industrie Libre, qui sont justement ceux qu'on repare, remettrait le
    # defaut dans le survivant. Quand le survivant est l'un d'eux, ses themes
    # sont donc gardes tels quels.
    relu = "Envato Elements" in par_fichier.get(garde, {}).get("licence", "")
    if relu:
        survivants[garde] = list(par_fichier[garde].get("themes", []))
    else:
        themes = []
        for f in groupe:
            for t in par_fichier.get(f, {}).get("themes", []):
                if t not in themes:
                    themes.append(t)
        survivants[garde] = sorted(themes)
    for f in groupe:
        if f != garde:
            remplace[f] = garde

poids = sum((PHOTOS / f).stat().st_size for f in remplace) / 1e6
print(f"\n{len(groupes)} groupes de doublons, {len(remplace)} fichiers remplacés, "
      f"{len(fichiers) - len(remplace)} images distinctes, {poids:.1f} Mo de doublons sur le disque")
print("les 8 plus gros groupes :")
for groupe in sorted(groupes, key=len, reverse=True)[:8]:
    garde = sorted(groupe, key=rang)[0]
    print(f"  {len(groupe)} fichiers -> {garde}  ({'x'.join(map(str, tailles[garde]))})")
    for f in groupe:
        if f != garde:
            print(f"        remplace {f}")

# Les fiches : on remplace les chemins des doublons par celui du survivant.
touchees, remplacements = 0, 0
for chemin in sorted(FICHES.glob("*.json")):
    brut = chemin.read_text(encoding="utf-8")
    neuf = brut
    for mort, vivant in remplace.items():
        if f"/assets/photos/{mort}" in neuf:
            neuf = neuf.replace(f"/assets/photos/{mort}", f"/assets/photos/{vivant}")
    if neuf != brut:
        touchees += 1
        remplacements += sum(brut.count(f"/assets/photos/{m}") for m in remplace)
        if APPLIQUE:
            chemin.write_text(neuf, encoding="utf-8")
print(f"\nfiches concernées : {touchees}, références réécrites : {remplacements}")

if APPLIQUE:
    neuf = []
    for e in entrees:
        if e["fichier"] in remplace:
            continue
        if e["fichier"] in survivants:
            e = {**e, "themes": survivants[e["fichier"]]}
        neuf.append(e)
    REGISTRE.write_text(json.dumps(neuf, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"registre réécrit : {len(neuf)} entrées, thèmes fusionnés sur {len(survivants)} survivants")
else:
    print("\nplan seulement : relancer avec --applique pour écrire le registre et les fiches.")
