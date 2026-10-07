/**
 * Compare CHAQUE page du site à sa capture du rendu de la maquette.
 *
 *   node scripts/compare-toutes-pages.mjs
 *   node scripts/compare-toutes-pages.mjs --gabarit "03 Offre"
 *
 * POURQUOI. Les portes existantes jugent UNE page à la fois, et on a conclu
 * trois fois que « le site y est » en regardant trois pages. Mehdi a demandé
 * l'inverse : « compare chaque page ». Ce balayage ouvre les 210 pages servies,
 * les mesure contre leur capture, et les CLASSE par gravité. Il ne corrige
 * rien : il dit où regarder, et dans quel ordre.
 *
 * CE QU'IL MESURE, par page :
 *   · la page répond-elle ;
 *   · combien de sections elle sert, contre combien la capture en annonce ;
 *   · combien de titres de section concordent, dans l'ordre ;
 *   · l'écart de volume de texte, en pourcentage.
 *
 * CE QU'IL NE MESURE PAS : le texte mot pour mot (c'est verifie-offre-rendu.mjs,
 * une page à la fois) ni les pixels (diff-visuel-offre.mjs). Ce balayage sert à
 * choisir la page suivante, pas à prouver qu'elle est finie.
 *
 * PRÉALABLE : le site sur http://localhost:4340/ (`bun run dev`).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const RENDU = join(RACINE, "maquette", "rendu");
const SITE = (process.env.SITE_URL ?? "http://localhost:4340/").replace(/\/$/, "");
const LARGEUR = 1280;
const HAUTEUR = 860;

const iGabarit = process.argv.indexOf("--gabarit");
const FILTRE = iGabarit > -1 ? process.argv[iGabarit + 1] : null;

/** Même normalisation que les autres portes du dépôt. */
const normalise = (t) =>
  (t ?? "")
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const EXTRAIT = () => {
  const principal = document.querySelector("main");
  if (!principal) return null;
  return [...principal.querySelectorAll(":scope > section")].map((section) => {
    const titre = section.querySelector("h1, h2, h3");
    return {
      titre: titre ? titre.innerText : null,
      /* Le texte entier sert à reconnaître le fil d'Ariane, qui n'a AUCUN
         titre : le reconnaître par son titre ne marchait pas, et tout le
         comparatif se décalait d'un cran. Piège payé une fois. */
      texte: (section.innerText || "").slice(0, 120),
      mots: (section.innerText || "").split(/\s+/).filter(Boolean).length,
    };
  });
};

const captures = readdirSync(RENDU)
  .filter((n) => n.endsWith(".json") && !n.startsWith("_"))
  .map((n) => JSON.parse(readFileSync(join(RENDU, n), "utf8")))
  .filter((c) => c.url && (!FILTRE || (c.gabarit ?? "").includes(FILTRE)))
  .sort((a, b) => a.url.localeCompare(b.url));

console.log(
  `${captures.length} pages à comparer${FILTRE ? ` (gabarit ${FILTRE})` : ""}, ` +
    `site ${SITE}\n`,
);

const navigateur = await chromium.launch({ channel: "chrome" });
const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
const resultats = [];

