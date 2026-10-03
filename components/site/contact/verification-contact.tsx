/**
 * Contrôle de la page contact, sans navigateur.
 *
 *   bun components/site/contact/verification-contact.tsx
 *
 * Sans cadre de test, comme les autres `verification.*` du projet.
 *
 * TOUTE VALEUR ATTENDUE EST RELUE DANS `maquette/accueil-rendu.html` À CHAQUE
 * EXÉCUTION, jamais écrite de mémoire : une note de lecture peut se tromper et
 * personne ne peut la rejouer. Le contrôle échoue si le fichier manque, plutôt
 * que de se rabattre en silence sur des valeurs recopiées.
 *
 * Les trois corrections imposées par le contrat (quatre agences, plus de 120
 * clients, aucun délai chiffré hors rappel dans l'heure) sont vérifiées dans
 * l'autre sens : la formulation de la maquette doit être ABSENTE du rendu.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import Agences from "@/components/site/contact/Agences";
import ApresDemande from "@/components/site/contact/ApresDemande";
import Ouverture from "@/components/site/contact/Ouverture";
import { TITRE_SEO } from "@/components/site/contact/metadonnees";

/** L'écran « Contact / devis » de la maquette : lignes 2950 à 3024. */
const PREMIERE_LIGNE = 2950;
const DERNIERE_LIGNE = 3024;

const fichier = new URL("../../../maquette/accueil-rendu.html", import.meta.url);
const lignes = readFileSync(fichier, "utf8").split("\n");
assert.ok(
  lignes.length >= DERNIERE_LIGNE,
  `la maquette ne compte que ${lignes.length} lignes`,
);
const maquette = lignes
  .slice(PREMIERE_LIGNE - 1, DERNIERE_LIGNE)
  .join("\n");
assert.ok(
  maquette.includes('data-screen-label="Contact / devis"'),
  "ces lignes ne sont plus l'écran contact de la maquette",
);

const html = [
  renderToStaticMarkup(<Ouverture />),
  renderToStaticMarkup(<ApresDemande />),
  renderToStaticMarkup(<Agences />),
].join("");

/**
 * Met maquette et rendu sur le même texte.
 *
 * La maquette écrit `&nbsp;`, React rend le caractère lui-même ; les deux
 * utilisent l'apostrophe typographique, mais pas toujours. Comparer sans
 * normaliser ferait échouer le contrôle sur de la ponctuation.
 */
