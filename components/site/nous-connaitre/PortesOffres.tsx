import type { CSSProperties } from "react";

import styles from "./PortesOffres.module.css";

/**
 * Les six offres, en sortie de « Nous connaître ».
 *
 * POURQUOI CE BLOC EXISTE. Retour de Nathan Jorez le 13/10 : « cette page est
 * ultra spé résidence comme si c'était la seule offre ». Mesure : le `<main>`
 * de cet écran ne portait AUCUN lien vers une page d'offre, contre 14 sur
 * l'accueil. Ses neuf sorties menaient à l'équipe, aux valeurs, aux secteurs,
 * aux implantations, au contact, à la RSE et à la confidentialité. Le visiteur
 * qui lit l'entreprise ne pouvait donc rien faire de ce qu'il venait
 * d'apprendre, sauf par le pied de page.
 *
 * CE BLOC N'EST PAS DANS LA MAQUETTE : elle ne pose pas de lien d'offre sur cet
 * écran. C'est un ajout assumé, demandé par le client, et il est déclaré comme
 * tel dans `verification-nous-connaitre.tsx` (le compte de conteneurs y gagne
 * une unité, commentée).
 *
 * LE TEXTE N'EST PAS NOUVEAU, à une exception près. Les six adresses et les six
 * libellés sont ceux du pied de page du site (`components/site/PiedDePage.tsx`,
 * colonne « Offres »), au caractère près. Les six phrases sont celles des
 * cartes d'offre déjà en ligne (`components/site/offre/MaillageOffres.tsx`,
 * dictionnaire du gabarit, relevé sur la maquette qui tourne), au caractère
 * près. Le libellé d'action « Voir l'offre → » vient du même endroit. Seul
 * l'intitulé du bloc est nouveau, et il est provisoire, en attente d'arbitrage.
 *
 * LE DESSIN EST CELUI DE L'ACCUEIL, cartes 04 à 06 de
 * `components/site/accueil/GrilleOffres.tsx` : carte en verre, numéro orange en
 * capitales, titre, phrase, action. Les valeurs sont recopiées de ce composant,
 * aucun motif neuf n'est dessiné. Deux écarts, tous deux pour cet emplacement :
 * la carte entière est cliquable (comme les deux portes voisines de
 * `PortesValeursRse`, la cible tactile y gagne), et les six cartes partagent le
 * même gabarit sobre, puisqu'aucune n'a à peser plus qu'une autre ici.
 *
 * POURQUOI `<a>` ET NON `next/link`, contrairement à `PortesValeursRse` : même
 * raison que la grille de l'accueil, qui pointe vers ces six mêmes pages en
 * `<a>`. L'adresse part alors telle qu'elle est écrite, avec son slash final,
 * donc sans redirection 308, et la porte peut vérifier la forme canonique de
 * bout en bout, du pied de page au HTML rendu. `next/link` rendu hors de
 * `next.config.ts` retire ce slash, ce qui rendait l'assertion aveugle.
 */

/** Carte en verre de l'accueil (`VERRE` de `GrilleOffres`), valeurs recopiées. */
const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 24px 56px -32px rgba(0,0,0,.34)",
};

const CARTE: CSSProperties = {
  ...VERRE,
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--rad)",
  padding: 28,
  transition: "transform var(--tr)",
};

/** `NUMERO` de `GrilleOffres`. */
const NUMERO: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 10,
};

/** Titre des cartes sobres de l'accueil : 19px, `-.03em`. */
const TITRE_CARTE: CSSProperties = {
  font: "600 19px var(--ft)",
  letterSpacing: "-.03em",
  color: "var(--ink)",
};

/* La phrase des cartes sobres de l'accueil, valeurs recopiées. Elle est écrite
   en clair dans leur JSX et NON dans la constante `TEXTE_CARTE` du même
   fichier, qui vaut 14.5px et sert aux cartes 01 à 03 : aligner ce bloc sur
   `TEXTE_CARTE` changerait le dessin en croyant le ranger. */
const PHRASE: CSSProperties = {
  font: "400 13.5px/1.55 var(--fb)",
  color: "var(--ink2)",
  margin: "8px 0 18px",
};

