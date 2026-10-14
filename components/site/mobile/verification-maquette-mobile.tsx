/**
 * PORTE DES STYLES PARTAGÉS DE LA MAQUETTE MOBILE V2.
 *
 *   bun components/site/mobile/verification-maquette-mobile.tsx
 *   bun components/site/mobile/verification-maquette-mobile.tsx --controle
 *
 * LA RÉFÉRENCE est `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`,
 * RELUE à chaque exécution : chaque valeur de la feuille partagée doit y
 * figurer telle quelle. Si la maquette change, la porte le voit.
 *
 * CE QU'ELLE TIENT, sur la page de démonstration non routée
 * (`demonstration-maquette.tsx`), rendue dans un vrai navigateur avec
 * `app/globals.css` :
 *
 * 1. LES RELEVÉS : chaque valeur posée par la section « styles partagés de la
 *    maquette mobile v2 » existe dans dc.html, et dans la feuille.
 * 2. À 390 PX, CE QUE LE NAVIGATEUR EN FAIT : carte blanche de 20 px de rayon,
 *    filet de la maquette, 12 px entre deux cartes, numéro en colonne, chevron
 *    en pastille de 28 px, résumé de 12,5 px effacé à l'ouverture ; FAQ en
 *    liste, 8 px entre deux questions, « + » qui tourne de 45° et passe à
 *    l'orange ; tuiles en 2 x 2. Les styles en ligne de la démonstration
 *    imitent ceux du site : l'attribut seul doit les battre.
 * 3. LE NUMÉRO N'EST PAS DANS LE TEXTE : `textContent` identique à 390 et à
 *    1 280 px et à celui du HTML servi, aucun chiffre ajouté. Le numéro est
 *    pourtant LU par le navigateur : l'arbre d'accessibilité porte 01 à 04,
 *    et la carte `data-sans-numero` ne décale pas la suite.
 * 4. RIEN NE CHANGE À 1 280 PX : le style calculé de CHAQUE élément est le
 *    même avec et sans la section partagée.
 *
 * TÉMOINS (contrôles négatifs), exécutés à chaque fois : une section sortie de
 * son `@media`, un numéro écrit dans le texte, un relevé absent de la
 * maquette et un rayon changé doivent chacun faire tomber le contrôle
 * concerné. `--controle` n'exécute que ces témoins, et en détail.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium, type Browser } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";

import DemonstrationMaquetteMobile, { NOM_FAQ_DEMONSTRATION } from "./demonstration-maquette";

const MAQUETTE = "maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html";
const GLOBALS = "app/globals.css";
const DEBUT_SECTION = "/* =========================================================================\n   STYLES PARTAGÉS DE LA MAQUETTE MOBILE V2";

const dc = readFileSync(MAQUETTE, "utf8");
const css = readFileSync(GLOBALS, "utf8");
const debut = css.indexOf(DEBUT_SECTION);
assert.ok(debut > 0, "globals.css : la section « styles partagés de la maquette mobile v2 » a disparu");
const section = css.slice(debut);
const cssSansSection = css.slice(0, debut);

/* --------------------------------------------- 1. relevés de la maquette */

interface Releve {
  motif: string;
  /** La sous-chaîne exacte de dc.html. */
  maquette: string;
  /** Sa traduction dans la feuille partagée. */
  feuille: string;
}

