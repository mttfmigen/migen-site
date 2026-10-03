import Link from "next/link";
import type { ReactNode } from "react";

import Bloc from "@/components/site/blocs/Bloc";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";
import PucesLiens, { liensSurs } from "@/components/site/secteur/PucesLiens";
import {
  BOUTON_HERO,
  BOUTON_HERO_2,
  CHAPEAU_HERO,
  HERO,
  SURTITRE_HERO,
  TITRE1,
} from "@/components/site/secteur/habillage-secteur";
import type { Paragraphe } from "@/types/contenu";
import type { ContenuVille } from "@/types/implantation";

import {
  ADRESSE_RUE,
  ADRESSE_SUITE,
  CARTE_FAQ,
  COCHE,
  COCHE_MARQUE,
  CONTACT,
  ENTETE_AUTRES,
  FILET,
  GRILLE_REPERES,
  LISTE_COCHES,
  PANNEAU_VILLE,
  PILE_FAQ,
  QUESTION_FAQ,
  REPERE_DETAIL,
  REPERE_LIBELLE,
  REPERE_VALEUR,
  REPONSE_FAQ,
  SURTITRE_AUTRES,
  SURTITRE_COLONNE,
  SURTITRE_PANNEAU,
  TEXTE_COLONNE,
  TEXTE_COLONNE_AVANT_LISTE,
  TITRE_COLONNE,
  TITRE_FAQ,
  VIS_A_VIS,
} from "./habillage-implantation";

import styles from "./PageVille.module.css";

/**
 * Gabarit VILLE, porté du bloc `sc-if value="{{ isVille }}"` de
 * `maquette/accueil-rendu.html`, lignes 3962 à 4076. Il sert les trente-quatre
 * pages de ville de `/implantations/`.
 *
 * LES CINQ SECTIONS DE LA MAQUETTE, dans son ordre :
 *
 *   1. le hero à deux colonnes, et son panneau en verre (ligne 3964) ;
 *   2. le bandeau photo et ses pastilles de communes (ligne 3993) ;
 *   3. le constat et la réponse en vis-à-vis (ligne 4008) ;
 *   4. les questions fréquentes en cartes empilées (ligne 4033) ;
 *   5. les autres villes en pastilles cliquables (ligne 4058).
 *
 * LA SECTION 2 N'EST PAS RENDUE, et c'est voulu : elle demande une photographie
 * et une liste de communes, et le corpus n'en fournit aucune des deux sur
 * aucune des quarante-deux pages de la branche. Une photo de remplissage ou des
 * communes déduites d'un paragraphe seraient de la donnée inventée. Le jour où
 * une source les donne, la section se porte, lignes 3993 à 4005 : bandeau de
 * 400px, rayon 36, dégradé vers le bas, pastilles en verre blanc à 18 %.
 *
 * CE QUE LE CORPUS PORTE EN PLUS passe par `reste`, rendu entre le vis-à-vis et
 * les questions fréquentes, par les blocs DÉJÀ PORTÉS de
 * `components/site/blocs/` : ce sont les motifs de section de la maquette, et
 * ce texte est rédigé, relu et payé. Il ne se perd pas parce que `isVille` ne
 * lui a pas prévu de case.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les révélations au défilement
 * sont posées en `data-reveal` et animées par `components/site/Moteurs.tsx`,
 * monté une fois dans la mise en page racine.
 */

/* ------------------------------------------- les libellés de structure, maquette */

/**
 * Les surtitres de `isVille`, relevés dans la maquette. Ils ne varient pas d'une
 * ville à l'autre : les exposer en données aurait invité à les réécrire page par
 * page. Même convention que `types/implantations.ts` pour « Rayon » et « Rôle ».
 */
const SURTITRE_CONSTAT = "Le constat terrain"; // ligne 4013
const SURTITRE_REPONSE = "Notre réponse"; // ligne 4020
const SURTITRE_FAQ = "Questions fréquentes"; // ligne 4036
const SURTITRE_VILLES = "Autres villes"; // ligne 4063

/* --------------------------------------------------------- la liste du vis-à-vis */

