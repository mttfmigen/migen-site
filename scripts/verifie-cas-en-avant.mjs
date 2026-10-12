/**
 * PORTE : les CASES MISES EN AVANT du hub /preuves/.
 *
 *   node scripts/verifie-cas-en-avant.mjs [--base <origine>]
 *   node scripts/verifie-cas-en-avant.mjs --controle [--base <origine>]
 *
 * Par défaut la mesure se fait sur la production,
 * https://migen-site.vercel.app ; `--base http://127.0.0.1:4387` mesure un
 * build local servi en arrière-plan.
 *
 * CE QU'ELLE EXIGE, et pourquoi chaque exigence existe.
 *
 *   1. TROIS cases mises en avant, pas deux, pas quatre. Le gabarit en pose
 *      trois (`vues-preuves.ts`, `une: rangees.slice(0, 3)`) et sa grille
 *      CSS est en deux colonnes sur deux rangées : une case en moins laisse
 *      un trou visible.
 *   2. LE CAS NORVÈGE EST DEDANS. C'est la demande de Mehdi du 12/10, G44 de
 *      GATES.md : « tu dois également mettre en case mise en avant celui de
 *      Norvège ».
 *   3. IL EST LA PREMIÈRE, donc la grande case. Une remontée qui le placerait
 *      en troisième position tiendrait la demande à la lettre et la raterait
 *      en pratique.
 *   4. AUCUN LIEN DE CAS ÉCRIT DEUX FOIS. Le piège a déjà été payé sur cette
 *      page (G47) : la vue « Tous » porte les 41 fiches, les rendre en même
 *      temps que les catégories masquées écrivait chaque lien deux fois.
 *      Remonter une carte ne doit pas la laisser aussi dans la grille.
 *   5. LES 41 FICHES SONT TOUJOURS LÀ. Mettre un cas en avant en sort un
 *      autre des cases, mais il doit retomber dans la grille, pas disparaître
 *      du cocon.
 *   6. LA PAGE QU'ELLE OUVRE RÉPOND 200.
 *
 * ELLE SAIT ÉCHOUER, et `--controle` le prouve. Le contrôle prend la page
 * RÉELLE telle qu'elle est servie, vérifie d'abord qu'elle passe (contrôle
 * négatif : sans faute, zéro manquement), puis lui injecte six fautes, une à
 * une, et exige que chacune soit vue. Une faute non vue arrête la porte.
 *
 * PIÈGES DE MESURE TRAITÉS :
 *   · les liens figurent DEUX FOIS dans le document, une fois dans le HTML et
 *     une fois dans la charge RSC des `<script>` : les scripts sont retirés
 *     avant tout comptage, sans quoi chaque lien paraîtrait dupliqué ;
 *   · le nom de classe des cases est haché par le build
 *     (`PreuvesHub-module__<hash>__une`) : on ne reconnaît que le suffixe ;
 *   · un fetch raté peut se lire comme une chute de chiffres : chaque appel
 *     est retenté deux fois avant d'être cru.
 */

const CIBLE = "/preuves/savoye-migration-automates-norvege/";
const HUB = "/preuves/";
const CASES_ATTENDUES = 3;
const FICHES_ATTENDUES = 41;

const args = process.argv.slice(2);
const controle = args.includes("--controle");
const iBase = args.indexOf("--base");
const BASE = (iBase >= 0 ? args[iBase + 1] : "https://migen-site.vercel.app").replace(/\/$/, "");

/* ------------------------------------------------------------------ réseau */

async function reessaie(action) {
  let derniere;
  for (let essai = 0; essai < 3; essai += 1) {
    try {
      return await action();
    } catch (erreur) {
      derniere = erreur;
      await new Promise((suite) => setTimeout(suite, 400 * (essai + 1)));
    }
  }
  throw derniere;
}

const texte = (chemin) =>
  reessaie(async () => {
    const reponse = await fetch(BASE + chemin, { redirect: "manual" });
    if (!reponse.ok) throw new Error(`${chemin} répond ${reponse.status}`);
    return reponse.text();
  });

const code = (chemin) =>
  reessaie(async () => {
    const reponse = await fetch(BASE + chemin, { redirect: "manual" });
    return reponse.status;
  });

/* ------------------------------------------------------------------ mesure */

/** Le document sans ses scripts : le HTML que l'œil reçoit. */
function sansScripts(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/g, " ");
}

/** Les cases mises en avant, dans l'ordre, par leur cible. */
function casesEnAvant(html) {
  const cases = [];
  const balise = /<a\b[^>]*>/g;
  for (let m = balise.exec(html); m; m = balise.exec(html)) {
    if (!/class="[^"]*__une"/.test(m[0])) continue;
    const href = /href="([^"]*)"/.exec(m[0]);
    cases.push(href ? href[1] : "");
  }
  return cases;
}

/** Tous les liens de fiches de cas rendus, doublons compris. */
function liensFiches(html) {
  const liens = [];
  const href = /href="(\/preuves\/[a-z0-9-]+\/)"/g;
  for (let m = href.exec(html); m; m = href.exec(html)) liens.push(m[1]);
  return liens;
}

/**
 * Les manquements de la page servie. Liste vide = la porte passe.
 * `codeCible` est le code HTTP de la fiche mise en avant.
 */
