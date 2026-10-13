#!/usr/bin/env node
/**
 * UNE PHOTO PARLE-T-ELLE DU SUJET DE SA PAGE ?
 *
 *   bun scripts/verifie-photos-du-secteur.mjs [adresse]
 *   bun scripts/verifie-photos-du-secteur.mjs --controle     preuve d'échec
 *
 * (bun, et non node : le contrôle importe `lib/secteur-du-cas.ts`.)
 *
 * POURQUOI ELLE EXISTE. Mehdi, le 11/10 : « les images ne sont pas adaptées au
 * secteur ou au cas ». Mesure du même jour : sur les 41 pages de cas client,
 * 38 photos sur 232, soit 16 %, tombaient hors du secteur de leur client.
 * ALSTEF Group, dont la fiche dit « automatisation logistique, aéroports »,
 * recevait une photo de bobines d'acier ; VPK, logistique, recevait de la
 * robotique ; VIGNAL SYSTEMS, automobile, recevait de la cimenterie.
 *
 * La cause tenait en une ligne : le secteur d'un cas était déduit des liens
 * `/secteurs/<x>/` présents dans sa fiche, et une fiche de cas n'en contient
 * pas toujours. Il se déduit désormais du TEXTE de la fiche.
 *
 * CE QU'ELLE CONTRÔLE, sur deux familles de pages :
 *   A. LES 41 CAS CLIENTS : chaque photo servie partage au moins un thème avec
 *      le secteur que la FICHE DU CAS nomme. Une fiche qui ne nomme aucun
 *      secteur est hors contrôle : mieux vaut ne rien exiger que d'exiger un
 *      secteur inventé.
 *   B. LES PAGES SECTEUR ET SPÉCIALITÉ dont l'adresse dit le sujet : même
 *      règle, les thèmes venant du segment d'URL.
 *
 * CE QU'ELLE NE CONTRÔLE PAS, et il faut le dire : qu'une photo soit JOLIE ou
 * BIEN CADRÉE. Elle vérifie une étiquette, pas un regard. Une photo étiquetée
 * « auto » peut rester un mauvais choix ; cela se voit à l'œil, pas ici.
 */
import { readFileSync, readdirSync } from "node:fs";

import { secteursDuTexte, texteSignifiant } from "../lib/secteur-du-cas.ts";

const CONTROLE = process.argv.includes("--controle");
const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:4340";
const DOSSIER = "supabase/import/gabarits-maquette";

const brut = JSON.parse(readFileSync("public/assets/photos/registre.json", "utf8"));
const photos = Array.isArray(brut) ? brut : (brut.photos ?? []);
const themesDe = new Map(photos.map((p) => [p.fichier, new Set(p.themes ?? [])]));
const vocabulaire = new Set(photos.flatMap((p) => p.themes ?? []));

/** Les thèmes attendus par une adresse dont le segment dit le sujet. */
const PAR_ADRESSE = [
  [/^\/secteurs\/aeronautique/, ["aeronautique"]],
  [/^\/secteurs\/agroalimentaire/, ["agro"]],
  [/^\/secteurs\/automobile/, ["auto"]],
  [/^\/secteurs\/chimie/, ["chimie"]],
  [/^\/secteurs\/industrie-lourde/, ["metallurgie", "cimenterie", "site-industriel"]],
  [/^\/secteurs\/industrie-metallique/, ["metallurgie", "chaudronnerie"]],
  [/^\/secteurs\/logistique/, ["logistique"]],
  [/^\/secteurs\/menuiserie/, ["menuiserie"]],
  [/^\/secteurs\/nucleaire/, ["nucleaire", "energie"]],
  [/^\/secteurs\/pharmaceutique/, ["pharma"]],
  [/^\/expertises\/mecanique/, ["mecanique"]],
  [/^\/expertises\/electrique/, ["electricite"]],
  [/^\/expertises\/electromecanique/, ["electricite", "mecanique"]],
  [/^\/expertises\/automatisme/, ["automatisme"]],
  [/^\/expertises\/robotique/, ["robotique"]],
  [/^\/expertises\/hydraulique/, ["hydraulique"]],
  [/^\/expertises\/pneumatique/, ["pneumatique"]],
  [/^\/expertises\/soudure/, ["soudure"]],
  [/^\/expertises\/tuyauterie/, ["tuyauterie"]],
];

/* Un thème cité ici mais absent du registre ferait compter toutes les photos
   comme hors sujet, et la porte hurlerait pour rien. */
const inconnus = [...new Set(PAR_ADRESSE.flatMap(([, t]) => t))].filter((t) => !vocabulaire.has(t));
if (inconnus.length) {
  console.error(`thème hors du vocabulaire du registre : ${inconnus.join(", ")}`);
  process.exit(2);
}

