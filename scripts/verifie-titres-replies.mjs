/**
 * LES TITRES DES SECTIONS REPLIABLES SONT-ILS CEUX DE LEUR CAPTURE, SUR TOUS
 * LES GABARITS DU SITE ?
 *
 *   node scripts/verifie-titres-replies.mjs
 *   node scripts/verifie-titres-replies.mjs --controle     (témoin : prouve qu'elle sait échouer)
 *   SITE_URL=http://localhost:4357 node scripts/verifie-titres-replies.mjs
 *
 * Sans `SITE_URL`, elle mesure LA PRODUCTION, `https://migen-site.vercel.app`.
 * Le serveur de développement du port 4340 sert du contenu périmé depuis le
 * 07/10 (docs/PASSATION.md) : une porte qui interroge un menteur ne prouve rien.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * CE QU'ELLE COUVRE EN PLUS DE `verifie-titres-metier.mjs`
 *
 * `verifie-titres-metier.mjs` reste en place et garde son rôle : elle compare la
 * STRUCTURE ENTIÈRE des titres des 13 pages `/carriere/<métier>/` à leur
 * capture, titre par titre, dans l'ordre, un seul h1, aucun saut de niveau.
 * C'est une comparaison exhaustive, possible parce que ces 13 pages sont des
 * copies fidèles de leur capture. Ne la supprimez pas : elle attrape des choses
 * que celle-ci ne regarde pas (l'ordre, le h1, les niveaux).
 *
 * Celle-ci généralise LE DÉFAUT DU REPLI MOBILE, et lui seul, aux 233 pages qui
 * portent un bloc replié, soit dix gabarits sur onze et 1 092 blocs :
 *
 *   1. AUCUN TITRE EN DOUBLE dans un bloc replié, entre l'étiquette de la
 *      bascule et le rendu interne de la section.
 *   2. CHAQUE H2 À LA TAILLE DE SA CAPTURE, évaluée à 1 280 px, et non à
 *      l'échelle mobile de l'étiquette.
 *   3. AUCUNE MAX-WIDTH EN `ch` présente dans la capture et absente du rendu.
 *   4. AUCUNE CELLULE D'EN-TÊTE APLATIE : une piste de grille dont la capture
 *      porte un titre et dont le rendu ne porte plus rien.
 *   5. AUCUN `<summary>` FOCALISABLE AU-DESSUS DE 880 px.
 *   6. L'ÉTIQUETTE DE LA BASCULE PORTE `data-mobile-seulement`, et c'est une
 *      étiquette, pas un titre.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * POURQUOI CES SIX RÈGLES, ET PAS D'AUTRES
 *
 * Le 12/10, le repli mobile a été câblé dans sept gabarits en faisant porter à
 * la bascule le SURTITRE et le H2 déjà écrits par la section, le rendu interne
 * les taisant par un drapeau `sansEnTete`. Mesuré sur les 13 pages métier :
 * 20 titres en double, 140 H2 sur 153 servis à 30 px à 1 280 px au lieu des
 * 38,4 / 33,3 / 30,7 px de leur capture, 45 max-width de titre perdues,
 * 32 cellules d'en-tête aplaties, et 117 arrêts de tabulation muets sur bureau.
 *
 * LES DEUX PIÈGES SONT OPPOSÉS, et les deux ont été payés. Un `<span>` à la
 * place du `<h2>` retire le titre de la structure du document. Un `<h2>` dans
 * la bascule le remet dans la structure, mais à l'échelle mobile, et vide la
 * cellule de grille où il devait être. Le motif de référence ne choisit pas :
 * la bascule porte une ÉTIQUETTE `data-mobile-seulement` faite de deux `<span>`,
 * la section garde son vrai `<h2>` à sa place et à sa taille, et la bascule est
 * `display: none` au-dessus de 880 px. Voir `components/site/metier/`
 * (`PageFicheMetier.tsx` lignes 76 à 92, `FicheMetier.module.css` 189 à 222).
 *
 * Chaque règle ci-dessus mesure une des cinq conséquences, plus la marque qui
 * les prévient toutes. Une page conforme au motif les passe toutes les six ;
 * les quatre gabarits repris le 12/10 (preuve, carrière, éditorial, offre) le
 * font, et c'est ce qui a servi à calibrer cette porte.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * CE QU'ELLE NE PRÉTEND PAS MESURER
 *
 * - LE RENDU RÉEL. Elle lit le HTML servi et la feuille de style servie, pas un
 *   navigateur. Pour la règle 5, elle cherche la règle de bureau qui masque le
 *   `<summary>` et vérifie que sa classe de portée est bien sur un ANCÊTRE du
 *   bloc. Ses verdicts ont été recoupés au navigateur à 1 280 px le 12/10 sur
 *   un échantillon d'un gabarit chacun : mêmes verdicts.
 * - LES TROUS DE CONTENU AUTRES QUE LES TITRES. La règle 4 ne se déclenche que
 *   si la capture porte un TITRE dans la cellule vidée. Une carte dont le
 *   libellé est vide est un autre défaut, qui a ses propres portes : une porte
 *   qui échoue pour autre chose que son sujet finit par être désarmée.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * PIÈGES DE MESURE DÉJÀ PAYÉS DANS CE DÉPÔT, ÉVITÉS ICI
 *
 * - LE SÉPARATEUR DE BLOC au retrait des balises : sans lui, deux nœuds voisins
 *   se collent en une phrase qui n'existe nulle part.
 * - LA NORMALISATION des `&nbsp;`, `&#x27;`, `&#39;` et des apostrophes
 *   typographiques avant toute comparaison de texte.
 * - LE COMPTAGE PAR OCCURRENCE, jamais par ligne (`grep -c` compte des lignes).
 * - LE FETCH RATÉ QU'UNE PORTE AVALE : chaque adresse est redemandée une fois
 *   avant d'être déclarée muette.
 * - LA CONCLUSION SUR DONNÉES PARTIELLES : une seule page muette, une seule
 *   feuille de style muette, une seule capture manquante hors liste déclarée,
 *   et la mesure est NON CONCLUANTE. Le trou que `verifie-blocs-pliables.mjs`
 *   avait le 12/10 (240 pages tombées, 8 mesurées, verdict vert) n'est pas
 *   rouvert ici.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/* Les six mesures vivent dans un module PUR, `lecture-blocs-replies.mjs` :
   le témoin ci-dessous les exerce sur des HTML fabriqués en mémoire, sans
   réseau et sans capture, et c'est ce qui rend sa preuve d'échec possible. */
