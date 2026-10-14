/**
 * Les 301 de l'ANCIEN SITE WordPress (migen.fr), versionnées dans le code.
 *
 * Données seules : la table est construite et contrôlée dans
 * `lib/redirections.ts`, appliquée par `proxy.ts` APRÈS la table `redirects`
 * de la base, qui garde donc la main pour surcharger une destination.
 *
 * POURQUOI DANS LE CODE : la table `redirects` n'est pas inscriptible depuis ce
 * dépôt (clé de service absente). Versionnées ici, ces lignes tiennent aussi
 * quand Supabase est injoignable.
 *
 * D'OÙ ELLES VIENNENT : `docs/redirections/anciennes-adresses.json`, inventaire
 * mesuré le 14/10/2026 (Yoast, Semrush, archives, dépôt) ; correspondances
 * relues une à une en position adverse. Le plan pour Mehdi, avec les
 * correspondances à valider : `docs/PLAN-REDIRECTIONS.md`. La porte :
 * `node scripts/verifie-redirections.mjs`.
 *
 * RÈGLES : une entrée par source, sous forme canonique (minuscules, slash
 * final) ; la destination est la page FINALE, jamais une autre source (le
 * build échoue sinon, voir `tableVersionnee`). Les adresses techniques de
 * WordPress (flux, auteurs, pagination, thème Avada, WooCommerce, `?p=`) n'ont
 * PAS de ligne : elles répondent 404, c'est voulu.
 *
 * PIÈGE : le proxy applique ces lignes AVANT de servir une page. Une source qui
 * redevient une page (ex. `/cgv/` republiée) reste masquée tant que sa ligne
 * est ici. La porte le voit : elle exige 200 sur chaque adresse du plan du
 * site. Pour retirer une redirection, retirer la ligne ici ET en base.
 */
export const REDIRECTIONS_ANCIEN_SITE: ReadonlyArray<
  readonly [source: string, destination: string]
