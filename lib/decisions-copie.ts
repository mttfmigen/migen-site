/**
 * Les écarts de copie à la maquette DÉCIDÉS par Mehdi, en un seul endroit.
 *
 * La maquette fait foi mot pour mot, sauf pour ces phrases-là. Les fiches les
 * portent déjà corrigées ; les contrôles appliquent `appliqueDecisions` au texte
 * de la capture avant de le comparer au rendu, pour que la décision soit
 * vérifiée des deux côtés au lieu d'être déclarée page par page.
 *
 * 08/10, « 10 % des techniciens » : le README de passation dit « seuls 10 % des
 * techniciens réussissent notre process de sélection… Ne pas parler de
 * candidats ». Seule l'affirmation de la sélection change : « candidats » reste
 * là où il désigne celui qui postule (pages métier), un soumissionnaire (cahier
 * des charges) ou le marché de l'emploi.
 *
 * 07/10, « le siège est à Écully » : la maquette le place encore à Limonest.
 * Seule la mention de Limonest change ; « siège à Lyon », « siège lyonnais »
 * restent, Écully étant dans la métropole lyonnaise et Lyon l'agence du siège
 * selon le README.
 */

type Regle = [RegExp, (...groupes: string[]) => string];

const SELECTION: Regle[] = [
  [/\b([Cc])andidats(\s+(?:sont\s+)?retenus)\b/g, (_, c, fin) => `${c === "C" ? "T" : "t"}echniciens${fin}`],
  [/\b(\d+\s?%\s+des\s+)candidats\b/g, (_, debut) => `${debut}techniciens`],
  [/\b(Des\s+)candidats(\s+franchissent)\b/g, (_, debut, fin) => `${debut}techniciens${fin}`],
  [/\b(un\s+)candidat(\s+(?:retenu\s+)?sur\s+dix)/g, (_, debut, fin) => `${debut}technicien${fin}`],
  // « chaque candidat » seulement quand la même proposition parle de la sélection.
  [/\b([Cc]haque\s+)candidat\b(?=[^.;]*?(?:10\s?%|retenu|sélection|évalu|entretien|épreuve))/g, (_, debut) => `${debut}technicien`],
];

const SIEGE: Regle[] = [
  [/siège à Limonest et bureaux à Écully/g, () => "siège à Écully"],
  [/\(siège, à Limonest et Écully\)/g, () => "(siège, à Écully)"],
  [/(siège est à Lyon), sur Limonest et Écully,/g, (_, debut) => `${debut}, à Écully,`],
  [/(siège est à Lyon) \(Limonest, bureaux à Écully\)/g, (_, debut) => `${debut} (Écully)`],
  [/pilote son activité depuis Limonest, avec des bureaux à Écully\./g, () => "pilote son activité depuis son siège d’Écully."],
  [/Siège · Limonest et Écully/g, () => "Siège · Écully"],
  [/siège Migen à Limonest/g, () => "siège Migen à Écully"],
];

const REGLES = [...SELECTION, ...SIEGE];

/** Le texte tel que le site doit le rendre, à partir de celui de la maquette. */
export function appliqueDecisions(texte: string): string {
  return REGLES.reduce((t, [motif, vers]) => t.replace(motif, vers), texte);
}

/** Les mots du contrat que le site ne rend jamais (voir scripts/verifie-interdits.mjs). */
const INTERDITS =
  /sans\s+engagement|\br[ée]gie\b|sur[\s-]mesure|int[ée]rim|mise\s+[àa]\s+disposition|cl[ée]\s+en\s+main|\bagences?\s+en\s+France|\b24\s*h\b|\b24\s*\/\s*(?:24|7)\b|\b7\s*j?\s*\/\s*7\b|\u2014/i;

/**
 * Pour un texte qui ne vient pas d'une capture (la table `seo` de la base) :
 * les décisions, puis chaque phrase qui porte un interdit retirée entière.
 */
export function copieConforme(texte: string): string {
  return (appliqueDecisions(texte).match(/[^.!?]+(?:[.!?]+|$)\s*/g) ?? [])
    .filter((phrase) => !INTERDITS.test(phrase))
    .join("")
    .trim();
}
