/**
 * PORTE DU RESPONSIVE, FAMILLE ACCUEIL.
 *
 *   node scripts/verifie-responsive-accueil.mjs
 *   node scripts/verifie-responsive-accueil.mjs --controle
 *   SITE_URL=http://localhost:4361/ node scripts/verifie-responsive-accueil.mjs
 *
 * Sept pages, quatre largeurs, quatre règles. Elle mesure dans un vrai
 * navigateur, après hydratation, bandeau de consentement refusé, et elle
 * REFUSE DE CONCLURE si une page ne répond pas : une porte qui saute une page
 * et se déclare verte est pire que pas de porte, parce qu'elle rassure.
 *
 * ---------------------------------------------------------------- LES RÈGLES
 *
 * 1. « débordement » : un élément plus large que son HÔTE. L'hôte est le
 *    premier ancêtre qui ROGNE (`overflow-x` à `clip` ou `hidden`), sinon la
 *    fenêtre. On mesure l'ÉLÉMENT, jamais le document : `.mg-site` est en
 *    `overflow-x: clip`, `documentElement.scrollWidth` ne bouge donc JAMAIS, et
 *    une porte qui le regardait a déjà déclaré conforme un bouton de 409 px
 *    dans une fenêtre de 375. Ce qui dépasse est coupé sans qu'aucune barre de
 *    défilement ne le dise.
 *
 * 2. « cible tactile » : au moins 24 × 24 px, le seuil EXACT du critère 2.5.8
 *    de la WCAG 2.2, niveau AA. Les 44 px souvent cités sont une recommandation
 *    d'Apple, pas une obligation. L'exemption par l'ESPACEMENT que la WCAG
 *    admet explicitement est appliquée : un lien séparé de ses voisins de 24 px
 *    passe, le séparateur pouvant être une marge OU le `gap` de la grille
 *    parente, et les listes de ce site sont des grilles à `gap`.
 *
 * 3. « texte tronqué » : une feuille de texte dont le contenu dépasse sa boîte
 *    dans un conteneur qui rogne, en largeur comme en hauteur.
 *
 * 4. « repli mobile » : le nombre de blocs `data-pliable-mobile` de chaque
 *    page, et le fait qu'ils soient bien REFERMÉS sous 880 px. C'est le garde
 *    anti-régression du motif mobile : il est servi OUVERT par le serveur et
 *    refermé par un effet client, donc un portage qui casse l'effet ne se voit
 *    nulle part ailleurs.
 *
 * ------------------------------------------------- LES PIÈGES DÉJÀ PAYÉS ICI
 *
 * · ATTENDRE L'HYDRATATION. Les blocs repliables arrivent ouverts et se
 *   referment après montage, sous 880 px seulement. Mesurer avant, c'est
 *   mesurer une page qui n'existe pour personne.
 * · ÉCARTER CE QUI VIT DANS UN `<details>` FERMÉ. Les navigateurs récents
 *   enveloppent le contenu d'un `<details>` dans `::details-content` et lui
 *   posent `content-visibility: hidden` : ses descendants gardent un rectangle,
 *   tous au même endroit. Sans cette exclusion, le premier relevé comptait
 *   202 faux chevauchements sur `/implantations/` et 135 sur l'accueil.
 * · REMONTER L'OPACITÉ ET LA VISIBILITÉ. Elles agissent à l'écran sans
 *   paraître dans le style calculé de l'enfant : les volets d'un carrousel
 *   comptaient tous.
 * · ÉCARTER LES ORNEMENTS. Un halo de 420 px dans un panneau de 240 est rogné
 *   EXPRÈS, et la piste d'un bandeau défilant fait 11 082 px par construction.
 *   58 des 85 premiers débordements étaient des ornements.
 * · ÉCARTER LE MOTIF « MASQUÉ VISUELLEMENT ». Le champ piège anti-robot du
 *   formulaire vit à -9999 px : ce n'est pas une cible tactile de 169 × 24.
 * · LES FRAGMENTS DE LIGNE. `getBoundingClientRect()` d'un élément en ligne
 *   qui passe à la ligne rend l'UNION de ses fragments, un rectangle qui
 *   traverse ses voisins.
 *
 * ------------------------------------------------------------- LE TÉMOIN
 *
 * `--controle` prouve que cette porte sait échouer, et qu'elle échoue sur LA
 * BONNE RÈGLE : chaque témoin injecte une faute et le contrôle exige que la
 * règle visée tombe, reconnue à son étiquette. Un témoin qui ferait tomber la
 * règle voisine ne prouverait rien. Il porte AUSSI un contrôle négatif : sept
 * motifs légitimes qui RESSEMBLENT à des fautes et que la porte doit laisser
 * passer. Sans lui, un relevé plus large passerait pour un relevé plus fin.
 */
import { chromium } from "playwright";

const SITE = process.env.SITE_URL ?? "http://localhost:4361/";
const CONTROLE = process.argv.includes("--controle");
const LARGEURS = [320, 360, 390, 768];
const CIBLE_MINIMALE = 24;
/** Le seuil mobile du site, celui de `.barreAction` et du repli des blocs. */
const SEUIL_MOBILE = 880;

/** Les sept pages de la famille. Aucune n'est facultative. */
const PAGES = [
  "/",
  "/contact/",
  "/implantations/",
  "/nous-connaitre/",
  "/rse/",
  "/valeurs/",
  "/partenaires/",
];

