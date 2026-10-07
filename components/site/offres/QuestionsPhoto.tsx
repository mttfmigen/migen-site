import Image from "next/image";
import type { CSSProperties } from "react";

import { LARGEUR } from "@/components/site/blocs/habillage";
import type { QuestionsPhotoOffres } from "@/types/offres";

/**
 * La FAQ du hub des offres, variante « 09 Questions · photo » de la maquette :
 * c'est le nom que porte la section dans l'export du client (`data-screen-label`).
 *
 * Carte sombre aux coins arrondis, photo d'atelier en fond sous un dégradé qui
 * s'éclaircit vers la droite, titre blanc à gauche avec le lien « Poser une
 * autre question », et les six dépliants en cartes blanches translucides à
 * droite. Les valeurs viennent du rendu de la maquette, relevées élément par
 * élément le 06/10 (`maquette/rendu/offres.html`, gabarit 1120 à 1136).
 *
 * La photo est celle de l'export autonome du client (ressource « r7 » de son
 * paquet, extraite octet pour octet), posée dans `public/assets/web/faq-offres.jpg`.
 *
 * `<details>`/`<summary>` plutôt que l'accordéon piloté de la maquette : même
 * choix que `Objections`, et pour les mêmes raisons, clavier, lecteurs d'écran
 * et contenu lisible par Google sans JavaScript.
 */

const CARTE: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "rgb(28, 27, 25)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg, rgba(18,17,16,.88) 0%, rgba(18,17,16,.62) 45%, rgba(18,17,16,.32) 100%)",
};

const GRILLE: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(0, .8fr) minmax(0, 1.2fr)",
  gap: 36,
  padding: 44,
};

const SURTITRE_BLOC: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgb(255, 124, 60)",
  marginBottom: 14,
};

const TITRE_BLOC: CSSProperties = {
  font: "600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  marginBottom: 16,
};

const CHAPEAU_BLOC: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "rgba(255,255,255,.78)",
  margin: "0 0 18px",
};

const LIEN: CSSProperties = {
  font: "600 14.5px var(--fb)",
  color: "rgb(255, 124, 60)",
};

const PLI: CSSProperties = {
  borderRadius: 18,
  background: "rgba(255,255,255,.9)",
  backdropFilter: "blur(18px)",
};

const QUESTION: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "18px 22px",
  font: "600 16px/1.35 var(--fb)",
  color: "var(--ink)",
};

const PLUS: CSSProperties = {
  color: "rgb(255, 124, 60)",
  font: "400 20px/1 var(--fb)",
  flex: "0 0 auto",
};

const REPONSE: CSSProperties = {
  padding: "0 22px 18px",
  font: "400 14.5px/1.6 var(--fb)",
  color: "rgb(74, 72, 69)",
};

export default function QuestionsPhoto({
  donnees,
}: {
  donnees: QuestionsPhotoOffres;
}) {
  if (donnees.questions.length === 0) return null;

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div style={CARTE}>
          <Image
            src={donnees.photo}
            alt=""
            fill
            sizes="1200px"
            style={{ objectFit: "cover" }}
          />
          <div style={VOILE} />
          <div className="mg-r2" style={GRILLE}>
            <div>
              <div style={SURTITRE_BLOC}>{donnees.surtitre}</div>
              <h2 style={TITRE_BLOC}>{donnees.titre}</h2>
              <p style={CHAPEAU_BLOC}>{donnees.chapeau}</p>
              <a href={donnees.lienHref} style={LIEN}>
                {donnees.lienTexte} →
              </a>
            </div>
            <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
              {donnees.questions.map((q) => (
                <details key={q.question} className="cx-faq" style={PLI}>
                  <summary style={QUESTION}>
                    {q.question}
                    <span className="cx-plus" style={PLUS}>
                      +
                    </span>
                  </summary>
                  <div style={REPONSE}>{q.reponse}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
