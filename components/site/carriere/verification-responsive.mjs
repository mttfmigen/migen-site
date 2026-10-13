/**
 * LE RESPONSIVE DE LA FAMILLE CARRIÈRE, mesuré dans un vrai navigateur.
 *
 *   node components/site/carriere/verification-responsive.mjs
 *   SITE_URL=http://localhost:4393 node components/site/carriere/verification-responsive.mjs
 *   node components/site/carriere/verification-responsive.mjs --controle
 *   node components/site/carriere/verification-responsive.mjs --journal=/tmp/mesure.json
 *
 * PÉRIMÈTRE : les 14 pages servies par `components/site/carriere/*` (le hub
 * `/carriere/`, gabarit 10) et `components/site/metier/*` (les 13 fiches du
 * gabarit 07). Ce sont les pages les plus longues du site.
 *
 * QUATRE LARGEURS, et chacune a sa raison : 320 px (le plus petit écran encore
 * en service), 360 px (Android médian), 390 px (iPhone depuis le 12), 768 px
 * (la bascule tablette, là où les règles `ck-*` du gabarit changent de
 * colonnes). Les quatre sont SOUS 880 px : le repli mobile s'y applique partout,
 * et c'est pour cela qu'on l'attend avant de mesurer.
 *
 * LES QUATRE RÈGLES QUI BLOQUENT :
 *
 *  1. DÉBORDEMENT : aucun élément plus large que SON HÔTE. On mesure l'ÉLÉMENT
 *     contre la boîte de contenu de son parent, et jamais `scrollWidth` du
 *     document : `.mg-site` est en `overflow-x: clip`, le document ne bouge
 *     donc JAMAIS d'un pixel, et un contrôle qui le regardait a déjà déclaré
 *     conformes 118 pages dont le bouton d'action faisait 409 px dans une
 *     fenêtre de 375. Un contrôle qui mesure la mauvaise chose est pire que pas
 *     de contrôle : il rassure.
 *
 *  2. CIBLE TACTILE : au moins 24 px, seuil EXACT du critère 2.5.8 de la
 *     WCAG 2.2 niveau AA. Les 44 px d'Apple sont une recommandation, pas une
 *     obligation. L'exemption par l'ESPACEMENT que la WCAG admet est honorée,
 *     et l'écart de la grille ou de la flexbox parente y compte : les listes de
 *     ce site sont des grilles à `gap`, donc des marges nulles.
 *
 *  3. TEXTE TRONQUÉ : aucun texte coupé par un `overflow: hidden`, une
 *     troncature à l'ellipse ou un `-webkit-line-clamp` qui ne tient pas.
 *
 *  4. VIDE SOUS UNE BASCULE OUVERTE : au plus 48 px entre la bascule et la
 *     première ENCRE du bloc qu'elle vient d'ouvrir. La maquette mobile en
 *     dessine 12. Mesuré à 132 px sur les 147 blocs de la famille avant
 *     correction : le `padding-top: var(--sec)` de la section, 120 px à toutes
 *     les largeurs sur ce gabarit, s'ajoutait sous une bascule qui séparait
 *     déjà les deux sections. Presque trois écrans de rien sur la fiche
 *     Formation et ses 18 blocs.
 *
 * DEUX RÈGLES QUI SIGNALENT SANS BLOQUER, et c'est délibéré :
 *
 *  · CHEVAUCHEMENTS entre deux textes en flux. Bloquant serait juste, mais
 *    aucune mesure n'en a trouvé : la règle reste armée et son témoin le prouve.
 *  · CONTRASTES sous AA (4,5:1 sur le texte courant, 3:1 sur un composant ou un
 *    grand texte). La maquette elle-même descend sous AA (boutons à 2,56:1,
 *    surtitres à 2,37:1) : c'est l'arbitrage ouvert n° 7 de `docs/PASSATION.md`,
 *    la fidélité est maintenue et la correction doit passer par la maquette
 *    d'abord. Les relever et les bloquer ici reviendrait à trancher à la place
 *    de Mehdi.
 *
 * LA PORTE REFUSE DE CONCLURE, et voici quand :
 *   · une page ne répond pas 200, ou son `<main>` est vide ;
 *   · le bandeau de consentement est encore là après le refus (il masquerait
 *     le bas de chaque page mesurée) ;
 *   · LE REPLI MOBILE N'EST PAS OBSERVÉ : les blocs sont servis OUVERTS par le
 *     serveur et refermés par un effet client sous 880 px. Mesurer avant
 *     l'hydratation, c'est mesurer une page qui n'existe pour personne, et
 *     c'est le piège qui a faussé toutes les hauteurs une première fois.
 *
 * `--controle` : le mode témoin. Il injecte une faute par règle, vérifie que
 * CHAQUE règle tombe sur SA faute, reconnue à l'identité du témoin, puis
 * injecte le jumeau conforme de chacune et vérifie qu'elle se taise. Une porte
 * qui n'a pas prouvé qu'elle sait échouer ne prouve rien quand elle passe.
 */
import { chromium } from "playwright";

const SITE = (process.env.SITE_URL ?? "http://localhost:4340").replace(/\/$/, "");
const LARGEURS = [320, 360, 390, 768];
const CIBLE_MINIMALE = 24;
const HAUTEUR_ECRAN = 844;
/* Le vide toléré entre une bascule et la première encre du bloc qu'elle ouvre.
   La maquette mobile en dessine 12 (`margin-top:12px` sous la bascule) ; 48 px
   laisse deux fois cette marge avant de crier. */
const VIDE_MAXIMAL = 48;
const LARGEUR_REFERENCE = 390;

/** Les 14 pages de la famille. Les cinq premières sont les plus longues. */
const PAGES = [
  "/carriere/",
  "/carriere/technicien-de-maintenance/",
  "/carriere/electromecanicien/",
  "/carriere/alternance/",
  "/carriere/technicien-de-maintenance/formation/",
  "/carriere/automaticien/",
  "/carriere/roboticien/",
  "/carriere/agent-de-maintenance/",
  "/carriere/responsable-maintenance/",
  "/carriere/technicien-itinerant/",
  "/carriere/automaticien/salaire/",
  "/carriere/electromecanicien/salaire/",
  "/carriere/electromecanicien/competences/",
  "/carriere/technicien-de-maintenance/salaire/",
];

const arguments_ = process.argv.slice(2);
const MODE_CONTROLE = arguments_.includes("--controle");
const JOURNAL = arguments_.find((a) => a.startsWith("--journal="))?.slice("--journal=".length);
const SEULEMENT = arguments_
  .find((a) => a.startsWith("--pages="))
  ?.slice("--pages=".length)
  .split(",")
  .filter(Boolean);
const PAGES_MESUREES = SEULEMENT?.length ? SEULEMENT : PAGES;

/* ====================================================================== */
/* La mesure, exécutée DANS la page.                                       */
/* ====================================================================== */

/**
 * Tout ce qui est relevé sur une page à une largeur.
 *
 * La fonction est sérialisée vers le navigateur : elle ne ferme sur rien et ne
 * dépend d'aucun module. Tous ses seuils arrivent en argument.
 */
