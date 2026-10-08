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
 */

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

function pool(url: string): string[] {
  const cle = Object.keys(CASE_PH).find((x) => url.includes(`/preuves/${x}`));
  const propre = cle ? CASE_PH[cle] : [];
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

/** Une photo par carte, sans doublon dans la grille : `pvAssign`. */
function photos(urls: string[]): string[] {
  const prises = new Set<string>();
  return urls.map((url) => {
    const p = pool(url);
    const choix = p.find((y) => !prises.has(y)) ?? p[0];
    prises.add(choix);
    return cheminPhoto(choix);
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
  /** Les trois cartes à photo pleine, quand la vue en a plus de trois. */
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
      };
    });
    const aUne = cartes.length > 3;
    return {
      libelle,
      nombre: liste.length,
      besoin,
      compte: `${liste.length} ${liste.length > 1 ? "études de cas" : "étude de cas"}`,
      montreCategorie,
      une: aUne ? cartes.slice(0, 3) : [],
      grille: aUne ? cartes.slice(3) : cartes,
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
