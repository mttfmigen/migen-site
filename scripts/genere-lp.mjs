/**
 * LES DONNÉES DES LANDING PAGES : DE LA MAQUETTE V3 À `lib/lp/pages.json`.
 *
 *   bun scripts/genere-lp.mjs
 *
 * Rejouable : il lit `maquette/v3-lp/lp-data.json` (le `window.__LP` de la V3,
 * octets inchangés), écrit `lib/lp/pages.json` et `docs/LP-NETTOYAGE.md`, puis
 * passe la porte `scripts/verifie-lp-donnees.mjs` sur ce qu'il vient d'écrire.
 *
 * LE SCHÉMA NE CHANGE PAS : mêmes clés, mêmes structures que `__LP`, le
 * gabarit les lit telles quelles. Seules les VALEURS changent :
 *   · les adresses passent de `/fr/x` à `/lp/x/` (chemins et `mainHref`) ;
 *   · les images deviennent absolues (`/assets/...`), les aperçus Envato et les
 *     vignettes de hub absentes du site sont remplacés par les fichiers sous
 *     licence que le site sert déjà ;
 *   · la copie passe par les décisions du site (`lib/decisions-copie.ts`), par
 *     les corrections nommées plus bas, puis par le filtre : toute phrase (ou
 *     tout segment « · » d'un libellé) qui porte un interdit est RETIRÉE, pas
 *     réécrite. Une question de FAQ qui porte un interdit part avec sa réponse.
 *     Un texte vidé reste une chaîne vide : la clé demeure, le gabarit ne rend
 *     pas un bloc vide.
 * Chaque retrait et chaque remplacement est consigné, page par page, avec son
 * motif, dans `docs/LP-NETTOYAGE.md`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TELEPHONE_LP } from "../components/site/entete-donnees.ts";
import { appliqueDecisions } from "../lib/decisions-copie.ts";
import { FICHIER_LP, MOTIF_AGENCE, defauts, motifsDuTexte, villeDe } from "./verifie-lp-donnees.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SOURCE = join(RACINE, "maquette", "v3-lp", "lp-data.json");
const COMPTE_RENDU = join(RACINE, "docs", "LP-NETTOYAGE.md");

/** Les pages de `__LP` qui ne sont pas portées, et pourquoi. */
const PAGES_RETIREES = {
  "/": "page de choix de langue (« English · bientôt ») : les LP sont en français seulement.",
  "/fr/confidentialite":
    "politique de confidentialité propre à la V3 : les LP renvoient à /confidentialite/ et /mentions-legales/ du site.",
};

/* LES APERÇUS ENVATO, reconnus à leur identifiant. Ce sont exactement les
   photos du bloc « Votre hub local » des pages /implantations/ de la maquette
   (`maquette/contenu/site/photos-villes.json`) : leur version sous licence est
   au dépôt, et le site la sert déjà (`docs/PHOTOS-VILLES-ENVATO.md`). */
const PHOTOS_ENVATO = {
  E10QDY1: "ville-lyon.jpg",
  E10QF8J: "ville-paris.jpg",
  E108N92Z: "hub-marseille.jpg",
  E10DWX6: "ville-strasbourg.jpg",
  E10OW8U: "ville-nantes.jpg",
  E10N758: "ville-le-havre.jpg",
  E10OSPM: "hub-bordeaux.jpg",
};

/* LES CORRECTIONS NOMMÉES, et rien d'autre ne réécrit la copie. Chacune garde
   les mots de la V3 et ne fait que retirer ce qui est interdit ou rendre une
   donnée cohérente avec le site. `ville` borne une règle à une page ville,
   `kind` à un type de section. */
