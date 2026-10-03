import Link from "next/link";
import type { CSSProperties } from "react";

/**
 * « Nos agences » : la liste des implantations.
 * Porté de `maquette/accueil-rendu.html`, lignes 3012 à 3021.
 *
 * DEUX ÉCARTS À LA MAQUETTE, tous les deux imposés.
 *
 * 1. La maquette annonçait « Cinq agences en France, deux à l'international »
 *    et listait Écully, Paris, Strasbourg, Nantes, Toulouse. Le contrat de
 *    projet tient quatre agences, Lyon (siège, à Limonest), Montréal, Dubaï et
 *    Madrid, plus dix hubs de techniciens. Les villes françaises listées sont
 *    des hubs, pas des agences, et l'adresse d'Écully est l'ancienne du siège.
 * 2. La carte interactive de la maquette (`x-import MigenAgences`) demande une
 *    bibliothèque de cartographie que le contrat interdit d'installer. La liste
 *    prend donc toute la largeur, et le lien vers les implantations tient le
 *    rôle de navigation que la carte assurait.
 */

interface Agence {
  readonly nom: string;
  /** Vide quand la maquette n'en donne aucune : rien d'inventé. */
  readonly adresse: string;
}

const AGENCES: readonly Agence[] = [
  { nom: "Siège, Limonest", adresse: "1 rue des Vergers, Bâtiment 3, 69760 Limonest" },
  { nom: "Dubaï", adresse: "Level 20, 48 Burj Tower, Downtown" },
  { nom: "Montréal", adresse: "2020 route Transcanadienne, Dorval, Québec" },
  { nom: "Madrid", adresse: "" },
];

const RANGEE: CSSProperties = {
  padding: "16px 0",
  borderTop: "1px solid var(--line)",
};

export default function Agences() {
  return (
    <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 56,
              alignItems: "end",
              marginBottom: 34,
            }}
          >
            <div>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 16,
                }}
              >
                Nos agences
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: 0,
                  maxWidth: "22ch",
                  textWrap: "balance",
                }}
              >
                Quatre agences, dix hubs de techniciens.
              </h2>
            </div>
            <p
              style={{
                font: "400 16.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "46ch",
              }}
            >
              Le technicien part du hub le plus proche de votre site, jamais du
              siège.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
              borderRadius: "var(--rad)",
              padding: "12px 30px 18px",
            }}
          >
            {AGENCES.map((agence) => (
              <div key={agence.nom} style={RANGEE}>
                <div
                  style={{
                    font: "600 15px var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {agence.nom}
                </div>
                {agence.adresse ? (
                  <div
                    style={{
                      font: "400 13.5px/1.55 var(--fb)",
                      color: "var(--ink3)",
                      marginTop: 3,
                    }}
                  >
                    {agence.adresse}
                  </div>
                ) : null}
              </div>
            ))}
            <div style={RANGEE}>
              <Link
                href="/implantations/"
                style={{
                  font: "600 13.5px var(--fb)",
                  color: "var(--acc)",
                  // Seul dans sa rangée, donc une cible tactile à lui : mesuré
                  // à 19 px de haut sur téléphone, sous les 24 px du critère
                  // 2.5.8 de la WCAG 2.2. Le remplissage agrandit la zone de
                  // contact sans déplacer le texte.
                  display: "inline-block",
                  padding: "3px 0",
                }}
              >
                Toutes les implantations et les hubs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
