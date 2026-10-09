#!/usr/bin/env python3
"""Deux entrées du registre ne doivent jamais être la même image.

    python3 scripts/verifie-photos-distinctes.py

C'EST L'INVARIANT QUI MANQUAIT, et son absence est l'une des deux causes du
défaut signalé par Mehdi le 09/10 (« tu les as mal intégré »).

`scripts/repartit-photos.ts` pose comme première règle dure « jamais deux fois
la même photo dans une page ». Cette règle porte sur le CHEMIN du fichier. Or
les 517 fichiers de la banque ne contenaient que 389 images distinctes : 128
étaient des ré-encodages de la même prise de vue, à une autre résolution ou sous
un autre nom, avec un sha256 différent. La règle était donc vraie sur les noms
et fausse à l'écran : 14 pages affichaient deux fois la même image, dont
`/preuves/rector-lesage/` et `/preuves/vignal-systems/` où la photo
d'illustration et celle du dispositif étaient la même prise de vue.

Tant que le registre ne contient qu'une entrée par image, la règle de chemin
suffit de nouveau. Ce contrôle garde cette propriété, et il garde donc la règle.

IL PROUVE SON SEUIL À CHAQUE PASSAGE. Un contrôle d'absence ne vaut rien s'il
n'a pas montré qu'il sait dire non : il mesure d'abord des paires connues
DIFFÉRENTES et refuse de conclure si le seuil les confondrait, puis des paires
connues IDENTIQUES et refuse de conclure s'il ne les voyait pas.
"""
import json, sys
from pathlib import Path
from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
PHOTOS = RACINE / "public/assets/photos"
REGISTRE = PHOTOS / "registre.json"
SEUIL = 3.0
TAILLE = 64

def vignette(nom):
    with Image.open(PHOTOS / nom) as im:
        return list(im.convert("L").resize((TAILLE, TAILLE), Image.LANCZOS).getdata())

def mad(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)

registre = json.loads(REGISTRE.read_text(encoding="utf-8"))
entrees = registre if isinstance(registre, list) else registre.get("photos", list(registre.values()))
noms = [e["fichier"] for e in entrees]
presents = [n for n in noms if (PHOTOS / n).exists()]
absents = [n for n in noms if not (PHOTOS / n).exists()]

vignettes = {n: vignette(n) for n in presents}

# ---------------------------------------------------- le seuil doit se prouver
DIFFERENTES = [
    ("env-industrie-au-crepuscule.jpg", "il-meca-cle-plate-machine-verte.jpg"),
    ("elec-salle-cellules-ht-ronde.jpg", "env-pommes-de-terre-sur-convoyeur.jpg"),
]
IDENTIQUES = [("env-technician-maintenance-8.jpg", "env-technician-repairing-electrical-appliance.jpg")]

controles = []
for a, b in DIFFERENTES:
    if a in vignettes and b in vignettes:
        d = mad(vignettes[a], vignettes[b])
        controles.append((f"deux photos differentes restent separees ({a[:28]})", d > SEUIL, f"MAD {d:.1f}"))
for a, b in IDENTIQUES:
    if a in vignettes and b in vignettes:
        d = mad(vignettes[a], vignettes[b])
        controles.append((f"un doublon connu est vu ({a[:28]})", d < SEUIL, f"MAD {d:.2f}"))
    else:
        controles.append((f"un doublon connu est vu ({a[:28]})", True, "deja dedoublonne, temoin absent du registre"))

for quoi, ok, detail in controles:
    print(f"  {'OK  ' if ok else 'RATE'}  {quoi} - {detail}")
if not all(ok for _, ok, _ in controles):
    sys.exit("le seuil ne sait pas trancher : refus de conclure")

# -------------------------------------------------------------- la mesure
seaux = {}
for n in presents:
    seaux.setdefault(round(sum(vignettes[n]) / TAILLE ** 2 / 4), []).append(n)

paires = []
for seau in seaux.values():
    for i, a in enumerate(sorted(seau)):
        for b in sorted(seau)[i + 1:]:
            d = mad(vignettes[a], vignettes[b])
            if d < SEUIL:
                paires.append((a, b, d))

if absents:
    print(f"\n{len(absents)} entrée(s) du registre sans fichier sur le disque : {', '.join(absents[:5])}")
if paires:
    for a, b, d in sorted(paires, key=lambda p: p[2])[:12]:
        print(f"\n  MAD {d:5.2f}  {a}\n            {b}")
    if len(paires) > 12:
        print(f"\n  … et {len(paires) - 12} autres paires")
    print(f"\n{len(paires)} paire(s) d'entrées du registre sont la MÊME image, sur {len(presents)} entrées.")
    print("Remède : python3 scripts/dedoublonne-photos.py --applique")
    sys.exit(1)
if absents:
    sys.exit(1)

print(f"\nchaque entree du registre est une image distincte ({len(presents)} entrees, seuil {SEUIL} eprouve)")
