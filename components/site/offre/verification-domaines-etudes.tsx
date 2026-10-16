/**
 * « Nos domaines d’études » (V3, 16/10) : photos autorisées, liens réels,
 * tuiles posées sur les bonnes pages.
 *
 *   bun components/site/offre/verification-domaines-etudes.tsx
 *
 * CE QU'ELLE REFUSE : une photo hors de la répartition de
 * `lib/photos-autorisees.ts` (dont les images `assets/web/x-…` que sert la V3),
 * une photo hors industrie, une tuile vers une adresse que l'index ne connaît
 * pas, un bloc posé hors du bureau d’études, la tuile de la page sur elle-même.
 * Le témoin en tête prouve que le filtre des photos sait dire non.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { deLaRepartition, RACINE } from "@/lib/photos-autorisees";
import { PHOTOS_HORS_INDUSTRIE } from "@/lib/photos-hors-industrie";

import { DOMAINES_ETUDES, domainesPour } from "./DomainesEtudes";

const index = JSON.parse(
  readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"),
) as { url: string }[];
const connues = new Set(index.map((page) => page.url));

const verdicts: [string, boolean][] = [
  ["TÉMOIN une image de la V3 (assets/web/x-robotique.jpg) est refusée", !deLaRepartition("/assets/web/x-robotique.jpg")],
  ...DOMAINES_ETUDES.map((d): [string, boolean] => [
    `${d.titre} : photo de la répartition, hors liste « hors industrie »`,
    deLaRepartition(d.photo) && !PHOTOS_HORS_INDUSTRIE.has(d.photo.split("/").pop() ?? ""),
  ]),
  ...DOMAINES_ETUDES.map((d): [string, boolean] => [`${d.titre} : ${d.href} est une page de l'index`, connues.has(d.href)]),
  ["cinq photos distinctes", new Set(DOMAINES_ETUDES.map((d) => d.photo)).size === DOMAINES_ETUDES.length],
  ["aucun tiret cadratin", !DOMAINES_ETUDES.some((d) => /\u2014/.test(d.titre + d.phrase))],
  ["/offres/bureau-etudes/ porte les cinq tuiles", domainesPour("/offres/bureau-etudes/").length === 5],
  [
    "/bureau-etudes/ porte les quatre autres, sans sa propre tuile",
    domainesPour("/bureau-etudes/").length === 4 &&
      !domainesPour("/bureau-etudes/").some((d) => d.href === "/bureau-etudes/"),
  ],
  [
    "/bureau-etudes/bureau-etude-electrique/ ne se cite pas",
    !domainesPour("/bureau-etudes/bureau-etude-electrique/").some(
      (d) => d.href === "/bureau-etudes/bureau-etude-electrique/",
    ),
  ],
  ["rien hors du bureau d’études (/offres/residence/)", domainesPour("/offres/residence/").length === 0],
  ["rien sur /offres/retrofit/mise-en-conformite-machine/", domainesPour("/offres/retrofit/mise-en-conformite-machine/").length === 0],
];

for (const [quoi, ok] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}`);
if (!verdicts.every(([, ok]) => ok)) process.exit(1);
console.log(`\nDOMAINES_ETUDES_CONFORMES (${verdicts.length}/${verdicts.length})`);
