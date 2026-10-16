/**
 * PORTE DES ACCROCHES DE CARTES FERMÉES, règle de la maquette V3 (16/10).
 *
 *   bun components/site/blocs/verification-accroches.tsx
 *
 * 1. LA RÈGLE, sur des cas RELEVÉS dans la V3 (vue « Site mobile ») : ce que
 *    la carte fermée y affiche, à partir de nos propres données.
 * 2. TOUTES LES FICHES : chaque « L'offre » et chaque « Le déroulé » des
 *    fiches `supabase/import/gabarits-maquette/*.json` reçoit une accroche,
 *    et aucune n'ouvre sur une phrase de renvoi.
 * 3. TÉMOIN : l'ancienne règle (« l'introduction, sinon la prose qui suit le
 *    tableau ») est rejouée sur `/offres/residence/` et doit tomber, sans quoi
 *    la porte ne saurait pas échouer.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import { accrocheDuDeroule } from "@/components/site/offre/DerouleOffre";
import { accrocheDeLOffre } from "@/components/site/offre/PointsOffre";
import type { Section, SectionDeroule, SectionOffre } from "@/types/contenu";

import { accrocheDe, estUnRenvoi, ligneDuCorpus } from "./resume-de-section";

/* ------------------------------------------------- 1. cas relevés dans la V3 */

assert.equal(
  ligneDuCorpus({ accroche: "Un technicien évalué, présent au rythme convenu", texte: ", temps plein ou partagé." }),
  "Un technicien évalué, présent au rythme convenu, temps plein ou partagé.",
  "V3 /offres/residence/, « L'offre » : la virgule continue l'intitulé",
);
assert.equal(
  ligneDuCorpus({ accroche: "Cadrage du besoin", texte: "un chargé d'affaires analyse le périmètre" }),
  "Cadrage du besoin : un chargé d'affaires analyse le périmètre",
  "V3 /offres/residence/, « Le déroulé » : « : » entre l'intitulé et le texte",
);
assert.equal(
  ligneDuCorpus({ accroche: "Visite et audit.", texte: "Inventaire des équipements" }),
  "Visite et audit. Inventaire des équipements",
  "V3 /travaux-industriels/ : un intitulé qui finit sa phrase n'appelle pas « : »",
);
assert.equal(
  ligneDuCorpus({ accroche: "Vous décrivez le besoin", texte: "par téléphone : panne, modification" }),
  "Vous décrivez le besoin par téléphone : panne, modification",
  "un texte qui pose ses deux-points continuait l'intitulé : jamais deux « : »",
);
assert.equal(
  accrocheDe([
    { paragraphe: "Pour trancher sans précipitation, notre [comparatif](/x/) met les deux options côte à côte." },
    { cellule: "Un technicien évalué" },
  ]),
  "Un technicien évalué",
  "une phrase de renvoi est sautée",
);
assert.equal(
  accrocheDe([{ liste: ["**Votre appel ou votre formulaire.** Rappel dans l'heure."] }]),
  "Votre appel ou votre formulaire. Rappel dans l'heure.",
  "V3 /bureau-etudes/bureau-etude-electrique/ : une liste numérotée se lit, le Markdown tombe",
);
assert.equal(accrocheDe([{ liste: [] }, { cellule: "Client" }]), "Client", "V3 /preuves/ : la première cellule");
assert.equal(accrocheDe([]), undefined, "rien à lire, rien d'écrit");

/* ------------------------------------------------------- 2. toutes les fiches */

const DOSSIER = "supabase/import/gabarits-maquette";
let offres = 0;
let deroules = 0;
const defauts: string[] = [];

for (const fichier of readdirSync(DOSSIER).filter((f) => f.endsWith(".json"))) {
  const page = JSON.parse(readFileSync(`${DOSSIER}/${fichier}`, "utf8"));
  const sections: Section[] = page?.contenu?.sections ?? [];
  for (const section of sections) {
    if (section.type === "offre" && (section as SectionOffre).lignes?.length) {
      offres += 1;
      const accroche = accrocheDeLOffre(section as SectionOffre);
      if (!accroche) defauts.push(`${page.url} : « L'offre » sans accroche`);
      else if (estUnRenvoi(accroche)) defauts.push(`${page.url} : « L'offre » ouvre sur un renvoi`);
    }
    if (section.type === "deroule" && (section as SectionDeroule).etapes?.length) {
      deroules += 1;
      const accroche = accrocheDuDeroule(section as SectionDeroule);
      if (!accroche) defauts.push(`${page.url} : « Le déroulé » sans accroche`);
      else if (/ : [^.]{0,40} : /.test(accroche.slice(0, 80))) {
        defauts.push(`${page.url} : « Le déroulé » coud deux « : » (${accroche.slice(0, 60)})`);
      }
    }
  }
}
assert.deepEqual(defauts, [], defauts.join("\n"));
assert.ok(offres > 100 && deroules > 100, `trop peu de fiches lues (${offres} offres, ${deroules} déroulés)`);

/* ----------------------------------------------------------------- 3. témoin */

{
  const residence = JSON.parse(readFileSync(`${DOSSIER}/offres-residence.json`, "utf8"));
  const offre = (residence.contenu.sections as Section[]).find((s) => s.type === "offre") as SectionOffre;
  const ancienne = offre.intro?.trim() || [offre.prose?.[0]?.accroche, offre.prose?.[0]?.texte].filter(Boolean).join(" ");
  const complement: string | undefined = residence.contenu.complementOffre?.[0]?.texte;
  const lue = ancienne || complement || "";
  assert.ok(estUnRenvoi(lue), "témoin : l'ancienne règle devait tomber sur le renvoi de /offres/residence/");
  assert.ok(!estUnRenvoi(accrocheDeLOffre(offre, [complement]) ?? ""), "témoin : la nouvelle règle le saute");
}

console.log(
  `porte des accroches V3 : 8 cas relevés, ${offres} « L'offre » et ${deroules} « Le déroulé » ` +
    "ont chacun leur accroche, aucun renvoi, le témoin tombe.",
);
