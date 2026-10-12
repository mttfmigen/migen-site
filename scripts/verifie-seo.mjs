#!/usr/bin/env node
/**
 * LES MÉTADONNÉES DES PAGES SERVIES TIENNENT-ELLES LES RÈGLES DU PROJET ?
 *
 *   node scripts/verifie-seo.mjs
 *   node scripts/verifie-seo.mjs --controle      preuve qu'elle sait échouer
 *   SITE_URL=https://migen-site.vercel.app node scripts/verifie-seo.mjs
 *
 * ELLE A DEUX ÉTAGES, et le premier est le seul qui dise la vérité au visiteur.
 *
 *   ÉTAGE 1, LE HTML SERVI. Chaque adresse du site est demandée au serveur, et
 *   c'est son `<head>` qui est jugé : exactement les octets que reçoivent le
 *   visiteur et le robot. Une métadonnée absente ne peut plus se cacher derrière
 *   « la base est bien remplie ».
 *
 *   ÉTAGE 2, LA BASE. Deux règles ne s'écrivent pas dans le HTML et ne peuvent
 *   donc être lues qu'en base : le mot clé principal d'une page, et l'état des
 *   brouillons qui seront publiés demain.
 *
 * POURQUOI L'ÉTAGE 1 A ÉTÉ AJOUTÉ (balayage du 12/10). La porte ne lisait que la
 * base, et ce n'était pas une nuance : elle jugeait 145 des 259 adresses
 * servies. Les 114 autres lui étaient invisibles, pour deux raisons distinctes.
 *   · 13 écrans vivent dans le code, sans ligne `pages` : l'accueil, le contact,
 *     les valeurs, la RSE, les partenaires, « nous connaître », le plan du site,
 *     les mentions légales, la confidentialité, les marques, l'équipe, la
 *     carrière, le test technicien. Leurs métadonnées sont écrites dans
 *     `app/**`, et aucun contrôle ne les regardait.
 *   · ~100 adresses de l'index de la maquette n'ont pas (encore) de ligne
 *     publiée, et étaient donc hors du jugement bien qu'elles répondent 200.
 * TROIS PAGES SERVIES SANS AUCUNE META DESCRIPTION ont survécu là : l'accueil,
 * `/partenaires/` et `/nous-connaitre/`. L'accueil. Sans description.
 *
 * LES RÈGLES, et pourquoi chacune est là :
 *   · un titre présent, non vide, de longueur utilisable.
 *   · le titre n'est JAMAIS identique au h1. Règle explicite du projet. Deux
 *     formulations valent deux occasions d'être trouvé ; la même deux fois en
 *     gâche une. 47 pages l'enfreignaient, toutes avec un titre fabriqué en
 *     collant « | Migen » derrière le h1.
 *   · un titre unique par page. Deux pages au même titre se cannibalisent dans
 *     la SERP, et le cocon perd la hiérarchie qu'il est censé exprimer.
 *   · une description présente et de longueur utilisable.
 *   · une canonique qui désigne LA PAGE ELLE-MÊME. Une canonique qui pointe
 *     ailleurs retire la page de l'index au profit d'une autre, sans rien
 *     afficher de différent : c'est le défaut le plus silencieux de la liste.
 *   · `og:title`, `og:description` et `og:url` posées. Sans elles, un partage
 *     affiche l'URL nue. Seule `og:url` doit ÉGALER la canonique : les deux
 *     autres ont le droit de différer du couple de la SERP, une carte de
 *     partage se lisant autrement qu'un résultat de recherche.
 *   · aucun reste de Markdown ni de tiret cadratin dans une métadonnée.
 *   · un mot clé principal par page (étage 2), pour que la page sache ce
 *     qu'elle vise.
 *
 * CE QUI N'EST PAS JUGÉ ICI : la qualité de la formulation, et sa véracité. Une
 * description peut être présente, bien dimensionnée, et annoncer « dix domaines »
 * sur une page qui en montre huit. Aucune mesure automatique ne sait le dire.
 * La porte mesure ce qui est mesurable, sur TOUTES les adresses servies.
 *
 * CE QU'ELLE A TROUVÉ AU PREMIER PASSAGE COMPLET, le 12/10, et pourquoi elle
 * reste ROUGE : 83 défauts sur 259 adresses, en quatre familles. Aucun n'est
 * dans le code du site, et c'est pour cela qu'ils ont survécu.
 *   · 43 titres recopiés du h1 avec « | Migen » collé derrière. Le même défaut
 *     que les 47 corrigés en base ; ceux-ci viennent du CORPUS, qui les écrit
 *     lui-même (`> Title SEO : Mtbf | Migen` sous `# Mtbf`), et le relais
 *     disque les reproduit fidèlement. Toute la branche /carriere/ et presque
 *     toute la branche /ressources/.
 *   · 33 descriptions de 180 à 259 caractères, presque toutes des pages ville,
 *     écrites ainsi dans le corpus. Un résultat de recherche en coupe la fin.
 *   · 6 titres hors longueur, dont « Mtbf | Migen » (12 caractères) et
 *     « Amdec | Migen » (13) d'un côté, 81 caractères pour /preuves/savoye/ de
 *     l'autre.
 *   · 1 page dont le SEO ne vient pas du corpus, `/expertises/` (voir
 *     `seoHorsCorpus` plus bas : son titre annonce « 9 domaines », sa
 *     description « dix domaines », et sa capture écrit « huit » sept fois).
 * Ces trois premières familles sont de la COPIE, et la copie appartient à
 * Mehdi : la porte les nomme, elle ne les réécrit pas. Elles se corrigent dans
 * `maquette/contenu/site/**` et dans `supabase/import/gabarits-maquette/`,
 * puis la porte redevient verte d'elle-même.
 *
 * Et ce qu'elle a fait VERDIR le 12/10, mesuré avant et après sur le HTML
 * servi : les trois pages sans description (l'accueil, `/partenaires/`,
 * `/nous-connaitre/`), et les deux pages sans aucune balise openGraph
 * (`/mentions-legales/`, `/plan-du-site/`, réglées en parallèle par le chantier
 * de la vignette de partage).
 *
 * PRÉALABLE : le site en développement sur http://localhost:4340/, ou SITE_URL
 * vers un déploiement.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const CONTROLE = process.argv.includes("--controle");
const SITE = (process.env.SITE_URL ?? "http://localhost:4340").replace(/\/+$/, "");
const LOT = Number(process.env.LOT ?? 8);

const LONGUEUR_TITRE = [20, 75];
const LONGUEUR_DESCRIPTION = [60, 175];

/* ------------------------------------------------------------------ outils */

