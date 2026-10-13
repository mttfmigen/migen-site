import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./SecteursAccueil.module.css";
import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { altPhoto } from "@/lib/descriptions-photos";

export interface SecteurAccueil {
  libelle: string;
  chemin: string;
}

interface Proprietes {
  secteurs?: readonly SecteurAccueil[];
  /** Visuel de gauche : chemin servi depuis `public/`. */
  image?: { src: string; alt: string };
}

/** Les sept secteurs de la maquette, dans son ordre. */
const SECTEURS: readonly SecteurAccueil[] = [
  { libelle: "Agroalimentaire", chemin: "/secteurs/agroalimentaire/" },
  { libelle: "Automobile", chemin: "/secteurs/automobile/" },
  { libelle: "Logistique", chemin: "/secteurs/logistique/" },
  { libelle: "Aéronautique", chemin: "/secteurs/aeronautique/" },
  { libelle: "Pharmaceutique", chemin: "/secteurs/pharmaceutique/" },
  { libelle: "Chimie", chemin: "/secteurs/chimie/" },
  { libelle: "Industrie métallique", chemin: "/secteurs/industrie-metallique/" },
];

/**
 * LE VISUEL DU BLOC, ET POURQUOI CE N'EST PLUS CELUI DE LA MAQUETTE.
 *
 * Mehdi, le 12/10 : « les Bento offres et secteur ne changent pas d'image ».
 * Mesure du 14/10 en production, par `node scripts/verifie-photos-du-bloc.mjs
 * --url=/` : UN défaut sur l'accueil, et c'était celui-là. La page servait
 * `/assets/web/sv-convoyeur.jpg` DEUX FOIS, en section 9 (le focus Résidence,
 * `FocusResidence.tsx`) et en section 19 (ici). Même fichier, deux blocs : le
 * visuel des secteurs ne changeait pas, il reprenait celui du bloc d'avant.
 *
 * ET LE DÉFAUT VIENT DE LA MAQUETTE, pas du portage. Dans
 * `maquette/site-final-autonome.html`, les deux emplacements pointent le même
 * actif, « 0a8d08d8-8c30-451e-bea4-ffcaca359445 », c'est-à-dire la ressource
 * r5, c'est-à-dire `assets/web/sv-convoyeur.jpg` ; elle le sert même une
 * troisième fois sur `/expertises/`. Leurs deux `alt` étant différents, deux
 * photos distinctes étaient bien voulues. C'est donc un écart ASSUMÉ à la
 * maquette, demandé par Mehdi, et déclaré ici.
 *
 * LA PHOTO RETENUE N'EST PAS CHOISIE AU GOÛT. C'est celle que le registre
 * attribue à `/secteurs/`, la page dont ce bloc est la fenêtre sur l'accueil
 * (`lib/photo-par-page.ts`, ligne « /secteurs/ »). La règle est celle que
 * Mehdi a validée le 12/10 pour les cartes : on montre la photo de la page que
 * le bloc ouvre. `sv-convoyeur.jpg` reste au focus Résidence, qui l'avait en
 * premier dans l'ordre de la page.
 *
 * Le texte alternatif est LU dans le registre, jamais retapé : c'est ce
 * qu'exige `scripts/verifie-alt-photos.mjs`, et une description recopiée à la
 * main finit par dériver de sa photo.
 */
const PHOTO_SECTEURS = "/assets/photos/il-female-engineer-inspecting-machinery-in-indust.jpg";

const IMAGE_SECTEURS = {
  src: PHOTO_SECTEURS,
  alt: altPhoto(PHOTO_SECTEURS),
};

/*
 * LE SUR-TITRE ET LE TITRE, ÉCRITS UNE SEULE FOIS.
 *
 * Ils servent à DEUX endroits : l'en-tête d'origine de la section, qui tient le
 * dessin de bureau, et la bascule de repli, qui porte le titre sur téléphone.
 * En constante plutôt que retapés : la copie appartient à Mehdi, et une copie
 * recopiée est une copie qui finit par dériver. Voir
 * `replis-accueil.module.css` pour la règle qui n'en montre jamais qu'un.
 */
const SURTITRE_TEXTE = "Secteurs d’activité";
const TITRE_TEXTE = "Nos expertises sectorielles";

const LIGNE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "20px 4px",
  borderBottom: "1px solid var(--line)",
  font: "600 19px var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
  transition: "color 160ms ease,padding 160ms ease",
};

export default function SecteursAccueil({
  secteurs = SECTEURS,
  image = IMAGE_SECTEURS,
}: Proprietes) {
  return (
    <section className={replis.repli} style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <SectionPliableMobile kicker={SURTITRE_TEXTE} titre={TITRE_TEXTE}>
        <div
          className={replis.enTeteBureau}
          style={{
            font: "600 11.5px var(--fb)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--acc)",
            marginBottom: 14,
          }}
        >
          {SURTITRE_TEXTE}
        </div>
        <div className={replis.enTeteBureau} style={{ marginBottom: 26 }}>
          <h2
            style={{
              font: "600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
              letterSpacing: "-.045em",
              margin: 0,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            {TITRE_TEXTE}
          </h2>
        </div>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 40,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              borderRadius: "var(--rad)",
              overflow: "hidden",
              position: "relative",
              minHeight: 420,
              background: "var(--ph)",
            }}
          >
            {/* `fill` : la hauteur vient de la colonne, pas du fichier. Le
                parent porte `position: relative` pour que l'image s'y cale. */}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.04)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {secteurs.map((secteur, rang) => (
              <Link
                key={secteur.chemin}
                href={secteur.chemin}
                className={styles.ligne}
                style={
                  rang === 0
                    ? { ...LIGNE, borderTop: "1px solid var(--line)" }
                    : LIGNE
                }
              >
                {secteur.libelle}
                <span
                  aria-hidden="true"
                  style={{ color: "#ff7c3c", font: "400 22px var(--fb)" }}
                >
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
