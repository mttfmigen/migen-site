/**
 * LA STRUCTURE DES TITRES DES 13 PAGES CARRIÈRE EST-ELLE CELLE DE LEUR CAPTURE ?
 *
 *   node scripts/verifie-titres-metier.mjs
 *   node scripts/verifie-titres-metier.mjs --controle          (témoin : prouve qu'elle sait échouer)
 *   SITE_URL=http://localhost:4341 node scripts/verifie-titres-metier.mjs
 *
 * Sans `SITE_URL`, elle mesure LA PRODUCTION, `https://migen-site.vercel.app` :
 * le serveur de développement du port 4340 sert du contenu périmé depuis le
 * 07/10 (docs/PASSATION.md), et une porte qui interroge un menteur ne prouve
 * rien.
 *
 * POURQUOI ELLE EXISTE. Le 12/10, Mehdi : « il y a un pb avec les titres H2 et
 * la disposition de la page (fiche métier) ». Le repli mobile posé le matin
 * avait déplacé le `<h2>` de chaque section dans la bascule du bloc repliable.
 * Or `<summary>` est visible À TOUTES LES LARGEURS. Résultat mesuré sur les 13
 * pages en production :
 *
 *   - 20 titres en DOUBLE (les 13 « Questions fréquentes » et les 7 encarts,
 *     dont le rendu ne savait pas se taire) ;
 *   - 8 à 16 titres par page rendus à 30 px au lieu des 38,4 px de la capture.
 *
 * Les portes du projet n'ont rien vu : `verification-metier.tsx` vérifie que
 * CHAQUE dessin de la capture est PRÉSENT au moins une fois dans le rendu, ce
 * qui reste vrai quand la première section le porte encore. Aucune ne comptait
 * les titres, ni ne comparait leur ordre.
 *
 * CE QU'ELLE MESURE, capture contre page servie, sur texte normalisé :
 *
 *   1. UN SEUL H1, et c'est celui de la capture.
 *   2. AUCUN TITRE EN DOUBLE : un titre servi plus souvent que la capture ne
 *      le porte est nommé, avec ses deux comptes.
 *   3. AUCUN TITRE PERDU : un titre de la capture absent des titres servis est
 *      nommé. Si son TEXTE est pourtant dans la page, elle le dit autrement
 *      (« rendu hors d'un élément de titre ») : c'est la faute du `<span>`
 *      habillé, qui retire le titre de la structure du document sans rien
 *      changer à l'écran.
 *   4. L'ORDRE DE LA CAPTURE, position par position.
 *   5. AUCUN SAUT DE NIVEAU : après un h1, pas de h3 sans h2.
 *
 * LES ORNEMENTS MOBILES NE COMPTENT PAS. Le chevron, le résumé et l'étiquette
 * de bascule portent `data-mobile-seulement` : ils n'existent que sous 880 px,
 * la capture est de bureau, et elle n'a aucune raison de les porter. Ils sont
 * retirés DES DEUX CÔTÉS avant toute lecture (`sansOrnementsMobiles`), comme
 * le font déjà `verification-ville.tsx` et `verification-ressource.tsx`.
 *
 * TROIS PIÈGES DE MESURE, déjà payés ailleurs dans ce dépôt, évités ici :
 * un SÉPARATEUR DE BLOC au retrait des balises (sans quoi deux nœuds voisins
 * se collent en une phrase qui n'existe nulle part) ; la normalisation des
 * `&nbsp;`, `&#x27;`, `&#39;` et des apostrophes typographiques avant toute
 * comparaison ; et le comptage par occurrence, jamais par ligne.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = (process.env.SITE_URL ?? "https://migen-site.vercel.app").replace(/\/$/, "");
const GABARIT = "07 Métier et carrière";
const CONTROLE = process.argv.includes("--controle");

/* ------------------------------------------------------------- la lecture */

/** `/carriere/automaticien/salaire/` → `carriere--automaticien--salaire`. */
function cleCapture(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "index";
}

/** Les entités que les deux côtés n'écrivent pas pareil. React sérialise
 *  `&#x27;`, la capture écrit l'apostrophe, le corpus la typographique. */
function decode(texte) {
  return texte
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&amp;/gi, "&");
}

/** Espaces insécables ramenés à l'espace, apostrophes unifiées, blancs réduits. */

