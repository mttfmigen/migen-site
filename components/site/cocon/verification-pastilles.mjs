/**
 * LA PORTE DES PASTILLES DU MAILLAGE MOBILE (components/site/cocon/).
 *
 *   bun components/site/cocon/verification-pastilles.mjs
 *   bun components/site/cocon/verification-pastilles.mjs --controle
 *
 * (bun, pas node : la porte importe le composant .tsx et le rend vraiment,
 * par `renderToStaticMarkup`, comme les portes de `components/consentement/`.)
 *
 * CE QU'ELLE PROUVE, sur le rendu RÉEL de pages RÉELLES de l'index :
 *
 *   1. AUCUN LIBELLÉ INVENTÉ. Chaque pastille pointe une entrée de
 *      `maquette/contenu/site/index.json`, et chaque mot de son libellé vient
 *      du h1, du title ou de l'URL de CETTE entrée. La vérification refait la
 *      normalisation elle-même, sans rien importer du module jugé : un
 *      libellé rédigé à la main tomberait ici même si le producteur jurait
 *      le contraire.
 *   2. REPLIER, JAMAIS RETIRER. La boîte annonce « titre · N » : la porte
 *      recompte les N liens DANS LE DOM, y compris ceux repliés sous le
 *      `<details>`, exige les 8 premiers hors repli (dc.html L377) et le
 *      libellé exact « Voir les N autres pages ».
 *   3. LE SOCLE EST SERVEUR ET MOBILE SEULEMENT : pas de « use client » dans
 *      les sources, `data-mobile-seulement` sur la section (les 248 captures
 *      bureau de `maquette/rendu/` ne portent pas ce bloc ; au-dessus de
 *      881 px, `app/globals.css` le masque, donc RIEN ne change à 1280 px).
 *   4. LES TITRES SONT CEUX DE LA MAQUETTE, verbatim (dc.html L501-506), sur
 *      cinq pages choisies pour couvrir chaque branche : hub, domaine,
 *      ressources, héritage REMAP, sœurs.
 *
 * `--controle` : les verdicts sont des fonctions pures, et chacune PROUVE
 * qu'elle sait refuser, sur des relevés fabriqués :
 *   témoin A  une pastille au libellé inventé (mots absents de l'index) ;
 *   témoin B  une boîte dont les liens repliés ont été RETIRÉS du DOM
 *             (du texte disparaît : c'est la faute visée par la règle
 *             « replier, jamais retirer ») ;
 *   témoin C  un repli au libellé réécrit (« Voir plus »).
 * Piège n° 3 du dépôt : jamais de `grep -c`, les comptes se font par
 * `match(...).length` sur la chaîne entière.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = fileURLToPath(new URL(".", import.meta.url));
const CONTROLE = process.argv.includes("--controle");

/* ------------------------------------------------------------- les verdicts
 * JS pur, importables et éprouvables : aucun ne lit le disque ni le module
 * jugé. C'est ce qui permet aux témoins de les faire tomber.
 */

/** Normalisation indépendante : minuscules, sans accent, s final retiré. */
export function motNu(w) {
  const nu = w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return nu.length > 3 ? nu.replace(/s$/, "") : nu;
}

function sacDeMots(texte) {
  return new Set(
    String(texte)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .map(motNu),
  );
}

/**
 * Verdict n° 1 : un libellé est INVENTÉ si l'un de ses mots (hors ponctuation
 * et troncature « … ») n'apparaît ni dans le h1, ni dans le title, ni dans
 * l'URL de l'entrée d'index que la pastille pointe. Rend la liste des fautes.
 */
