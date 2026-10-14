import Image from "next/image";
import Link from "next/link";

import type { CSSProperties } from "react";

import {
  ActionsMobile,
  ALireAussi,
  FilMobile,
  SommaireMobile,
  SurtitreMobile,
  type EntreeSommaire,
} from "./HautMobile";
import mobile from "./mobile-apropos.module.css";
import styles from "./Ouverture.module.css";

/**
 * Ouverture de « Nous connaître » : titre, promesse, photo légendée.
 *
 * Maquette, lignes 5203 à 5225 de `maquette/accueil-rendu.html`.
 *
 * Les deux appels à l'action visent `/equipe/` et `/valeurs/`, vérifiées en 200
 * sur le serveur local avant d'être posées : cet écran est cité par le pied de
 * page de tout le site, un bouton mort ici se verrait sur 225 pages.
 */

/* Mêmes valeurs que la maquette, lignes 5211 et 5212. Les survols vivent dans le
   module CSS, jamais dans `app/globals.css` : plusieurs agents y écriraient. */
const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
};
/** Le nom de la page : notre sur-titre, le titre de la maquette mobile. */
const NOM_PAGE = "Nous connaître";

/* dc.html L485 : 1 582 mots dans `mobile-native-data.js`, / 230, arrondi. */
const MINUTES_DE_LECTURE = 7;

/**
 * SUR TÉLÉPHONE, LE HAUT DE LA MAQUETTE MOBILE V2 (`HautMobile.tsx`) : fil,
 * photo, sur-titre, nom de la page, « Décrire mon besoin » et le téléphone, le
 * sommaire, puis notre H1 en première phrase du chapô. Les pièces ajoutées
 * sont `data-mobile-seulement`, les autres ne changent que de dessin sous
 * 881 px : au bureau, rien ne bouge.
 */
export default function Ouverture({
  sommaire = [],
}: {
  sommaire?: readonly EntreeSommaire[];
}) {
  return (
    <section
      className={`${mobile.herosCompact} ${mobile.herosMaquette} ${mobile.herosPhoto}`}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "70px 40px 0",
      }}
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
          <div
            className={mobile.titreMobile}
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
              marginBottom: 18,
            }}
          >
            {NOM_PAGE}
          </div>
          <ActionsMobile />
          <SommaireMobile entrees={sommaire} />
          <h1
            className={mobile.h1Lead}
            style={{
              font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
              letterSpacing: "-.045em",
              color: "var(--ink)",
              margin: 0,
              maxWidth: "17ch",
              textWrap: "balance",
            }}
          >
            Un seul métier&nbsp;: technicien de maintenance.
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
            {/* L&rsquo;INTRO NOMMAIT UN SEUL MÉTIER. Mehdi, le 13/10 :
                « tu parles que de la maintenance, tu parles pas du bureau
                d&rsquo;étude, de migen chantier ». Avant, elle disait « Nous ne
                faisons qu&rsquo;une chose, affecter sur vos sites des
                techniciens qui entretiennent les machines, et rien d&rsquo;autre »,
                ce qui décrivait l&rsquo;offre Résidence et elle seule. C&rsquo;est
                exactement ce que Nathan Jorez avait vu le même jour : « cette
                page est ultra spé résidence comme si c&rsquo;était la seule
                offre ».

                CE QUI RESTE DE SA COPIE : l&rsquo;opposition de départ, la
                formule « et rien d&rsquo;autre », la niche et les process rodés
                face aux généralistes. CE QUI CHANGE : le périmètre nommé, et il
                reprend les intitulés que le site écrit déjà, maintenance,
                bureau d&rsquo;études et travaux industriels.

                La phrase d&rsquo;avant était DÉJÀ de notre main : la sienne
                écrivait « mettre à disposition du personnel », proscrit deux
                fois par le contrat de rédaction, et la reformulation avait
                resserré le périmètre sans qu&rsquo;on le veuille. */}
            Des entreprises entretiennent les machines. D&rsquo;autres placent
            du personnel. Nous ne faisons qu&rsquo;un métier, l&rsquo;industrie
            qui tourne, et rien d&rsquo;autre : la maintenance de vos machines,
            le bureau d&rsquo;études qui les conçoit et les met en conformité, et
            les travaux industriels qui les déplacent, les montent et les
            démarrent. C&rsquo;est une niche, et c&rsquo;est ce qui nous permet
            d&rsquo;avoir des process rodés là où les généralistes improvisent.
          </p>
          {/* dc.html, page /a-propos/nous-connaitre/ : la devise est un
              paragraphe sous le chapô, pas une légende sur la photo. Au
              téléphone seulement ; au bureau, elle reste la légende. */}
          <p data-mobile-seulement="" className={mobile.chapoMobile}>
            Innovation, performance, impact.
          </p>
          <div
            className={mobile.liensMobile}
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <ALireAussi />
            <Link
              href="/a-propos/equipe/"
              className={styles.boutonPrincipal}
              style={{
                ...BOUTON,
                background: "var(--acc)",
                color: "#fff",
                boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
                transition: "filter var(--tr),transform var(--tr)",
              }}
            >
              Voir qui tient tout ça
            </Link>
            <Link
              href="/valeurs/"
              className={styles.boutonSecond}
              style={{
                ...BOUTON,
                background: "var(--gsol)",
                border: "1px solid var(--gbd)",
                color: "var(--ink)",
                transition: "background var(--tr)",
              }}
            >
              Nos valeurs
            </Link>
          </div>
        </div>
        <div
          className={`${styles.photo} ${mobile.photoMobile}`}
          style={{
            borderRadius: "var(--rad)",
            overflow: "hidden",
            position: "relative",
            minHeight: 340,
            background: "var(--ph)",
          }}
        >
          {/* LA PHOTO DE TÊTE DU TÉLÉPHONE est celle de la maquette mobile v2
              (dc.html L225, `FIMG["a-propos"]`, team-grind-front), sans
              légende. Celle du bureau, son dégradé et sa légende s'effacent
              sous 881 px (`.masqueMobile`) ; au-dessus, la photo du
              téléphone n'existe pas. */}
          <Image
            data-mobile-seulement=""
            src="/assets/web/team-grind-front.jpg"
            alt="Technicien de maintenance migen en intervention"
            fill
            priority
            sizes="(max-width: 880px) 100vw, 1px"
            style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
          />
          <Image
            className={mobile.masqueMobile}
            src="/assets/web/team-grind-sparks.jpg"
            alt="Technicien de maintenance migen en intervention"
            fill
            sizes="(max-width: 900px) 100vw, 520px"
            style={{
              objectFit: "cover",
              filter: "saturate(var(--sat)) contrast(1.05)",
              opacity: "var(--ph-op)",
            }}
          />
          <div
            className={mobile.masqueMobile}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top,rgba(18,17,16,.74),rgba(18,17,16,0) 54%)",
            }}
          />
          <div
            className={mobile.masqueMobile}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "26px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Monogramme décoratif : la marque est déjà dans le texte de la
                page. Largeur automatique, donc `img` et non `next/image`. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-migen-white.png"
              alt=""
              style={{ height: 20, width: "auto", flex: "none" }}
            />
            <span
              style={{
                font: "500 11.5px var(--fb)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.82)",
              }}
            >
              Innovation, performance, impact.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