const MESURE = ({ cibleMinimale, videMaximal }) => {
  const LARGEUR = window.innerWidth;
  const TOLERANCE = 1;

  const propre = (texte) =>
    (texte ?? "")
      .replace(/&nbsp;|[  ]/g, " ")
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  const nomme = (element) => {
    const classes =
      typeof element.className === "string" && element.className.trim()
        ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
        : "";
    const texte = propre(element.textContent).slice(0, 44);
    return `${element.tagName.toLowerCase()}${classes}${texte ? ` « ${texte} »` : ""}`;
  };

  /** Posé hors de l'écran exprès, ou réduit au point de mire des lecteurs. */
  const masqueExpres = (element, boite, style) => {
    if (boite.left < -1000) return true;
    if (boite.width <= 1 && boite.height <= 1) return true;
    if (style.clip === "rect(0px, 0px, 0px, 0px)") return true;
    if (style.position === "absolute" && style.overflow === "hidden" && boite.width <= 1) return true;
    return false;
  };

  /*
   * `checkVisibility` ET PAS UN TEST MAISON, et c'est la correction d'un défaut
   * que ma propre mesure portait.
   *
   * Un bloc repliable FERMÉ ne cache pas son contenu par `display: none` : les
   * navigateurs récents enveloppent tout sauf le `<summary>` dans le
   * pseudo-élément `::details-content` et lui posent `content-visibility:
   * hidden`. Or `content-visibility` NE S'HÉRITE PAS : chaque descendant d'un
   * bloc fermé a sa propre valeur `visible`, sa visibilité est `visible`, son
   * opacité vaut 1, et son rectangle est celui, figé, du saut de rendu. Un test
   * maison les laissait donc tous passer, tous à la même position : 1 793
   * « chevauchements » sur une seule fiche métier, 165 « contrastes », et des
   * débordements fantômes. Mesurés sur du contenu que personne n'affiche.
   *
   * `checkVisibility` connaît le saut de rendu, lui, et le dit.
   */
  const visible = (element) => {
    if (
      !element.checkVisibility({
        contentVisibilityAuto: true,
        opacityProperty: true,
        visibilityProperty: true,
      })
    )
      return null;
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) return null;
    const style = getComputedStyle(element);
    if (masqueExpres(element, boite, style)) return null;
    return { boite, style };
  };

  /** Un ancêtre qui DÉFILE à l'horizontale : un rail, il déborde par métier. */
  const dansUnRail = (element) => {
    for (let n = element.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const debordement = getComputedStyle(n).overflowX;
      if (debordement === "auto" || debordement === "scroll") return true;
    }
    return false;
  };

  /**
   * LA PART RÉELLEMENT PEINTE d'un élément, à l'horizontale.
   *
   * Un ornement qui sort de sa carte n'est pas un débordement : la carte le
   * rogne (`overflow: hidden`), personne ne le voit et personne ne peut le
   * balayer. Trois halos orangés en `position: absolute`, de 520 à 560 px de
   * large dans des cartes de 240, étaient comptés comme défauts.
   *
   * MAIS LE ROGNAGE DE LA PAGE ELLE-MÊME NE COMPTE PAS, et c'est tout le piège :
   * `.mg-site` est en `overflow-x: clip`. Le prendre pour un rognage légitime
   * rendrait acceptable n'importe quelle sortie d'écran, et c'est exactement
   * l'aveuglement qui a laissé passer 118 boutons de 409 px dans des fenêtres
   * de 375. Il est donc explicitement écarté, comme `html` et `body`.
   */
  const partPeinte = (element, boite) => {
    let gauche = boite.left;
    let droite = boite.right;
    for (let n = element.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      if (n === document.body) continue;
      if (n.classList.contains("mg-site")) continue;
      if (getComputedStyle(n).overflowX === "visible") continue;
      const r = n.getBoundingClientRect();
      const s = getComputedStyle(n);
      const nn = (v) => Number.parseFloat(v) || 0;
      gauche = Math.max(gauche, r.left + nn(s.borderLeftWidth));
      droite = Math.min(droite, r.right - nn(s.borderRightWidth));
    }
    return { gauche, droite };
  };

  /** La boîte de CONTENU d'un élément : son rectangle moins bordure et marge interne. */
  const boiteDeContenu = (element) => {
    const boite = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const n = (valeur) => Number.parseFloat(valeur) || 0;
    return {
      gauche: boite.left + n(style.borderLeftWidth) + n(style.paddingLeft),
      droite: boite.right - n(style.borderRightWidth) - n(style.paddingRight),
      haut: boite.top + n(style.borderTopWidth) + n(style.paddingTop),
      bas: boite.bottom - n(style.borderBottomWidth) - n(style.paddingBottom),
    };
  };

  /*
   * ------------------------------------------------------------ DÉBORDEMENTS
   *
   * L'HÔTE d'un élément en flux est la boîte de contenu de son parent ; l'hôte
   * d'un élément positionné hors du flux (`absolute`, `fixed`) est la FENÊTRE,
   * parce que son parent ne le contient plus et que seul l'écran le borne.
   * On ne regarde JAMAIS `document.documentElement.scrollWidth` : `.mg-site`
   * est en `overflow-x: clip`, il vaut la largeur de la fenêtre quoi qu'il
   * arrive.
   */
  const debordements = [];
  const coupables = [];
  for (const element of document.querySelectorAll("body *")) {
    const etat = visible(element);
    if (!etat) continue;
    const { boite, style } = etat;
    if (dansUnRail(element)) continue;
    /* Un élément déjà signalé emporte ses descendants : sinon un seul défaut
       de grille remonte vingt lignes et le vrai coupable se noie. */
    if (coupables.some((c) => c.contains(element))) continue;

    /* On ne juge que ce qui est PEINT : le reste est déjà rogné par sa carte. */
    const peinte = partPeinte(element, boite);
    if (peinte.droite - peinte.gauche <= 0) continue;

    const horsFlux = style.position === "absolute" || style.position === "fixed";
    const parent = element.parentElement;
    let hote;
    if (horsFlux || !parent || parent === document.body) {
      hote = { nom: "fenêtre", gauche: 0, droite: LARGEUR };
    } else {
      const contenu = boiteDeContenu(parent);
      /* Un parent qui ne borne rien à l'horizontale (hauteur nulle, parent
         en ligne) ne fait pas un hôte mesurable : la fenêtre reprend le rôle. */
      if (contenu.droite - contenu.gauche < 1) {
        hote = { nom: "fenêtre", gauche: 0, droite: LARGEUR };
      } else {
        hote = { nom: nomme(parent), gauche: contenu.gauche, droite: contenu.droite };
      }
    }

    const aDroite = Math.round(peinte.droite - hote.droite);
    const aGauche = Math.round(hote.gauche - peinte.gauche);
    const depasse = Math.max(aDroite, aGauche);
    if (depasse <= TOLERANCE) continue;

    coupables.push(element);
    debordements.push({
      element: nomme(element),
      hote: hote.nom,
      largeur: Math.round(boite.width),
      depasse,
      cote: aDroite >= aGauche ? "droite" : "gauche",
      dansMain: !!element.closest("main"),
    });
  }

  /*
   * ----------------------------------------------------------- CIBLES TACTILES
   */
  const ciblesTropPetites = [];
  for (const element of document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], summary',
  )) {
    const etat = visible(element);
    if (!etat) continue;
    const { boite, style } = etat;
    /*
     * LA WCAG EXEMPTE EXPLICITEMENT LE LIEN EN LIGNE DANS UNE PHRASE
     * (2.5.8, exception « Inline » : « la cible est dans une phrase, ou sa
     * taille est par ailleurs contrainte par l'interligne du texte qui n'est
     * pas la cible »). L'agrandir casserait l'interligne du texte qui le porte.
     *
     * LA PREMIÈRE VERSION EXIGEAIT UN ANCÊTRE `p`, `li` ou `td`, et c'était
     * trop étroit : `TexteRiche` rend le corpus dans un `<div>`, et les cinq
     * liens de la bande orange étaient signalés à 768 px pour 23 px de haut
     * alors qu'ils sont au milieu d'une phrase. On lit donc la CONDITION DE LA
     * NORME et non une liste de balises : l'élément est en ligne, et le bloc
     * qui le contient porte d'autre texte que le sien.
     */
    if (style.display === "inline") {
      let bloc = element.parentElement;
      while (bloc && getComputedStyle(bloc).display.startsWith("inline")) bloc = bloc.parentElement;
      const texteDuBloc = propre(bloc?.textContent).length;
      const texteDuLien = propre(element.textContent).length;
      if (bloc && texteDuBloc > texteDuLien) continue;
    }

    const parent = element.parentElement;
    const styleParent = parent ? getComputedStyle(parent) : null;
    const ecartParent =
      styleParent && /grid|flex/.test(styleParent.display)
        ? Math.min(Number.parseFloat(styleParent.rowGap) || 0, Number.parseFloat(styleParent.columnGap) || 0)
        : 0;
    const marge =
      (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0);
    /* La cible est atteignable si elle est assez grande, OU si l'espace libre
       autour d'elle porte le total à 24 px (exemption par l'espacement). */
    const hauteurUtile = boite.height + Math.max(marge, ecartParent);
    if (hauteurUtile >= cibleMinimale && boite.width >= cibleMinimale) continue;
    if (boite.height >= cibleMinimale && boite.width >= cibleMinimale) continue;
    ciblesTropPetites.push({
      element: nomme(element),
      largeur: Math.round(boite.width),
      hauteur: Math.round(boite.height),
      dansMain: !!element.closest("main"),
    });
  }

  /*
   * ------------------------------------------------------------ TEXTE TRONQUÉ
   *
   * Trois façons de couper un texte, et les trois comptent : le rognage par
   * `overflow`, la troncature à l'ellipse, et le nombre de lignes plafonné.
   */
  const porteDuTexte = (element) =>
    [...element.childNodes].some((n) => n.nodeType === 3 && propre(n.nodeValue).length > 0);

  const texteTronque = [];
  for (const element of document.querySelectorAll("body *")) {
    if (!porteDuTexte(element)) continue;
    const etat = visible(element);
    if (!etat) continue;
    const { style } = etat;
    const rogneX = style.overflowX === "hidden" || style.overflowX === "clip";
    const rogneY = style.overflowY === "hidden" || style.overflowY === "clip";
    const tropLarge = element.scrollWidth - element.clientWidth > TOLERANCE;
    const tropHaut = element.scrollHeight - element.clientHeight > TOLERANCE;
    const lignesPlafonnees = style.webkitLineClamp && style.webkitLineClamp !== "none";

    let cause = null;
    if (rogneX && tropLarge) cause = "rogné à l'horizontale";
    else if (style.textOverflow === "ellipsis" && tropLarge) cause = "tronqué à l'ellipse";
    else if (lignesPlafonnees && tropHaut) cause = `plafonné à ${style.webkitLineClamp} lignes`;
    else if (rogneY && tropHaut) cause = "rogné à la verticale";
    if (!cause) continue;

    texteTronque.push({
      element: nomme(element),
      cause,
      manque: Math.round(
        Math.max(element.scrollWidth - element.clientWidth, element.scrollHeight - element.clientHeight),
      ),
      dansMain: !!element.closest("main"),
    });
  }

  /*
   * ------------------------------------------------------------ CHEVAUCHEMENTS
   *
   * Entre deux FEUILLES de texte en flux. Les éléments positionnés hors du flux
   * sont écartés : un panneau qui se déplie par-dessus la page, une barre fixe
   * ou un bandeau se superposent par construction, et les compter ici
   * noierait le vrai défaut.
   */
  const feuilles = [];
  for (const element of document.querySelectorAll("body *")) {
    if (!porteDuTexte(element)) continue;
    const etat = visible(element);
    if (!etat) continue;
    if (etat.style.position !== "static" && etat.style.position !== "relative") continue;
    let horsFluxAuDessus = false;
    for (let n = element.parentElement; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n).position;
      if (p === "absolute" || p === "fixed" || p === "sticky") horsFluxAuDessus = true;
    }
    if (horsFluxAuDessus) continue;
    /*
     * UNE BOÎTE PAR LIGNE, et pas le rectangle d'ensemble.
     *
     * Le rectangle d'ensemble d'un élément EN LIGNE qui passe à la ligne est
     * l'union de ses lignes : il couvre toute la largeur du bloc sur plusieurs
     * hauteurs de ligne. Deux liens en ligne voisins, chacun sur sa ligne,
     * paraissent alors se chevaucher. C'est ce qui produisait 78 faux
     * chevauchements par page, tous dans la liste de villes du pied de page,
     * aucun visible à l'écran. `getClientRects()` donne une boîte par ligne.
     */
    feuilles.push({ element, lignes: [...element.getClientRects()], dansMain: !!element.closest("main") });
  }

  const chevauchements = [];
  for (let i = 0; i < feuilles.length; i += 1) {
    for (let j = i + 1; j < feuilles.length; j += 1) {
      const a = feuilles[i];
      const b = feuilles[j];
      if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
      let pire = null;
      for (const ra of a.lignes) {
        for (const rb of b.lignes) {
          const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (x <= 2 || y <= 2) continue;
          if (!pire || x * y > pire.x * pire.y) pire = { x, y };
        }
      }
      if (!pire) continue;
      chevauchements.push({
        premier: nomme(a.element),
        second: nomme(b.element),
        surface: `${Math.round(pire.x)}×${Math.round(pire.y)} px`,
        dansMain: a.dansMain && b.dansMain,
      });
    }
  }

  /*
   * ---------------------------------------------------------------- CONTRASTES
   */
  const canal = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, v, b]) => 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b);
  const rapport = (c1, c2) => {
    const l1 = luminance(c1);
    const l2 = luminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const lisCouleur = (valeur) => {
    const m = /^rgba?\(([^)]+)\)$/.exec(valeur ?? "");
    if (!m) return null;
    const parties = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parties.length < 3 || parties.some(Number.isNaN)) return null;
    return { rvb: parties.slice(0, 3), alpha: parties.length > 3 ? parties[3] : 1 };
  };
  const compose = (devant, derriere) =>
    devant.rvb.map((c, i) => c * devant.alpha + derriere[i] * (1 - devant.alpha));

  /** Le fond EFFECTIF derrière un élément, remonté jusqu'au premier opaque. */
  const fondDe = (element) => {
    let empilees = [];
    for (let n = element; n; n = n.parentElement) {
      const style = getComputedStyle(n);
      if (style.backgroundImage !== "none") return { indecidable: "image de fond" };
      const couleur = lisCouleur(style.backgroundColor);
      if (!couleur || couleur.alpha === 0) continue;
      empilees.push(couleur);
      if (couleur.alpha === 1) {
        let fond = couleur.rvb;
        for (let k = empilees.length - 2; k >= 0; k -= 1) fond = compose(empilees[k], fond);
        return { rvb: fond };
      }
    }
    return { indecidable: "aucun fond opaque" };
  };

  const contrastes = [];
  const indecidables = [];
  for (const { element, lignes, dansMain } of feuilles) {
    const boite = lignes[0];
    if (!boite) continue;
    const style = getComputedStyle(element);
    const couleur = lisCouleur(style.color);
    if (!couleur) continue;
    const fond = fondDe(element);
    if (fond.indecidable) {
      indecidables.push({ element: nomme(element), raison: fond.indecidable });
      continue;
    }
    const devant = compose(couleur, fond.rvb);
    const taille = Number.parseFloat(style.fontSize) || 16;
    const poids = Number.parseInt(style.fontWeight, 10) || 400;
    const grand = taille >= 24 || (taille >= 18.66 && poids >= 700);
    const seuil = grand ? 3 : 4.5;
    const mesure = rapport(devant, fond.rvb);
    if (mesure + 0.05 >= seuil) continue;
    contrastes.push({
      element: nomme(element),
      rapport: Math.round(mesure * 100) / 100,
      seuil,
      taille: Math.round(taille * 10) / 10,
      dansMain,
    });
  }

  /* Les COMPOSANTS : seuil 3:1 sur la frontière qui les dessine. On compare le
     fond du contrôle à celui de ce qui l'entoure ; s'il n'en diffère pas, c'est
     son filet qui porte la forme, et c'est lui qu'on mesure. */
  for (const element of document.querySelectorAll(
    'button, input:not([type="hidden"]), select, textarea, [role="button"]',
  )) {
    const etat = visible(element);
    if (!etat) continue;
    const style = etat.style;
    if (style.backgroundImage !== "none") continue;
    const autour = element.parentElement ? fondDe(element.parentElement) : { indecidable: "racine" };
    if (autour.indecidable) continue;
    const propreAuControle = lisCouleur(style.backgroundColor);
    const filet = lisCouleur(style.borderTopColor);
    const epaisseur = Number.parseFloat(style.borderTopWidth) || 0;
    let devant = null;
    let quoi = null;
    if (propreAuControle && propreAuControle.alpha > 0) {
      const compose_ = compose(propreAuControle, autour.rvb);
      if (rapport(compose_, autour.rvb) > 1.02) {
        devant = compose_;
        quoi = "son fond";
      }
    }
    if (!devant && filet && filet.alpha > 0 && epaisseur >= 1) {
      devant = compose(filet, autour.rvb);
      quoi = "son filet";
    }
    if (!devant) continue;
    const mesure = rapport(devant, autour.rvb);
    if (mesure + 0.05 >= 3) continue;
    contrastes.push({
      element: nomme(element),
      rapport: Math.round(mesure * 100) / 100,
      seuil: 3,
      composant: quoi,
      dansMain: !!element.closest("main"),
    });
  }

  /*
   * ------------------------------------------- LE VIDE SOUS UNE BASCULE
   *
   * La distance entre une bascule OUVERTE et la première encre du contenu
   * qu'elle vient de montrer. Mesurée, et non supposée : 132 px sur chacun des
   * 147 blocs de la famille, soit presque trois écrans de rien sur la fiche
   * Formation et ses 18 blocs. Un titre séparé de son propre contenu par un
   * tiers d'écran ne se lit pas comme un titre.
   *
   * L'ENCRE, et pas la première boîte : une `<section>` sans fond ni filet ne
   * peint rien, et son rectangle commence juste sous la bascule. La chercher
   * aurait donné 9 px et déclaré le défaut absent.
   */
  const videSousBascule = [];
  for (const bloc of document.querySelectorAll("details[data-pliable-mobile]")) {
    if (!bloc.open) continue;
    const bascule = bloc.querySelector(":scope > summary");
    /* Au-dessus de 880 px la bascule est en `display: none` : rien à mesurer. */
    if (!bascule || !visible(bascule)) continue;
    const corps = bascule.nextElementSibling;
    if (!corps) continue;
    let encre = null;
    for (const e of corps.querySelectorAll("*")) {
      const etat = visible(e);
      if (!etat) continue;
      if (etat.boite.height < 4 || etat.boite.width < 4) continue;
      const feuille = [...e.childNodes].some((n) => n.nodeType === 3 && propre(n.nodeValue));
      const remplie =
        etat.style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        etat.style.backgroundImage !== "none" ||
        (Number.parseFloat(etat.style.borderTopWidth) || 0) > 0;
      if (!feuille && !remplie && e.tagName !== "IMG") continue;
      encre = etat.boite;
      break;
    }
    if (!encre) continue;
    const vide = Math.round(encre.top - bascule.getBoundingClientRect().bottom);
    if (vide <= videMaximal) continue;
    videSousBascule.push({
      element: nomme(bascule),
      vide,
      dansMain: !!bloc.closest("main"),
    });
  }

  /* ------------------------------------------------------- état de la page */
  const principal = document.querySelector("main");
  const pliables = document.querySelectorAll("details[data-pliable-mobile]");
  /* LE BANDEAU DE CONSENTEMENT, et on cherche un bouton VISIBLE. Le panneau
     « Personnaliser » porte lui aussi un « Tout refuser », rendu mais masqué,
     et le chercher sans regarder sa visibilité faisait refuser la porte sur
     les huit mesures : le bandeau était bien parti. */
  const bandeau = [...document.querySelectorAll("button")].some(
    (b) => propre(b.textContent) === "Tout refuser" && visible(b) !== null,
  );

  return {
    largeur: LARGEUR,
    hauteur: document.documentElement.scrollHeight,
    sections: principal ? principal.querySelectorAll("section").length : 0,
    h1: document.querySelectorAll("h1").length,
    pliables: pliables.length,
    pliablesOuverts: [...pliables].filter((d) => d.open).length,
    bandeauPresent: bandeau,
    debordements,
    ciblesTropPetites,
    texteTronque,
    chevauchements,
    contrastes,
    videSousBascule,
    indecidables: indecidables.length,
  };
};

