import type { CSSProperties } from "react";

import styles from "./PageOffre.module.css";

/**
 * L'ÉTIQUETTE DE LA BASCULE D'UN BLOC REPLIABLE DU GABARIT, motif de
 * `PointsOffre` et `ReferencesOffre` : le sur-titre et le `<h2>` de la capture
 * restent à leur place dans le bloc, l'étiquette répète leur texte dans la
 * bascule et n'existe que sous 880 px (`styles.etiquettePli`, masquée aussi
 * quand le bloc est déplié). Au-dessus, la bascule entière est retirée par
 * `.blocPliablePartage`, posée sur le conteneur du bloc.
 *
 * SOUS 881 PX, C'EST LE TITRE DE LA CARTE NUMÉROTÉE DE LA MAQUETTE MOBILE V2 :
 * `data-carte-surtitre` (10,5 px, gris) et `data-carte-titre` (16,5 px) lui
 * donnent la typographie de `app/globals.css` (« styles partagés de la
 * maquette mobile v2 »), qui bat les styles en ligne ci-dessous. Ceux-ci
 * (22 à 30 px, sur-titre orange) ne servent donc plus qu'entre 881 px et rien :
 * au-dessus, l'étiquette est masquée.
 */
const SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** À l'échelle des H2 du gabarit en largeur mobile. */
const TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

export default function EtiquettePli({
  surtitre,
  titre,
  couleur,
}: {
  surtitre?: string;
  titre: string;
  /** Sur un panneau sombre, le titre passe en blanc. */
  couleur?: string;
}) {
  return (
    <span data-mobile-seulement="" className={styles.etiquettePli}>
      {surtitre ? (
        <span style={SURTITRE} data-carte-surtitre="">
          {surtitre}
        </span>
      ) : null}
      <span style={couleur ? { ...TITRE, color: couleur } : TITRE} data-carte-titre="">
        {titre}
      </span>
    </span>
  );
}
