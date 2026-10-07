/**
 * Contrôle du gabarit des implantations, sans navigateur.
 *
 *   bun components/site/implantations/verification-implantations.tsx
 *
 * Ce gabarit va servir `/implantations/` et ses 42 pages filles, et son contenu
 * arrive par un `jsonb` : personne ne l'aura vu rendre avant la production.
 * Ce qui est vérifié ici est ce qui casse en silence : un seul H1, une section
 * vide qui se rend quand même, une ancre qui ne pointe sur rien, et une cible
 * de lien hors domaine qui passerait malgré le garde.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import PageImplantations from "./PageImplantations";
import type { ContenuImplantations } from "@/types/implantations";

const COMPLET: ContenuImplantations = {
  gabarit: "implantations",
  chapeau: "Un chapô avec un [lien interne](/offres/) et du **gras**.",
  chiffres: [
    { valeur: "4", libelle: "agences" },
    { valeur: "1 h", libelle: "pour un premier rappel", accent: true },
  ],
  titreAgences: "Lyon en siège, trois agences à l’international",
  agences: [
    {
      nom: "Siège et agence de Lyon",
      badge: "Siège",
      lieu: "Écully (69)",
      adresses: ["129 chemin du Moulin Carron, 69130 Écully"],
      rayon: "France entière",
      role: "Direction et coordination",
      siege: true,
    },
    { nom: "Agence de Madrid", badge: "International", lieu: "Espagne" },
  ],
  international: {
    titre: "Deux bureaux pour suivre nos clients hors de France.",
    texte: "Le propos du panneau.",
    image: { src: "/assets/web/ph-hero-raffinerie.jpg", alt: "Site industriel" },
    bureaux: [{ nom: "Madrid", lignes: ["Une adresse", "Péninsule ibérique"] }],
  },
  couverture: {
    titre: "Villes et départements couverts",
    villes: [
      { libelle: "Lyon", href: "/implantations/lyon/" },
      // Cibles refusées : elles ne doivent pas ressortir en lien.
      { libelle: "Ailleurs", href: "https://exemple.test/" },
      { libelle: "Protocole", href: "javascript:alert(1)" },
      { libelle: "Hôte masqué", href: "//exemple.test/" },
    ],
    departements: [{ libelle: "Rhône", href: "/implantations/lyon/rhone/" }],
  },
};

const rendu = renderToStaticMarkup(
  <PageImplantations titre="Le titre de la page" contenu={COMPLET} />,
);

assert.equal(
  (rendu.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page doit porter exactement un h1",
);

// Le bouton du héros vise une ancre, l'ancre doit exister dans la page.
const ancres = [...rendu.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const ids = new Set([...rendu.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
assert.ok(ancres.includes("agences"), "le héros doit viser la section des agences");
for (const a of ancres) {
  assert.ok(ids.has(a), `le bouton vise l'ancre « ${a} », absente de la page`);
}

// Les trois cibles refusées sortent en texte, et aucune en attribut.
for (const refuse of ["exemple.test", "javascript:"]) {
  assert.doesNotMatch(
    rendu,
    new RegExp(`href="[^"]*${refuse.replace(".", "\\.")}`),
    `une cible « ${refuse} » ne doit jamais devenir un lien`,
  );
}
for (const libelle of ["Ailleurs", "Protocole", "Hôte masqué"]) {
  assert.ok(rendu.includes(libelle), `le libellé « ${libelle} » doit rester lisible`);
}

// Les apparitions au défilement sont des ATTRIBUTS : le moteur global les
// anime. Sans eux, les sections resteraient figées.
assert.ok(
  (rendu.match(/data-reveal/g) ?? []).length >= 3,
  "chaque section révélée au défilement doit porter data-reveal",
);

// Une image porteuse de sens garde son texte de remplacement.
assert.match(rendu, /alt="Site industriel"/, "l'image du panneau doit porter son alt");

// La zone de la carte est réservée et VIDE : aucun visuel de substitution.
assert.ok(rendu.includes("height:460px"), "la zone de carte doit rester réservée");

// --------------------------------------------- un contenu réduit à son minimum

const VIDE: ContenuImplantations = { gabarit: "implantations" };
const minimal = renderToStaticMarkup(
  <PageImplantations titre="Une page de ville" contenu={VIDE} />,
);

assert.equal(
  (minimal.match(/<h1[\s>]/g) ?? []).length,
  1,
  "une page sans contenu garde son h1",
);
assert.doesNotMatch(
  minimal,
  /href="#agences"/,
  "sans agence, le bouton vers la section ne doit pas se rendre",
);
assert.doesNotMatch(
  minimal,
  /Villes<|Départements</,
  "sans liens, les cartes de maillage ne doivent pas se rendre",
);
assert.doesNotMatch(
  minimal,
  /À l’international/,
  "sans données, le panneau international ne doit pas se rendre",
);

console.log("gabarit implantations : les contrôles passent.");
