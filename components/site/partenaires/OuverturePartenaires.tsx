import Image from "next/image";
import type { CSSProperties } from "react";

import {
  ActionsMobile,
  FilMobile,
  SommaireMobile,
  SurtitreMobile,
  type EntreeSommaire,
} from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";
import SectionRepliee from "@/components/site/nous-connaitre/SectionRepliee";

import { PARTENAIRES, TITRE_H1_PARTENAIRES, type Partenaire } from "./donnees";
import { SOMMAIRE_FONCTIONNEMENT } from "./FonctionnementPartenariat";

/* Le nom de la page : notre sur-titre, le titre de la maquette mobile. */
const NOM_PAGE = "Partenaires";
/* dc.html L485 : 240 mots dans `mobile-native-data.js`, / 230, au moins 2. */
const MINUTES_DE_LECTURE = 2;

/** La photo de tête du téléphone, celle de la maquette : dc.html L421, hors
    `FIMG`, le repli `assets/web/team-duo.jpg`. Écartée du tirage du photo + CTA. */
export const PHOTO_TETE_PARTENAIRES = "/assets/web/team-duo.jpg";

/** L'ancre de la carte d'un partenaire, visée par le sommaire. */
const ancreDe = (nom: string) => `partenaire-${nom.toLowerCase()}`;

/**
 * Ouverture de l'écran « Partenaires » : la promesse, puis les partenaires nommés.
 *
 * Maquette `maquette/accueil-rendu.html`, lignes 6033 à 6061. Deux sections de
 * la maquette dans un seul fichier : la grille de cartes est le sujet que le
 * titre annonce, et les deux partagent la même liste.
 *
 * Composant serveur : aucun état, aucun écouteur.
 */

interface Proprietes {
  /** Les partenaires affichés. Par défaut, ceux de la maquette. */
  partenaires?: readonly Partenaire[];
}

const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 20,
};

const VERRE: CSSProperties = {
  borderRadius: "var(--rad)",
  padding: "36px 38px 38px",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 24px 56px -34px rgba(0,0,0,.32)",
};

/** Cartouche blanc qui accueille le logo du partenaire. */
const CARTOUCHE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 180,
  height: 72,
  borderRadius: 10,
  background: "#fff",
  border: "1px solid var(--line)",
  padding: "12px 18px",
};

/**
 * LE HÉROS. Sur téléphone, le haut de la maquette mobile v2 (`HautMobile.tsx`) :
 * fil, sur-titre, nom de la page, les deux boutons côte à côte, le sommaire,
 * puis notre H1 en première phrase du chapô. Sous le fil, la photo de tête
 * (dc.html L105) : celle que le photo + CTA de la cadence portait déjà sur
 * cette page, comme sur l'écran équipe. Écartée du tirage (`photoHeros`), le
 * photo + CTA tire alors `team-grind-impact`, celui de la maquette. Au bureau,
 * rien ne bouge.
 */
export default function OuverturePartenaires({
  partenaires = PARTENAIRES,
}: Proprietes) {
  const sommaire: EntreeSommaire[] = [
    ...partenaires.map((p) => ({ id: ancreDe(p.nom), titre: p.nom })),
    SOMMAIRE_FONCTIONNEMENT,
  ];
  return (
      <section
        className={`${mobile.herosCompact} ${mobile.herosMaquette}`}
        style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}
      >
        <FilMobile page={NOM_PAGE} />
        <div data-mobile-seulement="" className={mobile.photoTete}>
          <Image
            src={PHOTO_TETE_PARTENAIRES}
            alt=""
            fill
            priority
            sizes="(max-width: 880px) 100vw, 1px"
            style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
          />
        </div>
        <SurtitreMobile minutes={MINUTES_DE_LECTURE} />
        <div className={mobile.titreMobile} style={SURTITRE}>
          {NOM_PAGE}
        </div>
        <ActionsMobile />
        <SommaireMobile entrees={sommaire} />
        <h1
          className={mobile.h1Lead}
          style={{
            font: "600 calc(clamp(38px,4.6vw,70px) * var(--ts))/1.03 var(--ft)",
            letterSpacing: "-.045em",
            margin: 0,
            maxWidth: "19ch",
            textWrap: "balance",
          }}
        >
          {TITRE_H1_PARTENAIRES}
        </h1>
        <p
          className={mobile.chapoMobile}
          style={{
            font: "400 18.5px/1.6 var(--fb)",
            color: "var(--ink2)",
            margin: "24px 0 0",
            maxWidth: "58ch",
          }}
        >
          Nous ne savons pas tout faire. Pour la GMAO, l’intralogistique ou
          les prestations connexes, nous travaillons avec des acteurs français
          que nous connaissons sur le terrain.
        </p>
      </section>
  );
}

