/**
 * La frise « Notre méthode » rend-elle les valeurs de la maquette ?
 *
 *   bun components/site/accueil/verification-methode.tsx
 *
 * L'apparence des quatre boutons d'étape dépend de l'étape choisie, donc d'un
 * état local : elle vit dans le module CSS et non en style en ligne. Ce
 * contrôle relit donc le module, et compare chaque déclaration à ce que la
 * maquette calcule pour ces mêmes boutons (`steps:` de
 * `maquette/accueil-rendu.html`, `btnCss` à `whenCss`). Aucune valeur attendue
 * n'est écrite ici à la main : elles sont toutes extraites du fichier du
 * client, et les jetons de la charte sont résolus depuis `app/globals.css`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import MethodeQuatreEtapes from "@/components/site/accueil/MethodeQuatreEtapes";
import { ETAPES_METHODE } from "@/components/site/accueil/methode-etapes-donnees";

const lis = (chemin: string) =>
  readFileSync(new URL(chemin, import.meta.url), "utf8");

const maquette = lis("../../../maquette/accueil-rendu.html");
const moduleCss = lis("./MethodeQuatreEtapes.module.css");
const charte = lis("../../../app/globals.css");

// ------------------------------------------- ce que la maquette calcule
// Le bloc `steps:` construit cinq chaînes de style par concaténation, avec des
// ternaires sur `on` (l'étape choisie) et `dk` (le thème sombre, que le site
// ne sert pas). On les résout pour les deux états.
const bloc = maquette.slice(
  maquette.indexOf("steps: this.STEPS.map("),
  maquette.indexOf("stepTitle: this.STEPS"),
);
assert.ok(bloc.length > 500, "le bloc `steps` de la maquette est introuvable");

const expression = (nom: string) => {
  const debut = bloc.indexOf(`${nom}Css: `);
  assert.ok(debut > 0, `${nom}Css absent de la maquette`);
  const suite = bloc.slice(debut);
  // La propriété suivante commence en début de ligne, après la virgule finale.
  const fin = suite.search(/,\n\s+[a-zA-Z]+(Css)?:/);
  return suite.slice(`${nom}Css: `.length, fin);
};

const resous = (expr: string, actif: boolean) => {
  let texte = expr.replace(/\s+/g, " ");
  // Du ternaire le plus imbriqué vers l'extérieur.
  for (let tour = 0; tour < 3; tour += 1) {
    texte = texte.replace(
      /\(\s*(on|dk)\s*\?\s*("[^"]*")\s*:\s*("[^"]*")\s*\)/g,
      (_tout, test: string, oui: string, non: string) =>
        (test === "on" ? actif : false) ? oui : non,
    );
  }
  return [...texte.matchAll(/"([^"]*)"/g)].map((bout) => bout[1]).join("");
};

/** `a:1;b:2 3` devient `{ a: "1", b: "2 3" }`. */
const declarations = (style: string) =>
  Object.fromEntries(
    style
      .split(";")
      .filter(Boolean)
      .map((paire) => {
        const coupure = paire.indexOf(":");
        return [
          paire.slice(0, coupure).trim(),
          paire.slice(coupure + 1).trim(),
        ];
      }),
  ) as Record<string, string>;

const styleMaquette = (nom: string, actif: boolean) =>
  declarations(resous(expression(nom), actif));

