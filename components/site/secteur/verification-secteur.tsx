/**
 * Contrôle du gabarit « 08 Secteur », sans navigateur.
 *
 *   bun components/site/secteur/verification-secteur.tsx
 *
 * Il monte `PageSecteur` sur les 12 fiches de
 * `supabase/import/gabarits-maquette/secteurs-<secteur>.json`, telles que la
 * route les lit, et compare chaque page à SA capture
 * (`maquette/rendu/secteurs--<secteur>.html`), section par section :
 *
 *  1. LE H1 est celui de la capture, et il est seul. Autant de sections qu'elle,
 *     dans le même ordre.
 *  2. MOT POUR MOT, DANS L'ORDRE, PAR SECTION : chaque texte de la capture se
 *     retrouve dans la section rendue de même rang, sur texte normalisé, après
 *     les décisions de copie (`lib/decisions-copie.ts`) et les retouches de
 *     cartes admises (`retoucheCarte`). Exceptions : `TROUS`, chacun avec sa
 *     raison et vérifié vrai.
 *  3. RIEN D'INVENTÉ, PUIS LE LITTÉRAL : chaque texte rendu existe dans la
 *     section de la capture, puis tel quel, apostrophes comprises. Exceptions :
 *     `AJOUTS` (le formulaire partagé) et les retouches déclarées.
 *  4. LES LIENS de chaque section de la capture, dans l'ordre ; aucun `href="#"`.
 *  5. LES PHOTOS ET LES LOGOS : ceux que la capture nomme en clair, par leur
 *     nom ; ceux qu'elle sert en `blob:`, par empreinte SHA-1 contre le relevé
 *     de la maquette vivante (`releve-photos.json`).
 *  5 bis. UNE SEULE BANDE DE LOGOS dans « 02 Logos », et elle est entière :
 *     `ecartsBandeUnique`. Ajouté le 09/10 avec l'écart déclaré en tête de
 *     `LogosSecteur.tsx`. CE CONTRÔLE DIT LE CONTRAIRE DE LA CAPTURE, et c'est
 *     voulu : la capture empile la grille du secteur et le bandeau défilant,
 *     Mehdi a tranché « il ne doit y en avoir qu'une ». Les points 2 et 3
 *     restent, eux, adossés à la capture : le bandeau ne porte aucun texte, son
 *     retrait ne change pas un mot de la page, et c'est pour cela que ce
 *     cinquième contrôle devait exister, sans quoi rien n'aurait vu la
 *     différence.
 *  6. LES INTERDITS du contrat sont absents du rendu.
 *  7. « NOS RÉFÉRENCES » : mêmes cas liés que la capture, même ordre, cartes
 *     mot pour mot (le compte de cas comparés est affiché : 89).
 *
 * IL PROUVE QU'IL SAIT ÉCHOUER : il altère d'abord une page de huit façons et
 * exige que chacune soit vue, puis il éprouve le contrôle des références.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { appliqueDecisions } from "@/lib/decisions-copie";
import type { ContenuSecteurOffre } from "@/types/secteur";

import PageSecteur from "./PageSecteur";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const RELEVE: Record<string, { probleme?: string[]; references?: string[]; logos?: string[] }> = JSON.parse(
  readFileSync(join(RACINE, "components", "site", "secteur", "releve-photos.json"), "utf8"),
);

interface PageRelais {
  url: string;
  titre_h1: string;
  contenu: ContenuSecteurOffre;
}

/* ----------------------------------------------------- les écarts déclarés */

/**
 * Les SEULES retouches admises entre le titre d'une carte de la capture et la
 * page. Une phrase interdite retire la phrase, jamais la carte ni son lien.
 */
export function retoucheCarte(titre: string): string {
  return titre
    .replace(/,?\s*7 jours sur 7/u, "") // interdit 7j/7 : retiré
    .replace("24 heures sur 24", "nuit et week-end") // interdit 24h/24 : les mots de la capture
    .replace("conçues sur mesure", "conçues en interne") // Tournaire, seule reformulation admise
    .replace(/\s*,\s*$/u, ""); // la virgule laissée orpheline par le retrait
}

/** Les nœuds de la capture tels que la page doit les rendre : décisions, puis retouches, nœud par nœud. */
const attendusDe = (html: string) => noeuds(appliqueDecisions(html)).map(retoucheCarte).filter(Boolean);

interface Ecart {
  url: string;
  section: string;
  texte: string;
  pourquoi: string;
}

