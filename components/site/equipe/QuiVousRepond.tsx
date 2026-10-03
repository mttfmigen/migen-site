import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";

import styles from "./Equipe.module.css";
import { RELAIS } from "./equipe-donnees";
import { LARGEUR, SURTITRE, TEXTE_CARTE, VERRE_COURT } from "./habillage-equipe";

/**
 * « Qui vous répond » : la photo chiffrée à gauche, les trois relais à droite.
 * Maquette lignes 5975 à 5991.
 *
 * LA PHOTO N'EST PAS PORTÉE. La maquette la désigne par un identifiant interne
 * à l'éditeur et aucun fichier de `public/` ne correspond : le cadre garde son
 * fond `--ph`, qui est le jeton de remplacement prévu par la charte, et la
 * pastille chiffrée reste lisible. Poser une autre photo serait choisir à la
 * place du client.
 */
export default function QuiVousRepond() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
            gap: 52,
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: "var(--rad)",
              overflow: "hidden",
              aspectRatio: "4/5",
              background: "var(--ph)",
              boxShadow: "0 30px 70px -40px rgba(0,0,0,.5)",
            }}
          >
            <div
              style={{
                ...VERRE_COURT,
                position: "absolute",
                left: 22,
                bottom: 22,
                right: 22,
                padding: "18px 22px",
                borderRadius: "var(--rad-s)",
              }}
            >
              <div
                style={{
                  font: "600 calc(30px * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.05em",
                  color: "var(--acc)",
                }}
              >
                +120
              </div>
              <div
                style={{
                  font: "400 13px/1.45 var(--fb)",
                  color: "var(--ink1)",
                  marginTop: 6,
                }}
              >
                techniciens sur le terrain, rattachés à quatre agences et dix
                hubs
              </div>
            </div>
          </div>
          <div>
            <div style={SURTITRE}>Qui vous répond</div>
            <h2
              style={{
                font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.04em",
                margin: "0 0 16px",
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              De votre appel au technicien, trois personnes. Pas plus.
            </h2>
            <p
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 22px",
                maxWidth: "48ch",
              }}
            >
              Chaque intermédiaire ajoute un délai. Nous en avons retiré le plus
              possible.
            </p>
            <ol
              style={{
                display: "grid",
                gap: 10,
                marginTop: 0,
                marginBottom: 24,
                padding: 0,
                listStyle: "none",
              }}
            >
              {RELAIS.map((relais) => (
                <li
                  key={relais.rang}
                  style={{
                    ...(relais.sombre
                      ? { background: "#1c1b19", borderRadius: "var(--rad-s)" }
                      : { ...VERRE_COURT, borderRadius: "var(--rad-s)" }),
                    display: "grid",
                    gridTemplateColumns: "auto minmax(0,1fr)",
                    gap: 18,
                    padding: "18px 22px",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      font: "600 11px ui-monospace,Menlo,monospace",
                      color: "var(--acc)",
                      paddingTop: 3,
                    }}
                  >
                    {relais.rang}
                  </span>
                  <div>
                    <div
                      style={{
                        font: "600 16px var(--ft)",
                        letterSpacing: "-.02em",
                        color: relais.sombre ? "#fff" : "var(--ink)",
                        marginBottom: 4,
                      }}
                    >
                      {relais.titre}
                    </div>
                    <div
                      style={{
                        ...TEXTE_CARTE,
                        color: relais.sombre
                          ? "rgba(255,255,255,.7)"
                          : "var(--ink2)",
                      }}
                    >
                      {relais.texte}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <a
              href={ANCRE_FORMULAIRE}
              className={styles.boutonRelais}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "14px 24px",
                borderRadius: 999,
                background: "var(--acc)",
                color: "#fff",
                font: "600 14.5px var(--fb)",
                whiteSpace: "nowrap",
              }}
            >
              Parler à un chargé d&rsquo;affaires
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
