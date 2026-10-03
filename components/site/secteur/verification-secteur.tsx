/**
 * Contrôle du gabarit secteur, sans navigateur.
 *
 *   bun components/site/secteur/verification-secteur.tsx
 *
 * Ce gabarit sert les 12 pages de secteur et les 42 pages d'implantation. Son
 * contenu arrive par un `jsonb` : ce qui casse en silence, c'est un champ absent
 * qui vide une section, une cible de lien hors domaine, et le texte que personne
 * n'a fourni et qu'un gabarit finit par inventer.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";
import type { Section } from "@/types/contenu";
import PageSecteur from "./PageSecteur";
import type { ContenuSecteur } from "@/types/secteur";

/* -------------------------------------------------------------- gabarit secteur */

const SECTEUR: ContenuSecteur = {
  gabarit: "secteur",
  surtitre: "Secteur d'activité",
  chapeau: "Des cadences élevées et un [contrat adapté](/offres/zero-arret/).",
  actions: [
    { libelle: "Parler de mon site", href: "/contact/" },
    { libelle: "Un cas comparable", href: "/realisations/" },
  ],
  reperesSurtitre: "Nos repères dans le secteur",
  reperes: [
    { valeur: "14", libelle: "sites suivis" },
    { valeur: "3×8", libelle: "équipes tournantes" },
  ],
  enjeuxSurtitre: "Les enjeux du secteur",
  enjeuxTitre: "Quatre contraintes qu'on connaît",
  enjeux: [
    { titre: "Nettoyage agressif", texte: "Soude, acide, haute pression." },
    { titre: "Fenêtres courtes", texte: "Le préventif se fait entre deux séries." },
  ],
  autresSurtitre: "Les autres secteurs",
  autres: [
    { libelle: "Automobile", href: "/secteurs/automobile/" },
    { libelle: "Chimie", href: "/secteurs/chimie/" },
    // Cible hors domaine : le lien doit DISPARAÎTRE, pas être rafistolé.
    { libelle: "Ailleurs", href: "https://exemple.test/" },
  ],
  appelTitre: "Votre secteur, vos contraintes.",
  appelTexte: "Envoyez le contexte.",
  appelBouton: { libelle: "Décrire mon besoin", href: "" },
};

const renduSecteur = renderToStaticMarkup(
  <PageSecteur titre="Maintenance en agroalimentaire" contenu={SECTEUR} />,
);

