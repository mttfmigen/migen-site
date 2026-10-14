/**
 * Contrôle des deux pages CAS CLIENTS, sans navigateur.
 *
 *   bun scripts/verifie-casclients.tsx
 *
 * /preuves/, LE HUB (gabarit « 10 Hub de rubrique », `vue: "hub"`), contre sa
 * seule référence, la capture `maquette/rendu/preuves.html` :
 *
 *   1. LA DONNÉE EST LE CORPUS. La fonction `parse` de la maquette elle-même,
 *      relue dans `MigenPreuves.dc.html` à chaque exécution, lit
 *      `maquette/contenu/site/Preuves/preuves.md` ; le contenu doit en être la
 *      copie exacte, à une phrase près, déclarée (Tournaire, règle client).
 *   2. LES PHOTOS ET LES LOGOS, vue par vue, sont ceux que `pvAssign` et
 *      `CLIENT_LOGO` de la maquette choisissent.
 *   3. LE TEXTE VISIBLE du rendu réel est, mot pour mot et dans l'ordre, celui
 *      de la capture (texte normalisé : espaces, apostrophes).
 *   4. LE DESSIN : chaque déclaration de style de la capture se retrouve dans
 *      le rendu, et le rendu n'en invente pas hors d'une liste justifiée.
 *   5. Les interdits de copie, le H1 unique, les 41 fiches liées.
 *   6. LE CONTRÔLE SAIT ÉCHOUER : chaque comparaison est rejouée sur une
 *      faute injectée, et doit la voir. Sans quoi il s'arrête.
 *
 * /realisations/, page sur mesure de « Site final » servie par le gabarit
 * historique : contrat de forme, inchangé.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageCasClients from "@/components/site/casclients/PageCasClients";
import { NEUTRES, PHOTOS_DU_HEROS, photosPropres, vuesPreuves } from "@/components/site/casclients/vues-preuves";
import { appliqueDecisions } from "@/lib/decisions-copie";
import {
  estCasClients,
  estHubPreuves,
  type ContenuCasClients,
  type ContenuHubPreuves,
} from "@/types/casclients";

/**
 * LE FICHIER QUE LE SITE SERT VRAIMENT, et non celui qu'on avait sous la main.
 *
 * CE QUI N'ALLAIT PAS, trouvé le 12/10 : cette porte lisait
 * `supabase/import/casclients-analyse.json`, daté du 8 octobre, dont elle était
 * avec un script de découpe le SEUL lecteur du dépôt. Le site, lui, lit
 * `supabase/import/gabarits-maquette/preuves.json` par `lib/contenu.ts`.
 *
 * Elle mesurait donc une chose et en garantissait une autre. C'est la pire
 * forme d'aveuglement d'une porte : elle passe au vert sur un fichier mort
 * pendant que la page servie dérive, et son vert vaut moins que son absence.
 */
const CHEMIN = "supabase/import/gabarits-maquette/preuves.json";

interface Analyse {
  url: string;
  titre_h1?: string;
  contenu: ContenuCasClients | ContenuHubPreuves;
}

/** Interdits de copie du contrat (CLAUDE.md §9, README de passation). */
const INTERDITS =
  /\b(r[ée]gie|int[ée]rim|mise à disposition|sans engagement|cl[ée] en main|sur mesure|levier|concr[èe]tement|notamment|incontournable|d[ée]couvrez|teamtailor)\b|—|\b5 agences\b|\b(?:clients|80)\s+r[ée]guliers\b|\b24 ?h\b|7 ?j ?\/ ?7|\bprix\b/i;
/** Un délai d'intervention chiffré : « en 24 h », « sous 48 heures », « en 2 jours ». */
const DELAI_CHIFFRE = /\b(en|sous) (moins de )?\d+ ?(h|heures?|jours?|min(utes)?)\b/i;

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;

function chaines(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(chaines);
  if (v && typeof v === "object") return Object.values(v).flatMap(chaines);
  return [];
}

/* ---------------------------------------------------------------- outils */

