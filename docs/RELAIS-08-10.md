# Relais du 08/10 (après-midi) : où en est le site, ce qui reste

À lire avant toute reprise, avec `design_handoff_migen_site/README.md` (source de
vérité du client) et `CLAUDE.md`. Mehdi communique en français, jamais « Lovable »,
jamais de tiret cadratin dans un texte visible.

## Où vit quoi

- Dépôt : `~/Landing lovable/migen-site`, branche `phase-2-gabarits`, GitHub
  `mttfmigen/migen-site`. Vercel n'est PAS relié au dépôt : un push ne déploie rien.
- Mise en ligne : `bunx vercel@62.7.0 deploy --prod --yes --archive=tgz` depuis le
  dépôt (la version « latest » du cache bunx est cassée). Site :
  https://migen-site.vercel.app. Avant : `bunx tsc --noEmit` (un script de `scripts/`
  en erreur de type fait échouer la construction Vercel).
- Le contenu servi vient des fiches `supabase/import/gabarits-maquette/*.json`, qui
  gagnent toujours sur la base (`lib/contenu.ts`, `pageParChemin` et `filAriane`).
  Le serveur de dev (port 4340) ne les relit qu'après `node scripts/relis-relais.mjs`.
- Maquette de référence : `maquette/site-final-autonome.html` servie sur le port 4352
  (`scripts/sers-maquette.sh`), captures figées `maquette/rendu/<cle>.html/.json`.

## Outils de mesure (tous dans `scripts/`)

| Outil | Ce qu'il dit |
|---|---|
| `SORTIE=… HAUTEUR=2400 [LARGEUR=390] node scripts/diff-visuel-offre.mjs <url>` | % de pixels divergents par section, montages maquette/site |
| `node scripts/diff-styles.mjs <url>` | styles calculés de chaque texte, valeur maquette \| valeur site |
| `node scripts/verifie-position-titre.mjs ["<gabarit>" \| urls]` | hauteur du H1 contre la maquette, à ±2 px |
| `node scripts/relis-relais.mjs` | fait relire les fiches au serveur de dev |
| `bun lib/verification-decisions-copie.ts` | règles de copie décidées par Mehdi |

## Décisions de Mehdi du 08/10 (toutes appliquées ou en cours)

- « 10 % des techniciens », jamais « candidats » pour la sélection ; Limonest devient
  Écully, « siège à Lyon » reste : `lib/decisions-copie.ts` (`appliqueDecisions`,
  `copieConforme`), appliqué aux fiches, aux contrôles et aux méta-descriptions.
- Le Diagnostic Zéro arrêt est servi sous `/diagnostic-zero-arret/` (réécriture dans
  `next.config.ts` vers le projet Vercel `migen-diagnostic-zero-arret`, construit
  avec la base `/diagnostic-zero-arret/`), sans aucun prix affiché, seulement le nom
  des formules. Le test technicien public de la maquette est sur `/test-technicien/`,
  avec le formulaire standard du site (même formulaire HubSpot).
- Tous les liens du pied de page restent sur le domaine du site.
- Photos de ville : versions sous licence Envato (projet de licence « migen.fr »).
- Varier toutes les photos du site (voir plus bas).

## Fait aujourd'hui (local, en partie en ligne)

Pages Villes 74/74, Expertises 31/31, études de cas 41/41 avec photos et logos,
Secteurs 12/12 reconstruits sur la maquette, Métiers 13/13 (FAQ sur photo),
hubs de rubrique, Ressources, page Équipe à `/a-propos/equipe/`, cas clients
(`/preuves/` 41 études, `/realisations/` redirigé), décalage de 34 px sous l'en-tête
corrigé, fil d'Ariane visible retiré (gardé en données structurées), bouton des
formulaires = titre du panneau, flèche « → » dessinée comme la maquette, pied de
page aligné. Dernière mise en ligne : avant les décisions de copie et le relais
« la fiche gagne toujours » ; tout le reste attend la prochaine.

## Ce qui tournait au moment du relais

1. Vérification finale du chantier « site au pixel » (lecture seule) : relancer
   soi-même les contrôles si son retour manque (liste : `ls components/**/verification-*.tsx
   app/**/verification-*.tsx scripts/verifie-*.tsx`), plus `verifie-position-titre.mjs`.
