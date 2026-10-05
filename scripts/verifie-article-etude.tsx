/*
 * ⚠️  CONTRÔLE INACHEVÉ, HORS DE LA CHAÎNE DE VÉRIFICATION.
 *
 * Il a été écrit par un portage interrompu le 03/10 (limite hebdomadaire
 * atteinte en plein travail) et il n'est pas encore juste : une de ses
 * assertions cherchait dans le fichier de DESSIN des titres que la maquette
 * rend depuis la DONNÉE (« {{ sec.t }} »), une autre attend un en-tête de
 * tableau « Élément » qui ne s'y lit pas.
 *
 * Il est gardé parce qu'il porte le relevé des deux fichiers de gabarit du
 * client, et qu'il reprendra quand le portage reprendra. Il n'est PAS branché
 * dans « bun run verifie » : une porte qui échoue pour une mauvaise raison
 * apprend à ignorer les portes.
 */
/**
 * Contrôle des gabarits ARTICLE et ÉTUDE DE CAS contre LEURS fichiers de
 * maquette, contre les interdits de copie, et contre la règle du vide.
 *
 *   bun scripts/verifie-article-etude.tsx
 *   bun scripts/verifie-article-etude.tsx --faute   # injecte une faute, doit ÉCHOUER
 *
 * CE QUI REND CE CONTRÔLE REJOUABLE. Les valeurs attendues ne sont pas écrites
 * ici : elles sont RELUES dans `maquette/gabarit-01-article.html` et
 * `maquette/gabarit-02-etude-de-cas.html` à chaque exécution, et chaque
 * déclaration est exigée des DEUX côtés — dans le fichier du client ET dans le
 * HTML que le composant rend. Une note de lecture peut se tromper et personne ne
 * peut la rejouer ; une comparaison, si.
 *
 * L'ÉCART QUI A COÛTÉ DES SEMAINES, et que ce contrôle empêche de revenir : le
 * portage précédent lisait « Migen - Site final.dc.html », le seul fichier que
 * le client avait envoyé en message. Le projet Claude Design contient onze
 * fichiers de gabarits dédiés, et ce sont eux qui font foi. Pour cette famille :
 *
 *   ce que le site rendait            ce que le gabarit du client dessine
 *   -------------------------------   ------------------------------------------
 *   ARTICLE
 *   surtitre « GUIDE · 8 MIN »        une pastille de verre à point orange
 *   titre, puis image pleine largeur  deux colonnes, visuel de 340px à droite
 *   « 1. Un titre »                   « 01 » en chasse fixe orange au-dessus
 *   sommaire en liste nue             carte de verre collante de 240px
 *   (aucune)                          foire aux questions à deux colonnes
 *   (aucune)                          bande d'appel de fin, téléphone + rappel
 *
 *   ÉTUDE DE CAS
 *   « Fiche », carte d'identité       « Le dispositif », tableau Élément/Détail,
 *     à droite du titre dans le héros   en CINQUIÈME position
 *   « Le contexte »                   « 02 La situation »
 *   « Ce que nous avons fait »        « 03 Ce que nous avons mis en place »
 *   (aucune)                          « 01 Le client et le site »
 *   (aucune)                          « 04 Le déroulé », frise d'étapes
 *   « Le résultat », chiffres sur      « Le résultat », liste à coches en carte
 *     panneau anthracite                de verre
 *   mosaïque de trois visuels         aucun visuel de corps
 *   « Un cas comparable chez vous ? » l'appel final « Votre besoin »
 *   trois cartes côte à côte          une suite de sections numérotées, titre
 *                                       collant à gauche, corps à droite
 *
 * Le texte est comparé NORMALISÉ : la maquette écrit l'espace insécable et la
 * coche en entités, et l'apostrophe en typographique, là où le corpus écrit des
 * caractères simples. Comparer les octets ferait échouer le contrôle sur une
 * différence que personne ne voit.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

import Article from "@/components/site/article/Article";
import PageFiche, { FilArianeEtude } from "@/components/site/fiche/PageFiche";
import type { ContenuArticle } from "@/types/article";
import { estFiche } from "@/types/fiche";

const MAQUETTE_ARTICLE = "maquette/gabarit-01-article.html";
const MAQUETTE_ETUDE = "maquette/gabarit-02-etude-de-cas.html";
const DOSSIER = "supabase/import/gabarits-maquette";

/** `--faute` injecte une faute et exige que le contrôle tombe. */
const FAUTE = process.argv.includes("--faute");