/* Les variables sont lues dans `.env.local`, jamais écrites ici. Seule la clé
   ANONYME est utilisée pour l'étage 2 : ce contrôle n'a aucun besoin d'écrire,
   et la clé de service n'a rien à faire dans un script lancé à la main. */
function environnement() {
  const brut = readFileSync(`${RACINE}.env.local`, "utf8");
  const valeurs = {};
  for (const ligne of brut.split("\n")) {
    const trouve = ligne.match(/^([A-Z_]+)=(.*)$/);
    if (trouve) valeurs[trouve[1]] = trouve[2].trim().replace(/^["']|["']$/g, "");
  }
  return valeurs;
}

/**
 * Texte comparable : insécables, apostrophes typographiques, entités, espaces.
 *
 * Sans cette normalisation, « 10&nbsp;% » et « 10 % » sont deux chaînes
 * différentes, et la porte signale un écart là où le visiteur voit la même
 * phrase. Piège déjà payé ailleurs dans ce dépôt.
 */
export function normalise(texte) {
  return (texte ?? "")
    .replace(/&(#x27|#39|rsquo|apos);/g, "'")
    .replace(/&(nbsp|#160|#xa0);/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[   ]/g, " ")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Le titre sans son suffixe de marque : « Foo | Migen » et « Foo » sont un. */
const nu = (texte) => normalise(texte).replace(/\s*\|.*$/, "").toLowerCase();

/* ----------------------------------------------- l'étage 1 : le HTML servi */

/**
 * Les métadonnées d'un document servi, telles qu'elles sont servies.
 *
 * NE PAS DÉCOUPER SUR `</head>`, et c'est une erreur déjà commise ici même, le
 * 12/10 : la première version de ce contrôle ne lisait que ce qui précède la
 * balise de fermeture, et annonçait « aucun titre, aucune canonique, aucune
 * description » sur cinq pages qui les servent toutes les trois. Mesuré sur
 * l'accueil : `</head>` est à l'octet 3144, le `<title>` à l'octet 232989.
 * Next 16 et React 19 émettent les métadonnées PLUS LOIN DANS LE FLUX, dans le
 * corps, et c'est le navigateur qui les remonte dans l'en-tête. Un robot fait
 * de même. Le document entier est donc lu, et il ne porte qu'un seul `<title>`
 * (vérifié sur cinq gabarits avant d'écrire cette ligne).
 *
 * Le piège est exactement celui que le projet connaît déjà sous un autre nom :
 * ne pas mesurer avant que ce qu'on mesure soit en place.
 */
export function metadonneesDuHtml(html) {
  const un = (re) => {
    const trouve = html.match(re);
    return trouve ? trouve[1] : null;
  };
  const titreH1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  return {
    titre: un(/<title>([^<]*)<\/title>/),
    description: un(/<meta name="description" content="([^"]*)"/),
    canonique: un(/<link rel="canonical" href="([^"]*)"/),
    ogTitre: un(/<meta property="og:title" content="([^"]*)"/),
    ogDescription: un(/<meta property="og:description" content="([^"]*)"/),
    ogUrl: un(/<meta property="og:url" content="([^"]*)"/),
    robots: un(/<meta name="robots" content="([^"]*)"/),
    h1: titreH1 ? titreH1[1].replace(/<[^>]+>/g, "") : null,
  };
}

/**
 * Les motifs de refus d'UNE page servie. Tableau vide : la page passe.
 *
 * Fonction PURE, et c'est ce qui rend `--controle` possible : les témoins lui
 * passent des `<head>` fabriqués, sans serveur ni réseau.
 */
export function motifsDeRefus({ chemin, html, origine, titresDejaVus = new Map() }) {
  const m = metadonneesDuHtml(html);
  const motifs = [];
  /* Chaque motif porte sa FAMILLE : c'est elle qui permet d'imprimer un
     décompte lisible au lieu de quatre-vingts lignes à plat. Une porte rouge
     dont on ne sait pas à quoi elle est rouge ne sert à rien. */
  const refuse = (famille, detail) => motifs.push({ famille, detail });
  const attendue = `${origine}${chemin}`;
  const noindex = /noindex/i.test(m.robots ?? "");

  // La canonique est jugée sur TOUTE page, noindex comprise : une canonique qui
  // pointe ailleurs est un défaut en soi, pas une conséquence de l'indexation.
  if (!m.canonique) refuse("canonique absente", "aucune balise canonique");
  else if (m.canonique !== attendue) {
    refuse("canonique ailleurs", `elle désigne ${m.canonique}, pas la page (${attendue})`);
  }

  if (!normalise(m.titre)) {
    refuse("titre absent", "aucun titre, ou titre vide");
  } else {
    const titre = normalise(m.titre);
    if (titre.length < LONGUEUR_TITRE[0] || titre.length > LONGUEUR_TITRE[1]) {
      refuse(
        "titre hors longueur",
        `${titre.length} caractères, attendu entre ${LONGUEUR_TITRE.join(" et ")} (« ${titre.slice(0, 60)} »)`,
      );
    }
    if (m.h1 && nu(titre) === nu(m.h1)) {
      refuse(
        "titre recopié du h1",
        `« ${normalise(m.h1).slice(0, 70)} » : le titre se lit dans la SERP, le h1 sur la page, ` +
          "deux formulations valent deux occasions d'être trouvé",
      );
    }
    const deja = titresDejaVus.get(nu(titre));
    if (deja && deja !== chemin) refuse("titre dupliqué", `même titre que ${deja}`);
  }

  // Une page exclue de l'index n'a pas de description à défendre dans la SERP :
  // la règle n'y a pas de sens. L'exception est portée par la balise robots
  // servie, pas par une liste de chemins qui dériverait.
  if (!noindex) {
    if (!normalise(m.description)) {
      refuse("description absente", "aucune meta description");
    } else {
      const d = normalise(m.description);
      if (d.length < LONGUEUR_DESCRIPTION[0] || d.length > LONGUEUR_DESCRIPTION[1]) {
        refuse(
          "description hors longueur",
          `${d.length} caractères, attendu entre ${LONGUEUR_DESCRIPTION.join(" et ")}`,
        );
      }
    }
    if (!m.ogTitre || !m.ogDescription || !m.ogUrl) {
      const absents = [
        !m.ogTitre && "og:title",
        !m.ogDescription && "og:description",
        !m.ogUrl && "og:url",
      ].filter(Boolean);
      refuse("openGraph incomplet", `${absents.join(", ")} : un partage affiche l'URL nue`);
    } else if (m.ogUrl !== m.canonique) {
      /* SEUL `og:url` est comparé, et c'est délibéré. Un `og:url` qui ne
         désigne pas la page donne DEUX identités à une même adresse : les
         partages s'agrègent sur l'une, le robot indexe l'autre. C'est un
         défaut, pas une préférence.
         `og:title` et `og:description`, eux, ont le DROIT de différer du
         couple servi dans la SERP : une carte de partage se lit autrement
         qu'un résultat de recherche. Mesuré le 12/10 : `/rse/` écrit
         volontairement une description de partage plus courte que sa meta
         description, et c'est bien rédigé. Les exiger identiques faisait
         tomber la porte sur un choix d'auteur, donc sur un faux défaut, ce
         que ce dépôt a déjà payé plusieurs fois. */
      refuse("og:url désaccordé", `${m.ogUrl} au lieu de la canonique ${m.canonique}`);
    }
  }

  for (const [nom, valeur] of [["titre", m.titre], ["description", m.description]]) {
    const v = valeur ?? "";
    if (/\*\*|\[[^\]]+\]\([^)]+\)|^#{1,6}\s/.test(v)) {
      refuse("Markdown dans la métadonnée", `${nom} : ${v.slice(0, 60)}`);
    }
    if (v.includes("—")) refuse("tiret cadratin", `dans le ${nom}, interdit par le contrat`);
  }

  return motifs;
}

