/**
 * Fige la carte de France de « Nos agences » (/contact/) en tracés SVG.
 *
 *   bun scripts/genere-carte-france.mjs
 *   bun scripts/genere-carte-france.mjs chemin/vers/countries-110m.json
 *
 * LA GÉOMÉTRIE EST CELLE DE LA MAQUETTE V3. Son composant `MigenAgences`
 * télécharge à chaque affichage `world-atlas@2.0.2/countries-110m.json` depuis
 * un CDN, puis le projette avec d3 (`geoMercator().fitExtent(...)` sur la
 * boîte [-5.4, 41.2] à [9.9, 51.3], dans 420 × 460). Ce script refait ce
 * calcul UNE FOIS, sans d3 ni topojson, et écrit le résultat dans
 * `components/site/contact/carte-france.ts`. La page ne charge donc ni
 * bibliothèque ni donnée externe : elle rend des chaînes `d`.
 *
 * Les hubs sont les dix du site (`components/site/equipe/equipe-donnees.ts`,
 * `HUBS`), placés aux coordonnées de leur commune. Le siège, Écully, est le
 * point mis en avant, au nom du hub de Lyon.
 */

import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
const SORTIE = new URL("../components/site/contact/carte-france.ts", import.meta.url);

// Le cadre de la maquette V3, recopié de `MigenAgences`.
const LARGEUR = 420;
const HAUTEUR = 460;
const MARGE_X = 26;
const MARGE_Y = 22;
const BOITE = { ouest: -5.4, sud: 41.2, est: 9.9, nord: 51.3 };
/** Les tracés sont coupés un peu au-delà du cadre, que le clipPath masque. */
const DEBORD = 12;

/**
 * Coordonnées des communes (latitude, longitude). Le point du siège est celui
 * d'Écully, à 5 km du centre de Lyon : un pixel d'écart à cette échelle.
 * `cote` place l'étiquette : « d » à droite du point, « g » à gauche, « h »
 * au-dessus, « b » en dessous. Chaque côté est choisi pour que l'étiquette
 * reste dans la France sans couper un trait ni une autre étiquette, aussi
 * dans la taille agrandie du téléphone : Lyon et son « Siège, Écully » à
 * gauche (à droite, la frontière italienne les coupait), Marseille et Toulouse
 * au-dessus (la côte), Lille en dessous (la Belgique), Paris à gauche
 * (Strasbourg).
 */
const HUBS = [
  { nom: "Lyon", lat: 45.7742, lon: 4.7778, siege: true, cote: "g" },
  { nom: "Paris", lat: 48.8566, lon: 2.3522, cote: "g" },
  { nom: "Lille", lat: 50.6292, lon: 3.0573, cote: "b" },
  { nom: "Marseille", lat: 43.2965, lon: 5.3698, cote: "h" },
  { nom: "Strasbourg", lat: 48.5734, lon: 7.7521, cote: "g" },
  { nom: "Nantes", lat: 47.2184, lon: -1.5536, cote: "d" },
  { nom: "Toulouse", lat: 43.6047, lon: 1.4442, cote: "h" },
  { nom: "Bordeaux", lat: 44.8378, lon: -0.5792, cote: "d" },
  { nom: "Metz", lat: 49.1193, lon: 6.1757, cote: "g" },
  { nom: "Dijon", lat: 47.322, lon: 5.0415, cote: "g" },
];

const rad = (degres) => (degres * Math.PI) / 180;
const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/* d3 trace les bords d'un polygone en arcs de grand cercle : le bord nord de
   la boîte bombe vers le pôle, et fitExtent cadre sur ce bombement. */
const nordReel =
  (Math.atan(
    Math.tan(rad(BOITE.nord)) / Math.cos(rad((BOITE.est - BOITE.ouest) / 2)),
  ) *
    180) /
  Math.PI;

const x0 = rad(BOITE.ouest);
const x1 = rad(BOITE.est);
const yHaut = -mercatorY(nordReel);
const yBas = -mercatorY(BOITE.sud);
const largeurUtile = LARGEUR - 2 * MARGE_X;
const hauteurUtile = HAUTEUR - 2 * MARGE_Y;
const k = Math.min(largeurUtile / (x1 - x0), hauteurUtile / (yBas - yHaut));
const tx = MARGE_X + (largeurUtile - k * (x1 + x0)) / 2;
const ty = MARGE_Y + (hauteurUtile - k * (yBas + yHaut)) / 2;

const projette = ([lon, lat]) => [k * rad(lon) + tx, -k * mercatorY(lat) + ty];

// ───────────────────────────────────────────────────────────── TopoJSON

