import { enTexteNu } from "./TexteRiche";

/**
 * LE RÉSUMÉ D'UNE SECTION REPLIÉE, dans un module que le serveur ET le
 * navigateur peuvent lire.
 *
 * POURQUOI CE FICHIER EXISTE, et c'est un défaut de build payé le 14/10.
 * Cette fonction vivait dans `SectionPliableMobile.tsx`, qui porte
 * `"use client"`. Quatre composants de `blocs/` sont rendus SUR LE SERVEUR et
 * l'appelaient pendant leur rendu : `ChiffresCles`, `Deroule`, `Objections`,
 * `Garanties`. Next refuse, et il a raison :
 *
 *   « Attempted to call resumeDe() from the server but resumeDe is on the
 *     client. It's not possible to invoke a client function from the server. »
 *
 * Le build entier tombait sur `/implantations/toulouse/bordeaux`. Et le piège
 * est qu'il ne tombait QUE là : `bunx tsc --noEmit` passait, parce que la
 * frontière serveur / client n'est pas une question de types. Un agent qui
 * s'arrête au typage croit donc avoir fini.
 *
 * Un module sans directive est lisible des deux côtés. C'est le bon endroit
 * pour une fonction qui ne fait que coudre des chaînes : elle n'a ni état, ni
 * effet, ni accès au navigateur.
 *
 * LA RÈGLE A CHANGÉ AVEC LA V3 (16/10) : voir `accrocheDe` plus bas. Les cartes
 * qui annoncent un TEXTE portent désormais son début ; `resumeDe` ne sert plus
 * qu'aux cartes qui ne contiennent que des intitulés.
 *
 * CE QU'ELLE FAIT, inchangé. La maquette mobile résume une section repliée par
 * ses propres intitulés joints par « · », jamais par une phrase écrite à la
 * main : une phrase écrite serait une donnée inventée, et l'une l'a été
 * (mesure du 11/10, « N engagements, écrits avant la signature. » absente des
 * 244 captures et présente 140 fois sur le site).
 *
 * ELLE NE LAISSE PAS TOMBER UN ÉLÉMENT SANS INTITULÉ. Le motif d'origine
 * écrivait `.map((p) => p.accroche).filter(Boolean)` : une puce sans accroche
 * disparaissait du résumé en silence, et le résumé annonçait alors moins
 * d'éléments que le bloc n'en contient. Les appelants passent donc un repli
 * (`puce.accroche ?? puce.texte`), et c'est ici que les vides sont écartés.
 */
export function resumeDe(
  morceaux: readonly (string | undefined)[],
): string | undefined {
  const propres = morceaux.map((m) => (m ?? "").trim()).filter(Boolean);
  return propres.length > 0 ? propres.join(" · ") : undefined;
}

/* ---------------------------------------------------------------------------
 * L'ACCROCHE D'UNE CARTE FERMÉE, RÈGLE DE LA MAQUETTE V3 (16/10).
 *
 * La V3 (`Migen - Maquette V3`, composant mobile 9d8a3bdb, `teaseOf`) ne
 * résume plus une carte par ses intitulés : elle montre LE DÉBUT DU TEXTE DE
 * LA SECTION, lu dans l'ordre du corpus :
 *
 *   1. le premier paragraphe (le chapô compris), sauf une phrase de renvoi ;
 *   2. sinon le premier élément de la première liste, à puces OU numérotée
 *      (la v2 ne lisait pas les listes numérotées : « Le déroulé » restait
 *      sans accroche sur 122 pages) ;
 *   3. sinon la première cellule de la première ligne du premier tableau
 *      (« L'offre » : « Un technicien évalué, présent au rythme convenu,
 *      temps plein ou partagé. »).
 *
 * Une phrase de renvoi est SAUTÉE, jamais montrée : « Pour trancher… »,
 * « Pour aller plus loin… », « Voir aussi… », « … notre comparatif … ». Sur
 * `/offres/residence/`, la carte « L'offre » annonçait le comparatif au lieu
 * de l'offre.
 *
 * RIEN N'EST RÉDIGÉ : la phrase est celle de la section, qui reste entière
 * dans la carte. La coupe à trois lignes est faite par la feuille partagée
 * (`app/globals.css`, `details[data-carte-numerotee] > summary > p`), pas
 * ici : le texte du DOM n'est pas tronqué.
 *
 * `resumeDe` reste pour les cartes dont le contenu n'est qu'une liste de
 * liens ou de noms (pages liées, offres voisines, marques) : la V3 n'y pose
 * pas d'accroche, et ce sont des intitulés, pas un texte à amorcer.
 * ------------------------------------------------------------------------- */