const CORRECTIONS = [
  /* Délais chiffrés : la proposition qui porte le délai part, le reste de la
     phrase est celui de la V3, mot pour mot. */
  { de: /,\s*chiffré sous 2\s?h ouvrées/g, vers: "", motif: "délai chiffré « 2 h ouvrées » retiré, le reste du titre est inchangé", nom: "délai chiffré retiré, le reste de la phrase gardé" },
  { de: /\s*·\s*Réponse 2\s?h\b/g, vers: "", motif: "délai chiffré « Réponse 2h » retiré", nom: "délai chiffré retiré, le reste de la phrase gardé" },
  { de: /\s+de 30 minutes/g, vers: "", motif: "durée chiffrée « 30 minutes » retirée", nom: "délai chiffré retiré, le reste de la phrase gardé" },
  // Les quinze cartes « Cas client » sont gardées, sans leurs délais ni durées.
  { kind: "case", de: /\s+en moins de 3 semaines/g, vers: "", motif: "délai chiffré retiré de la carte « Cas client »", nom: "durée retirée d\'une carte « Cas client »" },
  { kind: "case", de: /\s+sur (?:8|12|18) mois(?: consécutifs)?/g, vers: "", motif: "durée chiffrée retirée de la carte « Cas client »", nom: "durée retirée d\'une carte « Cas client »" },
  { kind: "case", de: /\s+deux années consécutives/g, vers: "", motif: "durée retirée de la carte « Cas client »", nom: "durée retirée d\'une carte « Cas client »" },
  { kind: "case", de: /\s+2 ans(?=\s+·)/g, vers: "", motif: "durée chiffrée retirée de la carte « Cas client »", nom: "durée retirée d\'une carte « Cas client »" },
  { kind: "case", de: /\s+·\s+(?:12|18) mois$/g, vers: "", motif: "durée chiffrée retirée de la carte « Cas client »", nom: "durée retirée d\'une carte « Cas client »" },
  /* 16/10, Mehdi : « Le siège est à Ecully mets le de partout ». L'agence
     lyonnaise de la V3, à Écully, est le siège. */
  { de: /\bAgence à Écully, 129 chemin du Moulin Carron\./g, vers: "Siège à Écully, 129 chemin du Moulin Carron.", motif: "le siège est à Écully (Mehdi, 16/10)", nom: "siège à Écully" },
  { de: /^Agence Lyon · Écully$/g, vers: "Siège Lyon · Écully", motif: "le siège est à Écully (Mehdi, 16/10)", nom: "siège à Écully" },
  // « +200 clients », sans qualificatif.
  { de: /(200 clients) satisfaits/g, vers: "$1", motif: "« +200 clients » sans le qualificatif « satisfaits »", nom: "« satisfaits » retiré de « +200 clients »" },
  /* Fautes de français de la V3 : la préposition devant un nom de ville ou de
     département qui porte l'article. Le sens ne change pas. Les agences et
     les hubs, eux, ne sont jamais réécrits : la règle les retire (filtre). */
  ...[
    [/(?<!\S)à Le Havre\b/g, "au Havre"],
    [/\ben Finistère\b/g, "dans le Finistère"],
    [/\ben Nord\b/g, "dans le Nord"],
    [/\ben Bas-Rhin\b/g, "dans le Bas-Rhin"],
    [/\ben Alpes-Maritimes\b/g, "dans les Alpes-Maritimes"],
    [/\ben Bouches-du-Rhône\b/g, "dans les Bouches-du-Rhône"],
  ].map(([de, vers]) => ({ de, vers, motif: `faute de français de la V3 : « ${vers} »`, nom: "faute de français de la V3 corrigée (préposition)" })),
];

/** Les paires {v, l} corrigées entières : le texte est coupé entre les deux. */
const PAIRES = [
  {
    si: (p) => p.v === "4,9/5",
    vers: { v: "4,6 / 5", l: "avis Google" },
    motif: "la note du site est 4,6 / 5 sur Google (TemoignagesClients.tsx, libellé de CHIFFRES dans entete-donnees.ts) ; 4,9/5 n'a pas de source",
    nom: "note 4,9/5 remplacée par celle du site, 4,6 / 5",
  },
  {
    si: (p) => p.v === "10 h" && p.l === "ubs en France",
    vers: { v: "10", l: "hubs en France" },
    motif: "flottant coupé en deux dans la V3 : « 10 h » se lisait comme un délai",
    nom: "flottant « 10 hubs en France » recollé",
  },
];