/**
 * RETIRE UN ÉLÉMENT `data-mobile-seulement` ET TOUT SON CONTENU, imbrication
 * comprise.
 *
 * CE QUE LA VERSION PRÉCÉDENTE FAISAIT, et c'était faux : elle cherchait
 * `<balise …data-mobile-seulement…>` puis tout jusqu'à la PREMIÈRE fermante de
 * même nom, en répétition paresseuse. Or l'étiquette de bascule posée le 12/10
 * est un `span` qui en contient DEUX, un pour le surtitre et un pour le titre.
 * Le motif n'en retirait donc que la moitié, et laissait dans la comparaison le
 * texte du titre plus une balise orpheline.
 *
 * CE QUE ÇA A COÛTÉ : la porte signalait « littéral différent de la capture »
 * sur deux textes qui n'étaient pas en défaut, et un relecteur en a conclu à
 * une régression venue d'un autre fichier. Une porte qui ment sur l'origine
 * d'un défaut coûte plus cher qu'une porte absente.
 *
 * Ici on compte la profondeur : on avance balise par balise depuis l'ouvrante
 * marquée, en montant à chaque ouvrante de même nom et en descendant à chaque
 * fermante, et on coupe quand on retombe à zéro.
 */
function retireOrnements(html) {
  const marque = /<(\w+)\b[^>]*\bdata-mobile-seulement\b[^>]*>/;
  let sortie = html;
  for (;;) {
    const debut = sortie.match(marque);
    if (!debut || debut.index === undefined) return sortie;
    const nom = debut[1];
    const balises = new RegExp(`<${nom}\\b[^>]*>|</${nom}\\s*>`, "g");
    balises.lastIndex = debut.index + debut[0].length;
    let profondeur = 1;
    let fin = -1;
    for (let m = balises.exec(sortie); m; m = balises.exec(sortie)) {
      profondeur += m[0].startsWith("</") ? -1 : 1;
      if (profondeur === 0) {
        fin = m.index + m[0].length;
        break;
      }
    }
    /* Une ouvrante sans fermante : on retire la seule balise plutôt que de
       boucler sans fin ou d'avaler la fin du document. */
    if (fin < 0) fin = debut.index + debut[0].length;
    sortie = `${sortie.slice(0, debut.index)} ${sortie.slice(fin)}`;
  }
}

