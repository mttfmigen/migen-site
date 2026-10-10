/**
 * Différence VISUELLE entre le site et la maquette, section par section.
 *
 * POURQUOI. Le 06/10, la porte G17 prouvait le texte mot pour mot et les
 * hauteurs collaient à 2 px près, et Mehdi a pourtant dit « le site n'y est
 * pas encore ». Il avait raison : un texte identique dans une section de même
 * hauteur peut être rendu avec d'autres polices, d'autres fonds, d'autres
 * cartes, d'autres photos. L'œil compare des pixels ; cet outil aussi.
 *
 * MÉTHODE. Les deux pages s'ouvrent dans le même Chrome à 1280 px. Chaque
 * section est photographiée en propre (élément par élément, donc insensible
 * aux décalages verticaux), puis les paires sont comparées pixel à pixel dans
 * un canvas. Sortie : un pourcentage de pixels divergents par section, et un
 * montage côte à côte des pires, écrit dans /tmp/diff-offre/.
 *
 *   node scripts/diff-visuel-offre.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

/* La page se passe en argument : `node scripts/diff-visuel-offre.mjs /offres/`.
   Sans argument, la page pilote validée par Mehdi le 06/10. */
const CHEMIN = process.argv[2] ?? "/offres/residence/";
const MAQUETTE = `http://localhost:4352/voir.html?url=${CHEMIN}`;
const SITE = `${process.env.SITE_URL ?? "http://localhost:4340"}${CHEMIN}`;
const SORTIE = process.env.SORTIE ?? "/tmp/diff-offre"; // configurable : des mesures parallèles ne doivent pas s'écraser

/** Au-delà de ce delta par canal, deux pixels sont dits différents. */
const SEUIL_CANAL = 40;

/** Une section dont plus de ce pourcentage de pixels diverge mérite un montage. */
const SEUIL_MONTAGE = 4;

/**
 * Attente maximale d'une page, en millisecondes.
 *
 * Les 30 s par défaut de Playwright ne suffisent pas, et pas à cause du site :
 * mesuré le 10/10, le serveur de dev met jusqu'à 25 s à servir ses propres
 * morceaux (`_next/static/chunks/...next-devtools...`) quand plusieurs
 * sessions travaillent en même temps, et la maquette autonome pèse 24 Mo sur
 * un `python -m http.server`. La même page tombait en timeout puis se mesurait
 * sans rien changer. On attend donc toujours `networkidle` (jamais moins : une
 * photo prise avant les images rendrait une divergence fausse), simplement
 * plus longtemps.
 */
const ATTENTE = Number(process.env.ATTENTE ?? 90000);

mkdirSync(SORTIE, { recursive: true });

/* Les rails de cartes défilent seuls : figés à 0 des deux côtés, sinon la
   photo diffère selon l'instant de la capture. */
const FIGE = () => {
  const desc = Object.getOwnPropertyDescriptor(Element.prototype, "scrollLeft");
  for (const r of document.querySelectorAll(".g3-refrail,.g3-offrail,[class*=rail]")) {
    desc.set.call(r, 0);
    Object.defineProperty(r, "scrollLeft", { configurable: true, get: () => 0, set: () => {} });
  }
};

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({
  // HAUTEUR=2400 pour une page dont des sections dépassent 900 px : voir.html
  // donne à la maquette un cadre de la hauteur de la fenêtre, et tout ce qui
  // en sort est photographié blanc.
  viewport: { width: Number(process.env.LARGEUR ?? 1280), height: Number(process.env.HAUTEUR ?? 900) },
  deviceScaleFactor: 1,
});

/**
 * Neutralise ce qui pollue la photo sans faire partie du design compare :
 * le bandeau de consentement (on choisit « Tout refuser », option la plus
 * protectrice) et la pastille de developpement de Next. Diagnostic du 06/10 :
 * ces deux artefacts comptaient jusqu'a 57 % de pixels sur des sections saines.
 */
async function neutraliseArtefacts(page) {
  await page.addStyleTag({ content: "nextjs-portal{display:none !important}" }).catch(() => {});
  await page
    .evaluate(() => {
      const b = [...document.querySelectorAll("button")].find(
        (x) => x.innerText.replace(/\s+/g, " ").trim() === "Tout refuser",
      );
      if (b) b.click();
    })
    .catch(() => {});
  await page.waitForTimeout(300);
}