/** Le nom de la décision du site qu'`appliqueDecisions` vient d'appliquer. */
const DECISIONS = [
  [/\bnot[a]mment\b/, "« notamment » retiré, la phrase reste (décision du 09/10, lib/decisions-copie.ts)"],
  [/conçues sur mesure/i, "« conçues sur mesure » devient « conçues en interne » (arbitrage Tournaire du 08/10, lib/decisions-copie.ts)"],
];

const IMAGES = new Set(["img", "hubImg", "qimg", "logo", "src"]);
const TITRES = new Set(["h1", "h1a", "h1b", "h2"]);
const NOMBRES = { deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 };
const PHRASES = /[^.!?]+(?:[.!?]+|$)\s*/g;

const journal = [];

const versLp = (chemin) => `${chemin.replace(/^\/fr\//, "/lp/")}/`;

function image(src, ctx) {
  let chemin = src;
  const envato = /envato/.test(src) ? /\/(E[0-9A-Z]+)\.jpg/.exec(src)?.[1] : null;
  const vignette = /^assets\/villes\/([a-z-]+?)(?:-760)?\.jpg$/.exec(src)?.[1];
  if (envato) {
    if (!PHOTOS_ENVATO[envato]) throw new Error(`${ctx.page} : aperçu Envato ${envato} sans version sous licence connue`);
    chemin = `/assets/villes/${PHOTOS_ENVATO[envato]}`;
    consigne(ctx, `aperçu Envato ${envato} (CDN d'Envato, filigrané)`, chemin,
      "image externe : la même photo, sous licence, déjà servie par /implantations/",
      "photo Envato remplacée par sa version sous licence");
  } else if (vignette) {
    chemin = `/assets/villes/hub-${vignette}.jpg`;
    ctx.compte.vignettes += 1;
    ctx.compte.ou = ctx.ou.replace(/\[\d+\]$/, "");
  } else if (src.startsWith("assets/")) {
    chemin = `/${src}`;
  }
  if (!existsSync(join(RACINE, "public", chemin))) throw new Error(`${ctx.page} ${ctx.ou} : ${chemin} absent de public/`);
  return chemin;
}

/** Un changement, avec son motif (détaillé) et sa catégorie (pour le décompte du compte rendu). */
function consigne(ctx, avant, apres, motif, categorie) {
  journal.push({ page: ctx.page, ou: ctx.ou, avant, apres, motif, categorie });
}

/** Retire de `texte` chaque phrase, ou chaque segment « · », qui porte un interdit. */
function filtre(texte, ctx) {
  if (motifsDuTexte(texte, ctx).length === 0) return texte;
  const phrases = texte.match(PHRASES) ?? [texte];
  const gardees = phrases.map((phrase) => {
    const motifs = motifsDuTexte(phrase, ctx);
    if (motifs.length === 0) return phrase;
    const segments = phrase.trim().split(/\s+·\s+/);
    const restants = segments.filter((s) => motifsDuTexte(s, ctx).length === 0);
    /* Un libellé qui nomme une agence part entier : « Agence Paris · La
       Défense » est le nom de l'agence, pas deux informations (consigne du
       16/10, qui le cite en exemple). */
    const agence = motifs.some((m) => m.startsWith(MOTIF_AGENCE));
    if (segments.length > 1 && restants.length > 0 && !agence) {
      for (const s of segments.filter((x) => !restants.includes(x))) {
        const m = motifsDuTexte(s, ctx);
        consigne(ctx, s, "", `segment retiré : ${m.join(", ")}`, `retiré : ${m[0]}`);
      }
      return restants.join(" · ") + (/\s$/.test(phrase) ? " " : "");
    }
    consigne(ctx, phrase.trim(), "", `phrase retirée : ${motifs.join(", ")}`, `retiré : ${motifs[0]}`);
    return "";
  });
  const reste = gardees.join("").replace(/\s{2,}/g, " ").trim();
  return /^\p{Lu}/u.test(texte) && /^\p{Ll}/u.test(reste) ? reste[0].toUpperCase() + reste.slice(1) : reste;
}

