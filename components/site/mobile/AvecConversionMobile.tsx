import { Children, type ReactNode } from "react";

import BandeauRappelMobile from "./BandeauRappelMobile";
import PhotoCtaMobile from "./PhotoCtaMobile";
import RappelFinalMobile from "./RappelFinalMobile";
import {
  ID_BANDEAU,
  insertionApresSection,
  laCadenceSApplique,
  photoCtaPour,
  rappelFinalVisible,
  varianteDe,
  type LibelleCible,
} from "./conversion-donnees";

/**
 * LA CADENCE DE LA MAQUETTE MOBILE V2, posée entre les sections d'une page.
 *
 *   <AvecConversionMobile chemin={chemin} gabarit="03">
 *     <SectionUn /> <SectionDeux /> …
 *   </AvecConversionMobile>
 *
 * Les ENFANTS sont les sections de CONTENU de la page, dans l'ordre (le héros
 * et le formulaire de bas de page n'en sont pas : dc.html compte `nD`, les
 * sections du corpus). Après la 2e, le photo + CTA ; après la 5e, la 8e, la
 * 11e…, le bandeau « Être rappelé » ; en bas, le rappel final si `rappelFinal`
 * (la page qui porte déjà un formulaire de bas de page peut le poser elle-même
 * à sa place, voir `RappelFinalMobile`).
 *
 * TOUT CE QUI EST AJOUTÉ PORTE `data-mobile-seulement` : au-delà de 880 px,
 * `app/globals.css` le masque, et le rendu bureau ne bouge d'aucun pixel. Les
 * sections, elles, passent telles quelles : rien n'est retiré, rien n'est
 * réordonné.
 *
 * Composant serveur, module sans directive : il est appelé par les pages, qui
 * sont des composants serveur (piège payé le 14/10, voir conversion-donnees).
 */
export interface AvecConversionMobileProps {
  /** Le chemin de la page, `/offres/residence/`. */
  chemin: string;
  /** Le gabarit de `maquette/contenu/site/index.json`, « 03 » pour une offre. */
  gabarit: string;
  /** La photo du héros, écartée du tirage du photo + CTA. */
  photoHeros?: string;
  /** Le CTA propre de la page (dc.html `P.cta`), sinon « Décrire mon besoin ». */
  bouton?: LibelleCible;
  /** Faux quand la page pose elle-même le rappel final. Vrai par défaut. */
  rappelFinal?: boolean;
  children: ReactNode;
}

export default function AvecConversionMobile({
  chemin,
  gabarit,
  photoHeros,
  bouton,
  rappelFinal = true,
  children,
}: AvecConversionMobileProps) {
  const variante = varianteDe(chemin, gabarit);
  const cadence = laCadenceSApplique(gabarit, chemin);
  const sortie: ReactNode[] = [];
  let bandeaux = 0;

  Children.toArray(children).forEach((section, i) => {
    sortie.push(section);
    if (!cadence) return;
    const insertion = insertionApresSection(i + 1);
    if (insertion === "photo") {
      sortie.push(
        <PhotoCtaMobile
          key="conversion-photo"
          photoSrc={photoCtaPour(chemin, photoHeros)}
          variante={variante}
          bouton={bouton}
        />,
      );
    } else if (insertion === "bandeau") {
      bandeaux += 1;
      // dc.html `uid("une-question")` : le premier garde le nom nu, les
      // suivants prennent un suffixe, pour qu'aucun identifiant ne se répète.
      sortie.push(
        <BandeauRappelMobile
          key={`conversion-bandeau-${bandeaux}`}
          variante={variante}
          id={bandeaux === 1 ? ID_BANDEAU : `${ID_BANDEAU}-${bandeaux}`}
        />,
      );
    }
  });

  if (rappelFinal && rappelFinalVisible(chemin)) {
    sortie.push(<RappelFinalMobile key="conversion-rappel" variante={variante} />);
  }

  return <>{sortie}</>;
}
