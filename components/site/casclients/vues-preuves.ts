import type { ContenuHubPreuves } from "@/types/casclients";

/**
 * Les vues du hub /preuves/ : ce que montre chaque onglet du filtre.
 *
 * PORT LITTÉRAL de la logique de `MigenPreuves.dc.html` (identique dans
 * l'application autonome) : `renderVals`, `pvPool`, `pvAssign`, `CLIENT_LOGO`.
 * La maquette choisit la photo d'une carte PAR VUE : une photo n'est pas
 * reprise deux fois dans la même grille, si bien qu'un même cas change de
 * photo entre « Tous » et son onglet. On calcule donc chaque vue entière.
 *
 * `scripts/verifie-casclients.tsx` rejoue la logique de la maquette elle-même
 * sur le corpus et exige les mêmes photos et logos, vue par vue.
 *
 * UN SEUL ÉCART ASSUMÉ CONTRE LA MAQUETTE, et il est demandé : les CASES MISES
 * EN AVANT (les trois cartes à photo pleine) acceptent un cas désigné par le
 * corpus, `CasHubPreuves.aLaUne`. La capture `maquette/rendu/preuves.html`
 * met en avant Danone, GLS et JTEKT, c'est-à-dire ses trois premiers : c'est
 * donc bien un arbitrage, pas un défaut de portage. Il vient de la demande de
 * Mehdi du 12/10, « tu dois également mettre en case mise en avant celui de
 * Norvège » (G44 de GATES.md), et il ne change rien tant que le corpus ne
 * marque personne. La porte dédiée est `scripts/verifie-cas-en-avant.mjs`.
 *
 * UN SECOND ÉCART, LE 14/10 : la grille ne reprend plus les trois photos du
 * héros. Voir `PHOTOS_DU_HEROS`.
 */

/**
 * Les trois photos de la mosaïque du héros (`PreuvesHub`), dans l'ordre de la
 * maquette. Le héros les lit ici, et la grille les écarte.
 *
 * POURQUOI LA GRILLE LES ÉCARTE. `pvAssign` de la maquette puise aussi dans
 * `PVPH`, qui contient ces trois photos : la grille « Tous » resservait
 * `team-duo` (AKTID), `team-grind-front` (McCAIN) et `ph-robots-solaire`
 * (EIFFAGE), déjà vues dans le héros quelques centimètres plus haut. Le défaut
 * est celui de la maquette elle-même, mesuré le 14/10 par
 * `scripts/verifie-photos-du-bloc.mjs`. Le héros est fixe et garde ses photos ;
 * c'est la grille, calculée, qui cède.
 *
 * ELLE CÈDE CARTE PAR CARTE, APRÈS `pvAssign`, et pas en amont. Retirer ces
 * photos du pool avant l'attribution décalait toute la chaîne gloutonne :
 * 27 cartes sur 82 changeaient de photo (mesuré le 14/10), dont 23 qui n'en
 * montraient aucune du héros. Ici, seule une carte tombée sur une photo du
 * héros en change, pour la première photo de SON pool qui n'y est pas : sa
 * photo propre (`CASE_PH`) quand elle en a une. Les autres gardent celle de la
 * maquette.
 */
export const PHOTOS_DU_HEROS = [
  "/assets/web/team-duo.jpg",
  "/assets/web/team-grind-front.jpg",
  "/assets/web/ph-robots-solaire.jpg",
] as const;

const DU_HEROS: ReadonlySet<string> = new Set(PHOTOS_DU_HEROS);

/* LA PHOTO DU HÉROS DE LA MAQUETTE MOBILE, sous 880 px seulement (le bureau
   garde la sienne). dc.html L225 `FIMG.preuves` pour le hub ; L229 `POOL`,
   L416-L418 `hsh`, `SECT` et `casePhoto` pour une étude de cas : la photo
   est tirée du pool du secteur par l'empreinte du slug, mot pour mot. */
export const PHOTO_HUB_MOBILE = "/assets/web/x-logistique-convoyeurs.jpg";

const POOL_MOBILE: Readonly<Record<string, readonly string[]>> = {
  logi: ["x-logistique-convoyeurs", "x-logistique-entrepot", "x-logistique-cariste", "x-logistique-tablette", "x-logistique-discussion"],
  auto: ["x-auto-ligne", "x-auto-caisse", "x-auto-mecanicienne", "x-auto-portrait"],
  agro: ["sv-convoyeur", "ph-technicien", "sv-armoire"],
  ind: ["team-grind-sparks", "x-soudure", "team-grind-impact", "x-cimenterie", "ph-tuyaux", "x-elec-disjoncteur", "team-grind-front"],
};

