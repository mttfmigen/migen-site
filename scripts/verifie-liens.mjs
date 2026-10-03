/**
 * Chaque lien interne du site mène-t-il quelque part ?
 *
 *   node scripts/verifie-liens.mjs
 *   SITE_URL=http://localhost:4341/ node scripts/verifie-liens.mjs
 *
 * POURQUOI CETTE PORTE EXISTE, ET CE QU'ELLE A TROUVÉ. Deux contrôles
 * vérifiaient déjà les liens : celui de l'en-tête (114 liens) et celui du pied
 * de page. Tous deux comparent les cibles à `docs/urls-site-actuel.json`,
 * l'inventaire des 223 URL de l'ancien site. C'est utile, et c'est insuffisant :
 * une cible peut être dans l'inventaire et renvoyer 404 sur le NOUVEAU site,
 * parce que sa page n'a pas encore de contenu ou qu'elle est en brouillon.
 * Onze pages du pied de page étaient dans ce cas, sur les 225 pages du site,
 * dont les mentions légales, la confidentialité, et `/contact/`, qui est la
 * cible du bouton de la barre d'action mobile.
 *
 * Cette porte-ci ne consulte aucun inventaire : elle PARCOURT le site servi,
 * suit chaque lien interne qu'elle rencontre, et vérifie qu'il répond. C'est la
 * seule façon de savoir ce qu'un visiteur obtient.
 *
 * PRÉALABLE : le site doit tourner (`bun run dev`, ou `SITE_URL` vers le build).
 */
const SITE = (process.env.SITE_URL ?? "http://localhost:4340/").replace(/\/$/, "");

/** Pages de départ : une par famille, pour atteindre tous les gabarits. */
const DEPARTS = [
  "/",
  "/offres/residence/",
  "/expertises/",
  "/implantations/lyon/",
  "/ressources/fiches-pratiques/",
  "/preuves/eiffage/",
];

/** Au-delà, on tourne en rond : le cocon se referme sur lui-même. */
const PAGES_MAX = 120;

const aVisiter = [...DEPARTS];
const vues = new Set();
/** cible -> pages qui la citent */
const liens = new Map();

function noteLien(cible, depuis) {
  if (!liens.has(cible)) liens.set(cible, new Set());
  liens.get(cible).add(depuis);
}

while (aVisiter.length > 0 && vues.size < PAGES_MAX) {
  const chemin = aVisiter.shift();
  if (vues.has(chemin)) continue;
  vues.add(chemin);

  let html;
  try {
    const reponse = await fetch(SITE + chemin, { redirect: "manual" });
    if (reponse.status !== 200) continue;
    html = await reponse.text();
  } catch {
    continue;
  }

  for (const trouve of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const cible = trouve[1];
    // Les fichiers servis tels quels ne sont pas des pages.
    if (/\.(xml|txt|json|png|jpe?g|svg|webp|ico|pdf|css|js)$/i.test(cible)) continue;
    noteLien(cible, chemin);
    if (!vues.has(cible) && !aVisiter.includes(cible)) aVisiter.push(cible);
  }
}

const morts = [];
const sansSlash = [];

for (const [cible, depuis] of liens) {
  let statut;
  try {
    statut = (await fetch(SITE + cible, { redirect: "manual" })).status;
  } catch (erreur) {
    morts.push({ cible, statut: `injoignable (${erreur.message.split("\n")[0]})`, depuis });
    continue;
  }
  // 3xx n'est pas une erreur en soi : une redirection volontaire est servie
  // ainsi. Mais un lien POSÉ dans la page doit viser la destination finale,
  // sinon chaque visiteur paie un aller-retour.
  if (statut >= 300 && statut < 400) {
    sansSlash.push({ cible, statut, depuis });
  } else if (statut !== 200) {
    morts.push({ cible, statut, depuis });
  }
}

console.log(
  `${vues.size} pages parcourues, ${liens.size} cibles internes distinctes, ` +
    `${morts.length} morte(s), ${sansSlash.length} redirigée(s).`,
);

for (const { cible, statut, depuis } of morts) {
  const citations = [...depuis];
  console.error(
    `  ${cible} répond ${statut}\n` +
      `      cité par ${citations.length} page(s) parcourue(s) : ${citations.slice(0, 3).join(", ")}` +
      (citations.length > 3 ? ` …` : ""),
  );
}
for (const { cible, statut, depuis } of sansSlash) {
  console.error(`  ${cible} répond ${statut} (redirection) depuis ${[...depuis][0]}`);
}

if (morts.length > 0 || sansSlash.length > 0) process.exit(1);
console.log("tous les liens internes mènent quelque part");
