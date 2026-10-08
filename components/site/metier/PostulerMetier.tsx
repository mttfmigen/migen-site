"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import styles from "./FicheMetier.module.css";

/**
 * La section « Postuler » du gabarit 07, l'ancre `#postuler` que visent tous
 * les boutons de la page.
 *
 * TOUTE SA COPIE EST FIXE : relevée mot pour mot dans
 * `maquette/rendu/carriere--automaticien.html` et vérifiée IDENTIQUE sur les
 * 13 pages du gabarit à l'extraction (le script échoue si une page diverge).
 * C'est la même règle que les copies fixes du gabarit offre.
 *
 * LE FORMULAIRE EST CELUI DE LA MAQUETTE, champs et libellés verbatim. Il ne
 * porte pas encore d'action : le branchement HubSpot (CLAUDE.md §7) est un
 * chantier de câblage, pas de gabarit, et un envoi muet serait pire qu'un
 * champ inerte. Le bouton reste `type="submit"` comme dans la maquette.
 *
 * QUESTIONS OBLIGATOIRES (README de passation, « Candidature ») : `required`
 * repris de `MigenCarriere.dc.html`, qui le pose sur tous les champs sauf
 * Message et CV. Une seule exception au relevé de MigenCarriere : la mobilité.
 * Le README la veut « France entière (uniquement si prêt à déménager) OU une
 * ou plusieurs régions », ce qu'un `<select>` simple ne sait pas dire. Les
 * options et l'aide viennent donc de l'application qui pose cette question
 * exacte (`mobChips` et `MOBS`, présents dans `site-final-autonome.html`) :
 * aide, treize options et exclusivité verbatim.
 *
 * LE DESSIN, LUI, EST CELUI DE LA CAPTURE : un `<select>` « Choisir » dans la
 * demi-colonne, à droite de « Poste visé ». Les treize pastilles déplient sous
 * ce sélecteur au clic, au lieu de pousser tout le formulaire de 220 px (écart
 * de 7 % mesuré le 08/10 par diff-visuel-offre sur « Rejoindre Migen »).
 */

const ETIQUETTE: CSSProperties = {
  display: "block",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink3)",
  marginBottom: 6,
};

const SAISIE: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--rad-s)",
  border: "1px solid var(--line)",
  background: "var(--card)",
  font: "400 14.5px var(--fb)",
  color: "var(--ink)",
  // Pas d'`outline: none` (maquette) : en ligne, il écraserait l'anneau
  // `:focus-visible` de globals.css et le focus clavier deviendrait invisible.
};

/** L'astérisque orange des champs obligatoires, précédé d'une insécable.
 *  Muet pour les lecteurs d'écran : `required` dit déjà « obligatoire ». */
function Obligatoire() {
  return (
    <span aria-hidden="true" style={{ color: "var(--acc)" }}>
      {" *"}
    </span>
  );
}

function Champ({
  etiquette,
  requis = true,
  pleine = false,
  children,
}: {
  etiquette: string;
  requis?: boolean;
  pleine?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: "block",
        minWidth: 0,
        gridColumn: pleine ? "span 2" : undefined,
      }}
    >
      <span style={ETIQUETTE}>
        {etiquette}
        {requis ? <Obligatoire /> : null}
      </span>
      {children}
    </label>
  );
}

