import Image from "next/image";
import Link from "next/link";

import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

import styles from "./Bibliotheque.module.css";

import type { CarteBibliotheque as Carte } from "./catalogue";

/**
 * UNE CARTE DE LA BIBLIOTHÈQUE, en grille ou en liste.
 *
 * C'EST UN LIEN, ET RIEN D'AUTRE. La maquette écrit elle aussi
 * `<a href="{{ a.url }}">` sur chaque carte, et y attache en plus un geste
 * JavaScript qui ouvre son panneau de lecture au lieu de suivre le lien. Ce
 * geste n'est PAS porté : nos 48 pages existent vraiment, à ces URL exactes,
 * et le LISEZMOI du colis le demande lui-même (« en production, chaque article
 * doit aussi exister comme vraie page à l'URL /ressources/articles/… pour le
 * référencement »). Garder le lien nu rend donc la maquette plus fidèle à son
 * intention, pas moins : aucune page n'est remplacée par un panneau.
 *
 * Composant SERVEUR, volontairement : les cartes ne portent aucun état. Seul
 * le cadre qui les filtre est client, et c'est lui seul qui part en JavaScript.
 */

const META: React.CSSProperties = {
  font: "500 11px ui-monospace,Menlo,monospace",
  letterSpacing: ".03em",
  color: "var(--ink3)",
};

/** Les trois premières étiquettes, préfixées, comme `tg` de la maquette. */
function etiquettesCourtes(carte: Carte): string {
  return carte.etiquettes
    .slice(0, 3)
    .map((e) => `#${e}`)
    .join("   ");
}

/**
 * LA PLACE D'UNE CARTE DE GRILLE AU TÉLÉPHONE, maquette mobile v2 (bloc
 * `isResTop` de `Migen - Mobile v2.dc.html`) : la première ressource « À la
 * une » en grand (`res.feat`), les deux suivantes en demi-largeur
 * (`res.feat2`), puis une rangée par ressource, vignette de 84 px
 * (`res.items`). La maquette ne pose « À la une » que filtres au repos ;
 * c'est `BibliothequeRessources` qui le décide. Au-dessus de 880 px la place
 * n'a AUCUN effet : la grille de bureau est celle d'avant, au pixel.
 */
export type PlaceCarte = "une" | "duo" | "rang";

export default function CarteBibliotheque({
  carte,
  vue,
  place = "rang",
}: {
  carte: Carte;
  vue: "grid" | "list";
  place?: PlaceCarte;
}) {
  const meta = `${carte.minutes} min de lecture`;

  if (vue === "list") {
    return (
      <Link
        href={carte.url}
        prefetch={false}
        className={`${styles.carte} ${styles.carteListe}`}
        style={{
          display: "grid",
          gridTemplateColumns: "120px minmax(0,1fr) auto",
          gap: 18,
          alignItems: "center",
          padding: "10px 16px 10px 10px",
          borderRadius: 20,
          background: "var(--card)",
          border: "1px solid var(--line)",
        }}
      >
        <span
          style={{
            position: "relative",
            display: "block",
            aspectRatio: "16/10",
            borderRadius: 14,
            overflow: "hidden",
            background: "var(--ph)",
          }}
        >
          {carte.image ? (
            <Image
              src={carte.image}
              alt={altPhoto(carte.image)}
              fill
              sizes="120px"
              style={{ objectFit: "cover", objectPosition: cadragePhoto(carte.image, 1.6) }}
            />
          ) : null}
        </span>
        <span style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 4, minWidth: 0 }}>
          <span style={META}>
            {carte.format} · {meta}
          </span>
          <span
            style={{
              font: "600 15.5px/1.3 var(--ft)",
              letterSpacing: "-.022em",
              color: "var(--ink)",
            }}
          >
            {carte.titre}
          </span>
          <span
            className={styles.extrait}
            style={{ font: "400 13px/1.5 var(--fb)", color: "var(--ink2)" }}
          >
            {carte.extrait}
          </span>
        </span>
        <span aria-hidden="true" style={{ font: "600 13px var(--fb)", color: "var(--acc)" }}>
          →
        </span>
      </Link>
    );
  }

  /*
    LE DESSIN DE LA CARTE DE GRILLE VIT DANS LE MODULE CSS, et non plus en
    ligne : le téléphone la redessine en rangée (place « rang »), en carte « À
    la une » ou en demi-carte, et un style en ligne ne se surcharge pas dans un
    `@media`. Les valeurs de bureau sont recopiées telles quelles
    (`.carteGrille`, `.vignette`, `.badge`…).

    LE BADGE DE FORMAT A CHANGÉ DE PARENT, PAS DE PLACE. Il était dans la
    vignette ; il est maintenant en tête de la ligne de méta, positionné en
    absolu sur la carte aux mêmes 12 px du coin. Au téléphone il redevient du
    texte, et la ligne lit « Article · 10 min de lecture » comme la maquette,
    sans écrire le format deux fois. L'ordre du texte ne bouge pas : le
    format venait déjà avant les minutes.
  */
  return (
    <Link
      href={carte.url}
      prefetch={false}
      className={`${styles.carte} ${styles.carteGrille}`}
      data-place={place}
    >
      <span className={styles.vignette}>
        {carte.image ? (
          <Image
            src={carte.image}
            alt={altPhoto(carte.image)}
            fill
            /* `sizes` INCHANGÉ, et c'est voulu. `next/image` en tire la
               liste `srcset` : sans « 100vw », elle descend à 384 px et le
               bureau charge une autre image dans sa case de 300 px (mesuré
               au pixel le 14/10). Une vignette de 84 px mériterait moins
               lourd ; pas au prix du bureau. */
            sizes="(max-width: 760px) 100vw, 300px"
            style={{ objectFit: "cover", objectPosition: cadragePhoto(carte.image, 1.6) }}
          />
        ) : null}
      </span>
      <span className={styles.texteCarte}>
        <span className={styles.ligneMeta}>
          <span className={styles.badge}>{carte.format}</span>
          {meta}
        </span>
        <span className={styles.titreCarte}>{carte.titre}</span>
        <span className={`${styles.extrait} ${styles.extraitGrille}`}>{carte.extrait}</span>
        {carte.etiquettes.length > 0 ? (
          <span className={styles.etiquettesCarte}>{etiquettesCourtes(carte)}</span>
        ) : null}
      </span>
    </Link>
  );
}
