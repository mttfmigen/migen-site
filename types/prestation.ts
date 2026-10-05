import type { Section } from "./contenu";

/**
 * Forme du contenu d'une page de PRESTATION, gabarit dessiné par
 * « Migen - Gabarit Prestation.dc.html » (projet Claude Design
 * a05a7cf5-b229-4547-bb3e-4dbe5b579983).
 *
 * POURQUOI CE GABARIT EXISTE. Le portage précédent s'est fait depuis
 * « Migen - Site final.dc.html », parce que personne n'avait listé les fichiers
 * du projet de maquette. Il en contient onze dédiés, bien plus riches, et c'est
 * « Gabarit Prestation » qui fait foi pour cette famille. D'où l'écart que le
 * client voyait sans qu'on le trouve.
 *
 * CE QU'IL RÉUTILISE, ET POURQUOI C'EST LE POINT IMPORTANT. Le gabarit dessine
 * douze sections. Le corpus en porte déjà DIX, dans le MÊME ORDRE, avec les
 * mêmes champs : `heros`, `chiffres`, `probleme`, `offre`, `deroule`,
 * `garanties`, `cta`, `preuves`, `objections`, `ctaFinal`. Redéclarer ces dix
 * formes ici aurait dédoublé dix types pour rien : `sections` reprend donc tel
 * quel le tableau de `types/contenu.ts`, et le composant les place aux
 * emplacements que la maquette leur donne.
 *
 * Les deux sections que le corpus n'alimente pas (06 Réassurance, et le
 * bandeau de logos de 02) NE SE RENDENT PAS DU TOUT, sur-titre compris. Voir
 * `docs/RESERVES-CONTENU.md`.
 *
 * L'ORDRE N'EST PAS PORTÉ PAR LES DONNÉES. Contrairement au gabarit de vente,
 * où l'ordre du tableau EST le gabarit, ici l'ordre est celui de la maquette :
 * le composant va chercher chaque section PAR SON TYPE. Deux raisons : la
 * maquette intercale deux sections que le corpus n'a pas, et elle place le
 * formulaire dans le héros, ce qu'un parcours séquentiel ne sait pas faire.
 */

/** Une carte de « Pour aller plus loin ». Chemin interne uniquement. */
export interface LienPrestation {
  libelle: string;
  href: string;
  /** La phrase sous le titre. Absente, la carte se rend sans. */
  phrase?: string;
}

export interface ContenuPrestation {
  gabarit: "prestation";
  /** Les dix sections du corpus. Lues par type, pas par position. */
  sections: Section[];
  /**
   * La pastille de verre au-dessus du H1 : la rubrique de la page.
   *
   * Vient du titre de la page parente dans l'arborescence, donc du corpus.
   * Absente, la rangée de pastilles ne se rend pas : la maquette y ajoute un
   * second libellé (« Astreinte, partout en France ») qu'aucune source ne
   * fournit, et il n'est donc pas porté.
   */
  etiquette?: string;
  /** Section 11, « Pour aller plus loin ». Vide, la section ne se rend pas. */
  liens?: LienPrestation[];
}

/**
 * Garde de lecture du jsonb.
 *
 * `pages.contenu` sort de la base en `unknown` : Postgres n'en garantit que la
 * syntaxe. On tranche sur le discriminant ET sur la présence du tableau de
 * sections, sans quoi une page marquée « prestation » mais vide rendrait un
 * gabarit sans aucune matière.
 */
export function estPrestation(contenu: unknown): contenu is ContenuPrestation {
  if (!contenu || typeof contenu !== "object") return false;
  const candidat = contenu as Partial<ContenuPrestation>;
  return candidat.gabarit === "prestation" && Array.isArray(candidat.sections);
}
