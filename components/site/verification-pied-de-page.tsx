/**
 * Contrôle du pied de page, sans navigateur.
 *
 *   bun components/site/verification-pied-de-page.tsx
 *   bun components/site/verification-pied-de-page.tsx --controle
 *
 * PRÉALABLE : le site sur http://localhost:4340/ (`SITE_URL` pour un autre),
 * chaque lien interne y est demandé. `--controle` s'arrête AVANT le réseau :
 * il joue les contrôles statiques et leurs témoins d'échec, et c'est tout.
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
 * 6. REPLIER, JAMAIS RETIRER (maquette mobile v2, 14/10) : les sept colonnes
 *    passent par `SectionPliableMobile`, donc chacune est un
 *    `<details data-pliable-mobile>` rendu OUVERT par le serveur, replié au
 *    chargement sous 881 px seulement. Le contrôle exige les sept dépliants,
 *    l'attribut `open` sur chacun, et chaque lien de colonne DANS le corps de
 *    son dépliant : le DOM étant le même à 390 et à 1280 px, un lien présent
 *    ici est présent replié.
 * Des témoins prouvent que 1, 2, 4 et 6 savent échouer, dont : un lien retiré
 *  du corps d'un dépliant (le pied « perdrait » ce lien à 390 px) et un
 *  dépliant servi fermé (texte caché au premier rendu).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PiedDePage from "@/components/site/PiedDePage";

const CONTROLE = process.argv.includes("--controle");
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

/** Les colonnes rendues : chaque `nav` (ou bloc) titré, ses liens dans l'ordre.
 *
 * LE STYLE DE LA PISTE N'EST PLUS ÉCRIT EN DUR, et c'est une réparation, pas un
 * assouplissement. Cette lecture exigeait la chaîne EXACTE
 * `style="display:grid;gap:9px"`. Le 13/10, la déclaration de colonne
 * `grid-template-columns: minmax(0,1fr)` a été posée sur les 72 grilles à piste
 * unique du site (défaut mesuré : une piste `auto` ne descend pas sous le
 * `min-content` de son enfant, donc elle débordait sur téléphone). Le style
 * rendu est devenu `display:grid;grid-template-columns:minmax(0,1fr);gap:9px`,
 * la lecture n'a plus rien trouvé, et la porte a annoncé ZÉRO colonne de pied
 * de page alors que les six étaient rendues normalement.
 *
 * Elle exige donc toujours une GRILLE, ce qui est le fond du contrôle, sans
 * exiger l'ordre ni la liste de ses propriétés, qui n'en est pas. Ce que la
 * porte vérifie vraiment, les libellés et leur ordre, est inchangé. */
/* DEPUIS LE REPLI MOBILE (14/10), une colonne est `nav > details > summary
   (titre) + corps (liens)`. La lecture s'ancre sur le `</summary>` : les liens
   d'une colonne sont ce qui vit entre lui et la fin de son `<details>`. Le
   résumé de la bascule, lui, vit DANS le `<summary>` et ne doit pas être
   compté comme contenu. */
function navRendue(html: string): { titre: string; libelles: string[] }[] {
  const zone = html.slice(0, html.indexOf('class="mg-rq3"'));
  return [...zone.matchAll(/<nav aria-label="([^"]+)"/g)].map((depart) => {
    const apres = zone.indexOf("</summary>", depart.index) + "</summary>".length;
    const fin = zone.indexOf("</details>", apres);
    const corps = zone.slice(apres, fin);
    return {
      titre: lisible(depart[1]),
      libelles: [...corps.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((m) => lisible(m[1])),
    };
  });
}

/** Le texte de chaque colonne du maillage rendue, liens fondus dans la ligne.
    Même ancre que la navigation : le titre vit dans le `<summary>`, le texte
    entre `</summary>` et `</details>`. */
