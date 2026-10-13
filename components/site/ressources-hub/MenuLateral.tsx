"use client";

import type { CSSProperties } from "react";

import styles from "./Bibliotheque.module.css";
import type { CleDuree } from "./taxonomie";
import { SEGMENTS_DUREE } from "./taxonomie";

/**
 * LE MENU LATÉRAL DE « Ressources v2 », quatre sections numérotées.
 *
 * SES LIBELLÉS SONT CEUX DE LA MAQUETTE, relus dans son objet `lb` :
 * « 01 · Catégories », « 02 · Thèmes », « 03 · Durée de lecture »,
 * « 04 · Taxonomie ». L'espace Techniciens n'a pas de section Thèmes
 * (`hasThemes` vaut `isEnt` chez elle) et ses DEUX DERNIÈRES sections
 * reculent d'un cran ; « Catégories » reste « 01 ». Voir `NUMEROS`.
 *
 * TROIS GESTES DE LA MAQUETTE SONT REPRODUITS À LA LETTRE :
 *   · une catégorie est EXCLUSIVE, un seul bouton actif ;
 *   · les thèmes et les étiquettes sont CUMULATIFS, et se décochent ;
 *   · une étiquette à zéro N'APPARAÎT PAS (`TAX.filter(l => tc[l])`), ce qui
 *     évite d'offrir un filtre qui ne rendrait rien.
 *
 * CE QU'IL FAIT ET QUE LA MAQUETTE NE FAIT PAS : chaque bouton porte
 * `aria-pressed`, et les quatre sections sont des `fieldset` nommés. La
 * maquette pose un `role="tablist"` sur le choix d'espace sans jamais écrire
 * de `role="tab"` cohérent ni de panneau associé ; reproduire une
 * sémantique fausse aurait dégradé le site au lieu de le porter.
 */

const ENTETE_SECTION: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 6px 8px",
  marginBottom: 4,
  borderBottom: "1px solid var(--line)",
};
const TITRE_SECTION: CSSProperties = {
  font: "600 10.5px ui-monospace,Menlo,monospace",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink3)",
};
const COMPTE_SECTION: CSSProperties = {
  font: "500 10.5px ui-monospace,Menlo,monospace",
  color: "var(--ink3)",
};

export interface ProprietesMenu {
  espace: "entreprises" | "techniciens";
  changeEspace: (espace: "entreprises" | "techniciens") => void;

  /** `01 · Catégories`, « Tout » compris. Exclusif. */
  categories: readonly { cle: string; libelle: string; compte: string }[];
  categorieActive: string;
  changeCategorie: (cle: string) => void;
  /** Le total annoncé en tête de section, sur deux chiffres comme la maquette. */
  totalCategories: string;

  /** `02 · Thèmes`. Absent dans l'espace Techniciens. */
  themes: readonly { libelle: string; compte: string; actif: boolean }[] | null;
  basculeTheme: (libelle: string) => void;
  /** Le mot « non classées » du pied de section, ou `null`. */
  themesNonClasses: string | null;

  /** `03 · Durée de lecture`. Exclusif, avec le compte de chaque segment. */
  duree: CleDuree;
  changeDuree: (cle: CleDuree) => void;
  comptesDuree: Readonly<Record<CleDuree, number>>;

  /** `04 · Taxonomie`. Cumulatif, jamais une étiquette à zéro. */
  etiquettes: readonly { libelle: string; compte: number; actif: boolean }[];
  basculeEtiquette: (libelle: string) => void;

  /** Nombre de filtres actifs, pour le bouton pliant et « Réinitialiser ». */
  nombreActifs: number;
  reinitialise: () => void;
  /** Le panneau est-il déplié ? Vrai sur ordinateur, piloté sur mobile. */
  deplie: boolean;
  basculePli: () => void;
}