/* ----------------------------------------------------- les témoins d'échec */

/**
 * `--controle` : la porte prouve qu'elle sait échouer, et aussi qu'elle sait
 * accepter. Un contrôle qui refuse tout ne vaut pas mieux qu'un contrôle qui
 * accepte tout : les deux colonnes sont donc exigées.
 */
function controlePositif() {
  const ORIGINE = "https://migen.fr";
  /* Les trois caractères des témoins sont écrits en point de code, jamais en
     clair : `scripts/verifie-interdits.mjs` lit la SOURCE des fichiers et ne
     distingue pas un témoin d'une copie rendue. Un tiret cadratin littéral ici
     ferait tomber cette autre porte. Même forme que les motifs entre crochets
     de `lib/decisions-copie.ts`, et pour la même raison. */
  const CADRATIN = "\u2014";
  const INSECABLE = "\u00a0";
  const COURBE = "\u2019";
  const TITRE = "Maintenance industrielle Migen, techniciens sur site";
  const DESC =
    "Nous mobilisons des techniciens dont 10 % seulement reussissent notre process, sur vos sites, en continu ou en intervention ciblee.";
  const tete = (o = {}) => {
    const t = o.titre === null ? "" : `<title>${o.titre ?? TITRE}</title>`;
    const d = o.description === null ? "" : `<meta name="description" content="${o.description ?? DESC}">`;
    const c = o.canonique === null ? "" : `<link rel="canonical" href="${o.canonique ?? `${ORIGINE}/`}">`;
    const og =
      o.og === null
        ? ""
        : `<meta property="og:title" content="${o.ogTitre ?? o.titre ?? TITRE}">` +
          `<meta property="og:description" content="${o.ogDescription ?? o.description ?? DESC}">` +
          `<meta property="og:url" content="${o.ogUrl ?? o.canonique ?? `${ORIGINE}/`}">`;
    const r = o.robots ? `<meta name="robots" content="${o.robots}">` : "";
    return `<head>${t}${d}${c}${og}${r}</head><body><h1>${o.h1 ?? "La maintenance industrielle, sans rupture de production."}</h1></body>`;
  };

  /**
   * Chaque témoin déclare la FAMILLE de refus attendue, pas seulement « doit
   * tomber ». Un témoin qui tombe pour la mauvaise raison est un faux positif
   * qui passerait inaperçu : c'est déjà arrivé dans ce dépôt, où un oracle
   * comptait un champ piège posé à -9999 px et se croyait juste.
   * `null` : la page doit être ACCEPTÉE.
   */
  const TEMOINS = [
    ["page complète, conforme", {}, null],
    ["aucun titre", { titre: null }, "titre absent"],
    ["titre vide", { titre: "   " }, "titre absent"],
    ["titre trop court", { titre: "Migen" }, "titre hors longueur"],
    ["titre trop long", { titre: `Maintenance industrielle ${"et travaux ".repeat(8)}` }, "titre hors longueur"],
    ["aucune meta description", { description: null }, "description absente"],
    ["description vide", { description: "  " }, "description absente"],
    ["description trop courte", { description: "Maintenance." }, "description hors longueur"],
    ["description trop longue", { description: `Maintenance industrielle. ${"tres longue ".repeat(20)}` }, "description hors longueur"],
    ["titre identique au h1", { titre: "La maintenance industrielle, sans rupture de production." }, "titre recopié du h1"],
    ["titre = h1 + « | Migen »", { titre: "La maintenance industrielle, sans rupture de production. | Migen" }, "titre recopié du h1"],
    ["aucune canonique", { canonique: null }, "canonique absente"],
    ["canonique vers une autre page", { canonique: "https://migen.fr/offres/" }, "canonique ailleurs"],
    ["canonique sans slash final", { canonique: "https://migen.fr" }, "canonique ailleurs"],
    ["openGraph absent", { og: null }, "openGraph incomplet"],
    ["og:title plus court, toléré", { ogTitre: "Migen, maintenance industrielle" }, null],
    ["og:description plus courte, tolérée", { ogDescription: "Des techniciens de maintenance sur votre site." }, null],
    ["og:url désaccordé", { ogUrl: "https://migen.fr/autre/" }, "og:url désaccordé"],
    ["Markdown gras dans le titre", { titre: "**Maintenance industrielle** chez Migen" }, "Markdown dans la métadonnée"],
    ["lien Markdown dans la description", { description: `Voir [nos offres](/offres/) et le reste. ${"x".repeat(40)} fin.` }, "Markdown dans la métadonnée"],
    ["tiret cadratin dans le titre", { titre: `Maintenance industrielle ${CADRATIN} Migen techniciens` }, "tiret cadratin"],
    ["insécable et apostrophe courbe, tolérées", { description: DESC.replace(/ /g, INSECABLE).replace("process", `l${COURBE}acces`) }, null],
    ["noindex sans description, toléré", { description: null, og: null, robots: "noindex, follow" }, null],
    ["noindex mais canonique fausse, refusé", { canonique: "https://migen.fr/ailleurs/", robots: "noindex, follow" }, "canonique ailleurs"],
    ["og:title et og:description vides", { ogTitre: "", ogDescription: "" }, "openGraph incomplet"],
  ];

  let bons = 0;
  for (const [nom, options, familleAttendue] of TEMOINS) {
    const motifs = motifsDeRefus({ chemin: "/", html: tete(options), origine: ORIGINE });
    const familles = motifs.map((m) => m.famille);
    const juste = familleAttendue ? familles.includes(familleAttendue) : motifs.length === 0;
    if (juste) bons++;
    const dit = motifs.length === 0 ? "accepté" : `refusé : ${familles.join(", ").slice(0, 58)}`;
    console.log(`  ${juste ? "OK  " : "RATÉ"}  ${nom.padEnd(44)} ${dit}`);
  }

  // Le doublon de titre se juge sur DEUX pages : témoin à part.
  const vus = new Map([[nu(TITRE), "/premiere/"]]);
  const avecDoublon = motifsDeRefus({
    chemin: "/seconde/",
    html: tete({ canonique: `${ORIGINE}/seconde/` }),
    origine: ORIGINE,
    titresDejaVus: vus,
  });
  const attrape = avecDoublon.some((m) => m.famille === "titre dupliqué");
  if (attrape) bons++;
  console.log(
    `  ${attrape ? "OK  " : "RATÉ"}  ${"titre déjà porté par une autre page".padEnd(44)} ` +
      `${attrape ? "refusé : titre dupliqué" : "accepté"}`,
  );
  const sansDoublon = motifsDeRefus({
    chemin: "/seconde/",
    html: tete({ titre: "Dépannage industriel en urgence, Migen", canonique: `${ORIGINE}/seconde/` }),
    origine: ORIGINE,
    titresDejaVus: vus,
  });
  const laisse = !sansDoublon.some((m) => m.famille === "titre dupliqué");
  if (laisse) bons++;
  console.log(
    `  ${laisse ? "OK  " : "RATÉ"}  ${"titre distinct de l'autre page".padEnd(44)} ` +
      `${laisse ? "accepté" : "refusé à tort"}`,
  );

  const total = TEMOINS.length + 2;
  console.log(
    bons === total
      ? `\nCONTRÔLE OK : ${bons}/${total} témoins, chacun refusé pour la famille attendue.`
      : `\nCONTRÔLE ÉCHOUÉ : ${bons}/${total} témoins.`,
  );
  return bons === total;
}

