import PanneauFormulaire from "@/components/site/offre/PanneauFormulaire";

import stylesVille from "./PageVille.module.css";
import RepliFormulaireMobile from "./RepliFormulaireMobile";

/**
 * LE PANNEAU DE FORMULAIRE DU HÉROS, REPLIÉ AU TÉLÉPHONE ET JAMAIS RETIRÉ (G2),
 * pour le gabarit ville et le hub `/implantations/`.
 *
 * Mesure du 14/10 à 390 px : 1 141 px des 1 850 px du héros, là où la maquette
 * mobile v2 n'a PAS de formulaire dans son héros (son mini-formulaire vit en
 * bas de page, et ces pages gardent le leur dans « 10 Appel final »). Le
 * formulaire entier reste dans le HTML servi ; `RepliFormulaireMobile` le
 * referme au chargement sous 881 px.
 *
 * L'ANCRE `#besoin` RESTE ATTEINTE : les boutons de la page qui la visent
 * rouvrent le bloc, par `OuvreLaCible` (monté par la page), sur tous les
 * moteurs et pas seulement ceux qui rouvrent seuls un `<details>` ancêtre.
 */
export interface PanneauHerosRepliableProps {
  /** L'identifiant d'analyse du formulaire de la page, sans le suffixe. */
  formulaire: string;
  titre: string;
  pastille?: string;
}

export default function PanneauHerosRepliable({ formulaire, titre, pastille }: PanneauHerosRepliableProps) {
  return (
    /* `panneauHeros` : masqué au téléphone tant qu'on ne le vise pas
       (`PageVille.module.css`) ; la maquette n'a pas de formulaire en tête. */
    <div className={stylesVille.panneauHeros} style={{ position: "relative" }}>
      <RepliFormulaireMobile etiquette={titre}>
        <PanneauFormulaire id="besoin" formulaire={`${formulaire}-hero`} titre={titre} pastille={pastille} />
      </RepliFormulaireMobile>
    </div>
  );
}
