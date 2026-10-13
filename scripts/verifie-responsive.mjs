/**
 * LA PORTE DU RESPONSIVE DU SITE, celle qui manquait.
 *
 *   node scripts/verifie-responsive.mjs
 *   node scripts/verifie-responsive.mjs --controle
 *   node scripts/verifie-responsive.mjs --detail
 *   SITE_URL=http://localhost:4471 node scripts/verifie-responsive.mjs
 *
 * Sans `SITE_URL`, elle mesure la PRODUCTION (`https://migen-site.vercel.app`).
 * Deux avertissements pour ce cas, tous deux payés sur ce projet : un
 * déploiement Vercel prend de 30 secondes à 5 minutes, donc une correction
 * poussée à l'instant n'est pas encore en ligne ; et un en-tête
 * `x-vercel-cache: HIT` sert une page périmée. La porte lit cet en-tête et le
 * DIT, page par page, au lieu de laisser croire qu'elle a mesuré le neuf.
 *
 * ====================================================================
 * POURQUOI ELLE EXISTE, ET CE QUI L'A RENDUE NÉCESSAIRE
 * ====================================================================
 *
 * Quatre familles ont mesuré et corrigé leur responsive, chacune avec son
 * instrument : `accueil` (7 pages), `offre`, `carriere` (14 pages), `editorial`
 * (84 pages recensées). Chacune est verte ou rouge DANS SON PÉRIMÈTRE, et
 * c'est précisément le trou : un défaut qui vit entre deux familles
 * n'appartient à personne.
 *
 * LA PREUVE QUE LE TROU EST RÉEL, et elle est écrite dans le compte rendu de la
 * famille `offre` : « Les 9 débordements restants sont TOUS le même défaut,
 * attribué à `components/site/blocs/SectionPliableMobile`, HORS de mon
 * périmètre : 0 défaut dans la famille. La porte sort en code 3, jamais en
 * vert. » Un composant PARTAGÉ par les gabarits Offre, Ville, Secteur, Domaine
 * et Spécialité était donc tenu pour « hors périmètre » par la seule famille
 * qui l'avait mesuré. La famille `accueil` a déclaré le même défaut en écart
 * hors périmètre. Personne ne possédait le défaut, donc personne ne le
 * comptait. Cette porte-ci n'a pas de « hors périmètre » : elle mesure le site,
 * et un défaut partagé est un défaut.
 *
 * ELLE AJOUTE AUSSI DEUX RÈGLES QU'AUCUNE FAMILLE N'A MESURÉES :
 *
 *  · LES CHEVAUCHEMENTS, armés partout (carriere les signalait sans bloquer) ;
 *  · LA BASCULE FOCALISABLE AU-DESSUS DE 880 PX. Sur bureau, la feuille de
 *    style de `SectionPliableMobile` masque le chevron, met le curseur en
 *    `default` et rend le contenu visible : la bascule n'est plus une
 *    commande, c'est un titre. Son `<summary>` reste pourtant dans l'ordre de
 *    tabulation, avec `tabIndex` à 0 : un ARRÊT DE TABULATION MUET par
 *    section, qui n'ouvre rien, ne ferme rien et n'annonce rien d'utile. Sur
 *    une page à dix blocs, c'est dix arrêts pour rien avant d'atteindre le
 *    pied de page. Aucune mesure de largeur ne pouvait le voir, parce qu'il ne
 *    se voit pas : il se tabule.
 *
 * ====================================================================
 * LES SIX RÈGLES
 * ====================================================================
 *
 * 1. DÉBORDEMENT : aucun élément plus large que SON HÔTE. On mesure
 *    l'ÉLÉMENT, jamais le document. `.mg-site` est en `overflow-x: clip`,
 *    donc `document.documentElement.scrollWidth` ne bouge JAMAIS d'un pixel :
 *    une porte qui le regardait a déjà déclaré conformes 118 pages dont le
 *    bouton d'action faisait 409 px dans une fenêtre de 375. Ce qui dépasse
 *    est coupé sans qu'aucune barre de défilement ne le dise. `.mg-site`,
 *    `html` et `body` sont donc explicitement écartés de la liste des
 *    rognages légitimes.
 *
 * 2. CIBLE TACTILE : au moins 24 px, le seuil EXACT du critère 2.5.8 de la
 *    WCAG 2.2, niveau AA. Les 44 px souvent cités sont une recommandation
 *    d'Apple, pas une obligation. Les deux exemptions que la norme admet sont
 *    honorées : l'ESPACEMENT (une cible de 20 px séparée de 24 px passe, et le
 *    `gap` de la grille parente compte, car les listes de ce site sont des
 *    grilles à `gap` et des marges nulles) et le LIEN EN LIGNE DANS UNE PHRASE
 *    (l'agrandir casserait l'interligne du texte qui le porte).
 *
 * 3. TEXTE COUPÉ OU MASQUÉ. Trois façons de perdre des mots : le rognage par
 *    `overflow`, la troncature à l'ellipse, et le libellé qui sort de SA
 *    PROPRE BOÎTE (aucune règle qui mesure des ÉLÉMENTS ne peut voir
 *    celle-là ; c'est elle qui trouve les libellés de bouton en
 *    `white-space: nowrap` et les colonnes de 64 px qui portent 100 px de
 *    texte). Le `-webkit-line-clamp`, lui, est RELEVÉ À PART et ne compte
 *    pas : c'est un motif de la maquette mobile, déclaré dans le code qui le
 *    pose, et un `line-clamp` prévient le lecteur que la suite est juste là,
 *    sous la bascule. Le bloquer reviendrait à corriger du conforme.
 *
 * 4. CHEVAUCHEMENT entre deux feuilles de texte EN FLUX. On compare L'ENCRE,
 *    ligne par ligne, et non les boîtes : les liens du maillage du pied de
 *    page sont des pastilles dont le remplissage porte la cible à 24 px et
 *    dont une marge négative de même valeur retient la colonne, si bien que
 *    leurs boîtes peintes se recouvrent de 6 px d'une ligne à l'autre sans
 *    qu'un seul mot soit caché. Ce motif seul valait 1 826 faux relevés.
 *    Les éléments hors du flux sont écartés : un panneau qui se déplie
 *    par-dessus la page, une barre collante ou un bandeau se superposent par
 *    construction.
 *
 * 5. AU-DESSUS DE 880 PX, AUCUNE BASCULE DE BLOC REPLIABLE FOCALISABLE. Voir
 *    plus haut. Mesurée à 1280 px, et seulement là : sous 880 px la bascule
 *    EST une commande et doit rester atteignable au clavier.
 *
 * 6. LE COMPTE DE BLOCS REPLIABLES, qui ne doit pas tomber. Ils portent la
 *    promesse du colis de passation (« les blocs se déplient pour rester
 *    courts sans perdre le texte utile au référencement ») et les quatre
 *    familles les ont comptés : 41 pour offre, 147 pour carriere, 6 pour
 *    accueil, 1 092 sur les 233 pages du site. Un portage qui en retire ne
 *    casse aucun pixel : il rallonge la page de plusieurs écrans, en silence.
 *
 * CE QU'ELLE NE MESURE PAS, ET C'EST VOULU : les contrastes. Les quatre
 * familles en ont relevé 9 460 sous AA, tous volontaires, fidélité à la
 * maquette, arbitrage ouvert n° 7 de `docs/PASSATION.md`. Les rendre bloquants
 * ici trancherait à la place de Mehdi. Et les arbitrages de copie se déclarent
 * dans `lib/decisions-copie.ts`, jamais en double dans une porte.
 *
 * ====================================================================
 * ELLE REFUSE DE CONCLURE
 * ====================================================================
 *
 * Conclure sur un échantillon muet est la faute qu'une porte existe pour
 * empêcher, et `scripts/verifie-blocs-pliables.mjs` l'a commise le 12/10 : sa
 * boucle avalait chaque page injoignable par un `catch { return }`, au motif
 * que les autres portes la signaleraient. Si 240 pages sur 248 étaient tombées
 * et que les 8 restantes portaient des blocs sains, elle annonçait
 * tranquillement « 8 pages, tant de blocs, vert ». Elle a été réparée en
 * mettant le VERDICT DE COUVERTURE AVANT TOUT AUTRE : une seule page muette
 * rend la mesure NON CONCLUANTE, et la porte dit « je n'ai pas pu mesurer »,
 * pas « c'est faux ». Cette porte-ci fait pareil, et elle étend le refus à
 * tout ce qui rendrait le relevé faux sans le rendre visible :
 *
 *   · une page qui ne répond pas 200, à n'importe laquelle des largeurs ;
 *   · un `<main>` vide ou quasi vide ;
 *   · le bandeau de consentement encore présent après le refus (il est fixe,
 *     en bas, au-dessus du contenu, et il a déjà compté 57 % de faux pixels) ;
 *   · LE REPLI MOBILE NON OBSERVÉ sous 880 px, qui signe une hydratation non
 *     terminée : les blocs sont servis OUVERTS par le serveur et refermés par
 *     un effet client. Mesurer avant, c'est mesurer une page qui n'existe pour
 *     personne, et c'est le piège qui a faussé toutes les hauteurs une
 *     première fois ;
 *   · un relevé manquant, quelle qu'en soit la cause.
 *
 * ====================================================================
 * LES PIÈGES DÉJÀ PAYÉS, HONORÉS ICI
 * ====================================================================
 *
 * · `checkVisibility` ET PAS UN TEST MAISON. Un bloc repliable fermé ne cache
 *   pas son contenu par `display: none` : les navigateurs récents enveloppent
 *   tout sauf le `<summary>` dans `::details-content` et lui posent
 *   `content-visibility: hidden`. Or cette propriété NE S'HÉRITE PAS : chaque
 *   descendant d'un bloc fermé se croit visible, et tous partagent le même
 *   rectangle figé. Un test maison les laissait passer : 1 793
 *   « chevauchements » sur une seule fiche, et 202 sur `/implantations/`.
 * · UNE BOÎTE PAR LIGNE, `getClientRects()` et pas `getBoundingClientRect()`.
 *   Le rectangle d'ensemble d'un élément EN LIGNE qui passe à la ligne est
 *   l'union de ses fragments : il traverse ses voisins. 78 faux chevauchements
 *   par page, tous dans la liste de villes du pied de page. Et une boîte n'est
 *   pas de l'encre : voir la règle 4.
 * · ROGNER L'ENCRE COMME L'ÉCRAN LA ROGNE. Les lignes cachées par un
 *   `line-clamp` gardent leurs rectangles et tombent sur le bloc suivant : le
 *   motif que la règle 3 exempte reviendrait par la règle 4, déguisé en
 *   chevauchement.
 * · ÉCARTER LES ORNEMENTS ET LES RAILS. Un halo de 420 px dans un panneau de
 *   240 est rogné exprès ; la piste d'un bandeau défilant fait 11 082 px par
 *   construction. 58 des 85 premiers débordements d'une famille étaient des
 *   ornements.
 * · ATTENDRE `img.decode()`, jamais le seul `complete` : une image en vol se
 *   mesure à zéro.
 * · DÉFILER TOUTE LA PAGE AVANT DE MESURER, hauteur lue UNE SEULE FOIS et pas
 *   de ligne en ligne : les révélations au défilement font grandir la page
 *   pendant qu'on la parcourt, et la boucle ne s'arrêtait jamais sur la page
 *   la plus longue du site. Sans ce défilement, les blocs non révélés sont en
 *   `visibility: hidden` et leur bascule n'est même pas focalisable : la
 *   règle 5 mesurait zéro arrêt de tabulation sur une page qui en porte dix.
 * · LA PASTILLE DE DÉVELOPPEMENT DE NEXT (`nextjs-portal`) n'appartient pas à
 *   la page.
 * · UN DOSSIER `.next` HÉRITÉ a déjà produit un build dont la page référençait
 *   une feuille de style INEXISTANTE, faussant toutes les hauteurs. Mesure
 *   locale : `rm -rf .next && bun run build && bun run start -- -p <port>` en
 *   ARRIÈRE-PLAN, un serveur au premier plan est tué par le délai du shell.
 *
 * ====================================================================
 * LE TÉMOIN, `--controle`
 * ====================================================================
 *
 * Les portes se forment, jamais ne s'aveuglent. Le témoin injecte les fautes
 * dans une COPIE EN MÉMOIRE de la page réelle : le HTML rendu, scripts
 * retirés, replacé dans un `<iframe>` de même origine, donc avec ses feuilles
 * de style, ses polices et son état d'après hydratation. Rien n'est écrit sur
 * le site, et pourtant la mesure porte sur du vrai rendu. Chaque témoin doit
 * faire tomber SA règle, reconnue à son message : un témoin qui fait tomber la
 * règle voisine ne prouve rien, et la porte le refuse explicitement.
 *
 * Et il porte DEUX CONTRÔLES NÉGATIFS, parce qu'un relevé plus large passerait
 * sinon pour un relevé plus fin :
 *
 *   · huit motifs LÉGITIMES qui ressemblent à des fautes, tous tirés du site
 *     réel et non inventés, injectés dans la copie : aucun ne doit être
 *     signalé. Deux d'entre eux sont les faux relevés que cette porte a
 *     elle-même produits le 13/10 avant correction, le `line-clamp` de la
 *     maquette et les pastilles du pied de page ;
 *   · UNE PAGE CONFORME, construite à la main, mesurée par le même
 *     instrument : elle doit être ACCEPTÉE sur les six règles.
 */
