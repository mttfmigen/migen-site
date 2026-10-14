import Image from "next/image";
import Link from "next/link";

import type { CSSProperties } from "react";

import type { EntreeSommaire } from "./HautMobile";
import mobile from "./mobile-apropos.module.css";
import SectionRepliee from "./SectionRepliee";
import styles from "./TerrainsExcellence.module.css";

/**
 * Nos terrains d'excellence : une carte de verre en deux colonnes.
 *
 * Maquette, ligne 5281. Seul lien interne vivant de cet écran avec
 * `/implantations/` : `/secteurs/` répond 200, il est donc posé.
 *
 * LA PHOTO, CHANGÉE LE 12/10 À LA DEMANDE DE MEHDI : « sur la page nous
 * connaitre y'a tout le temps la même photo. Bloc "notre force", bloc le
 * premier client ».
 *
 * Mesuré avant de toucher quoi que ce soit : la page servait `team-duo.jpg`
 * DEUX FOIS, ici et dans `OrigineDuNom`. Et le défaut vient de la maquette
 * elle-même, pas du portage : à la ligne 5281 de `maquette/accueil-rendu.html`
 * les deux emplacements pointent le MÊME actif Claude Design,
 * « 5b5403d8-66e3-40e2-8aca-295646288731 ». Leurs deux `alt` sont pourtant
 * différents, ce qui dit que deux photos distinctes étaient voulues.
 *
 * CRITÈRE DE CHOIX : ce bloc parle de secteurs, « chaque secteur a ses
 * équipements, ses contraintes et ses règles », et il ouvre sur `/secteurs/`.
 * Il lui faut donc des techniciens DANS une installation industrielle
 * identifiable, pas un duo d'atelier. Deux intervenants en gilet haute
 * visibilité sur une passerelle de caillebotis, le long de conduites
 * calorifugées : le site porte le propos, et l'image reste fidèle à l'intention
 * de l'`alt` de la maquette, « deux techniciens ».
 *
 * Le texte alternatif est la description du registre, mot pour mot : c'est ce
 * qu'exige `scripts/verifie-alt-photos.mjs`, et cette photo-ci, contrairement à
 * celle de `/assets/web/`, entre dans son périmètre.
 */

const FORT = { fontWeight: 600, color: "var(--ink)" } as const;

/* Écrits une fois : l'en-tête de bureau et la carte 02 du téléphone. */
const SURTITRE_TEXTE = "Notre force";
const TITRE_TEXTE = "Nos terrains d’excellence";

/** La carte 02 de la maquette mobile v2, ouverte au chargement. */
export const SOMMAIRE_TERRAINS: EntreeSommaire = {
  id: "notre-force",
  titre: TITRE_TEXTE,
};

/*
 * « VOIR NOS SECTEURS → » DEVIENT UN BOUTON, À LA DEMANDE DE MEHDI.
 * Le 13/10 à 21:32 : « Voir nos secteurs → tu as pas mis de cta pareil sur la
 * page nous connaitre ». La maquette, ligne 5281, le rend en lien texte orange :
 * sa demande prime ici sur elle.
 *
 * Dessin recopié du bouton secondaire « Nos valeurs » du haut de la même page
 * (`Ouverture.tsx`, constante BOUTON et fond verre), plutôt qu'importé : un
 * composant ne lit pas le module CSS d'un autre. Libellé et cible inchangés.
 *
 * Seul écart, voulu : le fond vit dans le module CSS, pas en ligne. Un style en
 * ligne l'emporte sur `:hover`, et c'est pourquoi le survol de « Nos valeurs »
 * ne change rien (mesuré le 14/10, fond identique avant et pendant).
 */
const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  borderRadius: 999,
  font: "600 15px var(--fb)",
  whiteSpace: "nowrap",
  border: "1px solid var(--gbd)",
  color: "var(--ink)",
  transition: "background var(--tr)",
};

export default function TerrainsExcellence() {
  return (
    <SectionRepliee
      ouvert
      id={SOMMAIRE_TERRAINS.id}
      kicker={SURTITRE_TEXTE}
      titre={TITRE_TEXTE}
    >
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          className={`mg-r2 ${mobile.aplat}`}
          style={{
            borderRadius: "var(--rad)",
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
            padding: 28,
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div style={{ padding: "16px 12px 16px 16px" }}>
            <div
              data-titre-bureau=""
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
            <h2
              data-titre-bureau=""
              style={{
                font: "600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
                letterSpacing: "-.04em",
                color: "var(--ink)",
                margin: "0 0 18px",
              }}
            >
              {TITRE_TEXTE}
            </h2>
            <p
              style={{
                font: "400 16px/1.75 var(--fb)",
                color: "var(--ink1)",
                margin: "0 0 14px",
              }}
            >
              Chaque secteur a ses équipements, ses contraintes et ses règles.
              Nos techniciens ne sont pas généralistes.{" "}
              <strong style={FORT}>
                Ils connaissent vos machines, vos normes et vos cadences, parce
                qu&rsquo;ils y travaillent tous les jours.
              </strong>
            </p>
            <p
              style={{
                font: "400 16px/1.75 var(--fb)",
                color: "var(--ink1)",
                margin: "0 0 22px",
              }}
            >
              C&rsquo;est cette expérience terrain qui nous permet
              d&rsquo;envoyer{" "}
              <strong style={FORT}>
                le bon profil, opérationnel dès le premier jour
              </strong>{" "}
              sur votre site.
            </p>
            <Link
              href="/secteurs/"
              className={styles.lienSecteurs}
              style={BOUTON}
            >
              Voir nos secteurs →
            </Link>
          </div>
          {/* La carte 02 de la maquette mobile v2 n'a que ses deux
              paragraphes : la photo s'efface sous 881 px (`.masqueMobile`),
              le bureau la garde. */}
          <div
            className={mobile.masqueMobile}
            style={{
              borderRadius: "calc(var(--rad) - 8px)",
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "var(--ph)",
              position: "relative",
            }}
          >
            <Image
              src="/assets/photos/env-ingenieurs-inspectant-site-industriel.jpg"
              alt="Deux intervenants en gilet haute visibilité parcourant une passerelle en caillebotis le long de conduites calorifugées"
              fill
              sizes="(max-width: 900px) 100vw, 540px"
              loading="lazy"
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.04)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
    </SectionRepliee>
  );
}
