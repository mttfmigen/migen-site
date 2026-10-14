/**
 * LA COUCHE DE CONVERSION MOBILE : libellés, cibles et cadence, relevés
 * VERBATIM dans la maquette mobile v2
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, notée « dc.html »
 * ci-dessous). Chaque chaîne cite sa ligne source. On ne réécrit pas la copie
 * du client : la porte `verification-conversion-mobile.tsx` relit dc.html à
 * chaque exécution et tombe si une chaîne s'en écarte.
 *
 * CE MODULE NE PORTE AUCUNE DIRECTIVE (ni "use client", ni "server-only").
 * C'est voulu, et c'est un piège déjà payé le 14/10 : une fonction exportée
 * d'un module « use client » appelée par un composant serveur fait tomber
 * `bun run build` alors que `bunx tsc --noEmit` passe. Les utilitaires
 * partagés vivent dans un module neutre, comme
 * `components/site/blocs/resume-de-section.ts`.
 */

/**
 * Les quatre variantes que la maquette distingue, dc.html L347 à L350 :
 * - `carriere`   : `isCar = sg[0] === "carriere"` (L350) ;
 * - `article`    : `g01 = g === "01" && !(e && e.native) && !/^\/(a-propos|partenaires)\//.test(u)` (L432) ;
 * - `etudeDeCas` : `g === "02"` (L433, seul le sur-titre change) ;
 * - `standard`   : tout le reste.
 */
export type VarianteConversion = "standard" | "article" | "etudeDeCas" | "carriere";

export interface LibelleCible {
  libelle: string;
  href: string;
}

/* ------------------------------------------------------------- les cibles */

/** dc.html L412 : `href: isCar ? "/carriere/#postuler-chez-migen" : "/contact/"`. */
export const CIBLE_CONTACT = "/contact/";
export const CIBLE_POSTULER = "/carriere/#postuler-chez-migen";

/** dc.html L138 : `<section id="etre-rappele" …>` ; L437 : `href: "#etre-rappele"`. */
export const ANCRE_RAPPEL = "#etre-rappele";

/* -------------------------------------------------- la barre collante (bas) */

/**
 * dc.html L580 : `stickyL: isCar ? "Postuler" : "Décrire mon besoin",
 * stickyHref: isCar ? "/carriere/#postuler-chez-migen" : "/contact/"`.
 */
export function boutonBarreCollante(variante: VarianteConversion): LibelleCible {
  return variante === "carriere"
    ? { libelle: "Postuler", href: CIBLE_POSTULER }
    : { libelle: "Décrire mon besoin", href: CIBLE_CONTACT };
}

/** dc.html L191 et L127 : le second bouton de la barre et du photo + CTA. */
export const LIBELLE_APPELER = "Appeler";

/**
 * dc.html L580 : `stickyShow: g !== "contact" && !s.menu`. La barre ne se
 * montre pas sur la page Contact (le formulaire y est déjà) ni menu ouvert ;
 * le second point appartient au lot intégration (état du tiroir).
 */
export function barreCollanteVisible(gabarit: string): boolean {
  return gabarit !== "contact";
}

/* ----------------------------------------------- le photo + CTA (section 2) */

/** dc.html L433 : `ctaK = isCar ? "Rejoindre migen" : g01 ? "Passer à l’action" : g === "02" ? "Un projet comparable ?" : "Parlons de votre site"`. */
export function surTitrePhotoCta(variante: VarianteConversion): string {
  if (variante === "carriere") return "Rejoindre migen";
  if (variante === "article") return "Passer à l’action";
  if (variante === "etudeDeCas") return "Un projet comparable ?";
  return "Parlons de votre site";
}

/** dc.html L434 : `ctaT = isCar ? "Rejoignez les 120 collaborateurs de migen." : g01 ? "Besoin de bras pour appliquer cette méthode sur votre site ?" : "Un chargé d’affaires vous rappelle dans l’heure, aux horaires ouvrés."`. */
export function titrePhotoCta(variante: VarianteConversion): string {
  if (variante === "carriere") return "Rejoignez les 120 collaborateurs de migen.";
  if (variante === "article") return "Besoin de bras pour appliquer cette méthode sur votre site ?";
  return "Un chargé d’affaires vous rappelle dans l’heure, aux horaires ouvrés.";
}

/**
 * dc.html L412 et L436 : le bouton reprend le CTA de la page quand le corpus
 * en donne un (`P.cta`), sinon « Décrire mon besoin » ; en carrière,
 * « Postuler chez Migen ». Les appelants passent `surcharge` quand la page
 * porte son propre CTA.
 */
