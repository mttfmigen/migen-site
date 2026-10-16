/**
 * Contrôle du hub `/secteurs/` (gabarit « 10 Hub de rubrique »), sans navigateur.
 *
 *   bun components/site/secteurs-hub/verification-secteurs-hub.tsx
 *
 * LA PAGE N'A PAS DE COMPOSANT À ELLE. Sa capture, `maquette/rendu/secteurs.html`,
 * porte exactement la suite d'écrans d'une offre (16 sections, maillage « Par où
 * continuer ? » au dessin des pages liées) : sa donnée,
 * `supabase/import/gabarits-maquette/secteurs.json`, a donc la forme d'une offre
 * et la route la sert par `PageOffre`, sans branche de plus. Ce contrôle la rend
 * par `renderToStaticMarkup` depuis ce fichier, tel que la route le lit, et la
 * compare à SA capture, section par section :
 *
 *  1. LE H1 est celui de la capture, et il est seul. Seize sections, comme elle.
 *  2. MOT POUR MOT, DANS L'ORDRE, PAR SECTION : chaque texte de la capture se
 *     retrouve dans la section rendue de même rang, dans le même ordre, sur
 *     texte normalisé. Seules exceptions : `TROUS`, chacun avec sa raison, et
 *     chacun vérifié VRAI (moins d'occurrences rendues que capturées).
 *  3. RIEN D'INVENTÉ, PUIS LE LITTÉRAL : chaque texte rendu existe dans la
 *     capture, puis tel quel, apostrophes typographiques comprises. Seules
 *     exceptions : `AJOUTS`, vérifiés réellement rendus.
 *  4. LES LIENS de chaque section de la capture, dans l'ordre ; aucun `href="#"`.
 *  5. LES PHOTOS viennent DE LA MAQUETTE OU DE LA RÉPARTITION, emplacement par
 *     emplacement, et il y en a toujours autant que dans la capture : celles
 *     des références par empreinte SHA-1 (la capture les sert en `blob:`, les
 *     octets ont été relevés sur la maquette vivante le 08/10 et retrouvés tels
 *     quels dans `public/assets/web/`) ou par le registre des photos sous
 *     licence ; celles du maillage par leur nom relu dans la capture à chaque
 *     passage, ou par le registre. Écart du 09/10, déclaré plus bas.
 *  6. LES INTERDITS du contrat sont absents du rendu.
 *
 * IL PROUVE QU'IL SAIT ÉCHOUER : il altère d'abord la page de sept façons et
 * exige que chacune soit vue. Une altération qui passe le déclare aveugle.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

/* LE RETRAIT DES ORNEMENTS DU TÉLÉPHONE, PAR COMPTAGE DE PROFONDEUR, et pris
   au module partagé plutôt que recopié ici. Voir `ornements-mobiles.ts` pour
   le pourquoi et le défaut qu'il répare : une lecture paresseuse s'arrête au
   premier `</span>` et ne retire que la moitié de l'étiquette de bascule, qui
   en contient deux. Cette porte est la quatrième à s'y brancher, après
   `verification-editorial.tsx` et `verification-ressource.tsx`. */
import { sansOrnementsMobiles } from "@/components/site/editorial/ornements-mobiles";
import PageOffre from "@/components/site/offre/PageOffre";
import { SIEGE_A_ECULLY, appliqueDecisions } from "@/lib/decisions-copie";
import { deLaRepartition } from "@/lib/photos-autorisees";
import type { ContenuOffre } from "@/types/offre";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const FICHIER = join(RACINE, "supabase", "import", "gabarits-maquette", "secteurs.json");
/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(readFileSync(join(RACINE, "maquette", "rendu", "secteurs.html"), "utf8"));

interface PageRelais {
  url: string;
  titre_h1: string;
  contenu: ContenuOffre;
}

/* ----------------------------------------------------- les écarts déclarés */

/**
 * Dans la capture, absent du rendu. Chacun vérifié VRAI à chaque passage :
 * présent dans la capture, et moins d'occurrences rendues que capturées.
 *
 * L'entrée du 08/10 est partie : le bouton d'envoi de `PanneauFormulaire`
 * répète désormais le titre du panneau, comme la capture (« Parler à un chargé
 * d'affaires », au héros et à l'appel final).
 */
