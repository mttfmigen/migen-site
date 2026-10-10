import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";

import styles from "./PageVille.module.css";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * « Maillage · offres » du gabarit 04 Ville : « Les six offres, dans chaque
 * bassin. », six cartes à photo en bento 3 x 2 (`g3-bento5`, blocs 1127 à 1140
 * de `implantations--lyon.html`).
 *
 * COPIE FIXE : la section est IDENTIQUE, texte, liens et photos, sur les 66
 * captures du gabarit (relevé du 07/10). Elle vit donc ici et non dans les
 * fichiers des pages. `offre/MaillageOffres.tsx` ne la rend pas : son titre
 * est « Un autre besoin ? Il a son offre. », il écarte l'offre de la page et
 * pose ses titres à 18px quand la capture des villes les pose à 20px.
 */

const CARTES = [
  {
    href: "/offres/residence/",
    photo: "/assets/web/team-duo.jpg",
    etiquette: "Présence continue",
    titre: "migen© Résidence",
    phrase: "Des techniciens en résidence sur votre site, intégrés à votre équipe, validés par vous.",
  },
  {
    href: "/offres/full-service/",
    photo: "/assets/web/sv-duo-impact.jpg",
    etiquette: "Contrat unique",
    titre: "migen© Full service",
    phrase:
      "Toute votre maintenance dans un seul contrat : préventif, dépannage, pièces et GMAO, un seul interlocuteur.",
  },
  {
    href: "/offres/zero-arret/",
    photo: "/assets/web/ph-technicien.jpg",
    etiquette: "Abonnement",
    titre: "migen© Zéro arrêt",
    phrase:
      "Le préventif le samedi, le dépannage la nuit : une maintenance qui ne touche jamais à votre production.",
  },
  {
    href: "/offres/arret-technique/",
    photo: "/assets/web/team-grind-front.jpg",
    etiquette: "Arrêt planifié",
    titre: "migen© Arrêt technique",
    phrase: "Votre arrêt annuel préparé, dimensionné et tenu, ligne rendue à la date annoncée.",
  },
  {
    href: "/offres/bureau-etudes/",
    photo: "/assets/web/ph-robots-solaire.jpg",
    etiquette: "Études",
    titre: "migen© Bureau d’études",
    phrase:
      "Conception, schémas électriques, mise en conformité machine : des études faites par des gens de terrain.",
  },
  {
    href: "/travaux-industriels/",
    photo: "/assets/web/ph-hero-raffinerie.jpg",
    etiquette: "Chantier",
    titre: "migen© Travaux industriels",
    phrase: "Transfert, montage, démantèlement, levage : le chantier, du relevé à la remise en production.",
  },
] as const;

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 26px",
  maxWidth: "24ch",
  textWrap: "balance",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gridTemplateRows: "repeat(2,minmax(210px,auto))",
  gap: 12,
};

const CARTE: CSSProperties = {
  position: "relative",
  display: "block",
  overflow: "hidden",
  borderRadius: 24,
  color: "#fff",
  minHeight: 210,
  background: "rgb(58,58,60)",
  transition: "transform var(--tr)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.35) 60%,rgba(18,17,16,.1))",
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

const NOM: CSSProperties = {
  font: "600 20px/1.2 var(--ft)",
  letterSpacing: "-.03em",
  color: "#fff",
};

const PHRASE: CSSProperties = {
  font: "400 13.5px/1.5 var(--fb)",
  color: "rgba(255,255,255,.74)",
  maxWidth: "44ch",
};

export default function MaillageVille() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 14 }}>Nos offres</div>
        <h2 style={TITRE}>Les six offres, dans chaque bassin.</h2>
        <div className="g3-bento5" style={GRILLE}>
          {CARTES.map((carte) => (
            <Link
              key={carte.href}
              href={carte.href}
              prefetch={false}
              className={styles.carteOffre}
              style={CARTE}
            >
              <Image
                src={carte.photo}
                alt={altPhoto(carte.photo)}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"
                style={{ objectFit: "cover", filter: "saturate(var(--sat)) brightness(.72)" }}
              />
              <div aria-hidden="true" style={VOILE} />
              <div style={CONTENU}>
                <span style={ETIQUETTE}>{carte.etiquette}</span>
                <span style={NOM}>{carte.titre}</span>
                <span style={PHRASE}>{carte.phrase}</span>
                <span style={{ marginTop: 6, font: "600 13px var(--fb)", color: "#fff" }}>
                  Voir l’offre →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