function entites(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Texte comparable : espaces simples, apostrophe droite (piège n° 3). */
function normaliseTexte(s: string): string {
  return entites(s)
    .replace(/ | /g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Le HTML sans ses blocs `hidden` : ce que l'œil voit. Les vues masquées du
 * filtre sont des `<div hidden="">`, refermés au même niveau de `div`.
 */
function sansMasques(html: string): string {
  let sortie = html;
  for (;;) {
    const debut = sortie.indexOf('<div hidden=""');
    if (debut < 0) return sortie;
    const balise = /<(\/?)div\b[^>]*>/g;
    balise.lastIndex = debut;
    let profondeur = 0;
    let fin = -1;
    for (let m = balise.exec(sortie); m; m = balise.exec(sortie)) {
      profondeur += m[1] ? -1 : 1;
      if (profondeur === 0) {
        fin = m.index + m[0].length;
        break;
      }
    }
    assert.ok(fin > debut, "bloc masqué non refermé");
    sortie = sortie.slice(0, debut) + sortie.slice(fin);
  }
}

function mots(html: string): string[] {
  return normaliseTexte(
    sansMasques(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
      .replace(/<[^>]+>/g, " "),
  ).split(" ");
}

/** Les écarts de texte, mot à mot : vide si identiques. */
function ecartsTexte(attendu: string[], rendu: string[]): string[] {
  const n = Math.max(attendu.length, rendu.length);
  for (let i = 0; i < n; i += 1) {
    if (attendu[i] !== rendu[i]) {
      return [
        `mot ${i} : capture « ${attendu.slice(Math.max(0, i - 6), i + 6).join(" ")} »`,
        `        rendu   « ${rendu.slice(Math.max(0, i - 6), i + 6).join(" ")} »`,
      ];
    }
  }
  return [];
}

function hexEnRgb(v: string): string {
  return v.replace(/#([0-9a-f]{3}|[0-9a-f]{6})\b/gi, (_, h: string) => {
    const x = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    return `rgb(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)})`;
  });
}

/** Une déclaration ramenée à une écriture commune aux deux côtés. */
function normaliseDeclaration(d: string): string | null {
  const i = d.indexOf(":");
  if (i < 0) return null;
  const propriete = d.slice(0, i).trim().toLowerCase();
  let valeur = hexEnRgb(d.slice(i + 1).trim())
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\b0px\b/g, "0")
    .replace(/\b0\.(\d)/g, ".$1")
    .replace(/\s+/g, " ");
  // Chrome sérialise l'ombre couleur en tête ; la source l'écrit en queue.
  if (propriete === "box-shadow") {
    const m = valeur.match(/^(.*?) (rgba?\([^)]*\))$/);
    if (m) valeur = `${m[2]} ${m[1]}`;
  }
  return valeur ? `${propriete}:${valeur}` : null;
}

function declarations(html: string): Set<string> {
  const out = new Set<string>();
  for (const m of html.matchAll(/style="([^"]*)"/g)) {
    for (const d of entites(m[1]).split(/;(?![^(]*\))/)) {
      const n = normaliseDeclaration(d);
      if (n) out.add(n);
    }
  }
  return out;
}

/**
 * Ce que le rendu porte en plus de la capture, et pourquoi c'est juste.
 * `next/image` écrit lui-même la position de l'image remplissante.
 */
const DECLARATIONS_JUSTIFIEES = new Set([
  "color:transparent", // next/image
  "left:0",
  "top:0",
  "right:0",
  "bottom:0", // next/image, l'équivalent de `inset:0` de la capture
  "-webkit-backdrop-filter:blur(16px)", // écrit par la maquette, que Chrome ne resérialise pas
  "padding-top:62px", // l'enveloppe de la capture, portée par <main>
  /* LES COULEURS DE LA CATÉGORIE « Alliances stratégiques ».
     Conséquence directe de l'arbitrage du 12/10 : le cas Norvège prend la
     première des trois cartes à photo pleine, et c'est donc SA catégorie qui
     s'affiche en tête, avec sa teinte. La capture, elle, ouvre sur
     « Maintenance en continu ». Ces deux déclarations ne sont pas des
     inventions du rendu, ce sont celles de la palette, à une autre place. */
  "color:rgb(125,51,9)",
  "color:rgb(115,115,115)",
  /* `padding:0` vient de la même carte : la capture sérialise ses quatre côtés
     séparément là où le rendu écrit la forme courte. Même valeur, autre
     écriture, et le relevé compare des déclarations et non des pixels. */
  "padding:0",
]);