import { chromium } from "playwright";

const SITE = (process.env.SITE_URL ?? "https://migen-site.vercel.app").replace(/\/+$/, "");
const EN_PRODUCTION = !process.env.SITE_URL;

const ARGUMENTS = process.argv.slice(2);
const MODE_CONTROLE = ARGUMENTS.includes("--controle");
const DETAIL = ARGUMENTS.includes("--detail");

/** Les quatre largeurs mesurées, et chacune a sa raison. */
const LARGEURS = [
  320, // le plus petit écran encore en service
  360, // l'Android médian
  390, // l'iPhone depuis le 12
  768, // la bascule tablette, là où les grilles changent de colonnes
];
/** La largeur de BUREAU, qui ne sert qu'à la règle 5. */
const LARGEUR_BUREAU = 1280;
const HAUTEUR_ECRAN = 844;
const HAUTEUR_BUREAU = 900;
const CIBLE_MINIMALE = 24;
/** Le seuil mobile du site : le repli des blocs et la bascule des grilles. */
const SEUIL_MOBILE = 880;
/** Combien de pages se mesurent en parallèle. Le parallélisme est la norme. */
const FRONT = 4;

/**
 * L'ÉCHANTILLON : deux pages par gabarit, les onze gabarits, 22 pages.
 *
 * Les gabarits sont ceux que le client a nommés, lus dans
 * `maquette/contenu/site/index.json` (champ `gabarit`), jamais devinés :
 * 01 Article et fiche (38 pages), 02 Étude de cas (41), 03 Offre et prestation
 * (28), 04 Ville (66), 05 Spécialité (19), 06 Département (8), 07 Métier et
 * carrière (13), 08 Secteur (12), 09 Domaine (11), 10 Hub de rubrique (7),
 * 11 Sous-rubrique ressource (5). Deux cent quarante-huit pages en tout.
 *
 * DEUX PAR GABARIT, ET PAS UNE : un gabarit se rend différemment selon ce que
 * sa fiche de contenu porte. Les paires sont choisies pour ÉCARTER les deux
 * pages l'une de l'autre, pas pour se ressembler : une page longue et une
 * courte, une page à photos et une sans, un parent et un enfant.
 *
 * `pliables` est le compte de blocs repliables SERVIS par chaque page, relevé
 * le 13/10 sur le HTML du build de production, 92 blocs sur les 22 pages. Rien
 * n'est inventé : si la porte ne retrouve pas ce compte, elle le dit et ne
 * conclut pas à sa place.
 */
const ECHANTILLON = [
  { gabarit: "01 Article et fiche", url: "/guides/choisir-une-entreprise-de-maintenance/", pliables: 9 },
  { gabarit: "01 Article et fiche", url: "/ressources/fiches-pratiques/5s/", pliables: 7 },
  { gabarit: "02 Étude de cas", url: "/preuves/alstef-group/", pliables: 3 },
  { gabarit: "02 Étude de cas", url: "/preuves/autoliv/", pliables: 3 },
  { gabarit: "03 Offre et prestation", url: "/offres/zero-arret/", pliables: 3 },
  { gabarit: "03 Offre et prestation", url: "/offres/bureau-etudes/", pliables: 3 },
  { gabarit: "04 Ville", url: "/implantations/lyon/", pliables: 5 },
  { gabarit: "04 Ville", url: "/implantations/bordeaux/", pliables: 5 },
  { gabarit: "05 Spécialité", url: "/expertises/automatisme/siemens/", pliables: 3 },
  { gabarit: "05 Spécialité", url: "/expertises/mecanique/machine-outil/", pliables: 3 },
  { gabarit: "06 Département", url: "/implantations/lyon/rhone/", pliables: 5 },
  { gabarit: "06 Département", url: "/implantations/paris/essonne/", pliables: 5 },
  { gabarit: "07 Métier et carrière", url: "/carriere/electromecanicien/", pliables: 10 },
  { gabarit: "07 Métier et carrière", url: "/carriere/automaticien/salaire/", pliables: 6 },
  { gabarit: "08 Secteur", url: "/secteurs/agroalimentaire/", pliables: 3 },
  { gabarit: "08 Secteur", url: "/secteurs/automobile/", pliables: 3 },
  { gabarit: "09 Domaine", url: "/expertises/automatisme/", pliables: 3 },
  { gabarit: "09 Domaine", url: "/expertises/mecanique/", pliables: 3 },
  { gabarit: "10 Hub de rubrique", url: "/offres/", pliables: 3 },
  { gabarit: "10 Hub de rubrique", url: "/carriere/", pliables: 7 },
  { gabarit: "11 Sous-rubrique ressource", url: "/ressources/fiches-pratiques/", pliables: 0 },
  { gabarit: "11 Sous-rubrique ressource", url: "/ressources/articles/", pliables: 0 },
];

/** Une URL qui ne doit JAMAIS exister : le témoin de la page muette. */
const URL_ABSENTE = "/temoin-responsive-page-absente-ne-pas-creer/";

/** Les cinq règles relevées dans la page, et leur étiquette de sortie. */
const ETIQUETTES = {
  debordements: "débordement",
  ciblesTropPetites: "cible sous 24 px",
  texteCoupe: "texte coupé",
  chevauchements: "chevauchement",
  basculesFocalisables: "bascule focalisable sur bureau",
};

/* ======================================================================
   LA MESURE, exécutée DANS la page.

   Sérialisée vers le navigateur : elle ne ferme sur rien, ne dépend d'aucun
   module, et tous ses seuils arrivent en argument.
   ====================================================================== */
