/**
 * LE SECTEUR D'ACTIVITÉ D'UN CAS CLIENT, DÉDUIT DE SA FICHE.
 *
 * POURQUOI CE FICHIER EXISTE. Les photos des pages de cas client étaient
 * choisies sans tenir compte du métier du client : ALSTEF Group, dont la fiche
 * dit « automatisation logistique, aéroports », recevait une photo de bobines
 * d'acier. Mehdi l'a signalé le 11/10 : « il faut que tu trouves le secteur
 * d'activité du cas client et que tu mettes en fonction la photo ».
 *
 * CE QU'ON NE FAIT PAS, et c'est la règle du dépôt : on ne devine pas le
 * secteur d'après ce qu'on croit savoir de l'entreprise. Amazon n'est pas
 * classé « logistique » parce que c'est Amazon, mais parce que sa fiche écrit
 * « centre logistique ORY4 ». Rien ne sort d'ailleurs que du texte de la fiche.
 *
 * LE VOCABULAIRE EST CELUI DU REGISTRE DES PHOTOS, et lui seul : les 27 thèmes
 * de `public/assets/photos/registre.json`. Un thème inventé ici ne
 * correspondrait à aucune photo et ferait échouer la répartition en silence.
 */

/** Les thèmes du registre, tels qu'ils y sont écrits. */
export type ThemePhoto =
  | "aeronautique"
  | "agro"
  | "arret-technique"
  | "auto"
  | "automatisme"
  | "bureau-etudes"
  | "chaudronnerie"
  | "chimie"
  | "cimenterie"
  | "depannage"
  | "electricite"
  | "energie"
  | "equipe"
  | "hydraulique"
  | "levage"
  | "logistique"
  | "mecanique"
  | "menuiserie"
  | "metallurgie"
  | "nucleaire"
  | "pharma"
  | "pneumatique"
  | "robotique"
  | "site-industriel"
  | "soudure"
  | "technicien"
  | "tuyauterie";

/**
 * Les mots qui désignent un secteur dans le texte d'une fiche.
 *
 * Chaque motif est ancré sur des mots entiers pour éviter les fausses prises :
 * « auto » attraperait « automatisme », « automatique » et « autoclave ».
 * Les accents sont normalisés avant la recherche, pas dans les motifs.
 */
const INDICES: readonly (readonly [ThemePhoto, RegExp])[] = [
  ["logistique", /\b(?:logistique|entrepot|entrepots|convoyeur|convoyage|colis|palettis\w*|tri postal|messagerie|supply chain)\b/],
  /*
     « AUTOMOBILE » COMPTE, SAUF QUAND C'EST UN PRODUIT POUR LES VOITURES.
     WashTec vend des « systemes de lavage automobile » : sa page recevait des
     robots de soudure de caisses, une usine automobile au lieu d'une station
     de lavage. Mehdi l'a signale le 11/10, photo a l'appui. L'exception est
     donc nommee une fois, plutot que de resserrer le motif au point de perdre
     Vignal, Motherson et Stellantis, qui sont bel et bien de l'automobile.
  */
  ["auto", /\b(?:(?<!lavage )automobiles?|vehicules?\s+(?:industriels?|electriques?|utilitaires?|produits?|assembles?)|production de vehicules|carrosserie|fonderie automobile|airbag|ceinture de securite|boite de vitesses)\b/],
  ["agro", /\b(?:agroalimentaire|agro-alimentaire|laiterie|brasserie|boulangerie|biscuiterie|salaison|charcuterie|embouteillage|conserverie|produits laitiers|panification|surgeles)\b/],
  ["pharma", /\b(?:pharmaceutique|pharmacie|salle blanche|salles blanches|cosmetique|biotech\w*|dispositif medical)\b/],
  ["chimie", /\b(?:chimie|chimique|petrochimi\w*|raffinerie|plasturgie|resine|resines|polymere|polymeres|peinture industrielle)\b/],
  ["nucleaire", /\b(?:nucleaire|centrale nucleaire|cnpe|reacteur nucleaire|zone controlee)\b/],
  ["energie", /\b(?:energie|energeti\w*|eolien\w*|photovoltaique|cogeneration|centrale thermique|reseau de chaleur|biomasse|methanisation)\b/],
  ["aeronautique", /\b(?:aeronautique|aeroport|aeroports|aerien|avion|avions|turbine aeronautique|spatial)\b/],
  ["metallurgie", /\b(?:metallurgie|siderurgie|acierie|acier|laminoir|fonderie|tolerie|galvanisation|traitement de surface)\b/],
  ["chaudronnerie", /\b(?:chaudronnerie|chaudronnier|tolerie fine|soudage de structure)\b/],
  ["cimenterie", /\b(?:cimenterie|ciments?|betons?|carriere|granulats?|platre|prefabrication beton)\b/],
  ["menuiserie", /\b(?:menuiserie|bois|scierie|panneau de bois|ameublement|parquet)\b/],
  ["tuyauterie", /\b(?:tuyauterie|tuyautage|piping|reseau de fluides|canalisation industrielle)\b/],
  ["levage", /\b(?:levage|pont roulant|ponts roulants|palan|grue|portique|portiques|manutention lourde|montage de structure)\b/],
  ["robotique", /\b(?:robot|robots|robotis\w*|robotique|cobot|bras articule)\b/],
  ["automatisme", /\b(?:automatisme|automates?|automatis\w*|automaticiens?|supervision|scada|siemens|schneider)\b/],
  ["electricite", /\b(?:electricite|electrique|armoire electrique|tgbt|haute tension|basse tension|cablage)\b/],
  ["hydraulique", /\b(?:hydraulique|verin|verins|centrale hydraulique|flexible hydraulique)\b/],
  ["pneumatique", /\b(?:pneumatique|air comprime|compresseur)\b/],
  ["soudure", /\b(?:soudure|soudage|soudeur|tig|mig|mag)\b/],
  ["mecanique", /\b(?:mecanique|roulement|roulements|reducteur|engrenage|alignement d'arbre|usinage|machine-outil|tour|fraiseuse)\b/],
];

/** Enlève les accents et met en minuscules, pour que les motifs restent simples. */
function sansAccent(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Les thèmes que le texte d'une fiche désigne, du plus fréquent au moins
 * fréquent. Rendre un tableau vide est un résultat valable : cela veut dire
 * que la fiche ne nomme aucun secteur, et la répartition doit alors retomber
 * sur son choix habituel plutôt que d'inventer.
 */
export function secteursDuTexte(texte: string): ThemePhoto[] {
  const plat = sansAccent(texte);
  const comptes = new Map<ThemePhoto, number>();
  for (const [theme, motif] of INDICES) {
    const trouves = plat.match(new RegExp(motif.source, "g"));
    if (trouves?.length) comptes.set(theme, trouves.length);
  }
  return [...comptes.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/**
 * Le texte d'une fiche de cas client sur lequel on cherche le secteur :
 * le titre, le chapeau et les libellés du bandeau, qui nomment l'activité et
 * le site. Le reste de la fiche parle surtout de l'intervention de Migen, et
 * mêlerait les thèmes de métier aux thèmes de secteur.
 */
export function texteSignifiant(fiche: {
  titre_h1?: string;
  contenu?: { client?: string; chapeau?: string; heroFiche?: { libelle?: string; valeur?: string }[] };
}): string {
  const c = fiche.contenu ?? {};
  return [
    fiche.titre_h1 ?? "",
    c.chapeau ?? "",
    ...(c.heroFiche ?? []).map((l) => `${l.libelle ?? ""} ${l.valeur ?? ""}`),
  ].join(" \n ");
}
