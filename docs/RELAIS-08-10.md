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
| `SITE_URL=https://migen-site.vercel.app node scripts/diff-visuel-offre.mjs <url>` | même mesure, sur la version en ligne |
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
page aligné. Mise en ligne du 08/10 en fin d'après-midi : tout ce qui précède, plus
le nouveau bloc « Notre sélection » (248/248 adresses en 200 en ligne ; les 12 pages
Secteurs étaient encore l'ancienne version en ligne, Mehdi l'a vu).

## Ce qui tournait au moment du relais

1. Vérification finale du chantier « site au pixel » : TERMINÉE, verdict non conforme.
   46 contrôles sur 49 verts, tsc propre, 247/248 titres à la bonne hauteur. Ses défauts
   sont la section « Défauts trouvés par la vérification finale » ci-dessous.
2. Banque de photos variées : FINIE et commitée. 109 photos sous licence « migen.fr »
   dans `public/assets/photos/` (2000 px max, JPEG q82, 89 paysage, 20 portrait),
   registre `public/assets/photos/registre.json` : { fichier, lien_envato, titre (Envato),
   description (en français), orientation, themes (ceux du jury), licence, sha256 }.
   Originaux pleine résolution dans `~/Downloads`. Reste à les répartir (point 2 plus bas).
3. Nouveau bloc « Notre sélection » : FAIT et en ligne. `ProcessSelection.tsx` +
   `CarteEtapes.tsx` (défilement des étapes), contrôle
   `bun components/site/accueil/verification-selection.tsx`. Écart assumé : contenu
   de 1 120 px au lieu de 1 200 (l'export de Mehdi n'a pas `box-sizing: border-box`,
   la maquette complète si).

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
3. ~~Bloc « Notre sélection »~~ : fait, identique à 1280, 1000, 800 et 390 px.
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
10. Mettre en ligne depuis une copie propre du dernier commit (le dossier de travail
    contient souvent du travail en cours) : `git worktree add --detach <dossier> HEAD`,
    y copier `.vercel/` et `next-env.d.ts`, `bunx next typegen`, puis déployer.
    Avant chaque mise en ligne : `bunx tsc --noEmit`, les contrôles de gabarit, un
    balayage des 249 URL en 200 sur le serveur de dev, puis le déploiement, puis la
    même vérification sur https://migen-site.vercel.app.

## Défauts trouvés par la vérification finale (à traiter en premier)

1. **Consentement RGPD** : « Tout refuser » envoie la preuve de consentement en POST sur
   `/api/consentement`, le serveur répond 500 (`components/consentement/etat.ts:138`).
   La preuve n'est pas enregistrée : vérifier la table et la route.
2. **« 24/24 et 7/7 » visible** (interdit) sur `/offres/depannage-industriel/` (héros,
   chiffre, garantie 04, FAQ, appel final) et `/offres/construction/` (mention sous les
   boutons, garantie) ; sur `/offres/construction/` et `/offres/audit-conseil-maintenance/`
   des mentions commencent par une virgule (« , du lundi au vendredi… ») : un retrait de
   phrase a laissé un morceau. Ces deux adresses sont des redirections de la maquette
   (`remapOffer`) : vérifier si elles doivent redevenir des 301.
3. **`/bureau-etudes/`** : FAQ à 69 % (la maquette a le panneau sombre sur photo, le site
   un accordéon clair), « Un autre besoin ? » à 22 %.
4. **`/preuves/bamesa/`** : titre 42 px trop bas (seule page décalée sur 248) ; la phrase
   du chapô retirée pour « notamment » doit être déclarée dans la fiche, et le chapô ne
   doit perdre que cette phrase.
5. **Contrôles** : `components/cocon/verification-appel-action.tsx` échoue parce que la
   règle `.mg-site [style*="padding:40px 44px"]` a été retirée de `app/globals.css`
   (alignement mobile sur la maquette) : mettre le contrôle à jour ou remettre la règle.
   `scripts/verifie-domaine.tsx` et `scripts/verifie-ressource.tsx` sont périmés
   (remplacés par `components/site/expertises/domaine/verification-domaine.tsx` et
   `components/site/ressource/verification-ressource.tsx`) : les supprimer.
6. **`/offres/retrofit/remise-en-etat/`** : dans la maquette, les boutons des bandes 4, 7, 13
   et du formulaire final n'ont pas de libellé ; le site en met un : déclarer l'écart.
7. **« réguliers »** apparaît encore sur 7 pages (guide choisir-une-entreprise, Poitiers,
   audit-conseil, résidence, robot-spot, préparer-un-arrêt, menuiserie) : vérifier que
   ce n'est jamais « clients réguliers » (« contrats réguliers » est permis).
8. **« taux horaire »** traité de deux façons (retiré sur `/implantations/`, rendu
   ailleurs : résidence, secteurs, alstef) : trancher et aligner.
9. **Mobile, gabarit 01** : fil d'Ariane de 54 px contre 48 (titre 6 px plus bas).
10. `scripts/verifie-position-titre.mjs` peut se figer sur les 248 pages : ajouter une
    borne de temps par page et un journal au fil de l'eau.
