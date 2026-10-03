import type { CSSProperties } from "react";

import { PARTENAIRES, TITRE_H1_PARTENAIRES, type Partenaire } from "./donnees";

/**
 * Ouverture de l'écran « Partenaires » : la promesse, puis les partenaires nommés.
 *
 * Maquette `maquette/accueil-rendu.html`, lignes 6033 à 6061. Deux sections de
 * la maquette dans un seul fichier : la grille de cartes est le sujet que le
 * titre annonce, et les deux partagent la même liste.
 *
 * Composant serveur : aucun état, aucun écouteur.
 */

interface Proprietes {
  /** Les partenaires affichés. Par défaut, ceux de la maquette. */
  partenaires?: readonly Partenaire[];
}

const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 20,
};

const VERRE: CSSProperties = {
  borderRadius: "var(--rad)",
  padding: "36px 38px 38px",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 24px 56px -34px rgba(0,0,0,.32)",
};

/** Cartouche blanc qui accueille le logo du partenaire. */
const CARTOUCHE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 180,
  height: 72,
  borderRadius: 10,
  background: "#fff",
  border: "1px solid var(--line)",
  padding: "12px 18px",
};

export default function OuverturePartenaires({
  partenaires = PARTENAIRES,
}: Proprietes) {
  return (
    <>
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}
      >
        <div style={SURTITRE}>Partenaires</div>
        <h1
          style={{
            font: "600 calc(clamp(38px,4.6vw,70px) * var(--ts))/1.03 var(--ft)",
            letterSpacing: "-.045em",
            margin: 0,
            maxWidth: "19ch",
            textWrap: "balance",
          }}
        >
          {TITRE_H1_PARTENAIRES}
        </h1>
        <p
          style={{
            font: "400 18.5px/1.6 var(--fb)",
            color: "var(--ink2)",
            margin: "24px 0 0",
            maxWidth: "58ch",
          }}
        >
          Nous ne savons pas tout faire. Pour la GMAO, l’intralogistique ou
          les prestations connexes, nous travaillons avec des acteurs français
          que nous connaissons sur le terrain.
        </p>
      </section>

      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 0" }}
      >
        <div data-reveal="" style={{ display: "grid", gap: 16 }}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {partenaires.map((partenaire) => (
              <div key={partenaire.nom} style={VERRE}>
                {partenaire.logo ? (
                  <span style={CARTOUCHE}>
                    {/* `img` et non `next/image` : les dimensions intrinsèques
                        de ces logos ne sont pas connues du dépôt. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={partenaire.logo}
                      alt={partenaire.nom}
                      loading="lazy"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </span>
                ) : null}
                <div
                  style={{
                    font: "600 21px var(--ft)",
                    letterSpacing: "-.03em",
                    margin: "22px 0 10px",
                  }}
                >
                  {partenaire.nom}
                </div>
                <div
                  style={{
                    font: "600 11.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: 14,
                  }}
                >
                  {partenaire.domaine}
                </div>
                {/* Marge basse nulle : la maquette réservait 18px sous ce
                    paragraphe pour un lien « Lire l'annonce » dont la cible
                    n'existe pas sur le site. Le lien n'est pas posé, la
                    réserve non plus. */}
                <p
                  style={{
                    font: "400 15px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                  }}
                >
                  {partenaire.corps}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
