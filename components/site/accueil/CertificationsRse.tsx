
/* Certifications et chiffres sécurité / RSE, portés de « Migen - Site final »
   (lignes 610 à 636). Composant serveur. */

const CHIFFRES: readonly { valeur: React.ReactNode; libelle: string }[] = [
  { valeur: "2", libelle: "accidents avec arrêt en 2025" },
  { valeur: <>100&nbsp;%</>, libelle: "habilitations à jour, vérifiables" },
  { valeur: <>−30&nbsp;%</>, libelle: "d'arrêts non planifiés chez nos clients Résidence" },
  { valeur: <>18&nbsp;h</>, libelle: "de formation par technicien et par an" },
];

const SURTITRE = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
} as const;

const CADRE_LOGO = {
  height: "72px",
  borderRadius: "12px",
  background: "#fff",
  border: "1px solid var(--line)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  flex: "none",
} as const;

const IMAGE_LOGO = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  display: "block",
} as const;

export default function CertificationsRse() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          className="mg-r2" data-reveal=""
          style={{
            display: "grid",
            gridTemplateColumns: ".9fr 1.1fr",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              borderRadius: "var(--rad)",
              padding: "34px 36px 36px",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
            }}
          >
            <div style={{ ...SURTITRE, marginBottom: "18px" }}>Certifications</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <span style={{ ...CADRE_LOGO, width: "132px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logos/mase.png" alt="MASE" style={IMAGE_LOGO} />
              </span>
              <span style={{ ...CADRE_LOGO, width: "72px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logos/ecovadis.webp"
                  alt="EcoVadis Committed 2025"
                  style={IMAGE_LOGO}
                />
              </span>
            </div>
            <p
              style={{
                font: "400 15px/1.65 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
              }}
            >
              Démarche{" "}
              <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                MASE
              </strong>{" "}
              pour la sécurité de nos interventions et évaluation{" "}
              <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                EcoVadis
              </strong>{" "}
              sur notre performance RSE. Les attestations sont transmises avec
              chaque plan de prévention.
            </p>
          </div>

          <div
            style={{
              background: "var(--panel)",
              borderRadius: "var(--rad)",
              padding: "34px 36px 36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "400px",
                height: "400px",
                right: "-160px",
                top: "-180px",
                background:
                  "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ ...SURTITRE, marginBottom: "22px" }}>
                Sécurité &amp; RSE
              </div>
              <div
                className="mg-rmulti"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                  gap: "20px",
                }}
              >
                {CHIFFRES.map((chiffre) => (
                  <div key={chiffre.libelle}>
                    <div
                      style={{
                        font: "600 30px var(--ft)",
                        letterSpacing: "-.045em",
                        color: "#fff",
                      }}
                    >
                      {chiffre.valeur}
                    </div>
                    <div
                      style={{
                        font: "400 12.5px/1.45 var(--fb)",
                        color: "rgba(255,255,255,.5)",
                        marginTop: "6px",
                      }}
                    >
                      {chiffre.libelle}
                    </div>
                  </div>
                ))}
              </div>
              {/* La maquette portait ici une note de travail, rendue en texte
                  visible : « Chiffres 2025 · à confirmer avant publication… ». Elle ne
                  part pas en production, un visiteur n'a pas à lire les réserves
                  internes sur les chiffres qu'on lui montre. La réserve elle-même
                  reste ouverte et suivie dans docs/RESERVES-CONTENU.md. */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