import {
  LARGEUR,
  REGLES,
  SEUIL_MOBILE,
  ecarts,
  selecteursMasquantsBureau,
} from "./lecture-blocs-replies.mjs";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const SITE = (process.env.SITE_URL ?? "https://migen-site.vercel.app").replace(/\/$/, "");
const CONTROLE = process.argv.includes("--controle");

/** Pages demandées en parallèle. Au-delà, Vercel commence à refuser. */
const LOT = 8;

/**
 * LES SIX ADRESSES SANS RÉFÉRENCE FRAÎCHE.
 *
 * La maquette les détourne elle-même (`remapOffer` dans
 * `maquette/site-final-autonome.html`), donc `scripts/capture-maquette.mjs` les
 * déclare « redirigée » et ne rafraîchit plus leur capture : cinq n'en ont
 * aucune, et celle de `/bureau-etudes/` date du 5 octobre, seule des 244 à être
 * restée en arrière. Sa FAQ y est encore à `clamp(28px,3vw,42px)` et 18ch quand
 * les 19 captures sœurs du même gabarit disent `clamp(30px,3.3vw,48px)` et 14ch,
 * comme le site. La mesurer contre elle a déjà coûté une demi-journée le 08/10
 * (69 % de faux défaut), voir la note `migen-site-remapoffer-six-adresses`.
 *
 * Elles sont donc mesurées sur les règles 1, 5 et 6, qui ne regardent que le
 * rendu servi, et écartées des règles 2, 3 et 4, qui ont besoin d'une capture.
 * L'écart est DÉCLARÉ en clair dans le rapport, jamais silencieux.
 *
 * La liste est recopiée de `scripts/capture-maquette.mjs` et VÉRIFIÉE contre
 * elle à chaque exécution : si une septième adresse y entre, cette porte s'en
 * aperçoit et refuse de mesurer plutôt que d'ignorer une page en silence.
 */