/** Un bloc de la section, dans l'ordre du corpus, tel que la règle le lit. */
export type BlocAccroche =
  | { paragraphe: string | undefined }
  | { liste: readonly (string | undefined)[] }
  | { cellule: string | undefined };

/** dc.html V3 `skipP` : les phrases qui renvoient ailleurs au lieu de dire. */
const RENVOI = /^(Pour (trancher|aller plus loin|en savoir plus|comparer)|Voir aussi|Lire aussi|À lire)/i;
const RENVOI_GUIDE = /\bnotre (guide|comparatif)\b/i;

export function estUnRenvoi(phrase: string): boolean {
  return RENVOI.test(phrase) || RENVOI_GUIDE.test(phrase);
}

const nu = (texte: string | undefined) => enTexteNu(texte).replace(/\s+/g, " ").trim();

export function accrocheDe(blocs: readonly BlocAccroche[]): string | undefined {
  for (const bloc of blocs) {
    if ("paragraphe" in bloc) {
      const phrase = nu(bloc.paragraphe);
      if (phrase && !estUnRenvoi(phrase)) return phrase;
    } else if ("liste" in bloc) {
      /* La V3 ne lit que le PREMIER élément : vide, elle passe au bloc suivant. */
      const premier = nu(bloc.liste[0]);
      if (premier) return premier;
    } else {
      const cellule = nu(bloc.cellule);
      if (cellule) return cellule;
    }
  }
  return undefined;
}

/**
 * LA CAPITALE QUE GARDE UN TEXTE APRÈS « : ». La V3 écrit le texte en
 * minuscule derrière son intitulé (« Qualification : un chargé d'affaires
 * étudie votre parc… », /secteurs/agroalimentaire/), nos fiches lui ont remis
 * une capitale (3 002 coutures sur 3 395 mesurées le 16/10). Elle ne reste
 * que devant :
 * - un sigle, chiffres compris : « ALSTEF Group cherche… », « M221 » ;
 * - une capitale intérieure : « DimoMaint », « EcoStruxure », « WashTec » ;
 * - un nom composé de capitales : « Loire-Atlantique », « Dompierre-sur-Besbre » ;
 * - un nom propre que les fiches posent en tête de texte (relevé exhaustif
 *   du 16/10 sur les 603 premiers mots en capitale) : « Savoye et Migen
 *   constatent… » (/preuves/savoye/).
 */
const GARDE_SA_CAPITALE =
  /^(?:[\p{Lu}\d]{2,}(?!\p{Ll})|\p{Lu}\p{Ll}+\p{Lu}|\p{Lu}\p{L}*(?:-\p{L}+)*-\p{Lu}|(?:Migen|Lyon|Paris|Strasbourg|Rhône|Essonne|Alsace|Savoye|Timescope|Ecocem|Modbus|Modicon|Profinet|Robodrill)(?!\p{L}))/u;

/** Le texte en minuscule initiale, sauf sigle ou nom propre (voir plus haut). */
export function minusculeSaufNomPropre(texte: string): string {
  const debut = texte.search(/[\p{L}\p{N}]/u);
  if (debut < 0 || GARDE_SA_CAPITALE.test(texte.slice(debut))) return texte;
  return texte.slice(0, debut) + texte.charAt(debut).toLowerCase() + texte.slice(debut + 1);
}