if (CONTROLE) process.exit(controlePositif() ? 0 : 1);

/* ------------------------------------------------- le balayage des adresses */

const env = environnement();
const ORIGINE = (env.NEXT_PUBLIC_SITE_URL ?? "https://migen.fr").replace(/\/+$/, "");

/**
 * TOUTES les adresses servies, et non celles d'une seule source.
 *
 * `index.json` décrit les 248 pages de la maquette ; il ignore l'accueil et les
 * autres écrans portés en routes, qui n'ont pas de ligne en base. Les lire
 * depuis `lib/routes-statiques.ts`, que `app/verification-plan.tsx` compare déjà
 * aux dossiers réellement présents sous `app/`, évite d'entretenir une seconde
 * liste qui se démoderait en silence.
 */
function adressesServies() {
  const index = JSON.parse(readFileSync(`${RACINE}maquette/contenu/site/index.json`, "utf8"));
  const pages = Array.isArray(index) ? index : (index.pages ?? index);
  const statiques = [
    ...readFileSync(`${RACINE}lib/routes-statiques.ts`, "utf8").matchAll(/^\s*"(\/[^"]*)",?$/gm),
  ].map((m) => m[1]);
  if (statiques.length === 0) {
    console.error("  aucune route statique lue dans lib/routes-statiques.ts : contrôle incomplet, donc en échec");
    process.exit(1);
  }
  return {
    urls: [...new Set([...pages.map((p) => p?.url).filter(Boolean), ...statiques])].sort(),
    nbIndex: new Set(pages.map((p) => p?.url).filter(Boolean)).size,
    nbStatiques: statiques.length,
  };
}

