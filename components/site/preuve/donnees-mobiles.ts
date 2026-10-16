/**
 * LES DONNÉES MOBILES DU GABARIT 02 (étude de cas), portées du SEUL calcul de
 * la maquette mobile v2 (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`,
 * notée dc.html), jamais rédigées :
 *
 *   L226      `FAM` : le libellé de famille du premier niveau du fil d'Ariane,
 *             verbatim (« Réalisations » pour /preuves/).
 *   L423-428  les réalisations liées d'une page : l'entrée de
 *             `contenu/site/cas-lies.json` pour la page, sinon celle de sa
 *             famille, sinon les six premières études de cas de l'index
 *             (client = libellé court, t = h1). La page courante est écartée.
 *   L490-492  le badge de lecture du héros : `max(2, round(mots / 230))`,
 *             gabarits 01, 02 et 07 seulement, « N min de lecture ».
 *   L495-497  le fil d'Ariane : « Accueil », puis chaque niveau intermédiaire
 *             PRÉSENT dans l'index (libellé de famille au premier niveau,
 *             libellé court ensuite, adresse passée par REMAP), puis la page
 *             courante en texte.
 *
 * `cas-lies.json` N'EST PAS LU, ET C'EST MESURÉ, PAS SUPPOSÉ : le 14/10, ce
 * fichier ne porte AUCUNE clé `/preuves/…`, ni celle de la famille
 * `/preuves/`. Pour une étude de cas, dc.html L425 rend donc toujours vide et
 * L426 s'applique : les six premières études de l'index. L'importer n'aurait
 * rien changé au rendu et aurait ajouté un second fichier de `maquette/` au
 * paquet de production, dossier que `.vercelignore` écarte. La porte
 * `verification-couche-mobile.tsx`, elle, relit `cas-lies.json` à chaque
 * exécution et tombe le jour où une clé `/preuves/` y apparaît.
 *
 * LE LOGO DES CARTES vient du site (`logoClient` de `casclients/vues-preuves.ts`).
 * LA PHOTO est celle de la maquette (L418, `casePhoto` : photo de secteur par
 * empreinte du slug, `photoHerosMobile`), la même que le héros mobile de
 * l'étude : depuis le 15/10 ce héros la prend, et une carte tirée de
 * `photosPropres` répétait sur ALSTEF la photo de son propre héros.
 *
 * MODULE NEUTRE, sans « use client » ni « server-only » : le gabarit serveur
 * l'importe, la porte en ligne de commande aussi.
 */
import indexBrut from "@/maquette/contenu/site/index.json";

import {
  courtLibelle,
  entreeDe,
  gabaritDe,
  REMAP,
  type EntreeIndex,
} from "@/components/site/cocon/maillage-mobile";
import { logoClient, photoHerosMobile } from "@/components/site/casclients/vues-preuves";
import { appliqueDecisions } from "@/lib/decisions-copie";

import { enteteCas } from "./noms-clients";

const INDEX = indexBrut as readonly EntreeIndex[];

/** dc.html L226, verbatim : le libellé de famille du fil d'Ariane. */
export const FAMILLES: Readonly<Record<string, string>> = {
  offres: "Offres",
  expertises: "Expertises",
  secteurs: "Secteurs",
  implantations: "Implantations",
  preuves: "Réalisations",
  ressources: "Ressources",
  carriere: "Carrière",
  "travaux-industriels": "Travaux industriels",
  "bureau-etudes": "Bureau d’études",
  guides: "Guides",
  "a-propos": "À propos",
  "entreprise-maintenance-industrielle": "Migen",
};

/**
 * Le badge « N min de lecture » du héros mobile (dc.html L489-492).
 * `undefined` hors des gabarits 01, 02 et 07, ou sans compte de mots.
 */
export function minutesDeLecture(chemin: string): string | undefined {
  const entree = entreeDe(chemin);
  if (!entree || entree.mots <= 0) return undefined;
  const g = gabaritDe(entree);
  if (g !== "01" && g !== "02" && g !== "07") return undefined;
  return `${Math.max(2, Math.round(entree.mots / 230))} min de lecture`;
}

/** Un niveau du fil d'Ariane, dans la forme que `FilArianeVue` consomme. */
export interface EtapeFilAriane {
  readonly titre: string;
  readonly path: string | null;
}

/**
 * Le fil d'Ariane d'une page, calcul de dc.html L495-497 : « Accueil » est
 * rendu par `FilArianeVue` elle-même, ce tableau porte les niveaux suivants.
 * Un niveau absent de l'index est sauté, comme dans la maquette (`if (by[pth])`).
 * Le dernier élément est la page courante : `FilArianeVue` la rend en texte.
 *
 * `titreCourant` : le H1 que le SITE sert pour cette page. Quand il est donné,
 * il nomme la page courante à la place du libellé court de l'index (L497).
 * L'index est le corpus BRUT de la maquette, que le site a parfois réécrit :
 * pour /preuves/tournaire/, « …machines conçues sur mesure » (mot interdit)
 * est devenu « …conçues en interne » sur la page. Le fil des moteurs
 * (`cocon/FilAriane`, JSON-LD) nomme déjà la page par son H1 : les deux fils
 * disent la même chose.
 */