export function photoHerosMobile(chemin: string): string | undefined {
  const slug = chemin.split("/")[2];
  if (!slug) return undefined;
  const secteur = /amazon|aktid|gls|veepee|eriks|alstef|savoye|dimomaint|ciuch|atena/.test(slug)
    ? "logi"
    : /stellantis|valeo|autoliv|jtekt|motherson|voit|vignal|bamesa/.test(slug)
      ? "auto"
      : /danone|mccain|jacquet|panetiere|salaison|bledina/.test(slug)
        ? "agro"
        : "ind";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const pool = POOL_MOBILE[secteur];
  return `/assets/web/${pool[h % pool.length]}.jpg`;
}

/** Photos de terrain migen, dernier recours de la maquette. */
const PVPH = [
  "team-duo",
  "ph-technicien",
  "ph-hero-raffinerie",
  "team-grind-front",
  "ph-tuyaux",
  "team-electric",
  "ph-robots-solaire",
  "team-grind-close",
  "team-grind-impact",
];

/** Photo propre à chaque étude : secteur du client, mêlée aux photos terrain. */
const CASE_PH: Record<string, string[]> = {
  danone: ["x-tech-portrait", "team-duo"],
  mccain: ["x-mecanique-portrait", "team-grind-front"],
  amazon: ["x-logistique-entrepot", "x-logistique-convoyeurs"],
  gls: ["x-logistique-convoyeurs", "team-electric"],
  veepee: ["x-logistique-cariste", "team-duo"],
  aktid: ["x-logistique-entrepot", "x-cimenterie"],
  alstef: ["x-logistique-convoyeurs", "x-robotique"],
  savoye: ["x-logistique-convoyeurs", "x-logistique-discussion"],
  dimomaint: ["x-logistique-tablette", "x-logistique-responsable"],
  stellantis: ["x-auto-ligne", "x-auto-caisse"],
  valeo: ["x-auto-caisse", "x-robotique"],
  autoliv: ["x-auto-mecanicienne", "x-auto-ligne"],
  eaton: ["x-auto-ligne", "x-faisceaux"],
  voit: ["x-caoutchouc-atelier", "team-grind-front"],
  suez: ["ph-tuyaux", "ph-hero-raffinerie"],
  eiffage: ["ph-robots-solaire", "x-elec-disjoncteur"],
  timescope: ["x-elec-cablage", "x-faisceaux"],
  jtekt: ["x-mecanique-portrait", "x-caoutchouc-atelier"],
  mersen: ["x-elec-disjoncteur", "x-cablerie"],
  eriks: ["x-tech-portrait", "team-grind-close"],
  fdj: ["x-elec-cablage", "team-electric"],
  ogf: ["team-grind-impact", "x-tech-portrait"],
  "orthus-ecocem": ["x-cimenterie", "x-soudure"],
  "orthus-washtec": ["x-auto-portrait", "x-auto-mecanicienne"],
  soprema: ["x-caoutchouc-bobines", "x-cimenterie"],
  vpk: ["x-caoutchouc-bobines", "x-textile-filature"],
  "groupe-atlantic": ["x-elec-portrait", "x-soudure"],
  "joint-lyonnais": ["x-caoutchouc-pieces", "x-caoutchouc-atelier"],
};

const ALL_X = [
  "x-logistique-entrepot",
  "x-logistique-convoyeurs",
  "x-logistique-cariste",
  "x-logistique-responsable",
  "x-logistique-discussion",
  "x-logistique-tablette",
  "x-auto-ligne",
  "x-auto-caisse",
  "x-auto-mecanicienne",
  "x-auto-portrait",
  "x-robotique",
  "x-faisceaux",
  "x-elec-cablage",
  "x-elec-disjoncteur",
  "x-elec-portrait",
  "x-cablerie",
  "x-cimenterie",
  "x-soudure",
  "x-mecanique-portrait",
  "x-tech-portrait",
  "x-caoutchouc-atelier",
  "x-caoutchouc-bobines",
  "x-caoutchouc-pieces",
  "x-textile-filature",
];

function cheminPhoto(nom: string): string {
  return `/assets/web/${nom}.jpg`;
}

