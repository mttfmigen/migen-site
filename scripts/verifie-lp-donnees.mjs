/**
 * LA PORTE DES DONNÉES DES LANDING PAGES : `lib/lp/pages.json`.
 *
 *   bun scripts/verifie-lp-donnees.mjs
 *
 * Les landing pages publicitaires vivent sous `/lp/` (16/10, Mehdi : « elles
 * doivent aller sous migen.fr, sous un répertoire, mais elles ne doivent pas
 * être référencées sur Google »). Leur copie vient de la maquette V3
 * (`maquette/v3-lp/lp-data.json`, le `window.__LP` de Claude Design), qui est
 * pour l'essentiel l'ancien texte de go.migengroup.com, jamais nettoyé.
 * `scripts/genere-lp.mjs` la filtre ; cette porte vérifie le résultat.
 *
 * ELLE LIT LE JSON, PAS LE RENDU. `scripts/verifie-interdits.mjs` ne lit que
 * les `.ts`, `.tsx` et `.md` : un `.json` dans `lib/` lui échappe. Sans cette
 * porte, un « intérim » remis dans la donnée passerait sans bruit.
 *
 * CE QU'ELLE REFUSE, chaque règle avec son motif :
 *   · les mots du contrat (intérim, régie, mise à disposition…) ;
 *   · un délai chiffré, sauf « 1 h pour être rappelé » (le rappel dans
 *     l'heure), les deux durées de mission du formulaire et les horaires du
 *     standard ; dans une carte « Cas client », une durée même écrite en
 *     lettres ;
 *   · un montant, sauf « +10 M€ de chiffre d'affaires » que l'accueil affiche ;
 *   · « 4,9/5 » (le site affiche 4,6 / 5) et « clients satisfaits » ;
 *   · une agence locale en France (seule Lyon, à Écully, en est une) ;
 *   · une phrase qui place le siège à Écully : c'est l'agence, le siège est
 *     à Limonest (Mehdi, 16/10 au soir, qui rétablit sa décision du 09/10) ;
 *   · un « Hub X » hors des dix hubs, une ville-hub rattachée à un autre hub,
 *     ou une ville sans hub rattachée à un autre hub que le plus proche (la
 *     V3 envoyait Le Havre à Nantes quand Rouen, même département, allait à
 *     Paris, et Nice à Lyon devant Marseille) ;
 *   · un lien vers go.migengroup.com, un lien externe, une adresse `/fr/` ;
 *   · une image externe, relative, ou absente de `public/` ;
 *   · un autre numéro que celui des landing pages ;
 *   · le flottant coupé « 10 h » / « ubs en France », et une espace sécable
 *     avant les deux-points d'un titre.
 *
 * ELLE PROUVE QU'ELLE SAIT ÉCHOUER : avant de lire le fichier, elle remet
 * chaque défaut dans une copie de la vraie donnée et exige de le voir. Un
 * témoin qui passe arrête tout (code 2).
 *
 * Le générateur importe `motifsDuTexte` : la règle qui retire une phrase et
 * celle qui la refuse sont la même, elles ne peuvent pas diverger.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { TELEPHONE_LP } from "../components/site/entete-donnees.ts";
import { SIEGE_A_ECULLY } from "../lib/decisions-copie.ts";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
export const FICHIER_LP = join(RACINE, "lib", "lp", "pages.json");

/** Les dix hubs du site (components/site/implantations/photos-hubs.ts). */
export const HUBS = ["Lyon", "Paris", "Lille", "Marseille", "Strasbourg", "Nantes", "Toulouse", "Bordeaux", "Metz", "Dijon"];

export const enSlug = (texte) =>
  texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SLUGS_HUBS = new Set(HUBS.map(enSlug));

/* Le hub le plus proche de chaque ville à LP qui n'en a pas, par la route :
   le seul rattachement que la page puisse annoncer. Un autre est retiré, pas
   remplacé (la V3 ne disait pas lequel est le vrai). */
const HUB_LE_PLUS_PROCHE = {
  brest: "nantes",
  grenoble: "lyon",
  "le-havre": "paris",
  nice: "marseille",
  rennes: "nantes",
  rouen: "paris",
};

export const MOTIF_AGENCE = "agence locale";