const SANS_CAPTURE_FRAICHE = [
  "/bureau-etudes/",
  "/offres/audit-conseil-maintenance/",
  "/offres/chantier/",
  "/offres/construction/",
  "/offres/depannage-industriel/",
  "/offres/retrofit/",
];


/* ═══════════════════════════════════════════════════════════════ le témoin ═ */

/* Une capture de bureau réduite, écrite dans les styles réels du dépôt : un
   en-tête de section en colonne gauche d'une grille de deux pistes, et une FAQ. */
const CAPTURE_TEMOIN = `<main class="corpsDemo">
 <section>
  <div style="display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:40px">
   <div>
    <div style="font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)">SAVOIR-FAIRE</div>
    <h2 style="font:600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft);margin:0 0 18px;max-width:18ch">Ce que fait un automaticien</h2>
   </div>
   <div><p>Le texte de la section, servi en entier.</p></div>
  </div>
 </section>
 <section>
  <h2 style="font:600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft);margin:0;max-width:26ch">Questions fréquentes</h2>
  <p>Une réponse utile au référencement.</p>
 </section>
</main>`;

/** La même page, repliée selon le motif de référence. Elle doit être ACCEPTÉE. */
const SERVI_TEMOIN = `<main class="corpsDemo">
 <section>
  <details open class="section" data-pliable-mobile="" data-en-tete-fourni="">
   <summary class="bascule">
    <span data-mobile-seulement="" class="etiquettePli">
     <span style="display:block;font:600 11px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)">SAVOIR-FAIRE</span>
     <span style="display:block;font:600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)">Ce que fait un automaticien</span>
    </span>
    <span aria-hidden="true" data-mobile-seulement="" class="chevron">&rsaquo;</span>
   </summary>
   <div class="corps">
    <div style="display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:40px">
     <div>
      <div style="font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)">SAVOIR-FAIRE</div>
      <h2 style="font:600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft);margin:0 0 18px;max-width:18ch">Ce que fait un automaticien</h2>
     </div>
     <div><p>Le texte de la section, servi en entier.</p></div>
    </div>
   </div>
  </details>
 </section>
 <section>
  <details open class="section" data-pliable-mobile="">
   <summary class="bascule">
    <span data-mobile-seulement="" class="etiquettePli">
     <span style="display:block">QUESTIONS</span>
     <span style="display:block">Questions fréquentes</span>
    </span>
   </summary>
   <div class="corps">
    <h2 style="font:600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft);margin:0;max-width:26ch">Questions fréquentes</h2>
    <p>Une réponse utile au référencement.</p>
   </div>
  </details>
 </section>
</main>`;

/** La feuille de style du motif, réduite à ce que la règle 5 vient y chercher. */
const CSS_TEMOIN = `@media (max-width:880px){.etiquettePli{display:block}}
@media (min-width:881px){.corpsDemo details[data-pliable-mobile]>summary{display:none}
.corpsDemo details[data-pliable-mobile]>summary+div{margin-top:0}}`;

/**
 * LE TÉMOIN. Sept fautes injectées dans une copie EN MÉMOIRE de la paire
 * ci-dessus, une par règle plus une variante, et un contrôle négatif : la page
 * conforme doit être acceptée.
 *
 * CHAQUE TÉMOIN DOIT FAIRE TOMBER SA RÈGLE, et les témoins marqués `seule`
 * exigent qu'AUCUNE AUTRE ne tombe. Ce n'est pas du zèle : le 12/10, un témoin
 * a été déclaré concluant alors qu'il tombait sur la règle voisine, et la règle
 * qu'il prétendait prouver n'avait jamais été exercée.
 */