const LOGOS: [string, string][] = [
  ["DANONE", "danone.png"],
  ["STELLANTIS", "stellantis.png"],
  ["AMAZON", "amazon.svg"],
  ["VALEO", "valeo.svg"],
  ["SAVOYE", "savoye.png"],
  ["MCCAIN", "mccain.svg"],
  ["AUTOLIV", "autoliv.svg"],
  ["EATON", "eaton.svg"],
  ["GLS", "gls.svg"],
  ["BLEDINA", "bledina.svg"],
  ["JTEKT", "jtekt.svg"],
  ["VEEPEE", "veepee.svg"],
  ["SUEZ", "suez.svg"],
  ["JACQUET BROSSARD", "jacquet-brossard.png"],
  ["MERSEN", "mersen.svg"],
  ["ALSTEF GROUP", "alstef.webp"],
  ["EIFFAGE", "eiffage.svg"],
  ["MOTHERSON", "motherson.svg"],
  ["LA PANETIERE", "la-panetiere.svg"],
  ["ERIKS", "eriks.svg"],
  ["VOIT", "voit.svg"],
  ["ECOCEM", "ecocem.png"],
  ["DIMOMAINT", "dimomaint.svg"],
  ["GROUPE ATLANTIC", "groupe-atlantic.png"],
  ["TOURNAIRE", "tournaire.png"],
  ["AKTID", "aktid.png"],
  ["SALAISONS DU MACONNAIS", "salaison-du-maconnais.png"],
  ["VIGNAL SYSTEMS", "vignal-systems.svg"],
  ["JOINT LYONNAIS", "joint-lyonnais.png"],
  ["CIUCH", "ciuch.svg"],
  ["RECTOR LESAGE", "rector-lesage.png"],
  ["BAMESA", "bamesa.png"],
  ["JELD-WEN", "jeld-wen.png"],
  ["ATENA", "atena.png"],
  ["SOPREMA", "soprema.svg"],
  ["WASHTEC", "washtec.svg"],
  ["TIMESCOPE", "timescope.png"],
  ["ORTHUS", "orthus.png"],
  ["OGF", "ogf.png"],
  ["JACQUET", "jacquet-brossard.png"],
  ["SALAISON", "salaison-du-maconnais.png"],
  ["ALSTEF", "alstef.webp"],
  ["VIGNAL", "vignal-systems.svg"],
  ["RECTOR", "rector-lesage.png"],
  ["JELD", "jeld-wen.png"],
  ["PANETI", "la-panetiere.svg"],
];

/** Le logo d'un client, par la première entrée de la table qu'il contient. */
export function logoClient(client: string): string {
  const u = client
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const trouve = LOGOS.find(([cle]) => u.includes(cle));
  return trouve ? `/assets/clients/${trouve[1]}` : "";
}

export function photosPropres(url: string): string[] {
  const cle = Object.keys(CASE_PH).find((x) => url.includes(`/preuves/${x}`));
  return cle ? CASE_PH[cle] : [];
}

/** Les photos de l'équipe Migen hors héros : un remplaçant juste pour tout
    client, quand ses photos propres sont prises. Sans elles, la cession
    retombait dans l'ordre d'ALL_X, et McCain recevait une étagère de pièces en
    caoutchouc (relecture adverse du 14/10). */
export const NEUTRES = ["team-electric", "team-grind-impact", "team-grind-sparks", "team-grind-close"];

function pool(url: string): string[] {
  const propre = photosPropres(url);
  const secteur = /amazon|gls|veepee|aktid|alstef|savoye|dimomaint/.test(url)
    ? ALL_X.filter((x) => /logistique/.test(x))
    : /stellantis|valeo|autoliv|eaton|washtec/.test(url)
      ? ALL_X.filter((x) => /auto|robot|faisceaux/.test(x))
      : /vpk|soprema|joint|voit/.test(url)
        ? ALL_X.filter((x) => /caoutchouc|textile|cablerie/.test(x))
        : /mersen|timescope|fdj|atlantic|eiffage/.test(url)
          ? ALL_X.filter((x) => /elec|cabl|faisceaux/.test(x))
          : [];
  return [...propre, ...secteur, ...ALL_X, ...PVPH].filter(
    (x, i, a) => a.indexOf(x) === i,
  );
}

/**
 * Une photo par carte, sans doublon dans la grille : `pvAssign`. Puis l'écart
 * du 14/10 : une carte tombée sur une photo du héros prend la première photo
 * de son pool qui n'en est pas, libre si possible (`PHOTOS_DU_HEROS`).
 */
