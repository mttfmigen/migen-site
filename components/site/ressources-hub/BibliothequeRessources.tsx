"use client";

import { useMemo, useState } from "react";

import CarteBibliotheque from "./CarteBibliotheque";
import styles from "./Bibliotheque.module.css";
import { AppelRessourcesMobile } from "./HautDePageRessources";
import MenuLateral from "./MenuLateral";
import SommaireComplet from "./SommaireComplet";
import type { Bibliotheque, CarteBibliotheque as Carte } from "./catalogue";
import type { CleDuree, CleTri, CleVue } from "./taxonomie";
import {
  dureeRetenue,
  normalise,
  SEGMENTS_DUREE,
  THEMES,
  TRIS,
  VUES,
} from "./taxonomie";

/**
 * LA BIBLIOTHÈQUE « Ressources v2 » : menu latéral, recherche, tri, deux vues.
 *
 * ELLE S'AJOUTE À LA PAGE, ELLE NE REMPLACE RIEN. Le hub `/ressources/` garde
 * en entier son héros, son guide rédigé, ses questions fréquentes et son
 * formulaire : ce cadre vient se poser entre le héros et le guide, à la place
 * que la maquette lui donne. Mesuré avant et après le portage, le `<main>` de
 * la page n'a pas perdu un mot.
 *
 * LE PANNEAU DE LECTURE DE LA MAQUETTE N'EST PAS PORTÉ, et c'est délibéré.
 * Elle ouvre l'article dans un tiroir piloté en JavaScript, tout en gardant
 * l'URL réelle sur le lien. Son propre LISEZMOI dit pourquoi ce tiroir ne
 * suffit pas : « en production, chaque article doit aussi exister comme vraie
 * page à l'URL /ressources/articles/… pour le référencement ». Nos 48 pages
 * existent, elles sont plus complètes que le tiroir (corps entier, FAQ,
 * maillage, formulaire), et un tiroir qui dupliquerait leur texte dans le hub
 * donnerait à Google 48 contenus en double sur une seule URL. Les cartes sont
 * donc des liens, et rien d'autre.
 *
 * CE QUE LE NAVIGATEUR REÇOIT SANS JAVASCRIPT : le premier rendu est celui du
 * serveur, filtres au repos, donc la grille complète de l'espace Entreprises.
 * Et sous la grille, `SommaireComplet` liste les 48 URL des DEUX espaces, sans
 * condition et sans état : aucune page n'est atteignable par le seul
 * JavaScript, même si le visiteur ne l'exécute pas.
 */

/** L'état des filtres, groupé parce qu'ils se réinitialisent ensemble. */
interface Filtres {
  categorie: string;
  themes: string[];
  duree: CleDuree;
  etiquettes: string[];
  recherche: string;
}

const AU_REPOS: Filtres = {
  categorie: "all",
  themes: [],
  duree: "all",
  etiquettes: [],
  recherche: "",
};

/** Deux chiffres, comme `String(n).padStart(2, "0")` de la maquette. */
const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/** Le libellé d'un segment de durée, relu dans `SEGMENTS_DUREE` et non recopié. */
const libelleDuree = (cle: CleDuree) =>
  SEGMENTS_DUREE.find((d) => d.cle === cle)?.libelle ?? "";

