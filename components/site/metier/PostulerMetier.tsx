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
  outline: "none",
};

/** L'astérisque orange des champs obligatoires, précédé d'une insécable. */
function Obligatoire() {
  return <span style={{ color: "var(--acc)" }}>{" *"}</span>;
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
    <select name={nom} defaultValue="" style={SAISIE}>
      <option value="">Choisir</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
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
            <form
              className={styles.champs}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                alignItems: "end",
              }}
            >
              <Champ etiquette="Nom">
                <input type="text" name="lastname" style={SAISIE} />
              </Champ>
              <Champ etiquette="Prénom">
                <input type="text" name="firstname" style={SAISIE} />
              </Champ>
              <Champ etiquette="E-mail">
                <input type="email" name="email" style={SAISIE} />
              </Champ>
              <Champ etiquette="Téléphone">
                <input type="tel" name="phone" style={SAISIE} />
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
              <Champ etiquette="Mobilité géographique">
                <Choix
                  nom="mobility"
                  options={[
                    "France entière",
                    "Auvergne-Rhône-Alpes",
                    "Île-de-France",
                    "Grand Est",
                    "Hauts-de-France",
                    "Grand Ouest",
                    "Sud-Ouest et Occitanie",
                  ]}
                />
              </Champ>
              <Champ etiquette="Trajet maximal">
                <Choix
                  nom="commute"
                  options={["30 minutes", "45 minutes", "1 heure", "Plus d’une heure"]}
                />
              </Champ>
              <Champ etiquette="Années d’expérience">
                <input type="number" name="years" placeholder="2" style={SAISIE} />
              </Champ>
              <Champ etiquette="Délai de démarrage">
                <Choix nom="start" options={["Immédiat", "Sous 1 mois", "Sous 3 mois"]} />
              </Champ>
              <Champ etiquette="Prétentions salariales">
                <input
                  type="text"
                  name="salary"
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
                style={{
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
                  style={{ display: "none" }}
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
