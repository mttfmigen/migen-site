import type { CSSProperties } from "react";
import Image from "next/image";

import { VERRE } from "@/components/site/blocs/habillage";
import { RACINE_CARRIERE } from "@/components/site/metier/PageFicheMetier";
import PostulerMetier from "@/components/site/metier/PostulerMetier";
import SectionFicheMetier from "@/components/site/metier/SectionsFicheMetier";

import type { ContenuHubCarriere, SectionHub } from "./donnees-hub";
import styles from "./HubCarriere.module.css";
import MetiersRecrutes from "./MetiersRecrutes";
import QuestionsHub from "./QuestionsHub";
import {
  Avis,
  BoutonPostuler,
  EtapesHub,
  Hubs,
  LiensPhoto,
  Paragraphe,
  Refus,
} from "./SectionsHub";
import { altPhoto } from "@/lib/descriptions-photos";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/**
 * Le hub `/carriere/`, gabarit 10 « Hub de rubrique » servi par
 * `MigenCarriere.dc.html`, LE MÊME fichier de maquette que les 13 fiches
 * métier du gabarit 07.
 *
 * D'où la réutilisation : les écrans communs (chiffres, bento, encart, duo,
 * liste) sont rendus par `SectionFicheMetier`, et le formulaire par
 * `PostulerMetier`, tous deux du dossier `metier/`, importés tels quels.
 * Ne sont écrits ici que les écrans propres au hub ou que le gabarit 07 ne
 * sait pas dessiner : le héros AVEC sa photo, les étapes à cinq et le bandeau
 * « 10 % », le rail des métiers, les refus, les hubs, les avis, les questions
 * en panneau-photo (`.mg-faqph`, appliqué par l'application à cette FAQ) et
 * la carte « Pour aller plus loin » avec sa photo.
 *
 * L'ordre des sections EST celui de la capture `maquette/rendu/carriere.html`.
 */

/**
 * LE DRAPEAU `sansEnTete` SERT LE REPLI MOBILE, pose le 12/10.
 *
 * Mesure du meme jour : ce hub etait la page la plus longue du site, 32,2
 * ecrans au telephone, sans aucun bloc repliable. La page enveloppe chaque
 * section sauf la premiere et porte son surtitre et son titre dans l'en-tete ;
 * le rendu interne doit alors les taire, sinon ils paraissent deux fois.
 */
/** Le surtitre de la bascule d'un bloc replie. Il ne vit que dans l'en-tete :
 *  le rendu interne le tait. */
const SURTITRE_PLI: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le titre de la bascule, a l'echelle des H2 du gabarit en largeur mobile. */
const TITRE_PLI: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
  margin: 0,
};

function Section({ section, sansEnTete }: { section: SectionHub; sansEnTete?: boolean }) {
  switch (section.type) {
    case "etapes":
      return <EtapesHub section={section} sansEnTete={sansEnTete} />;
    case "metiers":
      return <MetiersRecrutes {...section} />;
    case "refus":
      return <Refus {...section} sansEnTete={sansEnTete} />;
    case "hubs":
      return <Hubs {...section} sansEnTete={sansEnTete} />;
    case "avis":
      return <Avis {...section} sansEnTete={sansEnTete} />;
    case "faq":
      // `.mg-faqph` : le panneau-photo sombre de l'application, que la FAQ
      // plate du gabarit 07 ne dessine pas.
      return <QuestionsHub {...section} />;
    case "liens":
      return <LiensPhoto items={section.items} />;
    case "postuler":
      return <PostulerMetier />;
    default:
      return <SectionFicheMetier section={section} sansEnTete={sansEnTete} />;
  }
}

export default function PageHubCarriere({ contenu }: { contenu: ContenuHubCarriere }) {
  const { heros } = contenu;
  return (
    <div className="mg-site" style={RACINE_CARRIERE}>
      <main style={{ paddingTop: 62 }}>
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
                  style={{ width: 6, height: 6, borderRadius: 999, background: "var(--acc)" }}
                />
                {heros.pastille}
              </span>
              <h1
                style={{
                  font: "600 calc(clamp(38px,4.6vw,64px) * var(--ts))/1.03 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: "0 0 22px",
                  maxWidth: "16ch",
                  textWrap: "balance",
                }}
              >
                {contenu.titre}
              </h1>
              <Paragraphe
                texte={heros.chapeau}
                style={{
                  font: "400 19px/1.6 var(--fb)",
                  color: "var(--ink)",
                  margin: "0 0 16px",
                  maxWidth: "50ch",
                }}
              />
              {heros.paragraphes?.map((texte) => (
                <Paragraphe
                  key={texte}
                  texte={texte}
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: "0 0 12px",
                    maxWidth: "54ch",
                  }}
                />
              ))}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
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
                <Image
                  src={heros.photo.src}
                  alt={altPhoto(heros.photo.src) || heros.photo.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
                />
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
                  <span style={{ font: "500 14px/1.45 var(--fb)", color: "var(--ink1)" }}>
                    {heros.chiffre.texte}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* CHAQUE SECTION SE REPLIE AU TELEPHONE SAUF LA PREMIERE, regle de la
            maquette mobile. Ce hub etait la page la plus longue du site, 32,2
            ecrans. Une section sans titre non vide n'est pas repliee : il n'y
            aurait rien a mettre sur la bascule. */}
        {contenu.sections.map((section, i) => {
          // L'index suffit comme clé : l'ordre du tableau EST celui de la capture.
          const cle = `${section.type}-${i}`;
          /* SEULS LES TYPES DONT LE RENDU SAIT SE TAIRE. `MetiersRecrutes` et
             `QuestionsHub` posent leur propre h2 sans comprendre `sansEnTete` :
             les envelopper donnait un titre EN DOUBLE, 18 h2 au lieu de 15, et
             la porte du hub l'a refuse en comparant l'ordre des titres a la
             capture. Les ajouter demande de leur poser le drapeau d'abord. */
          const replie = new Set(["etapes", "refus", "hubs", "avis"]);
          const titrable =
            replie.has(section.type) &&
            "titre" in section &&
            "surtitre" in section &&
            typeof section.titre === "string" &&
            section.titre.trim() !== "" &&
            typeof section.surtitre === "string" &&
            section.surtitre.trim() !== "";
          if (i === 0 || !titrable) return <Section key={cle} section={section} />;
          return (
            <SectionPliableMobile
              key={cle}
              enTete={
                <span>
                  <span style={{ ...SURTITRE_PLI, display: "block" }}>{section.surtitre}</span>
                  <h2 style={TITRE_PLI}>{section.titre}</h2>
                </span>
              }
            >
              <Section section={section} sansEnTete />
            </SectionPliableMobile>
          );
        })}
      </main>
    </div>
  );
}
