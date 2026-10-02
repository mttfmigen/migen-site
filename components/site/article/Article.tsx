import Image from "next/image";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { BlocArticle, ContenuArticle } from "@/types/article";

import styles from "./Article.module.css";

/**
 * Gabarit d'article, porté de la maquette (lignes 5759 à 5824).
 *
 * Composant SERVEUR : rien n'y est interactif. Le sommaire à gauche tient par
 * `position: sticky`, pas par du JavaScript, et les ancres sont des liens.
 * `app/globals.css` repasse le bloc en statique sous 760px, où le collant
 * n'aurait nulle part où coller.
 */

const LARGEUR = { maxWidth: 1200, margin: "0 auto" } as const;

const TITRE_SECTION = {
  font: "600 calc(28px * var(--ts))/1.2 var(--ft)",
  letterSpacing: "-.035em",
  // Sans cette marge, l'ancre amène le titre sous la barre de navigation fixe.
  scrollMarginTop: 100,
} as const;

const PARAGRAPHE = {
  font: "400 17px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 18px",
} as const;

function Bloc({ bloc }: { bloc: BlocArticle }) {
  if (bloc.type === "paragraphe") {
    return (
      <p style={PARAGRAPHE}>
        <TexteRiche texte={bloc.texte} />
      </p>
    );
  }

  if (bloc.type === "encadre") {
    return (
      <aside
        style={{
          borderRadius: "var(--rad-s)",
          background: "var(--acc-w)",
          border: "1px solid rgba(255,124,60,.28)",
          padding: "24px 28px",
          margin: "0 0 26px",
        }}
      >
        <p
          style={{
            font: "500 16.5px/1.7 var(--fb)",
            color: "var(--ink1)",
            margin: 0,
          }}
        >
          <TexteRiche texte={bloc.texte} />
        </p>
      </aside>
    );
  }

  return (
    <ul
      style={{
        display: "grid",
        gap: 10,
        margin: "0 0 18px",
        padding: 0,
        listStyle: "none",
      }}
    >
      {bloc.items.map((item) => (
        <li
          key={item}
          style={{
            display: "flex",
            gap: 11,
            font: "400 16.5px/1.6 var(--fb)",
            color: "var(--ink1)",
          }}
        >
          {/* La coche est décorative : la liste porte déjà le sens. Lue par un
              lecteur d'écran, elle dirait « coche » devant chaque question. */}
          <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
            ✓
          </span>
          <TexteRiche texte={item} />
        </li>
      ))}
    </ul>
  );
}

export interface ProprietesArticle {
  titre: string;
  contenu: ContenuArticle;
  /** Date de publication, au format ISO. Vient de `articles.published_at`. */
  publieLe?: string | null;
  auteur?: string | null;
  /** Cible du bouton de fin d'article quand le contenu n'en donne pas. */
  hrefContact?: string;
}

