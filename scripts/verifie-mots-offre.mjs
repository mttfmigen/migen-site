/**
 * LA PAGE D'OFFRE DIT-ELLE LES MOTS DE LA MAQUETTE, ET RIEN D'AUTRE ?
 *
 *   node scripts/verifie-mots-offre.mjs
 *   node scripts/verifie-mots-offre.mjs --rendu     imprime le détail par offre
 *   node scripts/verifie-mots-offre.mjs --controle  prouve que la porte sait échouer
 *
 * POURQUOI CETTE PORTE EXISTE. « Mot pour mot » doit se prouver, pas s'affirmer.
 * Le site a rendu pendant des semaines « Ce que nous garantissons. » là où la
 * maquette écrit « Vous gardez la main. Nous portons le reste. », et aucune des
 * portes du dépôt ne l'a vu : elles vérifiaient le DESSIN (les valeurs de style),
 * le nombre de h1, les cibles mortes, les interdits de copie. Aucune ne
 * comparait le TEXTE rendu au texte de la maquette.
 *
 * CE QU'ELLE CONTRÔLE, dans les deux sens et sur les SIX offres :
 *
 *   A. COMPLÉTUDE. Les trente-trois champs d'`OFFERS` de l'offre contrôlée, plus
 *      la copie que le gabarit écrit en dur, doivent se retrouver dans la page
 *      servie. Une phrase de la maquette absente du rendu est nommée.
 *   B. AUCUNE INVENTION. Chaque phrase du rendu doit se retrouver dans LA CAPTURE
 *      FIGÉE DE SA PAGE, `maquette/rendu/<clé>.html`. Une phrase qui n'y est pas
 *      est fabriquée, et elle est nommée.
 *
 * LE CRITÈRE B A ÉTÉ RÉÉCRIT LE 10/10, PARCE QU'IL MENTAIT À 96 %. Il cherchait
 * la phrase rendue dans deux bottes de foin trop petites : la source de
 * `site-final.html` restreinte à l'entrée `OFFERS` de l'offre contrôlée, et les
 * `sections` du corpus. Or une page d'offre rend AUSSI la grille des six offres
 * et le maillage du cocon : chaque phrase des cinq autres offres y était donc
 * comptée comme une invention. Mesure du 10/10 : sur les 353 « inventions »
 * annoncées, 342 (96,9 %) sont présentes mot pour mot dans la capture figée de
 * leur propre page. Exemple : la porte accusait `/offres/bureau-etudes/` de dire
 * « Contrat unique » et « Arrêt planifié », deux tuiles d'autres offres que
 * `maquette/rendu/offres--bureau-etudes.html` contient.
 *
 * LA CAPTURE EST LA RÉFÉRENCE DU PROJET (CLAUDE.md § 16, décision du 05/10) :
 * c'est l'application telle qu'elle tourne, routeur, corpus et images compris.
 * Aucune reconstruction ne peut être plus juste qu'elle, et une capture absente
 * FAIT ÉCHOUER la porte au lieu de la rendre muette.
 *
 * LES DÉCISIONS DE COPIE SONT APPLIQUÉES À LA CAPTURE avant comparaison, comme
 * `lib/decisions-copie.ts` le prescrit dans son propre en-tête. Sans cela, la
 * porte dénoncerait comme inventions les six phrases où le site écrit « 10 % des
 * techniciens retenus » là où la capture écrit « candidats » : un arbitrage de
 * Mehdi du 08/10, pas une invention.
 *
 * COMMENT ELLE RÉSOUT LES LIAISONS, et c'est le point qui la rend utile : une
 * porte qui comparerait des « {{ of.incT }} » ne contrôlerait rien. Les bindings
 * du gabarit sont résolus par l'objet `OFFERS` de la ligne 7748 pour l'offre
 * contrôlée, et les questions fréquentes par `RES_FAQ` / `FAQ_BY`. Les deux
 * viennent des fichiers extraits (`maquette/offres-maquette.json`,
 * `maquette/faq-maquette.json`, `maquette/blocs-offre-maquette.json`), eux-mêmes
 * copiés caractère pour caractère de la maquette par leurs scripts d'extraction.
 * Rien n'est retapé ici.
 *
 * ELLE COMPARE SUR UN TEXTE NORMALISÉ : espaces insécables ramenés à l'espace,
 * apostrophes typographiques et droites ramenées à la même, espaces multiples
 * réduits. C'est un piège connu du dépôt, et il a déjà fait conclure à tort.
 *
 * LES SEULES EXCEPTIONS SONT LES TIRETS CADRATINS, et rien d'autre. Chacune est
 * déclarée avec sa phrase exacte et sa raison, chacune est vérifiée PRÉSENTE dans
 * la maquette et ABSENTE du rendu, et une exception devenue inutile FAIT ÉCHOUER
 * la porte : sinon la liste grossit jusqu'à tout autoriser.
 *
 * ELLE PROUVE QU'ELLE SAIT ÉCHOUER : `--controle` réinjecte dans chaque page le
 * défaut que chaque contrôle cherche, et exige de le voir tomber. Une porte verte
 * qui ne peut pas rougir ne prouve rien, et celle-ci a déjà menti une fois.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { appliqueDecisions } from "./decisions-copie.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const MAQUETTE = join(RACINE, "maquette", "site-final.html");


const lis = (chemin) => JSON.parse(readFileSync(chemin, "utf8"));
const OFFERS = lis(join(RACINE, "maquette", "offres-maquette.json"));
const FAQ = lis(join(RACINE, "maquette", "faq-maquette.json"));
const BLOCS = lis(join(RACINE, "maquette", "blocs-offre-maquette.json"));

/** La correspondance clé `OFFERS` → URL, la même que `produit_gabarit_offre.mjs`. */
const PAGES = {
  sursite: "/offres/residence/",
  zero: "/offres/zero-arret/",
  arret: "/offres/arret-technique/",
  chantier: "/offres/chantier/",
  etude: "/offres/bureau-etudes/",
  construction: "/offres/construction/",
};

