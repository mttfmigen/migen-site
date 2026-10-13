/**
 * Contrôle des huit pages de `/ressources/` et `/guides/` portées contre leurs
 * captures, sans navigateur.
 *
 *   bun components/site/editorial/verification-editorial.tsx
 *
 * LA RÉFÉRENCE : `maquette/rendu/<clé>.html`, relue à chaque exécution. La
 * page est rendue depuis SA donnée de relais
 * (`supabase/import/gabarits-maquette/<nom>.json`), celle que la route sert.
 *
 * CE QUI EST GARANTI, section par section (même nombre de sections) :
 *  1. LE TEXTE, mot pour mot (forme normalisée), aux phrases retirées près :
 *     celles que le contrat de copie interdit, listées dans la donnée
 *     (`phrases_retirees`), et dont on vérifie l'ABSENCE du rendu ;
 *  2. LE DESSIN : chaque élément stylé de la capture a son jumeau, dans le
 *     même ordre, avec les mêmes déclarations (sérialisation normalisée) ;
 *  3. un seul H1, aucun `href="#"`, aucune cible hors domaine, aucun interdit
 *     de copie ;
 *  4. le relais forcé des deux sous-rubriques que la base masque.
 * Puis LA PREUVE QU'IL SAIT ÉCHOUER : cinq fautes injectées, chacune doit
 * être vue.
 */

import assert from "node:assert/strict";

/* Le retrait des ornements du téléphone vit dans son propre module : la porte
   du gabarit ressource lit le même HTML et doit le lire de la même façon.
   Voir `ornements-mobiles.ts` pour le pourquoi, et le défaut qu'il répare. */
import { sansOrnementsMobiles } from "./ornements-mobiles";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuEditorial } from "@/types/editorial";

import PageEditoriale from "./PageEditoriale";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

const PAGES = [
  "/ressources/",
  "/ressources/articles/",
  "/ressources/fiches-pratiques/",
  "/ressources/fiches-techniques/",
  "/ressources/livres-blancs/",
  "/ressources/process/",
  "/guides/choisir-une-entreprise-de-maintenance/",
  "/guides/reussir-un-transfert-industriel/",
];

interface Relais {
  url: string;
  titre_h1: string;
  phrases_retirees: string[];
  contenu: ContenuEditorial;
}

/* ------------------------------------------------- un arbre HTML minimal */

interface Noeud {
  balise: string;
  attrs: Record<string, string>;
  enfants: (Noeud | string)[];
}

const VIDES = new Set(["img", "input", "br", "hr", "meta", "link", "source"]);

function decode(t: string): string {
  return t
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Le HTML sérialisé de la capture et celui de React sont bien formés : un tokeniseur suffit. */
function arbre(html: string): Noeud {
  const racine: Noeud = { balise: "#", attrs: {}, enfants: [] };
  const pile = [racine];
  const propre = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)\b[\s\S]*?<\/\1>/g, "");
  for (const m of propre.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g)) {
    const haut = pile[pile.length - 1];
    if (m[4] !== undefined) {
      haut.enfants.push(decode(m[4]));
      continue;
    }
    const balise = m[2].toLowerCase();
    if (m[1]) {
      const i = pile.map((n) => n.balise).lastIndexOf(balise);
      if (i > 0) pile.length = i;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of m[3].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? "");
    const n: Noeud = { balise, attrs, enfants: [] };
    haut.enfants.push(n);
    if (!VIDES.has(balise) && !m[3].trim().endsWith("/")) pile.push(n);
  }
  return racine;
}

function descendants(n: Noeud, garde: (x: Noeud) => boolean = () => true): Noeud[] {
  const out: Noeud[] = [];
  for (const e of n.enfants) {
    if (typeof e === "string") continue;
    if (garde(e)) out.push(e);
    out.push(...descendants(e, garde));
  }
  return out;
}

function texte(n: Noeud): string {
  return n.enfants.map((e) => (typeof e === "string" ? e : texte(e))).join(" ");
}

/** Forme de comparaison du texte : sans espace du tout, apostrophes droites. */
const compact = (t: string) => t.replace(/[’‘]/g, "'").replace(/\s+/g, "");

/** Le texte lisible d'une phrase de la donnée, balisage du corpus retiré. */
const lisible = (t: string) => t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

/**
 * La capture sans les éléments qui ne portaient QU'UNE phrase retirée (une
 * puce, le texte d'une carte) : le site ne les rend pas, c'est voulu.
 */
function sansRetraits(n: Noeud, phrases: string[]): Noeud {
  const cibles = phrases.map((p) => compact(lisible(p)));
  const filtre = (x: Noeud): Noeud => ({
    ...x,
    enfants: x.enfants
      .filter((e) => typeof e === "string" || !cibles.includes(compact(texte(e)).replace(/^✓/, "")))
      .map((e) => (typeof e === "string" ? e : filtre(e))),
  });
  return filtre(n);
}

