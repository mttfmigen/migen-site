/**
 * Contrôle de l'habillage du bandeau de consentement, sans navigateur.
 *
 *   bun components/consentement/verification-bandeau.tsx
 *
 * Et la faute injectée, qui doit faire sortir le contrôle en erreur :
 *
 *   BANDEAU_FAUTE=rendu   bun components/consentement/verification-bandeau.tsx
 *   BANDEAU_FAUTE=appel   bun components/consentement/verification-bandeau.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * CE QU'IL GARDE, et pourquoi cela ne se voit pas à la lecture :
 *
 *   · l'ÉGALITÉ DE POIDS des trois actions. Exigence CNIL : un refus plus
 *     discret qu'une acceptation rend le consentement invalide. Elle se perd
 *     sans bruit, à la première « amélioration » qui met l'acceptation en plein
 *     et les autres en contour.
 *   · l'absence de MUR de consentement : `show()` et non `showModal()`, et
 *     aucun voile.
 *   · le câblage du module CSS : une classe mal orthographiée ne casse rien,
 *     elle rend juste le bandeau nu.
 *   · l'absence d'échafaudage Tailwind, et les jetons de la charte.
 *
 * DEUX LIMITES ASSUMÉES, dites ici plutôt que cachées.
 *   · Bun ne résout pas les modules CSS : `styles.action` vaut `undefined` sous
 *     ce contrôle, et le nom de classe n'apparaît donc pas dans le rendu. La
 *     comparaison des trois boutons attrape tout ce qui arrive dans le balisage
 *     (style en ligne, classe littérale, attribut en plus), pas une divergence
 *     qui vivrait dans `Action.module.css`.
 *   · cette divergence-là appartient à `Action.module.css`, qui n'a qu'une
 *     seule règle `.action` et son propre contrôle `verification-action.tsx`.
 *     Ce fichier ne la double pas : il vérifie ce qui est de son ressort, que
 *     les trois APPELS soient identiques et que la rangée donne trois colonnes
 *     égales.
 *
 * Le bandeau ne rend rien pendant un rendu serveur (`pret` est faux, voir
 * `etat.ts`) : un greffon Bun remplace `./etat` par un état prêt le temps du
 * contrôle. Rien n'est modifié sur le disque, et `etat.ts` appartient à un
 * autre agent.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";

import { FINALITES } from "@/lib/consentement";

/* Le type de `Bun.plugin` vient de `@types/bun`, que le projet n'installe pas
   (contrat, règle 7 : pas de dépendance nouvelle). La surface employée est
   minuscule, on la déclare ici. `declare` n'émet rien : à l'exécution,
   l'identifiant est bien le global de Bun. */
declare const Bun: {
  plugin(greffon: {
    name: string;
    setup(build: {
      onLoad(
        filtre: { filter: RegExp },
        charge: () => { contents: string; loader: "ts" },
      ): void;
    }): void;
  }): void;
};

Bun.plugin({
  name: "etat-consentement-pret",
  setup(build) {
    build.onLoad({ filter: /components\/consentement\/etat\.ts$/ }, () => ({
      contents: `
        export function useConsentement() {
          return { choix: null, panneau: false, masque: false, pret: true };
        }
        export function ouvrePanneau() {}
        export function ferme() {}
        export function enregistre() {}
      `,
      loader: "ts",
    }));
  },
});

const { default: Bandeau } = await import("@/components/consentement/Bandeau");

const lis = (nom: string): string =>
  readFileSync(new URL(nom, import.meta.url), "utf8");

const TSX_SOURCE = lis("./Bandeau.tsx");
const CSS_SOURCE = lis("./Bandeau.module.css");

/* Les commentaires CITENT ce qu'ils interdisent : le module nomme des couleurs
   (#141312, #9d9c9c) pour expliquer un calcul de contraste, le composant nomme
   `showModal()` pour dire qu'il ne l'emploie pas. Les retirer avant de
   chercher, sinon il faudrait effacer les explications pour faire passer le
   contrôle. */
