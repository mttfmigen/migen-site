import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ContenuRessource } from "./donnees";
import { deux, etiquettesCarte } from "./filtrage";
import s from "./hub.module.css";

/**
 * Les cartes du hub, balisage et styles de la maquette (`markup-indent.html`,
 * lignes 287 à 516). Chaque carte est un VRAI lien vers sa page : le lecteur
 * latéral de la maquette n'est pas porté.
 */

export const MONO = "ui-monospace,Menlo,monospace";

const PASTILLE_VERRE: CSSProperties = {
  whiteSpace: "nowrap",
  flex: "none",
  padding: "7px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.18)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,.28)",
  color: "#fff",
};
const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg,rgba(18,17,16,.05) 30%,rgba(18,17,16,.9) 100%)",
};
const SURTITRE: CSSProperties = {
  font: `600 10.5px ${MONO}`,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};
const BOUTON_BLANC: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 18px",
  borderRadius: 999,
  background: "#fff",
  color: "#1c1b19",
  font: "600 13.5px var(--fb)",
};

const minutes = (x: ContenuRessource) => `${x.minutes} min de lecture`;

function Photo({ src, sizes, prioritaire }: { src: string; sizes: string; prioritaire?: boolean }) {
  return (
    <Image
      className={s.img}
      src={src}
      alt=""
      fill
      sizes={sizes}
      priority={prioritaire}
      style={{ objectFit: "cover" }}
    />
  );
}

/** Carte de la grille. `large` : la dernière carte seule sur sa ligne, en horizontal. */
export function CarteGrille({
  x,
  large,
  style,
}: {
  x: ContenuRessource;
  large: boolean;
  style: CSSProperties;
}) {
  return (
    <a
      href={x.url}
      className={`${s.card} ${s.lift} ${s.fade}`}
      style={{
        gridColumn: large ? "1 / -1" : "auto",
        flexDirection: large ? "row" : "column",
        borderRadius: 24,
        overflow: "hidden",
        background: "var(--card)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)",
        transition: "transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: "none",
          width: large ? "42%" : "100%",
          minHeight: large ? 220 : 0,
          aspectRatio: large ? "auto" : "16/10",
          overflow: "hidden",
          background: "var(--bg2)",
        }}
      >
        <Photo src={x.photo} sizes="(max-width: 760px) 100vw, 360px" />
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,.9)",
            backdropFilter: "blur(10px)",
            font: "600 11px var(--fb)",
            color: "#1c1b19",
          }}
        >
          {x.format}
        </span>
      </div>
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <span style={{ font: `500 11px ${MONO}`, letterSpacing: ".03em", color: "var(--ink3)" }}>{minutes(x)}</span>
        <h3
          style={{
            font: "600 17px/1.25 var(--ft)",
            letterSpacing: "-.025em",
            margin: 0,
            color: "var(--ink)",
            textWrap: "pretty",
          }}
        >
          {x.titre}
        </h3>
        <p
          style={{
            font: "400 13.5px/1.55 var(--fb)",
            color: "var(--ink2)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {x.resume}
        </p>
        <span
          style={{
            marginTop: "auto",
            paddingTop: 8,
            font: `500 11.5px ${MONO}`,
            color: "#ff7c3c",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {etiquettesCarte(x)}
        </span>
      </div>
    </a>
  );
}

/** Carte de la vue « Liste ». */
export function CarteListe({ x, style }: { x: ContenuRessource; style: CSSProperties }) {
  return (
    <a
      href={x.url}
      className={`${s.card} ${s.ring} ${s.fade}`}
      style={{
        gridTemplateColumns: "120px minmax(0,1fr) 36px",
        gap: 18,
        alignItems: "center",
        padding: "10px 16px 10px 10px",
        borderRadius: 20,
        background: "var(--card)",
        border: "1px solid var(--line)",
        transition: "box-shadow .3s",
        ...style,
      }}
    >
      <span
        style={{
          position: "relative",
          display: "block",
          aspectRatio: "4/3",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg2)",
        }}
      >
        <Photo src={x.photo} sizes="120px" />
      </span>
      <span style={{ display: "grid", gap: 5, minWidth: 0 }}>
        <span style={{ font: `500 11px ${MONO}`, color: "var(--ink3)" }}>
          {x.format} · {minutes(x)}
        </span>
        <span style={{ font: "600 16.5px/1.3 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)" }}>
          {x.titre}
        </span>
        <span
          style={{
            font: "400 13.5px/1.5 var(--fb)",
            color: "var(--ink2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {x.resume}
        </span>
        <span style={{ font: `500 11.5px ${MONO}`, color: "#ff7c3c" }}>{etiquettesCarte(x)}</span>
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: "var(--chip)",
          display: "grid",
          placeItems: "center",
          font: "500 15px var(--fb)",
          color: "var(--ink)",
        }}
      >
        →
      </span>
    </a>
  );
}

/** Petite carte « À la une » : photo à gauche, texte à droite. */
function PetiteUne({ x }: { x: ContenuRessource }) {
  return (
    <a
      href={x.url}
      className={`${s.card} ${s.hcard}`}
      style={{
        gridColumn: "span 5",
        display: "grid",
        gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)",
        minHeight: 224,
        borderRadius: 28,
        overflow: "hidden",
        background: "var(--card)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", minHeight: 180, background: "var(--bg2)" }}>
        <Photo src={x.photo} sizes="(max-width: 640px) 100vw, 190px" />
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ font: `500 11px ${MONO}`, color: "var(--ink3)" }}>{minutes(x)}</span>
        <h3
          style={{
            font: "600 18px/1.22 var(--ft)",
            letterSpacing: "-.03em",
            margin: 0,
            color: "var(--ink)",
            textWrap: "pretty",
          }}
        >
          {x.titre}
        </h3>
        <span style={{ marginTop: "auto", font: `500 11.5px ${MONO}`, color: "#ff7c3c" }}>
          {etiquettesCarte(x)}
        </span>
      </div>
    </a>
  );
}

