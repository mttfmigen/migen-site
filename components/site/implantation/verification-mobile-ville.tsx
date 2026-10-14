/**
 * LA PORTE DE LA COUCHE MOBILE V2 DES GABARITS 04 ET 06 (14/10).
 *
 *   bun components/site/implantation/verification-mobile-ville.tsx
 *   bun components/site/implantation/verification-mobile-ville.tsx --controle
 *
 * (bun, pas node : elle importe `PageVille` et le rend vraiment, par
 * `renderToStaticMarkup`, comme `verification-ville.tsx` à côté.)
 *
 * CE QU'ELLE PROUVE, sur le rendu RÉEL de trois pages réelles qui couvrent
 * les trois cas du gabarit : `/implantations/lyon/` (un hub, 5 enfants),
 * `/implantations/maintenance-industrielle-angers/` (une ville feuille),
 * `/implantations/lyon/rhone/` (un département, gabarit 06) :
 *
 *   1. REPLIER, JAMAIS RETIRER. Chaque texte du corpus des sections repliées
 *      (problème, offre, déroulé, garanties, références, questions, chapeau)
 *      est dans le HTML servi, replié ou non. C'est la règle numéro un de la
 *      maquette mobile, et celle que Google lit.
 *   2. LES REPLIS EXISTENT. Le panneau de formulaire du héros (`id="besoin"`)
 *      et la carte d'en-tête du déroulé (« Démarrer par l'audit ») vivent
 *      DANS un `<details>` : c'est le repli de G2 (héros à 1 850 px) et de
 *      G1 (déroulé déplié à 1 811 px sur le gabarit 06).
 *   3. LE MAILLAGE MOBILE (G5). « Dans la même rubrique · N » est rendu sur
 *      les trois pages avec EXACTEMENT les sœurs de l'index (`soeursDe`,
 *      recomptées ici), au moins 50 pour une ville feuille (la mesure du
 *      14/10 donnait ZÉRO lien entre les 66 pages villes, la maquette ~55) ;
 *      le hub porte en plus « Départements couverts · N » (`enfantsDe`) ; le
 *      département, qui était à zéro sœur, porte au moins sa ville sœur.
 *   4. LE FIL D'ARIANE (M3). `nav aria-label="Fil d'Ariane"`, « Accueil »
 *      vers `/`, « Implantations » vers `/implantations/`, le hub pour les
 *      pages imbriquées, la page courante en texte (`aria-current="page"`).
 *   5. AU-DESSUS DE 880 PX, RIEN. Fil et pastilles vivent sous
 *      `data-mobile-seulement` (masqué à 881 px et plus par `app/globals.css`,
 *      `!important`) : une fois ces sous-arbres retirés, le HTML ne porte
 *      plus ni le fil ni une seule pastille.
 *   6. LA CADENCE DE CONVERSION (ajoutée le 14/10 au soir, avec son
 *      branchement). Le photo + CTA (`#parlons-de-votre-site`) tombe entre la
 *      2e et la 3e section de contenu (offre, déroulé), le bandeau
 *      (`#une-question`) entre la 5e (références) et les questions : c'est
 *      la règle `nD` de dc.html L452-456. Et CHAQUE ancre interne de la page
 *      (`href="#x"`) a sa cible `id="x"` : le bandeau vise `#etre-rappele`,
 *      que la page pose sur son appel final puisqu'elle n'ajoute pas le
 *      rappel de la couche mobile ; sans cette cible, le bouton ne mène à
 *      rien.
 *
 * `--controle` : chaque verdict PROUVE qu'il sait refuser, sur le rendu réel
 * altéré à la main :
 *   témoin A  un texte du corpus RETIRÉ du DOM (la faute visée par
 *             « replier, jamais retirer ») ;
 *   témoin B  les boîtes de pastilles retirées (retour au zéro lien mesuré) ;
 *   témoin C  le fil d'Ariane sorti de `data-mobile-seulement` (il fuirait
 *             sur bureau, où la capture n'en dessine aucun) ;
 *   témoin D  le `<details>` du panneau de formulaire déballé (un héros qui
 *             ne se replie plus) ;
 *   témoin E  la cible `id="etre-rappele"` retirée (le bouton du bandeau ne
 *             mènerait plus nulle part) ;
 *   témoin F  le photo + CTA déplacé après le déroulé (cadence décalée) ;
 *   témoin G  la bascule du formulaire du héros rendue fermée par le serveur.
 *
 * Piège n° 3 du dépôt : jamais de `grep -c`, les comptes se font par
 * `matchAll` sur la chaîne entière.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import {
  enfantsDe,
  soeursDe,
} from "@/components/site/cocon/maillage-mobile";
import type { ContenuVille } from "@/types/implantation";

import PageVille from "./PageVille";

const RACINE = fileURLToPath(new URL("../../..", import.meta.url));
const DOSSIER = join(RACINE, "supabase", "import", "gabarits-maquette");
const CONTROLE = process.argv.includes("--controle");

interface PageRelais {
  url: string;
  titre_h1?: string;
  contenu: ContenuVille;
}

/* Les trois pages, les trois cas : hub, ville feuille, département. */
const PILOTES = [
  "implantations-lyon.json",
  "implantations-maintenance-industrielle-angers.json",
  "implantations-lyon-rhone.json",
] as const;

