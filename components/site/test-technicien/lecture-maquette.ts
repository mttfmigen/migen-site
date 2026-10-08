/**
 * Lit le module « Test technique » dans la maquette autonome, sans rien
 * interpréter : le gabarit (`<sc-if value="{{ isTest }}">`) et les deux
 * tableaux de son script, `TQ` (les huit questions) et `BANDS` (les paliers).
 *
 * Utilisé par `verification-test-technicien.tsx` seulement, jamais par le
 * rendu : la maquette pèse 17 Mo et n'est pas déployée (`.vercelignore`).
 */
import { readFileSync } from "node:fs";

const MAQUETTE = new URL("../../../maquette/site-final-autonome.html", import.meta.url);

/** La ligne de la page autonome qui porte l'application, en chaîne JSON. */
const LIGNE_APPLICATION = 381;

export interface QuestionMaquette {
  d: string;
  q: string;
  o: string[];
  c: number;
  e: string;
}

/** `[seuil, titre, verdict, couleur]`, l'ordre de la maquette. */
export type PalierMaquette = [number, string, string, string];

export interface ModuleMaquette {
  /** Toute l'application, script compris, pour les règles qui ne sont pas des données. */
  application: string;
  gabarit: string;
  questions: QuestionMaquette[];
  paliers: PalierMaquette[];
}

function application(): string {
  const brut = readFileSync(MAQUETTE, "utf8").split("\n")[LIGNE_APPLICATION].trim();
  return JSON.parse(brut.slice(0, brut.lastIndexOf('"') + 1)) as string;
}

/** Le bloc `<sc-if value="{{ isTest }}">`, sc-if imbriqués équilibrés. */
function gabarit(source: string): string {
  const debut = source.indexOf('<sc-if value="{{ isTest }}"');
  if (debut < 0) throw new Error("gabarit isTest introuvable dans la maquette");
  const balise = /<sc-if\b|<\/sc-if>/g;
  balise.lastIndex = debut;
  let profondeur = 0;
  for (let m = balise.exec(source); m; m = balise.exec(source)) {
    profondeur += m[0] === "</sc-if>" ? -1 : 1;
    if (profondeur === 0) return source.slice(debut, m.index + m[0].length);
  }
  throw new Error("gabarit isTest non refermé");
}

/** Le littéral `[...]` qui suit `marqueur`, crochets équilibrés hors chaînes. */
function litteral(source: string, marqueur: string): string {
  const debut = source.indexOf(marqueur);
  if (debut < 0) throw new Error(`${marqueur} introuvable dans le script de la maquette`);
  const ouvre = source.indexOf("[", debut);
  let profondeur = 0;
  let chaine: string | null = null;
  for (let i = ouvre; i < source.length; i += 1) {
    const c = source[i];
    if (chaine) {
      if (c === "\\") i += 1;
      else if (c === chaine) chaine = null;
      continue;
    }
    if (c === '"' || c === "'") chaine = c;
    else if (c === "[") profondeur += 1;
    else if (c === "]" && --profondeur === 0) return source.slice(ouvre, i + 1);
  }
  throw new Error(`${marqueur} non refermé`);
}

/**
 * Les tableaux sont des littéraux du script de la maquette, qui concatènent
 * une constante `NB` (l'espace insécable). Ils sont évalués avec cette seule
 * constante : c'est la donnée du client, versionnée dans ce dépôt.
 */
function evalue<T>(code: string): T {
  return new Function("NB", `return ${code};`)(" ") as T;
}

export function lisModuleMaquette(): ModuleMaquette {
  const source = application();
  return {
    application: source,
    gabarit: gabarit(source),
    questions: evalue<QuestionMaquette[]>(litteral(source, "const TQ = [")),
    paliers: evalue<PalierMaquette[]>(litteral(source, "const BANDS = [")),
  };
}