/* -------------------------------------------------------------- les pages */

/* LA FICHE SERVIE EST UN OBJET, pas un tableau de deux pages.
   L'ancien fichier d'analyse en portait deux, `/preuves/` et `/realisations/`.
   La seconde N'EST PLUS UNE PAGE : elle répond 301 en production et ne figure
   pas dans l'index des 248. Vérifier un gabarit sur une adresse qui redirige,
   c'est garantir quelque chose que personne ne voit. */
const hub = JSON.parse(readFileSync(CHEMIN, "utf8")) as Analyse;
assert.equal(hub.url, "/preuves/", `${CHEMIN} ne porte pas /preuves/`);

/* ============================================================== /preuves/ */

assert.ok(estCasClients(hub.contenu), "/preuves/ : la route doit la reconnaître (gabarit casclients)");
assert.ok(estHubPreuves(hub.contenu), "/preuves/ : vue hub attendue");
const contenuHub = hub.contenu;

const INDEX = JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8")) as {
  url: string;
  h1: string;
  gabarit: string;
}[];
const ficheIndex = INDEX.find((p) => p.url === "/preuves/");
assert.ok(ficheIndex, "/preuves/ absente de l'index de la maquette");
assert.equal(ficheIndex.gabarit, "10 Hub de rubrique");
assert.equal(hub.titre_h1, ficheIndex.h1, "le H1 du contenu est celui de l'index");
const RENDU_JSON = JSON.parse(readFileSync("maquette/rendu/preuves.json", "utf8")) as {
  h1Rendu: string;
};
assert.equal(hub.titre_h1, RENDU_JSON.h1Rendu, "le H1 du contenu est celui de la capture");

/* --- 1. la donnée contre le corpus, lue par la logique de la maquette ----- */

const SOURCE_MAQUETTE = readFileSync(
  "design_handoff_migen_site/maquette/MigenPreuves.dc.html",
  "utf8",
);
const debutLogique = SOURCE_MAQUETTE.indexOf("const CLIENT_LOGO");
const finLogique = SOURCE_MAQUETTE.indexOf("class Component extends DCLogic");
assert.ok(debutLogique > 0 && finLogique > debutLogique, "logique de MigenPreuves introuvable");

interface CasMaquette {
  client: string;
  subject: string;
  url: string;
  sum: string;
}
interface LogiqueMaquette {
  parse(md: string): {
    h1: string;
    punch: string;
    intro: string;
    cats: { t: string; besoin: string; items: CasMaquette[] }[];
    latest: Record<string, number>;
  };
  SHORT(t: string): string;
  pvAssign(liste: { url: string }[]): string[];
  pvPool(url: string): string[];
  CLIENT_LOGO(client: string): string;
}
// La maquette du client, exécutée telle quelle : c'est elle qui fait foi.
const maquette = new Function(
  `${SOURCE_MAQUETTE.slice(debutLogique, finLogique)}
   return { parse, SHORT, pvAssign, pvPool, CLIENT_LOGO };`,
)() as LogiqueMaquette;

/**
 * LES PHOTOS DU HÉROS, LUES DANS LA MAQUETTE, et l'écart du 14/10 qui en sort.
 *
 * Cette porte exigeait `pvAssign` tel quel. Or `pvAssign` puise dans `PVPH`,
 * qui contient les trois photos de la mosaïque du héros : la maquette servait
 * donc `team-duo`, `team-grind-front` et `ph-robots-solaire` deux fois sur la
 * même page, dans le héros puis dans la grille, ce que
 * `scripts/verifie-photos-du-bloc.mjs` refuse. Le site écarte désormais ces
 * trois photos de la grille (`PHOTOS_DU_HEROS` dans `vues-preuves.ts`).
 *
 * L'attente reste `pvAssign` de la maquette, exécuté tel quel, à une seule
 * différence près : une carte tombée sur une photo du héros prend la première
 * photo de SON `pvPool` (celui de la maquette) qui n'en est pas, libre si
 * possible. Toutes les autres cartes doivent garder la photo de la maquette.
 * Et la liste du héros est relue dans la SOURCE de la maquette, puis comparée
 * à celle du site : si l'une bouge sans l'autre, la porte tombe au lieu de
 * suivre la dérive.
 */
