import Link from "next/link";

import s from "./Entete.module.css";
import { TELEPHONE_LP, TELEPHONE_SITE } from "./entete-donnees";

export interface BarreActionMobileProps {
  /**
   * Variante landing page : numéro et appel à l'action propres à la LP.
   * Faux par défaut.
   */
  landingPage?: boolean;
  /**
   * Libellé de l'appel à l'action. La maquette l'adapte à l'écran (« Demander
   * un rappel pour ce besoin » sur une page problème), d'où la prop.
   */
  libelle?: string;
  /** Cible de l'appel à l'action, si elle n'est pas le formulaire général. */
  href?: string;
}

/**
 * Barre d'action basse, motif de la maquette « Mobile ».
 *
 * Composant serveur : deux liens, aucun état. Elle ne s'affiche qu'en dessous
 * du seuil où l'îlot retrouve sa navigation complète (voir le module CSS), et
 * se place au-dessus de la zone de geste des téléphones grâce à
 * `env(safe-area-inset-bottom)` : la maquette réservait 30px en dur, ce qui
 * n'avait de sens que dans son cadre iOS d'aperçu.
 */
export default function BarreActionMobile({
  landingPage = false,
  libelle,
  href,
}: BarreActionMobileProps) {
  const telephone = landingPage ? TELEPHONE_LP : TELEPHONE_SITE;
  const cible = href ?? (landingPage ? "#lp-contact" : "/contact/");
  const texte =
    libelle ?? (landingPage ? "Obtenir un devis" : "Décrire mon besoin");

  return (
    <div
      className={s.barreAction}
      style={{
        position: "fixed",
        left: 14,
        right: 14,
        bottom: "calc(14px + env(safe-area-inset-bottom))",
        zIndex: 25,
        gap: 8,
      }}
    >
      <Link
        href={cible}
        className={s.ctaPanneau}
        style={{
          flex: 1,
          height: 54,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          font: "600 15px var(--fb)",
          boxShadow: "0 14px 30px -12px rgba(255,124,60,.8)",
        }}
      >
        {texte}
      </Link>
      <a
        href={telephone.href}
        style={{
          height: 54,
          padding: "0 18px",
          borderRadius: 999,
          background: "rgba(255,255,255,.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--gbd)",
          display: "grid",
          placeItems: "center",
          font: "600 14px var(--fb)",
          color: "var(--ink)",
        }}
      >
        Appeler
      </a>
    </div>
  );
}