assert.equal(
  (renduSecteur.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);

assert.ok(
  renduSecteur.includes("Maintenance en agroalimentaire"),
  "le titre de la page doit être rendu dans le h1",
);

// Le maillage du corpus écrit en Markdown doit sortir en lien, pas en crochets.
// `next/link` ne rend le slash final que sous la configuration du site : on
// vérifie le chemin, pas sa ponctuation.
assert.ok(
  renduSecteur.includes('href="/offres/zero-arret') &&
    !renduSecteur.includes("[contrat adapté]"),
  "le chapeau doit passer par TexteRiche",
);

assert.ok(
  !renduSecteur.includes("exemple.test"),
  "une cible hors domaine ne doit jamais être rendue en lien",
);
assert.ok(
  !renduSecteur.includes(">Ailleurs<"),
  "un lien à cible refusée disparaît, libellé compris",
);

// Sans cible fournie, le bouton de l'appel vise le formulaire de la page.
assert.ok(
  renduSecteur.includes('href="#formulaire"'),
  "le bouton de l'appel doit viser l'ancre du formulaire",
);

// Deux enjeux fournis : la grille se resserre au lieu de laisser deux colonnes
// vides en bout de ligne.
assert.ok(
  renduSecteur.includes("repeat(2,minmax(0,1fr))"),
  "la grille des enjeux suit le nombre de cartes, jusqu'à quatre",
);

// Les animations viennent de Moteurs.tsx : le gabarit ne pose que l'attribut.
assert.ok(
  (renduSecteur.match(/data-reveal/g) ?? []).length >= 3,
  "chaque section sous le hero porte data-reveal",
);

/* ---------------------------------------------------------- gabarit département */

const DEPARTEMENT: ContenuSecteur = {
  gabarit: "secteur",
  surtitre: "Département 69",
  communesSurtitre: "Communes couvertes",
  communesTitre: "Tout le département",
  communes: ["Lyon", "Villeurbanne", "Limonest"],
  autresSurtitre: "Les autres départements",
  autres: [{ libelle: "Haute-Savoie", href: "/implantations/lyon/haute-savoie/" }],
};

const renduDept = renderToStaticMarkup(
  <PageSecteur titre="Maintenance dans le Rhône" contenu={DEPARTEMENT} />,
);

assert.equal(
  (renduDept.match(/<h1[\s>]/g) ?? []).length,
  1,
  "le gabarit département porte lui aussi un seul h1",
);

// Une commune est un fait, pas une page : elle se rend en span.
assert.ok(
  renduDept.includes(">Lyon</span>"),
  "les communes couvertes ne sont pas cliquables",
);
assert.ok(
  renduDept.includes('href="/implantations/lyon/haute-savoie'),
  "les autres départements sont des liens",
);

// Sans repères, le hero passe sur une colonne : pas de panneau en verre vide.
assert.ok(
  renduDept.includes("minmax(0,1fr)") &&
    !renduDept.includes("1.1fr .9fr"),
  "sans repères, le hero tient sur une colonne",
);

/* ------------------------------------------------------------ contenu quasi vide */

const VIDE: ContenuSecteur = { gabarit: "secteur" };

const renduVide = renderToStaticMarkup(
  <PageSecteur titre="Un titre seul" contenu={VIDE} />,
);

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
assert.ok(
  !renduVide.includes("<a "),
  "un contenu vide n'invente aucun lien",
);
assert.ok(
  !renduVide.includes("<h2"),
  "un contenu vide n'invente aucune section",
);

/* ============================================================================
   LA MAQUETTE, RELUE DANS LE FICHIER À CHAQUE EXÉCUTION

   Aucune valeur attendue n'est écrite de mémoire ici : chacune est extraite de
   `maquette/accueil-rendu.html`, bloc `isSecteur`, au moment où le contrôle
   tourne. Une note de lecture peut se tromper et personne ne peut la rejouer ;
   une extraction se rejoue, et elle échoue le jour où la maquette change.
   ========================================================================== */

const MAQUETTE = readFileSync(
  fileURLToPath(new URL("../../../maquette/accueil-rendu.html", import.meta.url)),
  "utf8",
);

const DEBUT = MAQUETTE.indexOf('<sc-if value="{{ isSecteur }}"');
assert.ok(DEBUT > -1, "le bloc isSecteur a disparu de la maquette");
const SUITE = MAQUETTE.indexOf('\n<sc-if value="{{ is', DEBUT + 1);
assert.ok(SUITE > DEBUT, "la fin du bloc isSecteur est introuvable");
/** Le gabarit SECTEUR de la maquette, et lui seul. */
const BLOC = MAQUETTE.slice(DEBUT, SUITE);

/** Les `&nbsp;` de la maquette et les entités de React, ramenés au même texte. */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Les déclarations de style de la balise qui porte `motif`, dans la maquette.
 *
 * `motif` peut être le nom de la balise, une déclaration qu'elle contient, ou
 * le texte qu'elle encadre : on remonte au `<` le plus proche à gauche.
 */
function declarationsMaquette(motif: string): string[] {
  const position = BLOC.indexOf(motif);
  assert.ok(position > -1, `la maquette ne contient plus « ${motif} »`);
  const ouverture = BLOC.lastIndexOf("<", position);
  const balise = BLOC.slice(ouverture, BLOC.indexOf(">", ouverture) + 1);
  const style = /style="([^"]*)"/.exec(balise);
  assert.ok(style, `la balise de « ${motif} » n'a plus de style en ligne`);
  return style[1]
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean);
}

/**
 * Chaque déclaration de la maquette doit se retrouver dans le rendu.
 *
 * Le contrôle va de la maquette vers le rendu, pas l'inverse : le gabarit a le
 * droit d'ajouter ce que la maquette n'a pas (un `box-shadow:none` explicite,
 * une transition pour le focus au clavier), jamais de perdre une valeur.
 */
function memesValeurs(rendu: string, motif: string, tolerees: string[] = []) {
  for (const declaration of declarationsMaquette(motif)) {
    if (tolerees.some((debut) => declaration.startsWith(debut))) continue;
    assert.ok(
      rendu.includes(declaration),
      `valeur de la maquette absente du rendu (« ${motif} ») : ${declaration}`,
    );
  }
}

/**
 * Les surtitres orange en capitales d'un fragment, dans l'ordre.
 *
 * La même fonction lit la maquette et le rendu : c'est ce qui permet de
 * comparer des surtitres EXACTS au lieu de vérifier qu'une étiquette apparaît
 * quelque part. « Les enjeux du secteur chimique » contient « Les enjeux du
 * secteur » : une recherche par inclusion laisse passer la dérive, et c'est
 * exactement la faute qu'on veut voir.
 */
