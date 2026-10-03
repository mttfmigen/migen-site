# Ce qu'il reste à dessiner, et ce que j'attends de toi

Tu as demandé un fichier pour maquetter les pages que j'ai faites. Le voici, mais
d'abord une correction utile : **sur les onze écrans, huit sont bien dans ta
maquette et je n'ai fait que les porter.** Un seul est réellement à dessiner, et
deux demandent ton arbitrage. Ça t'évite de refaire un travail déjà fait.

---

## Récapitulatif

| Écran | Dans ta maquette | Ce que je livre | Verdict |
|---|---|---|---|
| `/contact/` | oui, 255 mots | 257 mots | fidèle |
| `/nous-connaitre/` | oui, 1 596 mots | 1 654 mots | fidèle |
| `/valeurs/` | oui, 436 mots | 449 mots | fidèle |
| `/rse/` | oui, 665 mots | 665 mots | fidèle, au mot près |
| `/equipe/` | oui, 901 mots | 927 mots | fidèle |
| `/partenaires/` | oui, 278 mots | 293 mots | fidèle |
| `/marques/` | oui, 7 familles, 67 constructeurs | idem | fidèle, 17 logos manquants |
| `/mentions-legales/` | oui, 215 mots | 241 mots | **11 trous à combler** |
| `/confidentialite/` | oui, 245 mots | 449 mots | **j'ai ajouté du contenu, à valider** |
| `/carriere/` | oui, 749 mots | 604 mots | **j'ai retiré des liens, à arbitrer** |
| `/plan-du-site/` | **9 mots** : un titre | 944 mots | **à dessiner** |

---

## 1. Le seul écran à dessiner : `/plan-du-site/`

**Ce que ta maquette en dit**, en entier :

> Plan du site
> Toutes nos pages, au même endroit.

Neuf mots. Pas de structure, pas de bloc, rien d'autre.

**Ce que j'ai construit**, faute de dessin : une page qui lit la base et liste
les **149 pages publiées**, groupées par rubrique de premier niveau (Offres,
Expertises, Implantations, Secteurs, Ressources, Réalisations, Travaux
industriels, Bureau d'études), chaque rubrique dans une carte avec son compte,
plus un champ de recherche en haut.

**Pourquoi je ne me suis pas contenté des neuf mots** : un plan du site sert à
deux choses, aider un visiteur perdu et donner à Google une page qui relie tout
le cocon. Neuf mots ne font ni l'un ni l'autre. Et je l'ai construit depuis la
base plutôt qu'à la main pour qu'il ne puisse jamais annoncer une page qui
n'existe plus.

**Ce que j'attends de toi** : le dessin de cet écran. Les questions ouvertes :

- Les rubriques en cartes, en colonnes, ou en liste longue ?
- Le champ de recherche, tu le gardes ? Il est utile avec 149 entrées, moins
  avec 40.
- Montre-t-on le compte de pages par rubrique ?
- Les pages de troisième niveau (par exemple `/implantations/lyon/grenoble/`)
  sont-elles listées, ou seulement les deux premiers niveaux ?

---

## 2. Les deux écrans où j'ai dépassé ton dessin

### `/confidentialite/` : +204 mots

Ta maquette pose la structure en six parties (Responsable du traitement, Données
collectées, Finalités et bases légales, Durées de conservation, Vos droits,
Cookies). J'ai gardé exactement ces six parties.

**Ce que j'ai ajouté, et pourquoi** : cette page est citée par la mention RGPD
de **chaque formulaire du site**. Elle doit donc dire vrai sur ce que le site
fait réellement. J'ai lu le code et complété avec ce qu'il fait vraiment : les
quatre finalités de consentement avec leurs destinataires, le fait que la table
des demandes ne porte aucune donnée nominative, et que la preuve de consentement
n'enregistre aucune adresse IP.

**Ce que j'attends de toi** : vérifier que ta mise en page tient ce volume (les
six parties passent de ~40 à ~75 mots chacune), et valider les durées de
conservation, qui restent une réserve ouverte.

