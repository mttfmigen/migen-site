#!/usr/bin/env node
/**
 * COMBIEN DE FOIS LA MÊME PHOTO, ET EST-CE RÉPARABLE ?
 *
 *   node scripts/verifie-photos-repetition.mjs
 *   node scripts/verifie-photos-repetition.mjs --releve     le détail chiffré
 *   node scripts/verifie-photos-repetition.mjs --controle   preuve d'échec
 *
 * POURQUOI ELLE EXISTE. Mehdi, le 12/10 devant /expertises/ : « les photos sont
 * toujours les mêmes que sur les autres pages ». Mesuré le 14/10 contre la
 * production : les 31 pages /expertises/ servent 126 photos distinctes, et 125
 * d'entre elles paraissent AUSSI ailleurs sur le site, soit 99 % ; sur
 * /offres/, 67 sur 67, soit 100 %. Une photo servait onze pages.
 *
 * CE QUE LA MESURE A MONTRÉ, ET QUI CHANGE LA RÉPONSE : le site ouvre 1 702
 * emplacements de photo pour 385 photos au registre. Chaque photo DOIT donc
 * servir 4,4 pages en moyenne. « Ne jamais répéter » est arithmétiquement
 * impossible, et une porte qui l'exigerait hurlerait sans rien apprendre.
 *
 * ELLE SÉPARE DONC DEUX DÉFAUTS QUI SE RESSEMBLENT À L'ŒIL :
 *
 *   1. LE DÉFAUT DE RÉPARTITION. Une photo s'emballe : elle sert plus de DEUX
 *      poses au-dessus du PLANCHER ARITHMÉTIQUE de son thème le plus contraint,
 *      pendant que des sœurs du même thème en servent moins. Un échange la
 *      ramène : c'est réparable sans rien acheter, et la porte le REFUSE.
 *
 *      Le plancher d'un thème vaut `poses / photos`, arrondi au-dessus. Ce
 *      n'est pas un seuil choisi : c'est le minimum que le stock permet. Il
 *      vaut 10 pour « logistique » (109 poses, 12 photos) et 2 pour
 *      « menuiserie » (37 poses, 22 photos). Un seuil unique à dix, le chiffre
 *      que Mehdi a cité, accuserait la logistique de ce que son stock impose et
 *      laisserait passer une photo de menuiserie servie neuf fois.
 *
 *      LA TOLÉRANCE D'UNE POSE EST DE L'ARITHMÉTIQUE, PAS UNE CONCESSION. Une
 *      photo porte trois thèmes et demi en moyenne, et les planchers sont
 *      calculés thème par thème : ils ne sont pas atteignables tous ensemble.
 *      Mesuré le 14/10 sur les fiches : 26 photos sont à EXACTEMENT une pose
 *      au-dessus de leur plancher, et aucun échange ne les retire toutes, parce
 *      que descendre l'une remonte celle qui la remplace. Refuser cette pose-là
 *      donnerait une porte rouge en permanence, donc une porte qu'on éteint.
 *      Deux poses au-dessus, en revanche, n'est plus de l'arrondi.
 *
 *   2. LE DÉFAUT DE STOCK. Toutes les photos d'un thème sont au plancher. Là,
 *      aucune redistribution ne peut rien : il faut d'autres photos. La porte
 *      ne le refuse pas, elle le CHIFFRE, parce que c'est un achat, pas un bug.
 *
 * ELLE REFUSE AUSSI UNE IMAGE DE LA MAQUETTE dans une fiche. Une image de
 * `/assets/web/` échappe à TOUTES les autres portes : pas de thème, donc
 * invisible à `verifie-photos-du-secteur.mjs` ; pas de description, donc pas de
 * texte alternatif, donc invisible à `verifie-alt-photos.mjs`. Le 14/10 elles
 * étaient quarante, dont la même photo de convoyeur sur sept pages de
 * logistique : la répétition la plus voyante du site était celle qu'aucune
 * porte ne voyait.
 *
 * `/assets/villes/` N'EST PAS VISÉE, et ce n'est pas un oubli : les douze
 * photos de hub local montrent LEUR ville, et aucune photo du registre ne peut
 * les remplacer. Refuser Bordeaux parce qu'elle n'a pas de thème industriel
 * serait demander de poser une photo générique à la place d'une photo juste.
 * Leur texte alternatif, lui, reste à écrire, et c'est un autre sujet.
 *
 * CE QU'ELLE NE MESURE PAS, et il faut le dire : les photos posées EN DUR dans
 * les composants (`/assets/web/` côté `components/`). Elle lit les fiches, qui
 * sont la source du contenu servi ; `scripts/mesure-photos-site.mjs` fait le
 * même choix et le dit. Une répétition introduite par un composant lui échappe.
 */
