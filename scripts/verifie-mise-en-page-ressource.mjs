/**
 * LA MISE EN PAGE DU GABARIT RESSOURCE TIENT-ELLE CONTRE LA MAQUETTE ET CONTRE
 * LA CHARTE DU SITE ?
 *
 *   node scripts/verifie-mise-en-page-ressource.mjs
 *   node scripts/verifie-mise-en-page-ressource.mjs --controle
 *   SITE_URL=http://localhost:4399 node scripts/verifie-mise-en-page-ressource.mjs /ressources/fiches-pratiques/
 *
 * POURQUOI ELLE EXISTE, et c'est une leçon payée le 12/10. Mehdi :
 * « la page fiche pratique est mal agencée [...] y'a aucune cohérence en design
 * et disposition ». Toutes les portes du gabarit étaient vertes : celle du
 * texte, celle du dessin, celle des blocs repliables. Aucune ne mesurait la
 * HAUTEUR RENDUE, et le repli mobile posé le matin même coûtait 29 à 33 px par
 * partie sur grand écran, soit +3 à +4 % sur la section du corps des 35 pages.
 * Une porte qui lit des déclarations ne voit pas une marge qui cesse de se
 * fusionner : il faut un navigateur, et il faut mesurer.
 *
 * CE QU'ELLE MESURE, sur le rendu réel, à 1280 x 900, la focale de
 * `scripts/capture-maquette.mjs` :
 *
 *  1. LA SUITE DES SECTIONS : autant que la capture, dans le même ordre.
 *  2. LA HAUTEUR DE CHAQUE SECTION contre celle de sa capture. Au-delà de
 *     30 px d'écart, la page doit déclarer des `retraits` (du texte retiré
 *     parce qu'il portait un terme interdit) ET la section doit être plus
 *     COURTE : du texte en moins raccourcit, il n'allonge jamais.
 *  3. LA LARGEUR MAXIMALE : 1200 px, ou `none` pour la bande d'appel qui va au
 *     bord. Aucune troisième valeur.
 *  4. LE SURTITRE DU SITE : 11,5 px, 0,14 em, graisse 600, encre d'accent. Le
 *     même jeton que les gabarits offre, secteur, ville et preuve.
 *  5. L'ÉCHELLE DES TITRES : tout `h2` en graisse 600, chasse resserrée entre
 *     0,025 et 0,05 em, taille entre 20 et 44 px.
 *  6. LES ORNEMENTS DU REPLI MOBILE restent invisibles sur bureau : un chevron
 *     ou un résumé qui apparaît à 1280 px est du mobile qui fuit.
 *  7. AUCUN DÉBORDEMENT HORIZONTAL. On mesure `.mg-site`, qui est en
 *     `overflow-x: clip` : le document, lui, ne déborde jamais.
 *  8. LES JETONS DE LA CHARTE (`--sec`, `--rad`, `--acc`, `--ft`) valent ceux
 *     de la page de référence, relevés au même passage, pas écrits en dur ici.
 *
 * CE QU'ELLE NE FAIT PAS : juger la maquette. Les cartes de la section
 * « Pourquoi ces fiches existent » s'étirent à la hauteur de la plus haute et
 * laissent du blanc, et la dernière rangée n'en porte qu'une : c'est le dessin
 * de la capture, mesuré identique. Cette porte le constate, elle ne le corrige
 * pas.
 *
 * LE CONTRÔLE POSITIF (`--controle`) injecte six fautes dans une page déjà
 * conforme et exige que chacune soit vue. Une porte qu'on n'a pas vue échouer
 * ne prouve rien.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4399";
const LARGEUR = 1280;
const HAUTEUR = 900;

/** La page dont on relève les jetons de charte, et à laquelle on se compare. */
const REFERENCE = "/offres/zero-arret/";

/** Écart de hauteur toléré quand le texte rendu vaut celui de la capture. */
const TOLERANCE_PX = 30;

const args = process.argv.slice(2);
const CONTROLE = args.includes("--controle");