function arcsDecodes(topo) {
  const [sx, sy] = topo.transform.scale;
  const [dx, dy] = topo.transform.translate;
  return topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([ax, ay]) => {
      x += ax;
      y += ay;
      return [x * sx + dx, y * sy + dy];
    });
  });
}

function anneau(indices, arcs) {
  const points = [];
  for (const i of indices) {
    const arc = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
    points.push(...(points.length ? arc.slice(1) : arc));
  }
  return points;
}

function polygones(geometrie, arcs) {
  const liste =
    geometrie.type === "Polygon"
      ? [geometrie.arcs]
      : geometrie.type === "MultiPolygon"
        ? geometrie.arcs
        : [];
  return liste.map((anneaux) => anneaux.map((a) => anneau(a, arcs)));
}

// ─────────────────────────────────────────── découpe au cadre (Sutherland-Hodgman)

const BORDS = [
  (p) => p[0] >= -DEBORD,
  (p) => p[0] <= LARGEUR + DEBORD,
  (p) => p[1] >= -DEBORD,
  (p) => p[1] <= HAUTEUR + DEBORD,
];
const LIMITES = [
  [0, -DEBORD],
  [0, LARGEUR + DEBORD],
  [1, -DEBORD],
  [1, HAUTEUR + DEBORD],
];

function coupe(points) {
  let sortie = points;
  BORDS.forEach((dedans, b) => {
    const [axe, valeur] = LIMITES[b];
    const entree = sortie;
    sortie = [];
    entree.forEach((courant, i) => {
      const precedent = entree[(i + entree.length - 1) % entree.length];
      const croise = () => {
        const t = (valeur - precedent[axe]) / (courant[axe] - precedent[axe]);
        return [
          precedent[0] + t * (courant[0] - precedent[0]),
          precedent[1] + t * (courant[1] - precedent[1]),
        ];
      };
      if (dedans(courant)) {
        if (!dedans(precedent)) sortie.push(croise());
        sortie.push(courant);
      } else if (dedans(precedent)) {
        sortie.push(croise());
      }
    });
  });
  return sortie;
}

const arrondi = (n) => Math.round(n * 10) / 10;

function trace(geometrie, arcs) {
  let d = "";
  for (const poly of polygones(geometrie, arcs)) {
    for (const points of poly) {
      const coupe1 = coupe(points.map(projette));
      if (coupe1.length < 3) continue;
      d +=
        "M" +
        coupe1.map(([x, y]) => `${arrondi(x)} ${arrondi(y)}`).join("L") +
        "Z";
    }
  }
  return d;
}

// ──────────────────────────────────────────────────────────────── sortie

async function litAtlas() {
  const chemin = process.argv[2];
  if (chemin) return JSON.parse(readFileSync(chemin, "utf8"));
  const reponse = await fetch(SOURCE);
  if (!reponse.ok) throw new Error(`${SOURCE} : HTTP ${reponse.status}`);
  return reponse.json();
}

const topo = await litAtlas();
const arcs = arcsDecodes(topo);
const pays = topo.objects.countries.geometries;
const france = pays.find((p) => p.properties?.name === "France");
if (!france) throw new Error("la France est introuvable dans l'atlas");

const france_d = trace(france, arcs);
const voisins_d = pays
  .filter((p) => p !== france)
  .map((p) => trace(p, arcs))
  .join("");

const hubs = HUBS.map(({ nom, lat, lon, siege, cote }) => {
  const [x, y] = projette([lon, lat]);
  return { nom, x: arrondi(x), y: arrondi(y), siege: Boolean(siege), cote };
});

writeFileSync(
  SORTIE,
  `// GÉNÉRÉ par scripts/genere-carte-france.mjs, ne pas modifier à la main.
// Source : ${SOURCE}, projetée comme la maquette V3 (MigenAgences).

export const LARGEUR_CARTE = ${LARGEUR};
export const HAUTEUR_CARTE = ${HAUTEUR};

export const TRACE_VOISINS =
  ${JSON.stringify(voisins_d)};

export const TRACE_FRANCE =
  ${JSON.stringify(france_d)};

export interface HubCarte {
  readonly nom: string;
  readonly x: number;
  readonly y: number;
  readonly siege: boolean;
  /** Place de l'étiquette : « d » à droite, « g » à gauche, « h » au-dessus, « b » en dessous. */
  readonly cote: "d" | "g" | "h" | "b";
}

export const HUBS_CARTE: readonly HubCarte[] = ${JSON.stringify(hubs, null, 2)};
`,
);

console.log(
  `carte-france.ts écrit : France ${france_d.length} car., voisins ${voisins_d.length} car., ${hubs.length} hubs.`,
);
