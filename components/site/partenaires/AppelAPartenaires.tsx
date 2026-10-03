import { ANCRE_FORMULAIRE_PARTENAIRES } from "./donnees";
import styles from "./AppelAPartenaires.module.css";

/**
 * Appel aux éditeurs et aux installateurs : « Proposer un partenariat ».
 *
 * Maquette `maquette/accueil-rendu.html`, lignes 6083 à 6093. Composant serveur.
 *
 * DEUX ÉCARTS ASSUMÉS PAR RAPPORT À LA MAQUETTE.
 *
 * 1. Le rembourrage bas de la section. La maquette écrit
 *    `padding:var(--sec) 0 var(--sec)` ici et `padding:0 0 var(--sec)` sur la
 *    section du formulaire qui suit. Le formulaire du dépôt
 *    (`FormulaireBasDePage`) porte son propre `var(--sec)` en haut : garder le
 *    rembourrage bas d'ici doublerait l'espace entre les deux blocs. Le total
 *    rendu reste donc exactement celui de la maquette.
 * 2. La cible du bouton. La maquette ouvre la page de contact, qui n'existe
 *    pas sur le site : le bouton mène au formulaire de cette même page, l'ancre
 *    que la maquette donne déjà au premier appel à l'action de l'écran.
 */

interface Proprietes {
  /** Cible du bouton. Par défaut, le formulaire de cette page. */
  lienProposition?: string;
}

export default function AppelAPartenaires({
  lienProposition = ANCRE_FORMULAIRE_PARTENAIRES,
}: Proprietes) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className={styles.panneau}
          style={{
            borderRadius: 36,
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
            padding: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                font: "600 calc(clamp(26px,2.6vw,38px) * var(--ts))/1.1 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 12px",
                maxWidth: "26ch",
                textWrap: "balance",
              }}
            >
              Vous éditez un outil, vous installez des lignes&nbsp;?
            </h2>
            <p
              style={{
                font: "400 16.5px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "50ch",
              }}
            >
              Nous cherchons des partenaires français dont la maintenance est le
              prolongement naturel.
            </p>
          </div>
          <a
            href={lienProposition}
            className={styles.lienAccent}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "16px 30px",
              borderRadius: 999,
              background: "var(--acc)",
              color: "#fff",
              font: "600 15.5px var(--fb)",
              flex: "none",
              boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
              transition: "filter var(--tr), transform var(--tr)",
            }}
          >
            Proposer un partenariat
          </a>
        </div>
      </div>
    </section>
  );
}