function temoin() {
  const selecteursBureau = selecteursMasquantsBureau(CSS_TEMOIN);
  const lance = (servi, css = selecteursBureau) =>
    ecarts({ htmlServi: servi, htmlCapture: CAPTURE_TEMOIN, selecteursBureau: css }).fautes;
  const reglesTouchees = (fautes) =>
    new Set(
      Object.values(REGLES).filter((prefixe) => fautes.some((f) => f.startsWith(prefixe))),
    );

  const essais = [
    {
      quoi: "titre en double : la bascule porte le h2 et le rendu interne ne se tait pas",
      regle: REGLES.DOUBLE,
      seule: false /* le h2 non marqué dans la bascule déclenche aussi la règle 6, et c'est juste */,
      servi: SERVI_TEMOIN.replace(
        '<span data-mobile-seulement="" class="etiquettePli">\n     <span style="display:block">QUESTIONS</span>\n     <span style="display:block">Questions fréquentes</span>\n    </span>',
        '<h2 style="font:600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft);max-width:26ch">Questions fréquentes</h2>',
      ),
    },
    {
      quoi: "titre en double dans le seul rendu interne",
      regle: REGLES.DOUBLE,
      seule: true,
      servi: SERVI_TEMOIN.replace(
        "<p>Une réponse utile au référencement.</p>",
        '<h2 style="font:600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft);margin:0;max-width:26ch">Questions fréquentes</h2><p>Une réponse utile au référencement.</p>',
      ),
    },
    {
      quoi: "h2 servi à l'échelle mobile de l'étiquette (30 px au lieu de 38,4 px)",
      regle: REGLES.TAILLE,
      seule: true,
      servi: SERVI_TEMOIN.replace(
        'style="font:600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft);margin:0 0 18px;max-width:18ch"',
        'style="font:600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft);margin:0 0 18px;max-width:18ch"',
      ),
    },
    {
      quoi: "max-width de titre perdue (18ch dans la capture, rien dans le rendu)",
      regle: REGLES.LARGEUR,
      seule: true,
      servi: SERVI_TEMOIN.replace(
        'var(--ft);margin:0 0 18px;max-width:18ch">Ce que fait un automaticien',
        'var(--ft);margin:0 0 18px">Ce que fait un automaticien',
      ),
    },
    {
      quoi: "cellule d'en-tête aplatie (la piste reste, son titre a disparu)",
      regle: REGLES.CELLULE,
      seule: true,
      servi: SERVI_TEMOIN.replace(
        `<div>
      <div style="font:600 11.5px var(--fb);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)">SAVOIR-FAIRE</div>
      <h2 style="font:600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft);margin:0 0 18px;max-width:18ch">Ce que fait un automaticien</h2>
     </div>`,
        "<div></div>",
      ),
    },
    {
      quoi: "bascule focalisable sur bureau (aucune règle ne la masque à cette portée)",
      regle: REGLES.BASCULE,
      seule: true,
      servi: SERVI_TEMOIN,
      /* La page est intacte ; c'est la feuille de style qui ancre la règle sur
         un AUTRE gabarit. Le défaut vient donc de la portée, pas du HTML, et
         c'est exactement comme ça qu'il se produit dans le dépôt. */
      css: selecteursMasquantsBureau(CSS_TEMOIN.replace(/corpsDemo/g, "corpsAutreGabarit")),
    },
    {
      quoi: "étiquette non marquée data-mobile-seulement (elle paraît sur grand écran)",
      regle: REGLES.ETIQUETTE,
      seule: true,
      servi: SERVI_TEMOIN.replace(
        '<span data-mobile-seulement="" class="etiquettePli">\n     <span style="display:block">QUESTIONS</span>',
        '<span class="etiquettePli">\n     <span style="display:block">QUESTIONS</span>',
      ),
    },
    {
      quoi: "étiquette portant un élément de titre au lieu de span",
      regle: REGLES.ETIQUETTE,
      seule: true,
      servi: SERVI_TEMOIN.replace(
        '<span style="display:block">QUESTIONS</span>',
        "<h3>Avant de nous appeler</h3>",
      ),
    },
  ];

  const conforme = lance(SERVI_TEMOIN);
  const accepte = conforme.length === 0;
  console.log(`  ${accepte ? "OK  " : "RATE"}  une page conforme au motif est ACCEPTÉE`);
  if (!accepte) for (const f of conforme) console.log(`          refus à tort : ${f}`);

  let detectees = 0;
  for (const essai of essais) {
    if (essai.servi === SERVI_TEMOIN && !essai.css) {
      console.log(`  RATE  ${essai.quoi} (l'injection n'a rien changé au HTML)`);
      continue;
    }
    const fautes = lance(essai.servi, essai.css ?? selecteursBureau);
    const touchees = reglesTouchees(fautes);
    const bonneRegle = touchees.has(essai.regle);
    const seule = !essai.seule || touchees.size === 1;
    const ok = bonneRegle && seule;
    if (ok) detectees++;
    console.log(`  ${ok ? "OK  " : "RATE"}  ${essai.quoi}`);
    if (!bonneRegle)
      console.log(`          attendu « ${essai.regle} », obtenu : ${[...touchees].join(", ") || "rien"}`);
    else if (!seule) console.log(`          a aussi fait tomber : ${[...touchees].join(", ")}`);
  }

  console.log(
    `\ntémoin : ${detectees}/${essais.length} fautes détectées, ` +
      `${accepte ? 1 : 0}/1 page conforme acceptée.`,
  );
  return accepte && detectees === essais.length;
}

