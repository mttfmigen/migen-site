import { accrocheDe, type BlocAccroche } from "@/components/site/blocs/resume-de-section";
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

/**
 * L'ACCROCHE DE CHAQUE SECTION, par titre, règle de la V3 (`accrocheDe`).
 *
 * Lue sur les blocs BRUTS de la fiche et non sur la vue : la vue range les
 * blocs par rôle (« la méthode », « le constat »), retire le séparateur
 * « **Intitulé.** » et remet une majuscule, alors que la V3 lit la section
 * dans l'ordre du corpus et en garde le texte tel quel (« Votre appel ou
 * votre formulaire. Rappel dans l'heure par un interlocuteur technique… »).
 */
function accrochesDe(fiche: FicheGenerique): Record<string, string> {
  const accroches: Record<string, string> = {};
  let titre: string | null = null;
  let blocs: BlocAccroche[] = [];
  const clos = () => {
    const accroche = titre === null ? undefined : accrocheDe(blocs);
    if (titre !== null && accroche && !(titre in accroches)) accroches[titre] = accroche;
  };
  for (const b of fiche.blocs) {
    if (b.type === "h2") {
      clos();
      titre = (b.text ?? "").replace(/\*\*/g, "");
      blocs = [];
    } else if (b.type === "p") blocs.push({ paragraphe: b.text });
    else if (b.type === "ul" || b.type === "ol") blocs.push({ liste: b.items ?? [] });
    else if (b.type === "table") blocs.push({ cellule: (b.rows?.[0] ?? b.head)?.[0] });
  }
  clos();
  return accroches;
}

/** La vue de la page, calculée par le code de la maquette (voir `maquette.js`). */
export function vueDe(titre: string, fiche: FicheGenerique): Vue {
  const vue = vueGenerique({ ...fiche, h1: titre }) as unknown as Vue;
  return { ...vue, accroches: accrochesDe(fiche) };
}