/* ------------------------------------------------------------- les outils */

function decode(html: string): string {
  return html
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** La forme de comparaison : sans balises, espaces unifiés, bas de casse. */
function texteNu(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " "))
    .replace(/[  ]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/** Un texte du corpus, débarrassé de sa syntaxe Markdown, prêt à comparer. */
function attendu(texte: string): string {
  return texteNu(
    texte.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, ""),
  );
}

/** L'offset est-il à l'intérieur d'un `<details>` ouvert à sa gauche ? */
function dansUnDetails(html: string, offset: number): boolean {
  let profondeur = 0;
  for (const m of html.matchAll(/<\/?details\b/g)) {
    if ((m.index ?? 0) >= offset) break;
    profondeur += m[0][1] === "/" ? -1 : 1;
  }
  return profondeur > 0;
}

/**
 * RETIRE chaque élément qui porte l'attribut, et tout son contenu,
 * imbrication comprise : même besoin que le déshabillage de
 * `verification-ville.tsx`, réécrit ici pour rester autonome.
 */
function sansLesElements(html: string, attribut: string): string {
  const marque = new RegExp(`<(\\w+)\\b[^>]*\\b${attribut}\\b[^>]*>`);
  let resultat = html;
  for (;;) {
    const m = marque.exec(resultat);
    if (!m || m.index === undefined) return resultat;
    const balise = m[1];
    const paire = new RegExp(`<\\/?${balise}\\b`, "g");
    paire.lastIndex = m.index + 1;
    let profondeur = 1;
    let fin = resultat.length;
    for (let p = paire.exec(resultat); p; p = paire.exec(resultat)) {
      profondeur += p[0][1] === "/" ? -1 : 1;
      if (profondeur === 0) {
        fin = resultat.indexOf(">", p.index) + 1;
        break;
      }
    }
    resultat = resultat.slice(0, m.index) + resultat.slice(fin);
  }
}

/* ------------------------------------------------------- le rendu réel */

function lis(nom: string): PageRelais {
  return JSON.parse(readFileSync(join(DOSSIER, nom), "utf8")) as PageRelais;
}

function rend(page: PageRelais): string {
  return renderToStaticMarkup(
    <PageVille
      titre={page.titre_h1 ?? ""}
      contenu={page.contenu}
      formulaire={`verification${page.url.replace(/\//g, "-")}`}
      chemin={page.url}
    />,
  );
}

/* --------------------------------------------------------- les verdicts */

/** 1. Chaque texte du corpus des sections repliées est encore dans le DOM. */
function textesManquants(page: PageRelais, html: string): string[] {
  const rendu = texteNu(html);
  const textes: string[] = [];
  if (page.contenu.chapeau) textes.push(page.contenu.chapeau);
  for (const section of page.contenu.sections ?? []) {
    if ("puces" in section)
      for (const puce of section.puces) {
        if (puce.accroche) textes.push(puce.accroche);
        if (puce.texte) textes.push(puce.texte);
      }
    if ("etapes" in section)
      for (const etape of section.etapes) {
        if (etape.titre) textes.push(etape.titre);
        if (etape.texte) textes.push(etape.texte);
      }
    if ("questions" in section)
      for (const q of section.questions) {
        textes.push(q.question);
        if (q.reponse) textes.push(q.reponse);
      }
    if ("preuves" in section)
      for (const preuve of section.preuves) if (preuve.titre) textes.push(preuve.titre);
  }
  return textes
    .map(attendu)
    .filter(Boolean)
    .filter((t) => !rendu.includes(t))
    .map((t) => `texte du corpus absent du DOM : « ${t.slice(0, 90)} »`);
}