/** Les photos du registre citées par un document servi, les deux formes d'adresse. */
function photosServies(html) {
  return [
    ...new Set(
      [...html.matchAll(/(?:\/|%2F)assets(?:\/|%2F)photos(?:\/|%2F)([a-z0-9._-]+\.(?:jpe?g|png|webp|avif))/gi)].map(
        (m) => m[1],
      ),
    ),
  ].filter((f) => themesDe.has(f));
}

/**
 * Les thèmes qu'on peut montrer partout sans rien dire de faux. Ce sont ceux
 * de `THEMES_GENERIQUES` dans `scripts/repartit-photos.ts`, et c'est sur eux
 * que la répartition retombe quand le vivier d'un secteur est trop maigre.
 */
const GENERIQUES = new Set(["technicien", "site-industriel", "depannage", "equipe"]);

/**
 * Les thèmes qui NOMMENT UN SECTEUR d'activité, par opposition aux thèmes de
 * métier (mecanique, soudure…) et aux génériques.
 *
 * Ils servent à fermer un trou que le témoin a trouvé dans la première version
 * de cette porte : une photo de centrale nucléaire porte AUSSI « technicien »,
 * et passait donc pour un repli générique acceptable sur une page de
 * pneumatique. Un repli ne doit raconter AUCUN autre secteur.
 */
const SECTEURS = new Set([
  "aeronautique",
  "agro",
  "auto",
  "chaudronnerie",
  "chimie",
  "cimenterie",
  "energie",
  "logistique",
  "menuiserie",
  "metallurgie",
  "nucleaire",
  "pharma",
]);

/** Combien de photos du registre portent au moins un des thèmes attendus. */
function vivierDuSujet(attendus) {
  return photos.filter((p) => attendus.some((a) => (p.themes ?? []).includes(a))).length;
}

/**
 * Les photos à reprocher à une page.
 *
 * LA TOLÉRANCE DU VIVIER MAIGRE, et elle est nommée pour ne pas devenir un
 * trou. Six photos seulement portent le thème « pneumatique », et
 * /expertises/pneumatique/ a sept emplacements : le septième ne PEUT PAS être
 * dans le sujet. Une photo hors sujet est donc tolérée quand les deux
 * conditions tiennent ensemble :
 *   1. la page sert plus de photos que le vivier de son sujet n'en contient ;
 *   2. la photo de repli porte un thème générique, donc elle ne raconte pas un
 *      autre secteur. Une photo de centrale nucléaire sur une page de
 *      pneumatique tombe toujours.
 * Le nombre de replis tolérés est exactement le manque, jamais un de plus.
 */
/**
 * LE TROU QUE L'ÉTIQUETTE NE VOIT PAS, fermé le 14/10.
 *
 * `env-inspection-auto-avec-equipe.jpg` porte le thème « auto », et c'est
 * juste : on y voit une voiture. Elle passait donc le contrôle d'étiquette
 * ci-dessus sur `/preuves/stellantis-grand-est/`, une usine automobile. Sauf
 * que la photo montre un GARAGE DE QUARTIER, capot ouvert et pièces pendues au
 * mur. Bon secteur, mauvais décor, et aucune porte ne le disait : celle-ci
 * jugeait l'étiquette, et `verifie-photo-sujet.mjs` a retiré `/preuves/` de ses
 * adresses commerciales le même jour, à raison, pour rendre à JELD-WEN ses
 * photos de bois.
 *
 * La liste des photos concernées n'est PAS recopiée ici : elle est lue dans
 * `verifie-photo-sujet.mjs`, qui l'établit en ouvrant les images une par une.
 * Une seule liste, un seul propriétaire. Si elle devient illisible, cette porte
 * refuse de conclure plutôt que de passer au vert sans l'avoir appliquée.
 *
 * CE QUE LA RÈGLE ACCORDE, et c'est l'arbitrage de Mehdi du 13/10 : une page a
 * droit à la lecture de SON secteur. Le bois est chez lui sur un cas de
 * menuiserie, l'aviation sur /secteurs/aeronautique/, le laboratoire sur un cas
 * pharmaceutique. « autre » et « bureau » ne sont la lecture d'aucun secteur :
 * un garage, une baie de brassage et un portrait de bureau ne sont chez eux
 * nulle part.
 */
const LECTURE_LEGITIME = { aeronautique: "aviation", menuiserie: "bois", pharma: "laboratoire" };