if (CONTROLE) {
  const bon = temoin();
  if (!bon) {
    console.log("\nle témoin a raté : la porte ne sait pas échouer, elle ne prouve rien.");
    process.exit(1);
  }
  console.log("la porte sait échouer sur chacune de ses six règles, et sait accepter.");
  process.exit(0);
}

/* ════════════════════════════════════════════════════════════ l'exécution ═ */

/** La liste des captures gelées doit rester celle de `capture-maquette.mjs`. */
function verifieListeGelees() {
  const source = readFileSync(join(RACINE, "scripts/capture-maquette.mjs"), "utf8");
  const bloc = source.match(/const REDIRECTIONS = \{([\s\S]*?)\};/);
  if (!bloc) return "scripts/capture-maquette.mjs ne déclare plus de table REDIRECTIONS";
  const declarees = [...bloc[1].matchAll(/"([^"]+)"\s*:/g)].map((m) => m[1]).sort();
  const nôtres = [...SANS_CAPTURE_FRAICHE].sort();
  if (declarees.join("|") !== nôtres.join("|"))
    return (
      `la liste des adresses à capture gelée a changé dans capture-maquette.mjs : ` +
      `${declarees.join(", ")} au lieu de ${nôtres.join(", ")}`
    );
  return null;
}

const desaccord = verifieListeGelees();
if (desaccord) {
  console.log(`MESURE NON CONCLUANTE : ${desaccord}.`);
  console.log("Mettre SANS_CAPTURE_FRAICHE à jour, en pesant ce que la nouvelle adresse perd comme référence.");
  process.exit(1);
}

const index = JSON.parse(readFileSync(join(RACINE, "maquette/contenu/site/index.json"), "utf8"));
const fiches = (Array.isArray(index) ? index : (index.pages ?? index)).filter((p) => p?.url);
const urls = [...new Set(fiches.map((p) => p.url))];
/* Le gabarit vient de l'index, on ne le devine pas (CLAUDE.md, section 16). Il
   ne change rien à la mesure : il sert à dire DE QUEL CÔTÉ un défaut est massif. */
const gabaritDe = new Map(fiches.map((p) => [p.url, p.gabarit ?? "gabarit non déclaré"]));

/** `/carriere/automaticien/salaire/` → `carriere--automaticien--salaire`. */
function cleCapture(url) {
  return url.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "index";
}

