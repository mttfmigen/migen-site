import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { coupePunchline, numerote } from "@/components/site/offre/texte-offre";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
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
  color: "var(--acc)",
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

/**
 * Le résumé du bloc replié : les intitulés des puces joints par « · », SANS
 * CELUI QUI EST DÉJÀ LE TITRE.
 *
 * MESURÉ, PAS SUPPOSÉ : sur les DIX pages qui portent le panneau sombre, la
 * première puce du corpus reprend mot pour mot la première phrase de la
 * punchline, celle que `coupePunchline` élève en H2. Un résumé naïf aurait
 * donc commencé par répéter le titre qu'on vient de lire deux lignes plus
 * haut, sur dix pages sur dix. On ne touche pas à la copie : on cesse
 * simplement d'annoncer comme « caché » un intitulé qui est resté visible
 * dans la bascule.
 */
function resumePuces(section: SectionProbleme, titre?: string): string {
  const nu = (t?: string) => (t ?? "").replace(/\s+/g, " ").trim();
  return section.puces
    .map((puce) => puce.accroche ?? puce.texte)
    .filter((intitule) => intitule && nu(intitule) !== nu(titre))
    .join(" · ");
}

/** Le nombre de colonnes de la maquette (`pbGrid`) : une rangée jusqu'à cinq. */
function colonnes(n: number): number {
  if (n <= 5) return n;
  return n % 3 === 0 ? 3 : 4;
}

/**
 * REPLIÉ AU TÉLÉPHONE DEPUIS LE 14/10, par le motif à ÉTIQUETTE de
 * `offre/PointsOffre.tsx` (posé le 12/10, donc APRÈS le verdict d'époque qui
 * laissait ce dessin déplié : ses trois issues pesées n'incluaient pas
 * celle-ci). Il pèse 1546 px à 390 px sur `/implantations/lyon/`, sur 35
 * pages : c'était le plus lourd des écrans encore dépliés du gabarit.
 *
 * SON H2 VIT DANS UNE GRILLE (`1.1fr .9fr`, relevé tpl 439 de
 * `implantations--lyon.html`) : il y RESTE, à sa place et à sa taille de
 * capture. La bascule porte une ÉTIQUETTE (`stylesOffre.etiquettePli`) qui
 * répète le sur-titre et le H2, n'existe que sous 880 px, et s'efface une
 * fois le bloc ouvert. Au-dessus de 880 px la bascule entière est retirée
 * (`stylesOffre.blocPliablePartage`) : les deux colonnes de bureau des 35
 * captures ne bougent pas d'un pixel.
 *
 * PAS DE H2, PAS DE REPLI, même règle que le panneau sombre plus bas :
 * `problemeSansTitre` (Vesoul, en rangée) rend le bloc déplié plutôt qu'une
 * bascule sans titre lisible, que `scripts/verifie-blocs-pliables.mjs`
 * refuse à juste titre.
 */

