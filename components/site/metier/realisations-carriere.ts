/**
 * « Nos réalisations » des pages CARRIÈRE, dc.html L424-428 : la maquette prend
 * d'abord l'entrée de `contenu/site/cas-lies.json` pour la page
 * (`CAS[u] || CAS["/carriere/"]`), et ne retombe sur les six premières études
 * de l'index qu'à défaut. `realisationsLiees` (preuve/) ne connaît que ce
 * repli : sur une fiche métier, elle servait Aktid, Alstef, Amazon là où la
 * maquette montre GLS, Savoye, Soprema (relecture du 15/10).
 *
 * LES LIGNES CI-DESSOUS SONT COPIÉES VERBATIM de `cas-lies.json` (url, client,
 * phrase), les 13 clés `/carriere/…`, aucune autre. Le fichier n'est PAS
 * importé : `.vercelignore` écarte `maquette/contenu/site/*` sauf `index.json`,
 * et l'import ferait tomber le build de Vercel (« Cannot find module »).
 * Aucune clé `/carriere/` (le hub) : le hub garde donc le repli de l'index,
 * comme la maquette.
 */
import {
  realisationsLiees,
  type CarteRealisation,
} from "@/components/site/preuve/donnees-mobiles";
import { logoClient, photosPropres } from "@/components/site/casclients/vues-preuves";

type Ligne = readonly [url: string, client: string, phrase: string];

