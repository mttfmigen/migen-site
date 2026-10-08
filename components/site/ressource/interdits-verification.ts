/**
 * Ce que le contrat interdit de rendre (CLAUDE.md §9 et règles client du
 * README). Une phrase qui en porte un ne se reformule pas : elle est retirée
 * et déclarée dans `retraits`. Le contrôle relit la même liste sur le rendu.
 *
 * Partagé par le producteur (`maquette-ressource.ts`) et le contrôle
 * (`verification-ressource.tsx`). Le nom porte « verification » : ce sont des
 * motifs de contrôle, pas de la copie, et `scripts/verifie-interdits.mjs` ne lit
 * pas ces fichiers.
 */
export const INTERDITS: RegExp[] = [
  /—/,
  /\b24 ?h(eures?)?\b|24 ?\/ ?24/i,
  /7 ?j ?\/ ?7/i,
  /\brégie\b/i,
  /intérim/i,
  /mise à disposition/i,
  /sans engagement/i,
  /clés? en main/i,
  /sur mesure/i,
  /\blevier/i,
  /concrètement/i,
  /notamment/i,
  /incontournable/i,
  /découvrez/i,
  /limonest/i,
  /teamtailor/i,
  // Jamais « réguliers » à côté de clients, au singulier comme au pluriel.
  /clients?[^.!?]{0,60}\brégul(ier|iers|ière|ières)\b|\brégul(ier|iers|ière|ières)\b[^.!?]{0,40}clients?/i,
  // En France, des hubs : une agence locale ne se rend pas.
  /\ben agence\b|\bvotre agence\b|\bagences? en france\b/i,
];
