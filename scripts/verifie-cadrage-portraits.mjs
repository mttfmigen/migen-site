/**
 * Une photo portrait dans un cadre couché est-elle cadrée sur le haut ?
 *
 *   node scripts/verifie-cadrage-portraits.mjs
 *
 * LE DÉFAUT, mesuré le 09/10/2026. Le registre déclare l'orientation de chaque
 * photo, et aucune ligne du site ne lisait ce champ : 137 des 148 emplacements
 * de photo portrait étaient dans un cadre couché, en `objectFit: cover` sans
 * `objectPosition`, donc recadrés sur leur bande MÉDIANE. 123 placements
 * perdaient la moitié de l'image ou plus, sur 92 pages, et sur une photo de
 * personne la bande médiane tombe sur le torse, pas sur le visage.
 *
 * Décision de Mehdi : « tu cadres ». La photo reste, son cadrage se règle à
 * 50 % 30 % par `lib/cadrage-photos.ts`, produit depuis le registre.
 *
 * CE CONTRÔLE TIENT LES DEUX BOUTS, et le second est le plus important :
 *  1. toute page qui sert un portrait dans un emplacement branché porte le
 *     cadrage dans son HTML ;
 *  2. AUCUNE page qui ne sert aucun portrait ne le porte. Sans ce second point,
 *     un cadrage posé à l'aveugle sur toutes les photos passerait le premier,
 *     en décalant les 358 photos paysage pour rien.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const FICHES = join(RACINE, "supabase", "import", "gabarits-maquette");
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
const CADRAGE = "object-position:50% 30%";

const registre = JSON.parse(readFileSync(join(RACINE, "public/assets/photos/registre.json"), "utf8"));
const entrees = Array.isArray(registre) ? registre : (registre.photos ?? Object.values(registre));
const portraits = new Set(entrees.filter((e) => e.orientation === "portrait").map((e) => e.fichier));
if (portraits.size === 0) {
  console.log("aucune photo portrait au registre : ce controle n'a rien a mesurer.");
  process.exit(1);
}

/* CE QUE CE CONTRÔLE MESURE, et pourquoi pas autre chose. Une première version
   réclamait le cadrage sur TOUTE page servant un portrait, et elle tombait sur
   huit pages conformes : `cadragePhoto` ne cadre QUE dans un cadre de ratio
   1,2 ou plus, et une page dont le seul portrait tient dans la vignette 140x120
   (ratio 1,17) ne doit donc rien porter. Savoir quel emplacement rend quel
   champ demanderait la géométrie de chaque gabarit.

   Il mesure donc ce que le HTML dit vraiment, et c'est suffisant pour tenir la
   propriété qui compte : CHAQUE cadrage posé l'est sur une photo PORTRAIT, et
   il y en a. Un cadrage posé à l'aveugle sur toutes les photos tomberait ici,
   comme un cadrage oublié partout. */
const CADRAGE_SUR_IMG = /<img\b[^>]*>/gi;

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
const urls = [...new Set(pagesIndex.map((p) => p?.url).filter(Boolean))];

/** Le nom de fichier d'une photo, dans une URL brute ou passée par l'optimiseur. */
const nomDe = (src) => {
  const decode = src.includes("%2F") ? decodeURIComponent(src) : src;
  const sansRequete = decode.split("&")[0];
  return sansRequete.split("/").pop() ?? sansRequete;
};

const lis = async (url) => {
  const r = await fetch(SITE + url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
};

let poses = 0;
let pagesAvecCadrage = 0;
const indus = [];
const injoignables = [];
const LOT = 10;

for (let i = 0; i < urls.length; i += LOT) {
  await Promise.all(
    urls.slice(i, i + LOT).map(async (url) => {
      let html;
      try {
        html = await lis(url);
      } catch (e) {
        injoignables.push(`${url} (${e.message})`);
        return;
      }
      let surCettePage = 0;
      for (const [balise] of [...html.matchAll(CADRAGE_SUR_IMG)].map((m) => [m[0]])) {
        if (!balise.includes(CADRAGE)) continue;
        surCettePage++;
        const src = balise.match(/src="([^"]+)"/)?.[1] ?? "";
        const nom = nomDe(src);
        if (!portraits.has(nom)) indus.push(`${url} : ${nom}`);
      }
      if (surCettePage > 0) pagesAvecCadrage++;
      poses += surCettePage;
    }),
  );
}

const verdicts = [
  ["le cadrage est posé quelque part", poses > 0, `${poses} occurrence(s) sur ${pagesAvecCadrage} page(s)`],
  ["chaque cadrage posé l'est sur une photo portrait", indus.length === 0, `${indus.length} cadrage(s) indu(s)`],
  ["toutes les pages de l'index répondent", injoignables.length === 0, `${injoignables.length} injoignable(s)`],
];
for (const [quoi, ok, detail] of verdicts) console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi} - ${detail}`);

if (!verdicts.every(([, ok]) => ok)) {
  for (const u of indus.slice(0, 10)) console.log(`     INDU : ${u}`);
  for (const u of injoignables.slice(0, 5)) console.log(`     ${u}`);
  process.exit(1);
}
console.log(`\ncadrage des portraits conforme (${poses} cadrages, tous sur un des ${portraits.size} portraits du registre, ${urls.length} pages lues)`);
