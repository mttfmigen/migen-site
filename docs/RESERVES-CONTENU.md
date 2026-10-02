# Réserves de contenu, à lever avant la mise en ligne sur migen.fr

## 0. BLOQUANT DE MISE EN LIGNE : les deux pages légales

`/mentions-legales/` et `/confidentialite/` restent en **brouillon**, donc en 404.
C'est délibéré.

Sur le site actuel, ces deux pages sont des **gabarits à trous**, et elles le
disent elles-mêmes au visiteur :

> « Gabarit juridique : les mentions ci-dessous doivent être complétées et
> validées par votre conseil. Les valeurs entre crochets sont à renseigner. »
> « migen©, [forme juridique] au capital de […] »
> « Gabarit RGPD : à faire valider par votre DPO ou votre conseil avant
> publication. Les durées et destinataires sont des exemples. »

Les reprendre telles quelles reviendrait à publier des mentions légales fausses,
et une politique de confidentialité dont les durées de conservation sont des
exemples alors que le site pose des cookies et enregistre des preuves de
consentement. Les écrire moi-même reviendrait à inventer des informations
juridiques sur l'entreprise. Ni l'un ni l'autre.

**Ce qu'il faut :** le texte réel, validé. Un site qui collecte des données sans
mentions légales exactes n'est pas publiable, indépendamment de son code.

En attendant, le pied de page porte bien les deux liens : le jour où les pages
passent en `published`, ils fonctionnent sans toucher au code.


Ce qui est en ligne aujourd'hui l'est sur `migen-site.vercel.app`, derrière le SSO
Vercel : visible par l'équipe, invisible du public et des robots. Rien de ce qui
suit n'est donc exposé. Mais rien de tout cela ne doit basculer sur migen.fr
sans avoir été tranché.

## 1. Les trois réserves que portait la maquette

La maquette les écrivait **en texte visible sur la page**, en gris clair. Elles
ont été retirées du rendu : un visiteur n'a pas à lire qu'on doute des chiffres
qu'on lui montre. La réserve, elle, reste entière.

| Où | Ce que la maquette disait | Ce qu'il faut trancher |
|---|---|---|
| `components/site/accueil/CertificationsRse.tsx` | « Chiffres 2025 · à confirmer avant publication » | Les quatre chiffres Sécurité et RSE (accidents avec arrêt, habilitations à jour, évolution, délai) sont-ils les bons pour 2025 ? |
| `components/site/accueil/FriseHistoire.tsx` | « Jalons à confirmer · dates et chiffres à valider » | Les dates et les chiffres de la frise d'histoire. |
| `components/site/accueil/TemoignagesClients.tsx` | « Verbatims reformulés à partir de retours clients · à valider avec les intéressés avant publication » | **Le plus sensible.** Les témoignages sont des reformulations, pas des citations. Ils sont anonymisés (fonction, secteur, département), mais la règle du projet est « aucun témoignage fabriqué ». Soit ils sont validés par les clients concernés, soit la section ne les affiche pas. |

Les trois composants prennent déjà leurs données en props : passer une liste
vide suffit à faire disparaître la section, sans toucher au code.

## 2. Ce que la maquette affirmait et qui contredisait les faits autorisés

Corrigé au portage, pour mémoire et pour que personne ne le remette :

- « **5 agences** en France » devenait « cinq agences permettent d'envoyer un
  technicien depuis le bassin le plus proche ». Il y en a **quatre** : Lyon
  (siège), Montréal, Dubaï, Madrid, et **aucune autre en France**, complétées par
  dix hubs de techniciens. Corrigé à trois endroits.
- « **+200 clients industriels** » dans le héros du gabarit de vente, alors que le
  corpus écrit « plus de 120 clients, dont plus de 80 réguliers ». La bande de
  chiffres du héros n'a pas été portée pour cette raison.
- « **Régie ou forfait** » et « **2 à 3 semaines** » dans les données du pavage des
  besoins : « régie » est un mot interdit, et aucun délai chiffré n'est autorisé.
- Deux tirets cadratins, « sur mesure », « Découvrir », et un « 2 accident » au
  singulier.

## 3. Ce qui reste ouvert, et qui n'est pas du contenu

- **Adresse du siège.** La maquette et le corpus disent Limonest (1 rue des
  Vergers, 69760). Le site actuel affiche encore Écully (129 chemin du Moulin
  Carron, 69130) sur certaines pages. C'est une mention légale : à confirmer.
- **Clé `service_role` de Supabase.** Absente de `.env.local` : les lectures et le
  build fonctionnent, les écritures non (dépôt d'un lead, preuve de consentement).
  Supabase ne la donne jamais par API, elle se copie depuis le tableau de bord.
- **Clé API Thot SEO.** Le serveur répond « API Key missing ». Sans elle, aucun
  score éditorial ne peut être mesuré.
- **Six hubs affichés, dix annoncés.** La maquette n'en montre que six (Lyon,
  Paris, Lille, Strasbourg, Nantes, Toulouse). Les quatre autres n'ont pas été
  inventés.
- **Quatre logos fournisseurs défectueux à la source**, dans le projet Claude
  Design : `comau.svg` contient le logo AUTOMHA, `ats-automation.svg` est vide,
  `gardner-denver.svg` et `hermle.svg` ont un `viewBox` faux.

## 4. Formulaire de contact, quatre arbitrages à ta main

Relevés pendant le portage de l'habillage à la maquette. Aucun n'a été tranché
à ta place.

