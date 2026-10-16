import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import { realisationsLiees } from "@/components/site/preuve/donnees-mobiles";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";

/**
 * « NOS RÉALISATIONS », le bloc que la maquette mobile v2 pose en fin de page
 * à propos, juste avant la carte `#etre-rappele` (dc.html L469 et L482,
 * `refsSec` hors gabarit 02).
 *
 * Les cartes sont celles de dc.html L425-426 : `cas-lies.json` n'a aucune clé
 * pour /nous-connaitre/, /valeurs/, /rse/, /partenaires/ ni /a-propos/equipe/
 * (relu le 15/10), donc le repli s'applique, les six premières études de cas
 * de l'index. `realisationsLiees` porte ce calcul, avec les vrais titres, les
 * logos et les photos que le hub /preuves/ sert déjà : rien d'inventé.
 *
 * MOBILE SEULEMENT : `CarrouselRealisations` porte `data-mobile-seulement`,
 * masqué au-dessus de 880 px par `app/globals.css`. Le bureau ne change pas.
 * L'enveloppe `.realisations` ramène le titre aux 20 px de la maquette.
 */
export default function RealisationsMobile({ chemin }: { chemin: string }) {
  return (
    <div className={mobile.realisations}>
      <CarrouselRealisations cartes={realisationsLiees(chemin)} titre="Nos réalisations" />
    </div>
  );
}
