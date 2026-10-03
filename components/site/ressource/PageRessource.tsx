import Link from "next/link";
import type { ReactNode } from "react";

import Objections from "@/components/site/blocs/Objections";
import TexteRiche, { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import { ANCRE_FORMULAIRE } from "@/components/site/blocs/habillage";
import type { CarteRessource, ContenuRessource } from "@/types/ressource";

import CorpsRessource from "./CorpsRessource";
import styles from "./Ressource.module.css";
import {
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  CHAPEAU,
  COLONNE_COLLANTE,
  FIN,
  GRILLE_LECTURE,
  HAUT_DE_PAGE,
  LARGEUR_LECTURE,
  LAVIS,
  PASTILLE,
  PUCE,
  SECTION_CORPS,
  SECTION_ENTETE,
  SURTITRE,
  SURTITRE_FIN,
  SURTITRE_GRIS,
  SURTITRE_LAVIS,
  TEXTE_FIN,
  TITRE1,
  TITRE_FIN,
  VERRE,
} from "./habillage";

/**
 * Le gabarit RESSOURCE de la maquette, lignes 6502 à 6800 de
 * `maquette/accueil-rendu.html`. Il sert les 35 pages feuilles de
 * `/ressources/` : articles, fiches pratiques, fiches techniques, livres
 * blancs, process.
 *
 * LES SEPT SECTIONS DE LA MAQUETTE, et où elles sont rendues :
 *
 *   1. l'en-tête de document (6504) : ici, pastille de format, H1, chapeau ;
 *   2. la variante ARTICLE (6525) : ici, la grille colonne de lecture plus
 *      colonne collante, et les cartes de `contenu.cartes` ;
 *   3. la variante MÉTIER (6556) : hors de ce gabarit, voir plus bas ;
 *   4. la variante PRATIQUE (6631) : dans `CorpsRessource`, motif de la carte
 *      numérotée, appliqué aux listes ordonnées du corpus ;
 *   5. la variante PROCESS (6671) : son bandeau en lavis orange est ici, sous
 *      l'en-tête, et porte la phrase de rappel du corpus ;
 *   6. la variante TECHNIQUE (6724) : dans `CorpsRessource`, motif du barème,
 *      appliqué aux tableaux du corpus ;
 *   7. l'appel de fin (6780) : ici, à l'identique.
 *
 * La maquette n'en montre qu'une variante à la fois, choisie par le format de
 * la fiche. Ici le motif est choisi par le TYPE DE BLOC, en place : les 35
 * pages portent toutes une liste ordonnée ET un tableau, et les plier à une
 * variante unique aurait jeté l'une des deux, c'est-à-dire du texte que le
 * client a écrit et payé.
 *
 * LA VARIANTE MÉTIER N'EST PAS PORTÉE ICI, pour deux raisons. Elle décrit un
 * poste, et les pages de métier vivent sous `/carriere/`, déjà servies par
 * `components/site/metier/`. Et son panneau de rémunération (ligne 6586) est
 * une grille de montants, que le contrat de portage refuse.
 *
 * Composant SERVEUR. Aucun état, aucun JavaScript : la page part en HTML
 * complet, filets et cartes compris.
 */

/** Une carte de la colonne collante, dans l'un de ses quatre motifs. */
function Carte({ carte }: { carte: CarteRessource }) {
  const surtitre = carte.accent
    ? SURTITRE_LAVIS
    : carte.lienHref || carte.points
      ? SURTITRE
      : SURTITRE_GRIS;

  const dedans = (
    <>
      <div style={{ ...surtitre, marginBottom: carte.points ? 14 : 10 }}>
        {carte.surtitre}
      </div>
      {carte.titre ? (
        <div
          style={{
            font: "600 15.5px/1.35 var(--ft)",
            letterSpacing: "-.022em",
            marginBottom: 8,
          }}
        >
          <TexteRiche texte={carte.titre} />
        </div>
      ) : null}
      {carte.texte ? (
        <p style={{ font: "400 14px/1.6 var(--fb)", color: "var(--ink1)", margin: 0 }}>
          <TexteRiche texte={carte.texte} />
        </p>
      ) : null}
      {carte.points ? (
        <div style={{ display: "grid", gap: 10 }}>
          {carte.points.map((point, i) => (
            <div
              key={`${i}-${point.slice(0, 20)}`}
              style={{
                display: "flex",
                gap: 10,
                font: "400 14px/1.55 var(--fb)",
                color: "var(--ink1)",
              }}
            >
              <span aria-hidden="true" style={{ color: "var(--acc)", flex: "none" }}>
                {PUCE}
              </span>
              <span>
                <TexteRiche texte={point} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {carte.lienLibelle ? (
        <span
          style={{
            display: "block",
            marginTop: 8,
            font: "600 13px var(--fb)",
            color: "var(--acc)",
          }}
        >
          {carte.lienLibelle}
        </span>
      ) : null}
    </>
  );

  const habillage = carte.accent
    ? { ...LAVIS, padding: "24px 26px" }
    : { ...VERRE, padding: "26px 28px" };

  // Un lien EXTERNE n'est pas rendu en lien : la carte reste une carte. Même
  // règle que `TexteRiche`, et pour la même raison, un contenu éditorial n'a
  // pas à pouvoir expédier le visiteur ailleurs sous l'autorité du domaine.
  if (carte.lienHref && estCheminInterne(carte.lienHref)) {
    return (
      <Link href={carte.lienHref} className={styles.carteLien} style={habillage}>
        {dedans}
      </Link>
    );
  }
  return <div style={habillage}>{dedans}</div>;
}

export interface ProprietesPageRessource {
  titre: string;
  contenu: ContenuRessource;
  /**
   * Fil d'Ariane et maillage interne, fournis par la route.
   *
   * POURQUOI EN PROPS : ce sont des composants SERVEUR ASYNCHRONES, qui
   * interrogent la base. Les appeler ici rendrait ce fichier asynchrone à son
   * tour pour deux éléments de chrome, et il ne serait plus montable depuis un
   * contrôle hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageRessource({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageRessource) {
  const { cartes, corps, questions } = contenu;
  const avecCartes = !!cartes && cartes.length > 0;
  const avecCorps = !!corps && corps.length > 0;

  return (
    <div className="mg-site">
      <main style={{ paddingTop: HAUT_DE_PAGE }}>
        {filAriane ? (
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 0" }}>
            {filAriane}
          </section>
        ) : null}

        {/* 1. L'en-tête de document. */}
        <section style={SECTION_ENTETE}>
          <div style={{ maxWidth: LARGEUR_LECTURE }}>
            {contenu.categorie ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                  flexWrap: "wrap",
                }}
              >
                <span style={PASTILLE}>{contenu.categorie}</span>
              </div>
            ) : null}
            <h1 style={TITRE1}>{titre}</h1>
            {contenu.chapeau ? (
              <p style={CHAPEAU}>
                <TexteRiche texte={contenu.chapeau} />
              </p>
            ) : null}
          </div>
        </section>

        {/* 5. Le bandeau en lavis de la variante process, qui porte le rappel. */}
        {contenu.rappel ? (
          <section style={SECTION_CORPS}>
            <div
              style={{
                ...LAVIS,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 24px",
                flexWrap: "wrap",
                maxWidth: LARGEUR_LECTURE,
              }}
            >
              <span
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "var(--ink1)",
                  flex: 1,
                  minWidth: 240,
                }}
              >
                <TexteRiche texte={contenu.rappel} />
              </span>
            </div>
          </section>
        ) : null}

        {/* 2, 4 et 6. La colonne de lecture, ses cartes de procédure et ses
            barèmes, et la colonne collante. */}
        {avecCorps || avecCartes ? (
          <section style={SECTION_CORPS}>
            <div
              className="mg-r2"
              style={
                avecCartes
                  ? GRILLE_LECTURE
                  : { ...GRILLE_LECTURE, gridTemplateColumns: `minmax(0,${LARGEUR_LECTURE}px)` }
              }
            >
              {avecCorps ? <CorpsRessource blocs={corps} /> : <div />}
              {avecCartes ? (
                <aside style={COLONNE_COLLANTE}>
                  {cartes.map((carte, i) => (
                    <Carte key={`${i}-${carte.surtitre}`} carte={carte} />
                  ))}
                </aside>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* La foire aux questions, par le bloc déjà porté du gabarit de vente. */}
        {questions && questions.length > 0 ? (
          <Objections section={{ type: "objections", questions }} />
        ) : null}

        {/* 7. L'appel de fin. */}
        <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
            <div
              data-reveal=""
              style={{
                ...VERRE,
                borderRadius: 36,
                padding: "44px 48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 40,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={SURTITRE_FIN}>{FIN.surtitre}</div>
                <h2 style={TITRE_FIN}>{FIN.titre}</h2>
                <p style={TEXTE_FIN}>{FIN.texte}</p>
              </div>
              <div style={{ display: "flex", gap: 10, flex: "none", flexWrap: "wrap" }}>
                <a
                  href={ANCRE_FORMULAIRE}
                  className={styles.boutonAction}
                  style={BOUTON_ACTION}
                >
                  {FIN.boutonPrincipal}
                </a>
                <Link
                  href={FIN.lienSecondaire}
                  className={styles.boutonSecondaire}
                  style={BOUTON_SECONDAIRE}
                >
                  {FIN.boutonSecondaire}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {maillage}
      </main>
    </div>
  );
}
