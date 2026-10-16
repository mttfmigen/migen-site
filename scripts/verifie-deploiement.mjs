/**
 * Le site déployé sert-il une page de chaque gabarit, et reste-t-il fermé aux robots ?
 *
 *   node scripts/verifie-deploiement.mjs [url]
 *
 * L'URL par défaut est celle du dernier déploiement de production connu ;
 * passez-en une autre en argument, ou par DEPLOIEMENT_URL.
 *
 * PASSE PAR `vercel curl`, et non par `fetch` : la protection de déploiement de
 * Vercel est active, donc le site n'est pas public et un `fetch` reçoit une
 * redirection vers l'authentification. C'est voulu : tant que migen.fr ne
 * pointe pas ici, personne ne doit tomber dessus, et surtout pas un robot
 * d'indexation. Le contrôle vérifie donc DEUX choses contradictoires en
 * apparence : que les pages existent, et qu'elles sont inaccessibles sans
 * authentification.
 *
 * CE QUE CE CONTRÔLE NE DIT PAS : il ne juge ni la mise en page ni les
 * hauteurs. C'est le travail de `verifie-fidelite.mjs`, qui a besoin d'un
 * navigateur. Ici, on vérifie que chaque famille d'URL est servie par son
 * gabarit, avec un seul h1, et un titre différent du h1.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);

const URL_PAR_DEFAUT = "https://migen-site-aeaprqbtc-migenservice.vercel.app";
const BASE = process.argv[2] ?? process.env.DEPLOIEMENT_URL ?? URL_PAR_DEFAUT;

/**
 * Une page par gabarit, et le marqueur qui prouve que c'est bien lui qui rend.
 *
 * `interdit` est FACULTATIF : c'est le gabarit qui ne doit PAS rendre cette
 * page. Il ferme le trou que CLAUDE.md §16 nomme en toutes lettres, « 126 pages
 * ont continué d'être servies par le gabarit de vente sans que rien ne le
 * signale » : un marqueur présent prouve qu'un gabarit rend, il ne prouve pas
 * que le BON rend seul.
 *
 * LES MARQUEURS SONT DES PRÉFIXES DE MODULE CSS, `PageOffre-module__`,
 * `PageVille-module__`. Un module CSS n'est servi que si son composant est
 * monté, et seul le préfixe est stable : la part hachée change à chaque build.
 * C'est le marqueur le plus serré disponible sans ouvrir un navigateur.
 */
