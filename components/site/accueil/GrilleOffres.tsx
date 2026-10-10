import Image from "next/image";
import styles from "./GrilleOffres.module.css";

/* Grille des offres de la page d'accueil. Relevée le 08/10 sur le rendu de la
   maquette autonome (section 2 de l'accueil), élément par élément. Composant
   serveur : aucun état, les survols sont en CSS (`style-hover` de la maquette,
   classes scp3, scp8, scp9 et scpa, recopiées dans le module). */

type CleOffre =
  | "residence"
  | "fullService"
  | "zeroArret"
  | "arretTechnique"
  | "bureauEtudes"
  | "travauxIndustriels";

/**
 * La destination de chaque carte.
 *
 * La maquette porte « # » partout : sa navigation était interne à l'éditeur.
 * Les vrais chemins sont ceux de l'inventaire, `docs/urls-site-actuel.json`.
 *
 * `Record` COMPLET et non `Partial` : c'est le garde-fou. Ajouter une clé à
 * `CleOffre` sans son chemin ne compile plus, au lieu de retomber en silence
 * sur un lien mort.
 *
 * `travauxIndustriels` vit HORS de `/offres/`, contrairement aux quatre
 * autres : c'est l'URL de l'inventaire, elle ne se canonicalise pas ici.
 */
const LIENS: Record<CleOffre, string> = {
  residence: "/offres/residence/",
  fullService: "/offres/full-service/",
  zeroArret: "/offres/zero-arret/",
  arretTechnique: "/offres/arret-technique/",
  bureauEtudes: "/offres/bureau-etudes/",
  travauxIndustriels: "/travaux-industriels/",
};

/** Cartes 04 à 06 : même gabarit, seul le contenu change. */
const CARTES_SOBRES: readonly {
  cle: CleOffre;
  numero: string;
  titre: string;
  texte: string;
  action: string;
}[] = [
  {
    cle: "arretTechnique",
    numero: "04",
    titre: "migen© Arrêt technique",
    texte: "Arrêts planifiés, préparés en amont, tenus à la demi-journée.",
    action: "Préparer un arrêt →",
  },
  {
    cle: "bureauEtudes",
    numero: "05",
    titre: "migen© Bureau d’études",
    texte:
      "Conception, schémas électriques, mise en conformité machine : des études faites par des gens de terrain.",
    action: "Confier une étude →",
  },
  {
    cle: "travauxIndustriels",
    numero: "06",
    titre: "migen© Travaux industriels",
    texte:
      "Transfert, montage, démantèlement, levage : le chantier, du relevé à la remise en production.",
    action: "Préparer un chantier →",
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

const PASTILLE = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--acc)",
  background: "var(--acc-w)",
  padding: "5px 11px",
  borderRadius: "999px",
  whiteSpace: "nowrap",
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

const BOUTON_ACCENT = {
  ...BOUTON,
  background: "var(--acc)",
  color: "#fff",
  transition: "filter var(--tr),transform var(--tr)",
} as const;

const TEXTE_CARTE = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "10px 0 18px",
} as const;

const GARANTIES_RESIDENCE = [
  "Vous validez chaque technicien avant son arrivée",
  "Remplacement garanti en cas d’absence",
  "Recrutement, habilitations et paie portés par migen",
  "Reporting mensuel et suivi d’indicateurs",
] as const;