/* ------------------------------------------------------------- normalisation */

/** Entités et apostrophe typographique ramenées au caractère simple. */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&check;/g, "✓")
    .replace(/&rarr;/g, "→")
    .replace(/[‘’]/g, "'")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

const maquetteArticle = normalise(readFileSync(MAQUETTE_ARTICLE, "utf8"));
const maquetteEtude = normalise(readFileSync(MAQUETTE_ETUDE, "utf8"));

assert.ok(
  maquetteArticle.includes('data-screen-label="Gabarit 01 Article et fiche"'),
  `${MAQUETTE_ARTICLE} : ce n'est pas le gabarit 01`,
);
assert.ok(
  maquetteEtude.includes('data-screen-label="Gabarit 02'),
  `${MAQUETTE_ETUDE} : ce n'est pas le gabarit 02`,
);

/**
 * Chaque déclaration est exigée des deux côtés.
 *
 * `dans` est la maquette où elle doit figurer, `rendu` le HTML du composant.
 * Une valeur qu'on aurait inventée tombe sur la maquette ; une valeur que le
 * composant n'applique pas tombe sur le rendu.
 */
function exigeDesDeuxCotes(
  declarations: string[],
  maquette: string,
  quelleMaquette: string,
  rendu: string,
  quelRendu: string,
): void {
  for (const declaration of declarations) {
    assert.ok(
      maquette.includes(declaration),
      `${quelleMaquette} ne contient pas « ${declaration} » : la valeur a été écrite de mémoire`,
    );
    assert.ok(
      rendu.includes(declaration),
      `${quelRendu} ne rend pas « ${declaration} », que ${quelleMaquette} dessine`,
    );
  }
}

/* --------------------------------------------- les interdits, sur le rendu */

/**
 * Les interdits du contrat, cherchés dans le TEXTE RENDU.
 *
 * `scripts/verifie-interdits.mjs` lit la source des composants ; celui-ci lit
 * ce qui arrive au visiteur, corpus compris. Les deux sont nécessaires : le
 * premier ne voit pas le corpus, le second ne voit pas la copie d'un composant
 * qu'il ne monte pas.
 */
