"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

/**
 * Bandeau « On … ? », où le verbe tourne.
 *
 * La liste et la position de départ viennent de la logique de la maquette :
 *   VERBS = ["installe", "maintient", "répare", "dépanne"]   et   verbIdx: 0
 * Elle n'était pas dans la fenêtre de balisage, d'où la prop laissée ouverte à
 * l'écriture. Elle est maintenant renseignée, et le défaut n'est plus vide.
 *
 * Le PREMIER verbe est rendu côté serveur : Google et un visiteur sans
 * JavaScript lisent une phrase complète, « On installe ? », jamais « On  ? ».
 * La rotation n'est qu'un supplément, et elle s'arrête si le visiteur a demandé
 * moins d'animations (WCAG 2.3.3).
 */
export const VERBES = ["installe", "maintient", "répare", "dépanne"] as const;

/** Cadence de la maquette : `setInterval(..., 2200)` dans son montage. */
const CADENCE_MS = 2200;

/**
 * Le verbe à afficher maintenant.
 *
 * Rend TOUJOURS le premier au premier passage, serveur comme client : un
 * `useState` initialisé au hasard produirait un HTML serveur différent du
 * premier rendu client, et React signalerait une incohérence d'hydratation.
 */
function useVerbeCourant(verbes: readonly string[]): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (verbes.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const minuterie = window.setInterval(
      () => setIndex((i) => (i + 1) % verbes.length),
      CADENCE_MS,
    );
    return () => window.clearInterval(minuterie);
  }, [verbes.length]);

  return verbes[index] ?? verbes[0] ?? "";
}

export interface ProprietesBandeauVerbe {
  /** Les verbes affichés en orange, à tour de rôle. */
  verbes?: readonly string[];
}

export default function BandeauVerbe({
  verbes = VERBES,
}: ProprietesBandeauVerbe) {
  const verbe = useVerbeCourant(verbes);

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          style={{
            display: "flex",
            alignItems: "center",
            gap: "44px",
            flexWrap: "wrap",
            padding: "52px 56px",
            borderRadius: "36px",
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
          }}
        >
          {/* Marque décorative : le nom de l'entreprise est déjà dans le texte. */}
          <Image
            src="/assets/logo-migen-mark.png"
            alt=""
            width={500}
            height={500}
            style={{ height: "64px", width: "64px", flex: "none" }}
          />
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div
              style={{
                font: "600 calc(clamp(30px,3.4vw,50px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.04em",
              }}
            >
              // Contraste AA : l'orange de marque donnait 2,45:1 sur ce fond clair, --acc-ink donne 8,57:1.
              On {verbe && <span style={{ color: "var(--acc-ink)" }}>{verbe}</span>}
              {" ?"}
            </div>
            <p
              style={{
                font: "400 16.5px/1.65 var(--fb)",
                color: "var(--ink2)",
                margin: "14px 0 0",
                maxWidth: "62ch",
              }}
            >
              {
                "TPE, PME, ETI : avec nos différents services de prestation, vous bénéficiez d'une expertise toujours adaptée pour résoudre vos problèmes de maintenance industrielle."
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