const MESURE = ({ cibleMinimale, mesureChevauchements }) => {
  const LARGEUR = window.innerWidth;
  const TOLERANCE = 1;

  /* Normalisation avant toute comparaison de texte : espaces insécables et
     apostrophes typographiques. La maquette mêle les deux familles. */
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
    /* Le motif « masqué visuellement » : le piège anti-robot du formulaire et
       son étiquette vivent à -9999 px. Rien n'y est perdu, parce que rien n'y
       est montré, et ce n'est pas une cible tactile de 169 par 24. */
    if (boite.left < -1000) return true;
    if (boite.width <= 1 && boite.height <= 1) return true;
    if (style.clip === "rect(0px, 0px, 0px, 0px)") return true;
    if (style.position === "absolute" && style.overflow === "hidden" && boite.width <= 1) return true;
    return false;
  };

  /* `checkVisibility` connaît le saut de rendu de `::details-content`, un test
     maison non. Voir l'en-tête du fichier : 1 793 faux chevauchements. */
  const visible = (element) => {
    if (element.closest("nextjs-portal")) return null;
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
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };

  /** Un ornement ne porte ni texte ni commande : le rogner ne perd rien. */
  const ornement = (element) =>
    propre(element.textContent) === "" &&
    element.querySelector('a[href], button, input, select, textarea, [role="button"]') === null;

  /**
   * LA PART RÉELLEMENT PEINTE d'un élément, à l'horizontale.
   *
   * MAIS LE ROGNAGE DE LA PAGE ELLE-MÊME NE COMPTE PAS, et c'est tout le
   * piège : `.mg-site` est en `overflow-x: clip`. Le prendre pour un rognage
   * légitime rendrait acceptable n'importe quelle sortie d'écran.
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

  /** La boîte de CONTENU : le rectangle moins bordure et marge interne. */
  const boiteDeContenu = (element) => {
    const boite = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const n = (v) => Number.parseFloat(v) || 0;
    return {
      gauche: boite.left + n(style.borderLeftWidth) + n(style.paddingLeft),
      droite: boite.right - n(style.borderRightWidth) - n(style.paddingRight),
    };
  };

  /** Une FEUILLE de texte : un élément qui porte lui-même des mots. */
  const porteDuTexte = (element) =>
    [...element.childNodes].some((n) => n.nodeType === 3 && propre(n.nodeValue).length > 0);

  /**
   * L'ENCRE de l'élément : une boîte par ligne, autour de ses PROPRES mots.
   *
   * Ni son rectangle, ni celui de sa descendance. C'est la seule mesure qui
   * dise si du texte en recouvre un autre, et il a fallu deux corrections
   * pour y arriver :
   *
   *  · `getBoundingClientRect()` d'un élément EN LIGNE qui passe à la ligne
   *    rend l'UNION de ses fragments, un rectangle qui traverse ses voisins.
   *    78 faux chevauchements par page, tous dans la liste de villes du pied
   *    de page ;
   *  · `getClientRects()` règle ce cas mais mesure encore des BOÎTES. Les
   *    liens de ce même pied de page sont des pastilles `inline-block` de
   *    31 px de haut sur une interligne de 24,7 px : leurs marges internes se
   *    chevauchent de 6 px d'une ligne à l'autre, sans qu'un seul mot soit
   *    recouvert. Mesuré le 13/10 : 1 826 relevés, presque tous ceux-là.
   *
   * L'encre, elle, ne mentait pas : 13 px de police, l'avance de ligne est
   * plus grande que la hauteur du texte, les deux lignes ne se touchent pas.
   */
  /**
   * CE QUI REND L'ENCRE JUSTE : elle est ROGNÉE comme à l'écran.
   *
   * Un résumé coupé à deux lignes par `line-clamp` garde l'encre de ses lignes
   * cachées, et celle-ci tombe sur le bloc suivant. Sans ce rognage, le motif
   * de la maquette que la règle 3 vient d'exempter reviendrait par la règle 4,
   * déguisé en chevauchement. `.mg-site` est écarté pour la raison habituelle.
   */
  const zoneVisible = (element) => {
    let g = -Infinity;
    let d = Infinity;
    let h = -Infinity;
    let b = Infinity;
    for (let n = element; n && n !== document.documentElement; n = n.parentElement) {
      if (n === document.body) continue;
      if (n.classList.contains("mg-site")) continue;
      const s = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      if (s.overflowX !== "visible") {
        g = Math.max(g, r.left);
        d = Math.min(d, r.right);
      }
      if (s.overflowY !== "visible") {
        h = Math.max(h, r.top);
        b = Math.min(b, r.bottom);
      }
    }
    return { g, d, h, b };
  };

  const encre = (element) => {
    const zone = zoneVisible(element);
    const boites = [];
    for (const noeud of element.childNodes) {
      if (noeud.nodeType !== 3 || propre(noeud.nodeValue).length === 0) continue;
      const plage = document.createRange();
      plage.selectNode(noeud);
      for (const r of plage.getClientRects()) {
        const gauche = Math.max(r.left, zone.g);
        const droite = Math.min(r.right, zone.d);
        const haut = Math.max(r.top, zone.h);
        const bas = Math.min(r.bottom, zone.b);
        if (droite - gauche > 0 && bas - haut > 0) boites.push({ left: gauche, right: droite, top: haut, bottom: bas });
      }
    }
    return boites;
  };

  const tous = [...document.querySelectorAll("body *")];

  /* ------------------------------------------------------ 1. DÉBORDEMENTS
     L'hôte d'un élément en flux est la boîte de contenu de son parent ;
     l'hôte d'un élément hors du flux est la FENÊTRE, parce que son parent ne
     le contient plus et que seul l'écran le borne. */
  const debordements = [];
  const coupables = [];
  for (const element of tous) {
    const etat = visible(element);
    if (!etat) continue;
    const { boite, style } = etat;
    if (dansUnRail(element)) continue;
    if (ornement(element)) continue;
    /* Un élément déjà signalé emporte ses descendants : sinon un seul défaut
       de grille remonte vingt lignes et le vrai coupable se noie. */
    if (coupables.some((c) => c.contains(element))) continue;

    /*
     * UN ÉLÉMENT ENTIÈREMENT ROGNÉ N'EST PLUS À L'ÉCRAN : il n'y a rien à
     * perdre, et c'est le seul usage de la part peinte ici.
     *
     * CE QU'ELLE NE FAIT SURTOUT PAS : servir de verdict. L'instrument de la
     * famille `carriere` compare la PART PEINTE à l'hôte, et le rognage de
     * l'hôte lui-même entre donc des deux côtés de la soustraction : un bloc
     * de 400 px dans un hôte de 200 qui rogne se mesure à zéro de dépassement.
     * Le témoin de cette porte, exactement ce cas, est resté muet tant que les
     * deux mécanismes étaient empilés. Celui de la famille `accueil`, qui
     * compare l'ÉLÉMENT à son hôte, le voit. Les deux instruments ne mesuraient
     * donc pas la même chose, et l'empilement était aveugle au cas le plus
     * grave : du TEXTE coupé par une carte qui rogne. On compare l'élément.
     *
     * Ce qui remplace l'excuse du rognage : les ORNEMENTS, écartés plus haut.
     * Un halo de 520 px dans une carte de 240 ne porte ni mot ni commande, et
     * c'est pour ces trois halos que la part peinte avait été introduite.
     */
    /*
     * UNE ROTATION N'EST PAS UN DÉBORDEMENT, et la porte s'y est trompée.
     *
     * `getBoundingClientRect()` rend la boîte ENGLOBANTE, transformation
     * comprise. Un carré de 28 px tourné à 45 degrés y mesure 28 fois racine de
     * deux, soit 39,6 px : la porte voyait donc un dépassement de 5,8 px sur le
     * « + » d'une question de foire aux questions OUVERTE, qui pivote en croix.
     *
     * Mesuré : largeur déclarée 28 px, largeur rendue 39,6 px, rapport 1,414.
     * L'élément occupe bien 28 px dans la mise en page et reste dans les 24 px
     * de rembourrage de son hôte. Il n'y avait rien à corriger dans le dessin,
     * et une porte qui réclame une correction là où il n'y a pas de défaut
     * coûte autant qu'une porte aveugle : elle use la confiance.
     *
     * On compare donc la boîte de MISE EN PAGE quand une transformation est
     * posée. Le débordement d'un élément non transformé, lui, ne change pas.
     */
    if (style.transform && style.transform !== "none") {
      const large = element.offsetWidth || 0;
      if (large > 0 && boite.width > large + 0.5) {
        const centre = (boite.left + boite.right) / 2;
        boite.x = centre - large / 2;
        boite.width = large;
      }
    }

    const peinte = partPeinte(element, boite);
    if (peinte.droite - peinte.gauche <= 0) continue;

    const horsFlux = style.position === "absolute" || style.position === "fixed";
    const parent = element.parentElement;
    let hote;
    if (horsFlux || !parent || parent === document.body) {
      hote = { nom: "la fenêtre", gauche: 0, droite: LARGEUR };
    } else {
      const contenu = boiteDeContenu(parent);
      hote =
        contenu.droite - contenu.gauche < 1
          ? { nom: "la fenêtre", gauche: 0, droite: LARGEUR }
          : { nom: nomme(parent), gauche: contenu.gauche, droite: contenu.droite };
    }

    const aDroite = Math.round(boite.right - hote.droite);
    const aGauche = Math.round(hote.gauche - boite.left);
    const depasse = Math.max(aDroite, aGauche);
    if (depasse <= TOLERANCE) continue;

    coupables.push(element);
    debordements.push({
      texte:
        `${nomme(element)} fait ${Math.round(boite.width)} px et sort de ${hote.nom} ` +
        `de ${depasse} px à ${aDroite >= aGauche ? "droite" : "gauche"}`,
      dansMain: !!element.closest("main"),
    });
  }

  /* ---------------------------------------------------- 2. CIBLES TACTILES */
  const ciblesTropPetites = [];
  for (const element of document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], summary',
  )) {
    const etat = visible(element);
    if (!etat) continue;
    const { boite, style } = etat;

    /* L'exemption « Inline » de la norme, lue dans la norme et pas réduite à
       une liste de balises : l'élément est en ligne, et le bloc qui le
       contient porte d'autre texte que le sien. */
    if (style.display === "inline") {
      let bloc = element.parentElement;
      while (bloc && getComputedStyle(bloc).display.startsWith("inline")) bloc = bloc.parentElement;
      if (bloc && propre(bloc.textContent).length > propre(element.textContent).length) continue;
    }

    const parent = element.parentElement;
    const sp = parent ? getComputedStyle(parent) : null;
    const ecartParent =
      sp && /grid|flex/.test(sp.display)
        ? Math.min(Number.parseFloat(sp.rowGap) || 0, Number.parseFloat(sp.columnGap) || 0)
        : 0;
    const marge =
      (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0);
    const hauteurUtile = boite.height + Math.max(marge, ecartParent);
    if (hauteurUtile >= cibleMinimale && boite.width >= cibleMinimale) continue;
    if (boite.height >= cibleMinimale && boite.width >= cibleMinimale) continue;

    ciblesTropPetites.push({
      texte:
        `${nomme(element)} mesure ${Math.round(boite.width)} par ${Math.round(boite.height)} px, ` +
        `sous le plancher de ${cibleMinimale} px du critère 2.5.8`,
      dansMain: !!element.closest("main"),
    });
  }

  /* ------------------------------------------------- 3. TEXTE COUPÉ, 4 CAS */
  const texteCoupe = [];
  /**
   * LA COUPE DÉCLARÉE, comptée à part et jamais bloquante.
   *
   * `-webkit-line-clamp` n'est pas un accident sur ce site, c'est un motif de
   * la maquette mobile, et il est déclaré DANS le code qui le pose :
   * `components/site/ressource/Ressource.module.css` (« LE RÉSUMÉ D'UNE PARTIE
   * REPLIÉE TIENT SUR DEUX LIGNES, comme la maquette mobile l'écrit »,
   * `MigenMobile.dc.html`, bloc « Blocs communs (pliables) »),
   * `components/site/preuve/PagePreuve.module.css` et
   * `components/site/offre/PrestationsRegroupees.tsx` (« tronqué à une ligne,
   * comme la capture »). Les portes des familles `offre` et `editorial` le
   * comptent déjà comme un choix de dessin.
   *
   * ET IL Y A UNE RAISON DE FOND : un `line-clamp` PRÉVIENT le lecteur que la
   * suite existe, et elle est juste là, sous la bascule. Le bloquer ici
   * reviendrait à corriger du conforme, ce qui a déjà été fait plusieurs fois
   * sur ce projet. Il est donc relevé, chiffré, montré, et non compté.
   */
  const coupesDeclarees = [];
  const plage = document.createRange();
  for (const element of tous) {
    if (!porteDuTexte(element)) continue;
    const etat = visible(element);
    if (!etat) continue;
    const { boite, style } = etat;
    /* Une liste déroulante NATIVE n'est pas une mise en page : ses `option`
       sont dessinées par le système, hors de la page, et leur rectangle dans
       le document n'a aucun sens. Mesurées, les six indicatifs téléphoniques
       se déclaraient « coupés de 1 286 px » sur chaque page du formulaire. */
    if (element.tagName === "OPTION" || element.closest("select")) continue;

    const rogneX = style.overflowX === "hidden" || style.overflowX === "clip";
    const rogneY = style.overflowY === "hidden" || style.overflowY === "clip";
    const tropLarge = element.scrollWidth - element.clientWidth > TOLERANCE;
    const tropHaut = element.scrollHeight - element.clientHeight > TOLERANCE;
    const lignesPlafonnees = style.webkitLineClamp && style.webkitLineClamp !== "none";

    if (lignesPlafonnees && tropHaut) {
      coupesDeclarees.push({
        texte:
          `${nomme(element)} est plafonné à ${style.webkitLineClamp} ligne(s), ` +
          `${Math.round(element.scrollHeight - element.clientHeight)} px de texte sous le pli`,
        dansMain: !!element.closest("main"),
      });
      continue;
    }

    let cause = null;
    let manque = 0;
    if (rogneX && tropLarge) {
      cause = "rogné à l'horizontale";
      manque = element.scrollWidth - element.clientWidth;
    } else if (style.textOverflow === "ellipsis" && tropLarge) {
      cause = "tronqué à l'ellipse";
      manque = element.scrollWidth - element.clientWidth;
    } else if (rogneY && tropHaut) {
      cause = "rogné à la verticale";
      manque = element.scrollHeight - element.clientHeight;
    }

    /* LE QUATRIÈME CAS : le texte sort de sa propre boîte de contenu.
       L'élément, lui, tient dans la page : c'est son libellé qui dépasse.
       Aucune règle qui mesure des ÉLÉMENTS ne peut le voir, et c'est elle
       qui trouve les vrais défauts : un libellé de bouton en
       `white-space: nowrap` qui sort de 7 à 97 px, et des libellés de
       `FicheMetier` de 100 px de texte dans une colonne de 64 px, posée par
       une grille à deux colonnes de 114 px dans un conteneur de 240.

       ELLE NE VAUT QUE SUR UNE FEUILLE, sans enfant élément. Sur un élément
       qui en a, la plage couvre aussi leurs rectangles, et un enfant trop
       large se ferait signaler DEUX FOIS : par la règle 1 comme débordement,
       par celle-ci comme libellé. Mesuré sur le `+` de la FAQ, 6 px, compté
       en double. Un défaut, une ligne. */
    if (!cause && element.children.length === 0) {
      plage.selectNodeContents(element);
      const rt = plage.getBoundingClientRect();
      if (rt.width > 0) {
        const n = (v) => Number.parseFloat(v) || 0;
        const gauche = boite.left + n(style.borderLeftWidth) + n(style.paddingLeft);
        const droite = boite.right - n(style.borderRightWidth) - n(style.paddingRight);
        const sort = Math.max(rt.right - droite, gauche - rt.left);
        if (sort > 2) {
          cause = `sorti de sa propre boîte (white-space: ${style.whiteSpace})`;
          manque = sort;
        }
      }
    }
    if (!cause) continue;

    texteCoupe.push({
      texte: `${nomme(element)} est ${cause}, il manque ${Math.round(manque)} px`,
      dansMain: !!element.closest("main"),
    });
  }

  /* ------------------------------------------------------ 4. CHEVAUCHEMENTS
     LE RELEVÉ EST QUADRATIQUE : chaque feuille de texte contre chaque autre.
     Sous 880 px les blocs repliés écartent l'essentiel du document et il reste
     quelques dizaines de feuilles ; à 1280 px tout est déplié et la même
     boucle compte des millions de paires pour une règle, la 4, qui ne se juge
     pas à cette largeur. L'appelant dit donc s'il en a besoin. */
  const feuilles = [];
  for (const element of mesureChevauchements ? tous : []) {
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
    const lignes = encre(element);
    if (lignes.length === 0) continue;
    feuilles.push({ element, lignes });
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
        texte:
          `${nomme(a.element)} recouvre ${nomme(b.element)} ` +
          `sur ${Math.round(pire.x)} par ${Math.round(pire.y)} px`,
        dansMain: !!a.element.closest("main") && !!b.element.closest("main"),
      });
    }
  }

  /* ------------------------------------- 5. BASCULES FOCALISABLES, RÈGLE 5
     Focalisable AU CLAVIER, c'est-à-dire DANS L'ORDRE DE TABULATION : le
     `tabIndex` doit valoir 0 ou plus ET le focus doit se prendre. Un
     `tabindex="-1"` reste focalisable par script, mais la touche de
     tabulation l'ignore, et c'est l'arrêt muet qu'on cherche. */
  const basculesFocalisables = [];
  const focusAvant = document.activeElement;
  for (const bloc of document.querySelectorAll("details[data-pliable-mobile]")) {
    const bascule = bloc.querySelector(":scope > summary");
    if (!bascule) continue;
    if (bascule.tabIndex < 0) continue;
    if (!visible(bascule)) continue;
    bascule.focus({ preventScroll: true });
    const pris = document.activeElement === bascule;
    if (!pris) continue;
    basculesFocalisables.push({
      texte:
        `la bascule de « ${propre(bascule.textContent).slice(0, 52)} » reste dans l'ordre ` +
        `de tabulation (tabIndex ${bascule.tabIndex}) alors qu'elle n'ouvre plus rien à ` +
        `cette largeur : un arrêt de tabulation muet`,
      dansMain: !!bascule.closest("main"),
    });
  }
  if (focusAvant instanceof HTMLElement) focusAvant.focus({ preventScroll: true });
  else document.activeElement?.blur?.();

  /* ------------------------------------------- L'ÉTAT, pour les refus et la 6 */
  const principal = document.querySelector("main");
  const pliables = document.querySelectorAll("details[data-pliable-mobile]");
  const bandeau = [...document.querySelectorAll("button")].some(
    (b) => propre(b.textContent) === "Tout refuser" && visible(b) !== null,
  );

  return {
    largeur: LARGEUR,
    hauteur: document.documentElement.scrollHeight,
    longueurDuMain: propre(principal?.textContent).length,
    bandeauPresent: bandeau,
    pliables: pliables.length,
    pliablesOuverts: [...pliables].filter((d) => d.open).length,
    debordements,
    ciblesTropPetites,
    texteCoupe,
    chevauchements,
    basculesFocalisables,
    coupesDeclarees,
  };
};