/** Le HTML d'une adresse. Trois essais : en développement, la première demande
 *  d'une page peut rendre avant la fin de sa compilation. */
async function htmlDe(url) {
  for (let essai = 0; essai < 3; essai++) {
    try {
      const r = await fetch(SITE + url, { redirect: "manual", signal: AbortSignal.timeout(90000) });
      if (r.status !== 200) {
        if (essai < 2) continue;
        return { statut: r.status, html: "" };
      }
      const html = await r.text();
      if (!/<title>/.test(html) && essai < 2) continue;
      return { statut: 200, html };
    } catch (erreur) {
      if (essai === 2) return { statut: 0, html: "", erreur: erreur.message };
    }
  }
  return { statut: 0, html: "" };
}

const { urls, nbIndex, nbStatiques } = adressesServies();
const problemes = [];
const injoignables = [];
const titresDejaVus = new Map();
const releve = new Map();

for (let i = 0; i < urls.length; i += LOT) {
  const lot = urls.slice(i, i + LOT);
  const resultats = await Promise.all(lot.map((u) => htmlDe(u).then((r) => [u, r])));
  for (const [url, r] of resultats) {
    if (r.statut !== 200) {
      injoignables.push(`${url} (${r.erreur ?? r.statut})`);
      continue;
    }
    releve.set(url, r.html);
  }
  process.stderr.write(`  ${Math.min(i + LOT, urls.length)}/${urls.length} adresses relevées\r`);
}
process.stderr.write(" ".repeat(44) + "\r");

