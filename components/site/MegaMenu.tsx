import PanneauApropos from "./megamenu/Apropos";
import PanneauExpertises from "./megamenu/Expertises";
import PanneauOffres from "./megamenu/Offres";
import PanneauPreuves from "./megamenu/Preuves";
import PanneauRessources from "./megamenu/Ressources";
import type { PanneauId } from "./entete-donnees";

export interface MegaMenuProps {
  /** Panneau affiché. Le composant n'est monté que lorsqu'il y en a un. */
  panneau: PanneauId;
  /** Cible du « Diagnostic gratuit », absente de l'inventaire d'URL. */
  hrefDiagnostic?: string;
  /** Nom accessible du feuillet : le libellé de l'entrée qui l'a ouvert. */
  libelle: string;
}

/**
 * Feuillet de verre dépoli des mega-menus, et aiguillage vers son panneau.
 *
 * Sans état : l'en-tête décide lequel est ouvert. L'identifiant du feuillet est
 * celui que les boutons de la barre déclarent en `aria-controls`.
 */
export default function MegaMenu({
  panneau,
  hrefDiagnostic,
  libelle,
}: MegaMenuProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "100%",
        pointerEvents: "auto",
        width: "min(1100px,calc(100vw - 48px))",
        paddingTop: 9,
      }}
    >
      <div
        id="mg-megamenu"
        aria-label={libelle}
        style={{
          borderRadius: 30,
          background: "var(--sheet)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid var(--gbd)",
          boxShadow:
            "0 1px 1px rgba(0,0,0,.04),0 34px 70px -28px rgba(0,0,0,.42)",
          padding: "30px 34px 34px",
        }}
      >
        {panneau === "offres" && (
          <PanneauOffres hrefDiagnostic={hrefDiagnostic} />
        )}
        {panneau === "expertises" && <PanneauExpertises />}
        {panneau === "preuves" && <PanneauPreuves />}
        {panneau === "ressources" && <PanneauRessources />}
        {panneau === "apropos" && <PanneauApropos />}
      </div>
    </div>
  );
}
