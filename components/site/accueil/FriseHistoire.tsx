import styles from "./FriseHistoire.module.css";

export interface Jalon {
  /** « 2021 » */
  annee: string;
  texte: string;
  /** Pastille orange pour le premier et le dernier jalon, grise sinon. */
  accentue?: boolean;
}

interface Proprietes {
  jalons?: Jalon[];
  hrefDecrire?: string;
}

/** Les six jalons de la maquette, repris mot pour mot. */
const JALONS_MAQUETTE: Jalon[] = [
  {
    annee: "2021",
    texte: "Création à Lyon. Deux techniciens, un client.",
    accentue: true,
  },
  { annee: "2022", texte: "Lancement de l'offre Résidence." },
  { annee: "2023", texte: "Premiers hubs de techniciens hors de Lyon." },
  {
    annee: "2024",
    texte: "Hubs dans les grandes villes de France, plus de 120 clients.",
  },
  {
    annee: "2025",
    texte: "Ouverture des agences de Montréal et de Dubaï.",
  },
  {
    annee: "2026",
    texte:
      "Agence de Madrid. Alliance DimoMaint & Savoye. +10 M€ de CA.",
    accentue: true,
  },
];

export default function FriseHistoire({
  jalons = JALONS_MAQUETTE,
  hrefDecrire = "#besoin",
}: Proprietes) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 16,
            }}
          >
            Notre histoire
          </div>
          <h2
            style={{
              font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
              letterSpacing: "-.04em",
              margin: "0 0 44px",
              maxWidth: "24ch",
              textWrap: "balance",
            }}
          >
            D&rsquo;un atelier lyonnais à quatre agences
          </h2>
          <div style={{ position: "relative", paddingTop: 8 }}>
            {/* Le rail horizontal, masqué sous 1000px par .mg-rail. */}
            <div
              aria-hidden="true"
              className="mg-rail"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 14,
                height: 1,
                background: "var(--line)",
              }}
            />
            <ol
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,minmax(0,1fr))",
                gap: 16,
                position: "relative",
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {jalons.map((j) => (
                <li key={j.annee}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 999,
                      background: j.accentue ? "var(--acc)" : "var(--chip)",
                      marginBottom: 22,
                    }}
                  />
                  <div
                    style={{
                      font: "600 20px var(--ft)",
                      letterSpacing: "-.035em",
                    }}
                  >
                    {j.annee}
                  </div>
                  <div
                    style={{
                      font: "400 14px/1.55 var(--fb)",
                      color: "var(--ink2)",
                      marginTop: 8,
                    }}
                  >
                    {j.texte}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {/* La maquette portait ici une note de travail, rendue en texte
              visible : « Jalons à confirmer · dates et chiffres à valider… ». Elle ne
              part pas en production, un visiteur n'a pas à lire les réserves
              internes sur les chiffres qu'on lui montre. La réserve elle-même
              reste ouverte et suivie dans docs/RESERVES-CONTENU.md. */}
        </div>

        <div data-reveal=""
          style={{
            marginTop: 16,
            padding: "30px 34px",
            borderRadius: "var(--rad)",
            background: "var(--acc-w)",
            border: "1.5px solid rgba(255,124,60,.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 36,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                font: "600 calc(21px * var(--ts))/1.25 var(--ft)",
                letterSpacing: "-.03em",
                marginBottom: 6,
              }}
            >
              Le prochain site, c&rsquo;est le vôtre.
            </div>
            <p
              style={{
                font: "400 15px/1.6 var(--fb)",
                color: "var(--ink1)",
                margin: 0,
                maxWidth: "56ch",
              }}
            >
              Aucun de ces chantiers n&rsquo;a commencé par un appel
              d&rsquo;offres. Tous ont commencé par un responsable maintenance
              qui a décrit sa ligne en cinq lignes.
            </p>
          </div>
          <a
            href={hrefDecrire}
            className={styles.boutonLigne}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "15px 26px",
              borderRadius: 999,
              background: "var(--acc)",
              color: "#fff",
              font: "600 15px var(--fb)",
              whiteSpace: "nowrap",
              boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
              transition: "filter var(--tr),transform var(--tr)",
              flex: "none",
            }}
          >
            Décrire ma ligne
          </a>
        </div>
      </div>
    </section>
  );
}
