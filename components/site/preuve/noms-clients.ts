/**
 * LES NOMS DE CLIENTS EN CASSE NORMALE, comme la maquette V3 (16/10) les écrit
 * au téléphone : « Savoye : alliance intralogistique » et non « Étude de cas
 * SAVOYE : … », « Aktid » et non « AKTID ».
 *
 * Porté du calcul de la V3 (`niceName`, `caseLbl`, `caseHead` du composant
 * mobile), jamais rédigé : la table vient de son `NICE`, à deux écarts près,
 * tous deux vers le site.
 *   - « Orthus » n'y est pas : le site dit « Migen Travaux » (décision du
 *     09/10), et `appliqueDecisions` l'a déjà réécrit avant d'arriver ici.
 *   - « Salaison du Mâconnais », sans « s » : c'est la graphie du site (55
 *     occurrences). La V3 ajoute un « s », ce qui n'est pas une affaire de
 *     casse.
 * Un nom absent de la table garde ses mots de quatre lettres ou moins en
 * capitales (GLS, OGF, VPK, IWT) et passe les autres en initiale capitale,
 * règle de la V3. Un nom qui n'est pas tout en capitales (« McCAIN »,
 * « Migen Travaux x ECOCEM ») n'est pas touché.
 *
 * MOBILE SEULEMENT dans ses usages : au bureau, la V3 garde les capitales.
 * Module neutre, sans directive : serveur et portes l'importent.
 */

const NOMS: Readonly<Record<string, string>> = {
  aktid: "Aktid",
  alstef: "Alstef",
  "alstef-group": "Alstef Group",
  amazon: "Amazon",
  atena: "Atena",
  autoliv: "Autoliv",
  bamesa: "Bamesa",
  bledina: "Blédina",
  ciuch: "Ciuch",
  danone: "Danone",
  "danone-bledina": "Danone (Blédina)",
  dimomaint: "DimoMaint",
  eaton: "Eaton",
  ecocem: "Ecocem",
  eiffage: "Eiffage",
  engel: "Engel",
  eriks: "ERIKS",
  fdj: "FDJ",
  gls: "GLS",
  "group-atlantic": "Groupe Atlantic",
  "groupe-atlantic": "Groupe Atlantic",
  "jacquet-brossard": "Jacquet Brossard",
  jeld: "Jeld-Wen",
  "jeld-wen": "Jeld-Wen",
  "joint-lyonnais": "Joint Lyonnais",
  jtekt: "JTEKT",
  "la-panetiere": "La Panetière",
  mccain: "McCain",
  mersen: "Mersen",
  motherson: "Motherson",
  ogf: "OGF",
  rector: "Rector Lesage",
  "rector-lesage": "Rector Lesage",
  "salaison-du-maconnais": "Salaison du Mâconnais",
  "salaisons-du-maconnais": "Salaison du Mâconnais",
  savoye: "Savoye",
  soprema: "Soprema",
  stellantis: "Stellantis",
  suez: "Suez",
  "suez-iwt": "Suez IWT",
  timescope: "Timescope",
  tournaire: "Tournaire",
  valeo: "Valeo",
  veepee: "Veepee",
  vignal: "Vignal Systems",
  "vignal-systems": "Vignal Systems",
  voit: "Voit",
  vpk: "VPK",
  washtec: "WashTec",
};

const cle = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** `niceName` de la V3 : « SAVOYE » → « Savoye », « McCAIN » inchangé. */
export function nomClient(brut: string): string {
  const nom = brut.trim();
  if (!nom || nom !== nom.toUpperCase()) return nom;
  return (
    NOMS[cle(nom)] ??
    nom
      .split(/\s+/)
      .map((mot) => (mot.length <= 4 ? mot : mot.charAt(0) + mot.slice(1).toLowerCase()))
      .join(" ")
  );
}

/**
 * `cleanCase` de la V3, mot pour mot : la V3 mobile y passe chaque segment du
 * corps (`segV`, `strict`) et chaque accroche de carte fermée (`teaseOf`).
 * « AKTID a confié » → « Aktid a confié », « celles d'AKTID, » → « celles
 * d'Aktid, ». En `strict`, seul un nom de la table change ; sans, une tête
 * « MOT : » de plus de quatre capitales passe aussi par `nomClient`. Les
 * sigles absents de la table (SNCF, SIEMENS) ne bougent pas.
 */
export function casseNormale(texte: string, strict = false): string {
  let x = texte.replace(/^(\s*)Étude de cas\s+/i, "$1");
  const tr = x.trim();
  if (tr && tr === tr.toUpperCase() && NOMS[cle(tr)]) return x.replace(tr, NOMS[cle(tr)]);
  x = x.replace(/(^|[^A-Za-zÀ-ÿ])([A-ZÀ-Ý]{5,})(?=$|[^A-Za-zÀ-ÿ])/g, (m, p, w) => p + (NOMS[cle(w)] ?? w));
  return x.replace(/^(\s*)([A-ZÀ-Ý0-9&'’(). -]{2,40}?)(\s:\s)/, (m, sp, a, b) => {
    const v = NOMS[cle(a)];
    if (v) return sp + v + b;
    return !strict && a.trim().length > 4 && a === a.toUpperCase() ? sp + nomClient(a.trim()) + b : m;
  });
}

/** Le h1 d'une étude découpé comme `caseHead` de la V3. */
export interface EnteteCas {
  /** « Savoye », vide si le h1 n'a pas la forme « CLIENT : titre ». */
  readonly client: string;
  /** « Une alliance pour… », initiale capitale (titre de carte). */
  readonly titre: string;
  /** « Savoye : une alliance pour… » (H1 mobile, fil d'Ariane). */
  readonly complet: string;
}

/** `caseHead` de la V3 : « Étude de cas SAVOYE : une alliance… ». */
export function enteteCas(h1: string): EnteteCas {
  const x = h1.replace(/\s+/g, " ").replace(/^Étude de cas\s*/i, "").trim();
  const i = x.indexOf(" : ");
  if (i <= 0 || i >= 40) return { client: "", titre: x, complet: x };
  const client = nomClient(x.slice(0, i));
  const reste = x.slice(i + 3).trim();
  return {
    client,
    titre: reste.charAt(0).toUpperCase() + reste.slice(1),
    complet: `${client} : ${reste}`,
  };
}

/** `caseLbl` de la V3 : le libellé d'un lien vers une étude. */
export const libelleCas = (h1: string): string => enteteCas(h1).complet;
