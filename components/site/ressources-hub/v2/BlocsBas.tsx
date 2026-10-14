import type { CSSProperties } from "react";
import Link from "next/link";

import { demandeDiagnostic } from "@/components/formulaire/besoin";
import { FormulaireBesoin } from "@/components/formulaire/FormulaireBesoin";

import { MONO } from "./Cartes";
import { ETAPES_SELECTION } from "./donnees";
import { deux } from "./filtrage";
import s from "./hub.module.css";

/**
 * Le bas de page du hub (`markup-indent.html`, lignes 518 à 742) : bandeau
 * Diagnostic et bloc formulaire côté Entreprises, process de sélection côté
 * Techniciens. Le panneau de droite est le formulaire de la maquette
 * (`FormulaireBesoin`, 14/10), branché sur le même envoi que les autres
 * formulaires du site. Les deux boutons « Demander mon diagnostic »
 * présélectionnent le besoin, comme `askDiag`.
 */

export const PANNEAU_SOMBRE: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 32,
  background: "#1c1b19",
  color: "#fff",
  padding: 44,
  display: "flex",
  flexDirection: "column",
  gap: 28,
  border: "1px solid rgba(255,255,255,.06)",
};
export const HALO_HAUT_GAUCHE: CSSProperties = {
  position: "absolute",
  left: -160,
  top: -200,
  width: 520,
  height: 520,
  borderRadius: 999,
  background: "radial-gradient(circle,rgba(255,124,60,.4),rgba(255,124,60,0) 66%)",
  pointerEvents: "none",
};
export const SURTITRE_ORANGE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#ff7c3c",
  marginBottom: 14,
};
const BOUTON_ORANGE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "14px 22px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px var(--fb)",
  boxShadow: "0 14px 30px -14px rgba(255,124,60,.9)",
};

export function Coche({ texte }: { texte: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", font: "500 14.5px var(--fb)", color: "rgba(255,255,255,.9)" }}>
      <span
        aria-hidden="true"
        style={{
          flex: "none",
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "rgba(255,124,60,.2)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            width: 5,
            height: 9,
            borderRight: "2px solid #ff7c3c",
            borderBottom: "2px solid #ff7c3c",
            transform: "translateY(-1px) rotate(45deg)",
          }}
        />
      </span>
      {texte}
    </div>
  );
}

