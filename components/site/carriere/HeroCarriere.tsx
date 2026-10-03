import Image from "next/image";

import styles from "./HeroCarriere.module.css";

/**
 * Ouverture de la page Carrière, maquette lignes 3190 à 3211.
 *
 * Composant serveur : rien d'interactif, le bloc part en HTML complet.
 *
 * DEUX ÉCARTS À LA MAQUETTE, tous deux imposés par les interdits de copie :
 *   · le tiret cadratin de la phrase d'accroche devient une virgule ;
 *   · le libellé « Les 12 postes ouverts » perd son chiffre. Aucune offre n'est
 *     raccordée à cette page, annoncer douze postes serait faux.
 *
 * L'image de la maquette est un identifiant d'actif Claude Design
 * (« f94375e4-… »), qui ne désigne aucun fichier du dépôt : on sert la photo
 * d'équipe de `public/assets/web`.
 */

export default function HeroCarriere() {
  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
    >
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr .95fr",
          gap: "52px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: "20px",
            }}
          >
            Carrière
          </div>
          <h1
            style={{
              font: "600 calc(clamp(36px,4.2vw,64px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              margin: 0,
              maxWidth: "18ch",
              textWrap: "balance",
            }}
          >
            Le terrain, avec les moyens de bien le faire.
          </h1>
          <p
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "24px 0 0",
              maxWidth: "48ch",
            }}
          >
            {
              "Nous recrutons partout en France. Habilitations prises en charge, formation continue, missions chez des industriels de premier rang, et un chargé d’affaires qui connaît votre métier."
            }
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#postes"
              className={styles.boutonAccent}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "15px 26px",
                borderRadius: "999px",
                background: "var(--acc)",
                color: "#fff",
                font: "600 15px var(--fb)",
                boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
              }}
            >
              Les postes ouverts
            </a>
            <a
              href="https://industrielibre.com/missions"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.boutonVerre}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "15px 26px",
                borderRadius: "999px",
                background: "var(--gsol)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                font: "600 15px var(--fb)",
              }}
            >
              Une mission freelance
            </a>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            borderRadius: "36px",
            overflow: "hidden",
            height: "460px",
            background: "var(--ph)",
            boxShadow: "0 40px 90px -50px rgba(0,0,0,.5)",
          }}
        >
          <Image
            src="/assets/web/team-duo.jpg"
            alt="Deux techniciens migen en intervention sur un site industriel"
            fill
            sizes="(max-width: 900px) 100vw, 540px"
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
                "linear-gradient(to top,rgba(28,27,25,.5),rgba(28,27,25,0) 55%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "26px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-migen-white.png"
              alt=""
              style={{ height: "20px", width: "auto", opacity: 0.95 }}
            />
            <span
              style={{
                font: "500 11.5px var(--fb)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.82)",
              }}
            >
              +120 techniciens
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
