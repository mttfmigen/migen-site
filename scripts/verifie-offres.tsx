/**
 * Contrôle du gabarit du hub `/offres/` CONTRE LA MAQUETTE.
 *
 *   bun scripts/verifie-offres.tsx [supabase/import/gabarits-maquette/offres.json]
 *
 * POURQUOI CE CONTRÔLE LIT LA MAQUETTE À CHAQUE EXÉCUTION. Avant, chaque valeur
 * attendue était une note de lecture prise à travers un outil, cinquante lignes
 * à la fois. Une note peut se tromper, et personne ne pouvait la rejouer. Ici,
 * chaque valeur est d'abord cherchée DANS `maquette/accueil-rendu.html`, bloc
 * `isOffres`, lignes 1886 à 2064 : une valeur que ce fichier ne porte pas fait
 * échouer le contrôle AVANT même qu'on regarde le rendu. Une déclaration écrite
 * de mémoire ne peut donc pas passer, et si la maquette change, le contrôle le
 * dit au lieu de valider l'ancien dessin.
 *
 * CE QU'IL VÉRIFIE :
 *
 *   1. les déclarations d'habillage de la maquette sont bien dans le rendu ;
 *   2. un seul H1, et c'est `pages.titre_h1` ;
 *   3. aucun `href="#"` : la maquette pilote ses liens par verbes de navigation
 *      qui ne se portent pas, et un lien mort vaut moins que pas de lien ;
 *   4. aucune classe de couleur Tailwind, aucune variante `dark:` ;
 *   5. les interdits de copie du contrat sont absents, maquette comprise ;
 *   6. une section sans donnée ne se rend PAS DU TOUT, et le gabarit tient sur
 *      un contenu réduit au seul discriminant ;
 *   7. tout le texte du corpus est présent : rien n'a été perdu en route.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageOffres from "@/components/site/offres/PageOffres";
import { estOffres } from "@/types/offres";
import type { ContenuOffres } from "@/types/offres";

const SOURCE = process.argv[2] ?? "supabase/import/gabarits-maquette/offres.json";
const MAQUETTE = "maquette/accueil-rendu.html";
/** Le bloc `isOffres`, bornes incluses, telles que la tâche les donne. */
const DEBUT = 1886;
const FIN = 2064;

/* ------------------------------------------------------- la maquette, relue */

const lignes = readFileSync(MAQUETTE, "utf8").split("\n");
const bloc = lignes.slice(DEBUT - 1, FIN).join("\n");

assert.ok(
  bloc.includes('<sc-if value="{{ isOffres }}"'),
  `${MAQUETTE} lignes ${DEBUT} à ${FIN} : le bloc isOffres n'est plus là. ` +
    `La maquette a bougé, les bornes de ce contrôle sont à reprendre.`,
);
assert.ok(
  bloc.includes('data-screen-label="Nos offres"'),
  "le bloc lu n'est pas celui du hub des offres",
);

/** Toutes les déclarations CSS du bloc, `propriété:valeur` sans espace. */
const declarations = new Set<string>();
for (const attribut of bloc.matchAll(/style="([^"]*)"/g)) {
  for (const d of attribut[1].split(";")) {
    const net = d.trim();
    if (net) declarations.add(net);
  }
}
assert.ok(
  declarations.size > 150,
  `seulement ${declarations.size} déclarations lues dans la maquette, lecture suspecte`,
);

/**
 * Une valeur de la maquette, relue dans le fichier.
 *
 * Elle est cherchée dans les déclarations du bloc : si elle n'y est pas, c'est
 * qu'elle a été écrite de mémoire, et le contrôle s'arrête là. C'est la clause
 * qui donne sa valeur à tout le reste du fichier.
 */
function deLaMaquette(declaration: string): string {
  assert.ok(
    declarations.has(declaration),
    `« ${declaration} » n'est pas dans ${MAQUETTE} lignes ${DEBUT} à ${FIN} : ` +
      `valeur écrite de mémoire, ou maquette modifiée.`,
  );
  return declaration;
}

