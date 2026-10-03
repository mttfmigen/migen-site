/**
 * Notre histoire : la frise des six exercices.
 *
 * Maquette, lignes 5376 à 5397.
 *
 * POURQUOI CE N'EST PAS `accueil/FriseHistoire` : ce composant-là porte en dur
 * son titre (« D'un atelier lyonnais à quatre agences »), six jalons d'un autre
 * texte et un appel à l'action « Décrire ma ligne » qui ne figure pas sur cet
 * écran. Le réemployer imposerait trois contenus que la maquette n'écrit pas
 * ici. Seuls les jalons sont des données, le reste du gabarit diffère.
 *
 * DEUX CORRECTIONS SUR LA COPIE DE LA MAQUETTE, détaillées dans le rapport de
 * portage : « le modèle en régie » (mot proscrit) et « Plus de 200 clients »
 * (le compte tenu est « plus de 120 clients, dont plus de 80 réguliers »).
 */

interface Jalon {
  annee: string;
  texte: string;
  /** Pastille orange : premier et dernier jalon. */
  accentue?: true;
}

const JALONS: readonly Jalon[] = [
  {
    annee: "2021",
    texte:
      "Avril : création à Lyon. Un technicien de 23 ans, ses premiers clients, et ses amis recrutés un par un.",
    accentue: true,
  },
  {
    annee: "2022",
    texte:
      "Le modèle du technicien en résidence se structure. Les grands comptes appellent d’eux-mêmes pour des missions longues.",
  },
  {
    annee: "2023",
    texte:
      "Première équipe support dédiée. Le turnover passe sous la barre des 25 %, contre 60 % dans le secteur.",
  },
  {
    annee: "2024",
    texte:
      "Couverture nationale. Plus de 120 clients, dont plus de 80 réguliers, missions de quelques semaines à plusieurs années.",
  },
  {
    annee: "2025",
    texte:
      "Dubaï et Montréal ouvrent. Orthus lance les travaux industriels et le bureau d’études.",
  },
  {
    annee: "2026",
    texte:
      "Le groupe s’unifie sous migen©. Quatre agences, cap sur 1 000 collaborateurs.",
    accentue: true,
  },
];

export default function FriseCinqAns() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
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
                  marginBottom: 18,
                }}
              >
                Notre histoire
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "var(--ink)",
                  margin: 0,
                  textWrap: "balance",
                  maxWidth: "22ch",
                }}
              >
                Cinq ans, de zéro à cent
              </h2>
            </div>
            <p
              style={{
                font: "400 15.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              Aucune levée de fonds. La croissance a suivi les sites
              clients&nbsp;: un technicien, puis deux, puis une équipe.
            </p>
          </div>
          <div style={{ position: "relative", paddingTop: 8 }}>
            {/* Le rail horizontal, masqué sous 1000px par `.mg-rail`. */}
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
              className="mg-rmulti mg-tl"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,minmax(0,1fr))",
                gap: 14,
                position: "relative",
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {JALONS.map((j) => (
                <li key={j.annee}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 999,
                      background: j.accentue ? "var(--acc)" : "var(--ink4)",
                      marginBottom: 22,
                      boxShadow: j.accentue
                        ? "0 0 0 4px rgba(255,124,60,.16)"
                        : "none",
                    }}
                  />
                  <div
                    style={{
                      font: "600 calc(20px * var(--ts)) var(--ft)",
                      letterSpacing: "-.035em",
                      color: "var(--ink)",
                    }}
                  >
                    {j.annee}
                  </div>
                  <div
                    style={{
                      font: "400 13.5px/1.55 var(--fb)",
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
        </div>
      </div>
    </section>
  );
}