/* ====================================================================== */
/* Le pilotage du navigateur.                                              */
/* ====================================================================== */

/**
 * « Tout refuser », l'option la plus protectrice, et la pastille de Next.
 *
 * ON RÉESSAIE JUSQU'À CE QUE LE BANDEAU PARTE, et ce n'est pas de la prudence
 * décorative. Le bandeau est un composant CLIENT : un clic envoyé avant son
 * hydratation ne déclenche rien du tout. Un seul clic suivi de 250 ms a marché
 * sur deux pages, puis a échoué sur les 56 mesures d'affilée dès que la machine
 * a été chargée par le parcours complet. La porte a refusé de conclure, et elle
 * avait raison : c'était l'instrument qui était en retard, pas le site.
 */
async function neutraliseArtefacts(page) {
  await page.addStyleTag({ content: "nextjs-portal{display:none !important}" }).catch(() => {});
  const visibleEtRefus = () =>
    page
      .evaluate(() => {
        const bouton = [...document.querySelectorAll("button")].find(
          (b) =>
            (b.innerText || "").replace(/\s+/g, " ").trim() === "Tout refuser" &&
            b.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true }),
        );
        if (!bouton) return false;
        bouton.click();
        return true;
      })
      .catch(() => false);

  for (let essai = 0; essai < 40; essai += 1) {
    const restait = await visibleEtRefus();
    await page.waitForTimeout(250);
    if (!restait) return;
  }
}

