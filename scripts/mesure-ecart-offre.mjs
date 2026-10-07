/**
 * MESURE l'écart entre la page d'offre de la maquette et celle du site.
 * Elle ne corrige rien. Elle relève deux valeurs par propriété, jamais un avis.
 *
 *   node scripts/mesure-ecart-offre.mjs                 mesure et écrit le relevé
 *   node scripts/mesure-ecart-offre.mjs --controle      contrôle positif, n'écrit rien
 *
 * CE QUI SERT DE RÉFÉRENCE, ET POURQUOI CELLE-LÀ.
 *
 * `maquette/site-final.html` est un dump STATIQUE : son runtime (`support.js`)
 * est absent du dépôt, donc aucun `sc-if` n'est évalué, aucun `{{ }}` résolu,
 * aucun `sc-for` répété, et 34 images manquent. Mesurer ce fichier, c'est
 * mesurer une page qui n'existe pas.
 *
 * `~/Landing lovable/maquette/accueil-autonome.html` est la MÊME maquette,
 * livrée par le client sous forme de page autonome de 24 Mo : runtime compris,
 * images en base64 comprises. Elle s'exécute. On y atteint l'écran d'offre de
 * Résidence en cliquant « Voir Résidence », qui appelle `nav("sursite")`
 * (maquette, l. 7873 : `offer: "Résidence", page: "sursite", cta: "Voir
 * Résidence"`, consommé l. 9125 par `go: this.nav(n.page)`).
 *
 * Que ce soit le même gabarit est VÉRIFIÉ par `controleGabarit()` : le bloc
 * `<main data-screen-label="Offre — …">` des deux fichiers ne diffère que par
 * `onClick` ↔ `sc-camel-on-click` et par les `src` d'images réécrits en UUID
 * par l'empaqueteur. Aucun attribut `style`, aucune classe, aucune structure.
 * Si cela cesse d'être vrai, ce script s'arrête : il ne mesure pas une
 * référence dont il ne peut plus prouver l'identité.
 *
 * LE CONTRÔLE POSITIF. `--controle` mesure la maquette CONTRE ELLE-MÊME après
 * avoir injecté trois défauts connus (une section retirée, une gouttière
 * changée, un rayon changé). Si la mesure ne les voit pas, elle est inutile et
 * le script sort en erreur.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import pw from "playwright";

const { chromium } = pw;
const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

/** La maquette qui s'exécute, hors du dépôt, fournie par le client le 02/10. */
const MAQUETTE_AUTONOME = join(RACINE, "..", "maquette", "accueil-autonome.html");
/** La maquette versionnée, qui sert à prouver que la précédente est la même. */
const MAQUETTE_VERSIONNEE = join(RACINE, "maquette", "site-final.html");

const URL_SITE = "http://localhost:4340/offres/residence/";
const PORT_MAQUETTE = 4798;
const LARGEUR = 1280;
const HAUTEUR = 900;

/** Le lien de l'accueil qui appelle `nav("sursite")`. */
const LIEN_VERS_RESIDENCE = "Voir Résidence";

const SORTIE = join(RACINE, "docs", "releve-ecart-offre-residence.json");

/* ------------------------------------------------------- le serveur de maquette */

/** Sert un seul fichier, sans dépendance. Rend une fonction d'arrêt. */
function sertMaquette(chemin, port) {
  const serveur = createServer(async (req, res) => {
    if (!req.url.startsWith("/maquette")) {
      res.writeHead(404).end();
      return;
    }
    const { size } = await stat(chemin);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": size });
    createReadStream(chemin).pipe(res);
  });
  return new Promise((resoudre) => {
    serveur.listen(port, "127.0.0.1", () =>
      resoudre({
        url: `http://127.0.0.1:${port}/maquette`,
        arrete: () => new Promise((f) => serveur.close(f)),
      }),
    );
  });
}

/* ------------------------------------- la preuve que les deux maquettes sont une */

/**
 * Le bloc `<main>` de l'écran d'offre d'un document.
 *
 * La page autonome porte son HTML dans une chaîne JSON : les guillemets y sont
 * échappés, les sauts de ligne écrits `\n` et les barres obliques `/`. On
 * les rend avant de chercher, sinon le marqueur n'est jamais trouvé.
 */
