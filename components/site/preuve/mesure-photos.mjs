/**
 * MESURE les images d'une étude de cas dans la maquette qui tourne, jamais ne
 * les choisit.
 *
 *   node components/site/preuve/mesure-photos.mjs /preuves/jtekt/ [/preuves/…]
 *
 * La capture (`maquette/rendu/preuves--*.html`) sert ses images en `blob:` : une
 * URL qui ne nomme aucun fichier. Ce script ouvre la page dans la maquette
 * vivante (`voir.html`, servie par `scripts/sers-maquette.sh` sur 4352), lit les
 * OCTETS de chaque `blob:` dans le cadre, et cherche un fichier du dépôt qui a
 * exactement ces octets (sha256) :
 *
 *   - `public/assets/**` les a déjà : on prend ce fichier ;
 *   - sinon, pour un logo, `design_handoff_migen_site/maquette/assets/
 *     {clients,logos}/` les a : copié tel quel dans `public/assets/clients/` ;
 *   - sinon, les octets sont écrits tels quels dans
 *     `public/assets/web/mq-<12 premiers caractères du sha256>.<ext>`.
 *
 * Chaque octet lu doit AUSSI exister dans la table de ressources de
 * `maquette/site-final-autonome.html` : sinon le script s'arrête.
 *
 * Sortie : sur stdout, par URL, les champs optionnels de `ContenuPreuve`
 * (`logo`, `logoInverse`, `photoHero`, `photoDispositif`, `photo` de chaque carte
 * `plusLoin` repérée par son `href`), prêts à être recopiés dans la donnée.
 */

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const PUBLIC = join(RACINE, "public");
const MAQUETTE = (process.env.MAQUETTE_URL ?? "http://localhost:4352").replace(/\/$/, "");
const SOURCES_LOGOS = ["clients", "logos"].map((d) =>
  join(RACINE, "design_handoff_migen_site", "maquette", "assets", d),
);
const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/avif": "avif",
};

const sha = (octets) => createHash("sha256").update(octets).digest("hex");

function fichiers(dossier) {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : [chemin];
  });
}

/** Les empreintes des images embarquées dans l'autonome, même lecture que verification-carriere.tsx. */
function empreintesMaquette() {
  const lignes = readFileSync(join(RACINE, "maquette", "site-final-autonome.html"), "utf8").split("\n");
  const ligne = lignes.find((l) => l.startsWith('{"') && l.includes('"mime"'));
  if (!ligne) throw new Error("l'autonome ne porte plus sa table de ressources");
  const table = JSON.parse(ligne.slice(0, ligne.lastIndexOf("}") + 1));
  return new Set(
    Object.values(table)
      .filter((r) => r.mime.startsWith("image/"))
      .map((r) => {
        const brut = Buffer.from(r.data, "base64");
        return sha(r.compressed ? gunzipSync(brut) : brut);
      }),
  );
}

const EMPREINTES = empreintesMaquette();
const DEPOT = new Map(fichiers(join(PUBLIC, "assets")).map((f) => [sha(readFileSync(f)), f]));

/** Le chemin public d'un fichier qui a ces octets, écrit s'il le faut. */
function fichierPour(octets, mime, logo) {
  const empreinte = sha(octets);
  if (!EMPREINTES.has(empreinte)) throw new Error(`octets ${empreinte} absents des ressources de la maquette`);
  let fichier = DEPOT.get(empreinte);
  if (!fichier && logo) {
    const source = SOURCES_LOGOS.flatMap(fichiers).find((f) => sha(readFileSync(f)) === empreinte);
    const cible = source && join(PUBLIC, "assets", "clients", basename(source));
    if (cible && !existsSync(cible)) {
      copyFileSync(source, cible);
      fichier = cible;
    }
  }
  if (!fichier) {
    const ext = EXTENSIONS[mime];
    if (!ext) throw new Error(`type d'image inconnu : ${mime}`);
    fichier = join(PUBLIC, "assets", logo ? "clients" : "web", `mq-${empreinte.slice(0, 12)}.${ext}`);
    writeFileSync(fichier, octets);
  }
  DEPOT.set(empreinte, fichier);
  return `/${relative(PUBLIC, fichier).split("\\").join("/")}`;
}

const navigateur = await chromium.launch({ channel: "chrome" });
const resultat = {};
for (const url of process.argv.slice(2)) {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${MAQUETTE}/voir.html?url=${encodeURIComponent(url)}`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => document.getElementById("etat")?.textContent?.startsWith("page ouverte"),
    { timeout: 40000 },
  );
  const cadre = page.frames().find((f) => f.url().includes("autonome"));
  const images = await cadre.evaluate(async () => {
    const racine = document.querySelector(".cas-root");
    if (!racine) throw new Error("racine .cas-root introuvable : ce n'est pas une étude de cas");
    const lis = async (img) => {
      const blob = await fetch(img.src).then((r) => r.blob());
      const octets = new Uint8Array(await blob.arrayBuffer());
      let binaire = "";
      for (let i = 0; i < octets.length; i += 0x8000) {
        binaire += String.fromCharCode(...octets.subarray(i, i + 0x8000));
      }
      return { mime: blob.type, base64: btoa(binaire), alt: img.alt, filtre: img.style.filter };
    };
    const sortie = [];
    for (const img of racine.querySelectorAll("img")) {
      const section = img.closest("section")?.getAttribute("data-screen-label") ?? "";
      const carte = img.closest("a[href]")?.getAttribute("href") ?? null;
      sortie.push({ section, carte, ...(await lis(img)) });
    }
    return sortie;
  });
  const champs = { plusLoin: {} };
  for (const image of images) {
    const octets = Buffer.from(image.base64, "base64");
    const estLogo = image.section.includes("héros") && !image.alt.startsWith("Intervention");
    const chemin = fichierPour(octets, image.mime, estLogo);
    if (estLogo) {
      champs.logo = chemin;
      if (image.filtre === "invert(1) hue-rotate(180deg)") champs.logoInverse = true;
      else if (image.filtre && image.filtre !== "none") throw new Error(`${url} : filtre de logo inconnu « ${image.filtre} »`);
    } else if (image.section.includes("héros")) champs.photoHero = chemin;
    else if (image.section === "Le dispositif") champs.photoDispositif = chemin;
    else if (image.carte) champs.plusLoin[image.carte] = chemin;
    else throw new Error(`${url} : image hors des emplacements connus (${image.section})`);
  }
  resultat[url] = champs;
  await page.close();
}
await navigateur.close();
console.log(JSON.stringify(resultat, null, 2));