/**
 * ATTENDRE L'HYDRATATION, et le prouver.
 *
 * Les blocs repliables sont servis `open` par le serveur et refermés par un
 * effet client sous 880 px. Mesurer avant, c'est mesurer une page que personne
 * ne voit : c'est le piège qui a faussé toutes les hauteurs la première fois.
 * On attend donc que le compte de blocs OUVERTS se stabilise, et on exige qu'au
 * moins un se soit refermé quand la page en porte plus d'un.
 */
async function attendLeRepli(page) {
  const etat = await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    const compte = () => {
      const tous = document.querySelectorAll("details[data-pliable-mobile]");
      return { total: tous.length, ouverts: [...tous].filter((d) => d.open).length };
    };
    let precedent = compte();
    let stable = 0;
    for (let i = 0; i < 40 && stable < 3; i += 1) {
      await dort(120);
      const maintenant = compte();
      stable = maintenant.ouverts === precedent.ouverts ? stable + 1 : 0;
      precedent = maintenant;
    }
    return precedent;
  });
  return etat;
}

/**
 * Défile toute la page : images paresseuses et révélations au défilement.
 *
 * LA HAUTEUR EST LUE UNE SEULE FOIS, et le nombre de pas est plafonné. La
 * première version relisait `document.body.scrollHeight` à chaque tour : les
 * révélations au défilement font grandir la page pendant qu'on la parcourt, et
 * sur le hub carrière à 320 px (la page la plus longue du site) la boucle ne
 * s'arrêtait jamais. Trente minutes de mesure perdues avant de le voir.
 */