/** Fait défiler toute la page pour déclencher images et révélations. */
async function laisseSePoser(page) {
  await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await dort(60);
    }
    window.scrollTo(0, 0);
    await dort(400);
  });
}

/** Les sections directes du <main> visible, comme la porte G17. */
async function sectionsDe(page) {
  return page.$$eval("main", (mains) => {
    const principal = mains.find((m) => m.getBoundingClientRect().height > 50) ?? mains[0];
    const propre = (s) => (s || "").replace(/\s+/g, " ").trim();
    return [...principal.querySelectorAll(":scope > section, :scope > * > section")]
      .filter((s, i, liste) => liste.indexOf(s) === i)
      .map((s, i) => ({
        i,
        titre: propre(s.querySelector("h1,h2,h3")?.textContent) || null,
        texte: propre(s.innerText).slice(0, 60),
      }));
  });
}

// ---------------------------------------------------------------- captures

/** Photographie chaque section d'une page dans un dossier donné. */
async function capture(url, prefixe, preparation) {
  const page = await contexte.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: ATTENTE });
  if (preparation) await preparation(page);
  await neutraliseArtefacts(page);
  await laisseSePoser(page);
  await page.evaluate(FIGE);

  const infos = await sectionsDe(page);
  const elements = await page.$$("main section");
  const fichiers = [];
  for (let i = 0; i < elements.length; i += 1) {
    const boite = await elements[i].boundingBox();
    if (!boite || boite.height < 30) {
      fichiers.push(null);
      continue;
    }
    const chemin = `${SORTIE}/${prefixe}-${String(i).padStart(2, "0")}.png`;
    await elements[i].scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    await elements[i].screenshot({ path: chemin });
    fichiers.push(chemin);
  }
  await page.close();
  return { infos, fichiers };
}

// La maquette vit dans un iframe de voir.html : on la photographie depuis le
// cadre lui-même, sinon on photographie la barre d'outils avec.
const pageRef = await contexte.newPage();
await pageRef.goto(MAQUETTE, { waitUntil: "networkidle", timeout: ATTENTE });
await pageRef.waitForFunction(
  () => document.getElementById("etat")?.textContent?.startsWith("page ouverte"),
  { timeout: ATTENTE },
);
const cadre = pageRef.frames().find((f) => f.url().includes("autonome"));
await cadre.evaluate(async () => {
  const dort = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let y = 0; y < document.body.scrollHeight; y += 700) {
    window.scrollTo(0, y);
    await dort(60);
  }
  window.scrollTo(0, 0);
  await dort(400);
});
/* VÉRIFICATION D'ARRIVÉE. Le routeur de la maquette détourne six adresses par
   sa table `remapOffer` (/bureau-etudes/ vers /offres/bureau-etudes/,
   /offres/chantier/ vers /travaux-industriels/, etc.). Sans ce contrôle,
   l'outil compare sereinement le site à une AUTRE page et rend une divergence
   énorme et fausse : /bureau-etudes/ a été mesurée à 69 % sur sa FAQ et portée
   au relais comme un défaut du site, alors que le site reproduit sa capture
   mot pour mot. Une demi-journée pour s'en apercevoir. On nomme donc la
   redirection, et on renvoie vers la seule référence valable pour ces
   adresses : leur capture figée. */
/* La table de détournement se LIT DANS LA MAQUETTE, elle ne se recopie pas :
   recopiée, elle dériverait au prochain export du client. Deux pages
   détournées peuvent partager leur h1 (/bureau-etudes/ et
   /offres/bureau-etudes/ ont le même), donc comparer les titres ne suffit pas
   à repérer le détournement. */
/** `/offres/residence/` -> `offres--residence`, la clé des captures figées. */
const cleDeCapture = (url) => url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "accueil";
const CLE = cleDeCapture(CHEMIN);

