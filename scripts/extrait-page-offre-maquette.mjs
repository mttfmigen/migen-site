/**
 * Extrait de la maquette du client TOUT le texte de la page d'offre que
 * `maquette/offres-maquette.json` ne porte pas.
 *
 *   node scripts/extrait-page-offre-maquette.mjs             écrit les fichiers
 *   node scripts/extrait-page-offre-maquette.mjs --controle   vérifie sans écrire
 *
 * POURQUOI UN SECOND EXTRACTEUR. `scripts/extrait-offres-maquette.mjs` lit
 * l'objet `OFFERS` (les 198 chaînes liées par `{{ of.X }}`). Mais la page
 * d'offre de la maquette porte AUSSI du texte écrit EN DUR dans son gabarit,
 * identique sur les six offres :
 *
 *   · les questions fréquentes (`RES_FAQ` pour Résidence, `FAQ_BY` pour les
 *     cinq autres) ;
 *   · les trois cartes de « Nos dernières réalisations », photo, surtitre,
 *     titre et date comprises ;
 *   · les six tuiles de « Un autre besoin ? », phrase et libellé.
 *
 * Ce texte était jusqu'ici RETAPÉ dans les scripts de production, et il avait
 * dérivé : « Périmètre complet » au lieu de « Full service », des apostrophes
 * droites au lieu des apostrophes typographiques, des espaces ordinaires au
 * lieu des espaces insécables à l'intérieur des chevrons. Ce script supprime la
 * possibilité de la dérive : il COPIE, il ne retape pas.
 *
 * Ce script lit, il n'interprète pas. Une chaîne qui sort d'ici est celle qui
 * est entrée, entités HTML résolues et rien d'autre.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAQUETTE = join(RACINE, "maquette", "site-final.html");
const SORTIE_FAQ = join(RACINE, "maquette", "faq-maquette.json");
const SORTIE_BLOCS = join(RACINE, "maquette", "blocs-offre-maquette.json");

/** Le gabarit de la page d'offre : de son ouverture à celle de la page suivante. */
const DEBUT_GABARIT = '<sc-if value="{{ isOfferPage }}"';
const FIN_GABARIT = '<sc-if value="{{ isApropos }}"';

/**
 * Les cibles des six tuiles de « Un autre besoin ? ».
 *
 * LA MAQUETTE NAVIGUE PAR `onClick="{{ goX }}"`, elle ne porte aucune URL :
 * c'est la seule donnée de cette section qui ne peut pas être copiée, et elle
 * est posée ici, nommément, avec la page que chaque appel ouvre. Le TEXTE, lui,
 * est copié.
 */
const CIBLES_TUILES = {
  goSurSite: "/offres/residence/",
  goFull: "/offres/maintenance-externalisee/",
  goZero: "/offres/zero-arret/",
  goArret: "/offres/arret-technique/",
  goEtude: "/offres/bureau-etudes/",
  goOffres: "/offres/",
};

/** La cible du lien d'en-tête de « Nos dernières réalisations » (`goReal`). */
const CIBLE_REALISATIONS = "/realisations/";

/**
 * Découpe un littéral JavaScript en équilibrant ses délimiteurs.
 *
 * Une expression régulière ne suffit pas : les valeurs contiennent des
 * accolades, des crochets et des guillemets. On compte, en ignorant ce qui est
 * à l'intérieur d'une chaîne, échappements compris.
 */
function decoupeLitteral(source, depart, ouvrant, fermant) {
  let profondeur = 0;
  let dansUneChaine = false;
  let echappe = false;

  for (let i = depart; i < source.length; i += 1) {
    const c = source[i];
    if (echappe) {
      echappe = false;
      continue;
    }
    if (c === "\\") {
      echappe = true;
      continue;
    }
    if (c === '"') {
      dansUneChaine = !dansUneChaine;
      continue;
    }
    if (dansUneChaine) continue;
    if (c === ouvrant) profondeur += 1;
    else if (c === fermant) {
      profondeur -= 1;
      if (profondeur === 0) return source.slice(depart, i + 1);
    }
  }
  throw new Error(
    `délimiteur « ${fermant} » jamais atteint : la maquette a changé de forme`,
  );
}

