import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type {
  Section,
  SectionChiffres,
  SectionCta,
  SectionCtaFinal,
  SectionDeroule,
  SectionGaranties,
  SectionObjections,
  SectionOffre,
  SectionPreuves,
  SectionProbleme,
  SectionHeros,
} from "@/types/contenu";

import { visuel } from "./habillage-domaine";

/**
 * Ce que les gabarits 09 et 05 CALCULENT depuis le corpus.
 *
 * Tout ici est une dérivation d'AFFICHAGE, et chacune reproduit une ligne du
 * parseur de `maquette/gabarit-09-domaine.html` (bloc `<script type="text/x-dc">`).
 * Aucune n'ajoute d'information : le découpage d'une punchline en titre et
 * paragraphe, la numérotation « 01 » d'une ligne d'offre, les cartes de maillage
 * déduites des liens déjà écrits dans le texte. C'est pour cela que rien de tout
 * cela n'est stocké en base.
 *
 * AUCUNE DE CES FONCTIONS NE RÉÉCRIT LE CORPUS. Une seule le coupe, et c'est un
 * interdit du contrat : voir `sansAstreinteChiffree`.
 */

/* ------------------------------------------------- l'interdit, et rien d'autre */

/**
 * Retire les disponibilités chiffrées, « 24/24 et 7/7 » et ses variantes.
 *
 * POURQUOI CETTE COUPE EXISTE, et pourquoi elle n'est pas une trahison du
 * corpus. Le contrat du projet n'autorise qu'un seul délai écrit, « rappel dans
 * l'heure » ; le corpus, rédigé avant cette règle, écrit encore « l'astreinte
 * 24/24 et 7/7 » dans une dizaine de pages. LA MAQUETTE FAIT EXACTEMENT LA MÊME
 * COUPE : son parseur passe le Markdown dans une fonction `__c247` qui porte ces
 * sept expressions, mot pour mot celles reprises ici. Le fichier qui fait foi et
 * le contrat disent la même chose, il n'y a rien à arbitrer.
 *
 * Elle ne retire que la mention chiffrée : « l'astreinte prend le relais la nuit
 * et le week-end » reste, et c'est bien l'information utile.
 */
const ASTREINTE_CHIFFREE: RegExp[] = [
  /,\s*24\/24 et 7\/7\s*,/g,
  /\s*24\s*\/\s*24(?:\s*(?:et|·|,)\s*7\s*\/\s*7)?/g,
  /\s*24\s*h\s*\/\s*24(?:\s*(?:et|,)?\s*7\s*j?\s*\/\s*7)?/gi,
  /\s+7\s*jours\s*sur\s*7/gi,
  /\s+7\s*j\s*\/\s*7/gi,
  /\s+24\s*\/\s*7\b/g,
  /\s+7\s*\/\s*7\b/g,
];

export function sansAstreinteChiffree(texte: string): string {
  let sortie = texte;
  for (const motif of ASTREINTE_CHIFFREE) {
    sortie = sortie.replace(motif, (trouve) => (trouve.startsWith(",") ? "," : ""));
  }
  return sortie.replace(/\s{2,}/g, " ").trim();
}

/** La valeur n'est-elle QUE la mention interdite ? Alors la ligne entière tombe. */
function entierementInterdite(valeur: string): boolean {
  return sansAstreinteChiffree(valeur).replace(/[\s,.;:·-]/g, "") === "";
}

/* ---------------------------------------------------- lecture des sections */

/** La section de ce type, ou `undefined`. Une section absente laisse sa case vide. */
function lis<T extends Section>(
  sections: readonly Section[],
  type: T["type"],
): T | undefined {
  return sections.find((s): s is T => s.type === type);
}