/** Bandeau sombre « Diagnostic Zéro arrêt ». */
export function BandeauDiagnostic() {
  return (
    <section style={{ position: "relative", padding: "72px 0 0" }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 30,
          background: "#1c1b19",
          color: "#fff",
          padding: "36px 40px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "24px 40px",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -150,
            bottom: -210,
            width: 500,
            height: 500,
            borderRadius: 999,
            background: "radial-gradient(circle,rgba(255,124,60,.5),rgba(255,124,60,0) 66%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 560 }}>
          <div
            style={{
              font: `600 10.5px ${MONO}`,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "#ffb08a",
            }}
          >
            Diagnostic Zéro arrêt
          </div>
          <h2
            style={{
              font: "600 clamp(26px,2.6vw,34px)/1.08 var(--ft)",
              letterSpacing: "-.045em",
              margin: "14px 0 10px",
              maxWidth: "17ch",
              textWrap: "balance",
            }}
          >
            Combien vous coûtent vraiment vos arrêts&nbsp;?
          </h2>
          <p style={{ font: "400 15px/1.6 var(--fb)", color: "rgba(255,255,255,.74)", margin: 0, maxWidth: "46ch" }}>
            On estime vos pertes et on vous dit par où commencer. Un chargé d’affaires vous rappelle avec les résultats.
          </p>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <a href="#rs-form" onClick={demandeDiagnostic} className={s.dim} style={BOUTON_ORANGE}>
            Demander mon diagnostic →
          </a>
        </div>
      </div>
    </section>
  );
}

/** Bloc « Passer à l’action » : panneau sombre + formulaire de contact du site. */
export function BlocFormulaire() {
  return (
    <section id="rs-form" style={{ position: "relative", padding: "120px 0 0", scrollMarginTop: 96 }}>
      <div
        className={s.deuxCol}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        <div style={PANNEAU_SOMBRE}>
          <div aria-hidden="true" style={HALO_HAUT_GAUCHE} />
          <div style={{ position: "relative" }}>
            <div style={SURTITRE_ORANGE}>Passer à l’action</div>
            <h2
              style={{
                font: "600 clamp(28px,3vw,42px)/1.06 var(--ft)",
                letterSpacing: "-.05em",
                margin: "0 0 16px",
                textWrap: "balance",
              }}
            >
              Un chargé d’affaires vous rappelle dans l’heure.
            </h2>
            <p style={{ font: "400 15.5px/1.65 var(--fb)", color: "rgba(255,255,255,.74)", margin: 0, maxWidth: "44ch" }}>
              Aux horaires ouvrés, du lundi au vendredi. Vous repartez avec un interlocuteur, un devis écrit et une date.
            </p>
          </div>
          <div style={{ position: "relative", display: "grid", gap: 12 }}>
            <Coche texte="Le devis avant tout déplacement" />
            <Coche texte="Des techniciens que vous validez avant leur arrivée" />
            <Coche texte="Un seul interlocuteur, du devis au compte rendu" />
          </div>
          <div
            style={{
              position: "relative",
              marginTop: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <div>
              <div style={{ font: "600 36px/1 var(--ft)", letterSpacing: "-.05em" }}>+200</div>
              <div style={{ font: "400 13px/1.4 var(--fb)", color: "rgba(255,255,255,.6)", marginTop: 6 }}>
                clients industriels
              </div>
            </div>
            <div>
              <div style={{ font: "600 36px/1 var(--ft)", letterSpacing: "-.05em" }}>10&nbsp;%</div>
              <div style={{ font: "400 13px/1.4 var(--fb)", color: "rgba(255,255,255,.6)", marginTop: 6 }}>
                des techniciens réussissent notre process
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            borderRadius: 32,
            background: "var(--glass)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid var(--gbd)",
            boxShadow: "var(--shadow)",
            padding: 40,
            minWidth: 0,
          }}
        >
          <FormulaireBesoin formulaire="ressources-hub" />
        </div>
      </div>
    </section>
  );
}

/** Process de sélection en six étapes, accordéon (espace Techniciens). */
export function ProcessSelection({ etape, onEtape }: { etape: number; onEtape: (i: number) => void }) {
  return (
    <section id="rs-process" style={{ position: "relative", padding: "112px 0 0", scrollMarginTop: 96 }}>
      <div
        className={s.deuxCol}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.15fr)",
          gap: 56,
          alignItems: "start",
        }}
      >
        <div className={s.collant} style={{ position: "sticky", top: 110 }}>
          <div style={SURTITRE_ORANGE}>Notre process de sélection</div>
          <h2
            style={{
              font: "600 clamp(30px,3.2vw,46px)/1.04 var(--ft)",
              letterSpacing: "-.05em",
              margin: "0 0 18px",
              textWrap: "balance",
            }}
          >
            Seuls 10&nbsp;% des techniciens réussissent notre process.
          </h2>
          <p style={{ font: "400 16px/1.65 var(--fb)", color: "var(--ink1)", margin: "0 0 26px", maxWidth: "46ch" }}>
            Six étapes, les mêmes pour tous, menées par des gens du métier. Ceux qui passent rejoignent une équipe où
            chacun a fait le même chemin.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#postuler" className={s.dim} style={BOUTON_ORANGE}>
              Postuler →
            </a>
            <Link
              href="/test-technicien/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 22px",
                borderRadius: 999,
                background: "var(--card)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                font: "600 14.5px var(--fb)",
              }}
            >
              Passer le test
            </Link>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {ETAPES_SELECTION.map((x, i) => {
            const on = etape === i;
            const fg = on ? "#fff" : "var(--ink)";
            return (
              <button
                key={x.titre}
                type="button"
                aria-expanded={on}
                onClick={() => onEtape(on ? -1 : i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "46px minmax(0,1fr) 24px",
                  gap: 16,
                  alignItems: "start",
                  width: "100%",
                  textAlign: "left",
                  padding: "18px 22px 18px 18px",
                  borderRadius: 24,
                  border: `1px solid ${on ? "#1c1b19" : "var(--line)"}`,
                  backgroundColor: on ? "#1c1b19" : "var(--card)",
                  cursor: "pointer",
                  transition: "background-color .3s ease,border-color .3s ease",
                }}
              >
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    font: "600 13px var(--fb)",
                    transition: "background-color .3s",
                    backgroundColor: on ? "#ff7c3c" : "var(--chip)",
                    color: on ? "#fff" : "var(--ink)",
                  }}
                >
                  {deux(i + 1)}
                </span>
                <span style={{ paddingTop: 11 }}>
                  <span style={{ display: "block", font: "600 17px/1.25 var(--ft)", letterSpacing: "-.025em", color: fg }}>
                    {x.titre}
                  </span>
                  {on ? (
                    <span
                      className={s.fade}
                      style={{
                        display: "block",
                        marginTop: 8,
                        font: "400 14.5px/1.6 var(--fb)",
                        color: "rgba(255,255,255,.78)",
                      }}
                    >
                      {x.texte}
                    </span>
                  ) : null}
                </span>
                <span aria-hidden="true" style={{ paddingTop: 10, font: "400 22px/1 var(--fb)", textAlign: "right", color: fg }}>
                  {on ? "–" : "+"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