/* ======================================================================
   LE PILOTAGE DU NAVIGATEUR
   ====================================================================== */

/**
 * « Tout refuser », l'option la plus protectrice, ET ON VÉRIFIE QU'IL PART.
 *
 * Le bandeau est un composant CLIENT : un clic envoyé avant son hydratation ne
 * déclenche rien du tout. Un seul clic suivi de 250 ms a marché sur deux pages
 * puis a échoué sur 56 mesures d'affilée dès que la machine a été chargée.
 */
async function refuseLeBandeau(page) {
  await page.addStyleTag({ content: "nextjs-portal{display:none !important}" }).catch(() => {});
  for (let essai = 0; essai < 40; essai += 1) {
    const restait = await page
      .evaluate(() => {
        const bouton = [...document.querySelectorAll("button")].find(
          (b) =>
            (b.innerText || "").replace(/\s+/g, " ").trim() === "Tout refuser" &&
            b.checkVisibility({
              contentVisibilityAuto: true,
              opacityProperty: true,
              visibilityProperty: true,
            }),
        );
        if (!bouton) return false;
        bouton.click();
        return true;
      })
      .catch(() => false);
    await page.waitForTimeout(250);
    if (!restait) return;
  }
}

/**
 * ATTENDRE L'HYDRATATION, ET LE PROUVER.
 *
 * Les blocs sont servis `open` et refermés par un effet client sous 880 px. On
 * attend que le compte de blocs ouverts se STABILISE, puis on rend l'état :
 * c'est l'appelant qui juge, parce que lui seul connaît la largeur.
 */