import { readFileSync, readdirSync } from "node:fs";

const CONTROLE = process.argv.includes("--controle");
const RELEVE = process.argv.includes("--releve");
const DOSSIER = "supabase/import/gabarits-maquette";
/** Une pose au-dessus du plancher est l'arrondi que les thèmes multiples
 *  imposent, voir l'en-tête. Au-delà, c'est un emballement. */
const TOLERANCE = 1;
const REGISTRE = "public/assets/photos/registre.json";

/** Les clés d'une fiche qui portent une PHOTO. Un logo n'en est pas une : il
 *  est servi autant de fois que son client est cité, et c'est normal. */
const CLES_PHOTO = new Set(["photo", "photoHero", "photoDispositif", "problemePhoto", "image"]);

/** Les images que la porte juge : celles du registre, et celles de la maquette
 *  qui n'y sont pas. Les photos de ville (`/assets/villes/`) et les logos
 *  (`/assets/clients/`) ne sont remplaçables par aucune photo du registre. */
const JUGEES = /^\/assets\/(photos|web)\//;

const brut = JSON.parse(readFileSync(REGISTRE, "utf8"));
const photos = Array.isArray(brut) ? brut : (brut.photos ?? []);
const themesDe = new Map(photos.map((p) => [p.fichier, p.themes ?? []]));

/** Chaque emplacement de photo d'une fiche, dans l'ordre du document. */
function* emplacements(noeud, chemin = "") {
  if (Array.isArray(noeud)) {
    for (let i = 0; i < noeud.length; i++) yield* emplacements(noeud[i], `${chemin}[${i}]`);
    return;
  }
  if (!noeud || typeof noeud !== "object") return;
  for (const [cle, valeur] of Object.entries(noeud)) {
    if (typeof valeur === "string" && CLES_PHOTO.has(cle) && JUGEES.test(valeur)) {
      yield { chemin: `${chemin}.${cle}`, valeur };
    } else yield* emplacements(valeur, `${chemin}.${cle}`);
  }
}

/**
 * Le plancher arithmétique d'un thème : le nombre de poses que le stock impose
 * à sa photo la plus servie, même répartie au mieux. `emplacements / photos`,
 * arrondi au-dessus, parce qu'on ne sert pas un tiers de page.
 */
function planchers(poses, univers = themesDe) {
  const stock = new Map();
  const demande = new Map();
  for (const [fichier, themes] of univers) {
    for (const t of themes) stock.set(t, (stock.get(t) ?? 0) + 1);
    for (const t of themes) demande.set(t, (demande.get(t) ?? 0) + (poses.get(fichier) ?? 0));
  }
  const p = new Map();
  for (const [t, s] of stock) p.set(t, { stock: s, demande: demande.get(t) ?? 0, plancher: Math.ceil((demande.get(t) ?? 0) / s) });
  return p;
}

/**
 * Les photos à reprocher, et la raison.
 *
 * Le thème qui contraint une photo est celui dont le plancher est le PLUS HAUT :
 * c'est lui qui dicte combien de poses elle doit accepter. Prendre le plus bas
 * accuserait `automobile-ligne-montage-binome.jpg` de servir six pages parce
 * qu'elle porte accessoirement « pneumatique », dont le plancher vaut quatre.
 */
function defauts(poses, univers = themesDe) {
  const p = planchers(poses, univers);
  const repartition = [];
  const stockCourt = new Set();
  for (const [fichier, themes] of univers) {
    if (!themes.length) continue;
    const contraignant = themes.reduce((a, b) => (p.get(a).plancher >= p.get(b).plancher ? a : b));
    const plancher = p.get(contraignant).plancher;
    const servies = poses.get(fichier) ?? 0;
    if (servies > plancher + TOLERANCE) repartition.push({ fichier, servies, theme: contraignant, plancher });
    else if (servies === plancher && plancher > 1) stockCourt.add(contraignant);
  }
  return { planchers: p, repartition: repartition.sort((a, b) => b.servies - b.plancher - (a.servies - a.plancher)), stockCourt };
}

