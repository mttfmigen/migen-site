import Link from "next/link";
import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";

import styles from "./PageEditoriale.module.css";

/**
 * Les appels et la FAQ du gabarit générique édito (`cEdito`) : l'encadré
 * « Décrire mon besoin », la question dépliable, la carte-lien et le panneau
 * sombre. Séparés de `BlocsGuide.tsx` pour que chaque fichier reste court ;
 * mêmes règles : styles de la capture, survols dans le module CSS.
 */

export const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  padding: "12px 22px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
};

export function Appel({ texte }: { texte: string }) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 22,
          flexWrap: "wrap",
          margin: "10px 0 24px",
          padding: "24px 28px",
          borderRadius: "var(--rad)",
          ...VERRE,
        }}
      >
        <p
          className={styles.riche}
          style={{
            font: "400 15px/1.65 var(--fb)",
            color: "var(--ink1)",
            margin: 0,
            flex: 1,
            minWidth: 240,
            maxWidth: "62ch",
          }}
        >
          <TexteRiche texte={texte} />
        </p>
        <div style={{ display: "flex", gap: 10, flex: "none", flexWrap: "wrap" }}>
          <a href="#cx-form" className={styles.boutonPlein} style={BOUTON}>
            Décrire mon besoin
          </a>
        </div>
      </div>
    );
}

export function Question({ question, groupe, ouverte }: { question: string; groupe: string; ouverte: boolean }) {
    return (
      <details
        open={ouverte}
        name={groupe}
        className="cx-faq mg-faqd"
        style={{ margin: "0 0 10px", ...VERRE, borderRadius: "var(--rad-s)" }}
      >
        <summary
          style={{
            listStyle: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            padding: "20px 24px",
          }}
        >
          <span
            style={{
              font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
              letterSpacing: "-.022em",
              color: "var(--ink)",
            }}
          >
            {question}
          </span>
          <span
            aria-hidden="true"
            className="cx-plus mg-faqi"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 999,
              flex: "none",
              font: "400 20px/1 var(--fb)",
              transition: "transform var(--tr),background var(--tr)",
              background: "var(--chip)",
              color: "var(--ink2)",
            }}
          >
            +
          </span>
        </summary>
        {/* La capture rend la réponse en paragraphe APRÈS la question : le
            dépliant ne garde que sa marge basse. Écart déclaré, voir la
            donnée. */}
        <p
          aria-hidden="true"
          style={{
            font: "400 15px/1.7 var(--fb)",
            color: "var(--ink2)",
            margin: 0,
            padding: "0 24px 22px",
            maxWidth: "68ch",
          }}
        />
      </details>
    );
}

export function LienCarte({ titre, href }: { titre: string; href: string }) {
    return (
      <Link
        href={href}
        prefetch={false}
        className={styles.lienCarte}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          margin: "8px 0 22px",
          padding: "20px 24px",
          borderRadius: "var(--rad-s)",
          ...VERRE,
          transition: "transform var(--tr)",
        }}
      >
        <span
          style={{
            font: "600 calc(16px * var(--ts))/1.4 var(--ft)",
            letterSpacing: "-.022em",
            color: "var(--ink)",
          }}
        >
          {titre}
        </span>
        <span
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 999,
            background: "var(--acc)",
            color: "#fff",
            font: "600 15px var(--fb)",
            flex: "none",
          }}
        >
          →
        </span>
      </Link>
    );
}

export function Panneau() {
    return (
      <div
        style={{
          margin: "36px 0",
          borderRadius: "var(--rad)",
          background: "var(--panel)",
          padding: "28px 30px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            right: -170,
            top: -190,
            background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 240,
            font: "600 calc(18px * var(--ts))/1.35 var(--ft)",
            letterSpacing: "-.028em",
            color: "#fff",
            maxWidth: "32ch",
          }}
        >
          Vous préférez qu’on s’en occupe&nbsp;? Rappel dans l’heure.
        </div>
        <a
          href="#cx-form"
          className={styles.boutonLeve}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "15px 26px",
            borderRadius: 999,
            background: "var(--acc)",
            color: "#fff",
            font: "600 15px var(--fb)",
            whiteSpace: "nowrap",
            boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
            transition: "filter var(--tr),transform var(--tr)",
            flex: "none",
          }}
        >
          Décrire mon besoin
        </a>
      </div>
    );
}
