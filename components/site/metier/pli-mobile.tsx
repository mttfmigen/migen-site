import type { ReactNode } from "react";

import { ligneDuCorpus } from "@/components/site/blocs/resume-de-section";
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
  /* V3 (16/10) : une section qui n'a pas de paragraphe s'annonce par sa
     première étape (« Comment nous rejoindre » : « Un échange : vous décrivez
     votre parcours… »), comme toute liste numérotée. */
  const etapes = champ("etapes");
  const premiereEtape =
    Array.isArray(etapes) && etapes[0] && typeof etapes[0] === "object"
      ? ligneDuCorpus({
          accroche: (etapes[0] as { titre?: string }).titre,
          texte: (etapes[0] as { texte?: string }).texte,
        })
      : undefined;
  const brut =
    premier(champ("intros")) ??
    (typeof champ("intro") === "string" ? (champ("intro") as string) : undefined) ??
    premier(champ("textes")) ??
    premiereEtape;
  const texte = enTexteNu(brut).replace(/\s+/g, " ").trim();
  if (!texte) return undefined;
  return texte.length > 104 ? `${texte.slice(0, texte.lastIndexOf(" ", 100))}…` : texte;
}

/**
 * LES SECTIONS DONT LE COMMENTAIRE SUIT LA LISTE. Le corpus
 * (`maquette/contenu/site/Metiers-Carriere/*.md`), et la maquette V3 « Site
 * mobile » qui le suit (16/10), écrivent ces sections chapô, liste, PUIS le
 * paragraphe qui la commente ; la donnée de bureau range tous les paragraphes
 * avant la liste. Relevé section par section le 16/10, chaque titre cherché
 * sous son `##` dans le corpus : sur les 40 sections à deux paragraphes ou
 * plus des 13 fiches, 27 placent leur suite après la liste, toujours à partir
 * du deuxième paragraphe, et un même titre ne change jamais de règle d'une
 * fiche à l'autre. S'y ajoute une section du hub (`carriere.md`).
 */
export const APRES_LISTE: ReadonlySet<string> = new Set([
  "Automaticien chez Migen : le cadre et les moyens",
  "Bien mener sa recherche d'emploi",
  "Ce que fait un agent de maintenance industrielle au quotidien",
  "Ce que fait un alternant au quotidien",
  "Ce que fait un responsable maintenance au quotidien",
  "Ce que fait un roboticien au quotidien",
  "Comment rejoindre nos équipes",
  "Comment évolue un roboticien",
  "Devenir agent de maintenance industrielle : formation et parcours",
  "Devenir automaticien : formation et parcours",
  "Devenir roboticien : formation et parcours",
  "Devenir technicien de maintenance itinérant : formation et parcours",
  "Devenir électromécanicien : formation et parcours",
  "Du bac pro à l'expertise : le parcours et la paie",
  "Du stage à l'alternance : les voies d'accès",
  "Du terrain vers l'ingénieur",
  "Emploi et recrutement : qui cherche un agent de maintenance",
  "Emploi et recrutement : qui recrute un technicien itinérant",
  "Formation et parcours pour devenir responsable maintenance",
  "La vie chez Migen au quotidien",
  "Le process de recrutement en 4 étapes",
  "Les compétences et qualités qui font la différence",
  "Les compétences qui font la différence",
  "Responsable maintenance chez Migen : le cadre et les moyens",
  "Salaire et évolution du responsable maintenance",
  "Salaire, formation et contrat",
  "Technicien de maintenance chez Migen : le cadre et les moyens",
  "Évolution de carrière du technicien itinérant",
]);

/**
 * Au téléphone seulement, l'ordre VISUEL de ces sections suit la V3 : chapô,
 * liste, puis les paragraphes suivants (`data-mc-apres-liste`,
 * `MobileV2.module.css`, comme l'ordre déjà rendu au tableau). Le DOM et le
 * bureau ne changent pas.
 */
export function OrdreMobile({ section, children }: { section: object; children: ReactNode }) {
  const titre = (section as { titre?: unknown }).titre;
  return typeof titre === "string" && APRES_LISTE.has(titre) ? (
    <div data-mc-apres-liste="">{children}</div>
  ) : (
    children
  );
}

/**
 * LES SOUS-PARTIES DE LA MAQUETTE MOBILE. Le corpus (`carriere.md` pour le
 * hub, `Metiers-Carriere/*.md` pour les fiches), et la maquette V3 « Site
 * mobile » qui le suit, écrivent ces blocs en `###` sous la section qui les
 * précède, là où la maquette de bureau en fait des sections à part entière :
 * au téléphone ils s'ouvrent DANS la carte d'avant, en intertitre, au lieu de
 * compter comme cartes numérotées (hub : 13 cartes au lieu de 9, signalé par
 * Mehdi le 15/10 ; fiche Formation : 17 au lieu de 10, relevé le 16/10 sur
 * cinq fiches). Aucun de ces titres n'est un `##` ailleurs dans le corpus.
 * Le bureau ne change pas : la bascule y est transparente.
 */
export const SOUS_PARTIES: ReadonlySet<string> = new Set([
  /* le hub /carriere/ */
  "Des techniciens confirmés, prêts pour le terrain",
  "Des avis qui parlent du terrain",
  "Postes ouverts et candidature spontanée",
  "Nos informations pratiques",
  /* les fiches */
  "Bien mener sa recherche d'emploi",
  "Comment nous rejoindre",
  "Comment évolue un roboticien",
  "Du bac pro à la licence pro",
  "Du terrain vers l'ingénieur",
  "L'apprentissage par blocs",
  "Le poids de l'expérience",
  "Le titre professionnel, voie rapide",
  "Les travaux pratiques comptent double",
  "Lire un schéma avant d'agir",
  "Se former tout au long de la carrière",
  "Une technicienne ou un technicien",
  "Vérifier avant de s'inscrire",
]);

/** Les sections de contenu, chacune avec ses sous-parties (`SOUS_PARTIES`). */
export function regroupe<S extends object>(contenus: S[], premier: number) {
  const groupes: { section: S; rang: number; sous: S[] }[] = [];
  contenus.forEach((s, j) => {
    const dernier = groupes.at(-1);
    const titre = (s as { titre?: unknown }).titre;
    if (dernier && typeof titre === "string" && SOUS_PARTIES.has(titre)) dernier.sous.push(s);
    else groupes.push({ section: s, rang: premier + j, sous: [] });
  });
  return groupes;
}