function blocOffre(brut) {
  const texte = brut
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n");
  const debut = texte.indexOf('<main data-screen-label="Offre');
  const fin = texte.indexOf('<main data-screen-label="Nous connaître"', debut + 1);
  if (debut === -1 || fin <= debut) {
    throw new Error("l'écran d'offre est introuvable : la maquette a changé de forme");
  }
  return texte.slice(debut, fin);
}

/**
 * Normalise les seules différences que l'empaquetage de la page autonome
 * introduit, et aucune autre :
 *   · `sc-camel-on-click` au lieu de `onClick` (dialecte de la maquette) ;
 *   · `sc-raw-select` au lieu de `select` (idem) ;
 *   · les `src` d'images réécrits en UUID par l'empaqueteur.
 * TOUT le reste doit être identique, attributs `style` compris.
 */
function normalise(bloc) {
  return bloc
    .replace(/sc-camel-on-click=/g, "onClick=")
    .replace(/sc-raw-select/g, "select")
    .replace(/src="[^"]*"/g, 'src="IMG"');
}

function controleGabarit() {
  const autonome = normalise(blocOffre(readFileSync(MAQUETTE_AUTONOME, "utf8")));
  const versionnee = normalise(blocOffre(readFileSync(MAQUETTE_VERSIONNEE, "utf8")));
  if (autonome === versionnee) return { identique: true, ecartCaracteres: 0 };

  // On dit OÙ, pour que l'écart se lise au lieu de se deviner.
  const a = autonome.split("\n");
  const v = versionnee.split("\n");
  const divergentes = [];
  for (let i = 0; i < Math.max(a.length, v.length); i += 1) {
    if (a[i] !== v[i]) divergentes.push(i + 1);
  }
  throw new Error(
    `le gabarit de la page autonome ne correspond plus à site-final.html : ` +
      `${divergentes.length} ligne(s) divergente(s), d'abord ${divergentes.slice(0, 5).join(", ")}. ` +
      `La mesure est suspendue : sa référence n'est plus prouvée.`,
  );
}

/* ------------------------------- les noms d'images, lus dans la source versionnée */

/**
 * L'empaqueteur de la page autonome réécrit chaque `src` en UUID : le nom de
 * fichier n'y est plus lisible. Les noms sont donc lus dans
 * `maquette/site-final.html`, dont `controleGabarit()` vient de prouver que
 * c'est le même gabarit, section par section.
 *
 * Les quatre sections enveloppées dans `<sc-if value="{{ of.isZero }}">` sont
 * RETIRÉES : pour Résidence, `isZero` vaut faux (maquette l. 9385,
 * `isZero: page === "zero"`), donc la maquette ne les affiche pas. Les garder
 * décalerait l'appariement de toutes les sections suivantes.
 */
function nomsImagesParSectionDeLaMaquette() {
  const bloc = blocOffre(readFileSync(MAQUETTE_VERSIONNEE, "utf8"));

  const debutZero = bloc.indexOf('<sc-if value="{{ of.isZero }}"');
  if (debutZero === -1) {
    throw new Error(
      "le bloc conditionnel `of.isZero` est introuvable : les sections propres à " +
        "Zéro arrêt ne peuvent plus être écartées, l'appariement serait faux",
    );
  }
  // On équilibre les `sc-if` imbriqués pour trouver la bonne fermeture.
  let profondeur = 0;
  let finZero = -1;
  const balises = [...bloc.slice(debutZero).matchAll(/<sc-if\b|<\/sc-if>/g)];
  for (const b of balises) {
    profondeur += b[0] === "</sc-if>" ? -1 : 1;
    if (profondeur === 0) {
      finZero = debutZero + b.index + b[0].length;
      break;
    }
  }
  if (finZero === -1) throw new Error("le bloc `of.isZero` n'est jamais refermé");
  const sansZero = bloc.slice(0, debutZero) + bloc.slice(finZero);

  // Les `<section>` de premier niveau, délimiteurs équilibrés.
  const sections = [];
  const jalons = [...sansZero.matchAll(/<section\b|<\/section>/g)];
  let depart = -1;
  profondeur = 0;
  for (const j of jalons) {
    if (j[0] === "</section>") {
      profondeur -= 1;
      if (profondeur === 0 && depart >= 0) {
        sections.push(sansZero.slice(depart, j.index + j[0].length));
        depart = -1;
      }
      continue;
    }
    if (profondeur === 0) depart = j.index;
    profondeur += 1;
  }

  return sections.map((s) =>
    [...s.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1].split("/").pop()),
  );
}

