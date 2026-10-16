import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { TELEPHONE_LP } from "@/components/site/entete-donnees";
import type { MetaLP, Paire } from "@/lib/lp/pages";

import styles from "./PageLP.module.css";

/**
 * Les briques répétées du gabarit `MigenLP` (maquette V3) : sur-titre, titre
 * de section, photo, flottants, certifications, boutons. Les valeurs sont
 * celles de la maquette, recopiées en style en ligne comme elle les écrit.
 */

export const TEL = TELEPHONE_LP;

/** Ce que chaque section reçoit de la page, en plus de ses données. */
export interface Contexte {
  /** Fond de la section, et celui des cartes qu'elle porte (l'inverse). */
  fond: string;
  carte: string;
  /** Une section « split » sur deux met la photo à gauche. */
  aGauche: boolean;
  /** La première section « sécurité » porte le bandeau de la sélection. */
  avecSelection: boolean;
  meta: MetaLP;
  chemin: string;
  titreFormulaire?: string;
}

/** La largeur et la gouttière de la maquette (`max-width:1200px;padding:0 40px`). */
export const CADRE: CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "0 40px" };

/** Le rythme d'une section, `padding:96px 0`, ramené à 56 px au téléphone. */
export const sectionStyle = (fond: string): CSSProperties => ({ padding: "96px 0", background: fond });

export const BOUTON_ORANGE: CSSProperties = {
  display: "inline-flex",
  padding: "13px 20px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px var(--fb)",
};

export const BOUTON_NOIR: CSSProperties = { ...BOUTON_ORANGE, background: "#1c1b19" };

export function SurTitre({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: "0 0 14px",
        font: "600 11.5px var(--fb)",
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: "#b4490f",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function Titre2({ children, taille = 38, style }: { children: ReactNode; taille?: number; style?: CSSProperties }) {
  return (
    <h2
      className={styles.h2}
      style={{
        margin: 0,
        font: `700 ${taille}px/1.1 var(--ft)`,
        letterSpacing: "-.035em",
        color: "#1c1b19",
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function Chapo({ children, marge = 16, style }: { children: ReactNode; marge?: number; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: `${marge}px 0 0`,
        font: "400 17px/1.65 var(--fb)",
        color: "#4a4845",
        textWrap: "pretty",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/**
 * Une photo en fond de bloc : `background:#8a857e center/cover` dans la
 * maquette, `next/image` ici (formats modernes, tailles servies selon
 * l'écran, chargement différé). Le gris reste dessous pendant le chargement.
 */
export function Photo({
  src,
  tailles,
  className,
  style,
  children,
}: {
  src?: string;
  tailles: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", background: "#8a857e", ...style }}>
      {src ? <Image src={src} alt="" fill sizes={tailles} style={{ objectFit: "cover" }} /> : null}
      {children}
    </div>
  );
}

/** Les pastilles de verre posées sur une photo (`floats`). */
export function Flottants({ flottants, style }: { flottants: readonly Paire[]; style: CSSProperties }) {
  if (!flottants.length) return null;
  return (
    <div style={{ position: "absolute", display: "flex", flexWrap: "wrap", gap: 8, ...style }}>
      {flottants.map((flottant) => (
        <div
          key={flottant.l}
          style={{
            padding: "12px 16px",
            borderRadius: 16,
            background: "rgba(255,255,255,.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div style={{ font: "700 20px/1 var(--ft)", letterSpacing: "-.03em", color: "#1c1b19" }}>{flottant.v}</div>
          <div style={{ marginTop: 4, font: "500 12px/1.35 var(--fb)", color: "#4a4845" }}>{flottant.l}</div>
        </div>
      ))}
    </div>
  );
}

/** « Nos certifications » : MASE et EcoVadis, logos déjà servis par le site. */
export function Certifications({ certs }: { certs: MetaLP["certs"] }) {
  if (!certs.length) return null;
  return (
    <>
      <p
        style={{
          margin: "28px 0 0",
          font: "600 10.5px var(--fb)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "#77736d",
        }}
      >
        Nos certifications
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
        {certs.map((cert) => (
          <span
            key={cert.n}
            style={{
              width: 176,
              height: 88,
              boxSizing: "border-box",
              padding: "10px 16px",
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #ecebe8",
              boxShadow: "0 12px 28px -22px rgba(0,0,0,.4)",
            }}
          >
            <span style={{ position: "relative", display: "block", width: "100%", height: "100%" }}>
              <Image src={cert.src} alt={cert.n} fill sizes="144px" style={{ objectFit: "contain" }} />
            </span>
          </span>
        ))}
      </div>
    </>
  );
}

/** La coche orange des listes de la maquette. */
export function Coche() {
  return (
    <span aria-hidden="true" style={{ color: "#ff7c3c", fontWeight: 700 }}>
      ✓
    </span>
  );
}

/** « 01 », « 02 »… : la numérotation des cartes de la maquette. */
export const numero = (index: number) => String(index + 1).padStart(2, "0");