const INTERDITS: [RegExp, string][] = [
  [/\b200 clients\b/, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/\+\s*200\b/, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/\b(cinq|5)\s+agences\b/i, "quatre agences : Lyon siège à Limonest, Montréal, Dubaï, Madrid"],
  [/sous\s+\d+\s*(h|heures?|jours?)\b/i, "« rappel dans l'heure », aucun autre délai chiffré"],
  [/\ben\s+moins\s+de\s+\d/i, "« rappel dans l'heure », aucun autre délai chiffré"],
  [/\d\s*(h|heures?)\s+de\s+route\b/i, "aucun délai ni distance chiffrés"],
  [/\d\s*(€|euros?)\b/i, "aucun prix"],
  [/à\s+partir\s+de\s+\d/i, "aucun prix"],
  [/\brégie\b/i, "« résidence » ou « technicien sur site »"],
  [/\bintérim\b/i, "nommer la prestation, jamais le statut"],
  [/\bmise à disposition\b/i, "« intervention » ou « mission »"],
  [/\bsans engagement\b/i, "dire la durée réelle, ou ne rien dire"],
  [/\bclé en main\b/i, "dire ce qui est fait"],
  [/\bsur mesure\b/i, "dire ce qui s'adapte, et à quoi"],
  [/\bleviers?\b/i, "dire l'effet obtenu"],
  [/\bconcrètement\b/i, "à supprimer"],
  [/\bnotamment\b/i, "à supprimer, ou « dont »"],
  [/\bincontournable/i, "à supprimer"],
  [/\bdécouvrez\b/i, "un verbe qui dit ce que la page fait"],
  [/—/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
];

/** Le texte visible, balises retirées. */
function texteVisible(rendu: string): string {
  return normalise(
    rendu
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  );
}

function verifieInterdits(rendu: string, ou: string): void {
  const texte = texteVisible(rendu);
  for (const [motif, remede] of INTERDITS) {
    const trouve = texte.match(motif);
    assert.ok(
      !trouve,
      `${ou} : formulation interdite « ${trouve?.[0]} ». À la place : ${remede}`,
    );
  }
}

/* --------------------------------------------- les règles communes de rendu */

/**
 * `assert.match` recrache tout le HTML dans son message, ce qui noie la cause.
 * Ces deux-là disent la règle, et rien d'autre.
 */
/* Le message est facultatif : quand le motif se suffit à lui-même, le répéter
   en prose n'apprend rien, et le motif imprimé dit déjà ce qui manque. */
function exige(
  rendu: string,
  motif: RegExp,
  message = `motif attendu, absent du rendu : ${motif}`,
): void {
  assert.ok(motif.test(rendu), message);
}

function exigeAbsent(
  rendu: string,
  motif: RegExp,
  message = `motif interdit, pourtant rendu : ${motif}`,
): void {
  assert.ok(!motif.test(rendu), message);
}

/** Une classe de couleur Tailwind : la charte passe par les variables CSS. */
const CLASSE_COULEUR =
  /class="[^"]*\b(?:bg|text|border|from|via|to)-(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?\b/;

function verifieSocle(rendu: string, ou: string): void {
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${ou} : un seul h1, celui de la page`,
  );
  exigeAbsent(
    rendu,
    /href="#"/,
    `${ou} : aucun lien mort. Un href="#" renvoie le visiteur en haut de page`,
  );
  exigeAbsent(
    rendu,
    CLASSE_COULEUR,
    `${ou} : aucune classe de couleur Tailwind, la charte passe par les variables CSS`,
  );
  verifieInterdits(rendu, ou);
}

/* ========================================================== GABARIT 01 ARTICLE */

const ARTICLE: ContenuArticle = {
  chapeau: "Le chapô de l'article, avec un [lien interne](/offres/).",
  categorie: "Guide",
  minutesLecture: 8,
  image: { src: "/assets/web/sv-armoire.jpg", alt: "Une armoire électrique" },
  sections: [
    {
      id: "a1",
      titre: "La première section",
      blocs: [
        { type: "paragraphe", texte: "Un paragraphe de corps." },
        { type: "liste", items: ["**Une accroche** : la suite."] },
      ],
    },
    {
      id: "a2",
      titre: "La deuxième section",
      blocs: [{ type: "encadre", texte: "Ce qu'il faut retenir." }],
    },
    {
      id: "a3",
      titre: "La troisième section",
      blocs: [
        {
          type: "tableau",
          entetes: ["Poste", "Nature"],
          lignes: [["Production perdue", "Direct"]],
        },
      ],
    },
    // Une section que le corpus n'alimente pas : elle ne doit pas se rendre, et
    // elle ne doit pas consommer le numéro 04.
    { id: "a4", titre: "La section vide", blocs: [{ type: "paragraphe", texte: "" }] },
  ],
  cta: {
    titre: "Le poste reste ouvert ?",
    texte: "Décrivez votre parc.",
    bouton: "Parler à un chargé d'affaires",
    href: "/offres/residence/",
  },
};

const article = normalise(
  renderToStaticMarkup(
    <Article
      titre="Coût d'un arrêt de production"
      contenu={ARTICLE}
      publieLe="2026-03-31T00:00:00Z"
      auteur="l'équipe migen"
    />,
  ),
);

verifieSocle(article, "gabarit article");

exigeDesDeuxCotes(
  [
    // Le héros.
    "padding:44px 40px 0",
    "font:400 13px var(--fb)",
    "grid-template-columns:1.2fr .8fr",
    "padding:6px 14px;border-radius:999px;background:rgba(255,255,255,var(--gl-a))",
    "font:600 calc(clamp(36px,4.4vw,62px) * var(--ts))/1.04 var(--ft)",
    "letter-spacing:-.045em",
    "max-width:18ch",
    "font:400 18.5px/1.6 var(--fb)",
    "max-width:56ch",
    "height:340px",
    // `next/image` glisse son propre `color:transparent` entre les deux : la
    // déclaration est donc exigée en deux morceaux, pas en un.
    "object-fit:cover",
    "filter:saturate(var(--sat)) contrast(1.05)",
    // Le corps et son sommaire.
    "grid-template-columns:240px minmax(0,1fr)",
    "position:sticky;top:110px",
    "padding:22px 22px 24px",
    "font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:var(--ink4)",
    "padding:8px 0;font:500 13.5px/1.4 var(--fb)",
    "font:600 11px ui-monospace,Menlo,monospace;color:var(--acc)",
    "scroll-margin-top:110px;padding-bottom:40px;margin-bottom:40px;border-bottom:1px solid var(--line)",
    "font:600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
    "max-width:26ch",
    // Les motifs partagés.
    "font:400 16.5px/1.75 var(--fb);color:var(--ink1)",
    "max-width:68ch",
    "font:400 15.5px/1.6 var(--fb);color:var(--ink1)",
    "color:var(--acc);flex:none;font-weight:600",
    "background:var(--acc-w);border:1px solid rgba(255,124,60,.28);font:500 15.5px/1.65 var(--fb)",
    "border-collapse:collapse;min-width:520px",
    "padding:14px 18px;font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:var(--acc)",
    "padding:13px 18px;vertical-align:top;border-top:1px solid var(--line)",
    "padding:24px 26px;border-radius:24px;background:var(--panel)",
    "color:rgba(255,255,255,.8)",
    // La bande d'appel de fin.
    "padding:26px 28px 26px 34px;border-radius:32px",
    "box-shadow:0 0 0 6px var(--acc-w)",
    "font:600 17px var(--ft)",
    "padding:13px 22px;border-radius:999px;background:var(--acc)",
  ],
  maquetteArticle,
  MAQUETTE_ARTICLE,
  article,
  "le rendu de l'article",
);

// La numérotation est celle de la maquette : « 01 », pas « 1. ».
exige(article, />01</, "la première section porte « 01 »");
exige(article, />03</, "la troisième section porte « 03 »");
exigeAbsent(
  article,
  />1\. /,
  "la maquette numérote sur deux chiffres, sans point",
);
// La section vide ne se rend pas, et ne consomme pas de numéro.
exigeAbsent(article, /La section vide/, "une section sans donnée ne se rend pas");
exigeAbsent(article, />04</, "une section qui ne se rend pas ne prend pas de numéro");
// Le sommaire compte exactement les sections rendues.
assert.equal(
  (article.match(/href="#a\d"/g) ?? []).length,
  3,
  "le sommaire porte une entrée par section rendue, pas une de plus",
);
// La pastille garde la durée de lecture, que la maquette ne dessine pas : le
// texte du corpus ne se perd jamais.
exige(article, /Guide · 8 min de lecture/);
// Le Markdown en ligne du corpus est rendu, pas affiché.
exigeAbsent(article, /\[lien interne\]/, "le lien Markdown doit être rendu");
// `next/link` rend « /offres » : le slash final du corpus est normalisé par le
// routeur, pas par ce gabarit. On vise le chemin, pas sa forme.
exige(article, /href="\/offres"/, "le lien du corpus doit viser /offres");
// La phrase de rappel est la SEULE formulation de délai autorisée, et elle est
// celle de la maquette.
assert.ok(
  maquetteArticle.includes("rappel dans l'heure, du lundi au vendredi de 8h00 à 18h30"),
  `${MAQUETTE_ARTICLE} : la phrase de rappel a changé`,
);
exige(article, /rappel dans l'heure, du lundi au vendredi de 8h00 à 18h30/);

// ------------------------- un article que le corpus n'alimente presque pas

const articleNu = normalise(
  renderToStaticMarkup(<Article titre="Nu" contenu={{ chapeau: "", sections: [] }} />),
);
verifieSocle(articleNu, "gabarit article, sans donnée");
exigeAbsent(articleNu, /Sommaire/, "sans section, aucun sommaire vide");
exigeAbsent(articleNu, /height:340px/, "sans visuel, aucune case grise de 340px");
exigeAbsent(
  articleNu,
  /grid-template-columns:1\.2fr \.8fr/,
  "sans visuel, le héros prend toute la largeur",
);
// La bande d'appel reste : elle est du chrome, et le seul chemin vers le
// contact sur une page que la route ne dote pas de formulaire.
exige(articleNu, /border-radius:32px/);

/* ====================================================== GABARIT 02 ÉTUDE DE CAS */

type Charge = { url: string; h1?: string; contenu: unknown };

const fichiers = readdirSync(DOSSIER)
  .filter((n) => n.startsWith("preuves-") && n.endsWith(".json"))
  .sort();
assert.equal(
  fichiers.length,
  28,
  `${DOSSIER} : 28 études de cas attendues, ${fichiers.length} trouvée(s)`,
);

const charges: Charge[] = fichiers.map(
  (n) => JSON.parse(readFileSync(join(DOSSIER, n), "utf8")) as Charge,
);

const TITRES_ATTENDUS = [
  "Le client et le site",
  "La situation",
  "Ce que nous avons mis en place",
  "Le dispositif",
  "Le résultat",
];

/* CES TITRES VIENNENT DU CORPUS, PAS DU DESSIN, et l'assertion inverse était
   fausse : la maquette de l'étude de cas écrit « {{ sec.t }} », elle rend donc
   ses titres de section depuis une donnée. Les chercher dans le fichier de
   dessin ne pouvait qu'échouer.

   Ce qui se vérifie vraiment est double : que la maquette délègue bien ces
   titres à la donnée, et que la donnée produite les porte. */
assert.ok(
  maquetteEtude.includes("{{ sec.t }}"),
  "la maquette de l'étude de cas ne délègue plus ses titres de section à la donnée : le contrat a changé",
);

for (const titre of TITRES_ATTENDUS) {
  const porteurs = charges.filter((charge) =>
    JSON.stringify(charge).includes(titre),
  ).length;
  assert.ok(
    porteurs > 0,
    `« ${titre} » n'est porté par aucune des ${charges.length} études de cas : titre inventé ou corpus changé`,
  );
}
assert.ok(maquetteEtude.includes("Élément"), "l'en-tête « Élément » vient de la maquette");
assert.ok(maquetteEtude.includes("Détail"), "l'en-tête « Détail » vient de la maquette");