/** Découpe en phrases, comme le `sentences()` de la maquette. */
export function phrases(texte: string): string[] {
  return texte
    .split(/(?<=[.?!])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** « 01 », « 02 »… la numérotation `String(i+1).padStart(2,"0")` de la maquette. */
export function numero(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** Retire le balisage de lien du Markdown en ne gardant que les libellés. */
function sansLiens(texte: string): string {
  return texte.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

/* ---------------------------------------------------------------- maillage */

export interface CarteMaillage {
  titre: string;
  href: string;
  /** La phrase du corpus où le lien a été trouvé, sans son balisage. */
  description: string;
  visuel: string;
}

/**
 * Les cartes du maillage, déduites des liens que le corpus écrit dans son texte.
 *
 * C'est la règle du parseur de la maquette, reprise telle quelle : chaque lien
 * INTERNE du texte devient une carte, dédoublonnée par cible, dans l'ordre
 * d'apparition, les études de cas exclues parce qu'elles ont déjà leur section
 * « Nos références ». La description est la phrase où le lien a été trouvé, et
 * le visuel suit la rotation `PHOTOS[(rang + 3) % 7]` du fichier.
 *
 * Les cibles hors domaine sont écartées par `estCheminInterne`, la même garde
 * que `TexteRiche` : un contenu éditorial n'a pas à pouvoir expédier un visiteur
 * ailleurs sous l'autorité du domaine.
 */
export function cartesMaillage(sections: readonly Section[]): CarteMaillage[] {
  const offre = lis<SectionOffre>(sections, "offre");
  const deroule = lis<SectionDeroule>(sections, "deroule");
  const garanties = lis<SectionGaranties>(sections, "garanties");
  const objections = lis<SectionObjections>(sections, "objections");

  const sources: string[] = [
    ...(offre?.lignes ?? []).flatMap((l) => [
      l.prestation.accroche ?? "",
      l.prestation.texte,
      l.benefice,
    ]),
    ...(offre?.prose ?? []).map((p) => p.texte),
    ...(deroule?.etapes ?? []).map((e) => e.texte ?? ""),
    ...(garanties?.puces ?? []).map((p) => p.texte),
    ...(objections?.questions ?? []).map((q) => q.reponse),
  ];

  const vues = new Set<string>();
  const cartes: CarteMaillage[] = [];

  for (const source of sources) {
    for (const phrase of phrases(source)) {
      for (const lien of phrase.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
        const [, libelle, href] = lien;
        if (!estCheminInterne(href)) continue;
        if (href.startsWith("/preuves/")) continue;
        if (vues.has(href)) continue;
        vues.add(href);
        cartes.push({
          titre: libelle.charAt(0).toUpperCase() + libelle.slice(1),
          href,
          description: sansAstreinteChiffree(sansLiens(phrase)),
          visuel: visuel(cartes.length + 3),
        });
      }
    }
  }
  return cartes;
}

/* ------------------------------------------------------- la page, mise à plat */

export interface Repere {
  valeur: string;
  libelle: string;
}

export interface Duo {
  accroche: string;
  texte: string;
}

export interface LigneOffre extends Duo {
  numero: string;
  benefice: string;
}

export interface EtapeNumerotee extends Duo {
  numero: string;
}

export interface Reference {
  client: string;
  titre: string;
  texte: string;
  libelle: string;
  href: string;
  visuel: string;
}

export interface QuestionReponse {
  question: string;
  reponse: string;
}

/** Le rappel téléphonique, coupé autour du numéro pour que celui-ci soit un lien. */
export interface Rappel {
  avant: string;
  telephone: string;
  apres: string;
}

export interface PageDomaineDonnees {
  h1: string;
  mecanisme: string;
  cta: string;
  telephone: string;
  phraseDelai: string;
  reperes: Repere[];
  punchTitre: string;
  punchTexte: string;
  problemes: Duo[];
  offre: LigneOffre[];
  notesOffre: string[];
  etapes: EtapeNumerotee[];
  garanties: Duo[];
  appelQuestion: string;
  appelBouton: string;
  appelRappel: Rappel | null;
  references: Reference[];
  questions: QuestionReponse[];
  finalQuestion: string;
  maillage: CarteMaillage[];
}

/** La `Paragraphe` du corpus devient le duo accroche / texte de la maquette. */
function duo(p: { accroche?: string; texte: string }): Duo {
  return {
    accroche: sansAstreinteChiffree(p.accroche ?? ""),
    texte: sansAstreinteChiffree(p.texte),
  };
}

/**
 * Met le corpus à plat dans les cases des gabarits 09 et 05.
 *
 * Chaque case vient d'une section nommée du corpus, et une section absente laisse
 * sa case VIDE : `PageDomaine` ne rend alors pas la section du tout, titre
 * compris. Rien n'est comblé, rien n'est deviné.
 */
export function donneesDomaine(
  sections: readonly Section[],
): PageDomaineDonnees {
  const heros = lis<SectionHeros>(sections, "heros");
  const chiffres = lis<SectionChiffres>(sections, "chiffres");
  const probleme = lis<SectionProbleme>(sections, "probleme");
  const offre = lis<SectionOffre>(sections, "offre");
  const deroule = lis<SectionDeroule>(sections, "deroule");
  const garanties = lis<SectionGaranties>(sections, "garanties");
  const appel = lis<SectionCta>(sections, "cta");
  const preuves = lis<SectionPreuves>(sections, "preuves");
  const objections = lis<SectionObjections>(sections, "objections");
  const final = lis<SectionCtaFinal>(sections, "ctaFinal");

  const telephone = heros?.telephone ?? "";
  const punch = phrases(sansAstreinteChiffree(probleme?.punchline ?? ""));

  // Le rappel du milieu de page porte le numéro au milieu d'une phrase : la
  // maquette le coupe en trois pour en faire un lien, et ne fait rien si le
  // numéro n'y est pas.
  const brut = sansAstreinteChiffree(appel?.rappel ?? "");
  const coupe = telephone ? brut.indexOf(telephone) : -1;

  return {
    h1: heros?.h1 ?? "",
    mecanisme: sansAstreinteChiffree(heros?.mecanisme ?? ""),
    cta: heros?.cta ?? "",
    telephone,
    phraseDelai: sansAstreinteChiffree(heros?.phraseDelai ?? ""),
    reperes: (chiffres?.chiffres ?? [])
      .filter((c) => !entierementInterdite(c.valeur))
      .map((c) => ({
        valeur: sansAstreinteChiffree(c.valeur),
        libelle: sansAstreinteChiffree(c.libelle),
      })),
    punchTitre: punch[0] ?? "",
    punchTexte: punch.slice(1).join(" "),
    problemes: (probleme?.puces ?? []).map(duo),
    offre: (offre?.lignes ?? []).map((l, i) => ({
      numero: numero(i),
      ...duo(l.prestation),
      benefice: sansAstreinteChiffree(l.benefice),
    })),
    notesOffre: (offre?.prose ?? []).map((p) => sansAstreinteChiffree(p.texte)),
    etapes: (deroule?.etapes ?? []).map((e, i) => ({
      numero: numero(i),
      accroche: sansAstreinteChiffree(e.titre),
      texte: sansAstreinteChiffree(e.texte ?? ""),
    })),
    garanties: (garanties?.puces ?? []).map(duo),
    appelQuestion: sansAstreinteChiffree(appel?.question ?? ""),
    appelBouton: appel?.bouton ?? "",
    appelRappel:
      coupe >= 0
        ? {
            avant: brut.slice(0, coupe),
            telephone,
            apres: brut.slice(coupe + telephone.length),
          }
        : brut
          ? { avant: brut, telephone: "", apres: "" }
          : null,
    references: (preuves?.preuves ?? []).map((p, i) => ({
      // « Étude de cas VOIT : site du Grand Est » donne « VOIT », comme la
      // maquette : le préfixe tombe, et on garde ce qui précède les deux-points.
      client: (p.lienLibelle ?? "")
        .replace(/^Étude de cas\s*/, "")
        .split(" : ")[0],
      titre: sansAstreinteChiffree(p.titre),
      texte: sansAstreinteChiffree(p.texte ?? ""),
      libelle: p.lienLibelle ?? "",
      href: p.lienHref ?? "",
      visuel: visuel(i),
    })),
    questions: (objections?.questions ?? []).map((q) => ({
      question: sansAstreinteChiffree(q.question),
      reponse: sansAstreinteChiffree(q.reponse),
    })),
    finalQuestion: sansAstreinteChiffree(final?.question ?? ""),
    maillage: cartesMaillage(sections),
  };
}

/**
 * La frise de logos : les noms de clients, doublés pour que le défilement boucle.
 *
 * `aria-hidden` sur la seconde moitié, et c'est indispensable : un lecteur
 * d'écran annoncerait sinon dix fois les cinq mêmes noms. La maquette porte déjà
 * l'attribut, sous la forme `aria-hidden="{{ lg.dup }}"`.
 */
export function friseLogos(
  references: readonly Reference[],
): { nom: string; double: boolean }[] {
  const noms = references.map((r) => r.client).filter(Boolean);
  if (noms.length === 0) return [];
  const parPasse = noms.length * (noms.length < 5 ? 2 : 1);
  const ruban: { nom: string; double: boolean }[] = [];
  for (const passe of [false, true]) {
    for (let i = 0; i < parPasse; i += 1) {
      ruban.push({ nom: noms[i % noms.length], double: passe });
    }
  }
  return ruban;
}
