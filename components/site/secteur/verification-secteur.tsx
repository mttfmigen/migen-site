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
import { renderToStaticMarkup } from "react-dom/server";

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

console.log("gabarit secteur : toutes les vérifications passent.");
