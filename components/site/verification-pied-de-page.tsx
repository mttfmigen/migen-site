/**
 * Contrôle du pied de page, sans navigateur.
 *
 *   bun components/site/verification-pied-de-page.tsx
 *   bun components/site/verification-pied-de-page.tsx --controle
 *
 * PRÉALABLE : le site sur http://localhost:4340/ (`SITE_URL` pour un autre),
 * chaque lien interne y est demandé. `--controle` s'arrête AVANT le réseau :
 * contrôles statiques et témoins d'échec seulement.
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
 * 5. L'adresse du siège est celle d'ÉCULLY (décision de Mehdi du 16/10),
 *    « Limonest » n'est jamais rendu, et aucun tiret cadratin non plus. Le
 *    pied de la landing porte la même adresse.
 * 6. REPLIER, JAMAIS RETIRER (maquette mobile v2, 14/10) : les sept colonnes
 *    sont des `<details data-pied-pliable>` servis OUVERTS (le repli vient du
 *    navigateur, sous 881 px seulement), chaque lien vit dans le corps de son
 *    dépliant, et chaque `<summary>` ne porte QUE le titre : ni chevron ni
 *    résumé écrit dans le DOM, sans quoi le texte du pied changerait au
 *    bureau. L'attribut est le même des deux côtés (`RepliPiedMobile`).
 * 7. La carte blanche du téléphone porte les onze liens de la maquette mobile
 *    v2, libellés, destinations et ordre (relus dans la maquette, pas recopiés).
 * Des témoins prouvent que 1, 2, 4, 5, 6 et 7 savent échouer.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import SansPiedDuSite from "@/app/@pied/lp/[[...slug]]/page";
import PiedDePage from "@/components/site/PiedDePage";
import { TELEPHONE_LP } from "@/components/site/entete-donnees";
import { numeroLpPermis } from "@/lib/lp/adresses";

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
 * porte vérifie vraiment, les libellés et leur ordre, est inchangé.
 *
 * DEPUIS LE REPLI MOBILE (14/10), une colonne est `nav > details > summary
 * (titre) + corps (liens)`. Le titre est lu dans le `<summary>`, donc là où
 * le visiteur le voit, et les liens dans le corps du dépliant : un lien sorti
 * du dépliant ne serait plus compté et la porte tomberait. */
function navRendue(html: string): { titre: string; libelles: string[] }[] {
  return [
    ...html.matchAll(
      /<nav aria-label="[^"]+"><details[^>]*><summary[^>]*>([^<]*)<\/summary><div[^>]*style="[^"]*display:grid[^"]*">([\s\S]*?)<\/div><\/details><\/nav>/g,
    ),
  ].map(([, titre, corps]) => ({
    titre: lisible(titre),
    libelles: [...corps.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((m) => lisible(m[1])),
  }));
}

/** Le texte de chaque colonne du maillage rendue, liens fondus dans la ligne,
    lu dans le corps de son dépliant. */
function maillageRendu(html: string): { titre: string; texte: string }[] {
  const zone = html.slice(html.indexOf('class="mg-rq3'));
  return [
    ...zone.matchAll(
      /<summary[^>]*>([^<]+)<\/summary><div[^>]*style="font:400 13px\/1\.9 var\(--fb\);color:rgba\(255,255,255,\.44\)">([\s\S]*?)<\/div><\/details>/g,
    ),
  ].map(([, titre, corps]) => ({ titre: lisible(titre), texte: lisible(corps.replace(/<[^>]*>/g, "")) }));
}

/** 6 · le repli ne retire rien et n'ajoute rien. */
function controleRepli(html: string): void {
  const pied = html.slice(0, html.indexOf("</footer>"));
  const depliants = pied.match(/<details\b[^>]*>/g) ?? [];
  assert.equal(depliants.length, 7, "les sept colonnes du pied (3 de navigation, 4 de maillage) doivent être des <details>");
  for (const depliant of depliants) {
    assert.ok(/\bdata-pied-pliable\b/.test(depliant), "un dépliant du pied a perdu data-pied-pliable : il ne se replierait plus");
    assert.ok(/\bopen\b/.test(depliant), "un dépliant du pied est servi FERMÉ : le repli doit venir du navigateur, sous 881 px, jamais du HTML");
  }
  const sommaires = [...pied.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/g)].map((m) => m[1]);
  assert.equal(sommaires.length, 7, "chaque dépliant du pied doit avoir son <summary>");
  for (const sommaire of sommaires) {
    assert.ok(
      !sommaire.includes("<"),
      `un <summary> du pied porte autre chose que son titre (« ${lisible(sommaire.replace(/<[^>]*>/g, " "))} ») : ` +
        "chevron ou résumé écrits dans le DOM changeraient le texte du pied au bureau",
    );
  }
}