/**
 * LE REPLI MOBILE, PAGE PAR PAGE, tel qu'il doit être.
 *
 * Relevé le 12/10 : seul `/implantations/` emploie le motif, avec six blocs.
 * La règle de la maquette mobile veut que la PREMIÈRE section d'une page reste
 * ouverte ; sur ces six, aucune n'est la première section de la page, elles se
 * referment donc toutes. Si un portage en ajoute ou en retire, ce n'est pas
 * forcément une faute, mais personne ne doit pouvoir le faire sans le voir.
 */
const REPLI_ATTENDU = {
  "/": { pliables: 0, replies: 0 },
  "/contact/": { pliables: 0, replies: 0 },
  "/implantations/": { pliables: 6, replies: 6 },
  "/nous-connaitre/": { pliables: 0, replies: 0 },
  "/rse/": { pliables: 0, replies: 0 },
  "/valeurs/": { pliables: 0, replies: 0 },
  "/partenaires/": { pliables: 0, replies: 0 },
};

/**
 * LES ÉCARTS DÉCLARÉS, ET POURQUOI CETTE LISTE N'EST PAS UN AVEUGLEMENT.
 *
 * Ces défauts sont mesurés, reconnus, et leur correctif tient en une ligne,
 * mais il s'écrit dans un fichier qui n'appartient PAS à la famille accueil.
 * Les taire rendrait la porte menteuse ; les compter comme des fautes de cette
 * famille la rendrait rouge pour le travail d'un autre.
 *
 * LA LISTE NE PEUT PAS POURRIR : la porte ÉCHOUE aussi quand un écart déclaré
 * n'est PLUS observé. Le jour où le propriétaire du fichier le corrige, elle
 * le dit et demande qu'on retire l'entrée. Un écart déclaré est une dette
 * datée, pas une dispense.
 */
const ECARTS_DECLARES = [
  /*
   * QUATRE ENTRÉES ONT ÉTÉ RETIRÉES D'ICI, ET LA LISTE EST DÉSORMAIS VIDE.
   * Chaque fois, c'est la règle anti-pourrissement qui l'a exigé, pas une
   * relecture : la porte a signalé que l'écart n'était PLUS observé et a refusé
   * de conclure jusqu'au retrait de l'entrée.
   *
   * LES DEUX PREMIÈRES, le 13/10 au matin.
   * `components/site/offre/AppelOffre.tsx` et
   * `components/site/offre/BandeAppel.tsx` portaient le même défaut que celui
   * corrigé dans `BandeauVerbe.tsx` : un `min-width` en pixels purs qui ne
   * cède jamais, 280 px et 260 px dans une bande qui n'en offre que 240 à
   * 320 px. Déclarés ici parce qu'ils sortent de la famille accueil, ils ont
   * été corrigés en parallèle par leur propriétaire, avec exactement le même
   * `min(…, 100%)`.
   *
   * LES DEUX SUIVANTES, le 13/10 au soir, et leurs correctifs sont lisibles
   * dans les fichiers qu'elles nommaient :
   *
   *   · `components/formulaire/FormulaireContact.module.css (.boutonEnvoi)`,
   *     règle « tronque » sur `/implantations/`. Le bouton d'envoi débordait de
   *     62 à 85 px sous 880 px. Le fichier porte maintenant, dans sa requête
   *     média sous 880 px, `white-space: normal !important` et
   *     `max-width: 100%` : le libellé passe à la ligne au lieu d'être coupé.
   *     LA COPIE N'A PAS BOUGÉ, et c'était la condition : le libellé du bouton
   *     d'envoi est un arbitrage ouvert de Mehdi (docs/PASSATION.md, section 5,
   *     point 1), et dans un FORMULAIRE seule la mise en page se touche.
   *
   *   · `components/site/blocs/SectionPliableMobile.module.css:24`, règle
   *     « debordement » sur le résumé du bloc repliable. Le résumé était le
   *     TROISIÈME élément de la rangée du `<summary>`, serré entre le titre et
   *     le chevron, 108 à 209 px de large pour 86 à 410 px de haut. `.bascule`
   *     est passée en `flex-wrap: wrap` et `.resume` en `flex: 0 0 100%` : le
   *     résumé prend la ligne entière sous le titre, comme la maquette mobile.
   *
   * CE QUE LEUR RETRAIT CHANGE : ces deux motifs ne sont plus dispensés. S'ils
   * reviennent, la porte les compte comme des fautes pleines. Une liste vide
   * est le seul état où elle ne dispense rien.
   */
];

/* ========================================================================
   LE RELEVÉ, exécuté dans la page.
   ===================================================================== */
