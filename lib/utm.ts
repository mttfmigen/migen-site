/**
 * Attribution de campagne : les cinq paramètres UTM et la page d'arrivée.
 *
 * Volontairement sans `"use client"` ni `server-only` : le module ne porte que
 * des fonctions, la route serveur réutilise le type et le nettoyage, le
 * navigateur est le seul à appeler celles qui touchent au `sessionStorage`.
 *
 * `sessionStorage` et non `localStorage` : l'attribution appartient à la visite.
 * Une visite plus tard par un autre canal ne doit pas être créditée à l'ancien.
 *
 * Et `sessionStorage` seulement si la finalité publicitaire est accordée : écrire
 * dans le stockage du navigateur pour mesurer une campagne est un traceur, même
 * sans cookie et même si rien ne part vers un tiers. Sans ce consentement,
 * l'attribution reste en mémoire vive, le temps du document.
 */

import { litConsentement } from "@/lib/consentement";

export const CLES_UTM = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type CleUtm = (typeof CLES_UTM)[number];

export type Utm = Partial<Record<CleUtm, string>>;

/** Ce que le navigateur transmet à la soumission : aucune donnée nominative. */
export interface Attribution extends Utm {
  /** Première page de la visite, chemin seul. */
  page_entree?: string;
  /** Page portant le formulaire envoyé, chemin seul. */
  page_conversion?: string;
}

/** Une valeur d'UTM plus longue est une anomalie ou une injection : on coupe. */
const LONGUEUR_MAX_UTM = 200;
const LONGUEUR_MAX_CHEMIN = 300;

const CLE_STOCKAGE = "migen.attribution";

/** Les UTM présents dans une chaîne de requête, nettoyés et bornés. */
export function utmDepuisRequete(search: string): Utm {
  const params = new URLSearchParams(search);
  const trouves: Utm = {};
  for (const cle of CLES_UTM) {
    const valeur = nettoie(params.get(cle), LONGUEUR_MAX_UTM);
    if (valeur) trouves[cle] = valeur;
  }
  return trouves;
}

/**
 * Mémorise l'attribution de la visite, une seule fois.
 *
 * Le premier contact gagne : si la visite a déjà une attribution, une
 * navigation interne (qui perd les UTM) ne doit pas l'effacer, et un clic
 * publicitaire en cours de visite ne doit pas voler le crédit du canal qui a
 * réellement amené le visiteur.
 */
export function memoriseAttribution(url: {
  search: string;
  pathname: string;
}): void {
  if (lit()) return;
  ecrit({
    ...utmDepuisRequete(url.search),
    page_entree: nettoie(url.pathname, LONGUEUR_MAX_CHEMIN),
  });
}

/** L'attribution de la visite, complétée par la page où l'envoi a lieu. */
export function attributionCourante(pathname: string): Attribution {
  return {
    ...lit(),
    page_conversion: nettoie(pathname, LONGUEUR_MAX_CHEMIN),
  };
}

/** Ne garde que les clés attendues : une charge utile reçue n'est pas de confiance. */
export function attributionNettoyee(brut: unknown): Attribution {
  if (typeof brut !== "object" || brut === null) return {};
  const source = brut as Record<string, unknown>;
  const propre: Attribution = {};
  for (const cle of CLES_UTM) {
    const valeur = nettoie(source[cle], LONGUEUR_MAX_UTM);
    if (valeur) propre[cle] = valeur;
  }
  for (const cle of ["page_entree", "page_conversion"] as const) {
    const valeur = nettoie(source[cle], LONGUEUR_MAX_CHEMIN);
    if (valeur) propre[cle] = valeur;
  }
  return propre;
}

function nettoie(valeur: unknown, maximum: number): string | undefined {
  if (typeof valeur !== "string") return undefined;
  const propre = valeur.trim().slice(0, maximum);
  return propre || undefined;
}

// Le stockage lève en navigation privée ou quand le visiteur l'a bloqué.
// Perdre l'attribution n'est pas grave, perdre le formulaire le serait.

/**
 * Attribution de la visite en mémoire vive. C'est le seul support quand la
 * finalité publicitaire n'est pas accordée : elle survit aux navigations
 * internes (le module reste chargé) et disparaît au rechargement, ce qui est
 * exactement ce qu'un refus doit produire.
 */
let enMemoire: Attribution | null = null;

/** La persistance est un traceur : elle attend un consentement explicite. */
function persistanceAutorisee(): boolean {
  return litConsentement()?.choix.publicite === true;
}

function lit(): Attribution | null {
  if (enMemoire) return enMemoire;
  if (!persistanceAutorisee()) return null;
  try {
    const brut = sessionStorage.getItem(CLE_STOCKAGE);
    return brut ? attributionNettoyee(JSON.parse(brut)) : null;
  } catch {
    return null;
  }
}

function ecrit(attribution: Attribution): void {
  // La mémoire vive est toujours renseignée : c'est elle qui alimente le
  // formulaire de la page en cours, consentement ou pas.
  enMemoire = attribution;
  if (!persistanceAutorisee()) return;
  try {
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(attribution));
  } catch {
    // Sans rien faire : le formulaire part quand même, sans attribution.
  }
}