async function attendLeRepli(page) {
  return page.evaluate(async () => {
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
}

/**
 * Défile toute la page, puis attend le décodage des images.
 *
 * LA HAUTEUR EST LUE UNE SEULE FOIS et le nombre de pas est plafonné : les
 * révélations au défilement font grandir la page pendant qu'on la parcourt, et
 * la boucle qui relisait `scrollHeight` à chaque tour ne s'arrêtait jamais sur
 * la page la plus longue du site. Trente minutes de mesure perdues.
 */
async function laisseSePoser(page) {
  await page.evaluate(async () => {
    const dort = (ms) => new Promise((r) => setTimeout(r, ms));
    const PAS = 700;
    const PLAFOND = 120;
    const pas = Math.min(Math.ceil(document.body.scrollHeight / PAS), PLAFOND);
    for (let i = 0; i <= pas; i += 1) {
      window.scrollTo(0, i * PAS);
      await dort(25);
    }
    window.scrollTo(0, 0);
    await dort(250);
  });
  /* Une image encore en vol se mesure à zéro et se déclarerait cassée : on
     attend son `decode()`, jamais son seul `complete`. Avec un délai de garde,
     parce qu'une image qui ne décodera jamais ne doit pas tenir la mesure. */
  await page
    .evaluate(() => {
      const garde = new Promise((r) => setTimeout(r, 4000));
      const toutes = Promise.all([...document.images].map((i) => i.decode().catch(() => undefined)));
      return Promise.race([toutes, garde]).then(() => undefined);
    })
    .catch(() => {});
}

/** Ouvre une page prête à mesurer, ou dit pourquoi elle ne l'est pas. */
async function ouvre(contexte, chemin, largeur, hauteur) {
  const page = await contexte.newPage();
  await page.setViewportSize({ width: largeur, height: hauteur });
  let reponse;
  try {
    reponse = await page.goto(`${SITE}${chemin}`, { waitUntil: "load", timeout: 180_000 });
  } catch (erreur) {
    await page.close();
    return { muette: `elle n'a pas chargé (${erreur.message.split("\n")[0]})` };
  }
  if (!reponse || reponse.status() !== 200) {
    const code = reponse ? reponse.status() : "aucune réponse";
    await page.close();
    return { muette: `elle répond ${code}` };
  }
  const cache = reponse.headers()["x-vercel-cache"] ?? null;
  /* LE REPLI D'ABORD, LE BANDEAU ENSUITE. Le bandeau est un composant client :
     tant que React n'a pas hydraté, son bouton est du HTML inerte. Le repli
     des blocs est, lui, la PREUVE que le client a tourné. */
  const repli = await attendLeRepli(page);
  await refuseLeBandeau(page);
  await laisseSePoser(page);
  return { page, repli, cache };
}

/** Exécute un travail par page, FRONT pages à la fois. */
async function parLots(liste, travail) {
  const resultats = [];
  for (let i = 0; i < liste.length; i += FRONT) {
    resultats.push(...(await Promise.all(liste.slice(i, i + FRONT).map(travail))));
  }
  return resultats;
}

/* ======================================================================
   LA COPIE EN MÉMOIRE, support de tous les témoins.

   Le HTML rendu de la page réelle, SCRIPTS RETIRÉS, replacé dans un `<iframe>`
   de même origine. Les feuilles de style et les polices se résolvent (chemins
   absolus, même origine), l'état d'après hydratation est conservé (les blocs
   repliés le restent, parce que `open` a quitté le DOM), et aucun script ne
   rejoue par-dessus. Rien n'est écrit sur le site : la faute vit dans une
   copie, et la mesure porte pourtant sur du vrai rendu.
   ====================================================================== */
const NOM_CADRE = "copie-en-memoire";

async function copieEnMemoire(page, largeur, hauteur) {
  await page.evaluate(
    async ({ nom, largeur, hauteur }) => {
      document.getElementsByName(nom)[0]?.remove();
      const html = document.documentElement.outerHTML.replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        "",
      );
      const cadre = document.createElement("iframe");
      cadre.name = nom;
      cadre.style.cssText =
        `position:fixed;left:0;top:0;width:${largeur}px;height:${hauteur}px;` +
        "border:0;z-index:2147483647;background:#fff";
      cadre.srcdoc = `<!doctype html>${html}`;
      document.body.append(cadre);
      await new Promise((r) => cadre.addEventListener("load", r, { once: true }));
    },
    { nom: NOM_CADRE, largeur, hauteur },
  );
  await page.waitForTimeout(600);
  const cadre = page.frame({ name: NOM_CADRE });
  if (!cadre) return null;
  await cadre.evaluate(() => document.fonts.ready);
  return cadre;
}

/** Une page conforme construite à la main, posée dans un cadre à mesurer. */
async function pageConforme(page, largeur, hauteur) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Page conforme, controle negatif</title><style>
*{box-sizing:border-box}
body{margin:0;padding:16px;font:16px/1.6 system-ui,sans-serif;color:#111;background:#fff}
h1{font-size:24px;line-height:1.2;margin:0 0 16px}
p{margin:0 0 16px}
ul{display:grid;gap:12px;margin:0 0 16px;padding:0;list-style:none}
a.lien{display:block;min-height:24px;padding:8px 0;color:#0b4}
button{display:block;width:100%;min-height:44px;white-space:normal;padding:10px;font:inherit}
details{border-top:1px solid #ddd;padding-top:12px;margin:0 0 16px}
summary{display:flex;justify-content:space-between;gap:12px;min-height:24px;list-style:none}
summary::-webkit-details-marker{display:none}
</style></head><body><main>
<h1>Une page qui respecte les six regles</h1>
<p>Ce texte tient dans sa boite aux quatre largeurs mesurees, il ne sort de rien
et il ne recouvre personne.</p>
<ul>
<li><a class="lien" href="/">Un lien assez grand pour le doigt</a></li>
<li><a class="lien" href="/">Un second lien, espace du premier</a></li>
</ul>
<button type="button">Un bouton dont le libelle passe a la ligne au lieu de
sortir de sa boite</button>
<details data-pliable-mobile=""><summary tabindex="-1"><span>Premier bloc
repliable</span><span aria-hidden="true">&rsaquo;</span></summary><div><p>Le corps
du premier bloc, entier dans le document et replie par la feuille de
style.</p></div></details>
<details data-pliable-mobile=""><summary tabindex="-1"><span>Second bloc
repliable</span><span aria-hidden="true">&rsaquo;</span></summary><div><p>Le corps
du second bloc, lui aussi entier dans le document.</p></div></details>
</main></body></html>`;
  await page.evaluate(
    async ({ nom, largeur, hauteur, html }) => {
      document.getElementsByName(nom)[0]?.remove();
      const cadre = document.createElement("iframe");
      cadre.name = nom;
      cadre.style.cssText =
        `position:fixed;left:0;top:0;width:${largeur}px;height:${hauteur}px;` +
        "border:0;z-index:2147483647;background:#fff";
      cadre.srcdoc = html;
      document.body.append(cadre);
      await new Promise((r) => cadre.addEventListener("load", r, { once: true }));
    },
    { nom: NOM_CADRE, largeur, hauteur, html },
  );
  await page.waitForTimeout(400);
  return page.frame({ name: NOM_CADRE });
}

/* ======================================================================
   LES TÉMOINS : une faute par règle, injectée dans la copie.
   ====================================================================== */
const TEMOINS = [
  {
    nom: "un bloc de 400 px dans un hôte de 200",
    regle: "debordements",
    ou: "mobile",
    injecte: () => {
      const hote = document.createElement("div");
      hote.style.cssText = "overflow-x:clip;width:200px;margin:0 auto";
      const faute = document.createElement("div");
      faute.style.cssText = "width:400px;height:40px;background:#000;color:#fff";
      faute.textContent = "temoin de debordement";
      hote.append(faute);
      document.body.append(hote);
    },
  },
  {
    nom: "un lien de 20 px collé à ses voisins",
    regle: "ciblesTropPetites",
    ou: "mobile",
    injecte: () => {
      const liste = document.createElement("div");
      liste.style.cssText = "display:grid;gap:0;width:200px";
      for (const mot of ["un", "deux"]) {
        const lien = document.createElement("a");
        lien.href = "/";
        lien.textContent = mot;
        lien.style.cssText = "display:block;width:20px;height:20px;margin:0;font:10px/20px sans-serif";
        liste.append(lien);
      }
      document.body.append(liste);
    },
  },
  {
    nom: "une phrase rognée par sa boîte de 40 px",
    regle: "texteCoupe",
    ou: "mobile",
    injecte: () => {
      const boite = document.createElement("div");
      boite.style.cssText = "width:40px;overflow:hidden;white-space:nowrap;font:14px sans-serif";
      boite.textContent = "une phrase bien trop longue pour quarante pixels";
      document.body.append(boite);
    },
  },
  {
    nom: "deux paragraphes qui se recouvrent",
    regle: "chevauchements",
    ou: "mobile",
    injecte: () => {
      const zone = document.createElement("div");
      const premier = document.createElement("p");
      premier.textContent = "premiere phrase temoin, en flux";
      premier.style.cssText = "margin:0;font:14px/20px sans-serif";
      const second = document.createElement("p");
      second.textContent = "seconde phrase temoin, remontee sur la premiere";
      second.style.cssText = "margin:-14px 0 0;font:14px/20px sans-serif";
      zone.append(premier, second);
      document.body.append(zone);
    },
  },
  {
    nom: "une bascule laissée dans l'ordre de tabulation",
    regle: "basculesFocalisables",
    /* CE TÉMOIN NE VAUT QU'AU-DESSUS DE 880 PX : sous ce seuil la bascule EST
       une commande, et l'exiger hors de l'ordre de tabulation serait une
       faute d'accessibilité, pas une correction. */
    ou: "bureau",
    injecte: () => {
      const bloc = document.createElement("details");
      bloc.setAttribute("data-pliable-mobile", "");
      const bascule = document.createElement("summary");
      bascule.tabIndex = 0;
      bascule.textContent = "temoin de bascule focalisable";
      bascule.style.cssText = "display:block;min-height:24px;font:16px sans-serif";
      const corps = document.createElement("div");
      corps.textContent = "le corps du bloc temoin";
      bloc.append(bascule, corps);
      document.body.append(bloc);
    },
    /* LE JUMEAU CONFORME de la même faute : la porte doit se taire dessus. */
    jumeau: () => {
      const bloc = document.createElement("details");
      bloc.setAttribute("data-pliable-mobile", "");
      const bascule = document.createElement("summary");
      bascule.tabIndex = -1;
      bascule.textContent = "jumeau conforme, hors tabulation";
      bascule.style.cssText = "display:block;min-height:24px;font:16px sans-serif";
      const corps = document.createElement("div");
      corps.textContent = "le corps du bloc jumeau";
      bloc.append(bascule, corps);
      document.body.append(bloc);
    },
  },
  {
    nom: "un bloc repliable retiré de la page",
    /* Cette règle ne sort pas de la liste des problèmes : elle se juge sur le
       COMPTEUR, exactement comme en mode normal. */
    regle: "pliables",
    ou: "mobile",
    injecte: () => {
      document.querySelector("details[data-pliable-mobile]")?.remove();
    },
  },
];

/**
 * SIX MOTIFS LÉGITIMES qui ressemblent à des fautes, tirés du site réel.
 *
 * Si l'un d'eux est signalé, la porte est trop large, et son silence sur le
 * reste ne vaut plus rien.
 */
const MOTIFS_LEGITIMES = () => {
  // 1. Un halo décoratif, sans texte, rogné exprès par sa carte.
  const carte = document.createElement("div");
  carte.style.cssText = "position:relative;overflow:hidden;width:200px;height:80px";
  const halo = document.createElement("div");
  halo.style.cssText =
    "position:absolute;width:420px;height:420px;right:-160px;top:-160px;pointer-events:none;" +
    "background:radial-gradient(circle,rgba(255,124,60,.32),transparent 68%)";
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

  // 3. Un lien de 20 px, mais séparé de 26 px : exemption par l'espacement.
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

  // 4. Le champ piège anti-robot du formulaire, posé hors de l'écran.
  const piege = document.createElement("div");
  piege.style.cssText = "position:absolute;left:-9999px;height:0;width:0;overflow:hidden";
  const champ = document.createElement("input");
  champ.type = "text";
  champ.name = "site_web_temoin";
  champ.tabIndex = -1;
  piege.append(champ);
  document.body.append(piege);

  // 5. Du texte dans un bloc FERMÉ : présent dans le document, pas à l'écran.
  const ferme = document.createElement("details");
  const resume = document.createElement("summary");
  resume.textContent = "un titre de bloc ferme";
  resume.style.cssText = "display:block;min-height:24px;font:16px sans-serif";
  const dedans = document.createElement("div");
  dedans.style.cssText = "width:40px;overflow:hidden;white-space:nowrap;font:14px sans-serif";
  dedans.textContent = "du texte que personne ne voit tant que le bloc est ferme";
  ferme.append(resume, dedans);
  document.body.append(ferme);

  // 6. Un lien EN LIGNE au milieu d'une phrase : exemption « Inline ».
  const phrase = document.createElement("p");
  phrase.style.cssText = "font:14px/20px sans-serif";
  phrase.append(document.createTextNode("une phrase ordinaire qui porte "));
  const enLigne = document.createElement("a");
  enLigne.href = "/";
  enLigne.textContent = "un lien";
  enLigne.style.cssText = "display:inline";
  phrase.append(enLigne, document.createTextNode(" au milieu de son texte, et rien de plus."));
  document.body.append(phrase);

  /* 7. Un résumé coupé à deux lignes par `line-clamp`, le motif que la
        maquette mobile écrit. Il est RELEVÉ à part, jamais compté comme du
        texte perdu : sans ce contrôle, la reclassification se déferait sans
        que personne le voie. */
  const coupe = document.createElement("p");
  coupe.style.cssText =
    "display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" +
    "width:200px;font:13px/1.6 sans-serif";
  coupe.textContent =
    "un resume de partie repliee qui joint tous les intertitres et demanderait " +
    "sept a dix lignes, coupe a deux comme la maquette mobile le dessine, avec " +
    "la suite juste sous la bascule";
  document.body.append(coupe);

  /* 8. LE MAILLAGE DU PIED DE PAGE, recopié de
        `components/site/PiedDePage.module.css` : des liens `inline-block`
        dont le remplissage vertical porte la cible à 24 px et dont une marge
        négative de même valeur empêche la colonne de grandir. Leur boîte
        PEINTE fait donc 31 px pour une avance de ligne de 24,7, et deux
        lignes voisines se recouvrent de 6 px sans qu'un seul mot soit
        recouvert. À lui seul, ce motif valait 1 826 faux chevauchements le
        13/10, sur les 248 pages du site. */
  const maillage = document.createElement("div");
  maillage.style.cssText = "width:150px;font:13px/1.9 sans-serif";
  for (const ville of ["Paris", "Lyon", "Nantes", "Strasbourg", "Toulouse", "Bordeaux"]) {
    const lien = document.createElement("a");
    lien.href = "/";
    lien.textContent = ville;
    lien.style.cssText =
      "display:inline-block;padding-block:6px;margin-block:-6px;margin-right:10px";
    maillage.append(lien);
  }
  document.body.append(maillage);
};

/* ======================================================================
   MODE TÉMOIN
   ====================================================================== */
async function modeTemoin(navigateur) {
  const echecs = [];
  const reussites = [];
  /* La page d'appui du témoin : la plus riche de l'échantillon, celle qui
     porte le plus de blocs repliables. */
  const APPUI = ECHANTILLON.reduce((a, b) => (b.pliables > a.pliables ? b : a));

  const contextes = {
    mobile: {
      largeur: 390,
      hauteur: HAUTEUR_ECRAN,
      contexte: await navigateur.newContext({
        viewport: { width: 390, height: HAUTEUR_ECRAN },
        hasTouch: true,
        isMobile: true,
      }),
    },
    bureau: {
      largeur: LARGEUR_BUREAU,
      hauteur: HAUTEUR_BUREAU,
      contexte: await navigateur.newContext({
        viewport: { width: LARGEUR_BUREAU, height: HAUTEUR_BUREAU },
      }),
    },
  };

  /** Mesure la copie, injecte, remesure, rend les problèmes NOUVEAUX. */
  const surUneCopie = async (ou, action) => {
    const { contexte, largeur, hauteur } = contextes[ou];
    const ouverture = await ouvre(contexte, APPUI.url, largeur, hauteur);
    if (ouverture.muette) return { muette: `${APPUI.url} ${ouverture.muette}` };
    const cadre = await copieEnMemoire(ouverture.page, largeur, hauteur);
    if (!cadre) {
      await ouverture.page.close();
      return { muette: "la copie en mémoire ne s'est pas montée" };
    }
    const reglages = { cibleMinimale: CIBLE_MINIMALE, mesureChevauchements: ou === "mobile" };
    const avant = await cadre.evaluate(MESURE, reglages);
    await cadre.evaluate(action);
    await ouverture.page.waitForTimeout(200);
    const apres = await cadre.evaluate(MESURE, reglages);
    await ouverture.page.close();
    const nouveaux = [];
    for (const cle of Object.keys(ETIQUETTES)) {
      const connus = new Set(avant[cle].map((p) => p.texte));
      for (const p of apres[cle]) if (!connus.has(p.texte)) nouveaux.push({ cle, texte: p.texte });
    }
    return { avant, apres, nouveaux };
  };

  for (const temoin of TEMOINS) {
    const resultat = await surUneCopie(temoin.ou, temoin.injecte);
    if (resultat.muette) {
      echecs.push(`témoin « ${temoin.nom} » : ${resultat.muette}`);
      continue;
    }

    if (temoin.regle === "pliables") {
      /* La règle 6 se juge sur le compteur, pas sur la liste des problèmes. */
      const tombe = resultat.apres.pliables < resultat.avant.pliables;
      if (tombe) reussites.push([temoin.nom, "le compte de blocs repliables"]);
      else
        echecs.push(
          `témoin « ${temoin.nom} » : le compte de blocs repliables n'a PAS bougé ` +
            `(${resultat.avant.pliables} puis ${resultat.apres.pliables}), la porte ne sait ` +
            `donc pas voir un repli défait`,
        );
      if (resultat.nouveaux.length > 0) {
        echecs.push(
          `témoin « ${temoin.nom} » visait le compte de blocs mais fait aussi tomber ` +
            `${[...new Set(resultat.nouveaux.map((n) => ETIQUETTES[n.cle]))].join(", ")} : ` +
            `il ne prouve rien de précis`,
        );
      }
      continue;
    }

    const visees = resultat.nouveaux.filter((n) => n.cle === temoin.regle);
    const voisines = [...new Set(resultat.nouveaux.filter((n) => n.cle !== temoin.regle).map((n) => ETIQUETTES[n.cle]))];
    if (visees.length === 0) {
      echecs.push(
        `témoin « ${temoin.nom} » : la règle « ${ETIQUETTES[temoin.regle]} » n'est PAS ` +
          `tombée, la porte ne sait donc pas la faire échouer`,
      );
    } else if (voisines.length > 0) {
      /* UN TÉMOIN QUI FAIT TOMBER LA RÈGLE VOISINE NE PROUVE RIEN. */
      echecs.push(
        `témoin « ${temoin.nom} » visait « ${ETIQUETTES[temoin.regle]} » mais fait aussi ` +
          `tomber ${voisines.join(", ")} : il ne prouve rien de précis`,
      );
    } else {
      reussites.push([temoin.nom, ETIQUETTES[temoin.regle]]);
    }

    /* Le jumeau conforme, quand le témoin en porte un : la même construction,
       corrigée, sur laquelle la porte doit se taire. */
    if (temoin.jumeau) {
      const jumeau = await surUneCopie(temoin.ou, temoin.jumeau);
      if (jumeau.muette) {
        echecs.push(`jumeau de « ${temoin.nom} » : ${jumeau.muette}`);
      } else if (jumeau.nouveaux.length > 0) {
        echecs.push(
          `le JUMEAU CONFORME de « ${temoin.nom} » est signalé à tort : ` +
            jumeau.nouveaux.map((n) => `[${ETIQUETTES[n.cle]}] ${n.texte}`).join(" / "),
        );
      } else {
        reussites.push([`jumeau conforme de « ${temoin.nom} »`, "aucune règle ne tombe"]);
      }
    }
  }

  /* -------- Le témoin de la page muette : elle doit ARRÊTER la porte. */
  const muet = await ouvre(contextes.mobile.contexte, URL_ABSENTE, 390, HAUTEUR_ECRAN);
  if (muet.muette) {
    reussites.push(["une page qui ne répond pas", `le refus de conclure (${muet.muette})`]);
  } else {
    await muet.page.close();
    echecs.push(
      `témoin « une page qui ne répond pas » : ${URL_ABSENTE} a répondu 200, ` +
        `le témoin est à refaire car quelqu'un a créé la page`,
    );
  }

  /* -------- Contrôle négatif 1 : six motifs légitimes. */
  const legitimes = await surUneCopie("mobile", MOTIFS_LEGITIMES);
  if (legitimes.muette) {
    echecs.push(`contrôle négatif des motifs légitimes : ${legitimes.muette}`);
  } else if (legitimes.nouveaux.length > 0) {
    echecs.push(
      `contrôle négatif : ${legitimes.nouveaux.length} motif(s) LÉGITIME(s) signalé(s) à ` +
        `tort, la porte est trop large\n      ` +
        legitimes.nouveaux.map((n) => `[${ETIQUETTES[n.cle]}] ${n.texte}`).join("\n      "),
    );
  } else {
    reussites.push(["huit motifs légitimes", "aucun n'est signalé"]);
  }

  /* -------- Contrôle négatif 2 : une page conforme, qui doit être ACCEPTÉE. */
  for (const ou of ["mobile", "bureau"]) {
    const { contexte, largeur, hauteur } = contextes[ou];
    const ouverture = await ouvre(contexte, APPUI.url, largeur, hauteur);
    if (ouverture.muette) {
      echecs.push(`page conforme (${ou}) : la page d'appui ${ouverture.muette}`);
      continue;
    }
    const cadre = await pageConforme(ouverture.page, largeur, hauteur);
    if (!cadre) {
      echecs.push(`page conforme (${ou}) : le cadre ne s'est pas monté`);
      await ouverture.page.close();
      continue;
    }
    const mesure = await cadre.evaluate(MESURE, {
      cibleMinimale: CIBLE_MINIMALE,
      mesureChevauchements: ou === "mobile",
    });
    await ouverture.page.close();
    /* Sous 880 px on juge les règles 1 à 4 et 6, au-dessus la règle 5. */
    const aJuger =
      ou === "mobile"
        ? ["debordements", "ciblesTropPetites", "texteCoupe", "chevauchements"]
        : ["basculesFocalisables"];
    const releves = aJuger.flatMap((cle) =>
      mesure[cle].map((p) => `[${ETIQUETTES[cle]}] ${p.texte}`),
    );
    if (mesure.pliables !== 2) {
      releves.push(`[compte de blocs repliables] ${mesure.pliables} au lieu des 2 déclarés`);
    }
    if (releves.length > 0) {
      echecs.push(
        `LA PAGE CONFORME EST REFUSÉE à ${largeur} px, la porte est trop large\n      ` +
          releves.join("\n      "),
      );
    } else {
      reussites.push([
        `une page conforme à ${largeur} px`,
        ou === "mobile" ? "acceptée sur les règles 1 à 4 et 6" : "acceptée sur la règle 5",
      ]);
    }
  }

  for (const { contexte } of Object.values(contextes)) await contexte.close();

  for (const [quoi, verdict] of reussites) {
    console.log(`  OK    ${quoi.padEnd(54)} ${verdict}`);
  }
  if (echecs.length > 0) {
    console.error(`\nLE TÉMOIN ÉCHOUE, ${echecs.length} point(s) :\n`);
    for (const e of echecs) console.error(`  · ${e}`);
    console.error(
      "\nUne porte qui ne prouve pas son échec ne prouve pas son succès : " +
        "ne croyez pas son vert tant que ceci est rouge.",
    );
    return 1;
  }
  console.log(
    `\nTÉMOIN COMPLET, ${reussites.length} point(s) : chaque règle tombe sur SA faute, ` +
      `aucune ne tombe sur celle de sa voisine, les huit motifs légitimes passent, et une ` +
      `page conforme est acceptée. La porte sait échouer.`,
  );
  return 0;
}

