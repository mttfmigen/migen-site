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

export default function CarteBibliotheque({
  carte,
  vue,
}: {
  carte: Carte;
  vue: "grid" | "list";
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
        <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
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

  return (
    <Link
      href={carte.url}
      prefetch={false}
      className={styles.carte}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 24,
        overflow: "hidden",
        background: "var(--card)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)",
      }}
    >
      <span
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          aspectRatio: "16/10",
          overflow: "hidden",
          background: "var(--ph)",
        }}
      >
        {carte.image ? (
          <Image
            src={carte.image}
            alt={altPhoto(carte.image)}
            fill
            sizes="(max-width: 760px) 100vw, 300px"
            style={{ objectFit: "cover", objectPosition: cadragePhoto(carte.image, 1.6) }}
          />
        ) : null}
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            font: "600 11px var(--fb)",
            color: "#1c1b19",
          }}
        >
          {carte.format}
        </span>
      </span>
      <span
        style={{
          padding: "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <span style={META}>{meta}</span>
        <span
          style={{
            font: "600 17px/1.25 var(--ft)",
            letterSpacing: "-.025em",
            color: "var(--ink)",
            textWrap: "pretty",
          }}
        >
          {carte.titre}
        </span>
        <span
          className={styles.extrait}
          style={{ font: "400 13.5px/1.55 var(--fb)", color: "var(--ink2)" }}
        >
          {carte.extrait}
        </span>
        {carte.etiquettes.length > 0 ? (
          <span
            style={{
              marginTop: "auto",
              paddingTop: 8,
              font: "500 11.5px ui-monospace,Menlo,monospace",
              color: "var(--acc)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {etiquettesCourtes(carte)}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
