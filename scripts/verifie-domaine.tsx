/**
 * Contrôle du gabarit DOMAINE contre la maquette, contre les interdits de copie
 * du contrat, et contre la règle « une section sans donnée ne se rend pas ».
 *
 *   bun scripts/verifie-domaine.tsx
 *   bun scripts/verifie-domaine.tsx --injecte <faute>
 *
 * Les fautes injectables, pour prouver que le contrôle mord :
 *   valeur-maquette · deux-h1 · href-vide · tailwind · interdit · section-vide
 *
 * CE QUI REND CE CONTRÔLE DIGNE DE FOI : aucune valeur de la maquette n'est
 * écrite ici. Le fichier `maquette/accueil-rendu.html` est RELU à chaque
 * exécution, le bloc `sc-if value="{{ isDomaine }}"` en est découpé, et chaque
 * élément stylé qu'il contient est cherché dans le rendu, déclaration par
 * déclaration. Un style qui dérive d'un pixel fait échouer le contrôle, et une
 * correction de la maquette se répercute sans toucher à ce fichier.
 *
 * La comparaison se fait DÉCLARATION PAR DÉCLARATION, et non sur la chaîne
 * entière : le composant ajoute parfois une déclaration que la maquette n'a pas
 * (`box-shadow:none` sur la carte de verre, pour annuler l'ombre par défaut du
 * jeton `VERRE`). On exige donc que le rendu porte TOUT ce que la maquette dit,
 * sur un même élément, sans exiger qu'il ne dise rien de plus.
 *
 * LES CASES LAISSÉES VIDES SONT DÉCLARÉES, pas tolérées en silence : la liste
 * `VIDES` nomme les éléments de la maquette que le corpus n'alimente pas, avec
 * la raison. Un élément de la maquette qui n'est ni rendu ni déclaré vide fait
 * échouer le contrôle ; une case déclarée vide qui se mettrait à se rendre le
 * fait échouer aussi.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import PageMetier from "@/components/site/metier/PageMetier";
import { estMetierOuDomaine, type ContenuMetier } from "@/types/metier";

/** La branche « domaine » de l'union, la seule que ce contrôle produit. */
type Domaine = Extract<ContenuMetier, { gabarit: "domaine" }>;

const MAQUETTE = "maquette/accueil-rendu.html";
const DOSSIER = "supabase/import/gabarits-maquette";
const INVENTAIRE = "docs/urls-site-actuel.json";

const FAUTE = (() => {
  const i = process.argv.indexOf("--injecte");
  return i > -1 ? process.argv[i + 1] : null;
})();

/* ------------------------------------------------- la maquette, relue à neuf */

const html = readFileSync(MAQUETTE, "utf8");
const debut = html.indexOf('<sc-if value="{{ isDomaine }}"');
assert.ok(debut > -1, `bloc isDomaine introuvable dans ${MAQUETTE}`);
const fin = html.indexOf("</sc-if>", debut);
assert.ok(fin > debut, "fin du bloc isDomaine introuvable");
const bloc = html.slice(debut, fin);

/** Les textes en capitales de la maquette : les sur-titres des sections. */
const surtitres = [...bloc.matchAll(/text-transform:uppercase[^"]*"[^>]*>([^<]+)</g)].map((m) =>
  m[1].trim(),
);
assert.ok(
  surtitres.length >= 3,
  `la maquette doit porter au moins 3 sur-titres, elle en a ${surtitres.length}`,
);

const declarations = (style: string) =>
  style
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean);

/** Chaque élément stylé du bloc, avec ses déclarations. */
const elementsMaquette = [...bloc.matchAll(/<(\w+)[^>]*?\sstyle="([^"]*)"/g)].map((m) => ({
  balise: m[1],
  style: m[2],
  decls: declarations(m[2]),
}));
assert.ok(
  elementsMaquette.length >= 15,
  `trop peu d'éléments stylés relevés (${elementsMaquette.length})`,
);

/**
 * Les éléments de la maquette que le corpus n'alimente pas. Chacun est reconnu
 * par les déclarations qui ne se trouvent que chez lui, séparées par « || ».
 */
const VIDES: [string, string][] = [
  [
    "grid-template-columns:repeat(3,minmax(0,1fr))",
    "mosaïque à trois colonnes : sans visuel, la carte de verre prend la largeur",
  ],
  ["grid-column:span 2", "cadre du visuel : le corpus ne porte aucune image de domaine"],
  ["object-fit:cover", "l'image elle-même : aucune source dans le corpus"],
  [
    "background:var(--gsol)||border:1px solid var(--line)||color:var(--ink)",
    "second bouton du héros : le corpus ne donne qu'un seul libellé d'action",
  ],
  [
    "max-width:50ch",
    "phrase sous le titre de la carte de fin : ctaFinal ne porte pas de rappel, et celle de la maquette annonce un délai chiffré que le contrat interdit de recopier",
  ],
];
const marqueurVide = (e: { decls: string[] }) =>
  VIDES.find(([marqueur]) => marqueur.split("||").every((d) => e.decls.includes(d)));

