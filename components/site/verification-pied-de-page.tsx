/**
 * Contrôle du pied de page, sans navigateur.
 *
 *   bun components/site/verification-pied-de-page.tsx
 *
 * PRÉALABLE : le site sur http://localhost:4340/ (`SITE_URL` pour un autre),
 * chaque lien interne y est demandé.
 *
 * LA RÉFÉRENCE est le pied de page de `maquette/site-final-autonome.html`,
 * relu à chaque exécution, jamais recopié : le contrôle se met à jour tout seul
 * si la maquette est ré-exportée.
 *
 * CE QU'IL TIENT :
 * 1. Les trois colonnes de navigation : mêmes libellés, même ordre.
 * 2. Les quatre colonnes du maillage : même texte, séparateurs compris, même
 *    ordre (le 08/10, les départements en avaient perdu trois et changé
 *    d'ordre ; la quatrième colonne avait déjà disparu une fois, 111 px).
 * 3. « Toutes nos pages » porte le dessin propre que la maquette lui donne
 *    (orange, gras, blanc au survol), relu dans ses attributs.
 * 4. Chaque lien interne répond 200 sur le site : un lien de pied de page en
 *    404 est vu par tout le crawl. Une entrée du maillage sans page reste du
 *    texte, et « Habilitations » n'a aucun lien.
 * 5. L'adresse du siège est celle de LIMONEST, celle de la maquette, et aucun tiret
 *    cadratin n'est rendu.
 * Des témoins prouvent que 1, 2 et 4 savent échouer.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PiedDePage from "@/components/site/PiedDePage";

const SITE = (process.env.SITE_URL ?? "http://localhost:4340").replace(/\/$/, "");

const entites: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};
const lisible = (brut: string) =>
  brut.replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (e) => entites[e]).replace(/\s+/g, " ").trim();

// ------------------------------------------------------- la maquette, lue
// L'autonome porte son gabarit dans une chaîne JavaScript : barres en /,
// guillemets échappés. Deux pieds de page y cohabitent, celui de la landing page
// et celui du site ; on prend le second par son remplissage, qui n'est qu'à lui.
const autonome = readFileSync("maquette/site-final-autonome.html", "utf8");
const debut = autonome.indexOf('<footer style=\\"background:var(--foot);color:#fff;padding:80px 0 34px\\">');
assert.ok(debut > 0, "pied de page du site introuvable dans l'autonome");
const bloc = autonome
  .slice(debut, autonome.indexOf("<\\u002Ffooter>", debut))
  .replace(/\\u002F/g, "/")
  .replace(/\\"/g, '"')
  .replace(/\\n/g, "\n");

const coupe = bloc.indexOf('class="mg-rq3"');
assert.ok(coupe > 0, "sous-grille mg-rq3 introuvable dans la maquette");

interface ColonneNav {
  titre: string;
  liens: { libelle: string; style: string; survol: string }[];
}

function colonnesNav(html: string): ColonneNav[] {
  return [...html.matchAll(/margin-bottom:16px">([^<]+)<\/div>([\s\S]*?)<\/div>\s*<\/div>/g)].map(
    ([, titre, corps]) => ({
      titre: lisible(titre),
      liens: [...corps.matchAll(/<a\b([^>]*)>([^<>]+)<\/a>/g)].map(([, attributs, texte]) => ({
        libelle: lisible(texte),
        style: /\sstyle="([^"]*)"/.exec(attributs)?.[1] ?? "",
        survol: /\sstyle-hover="([^"]*)"/.exec(attributs)?.[1] ?? "",
      })),
    }),
  );
}

const navMaquette = colonnesNav(bloc.slice(0, coupe));
const maillageMaquette = [
  ...bloc
    .slice(coupe)
    .matchAll(
      /margin-bottom:12px">([^<]+)<\/div>\s*<div style="font:400 13px\/1\.9 var\(--fb\);color:rgba\(255,255,255,\.44\)">([^<]+)</g,
    ),
].map(([, titre, texte]) => ({ titre: lisible(titre), texte: lisible(texte) }));

assert.equal(navMaquette.length, 3, "colonnes de navigation mal relevées dans la maquette");
assert.equal(maillageMaquette.length, 4, "colonnes de maillage mal relevées dans la maquette");

// ------------------------------------------------------------- le rendu
const rendu = renderToStaticMarkup(<PiedDePage />);

/** Les colonnes rendues : chaque `nav` (ou bloc) titré, ses liens dans l'ordre. */
function navRendue(html: string): { titre: string; libelles: string[] }[] {
  return [...html.matchAll(/<nav aria-label="([^"]+)"><div[^>]*>[^<]*<\/div><div style="display:grid;gap:9px">([\s\S]*?)<\/div><\/nav>/g)].map(
    ([, titre, corps]) => ({
      titre: lisible(titre),
      libelles: [...corps.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((m) => lisible(m[1])),
    }),
  );
}