/**
 * Une liste du vis-à-vis, à la géométrie de la maquette (ligne 4023).
 *
 * UN SEUL composant pour les deux colonnes, la marque seule change : la coche
 * orange de la colonne de droite est celle de la maquette, la croix orange de
 * la colonne de gauche est celle de son panneau « Le problème ». Les écrire
 * deux fois aurait donné deux géométries à la première retouche.
 *
 * L'accroche sort en gras d'attaque, comme partout où le corpus en écrit une :
 * c'est ce que font `blocs/Paragraphes.tsx` et `blocs/Probleme.tsx`. La tronquer
 * à l'accroche seule aurait jeté le texte que le client a payé.
 */
function Liste({
  puces,
  marque,
}: {
  puces: readonly Paragraphe[];
  marque: "✓" | "×";
}) {
  return (
    <div style={LISTE_COCHES}>
      {puces.map((puce) => (
        <div key={puce.texte} style={COCHE}>
          {/* La marque est décorative : le lecteur d'écran lit la ligne, pas le
              signe, et « ✓ » ou « × » n'y ajoute aucun sens. */}
          <span aria-hidden="true" style={COCHE_MARQUE}>
            {marque}
          </span>
          <span>
            {puce.accroche ? (
              <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                <TexteRiche texte={puce.accroche} />{" "}
              </strong>
            ) : null}
            <TexteRiche texte={puce.texte} />
          </span>
        </div>
      ))}
    </div>
  );
}