/** 2. Le panneau du héros et le déroulé vivent dans un `<details>`. */
function replisAbsents(page: PageRelais, html: string): string[] {
  const ecarts: string[] = [];
  if (typeof page.contenu.formulaireHeroTitre === "string") {
    const panneau = html.indexOf('id="besoin"');
    if (panneau < 0) ecarts.push("panneau du héros introuvable (id=\"besoin\")");
    else if (!dansUnDetails(html, panneau))
      ecarts.push("le panneau de formulaire du héros n'est pas dans un <details> : il ne se replie pas (G2)");
    else {
      /* La bascule du formulaire (`RepliFormulaireMobile`) tient le contrat
         d'un bloc replié sans passer par `SectionPliableMobile` : rendue
         OUVERTE par le serveur (le bureau ne change pas), et portant une
         étiquette lisible, marquée mobile, qui est le titre du panneau. */
      const repli = /<details\b([^>]*\bdata-repli-formulaire\b[^>]*)>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(
        html,
      );
      if (!repli) ecarts.push("le panneau du héros n'est pas dans la bascule de formulaire (data-repli-formulaire)");
      else {
        if (!/\bopen(?:=""|\s|$)/.test(repli[1]))
          ecarts.push("la bascule du formulaire est rendue FERMÉE par le serveur : le panneau disparaîtrait sur bureau");
        const etiquette = /<span data-mobile-seulement=""[^>]*>([^<]+)<\/span>/.exec(repli[2])?.[1] ?? "";
        if (attendu(etiquette) !== attendu(page.contenu.formulaireHeroTitre))
          ecarts.push(`l'étiquette de la bascule n'est pas le titre du panneau : « ${etiquette} »`);
      }
    }
  }
  if ((page.contenu.sections ?? []).some((s) => s.type === "deroule")) {
    const deroule = decode(html).indexOf("Démarrer par l’audit");
    if (deroule < 0) ecarts.push("carte d'en-tête du déroulé introuvable");
    else if (!dansUnDetails(decode(html), deroule))
      ecarts.push("le déroulé n'est pas dans un <details> : il ne se replie pas (G1, 1 811 px mesurés)");
  }
  return ecarts;
}

/** 3. Le maillage mobile : sœurs partout, enfants sur le hub (G5). */
function maillageAbsent(page: PageRelais, html: string): string[] {
  const ecarts: string[] = [];
  const rendu = texteNu(html);
  const soeurs = soeursDe(page.url);
  const enfants = enfantsDe(page.url);

  if (soeurs.length > 0) {
    if (!rendu.includes(`dans la même rubrique · ${soeurs.length}`))
      ecarts.push(`« Dans la même rubrique · ${soeurs.length} » absent du rendu`);
    const absents = soeurs.filter((x) => !html.includes(`href="${x.url}"`));
    if (absents.length > 0)
      ecarts.push(`${absents.length} sœur(s) de l'index sans lien dans le DOM (ex. ${absents[0].url})`);
  }
  if (enfants.length > 0) {
    if (!rendu.includes(`départements couverts · ${enfants.length}`))
      ecarts.push(`« Départements couverts · ${enfants.length} » absent du rendu du hub`);
    const absents = enfants.filter((x) => !html.includes(`href="${x.url}"`));
    if (absents.length > 0)
      ecarts.push(`${absents.length} enfant(s) de l'index sans lien dans le DOM (ex. ${absents[0].url})`);
  }
  /* La cible de G5 : une ville feuille maille vers ses dizaines de sœurs. */
  if (page.url === "/implantations/maintenance-industrielle-angers/" && soeurs.length < 50)
    ecarts.push(`une ville feuille ne compte que ${soeurs.length} sœurs dans l'index : le calcul a changé`);
  return ecarts;
}

/**
 * 4. Le fil d'Ariane de la maquette mobile (M3).
 *
 * LES LIENS SONT COMPARÉS SANS LEUR SLASH FINAL : `FilArianeVue` passe par
 * `next/link`, qui le retire dans un rendu hors application. En production,
 * `trailingSlash` de `next.config.ts` le remet ; `verification-ville.tsx`
 * fait exactement la même concession (`sansSlash`), pour la même raison.
 */
