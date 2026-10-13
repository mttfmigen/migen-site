/**
 * LA PORTE DE LA COQUILLE DE « Ressources v2 » : le cadre et le menu latéral.
 *
 *   node components/site/ressources-hub/verification-coquille.mjs
 *   node components/site/ressources-hub/verification-coquille.mjs --controle
 *   SITE_URL=https://migen-site.vercel.app node components/site/ressources-hub/verification-coquille.mjs
 *
 * Sans `SITE_URL`, elle mesure `http://localhost:4391`.
 *
 * ====================================================================
 * POURQUOI ELLE EXISTE
 * ====================================================================
 *
 * `verification-hub.tsx`, sa voisine, mesure la DONNÉE de la bibliothèque :
 * les 35 ressources, les étiquettes, les thèmes, les minutes, le sommaire
 * complet. Elle ne regarde pas un pixel, et elle ne peut pas : elle rend le
 * composant en chaîne, sans navigateur, donc sans feuille de style ni point
 * d'arrêt. Un défaut de MISE EN PAGE lui est invisible.
 *
 * Et il y en avait un. `Bibliotheque.module.css` habillait le menu de la
 * bibliothèque (`.rs-app` / `.rs-side2` dans la maquette) avec les règles de
 * l'AUTRE menu latéral du colis (`.rs-lay` / `.rs-side`), qui bascule 240 px
 * plus tôt et en rail horizontal. Résultat mesuré le 13/10 sur le hub servi :
 * de 761 à 1000 px, une seule colonne, les 37 boutons de filtres dépliés
 * au-dessus de la bibliothèque, et aucun bouton pour les replier, là où la
 * maquette garde deux colonnes. Rien ne le signalait, parce que rien ne
 * mesurait l'échelle de points d'arrêt de cette section.
 *
 * ====================================================================
 * LES SIX RÈGLES, ET D'OÙ ELLES VIENNENT
 * ====================================================================
 *
 * L'ATTENDU N'EST PAS ÉCRIT ICI : il est LU dans le colis, à chaque passage
 * (`maquette/colis-13-10/Migen - Ressources.html`, règles `.rs-app` et
 * `.rs-side2`). Si le colis change de point d'arrêt, la porte change avec lui
 * et dit laquelle de ses règles ne tient plus.
 *
 * 1. DEUX COLONNES au-dessus du point d'arrêt du colis, UNE en dessous.
 * 2. LE MENU EST COLLANT au-dessus, au fil du texte en dessous.
 * 3. LE BOUTON « Filtres » n'existe QU'EN DESSOUS, et c'est là, et seulement
 *    là, que le corps des filtres se replie.
 * 4. AUCUN ÉLÉMENT DU HUB plus large que son hôte. On mesure l'élément contre
 *    son hôte, jamais le document : `.mg-site` est en `overflow-x: clip`, donc
 *    ce qui dépasse est coupé en silence, sans barre de défilement.
 * 5. AUCUN BOUTON DU MENU dont le texte est coupé (`scrollWidth` au-delà de
 *    `clientWidth`). C'est cette règle qui retient le rail à 240 px du colis :
 *    nos segments de durée portent un compte que la maquette n'affiche pas.
 * 6. LE `<main>` NE PERD PAS UN CARACTÈRE d'une largeur à l'autre. Replier
 *    n'est pas retirer, et Google indexe le mobile en premier.
 *
 * ====================================================================
 * CE QU'ELLE NE MESURE PAS
 * ====================================================================
 *
 * La gouttière de 14 px que `.rs-app` prend à 640 px. Chez la maquette,
 * `.rs-app` EST la page ; ici la bibliothèque est une section d'une page
 * éditoriale et sa gouttière suit celle du reste de la page, tenue par
 * `app/globals.css`. L'écart est déclaré dans l'en-tête de la feuille, il n'est
 * pas armé ici : une porte qui exige le contraire de ce que le site a décidé
 * n'est pas une porte, c'est un piège.
 */

import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const SITE = (process.env.SITE_URL ?? "http://localhost:4391").replace(/\/+$/, "");
const MODE_CONTROLE = process.argv.slice(2).includes("--controle");
const COLIS = new URL("../../../maquette/colis-13-10/Migen - Ressources.html", import.meta.url);

