import type { ReactNode } from "react";

import { entreeDe, gabaritDe } from "@/components/site/cocon/maillage-mobile";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import {
  ID_RAPPEL_FINAL,
  type LibelleCible,
} from "@/components/site/mobile/conversion-donnees";

/**
 * LA CADENCE DE CONVERSION MOBILE, POSÉE SUR LES DEUX GABARITS D'OFFRE
 * (`PageOffre`, `PageOffres`), qui la montent de la même façon.
 *
 * LE GABARIT VIENT DE L'INDEX DU CLIENT (`maquette/contenu/site/index.json`),
 * pas du composant : `PageOffre` sert aussi `/secteurs/`, que l'index range
 * au gabarit 10. Hors index, « 03 », celui de la famille.
 *
 * LE BOUTON DU PHOTO + CTA est celui de la page quand la maquette en a un
 * (dc.html L412, `P.cta`) : le bouton d'action du héros, quand il vise un
 * formulaire de la page (une ancre). `#besoin`, le panneau du héros, devient
 * `#mgx-form`, le formulaire de bas de page : depuis le milieu de la page,
 * l'appel descend vers le formulaire au lieu de remonter au héros. Un bouton
 * d'action qui ne mène pas à un formulaire (« Les cinq offres », vers
 * `/offres/`) n'est pas un appel : le photo + CTA garde alors celui de la
 * maquette, « Décrire mon besoin ».
 *
 * `rappelFinal={false}` : voir `AncreRappel`.
 *
 * Sans chemin, aucune cadence : la page rend ses sections telles quelles.
 */
export default function CadenceOffre({
  chemin,
  actions,
  children,
}: {
  chemin?: string;
  actions: readonly LibelleCible[];
  children: ReactNode;
}) {
  if (!chemin) return <>{children}</>;
  const entree = entreeDe(chemin);
  const action = actions.find((a) => a.href.startsWith("#"));
  return (
    <AvecConversionMobile
      chemin={chemin}
      gabarit={entree ? gabaritDe(entree) : "03"}
      bouton={
        action
          ? { libelle: action.libelle, href: action.href === "#besoin" ? "#mgx-form" : action.href }
          : undefined
      }
      rappelFinal={false}
    >
      {children}
    </AvecConversionMobile>
  );
}

/**
 * LE RAPPEL FINAL DE LA MAQUETTE, C'EST « 10 APPEL FINAL ». La maquette ferme
 * la page sur un mini-formulaire « Être rappelé » (dc.html L138) ; ces
 * gabarits se ferment déjà sur leur formulaire complet. La cadence ne pose
 * donc pas le sien (`rappelFinal={false}`) : deux formulaires de suite n'en
 * feraient pas un meilleur.
 *
 * Le bandeau « Être rappelé » vise `#etre-rappele` (dc.html L437) : cette
 * ancre, posée juste avant l'appel final, l'y amène. Mobile seulement, comme
 * le bandeau. Elle n'est posée ni SUR la section, qui porte déjà `mgx-form`,
 * ni AUTOUR, ce qui la sortirait des enfants directs du `<main>` que compte la
 * porte G17 (`scripts/verifie-offre-rendu.mjs`).
 */
export function AncreRappel({ chemin }: { chemin?: string }) {
  if (!chemin) return null;
  return <div id={ID_RAPPEL_FINAL} data-mobile-seulement="" style={{ scrollMarginTop: 90 }} />;
}
