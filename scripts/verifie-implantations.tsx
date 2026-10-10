/**
 * Contrôle du hub `/implantations/` contre SA capture, sans navigateur.
 *
 *   bun scripts/verifie-implantations.tsx
 *
 * La donnée : `supabase/import/gabarits-maquette/implantations.json`, celle
 * que l'import REST écrira en base. Le rendu : `PageImplantations` par
 * `renderToStaticMarkup`. La référence : `maquette/rendu/implantations.html`.
 *
 *  1. LA FORME : clés connues du type, aucune faute de frappe muette.
 *  2. LE H1 du fichier est celui de la capture, un seul H1 rendu.
 *  3. MOT POUR MOT, DANS L'ORDRE, sur texte normalisé, sauf les `trous`.
 *  4. RIEN D'INVENTÉ, puis LE LITTÉRAL (insécables, apostrophes) compté.
 *  5. LES TROUS SONT VRAIS : dans la capture, absents du rendu.
 *  6. LES LIENS sont ceux de la capture, aucun `href="#"`.
 *  7. LES INTERDITS du contrat sont absents du rendu, et « +200 », que la
 *     capture porte dans « 01 Chiffres », est rendu (l'ancienne exception
 *     « bande non portée » est tombée avec le portage du 08/10).
 *  8. LE DESSIN de « Nos villes » (styles relevés dans la capture, relus à
 *     chaque passage) et ses SURVOLS (classes du module CSS posées).
 *  9. LES QUESTIONS se replient en accordéon exclusif, la première ouverte.
 * 10. LE RELAIS : avec l'ANCIEN contenu que la base porte encore, la page rend
 *     quand même le fichier (voir le `ponytail:` de `PageImplantations`).
 *
 * IL PROUVE QU'IL SAIT ÉCHOUER : onze altérations, chacune doit être vue.
 */