async function laisseSePoser(page) {
  await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    const PAS = 700;
    const PLAFOND = 120;
    const hauteur = document.body.scrollHeight;
    const pas = Math.min(Math.ceil(hauteur / PAS), PLAFOND);
    for (let i = 0; i <= pas; i += 1) {
      window.scrollTo(0, i * PAS);
      await dort(25);
    }
    window.scrollTo(0, 0);
    await dort(250);
  });
  /* Une image encore en vol se mesure à zéro et se déclarerait cassée :
     on attend son décodage, jamais son seul `complete`. Avec un délai de
     garde : une image qui ne décodera jamais ne doit pas tenir la mesure. */
  await page
    .evaluate(() => {
      const garde = new Promise((r) => setTimeout(r, 4000));
      const toutes = Promise.all(
        [...document.images].map((img) => img.decode().catch(() => undefined)),
      );
      return Promise.race([toutes, garde]).then(() => undefined);
    })
    .catch(() => {});
}

const refus = [];
const releves = [];

async function mesureUnePage(contexte, chemin, largeur) {
  const page = await contexte.newPage();
  await page.setViewportSize({ width: largeur, height: HAUTEUR_ECRAN });
  let reponse;
  try {
    reponse = await page.goto(`${SITE}${chemin}`, { waitUntil: "load", timeout: 180000 });
  } catch (erreur) {
    refus.push(`${chemin} à ${largeur} px : la page n'a pas chargé (${erreur.message.split("\n")[0]})`);
    await page.close();
    return null;
  }
  if (!reponse || reponse.status() !== 200) {
    refus.push(`${chemin} à ${largeur} px : réponse ${reponse ? reponse.status() : "nulle"}`);
    await page.close();
    return null;
  }
  /*
   * LE REPLI D'ABORD, LE BANDEAU ENSUITE, et l'ordre est la correction d'un
   * second défaut de l'instrument.
   *
   * Le bandeau de consentement est un composant CLIENT : tant que React n'a pas
   * hydraté la page, son bouton est du HTML inerte et le clic ne déclenche
   * rien. Sur ces pages de 15 000 à 30 000 px, hydratées en mode développement
   * sur une machine chargée par trois autres chantiers, l'hydratation prend
   * plusieurs secondes : les 56 mesures ont refusé de conclure, bandeau encore
   * à l'écran, alors que deux pages seules passaient.
   *
   * Le repli des blocs est, lui, la PREUVE que le client a tourné : c'est le
   * même React qui le produit. On l'attend donc avant de cliquer, et le clic
   * porte.
   */
  const repli = await attendLeRepli(page);
  await neutraliseArtefacts(page);
  await laisseSePoser(page);

  /*
   * DEUX ÉTATS, DEUX MESURES, et il faut les deux.
   *
   * REPLIÉ, c'est la page à l'arrivée : c'est d'elle que vient la hauteur, et
   * c'est la seule qui dise si le repli a bien eu lieu.
   *
   * DÉPLIÉ, c'est la page une fois les blocs ouverts au doigt, et sans cette
   * seconde passe la porte serait aveugle sur presque tout : un bloc fermé
   * saute son rendu, et un débordement, une cible trop petite ou un texte
   * tronqué qui vivent dedans ne se mesurent pas. Sur les treize fiches
   * métier, le contenu replié est de huit à quatorze sections sur quinze.
   */
  let replie;
  try {
    replie = await page.evaluate(MESURE, { cibleMinimale: CIBLE_MINIMALE, videMaximal: VIDE_MAXIMAL });
  } catch (erreur) {
    refus.push(`${chemin} à ${largeur} px : la mesure repliée a échoué (${erreur.message.split("\n")[0]})`);
    await page.close();
    return null;
  }

  await page.evaluate(() => {
    for (const bloc of document.querySelectorAll("details[data-pliable-mobile]")) bloc.open = true;
  });
  await page.waitForTimeout(300);
  await laisseSePoser(page);
  let deplie;
  try {
    deplie = await page.evaluate(MESURE, { cibleMinimale: CIBLE_MINIMALE, videMaximal: VIDE_MAXIMAL });
  } catch (erreur) {
    refus.push(`${chemin} à ${largeur} px : la mesure dépliée a échoué (${erreur.message.split("\n")[0]})`);
    await page.close();
    return null;
  }
  await page.close();

  /* Les défauts des deux états, chacun marqué de l'état où il se voit. Un
     défaut vu dans les deux ne compte qu'une fois : c'est le même. */
  const fusionne = (cle) => {
    const vus = new Map();
    for (const [etat, mesure] of [
      ["replié", replie],
      ["déplié", deplie],
    ]) {
      for (const defaut of mesure[cle]) {
        const signature = JSON.stringify(defaut);
        if (vus.has(signature)) continue;
        vus.set(signature, { ...defaut, etat });
      }
    }
    return [...vus.values()];
  };

  const mesure = {
    largeur: replie.largeur,
    hauteur: replie.hauteur,
    hauteurDepliee: deplie.hauteur,
    sections: replie.sections,
    h1: replie.h1,
    pliables: replie.pliables,
    pliablesOuverts: replie.pliablesOuverts,
    bandeauPresent: replie.bandeauPresent,
    debordements: fusionne("debordements"),
    ciblesTropPetites: fusionne("ciblesTropPetites"),
    texteTronque: fusionne("texteTronque"),
    chevauchements: fusionne("chevauchements"),
    contrastes: fusionne("contrastes"),
    /* Le vide ne se mesure QUE déplié : replié, il n'y a pas de contenu à
       éloigner, et le relevé replié est vide par construction. */
    videSousBascule: deplie.videSousBascule.map((d) => ({ ...d, etat: "déplié" })),
  };

  if (process.env.BAVARD) {
    process.stdout.write(
      `   ${String(largeur).padStart(4)} px ${chemin.padEnd(48)} ` +
        `${mesure.debordements.length}d ${mesure.ciblesTropPetites.length}c ` +
        `${mesure.texteTronque.length}t ${mesure.chevauchements.length}x ` +
        `${mesure.contrastes.length}@ ` +
        `${Math.round((mesure.hauteur / HAUTEUR_ECRAN) * 10) / 10}é replié, ` +
        `${Math.round((mesure.hauteurDepliee / HAUTEUR_ECRAN) * 10) / 10}é déplié\n`,
    );
  }

  /* ------- les conditions de REFUS DE CONCLURE, page par page et largeur par largeur */
  if (mesure.sections === 0) refus.push(`${chemin} à ${largeur} px : le <main> ne porte aucune section`);
  if (mesure.h1 !== 1) refus.push(`${chemin} à ${largeur} px : ${mesure.h1} <h1> au lieu d'un`);
  if (mesure.bandeauPresent)
    refus.push(`${chemin} à ${largeur} px : le bandeau de consentement est encore là après « Tout refuser »`);
  if (repli.total > 1 && repli.ouverts === repli.total)
    refus.push(
      `${chemin} à ${largeur} px : REPLI MOBILE NON OBSERVÉ, ${repli.total} blocs repliables tous encore ouverts ` +
        `(hydratation non atteinte : la mesure porterait sur une page que personne ne voit)`,
    );

  return { chemin, ...mesure, repli };
}

