import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";

import styles from "./PageDomaine.module.css";

/**
 * Section « Secteurs de l'expertise » du gabarit 09 Domaine, relevée dans
 * `maquette/rendu/expertises--robotique.html` (section 10) : en-tête en deux
 * colonnes .8fr/1.2fr (surtitre « Par secteur d'activité », H2 « Même
 * expertise, contraintes différentes », phrase à droite), puis six cartes
 * photographiques sombres en grille de trois, chacune liant son secteur.
 *
 * LA COPIE EST FIXE, ET C'EST MESURÉ : la section est identique au caractère
 * près sur les 11 captures du gabarit (empreinte MD5 eaf33800, relevé du
 * 07/10). Elle vit donc ici, comme les hubs de `Reassurance` ou les logos de
 * `LogosClients`, et non dans la donnée de chaque page.
 *
 * LES PHOTOS sont celles que la capture nomme en clair
 * (`url("assets/web/…")`) : rien n'est posé au plus proche.
 *
 * LE SURVOL vient de la maquette vivante (classe générée `scp17`, relevée le
 * 07/10 sur localhost:4352) : translateY(-4px), texte blanc maintenu. Posé en
 * `:hover` et `:focus-visible` dans `PageDomaine.module.css`, la transition
 * `transform var(--tr)` étant celle de la capture.
 */

interface CarteSecteur {
  titre: string;
  texte: string;
  href: string;
  photo: string;
}

/** Les six cartes, mot pour mot et photo pour photo depuis la capture. */
const SECTEURS: readonly CarteSecteur[] = [
  {
    titre: "Agroalimentaire",
    texte:
      "Hygiène, nettoyages en place, cadences saisonnières : l’intervention se cale sur la production, pas l’inverse.",
    href: "/secteurs/agroalimentaire/",
    photo: "/assets/web/x-tech-portrait.jpg",
  },
  {
    titre: "Automobile",
    texte:
      "Des lignes à forte cadence où chaque minute d’arrêt se compte en véhicules non produits.",
    href: "/secteurs/automobile/",
    photo: "/assets/web/x-auto-ligne.jpg",
  },
  {
    titre: "Logistique",
    texte:
      "Convoyeurs, trieurs et pics de saison : le site tourne sans interruption, la maintenance aussi.",
    href: "/secteurs/logistique/",
    photo: "/assets/web/x-logistique-entrepot.jpg",
  },
  {
    titre: "Pharmaceutique",
    texte:
      "Traçabilité, qualification et zones propres : chaque intervention est documentée.",
    href: "/secteurs/pharmaceutique/",
    photo: "/assets/web/x-elec-cablage.jpg",
  },
  {
    titre: "Chimie",
    texte:
      "Risque chimique, zones ATEX, consignations strictes : des habilitations à jour avant d’entrer.",
    href: "/secteurs/chimie/",
    photo: "/assets/web/ph-hero-raffinerie.jpg",
  },
  {
    titre: "Aéronautique",
    texte:
      "Précision, conformité et traçabilité des pièces, du bureau d’études à l’atelier.",
    href: "/secteurs/aeronautique/",
    photo: "/assets/web/x-robotique.jpg",
  },
] as const;

const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: ".8fr 1.2fr",
  gap: 40,
  alignItems: "end",
  marginBottom: 26,
};

/** Le surtitre de CETTE section : marge 14, pas les 16 du jeton partagé. */
const SURTITRE_SECTEURS: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 14,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const PHRASE: CSSProperties = {
  font: "400 15.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "56ch",
};

const CARTE: CSSProperties = {
  position: "relative",
  display: "block",
  minHeight: 200,
  borderRadius: 22,
  overflow: "hidden",
  background: "rgb(28, 27, 25)",
  color: "#fff",
  transition: "transform var(--tr)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.92),rgba(18,17,16,.25) 70%)",
};

const CORPS: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: 8,
  minHeight: 200,
  padding: 20,
};

export default function SecteursDomaine() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={SURTITRE_SECTEURS}>Par secteur d’activité</div>
            <h2 style={TITRE}>Même expertise, contraintes différentes</h2>
          </div>
          <p style={PHRASE}>
            Un roulement se change de la même façon partout. Ce qui change,
            c’est le site&nbsp;: ses règles d’accès, sa cadence, ce qu’un arrêt
            coûte. Nos techniciens connaissent ces contraintes avant d’arriver.
          </p>
        </div>
        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 12,
          }}
        >
          {SECTEURS.map((secteur) => (
            <Link
              key={secteur.href}
              href={secteur.href}
              prefetch={false}
              className={styles.carteSecteur}
              style={CARTE}
            >
              <Image
                src={secteur.photo}
                alt=""
                fill
                sizes="(max-width: 1000px) 100vw, 380px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) brightness(.68)",
                }}
              />
              <div aria-hidden="true" style={VOILE} />
              <div style={CORPS}>
                <span
                  style={{
                    font: "600 18px/1.2 var(--ft)",
                    letterSpacing: "-.025em",
                  }}
                >
                  {secteur.titre}
                </span>
                <span
                  style={{
                    font: "400 13px/1.5 var(--fb)",
                    color: "rgba(255,255,255,.74)",
                  }}
                >
                  {secteur.texte}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