const RELEVES: readonly Releve[] = [
  { motif: "carte : fond, filet", maquette: "border-radius:20px;background:#fff;border:1px solid rgba(28,27,25,.08);overflow:hidden", feuille: "--mm-filet: rgba(28, 27, 25, 0.08)" },
  { motif: "carte : rayon", maquette: "border-radius:20px;background:#fff", feuille: "--mm-rayon-carte: 20px" },
  { motif: "carte : écart entre deux", maquette: 'm: "12px 18px 0", cols: "22px minmax(0,1fr) 28px"', feuille: "margin-top: 12px" },
  { motif: "carte : colonnes", maquette: 'cols: "22px minmax(0,1fr) 28px"', feuille: "grid-template-columns: 22px minmax(0, 1fr) 28px" },
  { motif: "carte : bascule", maquette: "gap:12px;align-items:center;padding:15px 16px", feuille: "padding: 15px 16px" },
  { motif: "carte : numéro", maquette: "font:600 11px ui-monospace,Menlo,monospace;color:#ff7c3c\">{{ sx.n }}", feuille: "font: 600 11px ui-monospace, Menlo, monospace" },
  { motif: "carte : numéro sur deux chiffres", maquette: 'String(n).padStart(2, "0")', feuille: "decimal-leading-zero" },
  { motif: "carte : sur-titre", maquette: "font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:#77736d;margin-bottom:3px", feuille: "font: 600 10.5px var(--fb) !important" },
  { motif: "carte : titre", maquette: "font:600 16.5px/1.3 var(--ft);letter-spacing:-.025em", feuille: "font: 600 16.5px/1.3 var(--ft) !important" },
  { motif: "carte : résumé", maquette: "margin-top:4px;font:400 12.5px/1.45 var(--fb);color:#77736d", feuille: "font: 400 12.5px/1.45 var(--fb)" },
  { motif: "carte : résumé effacé ouvert", maquette: ".mv details[open]>summary .mv-tease{display:none!important}", feuille: "details[data-carte-numerotee]:not([open]) > summary > p" },
  { motif: "carte : pastille", maquette: "width:28px;height:28px;border-radius:999px;background:rgba(28,27,25,.055);display:grid;place-items:center;font:500 17px/1 var(--fb)", feuille: "font: 500 17px/1 var(--fb)" },
  { motif: "carte : quart de tour", maquette: ".mv details[open]>summary .mv-chev{transform:rotate(90deg)}", feuille: "transform: rotate(90deg)" },
  { motif: "carte : corps", maquette: '<div style="padding:0 16px 6px">', feuille: "padding: 0 16px 6px" },
  { motif: "FAQ : écart", maquette: 'm: j ? "8px 18px 0" : "0 18px 0"', feuille: "gap: 8px !important" },
  { motif: "FAQ : colonnes", maquette: 'cols: "minmax(0,1fr) 28px", ico: "›"', feuille: "grid-template-columns: minmax(0, 1fr) 28px !important" },
  { motif: "FAQ : question", maquette: "font:600 14.5px/1.4 var(--ft);letter-spacing:-.015em;color:#1c1b19", feuille: "font: 600 14.5px/1.4 var(--ft) !important" },
  { motif: "FAQ : « + » ouvert", maquette: ".mv details[open]>summary .mv-plus{transform:rotate(45deg);background:#ff7c3c!important;color:#fff!important}", feuille: "transform: rotate(45deg) !important" },
  { motif: "FAQ : chapô de réponse", maquette: 'lead ? "500 16px/1.6 var(--fb)"', feuille: "font: 500 16px/1.6 var(--fb) !important" },
  { motif: "FAQ : texte de réponse", maquette: '"400 var(--pfs)/1.65 var(--fb)"', feuille: "font: 400 15px/1.65 var(--fb) !important" },
  { motif: "FAQ : titre", maquette: "font:600 21px/1.2 var(--ft);letter-spacing:-.03em", feuille: "font: 600 21px/1.2 var(--ft) !important" },
  { motif: "FAQ : sur-titre", maquette: "font:600 11px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:#ff7c3c;margin-bottom:6px", feuille: "margin: 0 0 6px !important" },
  { motif: "tuiles : grille", maquette: "grid-template-columns:repeat(2,minmax(0,1fr));gap:8px\"><sc-for list=\"{{ sx.stats }}\"", feuille: "grid-template-columns: repeat(2, minmax(0, 1fr)) !important" },
  { motif: "tuiles : tuile", maquette: "padding:14px;border-radius:18px;background:#fff;border:1px solid rgba(28,27,25,.08)", feuille: "--mm-rayon-tuile: 18px" },
  { motif: "tuiles : valeur", maquette: "font:600 21px/1.08 var(--ft);letter-spacing:-.04em;color:#ff7c3c", feuille: "font: 600 21px/1.08 var(--ft) !important" },
  { motif: "tuiles : libellé", maquette: "font:400 12.5px/1.45 var(--fb);color:#4a4845;margin-top:5px", feuille: "margin: 5px 0 0 !important" },
  { motif: "tuiles : titre", maquette: "margin:0 0 10px;font:600 11px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:#ff7c3c\">{{ sx.t }}", feuille: "font: 600 11px var(--fb) !important" },
];

