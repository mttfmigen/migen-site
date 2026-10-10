import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { CarteOffre } from "@/types/offre";

import styles from "./PageOffre.module.css";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Section « Maillage · offres » de la capture
 * (`maquette/rendu/offres--residence.html`) : surtitre « Nos autres offres »,
 * H2 « Un autre besoin ? Il a son offre. », puis cinq cartes-photos en bento :
 * étiquette, titre, phrase, « Voir l'offre → » (ou « Trouver mon hub → »).
 *
 * LE TEXTE DES CARTES EST CELUI DU GABARIT, copié mot pour mot de la capture
 * (résidence et zéro-arrêt rendus), rangé ici dans un dictionnaire par cible.
 * Le relais JSON de chaque page choisit QUELLES cartes s'affichent et dans quel
 * ordre, via `autres[].href` : la maquette écarte l'offre de la page en cours,
 * le corpus de chaque page le fait au même endroit. Une cible absente du
 * dictionnaire n'est pas rendue : rien ne s'invente.
 */

export interface ProprietesMaillageOffres {
  cartes: CarteOffre[];
}

interface CarteMaillage {
  etiquette: string;
  titre: string;
  phrase: string;
  lien: string;
  /** Sans photo, la carte se rend en carte sombre pleine. */
  photo?: string;
}

/** Le dictionnaire du gabarit, texte fixe de la capture. */
const CARTES_GABARIT: Readonly<Record<string, CarteMaillage>> = {
  // Relevée le 07/10 dans la maquette qui tourne : elle manquait à ce
  // dictionnaire, et comme le composant filtre sur lui, la carte disparaissait
  // du site alors que la donnée la portait bien en première position. C'est
  // elle que la porte G17 réclamait sous « CONTRAT UNIQUE » et
  // « migen© Full service » sur cinq pages.
  //
  // La photo de la carte, absente de la maquette au 07/10 (carte sombre
  // pleine), y est désormais : relevée le 08/10 sur la maquette qui tourne
  // (fond de la carte, `assets/web/sv-duo-impact.jpg`, sur les six pages).
  "/offres/full-service/": {
    etiquette: "Contrat unique",
    titre: "migen© Full service",
    phrase:
      "Toute votre maintenance dans un seul contrat : préventif, dépannage, pièces et GMAO, un seul interlocuteur.",
    lien: "Voir l’offre",
    photo: "/assets/web/sv-duo-impact.jpg",
  },
  "/offres/zero-arret/": {
    etiquette: "Abonnement",
    titre: "migen© Zéro arrêt",
    phrase:
      "Le préventif le samedi, le dépannage la nuit : une maintenance qui ne touche jamais à votre production.",
    lien: "Voir l’offre",
    photo: "/assets/web/ph-technicien.jpg",
  },
  "/offres/residence/": {
    etiquette: "Présence continue",
    titre: "migen© Résidence",
    phrase:
      "Des techniciens en résidence sur votre site, intégrés à votre équipe, validés par vous.",
    lien: "Voir l’offre",
    photo: "/assets/web/team-duo.jpg",
  },
  "/offres/arret-technique/": {
    etiquette: "Arrêt planifié",
    titre: "migen© Arrêt technique",
    phrase:
      "Votre arrêt annuel préparé, dimensionné et tenu, ligne rendue à la date annoncée.",
    lien: "Voir l’offre",
    photo: "/assets/web/team-grind-front.jpg",
  },
  "/offres/bureau-etudes/": {
    etiquette: "Études",
    titre: "migen© Bureau d’études",
    phrase:
      "Conception, schémas électriques, mise en conformité machine : des études faites par des gens de terrain.",
    lien: "Voir l’offre",
    photo: "/assets/web/ph-robots-solaire.jpg",
  },
  "/travaux-industriels/": {
    etiquette: "Chantier",
    titre: "migen© Travaux industriels",
    phrase:
      "Transfert, montage, démantèlement, levage : le chantier, du relevé à la remise en production.",
    lien: "Voir l’offre",
    photo: "/assets/web/ph-hero-raffinerie.jpg",
  },
  "/implantations/": {
    etiquette: "Partout en France",
    titre: "Nos hubs",
    phrase:
      "Lyon, Paris, Nantes, Toulouse, Strasbourg, Lille : on part du hub le plus proche de votre site.",
    lien: "Trouver mon hub",
    photo: "/assets/web/team-grind-close.jpg",
  },
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 26px",
  maxWidth: "24ch",
  textWrap: "balance",
};

const GRILLE: CSSProperties = {
  display: "grid",
  // TROIS COLONNES ÉGALES, mesuré le 07/10 : 365 + 12 + 365 + 12 + 365 dans
  // 1120. La maquette a abandonné le bento 1.25fr et sa carte phare sur deux
  // rangs ; ses six cartes font toutes 365 x 210.
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gridTemplateRows: "repeat(2, minmax(210px, auto))",
  gap: 12,
};

const CARTE: CSSProperties = {
  position: "relative",
  display: "block",
  overflow: "hidden",
  borderRadius: 24,
  color: "#fff",
  minHeight: 210,
  background: "rgb(26, 25, 24)",
  transition: "transform var(--tr)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.35) 60%,rgba(18,17,16,.1))",
};

const CONTENU: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: 8,
  height: "100%",
  padding: 22,
};

const ETIQUETTE: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

const PHRASE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "rgba(255,255,255,.74)",
  maxWidth: "44ch",
};

export default function MaillageOffres({ cartes }: ProprietesMaillageOffres) {
  const retenues = cartes
    .map((carte) => ({ href: carte.href, gabarit: CARTES_GABARIT[carte.href] }))
    .filter((carte) => !!carte.gabarit);

  if (retenues.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 14 }}>
          Nos autres offres
        </div>
        <h2 style={TITRE}>Un autre besoin ? Il a son offre.</h2>
        <div className="g3-bento5 mg-rmulti" style={GRILLE}>
          {retenues.map(({ href, gabarit }) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={styles.carteMaillage}
              style={CARTE}
            >
              {gabarit.photo ? (
                <>
                  <Image
                    src={gabarit.photo}
                    alt={altPhoto(gabarit.photo)}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 400px"
                    style={{
                      objectFit: "cover",
                      filter: "saturate(var(--sat)) brightness(.72)",
                    }}
                  />
                  <div aria-hidden="true" style={VOILE} />
                </>
              ) : null}
              <div style={CONTENU}>
                {/* Relevé de la maquette qui tourne (08/10) : titre à 20px/1.2,
                    chaque texte interpolé dans sa propre balise, la flèche
                    hors du libellé. */}
                <span style={ETIQUETTE}>
                  <span>{gabarit.etiquette}</span>
                </span>
                <span
                  style={{
                    font: "600 20px/1.2 var(--ft)",
                    letterSpacing: "-.03em",
                    color: "#fff",
                  }}
                >
                  <span>{gabarit.titre}</span>
                </span>
                <span style={PHRASE}>
                  <span>{gabarit.phrase}</span>
                </span>
                <span
                  style={{ marginTop: 6, font: "600 13px var(--fb)", color: "#fff" }}
                >
                  <span>{gabarit.lien}</span> →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