export interface ProprietesPageVille {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuVille;
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

export default function PageVille({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageVille) {
  const actions = liensSurs(contenu.actions ?? []);
  const adresse = contenu.adresse ?? [];
  const reperes = contenu.reperes ?? [];
  const croix = contenu.constatPuces ?? [];
  const coches = contenu.reponsePuces ?? [];
  const faq = contenu.faq ?? [];
  const autres = liensSurs(contenu.autres ?? []);
  const reste = contenu.reste ?? [];

  /* Le panneau du hero n'existe que s'il a quelque chose à dire. Vide, la
     maquette laisserait une carte en verre creuse à côté du titre, ce qui est
     un aveu : le hero passe alors sur une seule colonne. */
  const panneau =
    adresse.length > 0 || reperes.length > 0 || !!contenu.contact;

  const constat =
    !!contenu.constatTitre || !!contenu.constatTexte || croix.length > 0;
  const reponse =
    !!contenu.reponseTitre || !!contenu.reponseTexte || coches.length > 0;

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

        {/* 1. Le hero, ligne 3964. */}
        <section style={HERO}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: panneau ? "1.1fr .9fr" : "minmax(0,1fr)",
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
                        i === 0
                          ? styles.boutonPrincipal
                          : styles.boutonSecondaire
                      }
                      style={i === 0 ? BOUTON_HERO : BOUTON_HERO_2}
                    >
                      {action.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {panneau ? (
              <div style={PANNEAU_VILLE}>
                {contenu.panneauSurtitre ? (
                  <div style={SURTITRE_PANNEAU}>{contenu.panneauSurtitre}</div>
                ) : null}

                {adresse.map((ligne, i) => (
                  <div key={ligne} style={i === 0 ? ADRESSE_RUE : ADRESSE_SUITE}>
                    {ligne}
                  </div>
                ))}

                {/* Le filet ne se pose qu'entre deux choses, jamais en tête ni
                    en pied de carte : la maquette le met sous l'adresse. */}
                {adresse.length > 0 && reperes.length > 0 ? (
                  <div style={FILET} />
                ) : null}

                {reperes.length > 0 ? (
                  <div className="mg-r2" style={GRILLE_REPERES}>
                    {reperes.map((repere) => (
                      <div key={`${repere.valeur}-${repere.libelle}`}>
                        <div style={REPERE_VALEUR}>{repere.valeur}</div>
                        <div style={REPERE_LIBELLE}>{repere.libelle}</div>
                        {/* La précision du corpus, quand il en écrit une : elle
                            dit souvent qu'il n'y a PAS d'agence sur place, et
                            c'est ce qui empêche le chiffre de mentir. */}
                        {repere.detail ? (
                          <div style={REPERE_DETAIL}>
                            <TexteRiche texte={repere.detail} />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {contenu.contact ? (
                  <>
                    {adresse.length > 0 || reperes.length > 0 ? (
                      <div style={FILET} />
                    ) : null}
                    <div style={CONTACT}>
                      <TexteRiche texte={contenu.contact} />
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/*
          2. Le bandeau photo, lignes 3993 à 4005 : NON RENDU, faute de
          photographie et de liste de communes dans le corpus. Voir l'en-tête de
          ce fichier. Rien n'est posé ici, pas même un cadre vide.
        */}

        {/* 3. Le constat et la réponse en vis-à-vis, ligne 4008. */}
        {constat || reponse ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div
                data-reveal=""
                className="mg-r2"
                style={{
                  ...VIS_A_VIS,
                  // Une seule colonne remplie : elle prend la largeur, au lieu
                  // de laisser un vide de 70px et une demi-page blanche.
                  gridTemplateColumns:
                    constat && reponse ? "1fr 1fr" : "minmax(0,1fr)",
                }}
              >
                {constat ? (
                  <div>
                    <div style={SURTITRE_COLONNE}>{SURTITRE_CONSTAT}</div>
                    {contenu.constatTitre ? (
                      <h2 style={TITRE_COLONNE}>{contenu.constatTitre}</h2>
                    ) : null}
                    {contenu.constatTexte ? (
                      <p
                        style={
                          croix.length > 0
                            ? TEXTE_COLONNE_AVANT_LISTE
                            : TEXTE_COLONNE
                        }
                      >
                        <TexteRiche texte={contenu.constatTexte} />
                      </p>
                    ) : null}
                    {croix.length > 0 ? (
                      <Liste puces={croix} marque="×" />
                    ) : null}
                  </div>
                ) : null}

                {reponse ? (
                  <div>
                    <div style={SURTITRE_COLONNE}>{SURTITRE_REPONSE}</div>
                    {contenu.reponseTitre ? (
                      <h2 style={TITRE_COLONNE}>{contenu.reponseTitre}</h2>
                    ) : null}
                    {contenu.reponseTexte ? (
                      <p
                        style={
                          coches.length > 0
                            ? TEXTE_COLONNE_AVANT_LISTE
                            : TEXTE_COLONNE
                        }
                      >
                        <TexteRiche texte={contenu.reponseTexte} />
                      </p>
                    ) : null}
                    {coches.length > 0 ? (
                      <Liste puces={coches} marque="✓" />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/*
          Ce que le corpus porte et que `isVille` ne montre pas : les puces du
          problème, le duo prestation/bénéfice, le déroulé, les engagements, les
          appels et les réalisations. Rendus par les blocs déjà portés, qui sont
          les motifs de section de la maquette, et dans l'ordre du corpus.

          L'index suffit comme clé : l'ordre du tableau EST le gabarit, il ne se
          réarrange pas, et deux sections de même type ne se distinguent par
          rien d'autre.
        */}
        {reste.map((section, i) => (
          <Bloc key={`${section.type}-${i}`} section={section} />
        ))}

        {/* 4. Les questions fréquentes, ligne 4033. */}
        {faq.length > 0 ? (
          <section style={SECTION}>
            <div style={LARGEUR}>
              <div data-reveal="">
                <div style={SURTITRE_COLONNE}>{SURTITRE_FAQ}</div>
                {contenu.faqTitre ? (
                  <h2 style={TITRE_FAQ}>{contenu.faqTitre}</h2>
                ) : null}
                <div style={PILE_FAQ}>
                  {faq.map((entree) => (
                    <div key={entree.question} style={CARTE_FAQ}>
                      {/* Pas un titre de niveau : la maquette pose un simple
                          `div`, et une page ne doit pas voir son plan de titres
                          gonflé de six entrées par les questions fréquentes. */}
                      <div style={QUESTION_FAQ}>
                        <TexteRiche texte={entree.question} />
                      </div>
                      <p style={REPONSE_FAQ}>
                        <TexteRiche texte={entree.reponse} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* 5. Les autres villes, ligne 4058. */}
        {autres.length > 0 ? (
          <section style={{ padding: "var(--sec) 0 var(--sec)" }}>
            <div style={LARGEUR}>
              <div data-reveal="">
                <div style={ENTETE_AUTRES}>
                  <div style={SURTITRE_AUTRES}>{SURTITRE_VILLES}</div>
                </div>
                <PucesLiens liens={autres} />
              </div>
            </div>
          </section>
        ) : null}

        {maillage}
      </main>
    </div>
  );
}