export default function GrilleOffres() {
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
        {/* Carte photographique d'ouverture, sur deux rangs. `fill` et `sizes` :
            le fichier source fait 1279x1600 pour une carte affichée à ~363 px,
            next/image sert une version à sa taille. */}
        <div
          className={styles.offImg}
          style={{
            gridRow: "span 2",
            position: "relative",
            borderRadius: "var(--rad)",
            overflow: "hidden",
            minHeight: "340px",
            background: "linear-gradient(150deg,#d8d9dc,#eceded 55%,#e4e2de)",
            boxShadow: "0 30px 70px -40px rgba(0,0,0,.5)",
          }}
        >
          <Image
            src="/assets/web/team-grind-sparks.jpg"
            alt="Technicien de maintenance migen en intervention"
            fill
            sizes="(max-width: 1000px) 50vw, 380px"
            style={{
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
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px" }}>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: "12px",
              }}
            >
              Six façons de travailler ensemble
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

        {/* 01, Résidence, sur fond anthracite, sur deux colonnes : texte et
            bouton à gauche, les quatre garanties en colonne à droite. */}
        <div
          className={styles.offMain}
          style={{
            gridColumn: "span 2",
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--rad)",
            padding: "30px 32px",
            background: "var(--panel)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 24px 56px -32px rgba(0,0,0,.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "420px",
              height: "420px",
              right: "-150px",
              top: "-200px",
              background: "radial-gradient(circle,rgba(255,124,60,.32),transparent 66%)",
              pointerEvents: "none",
            }}
          />
          <div
            className={styles.offIn}
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
              gap: "30px",
              flex: "1 0 auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={NUMERO}>01</div>
              <div
                style={{
                  font: "600 calc(24px * var(--ts)) var(--ft)",
                  letterSpacing: "-.035em",
                  color: "#fff",
                }}
              >
                migen© Résidence
              </div>
              <p
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.72)",
                  margin: "10px 0 20px",
                  maxWidth: "46ch",
                }}
              >
                Des techniciens en résidence sur votre site, pour la durée dont
                vous avez besoin. Vous constituez l&apos;équipe, validez chaque
                intervenant, et la ligne ne s&apos;arrête plus.
              </p>
              <a
                href={LIENS.residence}
                className={styles.lienResidence}
                style={{
                  ...BOUTON_ACCENT,
                  boxShadow: "0 10px 24px -12px rgba(255,124,60,.85)",
                }}
              >
                Constituer mon équipe →
              </a>
            </div>
            <div style={{ display: "grid", gap: "8px", alignContent: "center" }}>
              {GARANTIES_RESIDENCE.map((garantie) => (
                <div
                  key={garantie}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    padding: "13px 16px",
                    borderRadius: "var(--rad-s)",
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.09)",
                    font: "400 14px/1.45 var(--fb)",
                    color: "rgba(255,255,255,.86)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{ color: "var(--acc)", flex: "0 0 auto", fontWeight: 600 }}
                  >
                    ✓
                  </span>
                  {garantie}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 02, Full service */}
        <div
          className={styles.carteLevee}
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--rad)",
            padding: "30px 32px",
            ...VERRE,
          }}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={NUMERO}>02</div>
            <div style={LIGNE_TITRE}>
              <div style={{ font: "600 21px var(--ft)", letterSpacing: "-.03em" }}>
                migen© Full service
              </div>
              <span style={PASTILLE}>Contrat unique</span>
            </div>
            <p style={TEXTE_CARTE}>
              Toute votre maintenance dans un seul contrat&nbsp;: préventif,
              dépannage, pièces et GMAO, avec un seul interlocuteur.
            </p>
            <a href={LIENS.fullService} className={styles.lienAccent} style={BOUTON_ACCENT}>
              Confier ma maintenance →
            </a>
          </div>
        </div>

        {/* 03, Zéro arrêt. La maquette écrit « La maintenance qui ne touche
            jamais à votre production : entretien le samedi, dépannage la
            nuit, prix mensuel fixe. Trois formules, sur devis. » La première
            phrase annonce un prix : interdite, elle est RETIRÉE entière (pas
            raccourcie), la seconde reste mot pour mot. Écart déclaré. */}
        <div
          className={styles.carteLevee}
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--rad)",
            padding: "30px 32px",
            ...VERRE,
          }}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={NUMERO}>03</div>
            <div style={LIGNE_TITRE}>
              <div style={{ font: "600 21px var(--ft)", letterSpacing: "-.03em" }}>
                migen© Zéro arrêt
              </div>
              <span style={PASTILLE}>Abonnement</span>
            </div>
            <p style={TEXTE_CARTE}>Trois formules, sur devis.</p>
            <a href={LIENS.zeroArret} className={styles.lienAccent} style={BOUTON_ACCENT}>
              Les trois formules →
            </a>
          </div>
        </div>

        {/* 04 à 06, même gabarit sobre */}
        {CARTES_SOBRES.map((carte) => (
          <div
            key={carte.cle}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--rad)",
              padding: "28px",
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
              href={LIENS[carte.cle]}
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
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
