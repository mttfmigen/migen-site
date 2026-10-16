import type { Metadata } from "next";
import Link from "next/link";

import { BOUTON_HEROS, BOUTON_VERRE, HerosServiceLP } from "@/components/lp/HerosServiceLP";
import { CadreLP } from "@/components/lp/PageLP";
import conversion from "@/components/lp/conversion-lp.module.css";
import { TELEPHONE_LP } from "@/components/site/entete-donnees";
import { ACCUEIL_LP } from "@/lib/lp/pages";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

/**
 * Une adresse inconnue sous /lp/ : 404, dans l'habillage des LP et non dans
 * celui du site. Un visiteur arrive ici par une annonce mal saisie ; il garde
 * la barre, le numéro et le pied des LP, et un bouton vers la LP France.
 *
 * Le texte est celui de la 404 du site (`app/not-found.tsx`), le bouton celui
 * de la page /lp/merci/ (« Retour à l'accueil ») : rien d'écrit pour l'occasion.
 */
export default function LandingPageIntrouvable() {
  return (
    <CadreLP libelleCta="Demander un devis">
      <HerosServiceLP
        photo="/assets/web/x-auto-caisse.jpg"
        surtitre="Page introuvable"
        titre="Cette page n’existe pas"
        chapo="L’adresse demandée ne correspond à aucune page du site. Le lien suivi est peut-être incomplet, ou la page a changé d’adresse."
        actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
            <Link href={ACCUEIL_LP} className={conversion.envoi} style={BOUTON_HEROS}>
              Retour à l’accueil <span aria-hidden="true">→</span>
            </Link>
            <a href={TELEPHONE_LP.href} style={BOUTON_VERRE}>
              Appeler le {TELEPHONE_LP.affichage}
            </a>
          </div>
        }
      />
    </CadreLP>
  );
}