/** La ville d'une page ville (`/lp/maintenance-industrielle-brest/` donne `brest`), sinon null. */
export function villeDe(chemin) {
  const ville = /^\/lp\/maintenance-industrielle-([a-z-]+)\/$/.exec(chemin ?? "")?.[1];
  return ville && ville !== "france" ? ville : null;
}

/** Les mots du contrat (CLAUDE.md § 9, et la consigne du 16/10). */
const MOTS = [
  ["intérim", /int[ée]rim/i],
  ["notamment", /\bnot[a]mment\b/i],
  ["sur mesure", /sur[\s-]mesure/i],
  ["clé en main", /cl[ée]s?\s+en\s+main/i],
  ["régie", /\br[ée]gies?\b/i],
  ["levier", /\bleviers?\b/i],
  ["mise à disposition", /\b(?:mise?s?|mets?|mettre|mettons|mettent|mettez)\s+[àa]\s+(?:votre\s+|vos\s+|leur\s+|notre\s+)?disposition/i],
  ["sans engagement", /sans\s+engagement/i],
  ["concrètement", /concr[èe]tement/i],
  ["incontournable", /incontournable/i],
  ["découvrez", /d[ée]couvr(?:ez|ir)\b/i],
  ["en savoir plus", /en\s+savoir\s+plus/i],
  ["tiret cadratin", /\u2014/],
  ["candidats (dire techniciens)", /\bcandidat/i],
  ["prix mensuel fixe", /prix\s+mensuel\s+fixe/i],
  ["note 4,9/5 (le site affiche 4,6 / 5)", /4[,.]9\s*\/\s*5/],
  ["« clients satisfaits » (dire « +200 clients »)", /clients?\s+satisfaits?/i],
  ["flottant coupé « ubs en France »", /(?:^|\s)ubs\b/],
];

/* Un nombre suivi d'une unité de temps. « tous les 3 mois » est une
   périodicité (FAQ de la maintenance préventive), pas un délai. */
const DELAI = /(?<!tous les\s)(?<![\d,.])\d+(?:[,.]\d+)?\s*(?:h|heures?|min|minutes?|j|jours?|semaines?|mois|ans?|années?)\b|\b24\s*h?\s*\/\s*(?:24|7)\b|\b7\s*j?\s*\/\s*7\b/i;

/* Les seules formes chiffrées admises, chaîne entière (une paire {v, l} se lit
   « v l ») : le rappel dans l'heure, les durées de mission que le formulaire
   propose au choix, et les horaires du standard des LP (à confirmer, voir
   docs/LP-NETTOYAGE.md). */
const DELAIS_ADMIS = new Set([
  "1 h pour être rappelé",
  "Inférieure à 6 mois",
  "Supérieur à 6 mois",
  `${TELEPHONE_LP.affichage} Lun. au ven., 8h à 18h`,
]);

/* Dans les quinze cartes « Cas client » : gardées, mais sans leurs durées,
   chiffrées ou écrites en lettres (consigne du 16/10). */
const DUREE_EN_LETTRES = /\b(?:un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|quinze|vingt)\s+(?:ans|années?|mois|semaines?|jours?)\b|moins de \d/i;

const MONTANT = /\d[\d\s\u00a0\u202f.,]*\s*(?:k|M)?\s*€|\b\d+\s*euros?\b/;
const MONTANTS_ADMIS = new Set(["+10 M€ de chiffre d'affaires"]);

const LIEN = /go\.migengroup|migengroup\.com|https?:\/\/|www\.|#\/fr\b|^\/fr\//i;
const TELEPHONE = /(?:\+33\s?|\b0)[1-9](?:[\s.\u00a0]?\d{2}){4}\b/g;

/* « Hub Migen à Nantes », « hub Migen de Toulouse », « Hub Paris · … ». Le nom
   doit commencer par une capitale : « hub le plus proche » n'est pas visé. */
const HUB_NOMME = /\b[Hh]ub(?:\s+Migen)?\s+(?:de\s+|à\s+|d['’])?(\p{Lu}[\p{L}'’]+(?:[\s-]\p{Lu}[\p{L}]+)*)/gu;