/** Une adresse, deux essais : un fetch raté avalé fait chuter les chiffres sans
 *  rien dire, et ce piège a déjà été payé sur ce dépôt. */
async function lis(chemin) {
  let dernier = "?";
  for (let essai = 0; essai < 2; essai++) {
    try {
      const r = await fetch(SITE + chemin, { signal: AbortSignal.timeout(45000) });
      if (r.ok) return { texte: await r.text() };
      dernier = `HTTP ${r.status}`;
    } catch (e) {
      dernier = e?.cause?.code ?? e?.name ?? "injoignable";
    }
  }
  return { erreur: dernier };
}

/** Les feuilles de style ne sont lues qu'une fois : le site n'en sert que trois. */
const cssLues = new Map();
async function selecteursDeLaPage(html) {
  const liens = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const selecteurs = [];
  for (const lien of liens) {
    if (!cssLues.has(lien)) {
      const { texte, erreur } = await lis(lien);
      cssLues.set(lien, erreur ? { erreur } : { selecteurs: selecteursMasquantsBureau(texte) });
    }
    const lue = cssLues.get(lien);
    if (lue.erreur) return { erreur: `${lien} : ${lue.erreur}` };
    selecteurs.push(...lue.selecteurs);
  }
  for (const style of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g))
    selecteurs.push(...selecteursMasquantsBureau(style[1]));
  return { selecteurs, feuilles: liens.length };
}

const muettes = [];
const nonMesurables = [];
const gelees = [];
const resultats = [];
let pagesSansBloc = 0;

for (let i = 0; i < urls.length; i += LOT) {
  const lot = await Promise.all(
    urls.slice(i, i + LOT).map(async (url) => {
      const { texte: html, erreur } = await lis(url);
      if (erreur) return { url, muette: erreur };
      if (!/data-pliable-mobile/.test(html)) return { url, sansBloc: true };
      const { selecteurs, erreur: erreurCss } = await selecteursDeLaPage(html);
      if (erreurCss) return { url, muette: `feuille de style ${erreurCss}` };
      const chemin = join(RACINE, "maquette/rendu", `${cleCapture(url)}.html`);
      const gelee = SANS_CAPTURE_FRAICHE.includes(url);
      if (!existsSync(chemin) && !gelee)
        return { url, nonMesurable: `aucune capture maquette/rendu/${cleCapture(url)}.html` };
      const htmlCapture = gelee || !existsSync(chemin) ? null : readFileSync(chemin, "utf8");
      return { url, gelee, ...ecarts({ htmlServi: html, htmlCapture, selecteursBureau: selecteurs }) };
    }),
  );
  for (const r of lot) {
    if (r.muette) muettes.push(`${r.url} : ${r.muette}`);
    else if (r.nonMesurable) nonMesurables.push(`${r.url} : ${r.nonMesurable}`);
    else if (r.sansBloc) pagesSansBloc++;
    else {
      resultats.push(r);
      if (r.gelee) gelees.push(r.url);
    }
  }
}

/* LE VERDICT DE COUVERTURE PASSE AVANT TOUT AUTRE. Compter des titres sur un
   échantillon muet n'a pas de sens, et un vert obtenu ainsi est un mensonge. */
if (muettes.length > 0 || nonMesurables.length > 0) {
  console.log(
    `MESURE NON CONCLUANTE : ${muettes.length} page(s) ou feuille(s) muette(s) et ` +
      `${nonMesurables.length} page(s) sans référence sur ${urls.length} adresses (${SITE}).`,
  );
  for (const m of [...muettes, ...nonMesurables].slice(0, 12)) console.log(`  ${m}`);
  if (muettes.length + nonMesurables.length > 12)
    console.log(`  … et ${muettes.length + nonMesurables.length - 12} autres`);
  console.log(`\nLes ${urls.length} adresses doivent répondre pour que le compte vaille quelque chose.`);
  process.exit(1);
}