const TROUS: readonly { section: string; texte: string; pourquoi: string }[] = [
  {
    section: "Maillage",
    texte: "6 pages liées",
    pourquoi:
      "Compteur retiré de `PagesLiees` sur arbitrage de Mehdi du 11/10. " +
      "Il était pourtant conforme : mesure du même jour, les mêmes dix pages " +
      "le portent dans les captures figées et sur le site. Écart à la maquette " +
      "assumé, demandé explicitement. Le jour où le compteur revient, ce trou " +
      "devient inutile et la porte le dit.",
  },
];

/** Rendu, absent de la capture : le même formulaire partagé (champ « Site web », mention RGPD). */
const AJOUTS: readonly string[] = [
  "Site web",
  "Données traitées par Migen pour répondre à votre demande, enregistrées dans HubSpot. Droits et durées de conservation :",
  "politique de confidentialité",
  /* LA MENTION DE PROSPECTION, donnée par Mehdi le 13/10 au soir. Elle est
     absente de la capture, et c'est normal : la maquette ne la porte nulle
     part. Sans cette ligne, la porte voyait du texte à l'écran qui n'est pas
     dans son modèle et déclarait la page en dérive, à tort.

     AJOUTER UNE LIGNE ICI N'EST PAS AFFAIBLIR LA PORTE, à une condition :
     que ce soit une chaîne EXACTE et non un motif. Elle reste incapable de
     laisser passer une phrase voisine, et toute autre copie hors capture la
     fait toujours tomber. */
  "Vos informations seront conservées et utilisées pour vous proposer nos produits et services. Vous restez libre de vous désinscrire à tout moment.",
];

/**
 * Les photos des huit cartes de « 08 Références », par empreinte des octets
 * servis par la maquette vivante (relevé du 08/10, `blob:` lus par XHR).
 */
const EMPREINTES_REFERENCES: readonly string[] = [
  "dce5eb7927bec147821aa1cc61bb69d180d44be1", // DANONE
  "57154b3d11c9fbaec49aca7e1b6ce074c8a36838", // STELLANTIS
  "94c7f2bfced47f9f47c49daea211bac1efc0bc59", // AMAZON
  "4539bb3aab149b42fd425bff9af31c7fd2a64c35", // MERSEN
  "db074df40fe66daf56bb3c4b7e98151c84ac12d7", // SUEZ
  "dc0942249387d71c48010ace2f9428d70b6bd85e", // GROUPE ATLANTIC
  "4539bb3aab149b42fd425bff9af31c7fd2a64c35", // DimoMaint
  "fcab097f172e5560c65ba9aac6a621470d19c7f8", // Savoye
];

/**
 * Photo du maillage nommée par la capture et absente de `public/` : la rangée
 * reste nue plutôt que de recevoir une autre photo. Le jour où le fichier
 * arrive, ce contrôle échoue et demande de le déclarer dans la donnée. Vide
 * depuis le 08/10 : `x-mecanique-portrait.jpg` est arrivée (octets identiques
 * à ceux de la maquette) et la carte Aéronautique la porte.
 */
const PHOTOS_ABSENTES: readonly string[] = [];

const INTERDITS: readonly [RegExp, string][] = [
  [/—/u, "tiret cadratin"],
  [/\bsous\s+\d+\s*(?:h|heures?|jours?|min)/iu, "délai chiffré"],
  [/\b24\s*h|\b24\s*heures/iu, "« 24h »"],
  [/\b7\s*j?\s*\/\s*7\b/u, "« 7j/7 »"],
  [/\d[\d\s  ]*(?:€|euros?\b)/u, "prix"],
  [/régie/iu, "« régie »"],
  [/intérim/iu, "« intérim »"],
  [/mise à disposition/iu, "« mise à disposition »"],
  [/sans engagement/iu, "« sans engagement »"],
  [/clé en main/iu, "« clé en main »"],
  [/sur mesure/iu, "« sur mesure »"],
  [/\blevier/iu, "« levier »"],
  [/concrètement/iu, "« concrètement »"],
  [/notamment/iu, "« notamment »"],
  [/incontournable/iu, "« incontournable »"],
  [/découvrez/iu, "« découvrez »"],
  [/r[ée]guliers/iu, "« réguliers » à côté de clients"],
  [SIEGE_A_ECULLY, "le siège est à Limonest, Écully est l'agence"],
  [/postuler sur Teamtailor/iu, "« postuler sur Teamtailor »"],
  [/\b(?:5|cinq) agences/iu, "quatre agences"],
];

