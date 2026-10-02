import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./HubsAccueil.module.css";

export interface HubAccueil {
  /** Ville, affichée dans la pastille blanche. */
  ville: string;
  titre: string;
  /** Territoires couverts, une seule ligne. */
  couverture: string;
  chemin: string;
  image: string;
}

interface Proprietes {
  hubs?: readonly HubAccueil[];
}

/** Les hubs présents dans la maquette, dans son ordre. */
const HUBS: readonly HubAccueil[] = [
  {
    ville: "Lyon",
    titre: "Hub Lyon",
    couverture: "Siège · Grenoble, Saint-Étienne, Valence, Haute-Savoie",
    chemin: "/implantations/lyon/",
    image: "/assets/web/sv-convoyeur.jpg",
  },
  {
    ville: "Paris",
    titre: "Hub Paris",
    couverture: "Essonne, Rouen",
    chemin: "/implantations/paris/",
    image: "/assets/web/ph-hero-raffinerie.jpg",
  },
  {
    ville: "Lille",
    titre: "Hub Lille",
    couverture: "Hauts-de-France",
    chemin: "/implantations/lille/",
    image: "/assets/web/x-logistique-entrepot.jpg",
  },
  {
    ville: "Strasbourg",
    titre: "Hub Strasbourg",
    couverture: "Alsace, Mulhouse",
    chemin: "/implantations/strasbourg/",
    image: "/assets/web/x-cimenterie.jpg",
  },
  {
    ville: "Nantes",
    titre: "Hub Nantes",
    couverture: "Loire-Atlantique, Rennes, Brest",
    chemin: "/implantations/nantes/",
    image: "/assets/web/sv-armoire.jpg",
  },
  {
    ville: "Toulouse",
    titre: "Hub Toulouse",
    couverture: "Haute-Garonne, Bordeaux, Gironde, Charente",
    chemin: "/implantations/toulouse/",
    image: "/assets/web/ph-robots-solaire.jpg",
  },
];

const PANCARTE: CSSProperties = {
  position: "absolute",
  left: 12,
  right: 12,
  bottom: 12,
  padding: "16px 18px",
  borderRadius: 18,
  background: "rgba(28,27,25,.42)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  border: "1px solid rgba(255,255,255,.18)",
};

export default function HubsAccueil({ hubs = HUBS }: Proprietes) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 24,
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
              marginBottom: 14,
            }}
          >
            Nos hubs
          </div>
          <h2
            style={{
              font: "600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
              letterSpacing: "-.045em",
              margin: 0,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            Des hubs partout en France
          </h2>
        </div>
        <Link
          href="/implantations/"
          style={{ font: "600 14.5px var(--fb)", color: "#ff7c3c" }}
        >
          Toutes nos implantations &rarr;
        </Link>
      </div>

      {/* Rail à défilement horizontal. La maquette duplique la liste pour un
          défilement automatique piloté en JS : sans ce moteur, la duplication
          ne produirait que des liens en double. Le rail reste parcourable à la
          souris, au doigt et au clavier (le focus y fait défiler). */}
      <div
        className="mg-autorail"
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "0 40px",
        }}
      >
        {hubs.map((hub) => (
          <Link
            key={hub.chemin}
            href={hub.chemin}
            className={styles.carte}
            style={{
              position: "relative",
              flex: "none",
              width: 300,
              height: 400,
              borderRadius: "var(--rad)",
              overflow: "hidden",
              background: "#1c1b19",
              transition: "transform var(--tr)",
            }}
          >
            <Image
              src={hub.image}
              alt=""
              fill
              sizes="(max-width: 760px) 86vw, 320px"
              style={{
                objectFit: "cover",
                display: "block",
                filter: "saturate(var(--sat)) contrast(1.04)",
              }}
            />
            <div style={PANCARTE}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "#fff",
                  color: "#ff7c3c",
                  font: "600 12px var(--fb)",
                  marginBottom: 10,
                }}
              >
                {hub.ville}
              </span>
              <div
                style={{
                  font: "600 19px/1.25 var(--ft)",
                  letterSpacing: "-.02em",
                  color: "#fff",
                }}
              >
                {hub.titre}
              </div>
              <div
                style={{
                  font: "400 13px/1.45 var(--fb)",
                  color: "rgba(255,255,255,.78)",
                  marginTop: 4,
                }}
              >
                {hub.couverture}
              </div>
              <div
                style={{
                  font: "600 13px var(--fb)",
                  color: "#ff7c3c",
                  marginTop: 10,
                }}
              >
                Voir le hub &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