const sourceSujet = (() => {
  try {
    return readFileSync("scripts/verifie-photo-sujet.mjs", "utf8");
  } catch {
    return "";
  }
})();
const blocSujet = sourceSujet.slice(sourceSujet.indexOf("const HORS_INDUSTRIE = ["), sourceSujet.indexOf("const INTERDITES"));
/** fichier -> ce que le visiteur y lit en une seconde. */
const LECTURE_DE = new Map(
  [...blocSujet.matchAll(/fichier:\s*"([^"]+)"[\s\S]*?litComme:\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
);
if (LECTURE_DE.size < 10 || [...LECTURE_DE.keys()].some((f) => !themesDe.has(f))) {
  console.error(
    "porte non concluante : la liste HORS_INDUSTRIE de scripts/verifie-photo-sujet.mjs " +
      `est illisible ou désaccordée du registre (${LECTURE_DE.size} entrée(s) lues)`,
  );
  process.exit(2);
}

/** Les photos dont le DÉCOR raconte autre chose que le secteur de la page. */
function horsDecor(servies, attendus) {
  if (!attendus.length) return [];
  const siennes = new Set(attendus.map((t) => LECTURE_LEGITIME[t]).filter(Boolean));
  return servies.filter((f) => LECTURE_DE.has(f) && !siennes.has(LECTURE_DE.get(f)));
}

function horsSujet(servies, attendus) {
  if (!attendus.length) return [];
  const etrangeres = servies.filter((f) => ![...attendus].some((a) => themesDe.get(f).has(a)));
  const manque = Math.max(0, servies.length - vivierDuSujet(attendus));
  if (manque === 0) return etrangeres;
  const replisAcceptables = etrangeres.filter((f) => {
    const t = [...themesDe.get(f)];
    const porteUnGenerique = t.some((x) => GENERIQUES.has(x));
    const racontUnAutreSecteur = t.some((x) => SECTEURS.has(x) && !attendus.includes(x));
    return porteUnGenerique && !racontUnAutreSecteur;
  });
  const tolerees = new Set(replisAcceptables.slice(0, manque));
  return etrangeres.filter((f) => !tolerees.has(f));
}

if (CONTROLE) {
  const parTheme = (t) => photos.find((p) => (p.themes ?? []).includes(t))?.fichier;
  const logistique = parTheme("logistique");
  const nucleaire = parTheme("nucleaire");
  const CAS = [
    ["photo du bon secteur", [logistique], ["logistique"], false],
    ["photo d'un autre secteur", [nucleaire], ["logistique"], true],
    ["une bonne et une mauvaise", [logistique, nucleaire], ["logistique"], true],
    ["aucun secteur attendu", [nucleaire], [], false],
  ];
  /* La tolérance du vivier maigre ne doit pas devenir un trou : un repli
     générique passe quand le vivier manque, un repli qui raconte un AUTRE
     secteur tombe quand même. */
  const pneu = photos.filter((p) => (p.themes ?? []).includes("pneumatique")).map((p) => p.fichier);
  const generique = photos.find(
    (p) =>
      (p.themes ?? []).some((t) => GENERIQUES.has(t)) &&
      !(p.themes ?? []).includes("pneumatique") &&
      !(p.themes ?? []).some((t) => SECTEURS.has(t)),
  )?.fichier;
  CAS.push(
    ["vivier maigre, repli générique", [...pneu, generique], ["pneumatique"], false],
    ["vivier maigre, repli d'un autre secteur", [...pneu, nucleaire], ["pneumatique"], true],
  );
  let bons = 0;
  for (const [nom, servies, attendus, doitTomber] of CAS) {
    const tombe = horsSujet(servies, attendus).length > 0;
    console.log(`  ${tombe === doitTomber ? "OK  " : "RATÉ"}  ${nom.padEnd(40)} ${tombe ? "refusé" : "accepté"}`);
    if (tombe === doitTomber) bons++;
  }

  /* Le DÉCOR. Chaque cas oppose deux pages à la MÊME photo : seule l'adresse
     change, donc c'est bien le droit de la page que la règle juge, et pas la
     photo. Sans le cas accepté, elle interdirait le bois à JELD-WEN. */
  const parLecture = (l) => [...LECTURE_DE].find(([, x]) => x === l)?.[0];
  const DECOR = [
    ["garage sur un cas automobile", parLecture("autre"), ["auto"], true],
    ["bois sur un cas de menuiserie", parLecture("bois"), ["menuiserie"], false],
    ["bois sur un cas de logistique", parLecture("bois"), ["logistique"], true],
    ["aviation sur /secteurs/aeronautique/", parLecture("aviation"), ["aeronautique"], false],
    ["aviation sur une page de mécanique", parLecture("aviation"), ["mecanique"], true],
    ["laboratoire sur un cas pharmaceutique", parLecture("laboratoire"), ["pharma"], false],
    ["laboratoire sur un cas de chimie", parLecture("laboratoire"), ["chimie"], true],
    ["une photo hors liste n'est jamais reprochée", photos.find((p) => !LECTURE_DE.has(p.fichier)).fichier, ["auto"], false],
  ];
  for (const [nom, photo, attendus, doitTomber] of DECOR) {
    const tombe = horsDecor([photo], attendus).length > 0;
    console.log(`  ${tombe === doitTomber ? "OK  " : "RATÉ"}  ${nom.padEnd(40)} ${tombe ? "refusé" : "accepté"}`);
    if (tombe === doitTomber) bons++;
  }
  CAS.push(...DECOR);
  // La déduction du secteur sait-elle lire une fiche ?
  const sondes = [
    ["AMAZON, « centre logistique ORY4 »", "Maintenir un centre logistique qui ne ferme jamais", "logistique"],
    ["ALSTEF, « automatisation logistique »", "spécialiste mondial des solutions d'automatisation logistique, aéroports", "logistique"],
    ["une fiche muette", "Une intervention menée avec sérieux", null],
  ];
  for (const [nom, texte, attendu] of sondes) {
    const d = secteursDuTexte(texte);
    const ok = attendu === null ? d.length === 0 : d.includes(attendu);
    console.log(`  ${ok ? "OK  " : "RATÉ"}  ${nom.padEnd(38)} -> [${d.join(", ") || "rien"}]`);
    if (ok) bons++;
  }
  const total = CAS.length + sondes.length;
  console.log(bons === total ? `\nCONTRÔLE OK : ${bons}/${total}` : `\nCONTRÔLE ÉCHOUÉ : ${bons}/${total}`);
  process.exit(bons === total ? 0 : 1);
}

