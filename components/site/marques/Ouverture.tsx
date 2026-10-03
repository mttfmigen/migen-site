import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import { FilArianeVue } from "@/components/cocon/FilAriane";

import styles from "./PageMarques.module.css";

/**
 * Ouverture de l'écran « Marques maintenues » : fil d'Ariane, H1, chapeau et
 * les deux appels à l'action.
 *
 * Maquette, `maquette/accueil-rendu.html` lignes 2879 à 2885. Les valeurs sont
 * recopiées telles quelles. Composant serveur, aucun état.
 *
 * DEUX ÉCARTS ASSUMÉS, tous deux parce que la navigation interne de la maquette
 * n'est pas portée :
 *
 *   · le fil d'Ariane passe par `FilArianeVue`, déjà porté depuis cette même
 *     ligne 2880, qui rend un `<ol>` et respecte le contraste WCAG. Le dernier
 *     niveau n'est pas cliquable, c'est la page courante.
 *   · le bouton principal visait `#besoin` plus un `goContact` d'éditeur. Il
 *     vise ici `ANCRE_FORMULAIRE`, le formulaire monté en bas de cette page :
 *     `/contact/` répond 404 aujourd'hui, poser le lien aurait recréé le défaut
 *     que ce portage répare.
 */

/** Le bouton orange, aux valeurs de la maquette (14px 24px, sans écart d'icône). */
const BOUTON_ORANGE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 24px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

export interface ProprietesOuverture {
  /** Cible du bouton principal. */
  hrefAction: string;
}

export default function Ouverture({ hrefAction }: ProprietesOuverture) {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "56px 40px 0",
      }}
    >
      <div style={{ marginBottom: 26 }}>
        <FilArianeVue
          etapes={[
            { titre: "Expertises", path: "/expertises/" },
            { titre: "Marques maintenues", path: null },
          ]}
        />
      </div>
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: 48,
          alignItems: "end",
        }}
      >
        <div>
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 18,
            }}
          >
            Marques et constructeurs
          </div>
          <h1
            style={{
              font: "600 calc(clamp(34px,4.2vw,58px) * var(--ts))/1.04 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "18ch",
              textWrap: "balance",
            }}
          >
            Les équipements que nous maintenons déjà
          </h1>
        </div>
        <div>
          <p
            style={{
              font: "400 17px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "0 0 20px",
              maxWidth: "46ch",
            }}
          >
            Nos constructeurs, classés par famille d’équipement. Vos machines
            sont dans la liste&nbsp;? Nous avons déjà le technicien qui les
            connaît.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={hrefAction}
              className={styles.boutonAction}
              style={BOUTON_ORANGE}
            >
              Décrire mon besoin
            </a>
            <a
              href={TELEPHONE_SITE.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,.8)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                font: "600 15px var(--fb)",
                whiteSpace: "nowrap",
              }}
            >
              {TELEPHONE_SITE.affichage}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
