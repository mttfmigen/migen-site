/**
 * Contrôle du rendu riche, sans navigateur.
 *
 *   bun components/site/blocs/verification-texte-riche.tsx
 *
 * Ce composant touche à la sécurité : il décide quelle cible devient un lien.
 * Une régression y enverrait des visiteurs hors du domaine depuis un contenu
 * éditorial. Le contrôle est donc celui-là, et pas un test d'apparence.
 */

import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import TexteRiche, { estCheminInterne } from "./TexteRiche";

const rendu = (t: string) => renderToStaticMarkup(<TexteRiche texte={t} />);

// ------------------------------------------------- ce qui doit devenir un lien
// Le slash final de l'attribut n'est PAS contrôlé ici : `next/link` le
// normalise selon `trailingSlash` de `next.config.ts`, que ce script, exécuté
// hors du moteur Next, ne lit pas. La forme servie se vérifie dans le
// navigateur, pas ici. Ce qui se contrôle ici est le reste : qu'un chemin
// interne devienne bien un lien, et vers le bon chemin.
assert.match(
  rendu("confiez votre [contrat](/offres/zero-arret/) à Migen"),
  /<a[^>]+href="\/offres\/zero-arret\/?"[^>]*>contrat<\/a>/,
  "un chemin interne doit devenir un lien",
);
assert.match(rendu("**Un périmètre écrit** : la suite"), /<strong>Un périmètre écrit<\/strong>/);
assert.match(rendu("deux [a](/a/) et [b](/b/)"), /href="\/a\/?"[\s\S]*href="\/b\/?"/);

// --------------------------------------------- ce qui NE doit PAS devenir un lien
for (const cible of [
  "javascript:alert(1)",
  "//exemple.invalid/",
  "https://exemple.invalid/",
  "http://exemple.invalid/",
  "/\\exemple.invalid",
  "mailto:a@b.c",
  "",
]) {
  const html = rendu(`voir [le libellé](${cible}) ici`);
  assert.doesNotMatch(html, /<a /, `cible refusée rendue en lien : ${cible}`);
  assert.match(html, /le libellé/, `le libellé doit rester lisible : ${cible}`);
  assert.ok(!estCheminInterne(cible), `estCheminInterne a accepté : ${cible}`);
}

// ------------------------------------------------------------ pas d'injection
const injecte = rendu('texte <img src=x onerror="alert(1)"> et [a](/a/)');
assert.doesNotMatch(injecte, /<img/, "le HTML du contenu doit être échappé, jamais interprété");
assert.match(injecte, /&lt;img/, "le chevron doit ressortir échappé");

// ------------------------------------------- un lien À L'INTÉRIEUR du gras
// Seize liens du cocon sortaient en texte brut, crochets visibles, sur six
// pages : l'alternance du motif capturait le gras et ne redescendait pas dedans.
{
  const html = rendu("voir le **[cahier des charges](/offres/residence/cahier-des-charges/)** ici");
  assert.match(html, /<strong>.*<a[^>]+href="\/offres\/residence\/cahier-des-charges\/?"/,
    "un lien dans du gras doit rester un lien");
  assert.doesNotMatch(html, /\[cahier des charges\]/, "aucun crochet ne doit survivre");
}

// --------------------------------- l'absence de texte, qui a cassé un build
// Le contenu vient d'un jsonb : un champ optionnel absent arrive en `undefined`.
// Un rendu qui plante là-dessus fait tomber la page entière au prerender.
assert.equal(rendu(undefined as unknown as string), "", "undefined doit rendre le vide");
assert.equal(rendu(null as unknown as string), "", "null doit rendre le vide");

// ------------------------------------------------- le texte sans balisage passe
assert.equal(rendu("du texte simple, sans rien"), "du texte simple, sans rien");
assert.equal(rendu(""), "");

console.log("TexteRiche : liens internes rendus, cibles externes refusées, HTML échappé.");
