import Image from "next/image";
import type { CSSProperties } from "react";

import { LOGOS_MAQUETTE as LOGOS } from "@/components/site/accueil/MarqueeClients";
import { SURTITRE } from "@/components/site/blocs/habillage";
import type { LogoSecteur } from "@/types/secteur";

/**
 * « 02 Logos » d'une page de secteur : celui de `offre/LogosClients`, plus la
 * GRILLE DES CLIENTS DU SECTEUR que la source n'affiche que sur ces pages
 * (`MigenExpertise.dc.html` l. 131, `sc-if hasSecLogos`, gabarits 100 à 105 de
 * la capture) entre le surtitre et le défilement : un titre (« Ils nous
 * confient leurs lignes agroalimentaires »), puis une tuile blanche par client.
 *
 * POURQUOI PAS `LogosClients` : la grille s'insère AU MILIEU de sa section, et
 * la capture n'en porte qu'une. Ce composant reprend donc son en-tête et son
 * défilement au caractère près (même liste importée, mêmes classes
 * `mg-marquee` / `mg-track` / `mg-logo` d'`app/globals.css`, même pause et même
 * loupe au survol) et pose la grille entre les deux. Sans `logos`, il rend
 * exactement `LogosClients`.
 *
 * LES LOGOS DE LA GRILLE sont servis TELS QUELS (`unoptimized`) : ce sont les
 * fichiers aux mêmes octets que ceux de la maquette vivante, relevés par
 * empreinte, et leur taille propre est celle que la capture borne à 120×40.
 */

const MASQUE = "linear-gradient(to right,transparent,#000 9%,#000 91%,transparent)";

const SURTITRE_LIGNE: CSSProperties = { ...SURTITRE, marginBottom: 0, flex: "none" };

const TITRE_GRILLE: CSSProperties = {
  font: "600 clamp(22px,2.2vw,28px)/1.2 var(--ft)",
  letterSpacing: "-.03em",
  marginBottom: 18,
};

const TUILE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 84,
  padding: "0 18px",
  borderRadius: 18,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
};

const LOGO_TUILE: CSSProperties = {
  maxHeight: 40,
  maxWidth: 120,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
};

const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  height: 64,
  minWidth: 132,
  padding: "0 20px",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
};

const IMAGE: CSSProperties = {
  maxHeight: 34,
  maxWidth: 120,
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
  mixBlendMode: "multiply",
};

export interface ProprietesLogosSecteur {
  titre?: string;
  logos?: readonly LogoSecteur[];
}

export default function LogosSecteur({ titre, logos = [] }: ProprietesLogosSecteur) {
  return (
    <section style={{ padding: "64px 0 0" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 26px",
          padding: "0 40px",
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={SURTITRE_LIGNE}>Ils nous font confiance</span>
      </div>

      {logos.length > 0 ? (
        <div style={{ maxWidth: 1200, margin: "0 auto 22px", padding: "0 40px" }}>
          {titre ? <div style={TITRE_GRILLE}>{titre}</div> : null}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: 10,
            }}
          >
            {logos.map((logo) => (
              <span key={logo.nom} style={TUILE}>
                <Image
                  src={logo.src}
                  alt={logo.nom}
                  width={120}
                  height={40}
                  unoptimized
                  style={{ ...LOGO_TUILE, filter: logo.filtre ?? "none" }}
                />
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="mg-marquee"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "16px 0",
          WebkitMaskImage: MASQUE,
          maskImage: MASQUE,
        }}
      >
        {/* Écrite deux fois, comme `LogosClients` : la piste translate de
            -50 %, le second exemplaire, décoratif, comble la boucle. */}
        <div
          className="mg-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "max-content",
            animation: "mgMarquee 40s linear infinite",
            animationPlayState: "var(--mq-play, running)",
          }}
        >
          {[0, 1].flatMap((passe) =>
            LOGOS.map((logo) => (
              <span key={`${logo.src}-${passe}`} className="mg-logo" style={PASTILLE}>
                <Image src={logo.src} alt={passe === 0 ? logo.alt : ""} width={120} height={34} style={IMAGE} />
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