/**
 * UNE LIGNE DE LISTE TELLE QUE LE CORPUS L'ÉCRIT : « **Intitulé** : texte ».
 * Nos données ont séparé l'intitulé du texte et perdu le séparateur ; il est
 * rétabli selon la phrase :
 * - le texte ouvre par une virgule ou un point-virgule, il continue
 *   l'intitulé (« …au rythme convenu, temps plein ou partagé. ») ;
 * - `point` : le corpus clôt l'intitulé par un point, « **Sélection.** Migen
 *   est retenu… » (études de cas, guides). Le titre de bureau s'affiche sans
 *   ce point, la fiche le porte donc en drapeau (posé le 16/10 d'après la
 *   V3) et le texte garde sa capitale ;
 * - `suitAccroche`, ou un intitulé qui finit déjà sa phrase (« Visite et
 *   audit. »), appelle une simple espace ;
 * - sinon « : », le cas courant (« Cadrage du besoin : un chargé
 *   d'affaires… »), suivi d'une minuscule sauf sigle ou nom propre
 *   (`minusculeSaufNomPropre`).
 * Reprise de `offre/GarantiesOffre.tsx` (résumé des garanties, 14/10), qui la
 * portait seul. Ne sert qu'aux accroches : le texte des cartes ouvertes garde
 * sa casse.
 */
export function ligneDuCorpus(ligne: {
  accroche?: string;
  texte?: string;
  suitAccroche?: boolean;
  point?: boolean;
}): string | undefined {
  const texte = (ligne.texte ?? "").trim();
  const accroche = (ligne.accroche ?? "").trim();
  if (!accroche) return texte || undefined;
  if (!texte) return accroche;
  if (/^[,;]/.test(texte)) return `${accroche}${texte}`;
  if (ligne.point && !/[.!?:]$/.test(accroche)) return `${accroche}. ${texte}`;
  /* Un texte qui pose LUI-MÊME ses deux-points tout de suite continuait
     l'intitulé : « **Vous décrivez le besoin** par téléphone : panne… ».
     Deux « : » dans la même phrase trahiraient la couture. */
  const poseSesDeuxPoints = /^\p{Ll}[^.:!?]{0,30} : /u.test(texte);
  const suit =
    ligne.suitAccroche || poseSesDeuxPoints || /^\s/.test(ligne.texte ?? "") || /[.!?:]$/.test(accroche);
  return suit ? `${accroche} ${texte}` : `${accroche} : ${minusculeSaufNomPropre(texte)}`;
}

/**
 * VRAI QUAND L'ÉTIQUETTE ÉCRIT DÉJÀ SON NUMÉRO (« 02 · Notre réponse », « 03 »).
 * Le repli passe alors `numero={false}` : sans quoi la carte numérotée de
 * `app/globals.css` ajoute le sien, et le téléphone affichait « 01 » à côté de
 * « 02 · Notre réponse » (106 pages sur 248 mesurées le 14/10).
 */
export function porteSonNumero(surtitre?: string): boolean {
  return /^\d{2}(?!\d)/.test(surtitre?.trim() ?? "");
}

/**
 * L'ACCROCHE DE « LE PROBLÈME » REPLIÉ, règle de la V3 : la phrase clé
 * (`punchline`, le premier paragraphe du corpus), sinon la première puce
 * telle que le corpus l'écrit. Partagée par les gabarits offre et domaine.
 */
export function accrocheDuProbleme(section: {
  punchline?: string;
  puces: readonly { accroche?: string; texte: string; suitAccroche?: boolean }[];
}): string | undefined {
  return accrocheDe([{ paragraphe: section.punchline }, { liste: section.puces.map(ligneDuCorpus) }]);
}