function normalise(texte) {
  return decode(texte)
    .replace(/[    ]/g, " ")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Les ornements qui n'existent que sous 880 px, retirés des deux côtés.
 * Sans ce retrait, l'étiquette de bascule serait lue comme un titre servi en
 * plus, sur treize pages, et la porte accuserait un ornement.
 */
export function sansOrnementsMobiles(html) {
  /* RÉPARÉ le 12/10 : la ligne disait `htmlretireOrnements(html)`, un collage
     d'édition qui faisait planter la porte sur `ReferenceError` dès son premier
     appel, témoin compris. Elle ne mesurait donc plus rien depuis. Aucune règle
     n'est touchée ici : seul l'appel manquant est rendu à sa fonction. */
  return retireOrnements(html);
}

/** LE SÉPARATEUR DE BLOC : deux nœuds voisins ne doivent pas se coller. */
const SEP = String.fromCharCode(1);

/**
 * Les titres d'un HTML, dans l'ordre du document : `{ balise, niveau, texte }`.
 * Les ornements mobiles, les scripts, les styles et les SVG sont écartés avant.
 */
export function titres(html) {
  const propre = sansOrnementsMobiles(html).replace(
    /<(script|style|template|svg|noscript)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
  const trouves = [];
  for (const m of propre.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const balise = m[1].toLowerCase();
    const texte = normalise(m[2].replace(/<[^>]+>/g, SEP))
      .split(SEP)
      .map((bout) => bout.trim())
      .filter(Boolean)
      .join(" ");
    trouves.push({ balise, niveau: Number(balise[1]), texte });
  }
  return trouves;
}

/** Le texte lisible d'un HTML, ornements mobiles retirés : sert à départager
 *  « titre absent » de « titre rendu hors d'un élément de titre ». */
function texteLisible(html) {
  return normalise(
    sansOrnementsMobiles(html)
      .replace(/<(script|style|template|svg|noscript)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, SEP),
  )
    .split(SEP)
    .map((bout) => bout.trim())
    .filter(Boolean)
    .join(SEP);
}

/* ------------------------------------------------------------ la comparaison */

function compte(liste) {
  const m = new Map();
  for (const t of liste) m.set(t.texte, (m.get(t.texte) ?? 0) + 1);
  return m;
}

/**
 * Les écarts entre la capture et la page servie. Une liste vide vaut conforme.
 * Fonction PURE : le témoin lui donne des HTML fabriqués, c'est ce qui permet
 * de prouver qu'elle sait échouer sans toucher au site.
 */
export function ecarts(htmlCapture, htmlServi) {
  const ref = titres(htmlCapture);
  const vu = titres(htmlServi);
  const lisible = texteLisible(htmlServi);
  const fautes = [];

  /* 1. UN SEUL H1. */
  const h1ref = ref.filter((t) => t.niveau === 1);
  const h1vu = vu.filter((t) => t.niveau === 1);
  if (h1vu.length !== 1) fautes.push(`${h1vu.length} h1 servi(s), il en faut exactement un`);
  else if (h1ref.length === 1 && h1vu[0].texte !== h1ref[0].texte)
    fautes.push(`h1 servi « ${h1vu[0].texte} », la capture porte « ${h1ref[0].texte} »`);

  /* 2. AUCUN TITRE EN DOUBLE. */
  const cref = compte(ref);
  const cvu = compte(vu);
  for (const [texte, n] of cvu) {
    const attendu = cref.get(texte) ?? 0;
    if (n > attendu)
      fautes.push(
        attendu === 0
          ? `titre servi en plus, absent de la capture : « ${texte} »`
          : `titre servi ${n} fois pour ${attendu} dans la capture : « ${texte} »`,
      );
  }

  /* 3. AUCUN TITRE PERDU, et la faute du span nommée pour ce qu'elle est. */
  for (const [texte, n] of cref) {
    const servi = cvu.get(texte) ?? 0;
    if (servi >= n) continue;
    fautes.push(
      servi === 0 && lisible.includes(texte)
        ? `titre de la capture RENDU HORS D'UN ÉLÉMENT DE TITRE (span ou div) : « ${texte} »`
        : `titre de la capture absent du rendu (${servi} pour ${n}) : « ${texte} »`,
    );
  }

  /* 4. L'ORDRE DE LA CAPTURE. Signalé une seule fois : le premier décalage
        explique tous les suivants, les énumérer noierait la cause. */
  if (fautes.length === 0) {
    for (let i = 0; i < Math.max(ref.length, vu.length); i++) {
      const a = ref[i];
      const b = vu[i];
      if (a && b && a.balise === b.balise && a.texte === b.texte) continue;
      fautes.push(
        `ordre rompu en position ${i} : capture « ${a ? `${a.balise} ${a.texte}` : "(rien)"} », ` +
          `rendu « ${b ? `${b.balise} ${b.texte}` : "(rien)"} »`,
      );
      break;
    }
  }

  /* 5. AUCUN SAUT DE NIVEAU, sauf si la capture le fait elle-même : elle est
        la référence, y compris dans ses défauts. */
  const sauts = (liste) => {
    const vus = [];
    for (let i = 1; i < liste.length; i++)
      if (liste[i].niveau > liste[i - 1].niveau + 1)
        vus.push(`${liste[i - 1].balise} puis ${liste[i].balise} (« ${liste[i].texte} »)`);
    return vus;
  };
  const sautsRef = new Set(sauts(ref));
  for (const saut of sauts(vu))
    if (!sautsRef.has(saut)) fautes.push(`saut de niveau que la capture ne fait pas : ${saut}`);

  return fautes;
}

/* ---------------------------------------------------------------- le témoin */

/**
 * LE TÉMOIN. Quatre fautes injectées dans une capture réelle, chacune doit
 * être refusée, et la paire intacte doit passer. Une porte qui accepte tout
 * ne mesure rien ; une porte qui refuse tout ne mesure rien non plus, d'où la
 * première ligne.
 */
function temoin() {
  const base =
    "<h1>Automaticien</h1>" +
    "<section><div>SAVOIR-FAIRE</div><h2>Ce que fait un automaticien</h2><p>Un texte.</p></section>" +
    "<section><div>FORMATION</div><h2>Devenir automaticien</h2><p>Un autre texte.</p></section>" +
    "<section><h2>Questions fréquentes</h2><p>Une réponse.</p></section>";

  const essais = [
    ["une page conforme est ACCEPTÉE", base, (f) => f.length === 0],
    [
      "titre en span (retiré de la structure du document)",
      base.replace(
        "<h2>Devenir automaticien</h2>",
        '<span style="font:600 30px var(--ft)">Devenir automaticien</span>',
      ),
      (f) => f.some((x) => x.includes("HORS D'UN ÉLÉMENT DE TITRE") && x.includes("Devenir automaticien")),
    ],
    [
      "titre dupliqué (bascule plus rendu interne)",
      base.replace("<h2>Questions fréquentes</h2>", "<h2>Questions fréquentes</h2><h2>Questions fréquentes</h2>"),
      (f) => f.some((x) => x.includes("2 fois pour 1") && x.includes("Questions fréquentes")),
    ],
    [
      "saut de niveau (h1 puis h3)",
      base.replace("<h2>Ce que fait un automaticien</h2>", "<h3>Ce que fait un automaticien</h3>"),
      (f) => f.some((x) => x.includes("saut de niveau")),
    ],
    [
      "titre absent du rendu",
      base.replace("<h2>Devenir automaticien</h2><p>Un autre texte.</p>", "<p>Un autre texte.</p>"),
      (f) => f.some((x) => x.includes("absent du rendu") && x.includes("Devenir automaticien")),
    ],
  ];

  /* La première ligne est l'épreuve inverse : elle vérifie que la porte sait
     aussi ACCEPTER. Les quatre suivantes sont les fautes à détecter. */
  const [conforme, ...injectees] = essais;
  const accepte = conforme[2](ecarts(base, conforme[1]));
  console.log(`  ${accepte ? "OK  " : "RATE"}  ${conforme[0]}`);

  let detectees = 0;
  for (const [quoi, servi, juge] of injectees) {
    const ok = juge(ecarts(base, servi));
    if (ok) detectees++;
    console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
  }

  console.log(
    `\ntémoin : ${detectees}/${injectees.length} fautes détectées, ` +
      `et la page conforme est ${accepte ? "acceptée" : "REFUSÉE À TORT"}.`,
  );
  return accepte && detectees === injectees.length;
}

/* ------------------------------------------------------------- l'exécution */

if (CONTROLE && !temoin()) {
  console.log("\nle témoin a raté : la porte ne sait pas échouer, elle ne prouve rien.");
  process.exit(1);
}

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pages = (Array.isArray(index) ? index : (index.pages ?? index)).filter(
  (p) => p?.gabarit === GABARIT && p?.url,
);

if (pages.length === 0) {
  console.log(`aucune page du gabarit « ${GABARIT} » dans l'index : rien à mesurer.`);
  process.exit(1);
}

const resultats = await Promise.all(
  pages.map(async (page) => {
    const cle = cleCapture(page.url);
    let capture;
    try {
      capture = readFileSync(join(RACINE, "maquette/rendu", `${cle}.html`), "utf8");
    } catch {
      return { url: page.url, fautes: [`aucune capture maquette/rendu/${cle}.html : rien à comparer`] };
    }
    let servi;
    try {
      const r = await fetch(SITE + page.url, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) return { url: page.url, fautes: [`page servie en ${r.status}`] };
      servi = await r.text();
    } catch (e) {
      return { url: page.url, fautes: [`page injoignable : ${e.message}`] };
    }
    return { url: page.url, fautes: ecarts(capture, servi), nbTitres: titres(capture).length };
  }),
);

const enFaute = resultats.filter((r) => r.fautes.length > 0);
for (const r of enFaute) {
  console.log(`\n${r.url}`);
  for (const f of r.fautes) console.log(`   ${f}`);
}

const titresCompares = resultats.reduce((n, r) => n + (r.nbTitres ?? 0), 0);
if (enFaute.length > 0) {
  console.log(
    `\n${enFaute.reduce((n, r) => n + r.fautes.length, 0)} écart(s) de structure sur ` +
      `${enFaute.length} des ${resultats.length} pages carrière (${SITE}).`,
  );
  process.exit(1);
}

console.log(
  `structure des titres conforme : ${resultats.length} pages carrière, ${titresCompares} titres ` +
    `comparés à leur capture, même nombre, même ordre, un seul h1, aucun doublon, aucun saut de niveau (${SITE}).`,
);
