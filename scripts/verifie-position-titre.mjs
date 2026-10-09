/**
 * Le titre principal de chaque page tombe-t-il à la même hauteur que dans la
 * maquette ? Contrôle bon marché de tout ce qui précède le héros (en-tête,
 * dégagement sous l'en-tête, fil d'Ariane, bandeaux) : un décalage de 34 px sur
 * 200 pages est passé inaperçu de toutes les autres mesures, qui photographient
 * section par section.
 *
 *   node scripts/verifie-position-titre.mjs                  les 248 pages
 *   node scripts/verifie-position-titre.mjs "04 Ville"       un gabarit
 *   node scripts/verifie-position-titre.mjs /offres/residence/ /implantations/lyon/
 *   node scripts/verifie-position-titre.mjs --part 1/4       un quart, pour paralléliser
 *   JOURNAL=/tmp/x.txt node scripts/verifie-position-titre.mjs    reprend où il s'était arrêté
 *
 * Sortie en échec si un titre est décalé de plus de 2 px.
 *
 * TROIS CORRECTIONS DU 08/10, chacune pour une raison mesurée.
 *
 * 1. IL POUVAIT SE FIGER, et c'était le défaut 10 du relais. `goto` et
 *    `waitForFunction` avaient leur borne, mais `cadre.evaluate` n'en a pas :
 *    Playwright n'expose aucun `timeout` sur `evaluate` et ignore
 *    `setDefaultTimeout` pour lui. Une page qui ne rend jamais la main y restait
 *    indéfiniment, et les 248 pages n'avaient aucune borne globale. La seule
 *    façon de borner un `evaluate` est de FERMER l'onglet sous lui : la promesse
 *    est alors rejetée, et le `catch` existant la convertit en `null`. D'où le
 *    chien de garde. Sa durée se CALCULE depuis les bornes internes au lieu
 *    d'être écrite à la main : un chien plus court qu'un chemin légitime
 *    fabriquerait de faux décalages.
 *
 * 2. IL CONFONDAIT « DÉCALÉ » ET « PAS MESURÉ ». Un `null`, quelle qu'en fût la
 *    cause, était compté comme un décalage. Une page lente devenait donc un
 *    défaut du site. Trois états désormais : `ok`, `DÉCALÉ` quand les deux
 *    hauteurs sont connues et diffèrent de plus de 2 px, `NON MESURÉE` sinon.
 *
 * 3. IL SIGNAIT « CONFORME » SIX PAGES SANS RÉFÉRENCE. Le routeur de la
 *    maquette détourne six adresses (`remapOffer`) : l'interroger sur
 *    `/bureau-etudes/` ouvre `/offres/bureau-etudes/`. Les deux rendent un H1 à
 *    la même hauteur, donc la comparaison passait au vert en comparant deux
 *    pages différentes. C'est le faux défaut du jour, dans l'autre sens. La
 *    table se LIT DANS LA MAQUETTE, jamais recopiée : recopiée, elle dériverait
 *    au prochain export du client.
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { chromium } from "playwright";

const INDEX = JSON.parse(readFileSync(new URL("../maquette/contenu/site/index.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);

/* `--part k/n` : le même découpage que `capture-maquette.mjs`, pour lancer
   plusieurs quarts en parallèle sans qu'ils s'écrasent. */
const iPart = args.indexOf("--part");
let suffixePart = "";
let decoupe = null;
if (iPart >= 0) {
  const [k, n] = String(args[iPart + 1] ?? "").split("/").map(Number);
  if (!k || !n || k < 1 || k > n) {
    console.error("--part attend k/n, par exemple --part 1/4");
    process.exit(2);
  }
  decoupe = { k, n };
  suffixePart = `-part-${k}`;
  args.splice(iPart, 2);
}

let pages = args.length === 0
  ? INDEX
  : args[0].startsWith("/")
    ? args.map((url) => ({ url, gabarit: "" }))
    : INDEX.filter((p) => (p.gabarit ?? "").startsWith(args[0]));
if (decoupe) pages = pages.filter((_, i) => i % decoupe.n === decoupe.k - 1);

const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const LARGEUR = Number(process.env.LARGEUR ?? 1280);

/** Ouverture d'une page : large, le serveur de dev compile à la demande. */
const ATTENTE_OUVERTURE = Number(process.env.ATTENTE_OUVERTURE ?? 60000);
/** Côté maquette, `voir.html` s'accorde deux étapes de 25 s : on les domine. */
const ATTENTE_MAQUETTE = Number(process.env.ATTENTE_MAQUETTE ?? 55000);
/** La pause qui laisse la mise en page se poser. */
const PAUSE = 1500;
/* Le chien de garde DOIT dominer la somme des bornes internes, sinon il coupe
   un chemin légitime et fabrique un faux défaut. On le calcule donc, avec une
   marge franche, au lieu de l'écrire à la main. */
const ATTENTE_PAGE = Number(
  process.env.ATTENTE_PAGE ?? ATTENTE_OUVERTURE + ATTENTE_MAQUETTE + PAUSE + 10000,
);

/* Les adresses que le routeur de la maquette détourne, lues dans la maquette
   elle-même. Si le fichier n'est pas lisible, on ne devine pas : la table reste
   vide et le contrôle le dira dans son récapitulatif. */