/* ------------------------------------------------------------------ contrôle */

if (CONTROLE) {
  const CAS = [];
  const ajoute = (nom, obtenu, attendu) => CAS.push({ nom, ok: obtenu === attendu, obtenu, attendu });

  /* 1. L'image hors registre. Une fiche propre passe, la même fiche avec une
        image de la maquette tombe : sans ce second cas, la règle serait muette. */
  const propre = { contenu: { photoHero: "/assets/photos/" + photos[0].fichier } };
  const sale = { contenu: { photoHero: "/assets/web/sv-convoyeur.jpg" } };
  const horsRegistre = (o) => [...emplacements(o)].filter((e) => !themesDe.has(e.valeur.split("/").pop())).length;
  ajoute("fiche dont la photo est au registre", horsRegistre(propre) > 0, false);
  ajoute("fiche qui cite une image de la maquette", horsRegistre(sale) > 0, true);
  ajoute("le logo d'un client n'est pas une photo", [...emplacements({ logo: "/assets/clients/x.svg" })].length, 0);
  ajoute("la photo d'une ville n'est pas jugée", [...emplacements({ photo: "/assets/villes/ville-lyon.jpg" })].length, 0);

  /* 2. Le plancher, sur un monde fabriqué de deux photos d'un même thème : six
        poses pour deux photos imposent trois poses chacune. La répartition 3/3
        passe, la répartition 4/2 tombe. Les deux cas portent sur les MÊMES
        photos et le MÊME total : c'est bien la répartition que la porte juge,
        et non le stock. */
  const DUO = new Map([["a.jpg", ["t"]], ["b.jpg", ["t"]]]);
  const duo = (x, y) => defauts(new Map([["a.jpg", x], ["b.jpg", y]]), DUO).repartition.length;
  ajoute("répartition au plancher (3 et 3)", duo(3, 3) > 0, false);
  ajoute("une pose au-dessus, dans la tolérance (4 et 2)", duo(4, 2) > 0, false);
  ajoute("deux poses au-dessus du plancher (5 et 1)", duo(5, 1) > 0, true);
  ajoute("quatre poses au-dessus (7 et 1)", duo(7, 1) > 0, true);

  /* 3. Le plancher n'est pas un seuil constant déguisé. Deux thèmes qui portent
        LE MÊME nombre de poses mais pas le même nombre de photos doivent donner
        deux planchers différents : sans cela la porte accuserait la logistique
        de ce que son stock lui impose, et laisserait passer une photo de
        menuiserie servie neuf fois. */
  const MONDE = new Map([
    ["maigre1.jpg", ["maigre"]], ["maigre2.jpg", ["maigre"]],
    ["large1.jpg", ["large"]], ["large2.jpg", ["large"]], ["large3.jpg", ["large"]], ["large4.jpg", ["large"]],
  ]);
  const posesEgales = new Map([...MONDE.keys()].map((f) => [f, f.startsWith("maigre") ? 6 : 3]));
  const p = planchers(posesEgales, MONDE);
  ajoute("12 poses sur 2 photos -> plancher 6", p.get("maigre").plancher, 6);
  ajoute("12 poses sur 4 photos -> plancher 3", p.get("large").plancher, 3);

  /* 4. Et le plancher mesuré sur le VRAI registre varie bien d'un thème à
        l'autre : un contrôle qui ne tiendrait que sur un monde fabriqué ne
        prouverait rien du site. */
  const reels = new Set([...planchers(new Map([...themesDe.keys()].map((f) => [f, 4]))).values()].map((x) => x.plancher));
  ajoute("sur le registre réel, la charge égale donne bien un plancher unique", reels.size, 1);

  let bons = 0;
  for (const c of CAS) {
    console.log(`  ${c.ok ? "OK  " : "RATÉ"}  ${c.nom.padEnd(62)} ${JSON.stringify(c.obtenu)}`);
    if (c.ok) bons++;
  }
  console.log(bons === CAS.length ? `\nCONTRÔLE OK : ${bons}/${CAS.length}` : `\nCONTRÔLE ÉCHOUÉ : ${bons}/${CAS.length}`);
  process.exit(bons === CAS.length ? 0 : 1);
}

/* ------------------------------------------------------------------- mesure */

const poses = new Map();
const horsRegistre = [];
let totalEmplacements = 0;
const parFamille = new Map();

