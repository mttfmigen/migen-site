/**
 * LA PORTE DU RESPONSIVE DE LA FAMILLE OFFRE.
 *
 *   node components/site/offre/verification-responsive-offre.mjs
 *   node components/site/offre/verification-responsive-offre.mjs --controle
 *   SITE_URL=http://localhost:4361 node components/site/offre/verification-responsive-offre.mjs --journal
 *
 * CE QU'ELLE COUVRE. Les six composants partagés par plus de cent pages :
 * `components/site/offre/*`, `offres/*`, `secteur/*`, `implantation/*`,
 * `implantations/*`. Onze pages, choisies pour couvrir CINQ gabarits
 * différents (03 Offre, 04 Ville, 06 Département, 08 Secteur, 10 Hub), parce
 * qu'une correction portée dans ces composants arrive sur les cent pages à la
 * fois et qu'un seul gabarit mesuré ne prouve rien.
 *
 * QUATRE LARGEURS, et chacune a sa raison : 320 px (le plus petit écran encore
 * en service), 360 px (le plus répandu en Europe), 390 px (iPhone courant,
 * c'est la largeur de la maquette mobile du client), 768 px (la bascule
 * tablette, là où les règles de la famille changent de colonnes).
 *
 * QUATRE RÈGLES BLOQUANTES, chacune reconnaissable à son mot en tête de
 * message, et chacune éprouvée par son propre témoin en `--controle` :
 *
 *   DÉBORDEMENT   un élément sort de SON HÔTE. L'hôte est le premier ancêtre
 *                 qui ROGNE (`overflow-x` autre que `visible`), sinon la
 *                 fenêtre. On mesure l'ÉLÉMENT, jamais le document : `.mg-site`
 *                 est en `overflow-x: clip`, donc `documentElement.scrollWidth`
 *                 ne bouge JAMAIS et une porte qui le regarde est aveugle.
 *                 C'est exactement le défaut qui a laissé 118 pages servir un
 *                 bouton de 409 px dans une fenêtre de 375.
 *   CIBLE         une cible tactile sous 24 px, critère 2.5.8 de la WCAG 2.2,
 *                 niveau AA. Pas 44 px : 44 est la recommandation d'Apple, et
 *                 l'imposer ici ferait échouer tous les liens de pied de page
 *                 sans que personne ne les rate vraiment. L'exemption par
 *                 ESPACEMENT que la WCAG prévoit explicitement est appliquée.
 *   TRONQUÉ       du texte coupé par un conteneur qui rogne. Le `line-clamp`
 *                 délibéré est compté à part et NE bloque pas : c'est un motif
 *                 de la maquette, pas un défaut de portage.
 *   CHEVAUCHEMENT deux textes qui se marchent dessus. Seuls les textes en flux
 *                 sont comparés : un panneau en position fixe (la barre
 *                 d'action basse, le bandeau de consentement) passe PAR DESSUS
 *                 le contenu par construction, et son recouvrement est mesuré
 *                 par `scripts/verifie-mobile.mjs`, qui défile jusqu'en bas
 *                 pour cela.
 *
 * DEUX MESURES INFORMATIVES, qui ne bloquent pas, et c'est délibéré :
 *
 *   CONTRASTE     les textes sous AA (4,5:1 en courant, 3:1 en grand). Ils
 *                 viennent de la maquette, qui descend à 2,37:1 sur ses
 *                 sur-titres et 2,56:1 sur ses boutons. `docs/PASSATION.md`,
 *                 arbitrage ouvert n° 7 : « fidélité maintenue, correction à
 *                 passer par la maquette d'abord ». Une porte qui bloquerait
 *                 là-dessus exigerait de s'écarter de la référence, c'est à
 *                 dire exactement ce que le projet interdit. Elle les COMPTE
 *                 et les nomme, pour que l'arbitrage reste visible.
 *   HAUTEUR       la page en écrans de 844 px à 390 px. Sans seuil : le repli
 *                 mobile existe pour la tenir, le chiffre sert à voir si elle
 *                 dérive.
 *
 * ELLE REFUSE DE CONCLURE si une seule page ne répond pas, ou si le repli
 * mobile a disparu d'une page qui en portait. Une porte qui conclut sur des
 * données partielles ne protège plus rien : c'est la faute la plus grave
 * qu'une porte puisse commettre sur ce projet, et elle a déjà été commise ici
 * (`scripts/verifie-blocs-pliables.mjs`, note du 12/10).
 *
 * TROIS PIÈGES DE MESURE DÉJÀ PAYÉS SUR CE PROJET, et traités ici :
 *   · le bandeau de consentement est REFUSÉ une fois par contexte, sinon il
 *     couvre le bas de chaque page et compte jusqu'à 57 % de faux pixels ;
 *   · l'HYDRATATION est attendue : les blocs repliables sont servis OUVERTS
 *     par le serveur et refermés par un effet client sous 880 px. Mesurer
 *     avant donne des hauteurs et des chevauchements faux ;
 *   · les images sont attendues par `decode()` : une image non décodée n'a pas
 *     encore sa hauteur, et tout ce qui est dessous est mal placé.
 */
import { chromium } from "playwright";

const SITE = process.env.SITE_URL ?? "http://localhost:4340";
/* Les quatre largeurs de la porte. `RESPONSIVE_LARGEURS` et `RESPONSIVE_PAGES`
   n'existent que pour INSTRUIRE un défaut (mesurer une page à une largeur, en
   journal) : le défaut par défaut est la mesure complète, et c'est elle qui
   fait verdict. */
const LARGEURS = (process.env.RESPONSIVE_LARGEURS ?? "320,360,390,768")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter(Boolean);
const HAUTEUR_FENETRE = 844;
const CIBLE_MINIMALE = 24;
const CONTROLE = process.argv.includes("--controle");
const JOURNAL = process.argv.includes("--journal");

