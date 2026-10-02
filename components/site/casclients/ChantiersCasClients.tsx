import type { CSSProperties, ReactNode } from "react";

import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";
import type { ChantierCasClients } from "@/types/casclients";

import { BOUTON_ACTION, LARGEUR, SURTITRE, TITRE2, VERRE } from "./habillage";
import styles from "./PageCasClients.module.css";

/**
 * « Réalisations » : les chantiers livrés, puis la bande d'appel à l'action.
 *
 * Maquette lignes 6694 à 6810. Composant SERVEUR : la carte ne fait rien qu'un
 * lien ne fasse, et le soulèvement au survol est en CSS.
 *
 * SANS DONNÉE, PAS DE SECTION. La liste vient de `pages.contenu`. Un chantier
 * porte un nom de client, une durée et une date : rien de tout cela ne
 * s'invente, et une carte à moitié remplie vaudrait moins que pas de carte.
 */

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 36,
  marginBottom: 34,
  flexWrap: "wrap",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 16,
};

const CARTE: CSSProperties = {
  ...VERRE,
  display: "block",
  overflow: "hidden",
};

const VIGNETTE: CSSProperties = {
  height: 200,
  background: "var(--ph)",
  overflow: "hidden",
};

const IMAGE: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "saturate(var(--sat)) contrast(1.05)",
  opacity: "var(--ph-op)",
};

const RANGEE_HAUT: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 12,
};

const PIED_CARTE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 16,
  paddingTop: 14,
  borderTop: "1px solid var(--line)",
};

export interface ProprietesChantiersCasClients {
  chantiers?: readonly ChantierCasClients[];
  /** Titre de section. Défaut : celui de la maquette, qui annonce six chantiers. */
  titre?: string;
  libelleLien?: string;
  /** Cible du lien d'en-tête. Absente, le lien ne se rend pas. */
  hrefChantiers?: string;
}

/** Le dedans de la carte, identique qu'elle soit cliquable ou non. */
function ContenuCarte({ chantier }: { chantier: ChantierCasClients }) {
  return (
    <>
      <div style={VIGNETTE}>
        {chantier.image ? (
          // `<img>` et non `next/image` : la source vient du contenu, elle peut
          // pointer hors de `public/`, et `next/image` échoue au build sur un
          // domaine absent de `remotePatterns`. Chargement différé, la section
          // est sous la ligne de flottaison.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={chantier.image}
            alt={chantier.alt ?? ""}
            loading="lazy"
            style={IMAGE}
          />
        ) : null}
      </div>

      <div style={{ padding: "24px 26px 26px" }}>
        <div style={RANGEE_HAUT}>
          <span
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--acc)",
            }}
          >
            {chantier.client}
          </span>
          {chantier.duree ? (
            <span
              style={{
                font: "600 11px var(--fb)",
                color: "var(--ink4)",
                whiteSpace: "nowrap",
              }}
            >
              {chantier.duree}
            </span>
          ) : null}
        </div>

        {/* La maquette écrit ce titre en `div`. Il devient un H3 : six cartes
            sous un H2, c'est la structure que le sommaire d'un lecteur d'écran
            doit pouvoir parcourir. Le dessin ne change pas, les marges par
            défaut sont annulées. */}
        <h3
          style={{
            font: "600 19px/1.3 var(--ft)",
            letterSpacing: "-.028em",
            color: "var(--ink)",
            margin: 0,
          }}
        >
          {chantier.titre}
        </h3>

        {chantier.resume ? (
          <p
            style={{
              font: "400 14px/1.6 var(--fb)",
              color: "var(--ink2)",
              margin: "10px 0 0",
            }}
          >
            {chantier.resume}
          </p>
        ) : null}

        {chantier.offre || chantier.date ? (
          <div style={PIED_CARTE}>
            <span style={{ font: "400 12.5px var(--fb)", color: "var(--ink2)" }}>
              {chantier.offre ?? ""}
            </span>
            <span style={{ font: "400 12.5px var(--fb)", color: "var(--ink4)" }}>
              {chantier.date ?? ""}
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function ChantiersCasClients({
  chantiers = [],
  titre = "Six chantiers, six contextes différents",
  libelleLien = "Les six chantiers →",
  hrefChantiers,
}: ProprietesChantiersCasClients) {
  if (chantiers.length === 0) return null;

  return (
    <section id="cas" style={{ padding: "var(--sec) 0 0", scrollMarginTop: 110 }}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div style={ENTETE}>
            <div>
              <div style={SURTITRE}>Réalisations</div>
              <h2 style={TITRE2}>{titre}</h2>
            </div>
            {hrefChantiers ? (
              <a
                href={hrefChantiers}
                className={styles.lienListe}
                style={{
                  font: "600 15px var(--fb)",
                  color: "var(--acc-ink)",
                  flex: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {libelleLien}
              </a>
            ) : null}
          </div>

          <div className="mg-rmulti" style={GRILLE}>
            {chantiers.map((chantier) => {
              const dedans: ReactNode = <ContenuCarte chantier={chantier} />;
              // Sans fiche à ouvrir, la carte reste un article : un lien mort
              // ou un `div` cliquable seraient tous deux des fautes.
              return chantier.href ? (
                <a
                  key={`${chantier.client}-${chantier.titre}`}
                  href={chantier.href}
                  className={styles.carteChantier}
                  style={CARTE}
                >
                  {dedans}
                </a>
              ) : (
                <article
                  key={`${chantier.client}-${chantier.titre}`}
                  style={CARTE}
                >
                  {dedans}
                </article>
              );
            })}
          </div>

          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.25fr .75fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <div
              style={{
                ...VERRE,
                padding: "30px 34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 28,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <div
                  style={{
                    font: "600 calc(19px * var(--ts)) var(--ft)",
                    letterSpacing: "-.03em",
                    color: "var(--ink)",
                    marginBottom: 6,
                  }}
                >
                  {"Un cas proche du vôtre ?"}
                </div>
                <p
                  style={{
                    font: "400 14.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                    maxWidth: "46ch",
                  }}
                >
                  {
                    // Les tirets cadratins de la maquette passent en
                    // parenthèses : interdit de copie du projet.
                    "Décrivez votre situation. Nous vous envoyons la référence la plus comparable (secteur, technologies, durée) avec le nom du chargé d’affaires qui l’a suivie."
                  }
                </p>
              </div>
              <a
                href={ANCRE_FORMULAIRE}
                className={styles.boutonAction}
                style={{ ...BOUTON_ACTION, flex: "none" }}
              >
                Décrire mon besoin →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