/** Les motifs pour lesquels ce texte ne peut pas être servi. Vide : il passe. */
export function motifsDuTexte(texte, ctx = {}) {
  if (typeof texte !== "string" || !texte.trim()) return [];
  const t = texte.normalize("NFC").replace(/[\u00a0\u202f]/g, " ").replace(/’/g, "'");
  const motifs = MOTS.filter(([, motif]) => motif.test(t)).map(([nom]) => nom);

  if (DELAI.test(t) && !DELAIS_ADMIS.has(t)) motifs.push("délai chiffré (seul « rappel dans l'heure » est permis)");
  if (ctx.kind === "case" && DUREE_EN_LETTRES.test(t)) motifs.push("durée dans une carte « Cas client »");
  if (MONTANT.test(t) && !MONTANTS_ADMIS.has(t)) motifs.push("montant");

  const ville = villeDe(ctx.page);
  if (/\bagences?\b/i.test(t) && !(ville === "lyon" && (/[ÉE]cully/.test(t) || t === "Pourquoi notre agence locale"))) {
    motifs.push(`${MOTIF_AGENCE} (4 agences : Lyon, Montréal, Dubaï, Madrid)`);
  }
  if (SIEGE_A_ECULLY.test(t)) {
    motifs.push("siège placé à Écully : le siège est à Limonest, Écully est l'agence");
  }
  for (const [, nom] of t.matchAll(HUB_NOMME)) {
    const hub = enSlug(nom);
    if (!SLUGS_HUBS.has(hub)) motifs.push(`« Hub ${nom} » hors des dix hubs`);
    else if (ville && SLUGS_HUBS.has(ville) && hub !== ville) motifs.push(`ville-hub rattachée au hub de ${nom}`);
    else if (ville && HUB_LE_PLUS_PROCHE[ville] && hub !== HUB_LE_PLUS_PROCHE[ville]) {
      motifs.push(`rattachement au hub de ${nom}, qui n'est pas le plus proche`);
    }
  }
  if (ville && !SLUGS_HUBS.has(ville) && (/\bbas[ée]e?s?\s+(?:à|au)\s/i.test(t) || /partenaire maintenance local/i.test(t))) {
    motifs.push("implantation locale qui n'existe pas (aucun hub dans cette ville)");
  }

  if (LIEN.test(t)) motifs.push("lien vers go.migengroup.com ou hors du site");
  for (const [numero] of t.matchAll(TELEPHONE)) {
    if (numero.replace(/\D/g, "").replace(/^33/, "0") !== TELEPHONE_LP.affichage.replace(/\D/g, "")) {
      motifs.push(`numéro ${numero} (seul ${TELEPHONE_LP.affichage} sert les LP)`);
    }
  }
  return motifs;
}

/** Les clés qui portent une référence (chemin, image, ancre) et non du texte. */
const IMAGES = new Set(["img", "hubImg", "qimg", "logo", "src"]);
const REFERENCES = new Set(["path", "mainHref", "id", "kind", "tel", ...IMAGES]);
const TITRES = new Set(["h1", "h1a", "h1b", "h2"]);
const NOMBRES = { deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 };