const cle = (url) => url.replace(/^\/|\/$/g, "").replace(/\//g, "--");
const fichierDonnees = (url) =>
  join(RACINE, "supabase", "import", "gabarits-maquette", `${url.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.json`);

/* ------------------------------------------------------------- les pages */

function pagesDuGabarit() {
  const index = JSON.parse(
    readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
  );
  const liste = Array.isArray(index) ? index : (index.pages ?? Object.values(index)[0]);
  return liste
    .filter(
      (p) =>
        String(p.url).startsWith("/ressources/") &&
        (p.gabarit === "01 Article et fiche" || p.gabarit === "11 Sous-rubrique ressource"),
    )
    .map((p) => p.url);
}

/* ------------------------------------------------------------- le relevé */

/**
 * Ce que la page montre réellement. Aucun jugement ici : la porte juge après,
 * sur ces nombres, et le contrôle positif rejoue exactement cette fonction
 * après avoir abîmé la page.
 */
async function releve(page) {
  return page.evaluate(() => {
    const propre = (s) => (s || "").replace(/\s+/g, " ").trim();
    const racine = getComputedStyle(document.documentElement);
    const principal =
      [...document.querySelectorAll("main")].find(
        (m) => m.getBoundingClientRect().height > 50,
      ) ?? document.body;

    const geometrie = [...principal.querySelectorAll("section")].map((s, i) => ({
      ordre: i,
      label: s.getAttribute("data-screen-label"),
      titre: propre(s.querySelector("h2, h3")?.textContent) || null,
      hauteur: Math.round(s.getBoundingClientRect().height),
      maxWidth: getComputedStyle(s).maxWidth,
    }));

    /* UN SURTITRE DU SYSTÈME : petit, en capitales, chasse écartée, encre
       d'accent. On relève tous ceux qui en ont l'allure, la porte vérifie
       ensuite qu'au moins un porte exactement le jeton du site. */
    const surtitres = [
      ...new Set(
        [...principal.querySelectorAll("div,p,span")]
          .filter((e) => {
            const c = getComputedStyle(e);
            return (
              c.textTransform === "uppercase" &&
              parseFloat(c.letterSpacing) > 0.8 &&
              parseFloat(c.fontSize) < 16
            );
          })
          .map((e) => {
            const c = getComputedStyle(e);
            return [
              Math.round(parseFloat(c.fontSize) * 10) / 10,
              Math.round((parseFloat(c.letterSpacing) / parseFloat(c.fontSize)) * 1000) / 1000,
              c.fontWeight,
              c.color,
            ].join("|");
          }),
      ),
    ];

    const titres = [...principal.querySelectorAll("h2")].map((e) => {
      const c = getComputedStyle(e);
      return {
        texte: propre(e.textContent).slice(0, 40),
        taille: Math.round(parseFloat(c.fontSize) * 100) / 100,
        graisse: Number(c.fontWeight),
        chasse: Math.round((parseFloat(c.letterSpacing) / parseFloat(c.fontSize)) * 1000) / 1000,
      };
    });

    /* L'ÉLÉMENT, pas le document : `.mg-site` est en `overflow-x: clip`, le
       document ne déborde donc jamais et le mesurer ne prouverait rien. */
    const site = document.querySelector(".mg-site") ?? principal;

    return {
      jetons: {
        sec: racine.getPropertyValue("--sec").trim(),
        rad: racine.getPropertyValue("--rad").trim(),
        acc: racine.getPropertyValue("--acc").trim(),
        ft: racine.getPropertyValue("--ft").trim(),
      },
      sections: geometrie,
      surtitres,
      titres,
      debordement: Math.round(site.scrollWidth) - Math.round(site.clientWidth),
      /* Combien la page en porte, visibles ou non : le contrôle positif a
         besoin d'une page qui en a, sinon sa faute « un ornement montré sur
         bureau » ne peut pas être injectée et le contrôle se croit en échec
         alors que c'est la cible qui était mal choisie. */
      ornements: document.querySelectorAll("[data-mobile-seulement]").length,
      pliables: document.querySelectorAll("details[data-pliable-mobile]").length,
      ornementsVisibles: [...document.querySelectorAll("[data-mobile-seulement]")]
        .filter((e) => getComputedStyle(e).display !== "none")
        .map((e) => propre(e.textContent).slice(0, 40) || e.tagName),
    };
  });
}

/* ------------------------------------------------------------- le jugement */

function juge(url, vu, capture, donnees, reference) {
  const erreurs = [];
  const exige = (condition, message) => {
    if (!condition) erreurs.push(message);
  };

  // 1. la suite des sections
  exige(
    vu.sections.length === capture.nbSections,
    `${vu.sections.length} sections rendues, la capture en a ${capture.nbSections}`,
  );

  // 2. la hauteur de chaque section
  const retraits = donnees?.retraits ?? [];
  vu.sections.forEach((s, i) => {
    const c = capture.sections?.[i];
    if (!c) return;
    const ecart = s.hauteur - c.hauteur;
    if (Math.abs(ecart) <= TOLERANCE_PX) return;
    const nom = s.titre ?? s.label ?? `section ${i}`;
    if (retraits.length === 0) {
      erreurs.push(
        `section ${i} « ${nom} » : ${s.hauteur} px rendus, ${c.hauteur} px dans la capture ` +
          `(${ecart > 0 ? "+" : ""}${ecart} px, ${((ecart / c.hauteur) * 100).toFixed(1)} %), ` +
          `et la page ne déclare aucun retrait`,
      );
    } else if (ecart > 0) {
      erreurs.push(
        `section ${i} « ${nom} » : ${ecart} px de PLUS que la capture. Les retraits déclarés ` +
          `retirent du texte, ils ne peuvent pas rallonger une section`,
      );
    }
  });

  // 3. la largeur maximale
  const largeurs = [...new Set(vu.sections.map((s) => s.maxWidth))];
  const horsCharte = largeurs.filter((l) => l !== "1200px" && l !== "none");
  exige(
    horsCharte.length === 0,
    `largeur maximale hors charte : ${horsCharte.join(", ")} (1200px, ou none pour la bande d'appel)`,
  );

  // 4. le surtitre du système
  const SURTITRE = `11.5|0.14|600|${reference.accRgb}`;
  exige(
    vu.surtitres.includes(SURTITRE),
    `surtitre du site absent (attendu « ${SURTITRE} », vus : ${vu.surtitres.join(" , ") || "aucun"})`,
  );

  // 5. l'échelle des titres
  for (const t of vu.titres) {
    if (t.graisse !== 600)
      erreurs.push(`h2 « ${t.texte} » en graisse ${t.graisse}, la charte pose 600`);
    if (t.chasse > -0.025 || t.chasse < -0.05)
      erreurs.push(`h2 « ${t.texte} » à ${t.chasse}em de chasse, hors de la plage -0,025 à -0,05`);
    if (t.taille < 20 || t.taille > 44)
      erreurs.push(`h2 « ${t.texte} » à ${t.taille}px, hors de l'échelle 20 à 44`);
  }

  // 6. les ornements mobiles
  exige(
    vu.ornementsVisibles.length === 0,
    `${vu.ornementsVisibles.length} ornement(s) du repli mobile visible(s) à ${LARGEUR} px : ` +
      vu.ornementsVisibles.slice(0, 3).map((o) => `« ${o} »`).join(", "),
  );

  // 7. le débordement horizontal
  exige(vu.debordement <= 0, `${vu.debordement} px de débordement horizontal de .mg-site`);

  // 8. les jetons de la charte
  for (const nom of ["sec", "rad", "acc", "ft"]) {
    exige(
      vu.jetons[nom] === reference.jetons[nom],
      `jeton --${nom} = « ${vu.jetons[nom]} », la page de référence ${REFERENCE} pose « ${reference.jetons[nom]} »`,
    );
  }

  return erreurs;
}

/* ------------------------------------------------------------- la visite */

async function visite(page, url) {
  await page.goto(SITE + url, { waitUntil: "networkidle", timeout: 90000 });
  /* Le bandeau de consentement et la pastille Next comptent des pixels qui ne
     sont pas la page : jusqu'à 57 % de faux écart, piège déjà payé. */
  for (const libelle of ["Tout refuser", "Refuser"]) {
    const bouton = page.getByRole("button", { name: libelle });
    if ((await bouton.count()) > 0) {
      try {
        await bouton.first().click({ timeout: 2000 });
      } catch {
        /* déjà refusé */
      }
      break;
    }
  }
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((n) => n.remove());
  });
  /* La mise en page se pose : on déroule la page, puis on attend que sa
     hauteur cesse de bouger. Mesurer tout de suite donnait 900 px pour des
     pages qui en font neuf mille. */
  await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = () => document.body.scrollHeight;
    for (let y = 0; y < h(); y += 800) {
      window.scrollTo(0, y);
      await dort(50);
    }
    window.scrollTo(0, 0);
    let avant = h();
    for (let i = 0; i < 12; i += 1) {
      await dort(180);
      if (h() === avant) break;
      avant = h();
    }
  });
}