export function relevesManquants(releves: readonly Releve[], maquette: string, feuille: string): string[] {
  const defauts: string[] = [];
  for (const r of releves) {
    if (!maquette.includes(r.maquette)) defauts.push(`${r.motif} : absent de dc.html (« ${r.maquette} »)`);
    if (!feuille.includes(r.feuille)) defauts.push(`${r.motif} : absent de la feuille (« ${r.feuille} »)`);
  }
  return defauts;
}

/* ---------------------------------------------------- outillage de rendu */

const html = renderToStaticMarkup(<DemonstrationMaquetteMobile />);

/** Le texte nu d'un balisage, comme le lit `textContent`. */
function texteDe(balisage: string): string {
  return balisage
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&rsaquo;/g, "›")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * `--font-poppins` est posée par `next/font` sur `<html>` dans le site. Sans
 * elle, tout raccourci `font` qui lit `var(--fb)` devient invalide au calcul,
 * et la porte mesurerait la taille héritée au lieu de la nôtre.
 */
function document_(feuille: string, corps: string): string {
  return `<!doctype html><html lang="fr" style="--font-poppins: sans-serif"><head><meta charset="utf-8"><style>${feuille}</style></head><body>${corps}</body></html>`;
}

/**
 * Les nombres que le navigateur AFFICHE dans la page, contenu généré compris,
 * dans l'ordre : l'arbre d'accessibilité de Chrome porte le texte des
 * `::before`, que ni `textContent` ni l'instantané ARIA de Playwright ne
 * voient. « 00 » est la valeur d'échafaudage des tuiles, écartée.
 */
async function numerosAffiches(page: import("playwright").Page): Promise<string[]> {
  const client = await page.context().newCDPSession(page);
  const { nodes } = (await client.send("Accessibility.getFullAXTree")) as {
    nodes: { role?: { value?: string }; name?: { value?: string } }[];
  };
  await client.detach();
  return nodes
    .filter((n) => n.role?.value === "StaticText")
    .map((n) => n.name?.value ?? "")
    .filter((t) => /^\d\d$/.test(t) && t !== "00");
}

interface Mesure {
  texte: string;
  numeros: string[];
  cartes: {
    numero: boolean;
    rayon: string;
    fond: string;
    filet: string;
    rembourrage: string;
    compteur: string;
    avant: string;
    avantTaille: string;
    avantCouleur: string;
    pastille: string;
    pastilleRayon: string;
    resumeFerme: string;
    resumeOuvert: string;
    resumeTaille: string;
    resumeCouleur: string;
    titreTaille: string;
    surtitreTaille: string;
    surtitreCouleur: string;
    ecartAvecSuivante: number | null;
  }[];
  remiseAZero: string;
  faq: {
    titreTaille: string;
    surtitreTaille: string;
    ecarts: number[];
    colonnes: string;
    questionTaille: string;
    rayon: string;
    fond: string;
    plusFerme: string;
    plusOuvert: string;
    plusOuvertFond: string;
    reponseRembourrage: string;
    chapoTaille: string;
    texteTaille: string;
  };
  tuiles: {
    titreTaille: string;
    memeLigne: boolean;
    deuxColonnes: boolean;
    rayon: string;
    rembourrage: string;
    valeurTaille: string;
    valeurCouleur: string;
    libelleTaille: string;
  };
}