/**
 * LES ADRESSES QUE LE ROUTEUR DE LA MAQUETTE DÉTOURNE, et qu'on ne peut donc
 * pas mesurer contre elle.
 *
 * Sa table `remapOffer` envoie six adresses ailleurs : `/offres/chantier/` et
 * `/offres/construction/` vers `/travaux-industriels/`, `/bureau-etudes/` vers
 * `/offres/bureau-etudes/`, et ainsi de suite. Deux des six pages de cette
 * porte en font partie. Comparer leur rendu à « la maquette » revenait donc à
 * les comparer à UNE AUTRE PAGE, et cette porte annonçait 1 196 écarts dont
 * l'essentiel n'existe pas. Le même piège avait coûté une demi-journée sur
 * `/bureau-etudes/`, mesurée à 69 % de divergence alors que le site reproduit
 * sa capture mot pour mot ; `diff-visuel-offre.mjs` l'a corrigé le 09/10, pas
 * celle-ci.
 *
 * LA TABLE SE LIT DANS LA MAQUETTE, elle ne se recopie pas : recopiée, elle
 * dériverait au prochain export du client. Et comparer les titres ne suffit
 * pas à repérer un détournement : deux pages détournées partagent parfois leur
 * h1, c'est précisément ce qui rendait le piège invisible.
 */
const DETOURNEES = (() => {
  try {
    const source = readFileSync(new URL("../maquette/site-final-autonome.html", import.meta.url), "utf8");
    const bloc = source.match(/remapOffer\(u\)\s*\{[^}]*?const M = \{([^}]*)\}/s);
    if (!bloc) return new Map();
    const table = new Map();
    for (const [, de, vers] of bloc[1].matchAll(/\\?"(\/[^"\\]*)\\?"\s*:\s*\\?"(\/[^"\\]*)\\?"/g)) {
      table.set(de, vers);
    }
    return table;
  } catch {
    return new Map();
  }
})();

/** Le serveur de développement. La page construite sert de repli. */
const SERVEUR = process.env.MIGEN_SITE_URL ?? "http://localhost:4340";

/**
 * LES TIRETS CADRATINS DE LA MAQUETTE, seules déviations autorisées.
 *
 * QUATRE PHRASES, SIX CARACTÈRES. La consigne du 05/10 en nommait trois : un dans
 * la bande « La règle », deux dans l'étape 4 de « Notre sélection ». L'extraction
 * de la donnée en a trouvé trois autres, dans `OFFERS.zero.bref`, dans
 * `OFFERS.zero.incP` et dans `RES_FAQ[2]`. Les quatre phrases sont déclarées ici,
 * nommément, pour que Mehdi puisse trancher autrement d'un mot.
 *
 * Règle permanente de Mehdi, antérieure et indépendante de la maquette : le
 * tiret cadratin est interdit dans toute copie visible. La ponctuation française
 * équivalente le remplace, SANS QU'UN MOT SOIT TOUCHÉ.
 */
const EXCEPTIONS_CADRATIN = [
  {
    ou: "OFFERS.zero.bref",
    maquette: "sans service maintenance structuré — ou dont l’équipe",
    rendu: "sans service maintenance structuré, ou dont l’équipe",
    pourquoi: "incise simple : virgule",
  },
  {
    ou: "OFFERS.zero.incP et la bande « La règle »",
    maquette: "la disponibilité et le délai — jamais les fournitures",
    rendu: "la disponibilité et le délai, jamais les fournitures",
    pourquoi: "opposition : virgule",
  },
  {
    ou: "gabarit, « Notre sélection » étape 4 (l. 4404)",
    maquette:
      "par domaine — mécanique, électrotechnique, automatisme, hydraulique — notées",
    rendu:
      "par domaine : mécanique, électrotechnique, automatisme, hydraulique, notées",
    pourquoi:
      "énumération en incise : deux-points pour l'ouvrir, virgule pour la refermer",
  },
  {
    ou: "faq-maquette.json, RES_FAQ[2] (Résidence)",
    maquette: "les absences prévues — congés, formation — le remplaçant",
    rendu: "les absences prévues (congés, formation) le remplaçant",
    pourquoi:
      "incise qui contient déjà une virgule : parenthèses, que le remède de " +
      "verifie-interdits nomme aussi comme équivalent français",
  },
];

/* ------------------------------------------------------------ la normalisation */

