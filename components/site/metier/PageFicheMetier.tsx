import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { VERRE } from "@/components/site/blocs/habillage";
import type { ContenuFicheMetier } from "@/types/metier";

import styles from "./FicheMetier.module.css";
import PostulerMetier from "./PostulerMetier";
import SectionFicheMetier, { BoutonPostuler } from "./SectionsFicheMetier";
import { altPhoto } from "@/lib/descriptions-photos";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

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

/**
 * L'ÉTIQUETTE DE LA BASCULE : un `<span>`, et c'est voulu cette fois.
 *
 * Le piège a été payé deux fois dans la même journée, le 12/10, et dans les
 * deux sens. La première version mettait un `<span>` À LA PLACE du `<h2>` de
 * la section : les treize pages perdaient leurs titres de section. La seconde
 * mettait un vrai `<h2>` dans la bascule et taisait celui de la section : les
 * titres revenaient dans la structure, mais à 30 px au lieu des 38,4 px de la
 * capture, et les grilles dont le titre occupe la colonne gauche la laissaient
 * vide (voir le bloc en tête de l'aiguillage de `SectionsFicheMetier.tsx`).
 *
 * La bonne réponse ne choisit pas entre les deux : le `<h2>` de la section
 * RESTE à sa place et à sa taille, et la bascule porte une étiquette qui
 * n'existe QUE sous 880 px, marquée `data-mobile-seulement` comme le chevron
 * et le résumé du même bloc. Au-dessus, elle n'est pas affichée : un visiteur
 * de bureau voit exactement sa capture. La structure du document garde donc un
 * seul titre par section, celui de la capture, et les portes qui comparent le
 * rendu à une capture de bureau écartent l'étiquette comme tout autre ornement
 * mobile.
 */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libellé de la bascule, à l'échelle des H2 du gabarit en largeur mobile. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

export default function PageFicheMetier({
  titre,
  contenu,
  filAriane,
}: ProprietesPageFicheMetier) {
  const heros = contenu.heros;
  return (
    <div className="mg-site" style={RACINE_CARRIERE}>
      <main className={styles.corpsMetier} style={{ paddingTop: 62 }}>
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

        {/* ---------------------- les sections, dans l'ordre de la capture

            CHAQUE SECTION SE REPLIE AU TÉLÉPHONE SAUF LA PREMIÈRE, règle de la
            maquette mobile : `isOpen = si < 1 || secOpen[...]`.

            Mesure du 12/10, hauteur réelle après hydratation : les pages
            carrière sont les plus longues du site, de 25 à 34 écrans, et
            aucune ne portait de bloc repliable. Onze des dix-huit pires pages
            du site étaient des pages carrière.

            LA BASCULE NE PORTE QU'UNE ÉTIQUETTE MOBILE, et le rendu de la
            section garde son surtitre et son `<h2>` entiers, à la taille de sa
            capture. Au-dessus de 880 px l'étiquette n'est pas affichée : la
            page est alors, au pixel de dessin près, celle de la capture. Voir
            le bloc ETIQUETTE_SURTITRE plus haut pour les deux fautes que ce
            choix répare.

            Une section sans titre, comme les chiffres, n'est pas repliée : il
            n'y aurait rien à mettre sur la bascule. */}
        {contenu.sections.map((section, i) => {
          if (section.type === "postuler") return <PostulerMetier key={`postuler-${i}`} />;
          // L'index suffit comme clé : l'ordre du tableau EST le gabarit.
          const cle = `${section.type}-${i}`;
          /* UN TITRE NON VIDE, et pas seulement la présence de la clé.
             Première version : `"titre" in section` suffisait, et des sections
             au titre vide donnaient une bascule muette. La porte des blocs
             repliables l'a refusé, 120 fois, avant déploiement. */
          const titrable =
            "titre" in section &&
            "surtitre" in section &&
            typeof section.titre === "string" &&
            section.titre.trim() !== "" &&
            typeof section.surtitre === "string" &&
            section.surtitre.trim() !== "";
          if (i === 0 || !titrable) {
            return <SectionFicheMetier key={cle} section={section} />;
          }
          return (
            <SectionPliableMobile
              key={cle}
              enTete={
                <span data-mobile-seulement="" className={styles.etiquettePli}>
                  <span style={ETIQUETTE_SURTITRE}>{section.surtitre}</span>
                  <span style={ETIQUETTE_TITRE}>{section.titre}</span>
                </span>
              }
            >
              <SectionFicheMetier section={section} />
            </SectionPliableMobile>
          );
        })}
      </main>
    </div>
  );
}
