/**
 * Contrôle du gabarit OFFRE, sans navigateur.
 *
 *   bun components/site/offre/verification-offre.tsx
 *
 * CE QUE CE CONTRÔLE GARANTIT, et pourquoi chaque point y est :
 *
 * 1. LES VALEURS DE LA MAQUETTE SONT RELUES DANS LE FICHIER à chaque exécution,
 *    jamais écrites de mémoire. `maquette/accueil-rendu.html` est versionné
 *    pour cela : une note de lecture peut se tromper, un fichier relu non. Si
 *    la maquette change, ce contrôle le dit.
 * 2. UN SEUL H1 par page. Le gabarit monte quatorze sections et trois
 *    composants d'accueil : un H1 de trop est invisible à l'œil, pas à Google.
 * 3. AUCUN `href="#"`. La maquette navigue par `sc-camel-on-click`, qui n'est
 *    pas porté : recopier ses `href="#"` aurait donné quatorze boutons morts.
 * 4. AUCUNE CLASSE TAILWIND DE COULEUR, aucune variante `dark:`. La charte vit
 *    dans les jetons de `app/globals.css`, et le site n'a pas de mode sombre.
 * 5. LE SEUL INTERDIT PERMANENT EST LE TIRET CADRATIN. Les prix et les délais
 *    chiffrés de la maquette sont PORTÉS depuis la décision de Mehdi du 05/10
 *    (« tu respectes AU MOT POUR MOT la maquette ») et inscrits dans
 *    `docs/RESERVES-CONTENU.md` pour arbitrage avant la mise en ligne. Ce
 *    contrôle disait l'inverse jusqu'au 05/10, et c'est lui qui validait un
 *    gabarit « propre » servant un texte que le client n'avait pas écrit.
 * 6. UNE SECTION SANS DONNÉE NE SE REND PAS DU TOUT. Pas de titre orphelin, pas
 *    de carte vide, pas de valeur inventée pour meubler.
 * 7. LA COPIE EST CONTRÔLÉE AILLEURS, et mieux : `scripts/verifie-mots-offre.mjs`
 *    résout les 198 chaînes d'`OFFERS` et compare au rendu réel des six pages,
 *    dans les deux sens. Ce contrôle-ci garde le DESSIN et la structure.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuOffre } from "@/types/offre";

import PageOffre from "./PageOffre";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));

/* -------------------------------------------- la maquette, relue à chaque fois */

/** Le gabarit `sc-if value="{{ isOfferPage }}"` de la maquette. */
function gabaritMaquette(): string {
  const entier = readFileSync(
    join(RACINE, "maquette", "accueil-rendu.html"),
    "utf8",
  );
  const debut = entier.indexOf('<sc-if value="{{ isOfferPage }}"');
  assert.ok(
    debut > -1,
    "le gabarit isOfferPage est introuvable dans maquette/accueil-rendu.html",
  );
  // La page d'offre est suivie de `isApropos` : on s'arrête là.
  const fin = entier.indexOf('<sc-if value="{{ isApropos }}"', debut);
  assert.ok(fin > debut, "la fin du gabarit isOfferPage est introuvable");
  return entier.slice(debut, fin);
}

const MAQUETTE = gabaritMaquette();

/**
 * Une déclaration de style de la maquette, relevée par la valeur qui l'ouvre.
 *
 * POURQUOI : le contrôle doit comparer ce que le composant rend à ce que la
 * maquette écrit, sans qu'aucune des deux valeurs soit saisie à la main ici.
 */
function styleMaquette(fragment: string): string {
  assert.ok(
    MAQUETTE.includes(fragment),
    `la maquette ne porte pas « ${fragment} » : valeur à revérifier`,
  );
  return fragment;
}

/** Ce que la maquette écrit en toutes lettres, et qui doit se retrouver rendu. */
function copieMaquette(texte: string): string {
  assert.ok(
    MAQUETTE.includes(texte),
    `la maquette ne porte pas la copie « ${texte} »`,
  );
  return texte;
}

/* ------------------------------------------------------- une page d'exemple */

/**
 * Une donnée d'exemple de la forme que l'import produit vraiment.
 *
 * Les quatre sections sous condition n'y figurent PAS, exactement comme dans
 * les dix-huit fichiers de `supabase/import/gabarits-maquette/` : c'est le
 * comportement qu'il faut vérifier, pas un cas de laboratoire.
 */
