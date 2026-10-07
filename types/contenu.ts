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
  /**
   * Le texte CONTINUE l'accroche dans la même phrase : il garde sa minuscule.
   *
   * MESURÉ, PAS UN STYLE, et c'est une règle de la maquette. Quand le corpus
   * sépare l'accroche du texte par « : » (« **La continuité du poste** :
   * absence ou départ… »), la maquette met une majuscule au texte ; la capture
   * de la page pilote `/offres/residence/` rend bien « Absence ou départ… ».
   * Quand la phrase continue l'accroche sans deux-points (« **Un seul
   * interlocuteur** de l'accueil de votre demande… »), elle le laisse TEL
   * QUEL : la capture de `/bureau-etudes/mise-en-conformite-machine/` rend
   * « de l'accueil de votre demande… », minuscule comprise.
   *
   * La donnée ne porte pas le séparateur du corpus, donc elle porte ce
   * drapeau. ABSENT, le rendu est celui d'avant (majuscule initiale) : les
   * pages déjà portées ne bougent pas. Lu par `GarantiesOffre`, le seul bloc
   * qui applique cette majuscule.
   */
  suitAccroche?: boolean;
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
  /**
   * La photo de la carte, dans `public/assets/web/`. Ajouté le 07/10 pour
   * `/travaux-industriels/` : le rail de `ReferencesOffre` tirait sa photo
   * d'une liste fixe indexée par rang, relevée sur la capture de
   * `/offres/residence/`. Associer la photo d'un chantier SUEZ à l'étude de cas
   * AKTID est une donnée inventée (CLAUDE.md §13). Absent, la liste fixe sert
   * encore : les pages déjà portées ne changent pas.
   */
  photo?: string;
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
  /**
   * Le paragraphe à droite du titre, à la place du bouton.
   *
   * MESURÉ LE 07/10 sur les 210 captures : la maquette porte ce bloc FAQ sur
   * 109 pages, et 108 d'entre elles affichent le bouton « Poser ma question ».
   * UNE SEULE, `/bureau-etudes/`, porte un paragraphe à la place. Le texte
   * était écrit en dur dans le composant, donc inventé sur 108 pages : il
   * descend dans la donnée, et le bouton devient le cas normal.
   */
  chapeau?: string;
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
