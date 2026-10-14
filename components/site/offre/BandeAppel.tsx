import type { CSSProperties } from "react";

import { LARGEUR } from "@/components/site/blocs/habillage";

import { TELEPHONE_AFFICHE, TELEPHONE_HREF } from "./telephone-maquette";
import styles from "./PageOffre.module.css";

/**
 * La bande d'appel de la capture, posée trois fois par le gabarit
 * (sections « Appel · domaines », « Appel · offre », « Appel · références »
 * de `maquette/rendu/offres--residence.html`) : une puce, la mention des
 * horaires, un bouton vers le panneau du héros.
 *
 * DEUX VARIANTES, et c'est la capture qui le dit (relevé du 06/10) :
 * « Appel · domaines » et « Appel · références » sont claires (fond
 * `var(--acc-w)`, bordure orangée, texte `var(--ink1)`) ; « Appel · offre »
 * est SOMBRE (bloc `data-dc-tpl` 533 : fond `var(--panel)`, pas de bordure,
 * texte `rgba(255,255,255,0.8)`). Le bouton orange est le même partout.
 */

/**
 * DEUX CHAMPS SONT DEVENUS OPTIONNELS LE 07/10, pour `/offres/zero-arret/`,
 * dont la capture écrit une autre phrase et un autre bouton. Les défauts
 * reproduisent à l'identique le rendu validé de `/offres/residence/`.
 */
export interface ProprietesBandeAppel {
  /**
   * La phrase à gauche, la mention des horaires du corpus.
   *
   * ABSENTE, la bande ne porte que son bouton. C'est le cas de
   * `/offres/zero-arret/` : sa capture écrit ici un délai chiffré que le
   * contrat du projet interdit, la phrase n'est donc pas rendue et le trou est
   * déclaré dans `scripts/verifie-offre-rendu.mjs`.
   */
  mention?: string;
  /** Le libellé du bouton. À défaut, celui de la capture de la page pilote. */
  bouton?: string;
  /** Le fond de la bande. La capture pose « sombre » sur « Appel · offre ». */
  variante?: "claire" | "sombre";
}

/* Relevé des captures du 07/10 21h12 : `padding: 22px 24px 22px 30px` dans
   136 captures de `maquette/rendu/`, aucune à 11 px. Le relevé antérieur à
   11 px (bureau-etude-electrique, plus tôt le 07/10) est remplacé. */
const BANDE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  padding: "22px 24px 22px 30px",
  borderRadius: 28,
};

const BANDE_CLAIRE: CSSProperties = {
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
};

const BANDE_SOMBRE: CSSProperties = {
  background: "var(--panel)",
};

const MENTION_CLAIRE: CSSProperties = { color: "var(--ink1)" };

const MENTION_SOMBRE: CSSProperties = { color: "rgba(255,255,255,.8)" };

const PUCE: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "var(--acc)",
  boxShadow: "0 0 0 6px rgba(255,124,60,.18)",
  flex: "0 0 auto",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 24px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

/* Le lien téléphone mobile, pastille blanche de la maquette mobile v2
   (dc.html L111). `data-mobile-seulement` : jamais peint au-dessus de 880 px. */
const BOUTON_TEL: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 18px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.1)",
  color: "var(--ink)",
  font: "600 13.5px var(--fb)",
  whiteSpace: "nowrap",
};