2. Banque de photos variées : 7 agents cherchent dans Envato, un jury retient 80 à 110
   photos, un agent les télécharge sous licence « migen.fr » via le Chrome de Mehdi.
   Sortie attendue : `public/assets/photos/*.jpg` et `public/assets/photos/registre.json`
   ({ fichier, lien_envato, titre, orientation, themes, licence, sha256 }).
3. Nouveau bloc « Notre sélection » (refait par Mehdi sur Claude Design) : source
   `design_handoff_migen_site/maquette/MigenSelection.dc.html`, rendu de référence
   `~/Downloads/Migen Bloc Selection Redesign.html`, à porter dans
   `components/site/accueil/ProcessSelection.tsx` (défilement automatique des étapes).

## Reste à faire, dans l'ordre

1. **Photos de ville** : les 18 versions sous licence sont dans `public/assets/villes/`
   (`hub-<ville>.jpg` pour les cartes de l'accueil, `ville-<ville>.jpg` pour le bloc
   « Votre hub local »). Brancher : remplacer `components/site/accueil/hubs/<ville>.jpg`
   par `hub-<ville>.jpg` ; dans les fiches `implantations-*.json`, `hubLocal.photo` =
   `/assets/villes/ville-<ville>.jpg` (Marseille et Bordeaux : `hub-*`), vider
   `hubLocal.credit` (le badge « Aperçu Envato » n'a plus lieu d'être) ; adapter la
   règle de photo de `components/site/implantation/verification-ville.tsx`. Liens et
   correspondances : `docs/PHOTOS-VILLES-ENVATO.md`.
2. **Varier les photos** : avec le registre, écrire un script de répartition
   déterministe (thème de la page, aucune photo répétée dans une page, pages sœurs
   différentes), l'appliquer aux fiches, et faire accepter aux contrôles une photo
   « de la maquette OU du registre » (plusieurs contrôles exigent aujourd'hui les octets
   de la maquette : preuve, carrière, spécialité, domaine, ville, secteurs-hub). Garder
   les vraies photos de l'équipe Migen (t-shirts « migen » : team-*, sv-*), moins répétées.
3. **Bloc « Notre sélection »** : vérifier le portage (point 3 ci-dessus) à 1280 et 390.
4. **Formulaire mobile** : sous 900 px le champ « Nom » fait 37 px. Correctif dans
   `components/formulaire/FormulaireContact.module.css`, dans le `@media (max-width: 900px)` :
   `.grille > * { grid-column: 1 / -1 !important; }`, puis vérifier toutes les pages à formulaire.
5. **Outil Diagnostic** : les consignes de l'IA (fonctions Supabase `submit-audit`,
   `submit-audit-v55`, `submit-diagnostic`, projet `xlvnzrxyfflqjtdwuhza`) contiennent
   encore des prix et « sous 48h » ; l'écran les filtre (`src/lib/copie.ts`), mais il
   faut corriger les consignes. Les changements de l'outil ne sont pas commités
   (dépôt `~/Landing lovable/migen-diagnostic-zero-arret`, branche `v5.2`, et le
   worktree du déploiement dans le scratchpad de session `diag-deploy`).
6. **Méta-description vide** sur `/entreprise-maintenance-industrielle/` (sa seule
   phrase disait « 24/24 et 7/7 ») : en écrire une, ou la tirer du chapô.
7. **Suppressions refusées par les permissions** (à faire par Mehdi) :
   `git rm -f components/site/implantation/PageDepartement.tsx components/site/implantation/verification-implantation.tsx`
   et les générateurs qui écraseraient des fiches portées : `scripts/fabrique_gabarits_implantation.mjs`,
   `scripts/produit-secteurs.mjs` (et à vérifier : `produit_gabarit_offre.mjs`,
   `produit_domaines.mjs`, `produit-metier-maquette.mjs`, `produit_ressources.mjs`).
8. **Base Supabase** : la table `seo` et les contenus datent d'avant ; l'import
   (`node scripts/importe_rest.mjs`) demande la clé de service, absente de `.env.local`.
9. **`.vercelignore`** n'est pas appliqué avec `--archive` (envoi de 486 Mo) : à étudier.
10. Avant chaque mise en ligne : `bunx tsc --noEmit`, les contrôles de gabarit, un
    balayage des 249 URL en 200 sur le serveur de dev, puis le déploiement, puis la
    même vérification sur https://migen-site.vercel.app.