const GRANDE: CSSProperties = {
  gridColumn: "span 7",
  gridRow: "span 2",
  position: "relative",
  display: "block",
  minHeight: 460,
  borderRadius: 28,
  overflow: "hidden",
  background: "#2a2927",
  boxShadow: "var(--shadow)",
};

const BENTO: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(12,minmax(0,1fr))",
  gap: 12,
};

/** « À la une », espace Entreprises, sans filtre actif. */
export function ALaUne({ une, hidden }: { une: readonly ContenuRessource[]; hidden: boolean }) {
  const [e1, e2, e3] = une;
  return (
    <section id="rs-une" className={s.in} hidden={hidden} style={{ position: "relative", padding: "36px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={SURTITRE}>À la une</span>
      </div>
      <div className={s.bento} style={BENTO}>
        <a href={e1.url} className={`${s.card} ${s.big}`} style={GRANDE}>
          <Photo src={e1.photo} sizes="(max-width: 1000px) 100vw, 620px" prioritaire />
          <div style={VOILE} />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              right: 18,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ ...PASTILLE_VERRE, font: "600 12px var(--fb)" }}>{e1.sujet}</span>
            <span style={{ ...PASTILLE_VERRE, font: `600 11px ${MONO}` }}>{minutes(e1)}</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 30 }}>
            <h3
              style={{
                font: "600 clamp(26px,2.6vw,38px)/1.04 var(--ft)",
                letterSpacing: "-.05em",
                color: "#fff",
                margin: "0 0 12px",
                maxWidth: "17ch",
                textWrap: "balance",
              }}
            >
              {e1.titre}
            </h3>
            <p
              style={{
                font: "400 15px/1.6 var(--fb)",
                color: "rgba(255,255,255,.82)",
                margin: "0 0 18px",
                maxWidth: "52ch",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {e1.resume}
            </p>
            <span style={BOUTON_BLANC}>Lire l’article →</span>
          </div>
        </a>
        <PetiteUne x={e2} />
        <PetiteUne x={e3} />
      </div>
    </section>
  );
}