/** Entités HTML de la maquette et du rendu, résolues. */
function resoudEntites(texte) {
  return texte
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&rsquo;|&#8217;/g, "’")
    .replace(/&amp;|&#38;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&hellip;/g, "…")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&ccedil;/g, "ç")
    .replace(/&x27;|&#x27;/g, "'");
}

/**
 * LA NORMALISATION, et c'est elle qui fait que cette porte ne mesure pas du vent.
 *
 * `&nbsp;` et l'apostrophe typographique sont le piège connu du dépôt : la
 * maquette écrit l'entité, React rend le caractère, et les deux textes sont
 * identiques à l'œil. On ramène donc U+00A0 et U+202F à l'espace, U+2019 et
 * U+2018 à l'apostrophe droite, et on réduit les espaces multiples. La CASSE
 * N'EST PAS touchée : « mêmes majuscules » fait partie de « mot pour mot ».
 */
function normalise(texte) {
  return resoudEntites(texte)
    .replace(/[   ]/g, " ")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[­​]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Les NOEUDS de texte visibles d'un fragment HTML, un par element.
 *
 * POURQUOI PAS UN SEUL BLOC DE TEXTE : en retirant les balises sans rien mettre
 * a leur place, « Constituer mon equipe » et « Le jour et la nuit » se collent en
 * une phrase qui n'existe nulle part, et le controle se met a inventer des
 * ecarts. Chaque balise devient donc une frontiere, et chaque noeud de texte est
 * compare pour lui-meme.
 *
 * LA NAVIGATION EST RETIREE, et c'est delibere : les deux `<nav>` d'une page
 * d'offre sont le fil d'Ariane et le maillage du cocon. Leur texte vient de la
 * BASE (les titres des pages voisines), pas de la maquette, et il est controle
 * par `scripts/verifie-liens.mjs` et `scripts/verifie-seo.mjs`. Les juger ici
 * reviendrait a demander a la maquette de connaitre les 223 titres du site.
 */
/** La frontière de nœud posée à la place d'une liaison. Hors plage visible. */
const FRONTIERE = "\uE000";

function noeuds(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .split(/<[^>]*>|\uE000/)
    .map((n) => normalise(n))
    .filter((n) => n.length > 0);
}

/** Le texte visible : un noeud par ligne, jamais deux phrases recollees. */
function texteVisible(html) {
  return noeuds(html).join("\n");
}

/* --------------------------------------------- la capture figée, référence de B */

/** `/offres/residence/` → `offres--residence`, la convention de `maquette/rendu/`. */
function cleDeCapture(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "--");
}

/**
 * LA BOTTE DE FOIN DU CONTRÔLE B : le texte de la capture figée de CETTE page.
 *
 * POURQUOI LES BALISES DEVIENNENT UNE ESPACE ET NON UNE FRONTIÈRE. Du côté de
 * l'aiguille (le rendu), chaque balise est une frontière, pour ne jamais
 * fabriquer une phrase que personne n'a écrite. Du côté de la botte de foin,
 * c'est l'inverse qu'il faut : la maquette enveloppe la moitié de ses phrases
 * dans des `<span class="sc-interp">`, et une frontière y couperait
 * « Bureau d'études industriel : des études <span>qui tiennent</span> au
 * montage » en trois morceaux introuvables. On tolère donc qu'une phrase
 * chevauche deux éléments voisins de la capture ; c'est une indulgence bornée,
 * et le contrôle positif vérifie qu'elle ne va pas jusqu'à tout accepter.
 *
 * LA NAVIGATION N'EST PAS RETIRÉE ICI, elle l'est côté rendu : une phrase
 * cherchée ne vient donc jamais d'un fil d'Ariane, et sa présence dans celui de
 * la capture ne fait de mal à personne.
 */
const captures = new Map();

/** Le fichier de capture, décisions de copie appliquées. */
function sourceDeLaCapture(url) {
  const chemin = join(RACINE, "maquette", "rendu", `${cleDeCapture(url)}.html`);
  if (!existsSync(chemin)) {
    throw new Error(
      `aucune capture figée pour ${url} : ${chemin} est introuvable. ` +
        "La référence du projet est le rendu de la maquette (CLAUDE.md § 16) ; " +
        "sans elle, le contrôle B n'a rien à quoi comparer. " +
        "Relancez scripts/capture-maquette.mjs plutôt que de laisser cette porte deviner.",
    );
  }
  return appliqueDecisions(readFileSync(chemin, "utf8"));
}

function captureFigee(url) {
  const dejaLue = captures.get(url);
  if (dejaLue) return dejaLue;
  const texte = normalise(
    sourceDeLaCapture(url)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]*>/g, " "),
  );
  captures.set(url, texte);
  return texte;
}

/* ------------------------------------------------- la maquette, relue à chaque fois */

/* Les décisions de copie (lib/decisions-copie.ts) sont appliquées à la
   maquette avant toute comparaison : la donnée les porte déjà, la maquette non. */
const SOURCE = appliqueDecisions(readFileSync(MAQUETTE, "utf8"));

/** Le gabarit `sc-if value="{{ isOfferPage }}"` de la maquette. */
function gabaritOffre() {
  const debut = SOURCE.indexOf('<sc-if value="{{ isOfferPage }}"');
  const fin = SOURCE.indexOf('<sc-if value="{{ isApropos }}"', debut + 1);
  if (debut === -1 || fin <= debut) {
    throw new Error(
      "le gabarit isOfferPage est introuvable dans maquette/site-final.html : " +
        "la maquette a changé de forme, cette porte est à relire",
    );
  }
  return SOURCE.slice(debut, fin);
}

const GABARIT = gabaritOffre();

