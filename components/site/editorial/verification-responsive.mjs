/**
 * LA FAMILLE ÉDITORIALE TIENT-ELLE SUR UN TÉLÉPHONE ?
 *
 *   node components/site/editorial/verification-responsive.mjs
 *   node components/site/editorial/verification-responsive.mjs --detail
 *   node components/site/editorial/verification-responsive.mjs --controle
 *   SITE_URL=http://localhost:4361 node components/site/editorial/verification-responsive.mjs
 *
 * CE QU'ELLE COUVRE. Les trois gabarits de la famille et leurs composants :
 * `components/site/ressource/*` (01 Article et fiche),
 * `components/site/editorial/*` (10 Hub de rubrique, 11 Sous-rubrique) et
 * `components/site/preuve/*` (02 Étude de cas). Les pages sont reconnues au
 * nom de module CSS qu'elles servent (`Ressource-module`,
 * `PageEditoriale-module`, `PagePreuve-module`) : la porte ne devine pas
 * quelle page appartient à la famille, elle le LIT dans le HTML servi.
 *
 * LES QUATRE LARGEURS, et elles sont choisies : 320 px (le plus petit écran
 * encore en service), 360 et 390 px (les deux largeurs les plus répandues en
 * 2026), 768 px (la bascule tablette, là où les grilles changent de colonnes).
 *
 * LES TROIS RÈGLES BLOQUANTES
 *
 *   DEBORDEMENT  un élément plus large que SON HÔTE. La mesure porte sur
 *                l'ÉLÉMENT, jamais sur le document : `.mg-site` est en
 *                `overflow-x: clip`, `documentElement.scrollWidth` ne bouge
 *                donc jamais et une porte qui le regardait a déjà été verte
 *                sur un bouton de 409 px dans une fenêtre de 375.
 *   CIBLE        une cible tactile sous 24 px, seuil EXACT du critère 2.5.8 de
 *                la WCAG 2.2 niveau AA. Les 44 px souvent cités sont une
 *                recommandation d'Apple, pas une obligation.
 *   TRONQUE      du texte coupé par un `overflow` qui rogne, sans ellipse ni
 *                `line-clamp` déclarés : du texte perdu sans que rien ne le
 *                dise.
 *
 * ET UNE QUATRIÈME, CHEVAUCHEMENT : deux textes qui se recouvrent d'au moins
 * un quart de la plus petite des deux boîtes.
 *
 * CE QUI EST MESURÉ ET IMPRIMÉ SANS BLOQUER
 *
 *   CONTRASTE    les textes sous le plancher AA (4,5:1 courant, 3:1 au-delà de
 *                24 px ou 18,66 px en gras). Non bloquant, et ce n'est pas une
 *                faiblesse : l'arbitrage n° 7 de `docs/PASSATION.md` dit que
 *                des contrastes sous AA existent DANS LA MAQUETTE (boutons à
 *                2,56:1, surtitres à 2,37:1), que la fidélité est maintenue et
 *                que la correction passe par la maquette d'abord. Une porte qui
 *                refuserait ici contredirait cet arbitrage, et le dépôt a déjà
 *                vu une porte refuser son propre arbitrage.
 *   HAUTEUR      la hauteur de chaque page en écrans de 844 px à 390 px.
 *
 * ELLE REFUSE DE CONCLURE si une page de la famille ne répond pas : compter
 * des défauts sur un échantillon muet n'a aucun sens, et un vert obtenu ainsi
 * est un mensonge. Même règle que `scripts/verifie-blocs-pliables.mjs`.
 *
 * LES PIÈGES DE MESURE qu'elle évite, chacun déjà payé sur ce projet :
 *   · le bandeau de consentement est REFUSÉ avant toute mesure, sinon il
 *     couvre le bas de l'écran ;
 *   · l'HYDRATATION est attendue : les blocs repliables sont servis OUVERTS
 *     par le serveur et refermés par un effet client sous 880 px, donc une
 *     hauteur mesurée trop tôt est celle du serveur ;
 *   · `img.decode()` est attendu, sinon une image se mesure à zéro ;
 *   · les ornements du téléphone (`data-mobile-seulement`) ne sont PAS retirés
 *     ici : à ces largeurs ils font partie de ce que le visiteur voit ;
 *   · la pastille de développement de Next (`nextjs-portal`) est écartée ;
 *   · un conteneur à défilement horizontal volontaire (`overflow-x: auto`) ne
 *     compte pas comme un débordement : c'est son rôle.
 *
 * LE MODE TÉMOIN, `--controle`. Il injecte une faute par règle dans une page
 * fabriquée, et chaque témoin doit faire tomber SA règle, reconnue à son nom.
 * Un témoin qui tombe sur la règle voisine ne prouve rien. Il passe aussi des
 * CONTRÔLES NÉGATIFS : un tableau dans un rail à défilement, un lien en ligne
 * dans un paragraphe, un texte à `line-clamp` déclaré et un halo décoratif en
 * position absolue ne doivent produire AUCUN signalement. Sans eux, une règle
 * qui crie sur tout passerait pour une règle qui sait échouer.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("../../../", import.meta.url));
const SITE = process.env.SITE_URL ?? "http://localhost:4340";
export const LARGEURS = [320, 360, 390, 768];
export const CIBLE_MINIMALE = 24;
export const ECRAN = 844;
const DETAIL = process.argv.includes("--detail");
const CONTROLE = process.argv.includes("--controle");

/** Les modules CSS qui signent une page de la famille. */
export const MODULES = ["Ressource-module", "PageEditoriale-module", "PagePreuve-module"];

