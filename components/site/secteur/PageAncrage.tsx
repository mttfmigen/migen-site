import Link from "next/link";
import type { ReactNode } from "react";

import {
  ANCRE_FORMULAIRE,
  BOUTON_ACTION,
  LARGEUR,
  SURTITRE,
  TITRE2,
  colonnes,
} from "@/components/site/blocs/habillage";
import Bloc from "@/components/site/blocs/Bloc";
import { BLOCS } from "@/components/site/blocs";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { ContenuSecteur } from "@/types/secteur";

import PucesLiens, { cibleSure, liensSurs } from "./PucesLiens";
import {
  BOUTON_HERO,
  BOUTON_HERO_2,
  CARTE_ENJEU,
  CHAPEAU_HERO,
  HERO,
  PANNEAU_APPEL,
  PANNEAU_HERO,
  PUCE,
  RANGEE_PUCES,
  SURTITRE_HERO,
  TITRE1,
} from "./habillage-secteur";

import styles from "./PageSecteur.module.css";

/**
 * Gabarit D'ANCRAGE, porté de « Migen - Site final.dc.html », lignes 5602 à 5757.
 *
 * CE COMPOSANT N'EST PLUS CELUI DES PAGES DE SECTEUR, et c'est la correction du
 * 03/10. Il était `PageSecteur`. Le fichier qui fait foi pour
 * `/secteurs/<secteur>/` n'est pas « Site final » mais
 * « Migen - Gabarit 08 Secteur.dc.html », versionné dans
 * `maquette/gabarit-08-secteur.html`, et il dessine DOUZE sections là où celui-ci
 * en dessine quatre. Le nouveau porte le nom `PageSecteur`.
 *
 * CE QU'IL SERT ENCORE, et pourquoi il reste : `/implantations/`, par
 * `components/site/implantation/PageDepartement.tsx` qui l'appelle, et
 * `PageVille.tsx` qui partage son habillage. Ces 42 pages ont leurs propres
 * fichiers de maquette qui font foi (« Gabarit 04 Ville », « Gabarit 06
 * Departement ») et leur propre portage à refaire. Les supprimer aujourd'hui
 * casserait un gabarit voisin en cours de correction pour un gain nul sur
 * celui-ci. C'est au portage de ces deux gabarits de le retirer.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les révélations au défilement
 * sont posées en `data-reveal` et animées par `components/site/Moteurs.tsx`.
 */
/* ------------------------------------------------------------------- le gabarit */