/* --------------------------------------------------------------- la mesure, DOM */

/**
 * Le relevé d'une page, exécuté DANS le navigateur.
 *
 * Il ne juge rien : il lit des valeurs calculées et les rend. Une seule
 * décision de lecture est prise ici, et elle est explicite : une « section »
 * est un `<section>` de premier niveau dans le `<main>`.
 */
const RELEVE_DOM = () => {
  const arrondi = (n) => Math.round(n * 10) / 10;
  const px = (v) => (v && v !== "0px" ? v : v);

  /** Les surtitres de la maquette : petits, capitales, lettrage ouvert. */
  function surtitre(section) {
    for (const e of section.querySelectorAll("div,span,p")) {
      const cs = getComputedStyle(e);
      if (cs.textTransform !== "uppercase") continue;
      const t = (e.textContent || "").trim();
      if (t.length < 3 || t.length > 60) continue;
      return {
        texte: t,
        police: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(",")[0].replace(/["']/g, "")}`,
        lettrage: cs.letterSpacing,
        couleur: cs.color,
      };
    }
    return null;
  }

  /** Le titre de rang le plus élevé de la section, avec sa fonte complète. */
  function titre(section) {
    const t = section.querySelector("h1,h2,h3");
    if (!t) return null;
    const cs = getComputedStyle(t);
    return {
      balise: t.tagName.toLowerCase(),
      texte: (t.textContent || "").trim(),
      famille: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
      graisse: cs.fontWeight,
      taille: cs.fontSize,
      interligne: cs.lineHeight,
      lettrage: cs.letterSpacing,
      couleur: cs.color,
    };
  }

  /** Toutes les grilles de la section, dans l'ordre du document. */
  function grilles(section) {
    const out = [];
    for (const e of section.querySelectorAll("*")) {
      const cs = getComputedStyle(e);
      if (cs.display !== "grid" && cs.display !== "inline-grid") continue;
      const enfants = [...e.children].filter((c) => getComputedStyle(c).display !== "none");
      out.push({
        colonnes: cs.gridTemplateColumns,
        nbColonnes: cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
        gouttiereColonne: cs.columnGap,
        gouttiereLigne: cs.rowGap,
        nbEnfants: enfants.length,
        largeur: arrondi(e.getBoundingClientRect().width),
      });
      if (out.length >= 8) break;
    }
    return out;
  }

  /**
   * Les cartes de la section, avec leur verre, leur ombre et leur rayon.
   *
   * LE CRITÈRE NE DÉPEND PAS DU RAYON. Une carte est un bloc d'au moins
   * 80 x 40 px qui porte au moins une décoration : un fond, une bordure, une
   * ombre ou un rayon. Si le critère était « rayon ≥ 8 px », une carte dont le
   * rayon tombe à 3 px SORTIRAIT de la liste au lieu d'être signalée, et
   * décalerait toutes les suivantes : le contrôle positif a trouvé ce défaut.
   *
   * Chaque carte porte une ANCRE, le début de son texte. L'appariement se fait
   * sur l'ancre, pas sur le rang : une carte insérée ne décale plus le relevé.
   */
  function cartes(section) {
    const out = [];
    // `details` est dans la liste : le site rend son accordéon de FAQ en
    // `<details>`, et une liste limitée à `div,a,…` ne voyait AUCUNE de ses
    // cinq cartes. Elle rapportait « carte introuvable » cinq fois, sur une
    // section qui les porte toutes.
    for (const e of section.querySelectorAll("div,a,article,li,label,details,button,form,aside,header,figure")) {
      const cs = getComputedStyle(e);
      const rayon = parseFloat(cs.borderTopLeftRadius) || 0;
      const aFond = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
      const aBordure = (parseFloat(cs.borderTopWidth) || 0) > 0 && cs.borderTopStyle !== "none";
      const aOmbre = cs.boxShadow !== "none";
      if (!aFond && !aBordure && !aOmbre && rayon < 4) continue;
      const rect = e.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 40) continue;
      out.push({
        ancre: (e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 28) || `bloc:${arrondi(rect.width)}x${arrondi(rect.height)}`,
        rayon: cs.borderRadius,
        fond: cs.backgroundColor,
        image: cs.backgroundImage === "none" ? null : cs.backgroundImage.slice(0, 70),
        // Une bordure de 0 px n'existe pas : `0px none` et `0px solid` se
        // rendent à l'identique. Les distinguer produirait un faux écart sur
        // chaque bouton, et noierait les vrais.
        bordure: aBordure ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : "aucune",
        ombre: cs.boxShadow === "none" ? null : cs.boxShadow,
        verre: cs.backdropFilter === "none" ? null : cs.backdropFilter,
        marges: cs.padding,
        taille: `${arrondi(rect.width)}x${arrondi(rect.height)}`,
      });
      if (out.length >= 14) break;
    }
    return out;
  }

  /**
   * Le nom de fichier d'une URL d'image.
   *
   * Next.js sert ses images par `/_next/image?url=%2Fassets%2Fweb%2Fx.jpg&w=…` :
   * le nom est dans le paramètre `url`, pas dans le chemin. Sans ce décodage, le
   * relevé dirait « image sans nom » là où le site sert bien un fichier.
   */
  function nomFichier(u) {
    if (!u) return "";
    try {
      const abs = new URL(u, location.href);
      const interne = abs.searchParams.get("url");
      const chemin = interne ? decodeURIComponent(interne) : abs.pathname;
      return chemin.split("/").pop().split("?")[0];
    } catch {
      return u.split("/").pop().split("?")[0];
    }
  }

  /** Les images : combien, lesquelles, chargées ou non. */
  function images(section) {
    const out = [];
    for (const i of section.querySelectorAll("img")) {
      const rect = i.getBoundingClientRect();
      out.push({
        source: i.currentSrc || i.src,
        nom: nomFichier(i.currentSrc || i.getAttribute("src")),
        chargee: i.naturalWidth > 0,
        naturelle: `${i.naturalWidth}x${i.naturalHeight}`,
        rendue: `${arrondi(rect.width)}x${arrondi(rect.height)}`,
        ajustement: getComputedStyle(i).objectFit,
      });
    }
    // Les photos posées en `background-image` comptent aussi : la maquette en use.
    for (const e of section.querySelectorAll("*")) {
      const bi = getComputedStyle(e).backgroundImage;
      if (!bi || bi === "none" || !/url\(/.test(bi)) continue;
      const u = bi.match(/url\(["']?([^"')]+)/);
      if (!u) continue;
      out.push({
        source: u[1],
        nom: nomFichier(u[1]),
        chargee: null,
        naturelle: "fond",
        rendue: `${arrondi(e.getBoundingClientRect().width)}x${arrondi(e.getBoundingClientRect().height)}`,
        ajustement: getComputedStyle(e).backgroundSize,
      });
    }
    return out;
  }

  const principal = document.querySelector("main");
  if (!principal) return { erreur: "aucun <main> dans la page" };

  const sections = [...principal.children]
    .flatMap((n) => (n.tagName === "SECTION" ? [n] : [...n.querySelectorAll(":scope > section")]))
    .filter((s) => getComputedStyle(s).display !== "none");

  return {
    etiquette: principal.getAttribute("data-screen-label"),
    hauteurMain: arrondi(principal.getBoundingClientRect().height),
    hauteurDocument: document.documentElement.scrollHeight,
    liaisonsNonResolues: (document.body.innerText.match(/\{\{[^}]*\}\}/g) || []).length,
    sections: sections.map((s, i) => {
      const cs = getComputedStyle(s);
      const rect = s.getBoundingClientRect();
      // Le conteneur de largeur : le premier descendant à max-width posé.
      const conteneur = [...s.querySelectorAll("div")].find(
        (d) => getComputedStyle(d).maxWidth !== "none",
      );
      const csc = conteneur ? getComputedStyle(conteneur) : null;
      return {
        rang: i,
        id: s.id || null,
        hauteur: arrondi(rect.height),
        largeur: arrondi(rect.width),
        margesSection: cs.padding,
        fondSection: cs.backgroundColor,
        conteneur: csc
          ? { largeurMax: csc.maxWidth, marges: csc.padding, largeurRendue: arrondi(conteneur.getBoundingClientRect().width) }
          : null,
        surtitre: surtitre(s),
        titre: titre(s),
        grilles: grilles(s),
        cartes: cartes(s),
        images: images(s),
        nbImages: s.querySelectorAll("img").length,
        nbFonds: images(s).filter((i) => i.naturelle === "fond").length,
        texteDebut: (s.innerText || "").trim().replace(/\s+/g, " ").slice(0, 90),
      };
    }),
  };
};

/* ------------------------------------------------------- l'ouverture des deux pages */

/**
 * Parcourt la page de haut en bas, puis revient en haut, et attend que chaque
 * `<img>` soit décodée.
 *
 * SANS CELA, LA MESURE MENT. Le site charge ses photos en `loading="lazy"` :
 * mesurées à l'arrêt en haut de page, les images de « Nos dernières
 * réalisations » rendent `naturalWidth = 0`, et le relevé les déclarait
 * « non chargées », gravité bloquante, sur des fichiers parfaitement servis.
 */
async function derouleEtCharge(page) {
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hauteur; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page
    .evaluate(() =>
      Promise.all(
        [...document.images].map((i) =>
          i.complete ? null : new Promise((f) => { i.addEventListener("load", f); i.addEventListener("error", f); }),
        ),
      ),
    )
    .catch(() => {});
  await page.waitForTimeout(500);
}

async function relevéMaquette(navigateur, urlMaquette, saboteur) {
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  await page.goto(urlMaquette, { waitUntil: "load", timeout: 180000 });
  await page.waitForTimeout(6000);

  const atteint = await page.evaluate((libelle) => {
    const a = [...document.querySelectorAll("a")].find(
      (e) => (e.textContent || "").trim() === libelle,
    );
    if (!a) return false;
    a.click();
    return true;
  }, LIEN_VERS_RESIDENCE);
  if (!atteint) {
    throw new Error(
      `le lien « ${LIEN_VERS_RESIDENCE} » n'existe plus sur l'accueil de la maquette : ` +
        `l'écran d'offre n'est plus atteignable, la mesure est suspendue`,
    );
  }
  await page.waitForTimeout(3500);
  await derouleEtCharge(page);

  const etiquette = await page.evaluate(() => document.querySelector("main")?.getAttribute("data-screen-label"));
  if (etiquette !== "Offre — Résidence") {
    throw new Error(
      `l'écran atteint est « ${etiquette} » et non « Offre — Résidence » : la mesure est suspendue`,
    );
  }

  if (saboteur) await page.evaluate(saboteur);

  const releve = await page.evaluate(RELEVE_DOM);
  await page.close();
  return releve;
}

async function relevéSite(navigateur) {
  const page = await navigateur.newPage({ viewport: { width: LARGEUR, height: HAUTEUR } });
  const reponse = await page.goto(URL_SITE, { waitUntil: "load", timeout: 120000 });
  if (!reponse || reponse.status() !== 200) {
    throw new Error(
      `${URL_SITE} rend ${reponse ? reponse.status() : "rien"} : le serveur de développement ne tourne pas sur 4340`,
    );
  }
  await page.waitForTimeout(4000);
  await derouleEtCharge(page);
  const releve = await page.evaluate(RELEVE_DOM);
  await page.close();
  return releve;
}

/* ----------------------------------------------------------------- l'appariement */

/** Deux sections sont la même si leur surtitre, sinon leur titre, coïncide. */
function cle(section) {
  const s = section.surtitre?.texte?.replace(/\s+/g, " ").trim();
  if (s) return `surtitre:${s}`;
  const t = section.titre?.texte?.replace(/\s+/g, " ").trim().slice(0, 60);
  if (t) return `titre:${t}`;
  return `rang:${section.rang}`;
}

/** Apparie les sections de la maquette avec celles du site, dans l'ordre maquette. */
function apparie(maquette, site) {
  const restantes = site.sections.map((s) => ({ s, pris: false }));
  const paires = maquette.sections.map((m) => {
    const k = cle(m);
    const trouve = restantes.find((r) => !r.pris && cle(r.s) === k);
    if (trouve) trouve.pris = true;
    return { maquette: m, site: trouve ? trouve.s : null, cle: k };
  });
  const enPlus = restantes.filter((r) => !r.pris).map((r) => r.s);
  return { paires, enPlus };
}

/* ------------------------------------------------------------- le contrôle positif */

/**
 * Trois défauts injectés dans la maquette rendue. Une mesure qui ne les voit
 * pas ne vaut rien.
 */
const SABOTEUR = () => {
  const principal = document.querySelector("main");
  const sections = [...principal.querySelectorAll("section")];
  // 1. une section retirée
  sections[6].style.display = "none";
  // 2. une gouttière changée
  for (const e of sections[1].querySelectorAll("*")) {
    if (getComputedStyle(e).display === "grid") {
      e.style.columnGap = "99px";
      break;
    }
  }
  // 3. un rayon changé
  for (const e of sections[3].querySelectorAll("div")) {
    if ((parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0) >= 8) {
      e.style.borderRadius = "3px";
      break;
    }
  }
};

/* ---------------------------------------------------------------------- l'exécution */

async function mesure({ controlePositif = false } = {}) {
  controleGabarit();

  const serveur = await sertMaquette(MAQUETTE_AUTONOME, PORT_MAQUETTE);
  const navigateur = await chromium.launch({ channel: "chrome" });
  try {
    const maquette = await relevéMaquette(navigateur, serveur.url, null);

    // Les noms de fichiers, lus dans la source versionnée et non dans le rendu.
    const noms = nomsImagesParSectionDeLaMaquette();
    if (noms.length !== maquette.sections.length) {
      throw new Error(
        `site-final.html porte ${noms.length} section(s) d'offre hors du bloc Zéro arrêt ` +
          `et la maquette rendue en affiche ${maquette.sections.length} : l'appariement des ` +
          `images serait faux, la mesure est suspendue`,
      );
    }
    maquette.sections.forEach((s, i) => {
      s.nomsSource = noms[i];
    });

    if (maquette.liaisonsNonResolues > 0) {
      throw new Error(
        `${maquette.liaisonsNonResolues} liaison(s) {{ }} non résolue(s) dans la maquette rendue : ` +
          `le runtime n'a pas tourné, les hauteurs mesurées seraient fausses`,
      );
    }
    if (controlePositif) {
      const sabotee = await relevéMaquette(navigateur, serveur.url, SABOTEUR);
      // La maquette sabotée porte les mêmes `src` en UUID : on leur rend le nom
      // de la source, sinon le contrôle crie sur un écart qu'il a lui-même créé.
      // La section masquée décale d'une : on apparie par ancre de surtitre.
      sabotee.sections.forEach((s) => {
        const i = maquette.sections.findIndex((m) => cle(m) === cle(s));
        if (i >= 0) {
          s.images.forEach((img, k) => {
            if (noms[i][k]) img.nom = noms[i][k];
          });
        }
      });
      return { maquette, comparee: sabotee, controlePositif: true };
    }
    const site = await relevéSite(navigateur);
    return { maquette, comparee: site, controlePositif: false };
  } finally {
    await navigateur.close();
    await serveur.arrete();
  }
}

/** Les écarts que la comparaison voit, propriété par propriété. */
function ecarts(paire) {
  const { maquette: m, site: s } = paire;
  if (!s) return [{ quoi: "section", maquette: "présente", site: "absente", gravite: "bloquante" }];
  const liste = [];
  const ajoute = (quoi, a, b, gravite) => {
    if (String(a) !== String(b)) liste.push({ quoi, maquette: String(a), site: String(b), gravite });
  };

  const dh = Math.abs(m.hauteur - s.hauteur);
  if (dh > 2) {
    liste.push({
      quoi: "hauteur",
      maquette: `${m.hauteur} px`,
      site: `${s.hauteur} px`,
      gravite: dh > 80 ? "forte" : dh > 20 ? "moyenne" : "faible",
    });
  }
  ajoute("marges de section", m.margesSection, s.margesSection, "moyenne");
  ajoute("fond de section", m.fondSection, s.fondSection, "moyenne");
  if (m.conteneur && s.conteneur) {
    ajoute("largeur max du conteneur", m.conteneur.largeurMax, s.conteneur.largeurMax, "forte");
    ajoute("marges internes du conteneur", m.conteneur.marges, s.conteneur.marges, "moyenne");
  }
  if (m.titre && s.titre) {
    ajoute("police du titre", m.titre.famille, s.titre.famille, "forte");
    ajoute("graisse du titre", m.titre.graisse, s.titre.graisse, "forte");
    ajoute("taille du titre", m.titre.taille, s.titre.taille, "forte");
    ajoute("interligne du titre", m.titre.interligne, s.titre.interligne, "moyenne");
    ajoute("lettrage du titre", m.titre.lettrage, s.titre.lettrage, "faible");
    ajoute("couleur du titre", m.titre.couleur, s.titre.couleur, "moyenne");
    ajoute("balise du titre", m.titre.balise, s.titre.balise, "moyenne");
  } else if (!!m.titre !== !!s.titre) {
    ajoute("titre", m.titre ? "présent" : "absent", s.titre ? "présent" : "absent", "forte");
  }
  if (m.surtitre && s.surtitre) {
    ajoute("surtitre", m.surtitre.texte, s.surtitre.texte, "forte");
    ajoute("police du surtitre", m.surtitre.police, s.surtitre.police, "moyenne");
    ajoute("lettrage du surtitre", m.surtitre.lettrage, s.surtitre.lettrage, "faible");
  }
  const n = Math.max(m.grilles.length, s.grilles.length);
  for (let i = 0; i < n; i += 1) {
    const gm = m.grilles[i];
    const gs = s.grilles[i];
    if (!gm || !gs) {
      liste.push({
        quoi: `grille ${i + 1}`,
        maquette: gm ? `${gm.nbColonnes} col., gouttière ${gm.gouttiereColonne}` : "absente",
        site: gs ? `${gs.nbColonnes} col., gouttière ${gs.gouttiereColonne}` : "absente",
        gravite: "forte",
      });
      continue;
    }
    ajoute(`grille ${i + 1} : colonnes`, gm.colonnes, gs.colonnes, "forte");
    ajoute(`grille ${i + 1} : gouttière colonne`, gm.gouttiereColonne, gs.gouttiereColonne, "forte");
    ajoute(`grille ${i + 1} : gouttière ligne`, gm.gouttiereLigne, gs.gouttiereLigne, "moyenne");
    ajoute(`grille ${i + 1} : nombre d'enfants`, gm.nbEnfants, gs.nbEnfants, "forte");
  }
  // Les cartes sont appariées par leur ancre de texte, pas par leur rang : une
  // carte insérée ou retirée ne doit pas faire mentir toutes les suivantes.
  const libres = s.cartes.map((c) => ({ c, pris: false }));
  for (const cm of m.cartes) {
    const trouve = libres.find((x) => !x.pris && x.c.ancre === cm.ancre);
    if (!trouve) {
      liste.push({
        quoi: `carte « ${cm.ancre} »`,
        maquette: `${cm.rayon}, fond ${cm.fond}`,
        site: "introuvable (ancre de texte absente)",
        gravite: "forte",
      });
      continue;
    }
    trouve.pris = true;
    const cs2 = trouve.c;
    const nom = `carte « ${cm.ancre} »`;
    ajoute(`${nom} : rayon`, cm.rayon, cs2.rayon, "forte");
    ajoute(`${nom} : fond`, cm.fond, cs2.fond, "moyenne");
    ajoute(`${nom} : bordure`, cm.bordure, cs2.bordure, "moyenne");
    ajoute(`${nom} : ombre`, cm.ombre, cs2.ombre, "faible");
    ajoute(`${nom} : verre`, cm.verre, cs2.verre, "faible");
    ajoute(`${nom} : marges internes`, cm.marges, cs2.marges, "moyenne");
    ajoute(`${nom} : taille rendue`, cm.taille, cs2.taille, "moyenne");
  }
  for (const x of libres.filter((y) => !y.pris)) {
    liste.push({
      quoi: `carte « ${x.c.ancre} »`,
      maquette: "absente de la maquette",
      site: `${x.c.rayon}, fond ${x.c.fond}`,
      gravite: "moyenne",
    });
  }
  ajoute("nombre de balises <img>", m.nbImages, s.nbImages, "forte");
  ajoute("nombre de photos posées en fond", m.nbFonds, s.nbFonds, "forte");
  // `m.nomsSource` vient de site-final.html : la page autonome réécrit ses `src`
  // en UUID, donc la comparaison de noms ne peut pas se faire sur le rendu.
  if (m.nomsSource) {
    const nomsS = s.images.filter((i) => i.naturelle !== "fond").map((i) => i.nom).join(", ");
    ajoute("sources des images", m.nomsSource.join(", ") || "aucune", nomsS || "aucune", "forte");
  }
  for (const i of s.images) {
    if (i.chargee === false) {
      liste.push({ quoi: "image non chargée", maquette: "chargée", site: `${i.nom} : 0x0`, gravite: "bloquante" });
    }
  }
  return liste;
}

/* --------------------------------------------------------------------- la sortie */

const resultat = await mesure({ controlePositif: process.argv.includes("--controle") });
const { maquette, comparee, controlePositif } = resultat;
const { paires, enPlus } = apparie(maquette, comparee);

console.log(
  `maquette : ${maquette.sections.length} sections, main ${maquette.hauteurMain} px, ` +
    `document ${maquette.hauteurDocument} px, ${maquette.liaisonsNonResolues} liaison(s) non résolue(s)`,
);
console.log(
  `${controlePositif ? "maquette sabotée" : "site"} : ${comparee.sections.length} sections, ` +
    `main ${comparee.hauteurMain} px, document ${comparee.hauteurDocument} px`,
);
console.log("");

let totalEcarts = 0;
const releve = paires.map((p, rang) => {
  const e = ecarts(p);
  totalEcarts += e.length;
  const etat = !p.site ? "absente-du-site" : e.length ? "presente-mais-differente" : "presente";
  console.log(
    `${String(rang).padStart(2)} ${(p.maquette.surtitre?.texte || p.maquette.titre?.texte || "(sans titre)").slice(0, 36).padEnd(38)} ` +
      `${String(p.maquette.hauteur).padStart(5)} / ${String(p.site?.hauteur ?? "—").padStart(5)} px   ` +
      `${etat}  ${e.length} écart(s)`,
  );
  for (const x of e.slice(0, 6)) {
    console.log(`      · ${x.quoi} : « ${x.maquette} » contre « ${x.site} » (${x.gravite})`);
  }
  return { rang, cle: p.cle, etat, ecarts: e, maquette: p.maquette, site: p.site };
});

console.log("");
if (enPlus.length) {
  console.log(`${enPlus.length} section(s) présente(s) côté comparé et absente(s) de la maquette :`);
  for (const s of enPlus) {
    console.log(
      `   · « ${(s.surtitre?.texte || s.titre?.texte || s.texteDebut || "(sans titre)").slice(0, 60)} » ${s.hauteur} px`,
    );
  }
}
console.log(`\n${totalEcarts} écart(s) relevé(s) au total.`);

if (controlePositif) {
  const vuSectionRetiree = releve.some((r) => r.etat === "absente-du-site");
  const vuGouttiere = releve.some((r) => r.ecarts.some((e) => /gouttière/.test(e.quoi) && /99px/.test(e.site)));
  const vuRayon = releve.some((r) => r.ecarts.some((e) => /rayon/.test(e.quoi) && /3px/.test(e.site)));
  const manques = [
    !vuSectionRetiree && "la section retirée",
    !vuGouttiere && "la gouttière portée à 99 px",
    !vuRayon && "le rayon ramené à 3 px",
  ].filter(Boolean);
  if (manques.length) {
    console.error(`\nCONTRÔLE POSITIF ÉCHOUÉ : la mesure ne voit pas ${manques.join(", ")}.`);
    process.exit(1);
  }
  console.log("\nCONTRÔLE POSITIF PASSÉ : les trois défauts injectés sont vus. Rien n'est écrit.");
  process.exit(0);
}

mkdirSync(dirname(SORTIE), { recursive: true });
writeFileSync(
  SORTIE,
  `${JSON.stringify(
    {
      mesureLe: new Date().toISOString(),
      fenetre: `${LARGEUR}x${HAUTEUR}`,
      referenceMaquette: MAQUETTE_AUTONOME,
      gabaritProuveIdentiqueA: MAQUETTE_VERSIONNEE,
      urlSite: URL_SITE,
      maquette: { sections: maquette.sections.length, hauteurMain: maquette.hauteurMain },
      site: { sections: comparee.sections.length, hauteurMain: comparee.hauteurMain },
      releve,
      sectionsEnPlusSurLeSite: enPlus,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(`\nécrit : ${SORTIE}`);
