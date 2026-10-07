# `MigenAgences.jsx` : ce qu'il contient, et pourquoi il n'apporte rien

Importé le 07/10 depuis la racine du projet Claude Design, à la demande de
Mehdi. Écrit tel quel dans `maquette/MigenAgences.jsx` (3 393 octets, taille
identique à la source, aucune retouche).

## Réponse en une ligne

**Non, il n'apporte rien que le site n'ait déjà**, et il contredit deux règles du
contrat. La seule donnée qu'il porte en exclusivité est cinq couples de
coordonnées géographiques, qui servent à dessiner une carte que **le rendu de
référence ne dessine pas**. Rien à porter. Trois constats à remonter.

## 1. Ce qu'il contient

Un composant React de 78 lignes qui dessine une carte de France en SVG
(420 × 460) et y pose cinq pastilles survolables.

Sa table `AGENCES`, recopiée littéralement :

| `n` (seul champ affiché) | `a` (jamais lu) | `lon` | `lat` | `big` |
|---|---|---|---|---|
| `Lyon — Écully` | `129 ch. du Moulin Carron, 69130` | 4.78 | 45.76 | oui |
| `Paris` | `Essonne · Île-de-France` | 2.35 | 48.85 | |
| `Strasbourg` | `Bas-Rhin · Grand Est` | 7.75 | 48.58 | |
| `Nantes` | `Loire-Atlantique` | -1.55 | 47.22 | |
| `Toulouse` | `Haute-Garonne` | 1.44 | 43.6 | |

Deux remarques de mesure :

- le champ `a` n'est **lu nulle part** dans le composant. Les cinq adresses et
  zones sont de la donnée morte : seuls `n`, `lon`, `lat` et `big` sont rendus ;
- le nom affiché passe par `.replace(" — Écully", "")`, donc l'étiquette lue à
  l'écran serait « Lyon ». L'adresse d'Écully n'est jamais affichée non plus.

Ses dépendances : `d3` (`geoMercator`, `geoPath`, `json`, `select`) et
`topojson` (`feature`), plus un **appel réseau à l'exécution** vers
`cdn.jsdelivr.net` pour `world-atlas@2.0.2/countries-110m.json`, sauf si
`window.__resources.worldAtlas` est renseigné.

Aucun délai chiffré. Sur ce point précis, l'interdit n'est pas enfreint.

## 2. Ce que le rendu de référence fait de ce composant : rien

L'application autonome l'appelle trois fois
(`<x-import component="MigenAgences">`, une fois en `hint-size="100%,440px"`,
deux fois en `100%,460px`). Mais elle **ne peut pas l'exécuter** :

| Cherché dans `maquette/site-final-autonome.html` | Occurrences |
|---|---|
| `d3js.org`, `d3@7`, `d3.min.js`, `d3-geo`, `window.d3` | 0 |
| `geoPath`, `d3.select`, `topojson`, `worldAtlas`, `countries-110m` | 0 |
| scripts externes (`src="http…"`) | 0 |

Et dans le rendu figé, le constat est le même, page par page :

- sur les **210 pages capturées** dans `maquette/rendu/`, **zéro** porte l'écran
  `Nos implantations`. C'est un écran de démonstration, le gabarit d'**aucune
  page** : la même famille de piège que l'écran 15, section 1 de la passation ;
- les 75 pages `/implantations*` se répartissent en 66 « 04 Ville », 8
  « 06 Département » et 1 « 10 Hub de rubrique » (la racine `/implantations/`).
  Aucun gabarit « implantations » n'existe dans l'index ;
- la **seule** page réelle qui porte un écran d'implantations est
  `/a-propos/equipe/` (`Équipe · Implantations`). Sa capture contient **0**
  `<svg>`, **0** `x-import`, **0** `MigenAgences`.

Cette absence est une mesure, pas une limite de l'outil : `<svg>` est bien
sérialisé dans **96 des 210** captures. Quand il manque, c'est qu'il n'y est pas.

## 3. Ce que le rendu de référence affiche à la place

Texte relevé dans `maquette/rendu/a-propos--equipe.html`, section
`Équipe · Implantations` :

> Nos implantations. Quatre agences, dix hubs de techniciens. Quatre agences
> portent le réseau, des hubs de techniciens dans les grandes villes
> rapprochent les équipes des usines.
>
> Lyon, Siège · Limonest et Écully. Montréal, Canada. Dubaï, Émirats arabes
> unis. Madrid, Espagne.
>
> Hubs de techniciens en France : Paris, Lille, Marseille, Toulouse, Lyon, Metz,
> Strasbourg, Bordeaux, Dijon, Nantes.

