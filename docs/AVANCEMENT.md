# Rapport d'avancement, site migen.fr

Ce document dit OÙ ON EN EST, et rien d'autre. Il remplace la lecture du fil de
discussion. Prose réécrite le 14/10 vers 14h45 à partir du relevé de toutes les
demandes du 13 et du 14/10 (65 demandes, numérotées N01 à N65, citations
exactes de Mehdi à l'appui). Le bloc de chiffres ci-dessous est remesuré toutes
les dix minutes par `node scripts/rapport-avancement.mjs`, qui ne touche pas à
la prose.

Une donnée absente s'y écrit « non calculable » avec son motif. Jamais zéro.

<!-- CHIFFRES: début, réécrit par scripts/rapport-avancement.mjs -->

```json avancement
{
  "remesureLe": "14/10/2026 à 14:45",
  "brancheDeployee": {
    "reference": "origin/phase-2-gabarits",
    "recuperee": "oui, à l’instant",
    "tete": "e0b9b2b",
    "commitsDepuisMinuit": 49
  },
  "arbreOuTourneLeScript": {
    "branche": "worktree-wf_d782a073-806-8",
    "tete": "76b9938",
    "fichiersNonCommites": 2
  },
  "contenu": {
    "fichesDeContenu": 246
  },
  "verification": {
    "portesDeVerification": 58,
    "entreesAuRegistre": 93,
    "promessesAvecCommande": 50,
    "retoursEncoreOuverts": 10
  }
}
```

<!-- CHIFFRES: fin -->

## La remise à jour toutes les dix minutes

Demandée le 13/10 (« Refais moi le doc rapport d'avancement et mets le à jour
toutes les 10 minutes »). Elle vivait dans la session arrêtée le 13/10 au soir :
le rapport est resté figé au 13/10 à 16h40 jusqu'au 14/10, et le registre la
cochait quand même. D8 est repassée en [ ] le 14/10.

Réarmée le 14/10 à 14h42 dans la session qui pilote : tâche `366da5fb`, aux
minutes 3, 13, 23, 33, 43 et 53 de chaque heure, dans l'arbre
`migen-site-perimetre`. Elle lance le script et réécrit ce fichier localement,
sans commit ni poussée, puisque chaque poussée redéploie le site : le fichier
part avec les poussées des lots. Elle vit en mémoire de la session, s'arrête
avec elle et expire au bout de sept jours.

Le script mesure depuis le 14/10 la BRANCHE DÉPLOYÉE (`origin/phase-2-gabarits`)
et non l'arbre où il tourne : l'arbre principal est resté à 93da90c, 35 commits
en arrière, et y lancer l'ancien script aurait publié des chiffres que personne
ne voit.

Commande qui dit si la remise à jour tourne (D8 du registre) : l'âge de
« remesureLe » ci-dessus, vingt minutes au plus.

## Les mesures lentes, et quand elles ont été prises

Ces portes tournent contre la production et prennent plusieurs minutes. Elles
ne sont pas relancées à chaque passage du rapport : leur horodatage fait foi.

| Mesure | Résultat | Prise le |
|---|---|---|
| Registre des retours client | 48 promesses : 37 tenues, **6 rompues**, 3 plantées, 2 chantiers ouverts | 14/10 14:15 |
| Redirections de l'ancien migen.fr | 181 adresses, 144 en une 301, 4 conservées, 35 techniques en 404, 259 adresses du plan en 200 : **REDIRECTIONS_SANS_PERTE** | 14/10 14:33 |
| Interdits du contrat éditorial | **1 formulation interdite**, `lib/decisions-copie.ts:548`, le motif d'une règle qui la retire de la copie (G55) | 14/10 14:41 |
| Responsive, 5 largeurs, 22 pages | **non concluante** : 70 relevés sur 110, des blocs servis ouverts sous 880 px (G57) | 14/10 14:32 |
| Blocs repliables | **163 défauts sur 1851 blocs**, « Ils nous font confiance » sans corps texte (G20) | 14/10 14:27 |

Commandes, dans l'ordre :

    node scripts/verifie-le-registre.mjs
    node scripts/verifie-redirections.mjs https://migen-site.vercel.app
    node scripts/verifie-interdits.mjs
    SITE_URL=https://migen-site.vercel.app node scripts/verifie-responsive.mjs
    SITE_URL=https://migen-site.vercel.app node scripts/verifie-blocs-pliables.mjs

## Ce qui bloque la mise en ligne, côté code

**Sept promesses du registre sont rompues**, toutes depuis la vague mobile du
14/10, et aucune n'a été maquillée : G20, G57, G58, G59, G63, G66 au passage de
14h15, et G55, révélée à 14h43 quand onze commandes du registre ont cessé de
mesurer l'arbre principal resté en arrière. Quatre viennent du même commit,
`5c7e765`, les titres que Mehdi a donnés aux trois blocs sans titre : les portes
G20, G59, G63 et G66 ne connaissent pas ces titres, que la maquette de bureau ne
porte pas. Toutes sont soldées par le chantier Mobile vague 2 ; le détail, la
mesure et la cause de chacune sont à leur entrée dans `GATES.md`.

## Demandes faites

Recopiées du relevé du 14/10, avec la commande qui le prouve. Les commandes qui
citent `etat.json` ou `scratchpad/` se lancent dans le dossier du relevé de la
session qui pilote ; « au registre » renvoie à l'entrée de `GATES.md`, dont la
commande est rejouée par `node scripts/verifie-le-registre.mjs`.

- **N01** /nous-connaitre/ ne doit plus parler que de Résidence : l'intro nomme les trois métiers (retour de Nathan). Commande : `h=$(curl -s https://migen-site.vercel.app/nous-connaitre/); printf %s "$h" | grep -o '<meta name="description" content="[^"]*"' | grep -c 'maintenance.*bureau d.*travaux industriels'; printf %s "$h" | grep -o '<main.*</main>' | grep -oE 'href="/(offres/(residence|full-service|zero-arret|arret-technique|bureau-etudes)|travaux-industriels)/"' | sort -u | wc -l`.
- **N03** /nous-connaitre/, bloc « C'est quoi le nom de la société ? » : sigle M, I, GEN (et non G + EN). Commande : `curl -s https://migen-site.vercel.app/nous-connaitre/ | sed 's/<[^>]*>/ /g' | tr -s ' ' | grep -o "I ndustrielle GEN éral"`.
- **N04** /carriere/, bloc « 12 · Au quotidien, Nos informations pratiques » : agencement à refaire, numéro de téléphone à retirer. Commande : `curl -s https://migen-site.vercel.app/carriere/ | sed 's/<[^>]*>/ /g' | grep -o 'Contact direct  *Du lundi au vendredi' ; grep -c 'alignItems: "start"' components/site/metier/SectionsFicheMetier.tsx`.
- **N05** /implantations/ : texte manquant sur la carte 03 de « Vos problématiques » et de « L'offre ». Commande : `curl -s https://migen-site.vercel.app/implantations/ | grep -o 'Loin d.un bassin dense' | wc -l`.
- **N06** /implantations/ : porter la nouvelle page du colis Claude Design (5).zip. Commande : `curl -s https://migen-site.vercel.app/implantations/ | grep -o 'data-empan=' | wc -l ; curl -s https://migen-site.vercel.app/implantations/ | grep -o 'type="radio"' | wc -l`.
- **N07** /implantations/, bassins : reproduire la capture « Au-delà des hubs » (48 villes, onglets par région). Commande : `curl -s https://migen-site.vercel.app/implantations/ | sed 's/<[^>]*>/ /g' | tr -s ' ' | grep -o 'Au-delà des hubs 48 villes couvertes'`.
- **N08** /implantations/, mosaïque des hubs : répartition des blocs à refaire. Commande : `curl -s https://migen-site.vercel.app/implantations/ | grep -o 'data-empan=' | wc -l`.
- **N09** /ressources/ : porter la nouvelle version (Ressources v2) du colis (5).zip. Commande : `curl -s https://migen-site.vercel.app/ressources/ | grep -oE 'Digital &amp; IA|Coûts &amp; environnement' | sort -u | wc -l`.
- **N13** Mobile : dire à Mehdi la meilleure option à commander à Claude Design. Commande : `grep -n 'D17' GATES.md`. Au registre : D17.
- **N14** Ne jamais baisser le nombre de mots (SEO) : aérer par la disposition, replier sans retirer. Commande : `git show b4cc3e2 -s --format=%B | grep -i 'aucun mot perdu'`.
- **N15** Mobile : brancher la couche de conversion (barre collante, bandeau « Être rappelé », photo + CTA, rappel final). Commande : `for p in / /offres/arret-technique/ /nous-connaitre/; do curl -s https://migen-site.vercel.app$p | grep -o 'id="etre-rappele"' | wc -l; done`.
- **N16** Mobile : carrousel des cartes preuves de la maquette v2. Commande : `git show efeeb49 -s --format=%B | grep -i carrousel`.
- **N18** Pages villes : maillage interne entre les 66 villes. Commande : `curl -s https://migen-site.vercel.app/implantations/bordeaux/ | grep -o '<main.*</main>' | grep -oE 'href="/implantations/[a-z-]+/([a-z-]+/)?"' | sort -u | wc -l`.
- **N19** Mobile : menu à 62 liens et pied de page de la maquette. Commande : `git show fff6624 -s --format=%B | head -12`.
- **N20** Composant ReferencesOffre : « 4 cartes sur 5 jetées » sur /offres/arret-technique/. Commande : `python3 -c "import json;d=json.load(open('supabase/import/gabarits-maquette/offres-arret-technique.json'));print([p['lienHref'] for s in d['contenu']['sections'] for p in s.get('preuves',[])])"`.
- **N21** Mobile : le numéro de téléphone effacé (écart M4). Commande : `curl -s https://migen-site.vercel.app/offres/arret-technique/ | grep -o 'href="tel:[^"]*"' | wc -l`.
- **N23** Règles absolues : zéro donnée inventée, jamais de tiret cadratin, aucun mot interdit, ne pas réécrire la copie du client. Commande : `node scripts/verifie-interdits.mjs`.
- **N24** GATES.md : traiter les entrées « à requalifier » ([ ] et [~]). Commande : `node scripts/verifie-le-registre.mjs`.
- **N25** Images : alt manquants des photos de villes et des cartes de l'accueil. Commande : `node scripts/verifie-alt-photos.mjs https://migen-site.vercel.app | tail -2`.
- **N26** Images : doublons de photos dans un même bloc, images bien placées. Commande : `node scripts/verifie-photos-du-bloc.mjs | tail -1`.
- **N27** Lighthouse mobile chiffré sur 5 pages représentatives. Commande : `git show origin/phase-2-gabarits:docs/LIGHTHOUSE-MOBILE-14-10.md | head -5`.
- **N28** Formulaire : déposer chaque demande dans le formulaire HubSpot 18757747-87a1-4098-b89e-78ba4440d489. Commande : `grep -n 'hsforms.com/submissions/v3' app/api/lead/route.ts`.
- **N29** Formulaire : « company » = nom de l'entreprise. Commande : `grep -n '0-2/name' app/api/lead/route.ts`.
- **N30** Formulaire : tous les champs doivent remonter dans HubSpot, e-mail compris. Commande : `git show origin/phase-2-gabarits:docs/INVENTAIRE-3-JOURS.md | grep -n '^| 10'`.
- **N32** Formulaire : un seul et même formulaire en haut de page et sur /contact/. Commande : `curl -s https://migen-site.vercel.app/contact/ | grep -o '<form.*</form>' | grep -o 'name="[a-z_]*"' | sort -u`.
- **N33** Formulaire : pas de case de consentement, la phrase « Vos informations seront conservées ... désinscrire à tout moment » suffit. Commande : `curl -s https://migen-site.vercel.app/contact/ | grep -o '<form.*</form>' | grep -c 'type="checkbox"' ; curl -s https://migen-site.vercel.app/contact/ | grep -o 'désinscrire à tout moment' | wc -l`.
- **N34** Formulaire du bas de page sur téléphone : garder tous les champs, en plusieurs étapes. Commande : `curl -s https://migen-site.vercel.app/contact/ | grep -o 'etapeMobile' | wc -l`. Au registre : D21.
- **N35** Titres des trois blocs repliés sur téléphone : « Certifications et équipe », « Ils nous font confiance », « Votre technicien intégré à votre site ». Commande : `curl -s https://migen-site.vercel.app/offres/ | grep -o 'Votre technicien intégré à votre site' | wc -l`. Au registre : D22.
- **N36** Marges latérales de 18 px sur téléphone, comme la maquette. Commande : `git show e88b4b6 --stat`. Au registre : D20.
- **N37** Photos des hubs : Bordeaux depuis Vercel, Dijon en vignes de Bourgogne, Metz, puis Metz et Dijon sur Envato. Commande : `curl -s -o /dev/null -w '%{http_code}' https://migen-site.vercel.app/assets/villes/hub-metz.jpg ; curl -s -o /dev/null -w '%{http_code}' https://migen-site.vercel.app/assets/villes/hub-dijon.jpg`. Au registre : D28 et B7.
- **N39** Donner le lien du projet Supabase. Commande : `grep -o rmthzplyrbifoeaxfiwn .env.local | head -1`.
- **N40** Traceurs : expliquer de quoi il s'agit (GA4, Google Ads, LinkedIn, pixel, Search Console). Commande : `grep -n 'D15' GATES.md`. Au registre : D15.
- **N45** Dernière repasse : inventaire de toutes les demandes des 3 derniers jours, traitées ou non, images bien placées. Commande : `git show origin/phase-2-gabarits:docs/INVENTAIRE-3-JOURS.md | head -20`.
- **N47** Liste de tout ce qu'il faut pour terminer, dont la liste exhaustive du mobile. Commande : `jq length etat.json`.
- **N48** Méthode : agents en parallèle, déployer dès qu'un changement est fait, aller plus vite. Commande : `git log origin/phase-2-gabarits --since=2026-10-14T00:00 --oneline | wc -l`.
- **N49** Passation du chantier vers l'autre compte Claude. Commande : `git show 6905d9b --stat`.
- **N51** Registre : consigner toutes les demandes du 13/10 (« il manque tout ce que je t'ai demandé aujourd'hui »). Commande : `grep -c '^### D' GATES.md`.
- **N52** Purge des prix : vérifier si le travail n'était pas déjà fait, restituer les phrases perdues. Commande : `node scripts/verifie-purge-des-prix.mjs`.
- **N61** Logos clients : accords écrits (B4). Commande : `grep -n -A1 'B4' GATES.md`.
- **N02** « Voir nos secteurs → » devient un vrai bouton sur `/nous-connaitre/`, libellé et cible inchangés (lot « cta-nous-connaitre », `f461219`, en production à 14h40). Au registre : D29.
- **N42** Plan de redirection 301 de l'ancien migen.fr, FAIT POUR LE CODE (`4a336e5`, `d76960f`) ; la page `/cgv/` et six choix restent à Mehdi, plus bas. Commande : `node scripts/verifie-redirections.mjs https://migen-site.vercel.app | tail -1`. Au registre : D24.

