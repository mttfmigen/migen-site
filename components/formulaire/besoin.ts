/**
 * LA VARIANTE « DÉCRIVEZ VOTRE BESOIN » DU HUB /ressources/, ses règles pures.
 *
 * La maquette Ressources v2 (`markup-indent.html` l. 606 à 672, `page-dc.jsx`
 * l. 134) pose un seul champ « Prénom et nom » et une liste « Votre besoin ».
 * Le contrat d'envoi, lui, ne change pas d'une clé : `/api/lead` reçoit
 * toujours `prenom`, `nom` et `message`, et HubSpot les mêmes propriétés. Ce
 * module fait la traduction, et rien d'autre. Sans `"use client"`, pour que
 * `verification.ts` le contrôle sans navigateur.
 */

import { INDICATIFS, valideContact, type Contact, type Erreurs } from "./validation";

/** Les sept choix de la liste, mot pour mot dans la maquette (`besoins`). */
export const BESOINS = [
  "Diagnostic Zéro arrêt",
  "Un technicien en résidence",
  "Un contrat Full service",
  "Un arrêt technique",
  "Des travaux industriels",
  "Une étude (bureau d’études)",
  "Autre besoin",
] as const;

/** Le choix que présélectionnent les boutons « Demander mon diagnostic » (`askDiag`). */
export const BESOIN_DIAGNOSTIC = BESOINS[0];

/**
 * L'événement par lequel un bouton du hub présélectionne un besoin. `detail`
 * porte le libellé ; un libellé hors de la liste est ignoré.
 */
export const EVENEMENT_BESOIN = "migen:besoin";

/**
 * `askDiag` de la maquette : présélectionne « Diagnostic Zéro arrêt » dans le
 * formulaire du hub. À poser sur un lien `href="#rs-form"`, qui fait défiler.
 */
export function demandeDiagnostic(): void {
  window.dispatchEvent(new CustomEvent(EVENEMENT_BESOIN, { detail: BESOIN_DIAGNOSTIC }));
}

export function estBesoin(valeur: unknown): valeur is (typeof BESOINS)[number] {
  return typeof valeur === "string" && (BESOINS as readonly string[]).includes(valeur);
}

/**
 * « Prénom et nom » découpé en deux, règle simple et écrite une fois :
 * le PREMIER MOT est le prénom, TOUT LE RESTE est le nom (« Jean de La
 * Fontaine » donne « Jean » et « de La Fontaine »). Un seul mot est un NOM,
 * et le prénom reste vide. Les espaces multiples comptent pour un.
 */
export function decoupeNomComplet(saisie: string): { prenom: string; nom: string } {
  const mots = saisie.trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return { prenom: "", nom: "" };
  if (mots.length === 1) return { prenom: "", nom: mots[0] };
  return { prenom: mots[0], nom: mots.slice(1).join(" ") };
}

/**
 * Le message envoyé : « Besoin : <choix> » EN TÊTE, puis le message du
 * visiteur s'il en a écrit un, séparé par une ligne vide. Le besoin étant
 * obligatoire, le message n'est jamais vide : la propriété `message`, exigée
 * par le formulaire HubSpot, part toujours renseignée.
 */
export function messageAvecBesoin(besoin: string, message: string): string {
  const texte = message.trim();
  const tete = `Besoin : ${besoin.trim()}`;
  return texte ? `${tete}\n\n${texte}` : tete;
}

/** La saisie du formulaire, champ pour champ comme la maquette le dessine. */
export interface Saisie {
  nomComplet: string;
  entreprise: string;
  email: string;
  indicatif: string;
  telephone: string;
  besoin: string;
  message: string;
}

export type ChampBesoin = "nomComplet" | "entreprise" | "email" | "telephone" | "besoin" | "message";
export type ErreursBesoin = Partial<Record<ChampBesoin, string>>;

export const SAISIE_VIDE: Saisie = {
  nomComplet: "",
  entreprise: "",
  email: "",
  indicatif: INDICATIFS[0].code,
  telephone: "",
  besoin: "",
  message: "",
};

/**
 * UN NOM D'UN SEUL MOT EST REFUSÉ AVANT L'ENVOI, et c'est pour ne pas perdre
 * la demande. Le formulaire HubSpot exige `firstname` (sonde du 13/10, relevée
 * dans `app/api/lead/route.ts`) : un contact sans prénom y serait refusé, et
 * le visiteur verrait un échec qu'il ne pourrait pas corriger. La validation
 * serveur, elle, n'est pas relâchée.
 */
export const PRENOM_MANQUANT = "Prénom et nom : indiquez votre prénom puis votre nom.";

/** La saisie traduite dans le contact du contrat d'envoi, clés inchangées. */
export function versContact(saisie: Saisie): Contact {
  const { prenom, nom } = decoupeNomComplet(saisie.nomComplet);
  return {
    entreprise: saisie.entreprise.trim(),
    prenom,
    nom,
    email: saisie.email.trim(),
    indicatif: saisie.indicatif,
    telephone: saisie.telephone.trim(),
    message: saisie.besoin ? messageAvecBesoin(saisie.besoin, saisie.message) : saisie.message.trim(),
  };
}

/**
 * Le message partagé porte le libellé de `FormulaireContact` (« Adresse
 * e-mail : … ») ; sur ce formulaire, il doit porter celui du champ affiché
 * (« E-mail professionnel : … »), sinon le visiteur cherche un champ absent.
 */
function relibelle(texte: string | undefined, libelle: string): string | undefined {
  return texte?.replace(/^[^:]+ : /, `${libelle} : `);
}

/** Les erreurs de la validation partagée (ou du serveur), ramenées sur les champs de la maquette. */
export function erreursVersChamps(erreurs: Erreurs, saisie: Saisie): ErreursBesoin {
  const { prenom } = decoupeNomComplet(saisie.nomComplet);
  const nomComplet = !(erreurs.nom || erreurs.prenom)
    ? undefined
    : !saisie.nomComplet.trim()
      ? "Prénom et nom : ce champ est obligatoire."
      : !prenom
        ? PRENOM_MANQUANT
        : relibelle(erreurs.nom ?? erreurs.prenom, "Prénom et nom");
  const sortie: ErreursBesoin = {
    nomComplet,
    entreprise: erreurs.entreprise,
    email: relibelle(erreurs.email, "E-mail professionnel"),
    telephone: relibelle(erreurs.telephone ?? erreurs.indicatif, "Téléphone"),
    message: relibelle(erreurs.message, "Votre message"),
  };
  return Object.fromEntries(Object.entries(sortie).filter(([, v]) => v)) as ErreursBesoin;
}

/**
 * La validation de la variante : celle de `FormulaireContact` (`valideContact`)
 * appliquée au contact traduit, plus le besoin, obligatoire. Le besoin rend le
 * message non vide : « Votre message » est donc réellement facultatif.
 */
export function valideBesoin(saisie: Saisie): ErreursBesoin {
  const { message, ...autres } = erreursVersChamps(valideContact(versContact(saisie)), saisie);
  if (estBesoin(saisie.besoin)) return message ? { ...autres, message } : autres;
  // Sans besoin, la validation partagée signale un message vide : la vraie
  // cause est le besoin manquant, le message reste facultatif.
  const besoin = "Votre besoin : choisissez dans la liste.";
  return saisie.message.trim() && message ? { ...autres, besoin, message } : { ...autres, besoin };
}
