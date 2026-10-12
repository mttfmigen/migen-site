/**
 * LIRE UN BLOC REPLIÉ ET LE COMPARER À SA CAPTURE : les six mesures, sans
 * réseau et sans effet de bord.
 *
 * Ce module ne mesure rien tout seul et ne s'exécute pas : il expose des
 * fonctions PURES, et c'est volontaire. `scripts/verifie-titres-replies.mjs`
 * s'en sert pour son témoin (des HTML fabriqués en mémoire) et pour sa mesure
 * (les 248 adresses servies), et n'importe qui peut l'importer pour vérifier un
 * cas à la main sans déclencher une campagne de 248 requêtes. Le dépôt a déjà
 * ce motif : `scripts/decisions-copie.mjs`, importé par trois portes.
 *
 * Le pourquoi des six règles, les pièges de mesure et le motif de référence
 * sont documentés dans l'en-tête de `scripts/verifie-titres-replies.mjs`.
 */

/** La largeur de référence du dépôt : toutes les captures sont prises là. */
export const LARGEUR = 1280;
/** Le seuil du repli, celui de `SectionPliableMobile.module.css`. */
export const SEUIL_MOBILE = 880;
/** Deux titres à moins d'un demi-pixel l'un de l'autre sont la même taille. */
const TOLERANCE_PX = 0.5;
/* ═══════════════════════════════════════════════════════════ normalisation ═ */

/** LE SÉPARATEUR DE BLOC : deux nœuds voisins ne doivent pas se coller. */
const SEP = String.fromCharCode(1);

/** Les entités que les deux côtés n'écrivent pas pareil. React sérialise
 *  `&#x27;`, la capture écrit l'apostrophe, le corpus la typographique. */
function decode(texte) {
  return texte
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&amp;/gi, "&");
}