function Choix({ nom, options }: { nom: string; options: string[] }) {
  return (
    <select name={nom} defaultValue="" required style={SAISIE}>
      <option value="">Choisir</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

/* `MOBS` de la maquette, dans son ordre. La première vaut déménagement. */
const FRANCE = "France entière (prêt à déménager)";
const MOBILITES = [
  FRANCE,
  "Auvergne-Rhône-Alpes",
  "Île-de-France",
  "Grand Est",
  "Pays de la Loire",
  "Bretagne",
  "Occitanie",
  "Nouvelle-Aquitaine",
  "Hauts-de-France",
  "Bourgogne-Franche-Comté",
  "Normandie",
  "Provence-Alpes-Côte d’Azur",
  "Centre-Val de Loire",
];

/* L'aide de la maquette, verbatim (insécables des guillemets comprises). */
const AIDE_MOBILITE =
  "Choisissez «\u00a0France entière\u00a0» uniquement si vous êtes prêt à déménager, c’est-à-dire à quitter votre région actuelle pour vous installer ailleurs en France. Sinon, sélectionnez la ou les régions dans lesquelles vous pouvez travailler sans déménager.";

/** Bascule de la maquette : « France entière » exclut les régions, et
 *  réciproquement ; les régions se cumulent. */
function basculer(choix: readonly string[], option: string): string[] {
  if (option === FRANCE) return choix.includes(FRANCE) ? [] : [FRANCE];
  const regions = choix.filter((x) => x !== FRANCE);
  return regions.includes(option)
    ? regions.filter((x) => x !== option)
    : [...regions, option];
}

/** La pastille `mobChips` de la maquette, sauf `white-space: nowrap` : au
 *  bureau rien ne change (une pastille passe entière à la ligne), mais sur
 *  mobile la plus longue déborderait de la carte. */
function pastille(coche: boolean, france: boolean): CSSProperties {
  return {
    position: "relative",
    font: "500 12.5px var(--fb)",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    border: `1px solid ${coche ? "transparent" : france ? "rgba(255,124,60,.4)" : "var(--line)"}`,
    color: coche ? "#fff" : france ? "var(--acc-ink)" : "var(--ink1)",
    // `var(--gsol)` vaut exactement les deux fonds de la maquette, clair et sombre.
    backgroundColor: coche ? "#ff7c3c" : france ? "var(--acc-w)" : "var(--gsol)",
  };
}

/** Mobilité géographique, au repos : le `<select>` « Choisir » de la capture.
 *
 *  La face EST un `<select>` natif, rendu `inert` (ni focus, ni clic, hors de
 *  l'arbre d'accessibilité) : sa flèche et ses marges sont celles du
 *  navigateur, comme dans la maquette. Un bouton transparent posé dessus ouvre
 *  le panneau des cases (une valeur `mobility` par case cochée). Le panneau
 *  fermé reste dans le formulaire (`hidden`) : ses cases sont envoyées. Le
 *  champ `required` est un témoin sans nom, focalisable par le navigateur
 *  seul, qui porte la bulle « obligatoire » sur la face et rouvre le panneau. */
function Mobilite() {
  const [choix, setChoix] = useState<string[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const etiquette = useId();
  const panneau = useId();
  const aide = useId();
  const resume = choix.length ? choix.join(", ") : "Choisir";

  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener("pointerdown", dehors);
    return () => document.removeEventListener("pointerdown", dehors);
  }, [ouvert]);

  return (
    <div
      ref={racine}
      style={{ position: "relative", minWidth: 0 }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ouvert) {
          setOuvert(false);
          bouton.current?.focus();
        }
      }}
      onBlur={(e) => {
        // Seule une tabulation vers un autre champ referme. Un clic sur une
        // pastille (étiquette non focalisable) laisse `relatedTarget` vide : le
        // panneau doit rester ouvert ; le clic dehors est traité plus haut.
        const vers = e.relatedTarget as Node | null;
        if (vers && !racine.current?.contains(vers)) setOuvert(false);
      }}
    >
      <span id={etiquette} style={ETIQUETTE}>
        Mobilité géographique
        <Obligatoire />
      </span>
      <div style={{ position: "relative" }}>
        <select inert value="" onChange={() => {}} style={SAISIE}>
          <option value="">{resume}</option>
        </select>
        <button
          ref={bouton}
          type="button"
          aria-haspopup="true"
          aria-expanded={ouvert}
          aria-controls={panneau}
          aria-labelledby={`${etiquette} ${panneau}-resume`}
          onClick={() => setOuvert((o) => !o)}
          style={{
            position: "absolute",
            inset: 0,
            border: 0,
            borderRadius: "var(--rad-s)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <span id={`${panneau}-resume`} className={styles.lu}>
            {resume}
          </span>
        </button>
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={choix.join(", ")}
          onChange={() => {}}
          // N'ouvre que si la mobilité est le PREMIER champ en défaut : le
          // navigateur y pose sa bulle. Sinon (nom vide…) le panneau resterait
          // ouvert loin du champ que le navigateur désigne.
          onInvalid={(e) => {
            if (e.currentTarget.form?.querySelector(":invalid") === e.currentTarget) setOuvert(true);
          }}
          className={styles.masque}
        />
      </div>
      <div
        id={panneau}
        role="group"
        aria-labelledby={etiquette}
        aria-describedby={aide}
        hidden={!ouvert}
        className={styles.panneauMobilite}
      >
        <p
          id={aide}
          style={{
            font: "400 12.5px/1.55 var(--fb)",
            color: "var(--ink2)",
            margin: "0 0 10px",
          }}
        >
          {AIDE_MOBILITE}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {MOBILITES.map((option) => {
            const coche = choix.includes(option);
            return (
              <label
                key={option}
                className={styles.porteFocus}
                style={pastille(coche, option === FRANCE)}
              >
                <input
                  type="checkbox"
                  name="mobility"
                  value={option}
                  checked={coche}
                  onChange={() => setChoix((c) => basculer(c, option))}
                  className={styles.masque}
                />
                {option}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Coche({ texte }: { texte: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        font: "400 14.5px/1.5 var(--fb)",
        color: "rgba(255,255,255,.8)",
      }}
    >
      <span style={{ color: "var(--acc)", fontWeight: 600 }}>✓</span>
      {texte}
    </div>
  );
}

export default function PostulerMetier() {
  return (
    <section
      id="postuler"
      style={{ padding: "var(--sec) 24px 0", scrollMarginTop: 90 }}
    >
      <div
        className={styles.pad}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "var(--panel)",
          borderRadius: 40,
          padding: 56,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            left: -220,
            bottom: -280,
            background:
              "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
            pointerEvents: "none",
          }}
        />
        <div
          className={styles.deuxColonnes}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: ".85fr 1.15fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 16,
              }}
            >
              Postuler
            </div>
            <h2
              style={{
                font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.045em",
                color: "#fff",
                margin: "0 0 18px",
              }}
            >
              Rejoindre Migen
            </h2>
            <p
              style={{
                font: "400 16px/1.65 var(--fb)",
                color: "rgba(255,255,255,.66)",
                margin: "0 0 24px",
                maxWidth: "40ch",
              }}
            >
              Décrivez votre profil. Un recruteur vous rappelle, puis un test
              technique et un entretien comportemental suivent.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              <Coche texte="CDI, alternance ou stage" />
              <Coche texte="Salaire annoncé en brut, sans coefficient caché" />
              <Coche texte="Un référent dès le premier jour" />
            </div>
            <a
              href="tel:+33478337205"
              className={styles.chipTelephone}
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginTop: 26,
                padding: "14px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.2)",
                color: "#fff",
                font: "600 15px var(--fb)",
              }}
            >
              04 78 33 72 05
            </a>
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--rad)",
              padding: 28,
            }}
          >
            {/* `post` en attendant le branchement (CLAUDE.md §7) : sans
                méthode, l'envoi passait nom, e-mail et téléphone dans l'URL
                (historique, journaux du serveur). La route rend la page. */}
            <form
              method="post"
              className={styles.champs}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                alignItems: "end",
              }}
            >
              <Champ etiquette="Nom">
                <input type="text" name="lastname" required autoComplete="family-name" style={SAISIE} />
              </Champ>
              <Champ etiquette="Prénom">
                <input type="text" name="firstname" required autoComplete="given-name" style={SAISIE} />
              </Champ>
              <Champ etiquette="E-mail">
                <input type="email" name="email" required autoComplete="email" style={SAISIE} />
              </Champ>
              <Champ etiquette="Téléphone">
                <input type="tel" name="phone" required autoComplete="tel" style={SAISIE} />
              </Champ>
              <Champ etiquette="Poste visé">
                <Choix
                  nom="job"
                  options={[
                    "Technicien de maintenance",
                    "Électromécanicien",
                    "Automaticien",
                    "Roboticien",
                    "Électricien industriel",
                    "Technicien itinérant",
                    "Responsable maintenance",
                    "Alternance",
                  ]}
                />
              </Champ>
              <Mobilite />
              <Champ etiquette="Trajet maximal">
                <Choix
                  nom="commute"
                  options={["30 minutes", "45 minutes", "1 heure", "Plus d’une heure"]}
                />
              </Champ>
              <Champ etiquette="Années d’expérience">
                <input
                  type="number"
                  name="years"
                  required
                  min={0}
                  placeholder="2"
                  style={SAISIE}
                />
              </Champ>
              <Champ etiquette="Délai de démarrage">
                <Choix nom="start" options={["Immédiat", "Sous 1 mois", "Sous 3 mois", "Au-delà de 3 mois"]} />
              </Champ>
              <Champ etiquette="Prétentions salariales">
                <input
                  type="text"
                  name="salary"
                  required
                  placeholder="25 000 € brut annuel"
                  style={SAISIE}
                />
              </Champ>
              <Champ etiquette="Message" requis={false} pleine>
                <textarea
                  name="message"
                  rows={3}
                  style={{
                    ...SAISIE,
                    font: "400 14.5px/1.5 var(--fb)",
                    resize: "vertical",
                  }}
                />
              </Champ>
              <label
                className={styles.porteFocus}
                style={{
                  position: "relative",
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: "var(--rad-s)",
                  border: "1.5px dashed rgba(28,27,25,.2)",
                  cursor: "pointer",
                }}
              >
                <span style={{ font: "400 14px var(--fb)", color: "var(--ink2)" }}>
                  CV et habilitations (PDF)
                </span>
                <span style={{ font: "600 13px var(--fb)", color: "var(--acc)" }}>
                  Ajouter
                </span>
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.doc,.docx"
                  // Masqué mais focalisable : `display: none` (maquette) le
                  // sortait du parcours clavier.
                  className={styles.masque}
                />
              </label>
              <div style={{ gridColumn: "span 2" }}>
                <button
                  type="submit"
                  className={styles.envoyer}
                  style={{
                    width: "100%",
                    padding: "15px 24px",
                    borderRadius: 999,
                    border: "none",
                    background: "var(--acc)",
                    color: "#fff",
                    font: "600 15px var(--fb)",
                    cursor: "pointer",
                  }}
                >
                  Envoyer ma candidature
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
