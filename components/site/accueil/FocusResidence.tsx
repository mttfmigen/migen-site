import styles from "./FocusResidence.module.css";

/**
 * Focus sur l'offre migen© Résidence : photo légendée à gauche, trois points
 * numérotés à droite.
 *
 * Composant serveur. Le lien de la maquette portait `href="#"` et un verbe
 * d'éditeur (`goSurSite`) : la destination réelle n'apparaît nulle part dans
 * la fenêtre lue, elle arrive donc en prop plutôt que d'être devinée.
 */
export interface ProprietesFocusResidence {
  /**
   * Destination du bouton. `#` par défaut, c'est-à-dire inerte : à renseigner
   * avec l'URL de la page Résidence.
   */
  href?: string;
  /** Photo de la colonne de gauche. */
  image?: string;
  /** Texte alternatif de la photo. */
  imageAlt?: string;
}

const SPECIALITES: readonly string[] = [
  "Automaticien SIEMENS",
  "Automaticien Schneider",
  "Roboticien FANUC",
  "Roboticien ABB",
];

const POINTS: readonly { rang: string; titre: string; texte: string }[] = [
  {
    rang: "01",
    titre: "Sélection avancée",
    texte:
      "Notre process de sélection n’est réussi que par 10 % des techniciens qui s’y présentent.",
  },
  {
    rang: "02",
    titre: "Toutes les spécialisations",
    // Le tiret cadratin de la maquette devient une virgule : interdit de copie.
    texte:
      "Automatisme, robotique, électrotechnique, mécanique, soudure, tuyauterie, y compris par constructeur.",
  },
  {
    rang: "03",
    titre: "Vous gardez le contrôle",
    texte:
      "Vous validez chaque intervenant déployé sur votre site. L'équipe reste la vôtre, nous en portons la gestion.",
  },
];

/** Pastille de verre posée sur la photo. */
const PASTILLE: React.CSSProperties = {
  font: "500 12.5px var(--fb)",
  padding: "6px 13px",
  borderRadius: "999px",
  whiteSpace: "nowrap",
  background: "rgba(255,255,255,.18)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,.26)",
  color: "#fff",
};

export default function FocusResidence({
  // La maquette écrit « # » : sa navigation était interne à l'éditeur. La
  // valeur par défaut est désormais la vraie page de l'offre, prise dans
  // l'inventaire. Un défaut à « # » rendait le bouton inerte dès que
  // l'appelant oubliait la prop, ce qui est précisément ce qui s'est produit.
  href = "/offres/residence/",
  image = "/assets/web/sv-convoyeur.jpg",
  imageAlt = "Technicien migen sur une ligne intralogistique",
}: ProprietesFocusResidence) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          className="mg-r2" data-reveal=""
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "70px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: "var(--rad)",
              overflow: "hidden",
              height: "440px",
              background: "var(--ph)",
            }}
          >
            {/* `img` et non `next/image` : les dimensions intrinsèques du
                fichier ne sont pas connues, il n'est pas encore rapatrié. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={imageAlt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.06)",
                opacity: "var(--ph-op)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top,rgba(28,27,25,.6),rgba(28,27,25,0) 55%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "24px",
                left: "26px",
                right: "26px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {SPECIALITES.map((specialite) => (
                <span key={specialite} style={PASTILLE}>
                  {specialite}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "18px",
              }}
            >
              migen© Résidence
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 22px",
                maxWidth: "22ch",
                textWrap: "balance",
              }}
            >
              Vous constituez votre équipe. Nous la sélectionnons.
            </h2>
            <div style={{ display: "grid", gap: "18px" }}>
              {POINTS.map((point) => (
                <div key={point.rang} style={{ display: "flex", gap: "16px" }}>
                  <span
                    style={{
                      font: "600 12px var(--fb)",
                      color: "var(--acc)",
                      flex: "none",
                      width: "26px",
                      paddingTop: "3px",
                    }}
                  >
                    {point.rang}
                  </span>
                  <div>
                    <div
                      style={{
                        font: "600 16px var(--ft)",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {point.titre}
                    </div>
                    <p
                      style={{
                        font: "400 15px/1.6 var(--fb)",
                        color: "var(--ink2)",
                        margin: "4px 0 0",
                      }}
                    >
                      {point.texte}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* La maquette écrivait « Découvrir Résidence ». « découvrez » et
                sa famille sont un interdit de copie du projet. */}
            <a
              href={href}
              className={styles.boutonAccent}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                marginTop: "28px",
                padding: "14px 24px",
                borderRadius: "999px",
                background: "var(--acc)",
                color: "#fff",
                font: "600 15px var(--fb)",
              }}
            >
              Voir migen© Résidence
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