## En cours, par chantier

**Mobile vague 2** (N11, N12). Fait et en ligne : l'accueil, les pages natives,
secteur, villes, études de cas, offres, expertises, métier, article, `/contact/`,
harmonisation, styles partagés (`6a2602d`). Reste la porte du repli, rouge (D1,
D16), et les sept promesses rompues ci-dessus.
Commandes : `node scripts/verifie-repli-mobile.mjs https://migen-site.vercel.app | tail -3`,
puis `node scripts/verifie-le-registre.mjs`.

**Ressources** (N10, « y'a un bug, vérifie », 14/10 12h23). Sept fichiers de
`components/site/ressources-hub/` modifiés dans une copie de travail, non
poussés au 14/10 14h10.
Commande : `git log origin/phase-2-gabarits --oneline --since=2026-10-14T12:00 -- components/site/ressources-hub/`

**Redirections du LISEZMOI mobile** (N17). Les six adresses `/offres/chantier/`,
`/offres/construction/`, `/offres/retrofit/`, `/offres/audit-conseil-maintenance/`,
`/bureau-etudes/`, `/offres/depannage-industriel/` répondent encore 200 à 14h34.
Deux sont des cibles ou des options du plan de redirection de l'ancien site :
elles attendent les choix de Mehdi (section 5 de `docs/PLAN-REDIRECTIONS.md`).
Au registre : D25.

**Audits de mise en ligne** (N22). Premier passage poussé en `a2a07cf` à 14h09.
La mesure globale du texte du `<main>` est à rejouer après les derniers lots,
sur les 259 adresses.
Commandes : `node scripts/instantane-texte-main.mjs`, `bun run build`.

**Le relevé lui-même** (N44), `etat.json` et `lots.json` de la session qui pilote.

## À faire, par lot

| Lot | Demande | État à 14h45 | Commande |
|---|---|---|---|
| plan-du-site | N43 : les 259 adresses du sitemap aussi au plan du site (aujourd'hui 145) | pas encore poussé | au registre D23, jeton `PLAN_ET_SITEMAP_ALIGNES` |
| tag-manager | N41 : Google Tag Manager derrière le consentement | pas encore poussé | au registre D27, jeton `TAG_MANAGER_DERRIERE_LE_CONSENTEMENT` |
| cta-nous-connaitre | N02 : « Voir nos secteurs → » en bouton | **fait, en ligne** | au registre D29 |
| rapport-avancement | N46 : ce rapport, remis à jour toutes les dix minutes | prose réécrite, remise à jour réarmée | au registre D8 |

## Ce qui attend Mehdi

| Sujet | Ce qu'il faut de lui | Commande qui dira que c'est fait |
|---|---|---|
| Page `/cgv/` (N42) | **bloquant avant la bascule** : les devis citent https://migen.fr/cgv, le nouveau site n'a pas de page CGV. Fournir le texte, puis retirer la ligne `/cgv/` des redirections | `node scripts/verifie-redirections.mjs https://migen-site.vercel.app` |
| Six choix de redirection (N42, N17) | section 5 de `docs/PLAN-REDIRECTIONS.md` | même commande, puis D25 du registre |
| `SITE_INDEXABLE` (N43) | **le jour de la bascule** : poser `SITE_INDEXABLE=oui` sur Vercel, sinon robots.txt reste « Disallow: / » ; puis soumettre le sitemap dans la Search Console | `curl -s https://migen.fr/robots.txt` |
| Identifiant Tag Manager (N41) | l'identifiant GTM-XXXXXXX, à poser sur Vercel en Production (`NEXT_PUBLIC_GTM_ID`), les balises du conteneur avec les contrôles de consentement, puis le test des deux parcours avec Google Tag Assistant | `bunx vercel@62.7.0 env ls production \| awk '{print $1}' \| grep -cx NEXT_PUBLIC_GTM_ID` |
| Formulaire de bout en bout (N31) | un envoi réel depuis `/contact/` avec une vraie adresse, puis le voir dans les soumissions du formulaire 18757747 dans HubSpot. Une session ne crée pas de faux contact | journal Vercel « lead » depuis le 14/10 8h (UTC), contacts HubSpot convertis depuis le 12/10 |
| Clé de service Supabase (N59, B2) | la poser sur Vercel : chaque lead perd sa copie d'attribution sans elle | `bunx vercel@62.7.0 env ls production \| awk '{print $1}' \| grep -cx SUPABASE_SERVICE_ROLE_KEY` |
| Trois champs légaux (N60, B3) | les fournir pour les mentions légales | `grep -n 'B3' GATES.md` |
| Candidatures TeamTailor (N38, B1) | offre 8528454 de « draft » à « unlisted », son titre corrigé, puis `TEAMTAILOR_JOB_ID` et `TEAMTAILOR_API_KEY` sur Vercel | `bunx vercel@62.7.0 env ls production \| awk '{print $1}' \| grep -c TEAMTAILOR` |
| h1 et copie de `/nous-connaitre/` (N56, B6) | le h1 « Un seul métier : technicien de maintenance. » reste ou nomme les trois métiers ; B1 à B10 de `docs/NOUS-CONNAITRE-ARBITRAGES.md` | `curl -s https://migen-site.vercel.app/nous-connaitre/ \| grep -o '<h1[^>]*>[^<]*'` |
| Arbitrages F, G, H1 à H3 (N63, N64, N65) | accueil mobile, astreinte dite deux fois sur 45 villes, expertises | `grep -n '^## F\|^## G\|H1\|H2\|H3' docs/NOUS-CONNAITRE-ARBITRAGES.md` |
| Erreur eslint du champ Entreprise (N62, B5) | accepter ou non 250 ms de délai sur la liste d'autocomplétion | `bunx eslint components/formulaire/ChampEntreprise.tsx` |
| Phrases de la purge des prix (N53) | quatre phrases à trancher, dont « pour moins de la moitié du coût d'un salarié » | `node scripts/verifie-purge-des-prix.mjs` |
| Six expertises sans étude de cas (N54) | commander les études de cas, ou accepter la bande sans carte | `git show origin/phase-2-gabarits:docs/INVENTAIRE-3-JOURS.md \| grep -n '^\| 24'` |
| Photos de logistique (N57) | environ trois photos sous licence : cinq emplacements servent le même convoyeur | `bun scripts/verifie-photos-repetition.mjs` |
| Société « Z » dans HubSpot (N55) | la supprimer : une session ne supprime pas de donnée du CRM | aucune, hors dépôt |
| Module Servantes (N50) | avant ou après la mise en ligne : deux migrations de la toolbox à appliquer, hors de ce dépôt | `git status --short` dans `migen-toolbox` et `newsflow-scribe-hub` |
| Texte des pages go.migengroup.com (N58) | avant ou après la mise en ligne, autre projet | aucune, hors dépôt |

## Les deux règles qui gouvernent ce rapport

1. **Rien n'y est écrit sans mesure.** Chaque chiffre porte sa commande. Une
   mesure impossible s'écrit « non calculable » avec son motif.
2. **Une porte se répare, jamais ne s'aveugle.** Chacune doit prouver qu'elle
   sait échouer, par un témoin avec au moins un contrôle négatif. La leçon du
   14/10 : onze commandes du registre mesuraient l'arbre principal, resté 35
   commits en arrière. Elles passaient, et l'une d'elles (G55) cachait une
   rupture que la branche déployée porte depuis 13h17.