export default function BibliothequeRessources({
  bibliotheque,
}: {
  bibliotheque: Bibliotheque;
}) {
  const [espace, setEspace] = useState<"entreprises" | "techniciens">("entreprises");
  const [filtres, setFiltres] = useState<Filtres>(AU_REPOS);
  const [tri, setTri] = useState<CleTri>("pert");
  const [vue, setVue] = useState<CleVue>("grid");
  const [deplie, setDeplie] = useState(false);

  const estEntreprises = espace === "entreprises";
  const courant = estEntreprises ? bibliotheque.entreprises : bibliotheque.techniciens;

  // `inCat` de la maquette : les compteurs de thèmes et d'étiquettes se
  // calculent sur la CATÉGORIE retenue, pas sur ce que les autres filtres
  // laissent passer. Sans cela, cocher un thème remettrait tous les autres
  // compteurs à zéro et le menu deviendrait illisible.
  const dansCategorie = useMemo(
    () =>
      courant.cartes.filter(
        (c) => filtres.categorie === "all" || c.format === filtres.categorie,
      ),
    [courant.cartes, filtres.categorie],
  );

  const etiquettes = useMemo(() => {
    const comptes = new Map<string, number>();
    for (const carte of dansCategorie) {
      for (const e of carte.etiquettes) comptes.set(e, (comptes.get(e) ?? 0) + 1);
    }
    // L'ordre est celui de la taxonomie, pas celui du compte : la maquette
    // parcourt `TAX` et garde les non vides. Les cartes portent leurs
    // étiquettes dans cet ordre, il suffit donc de dédoublonner à la volée.
    const ordre: string[] = [];
    for (const carte of courant.cartes) {
      for (const e of carte.etiquettes) if (!ordre.includes(e)) ordre.push(e);
    }
    return ordre
      .filter((libelle) => (comptes.get(libelle) ?? 0) > 0)
      .map((libelle) => ({
        libelle,
        compte: comptes.get(libelle) ?? 0,
        actif: filtres.etiquettes.includes(libelle),
      }));
  }, [courant.cartes, dansCategorie, filtres.etiquettes]);

  const themes = useMemo(() => {
    if (!estEntreprises) return null;
    return THEMES.map((libelle) => ({
      libelle,
      compte: deuxChiffres(dansCategorie.filter((c) => c.theme === libelle).length),
      actif: filtres.themes.includes(libelle),
    }));
  }, [estEntreprises, dansCategorie, filtres.themes]);

  /**
   * Le compte de chaque segment de durée, sur la catégorie retenue.
   *
   * Il sert à désactiver un segment vide plutôt qu'à le laisser rendre une
   * page blanche : voir le commentaire de `MenuLateral`.
   */
  const comptesDuree = useMemo(() => {
    const par = { all: 0, s: 0, m: 0, l: 0 } as Record<CleDuree, number>;
    for (const cle of ["all", "s", "m", "l"] as const) {
      par[cle] = dansCategorie.filter((c) => dureeRetenue(c.minutes, cle)).length;
    }
    return par;
  }, [dansCategorie]);

  /** Combien de ressources aucun des quatre thèmes ne couvre, dit sans détour. */
  const themesNonClasses = useMemo(() => {
    if (!estEntreprises) return null;
    const sans = dansCategorie.filter((c) => !c.theme).length;
    if (sans === 0) return null;
    return `${sans} ressources n'ont pas encore de thème, le classement reste à faire. Elles restent dans « Tout ».`;
  }, [estEntreprises, dansCategorie]);

  /** `items` de la maquette : la même chaîne de filtres, dans le même ordre. */
  const resultats = useMemo(() => {
    const q = normalise(filtres.recherche.trim());
    const gardes = dansCategorie.filter(
      (c) =>
        (!estEntreprises || filtres.themes.length === 0 || (!!c.theme && filtres.themes.includes(c.theme))) &&
        dureeRetenue(c.minutes, filtres.duree) &&
        (filtres.etiquettes.length === 0 ||
          c.etiquettes.some((e) => filtres.etiquettes.includes(e))) &&
        (!q || normalise(c.recherche).includes(q)),
    );
    if (tri === "court") return [...gardes].sort((a, b) => a.minutes - b.minutes);
    if (tri === "long") return [...gardes].sort((a, b) => b.minutes - a.minutes);
    return gardes;
  }, [dansCategorie, estEntreprises, filtres, tri]);

  /** `chips` de la maquette : un jeton retirable par filtre actif. */
  const jetons = useMemo(() => {
    const liste: { cle: string; libelle: string; retire: () => void }[] = [];
    if (filtres.categorie !== "all") {
      const c = courant.categories.find((x) => x.cle === filtres.categorie);
      liste.push({
        cle: `cat:${filtres.categorie}`,
        libelle: c?.libelle ?? filtres.categorie,
        retire: () => setFiltres((f) => ({ ...f, categorie: "all" })),
      });
    }
    for (const t of filtres.themes) {
      liste.push({
        cle: `th:${t}`,
        libelle: t,
        retire: () =>
          setFiltres((f) => ({ ...f, themes: f.themes.filter((x) => x !== t) })),
      });
    }
    if (filtres.duree !== "all") {
      liste.push({
        cle: "dur",
        libelle: `${libelleDuree(filtres.duree)} de lecture`,
        retire: () => setFiltres((f) => ({ ...f, duree: "all" })),
      });
    }
    for (const e of filtres.etiquettes) {
      liste.push({
        cle: `tag:${e}`,
        libelle: `#${e}`,
        retire: () =>
          setFiltres((f) => ({ ...f, etiquettes: f.etiquettes.filter((x) => x !== e) })),
      });
    }
    if (filtres.recherche.trim()) {
      liste.push({
        cle: "q",
        libelle: `« ${filtres.recherche.trim()} »`,
        retire: () => setFiltres((f) => ({ ...f, recherche: "" })),
      });
    }
    return liste;
  }, [courant.categories, filtres]);

  const auRepos = jetons.length === 0;

  /* « À LA UNE », règle de la maquette mobile v2 : `feat = !q0 && cat ===
     "all" && !th && dur === "all"`, donc filtres au repos. Elle n'a ni tri ni
     vue liste ; chez nous la une suit l'ordre de pertinence, en grille. Elle
     ne dessine qu'au téléphone (voir `CarteBibliotheque`). */
  const avecUne = auRepos && tri === "pert" && vue === "grid";

  const changeEspace = (suivant: "entreprises" | "techniciens") => {
    // `pickSpace` de la maquette remet TOUS les filtres au repos en changeant
    // d'espace : les catégories et les étiquettes des deux espaces n'ont rien
    // de commun, les garder ne rendrait jamais rien.
    setEspace(suivant);
    setFiltres(AU_REPOS);
  };

  return (
    <section
      id="bibliotheque"
      data-screen-label="Ressources · bibliothèque"
      aria-labelledby="bibliotheque-titre"
      className={styles.sectionBibliotheque}
    >
      <div className={styles.cadre}>
        <MenuLateral
          espace={espace}
          changeEspace={changeEspace}
          categories={courant.categories.map((c) => ({
            cle: c.cle,
            libelle: c.libelle,
            compte: deuxChiffres(
              c.cle === "all"
                ? courant.cartes.length
                : courant.cartes.filter((x) => x.format === c.cle).length,
            ),
          }))}
          categorieActive={filtres.categorie}
          changeCategorie={(cle) => setFiltres((f) => ({ ...f, categorie: cle }))}
          totalCategories={deuxChiffres(courant.cartes.length)}
          themes={themes}
          basculeTheme={(libelle) =>
            setFiltres((f) => ({
              ...f,
              themes: f.themes.includes(libelle)
                ? f.themes.filter((x) => x !== libelle)
                : [...f.themes, libelle],
            }))
          }
          themesNonClasses={themesNonClasses}
          duree={filtres.duree}
          changeDuree={(cle) => setFiltres((f) => ({ ...f, duree: cle }))}
          comptesDuree={comptesDuree}
          etiquettes={etiquettes}
          basculeEtiquette={(libelle) =>
            setFiltres((f) => ({
              ...f,
              etiquettes: f.etiquettes.includes(libelle)
                ? f.etiquettes.filter((x) => x !== libelle)
                : [...f.etiquettes, libelle],
            }))
          }
          nombreActifs={jetons.length}
          reinitialise={() => setFiltres(AU_REPOS)}
          deplie={deplie}
          basculePli={() => setDeplie((v) => !v)}
        />

        <div style={{ minWidth: 0 }}>
          <h2
            id="bibliotheque-titre"
            style={{
              font: "600 calc(28px * var(--ts))/1.15 var(--ft)",
              letterSpacing: "-.035em",
              margin: "0 0 6px",
            }}
          >
            {estEntreprises ? "Toute la bibliothèque" : "Toutes les fiches"}
          </h2>
          <p style={{ font: "400 14.5px/1.6 var(--fb)", color: "var(--ink2)", margin: "0 0 18px" }}>
            {estEntreprises
              ? "Filtrez par catégorie, thème, durée ou taxonomie."
              : "Filtrez par catégorie, durée ou compétence."}
          </p>

          {/* La recherche. Un `<label>` enveloppant, comme la maquette, pour
              que le clic n'importe où dans la barre donne le focus au champ. */}
          <label className={styles.recherche}>
            <span style={{ font: "400 15px var(--fb)", color: "var(--ink3)" }} aria-hidden="true">
              ⚲
            </span>
            <input
              type="search"
              value={filtres.recherche}
              onChange={(e) => setFiltres((f) => ({ ...f, recherche: e.target.value }))}
              placeholder={
                estEntreprises
                  ? "Rechercher : GMAO, préventive, coût d’un arrêt…"
                  : "Rechercher : salaire, alternance, automaticien…"
              }
              aria-label="Rechercher dans les ressources"
              /* 16 px et non 15 : sous cette taille, Safari iOS zoome sur le
                 champ au focus et casse la mise en page. */
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                background: "none",
                outline: "none",
                font: "400 16px var(--fb)",
                color: "var(--ink)",
              }}
            />
            <span
              aria-live="polite"
              style={{
                flex: "none",
                padding: "7px 10px",
                borderRadius: 10,
                background: "var(--chip)",
                font: "600 11.5px ui-monospace,Menlo,monospace",
                color: "var(--ink2)",
                whiteSpace: "nowrap",
              }}
            >
              {resultats.length} {resultats.length > 1 ? "résultats" : "résultat"}
            </span>
          </label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px 16px",
              marginTop: 14,
            }}
          >
            <div
              className={styles.jetons}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                minHeight: 34,
              }}
            >
              {jetons.map((j) => (
                <button
                  key={j.cle}
                  type="button"
                  onClick={j.retire}
                  aria-label={`Retirer le filtre ${j.libelle}`}
                  className={styles.puce}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,124,60,.45)",
                    background: "var(--accw)",
                    color: "var(--acci)",
                    font: "600 12.5px var(--fb)",
                  }}
                >
                  {j.libelle}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              {!auRepos ? (
                <button
                  type="button"
                  onClick={() => setFiltres(AU_REPOS)}
                  className={styles.puce}
                  style={{
                    border: "none",
                    background: "none",
                    padding: "7px 6px",
                    font: "600 12.5px var(--fb)",
                    color: "var(--ink2)",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Tout effacer
                </button>
              ) : null}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <div
                role="group"
                aria-label="Trier"
                style={{ display: "flex", gap: 2, padding: 3, borderRadius: 12, background: "var(--chip)" }}
              >
                {TRIS.map((t) => (
                  <button
                    key={t.cle}
                    type="button"
                    aria-pressed={tri === t.cle}
                    onClick={() => setTri(t.cle)}
                    className={styles.segment}
                    style={{
                      border: "none",
                      padding: "7px 11px",
                      borderRadius: 9,
                      font: "600 12px var(--fb)",
                      whiteSpace: "nowrap",
                      backgroundColor: tri === t.cle ? "var(--card)" : "transparent",
                      color: tri === t.cle ? "var(--ink)" : "var(--ink2)",
                      boxShadow: tri === t.cle ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
                    }}
                  >
                    {t.libelle}
                  </button>
                ))}
              </div>
              <div
                role="group"
                aria-label="Affichage"
                style={{ display: "flex", gap: 2, padding: 3, borderRadius: 12, background: "var(--chip)" }}
              >
                {VUES.map((v) => (
                  <button
                    key={v.cle}
                    type="button"
                    aria-pressed={vue === v.cle}
                    onClick={() => setVue(v.cle)}
                    className={styles.segment}
                    style={{
                      border: "none",
                      padding: "7px 11px",
                      borderRadius: 9,
                      font: "600 12px var(--fb)",
                      backgroundColor: vue === v.cle ? "var(--card)" : "transparent",
                      color: vue === v.cle ? "var(--ink)" : "var(--ink2)",
                      boxShadow: vue === v.cle ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
                    }}
                  >
                    {v.libelle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p
            style={{
              font: "500 11.5px ui-monospace,Menlo,monospace",
              color: "var(--ink3)",
              margin: "22px 0 12px",
            }}
          >
            {resultats.length} sur {courant.cartes.length}
          </p>

          {resultats.length > 0 ? (
            <div
              className={`${styles.grille} ${vue === "grid" ? styles.grilleCartes : styles.grilleListe}`}
            >
              {resultats.map((carte: Carte, i) => (
                <CarteBibliotheque
                  key={carte.url}
                  carte={carte}
                  vue={vue}
                  place={avecUne && i === 0 ? "une" : avecUne && i < 3 ? "duo" : "rang"}
                />
              ))}
            </div>
          ) : (
            <p
              style={{
                font: "400 15px/1.6 var(--fb)",
                color: "var(--ink2)",
                padding: "28px 0",
                margin: 0,
              }}
            >
              Aucune ressource ne répond à ces filtres. Retirez un critère, ou prenez le sommaire
              complet ci-dessous.
            </p>
          )}

          <SommaireComplet bibliotheque={bibliotheque} />
          <AppelRessourcesMobile espace={espace} />
        </div>
      </div>
    </section>
  );
}