const RELEVE = ({ cible }) => {
  const nom = (el) => {
    const classes =
      typeof el.className === "string" && el.className.trim()
        ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
        : "";
    const texte = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 36);
    return `${el.tagName.toLowerCase()}${classes} « ${texte} »`;
  };

  const dansUnReplie = (el) => {
    const details = el.closest("details:not([open])");
    if (!details) return false;
    const resume = details.querySelector(":scope > summary");
    return !(resume && resume.contains(el));
  };

  const invisible = (el) => {
    if (dansUnReplie(el)) return true;
    if (el.closest("nextjs-portal")) return true;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const st = getComputedStyle(n);
      if (
        st.visibility === "hidden" ||
        st.display === "none" ||
        Number(st.opacity) === 0 ||
        st.contentVisibility === "hidden"
      )
        return true;
    }
    return false;
  };

  /* Un ornement ne porte ni texte ni commande : le conteneur qui le rogne le
     rogne exprès, et il n'y a rien à perdre. */
  const ornement = (el) =>
    (el.textContent || "").trim() === "" &&
    el.querySelector('a[href], button, input, select, textarea, [role="button"]') === null;

  const tous = [...document.querySelectorAll("body *")].filter(
    (el) => el.tagName !== "NEXTJS-PORTAL" && !el.closest("nextjs-portal"),
  );

  const problemes = [];

  /* ------------------------------------------------------- 1. débordement */
  const coupables = [];
  for (const el of tous) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    if (b.left < -1000) continue;
    if (invisible(el) || ornement(el)) continue;

    let hote = null;
    let dansUnRail = false;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") {
        dansUnRail = true;
        break;
      }
      if (ox !== "visible") {
        hote = n;
        break;
      }
    }
    /* Un rail déborde par construction, et son contenu reste atteignable au
       doigt : ce n'est pas une perte. */
    if (dansUnRail) continue;

    const boite = hote
      ? hote.getBoundingClientRect()
      : { left: 0, right: window.innerWidth };
    const depasse = Math.max(b.right - boite.right, boite.left - b.left);
    if (depasse <= 1) continue;
    /* Un seul coupable par branche : un parent trop large emporte toute sa
       descendance, et quinze lignes pour un défaut noient les quatorze
       autres. */
    if (coupables.some((c) => c.contains(el))) continue;
    coupables.push(el);
    problemes.push({
      regle: "debordement",
      texte:
        `${nom(el)} fait ${Math.round(b.width)} px et dépasse de ` +
        `${Math.round(depasse)} px ${hote ? `son hôte ${nom(hote)}` : "la fenêtre"}`,
    });
  }

  /* ----------------------------------------------------- 2. cible tactile */
  for (const el of document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]',
  )) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    if (b.left < -1000) continue;
    if (invisible(el)) continue;
    const st = getComputedStyle(el);
    /* La WCAG exempte le lien en ligne dans du texte : l'agrandir casserait
       l'interligne du paragraphe qui le porte. */
    if (st.display === "inline" && el.closest("p, li, td")) continue;

    const parent = el.parentElement;
    const sp = parent ? getComputedStyle(parent) : null;
    const ecartGrille =
      sp && /grid|flex/.test(sp.display) ? Number.parseFloat(sp.rowGap) || 0 : 0;
    const marges =
      (Number.parseFloat(st.marginTop) || 0) + (Number.parseFloat(st.marginBottom) || 0);
    const espacement = Math.max(marges, ecartGrille);
    const passeParEspacement = b.height + espacement >= cible && b.width >= cible;
    if (passeParEspacement) continue;
    if (b.height >= cible && b.width >= cible) continue;

    problemes.push({
      regle: "cible",
      texte:
        `cible tactile ${nom(el)} ${Math.round(b.width)}×${Math.round(b.height)} px, ` +
        `sous le plancher de ${cible} px (espacement de ${Math.round(espacement)} px)`,
    });
  }

  /* ------------------------------------------------------ 3. texte tronqué
     TROIS FAÇONS DE PERDRE DU TEXTE, et les deux dernières ont été ajoutées
     le 13/10 APRÈS avoir regardé les captures : la porte était verte et deux
     blocs perdaient pourtant leurs mots.

     a) l'élément rogne son propre contenu ;
     b) le texte sort de SA PROPRE BOÎTE. L'élément, lui, tient dans la page :
        c'est son libellé qui dépasse, parce qu'il porte `white-space: nowrap`.
        Aucune règle qui mesure des ÉLÉMENTS ne peut le voir. Mesuré à 320 px
        sur la bascule « Avant migen© / Avec migen© » : les deux libellés
        sortaient de leur bouton et le second était coupé par le canevas ;
     c) un ancêtre rogne le texte EN HAUTEUR. Le débordement horizontal est
        déjà couvert par la règle 1 ; la hauteur ne l'était par personne.
        Mesuré à 320 px sur les tuiles photo de la bascule : le contenu est
        posé en absolu sur une tuile de 240 px de haut, il en demandait 300, et
        le début de chaque citation passait au dessus du cadre, donc dans le
        vide. « On rappelait le même prestataire » commençait à « le même ». */
  const plage = document.createRange();
  for (const el of tous) {
    if (el.children.length > 0) continue;
    const texte = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!texte) continue;
    if (invisible(el)) continue;
    /* Le motif « masqué visuellement » : le piège anti-robot et son étiquette
       vivent à -9999 px dans une boîte de hauteur nulle. Rien n'y est perdu,
       parce que rien n'y est montré. */
    if (el.getBoundingClientRect().left < -1000) continue;
    /* Une liste déroulante NATIVE n'est pas une mise en page : ses `option`
       sont dessinées par le système, hors de la page, et leur rectangle dans
       le document n'a aucun sens. Mesurées, les six indicatifs téléphoniques
       se déclaraient « coupés de 1 286 px » sur chaque page portant le
       formulaire. */
    if (el.closest("select") || el.tagName === "OPTION") continue;
    const st = getComputedStyle(el);
    const nombre = (v) => Number.parseFloat(v) || 0;

    // a) l'élément rogne son propre contenu
    const rogneX = st.overflowX !== "visible";
    const rogneY = st.overflowY !== "visible";
    /* UNE COUPE DÉCLARÉE N'EST PAS UNE COUPE SUBIE, et c'est la seule chose que
       cette règle-ci ne savait pas distinguer.

       `-webkit-line-clamp: 2` PRODUIT, par construction, un `overflow` qui
       rogne et un `scrollHeight` plus grand que le `clientHeight` : c'est son
       mécanisme même. Le relever comme un défaut, c'est relever le dessin.
       `components/site/blocs/SectionPliableMobile.module.css` le pose sur
       `.resume` parce que la maquette mobile coupe le résumé à deux lignes, le
       texte entier restant dans le HTML et s'ouvrant au doigt : la porte
       signalait les cinq résumés de `/implantations/` à chacune des quatre
       largeurs, treize signalements pour zéro texte perdu.

       LES QUATRE AUTRES PORTES RESPONSIVE DU DÉPÔT exemptaient déjà ce motif,
       chacune avec sa formule, `scripts/verifie-responsive.mjs`,
       `editorial/verification-responsive.mjs`, `carriere/verification-responsive.mjs`
       et `offre/verification-responsive-offre.mjs`. Celle-ci était la seule à
       ne pas le faire, et c'est elle qui avait tort.

       CE QUI N'EST PAS EXEMPTÉ, et le témoin le prouve : une coupe SANS
       annonce. Un `overflow: hidden` sec, un `nowrap` sans ellipse, un ancêtre
       qui rogne en hauteur. L'exemption est AXÉE : un `line-clamp` ne couvre
       que la hauteur, une ellipse que la largeur. Un résumé plafonné à deux
       lignes qui déborderait AUSSI à l'horizontale tombe toujours. */
    const plafondLignes = st.webkitLineClamp && st.webkitLineClamp !== "none";
    const ellipseDeclaree = st.textOverflow === "ellipsis";
    const coupeHauteurDeclaree = Boolean(plafondLignes);
    const coupeLargeurDeclaree = Boolean(ellipseDeclaree);
    if (
      (rogneX && !coupeLargeurDeclaree && el.scrollWidth > el.clientWidth + 2) ||
      (rogneY && !coupeHauteurDeclaree && el.scrollHeight > el.clientHeight + 2)
    ) {
      problemes.push({
        regle: "tronque",
        texte:
          `texte tronqué dans ${nom(el)} : contenu ${el.scrollWidth}×${el.scrollHeight} px ` +
          `dans une boîte de ${el.clientWidth}×${el.clientHeight} px`,
      });
      continue;
    }

    const boite = el.getBoundingClientRect();
    // b) le texte sort de sa propre boîte de contenu
    plage.selectNodeContents(el);
    const rt = plage.getBoundingClientRect();
    if (rt.width > 0) {
      const gauche = boite.left + nombre(st.borderLeftWidth) + nombre(st.paddingLeft);
      const droite = boite.right - nombre(st.borderRightWidth) - nombre(st.paddingRight);
      const sort = Math.max(rt.right - droite, gauche - rt.left);
      /* MÊME EXEMPTION QU'EN (a), ET POUR LA MÊME RAISON : une ellipse annoncée
         coupe à l'horizontale PAR DESSIN, et le rectangle du texte garde la
         largeur qu'il aurait eue sans la coupe. Sans ce test, la règle (b)
         rattrapait ce que la règle (a) venait d'exempter. L'exemption exige les
         DEUX conditions de l'ellipse réelle, `text-overflow: ellipsis` et un
         `overflow` horizontal qui rogne : un `nowrap` nu, lui, tombe toujours,
         et c'est le témoin « un libellé qui sort de son bouton » qui le prouve. */
      if (sort > 2 && !(coupeLargeurDeclaree && rogneX)) {
        problemes.push({
          regle: "tronque",
          texte:
            `le libellé de ${nom(el)} sort de sa propre boîte de ${Math.round(sort)} px ` +
            `(texte ${Math.round(rt.width)} px pour ${Math.round(droite - gauche)} px ` +
            `de place, white-space: ${st.whiteSpace})`,
        });
        continue;
      }
    }

    // c) un ancêtre rogne le texte en hauteur
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const sa = getComputedStyle(n);
      if (/auto|scroll/.test(sa.overflowY)) break; // il défile, le texte reste atteignable
      if (sa.overflowY === "visible") continue;
      const bn = n.getBoundingClientRect();
      const coupe = Math.max(boite.bottom - bn.bottom, bn.top - boite.top);
      if (coupe > 1) {
        problemes.push({
          regle: "tronque",
          texte:
            `texte coupé EN HAUTEUR de ${Math.round(coupe)} px par ${nom(n)} : ` +
            `« ${texte.slice(0, 40)} »`,
        });
      }
      break; // le premier ancêtre qui rogne décide
    }
  }

  return {
    problemes,
    pliables: document.querySelectorAll("[data-pliable-mobile]").length,
    replies: document.querySelectorAll("[data-pliable-mobile]:not([open])").length,
    hauteur: document.documentElement.scrollHeight,
  };
};