/** Une chaîne de copie, des décisions du site au filtre. */
function texte(brut, ctx, cle) {
  let t = appliqueDecisions(brut);
  if (t !== brut) {
    const decision = DECISIONS.find(([motif]) => motif.test(brut))?.[1] ?? "décision du site (lib/decisions-copie.ts)";
    consigne(ctx, brut, t, decision, "décision du site appliquée (lib/decisions-copie.ts)");
  }
  for (const c of CORRECTIONS) {
    if ((c.ville && c.ville !== villeDe(ctx.page)) || (c.kind && c.kind !== ctx.kind)) continue;
    const corrige = t.replace(c.de, c.vers);
    if (corrige !== t) consigne(ctx, t, corrige, c.motif, c.nom);
    t = corrige;
  }
  if (TITRES.has(cle) && / :/.test(t)) {
    const insecable = t.replace(/ :/g, "\u00a0:");
    consigne(ctx, t, insecable.replace(/\u00a0/g, "[espace insécable]"), "espace insécable avant les deux-points : la ligne ne commence plus par « : »", "espace insécable avant les deux-points d'un titre");
    t = insecable;
  }
  return filtre(t, ctx);
}

/** La valeur nettoyée, ou `undefined` quand l'élément de liste doit partir. */
function nettoie(valeur, ctx, cle) {
  if (typeof valeur === "string") {
    if (IMAGES.has(cle)) return image(valeur, ctx);
    if (cle === "path") return versLp(valeur);
    if (cle === "mainHref") return valeur.startsWith("#/fr/") ? versLp(valeur.slice(1)) : valeur;
    if (cle === "tel") {
      if (valeur !== TELEPHONE_LP.affichage) throw new Error(`${ctx.page} : numéro ${valeur} au lieu de TELEPHONE_LP`);
      return valeur;
    }
    if (["id", "kind", "grp"].includes(cle)) return valeur;
    return texte(valeur, ctx, cle);
  }
  if (Array.isArray(valeur)) {
    return valeur
      .map((v, i) => nettoie(v, { ...ctx, ou: `${ctx.ou}[${i}]` }, cle))
      .filter((v) => v !== undefined && v !== "");
  }
  if (!valeur || typeof valeur !== "object") return valeur;

  if (typeof valeur.v === "string" && typeof valeur.l === "string" && Object.keys(valeur).length === 2) {
    const correction = PAIRES.find((p) => p.si(valeur));
    const paire = correction ? correction.vers : valeur;
    if (correction) consigne(ctx, `${valeur.v} · ${valeur.l}`, `${paire.v} · ${paire.l}`, correction.motif, correction.nom);
    const motifs = motifsDuTexte(`${paire.v} ${paire.l}`, ctx);
    if (motifs.length) {
      consigne(ctx, `${paire.v} · ${paire.l}`, "", `retiré : ${motifs.join(", ")}`, `retiré : ${motifs[0]}`);
      return undefined;
    }
    return { ...paire };
  }

  if (typeof valeur.q === "string" && typeof valeur.a === "string") {
    const motifs = motifsDuTexte(appliqueDecisions(valeur.q), ctx);
    if (motifs.length) {
      consigne(ctx, `${valeur.q} / ${valeur.a}`, "", `question retirée avec sa réponse : ${motifs.join(", ")}`, `question de FAQ retirée avec sa réponse : ${motifs[0]}`);
      return undefined;
    }
  }

  const ici = valeur.kind ? { ...ctx, kind: valeur.kind } : ctx;
  const propre = Object.fromEntries(
    Object.entries(valeur).map(([k, v]) => [k, nettoie(v, { ...ici, ou: `${ici.ou}.${k}` }, k)]),
  );

  // Un élément de liste dont la tête est vidée part entier (sa description n'a plus de titre).
  if (!valeur.kind && ctx.ou.endsWith("]")) {
    const tete = ["h", "q", "t"].find((k) => typeof valeur[k] === "string" && valeur[k]);
    const vide = (tete && propre[tete] === "") || (typeof valeur.a === "string" && valeur.a && propre.a === "");
    if (vide) {
      const reste = Object.entries(valeur).filter(([k, v]) => k !== tete && typeof v === "string" && v && !IMAGES.has(k));
      consigne(ctx, reste.map(([, v]) => v).join(" / ") || valeur[tete], "", "la description part avec son titre, l'élément entier est retiré", "élément de liste retiré avec son titre");
      return undefined;
    }
  }

  if (valeur.kind === "numbered" && propre.cards.length !== valeur.cards.length) {
    // « Six métiers » pour cinq cartes : le titre ne survit pas au retrait d'une carte.
    const compte = /^(\p{L}+) métiers\b/u.exec(propre.h2)?.[1]?.toLowerCase();
    if (NOMBRES[compte] && NOMBRES[compte] !== propre.cards.length) {
      consigne({ ...ici, ou: `${ici.ou}.h2` }, propre.h2, "", `titre retiré : il annonce ${compte} métiers, la section en garde ${propre.cards.length}`, "titre « Six métiers » retiré (une carte en moins)");
      propre.h2 = "";
    }
    // Le numéro affiché (01, 02…) est un rang, pas de la copie : il suit les cartes restantes.
    if (propre.cards.every((c) => /^\d{2}$/.test(c.eb))) {
      const avant = propre.cards.map((c) => c.eb).join(", ");
      propre.cards = propre.cards.map((c, i) => ({ ...c, eb: String(i + 1).padStart(2, "0") }));
      consigne({ ...ici, ou: `${ici.ou}.cards` }, `numéros ${avant}`, `numéros ${propre.cards.map((c) => c.eb).join(", ")}`, "numérotation recalée après le retrait d'une carte", "numérotation des cartes recalée");
    }
  }
  // Un sur-titre part avec le titre qu'il annonçait : seul, il ne surmonte plus rien.
  if (valeur.kind && valeur.h2 && !propre.h2 && propre.kick) {
    consigne({ ...ici, ou: `${ici.ou}.kick` }, propre.kick, "", "sur-titre retiré avec son titre", "sur-titre retiré avec son titre");
    propre.kick = "";
  }
  return propre;
}

