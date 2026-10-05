# La maquette, en local

`accueil-rendu.html` est la maquette Claude Design validée par le client, rendue :
10 194 lignes, 8 063 attributs `style` en ligne, 209 sections (tout le site tient
dans un seul document, les pages étant commutées par des conditions `sc-if`).

Mehdi l'a fournie le 02/10 sous forme de page autonome de 24 Mo
(`Migen Site Final Autonome (1).html`), où ce HTML vit dans une chaîne JSON à
côté de 22,5 Mo d'images en base64. Extraction :

```bash
python3 - <<'PY'
import json, pathlib
t = pathlib.Path("Migen Site Final Autonome (1).html").read_text(errors="replace")
brut = t.split("\n")[381].strip()
pathlib.Path("accueil-rendu.html").write_text(json.loads(brut[:brut.rfind('"') + 1]))
PY
```

## Pourquoi ce fichier est versionné

C'est la source de vérité du portage, et les contrôles la lisent. Avant, chaque
valeur attendue était une note de lecture prise à travers le MCP, 50 lignes à la
fois : une note peut se tromper, et personne ne pouvait la rejouer.
`scripts/verifie-formulaire.tsx` compare maintenant le rendu du composant à CE
fichier, champ par champ. 1,5 Mo versionné pour un contrôle rejouable.

La page autonome de 24 Mo, elle, n'est pas versionnée : elle ne sert qu'à ouvrir
la maquette dans un navigateur, images comprises, pour mesurer des valeurs
calculées.

```bash
cd ~/Landing\ lovable/maquette && python3 -m http.server 4350 --bind 127.0.0.1
# puis http://127.0.0.1:4350/accueil-autonome.html
```

## Le dialecte

`style-hover` (588), `sc-if value="{{ x }}"` (1 760), `sc-camel-on-click`,
`sc-raw-select`, `data-reveal` (159), `data-bar` (23), `{{ }}`.
La traduction retenue est consignée dans `docs/CONTRAT-PORTAGE-MAQUETTE.md`.


## Les onze fichiers de gabarit, et pourquoi ils font foi (03/10)

**Erreur de méthode à ne pas refaire.** Le portage s'est fait pendant des
semaines depuis les deux seuls fichiers que Mehdi avait collés dans son premier
message, `Site final` et `Mobile`. **Personne n'avait listé les fichiers du
projet Claude Design.** Il en contient trente et un, dont **onze gabarits de
page dédiés**, bien plus riches que ce que `Site final` en montre.

Le client l'a vu avant nous : « les pages offres ne ressemblent toujours pas ».
Il avait raison depuis le début.

Les fichiers rapatriés ici, qui FONT FOI contre `accueil-rendu.html` :

| Fichier local | Fichier du projet | Famille d'URL |
|---|---|---|
| `gabarit-01-article.html` | Migen - Gabarit 01 Article | les articles |
| `gabarit-02-etude-de-cas.html` | Migen - Gabarit 02 Etude de cas | `/preuves/<client>/` |
| `gabarit-03-offre.html` | Migen - Gabarit 03 Offre | `/offres/<offre>/` |
| `gabarit-04-ville.html` | Migen - Gabarit 04 Ville | `/implantations/<ville>/` |
| `gabarit-05-specialite.html` | Migen - Gabarit 05 Specialite | spécialités constructeur |
| `gabarit-07-metier.html` | Migen - Gabarit 07 Metier | `/carriere/<metier>/` |
| `gabarit-08-secteur.html` | Migen - Gabarit 08 Secteur | `/secteurs/<secteur>/` |
| `gabarit-09-domaine.html` | Migen - Gabarit 09 Domaine | `/expertises/<domaine>/` |
| `gabarit-10-hub-de-rubrique.html` | Migen - Gabarit 10 Hub de rubrique | les rubriques |
| `gabarit-11-sous-rubrique.html` | Migen - Gabarit 11 Sous-rubrique | les sous-rubriques |
| `gabarit-prestation-releve.json` | Migen - Gabarit Prestation | relevé seulement |

**Encore à rapatrier** : `Migen - Gabarit 06 Departement`, `Migen - Blocs`
(la bibliothèque de blocs du client) et `Migen - Regles de mise en page`
(ses règles, qui priment sur `docs/CONTRAT-PORTAGE-MAQUETTE.md`).

**La consigne du client, le 03/10** : « Je veux que tu respectes strictement la
maquette ». Ces fichiers sont donc la seule référence, et `accueil-rendu.html`
ne vaut plus que pour l'accueil.
