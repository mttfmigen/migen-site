/**
 * Contrôle du gabarit « Cas clients », sans navigateur.
 *
 *   bun components/site/casclients/verification-casclients.tsx
 *
 * Le gabarit sert /preuves/ et /realisations/, et son contenu arrive par un
 * `jsonb` : le premier contenu réel sera en production. Ce qui est vérifié ici
 * est ce qui casse en silence : une section rendue vide faute de donnée, un
 * bouton qui pointe sur une ancre absente, un second H1, un tiret cadratin.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import type { ContenuCasClients } from "@/types/casclients";
import { estCasClients } from "@/types/casclients";

import PageCasClients from "./PageCasClients";

const COMPLET: ContenuCasClients = {
  gabarit: "casclients",
  chapeau: "Chaque référence indique l’offre engagée et la durée réelle.",
  chiffres: {
    principal: { valeur: "+10 M€", libelle: "de chiffre d’affaires." },
    cartes: [
      { valeur: "4", libelle: "agences" },
      { valeur: "+120", libelle: "techniciens" },
    ],
    duo: [
      { valeur: "+120", libelle: "techniciens" },
      { valeur: "+200", libelle: "clients industriels" },
    ],
  },
  chantiers: [
    {
      client: "SUEZ IWT",
      duree: "11 semaines",
      titre: "Remise en état complète d’un site industriel",
      resume: "Reprise de tuyauterie, électricité et mécanique.",
      offre: "migen© Chantier",
      date: "Février 2026",
      image: "/assets/web/ph-tuyaux.jpg",
      href: "/realisations/suez-iwt/",
    },
    // Volontairement dépouillé : ni image, ni fiche, ni durée.
    { client: "DANONE", titre: "Maintenance en continu des lignes" },
  ],
  titreChantiers: "Deux chantiers, deux contextes différents",
  avis: {
    note: "4,6",
    mention: "sur 37 avis Google vérifiés",
    verbatims: [
      {
        texte: "Le technicien connaissait déjà nos automates.",
        contexte: "Responsable maintenance · Agroalimentaire · Rhône",
      },
    ],
  },
};

const VIDE: ContenuCasClients = { gabarit: "casclients" };

function rendu(contenu: ContenuCasClients): string {
  return renderToStaticMarkup(
    <PageCasClients titre="Ce que nous avons livré" contenu={contenu} />,
  );
}

function compte(html: string, motif: RegExp): number {
  return html.match(motif)?.length ?? 0;
}

// ------------------------------------------------------------- le discriminant

assert.equal(estCasClients(COMPLET), true);
assert.equal(estCasClients({ blocs: [] }), false, "ne vole pas l’éditorial");
assert.equal(estCasClients({ sections: [] }), false, "ne vole pas la vente");
assert.equal(estCasClients(null), false);

// ------------------------------------------------------------ contenu complet

const complet = rendu(COMPLET);

assert.equal(compte(complet, /<h1[\s>]/g), 1, "un seul H1");
assert.ok(complet.includes("Ce que nous avons livré"), "le H1 porte le titre");
assert.ok(complet.includes("+10 M€"), "le chiffre principal est rendu");
assert.ok(complet.includes("SUEZ IWT"), "le chantier est rendu");
assert.ok(
  complet.includes("Deux chantiers, deux contextes différents"),
  "le titre de section fourni remplace celui de la maquette",
);
assert.ok(complet.includes("4,6"), "la note est rendue");

// Les ancres des deux boutons du hero doivent exister dans la page.
for (const ancre of ["cas", "formulaire"]) {
  assert.ok(
    complet.includes(`href="#${ancre}"`),
    `le bouton vers #${ancre} est rendu`,
  );
  assert.ok(complet.includes(`id="${ancre}"`), `la cible #${ancre} existe`);
}

// Le chantier sans fiche n'est pas un lien, et n'en invente pas la cible.
assert.ok(
  !complet.includes('href="undefined"') && !complet.includes('href=""'),
  "aucun lien mort",
);

// La révélation au défilement reste pilotée par Moteurs.tsx : les attributs
// doivent être posés, et aucune opacité nulle ne doit l'être en dur.
assert.ok(compte(complet, /data-reveal/g) >= 4, "les data-reveal sont posés");
assert.ok(
  !/opacity:\s*0[^.]/.test(complet),
  "rien n’est masqué dans le HTML servi",
);

// Interdit de copie du projet, vérifié sur le texte rendu.
assert.ok(!complet.includes("—"), "aucun tiret cadratin");
for (const interdit of [
  "régie",
  "intérim",
  "mise à disposition",
  "sans engagement",
  "clé en main",
  "sur mesure",
  "incontournable",
  "Découvrez",
]) {
  assert.ok(!complet.includes(interdit), `mot interdit : ${interdit}`);
}

// ------------------------------------------------- contenu vide, rien d'inventé

const vide = rendu(VIDE);

assert.equal(compte(vide, /<h1[\s>]/g), 1, "le H1 reste, seul");
assert.ok(!vide.includes("id=\"cas\""), "pas de section chantiers sans chantier");
assert.ok(!vide.includes('href="#cas"'), "pas de bouton vers une ancre absente");
// On teste des libellés, pas les nombres : « 4,6 » se retrouve par hasard dans
// les couleurs de la charte, « rgba(255,124,60,.9) » en contient la suite.
assert.ok(!vide.includes("avis Google"), "pas d’avis sans avis");
assert.ok(!vide.includes("Croissance"), "pas de bento sans chiffre");
// Le process et le formulaire sont du texte de la maquette : ils restent.
assert.ok(vide.includes("Notre sélection"), "le process reste");
assert.ok(vide.includes('id="formulaire"'), "le formulaire reste");

console.log("Gabarit « Cas clients » : contrôles passés.");