export function boutonPhotoCta(
  variante: VarianteConversion,
  surcharge?: LibelleCible,
): LibelleCible {
  if (variante === "carriere") {
    return { libelle: "Postuler chez Migen", href: CIBLE_POSTULER };
  }
  return surcharge ?? { libelle: "Décrire mon besoin", href: CIBLE_CONTACT };
}

/* ------------------------------------------- le bandeau « Être rappelé » */

/** dc.html L435 : `miniT = isCar ? "Ce métier vous ressemble ?" : g01 ? "Un technicien pour appliquer cette méthode ?" : "Une question sur votre site ?"`. */
export function texteBandeau(variante: VarianteConversion): string {
  if (variante === "carriere") return "Ce métier vous ressemble ?";
  if (variante === "article") return "Un technicien pour appliquer cette méthode ?";
  return "Une question sur votre site ?";
}

/** dc.html L437 : `miniBtn = isCar ? { label: "Postuler", … } : { label: "Être rappelé", href: "#etre-rappele" }`. */
export function boutonBandeau(variante: VarianteConversion): LibelleCible {
  return variante === "carriere"
    ? { libelle: "Postuler", href: CIBLE_POSTULER }
    : { libelle: "Être rappelé", href: ANCRE_RAPPEL };
}

/* ------------------------------------ le rappel de bas de page (#etre-rappele) */

/** dc.html L579 : `endK: isCar ? "Rejoindre migen" : "Être rappelé"`. */
export function surTitreRappelFinal(variante: VarianteConversion): string {
  return variante === "carriere" ? "Rejoindre migen" : "Être rappelé";
}

/** dc.html L579 : `endT: isCar ? "Rejoignez les 120 collaborateurs de migen." : "Un chargé d’affaires vous rappelle dans l’heure, aux horaires ouvrés."`. */
export function titreRappelFinal(variante: VarianteConversion): string {
  return variante === "carriere"
    ? "Rejoignez les 120 collaborateurs de migen."
    : "Un chargé d’affaires vous rappelle dans l’heure, aux horaires ouvrés.";
}

/** dc.html L138 : le lien sous le formulaire, `<a href="/contact/" …>Décrire mon besoin en détail →</a>`. */
export const LIEN_DETAIL = {
  libelle: "Décrire mon besoin en détail →",
  href: CIBLE_CONTACT,
} as const satisfies LibelleCible;

/** dc.html L579 : en carrière, pas de formulaire (`endBtnOnly: isCar`, L576), un bouton seul. */
export const BOUTON_POSTULER_FINAL = {
  libelle: "Postuler chez Migen",
  href: CIBLE_POSTULER,
} as const satisfies LibelleCible;

/* ------------------------------------------------------------- la cadence */

export type InsertionConversion = "photo" | "bandeau" | null;

/**
 * LA CADENCE DE LA MAQUETTE, dc.html L452 à L456 (`pushCtas`) :
 * après la 2e section de contenu, le photo + CTA ; ensuite, le bandeau
 * « Être rappelé » toutes les 3 sections (5e, 8e, 11e…) :
 *
 *   if (nD === 2) secs.push(base({ isPhotoCta: true, … }));
 *   else if (nD > 2 && (nD - 2) % 3 === 0) secs.push(base({ isMiniCta: true, … }));
 *
 * `rang` est le nombre de sections de CONTENU déjà rendues (les insertions ne
 * comptent pas). dc.html L453 : rien sur le gabarit 11 ni sur `/ressources/`.
 */
export function insertionApresSection(rang: number): InsertionConversion {
  if (rang === 2) return "photo";
  if (rang > 2 && (rang - 2) % 3 === 0) return "bandeau";
  return null;
}

/** dc.html L453 : `if (g === "11" || u === "/ressources/") return;`. */
export function laCadenceSApplique(gabarit: string, url: string): boolean {
  return gabarit !== "11" && url !== "/ressources/";
}

/** dc.html L576 : `showEndCta: !!P && u !== "/ressources/"`. */
export function rappelFinalVisible(url: string): boolean {
  return url !== "/ressources/";
}

/* --------------------------------------------------- identifiants d'ancre */

/** dc.html L454 : `uid("parlons-de-votre-site")`. */
export const ID_PHOTO_CTA = "parlons-de-votre-site";
/** dc.html L455 : `uid("une-question")`. */
export const ID_BANDEAU = "une-question";
/** dc.html L138 : `id="etre-rappele"`. */
export const ID_RAPPEL_FINAL = "etre-rappele";