/**
 * TOUTE la maquette, normalisée, balises et scripts compris : la botte de foin du
 * contrôle B.
 *
 * POURQUOI LA SOURCE BRUTE ET NON SON TEXTE VISIBLE. Les données de la maquette
 * (`OFFERS`, `BA`, `steps`, `RES_FAQ`…) vivent dans un `<script>`, sous forme de
 * chaînes JavaScript. En retirant les scripts, on perdrait justement le texte que
 * le site rend. Les séquences `\uXXXX` y sont donc décodées, et le tout sert de
 * référence : une phrase rendue par le site doit s'y retrouver.
 */
const MAQUETTE_ENTIERE = normalise(
  appliqueDecisions(
    SOURCE.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    ),
  ),
);

/**
 * Retire une région `<sc-if value="{{ condition }}">…</sc-if>`, imbrications
 * comprises. Une expression régulière ne suffit pas : la page d'offre imbrique
 * `sent` / `notSent` à l'intérieur de sections.
 */
function retireRegion(html, condition) {
  const ouverture = `<sc-if value="{{ ${condition} }}"`;
  let sortie = html;
  for (;;) {
    const debut = sortie.indexOf(ouverture);
    if (debut === -1) return sortie;
    let i = sortie.indexOf(">", debut) + 1;
    let profondeur = 1;
    while (profondeur > 0) {
      const prochainOuvrant = sortie.indexOf("<sc-if", i);
      const prochainFermant = sortie.indexOf("</sc-if>", i);
      if (prochainFermant === -1) {
        throw new Error(`région « ${condition} » jamais refermée dans la maquette`);
      }
      if (prochainOuvrant !== -1 && prochainOuvrant < prochainFermant) {
        profondeur += 1;
        i = prochainOuvrant + 6;
      } else {
        profondeur -= 1;
        i = prochainFermant + 8;
      }
    }
    sortie = sortie.slice(0, debut) + sortie.slice(i);
  }
}

/**
 * Les champs `of.dX` que la maquette CALCULE à la ligne 9383 : une tuile de
 * « Un autre besoin ? » passe à `display:none` sur la page de sa propre offre.
 * Ils ne sont pas dans `OFFERS`, ils sont dérivés de la clé de la page.
 */
function affichages(cle) {
  const par = {};
  for (const [suffixe, sienne] of Object.entries({
    SurSite: "sursite",
    Zero: "zero",
    Arret: "arret",
    Chantier: "chantier",
    Etude: "etude",
    Construction: "construction",
  })) {
    par[`d${suffixe}`] = cle === sienne ? "none" : "flex";
  }
  return par;
}

/** Retire les `<a>` dont la maquette met `display:none` pour cette offre. */
function retireTuilesMasquees(html, of) {
  let sortie = html;
  for (const champ of Object.keys(of)) {
    if (!champ.startsWith("d") || of[champ] !== "none") continue;
    const marqueur = `display:{{ of.${champ} }}`;
    const position = sortie.indexOf(marqueur);
    if (position === -1) continue;
    const debut = sortie.lastIndexOf("<a ", position);
    const fin = sortie.indexOf("</a>", position);
    if (debut === -1 || fin === -1) continue;
    sortie = sortie.slice(0, debut) + sortie.slice(fin + 4);
  }
  return sortie;
}

/**
 * Le gabarit tel qu'il se rend pour une offre : régions résolues, liaisons et
 * boucles retirées. Ce qui reste est la copie ÉCRITE EN DUR par le gabarit.
 */
function copieEnDur(cle) {
  let html = GABARIT;
  // L'état « envoyé » du formulaire : il n'est pas dans le HTML servi.
  html = retireRegion(html, "sent");
  // Les quatre sections réservées à Zéro Arrêt.
  if (cle !== "zero") html = retireRegion(html, "of.isZero");
  html = retireTuilesMasquees(html, affichages(cle));
  // Les boucles : leur contenu n'est que des liaisons, résolues par la donnée.
  html = html.replace(/<sc-for[\s\S]*?<\/sc-for>/g, " ");
  /* Les liaisons restantes deviennent une FRONTIÈRE, pas du vide : sans cela
     « Si {{ of.name }} n'est pas la bonne réponse » laisserait « Si n'est pas la
     bonne réponse », une phrase que personne n'a jamais écrite. La frontière
     n'est PAS une balise : une liaison vit souvent dans un attribut
     (`onClick="{{ goOffres }}"`), et y ouvrir une balise ferait fuir le style
     dans le texte. */
  html = html.replace(/\{\{[^}]*\}\}/g, FRONTIERE);
  return texteVisible(html);
}

/* ------------------------------------------------- les phrases attendues */

/** Une unité de texte comparable : assez longue pour que la trouver veuille dire quelque chose. */
const LONGUEUR_MINIMALE = 12;

/**
 * Découpe un texte en unités comparables : un nœud de texte par ligne, puis les
 * fins de phrase à l'intérieur d'un nœud.
 *
 * Le seuil de longueur écarte le bruit (« En bref », « ✓ », « FR +33 ») : le
 * contrôle A couvre ces libellés courts par la donnée, nommément, et le contrôle
 * B ne doit pas se noyer dans des fragments de trois caractères.
 */
function unites(texte) {
  return texte
    .split("\n")
    .flatMap((ligne) => ligne.split(/(?<=[.!?])\s+(?=[«A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ])/))
    .map((u) => u.trim())
    .filter((u) => u.length >= LONGUEUR_MINIMALE);
}

