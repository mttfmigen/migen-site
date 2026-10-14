/**
 * LA PORTE DU HAUT DE PAGE MOBILE DU HUB /ressources/ (maquette mobile v2).
 *
 *   bun components/site/ressources-hub/verification-haut-de-page.tsx
 *   bun components/site/ressources-hub/verification-haut-de-page.tsx --controle
 *
 * CE QU'ELLE TIENT, règle par règle :
 *
 *   1. LES LIBELLÉS SONT CEUX DE LA MAQUETTE, relus DANS la maquette mobile
 *      v2 et non recopiés de mémoire : le kicker du bloc `isResTop` et la
 *      phrase d'annonce « entreprises » de `resV.sub`. Une apostrophe droite
 *      à la place de la typographique, une majuscule de trop, et la porte
 *      tombe.
 *   2. LE BLOC REND CES LIBELLÉS. Les constantes peuvent être justes et le
 *      JSX ne pas les monter : on vérifie le rendu, pas la source.
 *   3. LE BLOC N'EXISTE QUE SOUS 881 PX. Le module CSS doit le masquer par
 *      défaut (`display: none`, donc bureau inchangé au pixel) et ne
 *      l'afficher que dans un `@media (max-width: 880px)`, le seuil mobile
 *      du dépôt. Le texte, lui, reste dans le DOM aux deux largeurs.
 *   4. LA GREFFE N'AJOUTE QU'ELLE-MÊME. Le hub est monté deux fois, sans et
 *      avec le haut de page : le rendu d'avant doit être EXACTEMENT le rendu
 *      d'après amputé du bloc, au caractère près. C'est la traduction de
 *      « textContent inchangé ou en hausse » en quelque chose qui sait
 *      échouer : un mot du héros ou de la bibliothèque perdu, et la porte
 *      tombe. Et il n'y a toujours qu'UN SEUL H1 : le bloc n'en apporte pas.
 *   5. ZÉRO LIEN PERDU. Chaque `href` du rendu d'avant est dans le rendu
 *      d'après, occurrence pour occurrence, et le bloc n'en ajoute aucun.
 *   6. LA COPIE RESPECTE LE CONTRAT. Aucun montant, aucun délai chiffré,
 *      aucun mot proscrit, aucun tiret cadratin dans ce que le bloc rend.
 *   7. LE PANNEAU SOMBRE (`AppelRessourcesMobile`) EST CELUI DE LA MAQUETTE.
 *      Ses six libellés, deux espaces fois surtitre, phrase et bouton, sont
 *      relus dans `resV` (`ctaK`, `ctaT`, `ctaL`) et comparés verbatim ; il
 *      porte `data-mobile-seulement`, sans quoi il paraîtrait sur bureau ; sa
 *      copie passe la règle 6.
 *   8. « À LA UNE » AU REPOS. La grille servie, filtres au repos, range ses
 *      cartes « une », « duo », « duo », puis « rang » : c'est l'ordre de
 *      `res.feat`, `res.feat2` et `res.items` de la maquette mobile.
 *
 * ELLE SAIT ÉCHOUER : `--controle` rejoue chaque règle sur une donnée fautive
 * et exige que LA RÈGLE VISÉE tombe. Treize témoins négatifs, dont « un
 * paragraphe du hub effacé », qui prouve que la porte voit une section perdre
 * son texte, et un témoin positif : la donnée réelle doit passer.
 *
 * Outil de vérification, jamais importé par l'application.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";

import Guide from "@/components/site/editorial/Guide";
import type { VueGuide } from "@/types/editorial";

import BibliothequeRessources from "./BibliothequeRessources";
import { bibliotheque } from "./catalogue";
import HautDePageRessources, {
  APPEL_RESSOURCES,
  AppelRessourcesMobile,
  KICKER_RESSOURCES,
  SOUS_TITRE_RESSOURCES,
} from "./HautDePageRessources";

const RACINE = join(import.meta.dirname, "..", "..", "..");
const MAQUETTE_MOBILE = join(
  RACINE,
  "maquette",
  "mobile-v2",
  "maquette",
  "Migen - Mobile v2.dc.html",
);
const MODULE_CSS = join(
  import.meta.dirname,
  "HautDePageRessources.module.css",
);

const echecs: string[] = [];
function exige(regle: string, fn: () => void) {
  try {
    fn();
  } catch (erreur) {
    echecs.push(`${regle} : ${(erreur as Error).message}`);
  }
}

/* --------------------------------------------- la donnée de la maquette */

