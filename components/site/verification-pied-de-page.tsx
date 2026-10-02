/**
 * Contrôle du pied de page, sans navigateur.
 *
 *   bun components/site/verification-pied-de-page.tsx
 *
 * Toutes les valeurs attendues sont LUES dans `maquette/accueil-rendu.html`,
 * jamais recopiées depuis une note de lecture : le contrôle est rejouable et se
 * met à jour tout seul si la maquette change.
 *
 * Ce qu'il tient, et qui s'était déjà relâché une fois : les quatre colonnes du
 * maillage (la quatrième, « Habilitations », avait disparu, ce qui retirait
 * 111 px au pied de page), et le fait que tout libellé de la maquette absent du
 * site l'est pour UNE raison vérifiable, l'absence de sa page dans
 * `docs/urls-site-actuel.json`, et non par oubli.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PiedDePage from "@/components/site/PiedDePage";

const entites: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};
const lisible = (brut: string) =>
  brut.replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (e) => entites[e]).trim();

// ------------------------------------------------------- la maquette, lue
// Deux pieds de page cohabitent dans le document, celui de la landing page et
// celui du site. On prend le second par son remplissage, qui n'appartient qu'à
// lui.
const maquette = readFileSync("maquette/accueil-rendu.html", "utf8");
const ouverture =
  '<footer style="background:var(--foot);color:#fff;padding:80px 0 34px">';
const debut = maquette.indexOf(ouverture);
assert.ok(debut > 0, "pied de page du site introuvable dans la maquette");
const bloc = maquette.slice(debut, maquette.indexOf("</footer>", debut));

const coupe = bloc.indexOf('class="mg-rq3"');
assert.ok(coupe > 0, "sous-grille mg-rq3 introuvable dans la maquette");

/** Colonnes de navigation : titre à 11px, puis les liens jusqu'à la fermeture. */
const colonnesMaquette = [
  ...bloc
    .slice(0, coupe)
    .matchAll(/margin-bottom:16px">([^<]+)<\/div>([\s\S]*?)<\/div>\s*<\/div>/g),
].map(([, titre, corps]) => ({
  titre: lisible(titre),
  libelles: [...corps.matchAll(/>([^<>]+)<\/a>/g)].map((trouve) =>
    lisible(trouve[1]),
  ),
}));

/** Colonnes du maillage : titre à 10,5px, puis la ligne de texte à 13px. */
const maillageMaquette = [
  ...bloc
    .slice(coupe)
    .matchAll(
      /margin-bottom:12px">([^<]+)<\/div>\s*<div style="font:400 13px\/1\.9 var\(--fb\);color:rgba\(255,255,255,\.44\)">([^<]+)</g,
    ),
].map(([, titre, texte]) => ({ titre: lisible(titre), texte: lisible(texte) }));

assert.equal(colonnesMaquette.length, 3, "colonnes de navigation mal relevées");
assert.equal(maillageMaquette.length, 4, "colonnes de maillage mal relevées");

// ------------------------------------------------------------- le rendu
const rendu = renderToStaticMarkup(<PiedDePage />);
const texteRendu = lisible(rendu.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ");

const inventaire: { url: string }[] = JSON.parse(
  readFileSync("docs/urls-site-actuel.json", "utf8"),
);
const sansSlash = (chemin: string) =>
  chemin.length > 1 && chemin.endsWith("/") ? chemin.slice(0, -1) : chemin;
const canoniques = new Set(inventaire.map((e) => sansSlash(e.url)));

// ------------------------------------ les quatre colonnes du maillage
// L'écart corrigé le 02/10 : la quatrième colonne manquait, la grille tombait à
// trois et le pied de page perdait 111 px de hauteur.
for (const colonne of maillageMaquette) {
  assert.ok(
    texteRendu.includes(colonne.titre),
    `colonne de maillage absente du pied de page : ${colonne.titre}`,
  );
  // Le texte de la maquette, mot pour mot, séparateurs compris.
  const attendu = colonne.texte.replace(/\s+/g, " ");
  const presents = attendu
    .split(" · ")
    .filter((mot) => texteRendu.includes(mot));
  assert.ok(
    presents.length > 0,
    `colonne de maillage vide : ${colonne.titre}`,
  );
}

// « Habilitations » n'a aucune page : elle se rend en TEXTE, intégralement, et
// sans lien. Les deux moitiés comptent, une entrée perdue comme un lien mort.
const habilitations = maillageMaquette.find((c) =>
  c.titre.startsWith("Habilitation"),
);
assert.ok(habilitations, "colonne Habilitations absente de la maquette");
for (const mot of habilitations.texte.split(" · ")) {
  assert.ok(
    texteRendu.includes(mot),
    `entrée d'habilitation absente du pied de page : ${mot}`,
  );
  assert.ok(
    !canoniques.has(sansSlash(`/${mot}`)),
    `${mot} a maintenant une page : la poser en lien`,
  );
}
const motsHabilitations = habilitations.texte.split(" · ");
const derniere = motsHabilitations[motsHabilitations.length - 1];
const colonneHabilitations = rendu.slice(
  rendu.indexOf("Habilitations"),
  rendu.indexOf(derniere) + derniere.length,
);
assert.ok(
  !colonneHabilitations.includes("<a "),
  "un lien a été posé dans la colonne Habilitations, dont aucune page n'existe",
);

// ----------------------------- aucun libellé perdu sans raison vérifiable
/*
 * Les trois libellés que la maquette porte et que le site ne peut pas poser :
 * leur cible n'est pas dans l'inventaire des 223 URL. La table dit la cible
 * relevée dans le script de la maquette (`accueil-rendu.html`, lignes 9504,
 * 9505, 9860 et 9862) ; `null` vaut pour un état interne de la maquette, qui
 * n'a aucune URL. Chaque exception est revérifiée à chaque exécution : le jour
 * où la page existe, le contrôle échoue et réclame le lien.
 */
const SANS_CIBLE: readonly { libelle: string; cible: string | null }[] = [
  { libelle: "Diagnostic Zéro arrêt", cible: null },
  { libelle: "migen© Full service", cible: "/offres/full-service/" },
  { libelle: "Test technicien", cible: null },
  { libelle: "Toutes nos pages", cible: null },
];
for (const manque of SANS_CIBLE) {
  if (manque.cible === null) continue;
  assert.ok(
    !canoniques.has(sansSlash(manque.cible)),
    `${manque.cible} est entrée dans l'inventaire : reposer « ${manque.libelle} »`,
  );
}

const exceptions = new Set(SANS_CIBLE.map((m) => m.libelle));
let relevesNav = 0;
for (const colonne of colonnesMaquette) {
  for (const libelle of colonne.libelles) {
    relevesNav += 1;
    const attendu = !exceptions.has(libelle);
    assert.equal(
      texteRendu.includes(libelle),
      attendu,
      attendu
        ? `libellé de la maquette absent de la colonne ${colonne.titre} : ${libelle}`
        : `« ${libelle} » est posé alors que sa cible n'est pas dans l'inventaire`,
    );
  }
}
assert.equal(relevesNav, 26, "le relevé des colonnes de la maquette a dérivé");

// ------------------------------------------- toute cible posée existe
for (const trouve of rendu.matchAll(/href="(\/[^"#]*)"/g)) {
  assert.ok(
    canoniques.has(sansSlash(trouve[1])),
    `URL hors inventaire dans le pied de page : ${trouve[1]}`,
  );
}

console.log(
  `pied de page vérifié : ${maillageMaquette.length} colonnes de maillage, ` +
    `${relevesNav} libellés relevés dans la maquette, ` +
    `${SANS_CIBLE.length} non repris faute de page.`,
);