/**
 * Les pages de la famille, CINQ gabarits.
 *
 * Elles ne sont pas interchangeables : chacune est servie par des composants
 * différents du périmètre, et une correction qui va bien à l'une casse
 * volontiers l'autre.
 */
const TOUTES_LES_PAGES = [
  ["/offres/", "10 Hub, offres/*"],
  ["/offres/zero-arret/", "03 Offre, offre/*"],
  ["/offres/bureau-etudes/", "03 Offre, offre/*"],
  ["/offres/residence/", "03 Offre, offre/* (page pilote)"],
  ["/travaux-industriels/", "03 Offre, offre/*"],
  ["/secteurs/logistique/", "08 Secteur, secteur/*"],
  ["/secteurs/agroalimentaire/", "08 Secteur, secteur/*"],
  ["/implantations/", "10 Hub, implantations/*"],
  ["/implantations/lyon/", "04 Ville, implantation/*"],
  ["/implantations/maintenance-industrielle-metz/", "04 Ville, implantation/*"],
  ["/implantations/lyon/rhone/", "06 Département, implantation/*"],
];

/* `RESPONSIVE_PAGES` sert à deux choses, et à rien d'autre : instruire un
   défaut sur une page précise, et BALAYER plus large que les onze pages du
   verdict quand on cherche ce que l'échantillon ne voit pas. Une adresse
   inconnue de la liste est acceptée telle quelle : c'est le balayage. */
const FILTRE = process.env.RESPONSIVE_PAGES?.split(",").map((s) => s.trim()).filter(Boolean);
const PAGES = FILTRE
  ? FILTRE.map((c) => TOUTES_LES_PAGES.find(([p]) => p === c) ?? [c, "balayage"])
  : TOUTES_LES_PAGES;

/**
 * LES MODULES CSS DE LA FAMILLE, et à quoi sert cette liste.
 *
 * Ces composants sont partagés par plus de cent pages, mais ils ne sont pas
 * SEULS sur ces pages : l'en-tête, le pied, le formulaire et les blocs communs
 * y vivent aussi, et appartiennent à d'autres chantiers. Quand le coupable
 * d'un défaut porte la classe d'un module CSS qui n'est PAS de la famille, le
 * défaut est vrai, il est mesuré, il est nommé, et il est ATTRIBUÉ : la porte
 * le signale sans le corriger ici, parce qu'une correction posée dans cinq
 * feuilles de la famille pour rattraper un composant commun se contredirait
 * avec la correction que son propre chantier finira par poser.
 *
 * Ce n'est pas une mise en veilleuse : un défaut hors famille fait sortir la
 * porte en code 3. Rien ne passe pour vert.
 *
 * Un élément SANS classe de module appartient à la famille : les composants
 * de ce périmètre portent leurs styles en ligne, repris des captures, et leur
 * seule feuille sert les survols et les points de rupture.
 */
const MODULES_DE_LA_FAMILLE = [
  "PageOffre",
  "PageOffres",
  "QuestionsPhoto",
  "PageSecteur",
  "PageVille",
  "PageImplantations",
  // `offre/generique/Generique.module.css`. Oublié au premier jet le 13/10, et
  // la porte a aussitôt excusé un défaut de ce périmètre en l'attribuant à un
  // autre chantier : une liste d'attribution incomplète est une porte qui
  // s'aveugle poliment.
  "Generique",
];

/** Le module CSS du coupable, ou `null` s'il n'en porte pas. */
function moduleCoupable(message) {
  const m = message.match(/\b([A-Za-z][A-Za-z0-9]*)-module__/);
  return m ? m[1] : null;
}

/* La variable ne s'appelle pas `module` : eslint l'interdit dans ce dépôt
   (`@next/next/no-assign-module-variable`), parce qu'une réassignation de ce
   nom casse le chargement de certains modules. */
function horsDeLaFamille(message) {
  const feuille = moduleCoupable(message);
  return feuille && !MODULES_DE_LA_FAMILLE.includes(feuille) ? feuille : null;
}

/* ========================================================================
   LA MESURE, exécutée DANS la page.
   ======================================================================== */

