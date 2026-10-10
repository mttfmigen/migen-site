"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { LARGEUR, SURTITRE } from "@/components/site/blocs/habillage";

import type { MetierRecrute } from "./donnees-hub";
import styles from "./HubCarriere.module.css";
import { Enveloppe, Paragraphe } from "./SectionsHub";

/**
 * « Les métiers que nous recrutons » : le rail de cartes-photos du hub.
 *
 * LE MOUVEMENT EST CELUI DE LA MAQUETTE (`jobScroll` et l'intervalle de
 * `componentDidMount` dans `MigenCarriere.dc.html`) : toutes les 4,2 s le
 * rail avance d'une carte, revient au début après la dernière, et ne bouge
 * pas tant que le pointeur est dessus. On ajoute deux égards que la maquette
 * n'a pas : le focus clavier arrête aussi le rail, et `prefers-reduced-motion`
 * le laisse immobile. Les flèches restent actives dans tous les cas.
 */

const PERIODE_MS = 4200;
const ECART = 14;
const MARGE_RAIL = "max(40px,calc((100vw - 1120px) / 2))";

function avance(rail: HTMLElement, sens: 1 | -1) {
  const pas = (rail.firstElementChild?.getBoundingClientRect().width ?? 280) + ECART;
  const max = rail.scrollWidth - rail.clientWidth - 4;
  let x = rail.scrollLeft + sens * pas;
  if (x > max + 2) x = 0;
  if (x < -2) x = max;
  rail.scrollTo({ left: x, behavior: "smooth" });
}

export default function MetiersRecrutes({
  surtitre,
  titre,
  intro,
  metiers,
  suite,
}: {
  surtitre: string;
  titre: string;
  intro: string;
  metiers: MetierRecrute[];
  suite?: string[];
}) {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const minuterie = window.setInterval(() => {
      const el = rail.current;
      if (el && !el.matches(":hover, :focus-within")) avance(el, 1);
    }, PERIODE_MS);
    return () => window.clearInterval(minuterie);
  }, []);

  if (!metiers.length) return null;

  const precedent = () => {
    if (rail.current) avance(rail.current, -1);
  };
  const suivant = () => {
    if (rail.current) avance(rail.current, 1);
  };

  return (
    <Enveloppe>
      <div style={LARGEUR}>
        {/* `mg-r2` comme la maquette (et non `ck-2`) : sous 900 px, 36 px
            d'écart entre le texte et les flèches, pas 30. */}
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: "20px 40px",
            alignItems: "end",
            marginBottom: 28,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div style={{ ...SURTITRE, marginBottom: 14 }}>{surtitre}</div>
            <h2
              style={{
                font: "600 calc(clamp(28px,3vw,44px) * var(--ts,1))/1.08 var(--ft)",
                letterSpacing: "-.045em",
                margin: "0 0 14px",
              }}
            >
              {titre}
            </h2>
            <Paragraphe
              texte={intro}
              style={{ font: "400 16px/1.65 var(--fb)", color: "var(--ink2)", margin: 0 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={precedent}
              aria-label="Précédent"
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "#fff",
                font: "400 20px var(--fb)",
                cursor: "pointer",
                color: "var(--sur-acc)",
              }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={suivant}
              aria-label="Suivant"
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: "none",
                background: "var(--acc)",
                font: "400 20px var(--fb)",
                cursor: "pointer",
                // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
                // l'encre change : --ink dessus, 6,72:1.
                color: "var(--sur-acc)",
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rail}
        className={styles.rail}
        style={{
          display: "flex",
          gap: ECART,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: `0 ${MARGE_RAIL} 4px`,
          scrollPaddingLeft: MARGE_RAIL,
        }}
      >
        {metiers.map((m) => (
          <div key={m.titre} style={{ flex: "none", scrollSnapAlign: "start" }}>
            <Link
              href={m.href}
              prefetch={false}
              style={{
                position: "relative",
                flex: "none",
                width: 280,
                height: 380,
                display: "block",
                borderRadius: 24,
                overflow: "hidden",
                background: "#1c1b19",
                color: "#fff",
              }}
            >
              <Image
                src={m.photo}
                alt={m.titre}
                fill
                sizes="280px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat,.6)) brightness(.8)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.15) 60%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.16)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  font: "600 11.5px var(--fb)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ff7c3c" }} />
                On recrute
              </span>
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
                <div
                  style={{
                    font: "600 21px/1.2 var(--ft)",
                    letterSpacing: "-.03em",
                    marginBottom: 6,
                  }}
                >
                  {m.titre}
                </div>
                <div
                  style={{
                    font: "400 13.5px/1.5 var(--fb)",
                    color: "rgba(255,255,255,.78)",
                    marginBottom: 12,
                  }}
                >
                  {m.texte}
                </div>
                <span style={{ font: "600 13.5px var(--fb)", color: "#ff7c3c" }}>
                  Voir le métier →
                </span>
              </div>
            </Link>
          </div>
        ))}
        <a
          href="#postuler"
          style={{
            flex: "none",
            width: 280,
            height: 380,
            borderRadius: 24,
            background: "var(--acc)",
            // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
            // l'encre change : --ink dessus, 6,72:1.
            color: "var(--ink)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            scrollSnapAlign: "start",
          }}
        >
          <span
            style={{
              font: "600 11.5px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Candidature spontanée
          </span>
          <span
            style={{
              font: "600 24px/1.15 var(--ft)",
              letterSpacing: "-.035em",
            }}
          >
            Votre métier n’est pas dans la liste&nbsp;?
          </span>
          <span style={{ font: "600 14.5px var(--fb)" }}>Envoyer mon CV →</span>
        </a>
      </div>

      {suite?.length ? (
        <div style={{ maxWidth: 1200, margin: "24px auto 0", padding: "0 40px" }}>
          {suite.map((t) => (
            <Paragraphe
              key={t}
              texte={t}
              style={{
                font: "400 15px/1.65 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "80ch",
              }}
            />
          ))}
        </div>
      ) : null}
    </Enveloppe>
  );
}