/* ========================================================================
   LES TÉMOINS : des fautes injectées, et des motifs légitimes qui y
   ressemblent. Chaque fonction tourne DANS la page.
   ===================================================================== */
const TEMOINS = [
  {
    nom: "un bloc plus large que son hôte",
    regle: "debordement",
    injecte: () => {
      const hote = document.createElement("div");
      hote.style.cssText = "overflow-x:clip;width:200px;margin:0 auto";
      const faute = document.createElement("div");
      faute.style.cssText = "width:400px;height:40px;background:#000";
      faute.textContent = "temoin de debordement";
      hote.append(faute);
      document.body.append(hote);
    },
  },
  {
    nom: "un lien de 20 px collé à ses voisins",
    regle: "cible",
    injecte: () => {
      const liste = document.createElement("div");
      liste.style.cssText = "display:grid;gap:0;width:200px";
      for (const mot of ["un", "deux"]) {
        const lien = document.createElement("a");
        lien.href = "/";
        lien.textContent = mot;
        lien.style.cssText =
          "display:block;width:20px;height:20px;margin:0;font:10px/20px sans-serif";
        liste.append(lien);
      }
      document.body.append(liste);
    },
  },
  {
    nom: "une phrase coupée par un conteneur qui rogne",
    regle: "tronque",
    injecte: () => {
      const boite = document.createElement("div");
      boite.style.cssText = "width:40px;overflow:hidden;white-space:nowrap;font:14px sans-serif";
      boite.textContent = "une phrase bien trop longue pour quarante pixels";
      document.body.append(boite);
    },
  },
  {
    nom: "un libellé qui sort de son bouton",
    regle: "tronque",
    injecte: () => {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.textContent = "un libelle bien trop long pour ce bouton";
      bouton.style.cssText =
        "display:block;width:60px;height:40px;white-space:nowrap;font:14px sans-serif;" +
        "padding:0;border:0;background:#eee";
      document.body.append(bouton);
    },
  },
  {
    nom: "une citation coupée en hauteur par sa carte",
    regle: "tronque",
    injecte: () => {
      const carte = document.createElement("div");
      carte.style.cssText = "position:relative;overflow:hidden;width:200px;height:40px";
      const dedans = document.createElement("div");
      dedans.style.cssText =
        "position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end";
      const citation = document.createElement("p");
      citation.style.cssText = "margin:0;font:14px/1.5 sans-serif";
      citation.textContent =
        "une citation de plusieurs lignes qui demande bien plus de hauteur que la carte ne lui en donne, et dont le debut passe donc au dessus du cadre";
      dedans.append(citation);
      carte.append(dedans);
      document.body.append(carte);
    },
  },
  {
    nom: "un bloc repliable retiré de la page",
    regle: "repli",
    injecte: () => {
      document.querySelector("[data-pliable-mobile]")?.remove();
    },
    /* Ce témoin ne vaut que sur une page qui en porte : l'accueil n'en a
       aucun, il tourne donc sur `/implantations/`. */
    page: "/implantations/",
  },
  {
    nom: "un bloc repliable laissé ouvert au téléphone",
    regle: "repli",
    injecte: () => {
      const bloc = document.querySelector("[data-pliable-mobile]:not([open])");
      if (bloc) bloc.open = true;
    },
    page: "/implantations/",
  },
];