export function libellesInventes(pastilles, indexParUrl) {
  return pastilles.flatMap(({ libelle, href }) => {
    const entree = indexParUrl.get(href);
    if (!entree) return [`${href} : aucune entrée d'index pour cette pastille`];
    const source = sacDeMots(`${entree.h1} ${entree.title} ${entree.url}`);
    const mots = String(libelle)
      .replace(/…$/, "")
      .replace(/[’']/g, " ")
      .split(/[^0-9A-Za-zÀ-ÖØ-öø-ÿ]+/)
      .filter((w) => w.length > 1)
      .map(motNu);
    const etrangers = mots.filter((w) => !source.has(w));
    return etrangers.length > 0
      ? [`${href} : « ${libelle} » porte des mots absents de l'index (${etrangers.join(", ")})`]
      : [];
  });
}

/**
 * Verdict n° 2 : du texte a DISPARU si la boîte annonce « · N » mais que le
 * DOM porte moins (ou plus) de N liens, ou si les liens au-delà des 8
 * premiers ne sont pas sous un `<details>` (repliés, donc, pas retirés).
 */
export function texteRetire(sectionHtml, visiblesAvantRepli = 8) {
  const annonce = /·\s*(\d+)\s*<\/h2>/.exec(sectionHtml);
  if (!annonce) return ["aucun « titre · N » : la boîte n'annonce pas son compte"];
  const n = Number(annonce[1]);
  const liens = (sectionHtml.match(/<a /g) ?? []).length;
  const fautes = [];
  if (liens !== n) fautes.push(`${n} pastilles annoncées, ${liens} liens dans le DOM`);
  const avantRepli = (sectionHtml.split("<details")[0].match(/<a /g) ?? []).length;
  const attendusAvant = Math.min(n, visiblesAvantRepli);
  if (avantRepli !== attendusAvant)
    fautes.push(`${attendusAvant} pastilles attendues hors repli, ${avantRepli} mesurées`);
  if (n > visiblesAvantRepli && !sectionHtml.includes("<details"))
    fautes.push(`${n} pastilles sans aucun <details> : le surplus a été retiré, pas replié`);
  return fautes;
}

/** Verdict n° 3 : le libellé du repli, verbatim dc.html L377. */
export function repliReecrit(sectionHtml) {
  if (!sectionHtml.includes("<details")) return [];
  const resume = /<summary[^>]*>([^<]*)<\/summary>/.exec(sectionHtml);
  if (!resume) return ["un <details> sans <summary>"];
  const total = Number((/·\s*(\d+)\s*<\/h2>/.exec(sectionHtml) ?? [])[1] ?? 0);
  const attendu = `Voir les ${total - 8} autres pages`;
  return resume[1] === attendu
    ? []
    : [`repli « ${resume[1]} » au lieu de « ${attendu} »`];
}

/* ----------------------------------------------------------- les relevés */

function decode(html) {
  return html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Les pastilles d'un rendu : href + libellé (le premier span du corps). */
export function pastillesDe(html) {
  return [...html.matchAll(/<a href="([^"]*)"[^>]*><span[^>]*><span[^>]*>([^<]*)<\/span>/g)].map(
    (m) => ({ href: decode(m[1]), libelle: decode(m[2]) }),
  );
}

const INDEX = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
);
const PAR_URL = new Map(INDEX.map((x) => [x.url, x]));

const fautes = [];
const constats = [];

/* 1. Le socle est serveur : aucune directive client dans les sources. */
for (const f of ["PastillesCocon.tsx", "maillage-mobile.ts"]) {
  const src = readFileSync(join(DOSSIER, f), "utf8");
  if (src.includes('"use client"'))
    fautes.push(`${f} porte « use client » : le socle doit rester serveur`);
}

/* 2. Rendus réels, un par branche de la cascade (dc.html L501-506). */
const { default: PastillesCocon } = await import("./PastillesCocon.tsx");

/* AUCUN LIBELLÉ NE PORTE UN MOT INTERDIT, sur les 248 entrées de l'index :
   l'index du client garde des formes que le site ne rend plus (« conçues sur
   mesure » pour Tournaire, relevé le 14/10), et une pastille l'écrivait sur
   41 pages. Le libellé passe par lib/decisions-copie.ts. */
{
  const { courtLibelle } = await import("./maillage-mobile.ts");
  const INTERDIT = /sans\s+engagement|\br[ée]gie\b|sur[\s-]mesure|int[ée]rim|mise\s+[àa]\s+disposition|cl[ée]\s+en\s+main|notamment|concrètement|incontournable|découvrez|\blevier\b|\u2014|\u2013/i;
  const indexPages = JSON.parse(readFileSync(new URL("../../../maquette/contenu/site/index.json", import.meta.url), "utf8"));
  const fautifs = indexPages.map((x) => courtLibelle(x)).filter((l) => INTERDIT.test(l));
  if (fautifs.length) fautes.push(`libellés de pastille interdits : ${fautifs.slice(0, 5).join(" | ")}`);
  else constats.push(`${indexPages.length} libellés de pastille, aucun mot interdit`);
  // Témoin : la forme brute de l'index EST refusée, sinon la règle ne prouve rien.
  const brut = indexPages.find((x) => /tournaire/.test(x.url))?.h1 ?? "";
  if (!INTERDIT.test(brut)) fautes.push("témoin : le h1 brut de Tournaire devrait porter « sur mesure »");
}
const rendu = (props) =>
  renderToStaticMarkup(React.createElement(PastillesCocon, props));

const CAS = [
  { props: { chemin: "/implantations/" }, titre: "Autres implantations", repli: true },
  { props: { chemin: "/expertises/automatisme/" }, titre: "Les spécialités du domaine" },
  { props: { chemin: "/ressources/" }, titre: "Les rubriques" },
  /* Héritage REMAP (dc.html L227, L370) : /offres/bureau-etudes/ n'a aucun
     enfant direct dans l'index, ses pastilles sont les enfants de
     /bureau-etudes/, l'adresse détournée vers elle. */
  { props: { chemin: "/offres/bureau-etudes/", variante: "enfants" }, titre: "Aller plus loin" },
  {
    props: { chemin: "/expertises/automatisme/programmation-automate/", variante: "soeurs" },
    titre: "Dans la même rubrique",
  },
];

for (const cas of CAS) {
  const ou = `${cas.props.chemin}${cas.props.variante ? ` (${cas.props.variante})` : ""}`;
  const html = rendu(cas.props);
  if (html === "") {
    fautes.push(`${ou} : rendu vide, la boîte attendue manque`);
    continue;
  }
  if (!html.includes("data-mobile-seulement"))
    fautes.push(`${ou} : section sans data-mobile-seulement, elle changerait le 1280 px`);
  const h2 = /<h2[^>]*>(.*?)<\/h2>/.exec(html);
  const texteH2 = h2 ? decode(h2[1]) : "";
  if (!texteH2.startsWith(`${cas.titre} · `))
    fautes.push(`${ou} : titre « ${texteH2} » au lieu de « ${cas.titre} · N »`);

  const pastilles = pastillesDe(html);
  if (pastilles.length === 0) {
    fautes.push(`${ou} : aucune pastille relevée dans le rendu`);
    continue;
  }
  fautes.push(...libellesInventes(pastilles, PAR_URL).map((x) => `${ou} : ${x}`));
  fautes.push(...texteRetire(html).map((x) => `${ou} : ${x}`));
  fautes.push(...repliReecrit(html).map((x) => `${ou} : ${x}`));
  if (cas.repli && !html.includes("<details"))
    fautes.push(`${ou} : plus de 8 pastilles et aucun repli <details>`);
  constats.push(`${ou} : « ${texteH2} », ${pastilles.length} pastilles, toutes de l'index`);
}

/* L'héritage REMAP, mesuré et non supposé : les trois enfants de
   /bureau-etudes/ doivent être les pastilles de /offres/bureau-etudes/. */
{
  const html = rendu({ chemin: "/offres/bureau-etudes/", variante: "enfants" });
  const hrefs = pastillesDe(html).map((p) => p.href);
  for (const attendu of [
    "/bureau-etudes/bureau-etude-electrique/",
    "/bureau-etudes/bureau-etude-electronique/",
    "/bureau-etudes/mise-en-conformite-machine/",
  ]) {
    if (!hrefs.includes(attendu))
      fautes.push(`/offres/bureau-etudes/ : l'enfant hérité ${attendu} manque`);
  }
}

/* ------------------------------------------------- les témoins (--controle) */

if (CONTROLE) {
  const temoins = [];

  /* Témoin A : un libellé inventé DOIT tomber. */
  const inventes = libellesInventes(
    [{ libelle: "Nos partenaires de confiance", href: "/expertises/automatisme/" }],
    PAR_URL,
  );
  if (inventes.length === 0)
    temoins.push("témoin A : le libellé inventé « Nos partenaires de confiance » est passé");

  /* Témoin B : des liens repliés RETIRÉS du DOM doivent tomber. */
  const vraie = rendu({ chemin: "/implantations/" });
  const amputee = vraie.replace(/<details[\s\S]*<\/details>/, "");
  if (texteRetire(amputee).length === 0)
    temoins.push("témoin B : la boîte amputée de ses liens repliés est passée");

  /* Témoin C : un repli réécrit doit tomber. */
  const reecrite = vraie.replace(/<summary([^>]*)>[^<]*<\/summary>/, "<summary$1>Voir plus</summary>");
  if (repliReecrit(reecrite).length === 0)
    temoins.push("témoin C : le repli réécrit « Voir plus » est passé");

  if (temoins.length > 0) {
    console.error("LES TÉMOINS NE TOMBENT PAS, la porte ne prouve rien :");
    for (const t of temoins) console.error("  ✗ " + t);
    process.exit(1);
  }
  console.log("Témoins : les trois relevés fabriqués sont bien refusés (A, B, C).");
}

if (fautes.length > 0) {
  console.error("PASTILLES DU COCON : REFUSÉ");
  for (const f of fautes) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("PASTILLES DU COCON : conforme");
for (const c of constats) console.log("  ✓ " + c);