/**
 * Les deux libellés relus DANS la maquette mobile v2 : le kicker est le
 * `<div>` orange qui précède le `<h1>` du bloc `isResTop`, la phrase
 * d'annonce est la branche « entreprises » de `resV.sub` (la branche
 * « tech » appartient aux filtres de la bibliothèque, hors de ce lot).
 */
function libellesMaquette(): { kicker: string; sous: string } {
  const brut = readFileSync(MAQUETTE_MOBILE, "utf8");

  const bloc = brut.match(
    /\{\{ isResTop \}\}[^]*?color:#ff7c3c">([^<]+)<\/div><h1/,
  );
  assert.ok(bloc, "le kicker du bloc isResTop est introuvable dans la maquette");

  const sous = brut.match(/sub: tech \? "[^"]*" : "([^"]+)"/);
  assert.ok(sous, "la phrase d'annonce resV.sub est introuvable dans la maquette");

  return { kicker: bloc[1], sous: sous[1] };
}

/* ------------------------------------------------------------ le rendu */

/** Le même hub minimal que `verification-hub.tsx` : seul le format compte. */
const VUE_HUB: VueGuide = {
  format: "Ressources",
  lecture: "6 min de lecture",
  ariane: [{ label: "Accueil", href: "/" }, { label: "Guide maintenance industrielle" }],
  chapeau: "Un guide maintenance industrielle ne vaut que s'il fait gagner du temps en atelier.",
  intro: [{ type: "p", texte: "Pas de théorie hors sol." }],
  sections: [{ titre: "Cinq rayons, un objectif : agir", blocs: [{ type: "p", texte: "Le savoir utile change selon le moment." }] }],
  liees: [],
  formulaire: "cocon-ressources",
};

/** Le hub tel que `app/ressources/page.tsx` le compose, avec ou sans le bloc. */
function renduHub(avecHaut: boolean): string {
  const biblio = <BibliothequeRessources bibliotheque={bibliotheque()} />;
  return renderToStaticMarkup(
    <Guide
      titre="Guide maintenance industrielle"
      vue={VUE_HUB}
      bibliotheque={
        avecHaut ? (
          <>
            <HautDePageRessources />
            {biblio}
          </>
        ) : (
          biblio
        )
      }
    />,
  );
}

const enTexte = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hrefsDe = (html: string): Map<string, number> => {
  const comptes = new Map<string, number>();
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    comptes.set(href, (comptes.get(href) ?? 0) + 1);
  }
  return comptes;
};

/* ----------------------------------------------------- les six règles */

/** 1. Les constantes du composant sont celles de la maquette, verbatim. */
function regleLibelles(kicker: string, sous: string) {
  const maquette = libellesMaquette();
  assert.equal(
    kicker,
    maquette.kicker,
    `le kicker dévie de la maquette : « ${kicker} » au lieu de « ${maquette.kicker} »`,
  );
  assert.equal(
    sous,
    maquette.sous,
    `la phrase d'annonce dévie de la maquette : « ${sous} » au lieu de « ${maquette.sous} »`,
  );
}

/** 2. Le rendu du bloc porte les deux libellés. */
function regleRendu(bloc: string) {
  const texte = enTexte(bloc);
  assert.ok(
    texte.includes(KICKER_RESSOURCES),
    `le kicker « ${KICKER_RESSOURCES} » n'est pas dans le rendu du bloc`,
  );
  assert.ok(
    texte.includes(SOUS_TITRE_RESSOURCES),
    "la phrase d'annonce n'est pas dans le rendu du bloc",
  );
}

