import type { ContenuOffre } from "@/types/offre";

import { vueGenerique } from "./maquette";
import type { FicheGenerique, Vue } from "./types";

/**
 * La fiche générique d'une page, si elle en porte une.
 *
 * `contenu.generique` n'est pas déclaré dans `ContenuOffre` (types/offre.ts,
 * hors du périmètre du gabarit) : le relais disque le transmet tel quel, et ce
 * garde le lit sans élargir le type partagé.
 */
export function ficheGenerique(contenu: ContenuOffre): FicheGenerique | null {
  const g = (contenu as ContenuOffre & { generique?: unknown }).generique;
  if (!g || typeof g !== "object") return null;
  const f = g as FicheGenerique;
  return (f.mode === "vente" || f.mode === "edito") && Array.isArray(f.blocs) ? f : null;
}

/** La vue de la page, calculée par le code de la maquette (voir `maquette.js`). */
export function vueDe(titre: string, fiche: FicheGenerique): Vue {
  return vueGenerique({ ...fiche, h1: titre }) as unknown as Vue;
}