/* -------------------------------------------------------------- les textes */

function entites(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** La forme de comparaison. Le fichier, lui, garde le littéral. */
function normalise(texte: string): string {
  return texte.replace(/[  ]/g, " ").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

/**
 * Les nœuds de texte, littéraux (entités décodées, blancs réduits).
 *
 * LES ORNEMENTS DU TÉLÉPHONE SONT RETIRÉS DES DEUX CÔTÉS, par
 * `sansOrnementsMobiles`. La capture est une capture de BUREAU et n'en porte
 * aucun (mesuré : zéro `data-mobile-seulement` dans `secteurs.html`) ; le rendu
 * en porte dix, le chevron de bascule, le résumé de deux lignes et l'étiquette
 * de pli. Sans ce retrait la porte signalait « texte rendu absent de la
 * capture » sur « › » et sur trois résumés, soit six écarts sur sept, pour un
 * ornement que personne ne voit à cette largeur.
 *
 * LE RETRAIT SE FAIT ICI, dans la lecture du TEXTE, et pas sur tout le
 * document : les liens et les photos continuent d'être comptés sur le balisage
 * entier, pour qu'un ornement qui se mettrait à porter une photo ou un lien
 * reste jugé au lieu de sortir du contrôle.
 */
function noeuds(html: string): string[] {
  return noeudsBruts(sansOrnementsMobiles(html));
}

/** Les mêmes nœuds, ORNEMENTS COMPRIS. Ne sert qu'au témoin du retrait. */
function noeudsBruts(html: string): string[] {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .split(/<[^>]+>/)
    .map((t) => entites(t).replace(/[ \t\n\r]+/g, " ").trim())
    .filter(Boolean);
}

/** Le HTML coupé à chaque `<section` : PageOffre n'en imbrique aucune. */
function sections(html: string): string[] {
  return html.split(/(?=<section[\s>])/).filter((s) => s.startsWith("<section"));
}

function attributs(html: string, nom: string): string[] {
  return [...html.matchAll(new RegExp(`\\s${nom}="([^"]*)"`, "g"))].map((m) => entites(m[1]));
}

/** `/_next/image?url=%2Fassets%2F…&w=…` comme `/assets/…` : le fichier servi.
 *  `/assets/photos/` est lu comme `/assets/web/` depuis l'écart du 09/10 : sans
 *  cela une photo sous licence sortirait du contrôle au lieu d'y être jugée. */
function photosLocales(html: string): string[] {
  return attributs(html, "src")
    .map((src) => (src.startsWith("/_next/image") ? decodeURIComponent(new URL(src, "http://x").searchParams.get("url") ?? "") : src))
    .filter((src) => src.startsWith("/assets/web/") || src.startsWith("/assets/photos/"));
}

/* ÉCART MAJEUR À LA MAQUETTE, DÉCLARÉ LE 09/10/2025, DEMANDÉ PAR MEHDI.
   Cette porte exigeait, emplacement par emplacement, LA photo de la maquette :
   les huit empreintes SHA-1 de « 08 Références » et les noms de fichier relus
   dans la capture pour le maillage. C'était juste tant que le site n'avait pas
   d'images à lui. Mesuré le 09/10 par `node scripts/mesure-photos-site.mjs` :
   68 photos distinctes pour 1 822 emplacements, et les 109 photos achetées
   sous licence le 08/10 servies par aucune page. La règle devient, pour CHAQUE
   emplacement : l'empreinte (ou le nom) de la maquette, OU une photo de la
   répartition du 09/10 (`lib/photos-autorisees.ts`). Ce qui ne bouge pas,
   et c'est ce qui garde les dents de la porte : LE NOMBRE d'emplacements reste
   celui de la capture, et une photo qui ne vient ni de la maquette ni du
   registre tombe. Deux témoins en font la preuve. */
function photoAdmise(photo: string, deLaMaquette: () => boolean): boolean {
  return deLaRepartition(photo) || deLaMaquette();
}

function occurrences(meule: string, aiguille: string): number {
  return meule.split(aiguille).length - 1;
}

const sha1 = (chemin: string) => createHash("sha1").update(readFileSync(chemin)).digest("hex");

/* ---------------------------------------------------------- la capture lue */

const SECTIONS_CAPTURE = sections(CAPTURE).map((html) => ({
  libelle: /data-screen-label="([^"]*)"/.exec(html)?.[1] ?? "?",
  html,
}));
const H1_CAPTURE = normalise(noeuds(/<h1[\s\S]*?<\/h1>/.exec(CAPTURE)?.[0] ?? "").join(" "));
const PHOTOS_MAILLAGE_CAPTURE = [
  ...(SECTIONS_CAPTURE.find((s) => s.libelle === "Maillage")?.html ?? "").matchAll(/url\(&quot;assets\/web\/([^&]+)&quot;\)/g),
].map((m) => `/assets/web/${m[1]}`);

