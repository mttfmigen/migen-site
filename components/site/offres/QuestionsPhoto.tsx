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
  borderRadius: 28,
  overflow: "hidden",
  background: "rgb(28, 27, 25)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  // Relevé le 07/10 sur la maquette qui tourne, pas estimé : le voile allait
  // de .88 à .32, la maquette va de .92 à .62. La photo reste donc nettement
  // plus sombre à droite, et les cartes de questions s'y détachent moins.
  background:
    "linear-gradient(90deg, rgba(18,17,16,.92) 0%, rgba(18,17,16,.8) 50%, rgba(18,17,16,.62) 100%)",
};

/** La pastille orange pleine des pages d'offres, relevée sur leur capture. */
const PASTILLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "14px 24px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "rgba(255, 124, 60, .9) 0 12px 30px -12px",
  textDecoration: "none",
};

const GRILLE: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(0, .8fr) minmax(0, 1.2fr)",
  // 52px et non 36 : mesuré sur la maquette (392px + 52 + 588px dans 1120).
  gap: 52,
  alignItems: "start",
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
  marginBottom: 22,
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

/**
 * Le pli, RELEVÉ LE 07/10 sur la maquette qui tourne, valeur par valeur.
 *
 * L'erreur qu'on corrige : nos cartes étaient blanches à 90 %, donc opaques,
 * et masquaient la photo. La maquette les pose à 10 % de blanc sur un flou :
 * c'est du verre, on voit l'atelier au travers, et tout le texte est blanc.
 * C'est ce qui faisait 30 % de divergence sur cette section.
 */
const PLI: CSSProperties = {
  borderRadius: 18,
  background: "rgba(255,255,255,.1)",
  border: "1px solid rgba(255,255,255,.18)",
  backdropFilter: "blur(22px) saturate(1.5)",
};

const QUESTION: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
  padding: "20px 24px",
  font: "400 16px/1.4 var(--fb)",
  color: "#fff",
};

const PLUS: CSSProperties = {
  // Pastille RONDE de 30px, relevée sur la maquette : le « + » blanc repose
  // sur un cercle gris translucide. À l'ouverture, globals.css tourne la
  // pastille de 45 degrés et la passe à l'orange : sur un cercle, la rotation
  // est invisible et le « + » devient une croix, exactement le dessin de la
  // maquette. L'ancien badge nu donnait un losange orange, faux.
  width: 30,
  height: 30,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,.1)",
  color: "#fff",
  font: "400 20px/1 var(--fb)",
  flex: "0 0 auto",
};

const REPONSE: CSSProperties = {
  padding: "0 24px 22px",
  font: "400 15px/1.7 var(--fb)",
  color: "rgba(255,255,255,.8)",
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
              {donnees.chapeau ? (
                <p style={CHAPEAU_BLOC}>{donnees.chapeau}</p>
              ) : null}
              {donnees.bouton ? (
                <a href={donnees.lienHref} style={PASTILLE}>
                  {donnees.lienTexte}
                </a>
              ) : (
                <a href={donnees.lienHref} style={LIEN}>
                  {donnees.lienTexte} →
                </a>
              )}
            </div>
            <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
              {donnees.questions.map((q, i) => (
                <details
                  key={q.question}
                  className="cx-faq"
                  style={PLI}
                  // La maquette ouvre la PREMIÈRE question, sa réponse est
                  // visible d'emblée. On ne l'ouvre que si elle a une réponse :
                  // sur plusieurs pages d'offres la première réponse est vide,
                  // parce que le contrat interdit de copier son prix. Ouvrir un
                  // pli vide donnerait une carte cassée là où la maquette
                  // montre un paragraphe.
                  open={i === 0 && Boolean(q.reponse.trim())}
                >
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