/** Le littéral qui suit un marqueur, parsé. Lève plutôt que de deviner. */
function litLitteral(source, marqueur, ouvrant, fermant) {
  const i = source.indexOf(marqueur);
  if (i === -1) {
    throw new Error(
      `« ${marqueur} » introuvable dans la maquette : le portage ne peut plus en tirer son texte`,
    );
  }
  return JSON.parse(
    decoupeLitteral(source, i + marqueur.length, ouvrant, fermant),
  );
}

/**
 * Résout les entités HTML de la maquette. `&nbsp;` devient U+00A0 et NON un
 * espace ordinaire : c'est une différence visible, et un piège connu du dépôt.
 */
function resoudEntites(texte) {
  return texte
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Le texte visible d'un fragment HTML : balises retirées, entités résolues. */
export function texteVisible(fragment) {
  return resoudEntites(fragment.replace(/<[^>]*>/g, ""))
    .replace(/[ \t\r\n]+/g, " ")
    .trim();
}

/** La portion de maquette qui dessine la page d'offre. */
function gabaritOffre(source) {
  const debut = source.indexOf(DEBUT_GABARIT);
  const fin = source.indexOf(FIN_GABARIT, debut + 1);
  if (debut === -1 || fin <= debut) {
    throw new Error(
      "le gabarit isOfferPage est introuvable ou non refermé dans la maquette",
    );
  }
  return source.slice(debut, fin);
}

/** La section du gabarit dont l'en-tête porte ce surtitre. */
function sectionParSurtitre(gabarit, surtitre) {
  const i = gabarit.indexOf(`>${surtitre}<`);
  if (i === -1) {
    throw new Error(
      `la section « ${surtitre} » est introuvable dans le gabarit de la page d'offre`,
    );
  }
  const debut = gabarit.lastIndexOf("<section", i);
  const fin = gabarit.indexOf("</section>", i);
  if (debut === -1 || fin === -1) {
    throw new Error(`la section « ${surtitre} » n'est pas refermée`);
  }
  return gabarit.slice(debut, fin);
}

/* -------------------------------------------------------- le héros et « En bref » */

/**
 * Les trois libellés que le héros écrit en dur (l. 4046, 4064 et 4065) : le
 * bouton en verre, puis l'en-tête du panneau de formulaire.
 */
function litHeros(gabarit) {
  const bouton = gabarit.match(
    /<a href="#" onClick="\{\{ goOffres \}\}"[^>]*>([^<]*)<\/a>/,
  );
  const titre = gabarit.match(
    /<div style="font:600 20px\/1\.2 var\(--ft\);letter-spacing:-\.03em;white-space:nowrap">([^<]*)<\/div>/,
  );
  const mention = gabarit.match(
    /<div style="font:500 11\.5px var\(--fb\);letter-spacing:\.1em;text-transform:uppercase;color:var\(--acc\)">([^<]*)<\/div>/,
  );
  // L'état « envoyé » de la carte du héros (l. 4062) : la maquette le dessine,
  // le site ne l'avait pas.
  const envoye = gabarit.match(
    /<div style="font:600 23px var\(--ft\);letter-spacing:-\.03em;margin-bottom:10px">([^<]*)<\/div>\s*<p style="font:400 15px\/1\.6 var\(--fb\);color:var\(--ink2\);margin:0 auto;max-width:32ch">([^<]*)<\/p>/,
  );
  if (!bouton || !titre || !mention || !envoye) {
    throw new Error("le héros de la page d'offre a changé de forme");
  }
  return {
    bouton: { libelle: texteVisible(bouton[1]), href: "/offres/" },
    formulaireTitre: texteVisible(titre[1]),
    formulaireMention: texteVisible(mention[1]),
    envoyeTitre: texteVisible(envoye[1]),
    envoyeTexte: texteVisible(envoye[2]),
  };
}

/** Le surtitre et le H2 de « En bref » (l. 4080), écrits en dur. */
function litBref(gabarit) {
  const section = sectionParSurtitre(gabarit, "En bref");
  const h2 = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
  if (!h2) throw new Error("le H2 de « En bref » est introuvable");
  return { surtitre: "En bref", titre: texteVisible(h2[1]) };
}

/* ---------------------------------------------- « Nos dernières réalisations » */

/**
 * Les trois cartes de réalisation (maquette, l. 4438 à 4463).
 *
 * ELLES NE SONT PAS DES LIAISONS `{{ of.X }}` : la maquette les écrit en dur, et
 * les sert à l'identique sur les six offres, surtitre « migen© Résidence »
 * compris. Elles sont donc du texte du client comme le reste, et portées comme
 * le reste.
 */
function litRealisations(gabarit) {
  const section = sectionParSurtitre(gabarit, "Nos dernières réalisations");
  const cartes = [];

  for (const carte of section.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
    const dedans = carte[1];
    const image = dedans.match(/<img\b[^>]*src="([^"]+)"/);
    if (!image) continue; // le lien d'en-tête, qui n'a pas de photo
    const niveaux = [...dedans.matchAll(/<div style="font:[^"]*">([\s\S]*?)<\/div>/g)]
      .map((m) => texteVisible(m[1]))
      .filter(Boolean);
    if (niveaux.length !== 3) {
      throw new Error(
        `une carte de réalisation porte ${niveaux.length} niveaux de texte au lieu de trois`,
      );
    }
    cartes.push({
      // `assets/web/x.jpg` dans la maquette, `/assets/web/x.jpg` au dépôt.
      image: `/${image[1].replace(/^\/?/, "")}`,
      surtitre: niveaux[0],
      titre: niveaux[1],
      date: niveaux[2],
    });
  }

  const entete = section.match(/<a\b[^>]*onClick="\{\{ goReal \}\}"[^>]*>([\s\S]*?)<\/a>/);
  const h2 = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
  if (!entete || !h2) {
    throw new Error(
      "l'en-tête de « Nos dernières réalisations » a changé de forme : lien ou H2 introuvable",
    );
  }

  return {
    surtitre: "Nos dernières réalisations",
    titre: texteVisible(h2[1]),
    lien: { libelle: texteVisible(entete[1]), href: CIBLE_REALISATIONS },
    cartes,
  };
}

/* ------------------------------------------------------- « Un autre besoin ? » */

/** Les six tuiles, phrase et libellé copiés, cible prise dans `CIBLES_TUILES`. */
function litAutres(gabarit) {
  const section = sectionParSurtitre(gabarit, "Un autre besoin&nbsp;?");
  const tuiles = [];

  for (const tuile of section.matchAll(
    /<a\b[^>]*onClick="\{\{ (go\w+) \}\}"[^>]*>([\s\S]*?)<\/a>/g,
  )) {
    const appel = tuile[1];
    const href = CIBLES_TUILES[appel];
    if (!href) {
      throw new Error(
        `la tuile « ${appel} » de « Un autre besoin ? » n'a pas de cible déclarée dans CIBLES_TUILES`,
      );
    }
    const spans = [...tuile[2].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(
      (m) => texteVisible(m[1]),
    );
    if (spans.length !== 2) {
      throw new Error(
        `la tuile « ${appel} » porte ${spans.length} textes au lieu de deux`,
      );
    }
    // Le libellé de la maquette finit par « → ». La flèche est posée par le
    // composant, comme pour toutes les cartes du site : on ne la stocke pas.
    tuiles.push({ phrase: spans[0], libelle: spans[1].replace(/\s*→$/, ""), href });
  }

  const h2 = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
  const chapeau = section.match(/<p style="font:400 16\.5px[^"]*">([\s\S]*?)<\/p>/);
  if (!h2 || !chapeau) {
    throw new Error(
      "l'en-tête de « Un autre besoin ? » a changé de forme : H2 ou chapeau introuvable",
    );
  }

  return {
    surtitre: texteVisible("Un autre besoin&nbsp;?"),
    titre: texteVisible(h2[1]),
    // `Si {{ of.name }} n’est pas…` : le gabarit garde la liaison, résolue par
    // offre au moment de produire le contenu.
    chapeauGabarit: texteVisible(chapeau[1]),
    tuiles,
  };
}

/* ------------------------------------------- « Ce qui est inclus », la barrette */

/** La barrette en verre sous les deux panneaux (l. 4283), écrite en dur. */
function litBarretteInclus(gabarit) {
  const section = sectionParSurtitre(gabarit, "Ce qui est inclus");
  const phrase = section.match(
    /<span style="font:500 15\.5px\/1\.5 var\(--fb\);color:var\(--ink1\)">([\s\S]*?)<\/span>/,
  );
  const bouton = section.match(
    /<a href="#form-page"[^>]*>([\s\S]*?)<\/a>/,
  );
  if (!phrase || !bouton) {
    throw new Error(
      "la barrette de « Ce qui est inclus » a changé de forme : phrase ou bouton introuvable",
    );
  }
  return { bande: texteVisible(phrase[1]), bouton: texteVisible(bouton[1]) };
}

/* ------------------------------------------------- « Questions fréquentes » */

/**
 * Le H2 et le bouton de la colonne collante, écrits en dur (l. 4469).
 * Les questions, elles, viennent de `RES_FAQ` et `FAQ_BY`.
 */
function litEnteteFaq(gabarit) {
  const section = sectionParSurtitre(gabarit, "Questions fréquentes");
  const h2 = section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
  const bouton = section.match(/<a href="#form-page"[^>]*>([\s\S]*?)<\/a>/);
  if (!h2 || !bouton) {
    throw new Error(
      "l'en-tête de « Questions fréquentes » a changé de forme : H2 ou bouton introuvable",
    );
  }
  return { titre: texteVisible(h2[1]), bouton: texteVisible(bouton[1]) };
}

/* ---------------------------------------------------------------- l'assemblage */

/** Lit tout, et le rend. Lève plutôt que de deviner. */
export function litPageOffreDeLaMaquette(chemin = MAQUETTE) {
  const source = readFileSync(chemin, "utf8");
  const gabarit = gabaritOffre(source);

  const resFaq = litLitteral(source, "RES_FAQ = ", "[", "]");
  const faqParOffre = litLitteral(source, "FAQ_BY = ", "{", "}");

  const faq = {
    /* `resFaq: ((this.FAQ_BY && this.FAQ_BY[page]) || this.RES_FAQ)`, l. 9336 :
       une offre sans entrée dans FAQ_BY retombe sur RES_FAQ. `sursite` n'y est
       pas, c'est donc Résidence qui porte les cinq questions de repli. */
    defaut: resFaq.map(([question, reponse]) => ({ question, reponse })),
    parOffre: Object.fromEntries(
      Object.entries(faqParOffre).map(([cle, paires]) => [
        cle,
        paires.map(([question, reponse]) => ({ question, reponse })),
      ]),
    ),
  };

  const blocs = {
    heros: litHeros(gabarit),
    bref: litBref(gabarit),
    realisations: litRealisations(gabarit),
    autres: litAutres(gabarit),
    inclus: litBarretteInclus(gabarit),
    enteteFaq: litEnteteFaq(gabarit),
  };

  return { faq, blocs, ligneGabarit: source.slice(0, source.indexOf(DEBUT_GABARIT)).split("\n").length };
}

/* ----------------------------------------------------------------- les contrôles */

/** Ce qu'il faut trouver, pour que l'absence se voie au lieu de se deviner. */
function controle({ faq, blocs }) {
  const defauts = [];

  if (faq.defaut.length !== 5) {
    defauts.push(`RES_FAQ : 5 questions attendues, ${faq.defaut.length} trouvée(s)`);
  }
  for (const cle of ["zero", "arret", "chantier", "etude", "construction"]) {
    const liste = faq.parOffre[cle];
    if (!liste || liste.length !== 4) {
      defauts.push(`FAQ_BY.${cle} : 4 questions attendues, ${liste?.length ?? 0} trouvée(s)`);
    }
  }
  if (faq.parOffre.sursite) {
    defauts.push(
      "FAQ_BY.sursite existe désormais : Résidence ne retombe plus sur RES_FAQ, le portage est à relire",
    );
  }
  for (const [ou, liste] of [
    ["RES_FAQ", faq.defaut],
    ...Object.entries(faq.parOffre),
  ]) {
    liste.forEach((q, i) => {
      if (!q.question?.trim() || !q.reponse?.trim()) {
        defauts.push(`${ou}[${i}] : question ou réponse vide`);
      }
    });
  }

  for (const champ of [
    "formulaireTitre",
    "formulaireMention",
    "envoyeTitre",
    "envoyeTexte",
  ]) {
    if (!blocs.heros[champ]?.trim()) defauts.push(`héros : ${champ} vide`);
  }
  if (!blocs.heros.bouton.libelle?.trim()) defauts.push("héros : libellé du bouton vide");
  for (const champ of ["surtitre", "titre"]) {
    if (!blocs.bref[champ]?.trim()) defauts.push(`« En bref » : ${champ} vide`);
  }
  if (blocs.realisations.cartes.length !== 3) {
    defauts.push(
      `réalisations : 3 cartes attendues, ${blocs.realisations.cartes.length} trouvée(s)`,
    );
  }
  if (blocs.autres.tuiles.length !== 6) {
    defauts.push(`« Un autre besoin ? » : 6 tuiles attendues, ${blocs.autres.tuiles.length}`);
  }
  if (!blocs.autres.chapeauGabarit.includes("{{ of.name }}")) {
    defauts.push(
      "le chapeau de « Un autre besoin ? » ne porte plus la liaison {{ of.name }} : à relire",
    );
  }
  for (const tuile of blocs.autres.tuiles) {
    if (!tuile.phrase.startsWith("«") || !tuile.phrase.endsWith("»")) {
      defauts.push(`tuile « ${tuile.libelle} » : la phrase n'est pas entre chevrons`);
    }
    if (!tuile.phrase.includes(" ")) {
      defauts.push(
        `tuile « ${tuile.libelle} » : espace insécable perdu à l'intérieur des chevrons`,
      );
    }
  }
  for (const champ of ["bande", "bouton"]) {
    if (!blocs.inclus[champ]?.trim()) defauts.push(`barrette « Ce qui est inclus » : ${champ} vide`);
  }
  for (const champ of ["titre", "bouton"]) {
    if (!blocs.enteteFaq[champ]?.trim()) defauts.push(`en-tête FAQ : ${champ} vide`);
  }

  return defauts;
}

const estLanceDirectement = process.argv[1]?.endsWith(
  "extrait-page-offre-maquette.mjs",
);

if (estLanceDirectement) {
  const { faq, blocs, ligneGabarit } = litPageOffreDeLaMaquette();
  const defauts = controle({ faq, blocs });

  console.log(
    `maquette/site-final.html, gabarit de la page d'offre à la ligne ${ligneGabarit} :`,
  );
  console.log(
    `  questions fréquentes : ${faq.defaut.length} de repli (Résidence) + ` +
      Object.entries(faq.parOffre)
        .map(([c, l]) => `${c} ${l.length}`)
        .join(", "),
  );
  console.log(`  réalisations : ${blocs.realisations.cartes.length} cartes`);
  for (const carte of blocs.realisations.cartes) {
    console.log(`    ${carte.surtitre.padEnd(30)} ${carte.image}`);
  }
  console.log(`  « Un autre besoin ? » : ${blocs.autres.tuiles.length} tuiles`);
  for (const tuile of blocs.autres.tuiles) {
    console.log(`    ${tuile.libelle.padEnd(22)} ${tuile.href}`);
  }

  if (defauts.length) {
    console.error(`\n${defauts.length} défaut(s) de forme :`);
    for (const d of defauts) console.error(`  · ${d}`);
    process.exit(1);
  }
  console.log("\nforme conforme");

  if (process.argv.includes("--controle")) {
    console.log("mode contrôle : rien n'est écrit");
    process.exit(0);
  }

  writeFileSync(SORTIE_FAQ, `${JSON.stringify(faq, null, 2)}\n`, "utf8");
  writeFileSync(SORTIE_BLOCS, `${JSON.stringify(blocs, null, 2)}\n`, "utf8");

  // On relit ce qu'on vient d'écrire : le but de ces fichiers est d'être
  // identiques à la maquette, pas « proches ».
  for (const [chemin, attendu] of [
    [SORTIE_FAQ, faq],
    [SORTIE_BLOCS, blocs],
  ]) {
    const relu = JSON.parse(readFileSync(chemin, "utf8"));
    if (JSON.stringify(relu) !== JSON.stringify(attendu)) {
      console.error(`écriture infidèle : ${chemin}`);
      process.exit(1);
    }
  }

  console.log(
    "écrit : maquette/faq-maquette.json et maquette/blocs-offre-maquette.json (relus et identiques)",
  );
}
