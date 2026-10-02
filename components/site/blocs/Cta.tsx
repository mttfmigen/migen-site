import type { SectionCta, SectionCtaFinal } from "@/types/contenu";
import styles from "./Blocs.module.css";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  LARGEUR,
  LUEUR,
  PANNEAU,
  SECTION,
  SURTITRE,
  VERRE,
} from "./habillage";

/**
 * Sections 7 et 10 du gabarit : l'appel à l'action, introduit par une question
 * de besoin, avec le téléphone visible.
 *
 * Un seul fichier pour les deux : même matière, seul l'habillage change. Le CTA
 * de milieu de page est en verre, le final sur le panneau anthracite, pour que
 * la fin de page pèse plus que son milieu. Deux composants jumeaux auraient
 * dérivé l'un de l'autre au premier ajustement.
 */
export default function Cta({
  section,
}: {
  section: SectionCta | SectionCtaFinal;
}) {
  const final = section.type === "ctaFinal";

  return (
    <section
      style={final ? { padding: "var(--sec) 0 var(--sec)" } : SECTION}
    >
      <div style={LARGEUR}>
        <div
          style={{
            ...(final ? PANNEAU : VERRE),
            borderRadius: 36,
            padding: "40px 44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 36,
            flexWrap: "wrap",
            ...(final ? { position: "relative", overflow: "hidden" } : null),
          }}
        >
          {final ? <div style={LUEUR} /> : null}

          <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
            <div style={{ ...SURTITRE, marginBottom: 10 }}>Prochaine étape</div>
            <h2
              style={{
                font: "600 calc(clamp(22px,2.4vw,32px) * var(--ts))/1.14 var(--ft)",
                letterSpacing: "-.04em",
                color: final ? "#fff" : "var(--ink)",
                margin: "0 0 10px",
                maxWidth: "26ch",
                textWrap: "balance",
              }}
            >
              {section.question}
            </h2>
            {section.rappel ? (
              <p
                style={{
                  font: "400 15px/1.65 var(--fb)",
                  color: final ? "rgba(255,255,255,.72)" : "var(--ink2)",
                  margin: 0,
                  maxWidth: "56ch",
                }}
              >
                {section.rappel}
              </p>
            ) : null}
          </div>

          <a
            href={section.href ?? ANCRE_FORMULAIRE}
            className={styles.boutonAction}
            style={{
              ...BOUTON_ACTION,
              padding: "16px 28px",
              flex: "none",
              position: "relative",
            }}
          >
            {section.bouton}
          </a>
        </div>
      </div>
    </section>
  );
}
