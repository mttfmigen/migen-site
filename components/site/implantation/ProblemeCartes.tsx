import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import { coupePunchline, numerote } from "@/components/site/offre/texte-offre";
import type { SectionProbleme } from "@/types/contenu";

/**
 * « 03 Problème » dans son dessin en RANGÉE de cartes (`pbCards` de
 * `MigenExpertise.dc.html`, blocs 439 à 449 de `implantations--lyon.html`) :
 * un en-tête à deux colonnes, le H2 à gauche et la suite de la punchline à
 * droite, puis toutes les cartes sur une rangée.
 *
 * POURQUOI PAS `offre/ProblemeOffre.tsx` (variante « rangee ») : son en-tête
 * empile surtitre, H2 et phrase, ses cartes respirent 24/28 avec un numéro à
 * 26px. La capture pose l'en-tête en grille 1.1fr/.9fr, un H2 de 26 à 38px, des
 * cartes 26/24/28 et un numéro à 24px. Mêmes données, valeurs relevées ici.
 */

const ENTETE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr .9fr",
  gap: 56,
  alignItems: "end",
  marginBottom: 34,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(26px,2.8vw,38px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  margin: 0,
  maxWidth: "20ch",
  textWrap: "balance",
};

const SUITE: CSSProperties = {
  font: "400 15px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "44ch",
};

const CARTE: CSSProperties = {
  ...VERRE,
  padding: "26px 24px 28px",
  display: "flex",
  flexDirection: "column",
};

const NUMERO: CSSProperties = {
  font: "600 24px/1 var(--ft)",
  letterSpacing: "-.05em",
  /* Carte claire : 2,45:1 en `--acc`, 8,57:1 en `--acc-ink`. Le jumeau
     `NUMERO_SOMBRE` plus bas garde l'orange, il est sur l'anthracite. */
  color: "var(--acc-ink)",
  marginBottom: 18,
};

const ACCROCHE: CSSProperties = {
  font: "600 15px/1.35 var(--ft)",
  letterSpacing: "-.018em",
  marginBottom: 6,
  color: "var(--ink)",
};

const TEXTE: CSSProperties = {
  font: "400 13px/1.55 var(--fb)",
  color: "var(--ink2)",
};

/** Le H2 et sa suite. Sans titre (`ContenuVille.problemeSansTitre`), toute la punchline est la suite. */
function decoupe(section: SectionProbleme, sansTitre?: boolean): { titre?: string; suite?: string } {
  return sansTitre ? { suite: section.punchline } : coupePunchline(section.punchline);
}

/** Le nombre de colonnes de la maquette (`pbGrid`) : une rangée jusqu'à cinq. */
function colonnes(n: number): number {
  if (n <= 5) return n;
  return n % 3 === 0 ? 3 : 4;
}

export default function ProblemeCartes({ section, sansTitre }: { section: SectionProbleme; sansTitre?: boolean }) {
  const { titre, suite } = decoupe(section, sansTitre);
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-r2" style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 18 }}>Votre problématique</div>
            {titre ? <h2 style={TITRE}>{titre}</h2> : null}
          </div>
          {suite ? <p style={SUITE}>{suite}</p> : null}
        </div>
        <div
          className="g3-pbgrid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${colonnes(section.puces.length)},minmax(0,1fr))`,
            gap: 12,
          }}
        >
          {section.puces.map((puce, rang) => (
            <div key={puce.accroche ?? puce.texte} style={CARTE}>
              <span style={NUMERO}>{numerote(rang)}</span>
              {puce.accroche ? <div style={ACCROCHE}>{puce.accroche}</div> : null}
              <div style={TEXTE}>{puce.texte}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/**
 * « 03 Problème » dans son dessin en PANNEAU SOMBRE, relevé le 08/10 sur les
 * dix captures qui le portent (`implantations--maintenance-industrielle-agen
 * .html` et neuf autres) : un panneau anthracite à lueur orange, H2 blanc,
 * suite de la punchline, puces en cartes de verre sombre sur deux colonnes.
 *
 * POURQUOI PAS la variante « panneau-sombre » de `offre/ProblemeOffre.tsx` :
 * sa lueur est posée à -120/-120 et s'éteint à 70 %, son H2 monte à 44px, ses
 * cartes respirent 24/28 sur 18px de rayon, numéro au-dessus de l'accroche.
 * La capture des villes : lueur à -170/-210 éteinte à 68 %, H2 de 26 à 42px,
 * cartes 22/26 au grand rayon, numéro à 26px EN LIGNE avec le texte.
 */

const PANNEAU: CSSProperties = {
  background: "var(--panel)",
  borderRadius: 40,
  padding: "52px 56px",
  position: "relative",
  overflow: "hidden",
};

const LUEUR: CSSProperties = {
  position: "absolute",
  width: 460,
  height: 460,
  right: -170,
  top: -210,
  background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
  pointerEvents: "none",
};

const TITRE_SOMBRE: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: "0 0 12px",
  maxWidth: "22ch",
  textWrap: "balance",
};

const SUITE_SOMBRE: CSSProperties = {
  font: "400 16px/1.7 var(--fb)",
  color: "rgba(255,255,255,.64)",
  margin: "0 0 30px",
  maxWidth: "56ch",
};

const CARTE_SOMBRE: CSSProperties = {
  background: "rgba(255,255,255,.07)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "var(--rad)",
  padding: "22px 26px",
  display: "flex",
  gap: 16,
  alignItems: "baseline",
};

const NUMERO_SOMBRE: CSSProperties = {
  font: "600 26px var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
  flex: "none",
};

const ACCROCHE_SOMBRE: CSSProperties = {
  font: "600 16.5px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  marginBottom: 10,
  color: "#fff",
};

const TEXTE_SOMBRE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "rgba(255,255,255,.62)",
};

export function ProblemePanneau({ section, sansTitre }: { section: SectionProbleme; sansTitre?: boolean }) {
  const { titre, suite } = decoupe(section, sansTitre);
  return (
    /* `data-screen-label` : la règle mobile du gabarit garde les puces sur
       deux colonnes sous 900 px (`PageOffre.module.css`, `.gabarit`). */
    <section data-screen-label="03 Problème" style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-pad" style={PANNEAU}>
          <div aria-hidden="true" style={LUEUR} />
          <div style={{ position: "relative" }}>
            <div style={SURTITRE}>Votre problématique</div>
            {titre ? <h2 style={TITRE_SOMBRE}>{titre}</h2> : null}
            {suite ? <p style={SUITE_SOMBRE}>{suite}</p> : null}
            <div className="mg-rmulti" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
              {section.puces.map((puce, rang) => (
                <div key={puce.accroche ?? puce.texte} style={CARTE_SOMBRE}>
                  <span style={NUMERO_SOMBRE}>{numerote(rang)}</span>
                  <div>
                    {puce.accroche ? <div style={ACCROCHE_SOMBRE}>{puce.accroche}</div> : null}
                    <div style={TEXTE_SOMBRE}>{puce.texte}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
