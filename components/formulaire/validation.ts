/**
 * Validation partagée par le navigateur et par la route serveur.
 *
 * Un seul jeu de règles, appelé deux fois : le visiteur voit ses erreurs sans
 * aller-retour, et le serveur ne fait jamais confiance à ce qu'il reçoit. Le
 * module reste pur, sans `"use client"`, pour que la route puisse l'importer.
 */

/**
 * Nom du champ piège, partagé par le formulaire qui le pose et par la route qui
 * le lit. Il ressemble à un champ ordinaire, et c'est tout l'intérêt : un robot
 * remplit ce qu'il trouve, une personne ne le voit pas. Il ne fait pas partie
 * des champs du contact et n'est jamais transmis à HubSpot.
 */
export const CHAMP_PIEGE = "site_web";

export const CHAMPS_CONTACT = [
  "entreprise",
  "prenom",
  "nom",
  "email",
  "indicatif",
  "telephone",
  "message",
] as const;

export type ChampContact = (typeof CHAMPS_CONTACT)[number];

export type Contact = Record<ChampContact, string>;

export type Erreurs = Partial<Record<ChampContact | "formulaire", string>>;

/**
 * Indicatifs proposés, dans l'ordre de la maquette.
 *
 * C'est une liste FERMÉE, et c'est ce qui la rend utile : le champ arrive du
 * navigateur comme tous les autres, donc la route le revalide contre cette même
 * liste. Un indicatif inventé est refusé plutôt que concaténé au numéro et
 * poussé dans HubSpot. Les six pays sont ceux que la maquette propose, qui
 * couvrent les quatre agences et leurs voisins francophones.
 */
export const INDICATIFS = [
  { code: "+33", libelle: "FR +33" },
  { code: "+32", libelle: "BE +32" },
  { code: "+41", libelle: "CH +41" },
  { code: "+34", libelle: "ES +34" },
  { code: "+1", libelle: "CA +1" },
  { code: "+971", libelle: "AE +971" },
] as const;

const CODES_CONNUS: ReadonlySet<string> = new Set(
  INDICATIFS.map((i) => i.code),
);

export const CONTACT_VIDE: Contact = {
  entreprise: "",
  prenom: "",
  nom: "",
  email: "",
  indicatif: INDICATIFS[0].code,
  telephone: "",
  message: "",
};

/** Bornes de longueur, assez larges pour un usage réel, assez serrées pour borner la charge utile. */
const LONGUEURS: Record<ChampContact, number> = {
  entreprise: 120,
  prenom: 60,
  nom: 60,
  email: 180,
  indicatif: 5,
  telephone: 30,
  message: 2000,
};

/* Aucun champ optionnel, et c'est l'UNIQUE endroit où cela se décide : le
   formulaire lit cet ensemble pour poser `required`, et la validation le lit
   pour exiger une valeur. Le formulaire portait sa propre liste, les deux ont
   divergé, et un champ s'est retrouvé obligatoire à la validation sans l'être à
   la saisie.

   Aucun champ optionnel : la maquette validée marque les six visibles
   `required`, message compris. Le message était optionnel ici, par une décision
   prise sans la maquette sous les yeux (« un industriel en panne appelle, il ne
   rédige pas ») ; la maquette tranche, et c'est elle qui fait foi. */
export const OPTIONNELS: ReadonlySet<ChampContact> = new Set<ChampContact>();

/** Validation suffisante côté formulaire : seul l'envoi réel prouve qu'une adresse existe. */
const FORME_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Chiffres, espaces, points, tirets, parenthèses et un éventuel indicatif. */
const FORME_TELEPHONE = /^\+?[\d\s.\-()]{9,}$/;

/** Identifiant de formulaire : un slug, pour qu'il serve de clé d'analyse. */
const FORME_FORMULAIRE = /^[a-z0-9-]{2,40}$/;

const LIBELLES: Record<ChampContact, string> = {
  entreprise: "Entreprise",
  prenom: "Prénom",
  nom: "Nom",
  email: "Adresse e-mail",
  indicatif: "Indicatif",
  telephone: "Téléphone",
  message: "Message",
};

/** Les erreurs du contact. Un objet vide signifie que la saisie est acceptable. */
export function valideContact(contact: Contact): Erreurs {
  const erreurs: Erreurs = {};

  for (const champ of CHAMPS_CONTACT) {
    const valeur = contact[champ].trim();
    if (!valeur) {
      if (!OPTIONNELS.has(champ)) {
        erreurs[champ] = `${LIBELLES[champ]} : ce champ est obligatoire.`;
      }
      continue;
    }
    if (valeur.length > LONGUEURS[champ]) {
      erreurs[champ] =
        `${LIBELLES[champ]} : ${LONGUEURS[champ]} caractères au maximum.`;
    }
  }

  const email = contact.email.trim();
  if (email && !erreurs.email && !FORME_EMAIL.test(email)) {
    erreurs.email = "Adresse e-mail : le format attendu est nom@domaine.fr.";
  }

  if (!erreurs.indicatif && !CODES_CONNUS.has(contact.indicatif.trim())) {
    erreurs.indicatif = "Indicatif : choisissez un pays dans la liste.";
  }

  const telephone = contact.telephone.trim();
  if (telephone && !erreurs.telephone && !FORME_TELEPHONE.test(telephone)) {
    erreurs.telephone = "Téléphone : au moins neuf chiffres, indicatif accepté.";
  }

  return erreurs;
}

/**
 * Le numéro tel qu'il part vers HubSpot : indicatif, espace, numéro.
 *
 * Une seule fonction, appelée par la route, pour que la forme du numéro ne
 * dépende pas de la façon dont le visiteur a tapé autour.
 */
export function numeroComplet(contact: Contact): string {
  return `${contact.indicatif.trim()} ${contact.telephone.trim()}`.trim();
}

export function aDesErreurs(erreurs: Erreurs): boolean {
  return Object.keys(erreurs).length > 0;
}

/**
 * Reconstruit un contact à partir d'une charge utile reçue, puis le valide.
 *
 * Un champ absent devient une chaîne vide, donc une erreur de champ obligatoire :
 * le serveur répond la même chose pour « manquant » et pour « vide ».
 */
export function valideCharge(brut: unknown): {
  contact: Contact;
  formulaire: string;
  erreurs: Erreurs;
} {
  const source =
    typeof brut === "object" && brut !== null
      ? (brut as Record<string, unknown>)
      : {};

  const contact = CHAMPS_CONTACT.reduce<Contact>(
    (acc, champ) => ({
      ...acc,
      [champ]: typeof source[champ] === "string" ? source[champ].trim() : "",
    }),
    CONTACT_VIDE,
  );

  const formulaire =
    typeof source.formulaire === "string" ? source.formulaire.trim() : "";

  const erreurs = valideContact(contact);
  if (!FORME_FORMULAIRE.test(formulaire)) {
    erreurs.formulaire = "Type de formulaire inconnu.";
  }

  return { contact, formulaire, erreurs };
}
