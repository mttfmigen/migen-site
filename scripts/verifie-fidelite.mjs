/**
 * La page d'accueil a-t-elle, section par section, les hauteurs de la maquette ?
 *
 *   node scripts/verifie-fidelite.mjs
 *
 * Les deux pages sont ouvertes dans le MÊME navigateur, à la MÊME largeur, et
 * mesurées par le même code. C'est ce qui rend la comparaison recevable : une
 * capture d'écran jugée à l'œil ne l'est pas, et une note de lecture non plus.
 *
 * CE CONTRÔLE A DES EXCEPTIONS, et elles sont DÉCLARÉES ici, chacune avec sa
 * raison. Un écart non déclaré fait échouer le contrôle, et une exception qui
 * n'est plus nécessaire le fait échouer aussi : sans cela, la liste grossirait
 * jusqu'à tout autoriser.
 *
 * PRÉALABLES, vérifiés et annoncés plutôt que supposés :
 *   · le site en développement sur http://localhost:4340/  (bun run dev)
 *   · la maquette servie sur http://127.0.0.1:4350/accueil-autonome.html
 *     (cd ~/Landing\ lovable/maquette && python3 -m http.server 4350 --bind 127.0.0.1)
 *   · Google Chrome installé (Playwright l'utilise par son canal, sans rien télécharger)
 */
import { chromium } from "playwright";

/* Par défaut le serveur de développement. `SITE_URL=http://localhost:4341/`
   pointe la version construite, qui est celle que les visiteurs reçoivent :
   c'est là que les mesures de fluidité comptent, le développement payant la
   compilation à la demande et les images non optimisées. */
const SITE = process.env.SITE_URL ?? "http://localhost:4340/";
const MAQUETTE = "http://127.0.0.1:4350/accueil-autonome.html";
const LARGEUR = 1280;
const HAUTEUR = 860;

/** Tolérance par défaut : au-delà, l'écart est visible à l'œil. */
const TOLERANCE = 40;

/**
 * Les écarts attendus, par rang de section, avec leur justification.
 *
 * `ecart` est site moins maquette, en pixels, et `marge` la variation admise
 * autour de cette valeur (le repli du texte dépend du rendu des polices).
 */
const EXCEPTIONS = new Map([
  [0, { ecart: 62, marge: 14, pourquoi: "mention RGPD sous le bouton du formulaire du héros (50 px) plus l'écart de grille (12 px). Exigée au point de collecte, articles 13 et 14 ; absente de la maquette." }],
  [11, { ecart: -35, marge: 14, pourquoi: "note de travail de la maquette retirée : « Verbatims reformulés à partir de retours clients · à valider avec les intéressés avant publication ». Elle n'était pas destinée aux visiteurs." }],
  [12, { ecart: -43, marge: 14, pourquoi: "note de travail de la maquette retirée : « Jalons à confirmer · dates et chiffres à valider »." }],
  [13, { ecart: -28, marge: 14, pourquoi: "la phrase de la maquette finit par « pour des prestations sur mesure », formulation interdite par le contrat. Coupée après « validés par vos soins » : une ligne de moins, à 16,5/1,7." }],
  [19, { ecart: 45, marge: 14, pourquoi: "mention RGPD du formulaire de bas de page, même raison que la section 0." }],
]);

const MESURE = () => {
  const visibles = [...document.querySelectorAll("section")].filter(
    (s) => s.getBoundingClientRect().height > 0 && s.offsetParent !== null,
  );
  return {
    largeur: window.innerWidth,
    h1: getComputedStyle(document.querySelector("h1")).fontSize,
    page: document.documentElement.scrollHeight,
    sections: visibles.map((s) => ({
      h: Math.round(s.getBoundingClientRect().height),
      texte: (s.innerText || "").replace(/\s+/g, " ").trim().slice(0, 48),
    })),
  };
};