async function mesure(navigateur: Browser, feuille: string, corps: string, largeur: number): Promise<Mesure> {
  // Mouvement réduit : la feuille coupe alors les transitions, et le style lu
  // juste après une ouverture est l'état final, pas le premier pas d'une
  // animation.
  const page = await navigateur.newPage({ viewport: { width: largeur, height: 900 }, reducedMotion: "reduce" });
  await page.setContent(document_(feuille, corps));
  // L'état du téléphone : la page ne s'hydrate pas ici, on referme donc à la
  // main ce que l'effet de `SectionPliableMobile` refermerait (tout sauf la
  // première carte, `toujoursOuvert`).
  await page.evaluate(() => {
    const cartes = [...document.querySelectorAll("details[data-carte-numerotee]")];
    cartes.slice(1).forEach((d) => d.removeAttribute("open"));
  });
  const numeros = await numerosAffiches(page);
  const m = await page.evaluate(() => {
    const cs = (e: Element, p?: string) => getComputedStyle(e, p);
    const cartes = [...document.querySelectorAll<HTMLDetailsElement>("details[data-carte-numerotee]")];
    const resultat = cartes.map((d, i) => {
      const s = d.querySelector("summary")!;
      const pastille = s.querySelector(":scope > [aria-hidden='true']")!;
      const resume = s.querySelector(":scope > p")!;
      const titre = d.querySelector("[data-carte-titre]");
      const surtitre = d.querySelector("[data-carte-surtitre]");
      // Fermé, le résumé est coupé à trois lignes : Chrome rend alors
      // `-webkit-box` + `line-clamp` sous le nom calculé `flow-root`. On lit
      // donc « affiché et coupé à N lignes », ou « none ».
      const etat = () => (cs(resume).display === "none" ? "none" : `coupé à ${cs(resume).webkitLineClamp}`);
      const ouvert = d.open;
      d.open = !ouvert;
      const resumeAutre = etat();
      d.open = ouvert;
      const suivante = cartes[i + 1];
      return {
        numero: !d.hasAttribute("data-sans-numero"),
        rayon: cs(s).borderTopLeftRadius,
        fond: cs(s).backgroundColor,
        filet: `${cs(s).borderTopWidth} ${cs(s).borderTopStyle} ${cs(s).borderTopColor}`,
        rembourrage: `${cs(s).paddingTop} ${cs(s).paddingLeft}`,
        compteur: cs(d).counterIncrement,
        avant: cs(s, "::before").content,
        avantTaille: cs(s, "::before").fontSize,
        avantCouleur: cs(s, "::before").color,
        pastille: `${cs(pastille).width} ${cs(pastille).height}`,
        pastilleRayon: cs(pastille).borderTopLeftRadius,
        resumeFerme: ouvert ? resumeAutre : etat(),
        resumeOuvert: ouvert ? etat() : resumeAutre,
        resumeTaille: cs(resume).fontSize,
        resumeCouleur: cs(resume).color,
        titreTaille: titre ? cs(titre).fontSize : "",
        surtitreTaille: surtitre ? cs(surtitre).fontSize : "",
        surtitreCouleur: surtitre ? cs(surtitre).color : "",
        ecartAvecSuivante: suivante ? Math.round(suivante.getBoundingClientRect().top - d.getBoundingClientRect().bottom) : null,
      };
    });
    const liste = document.querySelector("[data-faq-liste]")!;
    const questions = [...liste.querySelectorAll<HTMLDetailsElement>(":scope > details")];
    const q0 = questions[0];
    const plus = q0.querySelector("summary > [aria-hidden='true']")!;
    const plusFerme = cs(plus).transform;
    q0.open = true;
    const faq = {
      titreTaille: cs(document.querySelector("[data-faq-titre]")!).fontSize,
      surtitreTaille: cs(document.querySelector("[data-faq-surtitre]")!).fontSize,
      ecarts: questions.slice(1).map((q, i) => Math.round(q.getBoundingClientRect().top - questions[i].getBoundingClientRect().bottom)),
      colonnes: cs(q0.querySelector("summary")!).gridTemplateColumns,
      questionTaille: cs(q0.querySelector("summary > :first-child")!).fontSize,
      rayon: cs(q0).borderTopLeftRadius,
      fond: cs(q0).backgroundColor,
      plusFerme,
      plusOuvert: cs(plus).transform,
      plusOuvertFond: cs(plus).backgroundColor,
      reponseRembourrage: cs(q0.querySelector("summary + *")!).padding,
      chapoTaille: `${cs(q0.querySelector("summary + * > p:first-child")!).fontSize} ${cs(q0.querySelector("summary + * > p:first-child")!).fontWeight}`,
      texteTaille: cs(q0.querySelector("summary + * > p:last-child")!).fontSize,
    };
    q0.open = false;
    const tuiles = [...document.querySelectorAll("[data-tuiles-chiffres] > *")];
    const r = tuiles.map((t) => t.getBoundingClientRect());
    return {
      texte: (document.querySelector("main")!.textContent ?? "").replace(/\s+/g, " ").trim(),
      cartes: resultat,
      remiseAZero: cs(document.querySelector("main")!).counterReset,
      faq,
      tuiles: {
        titreTaille: cs(document.querySelector("[data-tuiles-titre]")!).fontSize,
        memeLigne: Math.round(r[0].top) === Math.round(r[1].top),
        deuxColonnes: r[2].top > r[0].bottom && Math.round(r[2].left) === Math.round(r[0].left),
        rayon: cs(tuiles[0]).borderTopLeftRadius,
        rembourrage: cs(tuiles[0]).padding,
        valeurTaille: cs(tuiles[0].firstElementChild!).fontSize,
        valeurCouleur: cs(tuiles[0].firstElementChild!).color,
        libelleTaille: cs(tuiles[0].lastElementChild!).fontSize,
      },
    };
  });
  await page.close();
  return { ...m, numeros };
}

