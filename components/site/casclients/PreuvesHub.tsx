import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import CarrouselRealisations from "@/components/site/preuve/CarrouselRealisations";
import FilArianeMobile from "@/components/site/preuve/FilArianeMobile";
import { realisationsLiees } from "@/components/site/preuve/donnees-mobiles";
import type { ContenuHubPreuves } from "@/types/casclients";

import FiltrePreuves from "./FiltrePreuves";
import styles from "./PreuvesHub.module.css";
import { sectionsMobilesPreuves } from "./SectionsMobilesPreuves";
import { PHOTO_HUB_MOBILE, PHOTOS_DU_HEROS, vuesPreuves } from "./vues-preuves";
import PhotoMobile from "@/components/site/preuve/PhotoMobile";

/**
 * Le hub /preuves/, gabarit « 10 Hub de rubrique », porté de
 * `MigenPreuves.dc.html` et mesuré contre sa capture,
 * `maquette/rendu/preuves.html` : trois écrans, dans cet ordre.
 *
 *   0. Héros : surtitre, H1, chapeau en deux temps, bouton, mosaïque de trois
 *      photos et ses deux pastilles « +200 clients » et « 41 cas documentés ».
 *   1. Les études de cas, filtrées par type de besoin (`FiltrePreuves`).
 *   2. Le bandeau sombre « Votre site pourrait être le prochain cas ».
 *
 * CE QUE LA CAPTURE N'A PAS, et que ce gabarit ne rend donc pas : ni fil
 * d'Ariane, ni formulaire, ni maillage de bas de page. Les deux boutons mènent
 * à /contact/, comme dans la maquette.
 *
 * LE TOTAL « cas documentés » se compte sur la donnée, comme la maquette le
 * fait : il ne s'écrit nulle part en dur.
 */

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 24px",
  borderRadius: 999,
  background: "var(--acc,#ff7c3c)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};

const CASE_MOSAIQUE: CSSProperties = {
  position: "relative",
  borderRadius: 24,
  overflow: "hidden",
  background: "#dedfe1",
};

const CHIFFRE: CSSProperties = {
  font: "600 26px/1 var(--ft)",
  letterSpacing: "-.04em",
};

export interface ProprietesPreuvesHub {
  /** Le H1, porté par `pages.titre_h1` : « Preuves : nos réalisations ». */
  titre: string;
  contenu: ContenuHubPreuves;
  /**
   * Le chemin de la page (`/preuves/`), pour la couche MOBILE de la maquette
   * v2 : fil d'Ariane et rappel final. Sans lui, rien de mobile ne s'ajoute.
   */
  chemin?: string;
}

/**
 * L'intro du chapô MOBILE, coupée après sa première phrase : la tête continue
 * le paragraphe de l'accroche, la suite ouvre le second (corpus `preuves.md`).
 * Rendue en `data-mobile-seulement`, À CÔTÉ de l'intro de bureau, qui garde
 * son nœud texte unique : couper ce nœud en deux éléments décalait d'un
 * sous-pixel la ligne de 1280 px (mesuré le 15/10). Pas de point suivi d'une
 * espace, pas de coupe : l'intro de bureau sert aux deux largeurs.
 */
function IntroMobile({ texte }: { texte: string }) {
  const coupe = texte.indexOf(". ");
  if (coupe < 0) return null;
  return (
    <>
      <span data-mobile-seulement="" className={styles.introTete}>
        {" "}
        {texte.slice(0, coupe + 1)}
      </span>
      <span data-mobile-seulement="" className={styles.introSuite}>
        {texte.slice(coupe + 2)}
      </span>
    </>
  );
}