/* ------------------------------------------- le contrôle positif, six fautes */

const FAUTES = [
  {
    /* LA FAUTE DU 12/10, REMISE TELLE QUELLE : le conteneur du corps
       redevient une boîte à marge et le `summary` redevient une boîte flex,
       donc les marges du titre cessent de se fusionner. C'est exactement ce
       qui coûtait 29 à 33 px par partie et que toutes les autres portes
       laissaient passer. */
    nom: "le repli mobile qui reprend ses pixels sur bureau",
    attendu: /px rendus|px de PLUS/,
    injecte: () => {
      const blocs = [...document.querySelectorAll("details[data-pliable-mobile]")];
      for (const b of blocs) {
        const corps = [...b.children].find(
          (e) => e.tagName === "DIV" && !e.hasAttribute("data-mobile-seulement"),
        );
        if (corps) {
          corps.style.setProperty("display", "block", "important");
          corps.style.setProperty("margin-top", "12px", "important");
        }
        const somm = b.querySelector(":scope > summary");
        if (somm) somm.style.setProperty("display", "flex", "important");
      }
      if (blocs.length === 0) document.querySelectorAll("main section")[1].style.paddingTop = "240px";
    },
  },
  {
    nom: "une section à 980 px de large au lieu de 1200",
    attendu: /largeur maximale hors charte/,
    injecte: () => {
      document.querySelectorAll("main section")[0].style.maxWidth = "980px";
    },
  },
  {
    nom: "le surtitre du site passé à une autre chasse",
    attendu: /surtitre du site absent/,
    injecte: () => {
      for (const e of document.querySelectorAll("main div, main p, main span")) {
        const c = getComputedStyle(e);
        if (c.textTransform === "uppercase" && Math.abs(parseFloat(c.fontSize) - 11.5) < 0.2) {
          e.style.letterSpacing = "0.04em";
        }
      }
    },
  },
  {
    nom: "un h2 en graisse 400 et à 16 px",
    attendu: /graisse 400|hors de l'échelle/,
    injecte: () => {
      const h = document.querySelector("main h2");
      if (h) {
        h.style.fontWeight = "400";
        h.style.fontSize = "16px";
      }
    },
  },
  {
    nom: "un ornement du repli mobile montré sur bureau",
    attendu: /ornement\(s\) du repli mobile/,
    injecte: () => {
      const o = document.querySelector("[data-mobile-seulement]");
      if (o) o.style.setProperty("display", "block", "important");
    },
  },
  {
    nom: "un bloc qui déborde de 200 px à droite",
    attendu: /débordement horizontal/,
    injecte: () => {
      const site = document.querySelector(".mg-site") ?? document.body;
      const d = document.createElement("div");
      d.style.cssText = "width:200px;height:10px;margin-left:100%";
      site.append(d);
    },
  },
];