/* Le pied des deux portes voisines : la couleur est peinte en ligne, sinon la
   règle globale `a:hover { color: var(--acc) }` la reprendrait. */
const ACTION: CSSProperties = {
  marginTop: "auto",
  font: "600 13.5px var(--fb)",
  color: "var(--acc-ink)",
};

interface Offre {
  readonly numero: string;
  readonly titre: string;
  readonly phrase: string;
  readonly href: string;
}

/**
 * Les six offres, dans l'ordre et avec la numérotation de l'accueil.
 *
 * `travauxIndustriels` vit HORS de `/offres/`, c'est l'adresse de l'inventaire
 * et du pied de page : elle ne se canonicalise pas ici.
 */
const OFFRES: readonly Offre[] = [
  {
    numero: "01",
    titre: "migen© Résidence",
    phrase:
      "Des techniciens en résidence sur votre site, intégrés à votre équipe, validés par vous.",
    href: "/offres/residence/",
  },
  {
    numero: "02",
    titre: "migen© Full service",
    phrase:
      "Toute votre maintenance dans un seul contrat : préventif, dépannage, pièces et GMAO, un seul interlocuteur.",
    href: "/offres/full-service/",
  },
  {
    numero: "03",
    titre: "migen© Zéro arrêt",
    phrase:
      "Le préventif le samedi, le dépannage la nuit : une maintenance qui ne touche jamais à votre production.",
    href: "/offres/zero-arret/",
  },
  {
    numero: "04",
    titre: "migen© Arrêt technique",
    phrase:
      "Votre arrêt annuel préparé, dimensionné et tenu, ligne rendue à la date annoncée.",
    href: "/offres/arret-technique/",
  },
  {
    numero: "05",
    titre: "migen© Bureau d’études",
    phrase:
      "Conception, schémas électriques, mise en conformité machine : des études faites par des gens de terrain.",
    href: "/offres/bureau-etudes/",
  },
  {
    numero: "06",
    titre: "migen© Travaux industriels",
    phrase:
      "Transfert, montage, démantèlement, levage : le chantier, du relevé à la remise en production.",
    href: "/travaux-industriels/",
  },
];

/**
 * L'INTITULÉ EST PROVISOIRE, EN ATTENTE D'ARBITRAGE.
 *
 * Deux formulations sont sur la table : « Nos six offres », posée ici, et
 * « Un métier, six façons de nous engager ». C'est le seul texte de ce bloc qui
 * ne vienne pas d'une page déjà en ligne, donc le seul à trancher.
 */
const INTITULE = "Nos six offres";

export default function PortesOffres() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      {/* `max-width:1200px` ET `0 40px` dans le MÊME attribut de style : c'est
          le couple que cherche `app/globals.css` pour ramener la gouttière de
          40 à 20 px sous 390 px (`@media (max-width: 389px)`). Les commentaires
          qui parlent de 760 px ailleurs dans le dépôt citent la règle de la
          maquette, que son moteur n'appliquait jamais ; la règle vivante est
          celle-ci. Mesuré le 13/10 sur le rendu en ligne : 20 px de gouttière à
          380 px, 40 px à 390 px, aucun débordement. */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        {/* Échelle de titre de `TerrainsExcellence`, sur le même écran. */}
        <h2
          style={{
            font: "600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
            letterSpacing: "-.04em",
            color: "var(--ink)",
            margin: "0 0 18px",
          }}
        >
          {INTITULE}
        </h2>
        {/* `mg-rmulti` : trois colonnes, deux sous 1000px, une sous 620px. */}
        <div
          className="mg-rmulti"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 16,
          }}
        >
          {OFFRES.map((offre) => (
            <a
              key={offre.href}
              href={offre.href}
              className={styles.carte}
              style={CARTE}
            >
              <div style={NUMERO}>{offre.numero}</div>
              <div style={TITRE_CARTE}>{offre.titre}</div>
              <p style={PHRASE}>{offre.phrase}</p>
              <span style={ACTION}>Voir l’offre →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