function surtitresDe(html: string): string[] {
  return [
    ...html.matchAll(/text-transform:uppercase;color:var\(--acc\)[^>]*>([^<]+)</g),
  ].map((trouve) => normalise(trouve[1]));
}

const SURTITRES = surtitresDe(BLOC);
assert.equal(
  SURTITRES.length,
  4,
  `la maquette dessine ${SURTITRES.length} surtitres au lieu de 4`,
);

/**
 * LA COPIE D'EXEMPLE DE LA MAQUETTE. Elle ne doit JAMAIS sortir dans une page :
 * ce sont des valeurs de démonstration, et les quatre repères (« 14 »,
 * « IP69K », « HACCP ») sont des données de secteur que le corpus ne fournit
 * pas. Les laisser passer, c'est publier une donnée inventée.
 */
const EXEMPLES_MAQUETTE = [
  "Quatre contraintes qu'on connaît",
  "Nettoyage agressif",
  "IP69K",
  "HACCP",
  "Votre secteur, vos contraintes.",
  "Un cas comparable",
  "sites agroalimentaires suivis",
];

/** Les interdits de copie du contrat, section 9 de CLAUDE.md. */
const INTERDITS = [
  "+200",
  "200 clients",
  "5 agences",
  "cinq agences",
  "sous 24 h",
  "sous 48 h",
  "sous 2 h",
  "sous 4 h",
  "sous 72 h",
  "en deux heures",
  "heures de route",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "levier",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  // Le tiret cadratin, écrit en séquence d'échappement : le caractère
  // lui-même dans ce fichier ferait de ce contrôle une fausse trouvaille
  // pour tout outil qui cherche l'interdit dans la source.
  "\u2014",
];