const DETOURNEES = (() => {
  try {
    const source = readFileSync(new URL("../maquette/site-final-autonome.html", import.meta.url), "utf8");
    const bloc = source.match(/remapOffer\(u\)\s*\{[^}]*?const M = \{([^}]*)\}/s);
    if (!bloc) return {};
    const table = {};
    for (const [, de, vers] of bloc[1].matchAll(/\\?"(\/[^"\\]*)\\?"\s*:\s*\\?"(\/[^"\\]*)\\?"/g)) table[de] = vers;
    return table;
  } catch {
    return {};
  }
})();

const JOURNAL = process.env.JOURNAL ?? `/tmp/position-titre${suffixePart}.txt`;
/* Reprise : les pages déjà consignées ne sont pas refaites. Un balayage coupé
   au bout de six minutes reprend là où il s'était arrêté. */
const deja = existsSync(JOURNAL)
  ? new Set(readFileSync(JOURNAL, "utf8").split("\n").map((l) => l.split("\t")[1]).filter(Boolean))
  : new Set();

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({ viewport: { width: LARGEUR, height: 900 } });

async function hauteurTitre(url, maquette) {
  const page = await contexte.newPage();
  /* Fermer l'onglet est la SEULE façon de borner un `evaluate` : il n'accepte
     pas de `timeout` et ignore `setDefaultTimeout`. La fermeture rejette la
     promesse, et le `catch` ci-dessous la rend en `null`. */
  const chien = setTimeout(() => void page.close().catch(() => {}), ATTENTE_PAGE);
  try {
    await page.goto(url, { waitUntil: "load", timeout: ATTENTE_OUVERTURE });
    let cadre = page.mainFrame();
    if (maquette) {
      await page.waitForFunction(
        () => document.getElementById("etat")?.textContent?.startsWith("page ouverte"),
        { timeout: ATTENTE_MAQUETTE },
      );
      cadre = page.frames().find((f) => f.url().includes("autonome"));
    }
    await page.waitForTimeout(PAUSE);
    return await cadre.evaluate(() => {
      window.scrollTo(0, 0);
      const h1 = document.querySelector("h1");
      return h1 ? Math.round(h1.getBoundingClientRect().top) : null;
    });
  } catch {
    return null;
  } finally {
    clearTimeout(chien);
    await page.close().catch(() => {});
  }
}

const file = [...pages];
const decales = [];
const nonMesurees = [];
let conformes = 0;
let faites = 0;

function consigne(etat, url, detail) {
  faites += 1;
  const ligne = `${etat}\t${url}\t${detail}`;
  /* Écrit AVANT la page suivante : un balayage interrompu garde ce qu'il a
     mesuré, et l'avancement se voit au fil de l'eau au lieu de huit minutes
     de silence. Avec quatre ouvriers les lignes s'entrelacent : le compteur
     dit l'avancement, pas un rang stable. */
  appendFileSync(JOURNAL, `${ligne}\n`, "utf8");
  console.log(`[${String(faites).padStart(3)}/${pages.length}] ${ligne.replace(/\t/g, "  ")}`);
}

async function ouvrier() {
  while (file.length) {
    const { url, gabarit } = file.shift();
    if (deja.has(url)) continue;

    const vers = DETOURNEES[url];
    if (vers) {
      /* Ne pas interroger la maquette du tout : elle ouvrirait une autre page,
         dont le H1 tombe à la même hauteur, et le contrôle signerait
         « conforme » sans avoir rien comparé. */
      nonMesurees.push(`${gabarit} ${url} : la maquette l'envoie sur ${vers}`);
      consigne("NON-MESURABLE", url, `la maquette l'envoie sur ${vers}`);
      continue;
    }

    const [m, s] = await Promise.all([
      hauteurTitre(`http://localhost:4352/voir.html?url=${encodeURIComponent(url)}`, true),
      hauteurTitre(SITE + url, false),
    ]);

    if (m === null || s === null) {
      nonMesurees.push(`${gabarit} ${url} maquette=${m} site=${s}`);
      consigne("NON-MESURÉE", url, `maquette=${m}\tsite=${s}`);
    } else if (Math.abs(m - s) > 2) {
      decales.push(`${gabarit} ${url} maquette=${m} site=${s}`);
      consigne("DÉCALÉ", url, `maquette=${m}\tsite=${s}\técart=${s - m}`);
    } else {
      conformes += 1;
      consigne("ok", url, `maquette=${m}\tsite=${s}`);
    }
  }
}

await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);
await navigateur.close();

console.log("");
for (const e of decales) console.log(`DÉCALÉ        ${e}`);
for (const e of nonMesurees) console.log(`NON MESURÉE   ${e}`);
console.log("");
console.log(
  `${conformes} titre(s) à la hauteur de la maquette, ${decales.length} décalé(s), ` +
    `${nonMesurees.length} non mesurée(s), sur ${pages.length} demandée(s) (${LARGEUR} px)`,
);
if (nonMesurees.length) console.log(`journal : ${JOURNAL}`);
/* Une page non mesurée n'est PAS une page conforme : elle fait échouer le
   contrôle, sinon une lenteur passerait pour une réussite. */
process.exit(decales.length || nonMesurees.length ? 1 : 0);