1. **Blanc sur orange : 2,56:1, sous le plancher WCAG AA (4,5:1).** Le libellé
   du bouton de marque, en 15 px gras, n'est pas du « grand texte ». C'est le
   bouton de toute la maquette : assombrir l'orange ou foncer le texte est une
   décision de charte, pas de code.
2. **Le sélecteur d'indicatif téléphonique n'est pas repris.** La maquette le
   propose (FR, BE, CH, ES, CA, AE). La charge utile est construite depuis
   l'état du formulaire, pas depuis le DOM : un indicatif choisi serait jeté en
   silence, et un visiteur qui choisit +32 puis saisit un numéro local
   enverrait un numéro faux. Il faut un champ au contrat serveur et une règle
   de concaténation avant de l'afficher.
3. **Le message est obligatoire dans la maquette, facultatif pour le serveur**
   (`validation.ts`). Gardé facultatif et étiqueté ainsi : un astérisque
   pendant que le serveur accepte le vide mentirait au visiteur. Une ligne à
   changer si le besoin métier est l'inverse.
4. **Champs cachés de la maquette non repris** : `country`, `siren`, `siret`,
   `address`, `zip`. Vides dans la maquette, inconnus du serveur.

Un point de contraste à connaître : l'étiquette de champ en `--ink3` sur blanc
donne 4,74:1 (AA), mais sur le verre dépoli du héros elle tombe à ≈4,5:1, pile
sur le plancher. Si la charte évolue, c'est la première valeur à surveiller.

### Formulaire : trois arbitrages tranchés par le fichier du client (02/10)

Mehdi a fourni la maquette en page autonome le 02/10. Elle est désormais lue en
local (`maquette/accueil-rendu.html`), et `scripts/verifie-formulaire.tsx`
compare le composant à ce fichier, champ par champ. Trois points en attente
d'arbitrage sont donc tranchés, par la maquette :

1. **Le message est obligatoire.** Il était facultatif ici, par une décision
   prise sans la maquette sous les yeux. Elle le marque `required`, comme les
   cinq autres : six champs obligatoires. Si Mehdi préfère le laisser facultatif
   pour ne pas freiner un industriel en panne, c'est une ligne à changer
   (`OPTIONNELS` dans `components/formulaire/validation.ts`), et le contrôle
   signalera l'écart avec la maquette.
2. **L'indicatif téléphonique existe.** Une liste fermée de six pays dans le
   cadre du numéro (FR, BE, CH, ES, CA, AE), celle de la maquette. Elle était
   absente du portage. Le numéro part vers HubSpot sous la forme « +33 04 72 … ».
3. **Les cinq champs cachés de la maquette ne sont pas repris** : `country`,
   `siren`, `siret`, `address`, `zip`. Ils sont vides et sans mécanisme de
   remplissage dans la maquette. Les reprendre enverrait cinq chaînes vides à
   HubSpot. À reprendre le jour où un enrichissement les remplit vraiment.

Reste un écart assumé, dans l'autre sens : la **mention RGPD** sous le bouton
n'est pas dans la maquette. Elle est exigée au point de collecte (RGPD, articles
13 et 14) et explique 33 px de hauteur en plus que la maquette sur chaque
formulaire. Elle reste.

### Bloquants techniques pour Mehdi (02/10, soir)

1. **`SUPABASE_SERVICE_ROLE_KEY` est VIDE dans `.env.local`.** Conséquence concrète :
   `node scripts/verifie-base.mjs` ne peut pas auditer les pages en brouillon,
   et ce sont justement celles qu'une écriture refusée laisse vides. La clé se
   prend dans la console Supabase, Project Settings, API. Elle ne sort jamais du
   poste ni du serveur.
2. **Clé API Thot SEO absente.** Le pipeline articles s'arrête au score : un
   article est rédigé et en statut `review`, il ne peut pas être scoré.
3. **Trois pages de preuve étaient déjà publiées** quand leur contenu a été
   réécrit (`/preuves/stellantis-fonderie-sept-fons/`, `/preuves/timescope/`,
   `/preuves/vpk/`). Le découpage imposé par la couche de permissions pose
   d'abord le contenu avec ses tableaux vides : ces trois pages ont donc été
   servies quelques secondes avec des blocs vides. Leçon pour la prochaine
   reprise : dépublier avant de réécrire une page publiée.
4. **`/expertises/robotique/fanuc/`** n'a que 3 de ses 10 sections. En brouillon,
   donc invisible, mais à reprendre.
5. **`avis.verbatims` est vide sur `/preuves/` et `/realisations/`** : les trois
   verbatims de la maquette sont marqués « à valider avec les intéressés avant
   publication ». La note et la mention du nombre d'avis restent, la colonne de
   droite est vide. À remplir quand les clients auront validé.
6. **Deux cartes de chantier ne sont pas cliquables** sur `/preuves/` (ALPINA
   SAVOIE, SANOFI MARCY) : aucune page de détail n'existe pour elles, ni dans
   l'inventaire ni dans le corpus. Rendues en `<article>` plutôt qu'en lien mort.
7. **`SITE_INDEXABLE` doit passer à `oui`** dans l'environnement Vercel le jour
   où migen.fr pointe sur ce déploiement, sinon le site reste fermé aux robots.
   Tant que ce n'est pas le cas, c'est voulu : il porte les mêmes pages que le
   site en ligne et le concurrencerait.