const detournee = (() => {
  try {
    const source = readFileSync(
      new URL("../maquette/site-final-autonome.html", import.meta.url),
      "utf8",
    );
    const bloc = source.match(/remapOffer\(u\)\s*\{[^}]*?const M = \{([^}]*)\}/s);
    if (!bloc) return null;
    const table = {};
    for (const [, de, vers] of bloc[1].matchAll(/\\?"(\/[^"\\]*)\\?"\s*:\s*\\?"(\/[^"\\]*)\\?"/g)) {
      table[de] = vers;
    }
    return table[CHEMIN] ?? null;
  } catch {
    return null;
  }
})();
if (detournee) {
  console.error(`La maquette n'ouvre PAS ${CHEMIN} : son routeur la détourne vers ${detournee}.`);
  console.error("");
  console.error("Mesurer ici comparerait le site à une AUTRE page, et la divergence serait");
  console.error("fausse : c'est ainsi que la FAQ de /bureau-etudes/ a été relevée à 69 % et");
  console.error("portée au relais comme un défaut, alors que le site reproduit sa capture");
  console.error("mot pour mot. Pour ces six adresses, la seule référence est la capture");
  console.error(`figée : maquette/rendu/${CLE}.html`);
  await navigateur.close();
  process.exit(2);
}

/* DEUXIÈME VÉRIFICATION D'ARRIVÉE : est-on sur LA page, ou sur une autre ?
 *
 * CE QUI NE MARCHE PAS, et a refusé 55 pages à tort jusqu'au 10/10 : comparer
 * le h1 rendu au h1 de `index.json`. La maquette affiche souvent une ACCROCHE
 * COMMERCIALE là où l'index annonce un titre documentaire, et c'est par
 * construction, pas par détournement :
 *
 *   /preuves/autoliv/      index « Étude de cas AUTOLIV : un technicien dédié… »
 *                          rendu « Un technicien dédié pour que le parc… »
 *   /secteurs/nucleaire/   index « Maintenance nucléaire »
 *                          rendu « Des techniciens habilités, prêts quand vous l'êtes. »
 *   /a-propos/equipe/      écran natif, h1 « Celles et ceux qui portent vos projets. »
 *
 * `capture-maquette.mjs` le sait depuis le 05/10 (« le h1 rendu peut différer
 * de celui de l'index : c'est un constat à consigner, pas un échec »), et le
 * consigne dans chaque capture sous le verdict `rendue-h1-different` : 41
 * études de cas, 12 secteurs, le hub /secteurs/ et un écran natif.
 *
 * CE QU'ON COMPARE DONC : le h1 vivant au h1 que la maquette a RÉELLEMENT
 * RENDU quand la capture figée a été prise (`h1Rendu` de
 * maquette/rendu/<clé>.json), c'est-à-dire à la référence du dépôt, arrivée
 * déjà vérifiée page par page. Un détournement déplace ce h1 ; une accroche
 * écourtée, non.
 *
 * SANS CAPTURE FIGÉE, on refuse : rien ne permet alors de distinguer un
 * détournement d'une accroche écourtée, et c'est exactement l'erreur qu'on
 * vient de payer. Il faut figer la référence d'abord.
 *
 * ANGLE MORT ASSUMÉ : deux pages au même h1 rendu (/bureau-etudes/ et
 * /offres/bureau-etudes/) sont indiscernables ici. C'est la table `remapOffer`
 * lue plus haut, et elle seule, qui attrape ce cas.
 */

