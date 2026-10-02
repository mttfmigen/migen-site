import Image from "next/image";
import styles from "./DernieresRealisations.module.css";

export interface Realisation {
  /** Lien vers la fiche de la réalisation. */
  href: string;
  /** Visuel de couverture : chemin public (« /assets/web/… ») ou URL. */
  image: string;
  /** Décoratif sur la maquette, donc vide par défaut. */
  alt?: string;
  /** Client et offre, en une ligne : « SUEZ IWT · migen© Résidence ». */
  client: string;
  titre: string;
  /** Mois et année, déjà formatés : « Février 2026 ». */
  date: string;
}

interface Proprietes {
  realisations?: Realisation[];
  hrefToutes?: string;
}

/** Les trois fiches de la maquette, reprises mot pour mot. */
const REALISATIONS_MAQUETTE: Realisation[] = [
  {
    href: "/realisations/",
    image: "/assets/web/ph-tuyaux.jpg",
    client: "SUEZ IWT · migen© Résidence",
    titre: "Remise en état complète d'un site industriel",
    date: "Février 2026",
  },
  {
    href: "/realisations/",
    image: "/assets/web/sv-armoire.jpg",
    client: "DANONE · migen© Résidence",
    titre: "Maintenance en continu des lignes de production",
    date: "Février 2026",
  },
  {
    href: "/realisations/",
    image: "/assets/web/x-cimenterie.jpg",
    client: "JTEKT · migen© Résidence",
    titre: "Sécuriser la maintenance de ses installations",
    date: "Janvier 2026",
  },
];

export default function DernieresRealisations({
  realisations = REALISATIONS_MAQUETTE,
  hrefToutes = "/realisations/",
}: Proprietes) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
            marginBottom: 38,
            flexWrap: "wrap",
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
              Nos dernières réalisations
            </div>
            <h2
              style={{
                font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                maxWidth: "24ch",
                textWrap: "balance",
              }}
            >
              Ce que nous avons fait, chez qui, et comment
            </h2>
          </div>
          <a
            href={hrefToutes}
            style={{
              font: "600 15px var(--fb)",
              color: "var(--acc)",
              flex: "none",
              paddingBottom: 6,
            }}
          >
            Voir toutes nos réalisations →
          </a>
        </div>

        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {realisations.map((r) => (
            <a
              key={r.href + r.titre}
              href={r.href}
              className={styles.carte}
              style={{
                display: "block",
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: "var(--rad)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 210,
                  background: "var(--ph)",
                  overflow: "hidden",
                }}
              >
                {/* `fill` plutôt que des dimensions : la vignette occupe toute
                    la carte, sa taille rendue dépend de la colonne. `sizes`
                    évite de servir une image pleine largeur dans une carte de
                    380px. Le parent porte `position: relative`, sans quoi
                    l'image se placerait par rapport à la page. */}
                <Image
                  src={r.image}
                  alt={r.alt ?? ""}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 380px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat)) contrast(1.05)",
                    opacity: "var(--ph-op)",
                  }}
                />
              </div>
              <div style={{ padding: "24px 26px 28px" }}>
                <div
                  style={{
                    font: "600 11.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                  }}
                >
                  {r.client}
                </div>
                <div
                  style={{
                    font: "600 19px/1.3 var(--ft)",
                    letterSpacing: "-.025em",
                    marginTop: 12,
                  }}
                >
                  {r.titre}
                </div>
                <div
                  style={{
                    font: "400 13.5px var(--fb)",
                    color: "var(--ink4)",
                    marginTop: 14,
                  }}
                >
                  {r.date}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