/** Le style calculé de chaque élément (et de son `::before`), pour comparer. */
async function empreinte(navigateur: Browser, feuille: string, corps: string, largeur: number): Promise<string[]> {
  const page = await navigateur.newPage({ viewport: { width: largeur, height: 900 } });
  await page.setContent(document_(feuille, corps));
  const e = await page.evaluate(() =>
    [...document.querySelectorAll("main, main *")].map((el, i) => {
      const s = getComputedStyle(el);
      const a = getComputedStyle(el, "::before");
      // Les propriétés personnalisées (`--mm-*`) sont déclarées sur `:root` à
      // toutes les largeurs et héritées partout : elles ne dessinent rien par
      // elles-mêmes, seules les propriétés réelles comptent.
      const props = [...s]
        .filter((p) => !p.startsWith("--"))
        .sort()
        .map((p) => `${p}:${s.getPropertyValue(p)}`)
        .join(";");
      return `${i}<${el.tagName}> ${props} ::before ${a.content}`;
    }),
  );
  await page.close();
  return e;
}

/* ------------------------------------------------------------- verdicts */

const ORANGE = "rgb(255, 124, 60)";
const BLANC = "rgb(255, 255, 255)";
const FILET = "1px solid rgba(28, 27, 25, 0.08)";
const GRIS = "rgb(119, 115, 109)";

