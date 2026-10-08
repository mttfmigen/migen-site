import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  PANNEAU,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { ContenuFiche } from "@/types/fiche";

import styles from "./PageFiche.module.css";

/**
 * Rendu des fiches de cas client, les 28 pages `/preuves/<client>/`.
 *
 * Porté de « Migen - Site final.dc.html », lignes 6126 à 6209. Les valeurs sont
 * recopiées telles quelles. Quatre temps, dans cet ordre : le héros avec la
 * carte d'identité du chantier, la mosaïque de visuels, le trio
 * contexte / intervention / résultat, l'appel vers un cas comparable.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les révélations au
 * défilement sont posées par l'attribut `data-reveal`, que
 * `components/site/Moteurs.tsx` anime déjà pour tout le site.
 *
 * TOUT CE QUI EST DONNÉE EST OPTIONNEL. Le corpus de `/preuves/` n'est pas
 * encore importé : une section sans sa donnée ne se rend pas du tout, elle ne
 * se rend pas vide et surtout pas remplie au hasard.
 */

const LARGEUR: CSSProperties = { maxWidth: 1200, margin: "0 auto" };

/** Le surtitre du héros, plus espacé que celui des blocs de vente. */
const SURTITRE_HERO: CSSProperties = { ...SURTITRE, marginBottom: 20 };

/** Celui des cartes du trio : interlettrage et marge resserrés. */
const SURTITRE_CARTE: CSSProperties = {
  ...SURTITRE,
  letterSpacing: ".12em",
  marginBottom: 14,
};

/** Le verre du héros et du pavé final portent une ombre plus portée. */
const VERRE_FICHE: CSSProperties = {
  ...VERRE,
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
};

/** Les cartes du trio n'ont pas d'ombre dans la maquette. */
const VERRE_CARTE: CSSProperties = {
  ...VERRE,
  boxShadow: "none",
  padding: "32px 34px 34px",
};

const CARTOUCHE_LIBELLE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".1em",
  color: "var(--ink4)",
  flex: "none",
  width: 82,
};

const CARTOUCHE_VALEUR: CSSProperties = {
  font: "500 14.5px var(--fb)",
  color: "var(--ink)",
};

const PROSE_CARTE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
};

/** Le visuel recouvre sa case, saturation et opacité pilotées par la charte. */
const VISUEL: CSSProperties = {
  objectFit: "cover",
  filter: "saturate(var(--sat)) contrast(1.05)",
  opacity: "var(--ph-op)",
};

/** La case d'un visuel : fond de remplacement tant que l'image n'est pas là. */
const CASE_VISUEL: CSSProperties = {
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "var(--ph)",
  position: "relative",
};

