import type { ReactNode } from "react";

import FormulaireBasDePage from "@/components/site/accueil/FormulaireBasDePage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  LARGEUR,
  SECTION,
  SURTITRE,
  colonnes,
} from "@/components/site/blocs/habillage";
import type { ContenuImplantations } from "@/types/implantations";

import BlocInternational from "./BlocInternational";
import CarteAgence from "./CarteAgence";
import { CarteChiffre, CarteLiens } from "./Cartes";
import { TITRE_SECTION, VERRE_IMPL } from "./habillage";
import styles from "./PageImplantations.module.css";

/**
 * Gabarit des pages d'implantations, porté de la maquette Claude Design
 * (« Migen - Site final.dc.html », lignes 6932 à 7077).
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les apparitions au défilement
 * sont posées par l'attribut `data-reveal`, que `components/site/Moteurs.tsx`
 * anime déjà pour tout le site. Rien n'est masqué en CSS : sans JavaScript, la
 * page s'affiche entière.
 *
 * LA CARTE DE FRANCE DU HÉROS N'EST PAS PORTÉE. La maquette la dessine avec d3
 * et topojson (`<x-import component="MigenAgences">`, 460 px de haut) et le
 * contrat de portage interdit d'ajouter une bibliothèque. La zone est RÉSERVÉE
 * et vide, jamais remplie par un visuel de substitution.
 *
 * CHAQUE SECTION EST CONDITIONNELLE. Les 42 pages filles de `/implantations/`
 * ne portent pas les mêmes blocs que la page mère : une page de ville n'a ni
 * panneau international ni carte de siège. Une section dont le contenu
 * n'arrive pas ne se rend pas, et rien n'est remplacé par un texte de repli.
 */

/** Hauteur de la zone de carte, reprise du `hint-size` de la maquette. */
const HAUTEUR_CARTE = 460;

export interface ProprietesPageImplantations {
  titre: string;
  contenu: ContenuImplantations;
  /** Identifiant d'analyse de la soumission du formulaire de bas de page. */
  formulaire?: string;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page : ce sont des
   * composants serveur ASYNCHRONES qui interrogent la base, et les appeler ici
   * rendrait ce gabarit asynchrone pour deux éléments de chrome.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageImplantations({
  titre,
  contenu,
  formulaire,
  filAriane,
  maillage,
}: ProprietesPageImplantations) {
  const { chapeau, chiffres = [], agences = [], international } = contenu;
  const villes = contenu.couverture?.villes ?? [];
  const departements = contenu.couverture?.departements ?? [];

  // Le panneau international se rend dès qu'il porte quelque chose : sur une
  // page de ville, le corpus ne le fournit pas du tout.
  const aInternational =
    !!international &&
    (!!international.titre ||
      !!international.texte ||
      !!international.image ||
      (international.bureaux ?? []).length > 0);

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane ? (
          <section style={{ ...LARGEUR, padding: "24px 40px 0" }}>
            {filAriane}
          </section>
        ) : null}

        {/* ------------------------------------------------------------ héros */}
        <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr .95fr",
              gap: 52,
              alignItems: "center",
            }}
          >
            <div>
              <div style={SURTITRE}>Nos implantations</div>
              <h1
                style={{
                  font: "600 calc(clamp(36px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
                  letterSpacing: "-.045em",
                  margin: 0,
                  maxWidth: "17ch",
                  textWrap: "balance",
                }}
              >
                {titre}
              </h1>
              {chapeau ? (
                <p
                  style={{
                    font: "400 18.5px/1.6 var(--fb)",
                    color: "var(--ink2)",
                    margin: "24px 0 0",
                    maxWidth: "50ch",
                  }}
                >
                  <TexteRiche texte={chapeau} />
                </p>
              ) : null}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 28,
                  flexWrap: "wrap",
                }}
              >
                <a
                  href={ANCRE_FORMULAIRE}
                  className={styles.boutonAction}
                  style={BOUTON_ACTION}
                >
                  Trouver mon agence
                </a>
                {/* L'ancre n'existe que si la section existe : un bouton qui
                    ne mène nulle part ne se rend pas. */}
                {agences.length > 0 ? (
                  <a
                    href="#agences"
                    className={styles.boutonSecondaire}
                    style={BOUTON_SECONDAIRE}
                  >
                    L’agence la plus proche
                  </a>
                ) : null}
              </div>
            </div>

            {/* Zone de la carte de France : réservée, vide, voir l'en-tête. */}
            <div style={{ ...VERRE_IMPL, padding: 22 }}>
              <div aria-hidden="true" style={{ height: HAUTEUR_CARTE }} />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- chiffres */}
        {chiffres.length > 0 ? (
          <section style={{ padding: "56px 0 0" }}>
            <div style={LARGEUR}>
              <div data-reveal="" className="mg-rmulti" style={{ ...colonnes(4), gap: 14 }}>
                {chiffres.map((chiffre, i) => (
                  <CarteChiffre
                    key={`${i}-${chiffre.libelle}`}
                    chiffre={chiffre}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------- agences */}
        {agences.length > 0 ? (
          // `scroll-margin-top` : l'îlot de navigation recouvrirait le titre
          // de la section quand on arrive par l'ancre du héros.
          <section id="agences" style={{ ...SECTION, scrollMarginTop: 110 }}>
            <div style={LARGEUR}>
              <div data-reveal="">
                <div style={SURTITRE}>Nos quatre agences</div>
                {contenu.titreAgences ? (
                  <h2 style={TITRE_SECTION}>{contenu.titreAgences}</h2>
                ) : null}
                <div className="mg-rmulti" style={{ ...colonnes(3), gap: 16 }}>
                  {agences.map((agence, i) => (
                    <CarteAgence key={`${i}-${agence.nom}`} agence={agence} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------- international */}
        {aInternational && international ? (
          <BlocInternational panneau={international} />
        ) : null}

        {/* ------------------------------------------------------- couverture */}
        {villes.length > 0 || departements.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div data-reveal="">
                <div style={SURTITRE}>Où nous intervenons</div>
                {contenu.couverture?.titre ? (
                  <h2 style={TITRE_SECTION}>{contenu.couverture.titre}</h2>
                ) : null}
                <div className="mg-r2" style={{ ...colonnes(2), gap: 16 }}>
                  {villes.length > 0 ? (
                    <CarteLiens libelle="Villes" liens={villes} />
                  ) : null}
                  {departements.length > 0 ? (
                    <CarteLiens libelle="Départements" liens={departements} />
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {maillage ? (
          <section style={{ ...LARGEUR, padding: "var(--sec) 40px 0" }}>
            {maillage}
          </section>
        ) : null}

        {/* Le formulaire ferme la page, comme dans la maquette. C'est la cible
            de `ANCRE_FORMULAIRE`, visée par le bouton principal du héros. */}
        <FormulaireBasDePage formulaire={formulaire} />
      </main>
    </div>
  );
}