// ------------------------------------------------ ce que le module déclare
const regle = (selecteur: string) => {
  const trouve = moduleCss.match(
    new RegExp(`\\${selecteur}\\s*\\{([^}]*)\\}`.replace("\\.", "\\."), "s"),
  );
  assert.ok(trouve, `la règle ${selecteur} a disparu du module CSS`);
  return declarations(trouve[1].replace(/\/\*[\s\S]*?\*\//g, ""));
};

const etape = regle(".etape");
const pastille = regle(".pastille");
const numero = regle(".numero");
const titre = regle(".titre");
const quand = regle(".quand");
const pastilleActive = regle('.etape\\[aria-pressed="true"\\] .pastille');
const numeroActif = regle('.etape\\[aria-pressed="true"\\] .numero');
const titreActif = regle('.etape\\[aria-pressed="true"\\] .titre');

// --------------------------------------------------- la comparaison
const jetons = Object.fromEntries(
  [...charte.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((t) => [t[1], t[2].trim()]),
);

/** Même valeur, écrite autrement : jetons résolus, espaces et zéros ôtés. */
const normalise = (valeur: string): string => {
  let v = valeur;
  for (let tour = 0; tour < 4 && v.includes("var("); tour += 1) {
    v = v.replace(/var\((--[\w-]+)\)/g, (tout, nom: string) => jetons[nom] ?? tout);
  }
  return v.toLowerCase().replace(/\s+/g, "").replace(/(^|[^\d])0\./g, "$1.");
};

let controles = 0;
const memeValeur = (obtenu: string | undefined, attendu: string, quoi: string) => {
  assert.equal(
    normalise(obtenu ?? ""),
    normalise(attendu),
    `${quoi} : la maquette dit « ${attendu} », le module « ${obtenu} »`,
  );
  controles += 1;
};

const dotOn = styleMaquette("dot", true);
const dotOff = styleMaquette("dot", false);
const numOn = styleMaquette("num", true);
const numOff = styleMaquette("num", false);
const titOn = styleMaquette("title", true);
const titOff = styleMaquette("title", false);
const whenCss = styleMaquette("when", false);
const btnCss = styleMaquette("btn", false);

// Le bouton : les quatre éléments s'empilent sans écart, la maquette ne
// séparant que par les marges de chacun.
memeValeur(etape.gap, btnCss.gap, "écart du bouton d'étape");
memeValeur(etape.padding, btnCss.padding, "marge intérieure du bouton");

// La pastille : une BORDURE de la couleur du fond, jamais une ombre portée.
memeValeur(pastille.width, dotOff.width, "largeur de la pastille");
memeValeur(pastille.height, dotOff.height, "hauteur de la pastille");
memeValeur(pastille.border, dotOff.border, "bordure de la pastille");
memeValeur(pastille["box-sizing"], dotOff["box-sizing"], "boîte de la pastille");
memeValeur(pastille["border-radius"], dotOff["border-radius"], "rayon de la pastille");
memeValeur(
  pastille.margin?.split(/\s+/)[2],
  dotOff["margin-bottom"],
  "marge basse de la pastille",
);
memeValeur(pastille.background, dotOff["background-color"], "pastille au repos");
memeValeur(pastilleActive.background, dotOn["background-color"], "pastille choisie");
assert.ok(
  !pastille["box-shadow"],
  "la pastille porte une ombre portée là où la maquette fait une bordure",
);

// Le numéro.
memeValeur(numero.font, numOff.font, "fonte du numéro");
memeValeur(numero["letter-spacing"], numOff["letter-spacing"], "interlettrage du numéro");
memeValeur(numero.color, numOff.color, "numéro au repos");
memeValeur(numeroActif.color, numOn.color, "numéro choisi");
memeValeur(
  numero.margin?.split(/\s+/)[2],
  numOff["margin-bottom"],
  "marge basse du numéro",
);

// Le titre d'étape.
memeValeur(titre.font, titOff.font, "fonte du titre d'étape");
memeValeur(titre["letter-spacing"], titOff["letter-spacing"], "interlettrage du titre");
memeValeur(titre.color, titOff.color, "titre au repos");
memeValeur(titreActif.color, titOn.color, "titre choisi");

// Le repère de temps : interligne normal, et la marge haute de la maquette.
memeValeur(quand.font, whenCss.font, "fonte du repère de temps");
memeValeur(quand.color, whenCss.color, "couleur du repère de temps");
memeValeur(quand.margin?.split(/\s+/)[0], whenCss["margin-top"], "marge haute du repère");

// ------------------------------------------ le rendu porte bien ces classes
const html = renderToStaticMarkup(
  <MethodeQuatreEtapes etapes={ETAPES_METHODE} />,
);
// Les noms de classe sont hachés par Next, pas par bun : on vérifie la
// structure que le module habille, quatre boutons de quatre éléments.
const boutons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)];
assert.equal(boutons.length, 4, "quatre étapes rendues");
// Pastille, puis numéro, titre et repère (vide quand il a été retiré), chacun
// avec la `<span>` intérieure que la maquette pose autour de son texte.
for (const bouton of boutons) {
  assert.equal(
    (bouton[1].match(/<span/g) ?? []).length,
    7,
    "chaque étape porte sa pastille, son numéro, son titre et la ligne de son repère",
  );
}
assert.equal(
  (html.match(/aria-pressed="true"/g) ?? []).length,
  1,
  "une seule étape choisie au premier rendu",
);

// -------------------------------- l'écart de copie déclaré reste en place
// La maquette écrit « 2 à 5 jours » et « 1 à 2 semaines » sous les étapes 01 et
// 02. Aucun délai chiffré n'est autorisé : le repère est RETIRÉ (règle du 08/10,
// une phrase interdite ne se reformule pas) et ne doit pas revenir au nom de la
// fidélité.
for (const etapeMethode of ETAPES_METHODE) {
  assert.doesNotMatch(
    etapeMethode.quand ?? "",
    /\d+\s*(à|a)?\s*\d*\s*(jour|semaine|heure|mois|h\b)/i,
    `un délai chiffré est revenu dans l'étape « ${etapeMethode.titre} »`,
  );
}

console.log(
  `frise « Notre méthode » conforme : ${controles} valeurs relues dans la maquette`,
);
