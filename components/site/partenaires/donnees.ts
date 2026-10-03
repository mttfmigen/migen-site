/**
 * Données de l'écran « Partenaires », maquette/accueil-rendu.html lignes 6032 à 6126.
 *
 * Les deux partenaires sont des NOMS DE SOCIÉTÉS TIERCES et une date d'accord.
 * Ils ne sont pas inventés, ils sont recopiés de la maquette, mais personne ne
 * les a confirmés côté Migen : afficher un partenariat qui n'existe pas est un
 * risque juridique, pas une coquille. Ils sortent d'ici, en un seul endroit,
 * pour qu'un retrait soit une ligne.
 */

export interface Partenaire {
  /** Raison sociale, telle qu'affichée. */
  nom: string;
  /** Métier du partenaire, en surtitre de carte. */
  domaine: string;
  /** Logo, depuis la racine publique. Vide si le fichier n'est pas rapatrié. */
  logo: string;
  /** Le paragraphe de la carte. */
  corps: string;
}

export const PARTENAIRES: readonly Partenaire[] = [
  {
    nom: "DimoMaint",
    domaine: "GMAO",
    logo: "/assets/logos/dimomaint.png",
    corps:
      "Alliance stratégique signée en 2026 : la GMAO de DimoMaint et nos techniciens sur le même périmètre. Vos interventions sont tracées dans l'outil que vos équipes utilisent déjà.",
  },
  {
    nom: "Savoye",
    domaine: "Intralogistique",
    logo: "/assets/fab/savoye.jpg",
    corps:
      "Partenaire intralogistique : nos techniciens interviennent sur les convoyeurs, trieurs et systèmes automatisés Savoye, avec un seul interlocuteur pour vous.",
  },
];

/**
 * Titre de résultat de recherche, volontairement différent du H1 de la page.
 * Le H1 annonce l'offre au visiteur, le titre dit le sujet au moteur. Repli
 * seulement : la ligne `seo` de la base passe devant quand elle existe.
 */
export const TITRE_SEO_PARTENAIRES =
  "Partenariats industriels Migen, GMAO et intralogistique";

/** H1 de la page, recopié de la maquette. Relu par le contrôle. */
export const TITRE_H1_PARTENAIRES =
  "Nos offres en partenariat, 100 % Made in France.";

/** Ancre du formulaire de la page, celle de tout le site. */
export const ANCRE_FORMULAIRE_PARTENAIRES = "#formulaire";

/** Titre du bloc formulaire de cette page, recopié de la maquette. */
export const TITRE_FORMULAIRE_PARTENAIRES =
  "Un projet qui touche l’un de nos partenaires ? Décrivez-le.";

/** Introduction du bloc formulaire, recopiée de la maquette. */
export const INTRO_FORMULAIRE_PARTENAIRES =
  "Nous vous mettons en relation avec le bon interlocuteur, chez eux ou chez nous.";

/** Identifiant d’analyse des conversions de ce formulaire. */
export const FORMULAIRE_PARTENAIRES = "partenaires";