/* ------------------------------------------------------------- le jugement */

/** La page rendue telle que la route la sert. Le témoin du retrait des
 *  ornements lit le même balisage que le jugement, pas un autre. */
function rend(page: PageRelais): string {
  return renderToStaticMarkup(
    <PageOffre titre={page.titre_h1} contenu={page.contenu} formulaire="cocon-secteurs-" />,
  );
}

function juge(page: PageRelais): string[] {
  const fautes: string[] = [];
  const faute = (message: string) => fautes.push(message);

  const rendu = rend(page);
  const rendues = sections(rendu);

  // 1. Le H1, seul, et le nombre de sections.
  const h1 = rendu.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
  if (h1.length !== 1) faute(`${h1.length} h1 rendus, un seul attendu`);
  if (normalise(noeuds(h1[0] ?? "").join(" ")) !== H1_CAPTURE) faute(`H1 « ${page.titre_h1} » au lieu de « ${H1_CAPTURE} »`);
  if (rendues.length !== SECTIONS_CAPTURE.length) {
    faute(`${rendues.length} sections rendues, la capture en porte ${SECTIONS_CAPTURE.length}`);
    return fautes;
  }

  SECTIONS_CAPTURE.forEach(({ libelle, html }, rang) => {
    const ici = rendues[rang];
    const texteRendu = normalise(noeuds(ici).join(" "));

    // 2. Mot pour mot, dans l'ordre, trous déclarés retirés (dernière occurrence).
    const attendus = noeuds(html).map(normalise);
    for (const trou of TROUS.filter((t) => t.section === libelle)) {
      const cible = normalise(trou.texte);
      const k = attendus.lastIndexOf(cible);
      if (k === -1) faute(`${libelle} : trou déclaré absent de la capture « ${trou.texte} »`);
      else attendus.splice(k, 1);
      if (occurrences(texteRendu, cible) >= occurrences(normalise(noeuds(html).join(" ")), cible)) {
        faute(`${libelle} : trou devenu inutile « ${trou.texte} », à retirer de TROUS`);
      }
    }
    let curseur = 0;
    for (const texte of attendus) {
      const ou = texteRendu.indexOf(texte, curseur);
      if (ou === -1) {
        faute(`${libelle} : manque ou hors d'ordre « ${texte.slice(0, 80)} »`);
        continue;
      }
      curseur = ou + texte.length;
    }

    // 4. Les liens de la capture, dans l'ordre. Hors du moteur de Next, `Link`
    //    rend sans la barre finale que `trailingSlash` remet au service.
    const sansBarre = (lien: string) => lien.replace(/(.)\/$/, "$1");
    const liensRendus = attributs(ici, "href").map(sansBarre);
    let k = 0;
    for (const lien of attributs(html, "href")) {
      const ou = liensRendus.indexOf(sansBarre(lien), k);
      if (ou === -1) faute(`${libelle} : lien de la capture absent ou hors d'ordre ${lien}`);
      else k = ou + 1;
    }

    // 5. Les photos.
    if (libelle === "08 Références") {
      const photos = photosLocales(ici);
      if (photos.length !== EMPREINTES_REFERENCES.length) {
        faute(`${libelle} : ${photos.length} photo(s) de carte, la maquette en sert ${EMPREINTES_REFERENCES.length}`);
      }
      photos.forEach((photo, rang) => {
        const fichier = join(RACINE, "public", photo);
        if (!existsSync(fichier)) return faute(`${libelle} : carte ${rang + 1}, ${photo} absente de public/`);
        if (!photoAdmise(photo, () => sha1(fichier) === EMPREINTES_REFERENCES[rang])) {
          faute(`${libelle} : carte ${rang + 1}, ${photo} n'est ni la photo de la maquette ni une photo de la répartition`);
        }
      });
    }
    if (libelle === "Maillage") {
      const attendues = PHOTOS_MAILLAGE_CAPTURE.filter((p) => !PHOTOS_ABSENTES.includes(p));
      const photos = photosLocales(ici);
      if (photos.length !== attendues.length) {
        faute(`${libelle} : ${photos.length} photo(s), la capture en nomme ${attendues.length} (${attendues.join(", ")})`);
      }
      photos.forEach((photo, rang) => {
        if (!photoAdmise(photo, () => photo === attendues[rang])) {
          faute(`${libelle} : rang ${rang + 1}, ${photo} n'est ni ${attendues[rang] ?? "rien"} (capture) ni une photo de la répartition`);
        }
      });
      for (const p of PHOTOS_ABSENTES) {
        if (!PHOTOS_MAILLAGE_CAPTURE.includes(p)) faute(`${libelle} : photo déclarée absente mais que la capture ne nomme pas : ${p}`);
        if (existsSync(join(RACINE, "public", p))) faute(`${libelle} : ${p} est arrivée dans public/, la déclarer dans la donnée et la retirer de PHOTOS_ABSENTES`);
      }
    }
  });

  // 3. Rien d'inventé, puis le littéral, section contre section : une
  //    apostrophe redressée ici ne s'excuse pas d'être droite ailleurs.
  const ajouts = AJOUTS.map(normalise);
  SECTIONS_CAPTURE.forEach(({ libelle, html }, rang) => {
    const texteIci = normalise(noeuds(html).join(" "));
    const litteralIci = noeuds(html).join(" ");
    for (const noeud of noeuds(rendues[rang])) {
      const n = normalise(noeud);
      if (ajouts.some((a) => a.includes(n))) continue;
      if (!texteIci.includes(n)) faute(`${libelle} : texte rendu absent de la capture « ${noeud.slice(0, 80)} »`);
      else if (!litteralIci.includes(noeud)) faute(`${libelle} : texte rendu hors littéral de la capture « ${noeud.slice(0, 80)} »`);
    }
  });
  const texteTout = normalise(noeuds(rendu).join(" "));
  for (const a of ajouts) if (!texteTout.includes(a)) faute(`ajout déclaré plus rendu « ${a} », à retirer de AJOUTS`);

  // 4 bis et 6. Aucun lien mort, aucun interdit.
  if (rendu.includes('href="#"')) faute('un lien href="#" est rendu');
  for (const [motif, pourquoi] of INTERDITS) if (motif.test(texteTout)) faute(`interdit rendu : ${pourquoi}`);

  return fautes;
}