/** Chaque défaut de la donnée : { ou, motif, texte }. Vide : la donnée passe. */
export function defauts(donnees) {
  const trouves = [];
  const signale = (ou, motif, texte) => trouves.push({ ou, motif, texte: String(texte).slice(0, 140) });
  const chemins = new Set((donnees.pages ?? []).map((p) => p.path));

  const image = (ou, valeur) => {
    if (typeof valeur !== "string" || !valeur) return;
    if (!valeur.startsWith("/assets/") || /envato|https?:/i.test(valeur)) signale(ou, "image externe ou relative", valeur);
    else if (!existsSync(join(RACINE, "public", valeur))) signale(ou, "image absente de public/", valeur);
  };

  const parcours = (valeur, ou, ctx, cle) => {
    if (typeof valeur === "string") {
      if (IMAGES.has(cle)) return image(ou, valeur);
      if (REFERENCES.has(cle)) {
        if (LIEN.test(valeur)) signale(ou, "lien vers go.migengroup.com ou hors du site", valeur);
        return;
      }
      for (const motif of motifsDuTexte(valeur, ctx)) signale(ou, motif, valeur);
      if (TITRES.has(cle) && / :/.test(valeur)) signale(ou, "espace sécable avant les deux-points d'un titre", valeur);
      return;
    }
    if (Array.isArray(valeur)) return valeur.forEach((v, i) => parcours(v, `${ou}[${i}]`, ctx, cle));
    if (!valeur || typeof valeur !== "object") return;
    const paire = typeof valeur.v === "string" && typeof valeur.l === "string" && Object.keys(valeur).length === 2;
    if (paire) {
      for (const motif of motifsDuTexte(`${valeur.v} ${valeur.l}`, ctx)) signale(ou, motif, `${valeur.v} ${valeur.l}`);
      return;
    }
    const ici = valeur.kind ? { ...ctx, kind: valeur.kind } : ctx;
    for (const [k, v] of Object.entries(valeur)) parcours(v, ou ? `${ou}.${k}` : k, ici, k);
  };

  parcours(donnees.meta, "meta", {}, "meta");
  for (const page of donnees.pages ?? []) {
    const ou = page.path ?? "?";
    if (!/^\/lp\/(?:[a-z0-9-]+\/)+$/.test(page.path ?? "")) signale(ou, "adresse hors de /lp/", page.path);
    if (/confidentialite/.test(page.path ?? "") || page.lang) signale(ou, "page à ne pas porter (choix de langue, confidentialité de la V3)", page.path);
    if (page.mainHref && !page.mainHref.startsWith("#") && !chemins.has(page.mainHref)) signale(`${ou} mainHref`, "lien vers une LP qui n'existe pas", page.mainHref);
    if (page.tel !== undefined && page.tel !== TELEPHONE_LP.affichage) signale(`${ou} tel`, "numéro autre que celui des LP", page.tel);
    for (const [i, s] of (page.secs ?? []).entries()) {
      const compte = /^(\p{L}+) métiers\b/u.exec(s.h2 ?? "")?.[1]?.toLowerCase();
      if (compte && NOMBRES[compte] && NOMBRES[compte] !== (s.cards ?? []).length) {
        signale(`${ou} secs[${i}].h2`, `annonce ${compte} métiers, en montre ${(s.cards ?? []).length}`, s.h2);
      }
    }
    parcours(page, ou, { page: page.path }, "");
  }
  return trouves;
}

/* ------------------------------------------------------------- témoins */

