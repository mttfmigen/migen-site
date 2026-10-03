/**
 * « Avant de postuler » : le bandeau du test d'auto-évaluation,
 * maquette lignes 3292 à 3308.
 *
 * LE BOUTON N'EST PAS UN LIEN, et c'est voulu. La maquette écrit `href="#"` et
 * confie la navigation à son propre moteur (`sc-camel-on-click="{{ goTest }}"`).
 * La page du test n'existe pas encore sur le site : `/test-maintenance/` répond
 * 404. Poser le lien reviendrait à reproduire exactement le défaut qu'on
 * répare, 44 cibles mortes citées par toutes les pages. Le libellé est donc
 * rendu en texte, sur un fond neutre et non sur la pilule orange, pour qu'il ne
 * se lise pas comme un bouton qui ne répond pas.
 */

export default function TestCarriere() {
  return (
    <section style={{ padding: "48px 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          style={{
            borderRadius: "var(--rad)",
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
            padding: "34px 38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "36px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap",
              flex: 1,
              minWidth: "280px",
            }}
          >
            <div style={{ flex: "none" }}>
              <div
                style={{
                  font: "600 calc(clamp(30px,3.2vw,44px) * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.05em",
                  color: "var(--acc)",
                }}
              >
                8
              </div>
              <div
                style={{
                  font: "400 11.5px var(--fb)",
                  color: "var(--ink4)",
                  marginTop: "4px",
                  maxWidth: "14ch",
                }}
              >
                questions · 6 min
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "48px",
                background: "var(--line)",
                flex: "none",
              }}
            />
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: "8px",
                }}
              >
                Avant de postuler
              </div>
              <div
                style={{
                  font: "600 calc(19px * var(--ts))/1.3 var(--ft)",
                  letterSpacing: "-.03em",
                  color: "var(--ink)",
                  marginBottom: "6px",
                  maxWidth: "30ch",
                }}
              >
                {"Situez-vous sur nos huit questions d’entretien."}
              </div>
              <p
                style={{
                  font: "400 14px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  margin: 0,
                  maxWidth: "56ch",
                }}
              >
                {
                  "Consignation, roulements, analyse vibratoire, variateurs, capteurs, hydraulique, lecture de schéma. Corrigé détaillé à la fin, anonyme, sans inscription."
                }
              </p>
            </div>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              padding: "14px 26px",
              borderRadius: "999px",
              background: "var(--chip)",
              border: "1px solid var(--line)",
              color: "var(--ink2)",
              font: "600 15px var(--fb)",
              flex: "none",
              whiteSpace: "nowrap",
            }}
          >
            Passer le test
          </span>
        </div>
      </div>
    </section>
  );
}
