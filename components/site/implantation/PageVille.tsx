/**
 * Gabarit d'une page de VILLE, « Migen - Gabarit 04 Ville.dc.html ».
 *
 * CE FICHIER NE DESSINE RIEN, et c'est le constat du fichier de maquette
 * lui-même : le gabarit 04 (ville) et le gabarit 06 (département) sont le même
 * document, mêmes douze sections dans le même ordre, même markup, même
 * parseur. Ils ne diffèrent que par leur commentaire d'entête et leur jeu
 * d'exemples. Le dessin vit donc une seule fois, dans `PageImplantation`.
 *
 * L'enveloppe existe pour que `app/[...slug]/page.tsx` garde ses deux noms et
 * n'ait pas à être retouché : ce fichier est partagé avec les autres gabarits
 * en cours de portage.
 */
export { default, type ProprietesPageImplantation as ProprietesPageVille } from "./PageImplantation";
