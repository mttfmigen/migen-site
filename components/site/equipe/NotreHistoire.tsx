import { JALONS } from "./equipe-donnees";
import {
  LARGEUR,
  SECTION,
  SURTITRE,
  TEXTE_CARTE,
  TITRE_CARTE,
  TITRE2,
  VERRE,
} from "./habillage-equipe";

/**
 * « Notre histoire » : trois jalons posés sur un rail horizontal.
 * Maquette lignes 5936 à 5938.
 *
 * Le rail est décoratif, il est masqué aux lecteurs d'écran. La liste est un
 * `<ol>` : l'ordre des jalons porte du sens.
 */
export default function NotreHistoire() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div style={SURTITRE}>Notre histoire</div>
          <h2 style={{ ...TITRE2, maxWidth: "24ch" }}>
            Une trajectoire courte et dense.
          </h2>
          <p
            style={{
              font: "400 16px/1.7 var(--fb)",
              color: "var(--ink2)",
              margin: "0 0 30px",
              maxWidth: "60ch",
            }}
          >
            Chaque étape a ajouté une brique au service, jamais une couche de
            complexité.
          </p>
          <div style={{ position: "relative" }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 21,
                height: 2,
                background: "var(--line)",
              }}
            />
            <ol
              className="mg-rmulti"
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 18,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {JALONS.map((jalon) => (
                <li key={jalon.repere}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: "block",
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      background: jalon.courant ? "var(--acc)" : "var(--card)",
                      border: "2px solid var(--acc)",
                      boxShadow: "0 0 0 6px var(--bg)",
                      marginBottom: 18,
                    }}
                  />
                  <div style={{ ...VERRE, padding: "22px 24px 24px" }}>
                    <div
                      style={{
                        font: "600 12px ui-monospace,Menlo,monospace",
                        color: "var(--acc)",
                        marginBottom: 8,
                      }}
                    >
                      {jalon.repere}
                    </div>
                    <div style={TITRE_CARTE}>{jalon.titre}</div>
                    <div style={TEXTE_CARTE}>{jalon.texte}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