import { existsSync, readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";

import PageImplantations from "@/components/site/implantations/PageImplantations";
import { appliqueDecisions } from "@/lib/decisions-copie";
import { estImplantations, type ContenuImplantations } from "@/types/implantations";

const SOURCE = "supabase/import/gabarits-maquette/implantations.json";
/** Décisions de copie appliquées (lib/decisions-copie.ts) : la donnée les porte. */
const CAPTURE = appliqueDecisions(readFileSync("maquette/rendu/implantations.html", "utf8"));
const CSS = readFileSync("components/site/implantations/PageImplantations.module.css", "utf8");
const SOURCE_VILLES = readFileSync("components/site/implantations/NosVilles.tsx", "utf8");

/** Les `style-hover` de « Nos villes » (`hubGroups`, `roamRegions`), et les bases déplacées du style en ligne vers le module. */
const SURVOLS: [string, string[]][] = [
  [".hub:hover", ["filter: brightness(1.15)", "color: #fff"]],
  [".zone {", ["border: 1px solid var(--line)", "color: var(--ink1)"]],
  [".zone:hover", ["border-color: #ff7c3c", "color: var(--ink)"]],
  [".ville {", ["color: var(--ink1)"]],
  [".ville:hover", ["color: #ff7c3c"]],
];

interface Page {
  url: string;
  titre_h1: string;
  contenu: ContenuImplantations;
  trous: { ligne: string; pourquoi: string }[];
}

/* ------------------------------------------------------------------ textes */

const entites = (t: string, nbsp: string) =>
  t
    .replace(/&nbsp;|&#160;/g, nbsp)
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
/**
 * LES ASTÉRISQUES DE MARKDOWN SONT RETIRÉES DES DEUX CÔTÉS, et c'est une
 * correction du 09/10. La capture de cette page affiche du markdown BRUT dans
 * sa foire aux questions : « …avant signature. **Nous avons déjà un
 * prestataire sous contrat.** Nous démarrons alors… ». C'est l'un des
 * bloquants relevés par l'audit de Nathan Jorez, corrigé sur le site, qui rend
 * le gras au lieu de montrer ses marqueurs.
 *
 * La comparaison littérale exigeait donc du site qu'il reproduise la faute :
 * elle rendait « absent du rendu » sur une réponse pourtant servie mot pour
 * mot. Les marqueurs partent des deux côtés, et seul le texte est comparé.
 */
const sansMarqueursMarkdown = (t: string) => t.replace(/\*\*(.+?)\*\*/gu, "$1").replace(/(?<![\w*])\*(?![\s*])(.+?)(?<![\s*])\*(?![\w*])/gu, "$1");
const normalise = (t: string) =>
  sansMarqueursMarkdown(t.replace(/[  ]/g, " ").replace(/[’‘]/g, "'")).replace(/\s+/g, " ").trim();
/* CE QUE LE VISITEUR DE BUREAU NE VOIT PAS N'A RIEN À FAIRE DANS UNE
   COMPARAISON À LA CAPTURE DE BUREAU. Les éléments marqués
   `data-mobile-seulement` sont masqués au-dessus de 880 px : le chevron et le
   résumé d'un bloc replié, posés le 09/10 au soir. Sans ce retrait, la porte
   signalait « texte rendu absent de la capture : « › » » sur un ornement que
   la capture n'avait aucune raison de porter. */
const sansMobileSeulement = (html: string) =>
  html.replace(/<(\w+)\b[^>]*\bdata-mobile-seulement\b[^>]*>[\s\S]*?<\/\1>/g, " ");
const morceaux = (html: string) =>
  sansMobileSeulement(html).replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ").split(/<[^>]+>/);
const noeuds = (html: string) => morceaux(html).map((t) => normalise(entites(t, " "))).filter(Boolean);
const litteraux = (html: string) =>
  morceaux(html).map((t) => entites(t, " ").replace(/[ \t\n\r]+/g, " ").trim()).filter(Boolean);
/** `next/link` rendu hors de Next retire le slash final : on compare sans lui. */
const hrefs = (html: string) =>
  [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => entites(m[1], " ").replace(/\/+$/, "") || "/");
const style = (t: string) => t.replace(/\s*([:;,])\s*/g, "$1").replace(/\b0px\b/g, "0").replace(/\b0\.(\d)/g, ".$1");

/** Les deux écarts du formulaire partagé, déclarés dans `offre/PanneauFormulaire.tsx`, retirés des deux côtés.
 * Le bouton d'envoi n'en est plus un depuis le 08/10 : il répète le titre du panneau, comme la capture. */
const sansEcartsFormulaire = (html: string) =>
  html.replace(/<form\b[\s\S]*?<\/form>/g, (f) =>
    f
      .replace(/<div aria-hidden="true"[^>]*><label[^>]*>Site web<\/label>[\s\S]*?<\/div>/g, "")
      .replace(/<p[^>]*>Données traitées par Migen[\s\S]*?<\/p>/g, ""),
  );

/** `offre/Reassurance.tsx` écrit « 10 % » en espace simple, la capture en insécable : hors périmètre, toléré une fois. */
const TOLERES = new Map([["10 %", 1]]);

const INTERDITS: [RegExp, string][] = [
  [/[—–]/u, "tiret cadratin"],
  [/\bsous\s+\d/u, "délai chiffré"],
  [/\b24\s*h(?![\p{L}\d]|\s*\/)/u, "« 24h »"],
  [/\b7\s*j?\s*\/\s*7\b/u, "« 7j/7 »"],
  [/\btaux horaire/iu, "taux horaire : aucun prix"],
  [/\btarifs?\b/iu, "tarif : aucun prix"],
  [/\d[\d\s  ]*(?:€|euros?\b)/u, "montant"],
  [/régie|intérim|mise à disposition|sans engagement|clé en main|sur mesure|\blevier|concrètement|notamment|incontournable|découvrez/iu, "vocabulaire proscrit"],
  [/\b(?:5|cinq) agences/iu, "quatre agences"],
  [/\b(?:clients|80)\s+r[ée]guliers\b/iu, "« +200 clients », jamais « réguliers »"],
  /* PLUS D'INTERDIT SUR « Limonest », ET C'EST UNE CORRECTION DU 09/10.
     Cette porte refusait le mot, au motif que le siège serait à Écully. La
     décision de Mehdi du 09/10 dit l'inverse, « le siège est à Limonest,
     l'agence est à Écully », et elle REVIENT à la maquette : la capture de
     cette page écrit « Agences, Lyon (siège à Limonest et bureaux à Écully) ».
     La règle interdisait donc le texte de la référence. C'est l'inverse qui
     est devenu l'interdit, juste en dessous. */
  [/si[èe]ge\s+(?:social\s+)?[àa]\s+[ÉE]cully/iu, "le siège est à Limonest, Écully est l'agence (décision du 09/10)"],
  [/postuler sur Teamtailor/iu, "« postuler sur Teamtailor »"],
];

/** Relevés dans la capture, section « Nos villes » : chacun doit y être ET dans le rendu. */
const DESSIN_VILLES = [
  "font: 600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft); letter-spacing: -0.04em; margin: 0px 0px 10px; max-width: 24ch",
  "grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px",
  "border-radius: calc(var(--rad) - 6px); background: var(--panel)",
  "height: 36px; padding: 0px 13px; border-radius: 999px",
  "font: 600 calc(clamp(22px,2.3vw,30px) * var(--ts))/1.15 var(--ft)",
  "grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px",
  "border-radius: var(--rad-s); background: rgb(255, 255, 255); border: 1px solid var(--line); padding: 20px 22px 18px",
  "width: 5px; height: 5px; border-radius: 999px; background: rgb(255, 124, 60)",
];
/** React écrit `#fff` / `#ff7c3c`, la capture les sérialise en `rgb()`. */
const couleurs = (t: string) => t.replace(/#fff\b/g, "rgb(255, 255, 255)").replace(/#ff7c3c/g, "rgb(255, 124, 60)");

/**
 * Les photos de « 08 Références », relevées le 08/10 dans la maquette qui
 * tourne : la capture ne les montre pas (`blob:`), leurs octets ont été lus
 * dans le cadre et comparés pixel à pixel à `public/assets/web/` (écart moyen
 * 0,1 à 0,2 sur 255, le suivant au-delà de 160). Ce n'est PAS la règle
 * `PH(md)` des villes : sur le hub, elle aurait donné des photos fausses.
 */
const PHOTOS_REFERENCES = ["mq-1ef16ef335a6", "mq-e6322efcd358", "x-elec-cablage", "mq-2a6115ec9fe0", "mq-29ebb1b81ced", "mq-17e2f3bce95f"].map(
  (n) => `/assets/web/${n}.jpg`,
);

/* ------------------------------------------------------------------ forme */

const CLES = ["gabarit", "pastille", "chapeau", "actions", "mention", "appelBouton", "formulaireHeroTitre",
  "formulaireHeroMention", "chiffres", "brefBande", "brefBouton", "brefMention", "sections", "villes"];

function forme(page: Page): string[] {
  const e: string[] = [];
  if (page.url !== "/implantations/") e.push(`url « ${page.url} »`);
  if (!estImplantations(page.contenu)) e.push("contenu.gabarit doit valoir « implantations »");
  for (const k of Object.keys(page.contenu)) if (!CLES.includes(k)) e.push(`clé « ${k} » inconnue du type`);
  for (const t of page.trous) if (!t.ligne || !t.pourquoi) e.push("un trou sans ligne ou sans raison");
  return e;
}

/* --------------------------------------------------------------- contrôle */

const rend = (titre: string, contenu: ContenuImplantations) =>
  renderToStaticMarkup(<PageImplantations titre={titre} contenu={contenu} formulaire="verification-implantations" />);

function controle(page: Page, htmlBrut: string, css = CSS): string[] {
  const capture = sansEcartsFormulaire(CAPTURE);
  const html = sansEcartsFormulaire(htmlBrut);
  const e = forme(page);
  const trous = page.trous.map((t) => normalise(t.ligne));

  const h1 = normalise(entites((capture.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1]?.replace(/<[^>]+>/g, "") ?? "", " "));
  if (normalise(page.titre_h1) !== h1) e.push(`H1 « ${page.titre_h1} » au lieu de « ${h1} »`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) e.push("le rendu ne porte pas exactement un h1");

  const nCapture = noeuds(capture);
  const texteCapture = nCapture.join(" ");
  const texteRendu = noeuds(html).join(" ");

  for (const t of trous) {
    if (!texteCapture.includes(t)) e.push(`trou absent de la capture : « ${t.slice(0, 90)} »`);
    if (texteRendu.includes(t)) e.push(`trou déclaré mais rendu : « ${t.slice(0, 90)} »`);
  }

  // Un trou peut couvrir plusieurs nœuds (la valeur « 4 » et son libellé) :
  // les nœuds qu'il contient entièrement sont sautés, les autres amputés.
  const spans = trous.map((t) => [texteCapture.indexOf(t), texteCapture.indexOf(t) + t.length]);
  let curseur = 0;
  let debutNoeud = 0;
  for (const brut of nCapture) {
    const [s, f] = [debutNoeud, debutNoeud + brut.length];
    debutNoeud = f + 1;
    if (spans.some(([a, b]) => a >= 0 && s >= a && f <= b)) continue;
    const attendu = normalise(trous.reduce((x, t) => x.split(t).join(""), brut));
    if (!attendu) continue;
    const i = texteRendu.indexOf(attendu, curseur);
    if (i < 0) {
      e.push(`${texteRendu.includes(attendu) ? "hors de son ordre" : "absent du rendu"} : « ${attendu.slice(0, 110)} »`);
      continue;
    }
    curseur = i + attendu.length;
  }

  for (const n of noeuds(html)) if (!texteCapture.includes(n)) e.push(`texte rendu absent de la capture : « ${n.slice(0, 110)} »`);
  const lCapture = litteraux(capture).join(" ");
  const lRendu = litteraux(html).join(" ");
  const compte = (t: string, m: string) => t.split(m).length - 1;
  for (const n of new Set(litteraux(html))) {
    if (texteCapture.includes(normalise(n)) && compte(lRendu, n) - (TOLERES.get(n) ?? 0) > compte(lCapture, n))
      e.push(`littéral différent de la capture : « ${n.slice(0, 110)} »`);
  }

  if (/href="#"/.test(html)) e.push('un href="#" est rendu');
  const liens = new Set(hrefs(capture));
  for (const h of new Set(hrefs(html))) if (!liens.has(h)) e.push(`lien absent de la capture : ${h}`);

  for (const [motif, raison] of INTERDITS) {
    const m = texteRendu.match(motif);
    if (m) e.push(`interdit rendu (${raison}) : « ${m[0]} »`);
  }
  if (texteCapture.includes("+200") && !texteRendu.includes("+200")) e.push("« +200 » est dans la capture, pas dans le rendu");

  const debut = capture.indexOf('data-screen-label="Nos villes"');
  const villesCapture = style(capture.slice(debut, capture.indexOf("data-screen-label=", debut + 1)));
  const styleRendu = style(couleurs(html));
  for (const f of DESSIN_VILLES.map(style)) {
    if (!villesCapture.includes(f)) e.push(`la capture ne porte plus « ${f} » : valeur à relever`);
    else if (!styleRendu.includes(f)) e.push(`dessin de « Nos villes » absent du rendu : « ${f} »`);
  }
  // Les survols : bun ne résout pas les modules CSS (l'import rend le chemin
  // du fichier, aucune classe ne sort au rendu), donc on lit les règles dans
  // le module et leur pose dans la source. Valeurs des `style-hover` de `MigenExpertise.dc.html`.
  for (const [selecteur, attendus] of SURVOLS) {
    const i = css.indexOf(selecteur);
    const bloc = i < 0 ? "" : css.slice(css.indexOf("{", i), css.indexOf("}", i));
    for (const a of attendus) if (!bloc.includes(a)) e.push(`survol : « ${a} » absent de « ${selecteur} » (PageImplantations.module.css)`);
  }
  for (const cle of ["hub", "zone", "ville"])
    if (!SOURCE_VILLES.includes(`className={styles.${cle}}`)) e.push(`survol « ${cle} » non posé dans NosVilles.tsx`);

  /* LES QUESTIONS DE LA FOIRE AUX QUESTIONS, ET ELLES SEULES. Ce relevé
     prenait TOUS les `<details>` de la page, et le 09/10 au soir le motif
     « Blocs communs (pliables) » de la maquette mobile en a ajouté un, qui
     n'est pas une question : la porte a compté 6 questions au lieu de 5,
     réclamé un `name` partagé qu'un bloc replié n'a pas, et refusé qu'il soit
     ouvert. Trois écarts pour un seul malentendu. Les blocs repliables se
     reconnaissent à leur `data-pliable-mobile` et sont écartés d'ici ; ils ont
     leur propre porte, `scripts/verifie-blocs-pliables.mjs`. */
  const plis = [...html.matchAll(/<details\b([^>]*)>/g)]
    .map((m) => m[1])
    .filter((attributs) => !/\bdata-pliable-mobile\b/.test(attributs));
  if (plis.length !== (capture.match(/<details\b/g) ?? []).length) e.push(`${plis.length} question(s) repliable(s), la capture en a ${(capture.match(/<details\b/g) ?? []).length}`);
  if (new Set(plis.map((a) => (a.match(/\sname="([^"]*)"/) ?? [])[1] ?? "")).size !== 1) e.push("les questions ne partagent pas un même `name`");
  if (plis.map((a, i) => (/\sopen(?:=""|\s|$)/.test(a) ? i : -1)).filter((i) => i >= 0).join() !== "0") e.push("seule la première question doit être ouverte");

  const preuves = page.contenu.sections?.find((x) => x.type === "preuves");
  const photos = preuves?.type === "preuves" ? preuves.preuves.map((x) => x.photo) : [];
  /* LES PHOTOS : LE RELEVÉ DE LA MAQUETTE, OU LE REGISTRE SOUS LICENCE.
     Correction du 09/10, la même que celle déjà posée sur les gabarits preuve,
     spécialité, domaine, ville et secteur. La répartition du 09/10 a remplacé
     les photos de calage de la maquette par des photos du registre : exiger le
     relevé à l'octet près revenait à exiger le défaut que cette répartition
     répare. Ce qui reste refusé, et c'est tout l'objet, c'est une photo
     DEVINÉE : un chemin qui n'est ni au relevé ni au registre. La preuve
     d'échec « une photo devinée » pose justement `/assets/web/x-tech-portrait.jpg`,
     qui n'est dans aucun des deux. */
  const auRegistre = new Set(
    (JSON.parse(readFileSync("public/assets/photos/registre.json", "utf8")) as { fichier: string }[]).map(
      (p) => `/assets/photos/${p.fichier}`,
    ),
  );
  /* `photo` est facultative dans le type : une carte de référence sans photo
     est un défaut en soi, et elle est nommée au lieu d'être filtrée en
     silence. Les autres sont comparées au relevé puis au registre. */
  const sansPhoto = photos.filter((p) => !p).length;
  if (sansPhoto > 0) e.push(`${sansPhoto} carte(s) de référence sans photo`);
  const devinees = photos
    .filter((p): p is string => typeof p === "string")
    .filter((p) => !PHOTOS_REFERENCES.includes(p) && !auRegistre.has(p));
  if (devinees.length > 0) {
    e.push(`photos des références devinées, ni au relevé de la maquette ni au registre : [${devinees.join(", ")}]`);
  }
  for (const photo of JSON.stringify(page.contenu).match(/"\/assets\/[^"]+"/g) ?? [])
    if (!existsSync(`public${photo.slice(1, -1)}`)) e.push(`photo absente de public/ : ${photo}`);

  return e;
}

/* --------------------------------------------------- la preuve d'échec */

const page = JSON.parse(readFileSync(SOURCE, "utf8")) as Page;
const altere = (f: (p: Page) => void) => {
  const p = structuredClone(page);
  f(p);
  return p;
};
const sections = (p: Page) => p.contenu.sections!;

type Retouche = (x: { html: string; css: string }) => { html: string; css: string };
const ALTERATIONS: [string, Page, RegExp, Retouche?][] = [
  ["un mot changé", altere((p) => { const q = sections(p).find((s) => s.type === "objections"); if (q?.type === "objections") q.questions[0].reponse = q.questions[0].reponse.replace("Oui", "Si"); }), /absent du rendu/],
  ["« Nos villes » retiré", altere((p) => delete p.contenu.villes), /absent du rendu : « Sept hubs/],
  ["une phrase inventée", altere((p) => (p.contenu.chapeau += " Nos techniciens sont les meilleurs.")), /texte rendu absent de la capture/],
  ["la bande de chiffres de l'ancien dessin", altere((p) => (p.contenu.chiffres = [{ valeur: "4", libelle: "agences" }, { valeur: "1 h", libelle: "pour un premier rappel" }])), /« \+200 » est dans la capture/],
  ["le siège déplacé à Écully, contre la décision du 09/10", altere((p) => (p.contenu.chiffres![0].libelle = "Agences, Lyon (siège à Écully), Montréal, Dubaï, Madrid")), /interdit rendu \(le siège est à Limonest/],
  ["« candidats » remis là où la décision dit « techniciens »", altere((p) => (p.contenu = JSON.parse(JSON.stringify(p.contenu).replaceAll("techniciens retenus", "candidats retenus")))), /texte rendu absent de la capture/],
  ["un faux trou", altere((p) => p.trous.push({ ligne: "Hub", pourquoi: "essai" })), /trou déclaré mais rendu/],
  ["un lien inventé", altere((p) => (p.contenu.villes!.hubs[0].href = "/implantations/villeurbanne/")), /lien absent de la capture/],
  ["une apostrophe redressée", altere((p) => (p.contenu.formulaireHeroMention = "Rappel dans l'heure")), /littéral différent/],
  ["une photo devinée", altere((p) => { const r = sections(p).find((x) => x.type === "preuves"); if (r?.type === "preuves") r.preuves[0].photo = "/assets/web/x-tech-portrait.jpg"; }), /photos des références/],
  ["un survol perdu", page, /« border-color: #ff7c3c » absent/, (x) => ({ ...x, css: x.css.replace("border-color: #ff7c3c", "") })],
];

let aveugle = false;
for (const [nom, p, attendu, retouche] of ALTERATIONS) {
  const x = (retouche ?? ((y) => y))({ html: rend(p.titre_h1, p.contenu), css: CSS });
  if (!controle(p, x.html, x.css).some((y) => attendu.test(y))) {
    aveugle = true;
    console.error(`CONTRÔLE AVEUGLE : « ${nom} » passe sans être vue.`);
  }
}
if (aveugle) process.exit(1);
console.log(`preuve d'échec : les ${ALTERATIONS.length} altérations sont toutes vues.`);

/* ------------------------------------------------------------- verdict */

const ecarts = controle(page, rend(page.titre_h1, page.contenu));

if (ecarts.length) {
  console.log(`KO  /implantations/  ${ecarts.length} écart(s)`);
  for (const x of ecarts) console.log(`      ${x}`);
  process.exit(1);
}
console.log(`OK  /implantations/ conforme à sa capture (${page.trous.length} trou(s) déclaré(s))`);
