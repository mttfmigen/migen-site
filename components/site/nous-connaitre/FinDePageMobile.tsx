import type { ReactNode } from "react";

import RepliFormulaireMobile from "@/components/site/implantation/RepliFormulaireMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import RealisationsMobile from "@/components/site/mobile/RealisationsMobile";

import s from "./mobile-apropos.module.css";

/**
 * LA FIN DE PAGE DE LA MAQUETTE MOBILE V2 sur les pages natives (/nous-connaitre/,
 * /valeurs/, /rse/, /partenaires/, /a-propos/equipe/) : « Nos réalisations »,
 * puis le mini-formulaire sombre « Être rappelé » (dc.html L138), qui porte
 * l'ancre `#etre-rappele` des bandeaux de la cadence.
 *
 * LE FORMULAIRE COMPLET N'EST PAS RETIRÉ : il se replie au téléphone derrière
 * son propre sur-titre, « Décrire mon besoin », comme sur les villes et les
 * guides (`RepliFormulaireMobile`). Le panneau « Être rappelé » l'ouvre avant
 * d'y faire défiler. Au-dessus de 880 px, la bascule n'existe pas, le rappel
 * sombre non plus : le bureau ne bouge d'aucun pixel.
 */
export default function FinDePageMobile({
  chemin,
  children,
}: {
  chemin: string;
  children: ReactNode;
}) {
  return (
    <>
      <RealisationsMobile chemin={chemin} />
      <RappelFinalMobile />
      <div className={s.formulaireReplie}>
        <RepliFormulaireMobile etiquette="Décrire mon besoin">{children}</RepliFormulaireMobile>
      </div>
    </>
  );
}