const sansTaille = resultats.reduce((n, r) => n + (r.sansTaille ?? 0), 0);
if (sansTaille > 0) {
  console.log(
    `MESURE NON CONCLUANTE : ${sansTaille} h2 servi(s) ne déclarent aucune taille en ligne, ` +
      `la règle 2 ne peut pas les juger sans navigateur.`,
  );
  console.log("Déclarer la taille en ligne comme la capture, ou mesurer ces pages au navigateur.");
  process.exit(1);
}

const blocs = resultats.reduce((n, r) => n + r.blocs, 0);
if (blocs === 0) {
  console.log("aucun bloc repliable servi sur le site : rien à mesurer.");
  process.exit(1);
}

const enFaute = resultats.filter((r) => r.fautes.length > 0);
for (const r of enFaute.slice(0, 20)) {
  console.log(`\n${r.url}`);
  for (const f of r.fautes.slice(0, 6)) console.log(`   ${f}`);
  if (r.fautes.length > 6) console.log(`   … et ${r.fautes.length - 6} autres sur cette page`);
}
if (enFaute.length > 20) console.log(`\n… et ${enFaute.length - 20} autres pages en faute`);

const parRegle = Object.fromEntries(
  Object.entries(REGLES).map(([nom, prefixe]) => [
    nom,
    resultats.reduce((n, r) => n + r.fautes.filter((f) => f.startsWith(prefixe)).length, 0),
  ]),
);
const juges = resultats.reduce((n, r) => n + (r.juges ?? 0), 0);
const sansJumeau = resultats.reduce((n, r) => n + (r.sansJumeau ?? 0), 0);

/* CE QUI EST ÉCARTÉ EST DÉCLARÉ, JAMAIS TU : les adresses sans capture
   fraîche sont nommées, avec les règles qu'elles n'ont pas pu passer. */
if (gelees.length > 0)
  console.log(
    `\n${gelees.length} adresse(s) à capture gelée (remapOffer), mesurées sur les règles 1, 5 et 6, ` +
      `écartées des règles 2, 3 et 4 : ${gelees.join(", ")}`,
  );

if (enFaute.length > 0) {
  console.log(
    `\n${Object.entries(parRegle)
      .map(([nom, n]) => `${nom.toLowerCase()} ${n}`)
      .join(", ")}`,
  );
  /* PAR GABARIT, parce qu'un défaut de repli est toujours celui d'un composant
     partagé : savoir qu'il pèse 221 blocs sur « 01 Article et fiche » désigne
     le composant à reprendre bien plus vite qu'une liste de 175 adresses. */
  const parGabarit = new Map();
  for (const r of enFaute) {
    const cle = gabaritDe.get(r.url) ?? "gabarit inconnu";
    const vu = parGabarit.get(cle) ?? { pages: 0, fautes: 0 };
    parGabarit.set(cle, { pages: vu.pages + 1, fautes: vu.fautes + r.fautes.length });
  }
  for (const [cle, v] of [...parGabarit].sort((a, b) => b[1].fautes - a[1].fautes))
    console.log(`  ${String(v.fautes).padStart(5)} défauts sur ${String(v.pages).padStart(3)} pages   ${cle}`);
  console.log(
    `${enFaute.reduce((n, r) => n + r.fautes.length, 0)} défaut(s) sur ${blocs} bloc(s) repliable(s), ` +
      `${enFaute.length} des ${resultats.length} pages qui en portent (${SITE}).`,
  );
  process.exit(1);
}

console.log(
  `titres des sections repliables conformes : ${resultats.length} pages, ${blocs} blocs repliables, ` +
    `${juges} h2 comparés à la taille de leur capture à ${LARGEUR} px, aucun titre en double, ` +
    `aucune max-width perdue, aucune cellule d'en-tête aplatie, aucune bascule focalisable au-dessus de ` +
    `${SEUIL_MOBILE} px, toutes les étiquettes marquées data-mobile-seulement.`,
);
console.log(
  `(${pagesSansBloc} pages sans bloc repliable, non concernées ; ${sansJumeau} h2 servis sans jumeau ` +
    `de même texte dans leur capture, non jugés sur la taille ici : c'est le rôle des portes de fidélité.)`,
);