/* ------------------------------------------------------------- le rendu */

const fichier = JSON.parse(readFileSync(SOURCE, "utf8")) as {
  url: unknown;
  contenu: unknown;
};
assert.equal(fichier.url, "/offres/", "url : /offres/ attendu");
assert.ok(estOffres(fichier.contenu), 'contenu.gabarit doit valoir « offres »');
const contenu = fichier.contenu;

const TITRE = "Entreprise maintenance industrielle";
const rendu = renderToStaticMarkup(
  <PageOffres titre={TITRE} contenu={contenu} formulaire="controle-offres" />,
);

/* ------------------------------------ 1. l'habillage vient de la maquette */

/* Chaque entrée est relue dans la maquette, PUIS cherchée dans le rendu. Les
   quatre sections du dessin sont représentées, et pour chacune les valeurs qui
   la définissent : sa grille, ses tailles, ses couleurs, son rythme. */
const HABILLAGE = [
  // Bandeau d'ouverture.
  "grid-template-columns:1.08fr .92fr",
  "font:600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
  "letter-spacing:-.045em",
  "font:400 17.5px/1.65 var(--fb)",
  "font:600 11.5px var(--fb)",
  "letter-spacing:.14em",
  "text-transform:uppercase",
  "min-height:320px",
  "background:var(--ph)",
  "background:linear-gradient(to top,rgba(18,17,16,.74),rgba(18,17,16,0) 56%)",
  "font:600 calc(22px * var(--ts)) var(--ft)",
  "color:rgba(255,255,255,.6)",
  "background:rgba(255,255,255,.16)",
  // Entrée par besoin.
  "grid-template-columns:1.1fr .9fr",
  "font:600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
  "grid-auto-rows:minmax(186px,auto)",
  "font:600 11px ui-monospace,Menlo,monospace",
  "font:600 calc(17.5px * var(--ts))/1.35 var(--ft)",
  "letter-spacing:-.025em",
  "font:400 13px/1.55 var(--fb)",
  // Les offres.
  "grid-template-columns:repeat(3,minmax(0,1fr))",
  "font:600 calc(21px * var(--ts)) var(--ft)",
  "letter-spacing:-.035em",
  "font:400 14.5px/1.6 var(--fb)",
  "background:var(--panel)",
  "color:rgba(255,255,255,.62)",
  "background:radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  "font:600 13.5px var(--fb)",
  "background:var(--chip)",
  // Bloc de fin.
  "border-radius:36px",
  "font-size:calc(clamp(24px,2.6vw,36px) * var(--ts))",
  "font:400 16px/1.6 var(--fb)",
  "font-size:15.5px",
].map(deLaMaquette);

for (const declaration of HABILLAGE) {
  assert.ok(
    rendu.includes(declaration),
    `le rendu ne porte pas « ${declaration} », pourtant dans la maquette`,
  );
}

/* Le padding du bandeau et des cartes : mêmes valeurs, forme abrégée. */
for (const d of [
  "padding:70px 40px 0",
  "padding:26px 28px 24px",
  "padding:28px 28px 30px",
  "padding:26px 28px",
].map(deLaMaquette)) {
  assert.ok(rendu.includes(d), `le rendu ne porte pas « ${d} »`);
}

/* Les classes d'adaptation mobile de la charte, écrites dans la maquette. */
for (const classe of ["mg-r2", "mg-bento", "mg-rmulti"]) {
  assert.ok(bloc.includes(classe), `${classe} n'est pas dans la maquette`);
  assert.ok(rendu.includes(`class="${classe}"`), `le rendu ne porte pas ${classe}`);
}