export default function BandeAppel({
  mention,
  bouton = "Parler à un chargé d’affaires",
  variante = "claire",
}: ProprietesBandeAppel) {
  const sombre = variante === "sombre";
  return (
    <section style={{ padding: "40px 0 0" }}>
      <div style={LARGEUR}>
        <div style={{ ...BANDE, ...(sombre ? BANDE_SOMBRE : BANDE_CLAIRE) }}>
          {mention ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: "1 1 0%",
                /* `min(260px, 100%)` ET NON `260px` : même correction, même
                   mesure que `AppelOffre`. Les 260 px de la capture tiennent
                   la phrase à gauche du bouton ; en pixels purs ils ne cèdent
                   jamais, et à 320 px, où la bande n'a que 240 px, la mention
                   sortait de la page de 10 et 11 px, trois fois par page sur
                   les onze pages mesurées. Le dessin de bureau ne bouge pas. */
                minWidth: "min(260px, 100%)",
              }}
            >
              <span aria-hidden="true" style={PUCE} />
              <span
                style={{
                  font: "500 15px/1.55 var(--fb)",
                  ...(sombre ? MENTION_SOMBRE : MENTION_CLAIRE),
                }}
              >
                {mention}
              </span>
            </div>
          ) : null}
          {/* SANS PHRASE, LE BOUTON SE CENTRE. ÉCART DÉCLARÉ À LA CAPTURE, et
              c'est la capture elle-même qui l'impose, par ce qu'elle ne prévoit
              pas : ses 244 pages posent TOUJOURS la phrase à gauche de la
              bande, le bouton à droite, les deux fentes occupées. Aucune de ses
              bandes n'est à moitié vide, donc elle ne dit rien de ce cas.

              CE QUE REMPLACE CETTE LIGNE, et pourquoi elle était fausse : elle
              gardait le bouton collé à droite, « là où la capture le pose ».
              Mesuré le 12/10 à 1440 px sur `/travaux-industriels/` et
              `/offres/zero-arret/`, les deux seules pages du gabarit sans
              phrase : bande de 1120 px, bouton de 231 à 244 px, soit 79 % de la
              bande vide, trois fois par page, six bandes creuses en tout. C'est
              le défaut que Mehdi nomme « le bloc d'appel est mal disposé »
              (G14, G15, puis G38 qui le rouvre).

              CENTRER PLUTÔT QUE RÉTRÉCIR : la bande garde exactement la boîte
              de la capture, 1120 px de large et 137 px de haut section
              comprise, mesure inchangée après la correction. Seule la place du
              bouton change, et la fente vide disparaît.

              POURQUOI LA PHRASE MANQUE, et ce n'est pas réparable ici : sur
              `/offres/zero-arret/` la capture y écrit un délai chiffré que le
              contrat du projet interdit ; sur `/travaux-industriels/` elle a
              été retirée du champ `mention` de la fiche le 12/10 (G41), un
              champ que le gabarit sert À LA FOIS au héros et aux trois bandes,
              alors que Mehdi n'avait demandé son retrait que du héros. La
              racine est dans la fiche, pas dans ce composant ; elle est
              signalée, pas corrigée ici. */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              ...(mention ? null : { marginInline: "auto" }),
            }}
          >
            {/* DEUX EXEMPLAIRES DU MÊME BOUTON, UNE ANCRE PAR LARGEUR. Sous
                881 px le panneau `#besoin` du héros est masqué (héros compact
                de la maquette mobile v2) : l'ancre ne défilerait nulle part.
                Le jumeau mobile vise `#mgx-form`, l'appel final, comme la
                maquette envoie « Être rappelé » vers son formulaire de bas de
                page (dc.html L437). Même libellé, même dessin. */}
            <a
              href="#besoin"
              className={`${styles.boutonPrincipal} ${styles.bureauSeulement}`}
              style={BOUTON}
            >
              {bouton}
            </a>
            <a
              href="#mgx-form"
              data-mobile-seulement=""
              className={styles.boutonPrincipal}
              style={BOUTON}
            >
              {bouton}
            </a>
            {/* LE TÉLÉPHONE REVIENT SUR TÉLÉPHONE, là où la maquette mobile
                l'écrit : son écran d'appel entre les sections porte le lien
                `tel:0478337205` à côté du bouton (dc.html L127, « Appeler »),
                et son héros écrit le numéro en toutes lettres (L493). Le
                numéro est celui que le corpus écrit 753 fois
                (`mobile-v2-data.js`). Au-dessus de 880 px, rien : la capture
                de bureau ne le rend pas dans cette bande. */}
            <a data-mobile-seulement="" href={TELEPHONE_HREF} style={BOUTON_TEL}>
              {TELEPHONE_AFFICHE}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
