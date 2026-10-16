import Link from "next/link";

import { TELEPHONE_LP } from "@/components/site/entete-donnees";

import styles from "./conversion-lp.module.css";
import { BOUTON_ORANGE, BOUTON_VERRE, HerosServiceLP } from "./HerosServiceLP";

/**
 * /lp/merci/ : le texte de la page `/fr/merci` de `window.__LP` (maquette V3),
 * filtré par les règles de copie du site. Tout y passe tel quel : « dans
 * l'heure » est le seul délai autorisé, « Remplacement garanti » est déjà sur
 * le site (accueil, GrilleOffres). Titre et description de la page : ceux de
 * `lib/lp/pages.json`, comme toutes les LP (app/lp/[[...slug]]/page.tsx).
 *
 * Le bouton principal ramène à la LP France, comme `mainHref` de la maquette.
 */

const POINTS = [
  "Réponse dans l’heure",
  "Un seul interlocuteur dédié",
  "Remplacement garanti Migen",
] as const;

export function MerciLP() {
  return (
    <HerosServiceLP
      photo="/assets/web/x-auto-caisse.jpg"
      surtitre="Demande qualifiée"
      titre="Votre demande a bien été reçue"
      chapo="Un expert Migen analyse votre besoin et vous recontacte dans l’heure. Pour un échange immédiat, appelez-nous directement."
      points={POINTS}
      actions={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
          <Link href="/lp/maintenance-industrielle-france/" className={styles.envoi} style={BOUTON_ORANGE}>
            Retour à l’accueil <span aria-hidden="true">→</span>
          </Link>
          <a href={TELEPHONE_LP.href} style={BOUTON_VERRE}>
            Appeler le {TELEPHONE_LP.affichage}
          </a>
        </div>
      }
    />
  );
}