/**
 * LES PARTENAIRES NOMMÉS, une section à part pour la cadence mobile : la
 * maquette mobile v2 en fait deux cartes repliables numérotées (01, 02),
 * ouvertes, suivies de la photo + CTA. Sur téléphone chaque cellule est donc
 * une `SectionRepliee` ouverte : nom sur la bascule, domaine en phrase clé
 * grasse, puis le texte ; le logo et la carte de verre s'effacent
 * (`.decor`, `.aplat`). Le nom est un `h3` (titre de niveau qu'exige
 * `scripts/verifie-blocs-pliables.mjs`), dessiné comme le `div` d'avant.
 */
export function GrillePartenaires({ partenaires = PARTENAIRES }: Proprietes) {
  return (
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 0" }}
      >
        <div data-reveal="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 16 }}>
          {/* MAQUETTE V3 DU 16/10 : au téléphone, les logos des partenaires en
              tuiles blanches côte à côte, avant leurs cartes (le logo de
              chaque carte, lui, s'efface sous 881 px : `.decor`). Téléphone
              seulement : au bureau, chaque logo reste dans sa carte. */}
          <div data-mobile-seulement="" className={mobile.logosPartenaires}>
            {partenaires
              .filter((partenaire) => partenaire.logo)
              .map((partenaire) => (
                <span key={partenaire.nom} className={mobile.logoPartenaire}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partenaire.logo} alt={partenaire.nom} loading="lazy" />
                </span>
              ))}
          </div>
          <div
            className={`mg-r2 ${mobile.sansGouttiere} ${mobile.grillePartenaires}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {partenaires.map((partenaire) => (
              <SectionRepliee
                key={partenaire.nom}
                id={ancreDe(partenaire.nom)}
                titre={partenaire.nom}
                ouvert
              >
              <div className={`${mobile.aplat} ${mobile.cartePartenaire}`} style={VERRE}>
                {partenaire.logo ? (
                  <span className={mobile.decor} style={CARTOUCHE}>
                    {/* `img` et non `next/image` : les dimensions intrinsèques
                        de ces logos ne sont pas connues du dépôt. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={partenaire.logo}
                      alt={partenaire.nom}
                      loading="lazy"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </span>
                ) : null}
                <h3
                  data-titre-bureau=""
                  style={{
                    font: "600 21px var(--ft)",
                    letterSpacing: "-.03em",
                    margin: "22px 0 10px",
                  }}
                >
                  {partenaire.nom}
                </h3>
                <div
                  className={mobile.phraseCle}
                  style={{
                    font: "600 11.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    marginBottom: 14,
                  }}
                >
                  {partenaire.domaine}
                </div>
                {/* Marge basse nulle : la maquette réservait 18px sous ce
                    paragraphe pour un lien « Lire l'annonce » dont la cible
                    n'existe pas sur le site. Le lien n'est pas posé, la
                    réserve non plus. */}
                <p
                  style={{
                    font: "400 15px/1.65 var(--fb)",
                    color: "var(--ink2)",
                    margin: 0,
                  }}
                >
                  {partenaire.corps}
                </p>
              </div>
              </SectionRepliee>
            ))}
          </div>
        </div>
      </section>
  );
}