const CAS_LIES: Readonly<Record<string, readonly Ligne[]>> = {
  "/carriere/agent-de-maintenance/": [
    ["/preuves/alstef-group/", "Alstef Group", "Des chantiers automatisés contrôlés point par point"],
    ["/preuves/amazon-centre-logistique/", "Amazon", "Maintenir un centre logistique qui ne ferme jamais"],
    ["/preuves/amazon-nouveau-site/", "Amazon", "Un dispositif rodé, transposé sur un nouveau site"],
    ["/preuves/atena-port-la-rochelle/", "Atena", "En finir avec les pannes qui reviennent sur un terminal d’engrais"],
  ],
  "/carriere/alternance/": [
    ["/preuves/eiffage/", "Eiffage", "Le préventif d’une centrale photovoltaïque en trois techniciens"],
    ["/preuves/soprema/", "Soprema", "Monter, déplacer, renforcer, chantier après chantier"],
    ["/preuves/vignal-systems/", "Vignal Systems", "Maintenir et monter, de jour comme de nuit"],
    ["/preuves/veepee-sites-lyon/", "Veepee", "Des systèmes intralogistiques au rythme du e-commerce"],
  ],
  "/carriere/automaticien/": [
    ["/preuves/alstef-group/", "Alstef Group", "Des chantiers automatisés contrôlés point par point"],
    ["/preuves/danone-lignes-de-production/", "Danone (Blédina)", "Pas un poste sans maintenance, week-end compris"],
    ["/preuves/dimomaint/", "DimoMaint", "La GMAO planifie, nos techniciens interviennent"],
    ["/preuves/eaton-mise-en-production/", "Eaton", "Six techniciens pour faire démarrer un parc machines"],
  ],
  "/carriere/automaticien/salaire/": [
    ["/preuves/alstef-group/", "Alstef Group", "Des chantiers automatisés contrôlés point par point"],
    ["/preuves/danone-lignes-de-production/", "Danone (Blédina)", "Pas un poste sans maintenance, week-end compris"],
    ["/preuves/dimomaint/", "DimoMaint", "La GMAO planifie, nos techniciens interviennent"],
    ["/preuves/eaton-mise-en-production/", "Eaton", "Six techniciens pour faire démarrer un parc machines"],
  ],
  "/carriere/electromecanicien/": [
    ["/preuves/gls-maintenance-curative/", "GLS", "Des convoyeurs et des trieurs sous surveillance continue"],
    ["/preuves/savoye-migration-automates-norvege/", "Savoye", "Deux automates migrés en deux week-ends, sans arrêter la production"],
    ["/preuves/soprema/", "Soprema", "Monter, déplacer, renforcer, chantier après chantier"],
    ["/preuves/suez-remise-en-etat/", "Suez IWT", "Six mois pour remettre en état un site à risque chimique"],
  ],
  "/carriere/electromecanicien/competences/": [
    ["/preuves/gls-maintenance-curative/", "GLS", "Des convoyeurs et des trieurs sous surveillance continue"],
    ["/preuves/savoye-migration-automates-norvege/", "Savoye", "Deux automates migrés en deux week-ends, sans arrêter la production"],
    ["/preuves/soprema/", "Soprema", "Monter, déplacer, renforcer, chantier après chantier"],
    ["/preuves/suez-remise-en-etat/", "Suez IWT", "Six mois pour remettre en état un site à risque chimique"],
  ],
  "/carriere/electromecanicien/salaire/": [
    ["/preuves/gls-maintenance-curative/", "GLS", "Des convoyeurs et des trieurs sous surveillance continue"],
    ["/preuves/savoye-migration-automates-norvege/", "Savoye", "Deux automates migrés en deux week-ends, sans arrêter la production"],
    ["/preuves/soprema/", "Soprema", "Monter, déplacer, renforcer, chantier après chantier"],
    ["/preuves/suez-remise-en-etat/", "Suez IWT", "Six mois pour remettre en état un site à risque chimique"],
  ],
  "/carriere/responsable-maintenance/": [
    ["/preuves/rector-lesage/", "Rector Lesage", "Un technicien au cœur d’une ligne de préfabrication béton"],
    ["/preuves/stellantis-fonderie-sept-fons/", "Stellantis", "Un parc de fonderie repris en huit semaines"],
    ["/preuves/jtekt/", "JTEKT", "Voir la dérive avant que l’équipement critique ne tombe"],
    ["/preuves/orthus-washtec/", "WashTec", "Des portiques de lavage montés partout en France"],
  ],
  "/carriere/roboticien/": [
    ["/preuves/alstef-group/", "Alstef Group", "Des chantiers automatisés contrôlés point par point"],
    ["/preuves/dimomaint/", "DimoMaint", "La GMAO planifie, nos techniciens interviennent"],
    ["/preuves/gls-maintenance-curative/", "GLS", "Des convoyeurs et des trieurs sous surveillance continue"],
    ["/preuves/jtekt/", "JTEKT", "Voir la dérive avant que l’équipement critique ne tombe"],
  ],
  "/carriere/technicien-de-maintenance/": [
    ["/preuves/stellantis-grand-est/", "Stellantis", "Des dizaines de techniciens pour passer à l’électrique"],
    ["/preuves/soprema/", "Soprema", "Monter, déplacer, renforcer, chantier après chantier"],
    ["/preuves/stellantis-fonderie-sept-fons/", "Stellantis", "Un parc de fonderie repris en huit semaines"],
    ["/preuves/eiffage/", "Eiffage", "Le préventif d’une centrale photovoltaïque en trois techniciens"],
  ],
  "/carriere/technicien-de-maintenance/formation/": [
    ["/preuves/amazon-centre-logistique/", "Amazon", "Maintenir un centre logistique qui ne ferme jamais"],
    ["/preuves/mersen/", "Mersen", "Un automaticien SIEMENS pour démarrer une ligne neuve"],
    ["/preuves/soprema/", "Soprema", "Monter, déplacer, renforcer, chantier après chantier"],
    ["/preuves/la-panetiere/", "La Panetière", "Un renfort pour que le pain sorte chaque matin"],
  ],
  "/carriere/technicien-de-maintenance/salaire/": [
    ["/preuves/suez-remise-en-etat/", "Suez IWT", "Six mois pour remettre en état un site à risque chimique"],
    ["/preuves/atena-port-la-rochelle/", "Atena", "En finir avec les pannes qui reviennent sur un terminal d’engrais"],
    ["/preuves/rector-lesage/", "Rector Lesage", "Un technicien au cœur d’une ligne de préfabrication béton"],
    ["/preuves/ogf-arret-estival/", "OGF", "Un été entier sans trou dans la maintenance"],
  ],
  "/carriere/technicien-itinerant/": [
    ["/preuves/timescope/", "Timescope", "Un parc de casques de réalité virtuelle tenu dans toute la France"],
    ["/preuves/ogf-arret-estival/", "OGF", "Un été entier sans trou dans la maintenance"],
    ["/preuves/dimomaint/", "DimoMaint", "La GMAO planifie, nos techniciens interviennent"],
    ["/preuves/alstef-group/", "Alstef Group", "Des chantiers automatisés contrôlés point par point"],
  ],
};

/** dc.html L428 : `casL.slice(0, 8)`. */
const PLAFOND = 8;

export function realisationsCarriere(chemin: string): CarteRealisation[] {
  const lignes = (CAS_LIES[chemin] ?? []).filter(([url]) => url !== chemin);
  if (lignes.length === 0) return realisationsLiees(chemin);
  return lignes.slice(0, PLAFOND).map(([url, client, titre]) => {
    /* dc.html L427 cherche le logo dans « slug + client » : même clé que
       `realisationsLiees`, même photo propre (vide plutôt que faux). */
    const logo = logoClient(`${url.split("/")[2] ?? ""} ${client}`);
    const photo = photosPropres(url)[0];
    return {
      url,
      client,
      titre,
      logo,
      logoInverse: /groupe-atlantic|ogf/.test(logo),
      photo: photo ? `/assets/web/${photo}.jpg` : "",
    };
  });
}