for (const [rang, capture] of captures.entries()) {
  const ligne = { url: capture.url, gabarit: capture.gabarit ?? "?" };
  try {
    const reponse = await page.goto(SITE + capture.url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    ligne.statut = reponse?.status() ?? 0;
    if (ligne.statut !== 200) {
      ligne.verdict = "non servie";
      resultats.push(ligne);
      continue;
    }
    await page.waitForTimeout(250);
    const servies = await page.evaluate(EXTRAIT);
    if (!servies) {
      ligne.verdict = "sans <main>";
      resultats.push(ligne);
      continue;
    }

    /* Le fil d'Ariane du site est une section en plus, connue et déclarée dans
       la porte G17 : on l'écarte ici aussi, sinon chaque page compterait un
       écart de structure qui n'en est pas un. */
    const utiles = servies.filter(
      (s, i) => !(i === 0 && /^Accueil \//.test(normalise(s.texte ?? ""))),
    );

    const refSections = capture.sections ?? [];
    ligne.sectionsRef = capture.nbSections ?? refSections.length;
    ligne.sectionsSite = utiles.length;

    const titresRef = refSections.map((s) => normalise(s.titre ?? ""));
    const titresSite = utiles.map((s) => normalise(s.titre ?? ""));
    let concordants = 0;
    for (let i = 0; i < Math.min(titresRef.length, titresSite.length); i += 1) {
      if (titresRef[i] && titresRef[i] === titresSite[i]) concordants += 1;
    }
    const titresAttendus = titresRef.filter(Boolean).length;
    ligne.titresConcordants = concordants;
    ligne.titresAttendus = titresAttendus;

    const motsRef = capture.motsRendus ?? capture.motsAnnonces ?? 0;
    const motsSite = utiles.reduce((s, x) => s + x.mots, 0);
    ligne.motsRef = motsRef;
    ligne.motsSite = motsSite;
    ligne.ecartMots = motsRef ? Math.round(((motsSite - motsRef) / motsRef) * 100) : null;

    const memeStructure = ligne.sectionsRef === ligne.sectionsSite;
    const memesTitres = titresAttendus > 0 && concordants === titresAttendus;
    ligne.verdict = memeStructure && memesTitres
      ? "conforme"
      : memeStructure
        ? "titres divergents"
        : "structure divergente";
  } catch (erreur) {
    ligne.verdict = "erreur";
    ligne.detail = erreur.message.split("\n")[0].slice(0, 90);
  }
  resultats.push(ligne);
  if ((rang + 1) % 25 === 0) console.log(`  … ${rang + 1}/${captures.length}`);
}

await navigateur.close();

/** Gravité : d'abord ce qui ne se sert pas, puis l'écart de structure. */
const gravite = (l) =>
  l.verdict === "non servie" || l.verdict === "erreur" || l.verdict === "sans <main>"
    ? 1000
    : Math.abs((l.sectionsRef ?? 0) - (l.sectionsSite ?? 0)) * 10 +
      ((l.titresAttendus ?? 0) - (l.titresConcordants ?? 0));

resultats.sort((a, b) => gravite(b) - gravite(a));

const parVerdict = {};
for (const l of resultats) parVerdict[l.verdict] = (parVerdict[l.verdict] ?? 0) + 1;

console.log(`\n${"verdict".padEnd(22)} pages`);
console.log("-".repeat(34));
for (const [v, n] of Object.entries(parVerdict).sort((a, b) => b[1] - a[1])) {
  console.log(`${v.padEnd(22)} ${String(n).padStart(5)}`);
}

console.log(`\nLes pages à reprendre, de la pire à la moins grave :\n`);
console.log(
  `${"page".padEnd(50)} ${"gabarit".padEnd(26)} sections  titres   mots`,
);
console.log("-".repeat(104));
for (const l of resultats.filter((x) => x.verdict !== "conforme").slice(0, 60)) {
  const sections =
    l.sectionsRef === undefined ? "—" : `${l.sectionsSite}/${l.sectionsRef}`;
  const titres =
    l.titresAttendus === undefined ? "—" : `${l.titresConcordants}/${l.titresAttendus}`;
  const mots = l.ecartMots === null || l.ecartMots === undefined ? "—" : `${l.ecartMots > 0 ? "+" : ""}${l.ecartMots} %`;
  console.log(
    `${l.url.padEnd(50)} ${String(l.gabarit).slice(0, 25).padEnd(26)} ${sections.padStart(8)} ${titres.padStart(7)} ${mots.padStart(6)}` +
      (l.verdict === "non servie" ? `   ${l.statut}` : "") +
      (l.detail ? `   ${l.detail}` : ""),
  );
}

const sortie = join(RACINE, "docs", "comparaison-toutes-pages.json");
writeFileSync(sortie, JSON.stringify(resultats, null, 2));
console.log(`\n${resultats.filter((l) => l.verdict === "conforme").length} conformes sur ${resultats.length}. Détail : ${sortie.replace(RACINE, "")}`);