const OFFRE: ContenuOffre = {
  gabarit: "offre",
  mention: "Nous vous rappelons dans l'heure, du lundi au vendredi.",
  chapeau:
    "L'abonnement remplace vos dépannages subis par un programme de visites, décrit dans le [cahier des charges](/offres/residence/cahier-des-charges/).",
  actions: [
    { libelle: "Lancer mon diagnostic gratuit", href: "#formulaire" },
    { libelle: "Les cinq offres", href: "/offres/" },
    // Cible hors domaine : le lien doit DISPARAÎTRE, pas être rafistolé.
    { libelle: "Ailleurs", href: "https://exemple.test/" },
  ],
  formulaireHeroTitre: "Décrire mon besoin",
  formulaireHeroMention: "Rappel dans l'heure",
  brefSurtitre: "En bref",
  brefTitre: "Le cadre, en quatre chiffres.",
  chiffres: [
    { valeur: "+ 80", libelle: "clients réguliers", detail: "un contrat se renouvelle" },
    { valeur: "10 %", libelle: "des candidats retenus", detail: "chaque technicien est évalué" },
    { valeur: "4", libelle: "agences", detail: "Lyon siège, Montréal, Dubaï, Madrid" },
    { valeur: "24/24", libelle: "astreinte", detail: "en option au contrat" },
  ],
  brefBande: "Besoin de savoir si un abonnement vous coûterait moins cher ?",
  brefBouton: { libelle: "Lancer mon diagnostic", href: "#formulaire" },
  sections: [
    {
      type: "probleme",
      punchline: "Arrêtez de payer des dépannages.",
      puces: [
        { accroche: "La panne revient.", texte: "On traite le symptôme, jamais la cause." },
      ],
    },
    {
      type: "offre",
      lignes: [
        {
          prestation: { accroche: "Un plan de préventif", texte: "inventaire, points critiques." },
          benefice: "Les arrêts deviennent planifiés.",
        },
      ],
    },
    {
      type: "deroule",
      etapes: [{ titre: "Le diagnostic gratuit", texte: "quelques minutes suffisent." }],
    },
    {
      type: "garanties",
      puces: [{ accroche: "Des résultats mesurés", texte: "nombre d'incidents, disponibilité." }],
    },
    {
      type: "preuves",
      preuves: [
        {
          titre: "Maintenance préventive d'une fonderie",
          texte: "depuis octobre 2023",
          lienHref: "/preuves/stellantis-fonderie-sept-fons/",
          lienLibelle: "Étude de cas STELLANTIS",
        },
      ],
    },
    {
      type: "objections",
      questions: [
        { question: "Sur quelle durée s'engage-t-on ?", reponse: "Six mois renouvelable." },
      ],
    },
    {
      type: "ctaFinal",
      question: "Besoin d'un budget que vous connaissez en janvier ?",
      bouton: "Lancer mon diagnostic gratuit",
    },
  ],
  autresSurtitre: "Un autre besoin ?",
  autresTitre: "Chaque situation a son offre.",
  autres: [
    {
      phrase: "« J'ai besoin d'un renfort maintenance sur mon site. »",
      libelle: "Résidence",
      href: "/offres/residence/",
    },
    // Cible hors domaine : la carte doit DISPARAÎTRE.
    {
      phrase: "« Autre chose. »",
      libelle: "Ailleurs",
      href: "https://exemple.test/",
    },
  ],
};

const rendu = renderToStaticMarkup(
  <PageOffre
    titre="Contrat de maintenance"
    contenu={OFFRE}
    formulaire="verification-offre"
  />,
);

/* ---------------------------------------------- 1. la fidélité à la maquette */

for (const valeur of [
  // Le héros, l. 4708 à 4733.
  "max-width:1200px;margin:0 auto;padding:70px 40px 0",
  "grid-template-columns:1.12fr .88fr",
  "clamp(38px,4.4vw,66px)",
  "letter-spacing:-.045em",
  "font:400 17.5px/1.65 var(--fb)",
  // Les cartes de « En bref », l. 4766.
  "font:600 calc(34px * var(--ts))/1 var(--ft)",
  "letter-spacing:-.05em",
  "font:600 14.5px var(--ft)",
  "font:400 13.5px/1.5 var(--fb)",
  // La bande sous les chiffres, l. 4767.
  "padding:16px 16px 16px 26px",
  // Les cartes de « Un autre besoin ? », l. 5156.
  "font:500 15px/1.5 var(--fb)",
  "font:600 12.5px var(--fb)",
]) {
  const attendu = styleMaquette(valeur);
  const sansEspace = attendu.replace(/\s*([:;,])\s*/g, "$1");
  assert.ok(
    rendu.includes(attendu) || rendu.includes(sansEspace),
    `le rendu ne porte pas la valeur de la maquette « ${attendu} »`,
  );
}

