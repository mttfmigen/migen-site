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
import { FICHIER_LP, defauts, motifsDuTexte, villeDe } from "./verifie-lp-donnees.mjs";

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
  // « +200 clients », sans qualificatif.
  { de: /(200 clients) satisfaits/g, vers: "$1", motif: "« +200 clients » sans le qualificatif « satisfaits »", nom: "« satisfaits » retiré de « +200 clients »" },
  /* Les hubs : Bordeaux, Lille, Marseille et Metz SONT des hubs, la V3 les
     rattachait à un autre. La forme est celle des pages de hub de la V3
     (Nantes, Strasbourg, Toulouse) : « Hub X · département » et « Hub Migen à X. » */
  ...hubAuLieuDe("bordeaux", "Bordeaux", "Gironde", "Toulouse"),
  ...hubAuLieuDe("lille", "Lille", "Nord", "Lyon"),
  ...hubAuLieuDe("marseille", "Marseille", "Bouches-du-Rhône", "Lyon"),
  ...hubAuLieuDe("metz", "Metz", "Moselle", "Lyon"),
  // Paris : pas d'agence à La Défense, Paris est un hub.
  { ville: "paris", de: /^Agence Paris · La Défense$/g, vers: "Hub Paris · Île-de-France", motif: "aucune agence à Paris (4 agences : Lyon, Montréal, Dubaï, Madrid) ; Paris est un hub, forme des pages de hub", nom: "agence de La Défense remplacée par le hub de Paris" },
  { ville: "paris", de: /Agence à La Défense, 16 place de l'Iris à Courbevoie\./g, vers: "Hub Migen à Paris.", motif: "aucune agence à La Défense ; Paris est un hub, forme des pages de hub", nom: "agence de La Défense remplacée par le hub de Paris" },
];

function hubAuLieuDe(ville, nom, departement, ailleurs) {
  const motif = `${nom} est l'un des dix hubs : la V3 le rattachait au hub de ${ailleurs}`;
  const nomCorrection = "ville-hub rattachée à son propre hub";
  return [
    { ville, de: new RegExp(`^Intervention ${nom} · Hub ${ailleurs}$`, "g"), vers: `Hub ${nom} · ${departement}`, motif, nom: nomCorrection },
    { ville, de: new RegExp(`Techniciens déployés depuis notre hub Migen de ${ailleurs}\\.`, "g"), vers: `Hub Migen à ${nom}.`, motif, nom: nomCorrection },
  ];
}

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
    if (segments.length > 1 && restants.length > 0) {
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
    "Rien n'est rédigé. Une phrase qui porte un interdit est retirée entière ; dans un libellé fait de segments séparés par « · », seul le segment fautif part. Une question de FAQ qui porte un interdit part avec sa réponse. Un élément de liste dont le titre est vidé part entier. Un texte vidé reste une chaîne vide : la clé demeure, le gabarit ne rend pas de bloc vide.",
    "",
    "Les seules réécritures sont nommées dans `CORRECTIONS` du script : retrait d'une proposition qui porte un délai (le reste de la phrase est celui de la V3), cohérence des hubs, note client du site, « +200 clients » sans « satisfaits », et les décisions déjà actées du site (`lib/decisions-copie.ts`).",
    "",
    "Interdits : intérim, régie, mise (met, mettre) à disposition, sans engagement, notamment, sur mesure, clé en main, levier, concrètement, incontournable, découvrez, en savoir plus, tiret cadratin, « candidats », « prix mensuel fixe » ; tout délai chiffré sauf le rappel dans l'heure ; tout montant sauf « +10 M€ » de l'accueil ; toute agence locale en France hors Lyon (Écully) ; tout rattachement de hub incohérent avec les dix hubs ; 4,9/5. La porte `bun scripts/verifie-lp-donnees.mjs` (dans `bun run verifie`) refuse leur retour.",
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
    "## Conservé, à confirmer par Mehdi",
    "",
    "Aucune règle ne les retire, mais aucune source du site ne les atteste mot pour mot. Gardés tels quels :",
    "",
    "- « Lun. au ven., 8h à 18h » à côté du numéro des LP (bloc contact) : horaires du standard des LP, non affichés par le gabarit V3. Le site annonce d'autres horaires pour son propre numéro.",
    "- « Remplacement garanti » (badges des villes, page merci), « Autonomes dès le 1er jour », « 100% opérationnels dès le premier jour », « 8+ équipements maîtrisés » : promesses reprises de la LP en ligne.",
    "- « Profils sélectionnés (1/10) » (technicien disponible) : même sens que « 10 % des techniciens retenus ».",
    "- Rattachements « Intervention Le Havre · Hub Nantes » (quand Rouen est rattachée à Paris) et « Intervention Nice · Hub Lyon » (Marseille est un hub) : cohérents avec la liste des dix hubs, mais à confirmer.",
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