/* ====================================================================== */
/* LA MESURE, exécutée DANS la page.                                       */
/* ====================================================================== */
export const MESURE = ({ cibleMin, modules }) => {
  const EPS = 2;
  const lisible = (n) =>
    (n.textContent || "")
      .replace(/&nbsp;|[  ]/g, " ")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  /* LE STYLE CALCULÉ EST MIS EN CACHE, et ce n'est pas une coquetterie : la
     première version de cette porte rappelait `getComputedStyle` dans trois
     boucles imbriquées et n'a jamais rendu sa mesure sur la page la plus
     longue du site (le guide `/ressources/`, 36 écrans). Une porte qui ne
     termine pas ne mesure rien. */
  const styleDe = new Map();
  const style = (el) => {
    let s = styleDe.get(el);
    if (!s) {
      s = getComputedStyle(el);
      styleDe.set(el, s);
    }
    return s;
  };

  const nomme = (el) => {
    const brut = typeof el.className === "string" ? el.className.trim() : "";
    const cls = brut
      ? "." +
        brut
          .split(/\s+/)
          .map((c) => c.replace(/^([A-Za-z]+)-module__[A-Za-z0-9_-]+__/, "$1:"))
          .slice(0, 2)
          .join(".")
      : "";
    return `${el.tagName.toLowerCase()}${cls}`;
  };

  /* La zone dit QUI est responsable : seul `main` appartient à la famille.
     L'entête, le pied, la barre d'action basse et le bandeau de consentement
     sont partagés par tout le site et ne relèvent pas de cette porte. */
  const zone = (el) => {
    if (el.closest("nextjs-portal")) return "outil";
    if (el.closest("header")) return "entete";
    if (el.closest("footer")) return "pied";
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (style(n).position === "fixed") return "fixe";
    }
    if (el.closest("main")) return "main";
    return "autre";
  };

  /*
   * À QUI APPARTIENT UN ÉLÉMENT. On remonte au premier ancêtre, lui compris,
   * qui porte une classe de module CSS, QUEL QUE SOIT le module : c'est ainsi
   * qu'on distingue un défaut de cette famille d'un défaut du hub des preuves
   * (`PreuvesHub-module`, gabarit porté ailleurs) ou du formulaire partagé
   * (`FormulaireContact-module`, auquel il est interdit de toucher).
   *
   * Un élément sans AUCUN ancêtre de module, et il y en a beaucoup puisque la
   * maquette pilote presque tout en style en ligne, est rattaché au module
   * DOMINANT de la page. Sans cette retombée, les trois quarts des défauts
   * d'une page ressource seraient classés « sans propriétaire » et personne
   * ne les corrigerait.
   */
  const moduleDe = (el) => {
    const h = el.closest('[class*="-module__"]');
    if (h) {
      const brut = typeof h.className === "string" ? h.className : "";
      const trouve = brut.match(/([A-Za-z]+)-module__/);
      if (trouve) return trouve[1] + "-module";
    }
    return dominant;
  };

  const nombre = (v) => Number.parseFloat(v) || 0;

  /* LE MODULE DOMINANT DE LA PAGE : celui de la famille que le `main` sert.
     Il ne se devine pas depuis l'URL, il se LIT dans le HTML rendu. Deviner
     le gabarit a déjà coûté une journée à ce dépôt. */
  const dominant =
    modules.find((m) => (document.querySelector("main") ?? document.body).querySelector(`[class*="${m}"]`)) ??
    (() => {
      const premier = (document.querySelector("main") ?? document.body).querySelector(
        '[class*="-module__"]',
      );
      const brut = premier && typeof premier.className === "string" ? premier.className : "";
      return (brut.match(/([A-Za-z]+)-module__/) ?? [, "hors-module"])[1] + "-module";
    })();

  const boiteContenu = (el) => {
    const r = el.getBoundingClientRect();
    const s = style(el);
    return {
      gauche: r.left + nombre(s.borderLeftWidth) + nombre(s.paddingLeft),
      droite: r.right - nombre(s.borderRightWidth) - nombre(s.paddingRight),
    };
  };

  /** Le premier ancêtre qui DÉFILE à l'horizontale : un rail déborde exprès. */
  const dansUnRail = (el) => {
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const x = style(n).overflowX;
      if (x === "auto" || x === "scroll") return true;
    }
    return false;
  };

  const racine = document.querySelector("main") ?? document.body;
  const retenus = [];
  /*
   * CE QUI N'EST PAS RENDU N'A PAS DE GÉOMÉTRIE, et le croire a produit 199
   * faux chevauchements sur une seule page.
   *
   * Un `<details>` fermé enveloppe son contenu dans `::details-content` et lui
   * pose `content-visibility: hidden` : le sous-arbre n'est pas disposé.
   * `getBoundingClientRect()` y rend malgré tout une boîte NON NULLE, la même
   * pour tous les descendants, celle du bloc replié. Tous se recouvraient donc
   * les uns les autres, et la règle des chevauchements criait sur du contenu
   * que personne ne voit. Le filtre « largeur ou hauteur nulle » ne les
   * attrapait pas.
   *
   * `checkVisibility` répond à la vraie question : cet élément est-il rendu ?
   * Il couvre `display: none`, `visibility`, l'opacité nulle et les sous-arbres
   * sautés par `content-visibility`.
   */
  for (const el of racine.querySelectorAll("*")) {
    if (el.closest("nextjs-portal")) continue;
    if (
      typeof el.checkVisibility === "function" &&
      !el.checkVisibility({
        contentVisibilityAuto: true,
        opacityProperty: true,
        visibilityProperty: true,
      })
    ) {
      continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.left < -1000) continue; // motif « masqué visuellement »
    const s = style(el);
    if (s.visibility === "hidden" || s.opacity === "0" || s.display === "none") continue;
    retenus.push({ el, r, s });
  }

  const defauts = [];
  const pose = (regle, el, texte) =>
    defauts.push({ regle, zone: zone(el), module: moduleDe(el), texte });

  /* ---- DEBORDEMENT : plus large que son hôte --------------------------- */
  const coupables = [];
  for (const { el, s } of retenus) {
    const hote = el.parentElement;
    if (!hote || hote === document.documentElement) continue;
    /* Hors du flux : un halo, une lueur, une photo en `fill` sortent de leur
       cadre par construction, et leur cadre rogne. */
    if (s.position === "fixed" || s.position === "absolute") continue;
    /*
     * UNE TRANSFORMATION DÉPLACE LA PEINTURE, PAS LA MISE EN PAGE, et la
     * confondre avec un débordement a produit douze faux signalements.
     *
     * La pastille « + » des FAQ est un CERCLE de 28 px que `[open] .plus`
     * fait tourner de 45 degrés pour en faire une croix. Un carré de 28 px
     * tourné a un rectangle englobant de 40 px : `getBoundingClientRect` rend
     * donc 40, « 6 px hors du summary », sur les trois gabarits et aux quatre
     * largeurs. À l'écran, rien ne bouge d'un pixel : c'est un disque, sa
     * rotation est invisible, et la maquette pose exactement la même.
     *
     * On écarte donc ce qui porte une transformation. Le dépôt ne s'en sert
     * que pour cela et pour les levées au survol (`translateY(-3px)`).
     */
    if (s.transform && s.transform !== "none") continue;
    if (dansUnRail(el)) continue;
    const h = boiteContenu(hote);
    const rects = [...el.getClientRects()];
    if (rects.length === 0) continue;
    const sort = Math.max(
      Math.max(...rects.map((x) => x.right)) - h.droite,
      h.gauche - Math.min(...rects.map((x) => x.left)),
    );
    if (sort <= EPS) continue;
    if (coupables.some((c) => c.contains(el))) continue; // l'ancêtre suffit
    coupables.push(el);
    const r = el.getBoundingClientRect();
    pose(
      "DEBORDEMENT",
      el,
      `${nomme(el)} fait ${Math.round(r.width)} px dans ${nomme(hote)} qui en offre ` +
        `${Math.round(h.droite - h.gauche)} : il en sort de ${Math.round(sort)} px` +
        (lisible(el) ? ` « ${lisible(el).slice(0, 44)} »` : ""),
    );
  }

  /* ---- CIBLE : sous 24 px --------------------------------------------- */
  for (const { el, r, s } of retenus) {
    if (
      !el.matches(
        'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], summary',
      )
    )
      continue;
    /* La WCAG exempte explicitement un lien EN LIGNE dans du texte :
       l'agrandir casserait l'interligne du paragraphe. */
    if (s.display === "inline" && el.closest("p, li, td, h1, h2, h3, h4, blockquote")) continue;
    /* Un élément séparé de ses voisins d'au moins 24 px satisfait le critère
       par l'ESPACEMENT, que la WCAG admet. Le séparateur peut être une marge
       OU l'écart de la grille parente : les listes du site sont des grilles à
       `gap`, donc des marges nulles, et ne regarder que les marges
       condamnerait cinquante liens parfaitement atteignables. */
    const parent = el.parentElement;
    const sp = parent ? style(parent) : null;
    const ecart = sp && /grid|flex/.test(sp.display) ? nombre(sp.rowGap) : 0;
    const marge = nombre(s.marginTop) + nombre(s.marginBottom);
    const parEspacement = r.height + Math.max(marge, ecart) >= cibleMin && r.width >= cibleMin;
    if (parEspacement) continue;
    if (r.height >= cibleMin && r.width >= cibleMin) continue;
    pose(
      "CIBLE",
      el,
      `${nomme(el)} ne fait que ${Math.round(r.width)}×${Math.round(r.height)} px ` +
        `« ${(lisible(el) || el.getAttribute("aria-label") || "").slice(0, 36)} »`,
    );
  }

  /* ---- TRONQUE : texte coupé sans ellipse ni clamp --------------------- */
  /*
   * LA MESURE PORTE SUR LE TEXTE, PAS SUR `scrollWidth`, et c'est un faux
   * positif que le contrôle négatif de cette porte a attrapé.
   *
   * Un `overflow: hidden` qui contient un ornement HORS DU FLUX (le halo
   * orangé des appels finaux, une photo en `fill`) a un `scrollWidth`
   * supérieur à son `clientWidth` : la zone de débordement inclut le
   * descendant positionné. La page est pourtant parfaitement lisible, et
   * c'est le motif le plus courant du dépôt. Signaler là, c'est crier sur du
   * conforme et noyer le vrai défaut.
   *
   * On mesure donc l'étendue réelle des LIGNES DE TEXTE, par un `Range` posé
   * sur chaque NŒUD DE TEXTE, et on la compare à la boîte de contenu de
   * l'élément. Du texte dont une ligne passe sous le bord d'un cadre qui
   * rogne est du texte perdu ; un halo qui sort du même cadre ne l'est pas.
   *
   * `selectNodeContents` ne suffisait pas : un `Range` sur le contenu rend
   * aussi la boîte des descendants, halo compris, et le contrôle négatif de
   * cette porte l'a pris la main dans le sac (« 170 px sous son bord droit »
   * sur un halo sans un mot de texte). Les nœuds dans un descendant HORS DU
   * FLUX sont écartés pour la même raison.
   */
  const clamps = [];
  for (const { el, s } of retenus) {
    const t = lisible(el);
    if (!t) continue;
    const rogneX = s.overflowX === "hidden" || s.overflowX === "clip";
    const rogneY = s.overflowY === "hidden" || s.overflowY === "clip";
    if (!rogneX && !rogneY) continue;
    /* LA RÈGLE NE VISE QUE LES BOÎTES DE TEXTE, pas les grands conteneurs.
       Un cadre qui rogne et qui porte des centaines de nœuds de texte n'est pas
       en train de perdre une phrase : si le texte d'un enfant sort, c'est
       l'enfant qui déborde, et DEBORDEMENT le dit déjà. Parcourir tous ses
       nœuds coûtait des minutes sur le guide `/ressources/`, et la mesure n'est
       jamais revenue. Douze enfants : un titre, une carte, une pastille. */
    if (el.children.length > 12) continue;

    const r = el.getBoundingClientRect();
    const droite = r.right - nombre(s.borderRightWidth) - nombre(s.paddingRight);
    const bas = r.bottom - nombre(s.borderBottomWidth) - nombre(s.paddingBottom);
    const lignes = [];
    const marcheur = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) {
      if (!n.textContent.trim()) continue;
      /*
       * UN NŒUD DANS UN BLOC NON RENDU N'A PAS DE POSITION, et le prendre pour
       * argent comptant a fait annoncer « 685 px de texte coupés » sur la
       * carte de FAQ des 38 pages ressource. Mesure directe de la carte :
       * `scrollHeight` 734, `clientHeight` 734, pas un pixel de débordement.
       * Les réponses des `<details>` FERMÉS, que `::details-content` sort de
       * la disposition, rendaient des rectangles qui ne correspondent à rien.
       * Le visiteur, lui, ne voit que la question.
       */
      const porteur = n.parentElement;
      if (
        porteur &&
        typeof porteur.checkVisibility === "function" &&
        !porteur.checkVisibility({
          contentVisibilityAuto: true,
          opacityProperty: true,
          visibilityProperty: true,
        })
      ) {
        continue;
      }
      let horsDuFlux = false;
      for (let p = n.parentElement; p && p !== el; p = p.parentElement) {
        const ps = style(p).position;
        if (ps === "absolute" || ps === "fixed") {
          horsDuFlux = true;
          break;
        }
      }
      if (horsDuFlux) continue;
      const portee = document.createRange();
      portee.selectNodeContents(n);
      for (const x of portee.getClientRects()) {
        if (x.width > 0 && x.height > 0) lignes.push(x);
      }
    }
    if (lignes.length === 0) continue;
    const perduX = rogneX ? Math.round(Math.max(...lignes.map((x) => x.right)) - droite) : 0;
    const perduY = rogneY ? Math.round(Math.max(...lignes.map((x) => x.bottom)) - bas) : 0;
    if (perduX <= 1 && perduY <= 1) continue;

    /* Une coupe DÉCLARÉE est un choix de dessin, pas un texte perdu :
       `line-clamp` (les résumés du téléphone) ou `text-overflow: ellipsis`
       préviennent le lecteur que la suite existe. */
    if ((s.webkitLineClamp && s.webkitLineClamp !== "none") || s.textOverflow === "ellipsis") {
      clamps.push(`${nomme(el)} « ${t.slice(0, 34)} »`);
      continue;
    }
    pose(
      "TRONQUE",
      el,
      `${nomme(el)} laisse son texte passer ` +
        `${perduX > 1 ? `${perduX} px sous son bord droit` : `${perduY} px sous son bord bas`} ` +
        `dans un cadre qui rogne, sans ellipse ni clamp « ${t.slice(0, 44)} »`,
    );
  }

  /* ---- CHEVAUCHEMENT : deux textes qui se recouvrent -------------------- */
  const feuilles = [];
  for (const { el, r, s } of retenus) {
    if (s.position !== "static" && s.position !== "relative") continue;
    if (s.pointerEvents === "none") continue;
    const propre = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (propre.length < 2) continue;
    feuilles.push({ el, r });
  }
  /* LE BALAYAGE EST TRIÉ PAR LE HAUT, et la boucle intérieure S'ARRÊTE dès que
     le voisin commence sous le bas du courant. Sans ce tri, la comparaison est
     quadratique sur un millier de feuilles de texte : quatre millions de
     lectures de rectangle, et la page la plus longue du site ne rendait jamais
     sa mesure. Trié, chaque feuille ne se compare qu'à celles qui PEUVENT la
     croiser, et la mesure revient en une seconde. */
  feuilles.sort((a, b) => a.r.top - b.r.top);
  for (let i = 0; i < feuilles.length; i++) {
    for (let j = i + 1; j < feuilles.length; j++) {
      const a = feuilles[i];
      const b = feuilles[j];
      if (b.r.top >= a.r.bottom - 2) break;
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      if (ox <= 2) continue;
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (oy <= 2) continue;
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const petite = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (ox * oy < petite * 0.25) continue;
      pose(
        "CHEVAUCHEMENT",
        a.el,
        `${nomme(a.el)} et ${nomme(b.el)} se recouvrent sur ` +
          `${Math.round(ox)}×${Math.round(oy)} px ` +
          `« ${lisible(a.el).slice(0, 24)} » / « ${lisible(b.el).slice(0, 24)} »`,
      );
    }
  }

  /* ---- CONTRASTE : sous le plancher AA (mesuré, non bloquant) ---------- */
  const canal = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (c) => 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2]);
  const lis = (v) => {
    const m = String(v).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
  };
  const empile = (dessus, dessous) =>
    [0, 1, 2].map((i) => dessus[i] * dessus[3] + dessous[i] * (1 - dessus[3]));
  /* Le fond EFFECTIF, et il peut être INDÉTERMINÉ : au-dessus d'une photo ou
     d'un dégradé, aucun calcul honnête n'est possible. On le dit, on ne
     l'invente pas. */
  const fondDe = (el) => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const s = style(n);
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      const c = lis(s.backgroundColor);
      if (!c || c[3] === 0) continue;
      acc = acc === null ? c : [...empile(acc, c), 1];
      if (c[3] === 1) return acc.slice(0, 3);
    }
    return acc ? acc.slice(0, 3) : [255, 255, 255];
  };
  const contrastes = [];
  let indetermines = 0;
  for (const { el, s } of retenus) {
    const propre = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (propre.length < 2) continue;
    const couleur = lis(s.color);
    if (!couleur) continue;
    const fond = fondDe(el);
    if (fond === null) {
      indetermines++;
      continue;
    }
    const avant = couleur[3] < 1 ? empile(couleur, fond) : couleur.slice(0, 3);
    const l1 = luminance(avant);
    const l2 = luminance(fond);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const taille = nombre(s.fontSize);
    const poids = Number.parseInt(s.fontWeight, 10) || 400;
    const seuil = taille >= 24 || (taille >= 18.66 && poids >= 700) ? 3 : 4.5;
    if (ratio + 0.005 >= seuil) continue;
    contrastes.push({
      zone: zone(el),
      module: moduleDe(el),
      texte:
        `${nomme(el)} à ${Math.round(ratio * 100) / 100}:1 pour un plancher de ${seuil} ` +
        `(${Math.round(taille * 10) / 10} px) « ${propre.slice(0, 36)} »`,
    });
  }

  return {
    defauts,
    contrastes,
    indetermines,
    clamps,
    hauteur: document.documentElement.scrollHeight,
    dominant,
    modulesVus: modules.filter((m) => document.querySelector(`[class*="${m}"]`)),
    pliables: document.querySelectorAll("details[data-pliable-mobile]").length,
    pliablesFermes: document.querySelectorAll("details[data-pliable-mobile]:not([open])").length,
  };
};