// Les surtitres et les H2 que la maquette écrit en toutes lettres.
for (const texte of [
  "En bref",
  "Le cadre, en quatre chiffres.",
  "Décrire mon besoin",
  "Chaque situation a son offre.",
]) {
  assert.ok(
    rendu.includes(copieMaquette(texte)),
    `le rendu ne porte pas la copie de la maquette « ${texte} »`,
  );
}

// « Un autre besoin&nbsp;? » : la maquette écrit l'entité, React rend le
// caractère. On compare sur un texte normalisé, comme partout dans ce projet.
copieMaquette("Un autre besoin&nbsp;?");
assert.ok(
  rendu.replace(/ /g, " ").includes("Un autre besoin ?"),
  "le surtitre « Un autre besoin ? » doit être rendu",
);

/* ------------------------------------------------------------- 2. un seul h1 */

assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);
assert.ok(
  rendu.includes("Contrat de maintenance"),
  "le titre de la page doit être rendu dans le h1",
);

/* ------------------------------------------------- 3. aucune cible morte */

assert.ok(
  !/href="#"/.test(rendu),
  'aucun href="#" : la maquette navigue par sc-camel-on-click, qui n\'est pas porté',
);
assert.ok(
  !rendu.includes("exemple.test"),
  "une cible hors domaine ne doit jamais être rendue en lien",
);
assert.ok(
  !rendu.includes(">Ailleurs<") && !rendu.includes("Autre chose"),
  "un lien à cible refusée disparaît, libellé compris",
);
assert.ok(
  rendu.includes('href="#formulaire"'),
  "les appels à l'action visent l'ancre du formulaire de la page",
);

/* ----------------------------------------- 4. aucun échafaudage Tailwind */

for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|from|via|to|shadow|accent)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/.test(
      classe[1],
    ),
    `classe Tailwind de couleur dans le rendu : « ${classe[1] }». La charte vit dans les jetons de app/globals.css`,
  );
  assert.ok(
    !/\bdark:/.test(classe[1]),
    `variante dark: dans le rendu : « ${classe[1]} ». Le site n'a pas de mode sombre`,
  );
}

/* ------------------------- 5. le seul interdit permanent : le cadratin */

/**
 * LE TIRET CADRATIN, et lui seul.
 *
 * CE BLOC DISAIT L'INVERSE JUSQU'AU 05/10. Il vérifiait que « Recevoir le
 * tarif », « Prix mensuel fixe », « avant 16 h », « la régie classique » et six
 * autres formulations de la maquette étaient ABSENTES du rendu, au nom du
 * contrat du projet. La décision de Mehdi du 05/10 fait primer la maquette :
 * elles sont portées, et inscrites dans `docs/RESERVES-CONTENU.md` pour
 * arbitrage avant que migen.fr pointe sur le déploiement.
 *
 * Reste l'interdit PERMANENT, antérieur et indépendant de la maquette : aucun
 * tiret cadratin dans la copie visible. La maquette en porte dans quatre
 * phrases, chacune substituée par la ponctuation française équivalente sans
 * qu'un mot soit touché, et chacune déclarée dans
 * `scripts/produit_gabarit_offre.mjs` et `scripts/verifie-mots-offre.mjs`.
 */
const normalise = rendu.replace(/\u00a0/g, " ").replace(/\u2019/g, "'");
assert.ok(
  !normalise.includes("—"),
  "tiret cadratin dans le rendu : virgule, parenthèses ou deux-points",
);

/* --------------------------- 6. une section sans donnée ne se rend pas */

// Les quatre sections sous condition n'ont reçu aucune donnée : aucun de leurs
// titres ne doit apparaître, pas même orphelin.
for (const titre of [
  "Comment ça marche",
  "Trois formules",
  "Le comparatif",
  "Le premier mois",
  "La règle",
]) {
  assert.ok(
    MAQUETTE.includes(titre),
    `« ${titre} » n'est plus dans la maquette : ce contrôle est à relire`,
  );
  assert.ok(
    !rendu.includes(titre),
    `la section « ${titre} » ne reçoit aucune donnée : elle ne doit pas se rendre`,
  );
}