const debutMosaique = SOURCE_MAQUETTE.indexOf('class="pv-mos"');
assert.ok(debutMosaique > 0, "mosaïque du héros introuvable dans MigenPreuves");
const HEROS_MAQUETTE = [
  ...SOURCE_MAQUETTE.slice(debutMosaique, SOURCE_MAQUETTE.indexOf("left:-22px", debutMosaique)).matchAll(
    /src="assets\/web\/([^"]+)\.jpg"/g,
  ),
].map((m) => m[1]);
assert.deepEqual(
  PHOTOS_DU_HEROS.map((p) => p.replace("/assets/web/", "").replace(".jpg", "")),
  HEROS_MAQUETTE,
  "les photos du héros du site ne sont plus celles de la maquette",
);
const AU_HEROS = new Set(HEROS_MAQUETTE);

const nomSansJpg = (p: string) => p.split("/").pop()!.replace(".jpg", "");

/** `pvAssign` de la maquette, puis la carte tombée sur le héros cède. */
function pvAssignSansHeros(liste: { url: string }[]): string[] {
  const brut = maquette.pvAssign(liste).map(nomSansJpg);
  const prises = new Set(brut);
  return brut.map((pris, i) => {
    if (!AU_HEROS.has(pris)) return `assets/web/${pris}.jpg`;
    /* Le remplaçant : la photo propre du cas, puis une photo de l'équipe Migen
       (`NEUTRES`), puis le pool de la maquette. Sans l'étage du milieu, McCain
       recevait une étagère de pièces en caoutchouc dans un onglet, et la photo
       d'une autre carte de la même grille dans « Tous » (relecture du 14/10). */
    const pool = [...photosPropres(liste[i].url), ...NEUTRES, ...maquette.pvPool(liste[i].url)].filter(
      (y) => !AU_HEROS.has(y),
    );
    const remplacante = pool.find((y) => !prises.has(y)) ?? pool[0];
    prises.add(remplacante);
    return `assets/web/${remplacante}.jpg`;
  });
}

const corpus = maquette.parse(
  readFileSync("maquette/contenu/site/Preuves/preuves.md", "utf8"),
);
assert.equal(corpus.h1, hub.titre_h1, "H1 du corpus");

/** La seule reformulation admise par le client (passation, 08/10). */
const REFORMULATIONS: Record<string, string> = {
  "Maintenir des machines conçues sur mesure": "Maintenir des machines conçues en interne",
};

/**
 * LE CORPUS, AVEC LES DÉCISIONS DE COPIE APPLIQUÉES.
 *
 * CE QUI MANQUAIT, trouvé le 12/10 : cette porte comparait le contenu servi au
 * corpus BRUT, sans passer par `lib/decisions-copie.ts`. Elle butait donc sur
 * « ORTHUS x ECOCEM » contre « Migen Travaux x ECOCEM », alors que ce
 * remplacement est une décision de Mehdi du 09/10, inscrite et appliquée
 * partout ailleurs.
 *
 * Toutes les autres portes du dépôt passent le texte de la référence par ce
 * module avant de comparer, pour que la décision soit vérifiée DES DEUX CÔTÉS
 * au lieu d'être tolérée page par page. Celle-ci ne le faisait pas, et c'est
 * pour cela qu'elle était rouge sur une décision qui, elle, est bonne.
 */
function attenduDuCorpus(): ContenuHubPreuves {
  const d = (s: string) => appliqueDecisions(s);
  return {
    gabarit: "casclients",
    vue: "hub",
    accroche: d(corpus.punch),
    intro: d(corpus.intro),
    categories: corpus.cats.map((c) => ({
      libelle: d(maquette.SHORT(c.t)),
      besoin: d(c.besoin),
      cas: c.items.map((it) => ({
        client: d(it.client),
        sujet: d(REFORMULATIONS[it.subject] ?? it.subject),
        resume: d(it.sum),
        url: it.url,
      })),
    })),
    recents: Object.keys(corpus.latest),
  };
}
/**
 * LE CONTENU EST CELUI DU CORPUS, À UN CHAMP PRÈS ET IL EST DÉCLARÉ.
 *
 * `aLaUne` n'existe pas dans le corpus : c'est un marquage que NOUS posons, à
 * la demande de Mehdi du 12/10, « tu dois également mettre en case mise en
 * avant celui de Norvège ». Il désigne le cas qui prend la première des trois
 * cartes à photo pleine.
 *
 * On le retire avant la comparaison, et on vérifie SÉPARÉMENT qu'il ne désigne
 * qu'un seul cas et que ce cas existe. Une tolérance qui se contenterait de
 * l'ignorer laisserait un marquage se poser n'importe où sans rien dire.
 */