/* ------------------------------------------------------- l'attendu, lu */

/**
 * Les points d'arrêt de `.rs-app` dans le colis.
 *
 * On ne lit QUE les blocs `@media (max-width:N){...}` qui parlent de `.rs-app`
 * ou de `.rs-side2`, et on garde celui qui passe la grille à une colonne : la
 * maquette l'écrit `grid-template-columns:minmax(0,1fr)`.
 */
function pointsDArretDuColis() {
  const source = readFileSync(COLIS, "utf8");
  /* Un bloc `@media` et son contenu : des règles, chacune avec sa paire
     d'accolades. Le colis est un fichier d'un seul tenant où les retours à la
     ligne sont échappés (`\n` en deux caractères) : découper sur un vrai
     retour à la ligne ne trouvait rien. On compte donc les accolades. */
  const blocs = [
    ...source.matchAll(/@media \(max-width:(\d+)px\)\{((?:[^{}]|\{[^{}]*\})*)\}/g),
  ]
    .map((m) => ({ largeur: Number(m[1]), regles: m[2] }))
    .filter((b) => /\.rs-app|\.rs-side2/.test(b.regles));

  if (blocs.length === 0) {
    throw new Error(
      "aucune règle `.rs-app` ou `.rs-side2` dans le colis : la porte ne peut pas lire son attendu",
    );
  }

  const uneColonne = blocs.find(
    (b) => /\.rs-app\{grid-template-columns:minmax\(0,1fr\)/.test(b.regles),
  );
  if (!uneColonne) {
    throw new Error(
      "le colis ne dit plus à quelle largeur `.rs-app` passe à une colonne : attendu illisible",
    );
  }

  const pliant = /\.rs-ftoggle\{display:flex/.test(uneColonne.regles);
  const auFilDuTexte = /\.rs-side2\{position:relative/.test(uneColonne.regles);

  return { bascule: uneColonne.largeur, pliant, auFilDuTexte };
}

/* --------------------------------------------------------- la mesure */

/** Les largeurs mesurées, de part et d'autre de la bascule du colis. */
function largeurs(bascule) {
  return [320, 390, bascule, bascule + 8, 900, 1000, 1280];
}

/** Le relevé d'une largeur, dans la page. */
const RELEVE = (defaut) => {
  const section = document.querySelector("#bibliotheque");
  if (!section) return { erreur: "section #bibliotheque absente de la page servie" };

  if (defaut === "une-colonne-partout") {
    section.firstElementChild.style.gridTemplateColumns = "minmax(0,1fr)";
  }
  if (defaut === "bouton-pliant-partout") {
    const b = [...section.querySelectorAll("button")].find((x) =>
      (x.textContent || "").trim().startsWith("Filtres"),
    );
    if (b) b.style.display = "flex";
  }
  if (defaut === "une-carte-trop-large") {
    const carte = section.querySelector("a[href^='/ressources/']");
    if (carte) carte.style.width = "3000px";
  }
  /* Le rail n'est rétréci QUE là où il y en a un : au-dessus de la bascule.
     Posé à 320 px aussi, il rendait deux colonnes sur un écran de téléphone et
     c'est la règle 1 qui parlait, pas la règle 5 qu'il est censé réveiller. */
  if (defaut === "un-rail-trop-etroit" && window.innerWidth > 760) {
    section.firstElementChild.style.gridTemplateColumns = "200px minmax(0,1fr)";
  }
  /* Du texte retiré SUR LE SEUL MOBILE, parce que c'est le risque réel : une
     règle d'affichage qui replie en retirant. Retiré à toutes les largeurs, le
     manque devient le nouveau plein et la règle 6, qui compare les largeurs
     entre elles, n'a plus rien à comparer. */
  if (defaut === "le-sommaire-retire" && window.innerWidth <= 390) {
    const sommaire = section.querySelector("[class*='sommaire']");
    if (sommaire) sommaire.remove();
  }

  const cadre = section.firstElementChild;
  const colonnes = getComputedStyle(cadre)
    .gridTemplateColumns.split(" ")
    .filter(Boolean).length;

  const aside = section.querySelector("aside");
  const position = aside ? getComputedStyle(aside).position : "";

  const pli = [...section.querySelectorAll("button")].find((b) =>
    (b.textContent || "").trim().startsWith("Filtres"),
  );
  const pliVisible = pli ? getComputedStyle(pli).display !== "none" : false;
  const corps = pli ? pli.nextElementSibling : null;
  /* Le corps est-il PLIABLE ? On ne regarde pas s'il est plié : son état est
     piloté par React et le rendu du serveur le laisse ouvert. On regarde si la
     feuille sait le replier, en posant la classe de repli et en lisant. */
  let corpsPliable = false;
  if (corps) {
    const classes = [...corps.classList];
    const repli = classes.find((c) => /corpsFiltresPlie/.test(c));
    if (repli) {
      corpsPliable = getComputedStyle(corps).display === "none";
    } else {
      const candidat = [...document.styleSheets]
        .flatMap((f) => {
          try {
            return [...f.cssRules];
          } catch {
            return [];
          }
        })
        .flatMap((r) => (r.cssRules ? [...r.cssRules] : [r]))
        .map((r) => r.selectorText)
        .filter(Boolean)
        .find((s) => /corpsFiltresPlie/.test(s));
      if (candidat) {
        const nom = candidat.replace(/^\./, "").split(/[\s,:]/)[0];
        corps.classList.add(nom);
        corpsPliable = getComputedStyle(corps).display === "none";
        corps.classList.remove(nom);
      }
    }
  }

  const debordements = [];
  for (const el of section.querySelectorAll("*")) {
    const hote = el.parentElement;
    if (!hote) continue;
    const sh = getComputedStyle(hote).overflowX;
    if (sh === "auto" || sh === "scroll" || sh === "clip" || sh === "hidden") continue;
    const trop = Math.round(el.getBoundingClientRect().width - hote.clientWidth);
    if (trop > 1) {
      debordements.push({
        quoi: el.tagName.toLowerCase(),
        trop,
        texte: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
      });
    }
  }

  const coupes = [];
  if (aside) {
    for (const b of aside.querySelectorAll("button")) {
      const trop = b.scrollWidth - b.clientWidth;
      if (trop > 0) {
        coupes.push({
          texte: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34),
          trop,
        });
      }
    }
  }

  const main = document.querySelector("main");
  const texte = main
    ? (main.textContent || "")
        .replace(/[  ]/g, " ")
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  return {
    colonnes,
    position,
    pliVisible,
    corpsPliable,
    debordements: debordements.sort((a, b) => b.trop - a.trop).slice(0, 4),
    coupes: coupes.sort((a, b) => b.trop - a.trop).slice(0, 4),
    mainLongueur: texte.length,
  };
};

async function mesure(page, attendu, defaut) {
  const releves = [];
  for (const largeur of largeurs(attendu.bascule)) {
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.waitForTimeout(220);
    const r = await page.evaluate(RELEVE, defaut ?? null);
    releves.push({ largeur, ...r });
    // Le défaut injecté modifie le DOM : on repart d'une page propre.
    if (defaut) await page.reload({ waitUntil: "networkidle" });
  }
  return releves;
}

/** Les six règles, appliquées à un relevé. Rend la liste des manquements. */
function juge(releves, attendu) {
  const defauts = [];
  const sousLaBascule = (l) => l <= attendu.bascule;

  for (const r of releves) {
    if (r.erreur) {
      defauts.push(`${r.largeur} px : ${r.erreur}`);
      continue;
    }
    const attenduColonnes = sousLaBascule(r.largeur) ? 1 : 2;
    if (r.colonnes !== attenduColonnes) {
      defauts.push(
        `règle 1, ${r.largeur} px : ${r.colonnes} colonne(s) au cadre, le colis en veut ${attenduColonnes} (bascule à ${attendu.bascule} px)`,
      );
    }

    const attenduePosition =
      sousLaBascule(r.largeur) && attendu.auFilDuTexte ? "relative" : "sticky";
    if (r.position !== attenduePosition) {
      defauts.push(
        `règle 2, ${r.largeur} px : le menu est « ${r.position} », le colis le veut « ${attenduePosition} »`,
      );
    }

    if (attendu.pliant) {
      const attenduPli = sousLaBascule(r.largeur);
      if (r.pliVisible !== attenduPli) {
        defauts.push(
          `règle 3, ${r.largeur} px : le bouton « Filtres » est ${r.pliVisible ? "visible" : "caché"}, le colis le veut ${attenduPli ? "visible" : "caché"}`,
        );
      }
      if (attenduPli && !r.corpsPliable) {
        defauts.push(
          `règle 3, ${r.largeur} px : le bouton « Filtres » est là mais la feuille ne sait pas replier son corps`,
        );
      }
    }

    for (const d of r.debordements) {
      defauts.push(
        `règle 4, ${r.largeur} px : un <${d.quoi}> dépasse son hôte de ${d.trop} px, « ${d.texte} »`,
      );
    }
    for (const c of r.coupes) {
      defauts.push(
        `règle 5, ${r.largeur} px : le texte d'un bouton du menu est coupé de ${c.trop} px, « ${c.texte} »`,
      );
    }
  }

  const longueurs = releves.filter((r) => !r.erreur).map((r) => r.mainLongueur);
  const plein = Math.max(...longueurs);
  for (const r of releves) {
    if (r.erreur) continue;
    if (r.mainLongueur < plein) {
      defauts.push(
        `règle 6, ${r.largeur} px : le <main> rend ${r.mainLongueur} signes contre ${plein} ailleurs, ${plein - r.mainLongueur} de perdus`,
      );
    }
  }

  return defauts;
}

/* ------------------------------------------------------------ la porte */

const TEMOINS = [
  { defaut: "une-colonne-partout", dit: "le cadre réduit à une colonne partout" },
  { defaut: "bouton-pliant-partout", dit: "le bouton « Filtres » rendu visible sur bureau" },
  { defaut: "une-carte-trop-large", dit: "une carte élargie au-delà de son hôte" },
  { defaut: "un-rail-trop-etroit", dit: "le rail du menu ramené à 200 px" },
  { defaut: "le-sommaire-retire", dit: "le sommaire complet retiré du rendu" },
];

const navigateur = await chromium.launch({ channel: "chrome" });
let code = 0;
try {
  const attendu = pointsDArretDuColis();
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${SITE}/ressources/`, { waitUntil: "networkidle", timeout: 90_000 });

  const releves = await mesure(page, attendu);
  const defauts = juge(releves, attendu);

  console.log(
    `Coquille Ressources v2, ${SITE} : bascule du colis à ${attendu.bascule} px, ${largeurs(attendu.bascule).length} largeurs mesurées`,
  );
  for (const r of releves) {
    if (r.erreur) continue;
    console.log(
      `  ${String(r.largeur).padStart(4)} px  ${r.colonnes} colonne(s)  menu ${r.position.padEnd(8)}  « Filtres » ${r.pliVisible ? "visible" : "caché  "}  main ${r.mainLongueur}`,
    );
  }

  if (defauts.length > 0) {
    console.log("");
    for (const d of defauts) console.log(`  DÉFAUT ${d}`);
    console.log("");
    console.log(`Porte en échec : ${defauts.length} manquement(s).`);
    code = 1;
  } else {
    console.log("Porte conforme.");
  }

  if (MODE_CONTROLE && code === 0) {
    console.log("\nTémoins :");
    let muets = 0;
    for (const t of TEMOINS) {
      await page.reload({ waitUntil: "networkidle" });
      const r = await mesure(page, attendu, t.defaut);
      const d = juge(r, attendu);
      if (d.length === 0) {
        console.log(`  MUET    ${t.dit} : la porte ne l'a pas vu`);
        muets += 1;
      } else {
        console.log(`  témoin  ${t.dit}`);
        console.log(`            → ${d[0]}`);
      }
    }
    await page.reload({ waitUntil: "networkidle" });
    const reel = juge(await mesure(page, attendu), attendu);
    if (reel.length === 0) {
      console.log("  témoin  la donnée réelle : la donnée réelle passe");
    } else {
      console.log(`  MUET    la donnée réelle échoue : ${reel[0]}`);
      muets += 1;
    }
    if (muets > 0) {
      console.log(`\n${muets} témoin(s) muet(s) : la porte ne sait pas échouer.`);
      code = 1;
    } else {
      console.log("\nTous les témoins ont joué leur rôle.\n\nPorte conforme, et elle sait échouer.");
    }
  }
} finally {
  await navigateur.close();
}
process.exit(code);