function filAbsent(page: PageRelais, html: string): string[] {
  const ecarts: string[] = [];
  const nav = decode(html).match(/<nav aria-label="Fil d'Ariane"[\s\S]*?<\/nav>/);
  if (!nav) return [`aucun <nav aria-label="Fil d'Ariane"> dans le rendu`];
  const fil = nav[0];
  const porteLeLien = (chemin: string) =>
    fil.includes(`href="${chemin}"`) || fil.includes(`href="${chemin.replace(/\/+$/, "")}"`);
  if (!/href="\/"/.test(fil)) ecarts.push("le fil ne porte pas « Accueil » vers /");
  if (!porteLeLien("/implantations/"))
    ecarts.push("le fil ne porte pas « Implantations » vers /implantations/");
  if (page.url.split("/").filter(Boolean).length > 2) {
    const hub = `/${page.url.split("/").filter(Boolean).slice(0, 2).join("/")}/`;
    if (!porteLeLien(hub))
      ecarts.push(`le fil d'une page imbriquée ne porte pas son hub (${hub})`);
  }
  if (!fil.includes('aria-current="page"'))
    ecarts.push("la page courante du fil n'est pas marquée aria-current=\"page\"");
  return ecarts;
}

/** 5. Une fois la couche mobile retirée, le bureau n'a RIEN de nouveau. */
function fuitesBureau(html: string): string[] {
  const sansMobile = sansLesElements(html, "data-mobile-seulement");
  const ecarts: string[] = [];
  if (/aria-label="Fil d(&#x27;|')Ariane"/.test(sansMobile))
    ecarts.push("le fil d'Ariane survit au retrait de data-mobile-seulement : il fuirait sur bureau");
  if (sansMobile.includes("data-pastilles-cocon"))
    ecarts.push("une boîte de pastilles survit au retrait de data-mobile-seulement : elle fuirait sur bureau");
  return ecarts;
}

/** 6. La cadence de la maquette, et des ancres internes qui mènent quelque part. */
function cadenceFausse(html: string): string[] {
  const ecarts: string[] = [];
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const orphelines = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))].filter(
    (cible) => !ids.has(cible),
  );
  for (const cible of orphelines) ecarts.push(`ancre « #${cible} » sans cible id="${cible}" dans la page`);

  const rang = (motif: string) => decode(html).indexOf(motif);
  const photo = rang('id="parlons-de-votre-site"');
  const bandeau = rang('id="une-question"');
  const offre = rang("Ce que nous faisons, et ce que ça change pour vous");
  const deroule = rang("Démarrer par l’audit");
  const questions = rang("Vos questions avant de nous appeler");
  if (photo < 0) ecarts.push("photo + CTA absent (#parlons-de-votre-site)");
  else if (!(offre >= 0 && photo > offre && (deroule < 0 || photo < deroule)))
    ecarts.push("photo + CTA hors de sa place : après la 2e section (offre), avant la 3e (déroulé)");
  if (bandeau < 0) ecarts.push("bandeau « Être rappelé » absent (#une-question)");
  else if (deroule >= 0 && bandeau < deroule)
    ecarts.push("bandeau « Être rappelé » avant le déroulé : il suit la 5e section");
  else if (questions >= 0 && bandeau > questions)
    ecarts.push("bandeau « Être rappelé » après les questions : il suit les références");
  return ecarts;
}

function verdicts(page: PageRelais, html: string): string[] {
  return [
    ...textesManquants(page, html),
    ...replisAbsents(page, html),
    ...maillageAbsent(page, html),
    ...filAbsent(page, html),
    ...fuitesBureau(html),
    ...cadenceFausse(html),
  ];
}

/* ----------------------------------------------- les témoins (--controle) */

