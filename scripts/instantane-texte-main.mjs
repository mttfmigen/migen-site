#!/usr/bin/env node
/**
 * AUCUN MOT PERDU : instantané du texte du <main> des 158 pages, et comparaison.
 *
 * POURQUOI. La maquette mobile v2 pose une règle : « replier, jamais retirer ».
 * Google lit le `textContent`, replié ou non. Une section passée en <details>
 * garde son texte ; une section passée en `display:none` puis retirée par un
 * composant client le perd. Seule une mesure page par page, après hydratation,
 * le voit : un grep sur le HTML servi ne voit pas ce que le navigateur retire.
 *
 *   node scripts/instantane-texte-main.mjs prends <base> <largeur> <fichier.json>
 *   node scripts/instantane-texte-main.mjs compare <avant.json> <apres.json>
 *   node scripts/instantane-texte-main.mjs --controle
 *
 * `prends` lit le plan du site de la base, ouvre chaque page à la largeur
 * donnée, attend l'hydratation, et range pour chacune le texte normalisé du
 * <main> et la hauteur du document.
 *
 * `compare` rend, page par page, les mots PERDUS (multi-ensemble : un mot
 * présent trois fois avant et deux fois après compte une perte) et les mots
 * AJOUTÉS, puis la hauteur avant et après. Elle échoue sur la moindre perte et
 * n'imprime AUCUN_MOT_PERDU que si aucune page n'en perd. Les ajouts ne la font
 * pas échouer : la couche de conversion mobile ajoute des boutons, c'est voulu,
 * mais ils sont listés pour qu'on les relise.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const normalise = (t) =>
  (t ?? "")
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

function compte(texte) {
  const m = new Map();
  for (const mot of normalise(texte).split(" ").filter(Boolean)) m.set(mot, (m.get(mot) ?? 0) + 1);
  return m;
}

/** Ce que `b` a de moins que `a`, mot par mot, avec la multiplicité. */
function manque(a, b) {
  const sortie = [];
  for (const [mot, n] of a) {
    const reste = n - (b.get(mot) ?? 0);
    for (let i = 0; i < reste; i++) sortie.push(mot);
  }
  return sortie;
}

export function compareInstantanes(avant, apres) {
  const pages = [];
  for (const [url, a] of Object.entries(avant)) {
    const b = apres[url];
    if (!b) {
      pages.push({ url, perdus: ["(page absente)"], ajoutes: [], ha: a.hauteur, hb: null });
      continue;
    }
    const ca = compte(a.texte);
    const cb = compte(b.texte);
    pages.push({ url, perdus: manque(ca, cb), ajoutes: manque(cb, ca), ha: a.hauteur, hb: b.hauteur });
  }
  return pages;
}

async function prends(base, largeur, fichier) {
  const plan = await (await fetch(`${base}/sitemap.xml`)).text();
  const urls = [...plan.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (urls.length < 100) throw new Error(`MESURE NON CONCLUANTE : ${urls.length} pages au plan de ${base}`);
  const nav = await chromium.launch({ channel: "chrome" });
  const ctx = await nav.newContext({ viewport: { width: largeur, height: 900 } });
  const resultat = {};
  const file = [...urls];
  const ouvrier = async () => {
    const page = await ctx.newPage();
    while (file.length) {
      const url = file.shift();
      for (let essai = 0; essai < 3; essai++) {
        try {
          await page.goto(base + url, { waitUntil: "load", timeout: 60000 });
          await page.waitForTimeout(1200);
          resultat[url] = await page.evaluate(() => ({
            texte: document.querySelector("main")?.textContent ?? "",
            hauteur: document.documentElement.scrollHeight,
          }));
          resultat[url].texte = normalise(resultat[url].texte);
          break;
        } catch (e) {
          if (essai === 2) resultat[url] = { texte: "", hauteur: 0, erreur: String(e).slice(0, 120) };
        }
      }
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: 6 }, ouvrier));
  await nav.close();
  writeFileSync(fichier, JSON.stringify(resultat));
  const vides = Object.entries(resultat).filter(([, v]) => !v.texte).map(([u]) => u);
  console.log(`${Object.keys(resultat).length} pages à ${largeur} px rangées dans ${fichier}${vides.length ? ` ; SANS <main> lisible : ${vides.join(" ")}` : ""}`);
}

function rapporte(pages) {
  let pertes = 0;
  for (const p of pages) {
    if (p.perdus.length) {
      pertes++;
      console.log(`PERTE ${p.url} : ${p.perdus.length} mot(s) : ${p.perdus.slice(0, 25).join(" ")}`);
    }
  }
  const ajouts = new Map();
  for (const p of pages) for (const m of p.ajoutes) ajouts.set(m, (ajouts.get(m) ?? 0) + 1);
  const avecAjout = pages.filter((p) => p.ajoutes.length).length;
  if (avecAjout) {
    console.log(`Ajouts sur ${avecAjout} page(s), mots les plus fréquents : ${[...ajouts].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([m, n]) => `${m}×${n}`).join(" ")}`);
  }
  const mesurees = pages.filter((p) => p.ha && p.hb);
  const sommeA = mesurees.reduce((s, p) => s + p.ha, 0);
  const sommeB = mesurees.reduce((s, p) => s + p.hb, 0);
  console.log(`Hauteur cumulée : ${sommeA} px avant, ${sommeB} px après (${mesurees.length} pages)`);
  if (pertes) {
    console.log(`${pertes} page(s) perdent du texte sur ${pages.length}`);
    return 1;
  }
  console.log(`AUCUN_MOT_PERDU  ${pages.length} pages comparées, aucune ne perd un mot du <main>`);
  return 0;
}

const [mode, ...args] = process.argv.slice(2);
if (mode === "--controle") {
  const avant = { "/a/": { texte: "Le technicien repart demain matin", hauteur: 900 } };
  const memeAvecAjout = { "/a/": { texte: "Le technicien repart demain matin Être rappelé", hauteur: 500 } };
  const perte = { "/a/": { texte: "Le technicien repart matin", hauteur: 500 } };
  const doublonPerdu = { "/a/": { texte: "Le le technicien", hauteur: 1 } };
  const ok1 = compareInstantanes(avant, memeAvecAjout)[0].perdus.length === 0;
  const ok2 = compareInstantanes(avant, perte)[0].perdus.join() === "demain";
  const ok3 = compareInstantanes({ "/a/": { texte: "Le le le technicien", hauteur: 1 } }, doublonPerdu)[0].perdus.join() === "le";
  const ok4 = compareInstantanes(avant, {})[0].perdus.length === 1;
  const ok = ok1 && ok2 && ok3 && ok4;
  console.log(ok ? "CONTROLE OK : 4/4 (ajout toléré, perte vue, multiplicité vue, page absente vue)" : "CONTROLE EN ÉCHEC");
  process.exit(ok ? 0 : 1);
} else if (mode === "prends") {
  const [base, largeur, fichier] = args;
  await prends(base.replace(/\/$/, ""), Number(largeur), fichier);
} else if (mode === "compare") {
  const [a, b] = args;
  process.exit(rapporte(compareInstantanes(JSON.parse(readFileSync(a, "utf8")), JSON.parse(readFileSync(b, "utf8")))));
} else {
  console.log("usage : prends <base> <largeur> <fichier> | compare <avant> <apres> | --controle");
  process.exit(2);
}
