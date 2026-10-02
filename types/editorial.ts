/**
 * Forme du contenu d'une page ÉDITORIALE, second gabarit de `pages.contenu`.
 *
 * DEUX GABARITS COHABITENT DANS LA MÊME COLONNE, et c'est assumé :
 *
 *   · le gabarit de VENTE (`types/contenu.ts`) : dix sections nommées, pour les
 *     126 pages qui vendent une offre. Son contenu porte `sections`.
 *   · le gabarit ÉDITORIAL (ici) : pour les 59 pages qui expliquent, listent ou
 *     racontent. Les métiers, les hubs de ressources, l'entreprise. Son contenu
 *     porte `blocs` et un champ `gabarit: "editorial"`.
 *
 * POURQUOI PAS UNE SEULE FORME : le gabarit de vente tire sa force de son ordre
 * imposé, une section par rôle commercial. Une page « Électromécanicien : fiche
 * métier » n'a ni punchline, ni duo prestation-bénéfice, ni garanties. La plier
 * de force au gabarit de vente produirait des sections vides, et le corpus ne
 * les fournit pas. Deux formes honnêtes valent mieux qu'une forme qui ment.
 *
 * La route `app/[...slug]/page.tsx` tranche sur la présence de `blocs`.
 */

import type { Paragraphe, Tableau } from "@/types/contenu";

export type BlocEditorial =
  /**
   * Un titre du corps. Jamais de niveau 1 : le H1 est porté par
   * `pages.titre_h1`, et deux H1 sur une page sont une faute de structure que
   * Google comme les lecteurs d'écran relèvent. L'`id` sert d'ancre.
   */
  | { type: "titre"; niveau: 2 | 3; texte: string; id: string }
  | ({ type: "paragraphe" } & Paragraphe)
  | { type: "liste"; ordonnee?: boolean; items: Paragraphe[] }
  | ({ type: "tableau" } & Tableau)
  /** L'encadré du corpus, écrit en citation Markdown. Un numéro, un rappel. */
  | { type: "citation"; texte: string };

export interface ContenuEditorial {
  gabarit: "editorial";
  /** Le premier paragraphe après le titre. Dit ce que la page couvre. */
  chapeau?: string;
  blocs: BlocEditorial[];
}

/**
 * Le contenu est-il éditorial ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type déclaré,
 * on regarde ce qu'il y a.
 */
export function estEditorial(contenu: unknown): contenu is ContenuEditorial {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    Array.isArray((contenu as ContenuEditorial).blocs)
  );
}