/* ====================================================================== */
/* Le mode témoin.                                                         */
/* ====================================================================== */

/**
 * CINQ FAUTES, CINQ JUMEAUX CONFORMES.
 *
 * Chaque témoin porte une identité unique dans son texte : c'est à elle qu'on
 * le reconnaît dans le relevé. Une faute qui ferait tomber la règle VOISINE ne
 * prouverait rien sur la règle visée, et c'est précisément le piège que cette
 * vérification ferme.
 */
const TEMOINS = [
  {
    nom: "débordement",
    regle: "debordements",
    marque: "TEMOIN-DEBORDEMENT",
    faute: `
      <section id="t-deb" style="max-width:1200px;margin:0 auto;padding:0 40px">
        <div style="width:100%;background:#fff">
          <div style="width:180%;background:#eee">TEMOIN-DEBORDEMENT</div>
        </div>
      </section>`,
    conforme: `
      <section id="t-deb" style="max-width:1200px;margin:0 auto;padding:0 40px">
        <div style="width:100%;background:#fff">
          <div style="width:100%;background:#eee">TEMOIN-DEBORDEMENT</div>
        </div>
      </section>`,
  },
  {
    nom: "cible tactile",
    regle: "ciblesTropPetites",
    marque: "TEMOIN-CIBLE",
    faute: `
      <section id="t-cib" style="padding:40px">
        <div style="display:block">
          <a href="/carriere/" style="display:block;width:14px;height:14px;overflow:hidden;font-size:6px;line-height:1;margin:0">TEMOIN-CIBLE</a>
        </div>
      </section>`,
    conforme: `
      <section id="t-cib" style="padding:40px">
        <div style="display:block">
          <a href="/carriere/" style="display:block;width:120px;height:44px;font-size:14px;margin:0">TEMOIN-CIBLE</a>
        </div>
      </section>`,
  },
  {
    nom: "texte tronqué",
    regle: "texteTronque",
    marque: "TEMOIN-TRONQUE",
    faute: `
      <section id="t-tro" style="padding:40px">
        <div style="width:160px;height:18px;overflow:hidden;font-size:15px;line-height:18px;white-space:nowrap;background:#fff;color:#111">TEMOIN-TRONQUE une phrase bien plus longue que sa boite ne peut en montrer</div>
      </section>`,
    conforme: `
      <section id="t-tro" style="padding:40px">
        <div style="width:160px;overflow:hidden;font-size:15px;line-height:18px;background:#fff;color:#111">TEMOIN-TRONQUE</div>
      </section>`,
  },
  {
    nom: "chevauchement",
    regle: "chevauchements",
    marque: "TEMOIN-CHEVAUCHEMENT",
    faute: `
      <section id="t-che" style="padding:40px;background:#fff;color:#111">
        <div style="height:40px;font-size:15px">TEMOIN-CHEVAUCHEMENT premier</div>
        <div style="height:40px;font-size:15px;margin-top:-30px">TEMOIN-CHEVAUCHEMENT second</div>
      </section>`,
    conforme: `
      <section id="t-che" style="padding:40px;background:#fff;color:#111">
        <div style="height:40px;font-size:15px">TEMOIN-CHEVAUCHEMENT premier</div>
        <div style="height:40px;font-size:15px;margin-top:10px">TEMOIN-CHEVAUCHEMENT second</div>
      </section>`,
  },
  {
    nom: "contraste",
    regle: "contrastes",
    marque: "TEMOIN-CONTRASTE",
    faute: `
      <section id="t-con" style="padding:40px;background:#ffffff">
        <p style="color:#bdbdbd;font-size:15px;font-weight:400">TEMOIN-CONTRASTE</p>
      </section>`,
    conforme: `
      <section id="t-con" style="padding:40px;background:#ffffff">
        <p style="color:#111111;font-size:15px;font-weight:400">TEMOIN-CONTRASTE</p>
      </section>`,
  },
  {
    nom: "vide sous bascule",
    regle: "videSousBascule",
    marque: "TEMOIN-VIDE",
    /* Le vide est posé en `margin-top` sur un div, et non en `padding-top` sur
       une `<section>` : la correction de ce défaut remet justement ce padding à
       zéro, et un témoin que la correction efface ne prouverait plus rien. */
    faute: `
      <details data-pliable-mobile open>
        <summary style="display:flex;align-items:center;gap:12px"><span>TEMOIN-VIDE bascule</span></summary>
        <div><div style="margin-top:130px"><p style="color:#111;font-size:15px;margin:0">TEMOIN-VIDE contenu</p></div></div>
      </details>`,
    conforme: `
      <details data-pliable-mobile open>
        <summary style="display:flex;align-items:center;gap:12px"><span>TEMOIN-VIDE bascule</span></summary>
        <div><div style="margin-top:12px"><p style="color:#111;font-size:15px;margin:0">TEMOIN-VIDE contenu</p></div></div>
      </details>`,
  },
];

/**
 * LES CONTRÔLES NÉGATIFS QUI NE SONT PAS DE SIMPLES JUMEAUX.
 *
 * Chacun est une forme qui RESSEMBLE à une faute et n'en est pas. Ils gardent
 * la porte honnête dans l'autre sens : une règle qui crie sur eux ferait du
 * bruit, le bruit se trie à la main, et une porte qu'on trie à la main finit
 * par être ignorée. Le premier est celui qui m'a coûté trois faux défauts :
 * l'ornement en halo que sa carte rogne.
 */