/**
 * 7 · LA CARTE DU TÉLÉPHONE, contre la maquette mobile v2 relue à chaque
 * exécution (`const foot` de « Migen - Mobile v2.dc.html ») : mêmes onze
 * libellés, mêmes destinations, même ordre. C'est la première liste du pied.
 * Slash final ignoré : hors de Next, `Link` le retire.
 */
const mobileV2 = readFileSync("maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html", "utf8");
const footMaquette = /const foot = \[([\s\S]*?)\]\.filter/.exec(mobileV2)?.[1] ?? "";
const carteMaquette = [...footMaquette.matchAll(/\["([^"]+)", "([^"]+)"\]/g)].map(([, l, h]) => `${l} ${h.replace(/\/$/, "")}`);
assert.equal(carteMaquette.length, 11, "les onze liens de la carte mal relevés dans la maquette mobile v2");

function controleCarte(html: string): void {
  const liste = /<ul\b[^>]*>([\s\S]*?)<\/ul>/.exec(html.slice(html.indexOf("<footer")))?.[1] ?? "";
  const rendue = [...liste.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(
    ([, h, l]) => `${lisible(l)} ${h.replace(/\/$/, "")}`,
  );
  assert.deepEqual(rendue, carteMaquette, "carte du téléphone : libellés, liens ou ordre différents de la maquette mobile v2");
}

// L'attribut que le serveur pose est celui que le navigateur cherche.
assert.ok(
  readFileSync("components/site/RepliPiedMobile.tsx", "utf8").includes('"details[data-pied-pliable]"'),
  "RepliPiedMobile ne cherche plus details[data-pied-pliable] : le pied ne se replierait plus",
);

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
controleRepli(rendu);
controleCarte(rendu);
assert.throws(
  () => controleCarte(rendu.replace(/(<li><a\b[^>]*>Secteurs<\/a><\/li>)(<li><a\b[^>]*>Implantations<\/a><\/li>)/, "$2$1")),
  "le contrôle de la carte laisse passer deux liens permutés",
);
assert.throws(
  () => controleCarte(rendu.replace(/<li><a\b[^>]*>Contact<\/a><\/li>/, "")),
  "le contrôle de la carte laisse passer un lien retiré",
);

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

// 5 · le siège, et aucun tiret cadratin.
/* 16/10 : LE SIÈGE EST À ÉCULLY, décision de Mehdi (« Le siège est à Ecully
   mets le de partout »), qui renverse celle du 09/10. Cette assertion a changé
   de sens trois fois : elle exige Écully et refuse Limonest, sur le pied du
   site comme sur celui de la landing. La maquette écrit encore « Siège, 1 rue
   des Vergers, 69760 Limonest » : écart assumé, règle SIÈGE de
   lib/decisions-copie.ts. */
const SIEGE_PIED = "129 chemin du Moulin Carron, 69130 Écully";
function controleSiege(html: string, prefixe: string): void {
  const lu = lisible(html.replace(/<[^>]*>/g, " "));
  assert.ok(lu.includes(`${prefixe}${SIEGE_PIED}`), "adresse du siège d'Écully absente du pied de page");
  assert.ok(!/Limonest|rue des Vergers|—|mise à disposition/.test(lu), "Limonest, un tiret cadratin ou un interdit dans le pied de page");
}
controleSiege(rendu, "Siège ");
const landingRendu = renderToStaticMarkup(<PiedDePage landingPage />);
controleSiege(landingRendu, "migen© · ");
for (const [defaut, html] of [
  ["l'adresse de Limonest remise", rendu.replace(SIEGE_PIED, "1 rue des Vergers, 69760 Limonest")],
  ["« Limonest » ajouté à côté du siège d'Écully", rendu.replace(SIEGE_PIED, `${SIEGE_PIED}, bureaux à Limonest`)],
] as const) {
  assert.notEqual(html, rendu, `témoin mal construit : ${defaut}`);
  assert.throws(() => controleSiege(html, "Siège "), `le contrôle du siège laisse passer ${defaut}`);
}

// ------------------------------------------------- témoins (sans réseau)
// Un libellé retiré, deux libellés permutés, un département perdu ; et depuis
// le repli mobile : un lien sorti du corps de son dépliant, un dépliant servi
// fermé, un résumé écrit dans un <summary>. Chacun doit faire tomber la porte.
const [premier, second] = navRendue(rendu)[0].libelles;
for (const [defaut, html] of [
  ["un libellé retiré", rendu.replace(`>${premier}</a>`, "></a>")],
  ["deux libellés permutés", rendu.replace(`>${premier}<`, ">@@<").replace(`>${second}<`, `>${premier}<`).replace(">@@<", `>${second}<`)],
  ["un lien sorti de son dépliant", rendu.replace(/(<a\b[^>]*>Nos valeurs<\/a>)([\s\S]*?<\/details>)/, "$2$1")],
] as const) {
  assert.notEqual(html, rendu, `témoin mal construit : ${defaut}`);
  assert.throws(() => controleNav(html), `le contrôle de la navigation laisse passer ${defaut}`);
}
assert.throws(
  () => controleMaillage(rendu.replace(" · Drôme", "")),
  "le contrôle du maillage laisse passer un département perdu",
);
for (const [defaut, html] of [
  ["un dépliant servi fermé", rendu.replace(/<details open=""/, "<details")],
  ["un résumé écrit dans un <summary>", rendu.replace(">Offres</summary>", ">Offres<p>Résidence · Full service</p></summary>")],
  ["une colonne sans dépliant", rendu.replace(/<details[^>]*><summary[^>]*>Expertises<\/summary>([\s\S]*?)<\/details>/, "<div>Expertises</div>$1")],
] as const) {
  assert.notEqual(html, rendu, `témoin mal construit : ${defaut}`);
  assert.throws(() => controleRepli(html), `le contrôle du repli laisse passer ${defaut}`);
}

// ------------------------------------------- les landing pages, sans ce pied
/* Depuis le 16/10, les LP (/lp/) ont leur propre pied. Celui du site est rendu
   par l'emplacement `app/@pied` (route parallèle) : `default.tsx` partout,
   `lp/[[...slug]]/page.tsx`, VIDE, sous /lp/. Le pied du site ne porte donc
   jamais le numéro des LP, et une LP ne porte jamais le pied du site. */
const texteSite = lisible(rendu.replace(/<[^>]*>/g, " "));
assert.ok(!numeroLpPermis("/") && !texteSite.includes(TELEPHONE_LP.affichage), "numéro des LP dans le pied du site");
const miseEnPage = readFileSync("app/layout.tsx", "utf8");
assert.ok(/\{pied\}/.test(miseEnPage), "la mise en page ne rend plus l'emplacement du pied (app/@pied)");
assert.ok(!/<PiedDePage\b/.test(miseEnPage), "le pied du site est rendu en dur par la mise en page : il reviendrait sur les LP");
assert.ok(
  /<PiedDePage\b[^>]*reglagesConsentement=\{<LienReglages \/>\}/.test(readFileSync("app/@pied/default.tsx", "utf8")),
  "l'emplacement du pied ne rend plus le pied du site avec son réglage du consentement",
);
assert.equal(SansPiedDuSite(), null, "l'emplacement du pied rend quelque chose sous /lp/");

if (CONTROLE) {
  console.log(
    `pied de page, mode témoins : ${relevesNav} libellés de navigation et ${maillageMaquette.length} colonnes de ` +
      "maillage conformes à l'autonome ; 7 dépliants servis ouverts, titres seuls dans les <summary> ; " +
      "carte du téléphone conforme à la maquette mobile v2 ; siège d'Écully ; 11 témoins d'échec tombés. Réseau non joué : relancer sans --controle, le site démarré.",
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
controleRepli(servi);
controleCarte(servi);
controleSiege(servi, "Siège ");
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

// ------------------------------------------------------- témoin (réseau)
// Un lien mort doit faire tomber le contrôle des codes HTTP.
assert.notEqual(await statut("/n-existe-pas-pied-de-page/"), 200, "le contrôle des liens ne sait pas voir une 404");

console.log(
  `pied de page vérifié contre l'autonome : ${relevesNav} libellés de navigation et ${maillageMaquette.length} ` +
    `colonnes de maillage, mot pour mot et dans l'ordre ; carte du téléphone aux ${carteMaquette.length} liens de la maquette mobile v2 ; 7 dépliants servis ouverts, titres seuls dans les <summary> ; ` +
    `« Toutes nos pages » au dessin de la maquette ; ` +
    `${internes.length} liens internes à 200 sur ${SITE} ; ${SANS_PAGE.length} libellé(s) sans page, revérifié(s) : ` +
    `${SANS_PAGE.map((m) => `« ${m.libelle} » (${m.raison})`).join(", ")} ; siège d'Écully ; témoins d'échec tombés.`,
);