let rendusEtude = 0;
for (const charge of charges) {
  const { contenu, url } = charge;
  assert.ok(estFiche(contenu), `${url} : discriminant gabarit: "fiche" attendu`);
  const titre = charge.h1 ?? url;

  if (FAUTE && url === "/preuves/veepee-sites-lyon/") {
    // La faute injectée : un prix, que le contrat interdit absolument.
    contenu.sections?.[0]?.blocs.push({
      type: "paragraphe",
      texte: "Le contrat démarre à partir de 1 500 € par mois.",
    });
  }

  const rendu = normalise(
    renderToStaticMarkup(
      <PageFiche
        titre={titre}
        contenu={contenu}
        filAriane={<FilArianeEtude titre={titre} />}
      />,
    ),
  );

  verifieSocle(rendu, url);

  // Les cinq sections de la maquette que le corpus alimente, dans l'ordre, et
  // numérotées sans trou.
  const titres = (contenu.sections ?? []).map((s) => s.titre);
  assert.deepEqual(
    titres,
    TITRES_ATTENDUS,
    `${url} : les sections doivent suivre l'ordre de la maquette`,
  );
  for (let i = 0; i < titres.length; i += 1) {
    const numero = String(i + 1).padStart(2, "0");
    assert.ok(
      rendu.includes(`>${numero}<`),
      `${url} : la section « ${titres[i]} » doit porter « ${numero} »`,
    );
  }
  exigeAbsent(
    rendu,
    />06</,
    `${url} : « Le déroulé » n'est pas alimenté, il ne doit pas prendre de numéro`,
  );

  // Ce que l'ancien portage rendait et que la maquette ne dessine pas.
  exigeAbsent(
    rendu,
    /Un cas comparable chez vous/,
    `${url} : ce pavé était de la copie inventée, absente de la maquette`,
  );
  exigeAbsent(
    rendu,
    />Fiche</,
    `${url} : la carte d'identité du héros a laissé place au tableau « Le dispositif »`,
  );
  exigeAbsent(
    rendu,
    /var\(--ph\)/,
    `${url} : le corpus ne porte aucune image, aucune case grise ne se rend`,
  );
  exigeAbsent(
    rendu,
    /var\(--panel\)/,
    `${url} : le résultat se rend en carte de verre, pas sur panneau anthracite`,
  );

  // Le Markdown en ligne du corpus est rendu, jamais affiché.
  exigeAbsent(rendu, /\*\*/, `${url} : le gras Markdown doit être rendu`);
  exigeAbsent(rendu, /\]\(\//, `${url} : les liens Markdown doivent être rendus`);

  if (rendusEtude === 0) {
    exigeDesDeuxCotes(
      [
        // Le héros du gabarit 02.
        "padding:44px 40px 0",
        "grid-template-columns:1.1fr .9fr",
        "font:600 calc(clamp(36px,4.4vw,62px) * var(--ts))/1.04 var(--ft)",
        // La coque de section.
        "padding:var(--sec) 0 0;scroll-margin-top:110px",
        "grid-template-columns:.75fr 1.25fr",
        "position:sticky;top:110px",
        "font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)",
        "font:600 calc(clamp(26px,2.8vw,40px) * var(--ts))/1.08 var(--ft)",
        "max-width:16ch",
        // Les motifs partagés, exigés AUSSI dans ce fichier : c'est ce qui
        // prouve que les deux gabarits portent bien le même jeu.
        "font:400 16.5px/1.75 var(--fb);color:var(--ink1)",
        "font:400 15.5px/1.6 var(--fb);color:var(--ink1)",
        "color:var(--acc);flex:none;font-weight:600",
        "border-collapse:collapse;min-width:520px",
        "padding:14px 18px;font:600 10.5px var(--fb);letter-spacing:.12em;text-transform:uppercase;color:var(--acc)",
        "padding:13px 18px;vertical-align:top;border-top:1px solid var(--line)",
      ],
      maquetteEtude,
      MAQUETTE_ETUDE,
      rendu,
      `le rendu de ${url}`,
    );
    // La grille du héros ne garde sa seconde colonne que s'il y a un visuel :
    // ici il n'y en a aucun, et la colonne vide ne se rend pas.
    assert.ok(
      maquetteEtude.includes("height:400px"),
      `${MAQUETTE_ETUDE} : le visuel du héros a changé de hauteur`,
    );
    exigeAbsent(rendu, /height:400px/);
  }
  rendusEtude += 1;
}

/* ------------------------------------ une étude que le corpus n'alimente pas */

const etudeNue = normalise(
  renderToStaticMarkup(
    <PageFiche
      titre="Un cas"
      contenu={{
        gabarit: "fiche",
        sections: [
          { id: "vide", titre: "Le déroulé", blocs: [{ type: "liste", items: [] }] },
          {
            id: "vide2",
            titre: "Le dispositif",
            blocs: [{ type: "tableau", entetes: [], lignes: [] }],
          },
        ],
      }}
    />,
  ),
);
verifieSocle(etudeNue, "étude de cas, sans donnée");
exigeAbsent(
  etudeNue,
  /Le déroulé|Le dispositif/,
  "une section que le corpus n'alimente pas ne se rend pas du tout, titre compris",
);
exigeAbsent(etudeNue, />01</, "sans section rendue, aucun numéro");

/* ----------------------------------------------------------------- conclusion */

if (FAUTE) {
  console.error(
    "ÉCHEC ATTENDU : le contrôle lancé avec --faute aurait dû tomber sur le prix injecté.",
  );
  process.exit(1);
}

console.log(
  `Gabarits article et étude de cas conformes à LEURS fichiers de maquette.\n` +
    `  ${MAQUETTE_ARTICLE} et ${MAQUETTE_ETUDE} relus à l'instant.\n` +
    `  ${rendusEtude} études de cas rendues, 5 sections chacune, numérotées sans trou.\n` +
    `  un seul h1, aucun href="#", aucune classe de couleur Tailwind, interdits absents.\n` +
    `  une section sans donnée ne se rend pas, et ne consomme pas de numéro.`,
);