const MESURE = ({ cible }) => {
  const resultat = {
    debordements: [],
    ciblesTropPetites: [],
    texteTronque: [],
    tronqueVolontaire: [],
    chevauchements: [],
    contrastes: [],
    contrastesNonMesurables: 0,
    hauteur: document.documentElement.scrollHeight,
    blocsPliables: document.querySelectorAll("details[data-pliable-mobile]").length,
    blocsReplies: document.querySelectorAll("details[data-pliable-mobile]:not([open])").length,
  };

  const nom = (element) => {
    const classe =
      typeof element.className === "string" && element.className.trim()
        ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
        : "";
    const texte = (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34);
    return `${element.tagName.toLowerCase()}${classe}${texte ? ` « ${texte} »` : ""}`;
  };

  const invisible = (element) => {
    const style = getComputedStyle(element);
    return (
      style.visibility === "hidden" ||
      style.display === "none" ||
      Number.parseFloat(style.opacity) === 0
    );
  };

  /**
   * LE SOUS-ARBRE QUI N'EST PAS MIS EN PAGE, et c'est le piège de mesure que
   * cette porte a payé le 13/10 : 415 faux chevauchements sur /implantations/.
   *
   * Un `<details>` fermé n'est pas « caché » : les navigateurs récents
   * enveloppent son contenu dans `::details-content` et lui posent
   * `content-visibility: hidden`. Le sous-arbre n'est alors PAS MIS EN PAGE, et
   * `getBoundingClientRect()` de ses descendants ne renvoie pas zéro : il
   * renvoie une boîte repliée sur la position du bloc. Tous les textes des
   * neuf sections repliées d'une page se retrouvent donc empilés au même
   * endroit, et chacun « chevauche » tous les autres. Des mesures qui portent
   * sur rien, et qui crient fort.
   *
   * La géométrie d'un sous-arbre non mis en page n'a aucun sens : il est
   * écarté. Ce que le visiteur révèle en tapant sur la bascule est mesuré
   * dans la SECONDE passe, blocs dépliés.
   */
  const nonRendu = (element) => {
    for (let n = element; n && n !== document.body; n = n.parentElement) {
      const style = getComputedStyle(n);
      if (style.contentVisibility === "hidden") return true;
      const parent = n.parentElement;
      if (
        parent &&
        parent.tagName === "DETAILS" &&
        !parent.open &&
        n.tagName !== "SUMMARY"
      ) {
        return true;
      }
    }
    return false;
  };

  /** L'ancêtre qui ROGNE, et le rectangle dans lequel il rogne. */
  const hote = (element) => {
    for (let n = element.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const style = getComputedStyle(n);
      if (style.overflowX === "visible") continue;
      /* Un rail à défilement déborde par construction : c'est son objet, et le
         visiteur l'atteint en le faisant glisser. Ce n'est pas un défaut. */
      if (style.overflowX === "auto" || style.overflowX === "scroll") return { rail: true };
      const boite = n.getBoundingClientRect();
      // Le rognage a lieu à la boîte de REMPLISSAGE, bordures exclues.
      return {
        noeud: n,
        quoi: nom(n),
        gauche: boite.left + Number.parseFloat(style.borderLeftWidth || "0"),
        droite: boite.right - Number.parseFloat(style.borderRightWidth || "0"),
      };
    }
    return { noeud: document.body, quoi: "la fenêtre", gauche: 0, droite: window.innerWidth };
  };

  /* -------------------------------------------------- DÉBORDEMENT

     CE QUI COMPTE COMME DÉFAUT, et la distinction a été payée le 13/10 : un
     élément rogné par son hôte ne fait perdre quelque chose au visiteur QUE
     s'il portait quelque chose à perdre. Trois exclusions, chacune mesurée sur
     ce site, et aucune n'est une facilité :

       · LE RAIL ANIMÉ. `div.mg-track` dépassait `div.mg-marquee` de 10 602 px
         sur chaque page de la famille : c'est un bandeau qui défile, il écrit
         sa liste deux fois et sort de sa fenêtre par CONSTRUCTION. Reconnu à
         son `animation-name`, pas à sa classe.
       · L'ORNEMENT. Les halos orangés des panneaux sombres (`.mg-pad`)
         dépassent de 149 à 180 px, et c'est leur dessin : ils n'ont ni texte,
         ni image, ni rôle. Rognés, rien n'est perdu.
       · CE QUE L'AUTEUR A DÉCLARÉ DÉCORATIF (`aria-hidden="true"`).

     Reste donc le défaut vrai : du texte, une image ou une commande qui sort
     de son hôte, donc coupée à l'écran. */
  const porteQuelqueChose = (element) =>
    (element.textContent || "").trim().length > 0 ||
    element.tagName === "IMG" ||
    element.tagName === "SVG" ||
    element.querySelector("img, svg, input, select, textarea") !== null;

  const anime = (element, jusqu) => {
    for (let n = element; n && n !== jusqu && n !== document.body; n = n.parentElement) {
      const a = getComputedStyle(n).animationName;
      if (a && a !== "none") return true;
    }
    return false;
  };

  const coupables = [];
  for (const element of document.querySelectorAll("body *")) {
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    /* Le motif « masqué visuellement » vit très loin à gauche (le champ piège
       anti-robot du formulaire est à -9999 px). */
    if (boite.left < -1000) continue;
    if (invisible(element) || nonRendu(element)) continue;
    if (element.getAttribute("aria-hidden") === "true") continue;
    const style = getComputedStyle(element);
    /* Un panneau en position FIXE est mesuré contre la fenêtre et contre elle
       seule : il ne vit pas dans le flux de son parent. */
    const h =
      style.position === "fixed"
        ? { quoi: "la fenêtre", gauche: 0, droite: window.innerWidth }
        : hote(element);
    if (h.rail) continue;
    const depasseADroite = Math.round(boite.right - h.droite);
    const depasseAGauche = Math.round(h.gauche - boite.left);
    const depasse = Math.max(depasseADroite, depasseAGauche);
    if (depasse <= 1) continue;
    if (!porteQuelqueChose(element)) continue;
    if (anime(element, h.noeud)) continue;
    // Un parent déjà coupable explique ses enfants : on ne les recompte pas.
    if (coupables.some((c) => c.noeud.contains(element))) continue;
    coupables.push({ noeud: element, texte: `${nom(element)} dépasse ${h.quoi} de ${depasse} px` });
  }
  resultat.debordements = coupables.map((c) => c.texte);

  /* -------------------------------------------------- CIBLE TACTILE */
  for (const element of document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]',
  )) {
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    if (invisible(element) || nonRendu(element)) continue;
    const style = getComputedStyle(element);
    // La WCAG exempte explicitement le lien EN LIGNE dans du texte courant :
    // l'agrandir casserait l'interligne du paragraphe qui le porte.
    if (style.display === "inline" && element.closest("p, li, td, h1, h2, h3, h4")) continue;
    /* L'exemption par ESPACEMENT, elle aussi prévue par la WCAG : un lien
       séparé de ses voisins de 24 px est atteignable même petit. Le séparateur
       peut être une marge OU l'écart de la grille parente, et les listes de ce
       site sont des grilles à `gap`, donc des marges nulles. */
    /* LE PARENT DE MISE EN PAGE, ET NON LE PARENT DU DOCUMENT. Un ancêtre en
       `display: contents` n'a pas de boîte : il disparaît de la mise en page et
       c'est son propre parent qui aligne l'élément. Le fil d'Ariane du gabarit
       générique enveloppe chaque lien dans un tel `span` ; le lire comme parent
       donnait un écart de 0 px, et la porte signalait quatre liens de 47×20 px
       que leurs 8 px de gouttière rendent parfaitement atteignables. */
    let parent = element.parentElement;
    while (parent && getComputedStyle(parent).display === "contents") {
      parent = parent.parentElement;
    }
    const styleParent = parent ? getComputedStyle(parent) : null;
    const ecart =
      styleParent && /grid|flex/.test(styleParent.display)
        ? Math.max(Number.parseFloat(styleParent.rowGap) || 0, Number.parseFloat(styleParent.columnGap) || 0)
        : 0;
    const marge =
      Number.parseFloat(style.marginTop || "0") + Number.parseFloat(style.marginBottom || "0");
    const hauteurUtile = boite.height + Math.max(marge, ecart);
    if (hauteurUtile >= cible && boite.width >= cible) continue;
    if (boite.height >= cible && boite.width >= cible) continue;
    resultat.ciblesTropPetites.push(
      `${nom(element)} fait ${Math.round(boite.width)}×${Math.round(boite.height)} px`,
    );
  }

  /* -------------------------------------------------- TRONQUÉ */
  const porteDuTexte = (element) =>
    [...element.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);

  for (const element of document.querySelectorAll("body *")) {
    if (!porteDuTexte(element)) continue;
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    if (invisible(element) || nonRendu(element)) continue;
    const style = getComputedStyle(element);
    const rogneX = style.overflowX === "hidden" || style.overflowX === "clip";
    const rogneY = style.overflowY === "hidden" || style.overflowY === "clip";
    const coupeHorizontale = rogneX && element.scrollWidth > element.clientWidth + 1;
    const coupeVerticale = rogneY && element.scrollHeight > element.clientHeight + 2;
    if (!coupeHorizontale && !coupeVerticale) continue;
    /* Le `line-clamp` est un motif de la maquette, donc une troncature
       VOULUE : elle est comptée à part, elle ne bloque pas. */
    if (style.webkitLineClamp && style.webkitLineClamp !== "none") {
      resultat.tronqueVolontaire.push(`${nom(element)} (line-clamp ${style.webkitLineClamp})`);
      continue;
    }
    resultat.texteTronque.push(
      `${nom(element)} coupé, ${coupeHorizontale ? `${element.scrollWidth} px de texte dans ${element.clientWidth}` : `${element.scrollHeight} px de texte dans ${element.clientHeight}`}`,
    );
  }

  /* -------------------------------------------------- CHEVAUCHEMENT

     LA MESURE PORTE SUR LES FRAGMENTS DE LIGNE, et non sur la boîte
     englobante. Deuxième piège payé le 13/10 : un élément EN LIGNE qui passe à
     la ligne, ou un bloc fragmenté par une mise en colonnes (`columns`, ce que
     fait l'annuaire des villes), renvoie une boîte englobante qui est l'UNION
     de ses fragments. Deux puces voisines d'une même liste qui se suivent sur
     deux lignes « se recouvrent » alors sur toute la largeur, alors qu'aucun
     pixel de texte ne touche l'autre. 66 à 415 faux chevauchements par page,
     tous de cette seule cause.

     `getClientRects()` rend les fragments un par un : c'est la géométrie
     qu'on voit à l'écran. */
  /**
   * CE QUI RESTE VISIBLE D'UN FRAGMENT une fois tous ses ancêtres rogneurs
   * appliqués. Troisième piège du 13/10 : un contenu rogné continue d'avoir
   * une géométrie, et elle sort de la boîte qui le rogne. Les éléments d'un
   * accordéon dont la hauteur est pilotée au script débordaient ainsi de
   * 1 500 px sous leur propre carte et « chevauchaient » les trois sections
   * suivantes. À l'écran, rien : tout cela est coupé.
   */
  const rogne = (element, r) => {
    let g = r.left;
    let d = r.right;
    let h = r.top;
    let b = r.bottom;
    for (let n = element.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.overflowX === "visible" && s.overflowY === "visible") continue;
      const c = n.getBoundingClientRect();
      if (s.overflowX !== "visible") {
        g = Math.max(g, c.left);
        d = Math.min(d, c.right);
      }
      if (s.overflowY !== "visible") {
        h = Math.max(h, c.top);
        b = Math.min(b, c.bottom);
      }
      if (d - g < 2 || b - h < 2) return null;
    }
    return { left: g, right: d, top: h, bottom: b, width: d - g, height: b - h };
  };

  const fragments = (element) =>
    [...element.getClientRects()]
      .filter((r) => r.width >= 2 && r.height >= 2)
      .map((r) => rogne(element, r))
      .filter(Boolean);

  const feuilles = [];
  for (const element of document.querySelectorAll("body *")) {
    if (!porteDuTexte(element)) continue;
    if (invisible(element) || nonRendu(element)) continue;
    const parts = fragments(element);
    if (parts.length === 0) continue;
    let flottant = false;
    for (let n = element; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n).position;
      if (p === "fixed" || p === "absolute" || p === "sticky") {
        flottant = true;
        break;
      }
    }
    // Un panneau hors flux passe PAR DESSUS par construction : il est jugé
    // ailleurs, pas ici, sinon chaque halo devient un faux défaut.
    if (flottant) continue;
    feuilles.push({ element, parts });
  }
  for (let i = 0; i < feuilles.length; i++) {
    for (let j = i + 1; j < feuilles.length; j++) {
      const a = feuilles[i];
      const b = feuilles[j];
      if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
      let pire = null;
      for (const ra of a.parts) {
        for (const rb of b.parts) {
          const largeur = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const hauteur = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (largeur <= 2 || hauteur <= 2) continue;
          const aire = largeur * hauteur;
          const plusPetite = Math.min(ra.width * ra.height, rb.width * rb.height);
          /* Un quart du plus petit des deux fragments : en dessous, c'est le
             jambage d'une lettre qui descend sur la ligne suivante, pas un
             texte devenu illisible. */
          if (aire < plusPetite * 0.25) continue;
          if (!pire || aire > pire.aire) {
            pire = {
              aire,
              largeur,
              hauteur,
              ou: `x ${Math.round(Math.max(ra.left, rb.left))}, y ${Math.round(Math.max(ra.top, rb.top) + window.scrollY)}`,
            };
          }
        }
      }
      if (!pire) continue;
      /* La position est DANS le message : un chevauchement sans coordonnée est
         introuvable sur une page de dix-sept écrans, et deux textes différents
         peuvent porter les mêmes trente-quatre premiers caractères. */
      resultat.chevauchements.push(
        `${nom(a.element)} et ${nom(b.element)} se recouvrent sur ${Math.round(pire.largeur)}×${Math.round(pire.hauteur)} px (${pire.ou})`,
      );
    }
  }

  /* -------------------------------------------------- CONTRASTE (informatif) */
  const canal = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  const lis = (couleur) => {
    const m = couleur.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
  };
  const melange = (dessus, dessous, alpha) =>
    dessus.map((c, k) => c * alpha + dessous[k] * (1 - alpha));

  for (const element of document.querySelectorAll("body *")) {
    if (!porteDuTexte(element)) continue;
    const boite = element.getBoundingClientRect();
    if (boite.width === 0 || boite.height === 0) continue;
    if (invisible(element) || nonRendu(element)) continue;
    const style = getComputedStyle(element);
    const encre = lis(style.color);
    if (!encre) continue;
    // Un fond PHOTOGRAPHIQUE n'a pas une couleur : il n'est pas mesurable
    // ainsi, et prétendre le contraire serait inventer un chiffre.
    let fond = null;
    let photo = false;
    for (let n = element; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== "none") {
        photo = true;
        break;
      }
      const c = lis(s.backgroundColor);
      if (c && c.alpha > 0.92) {
        fond = c.rgb;
        break;
      }
      if (c && c.alpha > 0) {
        // Un fond translucide : il faudrait connaître ce qui est dessous.
        photo = true;
        break;
      }
    }
    if (photo || !fond) {
      resultat.contrastesNonMesurables++;
      continue;
    }
    const encreAplatie = encre.alpha < 1 ? melange(encre.rgb, fond, encre.alpha) : encre.rgb;
    const l1 = luminance(encreAplatie);
    const l2 = luminance(fond);
    const rapport = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const taille = Number.parseFloat(style.fontSize);
    const graisse = Number.parseInt(style.fontWeight, 10) || 400;
    const grand = taille >= 24 || (taille >= 18.66 && graisse >= 700);
    const plancher = grand ? 3 : 4.5;
    if (rapport + 0.05 < plancher) {
      resultat.contrastes.push(
        `${nom(element)} à ${rapport.toFixed(2)}:1 (plancher ${plancher}, ${Math.round(taille)} px)`,
      );
    }
  }

  return resultat;
};