export interface ProprietesPageFiche {
  titre: string;
  contenu: ContenuFiche;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS, comme pour `PageEditoriale` : ce sont des composants
   * serveur ASYNCHRONES qui interrogent la base. Les appeler ici rendrait ce
   * fichier asynchrone pour deux éléments de chrome, et il ne serait plus
   * montable hors base, donc plus vérifiable sans Supabase.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageFiche({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageFiche) {
  const { surtitre, chapeau, fiche = [], images = [], resultats = [] } = contenu;

  // Le trio ne compte que les cartes réellement alimentées : une grille de
  // trois colonnes pour une seule carte laisserait deux colonnes vides.
  const cartes = [
    contenu.contexte ? { cle: "contexte", titre: "Le contexte", texte: contenu.contexte } : null,
    contenu.intervention
      ? { cle: "intervention", titre: "Ce que nous avons fait", texte: contenu.intervention }
      : null,
  ].filter((c): c is { cle: string; titre: string; texte: string } => c !== null);

  const nombreCartes = cartes.length + (resultats.length > 0 ? 1 : 0);

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane}

        <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns:
                fiche.length > 0 ? "1.1fr .9fr" : "minmax(0,1fr)",
              gap: 52,
              alignItems: "start",
            }}
          >
            <div>
              {surtitre ? <div style={SURTITRE_HERO}>{surtitre}</div> : null}
              <h1
                style={{
                  font: "600 calc(clamp(34px,4vw,58px) * var(--ts))/1.05 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: 0,
                  maxWidth: "20ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h1>
              {chapeau ? (
                <p
                  style={{
                    font: "400 17.5px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: "24px 0 0",
                    maxWidth: "48ch",
                  }}
                >
                  <TexteRiche texte={chapeau} />
                </p>
              ) : null}
            </div>

            {fiche.length > 0 ? (
              <div style={{ ...VERRE_FICHE, padding: "32px 34px 34px" }}>
                <div style={SURTITRE_HERO}>Fiche</div>
                <div style={{ display: "grid", gap: 16 }}>
                  {fiche.map((ligne, i) => (
                    <Fragment key={`${ligne.libelle}-${i}`}>
                      {i > 0 ? (
                        <div style={{ height: 1, background: "var(--line)" }} />
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 14,
                        }}
                      >
                        <span style={CARTOUCHE_LIBELLE}>{ligne.libelle}</span>
                        <span style={CARTOUCHE_VALEUR}>{ligne.valeur}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {images.length > 0 ? (
          <section style={{ ...LARGEUR, padding: "40px 40px 0" }}>
            <div
              data-reveal=""
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  ...CASE_VISUEL,
                  gridColumn: "span 2",
                  minHeight: 360,
                }}
              >
                <Image
                  src={images[0].src}
                  alt={images[0].alt ?? ""}
                  fill
                  sizes="(max-width: 620px) 100vw, (max-width: 760px) 50vw, (max-width: 1000px) 100vw, 740px"
                  style={VISUEL}
                />
              </div>
              {images.length > 1 ? (
                <div style={{ display: "grid", gap: 16 }}>
                  {images.slice(1).map((image, i) => (
                    <div
                      key={`${image.src}-${i}`}
                      style={{ ...CASE_VISUEL, minHeight: 172 }}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt ?? ""}
                        fill
                        sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 370px"
                        style={VISUEL}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {nombreCartes > 0 ? (
          <>
            <section style={{ padding: "var(--sec) 0 0" }}>
              <div style={{ ...LARGEUR, padding: "0 40px" }}>
                <div
                  data-reveal=""
                  className="mg-rmulti"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${nombreCartes},minmax(0,1fr))`,
                    gap: 16,
                  }}
                >
                  {cartes.map((carte) => (
                    <div key={carte.cle} style={VERRE_CARTE}>
                      <div style={SURTITRE_CARTE}>{carte.titre}</div>
                      <p style={PROSE_CARTE}>
                        <TexteRiche texte={carte.texte} />
                      </p>
                    </div>
                  ))}

                  {resultats.length > 0 ? (
                    <div style={{ ...PANNEAU, padding: "32px 34px 34px" }}>
                      <div
                        style={{
                          position: "absolute",
                          width: 320,
                          height: 320,
                          right: -130,
                          top: -150,
                          background:
                            "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ position: "relative" }}>
                        <div style={SURTITRE_CARTE}>Le résultat</div>
                        <div style={{ display: "grid", gap: 16 }}>
                          {resultats.map((chiffre, i) => (
                            <div key={`${chiffre.valeur}-${i}`}>
                              <div
                                style={{
                                  font: "600 26px var(--ft)",
                                  letterSpacing: "-.045em",
                                  color: "#fff",
                                }}
                              >
                                {chiffre.valeur}
                              </div>
                              <div
                                style={{
                                  font: "400 12.5px var(--fb)",
                                  color: "rgba(255,255,255,.5)",
                                  marginTop: 2,
                                }}
                              >
                                {chiffre.libelle}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
            <div style={{ height: "var(--sec)" }} />
          </>
        ) : null}

        <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
          <div style={{ ...LARGEUR, padding: "0 40px" }}>
            <div
              data-reveal=""
              style={{
                ...VERRE,
                borderRadius: 36,
                boxShadow:
                  "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
                padding: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 44,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    font: "600 calc(clamp(24px,2.5vw,36px) * var(--ts))/1.1 var(--ft)",
                    letterSpacing: "-.04em",
                    margin: "0 0 12px",
                    maxWidth: "26ch",
                    textWrap: "balance",
                  }}
                >
                  Un cas comparable chez vous&nbsp;?
                </h2>
                <p
                  style={{
                    font: "400 16.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                    maxWidth: "52ch",
                  }}
                >
                  Nous avons probablement déjà traité une installation proche.
                  Décrivez la vôtre, nous partageons ce que nous en savons.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flex: "none",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href={ANCRE_FORMULAIRE}
                  className={styles.boutonAction}
                  style={{
                    ...BOUTON_ACTION,
                    padding: "16px 28px",
                    font: "600 15.5px var(--fb)",
                  }}
                >
                  Décrire mon besoin
                </a>
              </div>
            </div>
          </div>
        </section>

        {maillage}
      </main>
    </div>
  );
}
