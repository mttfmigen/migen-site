import { enTexteNu } from "@/components/site/blocs/TexteRiche";

/**
 * LA CARTE NUMÉROTÉE DE LA MAQUETTE MOBILE V2, pour les deux gabarits de la
 * famille carrière (fiches métier `PageFicheMetier`, hub `PageHubCarriere`).
 *
 * Source : `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, L130
 * (`isDetails` et `isH`) et L438 (`teaseOf`). La carte elle-même est dessinée
 * par le motif partagé `details[data-carte-numerotee]` de `app/globals.css` :
 * numéro en compteur CSS, sur-titre et titre DANS la carte, résumé de deux
 * lignes quand elle est fermée.
 */

/** « 01 · Au quotidien » devient « Au quotidien » : le numéro est le compteur
 *  de la carte, l'écrire aussi le doublerait. */
export function sansNumero(surtitre: string): string {
  return surtitre.replace(/^\d{2}(?!\d)\s*(?:·\s*)?/, "").trim();
}

/** L'étiquette de la bascule. Mobile seulement : au-dessus de 880 px, la
 *  section garde son propre surtitre et son `<h2>`, ceux de la capture.
 *  PAS DE SUR-TITRE dans la carte : celle de la maquette porte numéro, titre
 *  et résumé seulement (relecture adverse du 14/10). Le surtitre de la section
 *  reste dans le DOM. `surtitre` est gardé dans la signature pour les deux
 *  appelants. */
export function EtiquettePli({ titre }: { surtitre: string; titre: string }) {
  return (
    <span data-mobile-seulement="">
      <span data-carte-titre="">{titre}</span>
    </span>
  );
}

/**
 * L'ENCART D'APPEL SOUS LE CHAPÔ (dc.html L130, bloc `isQ` : `blockquote`,
 * fond `--qbg`). Le texte est la citation d'introduction du corpus de chaque
 * page (`maquette/contenu/site/Metiers-Carriere/*.md`), mot pour mot : la
 * donnée de la page ne la porte pas. Mobile seulement : sur bureau, rien.
 */
const ENCARTS_APPEL: Readonly<Record<string, string>> = {
  "/carriere/":
    "Un poste vous intéresse ? Un appel au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit. Nous vous rappelons dans l'heure.",
  "/carriere/agent-de-maintenance/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre profil. Vous pouvez aussi nous contacter en ligne.",
  "/carriere/alternance/":
    "Une question sur l'alternance ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre projet.",
  "/carriere/automaticien/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre profil.",
  "/carriere/automaticien/salaire/":
    "Envie d'en parler directement ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, et votre profil est fixé sur sa valeur de marché.",
  "/carriere/electromecanicien/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre profil.",
  "/carriere/electromecanicien/competences/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, situe votre profil. Nous vous rappelons dans l'heure.",
  "/carriere/electromecanicien/salaire/":
    "Une question sur votre rémunération ou une candidature ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, situe votre candidature. Nous vous rappelons dans l'heure.",
  "/carriere/responsable-maintenance/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre profil.",
  "/carriere/roboticien/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre profil.",
  "/carriere/technicien-de-maintenance/":
    "Un emploi vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, situe votre profil. Nous vous rappelons dans l'heure.",
  "/carriere/technicien-de-maintenance/formation/":
    "Un projet de formation ou une candidature ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre parcours. Nous vous rappelons dans l'heure.",
  "/carriere/technicien-de-maintenance/salaire/":
    "Envie d'en parler directement ? Nous contacter : 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, et votre profil se situe sur sa vraie valeur de marché.",
  "/carriere/technicien-itinerant/":
    "Un poste vous intéresse ? Un échange au 04 78 33 72 05, du lundi au vendredi de 8h00 à 18h30, suffit pour situer votre profil de candidat.",
};

/** `ordre` : sa place dans la colonne flexible du héros mobile, juste après
 *  les paragraphes du chapô. Espaces en tête et en fin : `textContent` ne
 *  colle pas son premier mot au dernier du paragraphe qui précède. */
export function EncartAppel({ chemin, ordre }: { chemin: string; ordre: number }) {
  const texte = ENCARTS_APPEL[chemin.endsWith("/") ? chemin : `${chemin}/`];
  if (!texte) return null;
  return (
    <p
      data-mobile-seulement=""
      style={{
        order: ordre,
        margin: "6px 0 14px",
        padding: "14px 16px",
        borderRadius: 16,
        background: "rgba(255,124,60,.09)",
        font: "500 14.5px/1.55 var(--fb)",
        color: "var(--ink)",
      }}
    >
      {` ${texte} `}
    </p>
  );
}

/**
 * LE RÉSUMÉ DE LA CARTE FERMÉE, `teaseOf` de la maquette (dc.html L438) : le
 * premier paragraphe de la section, coupé au dernier mot avant 100 signes
 * quand il en dépasse 104. Aucun mot n'est écrit : c'est le début du texte
 * de la section, qui reste entier dans la carte.
 */
export function amorceDe(section: object): string | undefined {
  const champ = (cle: string): unknown => (section as Record<string, unknown>)[cle];
  const premier = (valeur: unknown): string | undefined =>
    Array.isArray(valeur) && typeof valeur[0] === "string" ? valeur[0] : undefined;
  const brut =
    premier(champ("intros")) ??
    (typeof champ("intro") === "string" ? (champ("intro") as string) : undefined) ??
    premier(champ("textes"));
  const texte = enTexteNu(brut).replace(/\s+/g, " ").trim();
  if (!texte) return undefined;
  return texte.length > 104 ? `${texte.slice(0, texte.lastIndexOf(" ", 100))}…` : texte;
}
