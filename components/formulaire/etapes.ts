/**
 * LE FORMULAIRE DE CONTACT EN TROIS ÉTAPES, SUR TÉLÉPHONE.
 *
 * Décision de Mehdi, 14/10 : « garde le formulaire, fais-le juste en plusieurs
 * étapes ». Aucun champ ajouté, retiré ni renommé : les étapes ne font que
 * répartir les champs existants, et c'est la validation partagée qui juge
 * chacune. Module pur, sans `"use client"`, pour que `verification.ts` le
 * contrôle sans navigateur.
 *
 * L'étape 1 est le mini-formulaire « Être rappelé » de la maquette mobile v2
 * (dc.html L138 : téléphone et entreprise). L'indicatif suit le numéro : il est
 * dans le même cadre, et une erreur sur lui doit ramener à cette étape.
 */
import {
  OPTIONNELS,
  valideContact,
  type ChampContact,
  type Contact,
  type Erreurs,
} from "./validation";

export const ETAPES: readonly (readonly ChampContact[])[] = [
  ["entreprise", "indicatif", "telephone"],
  ["nom", "prenom", "email"],
  ["message"],
];

export const DERNIERE_ETAPE = ETAPES.length - 1;

/** Le point de bascule du téléphone, le même que la gouttière et les champs à 16 px. */
export const REQUETE_TELEPHONE = "(max-width: 880px)";

/** Les erreurs de `valideContact`, réduites aux seuls champs de l'étape. */
export function erreursDeLEtape(contact: Contact, etape: number): Erreurs {
  const champs = new Set<string>(ETAPES[etape] ?? []);
  return Object.fromEntries(
    Object.entries(valideContact(contact)).filter(([champ]) => champs.has(champ)),
  );
}

/** La première étape qui porte l'une de ces erreurs, ou `null` s'il n'y en a aucune. */
export function premiereEtapeEnErreur(erreurs: Erreurs): number | null {
  const etape = ETAPES.findIndex((champs) => champs.some((champ) => erreurs[champ]));
  return etape === -1 ? null : etape;
}

/**
 * La première étape dont un champ obligatoire est vide : c'est là que le
 * préremplissage d'un panneau court (`EVENEMENT_PREREMPLIR`) amène le visiteur.
 * Rien ne manque : la dernière étape, celle de l'envoi.
 */
export function premiereEtapeIncomplete(contact: Contact): number {
  const etape = ETAPES.findIndex((champs) =>
    champs.some((champ) => !OPTIONNELS.has(champ) && !contact[champ].trim()),
  );
  return etape === -1 ? DERNIERE_ETAPE : etape;
}