/* Les titres sont inventoriés AVANT d'être jugés : sans cela, le doublon n'est
   reproché qu'à la seconde page rencontrée, et l'ordre du balayage déciderait
   laquelle. Le premier chemin par ordre alphabétique porte la référence. */
for (const [url, html] of releve) {
  const titre = metadonneesDuHtml(html).titre;
  const cle = nu(titre);
  if (!cle) continue;
  if (!titresDejaVus.has(cle)) titresDejaVus.set(cle, url);
}

for (const [url, html] of releve) {
  for (const motif of motifsDeRefus({ chemin: url, html, origine: ORIGINE, titresDejaVus })) {
    problemes.push({ url, ...motif });
  }
}

/**
 * LA SOURCE DU SEO : une page de la maquette le tire du CORPUS, pas de la base.
 *
 * `lib/contenu.ts` l'écrit déjà et donne la raison : « le fichier gagne pour le
 * SEO comme il gagne pour le contenu, il est tiré du corpus porté, la base date
 * d'avant les décisions de copie ». Le relais disque applique cette règle aux
 * 245 pages qui portent leur titre et leur description dans
 * `supabase/import/gabarits-maquette/`.
 *
 * CE QUE CE CONTRÔLE AJOUTE : il nomme les pages de l'index que le relais NE
 * couvre pas et qui ne sont pas des écrans de code, c'est-à-dire celles dont
 * le SEO retombe sur une ligne de base antérieure, sans que rien ne le signale.
 *
 * MESURÉ LE 12/10 : il y en a UNE, `/expertises/`, et elle en payait le prix.
 * La base lui donne « 9 domaines en interne » en titre et « dix domaines
 * techniques » en description ; sa propre capture
 * (`maquette/rendu/expertises.html`) écrit SEPT FOIS « huit », dont dans son h1
 * (« un seul appel, huit métiers sur votre site ») et dans son chapô (« Huit
 * domaines techniques »). Le corpus, lui, écrit « Huit métiers techniques, une
 * seule équipe | Migen ». La page servie annonce donc dans la SERP un chiffre
 * que son propre texte contredit, deux fois.
 *
 * IL S'EFFACE DE LUI-MÊME le jour où la base est écrite et les fichiers du
 * relais archivés : sans dossier de relais, la règle n'a plus d'objet et le
 * contrôle ne juge rien ici. Il ne faut donc pas le « nettoyer » avant.
 */
