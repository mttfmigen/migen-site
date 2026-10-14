/**
 * Point de branchement de l'événement de conversion vers les plateformes publicitaires.
 *
 * Le formulaire signale une conversion, il n'en envoie aucune. L'envoi réel
 * dépend du consentement publicitaire, qui n'est pas de son ressort : le lot
 * consentement appelle `brancheConversion` quand, et seulement quand, la
 * finalité « publicite » est accordée, et `debrancheConversion` au retrait.
 *
 * Tant que rien n'est branché, `signaleConversion` ne fait rien. C'est l'état
 * par défaut, donc aucun traceur avant consentement.
 */

export interface Conversion {
  /** Identifiant du formulaire envoyé, pour distinguer les objectifs. */
  formulaire: string;
  /** Chemin de la page où l'envoi a eu lieu. */
  page: string;
}

type Ecouteur = (conversion: Conversion) => void;

let ecouteur: Ecouteur | null = null;

/** Appelé par le lot consentement une fois la finalité publicitaire accordée. */
export function brancheConversion(nouvel: Ecouteur): void {
  ecouteur = nouvel;
}

/** Appelé au retrait du consentement : le signal redevient silencieux. */
export function debrancheConversion(): void {
  ecouteur = null;
}

/**
 * Signale une conversion. Sans consentement, l'appel est sans effet.
 *
 * L'erreur d'une plateforme ne doit pas remonter jusqu'au visiteur : son formulaire
 * est déjà parti, il n'a pas à voir un échec de mesure.
 */
/** Le nom d'événement que le conteneur Tag Manager écoute pour la conversion
    Google Ads (« generate_lead », nom recommandé par Google). */
export const EVENEMENT_CONVERSION = "generate_lead";

export function signaleConversion(conversion: Conversion): void {
  /* LE DATALAYER, TOUJOURS : jusqu'au 14/10, rien n'écoutait ce signal en
     production (`brancheConversion` n'était appelé que par la vérification),
     et la bascule aurait coupé à Google Ads les conversions que le WordPress
     lui envoie par Tag Manager. Pousser dans le dataLayer ne fait partir
     AUCUNE requête : seul un conteneur Tag Manager le lit, et il ne se charge
     qu'après le consentement, ses balises suivant le mode consentement. */
  if (typeof window !== "undefined") {
    const fenetre = window as unknown as { dataLayer?: unknown[] };
    fenetre.dataLayer = fenetre.dataLayer ?? [];
    fenetre.dataLayer.push({ event: EVENEMENT_CONVERSION, formulaire: conversion.formulaire, page: conversion.page });
  }
  if (!ecouteur) return;
  try {
    ecouteur(conversion);
  } catch (erreur) {
    console.error("Envoi de la conversion aux plateformes publicitaires :", erreur);
  }
}