/** Normalisation du dépôt : entités, apostrophes typographiques, espaces. */
const memeTexte = (a, b) => {
  const plat = (s) =>
    (s ?? "")
      .normalize("NFC")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(?:x27|39);/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/[‘’ʼ]/g, "'")
      .replace(/[   ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  return plat(a) === plat(b);
};

const h1Index = (() => {
  try {
    const index = JSON.parse(
      readFileSync(new URL("../maquette/contenu/site/index.json", import.meta.url), "utf8"),
    );
    const pages = Array.isArray(index) ? index : (index.pages ?? index);
    return pages.find((p) => p?.url === CHEMIN)?.h1 ?? null;
  } catch {
    return null;
  }
})();

const h1Figé = (() => {
  try {
    const capture = JSON.parse(
      readFileSync(new URL(`../maquette/rendu/${CLE}.json`, import.meta.url), "utf8"),
    );
    const h1 = capture?.h1Rendu;
    return h1 && String(h1).trim() ? String(h1) : null;
  } catch {
    return null;
  }
})();

if (h1Index || h1Figé) {
  const h1Vivant = await cadre.evaluate(
    () => document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
  );

  if (!h1Figé) {
    console.error(`Aucune capture figée pour ${CHEMIN} : maquette/rendu/${CLE}.json manque.`);
    console.error("");
    console.error("Sans elle, un h1 rendu différent de l'index peut être deux choses");
    console.error("opposées : un détournement du routeur, ou l'accroche commerciale que");
    console.error("la maquette affiche par construction. On ne devine pas, on fige :");
    console.error(`  node scripts/capture-maquette.mjs ${CHEMIN}`);
    console.error(`  index  : « ${h1Index ?? "(absent de l'index)"} »`);
    console.error(`  vivant : « ${h1Vivant} »`);
    await navigateur.close();
    process.exit(2);
  }

  if (h1Vivant && !memeTexte(h1Vivant, h1Figé)) {
    console.error(`La maquette n'a PAS ouvert ${CHEMIN} : elle rend une autre page.`);
    console.error(`  capture figée : « ${h1Figé} »`);
    console.error(`  rendu vivant  : « ${h1Vivant} »`);
    console.error("");
    console.error("Mesurer ici comparerait le site à une AUTRE page, et la divergence");
    console.error("serait fausse : c'est ainsi que la FAQ de /bureau-etudes/ a été relevée");
    console.error("à 69 % et portée au relais comme un défaut du site.");
    console.error("");
    console.error("Deux causes possibles, à trancher avant de mesurer :");
    console.error("  1. le routeur de la maquette détourne cette adresse ;");
    console.error(`  2. la capture figée a vieilli (maquette/rendu/${CLE}.json),`);
    console.error("     la maquette ayant été ré-exportée depuis. La refaire alors :");
    console.error(`     node scripts/capture-maquette.mjs ${CHEMIN}`);
    await navigateur.close();
    process.exit(2);
  }

  if (h1Index && !memeTexte(h1Figé, h1Index)) {
    console.log(
      `note : la maquette titre « ${h1Figé} » là où l'index annonce « ${h1Index} ».\n` +
        "      Conforme à sa capture figée : accroche de la maquette, pas un détournement.",
    );
  }
}

// Les pages d'étude de cas de la maquette n'ont pas de <main> : leurs sections
// pendent directement du corps.
await cadre.evaluate(FIGE);
const aMain = (await cadre.$$("main")).length > 0;
const infosRef = await cadre.$$eval(aMain ? "main" : "body", (mains) => {
  const principal = mains.find((m) => m.getBoundingClientRect().height > 50) ?? mains[0];
  const propre = (s) => (s || "").replace(/\s+/g, " ").trim();
  return [...principal.querySelectorAll("section")].map((s, i) => ({
    i,
    titre: propre(s.querySelector("h1,h2,h3")?.textContent) || null,
  }));
});
const elementsRef = await cadre.$$(aMain ? "main section" : "body section");
const fichiersRef = [];
for (let i = 0; i < elementsRef.length; i += 1) {
  const boite = await elementsRef[i].boundingBox();
  if (!boite || boite.height < 30) {
    fichiersRef.push(null);
    continue;
  }
  const chemin = `${SORTIE}/ref-${String(i).padStart(2, "0")}.png`;
  await elementsRef[i].scrollIntoViewIfNeeded();
  await pageRef.waitForTimeout(120);
  await elementsRef[i].screenshot({ path: chemin });
  fichiersRef.push(chemin);
}
await pageRef.close();

const site = await capture(SITE, "site");

// ------------------------------------------------------------- appariement

const normalise = (s) =>
  (s || "")
    .replace(/’/g, "'")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Apparie par titre quand il existe, par ordre relatif sinon. */
const paires = [];
let curseurSite = 0;
for (let r = 0; r < infosRef.length; r += 1) {
  const titreRef = normalise(infosRef[r].titre);
  let trouve = -1;
  if (titreRef) {
    trouve = site.infos.findIndex(
      (s, i) => i >= curseurSite && normalise(s.titre) === titreRef,
    );
  }
  if (trouve === -1) {
    // pas de titre : on prend la prochaine section du site non encore appariée
    trouve = curseurSite;
    while (trouve < site.infos.length && paires.some((p) => p.site === trouve)) trouve += 1;
  }
  if (trouve >= site.infos.length) break;
  paires.push({ ref: r, site: trouve, titre: infosRef[r].titre });
  curseurSite = Math.max(curseurSite, trouve + 1);
}

// ------------------------------------------------------------- comparaison

/** Compare deux images dans un canvas, rend le % de pixels divergents. */
const pageCalc = await contexte.newPage();
await pageCalc.goto("about:blank");

async function difference(cheminA, cheminB) {
  const [a, b] = await Promise.all(
    [cheminA, cheminB].map(async (c) => {
      const { readFile } = await import("node:fs/promises");
      return `data:image/png;base64,${(await readFile(c)).toString("base64")}`;
    }),
  );
  return pageCalc.evaluate(
    async ([urlA, urlB, seuil]) => {
      const charge = (u) =>
        new Promise((resoudre, rejeter) => {
          const img = new Image();
          img.onload = () => resoudre(img);
          img.onerror = rejeter;
          img.src = u;
        });
      const [ia, ib] = await Promise.all([charge(urlA), charge(urlB)]);
      const largeur = Math.min(ia.width, ib.width);
      const hauteur = Math.min(ia.height, ib.height);
      const toile = (img) => {
        const c = document.createElement("canvas");
        c.width = largeur;
        c.height = hauteur;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, largeur, hauteur).data;
      };
      const da = toile(ia);
      const db = toile(ib);
      let divergents = 0;
      const total = largeur * hauteur;
      for (let p = 0; p < total * 4; p += 4) {
        const d =
          Math.abs(da[p] - db[p]) +
          Math.abs(da[p + 1] - db[p + 1]) +
          Math.abs(da[p + 2] - db[p + 2]);
        if (d > seuil * 3) divergents += 1;
      }
      return {
        pourcent: Math.round((divergents / total) * 1000) / 10,
        recouvrement: `${largeur}x${hauteur}`,
        taillesDifferentes: ia.width !== ib.width || Math.abs(ia.height - ib.height) > 8,
      };
    },
    [a, b, SEUIL_CANAL],
  );
}