/* ------------------------------------------------------------- le programme */

const choisies = args.filter((a) => a.startsWith("/ressources/"));
const urls = choisies.length > 0 ? choisies : pagesDuGabarit();
if (urls.length === 0) {
  console.error("l'index de la maquette ne déclare aucune page du gabarit ressource");
  process.exit(1);
}

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({
  viewport: { width: LARGEUR, height: HAUTEUR },
});
const page = await contexte.newPage();

/* La page de référence d'abord : ses jetons servent de charte aux autres. */
await visite(page, REFERENCE);
const vuReference = await releve(page);
const reference = {
  jetons: vuReference.jetons,
  accRgb: await page.evaluate(() => {
    const d = document.createElement("div");
    d.style.color = "var(--acc)";
    document.body.append(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  }),
};
console.log(
  `charte lue sur ${REFERENCE} : --sec ${reference.jetons.sec} · --rad ${reference.jetons.rad} · ` +
    `--acc ${reference.jetons.acc} (${reference.accRgb})\n`,
);

let echecs = 0;
let sectionsMesurees = 0;
let premiereConforme = null;

for (const url of urls) {
  const fichier = join(RACINE, "maquette", "rendu", `${cle(url)}.json`);
  if (!existsSync(fichier)) {
    console.log(`  KO  ${url}\n    · aucune capture : ${fichier}`);
    echecs += 1;
    continue;
  }
  const capture = JSON.parse(readFileSync(fichier, "utf8"));
  const cheminDonnees = fichierDonnees(url);
  const donnees = existsSync(cheminDonnees)
    ? JSON.parse(readFileSync(cheminDonnees, "utf8"))
    : null;

  await visite(page, url);
  const vu = await releve(page);
  sectionsMesurees += vu.sections.length;
  const erreurs = juge(url, vu, capture, donnees, reference);

  if (erreurs.length === 0) {
    console.log(`  ok  ${url}`);
    /* LA CIBLE DU CONTRÔLE DOIT PORTER DES BLOCS REPLIABLES ET LEURS
       ORNEMENTS : deux de ses six fautes n'existent que là. Les rayons, qui
       n'en ont aucun, feraient échouer le contrôle pour une mauvaise raison. */
    if (!premiereConforme && vu.pliables > 0 && vu.ornements > 0) premiereConforme = url;
  } else {
    echecs += 1;
    console.log(`  KO  ${url}\n    · ${erreurs.slice(0, 6).join("\n    · ")}`);
  }
}

console.log(
  `\nmise en page du gabarit ressource : ${urls.length - echecs}/${urls.length} pages conformes, ` +
    `${sectionsMesurees} sections mesurées contre leur capture (site : ${SITE}).`,
);

if (CONTROLE) {
  const cible = premiereConforme ?? urls[0];
  if (!premiereConforme) {
    console.log(
      `\ncontrôle positif IMPOSSIBLE : aucune page conforme ne porte de bloc repliable, ` +
        `deux des six fautes ne peuvent pas être injectées.`,
    );
    echecs += 1;
  }
  console.log(`\ncontrôle positif, six fautes injectées dans ${cible} :`);
  const capture = JSON.parse(readFileSync(join(RACINE, "maquette", "rendu", `${cle(cible)}.json`), "utf8"));
  const cheminDonnees = fichierDonnees(cible);
  const donnees = existsSync(cheminDonnees) ? JSON.parse(readFileSync(cheminDonnees, "utf8")) : null;

  let vues = 0;
  for (const faute of FAUTES) {
    await visite(page, cible);
    await page.evaluate(faute.injecte);
    await page.waitForTimeout(150);
    const vu = await releve(page);
    const erreurs = juge(cible, vu, capture, donnees, reference);
    const trouvee = erreurs.some((e) => faute.attendu.test(e));
    if (trouvee) vues += 1;
    console.log(
      `  ${trouvee ? "OK  " : "RATÉ"}  ${faute.nom}` +
        (trouvee ? "" : `\n        aucune erreur ne correspond : ${erreurs.join(" | ") || "(aucune)"}`),
    );
  }
  console.log(`\ncontrôle positif : ${vues}/${FAUTES.length} fautes vues`);
  if (vues < FAUTES.length) echecs += 1;
}

await navigateur.close();
process.exit(echecs > 0 ? 1 : 0);