export default function Article({
  titre,
  contenu,
  publieLe,
  auteur,
  hrefContact = "/contact/",
}: ProprietesArticle) {
  const contexte = [
    contenu.categorie,
    publieLe
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(publieLe))
      : null,
    contenu.minutesLecture ? `${contenu.minutesLecture} min de lecture` : null,
  ].filter(Boolean);

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
          <div style={{ maxWidth: 760 }}>
            {contexte.length > 0 ? (
              <p
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  margin: "0 0 18px",
                }}
              >
                {contexte.join(" · ")}
              </p>
            ) : null}
            <h1
              style={{
                font: "600 calc(clamp(32px,3.8vw,56px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                margin: 0,
                textWrap: "balance",
              }}
            >
              {titre}
            </h1>
            <p
              style={{
                font: "400 19px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: "24px 0 0",
              }}
            >
              <TexteRiche texte={contenu.chapeau} />
            </p>
          </div>
        </section>

        {contenu.image ? (
          <section style={{ ...LARGEUR, padding: "40px 40px 0" }}>
            <div
              style={{
                position: "relative",
                height: 420,
                borderRadius: 36,
                overflow: "hidden",
                background: "var(--ph)",
                boxShadow: "0 40px 90px -50px rgba(0,0,0,.5)",
              }}
            >
              <Image
                src={contenu.image.src}
                alt={contenu.image.alt}
                fill
                sizes="(max-width: 1200px) 100vw, 1120px"
                priority
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.05)",
                  opacity: "var(--ph-op)",
                }}
              />
            </div>
          </section>
        ) : null}

        <section style={{ padding: "var(--sec) 0" }}>
          <div style={{ ...LARGEUR, padding: "0 40px" }}>
            <div
              className="mg-r2"
              style={{
                display: "grid",
                gridTemplateColumns: ".32fr .68fr",
                gap: 60,
                alignItems: "start",
              }}
            >
              {/* Le sommaire se déduit des sections : jamais saisi deux fois,
                  donc jamais désynchronisé du corps. */}
              <nav
                aria-label="Sommaire de l'article"
                style={{ position: "sticky", top: 110 }}
              >
                <p
                  style={{
                    font: "600 11px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--ink4)",
                    margin: "0 0 16px",
                  }}
                >
                  Sommaire
                </p>
                <ol
                  style={{
                    display: "grid",
                    gap: 9,
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {contenu.sections.map((section, i) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={styles.lienSommaire}
                        style={{ font: "500 14px/1.5 var(--fb)" }}
                      >
                        {i + 1}. {section.titre}
                      </a>
                    </li>
                  ))}
                </ol>
                <div
                  style={{
                    height: 1,
                    background: "var(--line)",
                    margin: "24px 0",
                  }}
                />
                <p
                  style={{
                    font: "400 13px/1.6 var(--fb)",
                    color: "var(--ink4)",
                    margin: 0,
                  }}
                >
                  {auteur ? `Écrit par ${auteur}` : "Écrit par l'équipe migen©"}
                  <br />
                  Relu par un chargé d&apos;affaires
                </p>
              </nav>

              <article className={styles.corps} style={{ maxWidth: "70ch" }}>
                {contenu.sections.map((section, i) => (
                  <section key={section.id}>
                    <h2
                      id={section.id}
                      style={{
                        ...TITRE_SECTION,
                        margin: i === 0 ? "0 0 16px" : "36px 0 16px",
                      }}
                    >
                      {i + 1}. {section.titre}
                    </h2>
                    {section.blocs.map((bloc, j) => (
                      <Bloc key={`${section.id}-${j}`} bloc={bloc} />
                    ))}
                  </section>
                ))}

                {contenu.cta ? (
                  <aside
                    style={{
                      borderRadius: "var(--rad)",
                      background: "var(--panel)",
                      padding: "36px 38px",
                      marginTop: 36,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: 360,
                        height: 360,
                        right: -150,
                        top: -170,
                        background:
                          "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "relative" }}>
                      <p
                        style={{
                          font: "600 calc(22px * var(--ts))/1.25 var(--ft)",
                          letterSpacing: "-.03em",
                          color: "#fff",
                          margin: "0 0 10px",
                        }}
                      >
                        {contenu.cta.titre}
                      </p>
                      <p
                        style={{
                          font: "400 15.5px/1.65 var(--fb)",
                          color: "rgba(255,255,255,.6)",
                          margin: "0 0 20px",
                        }}
                      >
                        {contenu.cta.texte}
                      </p>
                      <a
                        href={contenu.cta.href ?? hrefContact}
                        className={styles.boutonCta}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 9,
                          padding: "14px 24px",
                          borderRadius: 999,
                          background: "var(--acc)",
                          color: "#fff",
                          font: "600 14.5px var(--fb)",
                        }}
                      >
                        {contenu.cta.bouton}
                      </a>
                    </div>
                  </aside>
                ) : null}
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
