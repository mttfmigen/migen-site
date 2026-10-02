import { FormulaireContact } from "@/components/formulaire/FormulaireContact";

/* Section d'ouverture de la page d'accueil, portée de « Migen - Site final »
   (lignes 483 à 533). Composant serveur : le seul élément interactif est le
   formulaire, qui est déjà un composant client autonome. */

const VALEUR = {
  font: "600 22px var(--ft)",
  letterSpacing: "-.04em",
} as const;

const LIBELLE = {
  font: "400 12.5px var(--fb)",
  color: "var(--ink4)",
  marginTop: "2px",
} as const;

const TRAIT = {
  width: "1px",
  height: "34px",
  background: "var(--line)",
} as const;

export default function Hero() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
    >
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.12fr .88fr",
          gap: "52px",
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "26px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b))",
                WebkitBackdropFilter: "blur(var(--gl-b))",
                border: "1px solid var(--gbd)",
                font: "600 12px var(--fb)",
                letterSpacing: ".02em",
                color: "var(--ink1)",
                boxShadow: "0 2px 10px rgba(0,0,0,.05)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "var(--acc)",
                }}
              />
              Partout en France
            </span>
            <span style={{ font: "400 12.5px var(--fb)", color: "var(--ink4)" }}>
              4 agences · +120 techniciens
            </span>
          </div>

          <h1
            style={{
              font: "600 calc(clamp(38px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "16ch",
              textWrap: "balance",
            }}
          >
            La maintenance industrielle,{" "}
            <span style={{ color: "var(--ink4)" }}>
              sans rupture de production.
            </span>
          </h1>

          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "26px 0 0",
              maxWidth: "48ch",
            }}
          >
            En tant que responsable maintenance, trouver un prestataire
            réellement qualifié est un défi. Nous mobilisons des techniciens dont
            10&nbsp;% seulement réussissent notre process, sur vos sites, en
            continu ou en intervention ciblée.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "26px",
              marginTop: "34px",
              paddingTop: "26px",
              borderTop: "1px solid var(--line)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={VALEUR}>+120</div>
              <div style={LIBELLE}>techniciens</div>
            </div>
            <div style={TRAIT} />
            <div>
              <div style={VALEUR}>+10&nbsp;M€</div>
              <div style={LIBELLE}>de chiffre d’affaires</div>
            </div>
            <div style={TRAIT} />
            <div>
              <div style={VALEUR}>+120</div>
              <div style={LIBELLE}>clients</div>
            </div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            id="besoin"
            style={{
              position: "relative",
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              borderRadius: "var(--rad)",
              padding: "30px 30px 32px",
              boxShadow:
                "0 1px 1px rgba(0,0,0,.04),0 30px 70px -34px rgba(0,0,0,.42)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                columnGap: "14px",
                rowGap: "6px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  font: "600 20px/1.2 var(--ft)",
                  letterSpacing: "-.03em",
                  whiteSpace: "nowrap",
                }}
              >
                Décrire mon besoin
              </div>
              <div
                style={{
                  font: "500 11.5px var(--fb)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                }}
              >
                Rappel dans l’heure
              </div>
            </div>

            {/* Le formulaire existant porte sa propre validation, son champ
                piège, sa mention RGPD et son état d'envoi : la maquette
                dessinait ces écrans (`sc-if sent` / `notSent`) à la main, ils
                sont ici dans le composant. */}
            <FormulaireContact
              formulaire="accueil-hero"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