/* ------------------------------------------------------ les styles */

function hex(r: string, g: string, b: string): string {
  return `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, "0")).join("")}`;
}

/** Coupe sur un séparateur hors parenthèses. */
function coupe(t: string, sep: string): string[] {
  const out: string[] = [];
  let prof = 0;
  let cour = "";
  for (const c of t) {
    if (c === "(") prof += 1;
    if (c === ")") prof -= 1;
    if (c === sep && prof === 0) {
      out.push(cour);
      cour = "";
    } else cour += c;
  }
  out.push(cour);
  return out;
}

/**
 * Une déclaration ramenée à une écriture commune. La capture est une
 * sérialisation du DOM (`0px`, `0.9fr`, `rgb(255, 255, 255)`, `flex: 0 0
 * auto`, ombre couleur en tête), React écrit ce qu'on lui donne.
 */
function valeur(prop: string, v: string): string {
  let x = v
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1")
    .replace(/rgb\((\d+),(\d+),(\d+)\)/g, (_, r, g, b) => hex(r, g, b))
    .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])\b/gi, "#$1$1$2$2$3$3")
    .toLowerCase();
  if (prop === "flex") x = x === "none" ? "0 0 auto" : x === "1" ? "1 1 0%" : x;
  if (prop === "box-shadow") {
    x = coupe(x, ",")
      .map((ombre) => {
        const mots = coupe(ombre.trim(), " ");
        const couleur = mots.filter((m) => /^(rgba?\(|#)/.test(m));
        return [...mots.filter((m) => !couleur.includes(m)), ...couleur].join(" ");
      })
      .join(",");
  }
  return x;
}

function declarations(style: string): Set<string> {
  const out = new Set<string>();
  for (const d of coupe(style, ";")) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    const prop = d.slice(0, i).trim().toLowerCase();
    if (!prop || prop.startsWith("-webkit-")) continue;
    out.add(`${prop}:${valeur(prop, d.slice(i + 1))}`);
  }
  // `border-top: none` sérialisé par le navigateur en ses trois longues.
  for (const cote of ["border-top", "border-bottom", "border"]) {
    const longues = [`${cote}-width:medium`, `${cote}-style:none`, `${cote}-color:currentcolor`];
    if (longues.every((l) => out.has(l))) {
      for (const l of longues) out.delete(l);
      out.add(`${cote}:none`);
    }
  }
  return out;
}

/** Ajout toléré sur le site : `next/image` en `fill` exige un parent positionné. */
const TOLERES = new Set(["position:relative"]);

function memeDessin(capture: Set<string>, site: Set<string>): boolean {
  for (const d of capture) if (!site.has(d)) return false;
  for (const d of site) if (!capture.has(d) && !TOLERES.has(d)) return false;
  return true;
}

/**
 * Les éléments stylés de la capture que l'on compare. Écartés, et pourquoi :
 * les images (balise `img` côté capture, `next/image` côté site, même cadrage
 * vérifié à l'œil et au pixel) et le fond photo de la maquette ; les liens et
 * le gras DANS le texte, que `TexteRiche` rend nus et que la feuille de style
 * habille (`.riche`, `.chapo`…) ; l'intérieur du panneau de formulaire, qui
 * est le formulaire partagé `FormulaireContact`.
 */
function styles(section: Noeud, cote: "capture" | "site"): Noeud[] {
  const horsFormulaire = (n: Noeud): Noeud[] => {
    const out: Noeud[] = [];
    for (const e of n.enfants) {
      if (typeof e === "string") continue;
      const st = e.attrs.style ?? "";
      const panneauFormulaire = st.replace(/\s/g, "").includes("padding:32px34px34px");
      if (e.balise === "form") continue;
      if (st && e.balise !== "img" && e.balise !== "input" && !st.includes("url(")) {
        const lienTexte = cote === "capture" && e.balise === "a" && st.includes("text-decoration");
        if (e.balise !== "strong" && !lienTexte) out.push(e);
      }
      if (!panneauFormulaire) out.push(...horsFormulaire(e));
    }
    return out;
  };
  return horsFormulaire(section);
}

/* -------------------------------------------- la comparaison d'une page */

const INTERDITS: RegExp[] = [
  /—/,
  /24 ?h\b/i,
  /7 ?j ?\/ ?7/i,
  /\brégie\b/i,
  /intérim/i,
  /mise à disposition/i,
  /sur mesure/i,
  /sans engagement/i,
  /notamment/i,
  /\blevier/i,
  /clé en main/i,
  /concrètement/i,
  /incontournable/i,
  /découvrez/i,
  /clients[^.]{0,30}réguliers|réguliers[^.]{0,10}clients/i,
  /Limonest/,
  /Teamtailor/i,
  /\d\s?%\s+des\s+candidats/i,
  /agences?\b[^.]{0,40}\ben France|en France[^.]{0,40}\bagences?\b/i,
];

/** Les écarts du formulaire partagé, déclarés dans `offre/PanneauFormulaire.tsx`. */
function sansEcartsFormulaire(html: string): string {
  return html.replace(/<form\b[\s\S]*?<\/form>/g, (form) =>
    form
      .replace(/<div aria-hidden="true"[^>]*><label[^>]*>Site web<\/label>[\s\S]*?<\/div>/g, "")
      .replace(/<p[^>]*>Données traitées par Migen[\s\S]*?<\/p>/g, ""),
  );
}

function sectionsDe(html: string): Noeud[] {
  const racine = arbre(html);
  const main = descendants(racine, (n) => n.balise === "main")[0];
  return descendants(main ?? racine, (n) => n.balise === "section");
}

function rend(relais: Relais): string {
  return renderToStaticMarkup(<PageEditoriale titre={relais.titre_h1} contenu={relais.contenu} />);
}

/**
 * LES ORNEMENTS DU REPLI MOBILE, retires avant toute comparaison depuis le
 * 12/10. Les sections d'un guide se replient au telephone, motif « Blocs
 * communs (pliables) » de la maquette mobile : chaque bascule porte un chevron,
 * chaque section repliee un resume, et depuis le 12/10 une ETIQUETTE, tous
 * marques `data-mobile-seulement` et masques au-dessus de 880 px. La CAPTURE
 * est de bureau et n'a aucune raison de les porter.
 *
 * LA REGLE A ETE ELARGIE LE 12/10, et voici le defaut qu'elle corrige. La
 * premiere version coupait sur la PREMIERE balise fermante du meme nom :
 *
 *     /<(\w+)[^>]*\sdata-mobile-seulement[^>]*>[\s\S]*?<\/\1>/g
 *
 * Elle suffisait tant que l'ornement etait une feuille (le chevron, un `<p>`).
 * L'etiquette de la bascule, elle, est faite de DEUX `<span>` IMBRIQUES : la
 * coupe tombait sur la fermeture du premier enfant, et laissait le second
 * dehors. La porte voyait alors le titre de section une fois de trop et
 * refusait les trois guides, pour un texte que personne ne voit sur bureau.
 *
 * La version ci-dessous compte les ouvertures et les fermetures de la meme
 * balise, et retire le SOUS-ARBRE ENTIER. Elle garde sa capacite a refuser :
 * seuls les elements portant cet attribut disparaissent, et un ornement dont
 * la balise n'est jamais refermee n'est PAS retire, parce qu'on ne devine pas.
 * Les controles en bas de fichier le prouvent dans les deux sens.
 */

/**
 * LA BIBLIOTHEQUE « Ressources v2 », mise de cote avant la comparaison aux
 * sections de la capture, et SEULEMENT pour cette comparaison.
 *
 * POURQUOI ELLE DOIT SORTIR DU CADRE. Depuis le 13/10, `/ressources/` porte en
 * plus de sa capture la bibliotheque filtrable de
 * `maquette/colis-13-10/Migen - Ressources.html` : menu lateral, 48 cartes,
 * sommaire complet. La capture `maquette/rendu/ressources.html` a ete prise
 * AVANT ce colis et ne la connait pas. La laisser dans le cadre faisait dire a
 * la porte « 12 sections rendues, 11 dans la capture », puis dix fois « texte
 * different », parce que tous les index glissaient d'un cran : onze faux
 * defauts pour une seule addition declaree.
 *
 * CE N'EST PAS UN AVEUGLEMENT, et trois choses le garantissent :
 *   1. LA COUPE EST NOMMEE. Elle ne retire que `<section id="bibliotheque">`,
 *      pas une section quelconque, pas une section par son rang.
 *   2. LES CONTROLES GLOBAUX GARDENT LA BIBLIOTHEQUE SOUS LES YEUX. Le compte
 *      de H1, les liens morts, les cibles hors domaine, les mots interdits et
 *      les phrases retirees travaillent sur `htmlBrut`, qui la porte encore.
 *      Un `href="#"` ou un interdit dans la bibliotheque tombe donc toujours.
 *   3. SON CONTENU A SA PROPRE PORTE,
 *      `components/site/ressources-hub/verification-hub.tsx`, qui le compare a
 *      la donnee de la maquette et exige ses 48 URL.
 *
 * ET ELLE SAIT ECHOUER : les temoins du bas de fichier exigent qu'une section
 * de la capture reellement perdue soit toujours vue, bibliotheque retiree ou
 * non, et qu'un interdit glisse dans la bibliotheque soit toujours refuse.
 */
function sansBibliotheque(html: string): string {
  return html.replace(/<section id="bibliotheque"[\s\S]*?<\/section>/, "");
}

function controle(relais: Relais, capture: string, brut: string): string[] {
  const htmlBrut = sansOrnementsMobiles(brut);
  const ecarts: string[] = [];
  const html = sansBibliotheque(sansEcartsFormulaire(htmlBrut));
  const ref = sectionsDe(capture).map((n) => sansRetraits(n, relais.phrases_retirees));
  const site = sectionsDe(html);
  if (ref.length !== site.length) ecarts.push(`${site.length} sections rendues, ${ref.length} dans la capture`);

  ref.forEach((sr, i) => {
    const ss = site[i];
    if (!ss) return;
    // Les sections imbriquées se comparent chacune pour elle-même : le texte
    // et le dessin d'une section contenante ne regardent que ses propres nœuds.
    const sansImbriquees = (n: Noeud): Noeud => ({
      ...n,
      enfants: n.enfants.map((e) =>
        typeof e === "string" ? e : e.balise === "section" ? "" : sansImbriquees(e),
      ),
    });
    let attendu = compact(texte(sansImbriquees(sr)));
    for (const p of relais.phrases_retirees) attendu = attendu.replace(compact(lisible(p)), "");
    const obtenu = compact(texte(sansImbriquees(ss)));
    if (attendu !== obtenu) {
      let k = 0;
      while (k < attendu.length && attendu[k] === obtenu[k]) k += 1;
      ecarts.push(
        `section ${i} : texte différent à « ${attendu.slice(Math.max(0, k - 30), k + 40)} » / rendu « ${obtenu.slice(Math.max(0, k - 30), k + 40)} »`,
      );
    }

    const eltsSite = styles(sansImbriquees(ss), "site").map((n) => declarations(n.attrs.style));
    let curseur = 0;
    for (const n of styles(sansImbriquees(sr), "capture")) {
      const voulu = declarations(n.attrs.style);
      let j = curseur;
      while (j < eltsSite.length && !memeDessin(voulu, eltsSite[j])) j += 1;
      if (j === eltsSite.length) {
        ecarts.push(`section ${i} : dessin absent du rendu <${n.balise} style="${n.attrs.style}">`);
        break;
      }
      curseur = j + 1;
    }
  });

  if ((htmlBrut.match(/<h1\b/g) ?? []).length !== 1) ecarts.push("H1 absent ou en double");
  if (/href="#"/.test(htmlBrut)) ecarts.push('lien mort href="#"');
  for (const m of htmlBrut.matchAll(/href="([^"]*)"/g)) {
    const h = m[1];
    if (!/^(\/(?!\/)|#[a-z]|tel:\+33)/.test(h)) ecarts.push(`cible hors domaine : ${h}`);
  }
  const lu = decode(htmlBrut.replace(/<[^>]+>/g, " "));
  for (const motif of INTERDITS) {
    const m = lu.match(motif);
    if (m) ecarts.push(`interdit rendu : « ${m[0]} »`);
  }
  for (const p of relais.phrases_retirees) {
    if (compact(lu).includes(compact(lisible(p)))) ecarts.push(`phrase retirée pourtant rendue : « ${p.slice(0, 50)} »`);
  }
  return ecarts;
}

/* ------------------------------------------------------------ les pages */

const nomDe = (url: string) => url.replace(/^\/|\/$/g, "").replace(/\//g, "-");
const cleDe = (url: string) => url.replace(/^\/|\/$/g, "").replace(/\//g, "--");
const lisRelais = (url: string): Relais =>
  JSON.parse(readFileSync(join(RACINE, "supabase", "import", "gabarits-maquette", `${nomDe(url)}.json`), "utf8"));
/** La capture, décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const lisCapture = (url: string) =>
  appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", `${cleDe(url)}.html`), "utf8"));

/**
 * L'ETIQUETTE DE CHAQUE SECTION REPLIABLE, controlee pour elle-meme.
 *
 * POURQUOI CE CONTROLE EXISTE. `sansOrnementsMobiles` retire l'etiquette avant
 * toute comparaison a la capture, et c'est juste : la capture est de bureau,
 * l'etiquette n'y paraît pas. Mais ce retrait ouvre un trou, et il faut le
 * refermer ici : une etiquette qui annoncerait un autre titre que celui de sa
 * section ne serait vue par PERSONNE, ni par la comparaison a la capture, ni
 * par un visiteur de bureau. Au telephone, en revanche, c'est la SEULE chose
 * que le visiteur lit d'une section repliee.
 *
 * Ce qui est exige de chaque bloc repliable du gabarit guide :
 *  · exactement UNE etiquette, dans la bascule, marquee `data-mobile-seulement`
 *    pour que les portes de bureau sachent l'ecarter ;
 *  · son texte est le numero de la section suivi du titre de la section, mot
 *    pour mot ;
 *  · le vrai `<h2>` est HORS de la bascule : c'est la regression du 12/10,
 *    celle qui servait le titre a la taille mobile et vidait sa place.
 */
function controleEtiquettes(html: string): string[] {
  const ecarts: string[] = [];
  const blocs = descendants(arbre(html), (n) => n.balise === "details" && "data-pliable-mobile" in n.attrs);
  for (const bloc of blocs) {
    const bascules = bloc.enfants.filter((e): e is Noeud => typeof e !== "string" && e.balise === "summary");
    const bascule = bascules[0];
    if (!bascule) {
      ecarts.push("un bloc repliable sans bascule");
      continue;
    }
    /* L'ÉTIQUETTE SE RECONNAÎT À TROIS CHOSES, et il en faut bien trois.
       Son marquage `data-mobile-seulement`, l'ABSENCE d'`aria-hidden` (le
       chevron de la même bascule porte les deux) et sa balise, un `<span>`.
       On ne peut pas la nommer par sa classe : les modules CSS ne sont pas
       hachés hors du build.

       LA BALISE A ÉTÉ AJOUTÉE LE 13/10, et elle répare une porte rouge.
       Ce contrôle ne regardait que les deux premiers critères, et comptait
       donc AUSSI le résumé de deux lignes, qui porte le même marquage et n'a
       pas d'`aria-hidden` puisqu'il doit être lu. Il annonçait « 2 étiquettes
       dans une bascule » sur les neuf blocs de la page pilote, et sa propre
       assertion de contrôle tombait avec.

       Les deux décisions du 12/10 se contredisaient : le résumé est entré
       dans le `<summary>` (seul endroit où un navigateur récent le peint
       encore) le jour même où ce contrôle y exigeait un unique élément
       marqué. Ce sont bien deux ornements distincts, et la porte doit savoir
       les distinguer, pas en refuser un. */
    const marquesLisibles = bascule.enfants.filter(
      (e): e is Noeud => typeof e !== "string" && "data-mobile-seulement" in e.attrs && !("aria-hidden" in e.attrs),
    );
    const etiquettes = marquesLisibles.filter((e) => e.balise === "span");
    const resumes = marquesLisibles.filter((e) => e.balise === "p");
    const autres = marquesLisibles.filter((e) => e.balise !== "span" && e.balise !== "p");
    if (etiquettes.length !== 1) {
      ecarts.push(`${etiquettes.length} étiquette(s) dans une bascule, il en faut exactement une`);
      continue;
    }
    if (resumes.length > 1) {
      ecarts.push(`${resumes.length} résumé(s) dans une bascule, il en faut au plus un`);
    }
    if (autres.length > 0) {
      ecarts.push(
        `ornement mobile inattendu dans une bascule : <${autres.map((e) => e.balise).join(", ")}>, ` +
          `seuls l'étiquette (span) et le résumé (p) y ont leur place`,
      );
    }
    /* LE RÉSUMÉ DOIT ÊTRE DANS LA BASCULE, ET C'EST UN PIÈGE DÉJÀ PAYÉ.
       Les navigateurs récents enveloppent tout le contenu d'un `<details>`
       SAUF son `<summary>` dans le pseudo-élément `::details-content`, et lui
       posent `content-visibility: hidden` quand le bloc est FERMÉ. Or fermé
       est le seul état où le résumé doit paraître : posé en FRÈRE du
       `<summary>`, il n'est jamais peint. Les deux lignes de résumé de
       1 092 blocs sur 233 pages sont restées invisibles, et personne ne l'a
       vu parce qu'elles sont bien dans le HTML servi. Seule une porte qui
       regarde OÙ il est peut le dire sans ouvrir un navigateur. */
    const resumesEgares = bloc.enfants.filter(
      (e): e is Noeud =>
        typeof e !== "string" &&
        e.balise === "p" &&
        "data-mobile-seulement" in e.attrs &&
        !("aria-hidden" in e.attrs),
    );
    if (resumesEgares.length > 0) {
      ecarts.push(
        `le résumé est FRÈRE du <summary> et non dedans : ` +
          `fermé, le navigateur ne le peint jamais (content-visibility sur ::details-content)`,
      );
    }
    const titres = descendants(bloc, (n) => n.balise === "h2");
    if (titres.length !== 1) {
      ecarts.push(`${titres.length} titre(s) H2 dans un bloc repliable, il en faut exactement un`);
      continue;
    }
    const titre = titres[0];
    if (descendants(bascule, (n) => n.balise === "h2").length > 0) {
      ecarts.push(`« ${texte(titre).trim()} » : le vrai H2 est DANS la bascule, il doit rester dans le corps`);
    }
    /* `endsWith` et non `===` : l'étiquette porte le numéro de section devant
       le titre, exactement comme l'en-tête de la capture. */
    const attendu = compact(texte(titre));
    const servi = compact(texte(etiquettes[0]));
    if (!servi.endsWith(attendu)) {
      ecarts.push(`étiquette « ${texte(etiquettes[0]).trim()} » ne reprend pas le titre « ${texte(titre).trim()} »`);
    }
  }
  return ecarts;
}

let echecs = 0;
let blocsVus = 0;
for (const url of PAGES) {
  const relais = lisRelais(url);
  assert.equal(relais.url, url);
  const servi = rend(relais);
  const ecarts = [...controle(relais, lisCapture(url), servi), ...controleEtiquettes(servi)];
  blocsVus += descendants(arbre(servi), (n) => n.balise === "details" && "data-pliable-mobile" in n.attrs).length;
  if (ecarts.length) {
    echecs += 1;
    console.log(`✗ ${url}\n  ${ecarts.join("\n  ")}`);
  } else console.log(`✓ ${url}`);
}
/* Un gabarit qui perdrait son repli mobile passerait ce contrôle sans un mot :
   zéro bloc, zéro écart. Le compte est donc exigé. */
assert.ok(blocsVus >= 30, `blocs repliables servis : ${blocsVus}, attendu au moins 30 sur les huit pages`);
console.log(`✓ ${blocsVus} blocs repliables servis, chacun avec son étiquette et son H2 hors de la bascule`);

/* Le relais forcé : la base sert ces deux pages avec un ancien contenu
   éditorial sans vue ; c'est quand même le dessin de la capture qui sort.
   Depuis le 08/10, ce n'est plus `PageEditoriale` qui tranche mais
   `lib/contenu.ts` : « le fichier gagne toujours », son relais remplace le
   contenu de la base. Prouvé aux deux bouts : la règle est celle du module,
   l'ancien corps seul ne donne pas le dessin de la capture, le relais si. */
const MODULE_CONTENU = readFileSync(join(RACINE, "lib", "contenu.ts"), "utf8");
assert.match(MODULE_CONTENU, /const relaisActif = !!surDisque;/, "relais forcé : lib/contenu.ts ne fait plus gagner le fichier dès qu'il existe");
assert.match(MODULE_CONTENU, /relaisActif \? surDisque\.contenu : page\.contenu/, "relais forcé : lib/contenu.ts ne sert plus le contenu du fichier");
for (const url of ["/ressources/fiches-pratiques/", "/ressources/fiches-techniques/"]) {
  const relais = lisRelais(url);
  const ancien = renderToStaticMarkup(
    <PageEditoriale
      titre={relais.titre_h1}
      contenu={{ gabarit: "editorial", blocs: [{ type: "paragraphe", texte: "Ancien corps en base." }] }}
    />,
  );
  assert.ok(!ancien.includes("Ressources · rayons"), `relais forcé : ${url}, l'ancien corps ne porte pas la vue`);
  assert.ok(relais.contenu.rubrique, `relais forcé : ${url}, le relais n'a pas sa vue de rubrique`);
  const servi = rend(relais);
  assert.ok(servi.includes("Ressources · rayons") && !servi.includes("Ancien corps"), `relais forcé : ${url}`);
}
// Et une page éditoriale ordinaire garde sa colonne de lecture.
const ordinaire = renderToStaticMarkup(
  <PageEditoriale titre="Une fiche métier" contenu={{ gabarit: "editorial", blocs: [{ type: "paragraphe", texte: "Corps." }] }} />,
);
assert.ok(ordinaire.includes("Corps.") && !ordinaire.includes("cx-form"), "page éditoriale ordinaire");

/* --------------------------------------- la preuve qu'il sait échouer */

const pilote = lisRelais("/guides/choisir-une-entreprise-de-maintenance/");
const capturePilote = lisCapture(pilote.url);
const rubrique = lisRelais("/ressources/fiches-pratiques/");
const captureRubrique = lisCapture(rubrique.url);

function altere(r: Relais, modifie: (c: ContenuEditorial) => void): Relais {
  const copie = structuredClone(r);
  modifie(copie.contenu);
  return copie;
}

const FAUTES: [string, string[], RegExp][] = [
  [
    "un mot changé",
    controle(
      pilote,
      capturePilote,
      rend(altere(pilote, (c) => void (c.edito!.chapeau = c.edito!.chapeau.replace("rarement", "souvent")))),
    ),
    /texte différent/,
  ],
  [
    "une section retirée",
    controle(pilote, capturePilote, rend(altere(pilote, (c) => void c.edito!.sections.pop()))),
    /sections rendues/,
  ],
  [
    "un style changé",
    controle(rubrique, captureRubrique, rend(rubrique).replace("gap:52px", "gap:50px")),
    /dessin absent/,
  ],
  [
    "une phrase interdite réintroduite",
    controle(
      lisRelais("/ressources/"),
      lisCapture("/ressources/"),
      rend(
        altere(lisRelais("/ressources/"), (c) => {
          const b = c.edito!.sections[6].blocs[7];
          const reguliers = lisRelais("/ressources/").phrases_retirees.find((p) => p.includes("réguliers"));
          if (b.type === "p") b.texte = `${reguliers}${b.texte}`;
        }),
      ),
    ),
    /interdit rendu|phrase retirée pourtant rendue/,
  ],
  [
    "un lien mort",
    controle(rubrique, captureRubrique, rend(rubrique).replace('href="tel:+33478337205"', 'href="#"')),
    /lien mort/,
  ],
];

/* LE RETRAIT DES ORNEMENTS MOBILES SAIT-IL ENCORE ECHOUER ?
   Une regle qui retire trop rend la porte muette : elle laisserait passer un
   texte absent de la capture. Une regle qui retire trop peu refuse du conforme,
   et c'est le defaut du 12/10. Les deux sens sont prouves ici. */
{
  const etiquette =
    '<span data-mobile-seulement="" class="e"><span style="a">02</span><span style="b">Le titre</span></span>';
  assert.equal(
    sansOrnementsMobiles(`<div>avant${etiquette}apres</div>`).replace(/\s+/g, ""),
    "<div>avantapres</div>",
    "ornement IMBRIQUE : le sous-arbre entier doit partir, les deux `<span>` compris",
  );
  assert.equal(
    sansOrnementsMobiles('<p>a<span data-mobile-seulement="">›</span>b</p>').replace(/\s+/g, ""),
    "<p>ab</p>",
    "ornement FEUILLE : le chevron part comme avant",
  );
  assert.ok(
    sansOrnementsMobiles('<div><span class="e"><b>Le titre</b></span></div>').includes("Le titre"),
    "un element SANS l'attribut ne doit jamais partir : sinon la porte devient muette",
  );
  assert.ok(
    sansOrnementsMobiles('<section><h2>Titre</h2><span data-mobile-seulement="">x</span><p>Corps</p></section>')
      .includes("Titre") &&
      sansOrnementsMobiles('<section><h2>Titre</h2><span data-mobile-seulement="">x</span><p>Corps</p></section>')
        .includes("Corps"),
    "le voisinage d'un ornement reste intact",
  );
  assert.ok(
    sansOrnementsMobiles('<div><span data-mobile-seulement="">jamais refermé</div>').includes("jamais refermé"),
    "balise non refermée : on ne devine pas, on ne retire rien",
  );
  console.log("✓ retrait des ornements mobiles : imbriqué, feuille, voisinage et balise ouverte");
}

/* ET LE CONTROLE DES ETIQUETTES SAIT-IL ECHOUER ? Les trois regressions
   possibles sont rejouees sur la page pilote, chacune doit être vue. */
{
  const servi = rend(pilote);
  assert.deepEqual(controleEtiquettes(servi), [], "la page pilote doit passer le contrôle des étiquettes");
  /* On vise le SECOND `<span>` de la première étiquette, pas le titre partout
     dans la page : le même mot paraît aussi dans le sommaire et dans le H2,
     et les remplacer tous les trois ne prouverait rien. */
  const titreDivergent = servi.replace(
    /(<span data-mobile-seulement=""[^>]*><span[^>]*>[^<]*<\/span><span[^>]*>)([^<]*)(<\/span>)/,
    (_tout, avant: string, _titre: string, apres: string) =>
      `${avant}Un titre qui n'est pas celui de la section${apres}`,
  );
  assert.notEqual(titreDivergent, servi, "la faute « titre divergent » n'a rien changé au rendu");
  assert.ok(
    controleEtiquettes(titreDivergent).some((e) => /ne reprend pas le titre/.test(e)),
    "étiquette : un titre qui diverge de sa section doit être vu",
  );
  assert.ok(
    controleEtiquettes(servi.replace(/ data-mobile-seulement=""/, "")).some((e) => /étiquette\(s\)/.test(e)),
    "étiquette : la perte du marquage `data-mobile-seulement` doit être vue",
  );
  /* Le H2 remis DANS la bascule, c'est-à-dire le défaut du 12/10 au matin. */
  const dansLaBascule = servi.replace(
    /(<summary[^>]*>)([\s\S]*?)(<\/summary>)/,
    (_tout, ouvre: string, dedans: string, ferme: string) => `${ouvre}${dedans}<h2>Un titre dans la bascule</h2>${ferme}`,
  );
  assert.ok(
    controleEtiquettes(dansLaBascule).some((e) => /DANS la bascule|il en faut exactement un/.test(e)),
    "étiquette : un H2 remis dans la bascule doit être vu",
  );
  /* LE RÉSUMÉ SORTI DE LA BASCULE, c'est-à-dire le défaut qui a laissé
     1 092 résumés invisibles sur 233 pages. On déplace le `<p>` marqué juste
     APRÈS la fermeture du `<summary>`, là où il était posé avant le 12/10. */
  const resumeEgare = servi.replace(
    /(<p data-mobile-seulement=""[^>]*>[\s\S]*?<\/p>)([\s\S]*?<\/summary>)/,
    (_tout, resume: string, reste: string) => `${reste}${resume}`,
  );
  assert.notEqual(resumeEgare, servi, "la faute « résumé égaré » n'a rien changé au rendu");
  assert.ok(
    controleEtiquettes(resumeEgare).some((e) => /FRÈRE du <summary>/.test(e)),
    "étiquette : un résumé posé en frère du <summary> doit être vu",
  );
  /* UN SECOND RÉSUMÉ dans la même bascule. */
  const deuxResumes = servi.replace(
    /(<p data-mobile-seulement=""[^>]*>[\s\S]*?<\/p>)/,
    (_tout, resume: string) => `${resume}${resume}`,
  );
  assert.notEqual(deuxResumes, servi, "la faute « deux résumés » n'a rien changé au rendu");
  assert.ok(
    controleEtiquettes(deuxResumes).some((e) => /résumé\(s\) dans une bascule/.test(e)),
    "étiquette : deux résumés dans une bascule doivent être vus",
  );
  /* ET LE CONTRÔLE NÉGATIF : le résumé À SA PLACE, dans la bascule, ne doit
     RIEN déclencher. Sans lui, une règle qui crierait sur tous les résumés
     passerait pour une règle qui sait échouer. */
  assert.ok(
    /<summary[^>]*>[\s\S]*?<p data-mobile-seulement=""[\s\S]*?<\/summary>/.test(servi),
    "la page pilote doit bien porter un résumé DANS sa bascule, sinon ce contrôle ne prouve rien",
  );
  assert.deepEqual(
    controleEtiquettes(servi),
    [],
    "contrôle négatif : une bascule avec son étiquette ET son résumé à leur place doit rester muette",
  );
  console.log(
    "✓ contrôle des étiquettes : titre divergent, marquage perdu, H2 dans la bascule,\n" +
      "  résumé égaré hors de la bascule et résumé en double, tous vus ;\n" +
      "  étiquette et résumé à leur place restent muets",
  );
}

for (const [nom, ecarts, attendu] of FAUTES) {
  assert.ok(
    ecarts.some((e) => attendu.test(e)),
    `faute « ${nom} » NON vue : ${ecarts.join(" | ") || "aucun écart"}`,
  );
  console.log(`✓ faute vue : ${nom}`);
}

/* ------------------------------------------- `sansBibliotheque` sait échouer
 *
 * Trois témoins, dont deux négatifs au sens strict. Ils existent parce qu'une
 * coupe posée dans une porte est le moyen le plus simple de l'aveugler sans
 * le dire : il faut donc prouver qu'elle ne retire QUE ce qu'elle annonce.
 */
{
  const hub = lisRelais("/ressources/");
  const servi = rend(hub);
  assert.match(
    servi,
    /<section id="bibliotheque"/,
    "le hub des ressources ne porte plus sa bibliothèque : ces témoins ne prouveraient rien",
  );

  /* 1. NÉGATIF : une section de la capture réellement perdue doit être vue,
     bibliothèque ou pas. La coupe ne doit pas servir d'excuse à un manque. */
  const ampute = servi.replace(/<section id="cx-form"[\s\S]*?<\/section>/, "");
  assert.notEqual(ampute, servi, "la faute « section du gabarit retirée » n'a rien changé au rendu");
  const ecartsAmpute = controle(hub, lisCapture("/ressources/"), ampute);
  assert.ok(
    ecartsAmpute.some((e) => /sections rendues/.test(e)),
    `coupe de la bibliothèque : une section du gabarit retirée doit rester vue, écarts obtenus : ${
      ecartsAmpute.join(" | ") || "aucun"
    }`,
  );

  /* 2. NÉGATIF : un interdit glissé DANS la bibliothèque doit être refusé. Les
     contrôles globaux travaillent sur le rendu complet, et c'est ce que ce
     témoin vérifie, pas ce qu'il suppose. */
  const souille = servi.replace(
    /<section id="bibliotheque"/,
    '<section id="bibliotheque" data-faute="1"><p>Teamtailor</p><div',
  );
  const ecartsSouille = controle(hub, lisCapture("/ressources/"), souille);
  assert.ok(
    ecartsSouille.some((e) => /interdit rendu/.test(e)),
    `coupe de la bibliothèque : un interdit posé dans la bibliothèque doit rester vu, écarts obtenus : ${
      ecartsSouille.join(" | ") || "aucun"
    }`,
  );

  /* 3. POSITIF : la bibliothèque telle qu'elle est rendue n'ajoute AUCUN écart
     à ceux que la porte relevait déjà sans elle. Sans ce témoin, une coupe
     trop large passerait pour une coupe juste. */
  const avec = controle(hub, lisCapture("/ressources/"), servi);
  const sans = controle(hub, lisCapture("/ressources/"), sansBibliotheque(servi));
  assert.deepEqual(
    avec,
    sans,
    `contrôle positif : la bibliothèque change le verdict de la porte. Avec : ${avec.join(" | ")} / sans : ${sans.join(" | ")}`,
  );
  console.log(
    "✓ coupe de la bibliothèque : une section perdue et un interdit glissé dedans\n" +
      "  restent vus, et la bibliothèque n'ajoute aucun écart de son côté",
  );
}

if (echecs) {
  console.log(`\n${echecs} page(s) non conforme(s) à leur capture`);
  process.exit(1);
}
console.log(`\n${PAGES.length} pages conformes à leur capture, ${FAUTES.length} fautes injectées toutes vues`);