/* ========================================================================
   LE CONTRÔLE : la porte prouve qu'elle sait échouer.
   ======================================================================== */

/**
 * Quatre témoins, un par règle bloquante, plus UN CONTRÔLE NÉGATIF.
 *
 * Chaque témoin doit faire tomber SA règle, reconnue à son nom : un témoin qui
 * tombe sur la règle voisine ne prouve rien du tout, et une porte dont les
 * règles se recouvrent se croit vigilante alors qu'elle n'a qu'un seul oeil.
 * Le contrôle négatif est la moitié qu'on oublie : sans lui, une porte qui
 * crie sur TOUT passerait pour une porte qui marche.
 */
const TEMOINS = [
  {
    nom: "DÉBORDEMENT",
    regle: "debordements",
    page: `<div style="width:320px;overflow-x:clip;background:#fff">
             <a href="#" style="display:block;width:420px;height:48px;white-space:nowrap">Faire chiffrer ma maintenance agroalimentaire</a>
           </div>`,
  },
  {
    nom: "CIBLE",
    regle: "ciblesTropPetites",
    page: `<div style="width:320px;background:#fff">
             <div><a href="#" style="display:block;width:18px;height:18px;font-size:12px;color:#000">x</a></div>
           </div>`,
  },
  {
    nom: "TRONQUÉ",
    regle: "texteTronque",
    page: `<div style="width:320px;background:#fff">
             <p style="width:120px;overflow:hidden;white-space:nowrap;color:#000;margin:0">Maintenance industrielle à Metz, intervention sur site</p>
           </div>`,
  },
  {
    nom: "CHEVAUCHEMENT",
    regle: "chevauchements",
    page: `<div style="width:320px;background:#fff;color:#000">
             <p style="margin:0;height:20px;font-size:16px">Le titre de la section</p>
             <p style="margin:-18px 0 0;height:20px;font-size:16px">Le texte qui monte dessus</p>
           </div>`,
  },
];

