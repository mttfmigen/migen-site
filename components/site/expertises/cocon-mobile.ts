/**
 * LE COCON MOBILE DES GABARITS EXPERTISES (05, 09, 10) : le chemin de la page
 * et son fil d'Ariane, calculés depuis l'index du corpus, jamais rédigés.
 *
 * POURQUOI CE MODULE EXISTE. La maquette mobile v2 pose sous l'en-tête un fil
 * d'Ariane défilant et, sous le héros, les pastilles du maillage
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, L103 pour le fil,
 * L497-499 pour son calcul). Les deux ont besoin du CHEMIN de la page, que
 * `PageDomaine`, `PageSpecialite` et `PageExpertises` ne reçoivent pas : la
 * route ne leur passe que `formulaire`, qui vaut
 * `cocon${path.replace(/\//g, "-")}` (app/[...slug]/page.tsx). La route est
 * PARTAGÉE par les onze gabarits et d'autres lots l'écrivent en parallèle :
 * on n'y ajoute pas de prop pendant la campagne. Le chemin est donc RETROUVÉ,
 * et seulement contre l'index : l'identifiant est comparé aux 248 adresses
 * publiées, il n'y a aucune devinette possible. Une page hors index rend
 * `undefined`, et les blocs du cocon ne se montent pas, comme la maquette
 * (L498 : rien n'est calculé pour une page hors index).
 *
 * LE FIL D'ARIANE porte le calcul de la maquette, ligne à ligne (L497-499) :
 *   - un niveau par segment d'URL DONT la page existe dans l'index ;
 *   - le libellé du premier niveau vient de `FAM` (la table de la maquette,
 *     portée verbatim), les autres de `courtLibelle` (déjà porté et éprouvé
 *     par `cocon/verification-pastilles.mjs`) ;
 *   - une adresse détournée pointe sa cible (`RM[pth] || pth`).
 * « Accueil » est ajouté par `FilArianeVue`, pas ici : même partage des rôles
 * que sur les gabarits qui la montent déjà (ressource, marques).
 *
 * MODULE NEUTRE, ni « use client » ni « server-only » : même leçon que
 * `blocs/resume-de-section.ts`, le composant serveur l'importe et la porte en
 * ligne de commande aussi.
 */
import indexBrut from "@/maquette/contenu/site/index.json";

import {
  courtLibelle,
  entreeDe,
  REMAP,
  type EntreeIndex,
} from "@/components/site/cocon/maillage-mobile";

const INDEX = indexBrut as readonly EntreeIndex[];

/** `cocon` + chemin aux tirets → chemin, pour les 248 adresses publiées. */
const CHEMIN_PAR_FORMULAIRE: ReadonlyMap<string, string> = new Map(
  INDEX.map((x) => [`cocon${x.url.replace(/\//g, "-")}`, x.url]),
);

/**
 * Le chemin d'une page, retrouvé depuis son identifiant de formulaire.
 *
 * La correspondance est INJECTIVE sur l'index : deux adresses publiées ne
 * produisent jamais le même identifiant (vérifié par la porte, qui recompte
 * les collisions à chaque passage). Hors index : `undefined`, jamais une
 * devinette.
 */
export function cheminDepuisFormulaire(
  formulaire: string,
): string | undefined {
  return CHEMIN_PAR_FORMULAIRE.get(formulaire);
}

/**
 * `FAM` de la maquette mobile (dc.html, recherche `FAM = {`), portée
 * VERBATIM : le libellé du premier niveau du fil d'Ariane.
 */
const FAM: Readonly<Record<string, string>> = {
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

export interface EtapeFil {
  readonly titre: string;
  readonly path: string | null;
}

/**
 * Les niveaux du fil d'Ariane d'un chemin, calcul de la maquette (L497-499),
 * SANS « Accueil » (ajouté par `FilArianeVue`) et AVEC la page courante en
 * dernier niveau, que `FilArianeVue` rend en texte, non cliquable.
 */
export function etapesFilAriane(chemin: string): EtapeFil[] {
  const entree = entreeDe(chemin);
  if (!entree) return [];
  const segments = chemin.split("/").filter(Boolean);
  const etapes: EtapeFil[] = [];
  for (let k = 1; k < segments.length; k++) {
    const pth = `/${segments.slice(0, k).join("/")}/`;
    const niveau = entreeDe(pth);
    if (!niveau) continue; /* L499 : un niveau sans page est sauté. */
    etapes.push({
      titre: k === 1 ? (FAM[segments[0]] ?? courtLibelle(niveau)) : courtLibelle(niveau),
      path: REMAP[pth] ?? pth,
    });
  }
  etapes.push({
    titre:
      segments.length === 1
        ? (FAM[segments[0]] ?? courtLibelle(entree))
        : courtLibelle(entree),
    path: chemin,
  });
  return etapes;
}