/* ------------------------------------------------- il sait échouer, d'abord */

const PAGE: PageRelais = JSON.parse(readFileSync(FICHIER, "utf8"));
if (PAGE.url !== "/secteurs/" || PAGE.contenu.gabarit !== "offre") {
  throw new Error("secteurs.json doit servir /secteurs/ sous le gabarit « offre »");
}

const copie = (): PageRelais => structuredClone(PAGE);
const section = <T extends string>(p: PageRelais, type: T) =>
  p.contenu.sections!.find((s) => s.type === type) as Extract<NonNullable<ContenuOffre["sections"]>[number], { type: T }>;

const ALTERATIONS: [string, (p: PageRelais) => void][] = [
  ["un mot changé", (p) => { const s = section(p, "probleme"); s.punchline = s.punchline.replace("procédé", "process"); }],
  ["une section retirée", (p) => { p.contenu.sections = p.contenu.sections!.filter((s) => s.type !== "garanties"); }],
  ["une phrase inventée", (p) => { p.contenu.chapeau += " Nous intervenons partout, tout le temps."; }],
  ["un interdit", (p) => { section(p, "objections").questions[0].reponse += " Nous savons notamment le faire."; }],
  /* 09/10 : ce témoin échangeait deux photos de références. Depuis l'écart
     déclaré plus haut, les deux sont des photos du registre et l'échange est
     licite : le témoin ne prouvait plus rien. Il est RETOURNÉ sur ce que la
     règle refuse encore, une photo de calage de la maquette posée sur une carte
     dont la maquette servait une AUTRE photo. */
  ["une photo de référence devinée parmi celles de la maquette", (p) => { section(p, "preuves").preuves[0].photo = "/assets/web/ph-tuyaux.jpg"; }],
  /* Et le dossier des photos sous licence n'est pas un passe-droit : c'est le
     REGISTRE qui autorise, fichier par fichier et octet par octet. */
  ["une photo du dossier sous licence absente du registre", (p) => { section(p, "preuves").preuves[0].photo = "/assets/photos/cette-photo-n-est-pas-au-registre.jpg"; }],
  ["une apostrophe redressée", (p) => { p.contenu.formulaireHeroMention = "Rappel dans l'heure"; }],
  ["une photo de maillage retirée", (p) => { delete p.contenu.pagesLiees![1].photo; }],
  /* 13/10, LE TÉMOIN DU RETRAIT DES ORNEMENTS, côté débordement. Ce bénéfice
     est rendu DANS le corps du bloc pliable, donc APRÈS l'étiquette de bascule
     et son `</span>` de fermeture. Un retrait qui compte mal la profondeur et
     avale au-delà de l'ornement emporterait ce texte avec lui : l'altération
     passerait sans être vue, et ce témoin tomberait. */
  ["une phrase inventée dans le corps, sous une étiquette de pli", (p) => { section(p, "offre").lignes[0].benefice += " Nous intervenons sur tout, partout."; }],
];

