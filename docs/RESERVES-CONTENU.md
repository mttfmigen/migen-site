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