/** Le contrôle négatif : rien à signaler, et la porte doit le dire. */
const PAGE_SAINE = `<div style="width:320px;background:#fff;color:#000">
    <p style="margin:0 0 16px;font-size:16px">Un paragraphe qui tient dans sa colonne.</p>
    <div><a href="#" style="display:block;height:44px;line-height:44px;font-size:16px;color:#1a1a1a">Décrire mon besoin</a></div>
  </div>`;

async function controle(navigateur) {
  const contexte = await navigateur.newContext({ viewport: { width: 320, height: 844 } });
  const page = await contexte.newPage();
  const verdicts = [];

  const REGLES = ["debordements", "ciblesTropPetites", "texteTronque", "chevauchements"];

  for (const temoin of TEMOINS) {
    await page.setContent(`<body style="margin:0">${temoin.page}</body>`);
    const releve = await page.evaluate(MESURE, { cible: CIBLE_MINIMALE });
    const saRegle = releve[temoin.regle].length > 0;
    const autres = REGLES.filter((r) => r !== temoin.regle && releve[r].length > 0);
    verdicts.push([
      `le témoin ${temoin.nom} fait tomber la règle ${temoin.nom}`,
      saRegle,
      saRegle ? releve[temoin.regle][0] : "aucune faute levée",
    ]);
    verdicts.push([
      `et il ne fait tomber QUE la sienne`,
      autres.length === 0,
      autres.length === 0 ? "" : `a aussi levé ${autres.join(", ")}`,
    ]);
  }

  await page.setContent(`<body style="margin:0">${PAGE_SAINE}</body>`);
  const sain = await page.evaluate(MESURE, { cible: CIBLE_MINIMALE });
  const muet = REGLES.every((r) => sain[r].length === 0);
  verdicts.push([
    "CONTRÔLE NÉGATIF : une page saine ne lève AUCUNE des quatre règles",
    muet,
    muet ? "" : REGLES.map((r) => `${r}: ${sain[r].join(" | ")}`).filter((t) => !t.endsWith(": ")).join(" / "),
  ]);

  await contexte.close();

  /* L'ATTRIBUTION EST UNE RÈGLE COMME LES AUTRES, donc elle a ses témoins.
     Sans eux, une expression régulière trop gourmande rangerait toute la
     famille « hors périmètre » et la porte deviendrait verte sur un site
     cassé : c'est la façon la plus discrète de s'aveugler. */
  const attribution = [
    [
      "un coupable de la famille reste DANS la famille",
      horsDeLaFamille("div.PageOffre-module__ab12__boutonPrincipal dépasse la fenêtre de 40 px") === null,
    ],
    [
      "un coupable d'un composant commun est ATTRIBUÉ, pas effacé",
      horsDeLaFamille("p.SectionPliableMobile-module__xy__resume dépasse div.mg-pad de 28 px") ===
        "SectionPliableMobile",
    ],
    [
      "un coupable SANS classe de module reste dans la famille",
      horsDeLaFamille("div « Besoin d'un technicien » dépasse la fenêtre de 43 px") === null,
    ],
  ];
  for (const [quoi, ok] of attribution) verdicts.push([quoi, ok, ""]);

  for (const [quoi, ok, detail] of verdicts) {
    console.log(`  ${ok ? "OK  " : "RATE"}  ${quoi}${detail ? `\n          ${detail}` : ""}`);
  }
  const tous = verdicts.every(([, ok]) => ok);
  console.log(
    `\n${tous ? "contrôle conforme" : "CONTRÔLE EN ÉCHEC"} (${verdicts.filter(([, ok]) => ok).length}/${verdicts.length})`,
  );
  return tous;
}

