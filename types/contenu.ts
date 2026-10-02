/**
 * Forme du contenu d'une page de vente, et donc du jsonb `pages.contenu`.
 *
 * Ce fichier FIXE le format pour tout le projet : l'import du corpus
 * (`../migen-refonte/seo/CONVERSION/`) écrit ces objets, les blocs de
 * `components/site/blocs/` les rendent. Les 116 pages du corpus suivent le même
 * gabarit en dix sections nommées, décrit dans `GABARIT-CONVERSION.md`.
 *
 * DEUX RÈGLES DE CONCEPTION, à tenir en cas d'évolution :
 *
 * 1. Chaque section porte un champ `type` littéral qui la discrimine. C'est lui
 *    qui permet à `components/site/blocs/index.ts` de choisir le bloc sans
 *    deviner, et au compilateur de vérifier que les dix cas sont traités.
 * 2. Seuls les champs que le corpus fournit réellement existent. Pas de champ
 *    spéculatif : un champ qu'aucune page ne remplit se rendrait vide ou, pire,
 *    inciterait à l'inventer. Les écarts connus entre la maquette et le corpus
 *    (fermoir du héros, photo et date d'une réalisation, logos clients) sont
 *    laissés dehors volontairement, et seront ajoutés le jour où une source les
 *    fournit.
 *
 * L'ordre des sections n'est pas porté par les données : il est donné par
 * l'ordre du tableau `sections`, que l'import respecte. Le gabarit interdit de
 * le réarranger.
 */

/** Une puce ou un paragraphe du corpus : bénéfice en gras d'attaque, méthode ensuite. */
export interface Paragraphe {
  /** Le gras d'attaque. Absent, le texte se rend seul. */
  accroche?: string;
  texte: string;
}

/** Un chiffre vérifiable de la bande de réassurance. */
export interface Chiffre {
  /** « 10 % », « + 120 », « 24/24 et 7/7 ». Tel que le corpus l'écrit. */
  valeur: string;
  libelle: string;
  detail?: string;
}

/**
 * Le duo de la section offre : la prestation, et ce qu'elle change.
 *
 * La prestation est un `Paragraphe` parce que le corpus l'écrit toujours ainsi,
 * un intitulé en gras puis son contenu. Le bénéfice, lui, est une phrase seule.
 */
export interface PrestationBenefice {
  prestation: Paragraphe;
  benefice: string;
}

/** Tableau comparatif du corpus. Chaque ligne a autant de cellules que d'en-têtes. */
export interface Tableau {
  entetes: string[];
  lignes: string[][];
}

export interface Etape {
  titre: string;
  texte?: string;
}

/** Une réalisation courte. Le lien pointe vers l'étude de cas quand elle existe. */
export interface Preuve {
  titre: string;
  texte?: string;
  lienLibelle?: string;
  lienHref?: string;
}

export interface Question {
  question: string;
  reponse: string;
}

/** Champs communs aux deux appels à l'action, qui ne diffèrent que par l'habillage. */
interface ChampsCta {
  /** Toujours une question de besoin. Jamais « En savoir plus ». */
  question: string;
  bouton: string;
  /** Le rappel du téléphone, phrase complète. */
  rappel?: string;
  /** Ancre ou chemin visé. Par défaut l'ancre du formulaire de la page. */
  href?: string;
}

/** 1. Héros : la promesse, le mécanisme, l'action. */
export interface SectionHeros {
  type: "heros";
  h1: string;
  /** Comment le résultat est obtenu. Une phrase, parfois deux. */
  mecanisme: string;
  cta: string;
  telephone: string;
  phraseDelai: string;
}

/** 2. Les chiffres clés, puis la réponse directe à la question de la page. */
export interface SectionChiffres {
  type: "chiffres";
  /** Le gabarit en annonce quatre. Une page qui en donne trois fournit son titre. */
  titre?: string;
  bref?: string;
  chiffres: Chiffre[];
  reponse?: Paragraphe[];
}

/** 3. Le problème : la douleur nommée, puis le coût de l'inaction. */
export interface SectionProbleme {
  type: "probleme";
  punchline: string;
  puces: Paragraphe[];
}

/** 4. L'offre : prestations et bénéfices côte à côte. */
export interface SectionOffre {
  type: "offre";
  titre?: string;
  intro?: string;
  lignes: PrestationBenefice[];
  tableau?: Tableau;
  prose?: Paragraphe[];
}

/** 5. Le déroulé, en étapes numérotées. */
export interface SectionDeroule {
  type: "deroule";
  titre?: string;
  intro?: string;
  etapes: Etape[];
}

/** 6. Ce que nous garantissons. Engagements tenables uniquement. */
export interface SectionGaranties {
  type: "garanties";
  titre?: string;
  puces: Paragraphe[];
}

/** 7. L'appel à l'action de milieu de page. */
export interface SectionCta extends ChampsCta {
  type: "cta";
}

/** 8. Les preuves : trois à six réalisations courtes. */
export interface SectionPreuves {
  type: "preuves";
  titre?: string;
  preuves: Preuve[];
}

/** 9. Les objections, en FAQ. */
export interface SectionObjections {
  type: "objections";
  titre?: string;
  questions: Question[];
}

/** 10. L'appel à l'action final, même matière, habillage sombre. */
export interface SectionCtaFinal extends ChampsCta {
  type: "ctaFinal";
}

export type Section =
  | SectionHeros
  | SectionChiffres
  | SectionProbleme
  | SectionOffre
  | SectionDeroule
  | SectionGaranties
  | SectionCta
  | SectionPreuves
  | SectionObjections
  | SectionCtaFinal;

export type TypeSection = Section["type"];

/** Le contenu complet d'une page de vente, dans l'ordre du gabarit. */
export interface ContenuPage {
  sections: Section[];
}
