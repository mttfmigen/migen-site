/**
 * « TOUT LE SITE » : le répertoire des familles de pages de la maquette V3
 * « Site mobile », posé sur l'accueil juste avant le formulaire.
 *
 * PORTÉ DU SEUL CALCUL DE LA V3 (`DIR`, composant 9d8a3bdb, relevé le 16/10) :
 * huit familles reconnues au premier segment de l'adresse, les pages de
 * premier et de second niveau de l'index du corpus
 * (`maquette/contenu/site/index.json`), sans les adresses que la maquette
 * détourne (`REMAP`), chacune sous son libellé court (`courtLibelle`, qui
 * applique les décisions de copie : « Migen Travaux », « Nous rejoindre »…).
 * Rien n'est rédigé ici.
 *
 * CE QUI DIFFÈRE DE LA V3, et pourquoi :
 *  - aucun nombre de pages à côté d'une famille (Mehdi a fait retirer ces
 *    compteurs) ;
 *  - la famille « Carrière » s'appelle « Nous rejoindre », le libellé du site ;
 *  - une adresse qui est la SOURCE D'UNE REDIRECTION n'est pas listée (les
 *    cinq rubriques de ressources passées en 301 le 14/10) : un lien du
 *    répertoire répond 200 ;
 *  - « Nos offres » suit la grille de l'accueil (`OFFRES_ACCUEIL`, sans
 *    « migen© » devant, comme la V3), puis « Toutes les offres » ;
 *  - « Migen » ajoute, comme la V3, les trois pages qui ne sont pas dans
 *    l'index, à leur adresse sur le site (/nous-connaitre/, /valeurs/, /rse/).
 *
 * MODULE NEUTRE : le composant serveur et la porte en ligne de commande le
 * lisent tous deux.
 */
import { courtLibelle, REMAP, type EntreeIndex } from "@/components/site/cocon/maillage-mobile";
import { cheminNormalise, REDIRECTIONS_CODE } from "@/lib/redirections";
import indexBrut from "@/maquette/contenu/site/index.json";

import { LIENS, OFFRES_ACCUEIL } from "./GrilleOffres";

export interface LienRepertoire {
  libelle: string;
  href: string;
}

export interface FamilleRepertoire {
  libelle: string;
  liens: LienRepertoire[];
}

const INDEX = indexBrut as readonly EntreeIndex[];

/** dc.html `DIR` : la famille et les premiers segments qu'elle regroupe. */
const FAMILLES: readonly (readonly [string, readonly string[]])[] = [
  ["Expertises métiers", ["expertises"]],
  ["Expertises sectorielles", ["secteurs"]],
  ["Nos implantations", ["implantations"]],
  ["Nos réalisations", ["preuves"]],
  ["Ressources", ["ressources", "guides"]],
  ["Nous rejoindre", ["carriere"]],
  ["Migen", ["a-propos", "entreprise-maintenance-industrielle"]],
];

/** Les pages natives de la V3 (`__MGNATIVE`), absentes de l'index. */
const PAGES_MIGEN_HORS_INDEX: readonly LienRepertoire[] = [
  { libelle: "Nous connaître", href: "/nous-connaitre/" },
  { libelle: "Nos valeurs", href: "/valeurs/" },
  { libelle: "Nos engagements RSE", href: "/rse/" },
];

const estRedirigee = (href: string) => REDIRECTIONS_CODE.has(cheminNormalise(href));

function pagesDe(segments: readonly string[]): LienRepertoire[] {
  return INDEX.filter((x) => {
    const q = x.url.split("/").filter(Boolean);
    return segments.includes(q[0] ?? "") && q.length <= 2 && !REMAP[x.url];
  }).map((x) => ({ libelle: courtLibelle(x), href: x.url }));
}

export function familles(): FamilleRepertoire[] {
  const offres: FamilleRepertoire = {
    libelle: "Nos offres",
    liens: [
      ...OFFRES_ACCUEIL.map((o) => ({ libelle: o.titre.replace(/^migen© /, ""), href: LIENS[o.cle] })),
      { libelle: "Toutes les offres", href: "/offres/" },
    ],
  };
  const autres = FAMILLES.map(([libelle, segments]) => ({
    libelle,
    liens: [...pagesDe(segments), ...(libelle === "Migen" ? PAGES_MIGEN_HORS_INDEX : [])],
  }));
  return [offres, ...autres]
    .map((f) => ({ ...f, liens: f.liens.filter((l) => !estRedirigee(l.href)) }))
    .filter((f) => f.liens.length > 0);
}