function temoins(reelles) {
  const copie = () => structuredClone(reelles);
  const parPage = (d, fin) => d.pages.find((p) => p.path.endsWith(fin));
  const page = (d) => d.pages[0];
  const sec = (d) => page(d).secs.find((s) => s.kind === "faq") ?? page(d).secs[0];
  const CAS = [
    ["intérim", (d) => (sec(d).h2 = "Une agence d'intérim ?")],
    ["notamment", (d) => (page(d).chapo = "Nous intervenons not" + "amment sur presses.")],
    ["sur mesure", (d) => (page(d).chapo = "Des machines conçues sur mesure.")],
    ["clé en main", (d) => (page(d).chapo = "Des lignes clé en main.")],
    ["régie", (d) => (page(d).badges = ["Renfort en régie"])],
    ["levier", (d) => (page(d).chapo = "Un levier de performance.")],
    ["mise à disposition", (d) => (page(d).meta = "Migen met à votre disposition des techniciens.")],
    ["sans engagement", (d) => (page(d).badges = ["Gratuit & sans engagement"])],
    ["concrètement", (d) => (page(d).chapo = "Concrètement, nous venons.")],
    ["incontournable", (d) => (page(d).chapo = "Un partenaire incontournable.")],
    ["découvrez", (d) => (page(d).chapo = "Découvrez nos offres.")],
    ["en savoir plus", (d) => (sec(d).cta = "En savoir plus")],
    ["tiret cadratin", (d) => (page(d).chapo = "Un technicien \u2014 sur site.")],
    ["candidats", (d) => (page(d).chapo = "10 % des candidats retenus.")],
    ["prix mensuel fixe", (d) => (page(d).chapo = "Un prix mensuel fixe.")],
    ["délai « 2 h ouvrées »", (d) => (page(d).h1 = "Votre devis, chiffré sous 2 h ouvrées.")],
    ["délai « 48 h »", (d) => (page(d).chapo = "Un technicien sous 48 h.")],
    ["délai « moins de 3 semaines »", (d) => (page(d).chapo = "Mobilisé en moins de 3 semaines.")],
    ["« 1 h » sans le rappel", (d) => (page(d).hs = [{ v: "1 h", l: "pour intervenir" }])],
    ["durée en lettres dans un cas client", (d) => {
      const cas = parPage(d, "maintenance-industrielle-lyon/").secs.find((s) => s.kind === "case");
      cas.lead = "Contrat reconduit deux années consécutives.";
    }],
    ["4,9/5", (d) => (page(d).hs = [{ v: "4,9/5", l: "satisfaction client" }])],
    ["clients satisfaits", (d) => (sec(d).t = "Plus de 200 clients satisfaits")],
    ["agence locale", (d) => (parPage(d, "maintenance-industrielle-paris/").badges = ["Agence Paris · La Défense"])],
    ["siège à Écully", (d) => (parPage(d, "maintenance-industrielle-lyon/").badges = ["Siège Lyon · Écully"])],
    ["siège à l'adresse d'Écully", (d) => (parPage(d, "maintenance-industrielle-lyon/").chapo = "Siège à Écully, 129 chemin du Moulin Carron.")],
    ["hub hors liste", (d) => (page(d).chapo = "Hub Migen à Grenoble.")],
    ["ville-hub rattachée ailleurs", (d) => (parPage(d, "maintenance-industrielle-bordeaux/").badges = ["Intervention Bordeaux · Hub Toulouse"])],
    ["ville sans hub rattachée à un hub lointain", (d) => (parPage(d, "maintenance-industrielle-le-havre/").chapo = "Techniciens déployés depuis notre hub Migen de Nantes.")],
    ["« basé à » une ville sans hub", (d) => (parPage(d, "maintenance-industrielle-brest/").secs[0].h2 = "Un partenaire maintenance basé à Brest ?")],
    ["lien go.migengroup.com", (d) => (page(d).mainHref = "https://go.migengroup.com/fr/devis")],
    ["adresse /fr/", (d) => (page(d).path = "/fr/devis")],
    ["image Envato", (d) => (page(d).img = "https://elements-resized.envatousercontent.com/x.jpg")],
    ["image relative", (d) => (page(d).img = "assets/web/team-duo.jpg")],
    ["image absente", (d) => (page(d).img = "/assets/web/absente.jpg")],
    ["numéro du site", (d) => (page(d).chapo = "Appelez le 04 78 33 72 05.")],
    ["flottant « 10 h » / « ubs en France »", (d) => (page(d).hs = [{ v: "10 h", l: "ubs en France" }])],
    ["montant", (d) => (page(d).chapo = "À partir de 500 € par jour.")],
    ["« +10 M€ » hors de la bande de chiffres", (d) => (page(d).chapo = "+10 M€ de clients")],
    ["espace sécable avant « : » dans le H1", (d) => (page(d).h1 = "Votre service de maintenance : des techniciens.")],
    ["page de confidentialité de la V3", (d) => d.pages.push({ ...page(d), path: "/lp/confidentialite/" })],
    ["« Six métiers » pour cinq cartes", (d) => {
      const s = page(d).secs.find((x) => x.kind === "numbered");
      s.h2 = "Six métiers, un interlocuteur national";
      s.cards = s.cards.slice(0, 5);
    }],
  ];
  for (const [nom, casse] of CAS) {
    const d = copie();
    casse(d);
    if (defauts(d).length === 0) {
      console.error(`TÉMOIN ROUGE : la porte n'a pas vu « ${nom} ».`);
      process.exit(2);
    }
  }
  // Et ce qui est admis passe : le rappel dans l'heure, les durées de mission du formulaire.
  const admis = copie();
  page(admis).hs = [{ v: "1 h", l: "pour être rappelé" }, { v: "4,6 / 5", l: "avis Google" }];
  if (defauts(admis).length !== defauts(reelles).length) {
    console.error("TÉMOIN ROUGE : la porte refuse « 1 h pour être rappelé » ou « 4,6 / 5 ».");
    process.exit(2);
  }
  return CAS.length;
}

function principal() {
  if (!existsSync(FICHIER_LP)) {
    console.error(`${FICHIER_LP} absent : lancer bun scripts/genere-lp.mjs`);
    process.exit(1);
  }
  const donnees = JSON.parse(readFileSync(FICHIER_LP, "utf8"));
  const nbTemoins = temoins(donnees);
  const trouves = defauts(donnees);
  if (trouves.length > 0) {
    for (const t of trouves) console.error(`${t.ou}\n  ${t.motif}\n  « ${t.texte} »\n`);
    console.error(`${trouves.length} défaut(s) dans lib/lp/pages.json.`);
    process.exit(1);
  }
  console.log(`données des LP conformes : ${donnees.pages.length} pages, ${nbTemoins} témoins rouges vus rouges`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) principal();