const fiches = readdirSync(DOSSIER)
  .filter((f) => /^preuves-/.test(f))
  .map((f) => JSON.parse(readFileSync(`${DOSSIER}/${f}`, "utf8")))
  .filter((o) => o.url);

const idx = JSON.parse(readFileSync("maquette/contenu/site/index.json", "utf8"));
const urls = [...new Set((idx.pages ?? idx).map((p) => p.url ?? p.chemin ?? p))];

/** Chaque page contrôlée : son adresse, ce qu'elle attend, d'où ça vient. */
const aControler = [
  ...fiches.map((o) => ({
    url: o.url,
    attendus: secteursDuTexte(texteSignifiant(o)).slice(0, 3),
    source: `la fiche du cas ${o.contenu?.client ?? ""}`.trim(),
  })),
  ...urls
    .map((u) => {
      const r = PAR_ADRESSE.find(([re]) => re.test(u));
      return r ? { url: u, attendus: r[1], source: "son adresse" } : null;
    })
    .filter(Boolean),
];

const defauts = [];
const injoignables = [];
let sansSujet = 0;
let comptees = 0;

for (let i = 0; i < aControler.length; i += 12) {
  await Promise.all(
    aControler.slice(i, i + 12).map(async (p) => {
      if (!p.attendus.length) return sansSujet++;
      let html;
      try {
        const r = await fetch(new URL(p.url, BASE));
        if (!r.ok) return injoignables.push(`${p.url} (${r.status})`);
        html = await r.text();
      } catch (e) {
        return injoignables.push(`${p.url} (${e.code ?? e.message})`);
      }
      const servies = photosServies(html);
      comptees += servies.length;
      for (const f of horsSujet(servies, p.attendus)) {
        defauts.push(
          `${p.url}\n      ${f} [${[...themesDe.get(f)].join(", ")}]` +
            `\n      attendu ${p.attendus.join(" ou ")}, d'après ${p.source}`,
        );
      }
      for (const f of horsDecor(servies, p.attendus)) {
        defauts.push(
          `${p.url}\n      ${f} se lit comme : ${LECTURE_DE.get(f)}` +
            `\n      la page parle de ${p.attendus.join(" ou ")}, d'après ${p.source}`,
        );
      }
    }),
  );
}

if (injoignables.length) {
  console.error(`porte non concluante : ${injoignables.length} page(s) injoignable(s) sur ${BASE}`);
  injoignables.slice(0, 5).forEach((u) => console.error(`  ${u}`));
  process.exit(2);
}

if (defauts.length) {
  console.error(`${defauts.length} photo(s) hors du sujet de leur page :\n`);
  defauts.slice(0, 25).forEach((d) => console.error(`  ${d}`));
  if (defauts.length > 25) console.error(`  ... et ${defauts.length - 25} autre(s)`);
  process.exit(1);
}

console.log(
  `PHOTOS_DANS_LEUR_SUJET  ${comptees} photos sur ${aControler.length - sansSujet} pages à sujet nommé ` +
    `(${fiches.length} cas clients, ${aControler.length - fiches.length} pages secteur ou spécialité) ; ` +
    `${sansSujet} page(s) sans sujet nommé, hors contrôle`,
);