/** 3. Masqué par défaut, affiché sous 881 px seulement, texte toujours servi. */
function regleMobileSeulement(css: string) {
  const sansMedia = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");
  assert.match(
    sansMedia,
    /\.haut\s*\{[^}]*display:\s*none/,
    "hors de tout @media, .haut n'est pas masqué : le bureau changerait",
  );
  const media = css.match(/@media\s*\(max-width:\s*880px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(
    media,
    "aucun bloc @media (max-width: 880px) : le seuil mobile du dépôt n'est pas tenu",
  );
  assert.match(
    media[1],
    /\.haut\s*\{[^}]*display:\s*block/,
    "sous 880 px, .haut n'est pas affiché : le haut de page mobile n'existe nulle part",
  );
  assert.doesNotMatch(
    css,
    /visibility:\s*hidden|font-size:\s*0|content-visibility/,
    "le texte doit rester servi tel quel : seule la boîte se masque, par display",
  );
}

/** 4. Le rendu d'avant est le rendu d'après amputé du bloc, au caractère près. */
function regleGreffe(sans: string, avec: string, bloc: string) {
  assert.ok(
    avec.includes(bloc),
    "le haut de page n'est pas dans le rendu du hub, la greffe n'a pas pris",
  );
  assert.ok(
    avec.length > sans.length,
    `le rendu avec haut de page (${avec.length} octets) n'est pas plus riche que sans (${sans.length})`,
  );
  const ampute = avec.replace(bloc, "");
  if (ampute !== sans) {
    let k = 0;
    while (k < ampute.length && ampute[k] === sans[k]) k += 1;
    assert.fail(
      `le hub a changé ailleurs que dans le haut de page, à « ${sans.slice(Math.max(0, k - 60), k + 60)} » devenu « ${ampute.slice(Math.max(0, k - 60), k + 60)} »`,
    );
  }
  const h1 = avec.match(/<h1[\s>]/g) ?? [];
  assert.equal(
    h1.length,
    1,
    `${h1.length} <h1> dans le rendu : le haut de page ne doit pas en apporter`,
  );
}

/** 5. Chaque lien d'avant est encore là, et le bloc n'en ajoute aucun. */
function regleLiens(sans: string, avec: string) {
  const avant = hrefsDe(sans);
  const apres = hrefsDe(avec);
  for (const [href, n] of avant) {
    assert.ok(
      (apres.get(href) ?? 0) >= n,
      `lien perdu : ${href} (${n} avant, ${apres.get(href) ?? 0} après)`,
    );
  }
  const total = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);
  assert.equal(
    total(apres),
    total(avant),
    "le haut de page ajoute un lien : ce bloc n'en porte aucun dans la maquette",
  );
}

/** 6. La copie du bloc respecte le contrat éditorial. */
const PROSCRITS: readonly [RegExp, string][] = [
  [/\bint[ée]rim\b/iu, "intérim"],
  [/\bnotamment\b/iu, "notamment"],
  [/\bsur mesure\b/iu, "sur mesure"],
  [/\bcl[ée] en main\b/iu, "clé en main"],
  [/\br[ée]gie\b/iu, "régie"],
  [/\blevier\b/iu, "levier"],
  [/\bmise [àa] disposition\b/iu, "mise à disposition"],
  [/\bsans engagement\b/iu, "sans engagement"],
  [/\bconcr[èe]tement\b/iu, "concrètement"],
  [/\bincontournable\b/iu, "incontournable"],
  [/\bd[ée]couvrez\b/iu, "découvrez"],
  [/—/u, "tiret cadratin"],
  [/\d[\d\s.,]*\s*(?:€|euros?)/iu, "un montant"],
  [/\bsous\s+\d+\s*(?:h|heures?|jours?)\b/iu, "un délai chiffré"],
];

function regleCopie(rendu: string) {
  const texte = enTexte(rendu);
  for (const [motif, nom] of PROSCRITS) {
    const trouve = texte.match(motif);
    assert.equal(trouve, null, `« ${nom} » apparaît dans la copie rendue : « ${trouve?.[0]} »`);
  }
}

/** 7. Le panneau sombre : libellés verbatim, téléphone seulement. */
type LibellesAppel = Record<
  keyof typeof APPEL_RESSOURCES,
  { surtitre: string; phrase: string; bouton: string }
>;

function libellesAppelMaquette(): LibellesAppel {
  const brut = readFileSync(MAQUETTE_MOBILE, "utf8");
  const lit = (cle: string) => {
    const m = brut.match(new RegExp(`${cle}: tech \\? "([^"]+)" : "([^"]+)"`));
    assert.ok(m, `${cle} est introuvable dans la maquette`);
    return { techniciens: m[1], entreprises: m[2] };
  };
  const [surtitre, phrase, bouton] = ["ctaK", "ctaT", "ctaL"].map(lit);
  return {
    entreprises: { surtitre: surtitre.entreprises, phrase: phrase.entreprises, bouton: bouton.entreprises },
    techniciens: { surtitre: surtitre.techniciens, phrase: phrase.techniciens, bouton: bouton.techniciens },
  };
}

function regleAppel(appel: LibellesAppel, rendus: readonly string[]) {
  const maquette = libellesAppelMaquette();
  for (const espace of ["entreprises", "techniciens"] as const) {
    for (const cle of ["surtitre", "phrase", "bouton"] as const) {
      assert.equal(
        appel[espace][cle],
        maquette[espace][cle],
        `${espace}.${cle} dévie de la maquette : « ${appel[espace][cle]} » au lieu de « ${maquette[espace][cle]} »`,
      );
    }
  }
  for (const rendu of rendus) {
    assert.match(
      rendu,
      /^<aside\b[^>]*\bdata-mobile-seulement=""/,
      "le panneau n'est pas marqué data-mobile-seulement : il paraîtrait sur bureau",
    );
    regleCopie(rendu);
  }
}

/** 8. Au repos, la grille servie range « une », « duo », « duo », puis « rang ». */
function regleUne(rendu: string) {
  const places = [...rendu.matchAll(/data-place="([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(places.length > 3, `${places.length} carte(s) placée(s) dans la grille servie`);
  assert.deepEqual(
    places.slice(0, 3),
    ["une", "duo", "duo"],
    `la grille commence par ${places.slice(0, 3).join(", ")} au lieu de une, duo, duo`,
  );
  assert.ok(
    places.slice(3).every((p) => p === "rang"),
    "une carte au-delà de la troisième n'est pas une rangée",
  );
}

/* --------------------------------------------------------- la campagne */

const css = readFileSync(MODULE_CSS, "utf8");
const blocSeul = renderToStaticMarkup(<HautDePageRessources />);
const sansHaut = renduHub(false);
const avecHaut = renduHub(true);
const appels = (["entreprises", "techniciens"] as const).map((espace) =>
  renderToStaticMarkup(<AppelRessourcesMobile espace={espace} />),
);

exige("1. libellés verbatim de la maquette mobile", () =>
  regleLibelles(KICKER_RESSOURCES, SOUS_TITRE_RESSOURCES),
);
exige("2. le bloc rend les deux libellés", () => regleRendu(blocSeul));
exige("3. visible sous 881 px seulement", () => regleMobileSeulement(css));
exige("4. la greffe n'ajoute qu'elle-même", () => regleGreffe(sansHaut, avecHaut, blocSeul));
exige("5. zéro lien perdu", () => regleLiens(sansHaut, avecHaut));
exige("6. copie conforme au contrat", () => regleCopie(blocSeul));
exige("7. le panneau sombre de la maquette", () => regleAppel(APPEL_RESSOURCES, appels));
exige("8. « À la une » au repos", () => regleUne(avecHaut));

/* ----------------------------------------------------------- les témoins */

/**
 * QUATORZE TÉMOINS. Treize rendent fausse une donnée juste et exigent que la
 * règle visée tombe ; le dernier exige que la donnée réelle passe, sans quoi une
 * porte qui refuse tout aurait l'air de fonctionner.
 */
function temoins() {
  const tombe = (nom: string, fn: () => void) => {
    let message: string | null = null;
    try {
      fn();
      message = null;
    } catch (e) {
      message = (e as Error).message;
    }
    if (message === null) {
      console.error(`  TÉMOIN MUET  ${nom} : la règle n'a pas échoué sur une donnée fautive`);
      return false;
    }
    console.log(`  témoin  ${nom}\n            → ${message.split("\n")[0].slice(0, 150)}`);
    return true;
  };
  const passe = (nom: string, fn: () => void) => {
    try {
      fn();
      console.log(`  témoin  ${nom} : la donnée réelle passe`);
      return true;
    } catch (e) {
      console.error(`  TÉMOIN FAUX  ${nom} : ${(e as Error).message.split("\n")[0]}`);
      return false;
    }
  };

  const resultats = [
    // 1. Une majuscule de trop, la dérive la plus discrète possible.
    tombe("un kicker qui dévie de la maquette", () =>
      regleLibelles("Ressources Migen", SOUS_TITRE_RESSOURCES),
    ),
    // 1 bis. L'apostrophe typographique remplacée par la droite.
    tombe("l'apostrophe droite au lieu de la typographique", () =>
      regleLibelles(KICKER_RESSOURCES, SOUS_TITRE_RESSOURCES.replace("qu’elles", "qu'elles")),
    ),
    // 2. Le sous-titre sorti du rendu.
    tombe("la phrase d'annonce retirée du bloc", () =>
      regleRendu(blocSeul.replace(SOUS_TITRE_RESSOURCES, "")),
    ),
    // 3. Le @media retiré : le bloc n'existerait plus nulle part.
    tombe("le @media retiré du module CSS", () =>
      regleMobileSeulement(css.replace(/@media[^{]*\{[\s\S]*?\n\}/, "")),
    ),
    // 3 bis. Le masquage de bureau retiré : le bureau changerait. Le
    // remplacement est GLOBAL : la première occurrence de « display: none »
    // vit dans le commentaire du module, pas dans la règle.
    tombe("le bloc visible sur bureau", () =>
      regleMobileSeulement(css.replace(/display:\s*none/g, "display: block")),
    ),
    // 4. UNE SECTION PERD SON TEXTE : le témoin exigé par le lot. Un
    // paragraphe du hub est effacé du rendu d'après, la règle doit le voir.
    tombe("un paragraphe du hub effacé", () =>
      regleGreffe(sansHaut, avecHaut.replace("Pas de théorie hors sol.", ""), blocSeul),
    ),
    // 4 bis. Le bloc absent du rendu : la greffe n'a pas pris.
    tombe("le haut de page absent du rendu", () =>
      regleGreffe(sansHaut, sansHaut, blocSeul),
    ),
    // 4 ter. Un deuxième H1 glissé par le bloc. Sous bun, les classes des
    // modules CSS ne sortent pas dans le balisage : on vise la balise nue.
    tombe("un deuxième H1 dans le rendu", () => {
      const blocFautif = blocSeul.replace(/<p([\s>])/, "<h1$1").replace("</p>", "</h1>");
      regleGreffe(sansHaut, avecHaut.replace(blocSeul, blocFautif), blocFautif);
    }),
    // 5. Un lien de la bibliothèque perdu.
    tombe("un lien de la bibliothèque perdu", () =>
      regleLiens(sansHaut, avecHaut.replace(/<a\b[^>]*\bhref="\/ressources\/articles\/[^"]*"/, "<a ")),
    ),
    // 6. Un montant glissé dans la copie du bloc.
    tombe("un montant dans le bloc", () =>
      regleCopie(`${blocSeul}<p>850 € par mois</p>`),
    ),
    // 7. L'apostrophe droite glissée dans la phrase du panneau.
    tombe("la phrase du panneau qui dévie de la maquette", () =>
      regleAppel(
        {
          ...APPEL_RESSOURCES,
          entreprises: {
            ...APPEL_RESSOURCES.entreprises,
            phrase: APPEL_RESSOURCES.entreprises.phrase.replace("d’affaires", "d'affaires"),
          },
        },
        appels,
      ),
    ),
    // 7 bis. Le panneau sans sa marque mobile : il paraîtrait sur bureau.
    tombe("le panneau visible sur bureau", () =>
      regleAppel(APPEL_RESSOURCES, appels.map((a) => a.replace(' data-mobile-seulement=""', ""))),
    ),
    // 8. La une rétrogradée en rangée.
    tombe("la une rétrogradée en rangée", () =>
      regleUne(avecHaut.replace('data-place="une"', 'data-place="rang"')),
    ),
    // Le témoin positif.
    passe("la donnée réelle", () => {
      regleLibelles(KICKER_RESSOURCES, SOUS_TITRE_RESSOURCES);
      regleRendu(blocSeul);
      regleMobileSeulement(css);
      regleGreffe(sansHaut, avecHaut, blocSeul);
      regleLiens(sansHaut, avecHaut);
      regleCopie(blocSeul);
      regleAppel(APPEL_RESSOURCES, appels);
      regleUne(avecHaut);
    }),
  ];
  return resultats.every(Boolean);
}

/* ------------------------------------------------------------- rapport */

const controle = process.argv.includes("--controle");

console.log(
  `Haut de page /ressources/ : ${enTexte(blocSeul).split(" ").length} mots ajoutés, ` +
    `${hrefsDe(blocSeul).size} lien ajouté, rendu du hub ${sansHaut.length} → ${avecHaut.length} octets`,
);

if (controle) {
  console.log("\nTémoins :");
  if (!temoins()) {
    console.error("\nUn témoin au moins n'a pas fait son office : la porte ne prouve plus rien.");
    process.exit(1);
  }
  console.log("\nTous les témoins ont joué leur rôle.");
}

if (echecs.length > 0) {
  console.error(`\n${echecs.length} règle(s) en échec :`);
  for (const e of echecs) console.error(`  · ${e}`);
  process.exit(1);
}

console.log(controle ? "\nPorte conforme, et elle sait échouer." : "Porte conforme.");
