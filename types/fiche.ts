import type { SectionArticle } from "@/types/article";

/**
 * Forme du contenu d'une ÉTUDE DE CAS, gabarit des 28 pages `/preuves/<client>/`.
 *
 * Portée de `maquette/gabarit-02-etude-de-cas.html`, le fichier de gabarit
 * dédié du client. CE FICHIER FAIT FOI.
 *
 * CE QUI A CHANGÉ, ET POURQUOI C'EST TOUT L'OBJET DU CORRECTIF. L'ancienne
 * forme — `surtitre`, `fiche[]`, `images[]`, `contexte`, `intervention`,
 * `resultats[]` — était portée de « Migen - Site final.dc.html », lignes 6126 à
 * 6209, le seul fichier que le client avait envoyé en message. Elle produisait
 * un héros à carte d'identité, une mosaïque de visuels et trois cartes côte à
 * côte. Le gabarit du client ne dessine RIEN DE TOUT CELA : il dessine une
 * SUITE DE SECTIONS NUMÉROTÉES, titre collant à gauche, corps à droite, chacune
 * ancrable. C'est ce que le client regardait quand il a dit que les pages ne
 * ressemblaient toujours pas.
 *
 * La forme est donc celle des sections, la même que l'article : les deux
 * fichiers de gabarit portent le même jeu de motifs de corps, et le corpus des
 * études de cas se range dedans sans perdre une phrase. La correspondance
 * champ par champ est écrite dans `scripts/produit-etudes-de-cas.mjs`, qui
 * fabrique les 28 fichiers de données depuis `supabase/import/fiches-analyse.json`.
 *
 * TOUS LES CHAMPS DE CONTENU SONT OPTIONNELS, et c'est délibéré : ce que le
 * corpus ne fournit pas ne se rend pas, et ne s'invente jamais.
 */
export interface ContenuFiche {
  gabarit: "fiche";
  /**
   * Les sections, dans l'ordre. La maquette les numérote, le rendu aussi.
   *
   * IL N'Y A PAS DE CHAMP `chapeau` : le chapô du corpus est le premier
   * paragraphe de la première section, « Le client et le site », parce que
   * c'est là que le gabarit du client le montre sur sa page témoin. Le héros du
   * gabarit prévoit bien un chapô, et il le laisse vide. Un champ de plus
   * aurait rendu le même texte à deux endroits selon qui lit.
   */
  sections?: SectionArticle[];
}

/**
 * Le contenu est-il une étude de cas ?
 *
 * Lu sur un `jsonb`, donc sur de l'`unknown` : on ne se fie pas au type
 * déclaré, on regarde ce qu'il y a. Le champ discriminant suffit, aucun champ
 * de contenu n'étant obligatoire.
 */
export function estFiche(contenu: unknown): contenu is ContenuFiche {
  return (
    !!contenu &&
    typeof contenu === "object" &&
    (contenu as ContenuFiche).gabarit === "fiche"
  );
}