/** Les cadratins substitués : le texte attendu au rendu. */
function attenduAuRendu(texte) {
  let sortie = texte;
  for (const e of EXCEPTIONS_CADRATIN) {
    sortie = sortie.split(e.maquette).join(e.rendu);
  }
  return sortie;
}

/**
 * Tout ce que la page d'une offre DOIT dire, et d'où ça vient.
 *
 * Les trente-trois champs d'`OFFERS` y sont nommés un par un : si la maquette en
 * ajoute un, `extrait-offres-maquette.mjs` le fait sortir en erreur, et si l'un
 * disparaît du rendu, c'est ici qu'on le voit.
 */
function phrasesAttendues(cle) {
  const of = OFFERS[cle];
  const attendues = [];
  const pose = (source, texte) => {
    const valeur = normalise(attenduAuRendu(texte));
    if (valeur.length > 0) attendues.push({ source, texte: valeur });
  };

  /* A1. LES TRENTE-TROIS CHAMPS D'`OFFERS`.
     `name` n'est pas rendu seul : la maquette l'insère dans le chapeau de « Un
     autre besoin ? », contrôlé juste en dessous. */
  for (const [champ, valeur] of Object.entries(of)) {
    if (champ === "name") continue;
    pose(`OFFERS.${cle}.${champ}`, valeur);
  }
  pose(
    `OFFERS.${cle}.name, dans le chapeau de « Un autre besoin ? »`,
    BLOCS.autres.chapeauGabarit.replace("{{ of.name }}", of.name),
  );

  /* A2. LES QUESTIONS FRÉQUENTES, résolues comme la maquette les résout. */
  const questions = FAQ.parOffre[cle] ?? FAQ.defaut;
  const origine = FAQ.parOffre[cle] ? `FAQ_BY.${cle}` : "RES_FAQ (repli)";
  questions.forEach((q, rang) => {
    pose(`${origine}[${rang}].q`, q.question);
    pose(`${origine}[${rang}].a`, q.reponse);
  });

  /* A3. LA COPIE QUE LE GABARIT ÉCRIT EN DUR, extraite de la maquette et non
     retapée : en-têtes, réalisations, tuiles, libellés de bouton. */
  for (const unite of unites(copieEnDur(cle))) {
    pose("gabarit, copie en dur", unite);
  }

  return attendues;
}

/* ------------------------------------------------------------- le rendu réel */