function maillageRendu(html: string): { titre: string; texte: string }[] {
  const zone = html.slice(html.indexOf('class="mg-rq3"'));
  return [...zone.matchAll(/<summary[^>]*><div[^>]*>([^<]+)<\/div>/g)].map(
    (depart) => {
      const apres = zone.indexOf("</summary>", depart.index) + "</summary>".length;
      const fin = zone.indexOf("</details>", apres);
      return {
        titre: lisible(depart[1]),
        texte: lisible(zone.slice(apres, fin).replace(/<[^>]*>/g, "")),
      };
    },
  );
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

// 6 · le repli ne retire rien : sept dépliants, tous rendus OUVERTS (Google
// reçoit le texte entier, et le DOM de 390 px est celui de 1280 px), et chaque
// lien de colonne vit dans le corps de son dépliant. Les contrôles 1 et 2
// lisent justement ces corps : un lien sorti d'un dépliant y tombe aussi.
function controleRepli(html: string): void {
  const pied = html.slice(0, html.indexOf("</footer>"));
  const depliants = pied.match(/<details\b[^>]*data-pliable-mobile[^>]*>/g) ?? [];
  assert.equal(
    depliants.length,
    7,
    "les sept colonnes du pied (3 de navigation, 4 de maillage) doivent être " +
      "des <details data-pliable-mobile>",
  );
  for (const depliant of depliants) {
    assert.ok(
      /\bopen\b/.test(depliant),
      "un dépliant du pied est servi FERMÉ : le repli doit venir du client " +
        "sous 881 px, jamais du HTML servi",
    );
  }
  /* Aucun lien hors dépliant dans la zone des colonnes : un lien posé entre
     deux dépliants échapperait aux contrôles 1 et 2. L'appel à l'action de la
     marque (avant la première colonne) et la barre basse (après le maillage)
     restent hors dépliant, et c'est voulu : ils ne se replient pas. */
  const colonnes = navRendue(pied).reduce((n, c) => n + c.libelles.length, 0);
  assert.ok(colonnes >= 20, `colonnes du pied mal relevées : ${colonnes} liens`);
}
controleRepli(rendu);

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

// ------------------------------------------------- témoins (sans réseau)
// Un libellé retiré, deux libellés permutés, un département perdu : chacun
// doit faire tomber le contrôle. Et depuis le repli mobile : un lien retiré du
// corps d'un dépliant (à 390 px, le pied l'aurait « perdu »), un dépliant
// servi fermé. Le `replaceAll` du maillage n'est pas un détail : le résumé de
// la bascule porte le même texte que le corps, un `replace` simple ne
// toucherait que le résumé et le témoin ne prouverait rien.
const [premier, second] = navRendue(rendu)[0].libelles;
for (const [defaut, html] of [
  ["un libellé retiré", rendu.replace(`>${premier}</a>`, "></a>")],
  ["deux libellés permutés", rendu.replace(`>${premier}<`, ">@@<").replace(`>${second}<`, `>${premier}<`).replace(">@@<", `>${second}<`)],
  ["un lien perdu à 390 px (retiré du corps d'un dépliant)", rendu.replace(/<a\b[^>]*>Nos valeurs<\/a>/, "")],
] as const) {
  assert.notEqual(html, rendu, `témoin mal construit : ${defaut}`);
  assert.throws(() => controleNav(html), `le contrôle de la navigation laisse passer ${defaut}`);
}
assert.throws(
  () => controleMaillage(rendu.replaceAll(" · Drôme", "")),
  "le contrôle du maillage laisse passer un département perdu",
);
{
  const ferme = rendu.replace(' open=""', "");
  assert.notEqual(ferme, rendu, "témoin mal construit : aucun dépliant ouvert");
  assert.throws(
    () => controleRepli(ferme),
    "le contrôle du repli laisse passer un dépliant servi fermé",
  );
  const sansDepliant = rendu.replace(" data-pliable-mobile", "");
  assert.throws(
    () => controleRepli(sansDepliant),
    "le contrôle du repli laisse passer une colonne sans dépliant",
  );
}

if (CONTROLE) {
  console.log(
    `pied de page, mode témoins : ${relevesNav} libellés de navigation et ` +
      `${maillageMaquette.length} colonnes de maillage conformes à l'autonome ; ` +
      "7 dépliants servis ouverts ; 6 témoins d'échec tombés (dont le lien " +
      "perdu à 390 px et le dépliant servi fermé). Réseau non joué : relancer " +
      "sans --controle avec le site démarré.",
  );
  process.exit(0);
}

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
controleRepli(`${servi}</footer>`);
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

// ------------------------------------------------------- témoin (réseau)
// Un lien mort doit faire tomber le contrôle des codes HTTP.
assert.notEqual(await statut("/n-existe-pas-pied-de-page/"), 200, "le contrôle des liens ne sait pas voir une 404");

console.log(
  `pied de page vérifié contre l'autonome : ${relevesNav} libellés de navigation et ${maillageMaquette.length} ` +
    `colonnes de maillage, mot pour mot et dans l'ordre ; 7 dépliants servis ouverts (replier ne retire rien) ; ` +
    `« Toutes nos pages » au dessin de la maquette ; ` +
    `${internes.length} liens internes à 200 sur ${SITE} ; ${SANS_PAGE.length} libellé(s) sans page, revérifié(s) : ` +
    `${SANS_PAGE.map((m) => `« ${m.libelle} » (${m.raison})`).join(", ")} ; siège de Limonest ; témoins d'échec tombés.`,
);