function seoHorsCorpus() {
  const index = JSON.parse(readFileSync(`${RACINE}maquette/contenu/site/index.json`, "utf8"));
  const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
  const statiques = new Set(
    [...readFileSync(`${RACINE}lib/routes-statiques.ts`, "utf8").matchAll(/^\s*"(\/[^"]*)",?$/gm)].map((m) => m[1]),
  );
  let noms;
  try {
    noms = readdirSync(`${RACINE}supabase/import/gabarits-maquette`);
  } catch {
    // Dossier absent : le relais n'existe plus, la règle n'a plus d'objet.
    return [];
  }
  if (noms.length === 0) return [];
  const relayees = new Set();
  for (const nom of noms) {
    if (!nom.endsWith(".json")) continue;
    const lu = JSON.parse(readFileSync(`${RACINE}supabase/import/gabarits-maquette/${nom}`, "utf8"));
    if (lu?.url && lu?.seo?.meta_title && lu?.seo?.meta_description) relayees.add(lu.url);
  }
  return pagesIndex
    .map((p) => p?.url)
    .filter((url) => url && !statiques.has(url) && !relayees.has(url))
    .map((url) => ({
      url,
      famille: "SEO hors corpus",
      detail:
        "page de l'index servie par l'attrape-tout sans fichier de relais : son titre et sa " +
        "description viennent de la base, pas du corpus porté contre la capture",
    }));
}

const problemesSource = seoHorsCorpus();
problemes.push(...problemesSource);

console.log(
  `ÉTAGE 1, le HTML servi par ${SITE} : ${releve.size}/${urls.length} adresses relevées ` +
    `(${nbIndex} de l'index de la maquette, ${nbStatiques} routes du code), ${problemes.length} problème(s), ` +
    `dont ${problemesSource.length} de source.`,
);
if (injoignables.length > 0) {
  console.error(`  ${injoignables.length} adresse(s) injoignable(s), le contrôle ne peut pas conclure dessus :`);
  for (const i of injoignables.slice(0, 20)) console.error(`    ${i}`);
}

/* ---------------------------------------- l'étage 2 : ce que seul la base dit */

const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const problemesBase = [];
let lignesLues = 0;