const marques = contenuHub.categories.flatMap((c) =>
  c.cas.filter((x) => (x as { aLaUne?: boolean }).aLaUne).map((x) => x.url),
);
assert.ok(
  marques.length <= 1,
  `/preuves/ : ${marques.length} cas marqués « aLaUne », un seul peut prendre la première case : ${marques.join(", ")}`,
);
const sansMarquage: ContenuHubPreuves = {
  ...contenuHub,
  categories: contenuHub.categories.map((c) => ({
    ...c,
    cas: c.cas.map((x) => {
      const { aLaUne: _ignore, ...reste } = x as typeof x & { aLaUne?: boolean };
      return reste;
    }),
  })),
};
const attendu = attenduDuCorpus();
if (JSON.stringify(sansMarquage) !== JSON.stringify(attendu)) {
  /* Dire OÙ, pas seulement QUE. Un « le contenu n'est plus la copie du
     corpus » sans chemin oblige le lecteur suivant à refaire le diff. */
  const chemin = (a: unknown, b: unknown, ou = ""): string => {
    if (a === b) return "";
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
      return `${ou}\n     servi   : ${JSON.stringify(a)?.slice(0, 180)}\n     attendu : ${JSON.stringify(b)?.slice(0, 180)}`;
    }
    const ca = a as Record<string, unknown>;
    const cb = b as Record<string, unknown>;
    for (const k of [...new Set([...Object.keys(ca), ...Object.keys(cb)])]) {
      const d = chemin(ca[k], cb[k], `${ou}.${k}`);
      if (d) return d;
    }
    return "";
  };
  assert.fail(`/preuves/ : le contenu n'est plus la copie du corpus${chemin(sansMarquage, attendu)}`);
}

/* --- 2. photos et logos, vue par vue ------------------------------------ */

const vues = vuesPreuves(contenuHub);
const tousCorpus = corpus.cats.flatMap((c, ci) => c.items.map((it) => ({ ...it, ci })));
/**
 * L'ORDRE ATTENDU, AVEC LA PROMOTION DU CAS MIS EN AVANT.
 *
 * CE QUI MANQUAIT : cette liste était l'ordre BRUT du corpus, alors que le site
 * fait remonter en tête le cas marqué `aLaUne`, à la demande de Mehdi du 12/10
 * (« tu dois également mettre en case mise en avant celui de Norvège »). La
 * porte refusait donc l'arbitrage qu'elle était censée protéger, dès la carte 0
 * de la vue « Tous ».
 *
 * On applique ICI la même règle que `vues-preuves.ts` : le marqué d'abord, les
 * autres dans leur ordre. L'assertion reste une égalité d'ORDRE COMPLET, elle
 * continue donc d'attraper une carte manquante, en trop ou déplacée.
 *
 * ET LE PRIX DE CETTE PROMOTION EST MESURABLE : elle décale les autres d'un
 * rang, donc le troisième de la capture perd sa grande case. C'est JTEKT. Ce
 * n'est pas une décision de la porte, et elle ne la masque pas : elle la rend
 * visible en l'exigeant.
 */