const CONTROLES_NEGATIFS = [
  {
    nom: "halo rogné par sa carte",
    regle: "debordements",
    marque: "NEGATIF-HALO",
    html: `
      <section style="max-width:1200px;margin:0 auto;padding:0 40px">
        <div style="position:relative;overflow:hidden;border-radius:28px;padding:32px;background:#121110;color:#fff">
          <div style="position:absolute;width:520px;height:520px;right:-180px;top:-200px;background:radial-gradient(circle,rgba(255,124,60,.3),transparent 68%);pointer-events:none"></div>
          <div style="position:relative">NEGATIF-HALO</div>
        </div>
      </section>`,
  },
  {
    nom: "tableau dans son rail",
    regle: "debordements",
    marque: "NEGATIF-RAIL",
    html: `
      <section style="max-width:1200px;margin:0 auto;padding:0 40px">
        <div style="overflow-x:auto;background:#fff">
          <table style="width:100%;min-width:560px;border-collapse:collapse">
            <tbody><tr><td style="color:#111;font-size:14px">NEGATIF-RAIL</td></tr></tbody>
          </table>
        </div>
      </section>`,
  },
  {
    nom: "lien en ligne dans un paragraphe",
    regle: "ciblesTropPetites",
    marque: "NEGATIF-LIEN",
    html: `
      <section style="max-width:1200px;margin:0 auto;padding:0 40px">
        <p style="font:400 15px/1.6 sans-serif;color:#111">Un texte avec <a href="/carriere/" style="display:inline;font-size:15px">NEGATIF-LIEN</a> dedans.</p>
      </section>`,
  },
  {
    /* Le même, SANS `<p>` : c'est la forme que rend `TexteRiche`, et c'est
       elle que la première version de la règle condamnait à tort. */
    nom: "lien en ligne dans un div",
    regle: "ciblesTropPetites",
    marque: "NEGATIF-LIEN-DIV",
    html: `
      <section style="max-width:1200px;margin:0 auto;padding:0 40px">
        <div style="font:500 16px/1.6 sans-serif;color:#111">Une phrase de la bande orange qui renvoie vers <a href="/carriere/" style="display:inline;font-weight:600">NEGATIF-LIEN-DIV</a> au fil du texte.</div>
      </section>`,
  },
  {
    /* Un bloc FERMÉ ne montre rien : son vide ne se mesure pas, et le compter
       signalerait les 147 blocs de la famille à chaque arrivée sur une page. */
    nom: "bloc fermé, rien à mesurer",
    regle: "videSousBascule",
    marque: "NEGATIF-FERME",
    html: `
      <details data-pliable-mobile>
        <summary style="display:flex;align-items:center;gap:12px"><span>NEGATIF-FERME bascule</span></summary>
        <div><div style="margin-top:130px"><p style="color:#111;font-size:15px;margin:0">NEGATIF-FERME contenu</p></div></div>
      </details>`,
  },
];

async function joueLesControlesNegatifs(page) {
  let tout = true;
  for (const controle of CONTROLES_NEGATIFS) {
    await page.evaluate(
      ({ html }) => {
        document.getElementById("temoin-injecte")?.remove();
        const hote = document.createElement("div");
        hote.id = "temoin-injecte";
        hote.innerHTML = html;
        document.querySelector("main")?.append(hote);
      },
      { html: controle.html },
    );
    const mesure = await page.evaluate(MESURE, { cibleMinimale: CIBLE_MINIMALE, videMaximal: VIDE_MAXIMAL });
    const crie = JSON.stringify(mesure[controle.regle] ?? []).includes(controle.marque);
    if (crie) tout = false;
    console.log(
      `  ${crie ? "✘" : "✔"} ${controle.nom.padEnd(32)} ` +
        `${crie ? `CRIE à tort sur ${controle.regle}` : `${controle.regle} se tait, c'est juste`}`,
    );
  }
  return tout;
}

async function joueLesTemoins(contexte) {
  const page = await contexte.newPage();
  await page.setViewportSize({ width: LARGEUR_REFERENCE, height: HAUTEUR_ECRAN });
  const reponse = await page.goto(`${SITE}/carriere/`, { waitUntil: "load", timeout: 180000 });
  if (!reponse || reponse.status() !== 200) {
    console.log(`TÉMOIN IMPOSSIBLE : /carriere/ répond ${reponse ? reponse.status() : "rien"}.`);
    await page.close();
    return false;
  }
  await neutraliseArtefacts(page);
  await attendLeRepli(page);

  let tout = true;
  for (const temoin of TEMOINS) {
    for (const sens of ["faute", "conforme"]) {
      await page.evaluate(
        ({ html }) => {
          document.getElementById("temoin-injecte")?.remove();
          const hote = document.createElement("div");
          hote.id = "temoin-injecte";
          hote.innerHTML = html;
          document.querySelector("main")?.append(hote);
        },
        { html: temoin[sens] },
      );
      const mesure = await page.evaluate(MESURE, { cibleMinimale: CIBLE_MINIMALE, videMaximal: VIDE_MAXIMAL });
      const dansSaRegle = JSON.stringify(mesure[temoin.regle] ?? []).includes(temoin.marque);
      const attendu = sens === "faute";
      const ok = dansSaRegle === attendu;
      if (!ok) tout = false;
      const verbe = attendu
        ? ok
          ? "TOMBE sur sa faute"
          : "N'A PAS VU sa faute"
        : ok
          ? "se tait sur le jumeau conforme"
          : "CRIE sur le jumeau conforme";
      console.log(`  ${ok ? "✔" : "✘"} ${temoin.nom.padEnd(16)} ${verbe}`);
      /* La faute ne doit pas être reconnue par une AUTRE règle sans l'être par
         la sienne : on le dit, parce qu'un témoin qui tombe à côté ne prouve rien. */
      if (attendu && !dansSaRegle) {
        const ailleurs = Object.entries(mesure)
          .filter(([cle, v]) => cle !== temoin.regle && Array.isArray(v) && JSON.stringify(v).includes(temoin.marque))
          .map(([cle]) => cle);
        if (ailleurs.length) console.log(`      (vu seulement par : ${ailleurs.join(", ")} : ne prouve rien)`);
      }
    }
  }
  console.log("  : contrôles négatifs : des formes qui ressemblent à des fautes");
  if (!(await joueLesControlesNegatifs(page))) tout = false;

  await page.evaluate(() => document.getElementById("temoin-injecte")?.remove());
  await page.close();
  return tout;
}

/* ====================================================================== */
/* Exécution.                                                              */
/* ====================================================================== */

const navigateur = await chromium.launch({ channel: "chrome" });
const contexte = await navigateur.newContext({ deviceScaleFactor: 1 });

console.log(`\nRESPONSIVE DE LA FAMILLE CARRIÈRE, ${SITE}`);
console.log(`${PAGES_MESUREES.length} pages × ${LARGEURS.join(", ")} px\n`);

console.log("0. LA PORTE SAIT-ELLE ÉCHOUER ? (témoins et contrôles négatifs)");
const temoinsVerts = await joueLesTemoins(contexte);
if (!temoinsVerts) {
  console.log("\nREFUS DE CONCLURE : un témoin n'a pas fait tomber sa règle. La porte est aveugle.\n");
  await navigateur.close();
  process.exit(1);
}
console.log("   les six règles savent échouer, et se taisent sur le conforme.\n");