function normalise(texte: string): string {
  return texte
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#x27;|&#39;/g, "'")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

const rendu = normalise(html);
const source = normalise(maquette);

/** Ce qui doit se trouver dans la maquette ET dans le rendu. */
const PORTE = [
  // Copie de l'ouverture.
  "Rappel dans l'heure",
  "Astreinte",
  "Dites-nous ce qu'il faut tenir.",
  "On vous rappelle dans l'heure.",
  "Un chargé d'affaires étudie votre demande, sélectionne les techniciens adaptés et vous les présente pour validation avant toute intervention.",
  "Les cinq offres",
  "10 %",
  "des candidats retenus",
  "clients industriels",
  "Décrire mon besoin",
  // Copie des trois étapes.
  "Après votre demande",
  "Trois étapes, un interlocuteur nommé.",
  "Pas de standard ni de ticket : la personne qui vous rappelle est celle qui suivra votre site.",
  "Il qualifie le besoin avec vous : technologies, habilitations, délai, volume.",
  "Il visite votre site",
  "Contraintes, sécurité, installation : on voit avant de proposer.",
  "Vous validez les techniciens",
  "Vous rencontrez chaque profil retenu avant son arrivée sur site.",
  "Vous êtes technicien ?",
  "Postulez directement en ligne",
  "font:600 20px var(--fb)",
  // Copie des agences.
  "Nos agences",
  "plus proche de votre site, jamais du siège.",
  "1 rue des Vergers, Bâtiment 3, 69760 Limonest",
  "Level 20, 48 Burj Tower, Downtown",
  "2020 route Transcanadienne, Dorval, Québec",
  // Géométrie et habillage, recopiés tels quels.
  "scroll-margin-top:96px",
  "padding:70px 40px 0",
  "max-width:1200px",
  "grid-template-columns:1.12fr .88fr",
  "clamp(38px,4.4vw,66px)",
  "clamp(30px,3.3vw,48px)",
  "letter-spacing:-.045em",
  "repeat(3,minmax(0,1fr))",
  "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
  "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  "padding:28px 28px 30px",
  "padding:12px 30px 18px",
  "border-top:1px solid var(--line)",
];

for (const valeur of PORTE) {
  const attendu = normalise(valeur);
  assert.ok(
    source.includes(attendu),
    `cette valeur n'est plus dans la maquette, lignes ${PREMIERE_LIGNE} à ${DERNIERE_LIGNE} : « ${valeur} »`,
  );
  assert.ok(
    rendu.includes(attendu),
    `valeur de la maquette absente du rendu : « ${valeur} »`,
  );
}

/* Ce que la maquette dit et que le contrat corrige : présent dans la source,
   interdit dans le rendu. Les deux côtés sont vérifiés, sinon le contrôle
   passerait aussi le jour où la maquette change et où la correction n'a plus
   d'objet. */
const CORRIGE: readonly [string, string][] = [
  ["5", "agences en France"],
  ["Cinq agences en France, deux à l'international.", "Cinq agences en France"],
  ["+200", "+200"],
  ["clients industriels", "200 clients"],
  ["48 h", "48 h"],
  ["3 sem.", "3 sem."],
  ["Siège — Limonest", "Siège — Limonest"],
  ["réponse sous 48 h ouvrées", "sous 48 h"],
  ["de l'agence la plus proche", "de l'agence la plus proche"],
];

for (const [dansLaMaquette, interditAuRendu] of CORRIGE) {
  assert.ok(
    source.includes(normalise(dansLaMaquette)),
    `la maquette ne contient plus « ${dansLaMaquette} » : cette correction n'a plus d'objet`,
  );
  assert.ok(
    !rendu.includes(normalise(interditAuRendu)),
    `formulation corrigée toujours rendue : « ${interditAuRendu} »`,
  );
}

/* Les interdits de copie du contrat, cherchés dans le rendu. Le tiret cadratin
   et le demi-cadratin en font partie. */
for (const interdit of [
  "agences en France",
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
  "Découvrez",
  "—",
  "–",
]) {
  assert.ok(!rendu.includes(interdit), `copie interdite rendue : « ${interdit} »`);
}

/* Les quatre agences du contrat, et aucune autre. L'adresse d'Écully est
   l'ancienne du siège : elle ne doit pas revenir. */
assert.ok(rendu.includes("Limonest"), "le siège doit être nommé");
assert.ok(rendu.includes("Dubaï") && rendu.includes("Montréal") && rendu.includes("Madrid"));
for (const ancienne of ["Écully", "Moulin Carron", "Strasbourg", "Toulouse", "Nantes"]) {
  assert.ok(
    !rendu.includes(ancienne),
    `« ${ancienne} » est un hub ou une ancienne adresse, pas une agence`,
  );
}

// --------------------------------------------------------------- un seul h1
const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
assert.equal(h1.length, 1, `un seul h1 attendu, ${h1.length} rendus`);
const texteH1 = normalise(h1[0][1].replace(/<[^>]+>/g, " ")).trim();
assert.ok(texteH1.length > 0, "le h1 est vide");

// ------------------------------------------------- le titre n'est pas le h1
assert.notEqual(
  normalise(TITRE_SEO).trim().toLowerCase(),
  texteH1.toLowerCase(),
  "le meta title ne doit pas être identique au h1",
);

// ------------------------------------------------------------ liens inertes
// La maquette écrit « # » partout, sa navigation était interne à l'éditeur.
assert.ok(
  !html.includes('href="#"'),
  'un lien de la page contact est rendu inerte (href="#")',
);

// ------------------------------------------- aucune palette de framework
// La charte vit dans les jetons de `app/globals.css`. Une couleur Tailwind par
// défaut ou une variante `dark:` à côté d'eux, c'est deux chartes dans un écran.
for (const classe of html.matchAll(/class="([^"]*)"/g)) {
  assert.doesNotMatch(
    classe[1],
    /\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\bdark:[a-z-]+|\b(?:text|bg|border)-(?:white|black)\b/,
    `classe de couleur Tailwind rendue : « ${classe[1]} »`,
  );
}

// ------------------------------------------------------- rien d'invisible
assert.ok(
  !/opacity:0(?![.0-9])/.test(html),
  "un bloc est rendu avec une opacité nulle",
);

console.log(
  `Page contact : ${PORTE.length} valeurs relues dans la maquette, ${CORRIGE.length} corrections tenues, un seul h1, titre distinct.`,
);