/** La page servie, ou la page construite. On dit laquelle. */
async function rendu(url) {
  const slug = url.replace(/^\/|\/$/g, "");
  try {
    const reponse = await fetch(`${SERVEUR}${url}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (reponse.ok) {
      return { html: await reponse.text(), ou: `${SERVEUR}${url}` };
    }
  } catch {
    // Pas de serveur : on retombe sur la page construite.
  }
  const construite = join(RACINE, ".next", "server", "app", `${slug}.html`);
  if (existsSync(construite)) {
    return { html: readFileSync(construite, "utf8"), ou: `.next/server/app/${slug}.html` };
  }
  throw new Error(
    `aucun rendu de ${url} : ni ${SERVEUR}${url} ni .next/server/app/${slug}.html. ` +
      "Lancez « bun run dev » ou « bun run build » avant cette porte.",
  );
}

/** Le `<main>` de la page : l'en-tête et le pied sont contrôlés ailleurs. */
function corpsDeLaPage(html, url) {
  const debut = html.indexOf("<main");
  const fin = html.lastIndexOf("</main>");
  if (debut === -1 || fin <= debut) {
    throw new Error(`${url} : aucun <main> dans le rendu`);
  }
  return html.slice(debut, fin);
}

/* -------------------------------------------------- POURQUOI PLUS DE CORPUS ICI

   Le contrôle B lisait aussi les `sections` de
   `supabase/import/gabarits-maquette/<page>.json` comme seconde source possible.
   Cette lecture est RETIRÉE le 10/10, et ce n'est pas un relâchement, c'est le
   contraire : le corpus EST servi par la maquette (CLAUDE.md § 16, « la maquette
   consomme le corpus »), donc tout ce qu'il contient légitimement se retrouve
   déjà dans la capture figée. Le garder comme échappatoire laissait passer les
   phrases que le corpus porte MAIS QUE LA MAQUETTE NE REND PAS : exactement les
   divergences que cette porte doit nommer. La capture est la seule référence.
*/

/* --------------------------------------------------------------- le contrôle */

/**
 * Les textes du site qui ne sont ni de la maquette ni du corpus, et qui sont
 * ASSUMÉS. Chacun avec sa raison. La liste est courte, et elle doit le rester.
 */
const AJOUTS_ASSUMES = [
  {
    quoi: "Données traitées par Migen pour répondre à votre demande",
    pourquoi:
      "information au point de collecte, exigée par les articles 13 et 14 du RGPD. " +
      "La maquette ne l'écrit pas ; une page qui collecte des données ne peut pas s'en passer",
  },
  {
    quoi: "politique de confidentialité",
    pourquoi: "même raison : le lien obligatoire de la mention RGPD",
  },
  {
    quoi: "Droits et durées de conservation",
    pourquoi: "même raison",
  },
  {
    quoi: "Site web",
    pourquoi:
      "libellé du champ piège anti-robot, hors du cadre visible et masqué aux " +
      "technologies d'assistance",
  },
  {
    quoi: "(facultatif)",
    pourquoi:
      "la maquette marque les champs obligatoires d'une astérisque mais ne dit " +
      "rien des autres : un visiteur au lecteur d'écran a besoin de l'entendre",
  },
  {
    quoi: "Aller au contenu",
    pourquoi: "lien d'évitement, critère 2.4.1 de la WCAG",
  },
  {
    quoi: "Fil d'Ariane",
    pourquoi: "nom accessible de la navigation secondaire",
  },
  {
    quoi: "Pages liées",
    pourquoi: "maillage interne du cocon, hors gabarit de la maquette",
  },
];

/**
 * LES SUBSTITUTIONS DÉJÀ ARBITRÉES AILLEURS, et qui ne sont pas du ressort de
 * cette porte.
 *
 * `components/site/accueil/` a été porté avant ce chantier, sous un contrat qui
 * refusait les délais chiffrés (`docs/CONTRAT-PORTAGE-MAQUETTE.md`). Deux
 * libellés de « Notre méthode » y remplacent ceux de la maquette. La décision du
 * 05/10 (« la maquette au mot pour mot ») les remet en question, mais ces
 * fichiers servent AUSSI la page d'accueil et ses propres portes : la décision
 * revient à Mehdi, et elle est inscrite dans `docs/RESERVES-CONTENU.md`.
 *
 * CHAQUE DÉCLARATION EST VÉRIFIÉE CONTRE LA MAQUETTE : si la phrase qu'elle dit
 * remplacer n'y est plus, la porte échoue. Une déclaration ne peut donc pas
 * pourrir en silence.
 */
const SUBSTITUTIONS_ARBITREES = [
  {
    rendu: "Au premier contact",
    maquette: "2 à 5 jours",
    ou: "« Notre méthode », étape 01 (components/site/accueil/methode-etapes-donnees.ts)",
    pourquoi:
      "aucun délai chiffré n'était autorisé au portage de l'accueil ; à rouvrir " +
      "depuis la décision du 05/10",
  },
  {
    rendu: "Avant l’arrivée sur site",
    maquette: "1 à 2 semaines",
    ou: "« Notre méthode », étape 02 (components/site/accueil/methode-etapes-donnees.ts)",
    pourquoi: "même raison",
  },
];

/**
 * LES EN-TÊTES DES BLOCS DU CORPUS, que la maquette ne dessine pas.
 *
 * Les sections rédigées du corpus (`probleme`, `offre`, `deroule`, `garanties`,
 * `cta`) se rendent après les treize sections de la maquette, dans les motifs de
 * `components/site/blocs/`. Ces blocs servent une centaine de pages du gabarit de
 * vente et portent leurs propres en-têtes : la maquette n'en a pas d'équivalent,
 * puisqu'elle ne dessine pas ces sections.
 */
const ENTETES_DE_BLOCS = [
  {
    quoi: "Ce que ça change pour vous",
    pourquoi:
      "en-tête de colonne de components/site/blocs/Offre.tsx, le tableau " +
      "prestation / bénéfice du corpus",
  },
  {
    quoi: "Ce que nous faisons",
    pourquoi: "l'autre colonne du même tableau",
  },
  {
    quoi: "Ce que nous garantissons.",
    pourquoi: "titre par défaut de components/site/blocs/Garanties.tsx",
  },
];

/* ------------------------------------------------------ les deux contrôles */

/** A. Les phrases de la maquette que le rendu ne dit pas. */
function ecartsCompletude(url, texte, attendues) {
  const ecarts = [];
  for (const { source, texte: attendu } of attendues) {
    if (!texte.includes(attendu)) {
      ecarts.push(
        `${url} : la maquette écrit « ${attendu} » (${source}), le rendu ne le dit pas`,
      );
    }
  }
  return ecarts;
}

/**
 * B. Les phrases du rendu qui ne sont pas dans la capture figée de leur page.
 *
 * L'ORDRE DES ÉCHAPPATOIRES COMPTE. La capture d'abord, parce qu'elle est la
 * référence. Puis les phrases que le contrôle A EXIGE : « Si Zéro arrêt n'est pas
 * la bonne réponse… » n'existe littéralement nulle part, la maquette écrivant
 * « Si {{ of.name }} n'est pas… ». Puis les trois listes déclarées, chacune avec
 * sa raison, chacune vérifiée encore utile plus bas.
 */
function ecartsInvention(url, texte, attendues) {
  const capture = captureFigee(url);
  const ecarts = [];
  for (const unite of unites(texte)) {
    /* LES CHEVRONS SONT POSÉS PAR LE COMPOSANT, pas écrits dans la donnée : la
       maquette stocke « On rappelait le même prestataire… » sans guillemets et
       les ajoute au rendu. On cherche donc la phrase avec et sans. */
    const nu = unite
      .replace(/^[«»"' ]+/, "")
      .replace(/[«»"' ]+$/, "")
      // La flèche de fin est posée par le composant, comme les chevrons.
      .replace(/\s*→$/, "");
    if (capture.includes(unite) || capture.includes(nu)) continue;
    if (attendues.some((x) => x.texte.includes(unite) || x.texte.includes(nu))) continue;
    if (AJOUTS_ASSUMES.some((a) => unite.includes(normalise(a.quoi)))) continue;
    if (ENTETES_DE_BLOCS.some((e) => unite === normalise(e.quoi))) continue;
    if (SUBSTITUTIONS_ARBITREES.some((x) => unite === normalise(x.rendu))) continue;
    if (EXCEPTIONS_CADRATIN.some((e) => unite.includes(normalise(e.rendu)))) continue;
    ecarts.push(
      `${url} : le rendu dit « ${unite} », absent de la capture figée ` +
        `maquette/rendu/${cleDeCapture(url)}.html`,
    );
  }
  return ecarts;
}

/* --------------------------------------------------- le contrôle positif */

/**
 * LA PREUVE QUE CETTE PORTE SAIT ÉCHOUER, exigée par la règle du dépôt et payée
 * par deux portes qui ont menti le 09/10.
 *
 * TROIS SONDES PAR PAGE MESURABLE, et chacune a sa réciproque :
 *
 *   1. une phrase que personne n'a écrite, injectée dans le rendu : le contrôle B
 *      DOIT la nommer. Sinon il ne sert à rien.
 *   2. une phrase prise dans la capture figée de la page, absente du rendu
 *      actuel, injectée elle aussi : le contrôle B NE DOIT PAS la nommer. Sinon
 *      il crie sur sa propre référence, le défaut du 09/10.
 *   3. une phrase de la maquette actuellement rendue, effacée du rendu : le
 *      contrôle A DOIT la nommer. Sinon la complétude ne mesure rien.
 *
 * LA PHRASE INVENTÉE NE RESSEMBLE À RIEN DU SITE, volontairement : une phrase
 * plausible risquerait d'être présente quelque part et la sonde conclurait à tort.
 */
const PHRASE_INVENTEE =
  "Migen expédie vos roulements par ballon dirigeable chaque dimanche de pleine lune.";

async function controlePositif() {
  const echecs = [];
  let sondes = 0;

  for (const [cle, url] of Object.entries(PAGES)) {
    if (DETOURNEES.has(url)) continue;
    const { html } = await rendu(url);
    const corps = corpsDeLaPage(html, url);
    const texte = texteVisible(corps);
    const attendues = phrasesAttendues(cle);
    const reference = ecartsInvention(url, texte, attendues).length;

    /* 1. L'invention doit tomber. */
    sondes += 1;
    const avecInvention = ecartsInvention(
      url,
      `${texte}\n${PHRASE_INVENTEE}`,
      attendues,
    );
    if (avecInvention.length !== reference + 1) {
      echecs.push(
        `${url} : une phrase inventée injectée dans le rendu n'a PAS fait tomber le ` +
          `contrôle B (${reference} écart(s) avant, ${avecInvention.length} après). ` +
          "La porte ne sait plus échouer.",
      );
    } else {
      console.log(`  ✓ ${url.padEnd(26)} B nomme la phrase inventée`);
    }

    /* 2. Une phrase de la capture ne doit pas tomber. */
    /* UNE VRAIE PHRASE DE LA CAPTURE, pas un morceau recollé : elle est prise
       dans UN SEUL nœud de texte de la capture, commence par une majuscule et
       finit par un point. Prise dans la botte de foin aplatie, elle pourrait
       chevaucher deux éléments et la sonde ne contrôlerait plus que l'indulgence
       de l'aplatissement, au lieu de la reconnaissance d'une phrase écrite. */
    const candidates = unites(texteVisible(sourceDeLaCapture(url)))
      .filter(
        (u) => u.length >= 40 && /^[«A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ].*[.!?]$/.test(u) && !texte.includes(u),
      )
      .sort((a, b) => b.length - a.length);
    if (candidates.length === 0) {
      echecs.push(
        `${url} : aucune phrase de la capture absente du rendu, la sonde 2 ne peut ` +
          "pas être posée. Choisissez-en une à la main plutôt que de la sauter.",
      );
    } else {
      sondes += 1;
      const deLaCapture = candidates[0];
      const avecCapture = ecartsInvention(url, `${texte}\n${deLaCapture}`, attendues);
      if (avecCapture.length !== reference) {
        echecs.push(
          `${url} : une phrase PRISE DANS LA CAPTURE a fait tomber le contrôle B ` +
            `(${reference} écart(s) avant, ${avecCapture.length} après) : ` +
            `« ${deLaCapture.slice(0, 90)} ». La porte crie sur sa propre référence.`,
        );
      } else {
        console.log(
          `  ✓ ${url.padEnd(26)} B accepte « ${deLaCapture.slice(0, 48)}… » de la capture`,
        );
      }
    }

    /* 3. Une phrase de la maquette effacée doit tomber, côté complétude. */
    const presentes = attendues
      .filter((x) => texte.includes(x.texte) && x.texte.length >= 20)
      .sort((a, b) => b.texte.length - a.texte.length);
    if (presentes.length === 0) {
      echecs.push(
        `${url} : aucune phrase attendue n'est présente dans le rendu, la sonde 3 ` +
          "ne peut pas être posée.",
      );
    } else {
      sondes += 1;
      const effacee = presentes[0];
      const avant = ecartsCompletude(url, texte, attendues).length;
      const apres = ecartsCompletude(url, texte.split(effacee.texte).join(" "), attendues);
      if (apres.length <= avant) {
        echecs.push(
          `${url} : une phrase de la maquette effacée du rendu n'a PAS fait tomber le ` +
            `contrôle A (${avant} écart(s) avant, ${apres.length} après) : ` +
            `« ${effacee.texte.slice(0, 90)} ».`,
        );
      } else {
        console.log(
          `  ✓ ${url.padEnd(26)} A nomme « ${effacee.texte.slice(0, 48)}… » quand on l'efface`,
        );
      }
    }
  }

  if (echecs.length > 0) {
    console.error("");
    for (const e of echecs) console.error(`  ✗ ${e}`);
    console.error(`\n${echecs.length} sonde(s) en échec sur ${sondes} : la porte ne prouve rien.`);
    process.exit(1);
  }
  console.log(
    `\n${sondes} sondes posées, toutes concluantes : la porte nomme le défaut qu'elle ` +
      "cherche et se tait devant sa référence.",
  );
  process.exit(0);
}