export default function PreuvesHub({ titre, contenu, chemin }: ProprietesPreuvesHub) {
  const vues = vuesPreuves(contenu);
  const total = vues[0].nombre;

  return (
    <div className="mg-site">
      {/* 62px : la marge que la maquette pose sous l'entête fixe. */}
      <main
        style={{
          paddingTop: 62,
          background: "var(--bg,#f1f2f4)",
          color: "var(--ink,#1c1b19)",
          fontFamily: "var(--fb,'Poppins',sans-serif)",
        }}
      >
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 0" }}>
          {/* Le fil d'Ariane de la maquette MOBILE (dc.html L104, « Accueil ›
              Réalisations »), sous 881 px seulement : la capture de bureau du
              hub n'en porte pas. */}
          {chemin ? <FilArianeMobile chemin={chemin} /> : null}
          <div
            className={styles.heros}
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr .85fr",
              gap: 44,
              alignItems: "center",
            }}
          >
            <div className={styles.colonneTexte}>
              <div
                className={styles.kickerHub}
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc,#ff7c3c)",
                  marginBottom: 16,
                }}
              >
                {/* dc.html L492 : le surtitre du gabarit 10 est « Rubrique ». */}
                <span className={styles.bureauSeul}>Nos réalisations</span>{" "}
                <span data-mobile-seulement="">Rubrique</span>
              </div>
              <h1
                className={styles.titreHub}
                style={{
                  font: "600 clamp(34px,4vw,56px)/1.04 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: "0 0 18px",
                  maxWidth: "16ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h1>
              {/* Le chapô de la maquette MOBILE (corpus `preuves.md`) : l'accroche
                  en gras, puis la première phrase de l'intro dans le MÊME
                  paragraphe, en romain ; la suite en second paragraphe, gris
                  (`IntroMobile`). L'enveloppe n'a aucun style au bureau. */}
              <div className={styles.chapeauHub}>
                <p
                  className={styles.accroche}
                  style={{
                    font: "600 17px/1.55 var(--fb)",
                    color: "var(--ink,#1c1b19)",
                    margin: "0 0 10px",
                    maxWidth: "56ch",
                    textWrap: "pretty",
                  }}
                >
                  {contenu.accroche}
                </p>
                <IntroMobile texte={contenu.intro} />
                <p
                  className={styles.intro}
                  style={{
                    font: "400 15.5px/1.65 var(--fb)",
                    color: "var(--ink2,#6a6764)",
                    margin: "0 0 22px",
                    maxWidth: "58ch",
                    textWrap: "pretty",
                  }}
                >
                  {contenu.intro}
                </p>
              </div>
              <div className={styles.boutonsHub} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/contact/"
                  prefetch={false}
                  className={styles.bouton}
                  style={{ ...BOUTON, boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)" }}
                >
                  {/* dc.html L412 : « Décrire mon besoin », puis le
                      téléphone (L111), sous 880 px. */}
                  <span className={styles.bureauSeul}>Demander un diagnostic maintenance</span>{" "}
                  <span data-mobile-seulement="">Décrire mon besoin</span>
                </Link>
                <a data-mobile-seulement="" href="tel:+33478337205" className={styles.boutonTel}>
                  04 78 33 72 05
                </a>
              </div>
            </div>

            {/* MAQUETTE MOBILE, entre les boutons et le chapô : « Toutes les
                pages de la rubrique » (dc.html L498, `kidsTop`), puis, après
                le chapô, l'encadré du corpus (`Preuves/preuves.md`, L15). */}
            {chemin ? (
              <div data-mobile-seulement="" className={styles.listeRubrique}>
                {" "}
                <PastillesCocon chemin={chemin} variante="enfants" />{" "}
              </div>
            ) : null}
            {chemin ? (
              <p data-mobile-seulement="" className={styles.encadreHub}>
                Demandez un diagnostic maintenance ou appelez le 04 78 33 72 05 : nous vous
                rappelons dans l&apos;heure.
              </p>
            ) : null}

            <div
              className={styles.mosaique}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gridTemplateRows: "170px 170px",
                gap: 10,
              }}
            >
              <div style={{ ...CASE_MOSAIQUE, gridRow: "span 2" }}>
                <PhotoMobile
                  mobile={PHOTO_HUB_MOBILE}
                  src={PHOTOS_DU_HEROS[0]}
                  alt="Techniciens migen sur un site client"
                  fill
                  priority
                  sizes="(max-width: 760px) 60vw, 280px"
                  style={{
                    objectFit: "cover",
                    filter: "saturate(var(--sat,.55)) contrast(1.05)",
                  }}
                />
              </div>
              <div style={CASE_MOSAIQUE}>
                <Image
                  src={PHOTOS_DU_HEROS[1]}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 760px) 45vw, 230px"
                  style={{ objectFit: "cover", filter: "saturate(var(--sat,.55))" }}
                />
              </div>
              <div style={CASE_MOSAIQUE}>
                <Image
                  src={PHOTOS_DU_HEROS[2]}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 760px) 45vw, 230px"
                  style={{ objectFit: "cover", filter: "saturate(var(--sat,.55))" }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: -22,
                  bottom: -22,
                  display: "flex",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,.9)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,.9)",
                    borderRadius: 18,
                    padding: "14px 18px",
                    boxShadow: "0 18px 40px -22px rgba(0,0,0,.4)",
                  }}
                >
                  <div style={CHIFFRE}>+200</div>
                  <div
                    style={{
                      font: "400 12px var(--fb)",
                      color: "var(--ink3,#737373)",
                      marginTop: 5,
                    }}
                  >
                    clients
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--panel,#1c1b19)",
                    borderRadius: 18,
                    padding: "14px 18px",
                    boxShadow: "0 18px 40px -22px rgba(0,0,0,.5)",
                  }}
                >
                  <div style={{ ...CHIFFRE, color: "var(--acc,#ff7c3c)" }}>{total}</div>
                  <div
                    style={{
                      font: "400 12px var(--fb)",
                      color: "rgba(255,255,255,.65)",
                      marginTop: 5,
                    }}
                  >
                    cas documentés
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FiltrePreuves vues={vues} />

        {/* LES SECTIONS DE LA MAQUETTE MOBILE, une carte numérotée par type
            de besoin, avec la cadence de conversion (photo + CTA après la 2e,
            bandeau « Être rappelé » après la 5e), puis « Nos réalisations »
            (dc.html, `refsSec`). Le rappel final reste en bas. */}
        {chemin ? (
          <div data-mobile-seulement="" className={styles.sectionsMobiles}>
            {" "}
            <AvecConversionMobile chemin={chemin} gabarit="10" rappelFinal={false}>
              {sectionsMobilesPreuves(vues, contenu.recents)}
            </AvecConversionMobile>{" "}
            <CarrouselRealisations
              cartes={realisationsLiees(chemin)}
              titre="Nos réalisations"
            />{" "}
          </div>
        ) : null}

        <section
          className={`${styles.bandeFinale} ${styles.bureauSeul}`}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 40px 96px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 22,
              flexWrap: "wrap",
              padding: "28px 30px 28px 34px",
              borderRadius: 32,
              background: "var(--panel,#1c1b19)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                right: -160,
                top: -220,
                background: "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "relative",
                font: "600 clamp(20px,2.2vw,26px)/1.25 var(--ft)",
                letterSpacing: "-.03em",
                color: "#fff",
                maxWidth: "34ch",
              }}
            >
              Votre site pourrait être le prochain cas. Parlons de votre besoin.
            </div>
            <div style={{ position: "relative", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/contact/" prefetch={false} className={styles.bouton} style={BOUTON}>
                Parler à un chargé d’affaires
              </Link>
            </div>
          </div>
        </section>

        {/* LE RAPPEL FINAL DE LA MAQUETTE MOBILE (dc.html L138, « Être
            rappelé »), dernier bloc de la page comme sur la capture du hub.
            Pas d'`AvecConversionMobile` ici : le hub n'a qu'UNE section de
            contenu (les études filtrées), la cadence n'y insérerait rien
            d'autre que ce rappel. Il vient après le bandeau sombre, comme le
            rappel de la maquette après « Nos réalisations ». Mobile seulement.
            L'espace qui le précède sépare, dans le `textContent` du `<main>`,
            le dernier mot du bandeau du premier mot du rappel : collés, la
            porte « aucun mot perdu » comptait le premier comme perdu. */}
        {chemin ? (
          <>
            {" "}
            <RappelFinalMobile />
          </>
        ) : null}
      </main>
    </div>
  );
}
