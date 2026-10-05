import Link from "next/link";
import type { CSSProperties } from "react";

import TexteRiche, { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  VERRE,
} from "@/components/site/blocs/habillage";
import type { BoutonMetier, CtaMetier, PhotoMetier } from "@/types/metier";

import styles from "./PageMetier.module.css";

/**
 * Les pièces communes aux gabarits métier et domaine, portées de
 * « Migen - Site final.dc.html », lignes 5452 à 5600.
 *
 * EXTRAITES DE `PageMetier.tsx` pour tenir le plafond de 400 lignes par fichier
 * du contrat de portage. La découpe suit ce que la maquette répète : une liste
 * cochée, un visuel en cadre, les boutons, et la carte
 * de verre qui ferme la page. Tous sont des composants SERVEUR.
 */

/**
 * Cible retenue pour un bouton, ou `null` si elle est refusée.
 *
 * MÊME RÈGLE QUE `TexteRiche` ET QUE `proxy.ts` : seuls un chemin interne et une
 * ancre sont rendus. `pages.contenu` est un `jsonb`, dont Postgres ne garantit
 * que la syntaxe ; un `javascript:` ou un `//autre-site` y porterait l'autorité
 * du domaine. Un bouton dont la cible est refusée n'est pas rendu du tout :
 * mieux vaut un bouton en moins qu'un bouton qui mène ailleurs que ce qu'il
 * annonce.
 */
export function cible(href: string | undefined): string | null {
  if (href === undefined) return ANCRE_FORMULAIRE;
  if (href.startsWith("#")) return href;
  return estCheminInterne(href) ? href : null;
}

/** Les boutons du héros : le premier en orange, les suivants en verre. */
export function Boutons({ boutons }: { boutons: BoutonMetier[] }) {
  const retenus = boutons
    .map((b) => ({ libelle: b.libelle, href: cible(b.href) }))
    .filter((b): b is { libelle: string; href: string } => b.href !== null);

  if (retenus.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
      {retenus.map((b, i) => (
        <Link
          key={`${i}-${b.href}`}
          href={b.href}
          prefetch={false}
          className={i === 0 ? styles.boutonAction : styles.boutonSecondaire}
          style={i === 0 ? BOUTON_ACTION : BOUTON_SECONDAIRE}
        >
          {b.libelle}
        </Link>
      ))}
    </div>
  );
}

/** Une liste cochée. Le ✓ est décoratif, la liste porte déjà le sens. */
export function Puces({
  items,
  id,
  police,
  gap,
}: {
  items: string[];
  id: string;
  /** Recopiée de la maquette : 15.5px/1.55 pour les missions, 14.5px/1.5 ailleurs. */
  police: string;
  gap: number;
}) {
  return (
    <ul
      aria-labelledby={id}
      style={{
        display: "grid",
        gap,
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {items.map((item, i) => (
        <li
          key={`${i}-${item.slice(0, 24)}`}
          className={styles.corpus}
          style={{
            display: "flex",
            gap: 11,
            font: `400 ${police} var(--fb)`,
            color: "var(--ink1)",
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
            ✓
          </span>
          <TexteRiche texte={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Le visuel. `img` et non `next/image` : les fichiers de la maquette ne sont pas
 * encore rapatriés, leurs dimensions intrinsèques sont inconnues, et c'est déjà
 * le choix de `components/site/accueil/FocusResidence.tsx`.
 */
export function Visuel({ photo, cadre }: { photo: PhotoMetier; cadre: CSSProperties }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--rad)",
        overflow: "hidden",
        background: "var(--ph)",
        ...cadre,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt ?? ""}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "saturate(var(--sat)) contrast(1.05)",
          opacity: "var(--ph-op)",
        }}
      />
    </div>
  );
}

/** La carte de verre qui ferme la page. Deux rembourrages selon le gabarit. */
export function CarteAction({
  contenu,
  rembourrage,
}: {
  contenu: CtaMetier;
  rembourrage: number;
}) {
  const href = cible(contenu.bouton.href);
  const grand = rembourrage === 56;

  return (
    <div
      style={{
        ...VERRE,
        borderRadius: 36,
        boxShadow:
          "0 1px 1px rgba(0,0,0,.04),0 30px 70px -40px rgba(0,0,0,.4)",
        padding: rembourrage,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: grand ? 48 : 44,
        flexWrap: "wrap",
      }}
    >
      <div className={styles.corpus}>
        <h2
          style={{
            font: `600 calc(clamp(${grand ? "26px,2.6vw,38px" : "24px,2.5vw,36px"}) * var(--ts))/1.1 var(--ft)`,
            letterSpacing: "-.04em",
            margin: "0 0 12px",
            maxWidth: "26ch",
            textWrap: "balance",
          }}
        >
          <TexteRiche texte={contenu.question} />
        </h2>
        {contenu.rappel ? (
          <p
            style={{
              font: "400 16.5px/1.6 var(--fb)",
              color: "var(--ink2)",
              margin: 0,
              maxWidth: grand ? "50ch" : "52ch",
            }}
          >
            <TexteRiche texte={contenu.rappel} />
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          prefetch={false}
          className={styles.boutonAction}
          style={{
            ...BOUTON_ACTION,
            padding: grand ? "16px 30px" : "16px 28px",
            font: "600 15.5px var(--fb)",
            flex: "none",
          }}
        >
          {contenu.bouton.libelle}
        </Link>
      ) : null}
    </div>
  );
}