function controle(): number {
  const page = lis("implantations-maintenance-industrielle-angers.json");
  const html = rend(page);
  let aveugles = 0;

  /* A. Un texte du corpus retiré du DOM : « replier, jamais retirer ». */
  const deroule = (page.contenu.sections ?? []).find((s) => s.type === "deroule");
  const cible = deroule && "etapes" in deroule ? deroule.etapes[0]?.titre : undefined;
  if (!cible) {
    console.error("TÉMOIN A IMPOSSIBLE : le pilote n'a plus d'étape de déroulé");
    aveugles++;
  } else {
    const ampute = html.replaceAll(cible, "").replaceAll(decode(cible), "");
    if (textesManquants(page, ampute).length === 0) {
      console.error(`AVEUGLE : l'étape « ${cible} » retirée du DOM passe sans être vue`);
      aveugles++;
    }
  }

  /* B. Les boîtes de pastilles retirées : retour au zéro lien mesuré. */
  const sansPastilles = sansLesElements(html, "data-pastilles-cocon");
  if (maillageAbsent(page, sansPastilles).length === 0) {
    console.error("AVEUGLE : les pastilles retirées passent sans être vues");
    aveugles++;
  }

  /* C. Le fil d'Ariane sorti de data-mobile-seulement : fuite sur bureau. */
  const nav = decode(html).indexOf("Fil d'Ariane");
  const avantNav = html.slice(0, nav < 0 ? 0 : nav);
  const dernierMarqueur = avantNav.lastIndexOf(" data-mobile-seulement=\"\"");
  const fuyant =
    dernierMarqueur < 0
      ? html
      : html.slice(0, dernierMarqueur) + html.slice(dernierMarqueur + " data-mobile-seulement=\"\"".length);
  if (fuitesBureau(fuyant).length === 0) {
    console.error("AVEUGLE : un fil d'Ariane hors de data-mobile-seulement passe sans être vu");
    aveugles++;
  }

  /* D. Le <details> du panneau déballé : un héros qui ne se replie plus. */
  const deballe = html.replace(/<\/?details\b[^>]*>/g, "").replace(/<\/?summary\b[^>]*>/g, "");
  if (replisAbsents(page, deballe).length === 0) {
    console.error("AVEUGLE : un panneau de héros hors <details> passe sans être vu");
    aveugles++;
  }

  /* E. La cible du bandeau retirée : un bouton qui ne mène nulle part. */
  if (cadenceFausse(html.replace('id="etre-rappele"', "")).length === 0) {
    console.error("AVEUGLE : la cible #etre-rappele retirée passe sans être vue");
    aveugles++;
  }

  /* F. Le photo + CTA glissé après le déroulé : cadence décalée d'un cran. */
  const photo = html.match(/<section[^>]*id="parlons-de-votre-site"[\s\S]*?<\/section>/);
  const apresDeroule = decode(html).indexOf("Démarrer par l’audit");
  if (!photo || apresDeroule < 0) {
    console.error("TÉMOIN F IMPOSSIBLE : photo + CTA ou déroulé introuvable");
    aveugles++;
  } else {
    const sansPhoto = decode(html.replace(photo[0], ""));
    const fin = sansPhoto.indexOf("</section>", sansPhoto.indexOf("Démarrer par l’audit"));
    const decale = sansPhoto.slice(0, fin) + decode(photo[0]) + sansPhoto.slice(fin);
    if (cadenceFausse(decale).length === 0) {
      console.error("AVEUGLE : un photo + CTA après le déroulé passe sans être vu");
      aveugles++;
    }
  }

  /* G. La bascule du formulaire rendue FERMÉE par le serveur : sur bureau, où
     elle n'a pas de poignée, le panneau du héros disparaîtrait. */
  const fermee = html.replace(/<details open=""([^>]*\bdata-repli-formulaire\b)/, "<details$1");
  if (fermee === html) {
    console.error("TÉMOIN G IMPOSSIBLE : bascule du formulaire introuvable ou déjà fermée");
    aveugles++;
  } else if (replisAbsents(page, fermee).length === 0) {
    console.error("AVEUGLE : une bascule de formulaire fermée par le serveur passe sans être vue");
    aveugles++;
  }

  if (aveugles === 0)
    console.log(
      "preuve d'échec : les 7 témoins (texte retiré, pastilles retirées, fil fuyant, panneau déballé, cible du bandeau retirée, cadence décalée, formulaire fermé au serveur) sont tous vus.",
    );
  return aveugles;
}

/* --------------------------------------------------------------- le tour */

if (CONTROLE && controle() > 0) process.exit(1);

let enEchec = 0;
for (const nom of PILOTES) {
  const page = lis(nom);
  const ecarts = verdicts(page, rend(page));
  if (ecarts.length === 0) {
    console.log(`OK  ${nom}`);
    continue;
  }
  enEchec++;
  console.log(`KO  ${nom}`);
  for (const e of ecarts.slice(0, 10)) console.log(`      ${e}`);
}
console.log(
  `\ncouche mobile des gabarits 04 et 06 : ${PILOTES.length - enEchec}/${PILOTES.length} pilote(s) conforme(s)` +
    (CONTROLE ? ", témoins joués" : "") +
    ".",
);
if (enEchec > 0) process.exit(1);