/** L'étiquette de la bascule mobile, mêmes valeurs que `PointsOffre.tsx`. */
const ETIQUETTE_SURTITRE: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/** Le libellé de la bascule, à l'échelle des H2 du gabarit en largeur mobile. */
const ETIQUETTE_TITRE: CSSProperties = {
  display: "block",
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.035em",
  color: "var(--ink)",
};
export default function ProblemeCartes({ section, sansTitre }: { section: SectionProbleme; sansTitre?: boolean }) {
  const { titre, suite } = decoupe(section, sansTitre);
  const corps = (
    <>
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
    </>
  );
  return (
    <section data-screen-label="03 Problème" style={SECTION}>
      <div className={stylesOffre.blocPliablePartage} style={LARGEUR}>
        {titre ? (
          <SectionPliableMobile
            enTete={
              <span data-mobile-seulement="" className={stylesOffre.etiquettePli}>
                <span style={ETIQUETTE_SURTITRE}>Votre problématique</span>
                <span style={ETIQUETTE_TITRE}>{titre}</span>
              </span>
            }
            resume={resumePuces(section, titre)}
          >
            {corps}
          </SectionPliableMobile>
        ) : (
          corps
        )}
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

/**
 * Le panneau anthracite, ET SES JETONS DE TEXTE REPEINTS EN CLAIR.
 *
 * POURQUOI CES DEUX LIGNES EXISTENT, mesuré le 12/10 au navigateur sur
 * `/implantations/maintenance-industrielle-agen/` : le fond du panneau est
 * `rgb(28,27,25)`, et à l'intérieur `--ink2` valait `#6a6764`, `--ink`
 * `#1c1b19`, c'est-à-dire EXACTEMENT la couleur du fond. Tant que le panneau
 * écrivait toutes ses couleurs en dur (`#fff`, `rgba(255,255,255,…)`), cela
 * ne gênait personne. Le bloc repliable, lui, prend ses couleurs dans ces
 * jetons : son chevron et son résumé seraient sortis gris foncé sur fond
 * foncé, soit un bloc replié dont rien n'annonce qu'il y a quelque chose
 * dessous. C'est le défaut que `scripts/verifie-blocs-pliables.mjs` refuse.
 *
 * AUCUN ÉLÉMENT DÉJÀ EN PLACE NE LIT CES DEUX JETONS (vérifié : le panneau
 * n'utilise que des littéraux et `var(--acc)` pour le sur-titre), et les deux
 * seuls qui les lisent sont masqués au-dessus de 880 px. Le bureau ne change
 * donc pas d'un pixel ni d'une teinte. Même procédé que `.faqPhoto` de
 * `PageVille.module.css`, qui repeint ses jetons pour la même raison.
 */
const PANNEAU: CSSProperties = {
  background: "var(--panel)",
  borderRadius: 40,
  padding: "52px 56px",
  position: "relative",
  overflow: "hidden",
  ["--ink" as string]: "#fff",
  ["--ink2" as string]: "rgba(255,255,255,.62)",
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

/**
 * Le H2 du panneau, à 12 px près.
 *
 * LA CAPTURE POSE `margin: 0 0 12px` (relevé sur
 * `implantations--maintenance-industrielle-agen.html`). Le bloc repliable
 * ajoute `.corps { margin-top: 12px }` sous le `<summary>` : les 12 px de la
 * capture sont donc rendus par 0 + 12, et la suite de la punchline reste
 * exactement où elle était sur grand écran.
 */
const TITRE_SOMBRE: CSSProperties = {
  font: "600 calc(clamp(26px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "#fff",
  margin: 0,
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
  /* Le contenu replié, écrit une seule fois : il est rendu tel quel quand le
     panneau n'a pas de H2, et dans le bloc repliable quand il en a un. */
  const corps = (
    <>
      {suite ? <p style={SUITE_SOMBRE}>{suite}</p> : null}
      <div className="mg-rmulti" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
        {section.puces.map((puce, rang) => (
          <div key={puce.accroche ?? puce.texte} style={CARTE_SOMBRE}>
            <span style={NUMERO_SOMBRE}>{numerote(rang)}</span>
            {/* `minWidth: 0` ET `overflowWrap` : un élément de flexbox ne
                descend pas sous la largeur de son mot le plus long tant qu'il
                garde `min-width: auto`. Mesuré le 13/10 à 320 px sur
                `/implantations/maintenance-industrielle-albi/` :
                « pharmaceutiques » réclamait 131 px dans une colonne qui en
                offrait 116, la carte sortait du panneau et le panneau rognait
                la fin du constat. Invisible dès qu'il y a la place. */}
            <div style={{ minWidth: 0, overflowWrap: "break-word" }}>
              {puce.accroche ? <div style={ACCROCHE_SOMBRE}>{puce.accroche}</div> : null}
              <div style={TEXTE_SOMBRE}>{puce.texte}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  return (
    /* `data-screen-label` : la règle mobile du gabarit garde les puces sur
       deux colonnes sous 900 px (`PageOffre.module.css`, `.gabarit`). */
    <section data-screen-label="03 Problème" style={SECTION}>
      <div style={LARGEUR}>
        <div className="mg-pad" style={PANNEAU}>
          <div aria-hidden="true" style={LUEUR} />
          <div style={{ position: "relative" }}>
            {/* SE REPLIE AU TÉLÉPHONE, motif « Blocs communs (pliables) » de
                `MigenMobile.dc.html`, sur les dix pages qui portent ce
                dessin. LE SUR-TITRE ET LE H2 DÉJÀ LÀ servent d'en-tête : ils
                sont EMPILÉS ici, pas posés dans une grille (à la différence
                du dessin en rangée juste au-dessus, qui pour cette raison
                n'est pas replié), donc les envelopper ne déplace rien.

                PAS DE H2, PAS DE REPLI, et ce n'est pas une précaution de
                style. `problemeSansTitre` fait tomber le H2 (la punchline
                reste entière dans son paragraphe) : le bloc replié n'aurait
                alors qu'un sur-titre dans sa bascule, et
                `scripts/verifie-blocs-pliables.mjs` refuse à juste titre « un
                bloc repliable sans titre lisible », parce que le visiteur ne
                saurait pas qu'il y a quelque chose dessous. Aujourd'hui
                aucune page n'est dans ce cas (Vesoul est la seule à poser
                `problemeSansTitre`, et elle est en rangée) ; la règle est
                écrite pour que la première qui le sera se rende sans repli,
                au lieu de faire rougir une porte. */}
            {titre ? (
              <SectionPliableMobile
                enTete={
                  <span>
                    <span style={{ ...SURTITRE, display: "block" }}>Votre problématique</span>
                    <h2 style={TITRE_SOMBRE}>{titre}</h2>
                  </span>
                }
                resume={resumePuces(section, titre)}
              >
                {corps}
              </SectionPliableMobile>
            ) : (
              <>
                <div style={SURTITRE}>Votre problématique</div>
                {corps}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