/**
 * LE CONTRÔLE NÉGATIF : sept motifs qui ressemblent à des fautes.
 *
 * Si l'un d'eux est signalé, la porte est trop large, et son silence sur le
 * reste ne vaut plus rien. Les sept sont tirés du site réel, pas inventés :
 * c'est exactement ce que le premier relevé signalait à tort.
 */
const CONTROLE_NEGATIF = () => {
  // 1. Un halo décoratif, sans texte, rogné exprès par sa carte.
  const carte = document.createElement("div");
  carte.style.cssText = "position:relative;overflow:hidden;width:200px;height:80px";
  const halo = document.createElement("div");
  halo.style.cssText =
    "position:absolute;width:420px;height:420px;right:-160px;top:-160px;" +
    "background:radial-gradient(circle,rgba(255,124,60,.32),transparent 68%);pointer-events:none";
  carte.append(halo);
  document.body.append(carte);

  // 2. Un rail à défilement horizontal, plus large que son hôte par nature.
  const rail = document.createElement("div");
  rail.style.cssText = "width:200px;overflow-x:auto";
  const piste = document.createElement("div");
  piste.style.cssText = "width:2000px;height:30px;font:14px sans-serif";
  piste.textContent = "une piste de carrousel, atteignable au doigt";
  rail.append(piste);
  document.body.append(rail);

  // 3. Un lien de 20 px, mais séparé de 24 px : exemption par l'espacement.
  const espacee = document.createElement("div");
  espacee.style.cssText = "display:grid;gap:26px;width:200px";
  for (const mot of ["trois", "quatre"]) {
    const lien = document.createElement("a");
    lien.href = "/";
    lien.textContent = mot;
    lien.style.cssText = "display:block;width:40px;height:20px;font:10px/20px sans-serif";
    espacee.append(lien);
  }
  document.body.append(espacee);

  // 4. Le champ piège anti-robot, posé hors de l'écran.
  const piege = document.createElement("div");
  piege.style.cssText = "position:absolute;left:-9999px;height:0;width:0;overflow:hidden";
  const champ = document.createElement("input");
  champ.type = "text";
  champ.name = "site_web_temoin";
  champ.tabIndex = -1;
  piege.append(champ);
  document.body.append(piege);

  // 5. Du texte dans un `<details>` fermé : présent, mais pas à l'écran.
  const ferme = document.createElement("details");
  const resume = document.createElement("summary");
  resume.textContent = "un titre";
  const dedans = document.createElement("div");
  dedans.style.cssText = "width:40px;overflow:hidden;white-space:nowrap;font:14px sans-serif";
  dedans.textContent = "du texte que personne ne voit tant que le bloc est fermé";
  ferme.append(resume, dedans);
  document.body.append(ferme);

  /* 6. UN RÉSUMÉ COUPÉ À DEUX LIGNES PAR `line-clamp`, et c'est le motif que
        ce témoin-là manquait, découvert le 13/10.

        `components/site/blocs/SectionPliableMobile.module.css` pose
        `-webkit-line-clamp: 2` sur `.resume` : c'est la maquette mobile qui le
        demande, le texte entier reste dans le HTML et s'ouvre au doigt. La
        règle (a) voyait un `overflow` qui rogne et `scrollHeight` supérieur à
        `clientHeight`, donc exactement ce qu'un `line-clamp` PRODUIT, et
        signalait les cinq résumés de `/implantations/` comme « texte tronqué »
        à chacune des quatre largeurs, soit treize signalements faux.

        LES QUATRE AUTRES PORTES RESPONSIVE DU DÉPÔT l'exemptaient déjà, chacune
        avec sa phrase : `scripts/verifie-responsive.mjs` (« relevé à part et ne
        compte pas »), `components/site/editorial/verification-responsive.mjs`
        (« sans ellipse ni clamp »), `.../carriere/verification-responsive.mjs`
        (« plafonné à N lignes ») et `.../offre/verification-responsive-offre.mjs`
        (« line-clamp assumés, non comptés »). Celle-ci était la seule à ne pas
        le faire. Le motif est donc posé ici en contrôle négatif, pour que
        l'exemption soit vérifiée et non supposée. */
  const resumePlafonne = document.createElement("p");
  resumePlafonne.style.cssText =
    "width:280px;margin:0;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;" +
    "-webkit-box-orient:vertical;overflow:hidden;font:400 13.5px/1.6 sans-serif";
  resumePlafonne.textContent =
    "un resume de bloc repliable, coupe a deux lignes par la maquette mobile, " +
    "dont la suite entiere reste dans le HTML et s ouvre au doigt sur la bascule";
  document.body.append(resumePlafonne);

  /* 7. LE MÊME MOTIF À L'HORIZONTALE : une ellipse déclarée. Un `nowrap` avec
        `text-overflow: ellipsis` prévient le lecteur que la suite est coupée ;
        c'est un choix de dessin, pas un texte perdu en silence. */
  const ellipse = document.createElement("div");
  ellipse.style.cssText =
    "width:120px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:14px sans-serif";
  ellipse.textContent = "un libelle coupe par une ellipse annoncee au lecteur";
  document.body.append(ellipse);
};