/** Insécables ramenées à l'espace, apostrophes unifiées, blancs réduits. */
function normalise(texte) {
  return decode(texte)
    .replace(/[   ]/g, " ")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Le texte lisible d'un fragment, séparateur de bloc compris. */
function texteDe(html) {
  return normalise(
    html.replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, SEP),
  )
    .split(SEP)
    .map((bout) => bout.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Le CONTENU des scripts et des styles est remplacé par autant d'espaces.
 * Les longueurs sont préservées : les index relevés sur ce texte restent
 * valables sur le HTML d'origine, ce qui permet d'en découper des fragments
 * exacts sans se faire piéger par un `<` dans une chaîne de script.
 */
function neutralise(html) {
  return html.replace(
    /(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (_, ouvre, __, dedans, ferme) => ouvre + " ".repeat(dedans.length) + ferme,
  );
}

/** Les éléments sans contenu : ils ne portent ni cellule ni section. */
const SANS_CONTENU = new Set(
  "area base br col embed hr img input link meta source track wbr param path use circle rect stop".split(" "),
);

const BALISE = /<(\/?)([a-zA-Z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;

/**
 * RETIRE UN ÉLÉMENT `data-mobile-seulement` ET TOUT SON CONTENU, imbrication
 * comprise. Repris de `verifie-titres-metier.mjs`, qui explique pourquoi le
 * comptage de profondeur est indispensable : l'étiquette du 12/10 est un `span`
 * qui en contient deux, un pour le surtitre et un pour le titre, et un motif
 * paresseux n'en retirait que la moitié.
 */
function retireOrnements(html) {
  const marque = /<(\w+)\b[^>]*\bdata-mobile-seulement\b[^>]*>/;
  let sortie = html;
  for (;;) {
    const debut = sortie.match(marque);
    if (!debut || debut.index === undefined) return sortie;
    const nom = debut[1];
    const balises = new RegExp(`<${nom}\\b[^>]*>|</${nom}\\s*>`, "g");
    balises.lastIndex = debut.index + debut[0].length;
    let profondeur = 1;
    let fin = -1;
    for (let m = balises.exec(sortie); m; m = balises.exec(sortie)) {
      profondeur += m[0].startsWith("</") ? -1 : 1;
      if (profondeur === 0) {
        fin = m.index + m[0].length;
        break;
      }
    }
    if (fin < 0) fin = debut.index + debut[0].length;
    sortie = `${sortie.slice(0, debut.index)} ${sortie.slice(fin)}`;
  }
}

/** Les titres d'un fragment : `{ balise, attributs, texte }`, dans l'ordre. */
function titres(html) {
  return [...html.matchAll(/<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    balise: m[1].toLowerCase(),
    attributs: m[2],
    texte: texteDe(m[3]),
  }));
}

function classesDe(attributs) {
  return (attributs.match(/\bclass="([^"]*)"/) ?? [, ""])[1].split(/\s+/).filter(Boolean);
}

function styleDe(attributs) {
  return decode((attributs.match(/\bstyle="([^"]*)"/) ?? [, ""])[1]);
}

/* ══════════════════════════════════════════════════ les blocs repliables ══ */

/**
 * Les `<details data-pliable-mobile>` d'une page, avec ce qu'il faut pour juger
 * chaque règle : le contenu de la bascule, celui du corps, les classes du bloc
 * et de son `<summary>`, et LES CLASSES DE TOUS SES ANCÊTRES.
 *
 * Les ancêtres ne sont pas un luxe : la règle de bureau qui masque la bascule
 * est ancrée sur une classe de portée (`.corpsMetier`, `.blocPliablePartage`,
 * `.corpsGuide`…) pour ne pas toucher les autres gabarits. Savoir qu'une classe
 * est « quelque part dans la page » ne dit rien ; il faut qu'elle soit sur un
 * ancêtre de CE bloc, sans quoi la règle ne s'applique pas à lui.
 */
export function blocsPliables(html) {
  const plat = neutralise(html);
  const pile = [];
  const trouves = [];
  BALISE.lastIndex = 0;
  for (let m = BALISE.exec(plat); m; m = BALISE.exec(plat)) {
    const [brut, ferme, nom0, attributs, auto] = m;
    const nom = nom0.toLowerCase();
    if (ferme) {
      const i = pile.findLastIndex((n) => n.nom === nom);
      if (i < 0) continue;
      for (const bloc of trouves)
        if (bloc.fin === -1 && bloc.profondeur >= i) {
          bloc.fin = m.index;
          bloc.dedans = html.slice(bloc.debut, m.index);
        }
      pile.length = i;
      continue;
    }
    if (auto || SANS_CONTENU.has(nom)) continue;
    pile.push({ nom, classes: classesDe(attributs) });
    if (nom === "details" && /\bdata-pliable-mobile\b/.test(attributs)) {
      trouves.push({
        profondeur: pile.length - 1,
        classes: classesDe(attributs),
        ancetres: pile.slice(0, -1).flatMap((n) => n.classes),
        debut: m.index + brut.length,
        fin: -1,
        dedans: "",
      });
    }
  }
  return trouves
    .filter((bloc) => bloc.dedans)
    .map((bloc) => {
      const { summary, attributsSummary, corps } = coupeBascule(bloc.dedans);
      return {
        ...bloc,
        summary,
        corps,
        classesSummary: classesDe(attributsSummary),
        /* L'intitulé sert à NOMMER le bloc dans un message d'erreur. Le premier
           titre du corps le désigne mieux que son rang. */
        intitule:
          titres(corps)[0]?.texte ||
          texteDe(bloc.dedans).slice(0, 60) ||
          "bloc sans texte",
      };
    });
}

/** Le `<summary>` d'un bloc, ses attributs, et tout ce qui le suit. */
function coupeBascule(dedans) {
  const ouvre = dedans.match(/<summary\b([^>]*)>/);
  if (!ouvre || ouvre.index === undefined) return { summary: "", attributsSummary: "", corps: dedans };
  const apres = dedans.slice(ouvre.index + ouvre[0].length);
  const balises = /<(\/?)summary\b[^>]*>/g;
  let profondeur = 1;
  for (let m = balises.exec(apres); m; m = balises.exec(apres)) {
    profondeur += m[1] ? -1 : 1;
    if (profondeur === 0)
      return {
        summary: apres.slice(0, m.index),
        attributsSummary: ouvre[1],
        corps: apres.slice(m.index + m[0].length),
      };
  }
  return { summary: apres, attributsSummary: ouvre[1], corps: "" };
}

/* ═══════════════════════════════════════════════ la taille d'un titre ════ */

/**
 * La taille déclarée d'un titre, en pixels, à 1 280 px de large.
 *
 * Les captures et le site écrivent la même expression, par exemple
 * `font: 600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)`. On évalue
 * le `clamp` à la largeur de référence et on applique `--ts`, qui vaut 1 des
 * deux côtés (`app/globals.css` ligne 99, et la maquette pose `--ts:1`). Tout
 * est donc comparable sans navigateur, et sans dépendre d'une police.
 *
 * Renvoie `null` quand aucune taille n'est déclarée en ligne : la porte le dit
 * alors plutôt que de deviner.
 */
export function tailleDeclaree(attributs, ts = 1) {
  const style = styleDe(attributs);
  const brut =
    style.match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i)?.[1] ??
    style.match(/(?:^|;)\s*font\s*:\s*([^;]+)/i)?.[1];
  if (!brut) return null;
  const clamp = brut.match(/clamp\(\s*([\d.]+)px\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)px\s*\)/i);
  if (clamp) {
    const [min, souhait, max] = [Number(clamp[1]), (Number(clamp[2]) * LARGEUR) / 100, Number(clamp[3])];
    return Math.min(Math.max(min, souhait), max) * ts;
  }
  const fixe = brut.match(/(?:^|\s|\/)([\d.]+)px/);
  return fixe ? Number(fixe[1]) * ts : null;
}

/** La max-width en `ch` déclarée sur un titre, ou `null`. */
export function maxWidthCh(attributs) {
  const m = styleDe(attributs).match(/max-width\s*:\s*([\d.]+)ch/i);
  return m ? Number(m[1]) : null;
}

/** Arrondi d'affichage, virgule française. */
function px(valeur) {
  return `${String(Math.round(valeur * 100) / 100).replace(".", ",")} px`;
}

/* ══════════════════════════════════════════════════════════ les grilles ══ */

/** Le nombre de pistes déclarées par un `grid-template-columns`. */
function nombreDePistes(modele) {
  if (!modele || /auto-fit|auto-fill/.test(modele)) return 0;
  let total = 0;
  let reste = modele;
  for (const r of modele.matchAll(/repeat\(\s*(\d+)\s*,([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) {
    const dedans = r[2].trim().split(/\s+(?![^(]*\))/).filter(Boolean).length || 1;
    total += Number(r[1]) * dedans;
    reste = reste.replace(r[0], " ");
  }
  return total + reste.trim().split(/\s+(?![^(]*\))/).filter(Boolean).length;
}

/** `minmax(0px, 1fr)` et `minmax(0,1fr)` sont la même piste. */
function signaturePistes(modele) {
  return modele.toLowerCase().replace(/\s+/g, "").replace(/0px/g, "0").replace(/\.0+fr/g, "fr");
}

/**
 * Les grilles déclarées en style en ligne, avec leurs cellules (les enfants
 * directs). Seules les grilles de DEUX PISTES OU PLUS comptent : c'est là
 * qu'une cellule vidée laisse une demi-colonne blanche.
 */
export function grilles(html) {
  const plat = neutralise(html);
  const sortie = [];
  const re = new RegExp(BALISE.source, "g");
  for (let m = re.exec(plat); m; m = re.exec(plat)) {
    const [brut, ferme, nom0, attributs, auto] = m;
    if (ferme || auto) continue;
    const nom = nom0.toLowerCase();
    if (SANS_CONTENU.has(nom)) continue;
    const style = styleDe(attributs);
    if (!/display\s*:\s*(inline-)?grid/i.test(style)) continue;
    const modele = (style.match(/grid-template-columns\s*:\s*([^;"]+)/i) ?? [, ""])[1].trim();
    const pistes = nombreDePistes(modele);
    if (pistes < 2) continue;
    const balises = new RegExp(`<${nom}\\b[^>]*>|</${nom}\\s*>`, "gi");
    balises.lastIndex = m.index + brut.length;
    let profondeur = 1;
    let fin = plat.length;
    for (let x = balises.exec(plat); x; x = balises.exec(plat)) {
      profondeur += x[0].startsWith("</") ? -1 : 1;
      if (profondeur === 0) {
        fin = x.index;
        break;
      }
    }
    const dedans = html.slice(m.index + brut.length, fin);
    sortie.push({
      signature: `${pistes}|${signaturePistes(modele)}`,
      modele: modele.replace(/\s+/g, " "),
      cellules: enfantsDirects(dedans).map((enfant) => ({
        texte: texteDe(retireOrnements(enfant)),
        titres: titres(enfant).map((t) => t.texte),
      })),
    });
  }
  return sortie;
}

/** Les fragments HTML des enfants directs d'un contenu. */
function enfantsDirects(html) {
  const plat = neutralise(html);
  const re = new RegExp(BALISE.source, "g");
  const enfants = [];
  let profondeur = 0;
  let debut = 0;
  for (let m = re.exec(plat); m; m = re.exec(plat)) {
    const [brut, ferme, nom0, , auto] = m;
    const nom = nom0.toLowerCase();
    if (auto || SANS_CONTENU.has(nom)) {
      if (profondeur === 0) enfants.push(brut);
      continue;
    }
    if (!ferme) {
      if (profondeur === 0) debut = m.index;
      profondeur++;
      continue;
    }
    if (profondeur > 0) profondeur--;
    if (profondeur === 0) enfants.push(html.slice(debut, m.index + brut.length));
  }
  return enfants;
}

/* ════════════════════════════════ les règles de bureau de la feuille CSS ══ */

/**
 * Les sélecteurs qui posent `display: none` dans un `@media` DE BUREAU, c'est à
 * dire à partir de 881 px et sans borne haute. Un `@media (min-width:881px) and
 * (max-width:1100px)` ne masque que dans une bande : il ne prouve rien pour
 * toutes les largeurs de bureau, il est donc ignoré, et la porte conclura que
 * la bascule reste focalisable. Mieux vaut qu'elle refuse à tort une règle
 * exotique que d'en accepter une qui ne couvre pas le cas.
 */
export function selecteursMasquantsBureau(css) {
  const sortie = [];
  const re = /@media([^{]+)\{/g;
  for (let m = re.exec(css); m; m = re.exec(css)) {
    const condition = m[1];
    const minima = [...condition.matchAll(/min-width\s*:\s*([\d.]+)px/g)].map((x) => Number(x[1]));
    if (!minima.some((v) => v > SEUIL_MOBILE)) continue;
    if (/max-width/.test(condition)) continue;
    let profondeur = 1;
    let i = m.index + m[0].length;
    const debut = i;
    for (; i < css.length && profondeur > 0; i++) {
      if (css[i] === "{") profondeur++;
      else if (css[i] === "}") profondeur--;
    }
    for (const regle of css.slice(debut, i - 1).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/display\s*:\s*none/i.test(regle[2])) continue;
      for (const selecteur of regle[1].split(",")) {
        const propre = selecteur.trim();
        if (propre) sortie.push(propre);
      }
    }
  }
  return sortie;
}

/**
 * CE SÉLECTEUR MASQUE-T-IL LA BASCULE DE CE BLOC ?
 *
 * Deux conditions, et les deux sont nécessaires :
 *
 * 1. IL VISE BIEN LE `<summary>`. Soit le dernier maillon du sélecteur nomme
 *    `summary`, soit ses classes sont celles que porte le `<summary>` servi
 *    (le motif pourrait masquer par la classe `.bascule` plutôt que par la
 *    balise, les deux sont acceptés).
 * 2. SA PORTÉE COUVRE CE BLOC. Toutes les classes citées avant le dernier
 *    maillon doivent se trouver sur le bloc ou sur un de ses ANCÊTRES. Un
 *    sélecteur sans classe de portée couvre tout le monde.
 */
function masqueLaBascule(selecteur, bloc) {
  const maillons = selecteur.split(/\s*>\s*|\s+/).filter(Boolean);
  const dernier = maillons[maillons.length - 1] ?? "";
  const classesDernier = [...dernier.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
  const viseBascule =
    /(^|[^\w-])summary\b/.test(dernier) ||
    (classesDernier.length > 0 && classesDernier.every((c) => bloc.classesSummary.includes(c)));
  if (!viseBascule) return false;
  const portee = new Set([...bloc.ancetres, ...bloc.classes, ...bloc.classesSummary]);
  for (const maillon of maillons.slice(0, -1))
    for (const classe of maillon.matchAll(/\.([\w-]+)/g)) if (!portee.has(classe[1])) return false;
  return true;
}

/* ═══════════════════════════════════════════════════════════ les six règles ═ */

/** Le préfixe de message de chaque règle. C'est à lui que le témoin reconnaît
 *  qu'une faute est tombée sur SA règle, et pas sur une voisine. */
export const REGLES = {
  DOUBLE: "TITRE EN DOUBLE",
  TAILLE: "H2 HORS DE SA TAILLE DE CAPTURE",
  LARGEUR: "MAX-WIDTH DE TITRE PERDUE",
  CELLULE: "CELLULE D'EN-TETE APLATIE",
  BASCULE: "BASCULE FOCALISABLE SUR BUREAU",
  ETIQUETTE: "ETIQUETTE DE BASCULE NON CONFORME",
};

/**
 * RÈGLE 1. Aucun titre en double dans un bloc replié.
 *
 * On compte les éléments de titre de TOUT le bloc, bascule comprise et
 * ornements mobiles compris : un titre enfermé dans une étiquette reste dans la
 * structure du document, et Google le lit deux fois comme n'importe qui.
 * L'étiquette du motif de référence, elle, est faite de `<span>` : elle répète
 * le texte du titre sans le répéter comme titre, et ne déclenche rien.
 */
function regleDoublons(blocs) {
  const fautes = [];
  for (const bloc of blocs) {
    const vus = new Map();
    for (const titre of [...titres(bloc.summary), ...titres(bloc.corps)])
      if (titre.texte) vus.set(titre.texte, (vus.get(titre.texte) ?? 0) + 1);
    for (const [texte, n] of vus)
      if (n > 1)
        fautes.push(
          `${REGLES.DOUBLE} : « ${texte} » paraît ${n} fois dans le même bloc replié ` +
            `(étiquette de bascule et rendu interne)`,
        );
  }
  return fautes;
}

/**
 * RÈGLE 2. Chaque h2 est servi à la taille de sa capture.
 *
 * Appariement PAR LE TEXTE : le défaut change la taille, jamais les mots. Un
 * h2 servi dont aucun jumeau de même texte n'existe dans la capture n'est pas
 * jugé ici (il est compté et annoncé) : c'est le rôle des portes de fidélité de
 * dire si ce titre a sa place.
 *
 * LES ORNEMENTS MOBILES SONT ÉCARTÉS : l'étiquette de bascule n'existe que sous
 * 880 px, la capture est de bureau, elle n'a aucune raison de la porter.
 */
function regleTailles(htmlServi, htmlCapture) {
  const fautes = [];
  const refs = new Map();
  for (const titre of titres(retireOrnements(htmlCapture)).filter((t) => t.balise === "h2")) {
    const liste = refs.get(titre.texte) ?? [];
    liste.push(titre);
    refs.set(titre.texte, liste);
  }
  let juges = 0;
  let sansJumeau = 0;
  let sansTaille = 0;
  for (const titre of titres(retireOrnements(htmlServi)).filter((t) => t.balise === "h2")) {
    const jumeaux = refs.get(titre.texte);
    if (!jumeaux?.length) {
      sansJumeau++;
      continue;
    }
    const attendues = jumeaux.map((t) => tailleDeclaree(t.attributs)).filter((v) => v !== null);
    if (attendues.length === 0) continue;
    const servie = tailleDeclaree(titre.attributs);
    if (servie === null) {
      sansTaille++;
      continue;
    }
    juges++;
    if (!attendues.some((v) => Math.abs(v - servie) <= TOLERANCE_PX))
      fautes.push(
        `${REGLES.TAILLE} : « ${titre.texte} » servi à ${px(servie)} à ${LARGEUR} px, ` +
          `sa capture le porte à ${[...new Set(attendues.map(px))].join(" ou ")}`,
      );
  }
  return { fautes, juges, sansJumeau, sansTaille };
}

/**
 * RÈGLE 3. Aucune max-width en `ch` de la capture perdue par le rendu.
 *
 * On ne juge que l'ABSENCE, comme demandé : une valeur différente relève de la
 * fidélité au pixel, qui a ses propres portes, et la capture gelée de
 * `/bureau-etudes/` montre qu'une valeur peut changer sans que le site ait tort.
 */
function regleMaxWidth(htmlServi, htmlCapture) {
  const fautes = [];
  const refs = new Map();
  for (const titre of titres(retireOrnements(htmlCapture)).filter((t) => t.balise === "h2")) {
    const ch = maxWidthCh(titre.attributs);
    if (ch !== null && !refs.has(titre.texte)) refs.set(titre.texte, ch);
  }
  for (const titre of titres(retireOrnements(htmlServi)).filter((t) => t.balise === "h2")) {
    const attendu = refs.get(titre.texte);
    if (attendu === undefined) continue;
    if (maxWidthCh(titre.attributs) === null)
      fautes.push(
        `${REGLES.LARGEUR} : la capture pose max-width ${attendu}ch sur « ${titre.texte} », le rendu n'en pose aucune`,
      );
  }
  return fautes;
}

/**
 * RÈGLE 4. Aucune cellule d'en-tête aplatie.
 *
 * Les grilles sont appariées par leur SIGNATURE (nombre de pistes et modèle de
 * colonnes normalisé) et par leur rang d'apparition parmi celles de même
 * signature. Pour chaque cellule que la capture remplit d'un TITRE, la cellule
 * de même rang du rendu doit porter quelque chose. Si elle est absente ou
 * entièrement vide, la piste subsiste et son contenu a disparu : c'est la
 * demi-colonne blanche du 12/10.
 *
 * POURQUOI « ENTIÈREMENT VIDE » ET PAS « SANS TITRE » : mesuré sur les 233
 * pages, la variante « sans titre » relève trois cellules qui ne sont pas en
 * défaut, parce que deux grilles `repeat(3,minmax(0,1fr))` de rangs différents
 * se font face. Exiger le vide complet supprime ce bruit sans rien perdre du
 * défaut : quand l'en-tête part dans la bascule, le surtitre part avec lui et
 * la cellule ne garde rien.
 */
function regleCellules(htmlServi, htmlCapture) {
  const parSignature = (liste) => {
    const m = new Map();
    for (const grille of liste) {
      const l = m.get(grille.signature) ?? [];
      l.push(grille);
      m.set(grille.signature, l);
    }
    return m;
  };
  const ref = parSignature(grilles(htmlCapture));
  const vu = parSignature(grilles(htmlServi));
  const fautes = [];
  for (const [signature, grillesRef] of ref) {
    const grillesVues = vu.get(signature) ?? [];
    for (let i = 0; i < Math.min(grillesRef.length, grillesVues.length); i++) {
      const cellulesRef = grillesRef[i].cellules;
      const cellulesVues = grillesVues[i].cellules;
      for (let j = 0; j < cellulesRef.length; j++) {
        /* UN TITRE, ET RIEN D'AUTRE. La variante qui signalait toute cellule
           vidée relève 665 paires sur le site, presque toutes fausses : les
           grilles de formulaire ont la même signature `1fr 1fr` que des dizaines
           d'autres, et l'appariement par rang les mélange. Les trous de contenu
           hors titre se mesurent ailleurs, avec un appariement qui leur convient. */
        const titreRef = cellulesRef[j].titres.find(Boolean);
        if (!titreRef) continue;
        const servie = cellulesVues[j];
        if (servie && servie.texte !== "") continue;
        fautes.push(
          `${REGLES.CELLULE} : grille ${grillesRef[i].modele}, cellule ${j + 1} ` +
            `${servie ? "vidée" : "disparue"} ; la capture y porte le titre « ${titreRef} »`,
        );
      }
    }
  }
  return fautes;
}

/**
 * RÈGLE 5. Aucun `<summary>` focalisable au-dessus de 880 px.
 *
 * Ce n'est pas de la cosmétique. Vidée de son étiquette, la bascule reste un
 * `<summary>` : un arrêt de tabulation muet par section repliée, 117 sur les
 * treize pages métier avant correctif. Le motif la retire par `display: none`
 * dans un `@media (min-width: 881px)` ancré sur la classe de portée du gabarit.
 */
function regleBascules(blocs, selecteurs) {
  const fautes = [];
  for (const bloc of blocs) {
    if (!bloc.summary) continue;
    if (selecteurs.some((s) => masqueLaBascule(s, bloc))) continue;
    fautes.push(
      `${REGLES.BASCULE} : la bascule de « ${bloc.intitule} » n'est masquée par aucune règle ` +
        `de bureau (@media min-width > ${SEUIL_MOBILE}px, display:none), elle reste un arrêt de tabulation muet`,
    );
  }
  return fautes;
}

/**
 * RÈGLE 6. L'étiquette de la bascule est bien une étiquette mobile.
 *
 * Deux manquements possibles, et chacun est un des deux pièges opposés :
 *
 *  a. DU CONTENU NON MARQUÉ dans la bascule : il paraît sur grand écran, là où
 *     la capture ne montre que le titre de la section. C'est le `<h2>` déplacé
 *     dans la bascule, piège numéro deux.
 *  b. UN ÉLÉMENT DE TITRE DANS L'ÉTIQUETTE : marqué `data-mobile-seulement`, il
 *     disparaît de l'écran de bureau mais reste dans la structure du document,
 *     où il double ou déplace le titre de la section.
 *
 * L'étiquette du motif est faite de deux `<span>` imbriqués, marqués, l'un pour
 * le surtitre et l'autre pour le titre. Le chevron et le résumé du même bloc
 * portent la même marque et sont donc acceptés sans rien dire.
 */
function regleEtiquettes(blocs) {
  const fautes = [];
  for (const bloc of blocs) {
    if (!bloc.summary) continue;
    const bureau = texteDe(retireOrnements(bloc.summary));
    if (bureau)
      fautes.push(
        `${REGLES.ETIQUETTE} : la bascule de « ${bloc.intitule} » montre « ${bureau.slice(0, 70)} » ` +
          `sur grand écran, sans marque data-mobile-seulement`,
      );
    const dansOrnement = titres(bloc.summary).length - titres(retireOrnements(bloc.summary)).length;
    if (dansOrnement > 0)
      fautes.push(
        `${REGLES.ETIQUETTE} : l'étiquette de « ${bloc.intitule} » porte ${dansOrnement} élément(s) de titre ; ` +
          `une étiquette est faite de span, le titre reste dans la section`,
      );
  }
  return fautes;
}

/**
 * LES SIX RÈGLES SUR UNE PAGE. Fonction PURE : le témoin lui donne des HTML
 * fabriqués, c'est ce qui permet de prouver qu'elle sait échouer sans toucher
 * au site. `htmlCapture` à `null` signifie « pas de référence fraîche » : les
 * règles 2, 3 et 4 sont alors annoncées non mesurables plutôt que supposées.
 */
export function ecarts({ htmlServi, htmlCapture, selecteursBureau }) {
  const blocs = blocsPliables(htmlServi);
  const fautes = [
    ...regleDoublons(blocs),
    ...regleBascules(blocs, selecteursBureau),
    ...regleEtiquettes(blocs),
  ];
  let mesure = { juges: 0, sansJumeau: 0, sansTaille: 0 };
  if (htmlCapture) {
    /* LE COMPTE EST SÉPARÉ DES FAUTES, et ce n'est pas un détail de style :
       la première version renvoyait `{ ...fautes, ...mesure }` avec un `mesure`
       qui portait encore sa propre clé `fautes`, laquelle écrasait la liste
       complète. Résultat, la porte ne rapportait que la règle 2 et acceptait
       tout le reste. Le témoin l'a vu du premier coup, 1 faute sur 8 détectée. */
    const { fautes: fautesTailles, ...compte } = regleTailles(htmlServi, htmlCapture);
    mesure = compte;
    fautes.push(
      ...fautesTailles,
      ...regleMaxWidth(htmlServi, htmlCapture),
      ...regleCellules(htmlServi, htmlCapture),
    );
  }
  return { blocs: blocs.length, fautes, ...mesure };
}
