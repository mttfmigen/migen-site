/* FICHIER GÉNÉRÉ par scripts/produit-cadrage-photos.mjs. Ne pas éditer. */

/**
 * Le cadrage d'une photo dans son emplacement.
 *
 * LE DÉFAUT QUE CE MODULE CORRIGE, mesuré le 09/10/2026. Le registre des photos
 * déclare l'orientation de chacune, et aucune ligne du site ne lisait ce champ :
 * 137 des 148 emplacements de photo portrait étaient posés dans un cadre couché,
 * en `objectFit: cover` sans `objectPosition`, donc recadrés sur leur bande
 * MÉDIANE. 123 placements perdaient la moitié de l'image ou plus, sur 92 pages,
 * et sur une photo de personne la bande médiane tombe sur le torse, pas sur le
 * visage. L'emplacement le plus destructeur, `offre/ReferencesOffre.tsx`, porte
 * à lui seul 951 placements dans un cadre de ratio 2,13.
 *
 * LE REMÈDE, décidé par Mehdi le 09/10 (« tu cadres »), ne retire aucune photo :
 * une photo PORTRAIT dans un cadre COUCHÉ est cadrée sur le haut de l'image.
 * 30 % et non 0 % : à 0 % le sujet est collé au bord haut, ce qui coupe les
 * pieds d'un plan large et donne une composition sans air. 30 % garde le visage
 * et le buste dans le cadre sur les trois quarts des prises de vue de la banque,
 * qui sont des plans taille ou poitrine.
 *
 * Une photo paysage dans un cadre couché n'est pas concernée : son recadrage
 * est marginal, et le centre reste le meilleur choix.
 */

/** Les 31 photos de la banque dont la hauteur dépasse la largeur. */
const PORTRAITS: ReadonlySet<string> = new Set([
  "aero-reacteur-capot-combinaison.jpg",
  "agro-technicienne-raccord-clamp.jpg",
  "automatisme-armoire-jeune-tablette.jpg",
  "elec-local-technicien-accroupi.jpg",
  "elec-main-disjoncteurs-borniers.jpg",
  "energie-levage-eolienne-senior.jpg",
  "env-inspection-de-bois-24-sept-2026.jpg",
  "env-photos-industrie-4.jpg",
  "env-reparation-moteur-avion.jpg",
  "env-robotic-arms-welding-car-frames.jpg",
  "env-workers-inspecting-large-vats-in-a-manufacturi.jpg",
  "equipe-transmission-senior-jeune.jpg",
  "il-mechanic-working-in-warehouse-2.jpg",
  "il-technicien-maintenance-en-securite-mar-23-2026-2.jpg",
  "il-technicien-maintenance-jan-7-2026-1600.jpg",
  "il-technicien-maintenance-photo-16-800.jpg",
  "il-technicien-maintenance-photo-3-1600.jpg",
  "il-technicienne-mecanique-photo-avril-2026-1600.jpg",
  "levage-montage-poteau-charpente.jpg",
  "meca-cle-bride-carter.jpg",
  "meca-jeune-presse-volant.jpg",
  "metal-technicienne-bobines-acier.jpg",
  "nucleaire-tour-aerorefrigerante.jpg",
  "pneu-pince-axe-lineaire.jpg",
  "robot-cellule-soudure-inspection.jpg",
  "robot-palettiseur-fin-de-ligne.jpg",
  "robot-poignet-technicien-casque.jpg",
  "robot-portable-diagnostic-cellule.jpg",
  "soudure-brossage-meuleuse-etau.jpg",
  "soudure-soudeuse-masque-releve.jpg",
  "tuyau-vanne-volant-conserverie.jpg"
]);

/** Le nom de fichier d'un chemin de photo, les paramètres de requête écartés. */
function fichierDe(src: string): string {
  const sansRequete = src.split("?")[0] ?? src;
  return sansRequete.split("/").pop() ?? sansRequete;
}

/** Une photo de la banque est-elle plus haute que large ? */
export function estPortrait(src: string | undefined): boolean {
  return typeof src === "string" && PORTRAITS.has(fichierDe(src));
}

/**
 * L'`objectPosition` à poser sur une photo, ou `undefined` quand le centre
 * convient. `ratioCadre` est la largeur du cadre divisée par sa hauteur.
 *
 * Le seuil de 1,2 n'est pas arbitraire : en dessous, le cadre est à peu près
 * aussi haut que large et un portrait n'y perd presque rien.
 */
export function cadragePhoto(src: string | undefined, ratioCadre: number): string | undefined {
  return estPortrait(src) && ratioCadre >= 1.2 ? "50% 30%" : undefined;
}