for (const nom of readdirSync(DOSSIER).filter((f) => f.endsWith(".json"))) {
  let fiche;
  try {
    fiche = JSON.parse(readFileSync(`${DOSSIER}/${nom}`, "utf8"));
  } catch {
    continue;
  }
  if (typeof fiche.url !== "string") continue;
  const famille = `/${fiche.url.split("/").filter(Boolean)[0] ?? ""}/`;
  const vues = new Set();
  for (const e of emplacements(fiche)) {
    totalEmplacements++;
    const fichier = e.valeur.split("/").pop();
    if (!themesDe.has(fichier)) {
      horsRegistre.push({ fiche: nom, url: fiche.url, chemin: e.chemin, valeur: e.valeur });
      continue;
    }
    vues.add(fichier);
  }
  for (const f of vues) poses.set(f, (poses.get(f) ?? 0) + 1);
  const d = parFamille.get(famille) ?? { pages: 0, emplacements: 0, distinctes: new Set() };
  d.pages++;
  d.emplacements += vues.size;
  for (const f of vues) d.distinctes.add(f);
  parFamille.set(famille, d);
}

const { planchers: pl, repartition, stockCourt } = defauts(poses);
const servies = [...poses.values()].reduce((a, b) => a + b, 0);
const distinctes = [...poses.keys()].filter((f) => (poses.get(f) ?? 0) > 0).length;

if (RELEVE) {
  console.log(`charge moyenne : ${(servies / photos.length).toFixed(2)} pages par photo ` +
    `(${servies} poses, ${photos.length} photos au registre, ${distinctes} servies)\n`);
  console.log("par famille :");
  for (const [f, d] of [...parFamille].sort((a, b) => b[1].emplacements - a[1].emplacements).slice(0, 8)) {
    console.log(`  ${f.padEnd(28)} ${String(d.pages).padStart(3)} pages, ${String(d.emplacements).padStart(4)} poses, ` +
      `${String(d.distinctes.size).padStart(3)} photos distinctes`);
  }
  console.log("\nplancher arithmétique par thème (poses / photos, arrondi au-dessus) :");
  for (const [t, d] of [...pl].sort((a, b) => b[1].plancher - a[1].plancher)) {
    console.log(`  ${t.padEnd(18)} ${String(d.plancher).padStart(2)}   ${String(d.demande).padStart(4)} poses / ${String(d.stock).padStart(3)} photos` +
      (stockCourt.has(t) ? "   STOCK COURT : une photo y est déjà au plancher" : ""));
  }
  console.log();
}

const manquements = horsRegistre.length + repartition.length;

if (horsRegistre.length) {
  console.error(`${horsRegistre.length} emplacement(s) de fiche citent une image HORS DU REGISTRE :\n`);
  for (const h of horsRegistre) console.error(`  ${h.url}\n      ${h.fiche} ${h.chemin}\n      ${h.valeur}  (ni thème, ni description, donc ni contrôle de secteur ni texte alternatif)`);
  console.error("");
}

if (repartition.length) {
  console.error(`${repartition.length} photo(s) emballée(s) : plus de ${TOLERANCE} pose au-dessus du plancher de leur thème, donc réparables par un échange :\n`);
  for (const r of repartition.slice(0, 20)) {
    const d = pl.get(r.theme);
    console.error(`  ${r.fichier}\n      ${r.servies} pages, plancher « ${r.theme} » = ${d.plancher} (${d.demande} poses / ${d.stock} photos)`);
  }
  if (repartition.length > 20) console.error(`  ... et ${repartition.length - 20} autre(s)`);
  console.error("");
}

if (manquements) {
  if (stockCourt.size) {
    console.error(`THÈMES DONT LE STOCK EST COURT, et qu'aucune redistribution ne soulagera : ` +
      `${[...stockCourt].sort((a, b) => pl.get(b).plancher - pl.get(a).plancher).slice(0, 6).map((t) => `${t} (plancher ${pl.get(t).plancher})`).join(", ")}`);
  }
  process.exit(1);
}

console.log(`PHOTOS_SANS_REPETITION_EVITABLE  ${servies} poses sur ${totalEmplacements} emplacements, ` +
  `${distinctes} photos distinctes sur ${photos.length} au registre ; ` +
  `aucune image hors registre, aucune photo au-dessus du plancher de son thème`);
