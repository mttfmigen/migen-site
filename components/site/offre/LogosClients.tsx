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
 *
 * 09/10, « IL NE DOIT Y EN AVOIR QU'UNE » (Mehdi) : CE BANDEAU RESTE ICI, et
 * c'est mesuré, pas supposé. Le doublon qu'il a vu était celui des pages de
 * secteur, où la grille du secteur et ce défilement se suivaient à 216 px dans
 * la même section, en tuiles blanches identiques, avec 115 marques communes sur
 * 115. `secteur/LogosSecteur.tsx` retire le défilement dès que la grille est là
 * et porte l'écart déclaré.
 *
 * SUR LES SEPT AUTRES FAMILLES (offres, hub offres, expertises, domaine,
 * spécialité, ville, implantations), relevé au navigateur le 09/10 sur quinze
 * pages : ce bandeau est LE SEUL bloc de tuiles-logos clients de la page. Le
 * second bloc que l'inventaire comptait est le rail « 08 Références », des
 * cartes d'étude de cas (photo, client, titre, date) portant une pastille de
 * logo de 22 px, posé 3 900 à 5 900 px plus bas, hors du même écran. Deux à
 * huit de ses marques sont aussi dans le bandeau, mais une carte d'étude de cas
 * ne se retire pas parce que son client défile ailleurs, et retirer ces marques
 * du bandeau le rendrait dépendant de la page, donc faux au regard de « plus de
 * 200 clients ». Rien n'est donc changé ici, et c'est une décision, pas un
 * oubli. Le bloc « Marques et constructeurs », lui, nomme des équipements
 * maintenus, pas des clients : ce n'est pas le même propos.
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
