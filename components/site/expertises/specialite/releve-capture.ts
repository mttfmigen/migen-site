/**
 * Lecture des captures `maquette/rendu/*.html` pour `verification-specialite.tsx`.
 * Outil de CONTRÔLE, jamais importé par une page.
 *
 * Deux usages :
 *   · comparer un écran rendu à l'écran de la capture, déclaration de style
 *     par déclaration de style et nœud de texte par nœud de texte (même
 *     principe que la mesure du gabarit 09, `domaine/_mesure.tsx`, 08/10) ;
 *   · relire dans la capture la matière des deux écrans ajoutés le 08/10
 *     (« 02 Domaines », « Complément 2 ») pour les rendre SANS donnée écrite à
 *     la main : la preuve porte sur des textes copiés de la capture, pas sur
 *     un exemple inventé.
 */

import type { Paragraphe, Tableau } from "@/types/contenu";
import type { BlocComplementDomaine } from "@/types/domaine";
import type { CarteDomaineSpecialite } from "@/types/specialite";

/* ------------------------------------------------------------- les textes */

/** Les entités de la sérialisation, rendues à leur caractère. */
export function decode(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Un texte ramené à une écriture comparable : espace simple, apostrophe droite. */
export function normaliseTexte(texte: string): string {
  return decode(texte)
    .replace(/ | /g, " ")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Le texte d'un fragment, balises retirées. */
export function texteDe(html: string): string {
  return normaliseTexte(html.replace(/<[^>]+>/g, " "));
}

/** Les nœuds de texte non vides d'un fragment, dans l'ordre. */
export function noeudsDe(html: string): string[] {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/g, "")
    .split(/<[^>]+>/)
    .map(normaliseTexte)
    .filter(Boolean);
}

/* -------------------------------------------------------------- les styles */

/** Découpe sur `sep` hors parenthèses. */
function coupe(valeur: string, sep: string): string[] {
  const out: string[] = [];
  let profondeur = 0;
  let courant = "";
  for (const c of valeur) {
    if (c === "(") profondeur++;
    if (c === ")") profondeur--;
    if (c === sep && profondeur === 0) {
      out.push(courant);
      courant = "";
    } else courant += c;
  }
  out.push(courant);
  return out.map((x) => x.trim()).filter(Boolean);
}

/** Une valeur CSS écrite comme React l'écrit : `0px` → `0`, `0.8` → `.8`… */
function valeurComparable(propriete: string, brute: string): string {
  let v = decode(brute)
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/(^|[^\d])0\.(\d)/g, "$1.$2")
    .replace(/rgb\(255,255,255\)/g, "#fff")
    .replace(/\s+/g, " ")
    .trim();
  if (propriete === "flex" && v === "none") v = "0 0 auto";
  if (propriete === "box-shadow") {
    // Le navigateur sérialise la couleur en tête de chaque ombre, React la
    // laisse où le code l'écrit (en queue).
    v = coupe(v, ",")
      .map((ombre) => {
        const mots = coupe(ombre, " ");
        const couleurs = mots.filter((m) => /^(rgba?\(|#|var\()/.test(m));
        return [...mots.filter((m) => !couleurs.includes(m)), ...couleurs].join(" ");
      })
      .join(",");
  }
  return v;
}

export type Declarations = ReadonlyMap<string, string>;

/** Les déclarations d'un attribut `style`, préfixes `-webkit-` écartés. */
function declarations(style: string): Declarations {
  const paires = coupe(decode(style), ";").map((d) => {
    const i = d.indexOf(":");
    const p = d.slice(0, i).trim();
    return [p, valeurComparable(p, d.slice(i + 1))] as const;
  });
  return new Map(paires.filter(([p]) => p && !p.startsWith("-webkit-")));
}

/** Tous les attributs `style` d'un fragment. */
export function stylesDe(html: string): Declarations[] {
  return [...html.matchAll(/style="([^"]*)"/g)].map((m) => declarations(m[1]));
}

/** `a` est-il porté tel quel par `b` (b peut en dire plus) ? */
export function inclus(a: Declarations, b: Declarations): boolean {
  return [...a].every(([p, v]) => b.get(p) === v);
}

export function enClair(d: Declarations): string {
  return [...d].map(([p, v]) => `${p}: ${v}`).join("; ");
}

/* ------------------------------------------------------ les écrans d'une capture */

/** L'élément `tag` ouvert à `debut`, jusqu'à sa balise fermante appariée. */
function elementEntier(html: string, debut: number, tag: string): string {
  const balise = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  balise.lastIndex = debut;
  let profondeur = 0;
  for (let m = balise.exec(html); m; m = balise.exec(html)) {
    profondeur += m[1] ? -1 : 1;
    if (profondeur === 0) return html.slice(debut, m.index + m[0].length);
  }
  throw new Error(`élément <${tag}> non fermé à ${debut}`);
}

/** Les écrans de la capture, par `data-screen-label`, dans l'ordre. */
export function ecransDe(capture: string): { label: string; html: string }[] {
  return [...capture.matchAll(/<section\b[^>]*data-screen-label="([^"]*)"/g)].map(
    (m) => ({ label: decode(m[1]), html: elementEntier(capture, m.index!, "section") }),
  );
}

/** L'écran de ce label, s'il y en a un. */
export function ecran(capture: string, label: string): string | undefined {
  return ecransDe(capture).find((e) => e.label === label)?.html;
}

/* ------------------------------------ la matière des écrans ajoutés le 08/10 */

const texteInterne = (html: string) => decode(html.replace(/<[^>]+>/g, "")).trim();

/** Le H2 d'un écran, tel que la capture l'écrit. */
export function h2De(html: string): string {
  return texteInterne(/<h2\b[^>]*>([\s\S]*?)<\/h2>/.exec(html)![1]);
}

/** « 02 Domaines » : le H2, et chaque carte (`dm.b`, `dm.r`, `dm.bg`). */
export function domainesDeCapture(html: string): {
  titre: string;
  cartes: CarteDomaineSpecialite[];
} {
  const titre = h2De(html);
  const cartes = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((m) => {
    const carte = m[1];
    const photo = /url\(&quot;assets\/web\/([^&]+)&quot;\)/.exec(carte)![1];
    const valeur = /style="font: 400 13\.5px[^"]*">([\s\S]*?)<\/span>\s*<span/.exec(carte);
    const phrase = /class="mgx-dr"[^>]*>([\s\S]*?)<\/span>\s*<span/.exec(carte);
    const texte = phrase ? texteInterne(phrase[1]) : "";
    return {
      valeur: texteInterne(valeur![1]),
      ...(texte ? { texte } : {}),
      photo: `/assets/web/${photo}`,
    };
  });
  return { titre, cartes };
}

/**
 * « 03 Problème », dans ses trois dessins : le H2 et le paragraphe (que la
 * source tire d'une seule punchline, coupée à la première phrase), puis les
 * cartes numérotées (`pb.b`, `pb.r`).
 */
export function problemeDeCapture(html: string): {
  punchline: string;
  puces: Paragraphe[];
} {
  // Le premier paragraphe après le H2 : frère du H2 (colonne, panneau
  // sombre) ou seconde colonne de l'en-tête (rangée). Les cartes n'en ont pas.
  const suite = /<\/h2>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/.exec(html);
  const p = suite ? texteInterne(suite[1]) : "";
  const cartes = html.matchAll(
    /<span\b[^>]*>(?:<span class="sc-interp">)?\d{2}(?:<\/span>)?<\/span>\s*(?:<div\b[^>]*>)?\s*<div\b[^>]*>([\s\S]*?)<\/div>\s*<div\b[^>]*>([\s\S]*?)<\/div>/g,
  );
  return {
    punchline: p ? `${h2De(html)} ${p}` : h2De(html),
    puces: [...cartes].map((m) => ({ accroche: texteInterne(m[1]), texte: texteInterne(m[2]) })),
  };
}

/** Une puce `✓` : le gras d'attaque, puis le reste. */
function puceDe(html: string): Paragraphe {
  const fort = /<strong\b[^>]*>([\s\S]*?)<\/strong>/.exec(html);
  const apres = fort ? html.slice(fort.index + fort[0].length) : html;
  const texte = texteInterne(apres.replace(/<span[^>]*>✓<\/span>/, ""));
  return fort ? { accroche: texteInterne(fort[1]), texte } : { texte };
}

function tableauDe(html: string): Tableau {
  const cellules = (ligne: string, tag: string) =>
    [...ligne.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "g"))].map(
      (c) => texteInterne(c[1]),
    );
  const corps = /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/.exec(html)![1];
  return {
    entetes: cellules(/<thead\b[^>]*>([\s\S]*?)<\/thead>/.exec(html)![1], "th"),
    lignes: [...corps.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((l) => cellules(l[1], "td")),
  };
}

/** « Complément N » : un bloc par cellule de la grille (`rb`). */
export function complementDeCapture(html: string): BlocComplementDomaine[] {
  const debuts = [...html.matchAll(/<div\b[^>]*style="min-width: 0px; padding-bottom: 18px;"/g)].map(
    (m) => m.index!,
  );
  return debuts.map((debut) => {
    const bloc = elementEntier(html, debut, "div");
    const titre = /<h3\b[^>]*>([\s\S]*?)<\/h3>/.exec(bloc);
    const texte = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(bloc);
    const puces = [...bloc.matchAll(/<div\b[^>]*style="display: flex; gap: 11px;[^"]*"/g)].map(
      (m) => puceDe(elementEntier(bloc, m.index!, "div")),
    );
    return {
      ...(titre ? { titre: texteInterne(titre[1]) } : {}),
      ...(texte ? { texte: texteInterne(texte[1]) } : {}),
      ...(puces.length ? { puces } : {}),
      ...(/<table\b/.test(bloc) ? { tableau: tableauDe(bloc) } : {}),
    };
  });
}
