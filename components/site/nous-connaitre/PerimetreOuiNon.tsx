/**
 * Ce que nous faisons, ce que nous ne faisons pas.
 *
 * Maquette, lignes 5429 à 5457.
 *
 * CORRECTION SUR LA COPIE : la première ligne de la colonne de gauche écrivait
 * « Mettre à disposition des techniciens », formulation proscrite par le
 * contrat. Reformulée en « Affecter des techniciens de maintenance sur votre
 * site », même sens, même longueur.
 */

const FAIT: readonly string[] = [
  "Affecter des techniciens de maintenance sur votre site, en résidence ou ponctuellement",
  "Tenir un contrat de maintenance préventive avec engagement de délai",
  "Préparer et conduire un arrêt technique, du chiffrage au redémarrage",
  "Transférer, monter et mettre en service une installation complète",
  "Concevoir en bureau d’études ce que nos équipes maintiendront ensuite",
];

const PAS_FAIT: readonly string[] = [
  "Du placement de CV : nos techniciens sont nos salariés, pas des profils revendus",
  "Tous les métiers : nous n’en avons qu’un, et nous refusons ce qui sort de la maintenance",
  "Accepter une mission faute de technicien disponible, nous avons déjà dit non à des groupes du CAC 40",
  "De la sous-traitance en cascade sur nos périmètres contractuels",
];

export default function PerimetreOuiNon() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
              borderRadius: "var(--rad)",
              padding: "34px 36px 36px",
            }}
          >
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                // Contraste AA : l'orange de marque donnait 2,45:1 sur ce fond clair, --acc-ink donne 8,57:1.
                color: "var(--acc-ink)",
                marginBottom: 18,
              }}
            >
              Ce que nous faisons
            </div>
            <ul
              style={{
                display: "grid",
                gap: 9,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {FAIT.map((ligne) => (
                <li
                  key={ligne}
                  style={{
                    display: "flex",
                    gap: 11,
                    font: "400 15px/1.55 var(--fb)",
                    color: "var(--ink1)",
                  }}
                >
                  // Contraste AA : l'orange de marque donnait 2,45:1 sur ce fond clair, --acc-ink donne 8,57:1.
                  <span aria-hidden="true" style={{ color: "var(--acc-ink)", flex: "none" }}>
                    ✓
                  </span>
                  {ligne}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              borderRadius: "var(--rad)",
              background: "var(--panel)",
              padding: "34px 36px 36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                right: -170,
                top: -190,
                background:
                  "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 18,
                }}
              >
                Ce que nous ne faisons pas
              </div>
              <ul
                style={{
                  display: "grid",
                  gap: 9,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {PAS_FAIT.map((ligne) => (
                  <li
                    key={ligne}
                    style={{
                      display: "flex",
                      gap: 11,
                      font: "400 15px/1.55 var(--fb)",
                      color: "rgba(255,255,255,.72)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ color: "var(--acc)", flex: "none" }}
                    >
                      ×
                    </span>
                    {ligne}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
