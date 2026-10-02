/**
 * Forme du contenu d'une page IMPLANTATIONS, troisième gabarit de
 * `pages.contenu`.
 *
 * POURQUOI UN TROISIÈME GABARIT. `/implantations/` et ses 42 pages filles ne
 * vendent pas une offre et ne racontent pas un métier : elles répondent à une
 * seule question, « depuis où intervenez-vous chez moi ». La maquette leur donne
 * sa propre mise en page, des cartes d'agences et un maillage de villes et de
 * départements. Pliées au gabarit de vente, ces pages affichaient une punchline
 * et des garanties qu'aucune d'elles ne porte.
 *
 * COMME LES DEUX AUTRES, le contenu porte un champ `gabarit` littéral, et la
 * route `app/[...slug]/page.tsx` tranche dessus. Tout le reste est OPTIONNEL :
 * une section dont le corpus ne fournit pas les données ne se rend pas. Aucun
 * repli, aucun texte de remplissage. Les surtitres et les libellés de structure
 * (« Rayon », « Rôle », « Villes ») sont dans le composant : ils ne varient pas
 * d'une page à l'autre, et les exposer en données aurait invité à les réécrire.
 */

/** Un lien du maillage de bas de page. La cible est un chemin INTERNE. */
export interface LienImplantation {
  libelle: string;
  /** Chemin interne, slash final. Une cible externe est rendue en texte. */
  href: string;
}

/**
 * Un chiffre de la bande de réassurance.
 *
 * `Chiffre` de `types/contenu.ts` n'est pas réutilisé : il porte un `detail`
 * que cette bande n'affiche pas, et un champ qu'un gabarit laisse tomber en
 * silence est un champ que l'import remplira pour rien.
 */
export interface ChiffreImplantation {
  /** « 4 », « 1 h », tel que le corpus l'écrit. */
  valeur: string;
  libelle: string;
  /** Vrai pour le chiffre mis en orange. La maquette en accentue un seul. */
  accent?: boolean;
}

export interface AgenceImplantation {
  nom: string;
  /** « Siège », « International ». Pastille orange en capitales. */
  badge?: string;
  /** Le lieu court, sous le nom. « Québec, Canada ». */
  lieu?: string;
  /** Une ligne par adresse postale. Rendues l'une sous l'autre. */
  adresses?: string[];
  /** Le territoire couvert. */
  rayon?: string;
  /** Ce que l'agence fait. */
  role?: string;
  /**
   * Le siège : carte anthracite sur toute la largeur, au lieu d'une carte en
   * verre sur une colonne. C'est la seule différence de rendu.
   */
  siege?: boolean;
}

/** Un bureau listé dans le panneau international. */
export interface BureauImplantation {
  nom: string;
  /** Adresse puis zone couverte, une ligne chacune. */
  lignes: string[];
}

export interface PanneauInternational {
  titre?: string;
  texte?: string;
  /** La photo de gauche. `alt` vide si elle n'est que décorative. */
  image?: { src: string; alt: string };
  bureaux?: BureauImplantation[];
}

export interface ContenuImplantations {
  gabarit: "implantations";
  /** Le paragraphe du héros, sous le H1. */
  chapeau?: string;
  chiffres?: ChiffreImplantation[];
  /** Le H2 de la section des agences. */
  titreAgences?: string;
  agences?: AgenceImplantation[];
  international?: PanneauInternational;
  /** Le maillage de la page : villes et départements couverts. */
  couverture?: {
    titre?: string;
    villes?: LienImplantation[];
    departements?: LienImplantation[];
  };
}

/**
 * Le contenu est-il celui d'une page d'implantations ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde le discriminant.
 */
export function estImplantations(
  contenu: unknown,
): contenu is ContenuImplantations {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuImplantations).gabarit === "implantations"
  );
}
