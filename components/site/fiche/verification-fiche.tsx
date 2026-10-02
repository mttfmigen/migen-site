/**
 * Contrôle du gabarit fiche, sans navigateur.
 *
 *   bun components/site/fiche/verification-fiche.tsx
 *
 * Ce gabarit va servir 28 pages dont le contenu arrive par un `jsonb`, et dont
 * aucun champ n'est obligatoire. Ce qui est vérifié ici est exactement ce qui
 * casse en silence : une section rendue vide faute de donnée, une grille de
 * trois colonnes pour une carte, un appel à l'action qui ne mène nulle part.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import PageFiche from "./PageFiche";
import type { ContenuFiche } from "@/types/fiche";

const COMPLETE: ContenuFiche = {
  gabarit: "fiche",
  surtitre: "CLIENT · migen© Résidence · février 2026",
  chapeau: "Reprise d'un site à l'arrêt, avec un [lien interne](/offres/).",
  fiche: [
    { libelle: "SECTEUR", valeur: "Traitement de l'eau" },
    { libelle: "OFFRE", valeur: "Résidence & Chantier" },
    { libelle: "DURÉE", valeur: "14 semaines" },
  ],
  images: [
    { src: "/assets/web/x-cablerie.jpg" },
    { src: "/assets/web/team-electric.jpg", alt: "Un technicien en armoire" },
  ],
  contexte: "Site arrêté depuis plusieurs mois.",
  intervention: "Relevé complet des installations.",
  resultats: [{ valeur: "14 sem.", libelle: "planning tenu" }],
};

const plein = renderToStaticMarkup(
  <PageFiche titre="Remise en état complète d'un site industriel" contenu={COMPLETE} />,
);

assert.equal(
  (plein.match(/<h1[\s>]/g) ?? []).length,
  1,
  "la fiche doit porter un seul h1, celui de la page",
);
// Les trois cartes présentes : la grille retrouve les trois colonnes de la maquette.
assert.match(plein, /repeat\(3,minmax\(0,1fr\)\)/);
// Un séparateur entre deux lignes de la carte d'identité, jamais avant la première.
assert.equal(
  (plein.match(/height:1px;background:var\(--line\)/g) ?? []).length,
  COMPLETE.fiche!.length - 1,
  "un séparateur entre deux lignes, pas un de plus",
);
// Les révélations au défilement sont posées en attributs : c'est Moteurs.tsx qui
// les anime. Sans ces attributs, les blocs n'apparaissent jamais.
assert.ok(
  (plein.match(/data-reveal/g) ?? []).length >= 3,
  "galerie, trio et pavé final portent data-reveal",
);
assert.match(plein, /href="#formulaire"/, "l'appel à l'action doit viser le formulaire");
assert.match(plein, /alt="Un technicien en armoire"/);
// Le visuel sans alt est décoratif : alt vide, et non absent.
assert.match(plein, /alt=""/);
// Le Markdown du corpus est rendu, pas affiché tel quel.
assert.doesNotMatch(plein, /\[lien interne\]/, "le lien Markdown doit être rendu");

// ------------------------------------------- une fiche que le corpus n'alimente pas

const nue = renderToStaticMarkup(<PageFiche titre="Un cas" contenu={{ gabarit: "fiche" }} />);

assert.doesNotMatch(nue, /var\(--ph\)/, "sans visuel, aucune case de galerie vide");
assert.doesNotMatch(nue, /Le contexte|Le résultat/, "sans donnée, aucune carte vide");
assert.doesNotMatch(nue, /1\.1fr \.9fr/, "sans carte d'identité, le héros prend toute la largeur");
// Le pavé final reste : c'est le seul chemin vers le formulaire de la page.
assert.match(nue, /Un cas comparable chez vous/);

// ----------------------------------------------------- une seule carte du trio

const une = renderToStaticMarkup(
  <PageFiche titre="Un cas" contenu={{ gabarit: "fiche", contexte: "Le site." }} />,
);
assert.match(
  une,
  /repeat\(1,minmax\(0,1fr\)\)/,
  "une carte seule occupe la largeur, pas un tiers avec deux colonnes vides",
);

console.log("Gabarit fiche : un seul h1, sections vides absentes, data-reveal posés, action vers le formulaire.");