/* ======================================================================
   MODE NORMAL
   ====================================================================== */
async function modeNormal(navigateur) {
  /* Ce qui empêche de conclure, et ce qui est un défaut : deux listes, parce
     que « je n'ai pas pu mesurer » n'est pas « c'est faux ». */
  const refus = [];
  const releves = [];
  const servisDuCache = [];

  for (const largeur of [...LARGEURS, LARGEUR_BUREAU]) {
    const bureau = largeur >= SEUIL_MOBILE;
    const hauteur = bureau ? HAUTEUR_BUREAU : HAUTEUR_ECRAN;
    const contexte = await navigateur.newContext({
      viewport: { width: largeur, height: hauteur },
      hasTouch: !bureau,
      isMobile: !bureau,
    });

    await parLots(ECHANTILLON, async (entree) => {
      const ouverture = await ouvre(contexte, entree.url, largeur, hauteur);
      if (ouverture.muette) {
        refus.push(`${entree.url} à ${largeur} px : ${ouverture.muette}`);
        return;
      }
      if (ouverture.cache === "HIT") servisDuCache.push(`${entree.url} à ${largeur} px`);

      const mesure = await ouverture.page.evaluate(MESURE, {
        cibleMinimale: CIBLE_MINIMALE,
        mesureChevauchements: !bureau,
      });
      await ouverture.page.close();

      /* ------------------- CE QUI EMPÊCHE DE CONCLURE SUR CETTE MESURE */
      if (mesure.longueurDuMain < 200) {
        refus.push(
          `${entree.url} à ${largeur} px : son <main> ne porte que ` +
            `${mesure.longueurDuMain} caractère(s), la page n'a rien rendu`,
        );
        return;
      }
      if (mesure.bandeauPresent) {
        refus.push(
          `${entree.url} à ${largeur} px : le bandeau de consentement est encore là après ` +
            `le refus, il masque le bas de la page et fausse tout le relevé`,
        );
        return;
      }
      if (!bureau && mesure.pliables > 0 && mesure.pliablesOuverts > 0) {
        refus.push(
          `${entree.url} à ${largeur} px : ${mesure.pliablesOuverts} bloc(s) repliable(s) sur ` +
            `${mesure.pliables} sont encore OUVERTS sous ${SEUIL_MOBILE} px. Les blocs ` +
            `arrivent ouverts du serveur : l'hydratation n'a pas fini, la page mesurée ` +
            `n'existe pour personne`,
        );
        return;
      }

      releves.push({ ...entree, largeur, bureau, mesure });
    });

    await contexte.close();
  }

  /* LE VERDICT DE COUVERTURE PASSE AVANT TOUT AUTRE. */
  const ATTENDU = ECHANTILLON.length * (LARGEURS.length + 1);
  if (refus.length > 0 || releves.length < ATTENDU) {
    console.error(
      `MESURE NON CONCLUANTE : ${releves.length} relevé(s) sur ${ATTENDU} ` +
        `(${ECHANTILLON.length} pages, ${LARGEURS.length + 1} largeurs).\n`,
    );
    for (const r of refus.slice(0, 20)) console.error(`  · ${r}`);
    if (refus.length > 20) console.error(`  · et ${refus.length - 20} autre(s)`);
    console.error(
      `\nLa porte ne dit PAS que le site est faux, elle dit qu'elle n'a pas pu le ` +
        `mesurer. Conclure sur un échantillon muet est la faute qu'une porte existe pour ` +
        `empêcher. Le serveur doit répondre sur les ${ECHANTILLON.length} adresses, aux ` +
        `${LARGEURS.length + 1} largeurs, pour que le relevé vaille quelque chose.`,
    );
    return 1;
  }

  /* ------------------------------------------------------------ LE VERDICT */
  const fautes = [];
  const totaux = { debordements: 0, ciblesTropPetites: 0, texteCoupe: 0, chevauchements: 0, basculesFocalisables: 0 };
  const pire = { ecrans: 0, url: "" };
  let blocsComptes = 0;
  /* Les coupes déclarées : relevées, montrées, jamais comptées comme fautes. */
  let coupesDeclarees = 0;
  let pireCoupe = { px: 0, texte: "" };

  for (const releve of releves.sort(
    (a, b) => a.largeur - b.largeur || a.url.localeCompare(b.url),
  )) {
    const { url, gabarit, largeur, bureau, mesure } = releve;

    /* Les règles 1 à 4 se jugent SOUS 880 px : au-dessus, la mise en page de
       bureau n'est pas le sujet de cette porte. La règle 5 se juge au-dessus,
       et seulement là. La règle 6 se juge partout. */
    const aJuger = bureau
      ? ["basculesFocalisables"]
      : ["debordements", "ciblesTropPetites", "texteCoupe", "chevauchements"];

    const lignes = [];
    for (const cle of aJuger) {
      totaux[cle] += mesure[cle].length;
      for (const p of mesure[cle]) lignes.push(`[${ETIQUETTES[cle]}] ${p.texte}`);
    }
    if (lignes.length > 0) {
      const montre = DETAIL ? lignes : lignes.slice(0, 4);
      fautes.push(
        `${url} à ${largeur} px (${gabarit}) : ${lignes.length} défaut(s)\n      ` +
          montre.join("\n      ") +
          (lignes.length > montre.length ? `\n      et ${lignes.length - montre.length} de plus` : ""),
      );
    }

    /* RÈGLE 6 : le compte ne doit pas tomber, et il ne doit pas bouger sans
       qu'on le voie. La table est une mesure datée, pas une dispense. */
    if (mesure.pliables < releve.pliables) {
      fautes.push(
        `${url} à ${largeur} px : ${mesure.pliables} bloc(s) repliable(s) au lieu de ` +
          `${releve.pliables}. LE REPLI A ÉTÉ DÉFAIT : la page ne casse aucun pixel, elle ` +
          `rallonge de plusieurs écrans en silence`,
      );
    } else if (mesure.pliables > releve.pliables) {
      fautes.push(
        `${url} à ${largeur} px : ${mesure.pliables} bloc(s) repliable(s) au lieu de ` +
          `${releve.pliables}. Le motif a changé : si c'est voulu, mettre à jour ECHANTILLON ` +
          `dans cette porte, sinon quelqu'un en a ajouté sans le dire`,
      );
    }
    if (!bureau) {
      coupesDeclarees += mesure.coupesDeclarees.length;
      for (const c of mesure.coupesDeclarees) {
        const px = Number.parseInt(c.texte.match(/, (\d+) px de texte sous le pli/)?.[1] ?? "0", 10);
        if (px > pireCoupe.px) pireCoupe = { px, texte: `${url} à ${largeur} px, ${c.texte}` };
      }
    }
    if (largeur === 390) {
      blocsComptes += mesure.pliables;
      const ecrans = mesure.hauteur / HAUTEUR_ECRAN;
      if (ecrans > pire.ecrans) {
        pire.ecrans = ecrans;
        pire.url = url;
      }
    }

    console.log(
      `${url.padEnd(50)} ${String(largeur).padStart(4)} px  ` +
        `${String(lignes.length).padStart(3)} défaut(s)  ` +
        `repli ${mesure.pliables - mesure.pliablesOuverts}/${mesure.pliables}  ` +
        `hauteur ${(mesure.hauteur / HAUTEUR_ECRAN).toFixed(1)} écran(s)`,
    );
  }

  if (servisDuCache.length > 0) {
    console.log(
      `\n${servisDuCache.length} page(s) servie(s) depuis le cache Vercel (x-vercel-cache: ` +
        `HIT) : elles peuvent être PÉRIMÉES, et une correction poussée à l'instant n'y est ` +
        `pas encore. ${servisDuCache.slice(0, 5).join(", ")}` +
        (servisDuCache.length > 5 ? `, et ${servisDuCache.length - 5} autre(s)` : ""),
    );
  }

  console.log(
    `\nTOTAUX sur ${releves.length} relevés, ${ECHANTILLON.length} pages des onze gabarits :\n` +
      `  ${totaux.debordements} débordement(s)            (règle 1, sous ${SEUIL_MOBILE} px)\n` +
      `  ${totaux.ciblesTropPetites} cible(s) sous ${CIBLE_MINIMALE} px          (règle 2, WCAG 2.2 critère 2.5.8)\n` +
      `  ${totaux.texteCoupe} texte(s) coupé(s) ou masqué(s)  (règle 3)\n` +
      `  ${totaux.chevauchements} chevauchement(s)         (règle 4)\n` +
      `  ${totaux.basculesFocalisables} bascule(s) focalisable(s) à ${LARGEUR_BUREAU} px (règle 5)\n` +
      `  ${blocsComptes} bloc(s) repliable(s) à 390 px   (règle 6, ` +
      `${ECHANTILLON.reduce((n, p) => n + p.pliables, 0)} attendus)\n` +
      `pire hauteur à 390 px : ${pire.url} à ${pire.ecrans.toFixed(1)} écrans de ${HAUTEUR_ECRAN} px`,
  );

  console.log(
    `\nRELEVÉ SANS VERDICT, ${coupesDeclarees} coupe(s) déclarée(s) par line-clamp, non ` +
      `comptée(s) : c'est le motif de la maquette mobile, déclaré dans le code qui le pose, ` +
      `et il prévient le lecteur que la suite est sous la bascule.` +
      (pireCoupe.px > 0 ? `\n  la plus profonde : ${pireCoupe.texte}` : ""),
  );

  if (fautes.length > 0) {
    console.error(`\nRESPONSIVE DU SITE, ${fautes.length} point(s) à reprendre :\n`);
    for (const f of fautes) console.error(`  · ${f}`);
    console.error(
      `\nCette porte SIGNALE, elle ne corrige pas, et elle n'a pas de « hors périmètre » : ` +
        `un défaut qui vit dans un composant partagé appartient au site.\n` +
        `Témoin : node scripts/verifie-responsive.mjs --controle, pour vérifier qu'elle ` +
        `sait encore échouer.`,
    );
    return 1;
  }

  console.log(
    `\nRESPONSIVE DU SITE CONFORME : ${ECHANTILLON.length} pages des onze gabarits, ` +
      `${LARGEURS.join(", ")} et ${LARGEUR_BUREAU} px, aucun débordement, aucune cible sous ` +
      `${CIBLE_MINIMALE} px, aucun texte coupé, aucun chevauchement, aucune bascule ` +
      `focalisable au-dessus de ${SEUIL_MOBILE} px, et les ` +
      `${ECHANTILLON.reduce((n, p) => n + p.pliables, 0)} blocs repliables sont tous là.`,
  );
  return 0;
}

/* ====================================================================== */
console.log(
  `porte du responsive, ${MODE_CONTROLE ? "mode témoin" : "mesure"} sur ${SITE}` +
    (EN_PRODUCTION ? "  (PRODUCTION, SITE_URL non posée)" : ""),
);

const navigateur = await chromium.launch({ channel: "chrome" });
let code = 1;
try {
  code = MODE_CONTROLE ? await modeTemoin(navigateur) : await modeNormal(navigateur);
} catch (erreur) {
  console.error(
    `\nMESURE NON CONCLUANTE : l'instrument s'est arrêté, ${erreur.message.split("\n")[0]}`,
  );
  code = 1;
} finally {
  await navigateur.close();
}
process.exit(code);
