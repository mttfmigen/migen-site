import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "@/components/site/blocs/Blocs.module.css";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  PANNEAU,
  SURTITRE,
} from "@/components/site/blocs/habillage";
import {
  ActionsMobile,
  ALireAussi,
  FilMobile,
  SommaireMobile,
  SurtitreMobile,
} from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";

import { SOMMAIRE_CAS } from "./CasRetrofit";
import { SOMMAIRE_PIECES } from "./PiecesFournisseur";
import { SOMMAIRE_PILIERS } from "./PiliersRse";

/* Le nom de la page : notre sur-titre, le titre de la maquette mobile. */
const NOM_PAGE = "Nos engagements RSE";
/* dc.html L485 : 645 mots dans `mobile-native-data.js`, / 230, arrondi. */
const MINUTES_DE_LECTURE = 3;

/**
 * Ouverture de la page RSE : promesse à gauche, panneau du chiffre sécurité à
 * droite. Portée de `maquette/accueil-rendu.html`, lignes 5674 à 5704.
 *
 * Composant serveur : aucun état, aucune écoute.
 *
 * DEUX ÉCARTS À LA MAQUETTE.
 *
 * 1. Le chapeau écrivait « C'est notre métier (tiret cadratin) et de loin notre
 *    premier l-e-v-i-e-r environnemental ». Le mot est proscrit par le contrat,
 *    le tiret cadratin aussi. La phrase dit maintenant l'effet obtenu.
 * 2. Les deux boutons portaient `href="#"` et un verbe d'éditeur. Le premier
 *    visait l'écran de contact : il pointe l'ancre du formulaire de CETTE page,
 *    qui existe (`ANCRE_FORMULAIRE`), plutôt que d'envoyer le visiteur ailleurs
 *    alors que le formulaire est au bas de la page. Le second vise /valeurs/,
 *    vérifiée à 200 sur le serveur de développement.
 */

/* La lueur orange du panneau, aux dimensions de CET écran : 400px cadrée en
   haut à droite, là où `habillage.LUEUR` est cadrée en bas. */
const LUEUR_HAUTE: CSSProperties = {
  position: "absolute",
  width: 400,
  height: 400,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
  pointerEvents: "none",
};

/* Cadre d'un logo d'organisme dans le panneau sombre. La maquette y posait un
   rectangle en pointillés portant le nom en texte, c'est-à-dire un emplacement
   d'image à venir. Les deux logos existent dans `public/assets/logos`, déjà
   servis par la section Certifications de l'accueil : on sert l'image, sur fond
   blanc puisqu'un logo en couleurs ne tient pas sur un fond anthracite. */
const CADRE_LOGO: CSSProperties = {
  width: 104,
  height: 56,
  borderRadius: 9,
  background: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 10px",
  flex: "none",
};

const IMAGE_LOGO: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  display: "block",
};