function sansCommentaires(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const CSS = sansCommentaires(CSS_SOURCE);
const TSX = sansCommentaires(TSX_SOURCE);

const LIBELLES = ["Tout accepter", "Tout refuser", "Personnaliser"] as const;

// ===================================================== poids égal, au rendu

/** Les attributs du `<button>` d'une action, tels qu'ils partent au navigateur. */
function attributsRendus(html: string, libelle: string): string {
  const trouve = html.match(
    new RegExp(`<button([^>]*)>${libelle}</button>`),
  )?.[1];
  assert.ok(trouve !== undefined, `action absente du rendu : ${libelle}`);
  return trouve.trim();
}

/**
 * Les trois boutons partent-ils avec la MÊME chaîne ? Même police, même
 * remplissage, même rayon, même surface : tout vient d'un seul composant et
 * d'une seule règle, donc la moindre différence dans le balisage signale qu'un
 * appel a introduit un biais.
 *
 * Posée comme fonction parce qu'elle est appelée DEUX fois : sur le rendu réel
 * et sur un rendu abîmé exprès. Une assertion qui ne sait pas échouer ne prouve
 * rien.
 */
function verifiePoidsEgalAuRendu(html: string): void {
  const [accepter, refuser, personnaliser] = LIBELLES.map((libelle) =>
    attributsRendus(html, libelle),
  );
  assert.equal(
    refuser,
    accepter,
    "poids visuel inégal : « Tout refuser » n'est pas rendu comme « Tout accepter »",
  );
  assert.equal(
    personnaliser,
    accepter,
    "poids visuel inégal : « Personnaliser » n'est pas rendu comme « Tout accepter »",
  );
  assert.ok(
    accepter.includes('type="button"'),
    "une action n'est pas un vrai bouton",
  );
}

// ==================================================== poids égal, aux appels

/**
 * Les trois `<Action …>` reçoivent-ils exactement les mêmes attributs ?
 *
 * `Action` n'accepte ni `className`, ni `style`, ni variante : un appel ne peut
 * donc pas affaiblir un bouton tant qu'il s'en tient à `libelle` et `onClick`.
 * C'est le jour où l'un des trois reçoit autre chose que l'égalité se perd, et
 * cela se lit ici, dans ce fichier-ci.
 */
function verifiePoidsEgalAuxAppels(source: string): void {
  const appels = [...source.matchAll(/<Action\b([\s\S]*?)\/>/g)];
  assert.equal(appels.length, 3, "le bandeau doit porter TROIS actions");

  const attendus = ["libelle", "onClick"];
  for (const appel of appels) {
    const noms = [...appel[1].matchAll(/(\w+)=/g)].map((m) => m[1]).sort();
    assert.deepEqual(
      noms,
      attendus,
      `une action reçoit autre chose que libelle et onClick : ${noms.join(", ")}`,
    );
  }
}

// =========================================================== le rendu réel
const HTML = renderToStaticMarkup(<Bandeau />);
assert.ok(HTML.length > 0, "le bandeau ne rend rien");

verifiePoidsEgalAuRendu(HTML);
verifiePoidsEgalAuxAppels(TSX);

// La largeur égale est tenue par la rangée, pas par le composant de bouton :
// trois colonnes `1fr` au-delà de 640px, empilées pleine largeur en dessous.
assert.ok(
  HTML.includes("sm:grid-cols-3"),
  "la rangée des actions ne garantit plus trois colonnes égales",
);
assert.equal(
  HTML.split("<button").length - 1,
  4,
  "le bandeau ne porte que les trois actions et le bouton de fermeture",
);

// ------------------------------------------------- aucun mur de consentement
assert.ok(
  TSX.includes("element.show()"),
  "le bandeau doit s'ouvrir par show(), le seul mode non modal",
);
assert.ok(
  !TSX.includes("showModal"),
  "showModal() rendrait la page inerte : c'est le mur de consentement interdit",
);
assert.ok(
  !CSS.includes("::backdrop"),
  "un ::backdrop habillé ferait un voile sur la page",
);
assert.ok(
  !/inset:\s*0|inset-0/.test(CSS + HTML),
  "aucune surface pleine page ne doit couvrir le contenu",
);

// ----------------------------------------------- les finalités ne bougent pas
// Quatre, dont le suivi commercial pour HubSpot, séparé de la mesure d'audience.
assert.equal(FINALITES.length, 4, "le projet a QUATRE finalités");
assert.ok(
  FINALITES.includes("suivi_commercial"),
  "suivi_commercial doit rester une finalité distincte",
);

// -------------------------------------------------------- câblage du module
// Une classe mal orthographiée ne casse rien : elle rend `undefined` et le
// bandeau arrive nu. C'est exactement le genre de panne qui part en production.
const classesUtilisees = [...TSX.matchAll(/\bs\.(\w+)/g)].map((m) => m[1]);
assert.ok(classesUtilisees.length >= 6, "le module CSS n'est presque pas utilisé");
for (const classe of new Set(classesUtilisees)) {
  assert.ok(
    new RegExp(`\\.${classe}[\\s,:{]`).test(CSS),
    `s.${classe} n'existe pas dans Bandeau.module.css`,
  );
}

// -------------------------------------------- plus aucun échafaudage Tailwind
for (const [source, nom] of [
  [TSX_SOURCE, "Bandeau.tsx"],
  [CSS_SOURCE, "Bandeau.module.css"],
] as const) {
  for (const classe of source.matchAll(
    /className=(?:"([^"]*)"|\{`([^`]*)`\})/g,
  )) {
    const valeur = classe[1] ?? classe[2] ?? "";
    assert.ok(
      !/\bdark:/.test(valeur),
      `${nom} : variante dark:, alors que le site n'a pas de mode sombre`,
    );
    assert.ok(
      !/\b(?:text|bg|border|ring|divide|outline|shadow|accent)-(?:zinc|gray|slate|neutral|stone|white|black)(?:-\d{2,3})?\b/.test(
        valeur,
      ),
      `${nom} : palette Tailwind par défaut dans « ${valeur} »`,
    );
  }
}

