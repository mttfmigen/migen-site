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

const URL_PAR_DEFAUT = "https://migen-site-2vo0nipdl-migenservice.vercel.app";
const BASE = process.argv[2] ?? process.env.DEPLOIEMENT_URL ?? URL_PAR_DEFAUT;

/** Une page par gabarit, et le marqueur qui prouve que c'est bien lui qui rend. */
const PAGES = [
  { chemin: "/", gabarit: "accueil", marqueur: /data-reveal/ },
  { chemin: "/expertises/", gabarit: "expertises", marqueur: /data-bar|Expertises/ },
  { chemin: "/implantations/", gabarit: "implantations", marqueur: /Limonest|implantation/i },
  { chemin: "/preuves/eiffage/", gabarit: "fiche", marqueur: /EIFFAGE/ },
  { chemin: "/offres/residence/", gabarit: "vente", marqueur: /id="formulaire"/ },
  { chemin: "/ressources/fiches-pratiques/", gabarit: "editorial", marqueur: /Sur cette page|<h2/ },
  { chemin: "/implantations/lyon/", gabarit: "vente", marqueur: /id="formulaire"/ },
];

async function recupere(chemin) {
  const { stdout } = await execute("bunx", ["vercel", "curl", `${BASE}${chemin}`], {
    maxBuffer: 32 * 1024 * 1024,
    timeout: 120_000,
  });
  return stdout;
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

  if (/Protected by Vercel Authentication/.test(html)) {
    problemes.push(`${page.chemin} : la commande n'est pas authentifiée (lancez « bunx vercel login »)`);
    continue;
  }

  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  const titre = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const texteH1 = (h1[0]?.[1] ?? "").replace(/<[^>]+>/g, "").trim();

  if (h1.length !== 1) {
    problemes.push(`${page.chemin} (${page.gabarit}) : ${h1.length} balise(s) h1, il en faut exactement une`);
  }
  if (!texteH1) {
    problemes.push(`${page.chemin} (${page.gabarit}) : h1 vide`);
  }
  if (!page.marqueur.test(html)) {
    problemes.push(`${page.chemin} : le gabarit ${page.gabarit} ne semble pas rendre (marqueur ${page.marqueur} absent)`);
  }
  // Règle SEO du projet : le titre n'est jamais identique au h1.
  if (titre && texteH1 && titre.split(" | ")[0].trim() === texteH1) {
    problemes.push(`${page.chemin} : le titre est identique au h1 (« ${texteH1} »)`);
  }

  console.log(`${page.chemin.padEnd(34)} ${page.gabarit.padEnd(14)} h1 : ${texteH1.slice(0, 48)}`);
}

if (problemes.length > 0) {
  for (const p of problemes) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`déploiement conforme : ${PAGES.length} gabarits servis, robots fermés`);
