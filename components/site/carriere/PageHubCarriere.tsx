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
 * LA BASCULE PORTE UNE ETIQUETTE, PAS LE TITRE DE LA SECTION. Corrige le 12/10,
 * motif deja applique et verifie sur le gabarit metier
 * (`components/site/metier/PageFicheMetier.tsx`).
 *
 * Mesure du 12/10 : ce hub etait la page la plus longue du site, 32,2 ecrans au
 * telephone, sans aucun bloc repliable. La premiere version du repli faisait
 * porter a l'en-tete de la bascule le SURTITRE et le H2 de la section, que le
 * rendu interne taisait alors via un drapeau `sansEnTete`. Les deux en
 * souffraient, et c'est mesure sur /carriere/ : les 7 titres replies etaient
 * servis a 30 px a 1280 px au lieu des 38,4 px de la capture, leurs 7
 * `max-width` en ch disparaissaient, et les deux grilles qui placent le titre
 * dans leur colonne gauche la laissaient vide, piste presente et contenu parti.
 *
 * Les deux pieges sont opposes, et les deux ont ete payes : un `<span>` A LA
 * PLACE du `<h2>` retire le titre de la structure du document ; un `<h2>` DANS
 * la bascule le remet, mais a la mauvaise taille et hors de sa colonne.
 *
 * La bonne reponse ne choisit pas : le `<h2>` de la section RESTE a sa place et
 * a la taille de sa capture, et la bascule porte une etiquette qui n'existe QUE
 * sous 880 px, marquee `data-mobile-seulement` comme le chevron et le resume du
 * meme bloc. Au-dessus, la bascule entiere est retiree par le module CSS : un
 * visiteur de bureau voit exactement sa capture, et aucun `<summary>` vide ne
 * reste dans son ordre de tabulation.
 */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libelle de la bascule, a l'echelle des H2 du gabarit en largeur mobile. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};

function Section({ section }: { section: SectionHub }) {
  switch (section.type) {
    case "etapes":
      return <EtapesHub section={section} />;
    case "metiers":
      return <MetiersRecrutes {...section} />;
    case "refus":
      return <Refus {...section} />;
    case "hubs":
      return <Hubs {...section} />;
    case "avis":
      return <Avis {...section} />;
    case "faq":
      // `.mg-faqph` : le panneau-photo sombre de l'application, que la FAQ
      // plate du gabarit 07 ne dessine pas.
      return <QuestionsHub {...section} />;
    case "liens":
      return <LiensPhoto items={section.items} />;
    case "postuler":
      return <PostulerMetier />;
    default:
      /* AUCUN DRAPEAU NE PASSE PLUS NULLE PART. `SectionFicheMetier` n'accepte
         plus `sansEnTete` depuis le 12/10, et aucun rendu de ce dossier ne
         l'accepte non plus : chaque section garde son surtitre et son `<h2>`
         entiers, et la bascule porte son etiquette propre. */
      return <SectionFicheMetier section={section} />;
  }
}

export default function PageHubCarriere({ contenu }: { contenu: ContenuHubCarriere }) {
  const { heros } = contenu;
  return (
    <div className="mg-site" style={RACINE_CARRIERE}>
      <main className={styles.corpsHub} style={{ paddingTop: 62 }}>
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
          /* LES QUATRE TYPES REPLIES, et le compte ne change pas : sept blocs
             sur cette page. `MetiersRecrutes` et `QuestionsHub` restent dehors.
             Depuis le passage a l'etiquette, les envelopper ne ferait plus de
             titre en double (chaque section garde son seul `<h2>`), mais ce
             serait changer le repli mobile, pas reparer les titres : la liste
             reste telle quelle, et le compte de blocs pliables avec elle. */
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
                <span data-mobile-seulement="" className={styles.etiquettePli}>
                  <span style={ETIQUETTE_SURTITRE}>{section.surtitre}</span>
                  <span style={ETIQUETTE_TITRE}>{section.titre}</span>
                </span>
              }
            >
              <Section section={section} />
            </SectionPliableMobile>
          );
        })}
      </main>
    </div>
  );
}
