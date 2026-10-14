import type { ReactNode } from "react";

import BandeauRappelMobile from "./BandeauRappelMobile";
import BarreCollanteMobile from "./BarreCollanteMobile";
import PhotoCtaMobile from "./PhotoCtaMobile";
import RappelFinalMobile from "./RappelFinalMobile";
import {
  insertionApresSection,
  type VarianteConversion,
} from "./conversion-donnees";

/**
 * PAGE DE DÉMONSTRATION, NON ROUTÉE. Elle ne vit pas sous `app/` : aucune URL
 * ne la sert, elle n'existe que pour la porte
 * (`verification-conversion-mobile.tsx`), qui la rend et la mesure.
 *
 * Elle assemble la couche de conversion complète dans l'ordre de la maquette
 * (dc.html L452 à L456) sur neuf sections de contenu factices : le photo + CTA
 * tombe après la 2e, le bandeau après les 5e et 8e, le rappel en bas, la barre
 * collante par-dessus. Les sections factices sont marquées `data-demo` et
 * portent un texte d'échafaudage assumé, jamais servi : ce n'est pas de la
 * copie du site, et la porte les écarte de son contrôle de texte.
 *
 * La photo passée au photo + CTA est un fichier réel de la photothèque du
 * dépôt (`public/assets/web/`), pas une invention.
 */

export const PHOTO_DEMONSTRATION = "/assets/web/faq-offre.jpg";
export const NOMBRE_SECTIONS_DEMONSTRATION = 9;

function SectionFactice({ rang }: { rang: number }) {
  return (
    <section data-demo id={`section-demo-${rang}`}>
      <h2>{`Section de démonstration ${rang}`}</h2>
      <p>Texte d’échafaudage, jamais servi.</p>
    </section>
  );
}

export default function DemonstrationConversionMobile({
  variante = "standard",
}: {
  variante?: VarianteConversion;
}) {
  const corps: ReactNode[] = [];
  let bandeaux = 0;
  for (let rang = 1; rang <= NOMBRE_SECTIONS_DEMONSTRATION; rang += 1) {
    corps.push(<SectionFactice key={`s${rang}`} rang={rang} />);
    const insertion = insertionApresSection(rang);
    if (insertion === "photo") {
      corps.push(
        <PhotoCtaMobile
          key={`photo${rang}`}
          variante={variante}
          photoSrc={PHOTO_DEMONSTRATION}
        />,
      );
    } else if (insertion === "bandeau") {
      // Les identifiants restent uniques comme le fait l'`uid()` de la
      // maquette (dc.html L414 : « une-question », puis « une-question-2 »…).
      bandeaux += 1;
      corps.push(
        <BandeauRappelMobile
          key={`bandeau${rang}`}
          variante={variante}
          id={bandeaux === 1 ? undefined : `une-question-${bandeaux}`}
        />,
      );
    }
  }
  return (
    <main>
      {corps}
      <RappelFinalMobile variante={variante} />
      <BarreCollanteMobile variante={variante} />
    </main>
  );
}