export interface ProprietesPageAncrage {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuSecteur;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce gabarit asynchrone à son
   * tour pour deux éléments de chrome, et il ne serait plus montable hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageAncrage({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageAncrage) {
  const reperes = contenu.reperes ?? [];
  const enjeux = contenu.enjeux ?? [];
  const communes = contenu.communes ?? [];
  const actions = liensSurs(contenu.actions ?? []);
  const autres = liensSurs(contenu.autres ?? []);

  const appel = contenu.appelTitre || contenu.appelTexte;
  const boutonAppel = contenu.appelBouton;

  /*
    Le texte du corpus que la maquette ne dessine pas. Lu sur un `jsonb` : une
    section sans bloc est ECARTEE, pas rendue, sinon la page entiere tombe a la
    recherche d'un composant qui n'existe pas. Une page amputee vaut mieux
    qu'une 500 sur une URL referencee, et c'est deja la regle de la route.
  */
  const complement = (contenu.complement ?? []).filter(
    (section) =>
      !!section &&
      typeof section === "object" &&
      typeof section.type === "string" &&
      section.type in BLOCS,
  );

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        {filAriane ? (
          <section
            style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 0" }}
          >
            {filAriane}
          </section>
        ) : null}

        <section style={HERO}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              // Sans repères, le hero tient sur une colonne : la maquette met
              // un panneau en verre à droite, et un panneau vide vaudrait aveu.
              gridTemplateColumns:
                reperes.length > 0 ? "1.1fr .9fr" : "minmax(0,1fr)",
              gap: 52,
              alignItems: "start",
            }}
          >
            <div>
              {contenu.surtitre ? (
                <div style={SURTITRE_HERO}>{contenu.surtitre}</div>
              ) : null}
              <h1 style={TITRE1}>{titre}</h1>
              {contenu.chapeau ? (
                <p style={CHAPEAU_HERO}>
                  <TexteRiche texte={contenu.chapeau} />
                </p>
              ) : null}
              {actions.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 28,
                    flexWrap: "wrap",
                  }}
                >
                  {actions.map((action, i) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      prefetch={false}
                      className={
                        i === 0 ? styles.boutonPrincipal : styles.boutonSecondaire
                      }
                      style={i === 0 ? BOUTON_HERO : BOUTON_HERO_2}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {reperes.length > 0 ? (
              <div style={PANNEAU_HERO}>
                {contenu.reperesSurtitre ? (
                  <div style={SURTITRE_HERO}>{contenu.reperesSurtitre}</div>
                ) : null}
                <div
                  className="mg-rq2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 22,
                  }}
                >
                  {reperes.map((repere) => (
                    <div key={`${repere.valeur}-${repere.libelle}`}>
                      <div
                        style={{
                          font: "600 26px var(--ft)",
                          letterSpacing: "-.045em",
                        }}
                      >
                        {repere.valeur}
                      </div>
                      <div
                        style={{
                          font: "400 12.5px/1.45 var(--fb)",
                          color: "var(--ink4)",
                          marginTop: 4,
                        }}
                      >
                        {repere.libelle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {enjeux.length > 0 ? (
          <section style={{ padding: "var(--sec) 0 0" }}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.enjeuxSurtitre ? (
                  <div style={SURTITRE}>{contenu.enjeuxSurtitre}</div>
                ) : null}
                {contenu.enjeuxTitre ? (
                  <h2
                    style={{
                      ...TITRE2,
                      margin: "0 0 38px",
                      maxWidth: "24ch",
                    }}
                  >
                    {contenu.enjeuxTitre}
                  </h2>
                ) : null}
                <div
                  className="mg-rmulti"
                  style={{
                    // La maquette en pose quatre. Au-delà la grille boucle, en
                    // deçà elle se resserre : pas de colonne vide en bout.
                    ...colonnes(Math.min(enjeux.length, 4)),
                    gap: 16,
                  }}
                >
                  {enjeux.map((enjeu) => (
                    <div key={enjeu.titre} style={CARTE_ENJEU}>
                      <div
                        style={{
                          font: "600 17px var(--ft)",
                          letterSpacing: "-.025em",
                          marginBottom: 8,
                        }}
                      >
                        {enjeu.titre}
                      </div>
                      <p
                        style={{
                          font: "400 14.5px/1.6 var(--fb)",
                          color: "var(--ink2)",
                          margin: 0,
                        }}
                      >
                        <TexteRiche texte={enjeu.texte} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/*
          SOUS LES SECTIONS DE LA MAQUETTE, le texte rédigé que la maquette ne
          dessine pas : ce que nous traitons, le déroulé, nos engagements,
          l'appel de milieu de page, les dernières réalisations, les questions
          fréquentes. Voir `types/secteur.ts`, champ `complement`.

          Rendu par les blocs du gabarit de vente, qui sont les MOTIFS DE
          SECTION DE LA MAQUETTE déjà portés, surtitres compris : la page reste
          celle de la maquette et garde tout son texte. Ils sont importés, pas
          réécrits.

          Placé ici, et non après l'appel final : l'ouverture et la fermeture de
          la page restent celles de la maquette, le corps s'insère entre les
          deux. Du texte après l'appel à l'action se lirait comme une page qui
          reprend après avoir fini.
        */}
        {complement.map((section, i) => (
          // L'index suffit comme clé : l'ordre du tableau EST celui du corpus,
          // il ne se réarrange pas.
          <Bloc key={`${section.type}-${i}`} section={section} />
        ))}

        {/*
          Le territoire et les pages sœurs, dans UN SEUL bloc révélé : c'est ce
          que fait le gabarit département, les communes puis les autres
          départements sans rupture de section entre les deux. Le gabarit
          secteur, qui n'a pas de communes, sort ses pages sœurs plus bas, dans
          sa propre section.
        */}
        {communes.length > 0 ? (
          <>
            <section style={{ padding: "var(--sec) 0 0" }}>
              <div style={LARGEUR}>
                <div data-reveal="">
                  {contenu.communesSurtitre ? (
                    <div style={SURTITRE}>{contenu.communesSurtitre}</div>
                  ) : null}
                  {contenu.communesTitre ? (
                    <h2
                      style={{
                        ...TITRE2,
                        margin: "0 0 32px",
                        maxWidth: "24ch",
                      }}
                    >
                      {contenu.communesTitre}
                    </h2>
                  ) : null}
                  <div
                    style={{
                      ...RANGEE_PUCES,
                      marginBottom: autres.length > 0 ? 44 : 0,
                    }}
                  >
                    {communes.map((commune) => (
                      <span key={commune} style={PUCE}>
                        {commune}
                      </span>
                    ))}
                  </div>
                  {autres.length > 0 ? (
                    <>
                      {contenu.autresSurtitre ? (
                        <div style={SURTITRE}>{contenu.autresSurtitre}</div>
                      ) : null}
                      <PucesLiens liens={autres} />
                    </>
                  ) : null}
                </div>
              </div>
            </section>
            <div style={{ height: "var(--sec)" }} />
          </>
        ) : null}

        {communes.length === 0 && autres.length > 0 ? (
          <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.autresSurtitre ? (
                  <div style={SURTITRE}>{contenu.autresSurtitre}</div>
                ) : null}
                <PucesLiens liens={autres} />
              </div>
            </div>
          </section>
        ) : null}

        {appel ? (
          <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
            <div style={LARGEUR}>
              <div data-reveal="" style={PANNEAU_APPEL}>
                <div>
                  {contenu.appelTitre ? (
                    <h2
                      style={{
                        font: "600 calc(clamp(24px,2.5vw,36px) * var(--ts))/1.1 var(--ft)",
                        letterSpacing: "-.04em",
                        margin: "0 0 12px",
                        maxWidth: "26ch",
                        textWrap: "balance",
                      }}
                    >
                      {contenu.appelTitre}
                    </h2>
                  ) : null}
                  {contenu.appelTexte ? (
                    <p
                      style={{
                        font: "400 16.5px/1.6 var(--fb)",
                        color: "var(--ink2)",
                        margin: 0,
                        maxWidth: "52ch",
                      }}
                    >
                      <TexteRiche texte={contenu.appelTexte} />
                    </p>
                  ) : null}
                </div>
                {boutonAppel?.libelle ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flex: "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      // Sans cible fournie, le bouton vise le formulaire de la
                      // page : c'est la convention du projet, pas une invention.
                      href={
                        boutonAppel.href && cibleSure(boutonAppel.href)
                          ? boutonAppel.href
                          : ANCRE_FORMULAIRE
                      }
                      className={styles.boutonPrincipal}
                      style={{
                        ...BOUTON_ACTION,
                        padding: "16px 28px",
                        font: "600 15.5px var(--fb)",
                      }}
                    >
                      {boutonAppel.libelle}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {maillage}
      </main>
    </div>
  );
}
