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
 * TROU SIGNALÉ, ET IL VIENT DE LA MAQUETTE : la capture dessine une photo en
 * seconde colonne (`assets/web/x-tech-portrait.jpg`), mais ce fichier
 * N'EXISTE PAS dans le paquet d'assets de la maquette (son serveur répond une
 * page d'erreur de 469 octets) ni dans `public/assets/web/`. Poser une autre
 * photo à sa place serait une association inventée (CLAUDE.md §13) : la
 * section est donc rendue sur une colonne, et la photo reste à réclamer.
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

export default function ReponseDirecte({
  titre,
  texte,
}: ProprietesReponseDirecte) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 16 }}>Pourquoi Migen ?</div>
        <h2 style={TITRE}>{titre}</h2>
        {texte ? <p style={TEXTE}>{texte}</p> : null}
      </div>
    </section>
  );
}