/* -------------------------------------------------------------- génération */

const source = JSON.parse(readFileSync(SOURCE, "utf8"));
const pages = [];
for (const page of source.pages) {
  if (PAGES_RETIREES[page.path]) continue;
  const ctx = { page: versLp(page.path), ou: "", compte: { vignettes: 0 } };
  const propre = nettoie(page, ctx, "");
  if (ctx.compte.vignettes) {
    journal.push({
      page: ctx.page,
      ou: ctx.compte.ou,
      avant: `${ctx.compte.vignettes} vignettes assets/villes/<ville>.jpg (absentes du site)`,
      apres: "/assets/villes/hub-<ville>.jpg",
      motif: "les photos des dix hubs sous licence, servies par l'accueil et /implantations/ (photos-hubs.ts)",
      categorie: "vignettes des hubs remplacées par les photos du site",
    });
  }
  pages.push(propre);
}
const meta = nettoie(source.meta, { page: "meta", ou: "meta", compte: { vignettes: 0 } }, "meta");
const donnees = { meta, pages };

mkdirSync(dirname(FICHIER_LP), { recursive: true });
writeFileSync(FICHIER_LP, `${JSON.stringify(donnees, null, 1)}\n`);
writeFileSync(COMPTE_RENDU, compteRendu(source, donnees));