if (MODE_CONTROLE) {
  console.log("Mode --controle : les témoins seuls. Rien d'autre n'est mesuré.\n");
  await navigateur.close();
  process.exit(0);
}

for (const largeur of LARGEURS) {
  for (const chemin of PAGES_MESUREES) {
    const releve = await mesureUnePage(contexte, chemin, largeur);
    if (releve) releves.push(releve);
  }
  const aCetteLargeur = releves.filter((r) => r.largeur === largeur);
  const total = (cle) =>
    aCetteLargeur.reduce((n, r) => n + r[cle].filter((d) => d.dansMain).length, 0);
  const dehors = (cle) =>
    aCetteLargeur.reduce((n, r) => n + r[cle].filter((d) => !d.dansMain).length, 0);
  console.log(
    `${String(largeur).padStart(4)} px : ` +
      `${total("debordements")} débordement(s), ` +
      `${total("ciblesTropPetites")} cible(s) < ${CIBLE_MINIMALE} px, ` +
      `${total("texteTronque")} texte(s) tronqué(s), ` +
      `${total("videSousBascule")} vide(s) sous bascule, ` +
      `${total("chevauchements")} chevauchement(s), ` +
      `${total("contrastes")} contraste(s) sous AA` +
      `   [hors <main> : ${dehors("debordements")}d ${dehors("ciblesTropPetites")}c ` +
      `${dehors("texteTronque")}t ${dehors("videSousBascule")}v ` +
      `${dehors("chevauchements")}x ${dehors("contrastes")}@]`,
  );
}

await navigateur.close();

/* ------------------------------------------------------------- le détail */
const BLOQUANTS = ["debordements", "ciblesTropPetites", "texteTronque", "videSousBascule"];
const LIBELLE = {
  debordements: "DÉBORDEMENTS (élément plus large que son hôte)",
  ciblesTropPetites: `CIBLES TACTILES SOUS ${CIBLE_MINIMALE} px`,
  texteTronque: "TEXTE TRONQUÉ",
  videSousBascule: `VIDE SOUS UNE BASCULE OUVERTE, PLUS DE ${VIDE_MAXIMAL} px`,
  chevauchements: "CHEVAUCHEMENTS",
  contrastes: "CONTRASTES SOUS AA",
};

for (const cle of [...BLOQUANTS, "chevauchements", "contrastes"]) {
  /* HORS DU `<main>`, CE N'EST PAS MA FAMILLE : l'entête et le pied de page
     sont communs aux 248 pages et tenus par d'autres. Ils sont comptés et
     nommés à part, et ils ne ferment pas cette porte : une porte qui échoue
     sur ce que son propriétaire ne peut pas corriger finit désarmée. */
  const lignes = releves.flatMap((r) =>
    r[cle].filter((d) => d.dansMain).map((d) => ({ ...d, chemin: r.chemin, largeur: r.largeur })),
  );
  if (!lignes.length) continue;
  console.log(`\n${LIBELLE[cle]} : ${lignes.length}`);
  const vues = new Set();
  for (const ligne of lignes) {
    const signature = `${ligne.chemin}|${ligne.element ?? ligne.premier}|${ligne.hote ?? ligne.cause ?? ligne.rapport ?? ""}`;
    const marque = vues.has(signature) ? " (aussi à d'autres largeurs)" : "";
    if (vues.has(signature)) continue;
    vues.add(signature);
    const detail =
      cle === "debordements"
        ? `dépasse de ${ligne.depasse} px à ${ligne.cote} de ${ligne.hote} (il fait ${ligne.largeur} px)`
        : cle === "ciblesTropPetites"
          ? `${ligne.largeur}×${ligne.hauteur} px`
          : cle === "texteTronque"
            ? `${ligne.cause}, ${ligne.manque} px manquants`
            : cle === "videSousBascule"
              ? `${ligne.vide} px de vide avant la première encre`
            : cle === "chevauchements"
              ? `recouvre ${ligne.second} sur ${ligne.surface}`
              : `${ligne.rapport}:1 pour un seuil de ${ligne.seuil}:1${ligne.composant ? ` (${ligne.composant})` : ""}`;
    console.log(`  ${String(ligne.largeur).padStart(4)} px ${ligne.chemin} [${ligne.etat}]`);
    console.log(`         ${ligne.element ?? ligne.premier} : ${detail}${marque}`);
  }
}

/* --------------------------------------------------- hauteur et repli mobile */
const aLaReference = releves.filter((r) => r.largeur === LARGEUR_REFERENCE);
const pire = aLaReference.slice().sort((a, b) => b.hauteur - a.hauteur)[0];
if (pire) {
  console.log(
    `\nHAUTEUR À ${LARGEUR_REFERENCE} px, repli appliqué : pire page ${pire.chemin}, ` +
      `${pire.hauteur} px, soit ${(pire.hauteur / HAUTEUR_ECRAN).toFixed(1)} écrans de ${HAUTEUR_ECRAN} px`,
  );
  for (const r of aLaReference.slice().sort((a, b) => b.hauteur - a.hauteur).slice(0, 6)) {
    console.log(
      `  ${(r.hauteur / HAUTEUR_ECRAN).toFixed(1).padStart(5)} écrans  ${r.chemin}` +
        `  (${r.pliablesOuverts}/${r.pliables} blocs ouverts)`,
    );
  }
}
const blocs = aLaReference.reduce((n, r) => n + r.pliables, 0);
console.log(`\nBLOCS REPLIABLES DE LA FAMILLE, à ${LARGEUR_REFERENCE} px : ${blocs}`);

if (JOURNAL) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(JOURNAL, JSON.stringify({ site: SITE, releves }, null, 2));
  console.log(`Relevé complet écrit dans ${JOURNAL}`);
}

/* ---------------------------------------------------------------- verdict */
if (refus.length) {
  console.log(`\nREFUS DE CONCLURE : ${refus.length} page(s) n'ont pas répondu correctement :`);
  for (const r of refus) console.log(`  · ${r}`);
  console.log(
    "\nUne porte qui conclut sur une page muette ment. Rien n'est déclaré conforme ici.\n",
  );
  process.exit(2);
}

const manquantes = PAGES_MESUREES.length * LARGEURS.length - releves.length;
if (manquantes !== 0) {
  console.log(`\nREFUS DE CONCLURE : ${manquantes} mesure(s) manquante(s) sur l'attendu.\n`);
  process.exit(2);
}

const bloquants = BLOQUANTS.reduce(
  (n, cle) => n + releves.reduce((m, r) => m + r[cle].filter((d) => d.dansMain).length, 0),
  0,
);
if (bloquants > 0) {
  console.log(`\nPORTE FERMÉE : ${bloquants} défaut(s) bloquant(s) sur la famille carrière.\n`);
  process.exit(1);
}

console.log(
  `\nPORTE OUVERTE : ${PAGES_MESUREES.length} pages × ${LARGEURS.length} largeurs, ` +
    `aucun débordement, aucune cible sous 24 px, aucun texte tronqué, ` +
    `aucun vide de plus de ${VIDE_MAXIMAL} px sous une bascule.\n`,
);