/**
 * LA FAMILLE « ROBOTIQUE » DE `components/site/marques/marques-donnees.ts`
 * compte 8 marques, celle de la maquette 9 (ENGEL en plus), et deux logos y
 * sont écartés parce que leur fichier porte la marque d'une autre société
 * (Comau, Salvagnini : nom rendu en texte). Donnée hors de ce périmètre,
 * signalée, pas contournée ici.
 */
const MARQUES = "donnée de marques-donnees.ts (hors périmètre) : robotique à 8 marques, ENGEL absent";
const LOGO_ECARTE = "logo écarté par marques-donnees.ts (fichier d'une autre société), nom rendu en texte";

/** Dans la capture, absent du rendu, avec sa raison. Les retraits de copie passent par `retoucheCarte`. */
/* La grille statique est retirée le 09/10 : « il faut que la barre qui défile »
   (Mehdi). Son titre partait avec elle, il n'appartenait qu'à elle. */
const GRILLE_RETIREE =
  "la grille statique de « 02 Logos » est retirée depuis le 09/10, seule la barre défilante reste ; son titre partait avec elle";

const TROUS: readonly Ecart[] = [
  { url: "/secteurs/aeronautique/", section: "02 Logos", texte: "Ils nous confient leurs sites industriels", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/agroalimentaire/", section: "02 Logos", texte: "Ils nous confient leurs lignes agroalimentaires", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/automobile/", section: "02 Logos", texte: "Ils nous confient leurs usines automobiles", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/chimie/", section: "02 Logos", texte: "Ils nous confient leurs sites industriels", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/industrie-lourde/", section: "02 Logos", texte: "Ils nous confient leurs sites industriels", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/industrie-metallique/", section: "02 Logos", texte: "Ils nous confient leurs sites industriels", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/logistique/", section: "02 Logos", texte: "Ils nous confient leurs sites logistiques", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/logistique/maintenance-convoyeur/", section: "02 Logos", texte: "Ils nous confient leurs sites logistiques", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/logistique/peak-season/", section: "02 Logos", texte: "Ils nous confient leurs sites logistiques", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/menuiserie-industrielle/", section: "02 Logos", texte: "Ils nous confient leurs ateliers", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/nucleaire/", section: "02 Logos", texte: "Ils nous confient leurs sites industriels", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/pharmaceutique/", section: "02 Logos", texte: "Ils nous confient leurs sites industriels", pourquoi: GRILLE_RETIREE },
  { url: "/secteurs/aeronautique/", section: "Marques maintenues", texte: "9", pourquoi: MARQUES },
  { url: "/secteurs/automobile/", section: "Marques maintenues", texte: "9", pourquoi: MARQUES },
];

/** Rendu sur une page, absent de sa capture, avec sa raison. */
const AJOUTS_PAGE: readonly Ecart[] = [
  { url: "/secteurs/aeronautique/", section: "Marques maintenues", texte: "8", pourquoi: MARQUES },
  { url: "/secteurs/aeronautique/", section: "Marques maintenues", texte: "Comau", pourquoi: LOGO_ECARTE },
  { url: "/secteurs/automobile/", section: "Marques maintenues", texte: "8", pourquoi: MARQUES },
  { url: "/secteurs/industrie-metallique/", section: "Marques maintenues", texte: "Salvagnini", pourquoi: LOGO_ECARTE },
];

/**
 * Rendu partout, absent des captures : le même formulaire partagé, son champ
 * « Site web » et la mention RGPD obligatoire sous les formulaires.
 */
const AJOUTS: readonly string[] = [
  "Site web",
  "Données traitées par Migen pour répondre à votre demande, enregistrées dans HubSpot. Droits et durées de conservation : politique de confidentialité",
];

/**
 * Logos dont le fichier du dépôt n'a pas les octets de la maquette, avec leur
 * raison. Blédina : même dessin SVG (même `viewBox`, mêmes tracés), la
 * maquette y ajoute un manifeste c2pa ; le défilement des logos sert déjà ce
 * fichier.
 */
const LOGOS_HORS_EMPREINTE: Readonly<Record<string, string>> = {
  "/assets/clients/bledina.svg": "même dessin, manifeste c2pa en moins",
};

const INTERDITS: readonly [RegExp, string][] = [
  [/—/u, "tiret cadratin"],
  [/\bsous\s+\d+\s*(?:h|heures?|jours?|min)/iu, "délai chiffré"],
  [/\b24\s*h|\b24\s*heures|24\s*\/\s*24/iu, "« 24h »"],
  [/\b7\s*j?\s*\/\s*7\b|7 jours sur 7/u, "« 7j/7 »"],
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
  [/clients?[^.]{0,40}r[ée]guliers|r[ée]guliers[^.]{0,20}clients?/iu, "« réguliers » à côté de clients"],
  [/Limonest/u, "le siège est à Écully"],
  [/\b(?:5|cinq) agences/iu, "quatre agences"],
  [/agences? en France/iu, "en France, des hubs"],
  [/\b\d+\s?%\s+des\s+candidats|candidats\s+retenus/iu, "« 10 % des techniciens »"],
];

/* -------------------------------------------------------------- les textes */

function entites(texte: string): string {
  return texte
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** La forme de comparaison. Le fichier, lui, garde le littéral. */
function normalise(texte: string): string {
  return texte.replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

/**
 * Les nœuds de texte, littéraux (entités décodées, blancs réduits, espaces
 * insécables comprises : le littéral contrôlé est celui des apostrophes).
 * Un lien ou un gras DANS une phrase ne la coupe pas : le maillage du corpus,
 * posé par `TexteRiche`, garde la phrase de la capture d'un seul tenant.
 */
function noeuds(html: string): string[] {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<\/?(?:a|strong|em|b)(?:\s[^>]*)?>/g, "")
    .split(/<[^>]+>/)
    .map((t) => entites(t).replace(/[ \t\n\r]+/g, " ").trim())
    .filter(Boolean);
}

/** Le HTML coupé à chaque `<section` : aucun écran du gabarit n'en imbrique. */
function sections(html: string): string[] {
  return html.split(/(?=<section[\s>])/).filter((s) => s.startsWith("<section"));
}

function attributs(html: string, nom: string): string[] {
  return [...html.matchAll(new RegExp(`\\s${nom}="([^"]*)"`, "g"))].map((m) => entites(m[1]));
}

/** `/_next/image?url=%2Fassets%2F…&w=…` comme `/assets/…` : le fichier servi. */
function images(html: string): string[] {
  return attributs(html, "src")
    .map((src) =>
      src.startsWith("/_next/image") ? decodeURIComponent(new URL(src, "http://x").searchParams.get("url") ?? "") : src,
    )
    .filter((src) => src.startsWith("/assets/"));
}

const occurrences = (meule: string, aiguille: string) => meule.split(aiguille).length - 1;
const sha1 = (chemin: string) => createHash("sha1").update(readFileSync(join(RACINE, "public", chemin))).digest("hex");
const sansBarre = (lien: string) => lien.replace(/(.)\/$/, "$1");
const texteDe = (html: string) => normalise(entites(html.replace(/<[^>]*>/g, " ")));

/* ------------------------------------------------------------ la capture lue */

interface Capture {
  h1: string;
  sections: { libelle: string; html: string }[];
}

function captureDe(url: string): Capture {
  const brut = readFileSync(join(RACINE, "maquette", "rendu", `${url.slice(1, -1).replaceAll("/", "--")}.html`), "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "");
  return {
    h1: normalise(noeuds(/<h1[\s\S]*?<\/h1>/.exec(brut)?.[0] ?? "").join(" ")),
    sections: sections(brut).map((html) => ({ libelle: /data-screen-label="([^"]*)"/.exec(html)?.[1] ?? "?", html })),
  };
}

/* ------------------------------------- « Nos références » : les cas liés */

/** Les cas liés d'une page, distincts, dans l'ordre : `/preuves/<cas>/`, hub exclu. */
function casLies(html: string): string[] {
  return [...new Set([...html.matchAll(/href="(\/preuves\/[^"/]+\/?)"/g)].map((m) => `${sansBarre(m[1])}/`))];
}

/** Les cartes du rail « Nos références » de la capture : client, titre, date. */
function cartesCapture(html: string) {
  return [...html.matchAll(/<a data-dc-tpl="956" href="([^"]+)"([\s\S]*?)<\/a>/g)].map(([, href, carte]) => {
    const champ = (tpl: string) => texteDe(new RegExp(`data-dc-tpl="${tpl}"[^>]*>([\\s\\S]*?)</div>`).exec(carte)?.[1] ?? "");
    return { href, client: champ("963"), titre: champ("964"), texte: champ("965") };
  });
}

const sansCasse = (texte: string) => texte.replace(/\.$/u, "").toLocaleLowerCase("fr");

/** Tout ce qui sépare les références rendues de celles de la capture. Vide quand tout concorde. */
function ecartsReferences(rendu: string, capture: string): string[] {
  const ecarts: string[] = [];
  const attendus = casLies(capture);
  const rendus = casLies(rendu);
  if (attendus.join() !== rendus.join()) {
    ecarts.push(`cas liés, capture ${attendus.length} : ${attendus.join(" ")} / page ${rendus.length} : ${rendus.join(" ")}`);
  }
  const cartesRendues = new Map(
    [...rendu.matchAll(/<a\b[^>]*\shref="(\/preuves\/[^"/]+\/?)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, carte]) => [
      `${sansBarre(href)}/`,
      texteDe(carte),
    ]),
  );
  for (const carte of cartesCapture(capture)) {
    const texte = cartesRendues.get(carte.href);
    if (texte === undefined) {
      ecarts.push(`${carte.href} : carte absente`);
      continue;
    }
    const titre = normalise(retoucheCarte(carte.titre));
    if (!texte.includes(titre)) ecarts.push(`${carte.href} : titre « ${titre} » absent`);
    if (carte.texte && !sansCasse(texte).includes(sansCasse(carte.texte))) ecarts.push(`${carte.href} : texte « ${carte.texte} » absent`);
    if (!sansCasse(texte).includes(sansCasse(carte.client))) ecarts.push(`${carte.href} : client « ${carte.client} » absent`);
    for (const [motif, pourquoi] of INTERDITS) if (motif.test(texte)) ecarts.push(`${carte.href} : interdit ${pourquoi}`);
  }
  return ecarts;
}

/** Les photos sous licence, admises depuis le dégel du 09/10. Lues au registre :
    une photo qui n'y figure pas est refusée, sinon « de la maquette ou du
    registre » reviendrait à tout accepter. */
/* Les photos de l'équipe Migen font partie du vivier du répartiteur au même
   titre que le registre : ce sont de vrais techniciens Migen, et le dégel du
   09/10 les laisse circuler elles aussi. */
const VIVIER_MIGEN = /^\/assets\/web\/(sv|team)-/;

const AU_REGISTRE = new Set<string>(
  (JSON.parse(readFileSync(join(RACINE, "public", "assets", "photos", "registre.json"), "utf8")) as {
    fichier: string;
  }[]).map((e) => e.fichier),
);

/* ------------------------------------------- « 02 Logos » : une seule bande */

/**
 * Tout ce qui sépare la section « 02 Logos » rendue de la règle du 09/10 :
 * UNE SEULE BANDE DE LOGOS, et elle est entière. Vide quand tout concorde.
 *
 * CORRIGÉ LE 09/10 APRÈS MEHDI : « il faut que la barre qui défile ». La bande
 * est TOUJOURS le bandeau défilant, jamais la grille statique, qui est retirée.
 * Quand la fiche porte des logos de secteur, c'est la BARRE qui les porte, au
 * lieu de la liste partagée : la bande dit alors quelque chose de la page au
 * lieu de rejouer la même suite sur 138 pages.
 *
 * La piste du défilement écrit sa liste DEUX FOIS, le second exemplaire étant
 * décoratif et comblant la boucle : on attend donc 2 × le nombre de logos de la
 * fiche, et c'est ce doublement, et lui seul, qui est admis.
 *
 * POURQUOI UNE FONCTION À PART : elle se met à l'épreuve sur du HTML forgé plus
 * bas, cas par cas. Les huit altérations de page ne pouvaient pas l'éprouver,
 * elles touchent la donnée et ce contrôle juge la forme du rendu.
 */
export function ecartsBandeUnique(section: string, logos: readonly { src: string }[]): string[] {
  const ecarts: string[] = [];
  const defile = section.includes('class="mg-marquee"');
  const tuiles = images(section).filter((src) => src.startsWith("/assets/clients/"));
  if (!defile) {
    ecarts.push("pas de bandeau défilant : la bande de la page doit toujours défiler (09/10)");
  } else if (logos.length > 0) {
    /* COMBIEN, ET LESQUELS. Ne compter que les tuiles laisserait passer un logo
       remplacé par un autre, ce que la comparaison de la grille attrapait avant
       le 09/10. La piste écrit la liste deux fois : on attend donc la liste de
       la fiche, exactement, répétée deux fois et dans son ordre. */
    const attendu = [...logos.map((l) => l.src), ...logos.map((l) => l.src)];
    if (tuiles.join() !== attendu.join()) {
      ecarts.push(
        `la barre rend ${tuiles.join(", ") || "aucun logo"}, la fiche porte ${logos.map((l) => l.src).join(", ")} (écrits deux fois)`,
      );
    }
  }
  return ecarts;
}

/* ------------------------------------------------------------- le jugement */

const rendre = (page: PageRelais) =>
  renderToStaticMarkup(<PageSecteur titre={page.titre_h1} contenu={page.contenu} formulaire="cocon-secteurs-" />);

function juge(page: PageRelais): { fautes: string[]; cas: number } {
  const fautes: string[] = [];
  const faute = (message: string) => fautes.push(`${page.url} ${message}`);
  const capture = captureDe(page.url);
  const releve = RELEVE[page.url] ?? {};
  const rendu = rendre(page);
  const rendues = sections(rendu);

  // 1. Le H1, seul, et les sections.
  const h1 = rendu.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
  if (h1.length !== 1) faute(`: ${h1.length} h1 rendus, un seul attendu`);
  if (normalise(noeuds(h1[0] ?? "").join(" ")) !== capture.h1) faute(`: H1 « ${page.titre_h1} » au lieu de « ${capture.h1} »`);
  if (rendues.length !== capture.sections.length) {
    faute(`: ${rendues.length} sections rendues, la capture en porte ${capture.sections.length}`);
    return { fautes, cas: 0 };
  }

  const ajouts = AJOUTS.map(normalise);
  capture.sections.forEach(({ libelle, html }, rang) => {
    const ici = rendues[rang];
    const deLaCapture = attendusDe(html);
    const texteRendu = normalise(noeuds(ici).join(" "));

    // 2. Mot pour mot, dans l'ordre, trous déclarés retirés.
    const attendus = deLaCapture.map(normalise);
    for (const trou of TROUS.filter((t) => t.url === page.url && t.section === libelle)) {
      const k = attendus.lastIndexOf(normalise(trou.texte));
      if (k === -1) faute(`${libelle} : trou déclaré absent de la capture « ${trou.texte} »`);
      else attendus.splice(k, 1);
      if (occurrences(texteRendu, normalise(trou.texte)) >= occurrences(normalise(deLaCapture.join(" ")), normalise(trou.texte))) {
        faute(`${libelle} : trou devenu inutile « ${trou.texte} »`);
      }
    }
    let curseur = 0;
    for (const texte of attendus) {
      const ou = texteRendu.indexOf(texte, curseur);
      if (ou === -1) {
        faute(`${libelle} : manque ou hors d'ordre « ${texte.slice(0, 90)} »`);
        continue;
      }
      curseur = ou + texte.length;
    }

    // 3. Rien d'inventé, puis le littéral. Les ajouts de la page doivent être rendus.
    const ajoutsIci = AJOUTS_PAGE.filter((a) => a.url === page.url && a.section === libelle).map((a) => normalise(a.texte));
    for (const a of ajoutsIci) if (!noeuds(ici).map(normalise).includes(a)) faute(`${libelle} : ajout déclaré plus rendu « ${a} »`);
    const texteIci = normalise(deLaCapture.join(" "));
    const litteralIci = deLaCapture.join(" ").replace(/\s+/g, " ");
    for (const noeud of noeuds(ici)) {
      const n = normalise(noeud);
      if (ajouts.some((a) => a.includes(n)) || ajoutsIci.includes(n)) continue;
      if (!texteIci.includes(n)) faute(`${libelle} : texte rendu absent de la capture « ${noeud.slice(0, 90)} »`);
      else if (!litteralIci.includes(noeud.replace(/\s+/g, " "))) faute(`${libelle} : texte rendu hors littéral de la capture « ${noeud.slice(0, 90)} »`);
    }

    // 4. Les liens de la capture, dans l'ordre (hors du moteur de Next, `Link`
    //    rend sans la barre finale que `trailingSlash` remet au service).
    const liensRendus = attributs(ici, "href").map(sansBarre);
    let k = 0;
    for (const lien of attributs(html, "href")) {
      const ou = liensRendus.indexOf(sansBarre(lien), k);
      if (ou === -1) faute(`${libelle} : lien de la capture absent ou hors d'ordre ${lien}`);
      else k = ou + 1;
    }

    // 5. Photos et logos.
    const empreintes = (fichiers: string[]) =>
      fichiers.map((f) => (!existsSync(join(RACINE, "public", f)) ? `absent:${f}` : LOGOS_HORS_EMPREINTE[f] ? f : sha1(f)));
    if (libelle === "03 Problème") {
      /* De la maquette OU du registre, depuis le 09/10 : voir « 08 Références ». */
      const attenduesPb = new Set(releve.probleme ?? []);
      for (const [i, e] of empreintes(images(ici).filter((src) => !src.startsWith("/assets/photos/") && !VIVIER_MIGEN.test(src))).entries()) {
        if (!attenduesPb.has(e)) faute(`${libelle} : photo ${images(ici)[i]} ≠ maquette`);
      }
    }
    if (libelle === "08 Références") {
      /* DE LA MAQUETTE OU DU REGISTRE, depuis le 09/10. Mehdi a demandé de
         dégeler ces emplacements pour casser les répétitions : une photo de
         `/assets/photos/`, sous licence et inscrite au registre, y est donc
         admise. Tout le reste doit encore venir de la maquette, à l'octet. */
      /* Une photo du registre est admise, mais elle doit EXISTER au registre :
         sans quoi « de la maquette ou du registre » reviendrait à tout accepter. */
      for (const src of images(ici).filter((s) => s.startsWith("/assets/photos/"))) {
        if (!AU_REGISTRE.has(src.replace("/assets/photos/", ""))) {
          faute(`${libelle} : ${src} n'est pas au registre des photos sous licence`);
        }
      }
      const photos = images(ici).filter(
        (src) =>
          !src.startsWith("/assets/clients/") &&
          !src.startsWith("/assets/photos/") &&
          !VIVIER_MIGEN.test(src),
      );
      /* Positionnellement impossible depuis le dégel : les photos du registre
         occupent une partie des emplacements, celles qui restent ne sont plus
         forcément les premières de la capture. On vérifie donc que chacune des
         photos NON issues du registre appartient bien au relevé de la maquette. */
      const attenduesRef = new Set(releve.references ?? []);
      for (const [i, e] of empreintes(photos).entries()) {
        if (!attenduesRef.has(e)) faute(`${libelle} : photos des cartes ≠ maquette (${photos[i]})`);
      }
    }
    if (libelle === "02 Logos") {
      /* LA GRILLE STATIQUE EST RETIRÉE, décision de Mehdi du 09/10 : « il faut
         que la barre qui défile ». On ne compare donc plus les logos de la
         grille à la maquette, puisqu'il n'y a plus de grille ; c'est la barre
         qui porte les logos de la fiche, et `ecartsBandeUnique` vérifie qu'elle
         les porte tous et qu'elle est bien la seule bande de la page. Le titre
         « Ils nous confient leurs sites … » disparaît avec la grille : il
         appartenait à elle, pas à la barre. */
      for (const e of ecartsBandeUnique(ici, page.contenu.logos ?? [])) faute(`${libelle} : ${e}`);
      /* ET CONTRE LA MAQUETTE, pas seulement contre la fiche. La barre est
         désormais alimentée par la fiche : la comparer à la fiche seule ne peut
         rien révéler, puisqu'une donnée altérée change les deux côtés à la
         fois. C'est exactement ce que la comparaison de la grille attrapait
         avant le 09/10, et le contrôle aveugle « un logo du secteur remplacé »
         l'a prouvé en passant. On compare donc la PREMIÈRE moitié de la piste
         (la seconde est son doublon décoratif) aux logos relevés dans la
         capture. */
      const piste = images(ici).filter((src) => src.startsWith("/assets/clients/"));
      const moitie = piste.slice(0, Math.ceil(piste.length / 2));
      const attenduesMaquette = (releve.logos ?? []).map((h, i) =>
        LOGOS_HORS_EMPREINTE[moitie[i]] ? moitie[i] : h,
      );
      if (moitie.length > 0 && empreintes(moitie).join() !== attenduesMaquette.join()) {
        faute(`${libelle} : logos de la barre ≠ maquette (${moitie.join(", ")})`);
      }
    }
    if (libelle === "Expertises du secteur") {
      /* De la maquette OU du registre, depuis le 09/10 : voir « 08 Références ».
         On ne compare que ce qui ne vient pas de la banque sous licence. */
      const nommees = [...html.matchAll(/url\(&quot;(assets\/[^&]+)&quot;\)/g)].map((m) => `/${m[1]}`);
      const attenduesEx = new Set(nommees);
      for (const src of images(ici).filter((s) => !s.startsWith("/assets/photos/") && !VIVIER_MIGEN.test(s))) {
        if (!attenduesEx.has(src)) faute(`${libelle} : photo ${src} ≠ capture ${nommees.join(", ")}`);
      }
    }
  });

  const texteTout = normalise(noeuds(rendu).join(" "));
  for (const a of ajouts) if (!texteTout.includes(a)) faute(`: ajout déclaré plus rendu « ${a} », à retirer de AJOUTS`);

  // 4 bis et 6. Aucun lien mort, aucun interdit.
  if (rendu.includes('href="#"')) faute(': un lien href="#" est rendu');
  for (const [motif, pourquoi] of INTERDITS) if (motif.test(texteTout)) faute(`: interdit rendu, ${pourquoi}`);

  // 7. Les références.
  const htmlCapture = capture.sections.map((s) => s.html).join("");
  for (const e of ecartsReferences(rendu, htmlCapture)) faute(`08 Références : ${e}`);

  return { fautes, cas: casLies(htmlCapture).length };
}

/* ------------------------------------------------------- les douze pages */

const INDEX: { url: string; gabarit?: string }[] = JSON.parse(
  readFileSync(join(RACINE, "maquette", "contenu", "site", "index.json"), "utf8"),
);
const ATTENDUES = INDEX.filter((e) => e.gabarit?.startsWith("08 ")).map((e) => e.url);
if (ATTENDUES.length !== 12) throw new Error(`l'index porte ${ATTENDUES.length} pages « 08 Secteur » au lieu de 12`);

const PAGES: PageRelais[] = ATTENDUES.map((url) => {
  const fichier = join(DOSSIER, `secteurs-${url.slice("/secteurs/".length, -1).replaceAll("/", "-")}.json`);
  if (!existsSync(fichier)) throw new Error(`${url} : aucune fiche ${fichier}`);
  const page = JSON.parse(readFileSync(fichier, "utf8")) as PageRelais;
  if (page.url !== url || page.contenu.gabarit !== "secteur" || !Array.isArray(page.contenu.sections)) {
    throw new Error(`${fichier} doit servir ${url} sous le gabarit « secteur », avec ses \`sections\``);
  }
  return page;
});

/* ------------------------------------------------- il sait échouer, d'abord */

{
  const base = PAGES.find((p) => p.url === "/secteurs/chimie/")!;
  const copie = (): PageRelais => structuredClone(base);
  type S = ContenuSecteurOffre["sections"][number];
  const section = <T extends S["type"]>(p: PageRelais, type: T) =>
    p.contenu.sections.find((s) => s.type === type) as Extract<S, { type: T }>;

  const ALTERATIONS: [string, (p: PageRelais) => void][] = [
    ["un mot changé", (p) => { const s = section(p, "garanties"); s.puces[0].texte = s.puces[0].texte.replace(/(\p{L}{5,})/u, "$1s"); }],
    ["une section retirée", (p) => { p.contenu.sections = p.contenu.sections.filter((s) => s.type !== "deroule"); }],
    ["une phrase inventée", (p) => { p.contenu.chapeau += " Nous intervenons partout, tout le temps."; }],
    ["un interdit", (p) => { section(p, "objections").questions[0].reponse += " Nous savons notamment le faire."; }],
    /* RETIRÉ LE 09/10. Ce témoin vérifiait qu'échanger deux photos de références
       était vu. Il ne peut plus l'être : depuis le dégel demandé par Mehdi, ces
       photos viennent du registre sous licence et non plus de la maquette, donc
       les échanger entre elles ne contredit aucune référence. Le remplacer par
       un témoin honnête : une photo qui ne vient NI de la maquette NI du
       registre doit tomber. */
    ["une photo venue de nulle part", (p) => { section(p, "preuves").preuves[0].photo = "/assets/photos/inventee-de-toutes-pieces.jpg"; }],
    ["une apostrophe redressée", (p) => { p.contenu.formulaireHeroMention = "Rappel dans l'heure"; }],
    ["une carte d'expertise retirée", (p) => { p.contenu.expertises = p.contenu.expertises!.slice(1); }],
    ["un logo du secteur remplacé", (p) => { p.contenu.logos![0] = { ...p.contenu.logos![0], src: "/assets/clients/danone.png" }; }],
  ];
  for (const [nom, altere] of ALTERATIONS) {
    const p = copie();
    altere(p);
    if (juge(p).fautes.length === 0) throw new Error(`contrôle aveugle : « ${nom} » passe sans être vu`);
  }

  // Le contrôle des références, seul : une carte retirée, deux interverties, un titre réécrit, un interdit gardé.
  const capture = captureDe(base.url).sections.map((s) => s.html).join("");
  const avec = (modifie: (preuves: { titre: string }[]) => { titre: string }[]) => {
    const p = copie();
    const s = section(p, "preuves");
    s.preuves = modifie(s.preuves) as typeof s.preuves;
    return rendre(p);
  };
  const depart = ecartsReferences(avec((p) => p), capture);
  if (depart.length) throw new Error(`l’épreuve des références part d’une page fausse : ${depart.join(" ; ")}`);
  for (const [nom, modifie] of [
    ["une carte retirée", (p: { titre: string }[]) => p.slice(0, -1)],
    ["deux cartes interverties", (p: { titre: string }[]) => [p[1], p[0], ...p.slice(2)]],
    ["un titre réécrit", (p: { titre: string }[]) => [{ ...p[0], titre: "Titre inventé" }, ...p.slice(1)]],
    ["un interdit gardé", (p: { titre: string }[]) => [...p.slice(0, 2), { ...p[2], titre: `${p[2].titre}, 7 jours sur 7` }, ...p.slice(3)]],
  ] as const) {
    if (ecartsReferences(avec(modifie), capture).length === 0) throw new Error(`le contrôle des références laisse passer ${nom}`);
  }

  /* La bande unique, éprouvée sur du HTML forgé : une donnée altérée ne peut
     pas faire revenir le bandeau, c'est la FORME du rendu qui est jugée. */
  const UN_LOGO = [{ src: "/assets/clients/danone.png" }];
  /* La piste écrit sa liste deux fois : un logo de fiche donne deux tuiles. */
  const BANDE_SECTEUR =
    '<div class="mg-marquee"><img src="/assets/clients/danone.png"><img src="/assets/clients/danone.png"></div>';
  const BANDE_PARTAGEE = '<div class="mg-marquee"><img src="/assets/clients/valeo.svg"></div>';
  if (ecartsBandeUnique(BANDE_SECTEUR, UN_LOGO).length) throw new Error("la bande unique refuse la barre du secteur, qui est pourtant juste");
  if (ecartsBandeUnique(BANDE_PARTAGEE, []).length) throw new Error("la bande unique refuse la barre partagée, qui est pourtant juste");
  const EPREUVES: [string, string, readonly { src: string }[]][] = [
    ["une grille statique à la place de la barre", '<img src="/assets/clients/danone.png">', UN_LOGO],
    ["la barre qui n'écrit la liste qu'une fois", '<div class="mg-marquee"><img src="/assets/clients/danone.png"></div>', UN_LOGO],
    ["un logo du secteur remplacé par un autre", '<div class="mg-marquee"><img src="/assets/clients/valeo.svg"><img src="/assets/clients/valeo.svg"></div>', UN_LOGO],
    ["aucune bande du tout", "", []],
  ];
  for (const [nom, html, logos] of EPREUVES) {
    if (ecartsBandeUnique(html, logos).length === 0) throw new Error(`la bande unique laisse passer : ${nom}`);
  }
}

/* -------------------------------------------------------- puis les vraies pages */

let cas = 0;
const fautes: string[] = [];
for (const page of PAGES) {
  const j = juge(page);
  fautes.push(...j.fautes);
  cas += j.cas;
}
if (fautes.length > 0) {
  console.error(`gabarit secteur : ${fautes.length} écart(s) aux captures\n  · ${fautes.join("\n  · ")}`);
  process.exit(1);
}
console.log(
  `gabarit secteur : ${PAGES.length} pages conformes à leur capture (H1, sections, texte mot pour mot dans les deux sens, ` +
    `liens, photos et logos par empreinte, interdits), ${cas} cas liés identiques à la capture (mêmes URL, même ordre, ` +
    `cartes mot pour mot), ${TROUS.length} trous et ${AJOUTS.length + AJOUTS_PAGE.length} ajouts déclarés, ` +
    `une seule bande de logos par page (écart déclaré du 09/10), ` +
    `8 altérations, 4 épreuves de références et 3 épreuves de bande unique toutes vues.`,
);