/* La révélation au défilement. Le compte attendu est CELUI DE LA MAQUETTE, relu
   ici, et le rendu peut en porter davantage : les sections du complément sont
   rendues par les blocs de `components/site/blocs/`, qui portent le leur. C'est
   un minimum, pas une égalité. */
const revelationsMaquette = (bloc.match(/data-reveal=""/g) ?? []).length;
assert.ok(revelationsMaquette > 0, "data-reveal absent de la maquette");
assert.ok(
  (rendu.match(/data-reveal=""/g) ?? []).length >= revelationsMaquette,
  `la maquette révèle ${revelationsMaquette} sections, le rendu doit en révéler au moins autant`,
);

/* L'ancre de la mosaïque, visée par le bouton d'ouverture de la maquette. */
assert.ok(bloc.includes('id="besoins"'), "l'ancre #besoins n'est pas dans la maquette");
assert.ok(rendu.includes('id="besoins"'), "le rendu a perdu l'ancre #besoins");

/* ------------------------------------------------- 2. un seul H1, le bon */

assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, "un seul H1 par page");
assert.ok(rendu.includes(`>${TITRE}</h1>`), "le H1 doit être pages.titre_h1");

/* --------------------------------------------- 3. aucune cible morte */

assert.ok(!rendu.includes('href="#"'), 'aucun href="#" : un lien mort ne se pose pas');
for (const lien of rendu.matchAll(/href="([^"]*)"/g)) {
  const cible = lien[1];
  assert.ok(cible.length > 1, `href vide ou réduit à « ${cible} »`);
  assert.ok(
    cible.startsWith("/") || cible.startsWith("#") || cible.startsWith("tel:"),
    `href « ${cible} » : seuls un chemin interne, une ancre ou un tel: sont admis`,
  );
  assert.ok(!cible.startsWith("//"), `href « ${cible} » : changement d'hôte`);
}

/* LE SLASH FINAL SE VÉRIFIE SUR LA DONNÉE, PAS SUR LE RENDU, et ce n'est pas un
   contournement. Hors build Next, `next.config.ts` n'est pas chargé : son
   `trailingSlash: true` ne s'applique pas, et `next/link` reprend sa
   normalisation par défaut, qui RETIRE le slash. Le rendu de ce contrôle
   affiche donc « /offres/residence » là où le site servira
   « /offres/residence/ ». Le fait vérifiable ici est la cible que le contenu
   déclare, et c'est elle qui doit être canonique. */
for (const [ou, cible] of [
  ...(contenu.offres?.cartes ?? []).map((c, i) => [`offres.cartes[${i}].href`, c.href] as const),
  ...(contenu.actions ?? []).map((a, i) => [`actions[${i}].href`, a.href] as const),
  [`fin.href`, contenu.fin?.href] as const,
]) {
  if (!cible) continue;
  assert.ok(cible !== "#", `${ou} : « # » n'est pas une cible`);
  if (cible.startsWith("/")) {
    assert.ok(cible.endsWith("/"), `${ou} = « ${cible} » : slash final attendu`);
    assert.ok(!cible.startsWith("//"), `${ou} = « ${cible} » : changement d'hôte`);
  } else {
    assert.ok(cible.startsWith("#"), `${ou} = « ${cible} » : chemin interne ou ancre`);
  }
}

/* -------------------------------- 4. aucune couleur Tailwind, aucun dark: */

for (const classe of rendu.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|shadow|accent|caret|placeholder|decoration|outline)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?\b/.test(
      classe[1],
    ),
    `classe de couleur Tailwind dans « ${classe[1]} » : la charte vit dans les jetons`,
  );
  assert.ok(!/\bdark:/.test(classe[1]), `variante dark: dans « ${classe[1]} »`);
}

/* ------------------------------------------- 5. les interdits de copie */

/** Le texte visible seul : les styles en ligne citent des couleurs, pas de la copie. */
const visible = rendu
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/ /g, " ")
  .replace(/\s+/g, " ");

