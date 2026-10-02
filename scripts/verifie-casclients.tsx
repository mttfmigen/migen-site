/**
 * Contrôle du contenu CAS CLIENTS composé pour /preuves/ et /realisations/,
 * contre le contrat de `types/casclients.ts` et les interdits de copie.
 *
 *   bun scripts/verifie-casclients.tsx
 *
 * Sur le modèle de `verifie-contenu.ts` : le contenu part dans un `jsonb`, et
 * rien entre le JSON et le gabarit ne vérifie la forme. Ici : le discriminant,
 * les chaînes obligatoires, les liens internes contre l'inventaire des URL, les
 * visuels contre `public/`, les interdits de copie, puis un rendu réel du
 * gabarit pour compter ce qui s'affiche. Il échoue bruyamment.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageCasClients from "@/components/site/casclients/PageCasClients";
import { estCasClients, type ContenuCasClients } from "@/types/casclients";

const CHEMIN = "supabase/import/casclients-analyse.json";

interface Analyse {
  url: string;
  // Typé contre le contrat : `bunx tsc --noEmit` refuse un champ hors type.
  contenu: ContenuCasClients;
}

interface PageInventaire {
  url: string;
  h1: string;
}

/** Interdits de copie du contrat, plus les deux chiffres que la maquette enfreint. */
const INTERDITS =
  /\b(r[ée]gie|int[ée]rim|mise à disposition|sans engagement|cl[ée] en main|sur mesure|levier|concr[èe]tement|notamment|incontournable|d[ée]couvrez)\b|—|\b5 agences\b|\+200\b|\b200 clients\b/i;
/** Un délai d'intervention chiffré : « en 24 h », « sous 48 heures », « en 2 jours ». */
const DELAI_CHIFFRE = /\b(en|sous) (moins de )?\d+ ?(h|heures?|jours?|min(utes)?)\b/i;

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;

function chaines(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(chaines);
  if (v && typeof v === "object") return Object.values(v).flatMap(chaines);
  return [];
}

const analyses = JSON.parse(readFileSync(CHEMIN, "utf8")) as Analyse[];
const inventaire = new Map(
  (JSON.parse(readFileSync("docs/urls-site-actuel.json", "utf8")) as PageInventaire[]).map(
    (p) => [p.url, p.h1],
  ),
);

assert.equal(analyses.length, 2, "deux pages attendues : /preuves/ et /realisations/");
assert.deepEqual(analyses[0].contenu, analyses[1].contenu, "même contenu sur les deux chemins");

for (const { url, contenu } of analyses) {
  const ou = url;
  assert.ok(inventaire.has(url), `${ou} : absent de l'inventaire des URL`);
  assert.ok(estCasClients(contenu), `${ou} : gabarit "casclients" attendu`);

  assert.ok(estChaine(contenu.chapeau), `${ou}.chapeau : chaîne non vide attendue`);

  const chiffres = contenu.chiffres;
  assert.ok(chiffres, `${ou}.chiffres : attendu`);
  assert.ok(estChaine(chiffres.principal.valeur), `${ou}.chiffres.principal.valeur`);
  assert.ok(estChaine(chiffres.principal.libelle), `${ou}.chiffres.principal.libelle`);
  // Le type l'écrit : au-delà de deux cartes, elles débordent la grille.
  assert.ok((chiffres.cartes ?? []).length <= 2, `${ou}.chiffres.cartes : deux au plus`);
  // Le filet se pose entre deux chiffres.
  assert.equal((chiffres.duo ?? []).length, 2, `${ou}.chiffres.duo : deux chiffres attendus`);
  for (const c of [...(chiffres.cartes ?? []), ...(chiffres.duo ?? [])]) {
    assert.ok(estChaine(c.valeur) && estChaine(c.libelle), `${ou}.chiffres : valeur et libellé`);
  }

  const chantiers = contenu.chantiers ?? [];
  assert.ok(chantiers.length > 0, `${ou}.chantiers : au moins un`);
  for (const [i, ch] of chantiers.entries()) {
    const o = `${ou}.chantiers[${i}]`;
    assert.ok(estChaine(ch.client), `${o}.client`);
    assert.ok(estChaine(ch.titre), `${o}.titre`);
    if (ch.href !== undefined) {
      assert.ok(ch.href.startsWith("/preuves/"), `${o}.href : fiche /preuves/<client>/ attendue`);
      assert.ok(inventaire.has(ch.href), `${o}.href : ${ch.href} absent de l'inventaire`);
    }
    if (ch.image !== undefined) {
      assert.ok(ch.image.startsWith("/assets/"), `${o}.image : chemin servi attendu`);
      assert.ok(existsSync(`public${ch.image}`), `${o}.image : public${ch.image} introuvable`);
    }
  }
  // Le titre par défaut du gabarit annonce six chantiers : il doit rester vrai.
  if (contenu.titreChantiers === undefined) {
    assert.equal(chantiers.length, 6, `${ou} : six chantiers, ou un titreChantiers corrigé`);
  }

  if (contenu.avis) {
    assert.ok(estChaine(contenu.avis.note), `${ou}.avis.note`);
    assert.ok(estChaine(contenu.avis.mention), `${ou}.avis.mention`);
    for (const [i, v] of (contenu.avis.verbatims ?? []).entries()) {
      assert.ok(estChaine(v.texte) && estChaine(v.contexte), `${ou}.avis.verbatims[${i}]`);
    }
  }

  for (const s of chaines(contenu)) {
    assert.ok(!INTERDITS.test(s), `${ou} : interdit de copie dans « ${s} »`);
    assert.ok(!DELAI_CHIFFRE.test(s), `${ou} : délai chiffré dans « ${s} »`);
  }

  // Rendu réel : ce que la page affiche avec ce contenu.
  const html = renderToStaticMarkup(
    <PageCasClients titre={inventaire.get(url) ?? url} contenu={contenu} />,
  );
  assert.equal((html.match(/<h1/g) ?? []).length, 1, `${ou} : un seul H1`);
  // La section des chantiers seule : le process qui la suit rend aussi des H3.
  const debutCas = html.indexOf('id="cas"');
  assert.ok(debutCas >= 0, `${ou} : section #cas absente`);
  const sectionCas = html.slice(debutCas, html.indexOf("<section", debutCas + 1));
  assert.equal((sectionCas.match(/<h3/g) ?? []).length, chantiers.length, `${ou} : une carte par chantier`);
  const fiches = chantiers.filter((c) => c.href).length;
  assert.equal((sectionCas.match(/href="\/preuves\/[^"]+"/g) ?? []).length, fiches, `${ou} : un lien par fiche`);
  assert.ok(contenu.avis && html.includes(contenu.avis.note), `${ou} : la note Google s'affiche`);
  assert.ok(html.includes('href="#cas"'), `${ou} : le bouton « Six chantiers livrés » mène à l'ancre`);
  assert.ok(!html.includes("—"), `${ou} : tiret cadratin dans le rendu`);
  console.log(`${url} : ${chantiers.length} chantiers (${fiches} fiches), note ${contenu.avis?.note}, rendu ${html.length} caractères`);
}

console.log("Contrat respecté : le contenu CAS CLIENTS a la forme que son gabarit attend.");