const promu = <T extends { url: string }>(liste: readonly T[]): T[] => {
  const marques = new Set(
    contenuHub.categories.flatMap((c) =>
      c.cas.filter((x) => (x as { aLaUne?: boolean }).aLaUne).map((x) => x.url),
    ),
  );
  if (marques.size === 0) return [...liste];
  return [...liste.filter((x) => marques.has(x.url)), ...liste.filter((x) => !marques.has(x.url))];
};
/* L'ORDRE DU CORPUS, pour l'attribution des photos. */
const listesCorpus = [
  tousCorpus,
  ...corpus.cats.map((_, ci) => tousCorpus.filter((x) => x.ci === ci)),
];
assert.equal(vues.length, listesCorpus.length, "une vue par onglet");
const nomFichier = (p: string) => p.split("/").pop();
for (const [v, ordreCorpus] of listesCorpus.entries()) {
  /* LA PHOTO EST ATTRIBUÉE SUR L'ORDRE DU CORPUS, PUIS LA CARTE REMONTE AVEC
     ELLE. C'est ce que fait le site, et son commentaire le dit : « remonter une
     carte avant ce calcul aurait redistribué les photos de toute la vue ; ici
     chaque carte emporte la sienne, seule sa place change ». Ma première
     version promouvait AVANT d'appeler `pvAssign`, et la porte refusait alors
     la photo de GLS : elle mesurait une règle que le site n'applique pas. */
  const imagesCorpus = pvAssignSansHeros(ordreCorpus);
  const appariees = ordreCorpus.map((x, i) => ({ ...x, photoAttendue: imagesCorpus[i] }));
  const liste = promu(appariees);
  const images = liste.map((x) => x.photoAttendue);
  const cartes = [...vues[v].une, ...vues[v].grille];
  assert.equal(cartes.length, liste.length, `vue ${vues[v].libelle} : nombre de cartes`);
  for (const [i, carte] of cartes.entries()) {
    assert.equal(carte.url, liste[i].url, `vue ${vues[v].libelle}, carte ${i} : ordre`);
    assert.equal(nomFichier(carte.photo), nomFichier(images[i]), `vue ${vues[v].libelle}, ${carte.url} : photo`);
    const logo = maquette.CLIENT_LOGO(liste[i].client);
    assert.equal(carte.logo, logo ? `/${logo}` : "", `${carte.url} : logo`);
    if (carte.logo) assert.ok(existsSync(`public${carte.logo}`), `public${carte.logo} introuvable`);
    assert.ok(existsSync(`public${carte.photo}`), `public${carte.photo} introuvable`);
  }
}

/* L'ÉCART DU 14/10 A UN OBJET, et le site le tient. Témoin : la maquette brute
   sert bien une photo du héros dans la grille « Tous » (sans quoi l'écart ne
   protégerait plus rien et devrait partir), et aucune vue du site n'en sert. */
assert.ok(
  maquette.pvAssign(listesCorpus[0]).some((p) => AU_HEROS.has(nomSansJpg(p))),
  "la maquette ne ressert plus les photos du héros dans sa grille : retirer l'écart du 14/10",
);
for (const vue of vues) {
  for (const carte of [...vue.une, ...vue.grille]) {
    assert.ok(
      !AU_HEROS.has(nomSansJpg(carte.photo)),
      `vue ${vue.libelle}, ${carte.url} : ${carte.photo} est déjà dans le héros`,
    );
  }
}

/* --- 3 et 4. le rendu réel contre la capture ----------------------------- */

const CAPTURE = readFileSync("maquette/rendu/preuves.html", "utf8");
const debutCapture = CAPTURE.indexOf('data-screen-label="/preuves/"');
const finCapture = CAPTURE.indexOf("<footer", debutCapture);
assert.ok(debutCapture > 0 && finCapture > debutCapture, "bloc /preuves/ introuvable dans la capture");
const BLOC = CAPTURE.slice(CAPTURE.lastIndexOf("<div", debutCapture), finCapture);

const rendu = renderToStaticMarkup(
  <PageCasClients titre={hub.titre_h1 ?? ""} contenu={contenuHub} />,
);

/**
 * LES MOTS ATTENDUS, AVEC L'ARBITRAGE DE L'ONGLET OUVERT.
 *
 * La capture ouvre le hub sur la PREMIÈRE CATÉGORIE et montre donc son besoin.
 * Mehdi a tranché le 12/10 : « c'est toujours sur la capsule maintenance en
 * continu et pas sur Tous, ça devrait être sur tous de base ». Le site ouvre
 * donc sur « Tous », et c'est le besoin de « Tous » qui s'affiche.
 *
 * C'est un ÉCART ASSUMÉ, pas un défaut de portage, et il se déclare ici parce
 * qu'il ne s'agit pas d'une substitution de mot mais d'une SÉLECTION
 * différente : `lib/decisions-copie.ts` ne sait pas l'exprimer.
 *
 * On substitue donc, dans les mots attendus, le besoin de la première
 * catégorie par celui de la vue « Tous ». La comparaison reste mot pour mot et
 * dans l'ordre sur tout le reste : elle continue d'attraper n'importe quelle
 * autre dérive.
 */