if (process.argv.includes("--controle")) await controlePositif();

/* ------------------------------------------------------------ la mesure */

const defauts = [];
const verbeux = process.argv.includes("--rendu");
let totalAttendues = 0;
let totalRendues = 0;

const ecartees = [];
for (const [cle, url] of Object.entries(PAGES)) {
  /* Une adresse détournée par le routeur de la maquette n'a pas de référence
     mesurable : la comparer reviendrait à la comparer à une autre page. Voir
     l'en-tête de `DETOURNEES`. Sa seule référence valable est sa capture
     figée, `maquette/rendu/<cle>.html`. */
  if (DETOURNEES.has(url)) {
    ecartees.push(`${url} (détournée vers ${DETOURNEES.get(url)})`);
    continue;
  }
  const { html, ou } = await rendu(url);
  const corps = corpsDeLaPage(html, url);
  const texte = texteVisible(corps);

  /* ---- A. COMPLÉTUDE : chaque phrase de la maquette est-elle rendue ? ---- */
  const attendues = phrasesAttendues(cle);
  totalAttendues += attendues.length;
  const manquantes = ecartsCompletude(url, texte, attendues);
  defauts.push(...manquantes);

  /* ---- B. AUCUNE INVENTION : chaque phrase du rendu est-elle dans la capture ? -- */
  const rendues = unites(texte);
  totalRendues += rendues.length;
  const orphelines = ecartsInvention(url, texte, attendues);
  defauts.push(...orphelines);

  console.log(
    `${url.padEnd(28)} ${cle.padEnd(13)} ${String(attendues.length).padStart(3)} phrases de maquette ` +
      `(${manquantes.length} absente(s)), ${String(rendues.length).padStart(3)} phrases rendues ` +
      `(${orphelines.length} hors capture) · ${ou}`,
  );
  if (verbeux) {
    for (const { source, texte: attendu } of attendues) {
      console.log(`    ${texte.includes(attendu) ? "·" : "✗"} ${source} : ${attendu.slice(0, 90)}`);
    }
  }
}