/* LA BANDE DE REPÈRES ET LA PASTILLE : LE CHEMIN DE L'ABSENCE, ET LUI SEUL.

   CE QUE CES DEUX ASSERTIONS DISAIENT JUSQU'ICI, et c'était faux : « sans
   repères la bande ne se rend pas » était commenté « le corpus n'écrit nulle
   part » ces valeurs. Les dix-huit gabarits en écrivent TROIS chacun, et
   `/offres/residence/` sert bien la bande, son filet `height:34px` et la
   pastille. Les deux contrôles ne portaient que sur le gabarit d'exemple
   ci-dessus, qui ne déclare ni l'un ni l'autre : ils ne pouvaient donc plus
   échouer sur la donnée de production, qui rend l'inverse.

   ILS RESTENT, mais pour ce qu'ils prouvent vraiment : qu'une donnée ABSENTE ne
   laisse pas de filet ni de pastille orphelins. Le chemin de la PRÉSENCE est
   contrôlé plus bas, sur les dix-huit pages réelles. */
assert.ok(
  !rendu.includes("height:34px"),
  "le gabarit d'exemple ne déclare pas de repères : la bande et ses filets ne doivent pas se rendre",
);
assert.ok(
  MAQUETTE.includes("font:600 12px var(--fb)"),
  "la pastille du héros n'est plus dans la maquette : ce contrôle est à relire",
);
assert.ok(
  !rendu.includes("font:600 12px var(--fb)"),
  "le gabarit d'exemple ne déclare pas de pastille : elle ne doit pas se rendre",
);

// Le maillage du corpus écrit en Markdown doit sortir en lien, pas en crochets.
assert.ok(
  rendu.includes('href="/offres/residence/cahier-des-charges') &&
    !rendu.includes("[cahier des charges]"),
  "le chapeau du héros doit passer par TexteRiche",
);

/* L'ORDRE DES BLOCS, et c'est un défaut qui ne se voit qu'à la lecture de la
   page entière. « Un autre besoin ? / Chaque situation a son offre. » est la
   SORTIE vers les autres offres : la maquette en fait son avant-dernier bloc,
   juste avant le formulaire. Le portage la rendait AVANT les six sections de
   corpus, donc avant « Ce que nous garantissons. » et avant le formulaire : le
   lecteur était invité à partir au milieu de la page.

   Et la section `preuves` du corpus prend la place 11 de la maquette quand la
   page n'a pas ses trois cartes à photo, au lieu de tomber en fin de page : les
   douze pages de `/offres/` sans clé `OFFERS` avaient sinon une architecture de
   page différente des six autres. */
const ordre = (texte: string) => {
  const rang = rendu.indexOf(texte);
  assert.ok(rang > -1, `« ${texte} » n'est pas rendu : ordre invérifiable`);
  return rang;
};
assert.ok(
  ordre("Ce que nous avons fait, chez qui, et comment") <
    ordre("Questions fréquentes"),
  "sans cartes à photo, la section « preuves » du corpus prend la place 11, avant la FAQ",
);
assert.ok(
  ordre("Questions fréquentes") < ordre("Ce que nous garantissons."),
  "le texte du corpus se rend APRÈS la FAQ, emplacement que la maquette lui donne",
);
assert.ok(
  ordre("Ce que nous garantissons.") < ordre("Chaque situation a son offre."),
  "« Chaque situation a son offre. » est le dernier bloc avant le formulaire, comme dans la maquette",
);

// Les animations viennent de Moteurs.tsx : le gabarit ne pose que l'attribut.
assert.ok(
  (rendu.match(/data-reveal/g) ?? []).length >= 3,
  "chaque section sous le héros porte data-reveal",
);

/* ------------------------------------------- un contenu réduit à son gabarit */

const VIDE: ContenuOffre = { gabarit: "offre" };
const renduVide = renderToStaticMarkup(
  <PageOffre titre="Un titre seul" contenu={VIDE} formulaire="vide" />,
);