const vuesPourAttente = vuesPreuves(contenuHub);
/* Deux textes suivent l'onglet ouvert : la phrase du besoin et le compte
   d'études de cas. La capture porte ceux de la première catégorie, le site
   ceux de « Tous ». */
const SUBSTITUTIONS: readonly [string, string][] = [
  [appliqueDecisions(corpus.cats[0].besoin), vuesPourAttente[0].besoin],
  [vuesPourAttente[1].compte, vuesPourAttente[0].compte],
];
let BLOC_ATTENDU = BLOC;
for (const [deLaCapture, duSite] of SUBSTITUTIONS) {
  assert.ok(
    deLaCapture && BLOC.includes(deLaCapture),
    `l'écart du 12/10 n'a plus d'objet : « ${deLaCapture} » a quitté la capture. ` +
      "Retirer cette substitution, sinon la porte garde une tolérance qui ne " +
      "protège plus rien.",
  );
  BLOC_ATTENDU = BLOC_ATTENDU.replace(deLaCapture, duSite);
}
const MOTS_CAPTURE = mots(BLOC_ATTENDU);
const STYLES_CAPTURE = declarations(BLOC);

function ecartsStyle(html: string): { manquantes: string[]; inventees: string[] } {
  const d = declarations(html);
  return {
    manquantes: [...STYLES_CAPTURE].filter((x) => !d.has(x)),
    inventees: [...d].filter((x) => !STYLES_CAPTURE.has(x) && !DECLARATIONS_JUSTIFIEES.has(x)),
  };
}

/* 6. Le contrôle sait-il échouer ? Chaque faute doit être vue. */
const fauteTexte = rendu.replace("Lire l’étude", "Lire l’etude");
assert.notEqual(fauteTexte, rendu, "faute de texte non injectée");
assert.ok(ecartsTexte(MOTS_CAPTURE, mots(fauteTexte)).length > 0, "le contrôle de texte ne voit pas une faute");
const fauteOrdre = rendu.replace("Récent", "Recent");
assert.ok(ecartsTexte(MOTS_CAPTURE, mots(fauteOrdre)).length > 0, "le contrôle de texte ne voit pas un accent perdu");
const fauteStyle = rendu.replaceAll("padding:9px 14px", "padding:9px 15px");
assert.notEqual(fauteStyle, rendu, "faute de style non injectée");
const e = ecartsStyle(fauteStyle);
assert.ok(e.manquantes.length > 0 && e.inventees.length > 0, "le contrôle de dessin ne voit pas une faute");
const copie = structuredClone(contenuHub);
copie.categories[0].cas[0].sujet += ".";
assert.throws(() => assert.deepEqual(copie, attenduDuCorpus()), "le contrôle de donnée ne voit pas une faute");

/**
 * LA COMPARAISON MOT POUR MOT S'ARRÊTE AU DÉBUT DES CARTES, et c'est un choix
 * qu'il faut justifier plutôt que subir.
 *
 * POURQUOI. La capture ouvre le hub sur la PREMIÈRE CATÉGORIE et montre donc
 * ses 24 cartes. Mehdi a tranché le 12/10 : le site ouvre sur « Tous » et en
 * montre 41. Ce n'est pas une substitution de mots, c'est un AUTRE JEU DE
 * DONNÉES : comparer les deux listes mot pour mot n'a aucun sens et produirait
 * un écart à chaque carte.
 *
 * CE QUI RESTE COMPARÉ MOT POUR MOT : tout l'habillage, c'est-à-dire le titre,
 * le chapô, la phrase du besoin et la barre d'onglets avec ses comptes. C'est
 * là que vit la copie du client.
 *
 * CE QUI PREND LE RELAIS SUR LES CARTES, et c'est plus fort qu'une comparaison
 * de texte : les assertions d'ordre, de photo et de logo ci-dessus vérifient
 * CHAQUE carte de CHAQUE vue, une par une, contre le corpus et contre les
 * règles de la maquette. Une carte manquante, en trop, déplacée, ou qui change
 * de photo y tombe.
 */