/* ========================================================================
   LA MESURE DU SITE.
   ======================================================================== */

/**
 * Le bandeau de consentement est refusé UNE FOIS par contexte : le choix part
 * dans un cookie de première partie, les pages suivantes du même contexte ne
 * le revoient plus. Sans cela il couvre le bas de chaque page et compte
 * jusqu'à 57 % de faux pixels (piège n° 6 de `docs/PASSATION.md`).
 */
async function refuseLeBandeau(contexte) {
  const page = await contexte.newPage();
  try {
    await page.goto(`${SITE}/`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    const bouton = page.getByRole("button", { name: "Tout refuser" });
    await bouton.waitFor({ state: "visible", timeout: 20_000 });
    await bouton.click();
    await page.waitForTimeout(400);
    return true;
  } catch {
    return false;
  } finally {
    await page.close();
  }
}

/**
 * ATTENDRE L'HYDRATATION, et pas une durée au hasard.
 *
 * Les blocs repliables sont servis OUVERTS par le serveur et refermés par un
 * effet client, sous 880 px seulement. Mesurer avant ce moment donne une
 * hauteur fausse (tout est déplié) et des chevauchements fantômes. Le signal
 * est donc : sous 880 px, au moins un bloc est REFERMÉ, ou bien la page n'en
 * porte aucun. Au dessus de 880 px, rien à attendre de ce côté.
 */
async function attendHydratation(page, largeur) {
  await page.evaluate(() => document.fonts.ready);
  if (largeur < 880) {
    await page
      .waitForFunction(
        () => {
          const tous = document.querySelectorAll("details[data-pliable-mobile]");
          if (tous.length === 0) return true;
          return document.querySelectorAll("details[data-pliable-mobile]:not([open])").length > 0;
        },
        undefined,
        { timeout: 20_000 },
      )
      .catch(() => {});
  }
  /* Les images : une image non décodée n'a pas encore sa hauteur, et tout ce
     qui est dessous est mal placé. On attend celles qui sont chargées, sans
     exiger celles que le navigateur a mises de côté (`loading=lazy` hors
     écran), qui ne déplacent rien ici. */
  await page.evaluate(async () => {
    const images = [...document.images].filter((i) => i.complete && i.naturalWidth > 0);
    await Promise.all(images.map((i) => i.decode().catch(() => {})));
  });
  await page.waitForTimeout(500);
}

const navigateur = await chromium.launch({ channel: "chrome" });

if (CONTROLE) {
  const ok = await controle(navigateur);
  if (!ok) {
    await navigateur.close();
    process.exit(1);
  }
}

const fautes = [];
/** Défauts vrais, mesurés, dont le coupable appartient à un autre chantier. */
const horsPerimetre = [];
const injoignables = [];
const informatif = [];
const totaux = {
  debordements: 0,
  ciblesTropPetites: 0,
  texteTronque: 0,
  chevauchements: 0,
  contrastes: 0,
  tronqueVolontaire: 0,
};
/** Les blocs repliables par page, à 390 px : le repli ne doit pas se défaire. */
const repliParPage = {};
let pirePage = { chemin: "", hauteur: 0 };

try {
  for (const largeur of LARGEURS) {
    const contexte = await navigateur.newContext({
      viewport: { width: largeur, height: HAUTEUR_FENETRE },
      // Le préréglage téléphone suppose un écran tactile : sans lui les règles
      // de survol s'appliquent et la mesure est fausse.
      hasTouch: largeur < 880,
      isMobile: largeur < 880,
      deviceScaleFactor: 2,
    });
    const refuse = await refuseLeBandeau(contexte);
    if (!refuse) injoignables.push(`à ${largeur} px : le bandeau de consentement n'a pas pu être refusé`);

    for (const [chemin, gabarit] of PAGES) {
      const page = await contexte.newPage();
      let releve = null;
      let depliee = null;
      try {
        const reponse = await page.goto(`${SITE}${chemin}`, { waitUntil: "load", timeout: 90_000 });
        if (!reponse?.ok()) {
          injoignables.push(`${chemin} à ${largeur} px : HTTP ${reponse?.status()}`);
          await page.close();
          continue;
        }
        await attendHydratation(page, largeur);
        releve = await page.evaluate(MESURE, { cible: CIBLE_MINIMALE });
        /* LA SECONDE PASSE, BLOCS DÉPLIÉS, et sans elle la porte ne voit
           presque rien sous 880 px : le repli mobile ferme neuf sections sur
           dix, et la géométrie d'un sous-arbre non mis en page est écartée
           par `nonRendu`. Le visiteur, lui, tape sur la bascule et découvre ce
           contenu : c'est dans cet état que la plus grande partie de la famille
           se mesure. Les deux passes sont réunies, chaque faute porte l'état
           où elle a été vue. */
        /* ON N'OUVRE QUE LES REPLIS DE SECTION, et pas tous les `<details>` de
           la page. Premier essai du 13/10 : tout ouvrir, FAQ comprise. Il
           fabriquait un état qu'aucun visiteur n'atteint (les questions d'une
           FAQ s'ouvrent une par une) et, avec lui, des chevauchements qui
           n'existent que dans cet état. Une porte doit mesurer ce que le
           visiteur voit, pas ce qu'on peut forcer.
           Les replis de section, eux, sont exactement le contenu que la
           largeur cache : tous ouverts, la page est celle du grand écran, et
           c'est un état normal. */
        await page.evaluate(() => {
          for (const d of document.querySelectorAll("details[data-pliable-mobile]")) d.open = true;
        });
        /* LE DÉLAI N'EST PAS UNE SUPERSTITION. `::details-content` porte une
           transition discrète sur `content-visibility` : pendant cette
           transition le sous-arbre n'est TOUJOURS PAS mis en page, et deux
           images de rendu n'y suffisent pas. Mesurer trop tôt redonne la
           géométrie repliée, donc des centaines de faux chevauchements, le
           piège même que `nonRendu` vient d'écarter. On attend, puis on
           VÉRIFIE qu'il ne reste aucun sous-arbre non mis en page avant de
           croire la mesure. */
        await page.waitForTimeout(700);
        const restes = await page.evaluate(
          () =>
            [...document.querySelectorAll("body *")].filter(
              (n) => getComputedStyle(n).contentVisibility === "hidden",
            ).length,
        );
        if (restes > 0) {
          injoignables.push(
            `${chemin} à ${largeur} px : ${restes} sous-arbre(s) encore non mis en page après dépliage, mesure dépliée refusée`,
          );
          await page.close();
          continue;
        }
        depliee = await page.evaluate(MESURE, { cible: CIBLE_MINIMALE });
      } catch (erreur) {
        injoignables.push(`${chemin} à ${largeur} px : ${String(erreur.message).split("\n")[0]}`);
        await page.close();
        continue;
      }

      /* L'UNION DES DEUX PASSES, dédoublonnée : un défaut présent replié ET
         déplié est le même défaut, le compter deux fois gonflerait le chiffre
         sans rien apprendre. L'état est noté sur la ligne quand il n'apparaît
         que déplié, parce qu'il ne se reproduit qu'après un appui. */
      const union = (regle) => {
        const vu = new Map();
        for (const ligne of releve[regle]) vu.set(ligne, "");
        for (const ligne of depliee[regle]) if (!vu.has(ligne)) vu.set(ligne, " [déplié]");
        return [...vu].map(([ligne, etat]) => ligne + etat);
      };

      const porte = (regle, etiquette) => {
        const liste = union(regle);
        totaux[regle] += liste.length;
        if (liste.length === 0) return liste;
        const dedans = liste.filter((l) => !horsDeLaFamille(l));
        const dehors = liste.filter((l) => horsDeLaFamille(l));
        if (dedans.length > 0) {
          fautes.push(
            `${etiquette} · ${chemin} à ${largeur} px (${gabarit}) : ${dedans.length}\n      ` +
              dedans.slice(0, 4).join("\n      "),
          );
        }
        for (const ligne of dehors) {
          horsPerimetre.push(
            `${etiquette} · ${chemin} à ${largeur} px, composant ${horsDeLaFamille(ligne)}\n      ${ligne}`,
          );
        }
        return liste;
      };
      const vus = {
        debordements: porte("debordements", "DÉBORDEMENT") ?? [],
        ciblesTropPetites: porte("ciblesTropPetites", "CIBLE") ?? [],
        texteTronque: porte("texteTronque", "TRONQUÉ") ?? [],
        chevauchements: porte("chevauchements", "CHEVAUCHEMENT") ?? [],
      };

      const contrastes = union("contrastes");
      totaux.contrastes += contrastes.length;
      totaux.tronqueVolontaire += union("tronqueVolontaire").length;
      if (contrastes.length > 0) {
        informatif.push(
          `CONTRASTE · ${chemin} à ${largeur} px : ${contrastes.length}` +
            (JOURNAL ? `\n      ${contrastes.slice(0, 8).join("\n      ")}` : ""),
        );
      }

      if (largeur < 880) repliParPage[`${chemin}@${largeur}`] = releve.blocsPliables;
      if (largeur === 390) {
        /* LA HAUTEUR SE MESURE DANS L'ÉTAT SERVI, replié : c'est celle que le
           visiteur rencontre. La hauteur dépliée est celle de la page entière,
           elle ne dit rien du repli. */
        const ecrans = releve.hauteur / HAUTEUR_FENETRE;
        if (ecrans > pirePage.hauteur) pirePage = { chemin, hauteur: ecrans };
      }

      console.log(
        `${chemin.padEnd(46)} ${String(largeur).padStart(4)} px  ` +
          `${String(vus.debordements.length).padStart(2)} déb · ` +
          `${String(vus.ciblesTropPetites.length).padStart(2)} cib · ` +
          `${String(vus.texteTronque.length).padStart(2)} tro · ` +
          `${String(vus.chevauchements.length).padStart(2)} che · ` +
          `${String(contrastes.length).padStart(3)} ctr · ` +
          `${(releve.hauteur / HAUTEUR_FENETRE).toFixed(1)} écrans · ` +
          `${releve.blocsReplies}/${releve.blocsPliables} replié(s)`,
      );
      if (JOURNAL) {
        for (const [etiquette, liste] of [
          ["déb", vus.debordements],
          ["cib", vus.ciblesTropPetites],
          ["tro", vus.texteTronque],
          ["che", vus.chevauchements],
          ["ctr", contrastes],
        ]) {
          for (const ligne of liste) console.log(`        ${etiquette}  ${ligne}`);
        }
      }
      await page.close();
    }
    await contexte.close();
  }
} catch (erreur) {
  injoignables.push(`mesure interrompue : ${String(erreur.message).split("\n")[0]}`);
} finally {
  await navigateur.close();
}

/* ========================================================================
   LE VERDICT.
   ======================================================================== */

console.log(
  `\nFAMILLE OFFRE, ${PAGES.length} pages × ${LARGEURS.length} largeurs\n` +
    `  débordements ......... ${totaux.debordements}\n` +
    `  cibles sous 24 px .... ${totaux.ciblesTropPetites}\n` +
    `  texte tronqué ........ ${totaux.texteTronque}` +
    ` (dont ${totaux.tronqueVolontaire} line-clamp assumés, non comptés)\n` +
    `  chevauchements ....... ${totaux.chevauchements}\n` +
    `  contrastes sous AA ... ${totaux.contrastes}  (informatif, arbitrage ouvert n° 7)\n` +
    `  dont hors famille .... ${horsPerimetre.length} défaut(s) attribués à un composant commun\n` +
    `  pire hauteur à 390 px  ${pirePage.hauteur.toFixed(1)} écrans de ${HAUTEUR_FENETRE} px (${pirePage.chemin})`,
);

if (informatif.length > 0) {
  console.log("\nà signaler, sans blocage :");
  for (const i of informatif) console.log(`  ${i}`);
}

/* UNE SEULE PAGE MUETTE SUFFIT À RENDRE LA MESURE NON CONCLUANTE. La porte ne
   dit pas « c'est faux », elle dit « je n'ai pas pu mesurer », ce qui est la
   vérité et se répare autrement. */
if (injoignables.length > 0) {
  console.error(`\nMESURE NON CONCLUANTE, ${injoignables.length} page(s) ou étape(s) muettes :`);
  for (const i of injoignables) console.error(`  ${i}`);
  console.error("La porte REFUSE DE CONCLURE : un verdict sur des données partielles ne protège rien.");
  process.exit(2);
}

/* LE REPLI MOBILE NE DOIT PAS SE DÉFAIRE. Une correction de mise en page peut
   très bien, sans le vouloir, retirer le `<details>` d'une section : la page
   resterait « conforme » aux quatre règles tout en redevenant le mur de
   dix-sept écrans que le repli existe pour éviter. On ne compare pas à un
   nombre écrit en dur, qui vieillirait mal : on exige que la famille en porte
   encore, et le journal donne le compte page par page.
   Vide quand aucune largeur sous 880 px n'a été mesurée : il n'y a alors rien
   à conclure, et conclure quand même serait le défaut qu'on évite partout
   ailleurs ici. */
const compte = Object.values(repliParPage);
if (compte.length > 0 && compte.every((n) => n === 0)) {
  console.error(
    "\nMESURE NON CONCLUANTE : AUCUNE page mesurée sous 880 px ne porte de bloc repliable.\n" +
      "  Le repli mobile a disparu du périmètre, ou la mesure est arrivée avant l'hydratation.",
  );
  process.exit(2);
}

/* LES DÉFAUTS HORS FAMILLE SE LISENT TOUJOURS, et avant le verdict : les
   ranger après un `process.exit` les aurait rendus invisibles dès qu'un défaut
   de la famille tombe, c'est à dire précisément quand on lit cette sortie. */
if (horsPerimetre.length > 0) {
  console.error(
    `\n${horsPerimetre.length} défaut(s) MESURÉS sur ces pages mais dus à un composant HORS de la famille :`,
  );
  for (const h of horsPerimetre) console.error(`  ${h}`);
  console.error(
    "  Ces défauts appartiennent au chantier du composant nommé : les corriger depuis les\n" +
      "  feuilles de la famille se contredirait avec sa propre correction.",
  );
}

if (fautes.length > 0) {
  console.error(`\n${fautes.length} défaut(s) de responsive DANS la famille offre :`);
  for (const f of fautes) console.error(`  ${f}`);
  process.exit(1);
}

/* UN DÉFAUT HORS FAMILLE NE SE CORRIGE PAS ICI, MAIS IL NE PASSE PAS NON PLUS.
   Code 3, distinct du 1 : la famille est propre, un composant commun ne l'est
   pas, et c'est son chantier qui le répare. Une porte qui tairait cela
   mentirait sur ce que le visiteur voit. */
if (horsPerimetre.length > 0) {
  console.error("\nLa famille offre est conforme ; le composant commun nommé ci-dessus ne l'est pas.");
  process.exit(3);
}

console.log("\nresponsive de la famille offre conforme aux quatre largeurs");