export default function MenuLateral(p: ProprietesMenu) {
  const estEntreprises = p.espace === "entreprises";
  /*
    LA NUMÉROTATION EST CELLE DE `lb`, et seules les DEUX DERNIÈRES sections
    glissent quand « Thèmes » disparaît :

      lb: { cat: "01 · Catégories", th: "02 · Thèmes",
            dur: (isEnt ? "03" : "02") + " · Durée de lecture",
            tax: (isEnt ? "04" : "03") + " · Taxonomie" }

    Une première version décalait TOUTES les sections, et l'espace Techniciens
    affichait « 00 · Catégories ». Vu à l'écran, pas à la relecture : d'où la
    transcription littérale de la table plutôt qu'une règle reconstituée.
  */
  const NUMEROS = {
    cat: "01",
    themes: "02",
    duree: estEntreprises ? "03" : "02",
    taxonomie: estEntreprises ? "04" : "03",
  } as const;

  return (
    <aside className={styles.menu} aria-label="Filtrer la bibliothèque">
      <div className={styles.menuCarte}>
        {/* Les deux espaces. Deux boutons, pas un interrupteur : chacun doit
            pouvoir être annoncé et atteint séparément au clavier. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            padding: 4,
            borderRadius: 16,
            background: "var(--chip)",
          }}
        >
          {(
            [
              ["entreprises", "Entreprises"],
              ["techniciens", "Techniciens"],
            ] as const
          ).map(([cle, libelle]) => {
            const actif = p.espace === cle;
            return (
              <button
                key={cle}
                type="button"
                aria-pressed={actif}
                onClick={() => p.changeEspace(cle)}
                className={styles.segment}
                style={{
                  border: "none",
                  padding: "10px 6px",
                  borderRadius: 12,
                  font: "600 13px var(--fb)",
                  background: actif ? "var(--card)" : "transparent",
                  color: actif ? "var(--ink)" : "var(--ink3)",
                  boxShadow: actif ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
                }}
              >
                {libelle}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.plieFiltres}
          aria-expanded={p.deplie}
          onClick={p.basculePli}
        >
          Filtres
          <span style={{ font: "500 11px ui-monospace,Menlo,monospace", color: "var(--ink3)" }}>
            {p.nombreActifs
              ? `${p.nombreActifs} ${p.nombreActifs > 1 ? "actifs" : "actif"}`
              : "Aucun actif"}
          </span>
        </button>

        <div
          className={`${styles.corpsFiltres} ${p.deplie ? "" : styles.corpsFiltresPlie}`}
        >
          {/* 01 · Catégories */}
          <fieldset style={{ display: "grid", gap: 2, border: "none", margin: 0, padding: 0 }}>
            <legend style={{ padding: 0, width: "100%" }}>
              <span style={ENTETE_SECTION}>
                <span style={TITRE_SECTION}>{NUMEROS.cat} · Catégories</span>
                <span style={COMPTE_SECTION}>{p.totalCategories}</span>
              </span>
            </legend>
            {p.categories.map((c) => {
              const actif = p.categorieActive === c.cle;
              return (
                <button
                  key={c.cle}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => p.changeCategorie(c.cle)}
                  className={styles.boutonCategorie}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    padding: 10,
                    border: "none",
                    borderRadius: 12,
                    textAlign: "left",
                    font: `${actif ? 600 : 500} 14px var(--fb)`,
                    backgroundColor: actif ? "var(--card)" : "transparent",
                    color: actif ? "var(--ink)" : "var(--ink1)",
                    boxShadow: actif ? "0 8px 20px -14px rgba(0,0,0,.4)" : "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        flex: "none",
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        backgroundColor: actif ? "#ff7c3c" : "var(--line)",
                        boxShadow: actif
                          ? "0 0 0 3px rgba(255,124,60,.18),0 0 12px rgba(255,124,60,.7)"
                          : "none",
                      }}
                    />
                    {c.libelle}
                  </span>
                  <span
                    style={{
                      font: "500 11px ui-monospace,Menlo,monospace",
                      color: actif ? "#ff7c3c" : "var(--ink3)",
                    }}
                  >
                    {c.compte}
                  </span>
                </button>
              );
            })}
          </fieldset>

          {/* 02 · Thèmes, espace Entreprises seulement. */}
          {p.themes ? (
            <fieldset style={{ display: "grid", gap: 2, border: "none", margin: 0, padding: 0 }}>
              <legend style={{ padding: 0, width: "100%" }}>
                <span style={ENTETE_SECTION}>
                  <span style={TITRE_SECTION}>{NUMEROS.themes} · Thèmes</span>
                  <span style={COMPTE_SECTION}>
                    {p.themes.filter((t) => t.actif).length
                      ? `${p.themes.filter((t) => t.actif).length} sél.`
                      : ""}
                  </span>
                </span>
              </legend>
              {p.themes.map((t) => (
                <button
                  key={t.libelle}
                  type="button"
                  aria-pressed={t.actif}
                  onClick={() => p.basculeTheme(t.libelle)}
                  className={styles.boutonTheme}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    padding: "9px 10px",
                    border: "none",
                    borderRadius: 12,
                    background: "none",
                    textAlign: "left",
                    font: "500 13.5px var(--fb)",
                    color: "var(--ink1)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        flex: "none",
                        width: 16,
                        height: 16,
                        borderRadius: 5,
                        display: "grid",
                        placeItems: "center",
                        border: `1.5px solid ${t.actif ? "#ff7c3c" : "var(--ink3)"}`,
                        backgroundColor: t.actif ? "#ff7c3c" : "transparent",
                      }}
                    >
                      <span
                        style={{
                          width: 4,
                          height: 7,
                          borderRight: "2px solid #fff",
                          borderBottom: "2px solid #fff",
                          transform: "translateY(-1px) rotate(45deg)",
                          opacity: t.actif ? 1 : 0,
                        }}
                      />
                    </span>
                    {t.libelle}
                  </span>
                  <span
                    style={{ font: "500 11px ui-monospace,Menlo,monospace", color: "var(--ink3)" }}
                  >
                    {t.compte}
                  </span>
                </button>
              ))}
              {/*
                LE TROU EST DIT, PAS COMBLÉ. La maquette ne classe par thème
                que ses quinze articles ; les fiches pratiques, fiches
                techniques, livres blancs et process n'en ont aucun. Les
                ranger d'office aurait été une décision éditoriale prise à la
                place de Mehdi. La ligne ci-dessous dit donc combien de
                ressources aucun thème ne couvre, pour que le filtre ne mente
                pas sur ce qu'il laisse de côté.
              */}
              {p.themesNonClasses ? (
                <p
                  style={{
                    font: "400 11.5px/1.5 var(--fb)",
                    color: "var(--ink3)",
                    margin: "8px 6px 0",
                  }}
                >
                  {p.themesNonClasses}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {/* 03 · Durée de lecture */}
          <fieldset style={{ display: "grid", gap: 8, border: "none", margin: 0, padding: 0 }}>
            <legend style={{ padding: 0, width: "100%" }}>
              <span style={ENTETE_SECTION}>
                <span style={TITRE_SECTION}>{NUMEROS.duree} · Durée de lecture</span>
                <span style={COMPTE_SECTION} />
              </span>
            </legend>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                gap: 3,
                padding: 4,
                borderRadius: 14,
                background: "var(--chip)",
              }}
            >
              {/*
                CHAQUE SEGMENT ANNONCE SON COMPTE, ET CELUI QUI N'A RIEN EST
                DÉSACTIVÉ. C'est un ÉCART ASSUMÉ à la maquette, qui n'affiche
                aucun compte ici : chez elle, « ≤ 6 min » retient un livre
                blanc, chez nous aucune des 48 pages ne descend sous 7 minutes.
                Le segment était donc un bouton qui ne pouvait QUE rendre une
                page vide, à tous les coups.

                L'IDIOME EST LE SIEN, et c'est pour cela qu'il est repris ici
                plutôt qu'inventé : elle désactive déjà ses catégories sans
                contenu (`disabled` et le libellé « Bientôt »). On applique son
                traitement d'un contrôle vide là où notre donnée en crée un.
              */}
              {SEGMENTS_DUREE.map((d) => {
                const actif = p.duree === d.cle;
                const compte = p.comptesDuree[d.cle] ?? 0;
                const vide = compte === 0;
                return (
                  <button
                    key={d.cle}
                    type="button"
                    aria-pressed={actif}
                    disabled={vide}
                    title={vide ? `Aucune page ne dure ${d.libelle}` : undefined}
                    onClick={() => p.changeDuree(d.cle)}
                    className={styles.segment}
                    style={{
                      border: "none",
                      padding: "8px 2px",
                      borderRadius: 10,
                      font: "600 11.5px var(--fb)",
                      whiteSpace: "nowrap",
                      cursor: vide ? "default" : "pointer",
                      backgroundColor: actif ? "var(--card)" : "transparent",
                      color: vide ? "var(--ink4)" : actif ? "var(--ink)" : "var(--ink2)",
                      boxShadow: actif ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
                    }}
                  >
                    {d.libelle}{" "}
                    <span style={{ font: "500 10px ui-monospace,Menlo,monospace", opacity: 0.7 }}>
                      {String(compte).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 04 · Taxonomie */}
          {p.etiquettes.length > 0 ? (
            <fieldset style={{ display: "grid", gap: 8, border: "none", margin: 0, padding: 0 }}>
              <legend style={{ padding: 0, width: "100%" }}>
                <span style={ENTETE_SECTION}>
                  <span style={TITRE_SECTION}>{NUMEROS.taxonomie} · Taxonomie</span>
                  <span style={COMPTE_SECTION}>
                    {p.etiquettes.filter((e) => e.actif).length
                      ? `${p.etiquettes.filter((e) => e.actif).length} sél.`
                      : ""}
                  </span>
                </span>
              </legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.etiquettes.map((e) => (
                  <button
                    key={e.libelle}
                    type="button"
                    aria-pressed={e.actif}
                    onClick={() => p.basculeEtiquette(e.libelle)}
                    className={styles.boutonEtiquette}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 999,
                      font: "500 12px var(--fb)",
                      border: `1px solid ${e.actif ? "#ff7c3c" : "var(--line)"}`,
                      backgroundColor: e.actif ? "var(--accw)" : "var(--card)",
                      color: e.actif ? "var(--acci)" : "var(--ink1)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ font: "600 11px ui-monospace,Menlo,monospace", opacity: 0.55 }}
                    >
                      #
                    </span>
                    {e.libelle}
                    <span
                      style={{
                        font: "500 10.5px ui-monospace,Menlo,monospace",
                        opacity: 0.55,
                      }}
                    >
                      {e.compte}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {p.nombreActifs > 0 ? (
            <button
              type="button"
              onClick={p.reinitialise}
              className={styles.reinitialise}
              style={{
                border: "1px dashed var(--line)",
                background: "none",
                padding: 11,
                borderRadius: 14,
                font: "600 12.5px var(--fb)",
                color: "var(--ink2)",
              }}
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
