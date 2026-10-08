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

import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

/* La page se passe en argument : `node scripts/diff-visuel-offre.mjs /offres/`.
   Sans argument, la page pilote validée par Mehdi le 06/10. */
const CHEMIN = process.argv[2] ?? "/offres/residence/";
const MAQUETTE = `http://localhost:4352/voir.html?url=${CHEMIN}`;
const SITE = `http://localhost:4340${CHEMIN}`;
const SORTIE = process.env.SORTIE ?? "/tmp/diff-offre"; // configurable : des mesures parallèles ne doivent pas s'écraser

/** Au-delà de ce delta par canal, deux pixels sont dits différents. */
const SEUIL_CANAL = 40;

/** Une section dont plus de ce pourcentage de pixels diverge mérite un montage. */
const SEUIL_MONTAGE = 4;

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
  await page.goto(url, { waitUntil: "networkidle" });
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
await pageRef.goto(MAQUETTE, { waitUntil: "networkidle" });
await pageRef.waitForFunction(
  () => document.getElementById("etat")?.textContent?.startsWith("page ouverte"),
  { timeout: 30000 },
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
