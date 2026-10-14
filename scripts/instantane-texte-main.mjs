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

const mots = (texte) => normalise(texte).split(" ").filter(Boolean);

function compte(texte) {
  const m = new Map();
  for (const mot of mots(texte)) m.set(mot, (m.get(mot) ?? 0) + 1);
  return m;
}

/**
 * LES COLLAGES DE FRONTIÈRE, et pourquoi ils ne sont pas des mots perdus.
 *
 * `textContent` colle le texte de deux éléments voisins sans espace : la fin
 * d'une section et le début de la suivante forment UN « mot », par exemple
 * « rétrofitéeCe » (fin du cas Retrofit, début de « Ce que nous vous
 * transmettons »). Poser quoi que ce soit ENTRE les deux (le photo + CTA de la
 * cadence, la bascule d'un repli) défait ce collage : « rétrofitéeCe »
 * disparaît, « rétrofitéeParlons » et « AppelerCe » apparaissent. Aucun mot
 * n'a quitté la page, mais le multi-ensemble le comptait perdu (mesuré le
 * 14/10 : 5 pages, 10 « mots », tous de cette espèce).
 *
 * LA RÈGLE EST ÉTROITE, et c'est ce qui la garde capable d'échouer. On aligne
 * les deux suites de mots (plus longue sous-suite commune) ; un mot n'est
 * excusé que s'il est SEUL supprimé entre deux mots alignés, qu'une insertion
 * l'y remplace, et qu'il se coupe en deux moitiés non vides dont la première
 * ouvre le premier mot inséré et la seconde ferme le dernier. Les deux moitiés
 * sont donc toujours là, de part et d'autre de l'insertion. Un vrai mot retiré
 * à côté d'une insertion (« demain » remplacé par « Être rappelé ») ne se coupe
 * pas ainsi et reste une perte : voir les témoins de `--controle`.
 */
function collages(avant, apres) {
  const a = mots(avant);
  const b = mots(apres);
  const n = a.length;
  const m = b.length;
  const largeur = m + 1;
  const lcs = new Uint32Array((n + 1) * largeur);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * largeur + j] =
        a[i] === b[j]
          ? lcs[(i + 1) * largeur + j + 1] + 1
          : Math.max(lcs[(i + 1) * largeur + j], lcs[i * largeur + j + 1]);
    }
  }
  const excuses = [];
  let supprimes = [];
  let inseres = [];
  const ferme = () => {
    if (supprimes.length === 1 && inseres.length) {
      const [mot] = supprimes;
      for (let k = 1; k < mot.length; k++) {
        const debut = mot.slice(0, k);
        const fin = mot.slice(k);
        if (!inseres[0].startsWith(debut)) continue;
        /* La seconde moitié ferme un mot inséré, pas forcément le dernier :
           quand le collage enjambe deux insertions (les rangées de /marques/),
           l'alignement peut ranger la suite plus loin. Si c'est le premier mot
           lui-même, il doit porter les deux moitiés sans les superposer. */
        if (inseres.some((t, x) => t.endsWith(fin) && (x > 0 || t.length >= mot.length))) {
          excuses.push(mot);
          break;
        }
      }
    }
    supprimes = [];
    inseres = [];
  };
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      ferme();
      i++;
      j++;
    } else if (j < m && (i === n || lcs[i * largeur + j + 1] >= lcs[(i + 1) * largeur + j])) {
      inseres.push(b[j++]);
    } else {
      supprimes.push(a[i++]);
    }
  }
  ferme();
  return excuses;
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
    // Les deux instantanés portent les nœuds séparés : on les compare, et la
    // règle des collages n'a plus rien à excuser. Sinon (instantané ancien),
    // repli sur le textContent et ses collages.
    const parNoeuds = typeof a.noeuds === "string" && typeof b.noeuds === "string";
    const ca = compte(parNoeuds ? a.noeuds : a.texte);
    const cb = compte(parNoeuds ? b.noeuds : b.texte);
    const perdus = manque(ca, cb);
    const colles = [];
    if (perdus.length && !parNoeuds) {
      for (const mot of collages(a.texte, b.texte)) {
        const k = perdus.indexOf(mot);
        if (k >= 0) colles.push(...perdus.splice(k, 1));
      }
    }
    pages.push({ url, perdus, colles, ajoutes: manque(cb, ca), ha: a.hauteur, hb: b.hauteur });
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
          resultat[url] = await page.evaluate(() => {
            const main = document.querySelector("main");
            // Les NŒUDS de texte, joints par une espace : ce que textContent
            // colle au bord de deux éléments (« rétrofitéeCe ») reste deux mots,
            // et une insertion entre eux ne fabrique plus de faux mot perdu.
            const noeuds = [];
            if (main) {
              const marche = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
              for (let n = marche.nextNode(); n; n = marche.nextNode()) noeuds.push(n.nodeValue ?? "");
            }
            return {
              texte: main?.textContent ?? "",
              noeuds: noeuds.join(" "),
              hauteur: document.documentElement.scrollHeight,
            };
          });
          resultat[url].texte = normalise(resultat[url].texte);
          resultat[url].noeuds = normalise(resultat[url].noeuds);
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
    if (p.colles?.length) {
      console.log(`COLLAGE ${p.url} : ${p.colles.length} frontière(s) défaite(s) par une insertion, moitiés présentes : ${p.colles.join(" ")}`);
    }
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
  /* Les collages : la frontière « repart.Demain » défaite par une insertion
     est excusée ; un vrai mot remplacé par une insertion, ou un collage dont
     une moitié manque, restent des pertes. */
  const colle = { "/a/": { texte: "Le technicien repart.Demain matin", hauteur: 1 } };
  const ok5 = (() => {
    const [p] = compareInstantanes(colle, { "/a/": { texte: "Le technicien repart.Être rappeléDemain matin", hauteur: 1 } });
    return p.perdus.length === 0 && p.colles.join() === "repart.Demain";
  })();
  const ok6 =
    compareInstantanes(avant, { "/a/": { texte: "Le technicien repart Être rappelé matin", hauteur: 1 } })[0].perdus.join() === "demain";
  const ok7 =
    compareInstantanes(colle, { "/a/": { texte: "Le technicien repart.Être rappelé matin", hauteur: 1 } })[0].perdus.join() === "repart.Demain";
  // Par nœuds : une insertion entre deux nœuds ne coûte rien, un nœud retiré se voit.
  const parNoeuds = { "/a/": { texte: "rétrofitéeCe que", noeuds: "rétrofitée Ce que", hauteur: 1 } };
  const ok8 = compareInstantanes(parNoeuds, { "/a/": { texte: "", noeuds: "rétrofitée Parlons Ce que", hauteur: 1 } })[0].perdus.length === 0;
  const ok9 = compareInstantanes(parNoeuds, { "/a/": { texte: "", noeuds: "rétrofitée Parlons que", hauteur: 1 } })[0].perdus.join() === "Ce";
  const ok = ok1 && ok2 && ok3 && ok4 && ok5 && ok6 && ok7 && ok8 && ok9;
  console.log(
    ok
      ? "CONTROLE OK : 9/9 (ajout toléré, perte vue, multiplicité vue, page absente vue, collage excusé, mot remplacé vu, moitié de collage perdue vue, insertion entre nœuds tolérée, nœud retiré vu)"
      : `CONTROLE EN ÉCHEC : ${[ok1, ok2, ok3, ok4, ok5, ok6, ok7].map((v, i) => (v ? "" : i + 1)).filter(Boolean).join(", ")}`,
  );
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
