/**
 * Porte du lecteur latéral, sur sa DONNÉE : chacune des 40 adresses que le
 * hub ouvre dans le lecteur y arrive avec le texte attendu. Lecture seule.
 *
 *   bun --conditions react-server components/site/ressource/lecteur/verification-lecteur.ts
 *
 * Adresse de la maquette « Ressources v2 » (15 articles, 13 fiches) : le
 * lecteur lit l'entrée `__MGRES`. Chaque texte de l'entrée, après les seules
 * décisions de copie de Mehdi, doit y être ; fil, minutes, parties, photo et
 * « À lire ensuite » doivent être ceux de la maquette, et la carte du hub
 * (transcription séparée, `donnees.ts`) doit dire la même chose.
 * Adresse absente de la maquette (12 billets repris) : chaque texte de sa
 * page (chapô, parties, blocs, `avant`, questions) doit arriver au lecteur.
 * Le rendu, lui, est comparé à la maquette par `verification-lecteur-articles.mjs`.
 */
import { CONTENUS_ENTREPRISES, CONTENUS_TECHNICIENS } from "@/components/site/ressources-hub/v2/donnees";
import { pageParChemin } from "@/lib/contenu";
import { appliqueDecisions } from "@/lib/decisions-copie";
import donnees from "@/lib/ressources-maquette.json";
import type { EntreeMaquette } from "@/lib/ressources-maquette";
import { estRessource } from "@/types/ressource";

import { lectureDePage, lectureMaquette, type Lecture } from "./lecture";

const M = donnees as unknown as Record<"articles" | "paused" | "metiers" | "guides", EntreeMaquette[]>;
const TECH = [...M.metiers, ...M.guides];
const ecarts: string[] = [];
const ecart = (url: string, quoi: string) => ecarts.push(`${url} : ${quoi}`);

/** Toutes les chaînes d'une valeur, sauf les clés écartées. */
const chaines = (v: unknown, sauf: Set<string>): string[] =>
  typeof v === "string"
    ? [v]
    : Array.isArray(v)
      ? v.flatMap((x) => chaines(x, sauf))
      : v && typeof v === "object"
        ? Object.entries(v).flatMap(([k, x]) => (sauf.has(k) ? [] : chaines(x, sauf)))
        : [];

const arrivent = (url: string, lu: Lecture, attendus: string[]) => {
  const json = JSON.stringify(lu);
  for (const t of attendus) if (t && !json.includes(JSON.stringify(t).slice(1, -1))) ecart(url, `absent du lecteur « ${t.slice(0, 70)} »`);
};

let deLaMaquette = 0;
for (const carte of [...CONTENUS_ENTREPRISES, ...CONTENUS_TECHNICIENS]) {
  const url = carte.url;
  const e = [...M.articles, ...M.paused, ...TECH].find((x) => x.url === url);
  if (e) {
    deLaMaquette++;
    const lu = lectureMaquette(url);
    if (!lu) {
      ecart(url, "dans la maquette mais pas lu par le lecteur");
      continue;
    }
    // Le texte : chaque chaîne de l'entrée, décisions de copie appliquées.
    arrivent(url, lu, chaines({ ...e, lead: e.lead || e.ex }, new Set(["url", "img", "title", "meta", "ex"])).map((t) => appliqueDecisions(t, url)));
    // La forme : celle que la maquette calcule (`rd`, `card`).
    const tech = TECH.includes(e);
    const famille = tech ? TECH : M.articles;
    const suivante = famille[(famille.indexOf(e) + 1) % famille.length];
    const attendu = {
      tech,
      kind: e.kind,
      theme: e.theme,
      min: e.min,
      parties: e.secs.length,
      photo: `/assets/web/${e.img}`,
      suivante: suivante.url,
    };
    const obtenu = {
      tech: lu.tech,
      kind: lu.kind,
      theme: lu.theme,
      min: lu.min,
      parties: lu.secs.length,
      photo: lu.photo?.src,
      suivante: lu.suivante.url,
    };
    if (JSON.stringify(obtenu) !== JSON.stringify(attendu)) ecart(url, `forme ${JSON.stringify(obtenu)} au lieu de ${JSON.stringify(attendu)}`);
    // La carte du hub, transcription séparée, dit la même chose que le lecteur.
    const carteAttendue = { titre: lu.h1, format: lu.kind, sujet: lu.theme, minutes: lu.min, photo: lu.photo?.src };
    const carteLue = { titre: carte.titre, format: carte.format, sujet: carte.sujet, minutes: carte.minutes, photo: carte.photo };
    if (JSON.stringify(carteLue) !== JSON.stringify(carteAttendue)) ecart(url, `carte du hub ${JSON.stringify(carteLue)} contre lecteur ${JSON.stringify(carteAttendue)}`);
    continue;
  }
  const c = await pageParChemin(url);
  if (!c || !estRessource(c.page.contenu)) {
    ecart(url, "ni dans la maquette, ni page ressource");
    continue;
  }
  const contenu = c.page.contenu;
  const lu = lectureDePage(url, c.page.titre_h1, contenu, carte);
  // Une puce « **titre** : texte » arrive en deux morceaux : on attend les morceaux.
  const morceaux = chaines(contenu, new Set(["gabarit", "rayon", "type", "image", "src", "imageAlt"])).flatMap((t) => {
    const m = /^\*\*([^*]+)\*\*\s*:\s*([\s\S]+)$/.exec(t.trim());
    return m ? [m[1], m[2]] : [t];
  });
  arrivent(url, lu, [c.page.titre_h1, ...morceaux]);
  if (lu.kind !== carte.format || lu.theme !== carte.sujet) ecart(url, `fil ${lu.kind} / ${lu.theme} au lieu de ${carte.format} / ${carte.sujet}`);
}

if (deLaMaquette !== 28) ecart("hub", `${deLaMaquette} adresses du hub dans la maquette au lieu de 28`);
if (ecarts.length) {
  console.error(ecarts.join("\n"));
  process.exit(1);
}
console.log(
  `VERT : ${CONTENUS_ENTREPRISES.length + CONTENUS_TECHNICIENS.length} adresses du hub, ${deLaMaquette} lues dans la maquette, les autres dans leur page, tout le texte arrive dans le lecteur.`,
);