/* ========================================================================
   Pilotage
   ===================================================================== */
async function ouvre(contexte, chemin, largeur) {
  const page = await contexte.newPage();
  const reponse = await page.goto(new URL(chemin, SITE).href, {
    waitUntil: "load",
    timeout: 120_000,
  });
  if (!reponse || !reponse.ok()) {
    await page.close();
    return { muette: `répond ${reponse ? reponse.status() : "rien"}` };
  }
  // La pastille de développement de Next n'appartient pas à la page.
  await page
    .addStyleTag({ content: "nextjs-portal{display:none !important}" })
    .catch(() => {});
  /* BANDEAU DE CONSENTEMENT REFUSÉ, ET ON VÉRIFIE QU'IL EST PARTI.
     Il est fixe, en bas, au-dessus du contenu, et il a déjà compté jusqu'à
     57 % de faux pixels. Le cliquer « s'il est là » ne suffit pas : il est posé
     par un composant client, donc il n'est PAS encore dans la page au moment
     où elle finit de charger. Vu le 13/10 sur une capture d'écran, bandeau
     bien présent alors que la ligne de clic était passée sans rien trouver.
     On l'attend, on le refuse, puis on attend sa disparition. */
  const refus = page.getByRole("button", { name: /Tout refuser/i }).first();
  await refus.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  if (await refus.count()) {
    await refus.click().catch(() => {});
    await refus.waitFor({ state: "detached", timeout: 5000 }).catch(() => {});
  }
  await page.evaluate(() => document.fonts.ready);
  /* HYDRATATION. Les blocs repliables sont servis ouverts et refermés par un
     effet client, sous 880 px seulement. On attend que l'effet soit passé :
     soit un bloc est fermé, soit la page n'en porte aucun. */
  if (largeur < SEUIL_MOBILE) {
    await page
      .waitForFunction(
        () => {
          const tous = document.querySelectorAll("[data-pliable-mobile]");
          return tous.length === 0 || [...tous].some((d) => !d.open);
        },
        { timeout: 20_000 },
      )
      .catch(() => {});
  }
  await page.waitForTimeout(700);
  return { page };
}

const navigateur = await chromium.launch({ channel: "chrome" });