/** « Pour bien démarrer », espace Techniciens, sans filtre actif. */
export function PourBienDemarrer({
  metier,
  guides,
  hidden,
}: {
  metier: ContenuRessource;
  guides: readonly ContenuRessource[];
  hidden: boolean;
}) {
  return (
    <section id="rs-start" className={s.in} hidden={hidden} style={{ position: "relative", padding: "36px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={SURTITRE}>Pour bien démarrer</span>
      </div>
      <div className={s.bento} style={BENTO}>
        <div className={`${s.card} ${s.big}`} style={GRANDE}>
          <Photo src={metier.photo} sizes="(max-width: 1000px) 100vw, 620px" />
          <div style={VOILE} />
          {/* Toute la carte mène à la fiche ; pour le clavier, c'est « Lire la fiche ». */}
          <a href={metier.url} aria-hidden="true" tabIndex={-1} style={{ position: "absolute", inset: 0 }} />
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: 18,
              left: 18,
              right: 18,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ ...PASTILLE_VERRE, font: "600 12px var(--fb)" }}>Fiche métier</span>
            <span style={{ ...PASTILLE_VERRE, font: `600 11px ${MONO}` }}>{minutes(metier)}</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 30, pointerEvents: "none" }}>
            <h3
              style={{
                font: "600 clamp(28px,2.8vw,40px)/1.02 var(--ft)",
                letterSpacing: "-.05em",
                color: "#fff",
                margin: "0 0 12px",
                maxWidth: "16ch",
                textWrap: "balance",
              }}
            >
              {metier.titre}
            </h3>
            <p
              style={{
                font: "400 15px/1.6 var(--fb)",
                color: "rgba(255,255,255,.82)",
                margin: "0 0 18px",
                maxWidth: "52ch",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {metier.resume}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", pointerEvents: "auto" }}>
              <a href={metier.url} style={{ ...BOUTON_BLANC, color: "#1c1b19" }}>
                Lire la fiche →
              </a>
              {guides.map((g) => (
                <a
                  key={g.url}
                  href={g.url}
                  style={{ ...PASTILLE_VERRE, padding: "10px 15px", font: "600 12.5px var(--fb)" }}
                >
                  {g.sujet}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            gridColumn: "span 5",
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            background: "#1c1b19",
            color: "#fff",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 18,
            minHeight: 224,
            border: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -150,
              top: -180,
              width: 420,
              height: 420,
              borderRadius: 999,
              background: "radial-gradient(circle,rgba(255,124,60,.48),rgba(255,124,60,0) 66%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div style={{ ...SURTITRE, letterSpacing: ".12em", color: "#ffb08a" }}>Test technicien</div>
            <h3
              style={{
                font: "600 clamp(21px,2vw,26px)/1.12 var(--ft)",
                letterSpacing: "-.04em",
                margin: "12px 0 8px",
                maxWidth: "18ch",
                textWrap: "balance",
              }}
            >
              Votre niveau technique, mesuré en quelques questions.
            </h3>
            <p style={{ font: "400 14px/1.55 var(--fb)", color: "rgba(255,255,255,.72)", margin: 0 }}>
              Mécanique, électricité, automatisme&nbsp;: faites le point avant de postuler.
            </p>
          </div>
          <Link
            href="/test-technicien/"
            className={s.dim}
            style={{
              position: "relative",
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 999,
              background: "#ff7c3c",
              color: "#fff",
              font: "600 13.5px var(--fb)",
            }}
          >
            Passer le test →
          </Link>
        </div>
        <div
          style={{
            gridColumn: "span 5",
            borderRadius: 28,
            background: "var(--glass)",
            backdropFilter: "blur(22px) saturate(160%)",
            WebkitBackdropFilter: "blur(22px) saturate(160%)",
            border: "1px solid var(--gbd)",
            boxShadow: "var(--shadow)",
            padding: "26px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 224,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 12px" }}>
            <span
              style={{
                font: "600 clamp(46px,4.4vw,60px)/.9 var(--ft)",
                letterSpacing: "-.06em",
                color: "#ff7c3c",
              }}
            >
              10&nbsp;%
            </span>
            <span style={{ font: "600 15px/1.35 var(--ft)", letterSpacing: "-.02em", color: "var(--ink)" }}>
              des techniciens réussissent notre process de sélection.
            </span>
          </div>
          <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 6 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span key={n} style={{ display: "grid", gap: 7 }}>
                <span style={{ height: 6, borderRadius: 999, background: n === 6 ? "#ff7c3c" : "var(--line)" }} />
                <span style={{ font: `600 10.5px ${MONO}`, color: "var(--ink3)" }}>{deux(n)}</span>
              </span>
            ))}
          </div>
          <a
            href="#rs-process"
            className={s.soft}
            style={{
              marginTop: "auto",
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 17px",
              borderRadius: 999,
              background: "var(--knob)",
              color: "var(--knobfg)",
              font: "600 13px var(--fb)",
            }}
          >
            Voir les six étapes ↓
          </a>
        </div>
      </div>
    </section>
  );
}