Donc **la référence elle-même dit quatre agences et dix hubs**, et nomme les
trois agences internationales. Elle ne contient aucune occurrence de
« Moulin Carron ».

## 4. Ce que le site rend déjà

| Donnée | Où, dans le site | État |
|---|---|---|
| « Quatre agences, dix hubs de techniciens. » | `components/site/contact/Agences.tsx`, `PiedDePage.tsx`, `carriere/ConditionsCarriere.tsx` | rendu |
| Les 4 agences avec `Lyon, Siège · Limonest et Écully`, `Montréal`, `Dubaï`, `Madrid` | `components/site/equipe/equipe-donnees.ts`, constante `AGENCES` | rendu, mot pour mot |
| Les 10 hubs nommés | `components/site/equipe/equipe-donnees.ts`, constante `HUBS` | rendu, mot pour mot |
| Les 10 hubs, variante offres | `components/site/offre/Reassurance.tsx` (« Les dix hubs, dans l'ordre de la capture ») | rendu |
| Adresses postales, rayon, rôle des 4 agences, 2 bureaux internationaux, 3 chiffres | `supabase/import/gabarits/implantations.json` | servi |
| La zone de la carte, réservée et vide, 460 px | `components/site/implantations/PageImplantations.tsx`, `HAUTEUR_CARTE = 460` | conforme |

Le `460` du composant et le `460` du gabarit sont le même nombre : la zone a été
réservée pour ce composant précis, et laissée vide **exprès**. L'écart est déjà
déclaré en tête de `PageImplantations.tsx` et de `contact/Agences.tsx`. Les deux
fichiers avaient raison avant cet import.

## 5. Ce qui manque vraiment : les coordonnées, et rien d'autre

Seule donnée du composant absente du dépôt : les cinq couples `lon`/`lat`. Elles
désignent des villes de **hubs**, pas des agences.

Tout le reste est soit déjà rendu, soit faux.

## 6. Les trois constats à remonter

1. **Cinq « agences » françaises au lieu de quatre.** La table s'appelle
   `AGENCES` et liste Lyon, Paris, Strasbourg, Nantes, Toulouse. Les quatre
   dernières sont des **hubs**. Le composant n'en nomme aucune des trois agences
   internationales, et il manque 5 des 10 hubs (Lille, Marseille, Metz,
   Bordeaux, Dijon). C'est exactement l'écart que `contact/Agences.tsx`
   documente depuis le 03/10, et que la carrière vérifie déjà
   (`verification-carriere.tsx` : `["Cinq agences", "quatre agences et dix hubs"]`).
2. **L'ancienne adresse du siège.** `129 ch. du Moulin Carron, 69130` est
   l'adresse d'Écully que `CLAUDE.md` marque « à purger à la recette ». Elle ne
   figure pas dans le rendu de référence. Mention légale : à ne pas réintroduire.
3. **Le fichier est périmé.** Sur les 56 fichiers de la racine du projet Claude
   Design, son `etag` est le deuxième plus bas (`1789405154223500`), très en
   dessous de l'application autonome et de tous les exports
   (`1791362996…` à `1791368170…`). Il précède la génération actuelle de la
   maquette, et le bloc texte « Quatre agences, dix hubs » l'a remplacé.

## 7. Ce qui reste à trancher, et seulement par Mehdi

1. **Faut-il une carte du tout ?** La référence n'en rend aucune. Si la zone de
   460 px doit rester vide, `PageImplantations.tsx` est déjà conforme et il n'y
   a rien à faire. Si une carte est voulue, c'est une demande neuve, pas un
   portage.
2. **Si carte, alors avec quoi ?** Le composant impose `d3` et `topojson`, que
   le contrat de portage interdit d'ajouter, et un appel à `cdn.jsdelivr.net` à
   l'exécution, qui tomberait sous la règle « aucun traceur avant consentement »
   (requête tierce au chargement). Un tracé statique servi depuis
   `public/assets/` éviterait les deux.
3. **Si carte, alors quoi dessus ?** Il faudrait les coordonnées des **dix**
   hubs et des **quatre** agences. Le composant n'en fournit que cinq, et mal
   étiquetées. Les cinq manquantes ne s'inventent pas : elles se demandent.

## Contrôle

- `maquette/MigenAgences.jsx` : 3 393 octets, identique à la source.
- `bunx tsc --noEmit` : code de sortie 0.
- `bunx eslint .` : code de sortie 0 (2 avertissements préexistants dans
  `scripts/`, hors de cet import).