/* ---------------------------------- le témoin du retrait des ornements

   DEUX CONTRÔLES NÉGATIFS, et ils visent les deux pannes possibles du retrait,
   celle de la lecture PARESSEUSE et celle de la lecture GLOUTONNE. Les deux
   valeurs sont RELUES dans le rendu à chaque passage, aucune n'est écrite ici :
   la porte ne peut donc pas devenir verte parce qu'un chiffre a vieilli. */

/** Les deux premiers textes qui suivent une marque d'ornement, lus SANS compter
 *  la profondeur. C'est exactement ce que voyait la lecture paresseuse : le
 *  premier, qu'elle retirait, et le second, qu'elle laissait derrière elle. */
function textesApresLaMarque(html: string): string[] {
  const marqueImbriquee = /<(\w+)\b[^>]*\sdata-mobile-seulement\b[^>]*>\s*<\1\b/;
  const ou = html.search(marqueImbriquee);
  if (ou < 0) return [];
  return noeudsBruts(html.slice(ou)).slice(0, 2);
}

/** Les écarts du témoin. Liste vide : le retrait fait ce qu'il annonce. */
function temoinOrnements(): string[] {
  const brut = rend(PAGE);
  const propre = sansOrnementsMobiles(brut);
  const manques: string[] = [];

  // Zéro. Le rendu porte bien des ornements : sinon le témoin ne prouve rien.
  const marques = brut.match(/data-mobile-seulement/g)?.length ?? 0;
  if (marques === 0) manques.push("le rendu ne porte plus aucun ornement mobile : ce témoin ne mesure plus rien");
  if (/data-mobile-seulement/.test(propre)) manques.push("une marque d'ornement survit au retrait");

  const [, profond] = textesApresLaMarque(brut);
  if (!profond) {
    manques.push("aucune étiquette imbriquée trouvée dans le rendu : le cas que la profondeur sert à traiter a disparu");
    return manques;
  }

  // Un. PARESSEUSE : le texte PROFOND de l'étiquette doit partir. La lecture
  //     paresseuse s'arrêtait au premier `</span>` et le laissait : le compte
  //     ne bougeait pas.
  if (occurrences(propre, profond) >= occurrences(brut, profond)) {
    manques.push(`lecture paresseuse : « ${profond.slice(0, 50)} » reste aussi présent après retrait qu'avant`);
  }

  // Deux. GLOUTONNE : le même texte, rendu plus bas par le `<h2>` de la
  //       capture, doit SURVIVRE. Un retrait qui court jusqu'à la fin du
  //       document l'emporterait, et la comparaison deviendrait muette.
  if (occurrences(propre, profond) < 1) {
    manques.push(`lecture gloutonne : « ${profond.slice(0, 50)} » a disparu du corps, pas seulement de l'ornement`);
  }
  const dernier = noeudsBruts(brut).at(-1);
  if (dernier && !noeuds(brut).includes(dernier)) {
    manques.push(`lecture gloutonne : le dernier texte de la page « ${dernier.slice(0, 50)} » est parti avec un ornement`);
  }

  return manques;
}

