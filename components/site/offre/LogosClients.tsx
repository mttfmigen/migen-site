import Image from "next/image";
import type { CSSProperties } from "react";

import { LOGOS_MAQUETTE as LOGOS } from "@/components/site/accueil/MarqueeClients";
import { SURTITRE } from "@/components/site/blocs/habillage";

/**
 * « Ils nous font confiance », section « 02 Logos » de la capture
 * (`maquette/rendu/offres--residence.html`) : un surtitre, puis le défilement
 * continu des logos clients.
 *
 * La piste reprend les classes `mg-marquee` / `mg-track` / `mg-logo` de
 * `app/globals.css`, déjà posées pour l'accueil : même animation, même pause
 * au survol. Le composant `accueil/MarqueeClients` n'est pas réutilisé tel
 * quel : son surtitre est figé sur une autre phrase, et il est hors du
 * périmètre de ce chantier. La LISTE des logos, elle, est IMPORTÉE de ce même
 * fichier : une seule source, un logo ajouté côté accueil suit ici sans
 * recopie ni dérive silencieuse.
 */

const MASQUE =
  "linear-gradient(to right,transparent,#000 9%,#000 91%,transparent)";

/** Le surtitre partagé du site, posé sur une ligne flexible : pas de marge. */
const SURTITRE_LIGNE: CSSProperties = {
  ...SURTITRE,
  marginBottom: 0,
  flex: "none",
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

export default function LogosClients() {
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
        {/* La liste est écrite deux fois : l'animation translate la piste de
            -50 %, le second exemplaire comble le vide pendant la boucle. Le
            doublon porte `alt=""` : décoratif, rien à annoncer deux fois. */}
        <div
          className="mg-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "max-content",
            /* 40 s : durée RENDUE par le gabarit offre de la maquette (piste
               `g3-track`, getComputedStyle du 06/10), là où l'accueil garde la
               durée de 60 s. */
            animation: "mgMarquee 40s linear infinite",
            animationPlayState: "var(--mq-play, running)",
          }}
        >
          {[0, 1].flatMap((passe) =>
            LOGOS.map((logo) => (
              <span key={`${logo.src}-${passe}`} className="mg-logo" style={PASTILLE}>
                <Image
                  src={logo.src}
                  alt={passe === 0 ? logo.alt : ""}
                  width={120}
                  height={34}
                  style={IMAGE}
                />
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