assert.equal(
  (renduVide.match(/<h1[\s>]/g) ?? []).length,
  1,
  "un contenu vide rend le titre, et rien de plus",
);
assert.ok(
  !renduVide.includes("En bref"),
  "sans chiffres, la section « En bref » ne se rend pas",
);
assert.ok(
  !renduVide.includes("Chaque situation a son offre"),
  "sans autres offres, la section « Un autre besoin ? » ne se rend pas",
);
assert.ok(
  !renduVide.includes("1.12fr .88fr"),
  "sans en-tête de formulaire, le héros tient sur une colonne",
);

/* ------------------------- les dix-huit pages réelles, telles qu'elles iront en base */

/**
 * Le même contrôle, sur la DONNÉE RÉELLE des dix-huit pages.
 *
 * POURQUOI EN PLUS de la page d'exemple : l'exemple vérifie le gabarit, pas le
 * contenu. Or ce qui part en base, c'est `supabase/import/gabarits-maquette/`,
 * produit par `scripts/produit_gabarit_offre.mjs` depuis le corpus rédigé. Un
 * interdit de copie peut très bien venir du corpus et non du gabarit, et seule
 * la donnée réelle le montre. Sans ce passage, le contrôle aurait validé un
 * gabarit propre servant dix-huit pages fautives.
 */
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const fichiers = readdirSync(DOSSIER)
  .filter((n) => n.startsWith("offres-") && n.endsWith(".json"))
  .sort();

assert.equal(
  fichiers.length,
  18,
  `18 pages d'offre attendues dans ${DOSSIER}, ${fichiers.length} trouvée(s)`,
);

/** Les six pages dont le texte vient d'`OFFERS`, mot pour mot. */
const PAGES_OFFERS = new Set([
  "offres-residence.json",
  "offres-zero-arret.json",
  "offres-arret-technique.json",
  "offres-chantier.json",
  "offres-bureau-etudes.json",
  "offres-construction.json",
]);