/* ------------------------------------------------- il sait échouer, d'abord */

const CONTROLE = process.argv.includes("--controle");

const aveugles: string[] = [];
const vues: string[] = [];
for (const [nom, altere] of ALTERATIONS) {
  const p = copie();
  altere(p);
  if (juge(p).length === 0) {
    aveugles.push(nom);
    if (!CONTROLE) throw new Error(`contrôle aveugle : « ${nom} » passe sans être vu`);
  } else vues.push(nom);
}

const manquesOrnements = temoinOrnements();
if (manquesOrnements.length > 0 && !CONTROLE) {
  throw new Error(`retrait des ornements mobiles : ${manquesOrnements.join(" ; ")}`);
}

/* LE MODE TÉMOIN S'ARRÊTE ICI, sans juger la vraie page : il doit pouvoir se
   lancer même quand la page, elle, est en écart, pour répondre à la seule
   question « cette porte sait-elle encore échouer ? ». */
if (CONTROLE) {
  console.log("Mode --controle : les témoins seuls. La vraie page n'est pas jugée.\n");
  for (const nom of vues) console.log(`  vue        : ${nom}`);
  for (const nom of aveugles) console.error(`  MANQUÉE    : ${nom}`);
  console.log(
    `\n  retrait des ornements mobiles (${sansOrnementsMobiles.name}, comptage de profondeur) :`,
  );
  if (manquesOrnements.length === 0) {
    const brut = rend(PAGE);
    const [, profond] = textesApresLaMarque(brut);
    console.log(
      `  OK    paresseuse refusée : « ${(profond ?? "").slice(0, 44)} » passe de ` +
        `${occurrences(brut, profond ?? "")} à ${occurrences(sansOrnementsMobiles(brut), profond ?? "")} occurrence(s)`,
    );
    console.log(
      `  OK    gloutonne refusée  : le même texte survit dans le corps, et le dernier texte de la page aussi`,
    );
    console.log(
      `  OK    ${(brut.match(/data-mobile-seulement/g)?.length ?? 0)} ornement(s) marqué(s), 0 après retrait`,
    );
  } else for (const m of manquesOrnements) console.error(`  RATÉ  ${m}`);

  const total = aveugles.length + manquesOrnements.length;
  console.log(
    `\n  ${vues.length}/${ALTERATIONS.length} altérations vues, ` +
      `${manquesOrnements.length === 0 ? "témoin du retrait vert" : "témoin du retrait ROUGE"}.`,
  );
  process.exit(total === 0 ? 0 : 1);
}

/* -------------------------------------------------------- puis la vraie page */

const fautes = juge(PAGE);
if (fautes.length > 0) {
  console.error(`/secteurs/ : ${fautes.length} écart(s) à la capture\n  · ${fautes.join("\n  · ")}`);
  process.exit(1);
}
console.log(
  `/secteurs/ : ${SECTIONS_CAPTURE.length} sections conformes à maquette/rendu/secteurs.html, ` +
    `${TROUS.length} trous et ${AJOUTS.length} ajouts déclarés (formulaire partagé), ` +
    `${ALTERATIONS.length} altérations toutes vues, ornements mobiles retirés par comptage de profondeur.`,
);