function photos(urls: string[]): string[] {
  const prises = new Set<string>();
  const choix = urls.map((url) => {
    const p = pool(url);
    const pris = p.find((y) => !prises.has(y)) ?? p[0];
    prises.add(pris);
    return pris;
  });
  return choix.map((pris, i) => {
    if (!DU_HEROS.has(cheminPhoto(pris))) return cheminPhoto(pris);
    const p = [...photosPropres(urls[i]), ...NEUTRES, ...pool(urls[i])].filter(
      (y) => !DU_HEROS.has(cheminPhoto(y)),
    );
    const remplacante = p.find((y) => !prises.has(y)) ?? p[0];
    prises.add(remplacante);
    return cheminPhoto(remplacante);
  });
}

/** Couleurs du libellé de catégorie, vue « Tous », dans l'ordre des onglets. */
const COULEURS_CATEGORIE = ["#ff7c3c", "#4a4845", "#7d3309", "#737373"];

export interface CartePreuve {
  client: string;
  sujet?: string;
  resume: string;
  url: string;
  categorie: string;
  couleurCategorie: string;
  recent: boolean;
  photo: string;
  logo: string;
  /** Logos clairs sur fond clair : la maquette les inverse. */
  logoInverse: boolean;
  /** Le corpus a demandé la case mise en avant pour ce cas. */
  aLaUne: boolean;
}

export interface VuePreuves {
  libelle: string;
  nombre: number;
  /** La phrase à gauche au-dessus des cartes. */
  besoin: string;
  /** « 24 études de cas ». */
  compte: string;
  /** Vue « Tous » : la catégorie s'écrit sur chaque carte. */
  montreCategorie: boolean;
  /**
   * Les trois cartes à photo pleine, quand la vue en a plus de trois : les
   * CASES MISES EN AVANT.
   *
   * COMMENT ELLES SE CHOISISSENT. Par défaut, les trois premiers du corpus,
   * comme la maquette. Un cas que le corpus marque `aLaUne` passe devant, dans
   * l'ordre où le corpus les marque ; les autres descendent d'un rang, et
   * celui qui occupait la troisième case tombe en tête de grille. Voir
   * `CasHubPreuves.aLaUne` dans `types/casclients.ts` pour la raison du champ.
   */
  une: CartePreuve[];
  grille: CartePreuve[];
}

const BESOIN_TOUS =
  "Chaque carte ouvre l’étude complète : le besoin, ce qui a été engagé sur le terrain, le résultat.";

/** Vue 0 « Tous », puis une vue par catégorie, dans l'ordre du corpus. */
export function vuesPreuves(contenu: ContenuHubPreuves): VuePreuves[] {
  const recents = new Set(contenu.recents);
  const tous = contenu.categories.flatMap((c, ci) =>
    c.cas.map((cas) => ({ ...cas, ci })),
  );

  const vue = (
    libelle: string,
    besoin: string,
    liste: typeof tous,
    montreCategorie: boolean,
  ): VuePreuves => {
    const images = photos(liste.map((x) => x.url));
    const cartes = liste.map((x, i): CartePreuve => {
      const logo = logoClient(x.client);
      return {
        client: x.client,
        sujet: x.sujet,
        resume: x.resume,
        url: x.url,
        categorie: contenu.categories[x.ci].libelle,
        couleurCategorie: COULEURS_CATEGORIE[x.ci % COULEURS_CATEGORIE.length],
        recent: recents.has(x.url),
        photo: images[i],
        logo,
        logoInverse: /groupe-atlantic|ogf/.test(logo),
        aLaUne: x.aLaUne === true,
      };
    });
    /* LA REMONTÉE SE FAIT APRÈS L'ATTRIBUTION DES PHOTOS, et c'est volontaire :
       `photos()` rejoue `pvAssign` de la maquette sur l'ordre du corpus, une
       photo n'étant jamais reprise deux fois dans la même vue. Remonter une
       carte avant ce calcul aurait redistribué les photos de toute la vue.
       Ici chaque carte emporte la sienne, seule sa place change.
       Partition stable : sans aucun cas marqué, `rangees` vaut `cartes`. */
    const rangees = [
      ...cartes.filter((carte) => carte.aLaUne),
      ...cartes.filter((carte) => !carte.aLaUne),
    ];
    const aUne = rangees.length > 3;
    return {
      libelle,
      nombre: liste.length,
      besoin,
      compte: `${liste.length} ${liste.length > 1 ? "études de cas" : "étude de cas"}`,
      montreCategorie,
      une: aUne ? rangees.slice(0, 3) : [],
      grille: aUne ? rangees.slice(3) : rangees,
    };
  };

  return [
    vue("Tous", BESOIN_TOUS, tous, true),
    ...contenu.categories.map((c, ci) =>
      vue(
        c.libelle,
        c.besoin,
        tous.filter((x) => x.ci === ci),
        false,
      ),
    ),
  ];
}
