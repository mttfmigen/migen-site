import styles from "./GrilleOffres.module.css";

/* Grille des offres de la page d'accueil, portée de « Migen - Site final »
   (lignes 535 à 598). Composant serveur : aucun état, les survols sont en CSS. */

type CleOffre =
  | "residence"
  | "zeroArret"
  | "arretTechnique"
  | "bureauEtudes"
  | "travauxIndustriels";

export interface ProprietesGrilleOffres {
  /** Destination de chaque carte. La maquette porte « # » (sa navigation était
      interne à l'éditeur) : l'appelant fournit les vrais chemins. */
  liens?: Partial<Record<CleOffre, string>>;
}

/** Cartes 03 à 05 : même gabarit, seul le contenu change. */
const CARTES_SOBRES: readonly {
  cle: CleOffre;
  numero: string;
  titre: string;
  texte: React.ReactNode;
  action: string;
}[] = [
  {
    cle: "arretTechnique",
    numero: "03",
    titre: "migen© Arrêt technique",
    texte: "Arrêts planifiés, préparés en amont, tenus à la demi-journée.",
    action: "Préparer un arrêt",
  },
  {
    cle: "bureauEtudes",
    numero: "04",
    titre: "migen© Bureau d’études",
    texte:
      "Conception, schémas électriques, mise en conformité machine : des études faites par des gens de terrain.",
    action: "Confier une étude",
  },
  {
    cle: "travauxIndustriels",
    numero: "05",
    titre: "migen© Travaux industriels",
    texte:
      "Transfert, montage, démantèlement, levage : le chantier, du relevé à la remise en production.",
    action: "Préparer un chantier",
  },
];

const VERRE = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 24px 56px -32px rgba(0,0,0,.34)",
} as const;

const NUMERO = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: "10px",
} as const;

const LIGNE_TITRE = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "14px",
} as const;

const BOUTON = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "auto",
  padding: "11px 20px",
  borderRadius: "999px",
  font: "600 14px var(--fb)",
  alignSelf: "flex-start",
  whiteSpace: "nowrap",
} as const;

export default function GrilleOffres({ liens = {} }: ProprietesGrilleOffres) {
  const vers = (cle: CleOffre) => liens[cle] ?? "#";

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 0" }}>
      <div
        className="mg-rmulti"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: "16px",
        }}
      >
        {/* Carte photographique d'ouverture */}
        <div
          style={{
            position: "relative",
            borderRadius: "var(--rad)",
            overflow: "hidden",
            minHeight: "340px",
            background: "linear-gradient(150deg,#d8d9dc,#eceded 55%,#e4e2de)",
            boxShadow: "0 30px 70px -40px rgba(0,0,0,.5)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/web/team-grind-sparks.jpg"
            alt="Technicien de maintenance migen en intervention"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(var(--sat)) contrast(1.06)",
              opacity: "var(--ph-op)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom,rgba(28,27,25,.34) 0%,rgba(28,27,25,0) 42%,rgba(28,27,25,.72) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "26px",
              left: "28px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-migen-white.png"
              alt=""
              style={{ height: "20px", width: "auto", opacity: 0.95 }}
            />
            <span
              style={{
                font: "500 11.5px var(--fb)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.8)",
              }}
            >
              Innovation, performance, impact.
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "32px",
            }}
          >
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "12px",
              }}
            >
              Sept façons de travailler ensemble
            </div>
            <div
              style={{
                font: "600 calc(26px * var(--ts))/1.15 var(--ft)",
                letterSpacing: "-.035em",
                color: "#fff",
                maxWidth: "20ch",
              }}
            >
              De la présence continue à l’étude et aux travaux.
            </div>
          </div>
        </div>

        {/* 01, Résidence, sur fond anthracite */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--rad)",
            padding: "30px 32px 30px",
            background: "var(--panel)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 24px 56px -32px rgba(0,0,0,.5)",
            transition: "transform var(--tr)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "340px",
              height: "340px",
              right: "-130px",
              top: "-150px",
              background:
                "radial-gradient(circle,rgba(255,124,60,.32),transparent 66%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div style={NUMERO}>01</div>
            <div style={LIGNE_TITRE}>
              <div
                style={{
                  font: "600 21px var(--ft)",
                  letterSpacing: "-.03em",
                  color: "#fff",
                }}
              >
                migen© Résidence
              </div>
            </div>
            <p
              style={{
                font: "400 14.5px/1.6 var(--fb)",
                color: "rgba(255,255,255,.72)",
                margin: "10px 0 18px",
              }}
            >
              Des techniciens en résidence sur votre site, pour la durée dont
              vous avez besoin. Vous constituez l&apos;équipe, validez chaque
              intervenant, et la ligne ne s&apos;arrête plus.
            </p>
            <a
              href={vers("residence")}
              className={styles.lienAccent}
              style={{
                ...BOUTON,
                background: "var(--acc)",
                color: "#fff",
                boxShadow: "0 10px 24px -12px rgba(255,124,60,.85)",
                transition: "filter var(--tr),transform var(--tr)",
              }}
            >
              Constituer mon équipe
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* 02, Zéro arrêt, carte de verre qui se soulève au survol */}
        <div
          className={styles.carteLevee}
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--rad)",
            padding: "30px 32px 30px",
            ...VERRE,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div style={NUMERO}>02</div>
            <div style={LIGNE_TITRE}>
              <div style={{ font: "600 21px var(--ft)", letterSpacing: "-.03em" }}>
                migen© Zéro arrêt
              </div>
              <span
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  background: "var(--acc-w)",
                  padding: "5px 11px",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                }}
              >
                Abonnement
              </span>
            </div>
            <p
              style={{
                font: "400 14.5px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: "10px 0 18px",
              }}
            >
              La maintenance qui ne touche jamais à votre production&nbsp;:
              entretien le samedi, dépannage la nuit, prix mensuel fixe. Trois
              formules, sur devis.
            </p>
            <a
              href={vers("zeroArret")}
              className={styles.lienAccent}
              style={{
                ...BOUTON,
                background: "var(--acc)",
                color: "#fff",
                transition: "filter var(--tr),transform var(--tr)",
              }}
            >
              Les trois formules
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* 03 à 05, même gabarit sobre */}
        {CARTES_SOBRES.map((carte) => (
          <div
            key={carte.cle}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--rad)",
              padding: "28px 28px 28px",
              ...VERRE,
            }}
          >
            <div style={NUMERO}>{carte.numero}</div>
            <div style={{ font: "600 19px var(--ft)", letterSpacing: "-.03em" }}>
              {carte.titre}
            </div>
            <p
              style={{
                font: "400 13.5px/1.55 var(--fb)",
                color: "var(--ink2)",
                margin: "8px 0 18px",
              }}
            >
              {carte.texte}
            </p>
            <a
              href={vers(carte.cle)}
              className={styles.lienNeutre}
              style={{
                ...BOUTON,
                background: "var(--chip)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                transition: "background var(--tr),transform var(--tr)",
              }}
            >
              {carte.action}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