// ------------------------------------------------------- jetons de la charte
for (const jeton of [
  "--card",
  "--line",
  "--rad",
  "--ink",
  "--ink2",
  "--acc-ink",
  "--fb",
  "--ft",
  "--tr",
]) {
  assert.ok(
    CSS.includes(`var(${jeton})`),
    `jeton de la charte absent : ${jeton}`,
  );
}

// Aucune couleur littérale, sauf les deux ombres recopiées de la maquette
// (ligne 1289) : la charte n'a pas de jeton d'ombre.
const OMBRES_MAQUETTE = new Set(["rgba(0, 0, 0, 0.04)", "rgba(0, 0, 0, 0.3)"]);
for (const couleur of CSS.matchAll(
  /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b|\b(?:white|black)\b/g,
)) {
  assert.ok(
    OMBRES_MAQUETTE.has(couleur[0]),
    `couleur littérale hors charte : ${couleur[0]}`,
  );
}

// ------------------------------------------------ cible tactile de la WCAG 2.2
// Critère 2.5.8 : 24px de haut au minimum. Le texte seul n'y suffit pas.
const hauteurFermer = Number(
  /\.fermer\s*\{[^}]*min-height:\s*(\d+)px/.exec(CSS)?.[1] ?? 0,
);
assert.ok(
  hauteurFermer >= 24,
  `le bouton de fermeture mesure ${hauteurFermer}px de haut, il en faut 24`,
);

// ------------------------------------------------------- textes et interdits
assert.ok(HTML.includes("Vos traceurs, votre choix"), "titre du bandeau perdu");
assert.ok(
  HTML.includes("Politique de confidentialit"),
  "lien vers la politique de confidentialité perdu",
);
for (const interdit of [
  "—",
  "levier",
  "clé en main",
  "sur mesure",
  "concrètement",
  "notamment",
  "incontournable",
  "découvrez",
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
]) {
  assert.ok(!HTML.includes(interdit), `copie interdite : ${interdit}`);
}

// ====================================== les fautes injectées, et leur contrôle

/** « Tout refuser » rendu plus discret : plus petit, sans remplissage ni filet. */
function abimeLeRendu(html: string): string {
  const abime = html.replace(
    /<button([^>]*)>Tout refuser<\/button>/,
    '<button$1 style="font-size:12px;border:0;background:transparent">Tout refuser</button>',
  );
  assert.notEqual(abime, html, "la faute de rendu n'a pas pu être injectée");
  return abime;
}

/** « Tout refuser » affaibli depuis l'appel, par une classe en plus. */
function abimeLAppel(source: string): string {
  const abime = source.replace(
    'libelle="Tout refuser"',
    'libelle="Tout refuser"\n            className="opacity-60"',
  );
  assert.notEqual(abime, source, "la faute d'appel n'a pas pu être injectée");
  return abime;
}

const FAUTES = {
  rendu: () => verifiePoidsEgalAuRendu(abimeLeRendu(HTML)),
  appel: () => verifiePoidsEgalAuxAppels(abimeLAppel(TSX)),
} as const;

const demandee = process.env.BANDEAU_FAUTE;
if (demandee === "rendu" || demandee === "appel") {
  console.log(
    `BANDEAU_FAUTE=${demandee} : « Tout refuser » rendu plus discret, le contrôle doit échouer.`,
  );
  FAUTES[demandee]();
  throw new Error("le contrôle a laissé passer un bouton plus discret");
}

// Les deux fautes doivent être attrapées, sinon le contrôle ne prouve rien.
assert.throws(FAUTES.rendu, /poids visuel inégal/);
assert.throws(FAUTES.appel, /autre chose que libelle et onClick/);

const ATTRIBUTS = attributsRendus(HTML, "Tout accepter");
console.log(
  `Bandeau : trois actions au poids égal, ${ATTRIBUTS.length} caractères d'attributs identiques (« ${ATTRIBUTS} »), trois colonnes 1fr.`,
);
console.log(
  `Habillage : ${new Set(classesUtilisees).size} classes du module câblées, jetons de la charte présents, aucune couleur littérale hors ombres, Fermer à ${hauteurFermer}px.`,
);
console.log(
  "Négatif vérifié : un bouton plus discret fait échouer le contrôle, au rendu comme à l'appel.",
);
