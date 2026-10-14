import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";

/**
 * Écran « 02 Réponse directe » de la maquette, porté le 07/10 depuis
 * `maquette/rendu/offres--full-service.html` (bloc 287, section 4 des 21).
 *
 * POURQUOI IL N'EXISTAIT PAS. La page pilote validée le 06/10
 * (`/offres/residence/`, 17 sections) ne l'a pas. Les pages d'offre dont la
 * maquette porte une réponse en une phrase l'ont, juste après la réassurance
 * et avant la première bande d'appel : surtitre « Pourquoi Migen ? », la
 * réponse en H2, un paragraphe.
 *
 * MODIFICATION D'UN COMPOSANT PARTAGÉ PAR LES 22 PAGES : ajout seul, aucune
 * retouche des composants existants. Sans `reponseTitre`, `PageOffre` ne le
 * monte pas, donc les 21 autres pages ne bougent pas.
 *
 * LE SURTITRE EST FIXE, comme ceux de `ProblemeOffre` et de `PointsOffre` :
 * la capture écrit « Pourquoi Migen ? ». Le jour où une page en écrit un
 * autre, il devient un champ, pas avant.
 *
 * LA PHOTO DE SECONDE COLONNE (`assets/web/x-tech-portrait.jpg`) manquait
 * au paquet le 07/10 : le colis de passation Claude Design l'apporte, elle est
 * dans `public/assets/web/`. Rendue comme la capture (08/10) : grille
 * 1,1fr / 0,9fr, image de fond de 360 px de haut minimum, rôle `img` et
 * libellé repris tels quels.
 */

export interface ProprietesReponseDirecte {
  titre: string;
  texte?: string;
}

const TITRE: CSSProperties = {
  font: "600 calc(clamp(24px,2.4vw,32px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  margin: "0 0 14px",
  maxWidth: "22ch",
  textWrap: "balance",
};

const TEXTE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "56ch",
  textWrap: "pretty",
};

const GRILLE: CSSProperties = {
  ...LARGEUR,
  display: "grid",
  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
  gap: 48,
  alignItems: "center",
};

const PHOTO: CSSProperties = {
  minHeight: 360,
  height: "100%",
  borderRadius: "var(--rad)",
  backgroundColor: "var(--ph)",
  backgroundImage: "url('/assets/web/x-tech-portrait.jpg')",
  backgroundPosition: "center",
  backgroundSize: "cover",
  filter: "saturate(var(--sat)) contrast(1.05)",
};

export default function ReponseDirecte({
  titre,
  texte,
}: ProprietesReponseDirecte) {
  return (
    /* `data-couverture-section`, `data-mm-*`, `data-couverture-photo` : son
       habit de corps de carte au téléphone, quand `PageOffre` le range dans la
       carte « 01 » (`PageOffre.module.css`). Au-dessus de 880 px, rien. */
    <section data-mobile-apres-sections="" data-couverture-section="" style={SECTION}>
      <div className="mg-r2" style={GRILLE}>
        <div>
          {/* Au téléphone, dans la carte « 01 » : ni sur-titre, et le titre
              et sa suite en un paragraphe gras, comme la maquette mobile v2
              (`app/globals.css` § 13). Au bureau, rien ne change. */}
          <div data-doublon-mobile="" style={{ ...SURTITRE, marginBottom: 16 }}>
            Pourquoi Migen ?
          </div>
          <h2 data-mm-lead="" {...(texte ? { "data-mm-phrase": "" } : {})} style={TITRE}>
            {titre}
          </h2>
          {texte ? <p data-mm-texte="" data-mm-suite="romain" style={TEXTE}>{texte}</p> : null}
        </div>
        <div
          data-couverture-photo=""
          role="img"
          aria-label="Technicien migen en intervention sur une ligne de production"
          style={PHOTO}
        />
      </div>
    </section>
  );
}