if (!URL_BASE || !CLE) {
  console.log(
    "ÉTAGE 2 non lu : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY absente de .env.local. " +
      "Le mot clé principal des pages n'est donc pas jugé.",
  );
} else {
  const entete = { apikey: CLE, Authorization: `Bearer ${CLE}` };
  const reponse = await fetch(
    `${URL_BASE}/rest/v1/pages?select=path,titre_h1,mot_cle_principal,contenu,seo(meta_title,noindex)&statut=eq.published&order=path`,
    { headers: entete },
  );
  if (!reponse.ok) {
    console.error(`  la base répond ${reponse.status} : ${(await reponse.text()).slice(0, 200)}`);
    process.exit(1);
  }
  const pages = await reponse.json();
  if (!Array.isArray(pages) || pages.length === 0) {
    console.error("  aucune page publiée n'est lisible : l'étage 2 est sans objet, donc en échec");
    process.exit(1);
  }
  lignesLues = pages.length;

  for (const page of pages) {
    const seo = Array.isArray(page.seo) ? page.seo[0] : page.seo;
    if (!seo) {
      problemesBase.push({ url: page.path, famille: "aucune ligne seo", detail: "la page publiée n'en a pas" });
      continue;
    }
    if (seo.noindex) continue;
    /* Une étude de cas ne vise pas un mot clé, et c'est voulu : elle raconte un
       chantier chez un client nommé. Lui en coller un reviendrait à l'écrire pour
       une requête qu'elle ne sert pas. Les hubs de la maquette (expertises,
       casclients, implantations) sont dans le même cas : ils orientent, ils ne
       ciblent pas. L'exception est donc portée par le GABARIT, pas par une liste
       de chemins qui dériverait à chaque page ajoutée. */
    const gabarit = page.contenu?.gabarit;
    const viseUnMotCle = !["fiche", "casclients", "expertises", "implantations"].includes(gabarit);
    if (viseUnMotCle && !page.mot_cle_principal) {
      problemesBase.push({ url: page.path, famille: "aucun mot clé principal", detail: "colonne vide en base" });
    }
  }

  console.log(
    `ÉTAGE 2, la base : ${lignesLues} pages publiées lues, ${problemesBase.length} problème(s) ` +
      "sur ce que le HTML ne dit pas (mot clé principal).",
  );

  /* Avec la clé de SERVICE, les brouillons sont lus eux aussi et jugés, mais en
     AVERTISSEMENT : un brouillon n'est pas servi, il ne fait donc pas échouer le
     contrôle. Sans cette clé, ils sont invisibles, et la sécurité au niveau des
     lignes empêche même de les compter : la limite est alors annoncée telle
     quelle, sans chiffre inventé. */
  const CLE_SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!CLE_SERVICE) {
    console.log(
      "  Les pages en BROUILLON ne sont pas jugées : la clé anonyme ne les voit pas, et la sécurité " +
        "au niveau des lignes empêche même de les compter. Elles porteront les mêmes défauts le jour " +
        "de leur publication. Pour les couvrir : SUPABASE_SERVICE_ROLE_KEY dans .env.local.",
    );
  } else {
    const brouillons = await fetch(
      `${URL_BASE}/rest/v1/pages?select=path,titre_h1,contenu,seo(meta_title)&statut=neq.published&order=path`,
      { headers: { apikey: CLE_SERVICE, Authorization: `Bearer ${CLE_SERVICE}` } },
    ).then((r) => (r.ok ? r.json() : []));
    const fautifs = brouillons.filter((page) => {
      const seo = Array.isArray(page.seo) ? page.seo[0] : page.seo;
      return seo && nu(seo.meta_title) === nu(page.titre_h1);
    });
    console.log(
      `  ${brouillons.length} brouillon(s) lus en plus : ${fautifs.length} dont le titre répète le h1. ` +
        "Avertissement seulement, un brouillon n'est pas servi, mais à régler avant publication.",
    );
    for (const page of fautifs.slice(0, 20)) {
      const vide = Object.keys(page.contenu ?? {}).length === 0;
      console.log(`    ${page.path}${vide ? " (contenu vide : écrire le contenu avant le titre)" : ""}`);
    }
  }
}

/* ------------------------------------------------------------- le verdict */

const tous = [...problemes, ...problemesBase];
if (injoignables.length > 0) {
  console.error(
    `\n${injoignables.length} adresse(s) n'ont pas répondu 200 : le contrôle refuse de conclure sans les avoir lues.`,
  );
}
if (tous.length > 0) {
  /* Le DÉCOMPTE PAR FAMILLE d'abord, la liste ensuite. Une porte rouge sur
     quatre-vingts lignes à plat ne dit pas s'il s'agit de quatre-vingts
     problèmes ou de deux causes. */
  const parFamille = new Map();
  for (const p of tous) parFamille.set(p.famille, (parFamille.get(p.famille) ?? 0) + 1);
  console.error("\nPar famille de défaut :");
  for (const [famille, nb] of [...parFamille].sort((a, b) => b[1] - a[1])) {
    console.error(`  ${String(nb).padStart(4)}  ${famille}`);
  }
  console.error("");
  for (const p of tous.slice(0, 90)) console.error(`  ${p.url} : ${p.famille} · ${p.detail}`);
  if (tous.length > 90) console.error(`  ... et ${tous.length - 90} autre(s)`);
}
if (tous.length > 0 || injoignables.length > 0) process.exit(1);

console.log("\nmétadonnées conformes");