const trouves = defauts(donnees);
if (trouves.length) {
  for (const t of trouves) console.error(`${t.ou}\n  ${t.motif}\n  « ${t.texte} »\n`);
  console.error(`${trouves.length} défaut(s) restent dans la donnée générée.`);
  process.exit(1);
}
console.log(`${pages.length} LP écrites dans lib/lp/pages.json, ${journal.length} changements consignés dans docs/LP-NETTOYAGE.md`);

/* ------------------------------------------------------------ compte rendu */

function libelleSection(page, ou) {
  const i = /^\.secs\[(\d+)\]/.exec(ou)?.[1];
  if (i === undefined) return ou.replace(/^\./, "") || "page";
  const s = page.secs[Number(i)];
  const nom = s.kick || s.h2 || s.t || s.kind;
  return `section « ${nom} »${ou.replace(/^\.secs\[\d+\]/, "").replace(/^\./, " · ")}`;
}

function compteRendu(src, sortie) {
  const parPage = new Map();
  for (const e of journal) parPage.set(e.page, [...(parPage.get(e.page) ?? []), e]);
  const parMotif = new Map();
  for (const e of journal) {
    if (!e.categorie) throw new Error(`changement sans catégorie : ${e.motif}`);
    parMotif.set(e.categorie, (parMotif.get(e.categorie) ?? 0) + 1);
  }
  const cite = (t) => `« ${String(t).replace(/\s+/g, " ").trim()} »`;
  const lignes = [];
  const sourceParChemin = new Map(src.pages.map((p) => [versLp(p.path), p]));

  lignes.push(
    "# Landing pages sous /lp/ : ce qui a été retiré ou remplacé",
    "",
    "Fichier écrit par `bun scripts/genere-lp.mjs`, ne pas le modifier à la main : relancer le script.",
    "",
    "## Ce que c'est",
    "",
    "Les landing pages publicitaires de la maquette V3 (onglets « Landing page PC » et « Landing page mobile »), portées sous migen.fr dans le répertoire `/lp/`, non référencées par Google. La donnée vient de `window.__LP` de la V3, copiée telle quelle dans `maquette/v3-lp/lp-data.json`, et sort dans `lib/lp/pages.json`, avec exactement le même schéma.",
    "",
    "Adresses : les mêmes fins d'adresse que go.migengroup.com, sans le `/fr` (`/fr/maintenance-industrielle-lyon` devient `/lp/maintenance-industrielle-lyon/`, `/fr/secteurs/chimie` devient `/lp/secteurs/chimie/`). Les liens entre LP (`mainHref`) suivent. Aucune LP ne renvoie vers go.migengroup.com. Dijon, seul hub sans LP, renvoie au formulaire de la page (le gabarit le calcule).",
    "",
    `Images : chemins absolus (\`/assets/...\`), tous servis par le site. Numéro : ${TELEPHONE_LP.affichage}, celui des LP (TELEPHONE_LP), et lui seul.`,
    "",
    "## La règle appliquée",
    "",
    "Rien n'est rédigé. Une phrase qui porte un interdit est retirée entière ; dans un libellé fait de segments séparés par « · », seul le segment fautif part, sauf quand il nomme une agence (« Agence Paris · La Défense » part entier). Une question de FAQ qui porte un interdit part avec sa réponse. Un élément de liste dont le titre est vidé part entier ; un sur-titre part avec le titre de section qu'il annonçait. Un texte vidé reste une chaîne vide : la clé demeure, le gabarit ne rend pas de bloc vide (ni `<h2>` vide).",
    "",
    "Les seules réécritures sont nommées dans `CORRECTIONS` du script : retrait d'une proposition qui porte un délai (le reste de la phrase est celui de la V3), note client du site, « +200 clients » sans « satisfaits », fautes de préposition de la V3 (« au Havre », « dans le Nord »…), et les décisions déjà actées du site (`lib/decisions-copie.ts`). Les agences et les rattachements de hub ne sont jamais réécrits : ils sont retirés.",
    "",
    "Interdits : intérim, régie, mise (met, mettre) à disposition, sans engagement, notamment, sur mesure, clé en main, levier, concrètement, incontournable, découvrez, en savoir plus, tiret cadratin, « candidats », « prix mensuel fixe » ; tout délai chiffré sauf le rappel dans l'heure ; tout montant sauf « +10 M€ » de l'accueil ; toute agence locale en France hors Lyon (Écully) ; tout rattachement de hub incohérent avec les dix hubs (une ville-hub rattachée à un autre, une ville sans hub rattachée à un autre que le plus proche) ; 4,9/5. La porte `bun scripts/verifie-lp-donnees.mjs` (dans `bun run verifie`) refuse leur retour dans la donnée, et `bun scripts/verifie-lp.mjs` dans le texte que le gabarit ajoute à la page rendue.",
    "",
    "## En chiffres",
    "",
    `- ${sortie.pages.length} pages portées sur ${src.pages.length} ; ${Object.keys(PAGES_RETIREES).length} non portées.`,
    `- ${journal.length} retraits ou remplacements, dont :`,
    ...[...parMotif].sort((a, b) => b[1] - a[1]).map(([m, n]) => `  - ${n} : ${m}`),
    "",
    "## Pages non portées",
    "",
    ...Object.entries(PAGES_RETIREES).map(([chemin, pourquoi]) => `- \`${chemin}\` : ${pourquoi}`),
    "",
    "## Changements de copie faits dans le gabarit, hors donnée",
    "",
    "Le texte que les composants de `components/lp/` écrivent eux-mêmes, et ce qui y diffère de la V3 :",
    "",
    "- Formulaire (`FormulaireLP.tsx`) : la mention de la V3 « Gratuit et sans engagement. Vos données servent uniquement à traiter votre demande · Confidentialité » (deux fois par page) porte « sans engagement » ; elle est remplacée par la mention RGPD du formulaire du site, mot pour mot (`MentionsRgpd`).",
    "- Formulaire : celui de la V3 (`MigenLPForm`), au héros comme en bas de page, sur un seul écran : titre de la page, « Rappel dans l’heure », six champs obligatoires, bouton « On me rappelle dans l’heure ». Il envoie comme le formulaire du site (`/api/lead`, formulaire HubSpot du site, attribution de la visite) ; rien de la LP en ligne n'y est ajouté, ni champ ni étape.",
    "- Pied : « © 2026 Migen · migengroup.com » devient « © <année> Migen » ; « Mentions légales » est ajouté à côté de la politique de confidentialité, les deux vers les pages du site ; « Préférences cookies » rouvre le bandeau du site.",
    "- /lp/rendez-vous/ : le faux agenda de la V3 (cinq jours et six créneaux écrits en dur, « Confirmer le rendez-vous », « Visio ou téléphone · sans engagement ») disparaît. À sa place, le titre de carte de la V3 sans sa durée chiffrée, « Choisissez votre créneau », et un bouton qui ouvre l'agenda Calendly de la LP en ligne, « Réservez votre échange », les mots du titre de la page. Surtitre, titre et chapô sont lus dans la donnée.",
    "- /lp/merci/ : tout est lu dans la donnée (surtitre, titre, chapô, points, bouton `mainCta` vers `mainHref`).",
    "- Barre collante du téléphone : absente de /lp/merci/ et /lp/rendez-vous/ (la V3 l'y montre, mais son bouton y vise `#lp-contact`, qui n'existe pas sur ces pages) ; sans le voile blanc de la V3, qui laissait du texte blanc à 2:1 sur le héros.",
    "- Carrousel des témoignages : les cartes « Étude de cas » ne mènent nulle part, comme dans la V3 (aucune sortie vers le site) ; un bouton de pause est ajouté (WCAG 2.2.2).",
    "",
    "## Conservé, à confirmer par Mehdi",
    "",
    "Aucune règle ne les retire, mais aucune source du site ne les atteste mot pour mot. Gardés tels quels :",
    "",
    "- « Lun. au ven., 8h à 18h » à côté du numéro des LP (bloc contact) : horaires du standard des LP, non affichés par le gabarit V3. Le site annonce d'autres horaires pour son propre numéro.",
    "- « Remplacement garanti » (badges des villes, page merci), « Autonomes dès le 1er jour », « 100% opérationnels dès le premier jour », « 8+ équipements maîtrisés » : promesses reprises de la LP en ligne. « Dès le premier jour » n'est pas tenu pour un délai : le site écrit lui-même « le bon profil, opérationnel dès le premier jour » (/nous-connaitre/, `TerrainsExcellence.tsx`).",
    "- « Profils sélectionnés (1/10) » (technicien disponible) : même sens que « 10 % des techniciens retenus ».",
    "- Durées écrites en lettres hors des cartes « Cas client » : « Un centre logistique monté en six semaines », « Un parc de fonderie repris en huit semaines », « Six mois pour remettre en état un site à risque chimique » (titres d'études de cas du site, /preuves/), et le témoignage « …pendant six semaines… » (accueil du site). Gardés parce que le site les affiche ; à arbitrer : la consigne « aucun délai chiffré » les retirerait, et avec eux trois études de cas et une phrase d'un témoignage sur 36 pages.",
    "- Pages des villes-hubs Bordeaux, Lille, Marseille, Metz : la V3 les rattachait à un autre hub ; le rattachement est retiré (« Intervention Bordeaux » au lieu de « Intervention Bordeaux · Hub Toulouse »), pas réécrit en « Hub Bordeaux ». Paris : l'agence de La Défense est retirée entière (badge, titre de bloc, adresse du chapô). À réécrire si Mehdi le souhaite.",
    "- Le Havre et Nice : la V3 les rattachait à Nantes et à Lyon, alors que Paris et Marseille sont plus proches (et que Rouen, même département que Le Havre, va à Paris). Le rattachement est retiré, pas remplacé.",
    "- « Un expert local qualifie, confirme profil et tarif. » et « Basés autour de <ville>, mobilisables vite. » (les quinze villes) : gardés, ils parlent des techniciens et non d'une implantation ; à confirmer pour les six villes sans hub (Brest, Grenoble, Le Havre, Nice, Rennes, Rouen), où « partenaire maintenance basé à » et « partenaire maintenance local » ont été retirés.",
    "- Les quinze cartes « Cas client · département » : anonymes, sans équivalent dans /preuves/, gardées sans leurs délais ni durées comme demandé.",
    "- Les textes vidés par la règle (chapô de la page France, méta-descriptions des villes et des expertises, chapô du devis…) : à réécrire si Mehdi le souhaite, la règle interdit de le faire ici.",
    "",
    "## Page par page",
    "",
  );

  for (const page of sortie.pages) {
    const entrees = parPage.get(page.path) ?? [];
    lignes.push(`### \`${page.path}\``, "");
    if (!entrees.length) {
      lignes.push("Aucun retrait ni remplacement.", "");
      continue;
    }
    const brute = sourceParChemin.get(page.path);
    for (const e of entrees) {
      const ou = libelleSection(brute, e.ou);
      lignes.push(
        e.apres === ""
          ? `- ${ou} : ${cite(e.avant)} retiré. Motif : ${e.motif}.`
          : `- ${ou} : ${cite(e.avant)} devient ${cite(e.apres)}. Motif : ${e.motif}.`,
      );
    }
    lignes.push("");
  }
  const autres = journal.filter((e) => e.page === "meta");
  if (autres.length) {
    lignes.push("### Données communes (`meta`)", "", ...autres.map((e) => `- ${e.ou} : ${cite(e.avant)} devient ${cite(e.apres)}. Motif : ${e.motif}.`), "");
  }
  return `${lignes.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}
