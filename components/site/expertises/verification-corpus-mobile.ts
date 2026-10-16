/**
 * Contrôle de `corpus-mobile.ts`, sans navigateur :
 *
 *   bun components/site/expertises/verification-corpus-mobile.ts
 *
 * Relit chaque fiche de la rubrique (`maquette/contenu/site/index.json`) et
 * exige que les tables soient EXACTEMENT ce que les fiches écrivent : l'appel
 * sous « ## Ce que nous garantissons » pour chaque page, la prose sous le
 * tableau de « ## L’offre » pour chaque domaine (gabarit 09), et pour chaque
 * page dont le relais porte « Complément 2 », les paragraphes de « ## La
 * réponse directe » qui diffèrent du relais et ses listes numérotées. Une
 * phrase réécrite, une page en trop ou en moins, et le contrôle échoue. Puis
 * il prouve qu'il sait échouer.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Paragraphe, SectionCta } from "@/types/contenu";
import type { BlocComplementDomaine } from "@/types/domaine";

import {
  APPELS_GARANTIES,
  PROSE_OFFRE_DOMAINE,
  REPONSE_DIRECTE,
  type ReponseDirecteCorpus,
} from "./corpus-mobile";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const FICHES = join(RACINE, "maquette", "contenu", "site");
const RELAIS = join(RACINE, "supabase", "import", "gabarits-maquette");

/** Le bloc d'une section `## titre` de la fiche, jusqu'à la suivante. */
const bloc = (md: string, titre: string) => md.split(`\n## ${titre}\n`)[1]?.split("\n## ")[0] ?? "";

function appelDe(md: string): SectionCta {
  const lignes = bloc(md, "Ce que nous garantissons")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("- "));
  const questions = lignes.flatMap((l) => /^\*\*(.+)\*\*$/.exec(l)?.[1] ?? []);
  const liens = lignes.flatMap((l) => /^> \[([^\]]+)\]\(([^)]+)\)/.exec(l) ?? []);
  const rappels = lignes.filter((l) => l.startsWith("Ou appelez"));
  assert.equal(questions.length, 1, `une question en gras : ${lignes.join(" | ")}`);
  assert.equal(liens[2], "/contact/", `un bouton vers /contact/ : ${lignes.join(" | ")}`);
  assert.equal(rappels.length, 1, `une phrase « Ou appelez… » : ${lignes.join(" | ")}`);
  return { type: "cta", question: questions[0], bouton: liens[1], rappel: rappels[0] };
}

/** Même lecture que `scripts/restaure-corpus-expertises.mjs` (`proseDeLOffre`). */
const proseDe = (md: string): Paragraphe[] =>
  bloc(md, "L’offre")
    .split("\n")
    .map((l) => l.trim())
    .filter((t) => t !== "" && !/^[|>\-#]/.test(t) && !/^\d+\./.test(t))
    .map((texte) => ({ texte }));

/** Le texte tel que le relais le garde : sans gras ni lien. */
const nu = (t: string) => t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();

function reponseDirecteDe(md: string, blocs: readonly BlocComplementDomaine[]): ReponseDirecteCorpus {
  const lignes = bloc(md, "La réponse directe").split("\n").map((l) => l.trimEnd());
  const paragraphes = lignes.filter((l) => l !== "" && !/^(\||- |\d+\. )/.test(l));
  const listes: { numerotee: boolean; items: string[] }[] = [];
  let liste: (typeof listes)[number] | undefined;
  for (const ligne of lignes) {
    const m = /^(- |\d+\. )(.*)/.exec(ligne);
    if (!m) {
      liste = undefined;
      continue;
    }
    const numerotee = m[1] !== "- ";
    if (liste?.numerotee !== numerotee) listes.push((liste = { numerotee, items: [] }));
    liste.items.push(m[2]);
  }
  const textes: Record<string, string> = {};
  const numerotees: string[] = [];
  for (const b of blocs) {
    if (b.texte) {
      const texte = b.texte;
      const trouves = paragraphes.filter((p) => nu(p) === texte || nu(p).endsWith(` ${texte}`));
      assert.equal(trouves.length, 1, `un paragraphe de la fiche pour « ${texte.slice(0, 60)} »`);
      if (trouves[0] !== texte) textes[texte] = trouves[0];
    }
    const premiere = b.puces?.[0];
    if (premiere) {
      const accroche = (premiere.accroche ?? premiere.texte).trim();
      const trouvees = listes.filter((l) => nu(l.items[0]).startsWith(accroche));
      assert.equal(trouvees.length, 1, `une liste de la fiche pour « ${accroche} »`);
      if (trouvees[0].numerotee) numerotees.push(accroche);
    }
  }
  const chiffres = [...(bloc(md, "La réponse directe").split("**Les chiffres Migen**")[1] ?? "").matchAll(
    /^- \*\*([^*]+)\*\*/gm,
  )].map((m) => m[1]);
  assert.ok(chiffres.length > 0, "« Les chiffres Migen » dans la réponse directe");
  return { textes, numerotees, chiffres };
}

interface Entree {
  url: string;
  gabarit?: string;
  fichier: string;
}

const pages = (JSON.parse(readFileSync(join(FICHES, "index.json"), "utf8")) as Entree[]).filter((e) =>
  e.url.startsWith("/expertises/"),
);
const attendus = {
  appels: {} as Record<string, SectionCta>,
  proses: {} as Record<string, Paragraphe[]>,
  reponses: {} as Record<string, ReponseDirecteCorpus>,
};
for (const page of pages) {
  const md = readFileSync(join(FICHES, page.fichier), "utf8");
  attendus.appels[page.url] = appelDe(md);
  if (page.gabarit?.startsWith("09")) attendus.proses[page.url] = proseDe(md);
  if (page.url === "/expertises/") continue;
  const relais = JSON.parse(
    readFileSync(join(RELAIS, `${page.url.split("/").filter(Boolean).join("-")}.json`), "utf8"),
  ) as { contenu: { complementTypes?: BlocComplementDomaine[] } };
  const blocs = relais.contenu.complementTypes ?? [];
  if (blocs.length) attendus.reponses[page.url] = reponseDirecteDe(md, blocs);
}

assert.deepEqual(APPELS_GARANTIES, attendus.appels, "APPELS_GARANTIES diffère des fiches");
assert.deepEqual(PROSE_OFFRE_DOMAINE, attendus.proses, "PROSE_OFFRE_DOMAINE diffère des fiches");
assert.deepEqual(REPONSE_DIRECTE, attendus.reponses, "REPONSE_DIRECTE diffère des fiches");
assert.ok(Object.values(attendus.proses).every((p) => p.length > 0), "chaque domaine a sa prose");

/* Le contrôle sait échouer : un mot changé, une page retirée. */
const [premier] = Object.keys(attendus.appels);
assert.throws(() =>
  assert.deepEqual(
    { ...APPELS_GARANTIES, [premier]: { ...APPELS_GARANTIES[premier], question: "Autre ?" } },
    attendus.appels,
  ),
);
const sansPremier = Object.fromEntries(Object.entries(APPELS_GARANTIES).filter(([url]) => url !== premier));
assert.throws(() => assert.deepEqual(sansPremier, attendus.appels));

console.log(
  `corpus mobile : ${Object.keys(APPELS_GARANTIES).length} appels, ${Object.keys(PROSE_OFFRE_DOMAINE).length} proses de domaine et ${Object.keys(REPONSE_DIRECTE).length} « réponses directes », mot pour mot dans les fiches.`,
);