const PAGES = [
  { chemin: "/", gabarit: "accueil", marqueur: /data-reveal/ },
  { chemin: "/expertises/", gabarit: "expertises", marqueur: /data-bar|Expertises/ },
  { chemin: "/implantations/", gabarit: "implantations", marqueur: /Écully|implantation/i },
  { chemin: "/preuves/eiffage/", gabarit: "fiche", marqueur: /EIFFAGE/ },
  /* CES DEUX LIGNES DISAIENT « vente », ET ELLES AVAIENT DEUX FOIS TORT.
     Corrigées le 13/10 après mesure sur le déploiement.

     Elles cherchaient `id="formulaire"`, une ancre que PLUS AUCUNE page ne
     porte : le formulaire est annoncé par `id="besoin"` et `id="mgx-form"`, et
     `scripts/verifie-ancres.mjs` confirme par ailleurs que les 1 473 ancres du
     site atteignent toutes leur cible. La porte annonçait donc « le gabarit
     vente ne semble pas rendre » sur deux pages qui rendent parfaitement.

     Et elles nommaient le mauvais gabarit. `maquette/contenu/site/index.json`,
     qui est la seule autorité là-dessus, donne « 03 Offre et prestation » pour
     `/offres/residence/` et « 04 Ville » pour `/implantations/lyon/`. Le
     déploiement sert bien `PageOffre` et `PageVille` : le site avait raison, la
     porte avait tort, et elle était de surcroît INVERSÉE, car un retour de ces
     pages à l'ancien gabarit de vente l'aurait rendue verte. */
  {
    chemin: "/offres/residence/",
    gabarit: "03 Offre et prestation",
    marqueur: /PageOffre-module__/,
    interdit: { nom: "04 Ville", motif: /PageVille-module__/ },
  },
  { chemin: "/ressources/fiches-pratiques/", gabarit: "editorial", marqueur: /Sur cette page|<h2/ },
  {
    chemin: "/implantations/lyon/",
    gabarit: "04 Ville",
    marqueur: /PageVille-module__/,
  },
  // Les écrans uniques, portés en routes : ils ne passent pas par la base, donc
  // une erreur de route ne se verrait nulle part ailleurs.
  { chemin: "/contact/", gabarit: "route", marqueur: /name="entreprise"/ },
  { chemin: "/mentions-legales/", gabarit: "route", marqueur: /ublication|égales/ },
  { chemin: "/confidentialite/", gabarit: "route", marqueur: /CNIL|onfidentialité/ },
  { chemin: "/nous-connaitre/", gabarit: "route", marqueur: /Écully|migen/ },
  { chemin: "/plan-du-site/", gabarit: "route", marqueur: /href="\/offres\//, },
];

async function recupere(chemin) {
  const { stdout } = await execute("bunx", ["vercel", "curl", `${BASE}${chemin}`], {
    maxBuffer: 32 * 1024 * 1024,
    timeout: 120_000,
  });
  return stdout;
}

/**
 * LE VERDICT, SÉPARÉ DU RÉSEAU, pour qu'un témoin puisse le mettre en défaut.
 *
 * Avant le 13/10 ce jugement était inliné dans la boucle de téléchargement :
 * impossible de lui présenter un HTML fabriqué, donc impossible de prouver
 * qu'il sait refuser. Il rend maintenant la liste de ce qui cloche et le texte
 * du h1, et ne touche à rien d'autre.
 */
export function juge(page, html) {
  const ennuis = [];
  if (/Protected by Vercel Authentication/.test(html)) {
    return { ennuis: [`${page.chemin} : la commande n'est pas authentifiée (lancez « bunx vercel login »)`], texteH1: "" };
  }

  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  const titre = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const texteH1 = (h1[0]?.[1] ?? "").replace(/<[^>]+>/g, "").trim();

  if (h1.length !== 1) {
    ennuis.push(`${page.chemin} (${page.gabarit}) : ${h1.length} balise(s) h1, il en faut exactement une`);
  }
  if (!texteH1) {
    ennuis.push(`${page.chemin} (${page.gabarit}) : h1 vide`);
  }
  if (!page.marqueur.test(html)) {
    ennuis.push(`${page.chemin} : le gabarit ${page.gabarit} ne semble pas rendre (marqueur ${page.marqueur} absent)`);
  }
  if (page.interdit && page.interdit.motif.test(html)) {
    ennuis.push(
      `${page.chemin} : le gabarit ${page.interdit.nom} rend cette page alors qu'elle appartient ` +
        `à ${page.gabarit} (marqueur ${page.interdit.motif} présent)`,
    );
  }
  // Règle SEO du projet : le titre n'est jamais identique au h1.
  if (titre && texteH1 && titre.split(" | ")[0].trim() === texteH1) {
    ennuis.push(`${page.chemin} : le titre est identique au h1 (« ${texteH1} »)`);
  }
  return { ennuis, texteH1 };
}

/* --------------------------------------------------------------- le témoin */

if (process.argv.includes("--controle")) {
  const OFFRE = { chemin: "/t/", gabarit: "03 Offre et prestation", marqueur: /PageOffre-module__/, interdit: { nom: "04 Ville", motif: /PageVille-module__/ } };
  const page = (corps) => `<html><head><title>Un titre de page</title></head><body>${corps}</body></html>`;
  const BON = page('<h1>La maintenance a Lyon</h1><div class="PageOffre-module__abc123__corps">x</div>');

  const EPREUVES = [
    /* POSITIFS : chaque faute doit tomber, et sur SA phrase. */
    { nom: "le bon gabarit rend, rien n'est signalé", html: BON, veut: null },
    {
      nom: "le marqueur du gabarit est absent",
      html: page("<h1>La maintenance a Lyon</h1><div>x</div>"),
      veut: /ne semble pas rendre/,
    },
    {
      nom: "LE DÉFAUT DU 13/10 : un autre gabarit rend la page",
      html: page('<h1>La maintenance a Lyon</h1><div class="PageOffre-module__abc123__corps PageVille-module__def456__corps">x</div>'),
      veut: /rend cette page alors qu'elle appartient/,
    },
    { nom: "deux h1", html: page('<h1>Un</h1><h1>Deux</h1><div class="PageOffre-module__abc123__c">x</div>'), veut: /balise\(s\) h1/ },
    { nom: "aucun h1", html: page('<div class="PageOffre-module__abc123__c">x</div>'), veut: /balise\(s\) h1/ },
    {
      nom: "le titre est identique au h1",
      html: '<html><head><title>La maintenance a Lyon</title></head><body><h1>La maintenance a Lyon</h1><div class="PageOffre-module__abc123__c">x</div></body></html>',
      veut: /le titre est identique au h1/,
    },
    {
      nom: "la page est derrière l'authentification Vercel",
      html: page("Protected by Vercel Authentication"),
      veut: /n'est pas authentifiée/,
    },
    /* CONTRÔLES NÉGATIFS : des motifs légitimes qui ressemblent à des fautes et
       que la porte doit laisser passer. Sans eux, un marqueur trop large
       passerait pour un marqueur juste. */
    {
      nom: "NÉGATIF : le hachage du module CSS change à chaque build",
      html: page('<h1>La maintenance a Lyon</h1><div class="PageOffre-module__zZ9999__autre">x</div>'),
      veut: null,
    },
    {
      nom: "NÉGATIF : le titre commence par le h1 mais porte le suffixe de marque",
      html: '<html><head><title>La maintenance a Lyon et ailleurs | migen</title></head><body><h1>La maintenance a Lyon</h1><div class="PageOffre-module__abc123__c">x</div></body></html>',
      veut: null,
    },
    {
      nom: "NÉGATIF : un h1 qui porte des balises à l'intérieur",
      html: page('<h1>La <em>maintenance</em> a Lyon</h1><div class="PageOffre-module__abc123__c">x</div>'),
      veut: null,
    },
  ];

  let vues = 0;
  for (const e of EPREUVES) {
    const { ennuis } = juge(OFFRE, e.html);
    const juste = e.veut === null ? ennuis.length === 0 : ennuis.some((x) => e.veut.test(x));
    if (juste) vues += 1;
    console.log(`  ${juste ? "OK  " : "RATE"}  ${e.nom}`);
    if (!juste) console.log(`        relevé : ${ennuis.length ? ennuis.join(" | ") : "aucun"}`);
  }
  console.log(`\ntémoin : ${vues}/${EPREUVES.length} épreuves réussies`);
  if (vues !== EPREUVES.length) {
    console.error("LE TÉMOIN ÉCHOUE : cette porte ne prouve pas qu'elle sait refuser.");
    process.exit(1);
  }
  process.exit(0);
}

const problemes = [];

// 1. Les robots sont-ils bien tenus dehors ?
const robots = await recupere("/robots.txt");
if (!/User-Agent: \*/i.test(robots) || !/Disallow: \/\s*$/m.test(robots)) {
  problemes.push(
    `robots.txt n'interdit pas tout le site. Reçu :\n      ${robots.trim().replace(/\n/g, "\n      ")}\n` +
      `    Tant que migen.fr ne sert pas ce déploiement, il doit rester fermé : il porte les mêmes pages que le site en ligne.`,
  );
}

// 2. Chaque gabarit rend-il sa page ?
for (const page of PAGES) {
  let html;
  try {
    html = await recupere(page.chemin);
  } catch (erreur) {
    problemes.push(`${page.chemin} : injoignable (${erreur.message.split("\n")[0]})`);
    continue;
  }
  const { ennuis, texteH1 } = juge(page, html);
  problemes.push(...ennuis);
  console.log(`${page.chemin.padEnd(34)} ${page.gabarit.padEnd(14)} h1 : ${texteH1.slice(0, 48)}`);
}

if (problemes.length > 0) {
  for (const p of problemes) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`déploiement conforme : ${PAGES.length} gabarits servis, robots fermés`);