async function mesure(navigateur, url) {
  const page = await navigateur.newPage({
    viewport: { width: LARGEUR, height: HAUTEUR },
  });
  const reponse = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  if (!reponse?.ok()) throw new Error(`${url} répond ${reponse?.status()}`);
  // Les polices arrivent après le premier rendu, et elles changent le repli du
  // texte donc les hauteurs. On les attend, puis on laisse une image passer.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  const releve = await page.evaluate(MESURE);
  await page.close();
  return releve;
}

const navigateur = await chromium.launch({ channel: "chrome" });
let code = 0;
try {
  const [maquette, site] = await Promise.all([
    mesure(navigateur, MAQUETTE),
    mesure(navigateur, SITE),
  ]);

  // Sans la même largeur de rendu, toute comparaison de hauteur est du bruit.
  for (const [nom, releve] of [["maquette", maquette], ["site", site]]) {
    if (releve.largeur !== LARGEUR) {
      throw new Error(`${nom} rendu à ${releve.largeur} px au lieu de ${LARGEUR}`);
    }
    if (releve.h1 !== "56.32px") {
      throw new Error(`${nom} : h1 à ${releve.h1}, la typographie n'est pas celle attendue`);
    }
  }

  if (site.sections.length !== maquette.sections.length) {
    console.error(
      `nombre de sections : ${site.sections.length} sur le site, ${maquette.sections.length} dans la maquette`,
    );
    code = 1;
  }

  const anomalies = [];
  const inutiles = [];
  const commun = Math.min(site.sections.length, maquette.sections.length);

  for (let i = 0; i < commun; i += 1) {
    const ecart = site.sections[i].h - maquette.sections[i].h;
    const exception = EXCEPTIONS.get(i);

    if (exception) {
      if (Math.abs(ecart - exception.ecart) > exception.marge) {
        anomalies.push(
          `section ${i} (${maquette.sections[i].texte}) : écart ${ecart} px, ` +
            `l'exception déclarée en attend ${exception.ecart} ± ${exception.marge}.\n` +
            `    ${exception.pourquoi}\n` +
            `    Si l'écart a changé pour une bonne raison, mettez l'exception à jour ; sinon, corrigez la section.`,
        );
      }
      // Une exception devenue inutile doit disparaître, sinon elle couvrirait
      // une régression future sans que personne ne le voie.
      if (ecart === 0) inutiles.push(`section ${i} : écart nul, l'exception n'a plus de raison d'être`);
      continue;
    }

    if (Math.abs(ecart) > TOLERANCE) {
      anomalies.push(
        `section ${i} (${maquette.sections[i].texte}) : ${site.sections[i].h} px ` +
          `contre ${maquette.sections[i].h} px, écart ${ecart > 0 ? "+" : ""}${ecart} px.\n` +
          `    Aucune exception déclarée. Corrigez la section, ou déclarez l'écart avec sa raison.`,
      );
    }
  }

  const exacts = Array.from({ length: commun }, (_, i) => i).filter(
    (i) => site.sections[i].h === maquette.sections[i].h,
  ).length;

  console.log(
    `${commun} sections comparées à ${LARGEUR} px : ${exacts} au pixel, ` +
      `${EXCEPTIONS.size} écarts déclarés, ${anomalies.length} anomalie(s).`,
  );
  console.log(`hauteur de page : site ${site.page} px, maquette ${maquette.page} px`);

  for (const ligne of [...anomalies, ...inutiles]) console.error(`  ${ligne}`);
  if (anomalies.length > 0 || inutiles.length > 0) code = 1;

  if (code === 0) console.log("fidélité des hauteurs conforme");
} catch (erreur) {
  console.error(`contrôle impossible : ${erreur.message}`);
  console.error("Le site doit tourner sur 4340 et la maquette être servie sur 4350 (voir l'en-tête de ce fichier).");
  code = 1;
} finally {
  await navigateur.close();
}

process.exit(code);
