import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./HubsAccueil.module.css";
import bordeaux from "./hubs/bordeaux.jpg";
import lille from "./hubs/lille.jpg";
import lyon from "./hubs/lyon.jpg";
import marseille from "./hubs/marseille.jpg";
import nantes from "./hubs/nantes.jpg";
import paris from "./hubs/paris.jpg";
import strasbourg from "./hubs/strasbourg.jpg";
import toulouse from "./hubs/toulouse.jpg";

export interface HubAccueil {
  /** Ville, affichée dans la pastille blanche. */
  ville: string;
  titre: string;
  /** Territoires couverts, une seule ligne. */
  couverture: string;
  chemin: string;
  image: string | StaticImageData;
  alt: string;
}

interface Proprietes {
  hubs?: readonly HubAccueil[];
}

/**
 * Les dix hubs de la maquette autonome, dans son ordre, textes et photos
 * compris (relevé du 08/10 ; l'ancien relevé, sur `accueil-rendu.html` du
 * 02/10, n'en comptait que six et rattachait Bordeaux à Toulouse).
 *
 * Huit photos de ville n'existent que dans la maquette : extraites telles
 * quelles dans `./hubs/`, importées statiquement (next/image les sert à la
 * taille de la carte). Metz et Dijon emploient des fichiers déjà présents
 * dans `public/`, identiques octet pour octet à ceux de la maquette.
 */
const HUBS: readonly HubAccueil[] = [
  {
    ville: "Lyon",
    titre: "Hub Lyon",
    couverture: "Siège · Grenoble, Saint-Étienne, Valence, Haute-Savoie",
    chemin: "/implantations/lyon/",
    image: lyon,
    alt: "Lyon, la basilique de Fourvière au coucher du soleil",
  },
  {
    ville: "Paris",
    titre: "Hub Paris",
    couverture: "Essonne, Rouen",
    chemin: "/implantations/paris/",
    image: paris,
    alt: "Paris et la tour Eiffel",
  },
  {
    ville: "Lille",
    titre: "Hub Lille",
    couverture: "Hauts-de-France",
    chemin: "/implantations/lille/",
    image: lille,
    alt: "Façades du centre de Lille",
  },
  {
    ville: "Strasbourg",
    titre: "Hub Strasbourg",
    couverture: "Alsace, Mulhouse",
    chemin: "/implantations/strasbourg/",
    image: strasbourg,
    alt: "Strasbourg, les Ponts couverts",
  },
  {
    ville: "Nantes",
    titre: "Hub Nantes",
    couverture: "Loire-Atlantique, Rennes, Brest",
    chemin: "/implantations/nantes/",
    image: nantes,
    alt: "Vue aérienne de Nantes",
  },
  {
    ville: "Toulouse",
    titre: "Hub Toulouse",
    couverture: "Haute-Garonne, Albi, Tarbes, Agen",
    chemin: "/implantations/toulouse/",
    image: toulouse,
    alt: "Toulouse, la Garonne et la ville rose",
  },
  {
    ville: "Marseille",
    titre: "Hub Marseille",
    couverture: "Fos, Toulon, Nîmes, Perpignan",
    chemin: "/implantations/marseille/",
    image: marseille,
    alt: "Marseille, le Vieux-Port",
  },
  {
    ville: "Bordeaux",
    titre: "Hub Bordeaux",
    couverture: "Gironde, Mérignac, Charente",
    chemin: "/implantations/bordeaux/",
    image: bordeaux,
    alt: "Bordeaux, les quais de la Garonne",
  },
  {
    ville: "Metz",
    titre: "Hub Metz",
    couverture: "Moselle, Nancy, sillon lorrain",
    chemin: "/implantations/maintenance-industrielle-metz/",
    image: "/assets/web/mq-dcd9cac6ffbf.jpg",
    alt: "Site industriel en Lorraine",
  },
  {
    ville: "Dijon",
    titre: "Hub Dijon",
    couverture: "Côte-d’Or, Besançon, Chalon",
    chemin: "/implantations/maintenance-industrielle-dijon/",
    image: "/assets/web/x-cablerie.jpg",
    alt: "Atelier industriel en Bourgogne",
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
              // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
              color: "var(--acc-ink)",
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
          // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
          style={{ font: "600 14.5px var(--fb)", color: "var(--acc-ink)" }}
        >
          Toutes nos implantations &rarr;
        </Link>
      </div>

      {/* Rail à défilement horizontal. La liste est écrite DEUX FOIS, comme la
          maquette (3834 px de défilement pour 1280 px visibles) : le moteur de
          `components/site/Moteurs.tsx` revient à zéro quand il atteint la fin,
          et sans ce second exemplaire la coupure se voit. Le doublon est
          décoratif, d'où `aria-hidden` et `tabIndex={-1}` : même traitement que
          `MarqueeClients`, rien n'est annoncé ni atteint deux fois. */}
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
        {[0, 1].flatMap((passe) =>
          hubs.map((hub) => (
            <Link
              key={`${hub.chemin}-${passe}`}
              href={hub.chemin}
              className={styles.carte}
              aria-hidden={passe === 1 || undefined}
              tabIndex={passe === 1 ? -1 : undefined}
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
                alt={passe === 0 ? hub.alt : ""}
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
                    // Contraste AA : l'orange de marque donnait 2,56:1 sur ce fond clair, --acc-ink donne 8,94:1.
                    color: "var(--acc-ink)",
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
          )),
        )}
      </div>
    </section>
  );
}
