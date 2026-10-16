import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";
import {
  ActionsMobile,
  ALireAussi,
  FilMobile,
  SurtitreMobile,
} from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";

import styles from "./Valeurs.module.css";
import { HERO, SLOGAN } from "./valeurs-donnees";

/* Ouverture de l'écran « Nos valeurs », portée de `maquette/accueil-rendu.html`
   lignes 5532 à 5565. Composant serveur : aucun état, les deux survols sont
   dans le module CSS. */

const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 18,
};

const BOUTON_ACCENT: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

const PANNEAU: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "var(--panel)",
  padding: "32px 34px 34px",
  position: "relative",
  overflow: "hidden",
};

const HALO: CSSProperties = {
  position: "absolute",
  width: 400,
  height: 400,
  right: -160,
  top: -180,
  background: "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
  pointerEvents: "none",
};

/* dc.html L485 : 404 mots dans `mobile-native-data.js`, / 230, au moins 2. */
const MINUTES_DE_LECTURE = 2;

/**
 * SUR TÉLÉPHONE, LE HAUT DE LA MAQUETTE MOBILE V2 (`HautMobile.tsx`) : fil,
 * sur-titre, nom de la page, « Décrire mon besoin » et le téléphone, puis notre
 * H1 en première phrase du chapô, et le slogan en liste claire. La photo de
 * tête est celle de la maquette (dc.html L225, `FIMG["a-propos"]`,
 * team-grind-front), une photo que le site sert déjà : téléphone seulement.
 * Ni sommaire ni cadence : la maquette n'y numérote aucune section. Au
 * bureau, rien ne bouge.
 */
export default function HeroValeurs() {
  return (
    <section
      className={`${mobile.herosCompact} ${mobile.herosMaquette}`}
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
        <div>
          <FilMobile page={HERO.surtitre} />
          <div data-mobile-seulement="" className={mobile.photoTete}>
            <Image
              src="/assets/web/team-grind-front.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 880px) 100vw, 1px"
              style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
            />
          </div>
          <SurtitreMobile minutes={MINUTES_DE_LECTURE} />
          <div className={mobile.titreMobile} style={SURTITRE}>
            {HERO.surtitre}
          </div>
          <ActionsMobile />
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
            {HERO.titre}
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
            {HERO.intro}
          </p>
          {/* Au téléphone, cette rangée s'efface (elle reste dans le HTML) :
              la maquette mobile v2 ne pose qu'une pastille « Nos engagements
              RSE », après le slogan (plus bas). */}
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
              className={styles.boutonAccent}
              href={ANCRE_FORMULAIRE}
              style={BOUTON_ACCENT}
            >
              {HERO.action}
            </a>
            {/* Au bureau, le libellé reste en texte, tel que la capture le
                montre ; au téléphone, il devient la pastille de la maquette,
                plus bas, en lien vers /rse/. */}
            <span
              style={{
                font: "600 15px var(--fb)",
                color: "var(--ink3)",
                whiteSpace: "nowrap",
              }}
            >
              {HERO.secondaire}
            </span>
          </div>
        </div>
        <div className={mobile.panneauClair} style={PANNEAU}>
          <div className={mobile.decor} style={HALO} />
          <div style={{ position: "relative" }}>
            <div className={mobile.panneauTitre} style={SURTITRE}>
              {HERO.panneau}
            </div>
            <div
              className={mobile.sloganListe}
              style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 16 }}
            >
              {SLOGAN.map(({ mot, glose }) => (
                <div key={mot} className={mobile.sloganLigne}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span
                      className={mobile.panneauMot}
                      style={{
                        font: "600 calc(19px * var(--ts)) var(--ft)",
                        letterSpacing: "-.03em",
                        color: "#fff",
                        flex: "none",
                      }}
                    >
                      {mot}
                    </span>
                    <span
                      className={mobile.decor}
                      style={{
                        flex: 1,
                        height: 1,
                        background: "rgba(255,255,255,.14)",
                      }}
                    />
                    {/* Le « : » de la puce du téléphone, vrai caractère du
                        document (« Innovation : Retrofit… ») ; au bureau, la
                        span n'existe pas et le filet sépare le mot. */}
                    <span data-mobile-seulement="">{"\u00a0: "}</span>
                  </div>
                  <div
                    className={mobile.panneauGlose}
                    style={{
                      font: "400 14px/1.6 var(--fb)",
                      color: "rgba(255,255,255,.68)",
                      marginTop: 8,
                    }}
                  >
                    {glose}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* dc.html L131 (`isRel`), après le slogan : « À lire aussi » et la
            seule pastille de la maquette, « Nos engagements RSE », vers la
            page servie (/rse/). Téléphone seulement ; au bureau, la grille ne
            la place pas (`display: none`). */}
        <div data-mobile-seulement="" className={mobile.liensMobile} style={{ display: "flex", flexWrap: "wrap" }}>
          <ALireAussi />
          <Link href="/rse/">{HERO.secondaire}</Link>
        </div>
      </div>
    </section>
  );
}
