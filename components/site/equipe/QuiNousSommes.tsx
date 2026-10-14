import { CHIFFRES } from "./equipe-donnees";
import { CHAPEAU, LARGEUR, SECTION, SURTITRE, TITRE2, VERRE } from "./habillage-equipe";
import type { EntreeSommaire } from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

/* Écrit une fois : le sur-titre de bureau et la bascule du téléphone. */
const SURTITRE_TEXTE = "Qui nous sommes";

/** Carte 01 du téléphone, ouverte comme dans la maquette mobile v2. */
export const SOMMAIRE_QUI: EntreeSommaire = { id: "qui-nous-sommes", titre: SURTITRE_TEXTE };

/**
 * « Qui nous sommes » : le texte à gauche, trois chiffres à droite.
 * Maquette lignes 5932 à 5935.
 */
export default function QuiNousSommes() {
  return (
    <SectionRepliee id={SOMMAIRE_QUI.id} rang={1} titre={SURTITRE_TEXTE} ouvert>
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              <div data-titre-bureau="" style={SURTITRE}>
                {SURTITRE_TEXTE}
              </div>
              <h2 style={TITRE2}>
                Une entreprise créée pour garder vos machines en marche.
              </h2>
              <p style={CHAPEAU}>
                Une entreprise de maintenance industrielle, présente partout en
                France.
              </p>
            </div>
            {/* Au téléphone, trois petites cartes numérotées (maquette mobile
                v2, bloc `isKv`) : `.chiffresCompacts`, rien au bureau. */}
            <ul
              className={`mg-rmulti ${mobile.chiffresCompacts}`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 12,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {CHIFFRES.map((chiffre) => (
                <li
                  key={chiffre.libelle}
                  className={mobile.chiffreCompact}
                  style={{
                    ...(chiffre.sombre
                      ? {
                          background: "var(--panel)",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "var(--rad)",
                        }
                      : VERRE),
                    padding: "26px 24px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {chiffre.sombre ? (
                    <div
                      aria-hidden="true"
                      className={mobile.decor}
                      style={{
                        position: "absolute",
                        width: 260,
                        height: 260,
                        right: -110,
                        top: -120,
                        background:
                          "radial-gradient(circle,rgba(255,124,60,.32),transparent 68%)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                  <div
                    className={mobile.chiffreValeur}
                    style={{
                      position: "relative",
                      font: "600 40px/1 var(--ft)",
                      letterSpacing: "-.05em",
                      color: chiffre.sombre ? "var(--acc)" : "var(--ink)",
                    }}
                  >
                    {chiffre.valeur}
                  </div>
                  <div
                    className={mobile.chiffreLibelle}
                    style={{
                      position: "relative",
                      font: "600 15px var(--ft)",
                      letterSpacing: "-.02em",
                      color: chiffre.sombre ? "#fff" : "var(--ink)",
                    }}
                  >
                    {chiffre.libelle}
                  </div>
                  <div
                    className={mobile.chiffreTexte}
                    style={{
                      position: "relative",
                      font: "400 13.5px/1.55 var(--fb)",
                      color: chiffre.sombre
                        ? "rgba(255,255,255,.64)"
                        : "var(--ink2)",
                    }}
                  >
                    {chiffre.texte}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
