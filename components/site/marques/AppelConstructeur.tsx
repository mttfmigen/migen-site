import styles from "./PageMarques.module.css";

/**
 * Le panneau anthracite qui ferme l'écran : « Votre constructeur n'est pas dans
 * la liste ? Dites-nous lequel. »
 *
 * Maquette, `maquette/accueil-rendu.html` lignes 2920 à 2922. Composant serveur.
 *
 * La phrase est rendue dans un `div` et non un titre : la maquette l'écrit
 * ainsi, et la page n'a qu'une hiérarchie, celle de son `h1`.
 */

export interface ProprietesAppelConstructeur {
  /** Cible du bouton. */
  hrefAction: string;
}

export default function AppelConstructeur({
  hrefAction,
}: ProprietesAppelConstructeur) {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "var(--sec) 40px var(--sec)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          padding: "30px 34px",
          borderRadius: 32,
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            font: "600 calc(clamp(20px,2.2vw,28px) * var(--ts))/1.25 var(--ft)",
            letterSpacing: "-.03em",
            color: "#fff",
            maxWidth: "34ch",
          }}
        >
          Votre constructeur n’est pas dans la liste&nbsp;? Dites-nous lequel.
        </div>
        <a
          href={hrefAction}
          className={styles.boutonAction}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "14px 24px",
            borderRadius: 999,
            background: "var(--acc)",
            color: "#fff",
            font: "600 15px var(--fb)",
            whiteSpace: "nowrap",
          }}
        >
          Décrire mon besoin
        </a>
      </div>
    </section>
  );
}