const INTERDITS: [RegExp, string][] = [
  [/\+\s?200|\b200\s+clients/i, "« plus de 120 clients, dont plus de 80 réguliers »"],
  [/\b(?:5|cinq)\s+agences/i, "quatre agences : Lyon siège, Montréal, Dubaï, Madrid"],
  [/\br[ée]gie\b/i, "« résidence » ou « technicien sur site »"],
  [/\bint[ée]rim\b/i, "nommer la prestation, jamais le statut"],
  [/mise à disposition/i, "« intervention » ou « mission »"],
  [/sans engagement/i, "dire la durée réelle, ou ne rien dire"],
  [/cl[ée] en main/i, "dire ce qui est fait"],
  [/sur mesure/i, "dire ce qui s'adapte, et à quoi"],
  [/\blevier\b/i, "dire l'effet obtenu"],
  [/concr[èe]tement/i, "à supprimer"],
  [/\bnotamment\b/i, "à supprimer, ou « dont »"],
  [/incontournable/i, "à supprimer"],
  [/d[ée]couvrez/i, "un verbe qui dit ce que la page fait"],
  [/[—–]/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
  // Un délai chiffré d'intervention. Seul « dans l'heure » est autorisé, et il
  // s'écrit en mots : tout chiffre suivi d'une unité de temps est donc fautif.
  [/\bsous\s+\d+\s*(?:h|heures?|jours?|min)\b/i, "« rappel dans l'heure », et rien d'autre"],
  [/\ben\s+deux\s+heures\b/i, "« rappel dans l'heure », et rien d'autre"],
  [/\b\d+\s*h\s+de\s+route\b/i, "aucun délai ni distance chiffrés"],
  // Un prix.
  [/\d\s*(?:€|euros)/i, "aucun prix, aucune grille tarifaire"],
  [/prix mensuel fixe/i, "aucun prix, aucune grille tarifaire"],
];

for (const [motif, remede] of INTERDITS) {
  const trouve = visible.match(motif);
  assert.ok(
    !trouve,
    `interdit de copie rendu : « ${trouve?.[0]} ». À la place : ${remede}`,
  );
}

/* Le compte des offres doit être JUSTE, donc aucun compte en lettres ne doit
   traîner dans la copie du dessin : la maquette en écrit quatre, tous faux. */
for (const faux of [
  /\bSix façons\b/,
  /\bSept offres\b/,
  /\bLes cinq offres\b/,
  /\bAucune des six\b/,
]) {
  assert.ok(
    !visible.match(faux),
    `compte de la maquette recopié : « ${visible.match(faux)?.[0]} ». ` +
      `La maquette dessine 5 cartes, s'annonce 6 puis 7 puis 5, et la base ` +
      `porte 10 pages sous /offres/ : aucun de ces comptes ne se recopie.`,
  );
}

/* ------------------------ 6. une section sans donnée ne rend rien du tout */

const nu = renderToStaticMarkup(
  <PageOffres titre={TITRE} contenu={{ gabarit: "offres" } as ContenuOffres} />,
);
assert.ok(nu.includes(`>${TITRE}</h1>`), "le H1 se rend même sans aucune section");
assert.equal((nu.match(/<h1[\s>]/g) ?? []).length, 1, "un seul H1 sur le gabarit nu");
assert.ok(!nu.includes('id="besoins"'), "sans besoins, la mosaïque ne doit pas se rendre");
assert.ok(!nu.includes("mg-bento"), "sans besoins, la grille ne doit pas se rendre");
assert.ok(!nu.includes("mg-rmulti"), "sans offres, la grille ne doit pas se rendre");
assert.ok(
  !nu.includes("font-size:calc(clamp(24px,2.6vw,36px) * var(--ts))"),
  "sans fin, le bloc de fin ne doit pas se rendre",
);
assert.ok(!nu.includes("min-height:320px"), "sans repère ni visuel, le cadre ne se rend pas");
assert.ok(!nu.includes("grid-template-columns:1.08fr .92fr"), "sans cadre, le héros est en une colonne");
/* Ce qui RESTE sur un contenu nu : le H1, et le formulaire que chaque page du
   cocon porte (CLAUDE.md, section 4). C'est lui, et non une section du dessin,
   qui explique les `border-radius:36px`, `data-reveal` et `<h2` encore
   présents : les chercher ici ne prouverait donc rien. */
assert.ok(nu.includes('id="formulaire"'), "le formulaire se rend sur toutes les pages");
assert.ok(nu.length < rendu.length / 3, "un contenu nu doit rendre beaucoup moins de HTML");

/* Une section dont la liste est vide ne compte pas comme une section. */
const vide = renderToStaticMarkup(
  <PageOffres
    titre={TITRE}
    contenu={{
      gabarit: "offres",
      besoins: { entete: { surtitre: "Par besoin", titre: "x" }, cartes: [] },
      offres: { entete: { surtitre: "Les offres", titre: "y" }, cartes: [] },
    }}
  />,
);
assert.ok(!vide.includes("Par besoin"), "une mosaïque sans carte ne rend pas son en-tête");
assert.ok(!vide.includes("Les offres"), "des offres sans carte ne rendent pas leur en-tête");

/* ------------------------------- 7. tout le texte du corpus est bien là */

/** Toutes les chaînes du contenu, pour vérifier qu'aucune n'a été perdue. */
function chaines(v: unknown, ou: string, out: [string, string][] = []) {
  if (typeof v === "string") out.push([ou, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => chaines(x, `${ou}[${i}]`, out));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) chaines(x, `${ou}.${k}`, out);
  return out;
}

/* Les champs qui ne sont pas du texte visible : un chemin, un discriminant. */
const HORS_TEXTE = /\.(?:gabarit|href|src|lienHref|type)$/;

/* LA COMPARAISON SE FAIT SANS AUCUNE ESPACE, des deux côtés. Retirer les
   balises laisse une espace là où il n'y en avait pas : un lien du corpus
   suivi d'un point, « [sous-traitance](/x/). », ressort en
   « sous-traitance de maintenance . ». Comparer caractère par caractère hors
   espaces reste exact sur le texte et insensible au découpage en balises. */
const compact = (s: string) => s.replace(/\s+/g, "");
const visibleCompact = compact(visible);

let verifiees = 0;
for (const [ou, texte] of chaines(contenu, "contenu")) {
  if (HORS_TEXTE.test(ou)) continue;
  // Le Markdown en ligne du corpus est rendu par `TexteRiche` : les crochets et
  // les parenthèses disparaissent, on compare donc sur le libellé seul.
  const attendu = texte
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/ /g, " ");
  assert.ok(
    visibleCompact.includes(compact(attendu)),
    `texte du corpus perdu au rendu : ${ou} = « ${attendu.slice(0, 70)} »`,
  );
  verifiees += 1;
}

/* Les crochets du Markdown ne doivent JAMAIS atteindre le visiteur. */
assert.ok(!/\]\(\//.test(visible), "du Markdown en ligne est rendu tel quel");

const nbOffres = contenu.offres?.cartes.length ?? 0;
const nbBesoins = contenu.besoins?.cartes.length ?? 0;
const nbComplement = contenu.complement?.length ?? 0;

console.log(
  `verifie-offres : ${HABILLAGE.length} déclarations de la maquette relues et rendues, ` +
    `${verifiees} chaînes du corpus retrouvées au rendu.`,
);
console.log(
  `  ${nbBesoins} besoins, ${nbOffres} offres, ${nbComplement} sections de complément, ` +
    `${(rendu.length / 1024).toFixed(1)} ko de HTML.`,
);
console.log("  un seul H1, aucun href=\"#\", aucune couleur Tailwind, aucun interdit de copie.");