/** Le texte de chaque colonne du maillage rendue, liens fondus dans la ligne. */
function maillageRendu(html: string): { titre: string; texte: string }[] {
  const zone = html.slice(html.indexOf('class="mg-rq3"'));
  return [
    ...zone.matchAll(/margin-bottom:12px">([^<]+)<\/div><div style="font:400 13px\/1\.9 var\(--fb\);color:rgba\(255,255,255,\.44\)">([\s\S]*?)<\/div><\/(?:nav|div)>/g),
  ].map(([, titre, corps]) => ({ titre: lisible(titre), texte: lisible(corps.replace(/<[^>]*>/g, "")) }));
}

/**
 * Les libellés de la maquette que le site ne pose pas, chacun avec la page qui
 * lui manque. Revérifiée à chaque exécution : le jour où elle répond 200, le
 * contrôle tombe et réclame le lien.
 */
const SANS_PAGE: readonly { libelle: string; cible: string; raison: string }[] = [];
const exceptions = new Set(SANS_PAGE.map((m) => m.libelle));

function controleNav(html: string): number {
  const attendu = navMaquette.map((c) => ({
    titre: c.titre,
    libelles: c.liens.map((l) => l.libelle).filter((l) => !exceptions.has(l)),
  }));
  assert.deepEqual(navRendue(html), attendu, "colonnes de navigation : libellés ou ordre différents de la maquette");
  return attendu.reduce((n, c) => n + c.libelles.length, 0);
}

function controleMaillage(html: string): void {
  assert.deepEqual(maillageRendu(html), maillageMaquette, "maillage : texte ou ordre différent de la maquette");
}

// 1 et 2 · la navigation et le maillage, mot pour mot, dans l'ordre.
const relevesNav = controleNav(rendu);
controleMaillage(rendu);

// 3 · « Toutes nos pages », le seul lien dessiné à part dans la maquette.
const plan = navMaquette.flatMap((c) => c.liens).find((l) => l.libelle === "Toutes nos pages");
assert.ok(plan, "la maquette ne porte plus « Toutes nos pages »");
const declarations = (texte: string) =>
  texte.split(";").map((d) => d.trim().replace(/\s*:\s*/, ": ")).filter(Boolean).sort();
const moduleCss = readFileSync("components/site/PiedDePage.module.css", "utf8");
const regle = (selecteur: string) =>
  declarations(new RegExp(`\\.${selecteur.replace(":", "\\:")}\\s*\\{([^}]*)\\}`).exec(moduleCss)?.[1] ?? "");
assert.deepEqual(regle("lienPlan"), declarations(plan.style), "« Toutes nos pages » : dessin différent du style de la maquette");
assert.deepEqual(regle("lienPlan:hover"), declarations(plan.survol), "« Toutes nos pages » : survol différent du style-hover de la maquette");
assert.match(
  readFileSync("components/site/PiedDePage.tsx", "utf8"),
  /libelle: "Toutes nos pages", href: "[^"]+", accent: true/,
  "« Toutes nos pages » ne porte plus la classe .lienPlan",
);

// 4 · chaque lien interne répond, Habilitations reste du texte.
const habilitations = rendu.slice(rendu.indexOf(">Habilitations<"), rendu.indexOf("Accès Z.A.C"));
assert.ok(habilitations.length > 0 && !habilitations.includes("<a "), "un lien a été posé dans la colonne Habilitations");