/**
 * Les déclarations que le composant écrit autrement que la maquette, avec la
 * raison. Chacune est une ÉQUIVALENCE, pas une tolérance : le pixel rendu est
 * le même. La liste est courte et relue, et c'est ce qui la rend acceptable ;
 * un contrôle qui comparerait « à peu près » ne vaudrait rien.
 */
const EQUIVALENCES: Record<string, string> = {
  // La maquette pose les pastilles dans un `div`. Le composant en fait une
  // `ul` de liens, qui s'annonce comme une liste : il doit alors annuler la
  // marge par défaut du navigateur, ce qui se dit en une seule déclaration.
  "margin-bottom:44px": "margin:0 0 44px",
};

/* ---------------------------------------------- les fichiers de contenu */

const INTERDITS: [RegExp, string][] = [
  [
    /\b(r[ée]gie|int[ée]rim|mise à disposition|sans engagement)\b/i,
    "nommer la prestation, jamais le statut",
  ],
  [
    /\b(cl[ée] en main|sur mesure|levier|concr[èe]tement|notamment|incontournable|d[ée]couvrez)\b/i,
    "dire ce qui est fait",
  ],
  [/\b(5|cinq)\s+agences/i, "quatre agences : Lyon siège à Limonest, Montréal, Dubaï, Madrid"],
  [/\+\s?200|\b200\s+clients/i, "plus de 120 clients, dont plus de 80 réguliers"],
  [/[—–]/, "virgule, parenthèses ou deux-points, jamais de tiret cadratin"],
  [/\bsous\s+\d+\s*(h|heures?|jours?)\b/i, "seul « rappel dans l'heure » est autorisé"],
  [
    /\ben\s+(deux|trois|quatre|une|\d+)\s+heures?\b/i,
    "seul « rappel dans l'heure » est autorisé",
  ],
  [
    /\b\d+\s*(h|heures?|min|minutes?|jours?)\s+(de route|d'intervention|maximum)\b/i,
    "aucun délai ni distance chiffrés",
  ],
  // UN PRIX, pas le mot « prix ». Le corpus écrit « une fraction du prix du neuf »
  // et « à son tarif » en parlant du fournisseur du client : c'est du texte rédigé,
  // ce n'est pas une grille tarifaire Migen. Seuls un montant et une grille sont visés.
  [
    /€|\b\d[\d\s.,]*\s*(?:€|eur|euros?)\b|grille\s+tarifaire|tarifs?\s+(?:migen|public|à partir)/i,
    "aucun prix ni grille tarifaire",
  ],
];

const inventaire = new Set(
  (JSON.parse(readFileSync(INVENTAIRE, "utf8")) as { url: string }[]).map((u) => u.url),
);

const estChaine = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const CLES = ["gabarit", "chapeau", "boutons", "photo", "autres", "cta", "traitements", "reste"];

function chaines(v: unknown, ou: string, out: [string, string][] = []) {
  if (typeof v === "string") out.push([ou, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => chaines(x, `${ou}[${i}]`, out));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) chaines(x, `${ou}.${k}`, out);
  return out;
}

/* SEULEMENT LES PAGES DE DOMAINE. Sept autres agents écrivent leurs gabarits
   dans le même dossier, dont les fiches métier de `/carriere/`, qui passent par
   le MÊME composant. Un contrôle qui lirait tout le dossier échouerait sur le
   travail d'un autre, et ferait perdre du temps aux deux. */
const fichiers = readdirSync(DOSSIER)
  .filter((f) => f.startsWith("expertises-") && f.endsWith(".json"))
  .sort();
assert.ok(fichiers.length > 0, `aucun fichier dans ${DOSSIER}`);

const pages: { url: string; contenu: ContenuMetier }[] = [];
for (const nom of fichiers) {
  const brut = JSON.parse(readFileSync(`${DOSSIER}/${nom}`, "utf8")) as {
    url: unknown;
    contenu: unknown;
  };
  assert.ok(
    estChaine(brut.url) && /^\/expertises\/[a-z-]+\/([a-z-]+\/)?$/.test(brut.url),
    `${nom} : url /expertises/<domaine>/[<sous-page>/] attendue, reçu « ${String(brut.url)} »`,
  );
  assert.ok(estMetierOuDomaine(brut.contenu), `${nom} : contenu.gabarit doit valoir « domaine »`);
  const c = brut.contenu as unknown as Record<string, unknown>;
  assert.equal(c.gabarit, "domaine", `${nom} : gabarit « domaine » attendu`);
  for (const k of Object.keys(c))
    assert.ok(CLES.includes(k), `${nom} : clé « ${k} » inconnue de types/metier.ts`);
  assert.ok(estChaine(c.chapeau), `${nom} : chapeau attendu (heros.mecanisme du corpus)`);
  assert.ok(
    Array.isArray(c.traitements) && c.traitements.length > 0,
    `${nom} : « Ce que nous traitons » attendu (offre.lignes du corpus)`,
  );
  // Ni héros ni appel final dans `reste` : la maquette les rend déjà, et deux
  // héros donneraient deux h1.
  for (const [i, s] of ((c.reste as { type: string }[]) ?? []).entries())
    assert.ok(
      s.type !== "heros" && s.type !== "ctaFinal",
      `${nom} reste[${i}] : « ${s.type} » est déjà rendu par la maquette`,
    );

  // Le maillage : chaque autre domaine existe, porte son slash, et n'est pas soi.
  for (const [i, l] of ((c.autres as { libelle: string; href: string }[]) ?? []).entries()) {
    const ou = `${nom} autres[${i}]`;
    assert.ok(estChaine(l.libelle), `${ou}.libelle : chaîne non vide attendue`);
    assert.ok(
      /^\/expertises\/[a-z-]+\/$/.test(l.href),
      `${ou}.href : /expertises/<domaine>/ attendu`,
    );
    assert.ok(inventaire.has(l.href), `${ou}.href : « ${l.href} » absent de ${INVENTAIRE}`);
    assert.ok(
      !(brut.url as string).startsWith(l.href),
      `${ou}.href : une page ne se maille pas vers sa propre branche`,
    );
  }

  // Les interdits de copie, sur TOUT le texte de la page.
  for (const [ou, s] of chaines(brut.contenu, nom)) {
    if (ou.endsWith(".href") || ou.endsWith(".src") || ou.endsWith(".lienHref")) continue;
    for (const [motif, remede] of INTERDITS)
      assert.ok(!motif.test(s), `${ou} : ${motif} interdit (${remede}) dans « ${s.slice(0, 120)} »`);
  }

  pages.push({ url: brut.url as string, contenu: brut.contenu as ContenuMetier });
}

/* ------------------------------------------------------------------ le rendu */

const temoin = pages.find((p) => p.url === "/expertises/automatisme/") ?? pages[0];
let contenu = temoin.contenu;

if (FAUTE === "valeur-maquette") {
  // La faute la plus sournoise : le chapeau rendu dans une autre taille que
  // celle de la maquette. Le contrôle doit la voir sans qu'aucun pixel ne soit
  // écrit ici, puisque la taille attendue sort du fichier de maquette.
  contenu = { ...contenu, chapeau: undefined } as ContenuMetier;
}
if (FAUTE === "interdit") {
  contenu = {
    ...contenu,
    cta: { ...contenu.cta!, rappel: "Nous vous répondons en deux heures." },
  } as ContenuMetier;
}
if (FAUTE === "href-vide") {
  contenu = {
    ...contenu,
    cta: { ...contenu.cta!, bouton: { ...contenu.cta!.bouton, href: "#" } },
  } as ContenuMetier;
}

let rendu = renderToStaticMarkup(<PageMetier titre="Automatisme industriel" contenu={contenu} />);
if (FAUTE === "deux-h1") rendu = rendu.replace("</main>", "<h1>Doublon</h1></main>");
if (FAUTE === "tailwind")
  rendu = rendu.replace('class="mg-site"', 'class="mg-site text-zinc-500 dark:bg-black"');

// 1. Un seul h1 : le titre de la page. Les blocs du corpus n'en posent aucun.
assert.equal((rendu.match(/<h1[\s>]/g) ?? []).length, 1, "un seul h1 attendu dans la page");

// 2. Aucun lien mort.
assert.equal(
  (rendu.match(/href="#"/g) ?? []).length,
  0,
  'aucun href="#" : un lien doit mener quelque part',
);

// 3. Aucune couleur Tailwind, aucune variante de thème : la charte est en jetons.
for (const m of rendu.matchAll(/class="([^"]*)"/g)) {
  assert.ok(
    !/\b(?:text|bg|border|ring|divide|from|via|to|placeholder|decoration|outline|shadow|accent|caret)-(?:zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-?\d*\b/.test(
      m[1],
    ),
    `classe de couleur Tailwind dans « ${m[1]} » : la charte vit dans les jetons de app/globals.css`,
  );
  assert.ok(!/\bdark:/.test(m[1]), `variante dark: dans « ${m[1]} » : le site n'a pas de mode sombre`);
}

// 4. Les interdits de copie, sur le texte rendu.
const texte = rendu
  .replace(/<[^>]*>/g, " ")
  .replace(/&#x27;/g, "'")
  .replace(/&amp;/g, "&");
for (const [motif, remede] of INTERDITS)
  assert.ok(!motif.test(texte), `${motif} interdit dans le rendu (${remede})`);

// 5. Chaque élément de la maquette est rendu, ou déclaré vide. Ni l'un ni
//    l'autre fait échouer ; déclaré vide mais rendu quand même aussi.
//
//    LA FIDÉLITÉ SE MESURE SUR LES SEULES SECTIONS DE LA MAQUETTE, `reste`
//    retiré. Les blocs du corpus sont portés de la maquette eux aussi, mais
//    d'autres de ses pages : l'un d'eux porte une grille à trois colonnes de
//    16px d'écart, exactement comme la mosaïque du domaine, et il répondait
//    « présent » pour le visuel que le corpus ne fournit pas. Un contrôle qui
//    confond deux éléments parce qu'ils ont le même style ne contrôle rien.
const sansCorpus = { ...(contenu as Domaine), reste: undefined };
const renduMaquette = renderToStaticMarkup(
  <PageMetier titre="Automatisme industriel" contenu={sansCorpus} />,
);
const stylesRendus = [...renduMaquette.matchAll(/style="([^"]*)"/g)].map((m) =>
  declarations(m[1]),
);
const porte = (decls: string[]) =>
  stylesRendus.some((r) =>
    decls.every((d) => r.includes(d) || (EQUIVALENCES[d] && r.includes(EQUIVALENCES[d]))),
  );

let rendus = 0;
for (const e of elementsMaquette) {
  const vide = marqueurVide(e);
  const present = porte(e.decls);
  if (vide) {
    assert.ok(
      !present,
      `« ${vide[1]} » est déclaré vide mais le rendu le porte : retirer la ligne de VIDES, ou la donnée`,
    );
    continue;
  }
  assert.ok(
    present,
    `<${e.balise}> de la maquette non rendu, et non déclaré vide :\n    ${e.style.slice(0, 220)}`,
  );
  rendus += 1;
}

// 6. Les sur-titres de la maquette, mot pour mot.
for (const s of surtitres)
  assert.ok(texte.includes(s), `sur-titre « ${s} » de la maquette absent du rendu`);

// 7. Tout le texte du corpus est rendu : rien n'a été perdu en route.
for (const [ou, s] of chaines(temoin.contenu, "contenu")) {
  // `type` et `gabarit` sont des discriminants, pas de la copie : ils nomment le
  // bloc à monter, ils ne s'affichent nulle part.
  if (ou.endsWith(".type") || ou.endsWith(".gabarit")) continue;
  if (s.startsWith("/") || ou.endsWith(".href") || ou.endsWith(".lienHref")) continue;
  const premier = s.split(/[\s&[]/)[0];
  assert.ok(texte.includes(premier), `${ou} : « ${premier} » absent du rendu`);
}

// 8. Une section sans donnée ne se rend pas DU TOUT.
const creux: ContenuMetier = { gabarit: "domaine" };
let renduCreux = renderToStaticMarkup(<PageMetier titre="Titre seul" contenu={creux} />);
if (FAUTE === "section-vide") {
  // Ce que ferait un composant qui rendrait l'en-tête d'une section vide : le
  // sur-titre sort de la maquette, pas d'ici.
  renduCreux = renduCreux.replace(
    "</main>",
    `<section><div>${surtitres[1]}</div></section></main>`,
  );
}
const texteCreux = renduCreux.replace(/<[^>]*>/g, " ");
for (const s of surtitres.slice(1))
  assert.ok(
    !texteCreux.includes(s),
    `sans donnée, « ${s} » ne doit pas se rendre : une section vide vaut moins qu'une section absente`,
  );
assert.equal(
  (renduCreux.match(/<section/g) ?? []).length,
  2,
  "sans donnée : le fil d'Ariane et le héros, rien d'autre",
);
assert.ok(!renduCreux.includes("border-radius:36px"), "sans donnée : pas de carte de fin");
assert.ok(
  renduCreux.length < rendu.length / 5,
  `le rendu creux (${renduCreux.length} o) doit être une fraction du rendu plein (${rendu.length} o)`,
);

console.log(
  `domaine : ${pages.length} pages conformes, ${rendus} éléments de la maquette rendus, ` +
    `${VIDES.length} cases déclarées vides, ${surtitres.length} sur-titres relus dans la maquette, ` +
    `rendu plein ${rendu.length} o, rendu creux ${renduCreux.length} o`,
);