export function defautsMobile(m: Mesure): string[] {
  const d: string[] = [];
  const attendu = (nom: string, vu: unknown, voulu: unknown) => {
    if (vu !== voulu) d.push(`${nom} : ${String(vu)} au lieu de ${String(voulu)}`);
  };
  m.cartes.forEach((c, i) => {
    const n = `carte ${i + 1}`;
    attendu(`${n} rayon`, c.rayon, "20px");
    attendu(`${n} fond`, c.fond, BLANC);
    attendu(`${n} filet`, c.filet, FILET);
    attendu(`${n} rembourrage`, c.rembourrage, "15px 16px");
    attendu(`${n} pastille`, c.pastille, "28px 28px");
    attendu(`${n} pastille ronde`, c.pastilleRayon, "999px");
    /* Trois lignes depuis le 15/10 : les 104 signes du `teaseOf` de la
       maquette en 12,5 px (demande du lot éditorial). */
    attendu(`${n} résumé fermé`, c.resumeFerme, "coupé à 3");
    attendu(`${n} résumé ouvert`, c.resumeOuvert, "none");
    attendu(`${n} résumé taille`, c.resumeTaille, "12.5px");
    attendu(`${n} résumé couleur`, c.resumeCouleur, GRIS);
    if (c.titreTaille) attendu(`${n} titre`, c.titreTaille, "16.5px");
    if (c.surtitreTaille) attendu(`${n} sur-titre`, `${c.surtitreTaille} ${c.surtitreCouleur}`, `10.5px ${GRIS}`);
    if (c.ecartAvecSuivante !== null) attendu(`${n} écart avec la suivante`, c.ecartAvecSuivante, 12);
    if (c.numero) {
      attendu(`${n} compteur`, c.compteur, "carte-numerotee 1");
      attendu(`${n} numéro`, c.avant, "counter(carte-numerotee, decimal-leading-zero)");
      attendu(`${n} numéro`, `${c.avantTaille} ${c.avantCouleur}`, `11px ${ORANGE}`);
    } else {
      attendu(`${n} sans numéro, compteur`, c.compteur, "none");
      attendu(`${n} sans numéro, contenu`, c.avant, "none");
    }
  });
  attendu("remise à zéro par <main>", m.remiseAZero, "carte-numerotee 0");
  // Le numéro AFFICHÉ : 01 à 04, dans l'ordre, et la carte sans numéro ne
  // décale rien.
  attendu("numéros affichés", m.numeros.join(" "), "01 02 03 04");
  const f = m.faq;
  attendu("FAQ titre", f.titreTaille, "21px");
  attendu("FAQ sur-titre", f.surtitreTaille, "11px");
  attendu("FAQ écarts", f.ecarts.join(" "), "8 8");
  attendu("FAQ colonnes", /^[\d.]+px 28px$/.test(f.colonnes), true);
  attendu("FAQ question", f.questionTaille, "14.5px");
  attendu("FAQ carte", `${f.rayon} ${f.fond}`, `20px ${BLANC}`);
  attendu("FAQ « + » fermé", f.plusFerme, "none");
  attendu("FAQ « + » ouvert", f.plusOuvert.startsWith("matrix(0.707"), true);
  attendu("FAQ « + » ouvert, fond", f.plusOuvertFond, ORANGE);
  attendu("FAQ réponse", f.reponseRembourrage, "0px 16px 6px");
  attendu("FAQ chapô", f.chapoTaille, "16px 500");
  attendu("FAQ texte", f.texteTaille, "15px");
  const t = m.tuiles;
  attendu("tuiles titre", t.titreTaille, "11px");
  attendu("tuiles 2 x 2", t.memeLigne && t.deuxColonnes, true);
  attendu("tuile", `${t.rayon} ${t.rembourrage}`, "18px 14px");
  attendu("tuile valeur", `${t.valeurTaille} ${t.valeurCouleur}`, `21px ${ORANGE}`);
  attendu("tuile libellé", t.libelleTaille, "12.5px");
  return d;
}

/** Le numéro n'entre pas dans le texte : aucun chiffre de plus. */
export function chiffresAjoutes(texteServi: string, texteRendu: string): string[] {
  const chiffres = (t: string) => (t.match(/\d+/g) ?? []).join(" ");
  const d: string[] = [];
  if (texteRendu !== texteServi) d.push("le textContent rendu diffère du HTML servi");
  if (chiffres(texteRendu) !== chiffres(texteServi)) d.push(`chiffres : « ${chiffres(texteRendu)} » au lieu de « ${chiffres(texteServi)} »`);
  return d;
}

export function differencesBureau(avec: string[], sans: string[]): string[] {
  const d: string[] = [];
  avec.forEach((ligne, i) => {
    if (ligne !== sans[i]) d.push(ligne.slice(0, ligne.indexOf(" ")));
  });
  return d;
}

/* -------------------------------------------------------------- témoins */