/* ====================================================================== */
/* Préparer une page : consentement refusé, hydratation, images décodées.   */
/* ====================================================================== */
export async function prepare(page, largeur) {
  const refuse = page.getByRole("button", { name: "Tout refuser" });
  if (await refuse.count().catch(() => 0)) {
    await refuse
      .first()
      .click({ timeout: 5000 })
      .catch(() => {});
  }
  /*
   * TOUTE ATTENTE DANS LA PAGE PORTE UNE ÉCHÉANCE, et ce n'est pas de la
   * prudence de principe : `page.evaluate` n'a PAS de délai par défaut dans
   * Playwright. Deux attentes de cette fonction peuvent ne jamais se résoudre
   * quand le serveur de développement est saturé (trois agents mesurent en
   * même temps sur ce dépôt) : `document.fonts.ready` si une police n'arrive
   * pas, et `img.decode()` si une image reste en vol. La porte restait alors
   * en vie une demi-heure sans rendre une seule ligne, et on la croyait lente
   * alors qu'elle était bloquée. Une attente sans échéance n'est pas une
   * mesure, c'est un pari.
   */
  await page
    .evaluate(
      (limite) =>
        Promise.race([
          new Promise((fini) => setTimeout(fini, limite)),
          document.fonts.ready,
        ]).then(() => undefined),
      5000,
    )
    .catch(() => {});
  if (largeur < 880) {
    /* Les blocs repliables sont SERVIS OUVERTS : un effet client les referme
       sous 880 px. Mesurer avant, c'est mesurer le rendu du serveur. */
    await page
      .waitForFunction(
        () =>
          document.querySelectorAll("details[data-pliable-mobile]").length === 0 ||
          document.querySelectorAll("details[data-pliable-mobile]:not([open])").length > 0,
        { timeout: 20_000 },
      )
      .catch(() => {});
  }
  /* Les images : `decode()` avant de mesurer, sinon une image en vol se mesure
     à zéro et la porte déclare une boîte vide. Avec échéance, pour la raison
     dite plus haut : une image qui n'arrive jamais ne doit pas emporter la
     mesure avec elle. */
  await page
    .evaluate(
      (limite) =>
        Promise.race([
          new Promise((fini) => setTimeout(fini, limite)),
          Promise.all(
            [...document.images].slice(0, 60).map((i) => i.decode().catch(() => {})),
          ),
        ]).then(() => undefined),
      8000,
    )
    .catch(() => {});
  await page.waitForTimeout(400);

  /*
   * DEUX TEMPS, PARCE QUE DEUX QUESTIONS DIFFÉRENTES.
   *
   * LA HAUTEUR se relève MAINTENANT, blocs repliés, telle que le visiteur
   * reçoit la page : c'est tout le propos du repli, et une hauteur mesurée
   * dépliée ne dirait rien de ce qu'il a sous le pouce.
   *
   * LES DÉFAUTS se relèvent ENSUITE, blocs DÉPLIÉS, et c'est le seul relevé
   * honnête : le contenu d'un bloc replié n'est pas disposé, donc pas
   * mesurable, mais le visiteur l'ouvre d'un doigt et il doit tenir dans
   * l'écran lui aussi. Mesuré replié, un gabarit entier passait pour conforme
   * alors que ses grilles débordaient de 100 px une fois ouvertes.
   *
   * Les `<details>` de FAQ ne sont PAS touchés : leur attribut `name` les rend
   * mutuellement exclusifs, les forcer ouverts fabriquerait un empilement que
   * la page ne produit jamais.
   */
  const replie = await page.evaluate(() => ({
    hauteur: document.documentElement.scrollHeight,
    pliables: document.querySelectorAll("details[data-pliable-mobile]").length,
    pliablesFermes: document.querySelectorAll("details[data-pliable-mobile]:not([open])")
      .length,
  }));
  await page.evaluate(() => {
    for (const d of document.querySelectorAll("details[data-pliable-mobile]")) d.open = true;
  });
  await page.waitForTimeout(250);
  return replie;
}