function manquements(htmlBrut, codeCible) {
  const defauts = [];
  const html = sansScripts(htmlBrut);
  const cases = casesEnAvant(html);

  if (cases.length !== CASES_ATTENDUES) {
    defauts.push(`cases mises en avant : ${cases.length} au lieu de ${CASES_ATTENDUES}`);
  }
  if (!cases.includes(CIBLE)) {
    defauts.push(`le cas Norvège n'est pas en case mise en avant (cases : ${cases.join(", ") || "aucune"})`);
  } else if (cases[0] !== CIBLE) {
    defauts.push(`le cas Norvège est en case ${cases.indexOf(CIBLE) + 1}, pas en première`);
  }

  const liens = liensFiches(html);
  const doublons = [...new Set(liens.filter((l, i) => liens.indexOf(l) !== i))];
  if (doublons.length > 0) {
    defauts.push(`liens de fiches écrits deux fois : ${doublons.join(", ")}`);
  }

  const distincts = new Set(liens);
  if (distincts.size !== FICHES_ATTENDUES) {
    defauts.push(`fiches liées : ${distincts.size} au lieu de ${FICHES_ATTENDUES}`);
  }

  if (codeCible !== 200) {
    defauts.push(`${CIBLE} répond ${codeCible} au lieu de 200`);
  }
  return defauts;
}

/* ----------------------------------------------------------------- témoin */

/**
 * Les six fautes du mode témoin. Chacune transforme la page réelle et doit
 * être vue. `cible` remplace le code HTTP de la fiche.
 */
const FAUTES = [
  {
    nom: "le cas Norvège sort des cases (sa classe est retirée)",
    page: (html) =>
      html.replace(
        new RegExp(`(<a\\b[^>]*)class="([^"]*)__une"([^>]*href="${CIBLE}")`),
        '$1class="$2__carte"$3',
      ),
  },
  {
    nom: "le cas Norvège passe en troisième case",
    page: (html) => {
      const cases = [...html.matchAll(/<a\b[^>]*class="[^"]*__une"[^>]*>/g)].map((m) => m[0]);
      if (cases.length < 3) throw new Error("témoin impossible : moins de trois cases");
      const premier = /href="([^"]*)"/.exec(cases[0])[1];
      const troisieme = /href="([^"]*)"/.exec(cases[2])[1];
      return html
        .replace(cases[0], cases[0].replace(premier, "§A§"))
        .replace(cases[2], cases[2].replace(troisieme, "§B§"))
        .replace("§A§", troisieme)
        .replace("§B§", premier);
    },
  },
  {
    nom: "une case mise en avant disparaît",
    page: (html) => {
      const cases = [...html.matchAll(/<a\b[^>]*class="[^"]*__une"[^>]*>/g)].map((m) => m[0]);
      const derniere = cases[cases.length - 1];
      return html.replace(derniere, derniere.replace(/class="[^"]*__une"/, 'class="x"'));
    },
  },
  {
    nom: "le cas mis en avant reste aussi dans la grille",
    page: (html) => html.replace("</main>", `<a href="${CIBLE}">doublon</a></main>`),
  },
  {
    nom: "une fiche du cocon disparaît",
    page: (html) => {
      const liens = liensFiches(sansScripts(html));
      const perdu = liens.find((l) => l !== CIBLE);
      return html.replace(`href="${perdu}"`, 'href="/contact/"');
    },
  },
  {
    nom: "la fiche mise en avant ne répond plus 200",
    page: (html) => html,
    cible: 404,
  },
];

/* ------------------------------------------------------------------ marche */

const html = await texte(HUB);
const codeCible = await code(CIBLE);

if (!controle) {
  const defauts = manquements(html, codeCible);
  if (defauts.length > 0) {
    console.error(`PORTE ROUGE sur ${BASE}${HUB}`);
    for (const d of defauts) console.error(`  · ${d}`);
    process.exit(1);
  }
  const cases = casesEnAvant(sansScripts(html));
  console.log(`PORTE VERTE sur ${BASE}${HUB}`);
  console.log(`  cases mises en avant : ${cases.join(", ")}`);
  console.log(`  ${CIBLE} répond ${codeCible}`);
  process.exit(0);
}

/* Contrôle négatif : la page réelle, sans faute, ne doit rien signaler. */
const sansFaute = manquements(html, codeCible);
if (sansFaute.length > 0) {
  console.error("TÉMOIN INUTILISABLE : la page servie est déjà rouge, la porte");
  console.error("ne peut pas prouver qu'elle distingue le bon du mauvais.");
  for (const d of sansFaute) console.error(`  · ${d}`);
  process.exit(1);
}
console.log("contrôle négatif : page conforme acceptée, 0 manquement");

let vues = 0;
for (const faute of FAUTES) {
  const defauts = manquements(faute.page(html), faute.cible ?? codeCible);
  if (defauts.length === 0) {
    console.error(`FAUTE NON VUE : ${faute.nom}`);
    process.exit(1);
  }
  vues += 1;
  console.log(`faute vue (${vues}/${FAUTES.length}) : ${faute.nom}`);
  console.log(`   signalé : ${defauts.join(" | ")}`);
}
console.log(`TÉMOIN COMPLET : ${vues}/${FAUTES.length} fautes vues, 1 contrôle négatif`);
