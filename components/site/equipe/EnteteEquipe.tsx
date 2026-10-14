import Image from "next/image";

import {
  ActionsMobile,
  FilMobile,
  SommaireMobile,
  SurtitreMobile,
  type EntreeSommaire,
} from "@/components/site/nous-connaitre/HautMobile";
import mobile from "@/components/site/nous-connaitre/mobile-apropos.module.css";

import { H1 } from "./equipe-donnees";

/* Le titre de cet écran dans la maquette mobile v2 (dc.html, page
   /a-propos/equipe/) : il nomme aussi la page dans le fil. */
const NOM_PAGE = "Vos interlocuteurs";
/* dc.html L485 : `readMin` de la page dans la maquette. */
const MINUTES_DE_LECTURE = 4;

/**
 * Le héros de l'écran équipe : surtitre, H1, chapeau. Relevé sur la capture
 * `maquette/rendu/a-propos--equipe.html`. Sorti de la page pour que le
 * contrôle le monte comme les autres sections.
 */
export default function EnteteEquipe({
  sommaire = [],
  photo,
}: {
  sommaire?: readonly EntreeSommaire[];
  /** La photo de tête du téléphone (dc.html L105), une photo que la page porte. */
  photo?: string;
}) {
  // SUR TÉLÉPHONE, LE HAUT DE LA MAQUETTE MOBILE V2 (`HautMobile.tsx`) : fil,
  // sur-titre, « Vos interlocuteurs », les deux boutons côte à côte, le
  // sommaire, puis notre H1 en première phrase du chapô. Notre sur-titre
  // « Équipe & direction » s'efface sous 881 px (`.masqueMobile`), le titre
  // de la maquette prend sa place ; il reste dans le HTML. Sous le fil, la
  // photo de tête ; sous le chapô, le cartouche de la maquette (bloc `isQ`),
  // mot pour mot. Au bureau, rien ne bouge.
  return (
    <section
      className={`${mobile.herosCompact} ${mobile.herosMaquette}`}
      style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}
    >
      <FilMobile page={NOM_PAGE} />
      {photo ? (
        <div data-mobile-seulement="" className={mobile.photoTete}>
          <Image
            src={photo}
            alt=""
            fill
            priority
            sizes="(max-width: 880px) 100vw, 1px"
            style={{ objectFit: "cover", filter: "saturate(var(--sat)) contrast(1.05)" }}
          />
        </div>
      ) : null}
      <SurtitreMobile minutes={MINUTES_DE_LECTURE} />
      <div data-mobile-seulement="" className={mobile.titreMobile}>
        {NOM_PAGE}
      </div>
      <ActionsMobile />
      <SommaireMobile entrees={sommaire} />
      <div
        className={mobile.masqueMobile}
        style={{
          font: "600 11.5px var(--fb)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--acc)",
          marginBottom: 20,
        }}
      >
        Équipe &amp; direction
      </div>
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
        {H1}
      </h1>
      <p
        className={mobile.chapoMobile}
        style={{
          font: "400 18.5px/1.6 var(--fb)",
          color: "var(--ink2)",
          margin: "24px 0 0",
          maxWidth: "56ch",
        }}
      >
        Une direction et des responsables qui décident vite et
        s&rsquo;engagent personnellement, cent vingt techniciens sur le
        terrain. De la première visite au bilan de mission, vous avez
        toujours un nom en face de vous.
      </p>
      <p data-mobile-seulement="" className={mobile.cartouche}>
        Pour joindre directement l&rsquo;équipe :{" "}
        <a href="tel:+33478337205">04 78 33 72 05</a>, du lundi au vendredi de
        8h00 à 18h30.
      </p>
    </section>
  );
}