/* ------------------------------------------------------------- mode témoin */
if (CONTROLE) {
  const echecs = [];
  const contexte = await navigateur.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  for (const temoin of TEMOINS) {
    const chemin = temoin.page ?? "/";
    const ouverture = await ouvre(contexte, chemin, 390);
    if (ouverture.muette) {
      echecs.push(`témoin « ${temoin.nom} » : ${chemin} ${ouverture.muette}`);
      continue;
    }
    const { page } = ouverture;
    const avant = await page.evaluate(RELEVE, { cible: CIBLE_MINIMALE });
    await page.evaluate(temoin.injecte);
    await page.waitForTimeout(150);
    const apres = await page.evaluate(RELEVE, { cible: CIBLE_MINIMALE });

    /* La règle « repli » ne sort pas du relevé dans la page : elle se juge sur
       les compteurs, exactement comme en mode normal. */
    let tombe;
    if (temoin.regle === "repli") {
      const attendu = REPLI_ATTENDU[chemin];
      tombe =
        apres.pliables !== attendu.pliables || apres.replies !== attendu.replies;
    } else {
      const nouveaux = apres.problemes.filter(
        (p) => !avant.problemes.some((q) => q.texte === p.texte),
      );
      tombe = nouveaux.some((p) => p.regle === temoin.regle);
      const voisines = [...new Set(nouveaux.map((p) => p.regle))].filter(
        (r) => r !== temoin.regle,
      );
      /* UN TÉMOIN QUI FAIT TOMBER LA RÈGLE VOISINE NE PROUVE RIEN. On exige
         donc que la règle visée tombe ET qu'elle soit la seule. */
      if (tombe && voisines.length > 0) {
        echecs.push(
          `témoin « ${temoin.nom} » visait « ${temoin.regle} » mais fait aussi ` +
            `tomber ${voisines.join(", ")} : il ne prouve rien de précis`,
        );
      }
    }
    if (!tombe) {
      echecs.push(
        `témoin « ${temoin.nom} » : la règle « ${temoin.regle} » n'est PAS tombée, ` +
          `la porte ne sait donc pas la faire échouer`,
      );
    } else {
      console.log(`témoin  ${temoin.nom.padEnd(48)} règle « ${temoin.regle} » tombe`);
    }
    await page.close();
  }

  /* Le témoin de la page muette : une URL qui n'existe pas doit ARRÊTER la
     porte, pas être sautée en silence. */
  const muette = await ouvre(contexte, "/temoin-page-absente-ne-pas-creer/", 390);
  if (muette.muette) {
    console.log(`témoin  ${"une page qui ne répond pas".padEnd(48)} règle « page muette » tombe`);
  } else {
    echecs.push(
      "témoin « une page qui ne répond pas » : l'URL de contrôle a répondu 200, " +
        "le témoin est à refaire (quelqu'un a créé la page)",
    );
    await muette.page.close();
  }

  /* Le contrôle négatif. */
  const neg = await ouvre(contexte, "/", 390);
  if (neg.muette) {
    echecs.push(`contrôle négatif : / ${neg.muette}`);
  } else {
    const avant = await neg.page.evaluate(RELEVE, { cible: CIBLE_MINIMALE });
    await neg.page.evaluate(CONTROLE_NEGATIF);
    await neg.page.waitForTimeout(150);
    const apres = await neg.page.evaluate(RELEVE, { cible: CIBLE_MINIMALE });
    const nouveaux = apres.problemes.filter(
      (p) => !avant.problemes.some((q) => q.texte === p.texte),
    );
    if (nouveaux.length > 0) {
      echecs.push(
        `contrôle négatif : ${nouveaux.length} motif(s) LÉGITIME(s) signalé(s) à tort, ` +
          `la porte est trop large\n      ${nouveaux.map((p) => `[${p.regle}] ${p.texte}`).join("\n      ")}`,
      );
    } else {
      console.log(
        `témoin  ${"sept motifs légitimes (contrôle négatif)".padEnd(48)} aucun n'est signalé`,
      );
    }
    await neg.page.close();
  }

  await contexte.close();
  await navigateur.close();

  if (echecs.length > 0) {
    console.error(`\nLE TÉMOIN ÉCHOUE, ${echecs.length} point(s) :\n`);
    for (const e of echecs) console.error(`  · ${e}`);
    console.error(
      "\nUne porte qui ne prouve pas son échec ne prouve pas son succès : " +
        "ne croyez pas son vert tant que ceci est rouge.",
    );
    process.exit(1);
  }
  console.log(
    "\nTémoin complet : chaque règle tombe sur SA faute, et les sept motifs " +
      "légitimes passent. La porte sait échouer.",
  );
  process.exit(0);
}

/* ------------------------------------------------------------- mode normal */
const fautes = [];
const declaresVus = new Set();
const pires = { ecrans: 0, page: "" };
/* Le total par règle : c'est le chiffre qu'on compare d'un soir à l'autre. */
const compte = { debordement: 0, cible: 0, tronque: 0 };
let mesures = 0;

