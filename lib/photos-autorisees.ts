/**
 * LES PHOTOS QU'UNE PAGE A LE DROIT DE SERVIR.

 * IL VIT DANS `lib/` ET NON DANS `scripts/`, et ce n'est pas un rangement :
 * `.vercelignore` exclut `scripts/` du déploiement, alors que six composants
 * `verification-*.tsx` importent ce module et que Next les typecheck au build.
 * Les builds déclenchés par GitHub échouaient donc tous sur
 * « Cannot find module '@/scripts/photos-autorisees' », pendant que les
 * déploiements manuels passaient, parce que `--archive` n'applique pas
 * `.vercelignore`. Deux mises en ligne automatiques perdues avant de le voir.
 *
 * ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
 * =====================================================================
 * Jusqu'ici une seule source d'images faisait foi : les octets embarqués dans
 * `maquette/site-final-autonome.html`. C'était juste tant que le site n'avait
 * pas d'images à lui. Ce n'est plus le cas, et la règle est devenue fausse pour
 * deux raisons mesurées le 09/10 par `node scripts/mesure-photos-site.mjs` :
 *
 *  - la maquette ne sert que 68 photos distinctes pour 1 822 emplacements ;
 *    `team-duo.jpg` est servie 133 fois, `team-grind-front.jpg` 132 fois,
 *    `ph-hero-raffinerie.jpg` 125 fois, et 130 pages affichent DEUX FOIS la
 *    même photo. Mehdi le voit, et c'est le défaut le plus visible du site ;
 *  - les 109 photos achetées sous licence le 08/10, décrites dans
 *    `public/assets/photos/registre.json`, n'étaient servies par AUCUNE page.
 *
 * Les six portes qui exigeaient les OCTETS de la maquette acceptent désormais
 * « la photo que la maquette calcule pour cet emplacement OU une photo de la
 * répartition » : `verification-preuve`, `verification-carriere`,
 * `verification-specialite`, `verification-domaine`, `verification-ville`,
 * `verification-secteurs-hub`. Elles gardent leur capacité à refuser : une
 * photo qui ne vient ni de la maquette ni de la répartition tombe toujours, et
 * chacune en fait la preuve par un témoin.
 *
 * LA RÉPARTITION, C'EST DEUX ENSEMBLES FERMÉS, et rien d'autre :
 *  1. les 109 photos de `registre.json`, reconnues à leur sha256 ; une photo
 *     posée dans `public/assets/photos/` sans entrée au registre est refusée,
 *     et une entrée au registre dont les octets ont changé est refusée aussi ;
 *  2. les 10 photos de l'ÉQUIPE MIGEN (`team-*`, `sv-*`), nommées ici une par
 *     une. Elles montrent de vrais techniciens Migen en t-shirt « migen », ce
 *     qu'aucune photo de banque ne fait : elles restent servies, mais réparties
 *     comme les autres au lieu d'être répétées cent fois.
 *
 * Qui pose la répartition : `bun scripts/repartit-photos.ts --applique`.
 * Qui la mesure : `node scripts/mesure-photos-site.mjs`.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const RACINE = fileURLToPath(new URL("..", import.meta.url));

/** Le dossier public des photos sous licence, barres comprises. */
export const DOSSIER_REGISTRE = "/assets/photos/";

export interface PhotoRegistre {
  fichier: string;
  lien_envato: string;
  titre: string;
  description: string;
  orientation: "paysage" | "portrait";
  themes: string[];
  licence: string;
  sha256: string;
}

export const REGISTRE: readonly PhotoRegistre[] = JSON.parse(
  readFileSync(join(RACINE, "public", "assets", "photos", "registre.json"), "utf8"),
) as PhotoRegistre[];

if (REGISTRE.length === 0) {
  throw new Error("public/assets/photos/registre.json est vide : lecture cassée, aucune photo ne serait autorisée");
}

/** Le chemin public d'une photo du registre. */
export const cheminRegistre = (fichier: string) => `${DOSSIER_REGISTRE}${fichier}`;

const PAR_CHEMIN = new Map(REGISTRE.map((p) => [cheminRegistre(p.fichier), p]));

/**
 * Les 10 photos de l'équipe Migen. Liste CLOSE et nommée : une onzième photo
 * glissée dans `public/assets/web/` sous un nom en `team-` ou `sv-` ne passe
 * pas par là. Elles vivent dans la maquette, leurs octets sont donc déjà
 * vérifiés par les portes qui lisent la table de ressources de l'autonome.
 */
export const PHOTOS_MIGEN: readonly string[] = [
  "/assets/web/sv-armoire.jpg",
  "/assets/web/sv-convoyeur.jpg",
  "/assets/web/sv-duo-impact.jpg",
  "/assets/web/sv-portrait.jpg",
  "/assets/web/team-duo.jpg",
  "/assets/web/team-electric.jpg",
  "/assets/web/team-grind-close.jpg",
  "/assets/web/team-grind-front.jpg",
  "/assets/web/team-grind-impact.jpg",
  "/assets/web/team-grind-sparks.jpg",
];

const MIGEN = new Set(PHOTOS_MIGEN);

const sha256 = (fichier: string) => createHash("sha256").update(readFileSync(fichier)).digest("hex");

/** Mémo : une porte interroge le même chemin des centaines de fois. */
const VERDICTS = new Map<string, boolean>();

/** Au registre, et les octets du fichier sont bien ceux que le registre atteste. */
export function estDuRegistre(chemin: string): boolean {
  const connu = VERDICTS.get(chemin);
  if (connu !== undefined) return connu;
  const photo = PAR_CHEMIN.get(chemin);
  const fichier = photo ? join(RACINE, "public", DOSSIER_REGISTRE, photo.fichier) : "";
  const verdict = Boolean(photo) && existsSync(fichier) && sha256(fichier) === photo!.sha256;
  VERDICTS.set(chemin, verdict);
  return verdict;
}

/** Une des dix photos de l'équipe Migen, et le fichier est là. */
export function estPhotoMigen(chemin: string): boolean {
  return MIGEN.has(chemin) && existsSync(join(RACINE, "public", chemin));
}

/**
 * LA RÈGLE que les six portes appliquent : ce chemin fait-il partie de la
 * répartition du 09/10 ? Tout le reste reste jugé par la maquette.
 */
export function deLaRepartition(chemin: string): boolean {
  return estDuRegistre(chemin) || estPhotoMigen(chemin);
}

/* La porte de la porte : si le registre n'était plus lisible ou si les octets
   avaient bougé, `deLaRepartition` dirait non à tout et les six portes
   refuseraient le site entier sans dire pourquoi. On le dit ici, une fois. */
if (!estDuRegistre(cheminRegistre(REGISTRE[0].fichier))) {
  throw new Error(
    `${cheminRegistre(REGISTRE[0].fichier)} : absente de public/ ou octets ≠ sha256 du registre.\n` +
      "  Les 109 photos sous licence ne sont plus vérifiables : aucune page ne pourrait en servir.",
  );
}
