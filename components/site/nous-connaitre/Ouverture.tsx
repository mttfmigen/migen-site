import Image from "next/image";
import Link from "next/link";

import type { CSSProperties } from "react";

import styles from "./Ouverture.module.css";

/**
 * Ouverture de « Nous connaître » : titre, promesse, photo légendée.
 *
 * Maquette, lignes 5203 à 5225 de `maquette/accueil-rendu.html`.
 *
 * Les deux appels à l'action visent `/equipe/` et `/valeurs/`, vérifiées en 200
 * sur le serveur local avant d'être posées : cet écran est cité par le pied de
 * page de tout le site, un bouton mort ici se verrait sur 225 pages.
 */

/* Mêmes valeurs que la maquette, lignes 5211 et 5212. Les survols vivent dans le
   module CSS, jamais dans `app/globals.css` : plusieurs agents y écriraient. */
const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};
export default function Ouverture() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
    >
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr .92fr",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 18,
            }}
          >
            Nous connaître
          </div>
          <h1
            style={{
              font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "17ch",
              textWrap: "balance",
            }}
          >
            Un seul métier&nbsp;: technicien de maintenance.
          </h1>
          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "24px 0 0",
              maxWidth: "50ch",
            }}
          >
            Des entreprises entretiennent les machines. D&rsquo;autres placent
            du personnel. Nous ne faisons qu&rsquo;une chose, affecter sur vos
            sites des techniciens qui entretiennent les machines, et rien
            d&rsquo;autre. C&rsquo;est une niche, et c&rsquo;est ce qui nous
            permet d&rsquo;avoir des process rodés là où les généralistes
            improvisent.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/a-propos/equipe/"
              className={styles.boutonPrincipal}
              style={{
                ...BOUTON,
                background: "var(--acc)",
                color: "#fff",
                boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                transition: "filter var(--tr),transform var(--tr)",
              }}
            >
              Voir qui tient tout ça
            </Link>
            <Link
              href="/valeurs/"
              className={styles.boutonSecond}
              style={{
                ...BOUTON,
                background: "var(--gsol)",
                border: "1px solid var(--gbd)",
                color: "var(--ink)",
                transition: "background var(--tr)",
              }}
            >
              Nos valeurs
            </Link>
          </div>
        </div>
        <div
          style={{
            borderRadius: "var(--rad)",
            overflow: "hidden",
            position: "relative",
            minHeight: 340,
            background: "var(--ph)",
          }}
        >
          <Image
            src="/assets/web/team-grind-sparks.jpg"
            alt="Technicien de maintenance migen en intervention"
            fill
            sizes="(max-width: 900px) 100vw, 520px"
            style={{
              objectFit: "cover",
              filter: "saturate(var(--sat)) contrast(1.05)",
              opacity: "var(--ph-op)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top,rgba(18,17,16,.74),rgba(18,17,16,0) 54%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "26px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Monogramme décoratif : la marque est déjà dans le texte de la
                page. Largeur automatique, donc `img` et non `next/image`. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-migen-white.png"
              alt=""
              style={{ height: 20, width: "auto", flex: "none" }}
            />
            <span
              style={{
                font: "500 11.5px var(--fb)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.82)",
              }}
            >
              Innovation, performance, impact.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