async function demande(chemin: string): Promise<Response> {
  try {
    return await fetch(`${SITE}${chemin}`, { redirect: "manual" });
  } catch (erreur) {
    throw new Error(`${SITE}${chemin} injoignable (${(erreur as Error).message}) : le site doit tourner pour ce contrôle`);
  }
}
const statut = async (chemin: string) => (await demande(chemin)).status;

/* Les liens tels que le site les SERT : hors de Next, `Link` retire le slash
   final que `trailingSlash: true` pose en production. Le pied de page servi
   repasse aussi les contrôles 1 et 2. */
const accueil = await (await demande("/")).text();
const servi = accueil.slice(accueil.indexOf("<footer"), accueil.indexOf("</footer>") + 9);
assert.ok(servi.length > 9, "pied de page absent de l'accueil servi");
controleNav(servi);
controleMaillage(servi);
const internes = [...new Set([...servi.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]))];
const morts: string[] = [];
for (const chemin of internes) {
  const code = await statut(chemin);
  if (code !== 200) morts.push(`${chemin} → ${code}`);
}
assert.deepEqual(morts, [], `liens du pied de page qui ne répondent pas 200 :\n  ${morts.join("\n  ")}`);
for (const manque of SANS_PAGE) {
  assert.ok(
    navMaquette.some((c) => c.liens.some((l) => l.libelle === manque.libelle)),
    `« ${manque.libelle} » n'est plus dans la maquette : retirer l'exception`,
  );
  assert.notEqual(
    await statut(manque.cible),
    200,
    `${manque.cible} répond maintenant : poser « ${manque.libelle} » dans le pied de page`,
  );
}

// 5 · le siège, et aucun tiret cadratin.
const texte = lisible(rendu.replace(/<[^>]*>/g, " "));
/* 09/10 : le siège est revenu à LIMONEST, décision de Mehdi qui renverse la
   sienne du 07/10. Cette assertion exigeait Écully et REFUSAIT Limonest ; elle
   exige maintenant l'inverse, et c'est le texte de la maquette, présent sur 96
   de ses 244 captures. Écully reste l'agence, mais le pied de page ne nomme
   que le siège, comme la maquette. */
assert.ok(
  texte.includes("Siège 1 rue des Vergers, 69760 Limonest"),
  "adresse du siège de Limonest absente du pied de page",
);
assert.ok(!/Moulin Carron|—/.test(texte), "l'adresse d'Écully ou un tiret cadratin dans le pied de page");
const landing = lisible(renderToStaticMarkup(<PiedDePage landingPage />).replace(/<[^>]*>/g, " "));
assert.ok(!/Moulin Carron|—|mise à disposition/.test(landing), "interdit dans le pied de page de la landing");

// ------------------------------------------------------------- témoins
// Un libellé retiré, deux libellés permutés, un département perdu, un lien
// mort : chacun doit faire tomber le contrôle.
const [premier, second] = navRendue(rendu)[0].libelles;
for (const [defaut, html] of [
  ["un libellé retiré", rendu.replace(`>${premier}</a>`, "></a>")],
  ["deux libellés permutés", rendu.replace(`>${premier}<`, ">@@<").replace(`>${second}<`, `>${premier}<`).replace(">@@<", `>${second}<`)],
] as const) {
  assert.throws(() => controleNav(html), `le contrôle de la navigation laisse passer ${defaut}`);
}
assert.throws(
  () => controleMaillage(rendu.replace(" · Drôme", "")),
  "le contrôle du maillage laisse passer un département perdu",
);
assert.notEqual(await statut("/n-existe-pas-pied-de-page/"), 200, "le contrôle des liens ne sait pas voir une 404");

console.log(
  `pied de page vérifié contre l'autonome : ${relevesNav} libellés de navigation et ${maillageMaquette.length} ` +
    `colonnes de maillage, mot pour mot et dans l'ordre ; « Toutes nos pages » au dessin de la maquette ; ` +
    `${internes.length} liens internes à 200 sur ${SITE} ; ${SANS_PAGE.length} libellé(s) sans page, revérifié(s) : ` +
    `${SANS_PAGE.map((m) => `« ${m.libelle} » (${m.raison})`).join(", ")} ; siège de Limonest ; témoins d'échec tombés.`,
);