/** L'échafaudage Tailwind : aucune couleur par défaut, aucun mode sombre. */
const ECHAFAUDAGE =
  /\b(?:text|bg|border|ring|divide|from|via|to|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bdark:/;

/* ============================================================================
   LES TREIZE PAGES DE /secteurs/, TELLES QU'ELLES SERONT EN BASE

   Le contrôle ne se contente pas d'une donnée d'exemple : il monte le gabarit
   sur les fichiers que `scripts/importe_rest.mjs` va poser. C'est la seule
   manière de voir qu'une page a perdu une phrase du corpus, ou qu'un surtitre
   a dérivé sur une page et pas sur ses voisines.
   ========================================================================== */

const RACINE = fileURLToPath(new URL("../../../", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");

/** Le corpus, pour le H1 : il vient de `pages.titre_h1`, soit `heros.h1`. */
const CORPUS: {
  url: string;
  contenu: { sections: (Record<string, unknown> & { type: string; h1?: string })[] };
}[] = JSON.parse(
  readFileSync(join(RACINE, "supabase", "import", "corpus-analyse.json"), "utf8"),
);

const ATTENDUES = CORPUS.filter((entree) => entree.url.includes("/secteurs/")).map(
  (entree) => entree.url,
);
assert.ok(ATTENDUES.length > 0, "le corpus ne porte aucune page de secteur");

const FICHIERS = readdirSync(DOSSIER)
  .filter((nom) => nom.endsWith(".json"))
  .map((nom) => JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")))
  .filter(
    (fichier) =>
      typeof fichier.url === "string" &&
      fichier.url.startsWith("/secteurs/") &&
      fichier.contenu?.gabarit === "secteur",
  );

for (const url of ATTENDUES) {
  assert.ok(
    FICHIERS.some((fichier) => fichier.url === url),
    `aucun fichier de gabarit pour ${url} : la page resterait au gabarit de vente`,
  );
}

/** Tout texte du corpus doit SORTIR dans la page, markdown rendu. */
function textesDe(valeur: unknown, sortie: string[] = []): string[] {
  if (typeof valeur === "string") sortie.push(valeur);
  else if (Array.isArray(valeur)) for (const v of valeur) textesDe(v, sortie);
  else if (valeur && typeof valeur === "object") {
    for (const [cle, v] of Object.entries(valeur)) {
      // Une cible de lien n'est pas du texte ; `gabarit` et `type` sont des
      // drapeaux, et le mot « offre » n'a pas à être cherché dans la page.
      if (
        cle === "href" ||
        cle === "lienHref" ||
        cle === "gabarit" ||
        cle === "type"
      ) {
        continue;
      }
      textesDe(v, sortie);
    }
  }
  return sortie;
}

/** `[libellé](/cible/)` devient `libellé`, `**gras**` devient `gras`. */
function sansMarkdown(texte: string): string {
  return texte.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "");
}

for (const fichier of FICHIERS) {
  const entree = CORPUS.find((e) => e.url === fichier.url);
  assert.ok(entree, `${fichier.url} n'est pas dans le corpus`);
  const titre = entree.contenu.sections.find((s) => s.type === "heros")?.h1;
  assert.ok(titre, `${fichier.url} : le corpus ne donne pas de H1`);

  const contenu = fichier.contenu as ContenuSecteur;
  const rendu = renderToStaticMarkup(
    <PageSecteur titre={titre} contenu={contenu} />,
  );
  const texte = normalise(rendu);
  /* LE MÊME RENDU, BALISES RETIRÉES. Le maillage du corpus devient un lien au
     milieu d'une phrase (« par notre [bureau d'études](...) »), et le gras
     d'attaque un `strong` : cherchée dans le HTML, la phrase du corpus
     paraîtrait absente alors qu'elle est là, coupée par une balise. C'est aussi
     ce qui permet de voir un interdit coupé en deux par un `strong`. */
  const texteSansBalises = normalise(rendu.replace(/<[^>]*>/g, ""));
  const ou = fichier.url;

  /* UN SEUL H1, et c'est le titre de la page. Le complément passe par les blocs
     du gabarit de vente, dont le héros rend un H1 : s'il arrivait là, la page
     en porterait deux. */
  assert.equal(
    (rendu.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${ou} : la page doit porter exactement un h1`,
  );
  assert.ok(texte.includes(titre), `${ou} : le H1 du corpus est absent`);

  /* AUCUN LIEN MORT. La maquette navigue par sa propre logique et pose
     href="#" partout : un href="#" porté en production est un bouton qui ne
     mène nulle part. */
  assert.ok(!rendu.includes('href="#"'), `${ou} : un lien href="#" est rendu`);
  assert.ok(
    rendu.includes(`href="${ANCRE_FORMULAIRE}"`),
    `${ou} : aucun bouton ne vise l'ancre du formulaire de la page`,
  );

  /* LA CHARTE, PAS L'ÉCHAFAUDAGE. */
  const echafaudage = ECHAFAUDAGE.exec(rendu);
  assert.ok(!echafaudage, `${ou} : classe d'échafaudage rendue : ${echafaudage?.[0]}`);

  /* LES INTERDITS DE COPIE, qui gagnent contre la maquette. */
  for (const interdit of INTERDITS) {
    assert.ok(
      !texteSansBalises
        .toLocaleLowerCase("fr")
        .includes(interdit.toLocaleLowerCase("fr")),
      `${ou} : formulation interdite rendue : « ${interdit} »`,
    );
  }

  /* LA COPIE D'EXEMPLE DE LA MAQUETTE N'EST PAS UNE DONNÉE. */
  for (const exemple of EXEMPLES_MAQUETTE) {
    assert.ok(
      !texteSansBalises.includes(exemple),
      `${ou} : copie d'exemple de la maquette rendue : « ${exemple} »`,
    );
  }

  /* LE DESSIN VIENT DE LA MAQUETTE : les valeurs, relues plus haut. */
  memesValeurs(rendu, "padding:70px 40px 0");
  memesValeurs(rendu, "1.1fr .9fr");
  memesValeurs(rendu, "<h1 ");
  memesValeurs(rendu, "padding:32px 34px 34px");
  memesValeurs(rendu, "grid-template-columns:1fr 1fr");
  memesValeurs(rendu, "font:600 26px var(--ft)");
  memesValeurs(rendu, "font:400 12.5px/1.45 var(--fb)");
  memesValeurs(rendu, "repeat(4,minmax(0,1fr))");
  memesValeurs(rendu, "padding:30px 28px 32px");
  memesValeurs(rendu, "font:600 17px var(--ft)");
  memesValeurs(rendu, "Centre logistique", ["color:var(--ink1)"]);
  memesValeurs(rendu, "padding:52px");
  memesValeurs(rendu, "Votre secteur, vos contraintes.");
  // Le bouton du héros ne force pas `nowrap` : un libellé long doit pouvoir
  // passer à la ligne sur un écran de 320px plutôt que déborder.
  memesValeurs(rendu, "Parler de mon site", ["white-space"]);
  memesValeurs(rendu, "Décrire mon besoin", ["white-space"]);

  /* LES SURTITRES SONT CEUX DE LA MAQUETTE, au caractère près. Les surtitres
     en plus sont ceux des blocs rendus sous la maquette, qui portent les leurs. */
  const rendus = surtitresDe(rendu);
  for (const surtitre of SURTITRES) {
    assert.ok(
      rendus.includes(surtitre),
      `${ou} : surtitre de la maquette absent ou réécrit : « ${surtitre} », ` +
        `rendus : ${rendus.map((s) => `« ${s} »`).join(", ")}`,
    );
  }

  /* LE TEXTE VIENT DU CORPUS, ET IL SORT EN ENTIER. Une phrase rangée dans un
     champ que le gabarit ne rend pas serait du texte payé, perdu en silence. */
  for (const brut of textesDe(contenu)) {
    const attendu = normalise(sansMarkdown(brut));
    assert.ok(
      texteSansBalises.includes(attendu),
      `${ou} : texte du corpus absent du rendu : « ${attendu.slice(0, 70)} »`,
    );
  }

  /* LE CORPUS ENTIER, ET PAS SEULEMENT CE QUE LE FICHIER A GARDÉ.
     La boucle précédente prouve que le fichier sort en entier dans la page.
     Elle ne verrait pas une section du corpus que le fichier aurait oubliée :
     ce qui n'est plus écrit nulle part ne manque à personne. On repart donc du
     corpus rédigé, et on exige la même chose de lui.

     DEUX EXCEPTIONS, et elles sont le prix du gabarit : le héros de la maquette
     n'a ni ligne de téléphone ni ligne d'horaires. Le numéro et le rappel dans
     l'heure restent lisibles sur la page, portés par `cta.rappel` et par le
     paragraphe de l'appel final, tous deux vérifiés par la boucle précédente.
     Si cette liste s'allonge, c'est du texte payé qui disparaît. */
  const HORS_GABARIT = new Set(["telephone", "phraseDelai"]);
  for (const section of entree.contenu.sections) {
    for (const [cle, valeur] of Object.entries(section)) {
      if (cle === "type" || HORS_GABARIT.has(cle)) continue;
      for (const brut of textesDe(valeur)) {
        const attendu = normalise(sansMarkdown(brut));
        assert.ok(
          texteSansBalises.includes(attendu),
          `${ou} : texte du corpus perdu entre le corpus et la page ` +
            `(section « ${section.type} », champ « ${cle} ») : ` +
            `« ${attendu.slice(0, 70)} »`,
        );
      }
    }
  }

  /* LES SURTITRES DES BLOCS SOUS LA MAQUETTE, portés de la maquette eux aussi.
     Ils prouvent que le texte que la maquette ne dessine pas est bien rendu, et
     pas seulement stocké. */
  const types = new Set((contenu.complement ?? []).map((section) => section.type));
  for (const [type, surtitre] of [
    ["deroule", "Le déroulé"],
    ["garanties", "Nos engagements"],
    ["cta", "Prochaine étape"],
    ["preuves", "Nos dernières réalisations"],
    ["objections", "Questions fréquentes"],
  ] as const) {
    if (!types.has(type)) continue;
    assert.ok(
      texte.includes(surtitre),
      `${ou} : la section « ${type} » du corpus n'est pas rendue (« ${surtitre} » absent)`,
    );
  }
}

/* --------------------------------- une section sans donnée ne se rend pas du tout */

const renduSansComplement = renderToStaticMarkup(
  <PageSecteur
    titre="Un titre seul"
    contenu={{ gabarit: "secteur", complement: [] }}
  />,
);
assert.ok(
  !renduSansComplement.includes("<h2"),
  "un complément vide ne rend aucune section",
);

// Une section dont le type n'a pas de bloc est ÉCARTÉE, et n'emporte pas la page.
const renduTypeInconnu = renderToStaticMarkup(
  <PageSecteur
    titre="Un titre seul"
    contenu={{
      gabarit: "secteur",
      complement: [{ type: "inventee" } as unknown as Section],
    }}
  />,
);
assert.ok(
  !renduTypeInconnu.includes("<h2") && renduTypeInconnu.includes("Un titre seul"),
  "une section de type inconnu est écartée, la page se rend quand même",
);

console.log(
  `gabarit secteur : ${FICHIERS.length} pages montées sur leur contenu réel, ` +
    `valeurs relues dans la maquette, toutes les vérifications passent.`,
);