console.log(" ref  site  divergence  titre");
console.log("-".repeat(78));
const resultats = [];
for (const p of paires) {
  const fa = fichiersRef[p.ref];
  const fb = site.fichiers[p.site];
  if (!fa || !fb) continue;
  const d = await difference(fa, fb);
  resultats.push({ ...p, ...d, fa, fb });
  console.log(
    `${String(p.ref).padStart(4)} ${String(p.site).padStart(5)}  ` +
      `${String(d.pourcent).padStart(7)} %  ${(p.titre ?? "·").slice(0, 46)}` +
      (d.taillesDifferentes ? "  (tailles differentes)" : ""),
  );
}

// ---------------------------------------------------------------- montages

const pires = resultats
  .filter((r) => r.pourcent >= SEUIL_MONTAGE)
  .sort((a, b) => b.pourcent - a.pourcent);

for (const r of pires.slice(0, 6)) {
  const montage = await pageCalc.evaluate(
    async ([urlA, urlB, etiquette]) => {
      const charge = (u) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = u;
        });
      const [ia, ib] = await Promise.all([charge(urlA), charge(urlB)]);
      const c = document.createElement("canvas");
      const h = Math.max(ia.height, ib.height) + 34;
      c.width = ia.width + ib.width + 24;
      c.height = h;
      const x = c.getContext("2d");
      x.fillStyle = "#fff";
      x.fillRect(0, 0, c.width, c.height);
      x.font = "600 15px -apple-system, sans-serif";
      x.fillStyle = "#1c1b19";
      x.fillText("MAQUETTE", 4, 22);
      x.fillText("SITE", ia.width + 28, 22);
      x.drawImage(ia, 0, 34);
      x.drawImage(ib, ia.width + 24, 34);
      return c.toDataURL("image/png");
    },
    [
      `data:image/png;base64,${(await import("node:fs/promises").then((m) => m.readFile(r.fa))).toString("base64")}`,
      `data:image/png;base64,${(await import("node:fs/promises").then((m) => m.readFile(r.fb))).toString("base64")}`,
      r.titre ?? `section ${r.ref}`,
    ],
  );
  const chemin = `${SORTIE}/montage-${String(r.ref).padStart(2, "0")}.png`;
  writeFileSync(chemin, Buffer.from(montage.split(",")[1], "base64"));
  console.log(`montage : ${chemin} (${r.pourcent} %)`);
}

await navigateur.close();

writeFileSync(
  `${SORTIE}/_diff.json`,
  `${JSON.stringify({ date: new Date().toISOString(), resultats }, null, 2)}\n`,
);
console.log(`\n${pires.length} section(s) au-dessus de ${SEUIL_MONTAGE} % de divergence`);
