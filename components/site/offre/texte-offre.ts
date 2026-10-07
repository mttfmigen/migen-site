import type { Preuve, PrestationBenefice } from "@/types/contenu";

/**
 * Outils de texte du gabarit OFFRE, portés de la maquette.
 *
 * La maquette CONSOMME le corpus : elle lit les champs tels que le corpus les
 * écrit (minuscule d'attaque, virgule de liaison, lien d'étude de cas en
 * libellé long) et les présente à sa façon (majuscule initiale, intitulé
 * fusionné, étiquette client courte). Ces fonctions reproduisent EXACTEMENT ces
 * présentations, mesurées dans `maquette/rendu/offres--residence.html` : le
 * texte reste celui du corpus, seul l'habillage typographique est appliqué.
 */

/** « des candidats retenus » → « Des candidats retenus ». */
export function majusculeInitiale(texte: string): string {
  if (!texte) return texte;
  return texte.charAt(0).toLocaleUpperCase("fr-FR") + texte.slice(1);
}

/**
 * La punchline du problème, coupée comme la maquette l'affiche : la première
 * phrase en H2, le reste en sous-phrase. Sans seconde phrase, tout est H2.
 */
export function coupePunchline(punchline: string): {
  titre: string;
  suite?: string;
} {
  const coupure = punchline.match(/^([\s\S]+?[.!?])\s+([\s\S]+)$/);
  if (!coupure) return { titre: punchline };
  return { titre: coupure[1], suite: coupure[2] };
}

/** Un point de l'offre tel que la maquette le compose. */
export interface PointOffre {
  /** L'intitulé en tête de carte. */
  titre: string;
  /** La suite de la prestation quand elle ne fusionne pas avec l'intitulé. */
  complement?: string;
  /** Le bénéfice, en encre pleine dans le paragraphe. */
  benefice: string;
}

const GRAS_SEUL = /^\*\*([\s\S]+)\*\*$/;

/**
 * Une ligne du tableau corpus (prestation | bénéfice) fusionnée en carte.
 *
 * Trois cas, relevés dans la capture :
 *   · prestation en gras seul : l'intitulé est ce gras, débarrassé des `**` ;
 *   · accroche + texte ouvrant par une virgule : l'intitulé est l'accroche et
 *     la suite, jointes par une espace (« au rythme convenu temps plein ou
 *     partagé. ») ;
 *   · accroche + texte plein : l'intitulé est l'accroche, le texte passe dans
 *     le paragraphe avec sa majuscule initiale, devant le bénéfice.
 */
export function fusionneLigne(ligne: PrestationBenefice): PointOffre {
  const { accroche, texte } = ligne.prestation;
  const texteNu = (texte ?? "").trim();
  const gras = texteNu.match(GRAS_SEUL);

  if (!accroche && gras) {
    return { titre: gras[1], benefice: ligne.benefice };
  }
  if (accroche && texteNu.startsWith(",")) {
    return {
      titre: `${accroche} ${texteNu.slice(1).trim()}`,
      benefice: ligne.benefice,
    };
  }
  if (accroche && texteNu) {
    return {
      titre: accroche,
      complement: majusculeInitiale(texteNu),
      benefice: ligne.benefice,
    };
  }
  return { titre: accroche ?? texteNu, benefice: ligne.benefice };
}

/**
 * L'étiquette client d'une étude de cas, tirée du libellé long du corpus :
 * « Étude de cas SUEZ : remise en état d'un site » → « SUEZ ».
 */
export function etiquetteEtude(preuve: Preuve): string | undefined {
  if (!preuve.lienLibelle) return undefined;
  const sansPrefixe = preuve.lienLibelle.replace(/^Étude de cas\s+/u, "");
  const client = sansPrefixe.split(/\s*:\s*/)[0]?.trim();
  return client || undefined;
}

/**
 * La mention de date d'une étude, en phrase : majuscule initiale et point
 * final, comme la capture (« depuis février 2026 » → « Depuis février 2026. »).
 */
export function phraseDate(texte: string | undefined): string | undefined {
  if (!texte) return undefined;
  const nette = majusculeInitiale(texte.trim());
  return /[.!?]$/.test(nette) ? nette : `${nette}.`;
}

/** « 3 » → « 03 » : la numérotation à deux chiffres de la maquette. */
export function numerote(rang: number): string {
  return String(rang + 1).padStart(2, "0");
}