export default function OuvertureRse() {
  return (
    // SUR TÉLÉPHONE, LE HAUT DE LA MAQUETTE MOBILE V2 (`HautMobile.tsx`), comme
    // « Nous connaître » : fil, photo, sur-titre, nom de la page, les deux
    // boutons côte à côte, le sommaire, puis notre H1 en première phrase du
    // chapô. La photo de tête est celle de la maquette (dc.html L225,
    // `FIMG["a-propos"]`, team-grind-front) ; dans la carte du cas, la
    // maquette ne montre que le texte (`.casPhoto`). Au bureau, rien ne bouge.
    <section
      className={`${mobile.herosCompact} ${mobile.herosMaquette} ${mobile.herosPhoto}`}
      style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}
    >
      <div
        className="mg-r2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr .92fr",
          gap: 52,
          alignItems: "start",
        }}
      >
        <div className={mobile.colonneTexte}>
          <FilMobile page={NOM_PAGE} />
          <SurtitreMobile minutes={MINUTES_DE_LECTURE} />
          <div className={mobile.titreMobile} style={{ ...SURTITRE, marginBottom: 18 }}>
            {NOM_PAGE}
          </div>
          <ActionsMobile />
          <SommaireMobile entrees={[SOMMAIRE_PILIERS, SOMMAIRE_CAS, SOMMAIRE_PIECES]} />
          <h1
            className={mobile.h1Lead}
            style={{
              font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "18ch",
              textWrap: "balance",
            }}
          >
            En maintenance, la RSE se mesure en machines qu’on ne jette pas.
          </h1>
          <p
            className={mobile.chapoMobile}
            style={{
              font: "400 17.5px/1.65 var(--fb)",
              color: "var(--ink2)",
              margin: "24px 0 0",
              maxWidth: "50ch",
            }}
          >
            Prolonger la vie d’une ligne de dix ans, c’est éviter des tonnes
            d’acier neuf et un chantier complet. C’est notre métier, et de loin
            ce qui évite le plus d’impact environnemental. Le reste suit&nbsp;:
            la sécurité des équipes, l’emploi local, et des achats qui ne
            traversent pas l’Europe.
          </p>
          {/* Au téléphone, cette rangée s'efface (elle reste dans le HTML) : la
              maquette mobile v2 ne pose qu'une pastille « Nos valeurs », après
              « Le chiffre qui compte » (plus bas). */}
          <div
            className={mobile.masqueMobile}
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <a
              className={styles.boutonAction}
              href={ANCRE_FORMULAIRE}
              style={BOUTON_ACTION}
            >
              Demander nos attestations
            </a>
            {/* `Link` et non `<a>` : cible interne du site, préchargée, et
                `@next/next/no-html-link-for-pages` l'exige. L'appel à l'action
                voisin reste un `<a>`, son ancre ne change pas de page. */}
            <Link
              className={styles.boutonSecondaire}
              href="/valeurs/"
              style={BOUTON_SECONDAIRE}
            >
              Nos valeurs
            </Link>
          </div>
        </div>

        <div
          data-mobile-seulement=""
          className={mobile.photoMobile}
          style={{ position: "relative", overflow: "hidden", background: "var(--ph)" }}
        >
          <Image
            src="/assets/web/team-grind-front.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 880px) 100vw, 1px"
            style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
          />
        </div>

        {/* Au téléphone, le panneau sombre passe en texte clair dans le flux
            (maquette mobile v2 : phrase clé, puce « 2 : … », ligne MASE et
            EcoVadis) : `.panneauClair`, `.puceRse`, `.ligneMase`. */}
        <div className={mobile.panneauClair} style={{ ...PANNEAU, padding: "32px 34px 34px" }}>
          <div className={mobile.decor} style={LUEUR_HAUTE} />
          <div style={{ position: "relative" }}>
            <div className={mobile.panneauTitre} style={{ ...SURTITRE, marginBottom: 20 }}>
              Le chiffre qui compte
            </div>
            <div className={mobile.puceRse}>
            <div
              style={{
                font: "600 calc(clamp(56px,6.4vw,88px) * var(--ts))/.9 var(--ft)",
                letterSpacing: "-.055em",
                color: "var(--acc)",
              }}
            >
              2
            </div>
            <div
              style={{
                font: "400 16px/1.6 var(--fb)",
                color: "rgba(255,255,255,.72)",
                marginTop: 14,
                maxWidth: "30ch",
              }}
            >
              accidents du travail avec arrêt en 2025, sur plus de
              90&nbsp;000 heures d’intervention. S’y ajoutent 3 accidents sans
              arrêt et 1 accident de trajet.
            </div>
            </div>
            <div
              className={mobile.decor}
              style={{
                height: 1,
                background: "rgba(255,255,255,.12)",
                margin: "22px 0",
              }}
            />
            <div
              className={mobile.ligneMase}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <span className={mobile.decor} style={CADRE_LOGO}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logos/mase.png" alt="MASE" style={IMAGE_LOGO} />
              </span>
              <span className={mobile.decor} style={CADRE_LOGO}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logos/ecovadis.webp"
                  alt="EcoVadis"
                  style={IMAGE_LOGO}
                />
              </span>
              <span
                style={{
                  font: "400 12.5px/1.5 var(--fb)",
                  color: "rgba(255,255,255,.5)",
                  flex: 1,
                  minWidth: 140,
                }}
              >
                <strong data-mobile-seulement="">MASE et EcoVadis :</strong>{" "}
                Démarche MASE et évaluation EcoVadis. Attestations transmises
                avec chaque plan de prévention.
              </span>
            </div>
          </div>
        </div>
        {/* dc.html L131 (`isRel`) : « À lire aussi » et la seule pastille de
            la maquette, « Nos valeurs ». Téléphone seulement. */}
        <div data-mobile-seulement="" className={mobile.liensMobile} style={{ display: "flex", flexWrap: "wrap" }}>
          <ALireAussi />
          <Link href="/valeurs/">Nos valeurs</Link>
        </div>
      </div>
    </section>
  );
}