/* ---- LES EXCEPTIONS : chacune doit encore servir, sinon la porte échoue ---- */

for (const e of EXCEPTIONS_CADRATIN) {
  const dansLaMaquette = normalise(e.maquette);
  if (!MAQUETTE_ENTIERE.includes(dansLaMaquette)) {
    defauts.push(
      `exception inutile : « ${e.maquette} » (${e.ou}) n'est plus dans la maquette. ` +
        "Retirez-la d'EXCEPTIONS_CADRATIN, ne la laissez pas grossir la liste.",
    );
  }
}

for (const x of SUBSTITUTIONS_ARBITREES) {
  if (!MAQUETTE_ENTIERE.includes(normalise(x.maquette))) {
    defauts.push(
      `déclaration périmée : « ${x.maquette} » (${x.ou}) n'est plus dans la maquette. ` +
        "La substitution n'a plus d'objet : retirez-la de SUBSTITUTIONS_ARBITREES.",
    );
  }
}

/* Le tiret cadratin ne doit apparaître dans AUCUN des six rendus. */
for (const [, url] of Object.entries(PAGES)) {
  if (DETOURNEES.has(url)) continue;
  const { html } = await rendu(url);
  const texte = texteVisible(corpsDeLaPage(html, url));
  if (texte.includes("—")) {
    const autour = texte.slice(Math.max(0, texte.indexOf("—") - 60), texte.indexOf("—") + 60);
    defauts.push(
      `${url} : tiret cadratin rendu, interdit dans toute copie visible : « …${autour}… »`,
    );
  }
}

if (defauts.length > 0) {
  console.error("");
  for (const d of defauts) console.error(`  ✗ ${d}`);
  console.error(
    `\n${defauts.length} écart(s) entre la maquette et le rendu de la page d'offre.`,
  );
  process.exit(1);
}

if (ecartees.length > 0) {
  console.log(
    `\n${ecartees.length} adresse(s) écartée(s), détournées par le routeur de la maquette et donc` +
      ` sans capture figée, donc sans référence mesurable :\n  ${ecartees.join("\n  ")}` +
      `\n  Le routeur de la maquette les envoie ailleurs ; c'est la page de destination` +
      `\n  qui porte leur texte, et c'est elle qu'il faut mesurer.`,
  );
}

console.log(
  `\npage d'offre conforme au mot : ${Object.keys(PAGES).length - ecartees.length} offres mesurées, ` +
    `${totalAttendues} phrases de maquette toutes rendues, ` +
    `${totalRendues} phrases rendues toutes présentes dans leur capture figée, ` +
    `${EXCEPTIONS_CADRATIN.length} phrases à tiret cadratin substituées et déclarées, ` +
    `${AJOUTS_ASSUMES.length} ajouts assumés, ` +
    `${ENTETES_DE_BLOCS.length} en-têtes de blocs du corpus, ` +
    `${SUBSTITUTIONS_ARBITREES.length} substitutions arbitrées ailleurs.`,
);
