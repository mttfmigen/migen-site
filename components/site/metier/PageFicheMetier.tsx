import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { VERRE } from "@/components/site/blocs/habillage";
import type { ContenuFicheMetier } from "@/types/metier";

import styles from "./FicheMetier.module.css";
import PostulerMetier from "./PostulerMetier";
import SectionFicheMetier, { BoutonPostuler } from "./SectionsFicheMetier";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Gabarit 07 « Métier et carrière », 13 pages `/carriere/<metier>/`.
 *
 * LA RÉFÉRENCE, et elle est unique : le rendu de la maquette autonome, figé
 * page par page dans `maquette/rendu/carriere--*.html` (CLAUDE.md §16). Le
 * composant précédent de ce dossier (`PageMetier.tsx`) avait été porté contre
 * l'export de démonstration « Migen - Site final.dc.html », qui n'est le
 * gabarit d'aucune page : il ne sert plus que le gabarit DOMAINE, la route
 * tranche sur `estMetier` avant lui.
 *
 * Composant SERVEUR. Aucun état : les survols vivent dans le module CSS, les
 * révélations au défilement en `data-reveal`, animées par `Moteurs.tsx` déjà
 * monté dans la mise en page racine.
 *
 * LES PHOTOS : la capture les sert en `blob:`. Relues le 08/10 dans la
 * maquette vivante (octets lus par XHR, sha256 contre `public/assets/web`),
 * chacune est un fichier du dépôt, nommé dans la donnée (`heros.photo`,
 * `liens[].photo`). Sans photo dans la donnée, le cadre `var(--ph)` reste.
 *
 * PAS DE RANGÉE DE FIL D'ARIANE : `FilAriane` ne rend plus que son JSON-LD
 * (aucune des 248 captures n'en dessine), et la section de 24 px qui
 * l'enveloppait, avec le `paddingTop: 96` d'avant, posait le H1 58 px plus bas
 * que la maquette (`padding-top: 62px`, mesuré par verifie-position-titre).
 */

/**
 * Les jetons de `.mgk-root`, la racine de `MigenCarriere.dc.html` : ils sont
 * ceux de `:root` à une exception près, `--sec: 120px` À TOUTES LES LARGEURS.
 * La règle `.mg-site { --sec: 64px }` sous 760 px (globals.css) ne descend donc
 * pas jusqu'aux pages carrière de la maquette : mesuré à 390 px, 120 px dans
 * la maquette, 64 sur le site, soit 56 px d'écart en tête de chaque section.
 * Partagé avec le hub `/carriere/`, servi par le même fichier.
 */
export const RACINE_CARRIERE = { "--sec": "120px" } as CSSProperties;

export interface ProprietesPageFicheMetier {
  titre: string;
  contenu: ContenuFicheMetier;
  /** Fil d'Ariane, fourni par la page : composant serveur qui lit la base. */
  filAriane?: ReactNode;
}

export default function PageFicheMetier({
  titre,
  contenu,
  filAriane,
}: ProprietesPageFicheMetier) {
  const heros = contenu.heros;
  return (
    <div className="mg-site" style={RACINE_CARRIERE}>
      <main style={{ paddingTop: 62 }}>
        {filAriane}

        {/* ---------------------------------------------------------- héros */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 0" }}>
          <div
            className={styles.deuxColonnes}
            style={{
              display: "grid",
              gridTemplateColumns: "1.08fr .92fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              {heros.pastille ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,var(--gl-a))",
                    border: "1px solid var(--gbd)",
                    font: "600 12px var(--fb)",
                    color: "var(--ink1)",
                    marginBottom: 22,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "var(--acc)",
                    }}
                  />
                  {heros.pastille}
                </span>
              ) : null}
              <h1
                style={{
                  font: "600 calc(clamp(38px,4.6vw,64px) * var(--ts))/1.03 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: "0 0 22px",
                  maxWidth: "16ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h1>
              {heros.chapeau ? (
                <p
                  className={styles.texteLie}
                  style={{
                    font: "400 19px/1.6 var(--fb)",
                    color: "var(--ink)",
                    margin: "0 0 16px",
                    maxWidth: "50ch",
                    textWrap: "pretty",
                  }}
                >
                  <TexteRiche texte={heros.chapeau} />
                </p>
              ) : null}
              {heros.paragraphes?.map((texte) => (
                <p
                  key={texte}
                  className={styles.texteLie}
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: "0 0 12px",
                    maxWidth: "54ch",
                    textWrap: "pretty",
                  }}
                >
                  <TexteRiche texte={texte} />
                </p>
              ))}
              <div
                style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}
              >
                <BoutonPostuler />
                <a
                  href="tel:+33478337205"
                  className={styles.boutonTelephone}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "15px 26px",
                    borderRadius: 999,
                    background: "var(--gsol)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                    font: "600 15px var(--fb)",
                    whiteSpace: "nowrap",
                    transition: "background var(--tr),transform var(--tr)",
                  }}
                >
                  04 78 33 72 05
                </a>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 32,
                  overflow: "hidden",
                  height: 470,
                  background: "var(--ph)",
                  boxShadow: "0 40px 90px -50px rgba(28,27,25,.55)",
                }}
              >
                {heros.photo ? (
                  <Image
                    src={heros.photo.src}
                    alt={altPhoto(heros.photo.src) || (heros.photo.alt ?? "")}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 520px"
                    style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
                  />
                ) : null}
              </div>
              {heros.chiffre ? (
                <div
                  className={styles.flottante}
                  style={{
                    ...VERRE,
                    borderRadius: 24,
                    position: "absolute",
                    left: -28,
                    bottom: -30,
                    maxWidth: 290,
                    padding: "22px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      font: "600 40px/1 var(--ft)",
                      letterSpacing: "-.05em",
                      color: "var(--acc)",
                      flex: "0 0 auto",
                    }}
                  >
                    {heros.chiffre.valeur}
                  </span>
                  <span
                    style={{ font: "500 14px/1.45 var(--fb)", color: "var(--ink1)" }}
                  >
                    {heros.chiffre.texte}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ---------------------- les sections, dans l'ordre de la capture */}
        {contenu.sections.map((section, i) =>
          section.type === "postuler" ? (
            <PostulerMetier key={`postuler-${i}`} />
          ) : (
            // L'index suffit comme clé : l'ordre du tableau EST le gabarit.
            <SectionFicheMetier key={`${section.type}-${i}`} section={section} />
          ),
        )}
      </main>
    </div>
  );
}