### `/mentions-legales/` : 11 trous

Ta maquette écrit des emplacements entre crochets : `[forme juridique]`,
`[montant]` du capital, `[numéro]` de SIREN, et huit autres. Je ne les ai pas
remplis, et je ne les remplirai pas : **une mention légale inventée est pire
qu'absente**. Ils s'affichent en « à compléter ».

**Ce que j'attends de toi**, et ce sont des données, pas du dessin :

- forme juridique, capital social, SIREN ou SIRET, RCS, TVA intracommunautaire
- directeur de la publication
- hébergeur et son adresse (le site tourne sur Vercel, la base sur Supabase, à
  confirmer dans la formulation que tu veux)
- assurance professionnelle, si tu la mentionnes

---

## 3. Les arbitrages de contenu

### `/carriere/` : six métiers promis qui n'existent pas

Ta maquette renvoie vers dix fiches métier. **Huit existent** en base
(technicien de maintenance, automaticien, électromécanicien, roboticien,
responsable maintenance, agent de maintenance, technicien itinérant,
alternance). **Six n'existent nulle part** : électrotechnicien, soudeur,
chaudronnier, mécanicien, frigoriste, technicien CVC.

J'ai rendu ces six libellés en texte au lieu de poser un lien mort. À toi de
dire : on écrit ces six fiches, ou on les retire de l'écran ?

La maquette renvoie aussi vers `/test-maintenance/`, avec le libellé « Passer le
test ». Cette page n'existe pas non plus. C'est ton outil de test technicien :
tu veux un lien vers lui, et vers quelle adresse ?

### `/marques/` : 17 logos manquants, et deux fichiers trompeurs

Les 67 constructeurs viennent de ta maquette, dans son ordre, et un contrôle les
relit à chaque exécution. Mais **17 logos ne sont pas dans le dépôt** : ces
marques s'affichent en texte, ce qui reste correct mais moins beau.

Plus gênant, **deux fichiers portent le logo d'une autre société** :
`comau.svg` affiche AUTOMHA, `salvagnini.svg` affiche BST Brandschutztechnik.
Je les ai écartés plutôt que d'afficher un logo faux.

### Les boutons « Décrire mon besoin » de ces écrans

Sur `/equipe/` et `/marques/`, ta maquette fait pointer le bouton vers la page
de contact. J'ai fait pointer vers **le formulaire en bas de la page courante**,
parce que `/contact/` n'existait pas encore au moment où ces écrans ont été
construits. Maintenant qu'elle existe, les deux sont possibles. Mon avis :
garder le formulaire sur place, c'est un clic de moins. Dis-moi si tu préfères
l'inverse.

---

## 4. Ce que je ne peux pas deviner, toutes pages confondues

**172 affirmations attendent ta validation** avant toute mise en ligne. Elles
sont détaillées dans `RESERVES-CONTENU.md`, classées par ce qu'elles engagent :

| Nature | Nombre | Exemples |
|---|---|---|
| Chiffres avancés | 57 | chiffre d'affaires, effectifs, taux |
| Engagements | 49 | « le droit de refus est écrit au contrat » |
| Certifications et sécurité | 17 | MASE, EcoVadis, accidentologie 2025 |
| Partenaires nommés | 17 | alliances annoncées sur `/partenaires/` |
| Données personnelles | 12 | durées de conservation, sous-traitants |
| Personnes nommées | 11 | dirigeants, fonctions, photos |
| Mentions légales | 9 | les trous ci-dessus |

Une page publique qui affirme une certification qu'on n'a pas, ou qui nomme un
partenaire qui n'en est pas un, est opposable. Rien n'est enterré : tout est
listé, et tout est porté tel que ta maquette l'écrit, en attendant ton feu vert.
