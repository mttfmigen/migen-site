import type { CSSProperties } from "react";

import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  LUEUR,
  PANNEAU,
} from "@/components/site/blocs/habillage";
import type { TypeCta } from "@/types/lignes";

import styles from "./AppelAction.module.css";

/**
 * Appel à l'action de fin de page.
 *
 * Le libellé suit `pages.cta_type` : une page de dépannage ne demande pas la
 * même chose qu'une page de recrutement. Aucun délai chiffré ni aucune
 * promesse commerciale n'est écrit ici, ce sont des interdits de rédaction du
 * projet.
 *
 * Habillage : le panneau anthracite à lueur orange qui ferme les sections dans
 * la maquette. Chaque valeur est relevée dans `maquette/accueil-rendu.html` :
 * le panneau et son remplissage ligne 5333, la rangée flexible et l'échelle du
 * titre ligne 2676, la marge d'un encart posé dans le flux ligne 2801, la lueur
 * ligne 4851. Les constantes partagées de `blocs/habillage.ts` portent déjà ces
 * déclarations, elles ne sont pas redéclarées ici.
 *
 * Composant SERVEUR : rien n'y est interactif, le survol est en CSS.
 */
const APPELS: Record<TypeCta, { titre: string; bouton: string }> = {
  devis: { titre: "Chiffrer votre besoin", bouton: "Demander un devis" },
  intervention: {
    titre: "Faire intervenir un technicien",
    bouton: "Demander une intervention",
  },
  rappel: {
    titre: "Parler à un interlocuteur",
    bouton: "Demander un rappel",
  },
  diagnostic: {
    titre: "Faire le point sur votre maintenance",
    bouton: "Demander un diagnostic",
  },
  candidature: {
    titre: "Rejoindre les équipes Migen",
    bouton: "Déposer une candidature",
  },
};

/**
 * Le remplissage reste écrit `40px 44px` et le rayon reste `var(--rad)` parce
 * que c'est ce que la maquette CALCULE à 390 px, sur un panneau de 308 px,
 * mesuré des deux côtés le 09/10.
 *
 * Ce commentaire disait l'inverse : que `globals.css` rattrapait l'un et
 * l'autre sous 760 px. C'est faux, et c'est important. La maquette sérialise
 * son attribut avec une espace (« padding: 40px 44px »), donc son propre
 * sélecteur `[style*="padding:40px 44px"]` n'atteint aucun élément chez elle.
 * Porté, il ne mordrait que sur le site, qui rendrait 24px 20px là où la
 * maquette rend 40px 44px. `globals.css` ne porte donc sciemment aucun
 * rattrapage ici, et `verification-appel-action.tsx` vérifie qu'il n'en
 * reprend pas.
 */
const ENCART: CSSProperties = {
  ...PANNEAU,
  padding: "40px 44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 36,
  flexWrap: "wrap",
  margin: "36px 0",
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(24px,2.8vw,38px) * var(--ts))/1.12 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: 0,
  maxWidth: "22ch",
  textWrap: "balance",
};

export default function AppelAction({ cta }: { cta: TypeCta }) {
  const appel = APPELS[cta];

  return (
    <aside style={ENCART}>
      {/* La lueur est décorative et ne doit jamais capter le pointeur :
          `LUEUR` porte `pointer-events: none`, sans quoi elle recouvrirait le
          coin bas droit du bouton. */}
      <div aria-hidden="true" style={LUEUR} />

      <h2 style={{ ...TITRE, position: "relative", flex: 1, minWidth: 280 }}>
        {appel.titre}
      </h2>

      <a
        href={ANCRE_FORMULAIRE}
        className={styles.boutonAction}
        style={{ ...BOUTON_ACTION, position: "relative", flex: "none" }}
      >
        {appel.bouton}
      </a>
    </aside>
  );
}
