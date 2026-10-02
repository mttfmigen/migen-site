import type { ReactNode } from "react";
import type { Section } from "@/types/contenu";
import ChiffresCles from "./ChiffresCles";
import Cta from "./Cta";
import Deroule from "./Deroule";
import Garanties from "./Garanties";
import Heros from "./Heros";
import Objections from "./Objections";
import Offre from "./Offre";
import Preuves from "./Preuves";
import Probleme from "./Probleme";

export {
  ChiffresCles,
  Cta,
  Deroule,
  Garanties,
  Heros,
  Objections,
  Offre,
  Preuves,
  Probleme,
};

/** Un bloc reçoit la section qui le discrimine, et rien d'autre. */
export type RenduBloc<S extends Section> = (proprietes: { section: S }) => ReactNode;

/**
 * La table type de section vers composant.
 *
 * Le type mappé force deux choses à la compilation : les dix types de section
 * ont une entrée, et chaque entrée reçoit bien la section qui lui correspond.
 * Ajouter un type dans `types/contenu.ts` sans son bloc casse ici.
 *
 * Les deux appels à l'action pointent vers le même composant : ils ne diffèrent
 * que par leur habillage, que `Cta` déduit du type reçu.
 */
export const BLOCS: {
  [T in Section["type"]]: RenduBloc<Extract<Section, { type: T }>>;
} = {
  heros: Heros,
  chiffres: ChiffresCles,
  probleme: Probleme,
  offre: Offre,
  deroule: Deroule,
  garanties: Garanties,
  cta: Cta,
  preuves: Preuves,
  objections: Objections,
  ctaFinal: Cta,
};
