/**
 * Le formulaire de contact rend-il l'habillage de la maquette ?
 *
 * Mesuré sur le HTML produit par le composant lui-même, et comparé à ce qui est
 * RELEVÉ sur la maquette, jamais supposé. Depuis le 02/10, la maquette est lue
 * en local, dans `maquette/accueil-rendu.html` (voir `maquette/LISEZ-MOI.md`) : la source de vérité de ce
 * contrôle est donc le fichier que le client a fourni, pas une note de lecture.
 * Si ce fichier n'est pas là, le contrôle tombe sur les valeurs relevées à la
 * main et le dit, plutôt que de passer en silence.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import { valideCharge } from "@/components/formulaire/validation";

const html = renderToStaticMarkup(<FormulaireContact formulaire="controle" />);

// La grille deux colonnes, et son écart.
assert.match(html, /<form[^>]*style="[^"]*display:\s*grid/, "le formulaire doit être une grille");
assert.match(html, /grid-template-columns:\s*1fr 1fr/, "deux colonnes 1fr 1fr");
assert.match(html, /<form[^>]*style="[^"]*gap:\s*12px/, "écart de 12px");

// Le bouton : pilule orange, libellé de la maquette, jamais transparent.
const bouton = html.match(/<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? "";
assert.ok(bouton, "un bouton d'envoi");
assert.match(bouton, /border-radius:\s*999px/, "bouton en pilule");
assert.match(bouton, /background:\s*var\(--acc\)/, "fond orange de marque");
assert.match(bouton, /On me rappelle dans l[’']heure/, "libellé de la maquette");
// Sous un titre de panneau, la maquette répète ce titre sur le bouton (297
// formulaires sur 327 des captures) : `PanneauFormulaire` le passe ici.
const boutonTitre =
  renderToStaticMarkup(<FormulaireContact formulaire="controle" libelleEnvoi="Parler à un chargé d’affaires" />)
    .match(/<button[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>/)?.[1] ?? "";
assert.equal(boutonTitre, "Parler à un chargé d’affaires", "le bouton répète le titre du panneau");
assert.doesNotMatch(bouton, /bg-foreground|text-background/, "plus d'utilitaire sans jeton");

// Les libellés : sur-titres discrets, en capitales. Le premier `<label>` du
// document est celui du champ piège, volontairement sans habillage : on prend
// le premier libellé visible.
const label =
  [...html.matchAll(/<label[^>]*>/g)]
    .map((trouve) => trouve[0])
    .find((balise) => !balise.includes("site_web")) ?? "";
assert.match(label, /text-transform:\s*uppercase/, "libellés en capitales");
assert.match(label, /10\.5px/, "libellés à 10,5 px");

// Le champ piège reste là et reste invisible : la sécurité n'a pas bougé.
assert.match(html, /name="site_web"/, "le champ piège existe");

// L'indicatif téléphonique : la maquette met une liste de pays DANS le cadre du
// numéro. Elle était absente du portage.
const enveloppe = html.match(/<span[^>]*display:flex[^>]*>[\s\S]*?name="indicatif"[\s\S]*?<\/span>/)?.[0] ?? "";
assert.ok(enveloppe, "l'indicatif et le numéro partagent un cadre");
assert.match(enveloppe, /width:\s*84px/, "liste d'indicatifs à 84 px");
assert.match(enveloppe, /aria-label="Indicatif/, "la liste a un nom accessible");
assert.match(enveloppe, /type="tel"/, "le numéro est bien dans ce cadre");

// Les six champs visibles sont obligatoires, message compris, comme la maquette.
const requis = [...html.matchAll(/<(?:input|textarea)[^>]*\brequired\b[^>]*>/g)].length;
assert.equal(requis, 6, `six champs obligatoires attendus, ${requis} rendus`);

// Et la comparaison directe au fichier du client, quand il est là.
const fichierMaquette = new URL(
  "../maquette/accueil-rendu.html",
  import.meta.url,
);
const maquette = existsSync(fichierMaquette)
  ? readFileSync(fichierMaquette, "utf8")
  : "";

if (maquette) {
  const debut = maquette.indexOf('id="form-nc"');
  assert.ok(debut > 0, "le formulaire de la maquette est introuvable dans le fichier");
  const bloc = maquette.slice(debut, debut + 9000);

  const requisMaquette = [...bloc.matchAll(/required=""/g)].length;
  assert.equal(requis, requisMaquette, "autant de champs obligatoires que la maquette");

  const optionsMaquette = [...bloc.matchAll(/<option /g)].length;
  const optionsSite = [...html.matchAll(/<option /g)].length;
  assert.equal(optionsSite, optionsMaquette, "autant d'indicatifs que la maquette");

  // Les libellés, dans l'ordre, au caractère près.
  const etiquettes = (source: string) =>
    [...source.matchAll(/font:\s*600 10\.5px[^>]*>([^<]+)</g)].map((t) => t[1].trim());
  assert.deepEqual(
    etiquettes(html),
    etiquettes(bloc),
    "les libellés et leur ordre sont ceux de la maquette",
  );
  console.log("comparé au fichier du client :", requisMaquette, "champs obligatoires,", optionsMaquette, "indicatifs");
} else {
  console.log("fichier maquette absent : contrôle sur les valeurs relevées à la main");
}

// test-technicien est un formulaire comme les autres (décision du 08/10) : la
// route exige pour lui les mêmes champs que pour « contact », et le composant
// rend les mêmes. Une validation ou un rendu réduits par identifiant échouent ici.
function verifieSansVariante(charge: typeof valideCharge, rendu: (formulaire: string) => string) {
  const partiel = { prenom: "Ana", email: "ana@exemple.fr", indicatif: "+33" };
  for (const formulaire of ["test-technicien", "contact"]) {
    assert.deepEqual(
      Object.keys(charge({ ...partiel, formulaire }).erreurs),
      ["entreprise", "nom", "telephone", "message"],
      `${formulaire} : la route doit exiger les champs de tous les formulaires`,
    );
  }
  const noms = (h: string) => [...h.matchAll(/\bname="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(noms(rendu("test-technicien")), noms(rendu("contact")), "test-technicien : champs rendus différents");
}
const rendFormulaire = (formulaire: string) => renderToStaticMarkup(<FormulaireContact formulaire={formulaire} />);
verifieSansVariante(valideCharge, rendFormulaire);
// Et il sait échouer : une route qui n'exige plus rien, un rendu réduit.
assert.throws(() => verifieSansVariante((b) => ({ ...valideCharge(b), erreurs: {} }), rendFormulaire));
assert.throws(() =>
  verifieSansVariante(valideCharge, (f) =>
    f === "test-technicien" ? rendFormulaire(f).replace(/<textarea[\s\S]*?<\/textarea>/, "") : rendFormulaire(f),
  ),
);

console.log("formulaire conforme à la maquette ; test-technicien : mêmes champs et même validation que les autres formulaires");