> = [
  // Études de cas clients : l'ancien article vers la même étude de cas ; les archives de réalisations vers le hub.
  ["/category/realisations/", "/preuves/"],
  ["/nos-realisations/", "/preuves/"],
  ["/aktid-choisit-migen-intervention-pour-le-montage-de-son-nouveau-centre-logistique-a-clermont-ferrand/", "/preuves/aktid-centre-logistique/"],
  ["/migen-sur-site-et-alstef-group-en-collaboration/", "/preuves/alstef-group/"],
  ["/amazon-choisit-migen-intervention-pour-assurer-le-maintien-de-son-centre-logistique/", "/preuves/amazon-centre-logistique/"],
  ["/amazon-choisit-migen-intervention-pour-assurer-le-maintien-dun-nouveau-site/", "/preuves/amazon-nouveau-site/"],
  ["/migen-sur-site-et-autoliv-pour-le-maintien-dun-site-industriel/", "/preuves/autoliv/"],
  ["/migen-consultation-accompagne-eaton-pour-la-mise-en-production-de-son-site-automobile/", "/preuves/eaton-mise-en-production/"],
  ["/migen-intervention-en-partenariat-avec-eiffage/", "/preuves/eiffage/"],
  ["/migen-sur-site-pour-eriks/", "/preuves/eriks/"],
  ["/fdj-et-migen-sur-site-pour-la-maintenance-dun-site-proche-de-paris/", "/preuves/fdj/"],
  ["/group-atlantic-choisit-migen-consultation-pour-renforcer-ses-equipes/", "/preuves/groupe-atlantic/"],
  ["/joint-lyonnais-sollicite-migen-intervention-pour-des-defaillances-sur-son-parc-machine-a-lyon/", "/preuves/joint-lyonnais/"],
  ["/migen-consultation-debute-en-belgique-pour-mccain/", "/preuves/mccain-belgique/"],
  ["/mersen-choisitmigen-sur-site-pour-des-nouvelles-lignes-pres-de-lyon/", "/preuves/mersen/"],
  ["/ogf-et-migen-sur-site-pour-larret-estival/", "/preuves/ogf-arret-estival/"],
  ["/orthus-et-ecocem-entreprise-irlandaise-pour-la-construction-dun-nouveau-site-en-france/", "/preuves/orthus-ecocem/"],
  ["/orthus-et-washtec-partenaires-pour-linstallation-de-stations/", "/preuves/orthus-washtec/"],
  ["/vpk-et-migen-sur-site-pour-la-maintenance-de-son-site-cloned/", "/preuves/orthus-washtec/"],
  ["/migen-et-savoye-en-alliance-strategique/", "/preuves/savoye/"],
  ["/migen-intervention-et-soprema-pour-des-travaux-ponctuels/", "/preuves/soprema/"],
  ["/stellantis-x-migen-consultation-pour-maintenir-la-fonderie-de-sept-fons/", "/preuves/stellantis-fonderie-sept-fons/"],
  ["/stellantis-x-migen-consultation-comme-partenaire-pour-plusieurs-sites-du-grand-est/", "/preuves/stellantis-grand-est/"],
  ["/migen-intervention-travail-sur-des-casques-a-realite-virtuelle-pour-timescope/", "/preuves/timescope/"],
  ["/valeo-choisit-migen-consultation-pour-plusieurs-usines-en-france/", "/preuves/valeo-usines/"],
  ["/veepee-choisit-migen-consultation-pour-la-maintenance-de-ces-sites-de-lyon/", "/preuves/veepee-sites-lyon/"],
  ["/migen-sur-site-pour-voit-dans-le-grand-est/", "/preuves/voit-grand-est/"],
  ["/vpk-et-migen-sur-site-pour-la-maintenance-de-son-site/", "/preuves/vpk/"],
  // Villes et départements : vers l'implantation qui couvre la zone.
  ["/maintenance-industrielle-bordeaux/", "/implantations/bordeaux/"],
  ["/maintenance-industrielle-nord/", "/implantations/lille/"],
  ["/maintenance-industrielle-lyon/", "/implantations/lyon/"],
  ["/maintenance-industrielle-grenoble/", "/implantations/lyon/grenoble/"],
  ["/maintenance-industrielle-haute-savoie/", "/implantations/lyon/haute-savoie/"],
  ["/maintenance-industrielle-rhone/", "/implantations/lyon/rhone/"],
  ["/maintenance-industrielle-drome/", "/implantations/lyon/valence/"],
  ["/maintenance-industrielle-nantes/", "/implantations/nantes/"],
  ["/maintenance-industrielle-brest/", "/implantations/nantes/brest/"],
  ["/maintenance-industrielle-loire-atlantique/", "/implantations/nantes/loire-atlantique/"],
  ["/maintenance-industrielle-rennes/", "/implantations/nantes/rennes/"],
  ["/maintenance-industrielle-paris/", "/implantations/paris/"],
  ["/maintenance-industrielle-essonne/", "/implantations/paris/essonne/"],
  ["/maintenance-industrielle-rouen/", "/implantations/paris/rouen/"],
  ["/maintenance-industrielle-strasbourg/", "/implantations/strasbourg/"],
  ["/maintenance-industrielle-bas-rhin/", "/implantations/strasbourg/alsace/"],
  ["/maintenance-industrielle-toulouse/", "/implantations/toulouse/"],
  ["/maintenance-industrielle-charente/", "/implantations/toulouse/charente/"],
  ["/maintenance-industrielle-gironde/", "/implantations/toulouse/gironde/"],
  ["/maintenance-industrielle-haute-garonne/", "/implantations/toulouse/haute-garonne/"],
  // Spécialités techniques et types de maintenance.
  ["/maintenance-industrielle-automatisme/", "/expertises/automatisme/"],
  ["/automaticien-schneider/", "/expertises/automatisme/schneider/"],
  ["/automaticien-siemens/", "/expertises/automatisme/siemens/"],
  ["/maintenance-industrielle-hydraulique/", "/expertises/hydraulique/"],
  ["/maintenance-industrielle-mecanique/", "/expertises/mecanique/"],
  ["/maintenance-industrielle-robotique/", "/expertises/robotique/"],
  ["/maintenance-robotique/", "/expertises/robotique/"],
  ["/roboticien-abb/", "/expertises/robotique/abb/"],
  ["/roboticien-fanuc/", "/expertises/robotique/fanuc/"],
  ["/maintenance-industrielle-soudure/", "/expertises/soudure/"],
  ["/maintenance-industrielle-tuyauterie/", "/expertises/tuyauterie/"],
  ["/les-differents-types-de-maintenance-industrielle-la-maintenance-curative-la-maintenance-corrective-la-maintenance-predictive/", "/expertises/types-de-maintenance/"],
  ["/maintenance-predictive-preventive/", "/expertises/types-de-maintenance/maintenance-predictive/"],
  ["/maintenance-preventive-definition-fonctionnement/", "/expertises/types-de-maintenance/maintenance-preventive/"],
  // Pages par secteur client (« technicien de maintenance » + secteur).
  ["/technicien-de-maintenance-aeronautique/", "/secteurs/aeronautique/"],
  ["/technicien-de-maintenance-agroalimentaire/", "/secteurs/agroalimentaire/"],
  ["/technicien-de-maintenance-automobile/", "/secteurs/automobile/"],
  ["/technicien-de-maintenance-industrie-chimique/", "/secteurs/chimie/"],
  ["/technicien-de-maintenance-industrie-lourde/", "/secteurs/industrie-lourde/"],
  ["/technicien-de-maintenance-industrie-metallique/", "/secteurs/industrie-metallique/"],
  ["/technicien-de-maintenance-centre-logistique/", "/secteurs/logistique/"],
  ["/comment-securiser-maintenance-centres-logistiques/", "/secteurs/logistique/peak-season/"],
  ["/technicien-de-maintenance-menuiserie-industrielle/", "/secteurs/menuiserie-industrielle/"],
  ["/certification-cefri/", "/secteurs/nucleaire/"],
  ["/technicien-de-maintenance-industrie-pharmaceutique/", "/secteurs/pharmaceutique/"],
  // Offres de service.
  ["/bureau-etudes-ingenierie/", "/offres/bureau-etudes/"],
  ["/transfert-demenagement-industriel/", "/offres/chantier/"], // à valider : ou /travaux-industriels/transfert-industriel/
  ["/quels-sont-les-avantages-davoir-un-mainteneur-industriel-en-regie/", "/offres/residence/prestataire-ou-salarie/"],
  ["/regie-vs-salarie-le-guide-complet-des-avantages-dun-mainteneur-industriel-pour-votre-entreprise/", "/offres/residence/prestataire-ou-salarie/"],
  ["/retrofit-machine-industriel/", "/offres/retrofit/"],
  // Recrutement, métiers et vie chez Migen : vers Carrière ou la fiche métier.
  ["/femmes-dans-lindustrie-migen-soutient-la-diversite-dans-le-secteur-de-la-maintenance-industrielle/", "/carriere/"],
  ["/migen-la-ou-le-bien-etre-au-travail-nest-pas-juste-un-slogan/", "/carriere/"],
  ["/nos-techniciens/", "/carriere/"], // à valider : ou /nous-connaitre/
  ["/nousrejoindre/", "/carriere/"],
  ["/recrutement-techniciens-de-maintenance-industrielle/", "/carriere/"],
  ["/recrutements/", "/carriere/"],
  ["/recrutement-agent-entretien-industriel/", "/carriere/agent-de-maintenance/"],
  ["/offres-emploi-electricien-automaticien/", "/carriere/automaticien/"],
  ["/recrutement-electromecanicien/", "/carriere/electromecanicien/"],
  ["/quels-sont-les-competences-dun-electromecanicien/", "/carriere/electromecanicien/competences/"],
  ["/recrutement-chef-service-maintenance-industrielle/", "/carriere/responsable-maintenance/"],
  ["/recrutement-technicien-en-robotique/", "/carriere/roboticien/"],
  ["/les-qualites-essentielles-dun-mainteneur-industriel-migen/", "/carriere/technicien-de-maintenance/"],
  ["/comment-devenir-technicien-de-maintenance-industrielle/", "/carriere/technicien-de-maintenance/formation/"],
  ["/quelles-sont-les-competences-cles-necessaires-pour-les-professionnels-de-la-maintenance-industrielle-aujourdhui-et-comment-se-former-efficacement-dans-ce-domaine/", "/carriere/technicien-de-maintenance/formation/"],
  // Articles, guides et fiches de l'ancien blog : vers la ressource du même sujet, sinon le hub.
  ["/guide-maintenance-industrielle/", "/ressources/"],
  ["/tout-savoir-sur-la-maintenance-industrielle/", "/ressources/"],
  ["/category/articles/", "/ressources/articles/"],
  ["/vers-une-france-reindustrialisee-avantages-defis-et-strategies/", "/ressources/articles/"],
  ["/la-digitalisation-des-manuels-de-maintenance-industrielle/", "/ressources/articles/digitalisation-maintenance/"],
  ["/comment-fonctionne-la-gestion-de-maintenance-assistee-par-ordinateur/", "/ressources/articles/gmao/"],
  ["/comment-lintelligence-artificielle-va-impacter-le-secteur-de-la-maintenance-industrielle/", "/ressources/articles/ia-maintenance/"],
  ["/le-futur-de-la-maintenance-industrielle-une-perspective-a-10-ans/", "/ressources/articles/maintenance-4-0/"],
  ["/comment-optimiser-maintenance-industrielle-entreprise/", "/ressources/articles/optimiser-la-maintenance/"],
  ["/comment-faire-plan-de-maintenance-preventive/", "/ressources/articles/plan-de-maintenance/"],
  ["/reussir-son-plan-de-maintenance-industrielle-astuces-et-solutions/", "/ressources/articles/plan-de-maintenance/"],
  ["/comparatif-economique-la-maintenance-predictive-est-elle-plus-avantageuse-que-la-corrective/", "/ressources/articles/predictive-ou-corrective/"],
  ["/maintenance-preventive-corrective-differences/", "/ressources/articles/preventive-ou-corrective/"],
  ["/le-robot-spot-de-boston-dynamics-compagnon-ideal-pour-la-maintenance-dangereuse/", "/ressources/articles/robot-spot/"],
  ["/comment-limiter-le-risque-dun-incendie-et-son-impact-eventuel-lors-doperation-de-maintenance-par-points-chauds-soudage-decoupage-meulage-ebarbage/", "/ressources/fiches-pratiques/permis-de-feu/"],
  ["/tout-savoir-sur-les-automates-programmables-industriels-siemens/", "/ressources/fiches-techniques/automates-siemens/"],
  ["/analyse-performances-maintenance/", "/ressources/fiches-techniques/indicateurs-maintenance/"],
  ["/les-meilleurs-outils-de-diagnostic-pour-une-maintenance-industrielle-efficace/", "/ressources/fiches-techniques/outils-de-diagnostic/"],
  ["/vous-connaissez-lexpression-le-temps-cest-de-largent/", "/ressources/fiches-techniques/trs/"],
  ["/comment-recruter-technicien-maintenance-industrielle/", "/ressources/process/selection-des-techniciens/"],
  // Pages institutionnelles et de conversion.
  ["/accueil-cloned/", "/"], // clone WordPress de l'accueil
  ["/demande-de-devis/", "/contact/"],
  ["/remerciement/", "/contact/"],
  ["/entreprise-de-maintenance/", "/entreprise-maintenance-industrielle/"],
  ["/cgv/", "/mentions-legales/"], // PROVISOIRE, bloquant : republier la page /cgv/ puis retirer cette ligne
  ["/a-propos/", "/nous-connaitre/"], // à valider : /nous-connaitre/ ou /entreprise-maintenance-industrielle/
  ["/migen-une-vision-innovante-de-la-maintenance-industrielle-par-nathan-jorez-ceo/", "/nous-connaitre/"],
  ["/certifications-mase-ecovadis/", "/rse/"],

  // Déjà en base (supabase/import/0003_redirections.sql) : la base l'emporte,
  // ces copies servent quand elle est injoignable. Deux CORRIGENT leur ligne de
  // base, qui vise /offres/maintenance-externalisee/, retirée par la refonte :
  // elles donnent la cible finale. (/nous-rejoindre sans slash : la recherche
  // canonique du proxy le couvre.)
  ["/5s-maintenance-industrielle/", "/ressources/fiches-pratiques/5s/"],
  ["/actualites/", "/ressources/articles/"],
  ["/entreprise-de-maintenance-industrielle/", "/entreprise-maintenance-industrielle/"],
  ["/expert-maintenance-industrielle-externalisee/", "/offres/full-service/"], // corrige la ligne de base qui vise /offres/maintenance-externalisee/
  ["/gestion-dechets-operations-maintenance/", "/ressources/articles/gestion-des-dechets/"],
  ["/jtekt-et-migen-maintenance-industrielle-sur-site/", "/preuves/jtekt/"],
  ["/maintenance-curative-gls-migen-sur-site/", "/preuves/gls-maintenance-curative/"],
  ["/maintenance-industrielle-electrique/", "/expertises/electrique/"],
  ["/maintenance-industrielle-electromecanique/", "/expertises/electromecanique/"],
  ["/maintenance-industrielle-pneumatique/", "/expertises/pneumatique/"],
  ["/maintenance-industrielle/", "/entreprise-maintenance-industrielle/"],
  ["/migen-et-danone-maintenance-continu-sur-site/", "/preuves/danone-lignes-de-production/"],
  ["/migen-et-dimomaint-en-alliance-strategique/", "/partenaires/"], // à valider : /preuves/dimomaint/ existe
  ["/migen-et-suez-remise-en-etat-site-industriel/", "/preuves/suez-remise-en-etat/"],
  ["/migen-savoye-et-dimomaint-une-cooperation-strategique-au-service-de-la-performance-industrielle/", "/partenaires/"], // à valider : /preuves/dimomaint/ existe
  ["/nos-offres/", "/offres/"],
  ["/nous-rejoindre/", "/carriere/"],
  ["/politique-de-confidentialite/", "/confidentialite/"],
  ["/pourquoi-faire-appel-a-une-entreprise-de-maintenance-externalisee/", "/offres/full-service/"], // corrige la ligne de base qui vise /offres/maintenance-externalisee/
  ["/technicien-de-maintenance/", "/carriere/technicien-de-maintenance/"],
];