export function etapesFilAriane(chemin: string, titreCourant?: string): EtapeFilAriane[] {
  const entree = entreeDe(chemin);
  if (!entree || chemin === "/") return [];
  const segments = chemin.split("/").filter(Boolean);
  const etapes: EtapeFilAriane[] = [];
  for (let k = 1; k < segments.length; k++) {
    const pth = `/${segments.slice(0, k).join("/")}/`;
    const niveau = entreeDe(pth);
    if (!niveau) continue;
    etapes.push({
      titre: k === 1 ? (FAMILLES[segments[0]] ?? courtLibelle(niveau)) : courtLibelle(niveau),
      path: REMAP[pth] ?? pth,
    });
  }
  /* dc.html L497, `crumbCur` : famille seule au premier niveau, libellé court
     ensuite. */
  etapes.push({
    titre:
      segments.length === 1
        ? (FAMILLES[segments[0]] ?? courtLibelle(entree))
        : (titreCourant ?? courtLibelle(entree)),
    path: chemin,
  });
  return etapes;
}

/**
 * Le H1 de la maquette MOBILE V3 (16/10, `hero.h1 = caseHead(P.h1).full`) :
 * le h1 du corpus sans « Étude de cas », le client en casse normale,
 * « Aktid : un centre logistique monté en six semaines ». `h1Court` : la
 * ligne « H1 : » des trois fiches du corpus qui en portent une (Savoye,
 * Savoye Norvège, DimoMaint, voir `corpus-mobile.ts`), que la V3 affiche à
 * la place du titre long. Les décisions de copie passent d'abord (Tournaire,
 * Migen Travaux). `undefined` sans entrée d'index : aucun titre n'est deviné.
 */
export function titreMobile(chemin: string, h1Court?: string): string | undefined {
  const brut = h1Court ?? entreeDe(chemin)?.h1;
  if (!brut) return undefined;
  return enteteCas(appliqueDecisions(brut.replace(/\s+/g, " ").trim(), chemin)).complet || undefined;
}

/**
 * Les études dont le corpus pose le paragraphe du résultat APRÈS ses puces
 * (`## LE RÉSULTAT`, relevé le 14/10 sur `maquette/contenu/site/Preuves/` :
 * 20 avant, 7 après, 14 sans). Ailleurs il ouvre la section.
 */
const RESULTAT_TEXTE_APRES: ReadonlySet<string> = new Set([
  "/preuves/aktid-centre-logistique/",
  "/preuves/amazon-centre-logistique/",
  "/preuves/amazon-nouveau-site/",
  "/preuves/gls-maintenance-curative/",
  "/preuves/groupe-atlantic/",
  "/preuves/timescope/",
  "/preuves/veepee-sites-lyon/",
]);

export function texteResultatApres(chemin: string): boolean {
  return RESULTAT_TEXTE_APRES.has(chemin);
}

/** Une carte du carrousel « D’autres réalisations » (dc.html L428, `refs`). */
export interface CarteRealisation {
  readonly url: string;
  /** Le client en casse normale, « Aktid » (V3, `caseHead(…).client`). */
  readonly client: string;
  /** Le titre de l'étude sans le client, « Un centre logistique monté en six
      semaines » (V3, `caseHead(…).t`). */
  readonly titre: string;
  /** Le logo du client, chemin public, ou vide. */
  readonly logo: string;
  readonly logoInverse: boolean;
  /** La photo propre de l'étude, chemin public, ou vide. */
  readonly photo: string;
}

/** dc.html L426 : `.slice(0, 6)`, le repli sur l'index (sous le plafond de
    huit cartes de L428, `casL.slice(0, 8)`). */
const REPLI_INDEX = 6;

/**
 * Les réalisations liées d'une étude de cas (dc.html L425-428), sur le repli
 * de l'index, seul chemin que la maquette emprunte pour /preuves/ (voir
 * l'en-tête). La page courante n'y figure jamais.
 */
export function realisationsLiees(chemin: string): CarteRealisation[] {
  return INDEX.filter((x) => /^\/preuves\/.+/.test(x.url) && x.url !== chemin)
    .slice(0, REPLI_INDEX)
    .map((x) => {
      const court = courtLibelle(x);
      /* dc.html L427 cherche le logo dans « slug + client » : même clé ici. */
      const logo = logoClient(`${x.url.split("/")[2] ?? ""} ${court}`);
      /* V3 (`refs`, `caseHead`) : le client en sur-titre, le titre sans lui. */
      const tete = enteteCas(appliqueDecisions(x.h1.replace(/\s+/g, " ").trim(), x.url));
      return {
        url: x.url,
        client: tete.client || court,
        titre: tete.titre,
        logo,
        logoInverse: /groupe-atlantic|ogf/.test(logo),
        photo: photoHerosMobile(x.url) ?? "",
      };
    });
}