let avecOffers = 0;
for (const nom of fichiers) {
  const brut = JSON.parse(
    readFileSync(join(DOSSIER, nom), "utf8"),
  ) as { url: string; contenu: ContenuOffre };

  assert.equal(
    brut.contenu.gabarit,
    "offre",
    `${nom} : le contenu doit se déclarer « offre », sinon la route retombe sur le gabarit de vente`,
  );

  const page = renderToStaticMarkup(
    <PageOffre
      titre={`Titre de ${brut.url}`}
      contenu={brut.contenu}
      formulaire={`cocon${brut.url.replace(/\//g, "-")}`}
      // Pas de fil d'Ariane ni de maillage : ils interrogent la base.
    />,
  );

  assert.equal(
    (page.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${nom} : exactement un h1 attendu`,
  );
  assert.ok(!/href="#"/.test(page), `${nom} : un href="#" est rendu`);

  /* LA BANDE DE REPÈRES ET LA PASTILLE DU HÉROS SE RENDENT, SUR LES DIX-HUIT.
     C'est le chemin de la PRÉSENCE, celui que la donnée de production emprunte
     et que le contrôle ne jouait pas : les deux assertions du gabarit d'exemple
     ne parlent que de l'absence. Les deux chiffres portés ici (« 5 agences en
     France », « +200 clients industriels ») viennent de la maquette et
     contredisent les faits autorisés : voir la réserve 5.3 de
     `docs/RESERVES-CONTENU.md`. Tant que Mehdi n'a pas tranché, ils sont rendus
     mot pour mot, et ce contrôle le PROUVE au lieu de laisser croire le
     contraire. */
  assert.ok(
    (brut.contenu.reperes ?? []).length >= 2,
    `${nom} : la bande de repères du héros doit porter au moins deux repères`,
  );
  assert.ok(
    page.includes("height:34px"),
    `${nom} : la bande de repères porte des repères, son filet doit se rendre`,
  );
  assert.ok(brut.contenu.pastille, `${nom} : la pastille du héros manque`);
  assert.ok(
    page.includes("font:600 12px var(--fb)"),
    `${nom} : la pastille du héros est déclarée, elle doit se rendre`,
  );

  /* L'ORDRE DE LA MAQUETTE, sur la donnée réelle : la sortie vers les autres
     offres est le dernier bloc avant le formulaire. */
  if (brut.contenu.autresTitre) {
    const sortie = page.indexOf(brut.contenu.autresTitre);
    const formulaire = page.indexOf('id="formulaire"');
    assert.ok(
      sortie > -1 && formulaire > sortie,
      `${nom} : « ${brut.contenu.autresTitre} » doit être le dernier bloc avant le formulaire`,
    );
  }

  const texte = page.replace(/\u00a0/g, " ").replace(/\u2019/g, "'");
  assert.ok(
    !texte.includes("—"),
    `${nom} : tiret cadratin rendu, interdit dans toute copie visible`,
  );

  /* LES QUATRE SECTIONS SOUS CONDITION NE SE RENDENT QUE SUR ZÉRO ARRÊT, et
     elles s'y rendent VRAIMENT : c'est le `sc-if value="{{ of.isZero }}"` de la
     maquette, et le contraire des deux côtés serait un défaut. Le tableau
     comparatif en fait partie : il était écrit dans le JSON et lu par personne. */
  const sousCondition = ["Comment ça marche", "Trois formules", "Le comparatif", "Le premier mois"];
  if (brut.url === "/offres/zero-arret/") {
    for (const titre of sousCondition) {
      assert.ok(
        page.includes(titre),
        `${nom} : la section « ${titre} » doit se rendre sur Zéro Arrêt`,
      );
    }
    assert.ok(
      page.includes("Ligne par ligne") && page.includes("Préventif samedi"),
      `${nom} : le tableau comparatif des formules doit se rendre`,
    );
  } else {
    for (const titre of sousCondition) {
      assert.ok(
        !page.includes(titre),
        `${nom} : la maquette ne dessine « ${titre} » que sur Zéro Arrêt`,
      );
    }
  }

  if (!PAGES_OFFERS.has(nom)) continue;
  avecOffers += 1;

  /* ---- CE QUE LES SIX PAGES À CLÉ `OFFERS` DOIVENT PORTER ---------------
     Le détail du texte est contrôlé par `scripts/verifie-mots-offre.mjs`, qui
     résout les 198 chaînes. Ici on vérifie la STRUCTURE : aucun des quatre
     champs ne doit pouvoir redevenir vide sans que ça se voie. */
  const contenu = brut.contenu;
  assert.ok(contenu.titreA && contenu.titreB, `${nom} : le H1 en deux encres manque`);
  assert.equal(contenu.chiffres?.length, 4, `${nom} : « En bref » doit porter quatre chiffres`);
  for (const chiffre of contenu.chiffres ?? []) {
    assert.ok(chiffre.detail, `${nom} : la légende du chiffre « ${chiffre.valeur} » manque`);
  }
  assert.ok(contenu.incTitre && contenu.incChapeau, `${nom} : l'en-tête de « Ce qui est inclus » manque`);
  assert.equal(contenu.porte?.length, 5, `${nom} : « Ce que migen© porte » doit porter cinq lignes`);
  assert.equal(contenu.resteChezVous?.length, 4, `${nom} : « Ce qui reste chez vous » doit porter quatre lignes`);
  assert.equal(contenu.realisations?.cartes.length, 3, `${nom} : trois cartes de réalisation attendues`);
  assert.ok(contenu.selectionCta, `${nom} : le lien d'en-tête de « Notre sélection » manque`);
  assert.ok(contenu.autresChapeau, `${nom} : le chapeau de « Un autre besoin ? » manque`);
  assert.ok(contenu.faqBouton, `${nom} : le bouton « Poser ma question » manque`);

  // Le H1 en deux encres, et la seconde partie en var(--ink4) comme la maquette.
  assert.ok(
    page.includes(contenu.titreA ?? "") &&
      page.includes('style="color:var(--ink4)"'),
    `${nom} : le H1 doit se rendre en deux encres`,
  );
  // Les deux panneaux face à face, et la barrette dessous.
  for (const attendu of [
    contenu.incTitre ?? "",
    "Ce que migen© porte",
    "Ce qui reste chez vous",
    contenu.incBande ?? "",
  ]) {
    assert.ok(page.includes(attendu), `${nom} : « ${attendu} » n'est pas rendu`);
  }
}

assert.equal(avecOffers, PAGES_OFFERS.size, "les six pages à clé OFFERS doivent toutes être contrôlées");

console.log(`  ${fichiers.length} pages réelles rendues et vérifiées.`);

console.log("gabarit offre : toutes les vérifications passent.");
console.log(
  `  ${MAQUETTE.split("\n").length} lignes de maquette relues, ` +
    "aucun tiret cadratin rendu. Le TEXTE des six offres est contrôlé par " +
    "scripts/verifie-mots-offre.mjs, qui résout les 198 chaînes d'OFFERS.",
);
