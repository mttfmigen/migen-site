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
 * 4. LA COUTURE CONTRE LE CORPUS (`maquette/contenu/_store-pages.json`, 16/10) :
 *    - chaque `point` des fiches répond à un « **Titre.** » du corpus, et
 *      chaque « **Titre.** » d'une étape, d'une carte de réponse ou d'une liste
 *      numérotée de guide porte son `point` ;
 *    - après « : », la minuscule partout où le corpus l'écrit, et une capitale
 *      gardée seulement là où le corpus la garde aussi (un nom propre ou un
 *      sigle n'est jamais baissé, un mot courant jamais épargné à tort).
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
assert.equal(
  ligneDuCorpus({ accroche: "Qualification", texte: "Un chargé d'affaires étudie votre parc" }),
  "Qualification : un chargé d'affaires étudie votre parc",
  "V3 /secteurs/agroalimentaire/, « Le déroulé » : minuscule après « : »",
);
assert.equal(
  ligneDuCorpus({ accroche: "Expression du besoin", texte: "ALSTEF Group cherche du renfort qualifié" }),
  "Expression du besoin : ALSTEF Group cherche du renfort qualifié",
  "V3 /preuves/alstef-group/ : un sigle garde ses capitales",
);
assert.equal(
  ligneDuCorpus({ accroche: "Rapprochement", texte: "Savoye et Migen constatent des besoins communs" }),
  "Rapprochement : Savoye et Migen constatent des besoins communs",
  "V3 /preuves/savoye/ : un nom propre garde sa capitale",
);
assert.equal(
  ligneDuCorpus({ accroche: "Relais du Grand Ouest", texte: "Loire-Atlantique, Rennes, Brest." }),
  "Relais du Grand Ouest : Loire-Atlantique, Rennes, Brest.",
  "/implantations/nantes/ : un nom composé garde sa capitale",
);
assert.equal(
  ligneDuCorpus({ accroche: "Sélection", texte: "Migen est retenu pour rejoindre Eiffage", point: true }),
  "Sélection. Migen est retenu pour rejoindre Eiffage",
  "V3 /preuves/eiffage/, « Le déroulé » : le point du corpus, pas « : »",
);

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

/* ------------------------------------------------ 4. la couture, au corpus */

const STORE: Record<string, string> = JSON.parse(readFileSync("maquette/contenu/_store-pages.json", "utf8"));
const CORPUS = new Map<string, string>(
  (JSON.parse(STORE["contenu/site/index.json"]) as { url: string; fichier: string }[]).map((e) => [
    e.url,
    STORE[`contenu/site/${e.fichier}`] ?? "",
  ]),
);
const PROSE = [...CORPUS.values()].join("\n").replace(/\]\([^)]*\)/g, "] ").replace(/https?:\S+/g, " ");
/** Relus le 16/10 : des mots courants que le corpus n'écrit qu'en tête de phrase. */
const MOTS_COURANTS = new Set(["Brief", "Billets"]);
const jamaisEnMinuscule = (mot: string) =>
  !new RegExp(`(?<![\\p{L}\\p{N}/-])${mot.charAt(0).toLowerCase()}${mot.slice(1)}(?![\\p{L}\\p{N}])`, "u").test(PROSE);
const echappe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type Titree = { titre?: string; texte?: string; point?: boolean };
function titrees(contenu: Record<string, unknown>): Titree[] {
  const out: Titree[] = [...((contenu.etapes as Titree[]) ?? []), ...((contenu.reponseCartes as Titree[]) ?? [])];
  const blocs = (bs: { type?: string; items?: Titree[]; blocs?: unknown[] }[] | undefined): void => {
    for (const b of bs ?? []) {
      if (b.type === "numeros" || b.type === "etapes") out.push(...(b.items ?? []));
      if (b.type === "suite") blocs(b.blocs as typeof bs);
    }
  };
  const edito = contenu.edito as { intro?: []; sections?: { blocs?: [] }[] } | undefined;
  blocs(edito?.intro);
  for (const s of edito?.sections ?? []) blocs(s.blocs);
  return out;
}

let points = 0;
let coutures = 0;
const fautes: string[] = [];
for (const fichier of readdirSync(DOSSIER).filter((f) => f.endsWith(".json"))) {
  const page = JSON.parse(readFileSync(`${DOSSIER}/${fichier}`, "utf8"));
  const corpus = CORPUS.get(page.url) ?? "";
  for (const x of titrees(page.contenu ?? {})) {
    const titre = (x.titre ?? "").trim();
    if (!titre || /[.!?:]$/.test(titre)) continue;
    const clos = new RegExp(`\\*\\*${echappe(titre)}\\.\\*\\*`).test(corpus);
    if (x.point) points += 1;
    if (clos !== Boolean(x.point)) {
      fautes.push(`${page.url} : « ${titre} » ${clos ? "clos par un point dans le corpus, sans `point`" : "porte `point` sans le corpus"}`);
    }
  }
  const lire = (o: unknown): void => {
    if (Array.isArray(o)) return o.forEach(lire);
    if (!o || typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    for (const cle of ["accroche", "titre"]) {
      const a = typeof r[cle] === "string" ? (r[cle] as string).trim() : "";
      const t = typeof r.texte === "string" ? r.texte.trim() : "";
      const ligne = a && t ? ligneDuCorpus({ accroche: a, texte: t, suitAccroche: r.suitAccroche as boolean, point: r.point as boolean }) : undefined;
      if (!ligne?.startsWith(`${a} : `)) continue;
      const lu = new RegExp(`\\*\\*${echappe(a)}\\*\\* ?: ?(\\p{L})${echappe(t.slice(1, 20))}`, "u").exec(corpus);
      if (!lu) continue;
      coutures += 1;
      const ecrit = ligne.charAt(a.length + 3);
      const corpusBaisse = lu[1] === lu[1].toLowerCase();
      const nousBaissons = ecrit === ecrit.toLowerCase();
      if (corpusBaisse && !nousBaissons) fautes.push(`${page.url} : « ${ligne.slice(0, 60)} » garde une capitale que le corpus baisse`);
      /* Baissée ici, gardée par le corpus : un mot courant (le corpus en garde
         ~400, « Les », « Vous »…), jamais un mot que le corpus n'écrit
         nulle part en minuscule, la marque d'un nom propre oublié. */
      const mot = t.match(/^[\p{L}\p{N}-]+/u)?.[0] ?? "";
      if (!corpusBaisse && nousBaissons && mot.length > 1 && !MOTS_COURANTS.has(mot) && jamaisEnMinuscule(mot)) fautes.push(`${page.url} : « ${mot} » baissé, nom propre ?`);
    }
    Object.values(r).forEach(lire);
  };
  lire(page.contenu);
}
assert.deepEqual(fautes, [], fautes.slice(0, 20).join("\n"));
assert.ok(points > 100 && coutures > 1000, `trop peu de coutures lues (${points} points, ${coutures} « : »)`);

console.log(
  `porte des accroches V3 : 13 cas relevés, ${offres} « L'offre » et ${deroules} « Le déroulé » ` +
    `ont chacun leur accroche, aucun renvoi, le témoin tombe ; ${points} points du corpus portés, ` +
    `${coutures} coutures « : » conformes au corpus.`,
);