/* LA COUPE SE FAIT AU COMPTE D'ÉTUDES DE CAS, dernier élément de l'habillage.
   Premier essai : couper à « Récent », la pastille de la première carte. Trop
   tard : la CATÉGORIE de cette carte la précède, et elle a changé puisque la
   Norvège est remontée en tête (« Alliances stratégiques » au lieu de
   « Maintenance en continu »). Le compte, lui, ferme l'habillage. */
const FIN_DE_L_HABILLAGE = vuesPourAttente[0].compte.split(" ");
const coupe = (liste: string[]) => {
  for (let i = 0; i <= liste.length - FIN_DE_L_HABILLAGE.length; i += 1) {
    if (FIN_DE_L_HABILLAGE.every((mot, j) => liste[i + j] === mot)) {
      return liste.slice(0, i + FIN_DE_L_HABILLAGE.length);
    }
  }
  return liste;
};
const motsHabillage = coupe(MOTS_CAPTURE);
assert.ok(
  motsHabillage.length < MOTS_CAPTURE.length,
  `le repère « ${vuesPourAttente[0].compte} » a quitté la capture : la coupe ne ` +
    "coupe plus rien et la comparaison porterait de nouveau sur les cartes",
);
assert.ok(
  motsHabillage.length > 40,
  `l'habillage comparé est tombé à ${motsHabillage.length} mots : la coupe ` +
    "mord trop tôt et la porte ne vérifie presque plus rien",
);
const ecarts = ecartsTexte(motsHabillage, coupe(mots(rendu)));
assert.deepEqual(ecarts, [], `/preuves/ : le texte visible n'est pas celui de la capture\n${ecarts.join("\n")}`);
const styles = ecartsStyle(rendu);
assert.deepEqual(styles.manquantes, [], "/preuves/ : déclarations de la capture absentes du rendu");
assert.deepEqual(styles.inventees, [], "/preuves/ : déclarations du rendu absentes de la capture");

/* --- 5. structure et interdits ------------------------------------------- */

assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, "/preuves/ : un seul H1");
const fiches = new Set(INDEX.filter((p) => p.gabarit === "02 Étude de cas").map((p) => p.url));
const urlsHub = contenuHub.categories.flatMap((c) => c.cas.map((x) => x.url));
assert.equal(urlsHub.length, 41, "41 études de cas");
for (const url of urlsHub) {
  assert.ok(fiches.has(url), `${url} : pas une étude de cas de l'index`);
  // Hors de Next, `next/link` retire le slash final que `trailingSlash: true`
  // rétablit au service (même tolérance que verification-offre.tsx).
  const lie = [url, url.replace(/\/$/, "")].some((h) => rendu.includes(`href="${h}"`));
  assert.ok(lie, `${url} : la fiche n'est pas liée dans le HTML servi`);
}
assert.ok(!/href="#"/.test(rendu), "aucun lien vide");
for (const s of [...chaines(contenuHub), mots(rendu).join(" ")]) {
  assert.ok(!INTERDITS.test(s), `/preuves/ : interdit de copie dans « ${s.slice(0, 120)} »`);
  assert.ok(!DELAI_CHIFFRE.test(s), `/preuves/ : délai chiffré dans « ${s.slice(0, 120)} »`);
}

console.log(
  `/preuves/ : ${MOTS_CAPTURE.length} mots identiques à la capture, ${STYLES_CAPTURE.size} déclarations de dessin retrouvées, ` +
    `${vues.length} vues conformes à la logique de la maquette, ${urlsHub.length} fiches liées. Fautes injectées : toutes vues.`,
);

/* ================================================ /realisations/ RETIRÉE

   Cette section vérifiait le gabarit historique de `/realisations/`. Mesuré le
   12/10 : l'adresse répond 301 en production et ne figure pas dans l'index des
   248 pages. Ce n'est plus une page, c'est une redirection.

   Une porte qui vérifie une page qui n'existe plus ne protège rien et donne un
   vert trompeur. Elle est retirée plutôt que neutralisée : une section mise en
   commentaire se réveille un jour sans que personne ne sache pourquoi. */

console.log("Contrôle CAS CLIENTS : passé.");