/* ====================================================================== */
/* LE MODE TÉMOIN                                                          */
/* ====================================================================== */
const PAGE_TEMOIN = (corps) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>
  body { margin: 0; font: 400 16px/1.5 sans-serif; background: #fff; color: #1c1b19; }
  main { width: 320px; padding: 0 40px; box-sizing: border-box; }
  .cadre { width: 240px; background: #fff; }
</style></head><body><main>${corps}</main></body></html>`;

/** Chaque témoin doit faire tomber SA règle, et elle seule. */
const TEMOINS = [
  {
    regle: "DEBORDEMENT",
    quoi: "une bande flex à minWidth 240 dans un hôte de 188 px",
    corps:
      '<div class="cadre"><div style="display:flex;padding:0 26px;background:#1c1b19">' +
      '<div style="min-width:240px;flex:1;color:#fff;font-size:16px">' +
      "Une question sur votre parc, un besoin à chiffrer ?</div></div></div>",
  },
  {
    regle: "CIBLE",
    quoi: "un lien de 60 par 16 px hors du texte courant",
    corps:
      '<div class="cadre"><div style="display:block"><a href="/x/" ' +
      'style="display:block;width:60px;height:16px;font-size:11px">Tous les articles</a></div></div>',
  },
  {
    regle: "TRONQUE",
    quoi: "un titre à hauteur fixe et overflow hidden, sans ellipse",
    corps:
      '<div class="cadre"><div style="height:20px;overflow:hidden;font-size:16px;line-height:20px;width:240px">' +
      "Ce que nous avons mis en place sur le site, en quatre temps, et pourquoi</div></div>",
  },
  {
    regle: "CHEVAUCHEMENT",
    quoi: "deux textes du flux superposés par une marge négative",
    corps:
      '<div class="cadre"><p style="margin:0;height:40px;width:240px">Vos questions avant de nous appeler</p>' +
      '<p style="margin:-38px 0 0;height:40px;width:240px">Nos références clients</p></div>',
  },
  {
    regle: "CONTRASTE",
    quoi: "un surtitre gris clair sur blanc, 2,3:1",
    corps:
      '<div class="cadre"><div style="color:#b5b5b5;background:#fff;font-size:11.5px">' +
      "FICHE PRATIQUE</div></div>",
  },
];

/** Ce qui est CONFORME et ne doit rien déclencher. */
const CONTROLES_NEGATIFS = [
  {
    quoi: "un tableau de 520 px dans un rail à défilement horizontal",
    corps:
      '<div class="cadre"><div style="overflow-x:auto;width:240px">' +
      '<table style="width:100%;min-width:520px"><tr><td style="padding:14px 18px">Indicateur</td>' +
      '<td style="padding:14px 18px">Ce qu-il mesure</td></tr></table></div></div>',
  },
  {
    quoi: "un lien en ligne de 14 px dans un paragraphe",
    corps:
      '<div class="cadre"><p style="width:240px;margin:0">Le plan passe par ' +
      '<a href="/offres/" style="display:inline;font-size:14px">la residence</a> et rien d-autre.</p></div>',
  },
  {
    quoi: "un résumé coupé à deux lignes par line-clamp",
    corps:
      '<div class="cadre"><p style="width:240px;margin:0;display:-webkit-box;' +
      "-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px\">" +
      "Mesurer la duree d-indisponibilite, puis la cause, puis le cout, puis le plan, " +
      "puis la preuve, puis la suite, puis le reste du texte qui depasse largement.</p></div>",
  },
  {
    quoi: "un halo décoratif en position absolue qui sort de son cadre",
    corps:
      '<div class="cadre"><div style="position:relative;overflow:hidden;width:240px;height:80px;background:#1c1b19">' +
      '<div aria-hidden="true" style="position:absolute;width:420px;height:420px;right:-170px;top:-190px;' +
      'background:radial-gradient(circle,rgba(255,124,60,.26),transparent 68%);pointer-events:none"></div>' +
      '<div style="position:relative;color:#fff;font-size:16px">Un appel. Un plan.</div></div></div>',
  },
  {
    quoi: "la pastille ronde d'une FAQ ouverte, tournée de 45 degrés",
    corps:
      '<div class="cadre"><details open><summary style="display:flex;justify-content:space-between;' +
      'align-items:center;gap:16px;padding:20px 24px;width:240px;box-sizing:border-box;font-size:16px">' +
      "Quelle est la difference" +
      '<span style="flex:none;width:28px;height:28px;border-radius:999px;background:#f0f0f0;' +
      'display:grid;place-items:center;transform:rotate(45deg)">+</span></summary>' +
      '<p style="margin:0;padding:0 24px 20px;font-size:14px">La reponse, visible.</p></details></div>',
  },
  {
    quoi: "la réponse d'une FAQ fermée, que le navigateur ne dispose pas",
    corps:
      '<div class="cadre"><div style="overflow:hidden;border-radius:18px;width:240px">' +
      '<details><summary style="padding:20px 24px;font-size:16px">Combien de temps prend une demarche</summary>' +
      '<p style="margin:0;padding:0 24px 20px;font-size:14px">Une reponse longue, repliee, que le ' +
      "navigateur sort de la disposition et dont les rectangles ne veulent plus rien dire du tout, " +
      "sur plusieurs lignes pour que la difference se voie.</p></details></div></div>",
  },
  {
    quoi: "une grille de cartes-liens de 44 px de haut",
    corps:
      '<div class="cadre"><div style="display:grid;gap:12px;width:240px">' +
      '<a href="/a/" style="display:block;height:44px;font-size:14px">Fiches pratiques</a>' +
      '<a href="/b/" style="display:block;height:44px;font-size:14px">Fiches techniques</a></div></div>',
  },
];

async function modeTemoin() {
  const navigateur = await chromium.launch({ channel: "chrome" });
  const contexte = await navigateur.newContext({ viewport: { width: 320, height: 844 } });
  const page = await contexte.newPage();
  const verdicts = [];

  for (const t of TEMOINS) {
    await page.setContent(PAGE_TEMOIN(t.corps));
    await page.waitForTimeout(80);
    const r = await page.evaluate(MESURE, { cibleMin: CIBLE_MINIMALE, modules: MODULES });
    const tous = [...r.defauts.map((d) => d.regle), ...r.contrastes.map(() => "CONTRASTE")];
    const sienne = tous.filter((x) => x === t.regle).length;
    const voisines = [...new Set(tous.filter((x) => x !== t.regle))];
    verdicts.push([
      `témoin ${t.regle} : ${t.quoi}`,
      sienne > 0 && voisines.length === 0,
      sienne === 0
        ? `sa règle N'A PAS crié (relevé : ${tous.join(", ") || "rien"})`
        : voisines.length
          ? `une règle VOISINE a crié : ${voisines.join(", ")}`
          : `${sienne} signalement(s) de sa règle`,
    ]);
  }

  for (const c of CONTROLES_NEGATIFS) {
    await page.setContent(PAGE_TEMOIN(c.corps));
    await page.waitForTimeout(80);
    const r = await page.evaluate(MESURE, { cibleMin: CIBLE_MINIMALE, modules: MODULES });
    const tous = [...r.defauts.map((d) => `${d.regle} ${d.texte}`), ...r.contrastes.map((d) => `CONTRASTE ${d.texte}`)];
    verdicts.push([
      `contrôle négatif : ${c.quoi}`,
      tous.length === 0,
      tous.length === 0 ? "aucun signalement, comme attendu" : `FAUX POSITIF : ${tous.join(" | ")}`,
    ]);
  }

  await navigateur.close();
  for (const [quoi, ok, dit] of verdicts) {
    console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}\n          ${dit}`);
  }
  const rates = verdicts.filter(([, ok]) => !ok).length;
  if (rates > 0) {
    console.log(`\nTÉMOIN EN ÉCHEC : ${rates} verdict(s) sur ${verdicts.length}.`);
    console.log("La porte ne sait pas échouer comme elle le prétend : elle ne vaut rien.");
    process.exit(1);
  }
  console.log(
    `\ncontrôle conforme (${verdicts.length}/${verdicts.length}) : ` +
      `${TEMOINS.length} fautes injectées, chacune tombée sur SA règle, ` +
      `${CONTROLES_NEGATIFS.length} constructions conformes restées muettes.`,
  );
}

/* ====================================================================== */
/* LA PORTE                                                                */
/* ====================================================================== */
async function modePorte() {
  const index = JSON.parse(
    readFileSync(new URL("maquette/contenu/site/index.json", `file://${RACINE}`), "utf8"),
  );
  const pagesIndex = Array.isArray(index) ? index : (index.pages ?? index);
  const toutes = [...new Set(pagesIndex.map((p) => p?.url).filter(Boolean))];

  /* QUELLES PAGES SONT DE LA FAMILLE : on le LIT dans le HTML servi, au nom
     du module CSS. Deviner le gabarit depuis l'index a déjà coûté une journée
     à ce dépôt (quatre gabarits portés, 126 pages servies par le mauvais). */
  const famille = [];
  const muettes = [];
  const LOT = 16;
  for (let i = 0; i < toutes.length; i += LOT) {
    await Promise.all(
      toutes.slice(i, i + LOT).map(async (url) => {
        try {
          const r = await fetch(SITE + url, { signal: AbortSignal.timeout(120_000) });
          if (!r.ok) return muettes.push(`${url} : HTTP ${r.status}`);
          const html = await r.text();
          if (MODULES.some((m) => html.includes(m))) famille.push(url);
        } catch (e) {
          muettes.push(`${url} : ${e?.cause?.code ?? e?.name ?? "injoignable"}`);
        }
      }),
    );
  }
  famille.sort();

  if (muettes.length > 0) {
    console.log(
      `MESURE NON CONCLUANTE : ${muettes.length} page(s) sur ${toutes.length} n'ont pas répondu,`,
    );
    console.log("et la famille ne peut pas être recensée sur un inventaire incomplet.");
    for (const m of muettes.slice(0, 10)) console.log(`  ${m}`);
    if (muettes.length > 10) console.log(`  … et ${muettes.length - 10} autre(s)`);
    process.exit(1);
  }
  if (famille.length === 0) {
    console.log("MESURE NON CONCLUANTE : aucune page de la famille éditoriale servie.");
    process.exit(1);
  }

  /* LES PAGES MESURÉES AU NAVIGATEUR. Les cent pages de la famille à quatre
     largeurs tiendraient une heure : on mesure un ÉCHANTILLON NOMMÉ, une page
     par forme, et la liste est dans le fichier pour qu'elle se discute. Le
     recensement ci-dessus, lui, porte sur les 248 adresses.

     `/preuves/` EST MESURÉE SANS ÊTRE REVENDIQUÉE : le hub des études de cas
     est servi par `components/site/casclients/PreuvesHub.tsx`, qui n'est pas
     de cette famille. Elle reste dans l'échantillon parce qu'elle est l'entrée
     des pages de preuve et qu'un visiteur y passe ; ses défauts sont imprimés
     en signalement, à la main de la famille qui la porte. */
  const ECHANTILLON = [
    { url: "/ressources/", famille: true },
    { url: "/ressources/fiches-pratiques/", famille: true },
    { url: "/ressources/fiches-pratiques/5s/", famille: true },
    { url: "/ressources/articles/gmao/", famille: true },
    { url: "/preuves/", famille: false },
    { url: "/preuves/voit-grand-est/", famille: true },
  ];
  const absentes = ECHANTILLON.filter((e) => e.famille && !famille.includes(e.url));
  if (absentes.length > 0) {
    console.log(
      "MESURE NON CONCLUANTE : des pages de l'échantillon ne sont plus servies par la famille :",
    );
    for (const a of absentes) console.log(`  ${a.url}`);
    console.log("Soit le gabarit a changé de main, soit la page ne se rend plus. À trancher.");
    process.exit(1);
  }

  const navigateur = await chromium.launch({ channel: "chrome" });
  const bloquants = [];
  const signales = [];
  const hauteurs = [];
  const rates = [];
  let pliablesVus = 0;
  let clampsVus = 0;
  let indeterminesVus = 0;

  try {
    for (const largeur of LARGEURS) {
      const contexte = await navigateur.newContext({
        viewport: { width: largeur, height: ECRAN },
        hasTouch: largeur < 768,
        isMobile: largeur < 768,
      });
      for (const { url: chemin, famille: aMoi } of ECHANTILLON) {
        const page = await contexte.newPage();
        try {
          const r = await page.goto(SITE + chemin, { waitUntil: "load", timeout: 120_000 });
          if (!r?.ok()) {
            rates.push(`${chemin} à ${largeur} px : HTTP ${r?.status()}`);
            await page.close();
            continue;
          }
          const replie = await prepare(page, largeur);
          const releve = await page.evaluate(MESURE, {
            cibleMin: CIBLE_MINIMALE,
            modules: MODULES,
          });

          /* UN DÉFAUT EST DE CETTE FAMILLE s'il est dans le `main` d'une page
             de la famille ET qu'il appartient à l'un de ses trois modules.
             L'entête, le pied, la barre basse, le bandeau de consentement, le
             formulaire partagé et le hub des preuves sont portés ailleurs :
             les revendiquer donnerait une porte qui refuse le travail des
             autres, et les taire donnerait une porte aveugle. On les imprime. */
          const aNous = (d) => aMoi && d.zone === "main" && MODULES.includes(d.module);
          const miens = releve.defauts.filter(aNous);
          const ailleurs = releve.defauts.filter((d) => !aNous(d));
          for (const d of miens) {
            bloquants.push(
              `${d.regle}  ${chemin} à ${largeur} px [${d.module}] : ${d.texte}`,
            );
          }
          for (const d of ailleurs) {
            signales.push(
              `hors famille (${d.zone}, ${d.module})  ${d.regle}  ${chemin} à ${largeur} px : ${d.texte}`,
            );
          }
          for (const c of releve.contrastes) {
            signales.push(
              `CONTRASTE (${c.zone}, ${c.module})  ${chemin} à ${largeur} px : ${c.texte}`,
            );
          }
          clampsVus += releve.clamps.length;
          indeterminesVus += releve.indetermines;
          if (largeur === 390) {
            /* LA HAUTEUR RELEVÉE EST CELLE DE LA PAGE TELLE QU'ELLE ARRIVE,
               blocs repliés, pas celle de la page dépliée pour la mesure. */
            hauteurs.push({ chemin, hauteur: replie.hauteur, aMoi });
            pliablesVus += replie.pliables;
          }

          if (DETAIL) {
            console.log(
              `${chemin.padEnd(36)} ${String(largeur).padStart(4)} px  ` +
                `${String(miens.length).padStart(3)} défaut(s) dans main, ` +
                `${String(ailleurs.length).padStart(3)} hors famille, ` +
                `${String(releve.contrastes.length).padStart(3)} contraste(s), ` +
                `h ${replie.hauteur} px (${(replie.hauteur / ECRAN).toFixed(1)} écrans), ` +
                `pli ${replie.pliablesFermes}/${replie.pliables}`,
            );
          }
        } catch (e) {
          rates.push(`${chemin} à ${largeur} px : ${String(e.message).split("\n")[0]}`);
        }
        await page.close();
      }
      await contexte.close();
    }
  } finally {
    await navigateur.close();
  }

  if (rates.length > 0) {
    console.log(`MESURE NON CONCLUANTE : ${rates.length} relevé(s) n'ont pas abouti.`);
    for (const r of rates) console.log(`  ${r}`);
    console.log("Une porte qui conclut sur des relevés partiels ne protège plus rien.");
    process.exit(1);
  }

  /* LA PIRE PAGE DE LA FAMILLE, et pas la pire de l'échantillon : `/preuves/`
     est le hub des études de cas, servi par `components/site/casclients/`, et
     annoncer ses 24 écrans comme le chiffre de cette famille serait s'attribuer
     le travail d'un autre, en mal comme en bien. Sa hauteur est imprimée à
     part. */
  const dansLaFamille = hauteurs.filter((h) => h.aMoi);
  const pire = dansLaFamille.length
    ? dansLaFamille.reduce((a, b) => (b.hauteur > a.hauteur ? b : a))
    : null;
  const horsFamille = hauteurs.filter((h) => !h.aMoi);

  console.log(
    `famille éditoriale : ${famille.length} page(s) recensées sur ${toutes.length} adresses, ` +
      `${ECHANTILLON.length} mesurées à ${LARGEURS.join(", ")} px.`,
  );
  if (pire) {
    console.log(
      `pire hauteur de la famille à 390 px, page telle qu'elle arrive (blocs repliés) : ` +
        `${pire.chemin} à ${pire.hauteur} px, soit ${(pire.hauteur / ECRAN).toFixed(1)} écrans ` +
        `de ${ECRAN} px.`,
    );
  }
  for (const h of horsFamille) {
    console.log(
      `pour mémoire, hors famille : ${h.chemin} à ${h.hauteur} px, ` +
        `soit ${(h.hauteur / ECRAN).toFixed(1)} écrans.`,
    );
  }
  console.log(
    `blocs repliables sur l'échantillon : ${pliablesVus} ; ` +
      `coupes déclarées (ellipse ou clamp) : ${clampsVus} ; ` +
      `contrastes indéterminés sur photo : ${indeterminesVus}.`,
  );

  if (signales.length > 0) {
    console.log(`\n${signales.length} signalement(s) NON BLOQUANT(S) :`);
    const vus = new Set();
    for (const s of signales) {
      const cle = s.replace(/\d+/g, "#");
      if (vus.has(cle)) continue;
      vus.add(cle);
      console.log(`  ${s}`);
    }
    console.log(
      "  (contrastes : arbitrage n° 7 de docs/PASSATION.md, la correction passe par la maquette.\n" +
        "   hors famille : entête, pied, barre basse et bandeau, portés par d'autres agents.)",
    );
  }

  if (bloquants.length > 0) {
    console.log(`\n${bloquants.length} DÉFAUT(S) BLOQUANT(S) dans la famille :`);
    const combien = DETAIL ? bloquants.length : 40;
    for (const b of bloquants.slice(0, combien)) console.log(`  ${b}`);
    if (bloquants.length > combien) {
      console.log(`  … et ${bloquants.length - combien} autre(s), --detail les montre tous`);
    }
    process.exit(1);
  }

  console.log("\nresponsive de la famille éditoriale conforme aux quatre largeurs.");
}

/*
 * LA PORTE NE S'EXÉCUTE QUE LANCÉE DIRECTEMENT, et ses règles sont exportées.
 *
 * Pourquoi : la mesure doit pouvoir être REJOUÉE par un relevé qui saute le
 * recensement des 248 adresses, qui tient la machine dix minutes. Les chiffres
 * d'avant et d'après se comparent alors au même étalon, puisque c'est la même
 * fonction. Sans ce garde, un simple `import` déclencherait la porte entière.
 *
 * `--controle` s'arrête après le témoin, et c'est voulu : il doit pouvoir se
 * lancer SANS serveur. Prouver qu'une porte sait échouer ne demande pas le
 * site, seulement un navigateur et les règles.
 */
const lanceeDirectement =
  process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (lanceeDirectement) {
  if (CONTROLE) await modeTemoin();
  else await modePorte();
}