async function temoins(navigateur: Browser, verbeux: boolean): Promise<void> {
  const dire = (s: string) => verbeux && console.log(`  témoin : ${s}`);

  // a. La section sortie de son @media : le bureau change.
  const fuite = cssSansSection + section.replace(/@media \(max-width: 880px\) \{/g, "@media all {");
  const a = differencesBureau(
    await empreinte(navigateur, fuite, html, 1280),
    await empreinte(navigateur, cssSansSection, html, 1280),
  );
  assert.ok(a.length > 0, "témoin a : une section qui fuit sur le bureau n'a pas été vue");
  dire(`section hors @media → ${a.length} éléments changent à 1 280 px`);

  // b. Un numéro écrit dans le texte.
  const b = chiffresAjoutes(texteDe(html), texteDe(html.replace("Carte de démonstration A", "01 Carte de démonstration A")));
  assert.ok(b.length > 0, "témoin b : un numéro écrit en texte n'a pas été vu");
  dire(`numéro écrit en texte → ${b.join(" ; ")}`);

  // c. Un relevé absent de la maquette.
  const c = relevesManquants([{ motif: "inventé", maquette: "border-radius:13px;background:#fff", feuille: "--mm-filet" }], dc, section);
  assert.equal(c.length, 1, "témoin c : un relevé inventé n'a pas été vu");
  dire(`relevé inventé → ${c[0]}`);

  // d. Un rayon changé.
  const d = defautsMobile(await mesure(navigateur, css.replace("--mm-rayon-carte: 20px", "--mm-rayon-carte: 12px"), html, 390));
  assert.ok(d.some((x) => x.includes("rayon")), "témoin d : un rayon changé n'a pas été vu");
  dire(`rayon de 12 px → ${d.filter((x) => x.includes("rayon")).length} défauts de rayon`);
}

/* ---------------------------------------------------------------- porte */

const navigateur = await chromium.launch({ channel: "chrome" });
try {
  if (process.argv.includes("--controle")) {
    console.log("témoins de la porte des styles partagés :");
    await temoins(navigateur, true);
    console.log("les 4 témoins tombent.");
  } else {
    // 1. Relevés.
    const manquants = relevesManquants(RELEVES, dc, section);
    assert.deepEqual(manquants, [], `relevés :\n${manquants.join("\n")}`);

    // 2. Rendu servi : attributs posés, questions liées, aucun chiffre ajouté.
    assert.equal((html.match(/data-carte-numerotee/g) ?? []).length, 5, "cinq cartes attendues");
    assert.equal((html.match(/data-sans-numero/g) ?? []).length, 1, "une carte sans numéro attendue");
    assert.equal((html.match(new RegExp(`name="${NOM_FAQ_DEMONSTRATION}"`, "g")) ?? []).length, 3, "les trois questions doivent partager leur name");

    // 3. À 390 px : le dessin de la maquette, et le numéro hors du texte.
    const mobile = await mesure(navigateur, css, html, 390);
    const defauts = defautsMobile(mobile);
    assert.deepEqual(defauts, [], `à 390 px :\n${defauts.join("\n")}`);
    const ajouts = chiffresAjoutes(texteDe(html), mobile.texte);
    assert.deepEqual(ajouts, [], `texte à 390 px :\n${ajouts.join("\n")}`);

    // 4. À 1 280 px : rien ne change, élément par élément.
    const bureau = differencesBureau(
      await empreinte(navigateur, css, html, 1280),
      await empreinte(navigateur, cssSansSection, html, 1280),
    );
    assert.deepEqual(bureau, [], `à 1 280 px, la section partagée change :\n${bureau.join("\n")}`);
    const texteBureau = (await mesure(navigateur, css, html, 1280)).texte;
    assert.deepEqual(chiffresAjoutes(texteDe(html), texteBureau), [], "texte à 1 280 px");

    // 5. Les témoins : la porte sait échouer.
    await temoins(navigateur, false);

    console.log(
      `porte des styles partagés de la maquette mobile : ${RELEVES.length} relevés retrouvés dans dc.html, ` +
        `5 cartes (numéros affichés ${mobile.numeros.join(" ")}, aucun dans le texte), ` +
        `FAQ et tuiles conformes à 390 px, textContent inchangé, bureau identique à 1 280 px, 4 témoins tombent.`,
    );
  }
} finally {
  await navigateur.close();
}