try {
  for (const largeur of LARGEURS) {
    const contexte = await navigateur.newContext({
      viewport: { width: largeur, height: 844 },
      hasTouch: largeur < 768,
      isMobile: largeur < 768,
    });

    for (const chemin of PAGES) {
      const ouverture = await ouvre(contexte, chemin, largeur);
      if (ouverture.muette) {
        /* ELLE REFUSE DE CONCLURE. Une page qui ne répond pas n'est pas une
           page conforme : la porte s'arrête dessus au lieu de la sauter. */
        fautes.push(
          `${chemin} à ${largeur} px : la page NE RÉPOND PAS (${ouverture.muette}), ` +
            `la porte ne peut rien conclure de cette famille`,
        );
        continue;
      }
      const { page } = ouverture;
      const releve = await page.evaluate(RELEVE, { cible: CIBLE_MINIMALE });
      mesures += 1;

      const declares = [];
      const reels = [];
      for (const p of releve.problemes) {
        const ecart = ECARTS_DECLARES.find(
          (e) => e.page === chemin && e.regle === p.regle && e.motif.test(p.texte),
        );
        if (ecart) {
          declaresVus.add(ecart.cle);
          declares.push(`${ecart.fichier} : ${p.texte}`);
        } else {
          reels.push(`[${p.regle}] ${p.texte}`);
        }
      }

      if (reels.length > 0) {
        fautes.push(
          `${chemin} à ${largeur} px : ${reels.length} défaut(s)\n      ` +
            reels.slice(0, 6).join("\n      ") +
            (reels.length > 6 ? `\n      … et ${reels.length - 6} de plus` : ""),
        );
      }
      for (const p of releve.problemes) {
        if (declares.length && ECARTS_DECLARES.some((e) => e.motif.test(p.texte))) continue;
        compte[p.regle] = (compte[p.regle] ?? 0) + 1;
      }

      const attendu = REPLI_ATTENDU[chemin];
      if (!attendu) {
        fautes.push(`${chemin} : aucun repli attendu déclaré, la porte ne sait pas juger`);
      } else if (releve.pliables !== attendu.pliables) {
        fautes.push(
          `${chemin} à ${largeur} px : ${releve.pliables} bloc(s) repliable(s) au lieu de ` +
            `${attendu.pliables}. Le motif mobile a changé : si c'est voulu, mettre à jour ` +
            `REPLI_ATTENDU dans cette porte, sinon le repli est défait`,
        );
      } else if (largeur < SEUIL_MOBILE && releve.replies !== attendu.replies) {
        fautes.push(
          `${chemin} à ${largeur} px : ${releve.replies} bloc(s) replié(s) au lieu de ` +
            `${attendu.replies}. Les blocs arrivent OUVERTS du serveur : l'effet client ` +
            `qui les referme sous ${SEUIL_MOBILE} px ne joue plus`,
        );
      }

      if (largeur === 390) {
        const ecrans = releve.hauteur / 844;
        if (ecrans > pires.ecrans) {
          pires.ecrans = ecrans;
          pires.page = chemin;
        }
      }

      console.log(
        `${chemin.padEnd(18)} ${String(largeur).padStart(4)} px  ` +
          `${String(reels.length).padStart(2)} défaut(s)  ` +
          `${String(declares.length).padStart(2)} écart(s) déclaré(s)  ` +
          `repli ${releve.replies}/${releve.pliables}  ` +
          `hauteur ${(releve.hauteur / 844).toFixed(1)} écran(s)`,
      );
      for (const d of declares) console.log(`     écart déclaré, hors famille : ${d}`);
      await page.close();
    }

    await contexte.close();
  }
} catch (erreur) {
  fautes.push(`relevé impossible : ${erreur.message.split("\n")[0]}`);
} finally {
  await navigateur.close();
}

/* UNE PORTE QUI N'A RIEN MESURÉ N'EST PAS VERTE. */
const ATTENDU = LARGEURS.length * PAGES.length;
if (mesures < ATTENDU) {
  fautes.push(
    `${mesures} relevé(s) sur ${ATTENDU} : la porte n'a pas vu toute la famille ` +
      `et ne conclut pas`,
  );
}

/* UN ÉCART DÉCLARÉ QUI A DISPARU DOIT SORTIR DE LA LISTE. */
for (const ecart of ECARTS_DECLARES) {
  if (!declaresVus.has(ecart.cle)) {
    fautes.push(
      `l'écart déclaré sur ${ecart.fichier} n'est PLUS observé : il a été corrigé, ` +
        `retirer son entrée de ECARTS_DECLARES, sinon la liste devient une dispense`,
    );
  }
}

console.log(
  `\nTOTAUX : ${compte.debordement} débordement(s), ${compte.cible} cible(s) sous ` +
    `${CIBLE_MINIMALE} px, ${compte.tronque} texte(s) tronqué(s), hors écarts déclarés` +
    `\npire hauteur à 390 px : ${pires.page} à ${pires.ecrans.toFixed(1)} écrans de 844 px`,
);

if (fautes.length > 0) {
  console.error(`\nRESPONSIVE ACCUEIL, ${fautes.length} point(s) à reprendre :\n`);
  for (const f of fautes) console.error(`  · ${f}`);
  console.error(
    `\nTémoin : node scripts/verifie-responsive-accueil.mjs --controle, ` +
      `pour vérifier que cette porte sait encore échouer.`,
  );
  process.exit(1);
}

console.log(
  `\nResponsive accueil conforme : ${PAGES.length} pages × ${LARGEURS.length} largeurs, ` +
    `aucun débordement, aucune cible sous ${CIBLE_MINIMALE} px, aucun texte tronqué, ` +
    `repli mobile intact. ${ECARTS_DECLARES.length} écart(s) déclaré(s) hors famille.`,
);
