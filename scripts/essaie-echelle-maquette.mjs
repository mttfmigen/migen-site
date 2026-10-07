/**
 * Essaie plusieurs échelles sur le rendu de la maquette, et photographie chacune.
 *
 * Mehdi trouve les blocs trop gros et veut une grosse marge latérale. Trois
 * molettes existent déjà dans sa maquette, on les tourne plutôt que de
 * réécrire le dessin :
 *   --ts   l'échelle typographique, qui multiplie toutes les tailles de titre
 *   --sec  le rythme vertical des sections
 *   max-width:1200px  le conteneur, présent sur 212 blocs
 *
 * Rien n'est modifié dans le dépôt : on injecte une feuille de style par-dessus
 * le rendu, le temps de la photo.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const SORTIE = "/private/tmp/claude-501/-Users-mehdi-Landing-lovable/da881a94-2547-4109-9b4d-8e5435422202/scratchpad/variantes";
const MAQUETTE = "http://localhost:4352/autonome.html";
const PAGE_H1 = "Sous-traitance de maintenance industrielle";

/** Le conteneur de la maquette, et sa valeur d'origine. */
const CONTENEUR = 1200;

/**
 * Le conteneur se vise par son style en ligne, et il faut viser LES DEUX
 * écritures : la source écrit `max-width:1200px`, mais le DOM rendu sérialise
 * `max-width: 1200px`, avec une espace. La feuille de style de la maquette ne
 * vise que la première, ce qui explique sans doute d'autres surprises.
 */
const largeur = (px) =>
  `[style*="max-width:${CONTENEUR}px"],[style*="max-width: ${CONTENEUR}px"]{max-width:${px}px !important}`;

const VARIANTES = [
  {
    nom: "00-origine",
    titre: "Ta maquette telle quelle",
    css: "",
  },
  {
    nom: "01-doux",
    titre: "Échelle 0,88 et conteneur 1080 px",
    css: `:root,.mgx-root{--ts:.88 !important;--sec:104px !important}` + largeur(1080),
  },
  {
    nom: "02-net",
    titre: "Échelle 0,8 et conteneur 1000 px",
    css: `:root,.mgx-root{--ts:.8 !important;--sec:92px !important}` + largeur(1000),
  },
  {
    nom: "03-franc",
    titre: "Échelle 0,7 et conteneur 900 px",
    css: `:root,.mgx-root{--ts:.7 !important;--sec:84px !important}` + largeur(900),
  },
];

mkdirSync(SORTIE, { recursive: true });

/** La largeur change tout : le titre suit `clamp(38px,4.4vw,66px)`. */
const LARGEUR_ECRAN = Number(process.argv[2]) || 1280;

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({
  viewport: { width: LARGEUR_ECRAN, height: 900 },
});
const page = await contexte.newPage();

await page.goto(MAQUETTE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

/** Va sur la page d'offre par le plan du site, et vérifie l'arrivée. */
async function vaSurResidence() {
  await page.evaluate(() => {
    const l = [...document.querySelectorAll("a,button")].find(
      (x) => x.innerText.replace(/\s+/g, " ").trim() === "Toutes nos pages",
    );
    if (l) l.click();
  });
  await page.waitForFunction(
    () => /Toutes nos pages, au même endroit/.test(document.body.innerText),
    { timeout: 20000 },
  );
  await page.evaluate((h1) => {
    const l = [...document.querySelectorAll("a")].find(
      (a) => a.innerText.replace(/\s+/g, " ").trim() === h1,
    );
    if (l) l.click();
  }, PAGE_H1);
  await page.waitForFunction(
    (h1) => document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() === h1,
    PAGE_H1,
    { timeout: 20000 },
  );
}

let reference = null;
let rates = 0;

for (const v of VARIANTES) {
  await page.goto(MAQUETTE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await vaSurResidence();

  if (v.css) await page.addStyleTag({ content: v.css });
  await page.waitForTimeout(600);

  const mesure = await page.evaluate(() => {
    const m = [...document.querySelectorAll("main")].find(
      (x) => x.getBoundingClientRect().height > 50,
    );
    const h1 = document.querySelector("h1");
    let conteneur = h1;
    while (conteneur && !/^1[0-9]{3}px$|^[89][0-9]{2}px$/.test(conteneur.style.maxWidth || "")) {
      conteneur = conteneur.parentElement;
    }
    return {
      hauteur: Math.round(m.getBoundingClientRect().height),
      tailleH1: getComputedStyle(h1).fontSize,
      ts: getComputedStyle(document.documentElement).getPropertyValue("--ts").trim(),
      largeurConteneur: conteneur ? Math.round(conteneur.getBoundingClientRect().width) : null,
    };
  });

  if (v.css && reference && mesure.tailleH1 === reference.tailleH1 && mesure.largeurConteneur === reference.largeurConteneur) {
    console.error(`  ÉCHEC   ${v.nom} : la surcharge n'a rien changé, rien n'est photographié`);
    rates += 1;
    continue;
  }

  await page.screenshot({ path: `${SORTIE}/${v.nom}.png`, fullPage: true });

  // Un aperçu court, pour comparer sans ouvrir quatre images entières.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${SORTIE}/${v.nom}-haut.png` });

  if (!v.css) reference = mesure;

  console.log(
    `  ${v.nom.padEnd(20)} ${v.titre.padEnd(52)} ` +
      `h1 ${mesure.tailleH1.padStart(7)} · --ts ${mesure.ts.padStart(4)} · conteneur ${String(mesure.largeurConteneur).padStart(4)} px · page ${mesure.hauteur} px`,
  );
}

await navigateur.close();
console.log(`\nimages dans ${SORTIE}${rates ? ` · ${rates} variante(s) sans effet` : ""}`);
