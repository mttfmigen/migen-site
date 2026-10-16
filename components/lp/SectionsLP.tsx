import type { SectionLP } from "@/lib/lp/pages";

import type { Contexte } from "./atomes-lp";
import { Chiffres, Logos, Urgence } from "./BandeauxLP";
import { CasClient, Contact, Hubs, Questions, Securite, TexteEtPhoto } from "./BlocsLP";
import { Etapes, Expertises, Numerotee, Offres, SectionStandard, Temoignages } from "./CartesLP";

/**
 * Les sections du gabarit `MigenLP` (maquette V3), une par `kind` de
 * `__LP` : même ordre, même dessin, mêmes alternances de fond. Le texte est
 * celui de `lib/lp/pages.json`, rendu tel quel.
 */

/* ---------------------------------------------------------- aiguillage */

/** Une section « split » qui liste au moins quatre villes sous un titre « hub » : la grille des 10 hubs. */
const estHubs = (s: SectionLP) => s.kind === "split" && /hub/i.test(s.h2 ?? "") && s.chips.length >= 4;

export function SectionLPRendue({ s, index, ctx }: { s: SectionLP; index: number; ctx: Contexte }) {
  const id = s.id ?? `lp-s${index}`;
  switch (s.kind) {
    case "logos":
      return <Logos s={s} ctx={ctx} />;
    case "stats":
      return <Chiffres s={s} />;
    case "urgence":
      return <Urgence s={s} />;
    case "features":
      return (
        <SectionStandard s={s} id={id} ctx={ctx}>
          <Expertises s={s} ctx={ctx} />
        </SectionStandard>
      );
    case "numbered":
      return (
        <SectionStandard s={s} id={id} ctx={ctx}>
          <Numerotee s={s} />
        </SectionStandard>
      );
    case "offers":
      return (
        <SectionStandard s={s} id={id} ctx={ctx}>
          <Offres s={s} ctx={ctx} />
        </SectionStandard>
      );
    case "steps":
      return (
        <SectionStandard s={s} id={id} ctx={ctx}>
          <Etapes s={s} ctx={ctx} />
        </SectionStandard>
      );
    case "quotes":
      return (
        <SectionStandard s={s} id={id} ctx={ctx}>
          <Temoignages s={s} ctx={ctx} />
        </SectionStandard>
      );
    case "split":
      return estHubs(s) ? <Hubs s={s} id={id} ctx={ctx} /> : <TexteEtPhoto s={s} id={id} ctx={ctx} />;
    case "trust":
      return <Securite s={s} id={id} ctx={ctx} />;
    case "case":
      return <CasClient s={s} id={id} ctx={ctx} />;
    case "faq":
      return <Questions s={s} id={id} ctx={ctx} />;
    case "final":
      return <Contact s={s} ctx={ctx} />;
    default:
      // Un `kind` inconnu ne s'invente pas un rendu : la porte des données
      // (verifie:lp-donnees) refuse le fichier avant d'en arriver là.
      return null;
  }
}

/** Les sections qui ne comptent pas dans l'alternance des fonds (`band` de la maquette). */
export const SECTIONS_BANDEAU = new Set(["logos", "stats", "urgence", "final"]);
