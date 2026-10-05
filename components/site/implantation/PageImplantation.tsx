import Link from "next/link";
import type { ReactNode } from "react";

import Bloc from "@/components/site/blocs/Bloc";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SECTION, lienTelephone } from "@/components/site/blocs/habillage";
import { liensSurs } from "@/components/site/secteur/PucesLiens";
import type { ContenuImplantation } from "@/types/implantation";

import {
  APPEL_QUESTION,
  APPEL_RAPPEL,
  ATTESTATIONS,
  BANDEAU_APPEL,
  BANDEAU_SELECTION,
  BANDE_LOGOS,
  BENEFICE,
  BENEFICE_FLECHE,
  BENEFICE_TEXTE,
  BLOC_DELAI,
  BOUTON_BLANC,
  BOUTON_FINAL,
  BOUTON_ORANGE,
  BOUTON_TELEPHONE,
  BOUTON_TELEPHONE_PETIT,
  CARTE_ANNEAU,
  CARTE_ACCROCHE,
  CARTE_EQUIPE,
  CARTE_LIEN,
  CARTE_PREUVE,
  CARTE_PROBLEME,
  CARTE_QUESTION,
  CARTE_REASSURANCE,
  CARTE_TEXTE,
  CERTIFICATION,
  CERTIFICATION_NOM,
  CERTIFICATION_NOTE,
  CHAPEAU_HERO,
  COLONNE_FIXE,
  DELAI_POINT,
  DELAI_TEXTE,
  DUO_NOTE,
  DUO_REPERES,
  DUO_TITRE,
  ENTETE_LOGOS,
  ETAPE,
  ETAPE_CORPS,
  ETAPE_NUMERO,
  ETAPE_TEXTE,
  ETAPE_TITRE,
  FILET_LOGOS,
  FIL_ARIANE,
  FRISE,
  FRISE_FILET,
  GARANTIE,
  GARANTIE_TEXTE,
  GARANTIE_TITRE,
  GRILLE_CERTIFICATIONS,
  GRILLE_DEROULE,
  GRILLE_GARANTIES,
  GRILLE_MAILLAGE,
  GRILLE_PREUVES,
  GRILLE_QUESTIONS,
  GRILLE_REASSURANCE,
  HERO,
  HUB,
  HUBS_RANGEE,
  HUBS_TITRE,
  LIEN_CHEMIN,
  LIEN_CONTEXTE,
  LIEN_CORPS,
  LIEN_ENTETE,
  LIEN_FLECHE,
  LIEN_TITRE,
  LUEUR_FINALE,
  LUEUR_GARANTIES,
  NOM_CLIENT,
  NOTE,
  NOTES,
  PANNEAU_CORPS,
  PANNEAU_FINAL,
  PANNEAU_HERO,
  PANNEAU_SOMBRE,
  PASTILLE_POINT,
  PASTILLE_RUBRIQUE,
  PILE_CARTES,
  PILE_REPERES,
  PISTE_LOGOS,
  PRESTATION,
  PRESTATION_ACCROCHE,
  PREUVE_CLIENT,
  PREUVE_CORPS,
  PREUVE_LIBELLE,
  PREUVE_TEXTE,
  PREUVE_TITRE,
  QUESTION,
  QUESTIONS_INTRO,
  RANGEE_BOUTONS,
  RANGEE_NUMERO,
  REPERE,
  REPERE_DETAIL,
  REPERE_LIBELLE,
  REPERE_VALEUR,
  REPONSE,
  SECTION_HAUTE,
  SECTION_PANNEAU,
  SECTION_PANNEAU_FINAL,
  SELECTION_CHIFFRE,
  SELECTION_TEXTE,
  SURTITRE_LOGOS,
  SURTITRE_PANNEAU,
  SURTITRE_REASSURANCE,
  SURTITRE_SECTION,
  TABLEAU,
  TABLEAU_ENTETE,
  TABLEAU_ENTETE_DROITE,
  TABLEAU_ENTETE_GAUCHE,
  TABLEAU_RANGEE,
  TEXTE_FINAL,
  TEXTE_PROBLEME,
  TITRE1,
  TITRE_DEROULE,
  TITRE_FINAL,
  TITRE_GARANTIES,
  TITRE_OFFRE,
  TITRE_PROBLEME,
  TITRE_QUESTIONS,
  VIS_A_VIS_PROBLEME,
} from "./habillage-implantation";

import styles from "./PageImplantation.module.css";

/**
 * Gabarit IMPLANTATION, porté de « Migen - Gabarit 04 Ville.dc.html » pour les
 * villes et de « Migen - Gabarit 06 Departement.dc.html » pour les
 * départements. Il sert les 42 pages filles de `/implantations/`.
 *
 * UN SEUL COMPOSANT POUR LES DEUX FICHIERS, parce que les deux fichiers sont le
 * même : même en-tête, mêmes douze sections dans le même ordre, même markup au
 * caractère près, même parseur. Ils ne diffèrent que par leur commentaire
 * d'entête, leur `data-screen-label` de `<main>` et le jeu d'exemples que leur
 * logique charge. Les deux s'annoncent « dérivé du gabarit 03, mêmes blocs,
 * même parseur ». Écrire deux composants aurait donné deux géométries à la
 * première retouche.
 *
 * LES DOUZE SECTIONS, dans l'ordre du fichier, par leur sur-titre :
 *
 *    1. 01 Héros ............. pastille « Implantations », pas de sur-titre
 *    2. 02 Photo et logos .... « Ils nous font confiance »
 *    3. 03 Problème .......... « Votre problématique »
 *    4. 04 Offre ............. « L'offre »
 *    5. 05 Déroulé ........... « Le déroulé »
 *    6. 06 Garanties ......... « Notre parti pris »
 *    7. Réassurance .......... « Certifications », « Qui intervient chez vous »
 *    8. 07 Appel ............. pas de sur-titre
 *    9. 08 Références ........ « Nos réalisations »
 *   10. 09 Questions ......... « Questions fréquentes »
 *   11. Maillage ............ « Pour aller plus loin »
 *   12. 10 Appel final ...... « Votre besoin »
 *
 * CE QUI NE SE REND PAS, ET POURQUOI :
 *
 *   · LES PHOTOGRAPHIES. La maquette en pose quatre (panneau du héros 250px,
 *     bandeau 420px, colonne du déroulé 380px, vignettes des références et du
 *     maillage). Le corpus n'en fournit AUCUNE sur AUCUNE des 42 pages. Une
 *     image de remplissage serait de la donnée inventée. Le jour où une source
 *     les donne, les hauteurs et les filtres sont dans le fichier de maquette,
 *     lignes 68, 77, 135, 201 et 240.
 *   · LA SURIMPRESSION DU BANDEAU (l. 80) part avec sa photo. Elle répète
 *     `punchTitle`, qui est déjà le H2 de la section 03 : la rendre ailleurs
 *     aurait fait deux fois la même phrase sur la page.
 *   · LE FORMULAIRE de la section 10 (l. 266 à 283). La route monte déjà
 *     `FormulaireBasDePage`, le formulaire porté du site, juste sous ce
 *     gabarit : le dessiner ici en aurait mis DEUX sur la page. Le panneau
 *     final garde donc sa colonne de gauche, sur toute sa largeur, et le
 *     formulaire suit immédiatement. C'est la même décision que `PageSecteur`
 *     prend pour un héros sans panneau.
 *
 * LA RÉASSURANCE EST ÉCRITE PAR LA MAQUETTE, pas par le corpus : MASE,
 * EcoVadis, la sélection, l'astreinte, les quatre agences et les dix hubs sont
 * les mêmes sur les 42 pages. Elle vit donc dans ce composant, à une
 * correction près, signalée sur place : la maquette écrit « Lyon (siège) » là
 * où le siège est à Limonest, et les interdits du contrat l'emportent sur la
 * maquette.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les révélations au défilement
 * sont posées en `data-reveal` et animées par `components/site/Moteurs.tsx`,
 * monté une fois dans la mise en page racine. La bande de logos défile en CSS
 * seul (`@keyframes mgMarquee`, `.mg-marquee` dans `app/globals.css`).
 */

/* ------------------------------------------ les libellés de structure, maquette */

/** l. 58. La pastille au-dessus du H1, identique sur les 42 pages. */
const PASTILLE_TEXTE = "Implantations";

/** l. 70 */
const SURTITRE_EN_BREF = "En bref";

/** l. 82 */
const SURTITRE_LOGOS_TEXTE = "Ils nous font confiance";

/** l. 92 */
const SURTITRE_PROBLEME = "Votre problématique";

/** l. 109 */
const SURTITRE_OFFRE = "L’offre";

/** l. 110 */
const TITRE_OFFRE_TEXTE = "Ce que nous faisons, et ce que ça change pour vous";

/** l. 112. Les deux colonnes du tableau. */
const COLONNE_PRESTATION = "Ce que nous faisons";
const COLONNE_BENEFICE = "Ce que ça change pour vous";

/** l. 133 */
const SURTITRE_DEROULE = "Le déroulé";

/** l. 134 */
const TITRE_DEROULE_TEXTE = "Comment ça se passe, étape par étape";

/** l. 154 */
const SURTITRE_GARANTIES = "Notre parti pris";

/** l. 155 */
const TITRE_GARANTIES_TEXTE = "Ce que nous garantissons";

/** l. 167 */
const SURTITRE_CERTIFICATIONS = "Certifications";

/** l. 169 et 170. Les deux démarches, avec ce que chacune couvre. */
const CERTIFICATIONS = [
  { nom: "MASE", note: "Démarche sécurité des interventions" },
  { nom: "EcoVadis", note: "Évaluation de la performance RSE" },
] as const;

/** l. 172 */
const PHRASE_ATTESTATIONS =
  "Les attestations sont transmises avec chaque plan de prévention.";

/** l. 175 */
const SURTITRE_EQUIPE = "Qui intervient chez vous";

/** l. 176 */
const SELECTION_VALEUR = "10 %";
const SELECTION_PHRASE =
  "des candidats retenus. Des techniciens salariés de Migen, évalués sur la technique et le comportement.";

/**
 * l. 178 et 179. Les deux repères du bas de la carte.
 *
 * LA SECONDE LIGNE S'ÉCARTE DE LA MAQUETTE, qui écrit « Lyon (siège) ». Le
 * siège est à Limonest, et le contrat impose de le dire : quatre agences,
 * Lyon siège à Limonest, Montréal, Dubaï, Madrid. Un interdit de copie
 * l'emporte sur la maquette, toujours.
 */
const REPERES_EQUIPE = [
  { titre: "Astreinte", note: "nuit, week-end et jours fériés" },
  {
    titre: "4 agences",
    note: "Lyon (siège, à Limonest), Montréal, Dubaï, Madrid",
  },
] as const;

/** l. 181 */
const HUBS_TITRE_TEXTE = "10 hubs de techniciens";
const HUBS = [
  "Paris",
  "Lille",
  "Marseille",
  "Toulouse",
  "Lyon",
  "Metz",
  "Strasbourg",
  "Bordeaux",
  "Dijon",
  "Nantes",
] as const;

/** l. 196 et 197 */
const SURTITRE_PREUVES = "Nos réalisations";
const TITRE_PREUVES_TEXTE = "Nos références";

/** l. 215, 216 et 217 */
const SURTITRE_QUESTIONS = "Questions fréquentes";
const TITRE_QUESTIONS_TEXTE = "Vos questions avant de nous appeler";
const INTRO_QUESTIONS = "Une autre question ? Un technicien vous répond.";

/** l. 236 */
const SURTITRE_MAILLAGE = "Pour aller plus loin";

/** l. 257 */
const SURTITRE_FINAL = "Votre besoin";

/** l. 120, 206 et 242. La flèche de la maquette, `&rarr;`. */
const FLECHE = "→";

/* ----------------------------------------------------------------- les outils */

/**
 * Le nom du client, tiré du libellé de lien de la preuve.
 *
 * C'est le calcul de la maquette, l. 371 : le libellé « Étude de cas JOINT
 * LYONNAIS : défaillances machines » donne « JOINT LYONNAIS ». Rien n'est
 * inventé, et un libellé qui ne suit pas ce motif ne produit pas de nom.
 */
export function nomClient(lienLibelle: string | undefined): string {
  if (!lienLibelle) return "";
  return lienLibelle.replace(/^Étude de cas\s*/, "").split(" : ")[0].trim();
}

/** Un sur-titre de section, orange, en capitales. */
function SurTitre({ children }: { children: ReactNode }) {
  return <div style={SURTITRE_SECTION}>{children}</div>;
}

/* ------------------------------------------------------------- le composant */

export interface ProprietesPageImplantation {
  /** Le H1, et le seul de la page. Vient de `pages.titre_h1`. */
  titre: string;
  contenu: ContenuImplantation;
  /** Le fil d'Ariane de la route, qui remplace celui de la maquette (l. 55). */
  filAriane?: ReactNode;
  /** Ce que la route ajoute sous le gabarit : formulaire et maillage du site. */
  maillage?: ReactNode;
}

export default function PageImplantation({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageImplantation) {
  const {
    chapeau,
    action,
    telephone,
    delai,
    reperes = [],
    logos = [],
    problemeTitre,
    problemeTexte,
    problemes = [],
    offre = [],
    offreNotes = [],
    etapes = [],
    garanties = [],
    appel,
    preuves = [],
    questions = [],
    liens = [],
    appelFinal,
    reste = [],
  } = contenu;

  const cartes = liensSurs(liens);
  const tel = telephone ? lienTelephone(telephone) : null;

  /* La bande défile en translatant la piste de -50 % : la liste est donc
     écrite deux fois, le second exemplaire comblant le vide pendant la boucle.
     Le doublon est caché aux technologies d'assistance, il n'y a rien à
     annoncer deux fois. Même construction que `accueil/MarqueeClients.tsx`. */
  const pisteLogos = logos.length > 0 ? [...logos, ...logos] : [];

  return (
    <>
      {/* ------------------------------------------------------ 01 Héros, l. 54 */}
      <section style={SECTION_HAUTE}>
        {filAriane ? <div style={FIL_ARIANE}>{filAriane}</div> : null}
        <div className={styles.deuxColonnes} style={HERO}>
          <div>
            <span style={PASTILLE_RUBRIQUE}>
              <span aria-hidden="true" style={PASTILLE_POINT} />
              {PASTILLE_TEXTE}
            </span>
            <h1 style={TITRE1}>{titre}</h1>
            {chapeau ? <p style={CHAPEAU_HERO}>{chapeau}</p> : null}
            {action || tel ? (
              <div style={RANGEE_BOUTONS}>
                {action ? (
                  <Link
                    href={action.href}
                    prefetch={false}
                    className={styles.boutonOrange}
                    style={BOUTON_ORANGE}
                  >
                    {action.libelle}
                  </Link>
                ) : null}
                {tel && telephone ? (
                  <a
                    href={tel}
                    className={styles.boutonClair}
                    style={BOUTON_TELEPHONE}
                  >
                    {telephone}
                  </a>
                ) : null}
              </div>
            ) : null}
            {delai ? (
              <div style={BLOC_DELAI}>
                <span aria-hidden="true" style={DELAI_POINT} />
                <p style={DELAI_TEXTE}>{delai}</p>
              </div>
            ) : null}
          </div>

          {/* Le panneau « En bref ». Sans repères il ne se rend pas du tout, et
              le héros tient alors sur sa colonne de gauche. */}
          {reperes.length > 0 ? (
            <div data-reveal="" style={PANNEAU_HERO}>
              <div style={PANNEAU_CORPS}>
                <div style={SURTITRE_PANNEAU}>{SURTITRE_EN_BREF}</div>
                <div style={PILE_REPERES}>
                  {reperes.map((repere) => (
                    <div key={repere.libelle} style={REPERE}>
                      <span style={REPERE_VALEUR}>{repere.valeur}</span>
                      <span style={REPERE_LIBELLE}>
                        {repere.libelle}
                        {repere.detail ? (
                          <span style={REPERE_DETAIL}>{repere.detail}</span>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------- 02 Bandeau de logos, l. 75 à 87 */}
      {pisteLogos.length > 0 ? (
        <section style={SECTION_HAUTE}>
          <div style={ENTETE_LOGOS}>
            <span style={SURTITRE_LOGOS}>{SURTITRE_LOGOS_TEXTE}</span>
            <span aria-hidden="true" style={FILET_LOGOS} />
          </div>
          <div className="mg-marquee" style={BANDE_LOGOS}>
            <div
              className={`mg-track ${styles.piste}`}
              style={PISTE_LOGOS}
            >
              {pisteLogos.map((nom, i) => (
                <span
                  key={`${nom}-${i}`}
                  aria-hidden={i >= logos.length ? "true" : undefined}
                  style={NOM_CLIENT}
                >
                  {nom}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------- 03 Problème, l. 89 à 105 */}
      {problemeTitre || problemes.length > 0 ? (
        <section style={SECTION}>
          <div
            className={styles.deuxColonnes}
            style={{ ...LARGEUR, ...VIS_A_VIS_PROBLEME }}
          >
            <div className={styles.colonneFixe} style={COLONNE_FIXE}>
              <SurTitre>{SURTITRE_PROBLEME}</SurTitre>
              {problemeTitre ? (
                <h2 style={TITRE_PROBLEME}>{problemeTitre}</h2>
              ) : null}
              {problemeTexte ? (
                <p style={TEXTE_PROBLEME}>
                  <TexteRiche texte={problemeTexte} />
                </p>
              ) : null}
            </div>
            <div style={PILE_CARTES}>
              {problemes.map((puce) => (
                <div key={puce.texte} data-reveal="" style={CARTE_PROBLEME}>
                  <span aria-hidden="true" style={CARTE_ANNEAU} />
                  <div>
                    {puce.accroche ? (
                      <div style={CARTE_ACCROCHE}>{puce.accroche}</div>
                    ) : null}
                    <div style={CARTE_TEXTE}>
                      <TexteRiche texte={puce.texte} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------ 04 Offre, l. 107 à 128 */}
      {offre.length > 0 ? (
        <section style={SECTION}>
          <div style={LARGEUR}>
            <SurTitre>{SURTITRE_OFFRE}</SurTitre>
            <h2 style={TITRE_OFFRE}>{TITRE_OFFRE_TEXTE}</h2>
            <div data-reveal="" style={TABLEAU}>
              <div
                className={`${styles.rangeeTableau} ${styles.enteteTableau}`}
                style={TABLEAU_ENTETE}
              >
                <span />
                <span style={TABLEAU_ENTETE_GAUCHE}>{COLONNE_PRESTATION}</span>
                <span style={TABLEAU_ENTETE_DROITE}>{COLONNE_BENEFICE}</span>
              </div>
              {offre.map((ligne, i) => (
                <div
                  key={ligne.prestation.texte}
                  className={styles.rangeeTableau}
                  style={TABLEAU_RANGEE}
                >
                  <span style={RANGEE_NUMERO}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={PRESTATION}>
                    {ligne.prestation.accroche ? (
                      <strong style={PRESTATION_ACCROCHE}>
                        {ligne.prestation.accroche}
                      </strong>
                    ) : null}
                    <TexteRiche texte={ligne.prestation.texte} />
                  </div>
                  <div style={BENEFICE}>
                    <span aria-hidden="true" style={BENEFICE_FLECHE}>
                      {FLECHE}
                    </span>
                    <span style={BENEFICE_TEXTE}>
                      <TexteRiche texte={ligne.benefice} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {offreNotes.length > 0 ? (
              <div style={NOTES}>
                {offreNotes.map((note) => (
                  <p key={note} style={NOTE}>
                    <TexteRiche texte={note} />
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------- 05 Déroulé, l. 130 à 148 */}
      {etapes.length > 0 ? (
        <section style={SECTION}>
          <div
            className={styles.deuxColonnes}
            style={{ ...LARGEUR, ...GRILLE_DEROULE }}
          >
            <div className={styles.colonneFixe} style={COLONNE_FIXE}>
              <SurTitre>{SURTITRE_DEROULE}</SurTitre>
              <h2 style={TITRE_DEROULE}>{TITRE_DEROULE_TEXTE}</h2>
            </div>
            <div style={FRISE}>
              <span aria-hidden="true" style={FRISE_FILET} />
              {etapes.map((etape, i) => (
                <div key={etape.titre} data-reveal="" style={ETAPE}>
                  <span aria-hidden="true" style={ETAPE_NUMERO}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={ETAPE_CORPS}>
                    <div style={ETAPE_TITRE}>{etape.titre}</div>
                    {etape.texte ? (
                      <p style={ETAPE_TEXTE}>
                        <TexteRiche texte={etape.texte} />
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------- 06 Garanties, l. 150 à 162 */}
      {garanties.length > 0 ? (
        <section style={SECTION_PANNEAU}>
          <div
            className={styles.panneauLarge}
            data-reveal=""
            style={PANNEAU_SOMBRE}
          >
            <span aria-hidden="true" style={LUEUR_GARANTIES} />
            <div style={{ position: "relative" }}>
              <SurTitre>{SURTITRE_GARANTIES}</SurTitre>
              <h2 style={TITRE_GARANTIES}>{TITRE_GARANTIES_TEXTE}</h2>
              <div className={styles.deuxColonnes} style={GRILLE_GARANTIES}>
                {garanties.map((puce) => (
                  <div key={puce.texte} style={GARANTIE}>
                    {puce.accroche ? (
                      <div style={GARANTIE_TITRE}>{puce.accroche}</div>
                    ) : null}
                    <div style={GARANTIE_TEXTE}>
                      <TexteRiche texte={puce.texte} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ----------------------------------- Réassurance, l. 164 à 183.
          Écrite par la maquette, donc toujours rendue : elle ne dépend
          d'aucune donnée de page. */}
      <section style={SECTION}>
        <div
          className={styles.deuxColonnes}
          style={{ ...LARGEUR, ...GRILLE_REASSURANCE }}
        >
          <div data-reveal="" style={CARTE_REASSURANCE}>
            <div style={SURTITRE_REASSURANCE}>{SURTITRE_CERTIFICATIONS}</div>
            <div style={GRILLE_CERTIFICATIONS}>
              {CERTIFICATIONS.map((c) => (
                <div key={c.nom} style={CERTIFICATION}>
                  <div style={CERTIFICATION_NOM}>{c.nom}</div>
                  <div style={CERTIFICATION_NOTE}>{c.note}</div>
                </div>
              ))}
            </div>
            <p style={ATTESTATIONS}>{PHRASE_ATTESTATIONS}</p>
          </div>
          <div data-reveal="" style={CARTE_EQUIPE}>
            <div style={SURTITRE_REASSURANCE}>{SURTITRE_EQUIPE}</div>
            <div style={BANDEAU_SELECTION}>
              <span style={SELECTION_CHIFFRE}>{SELECTION_VALEUR}</span>
              <span style={SELECTION_TEXTE}>{SELECTION_PHRASE}</span>
            </div>
            <div style={DUO_REPERES}>
              {REPERES_EQUIPE.map((r) => (
                <div key={r.titre}>
                  <div style={DUO_TITRE}>{r.titre}</div>
                  <div style={DUO_NOTE}>{r.note}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={HUBS_TITRE}>{HUBS_TITRE_TEXTE}</div>
              <div style={HUBS_RANGEE}>
                {HUBS.map((hub) => (
                  <span key={hub} style={HUB}>
                    {hub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------ 07 Appel, l. 185 à 192 */}
      {appel ? (
        <section style={SECTION}>
          <div style={LARGEUR}>
            <div data-reveal="" style={BANDEAU_APPEL}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={APPEL_QUESTION}>{appel.question}</div>
                {appel.rappel ? (
                  <div style={APPEL_RAPPEL}>{appel.rappel}</div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {action ? (
                  <Link
                    href={action.href}
                    prefetch={false}
                    className={styles.boutonOrange}
                    style={BOUTON_ORANGE}
                  >
                    {appel.bouton}
                  </Link>
                ) : null}
                {tel && telephone ? (
                  <a
                    href={tel}
                    className={styles.boutonClair}
                    style={BOUTON_BLANC}
                  >
                    {telephone}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------- 08 Références, l. 194 à 210 */}
      {preuves.length > 0 ? (
        <section style={SECTION}>
          <div style={LARGEUR}>
            <SurTitre>{SURTITRE_PREUVES}</SurTitre>
            <h2 style={TITRE_PREUVES_TEXTE ? undefined : undefined}>
              {TITRE_PREUVES_TEXTE}
            </h2>
            <div className={styles.troisColonnes} style={GRILLE_PREUVES}>
              {preuves.map((preuve) => {
                const client = nomClient(preuve.lienLibelle);
                const corps = (
                  <div style={PREUVE_CORPS}>
                    {client ? (
                      <span style={PREUVE_CLIENT}>{client}</span>
                    ) : null}
                    <span style={PREUVE_TITRE}>{preuve.titre}</span>
                    {preuve.texte ? (
                      <span style={PREUVE_TEXTE}>{preuve.texte}</span>
                    ) : null}
                    {preuve.lienLibelle && preuve.lienHref ? (
                      <span style={PREUVE_LIBELLE}>
                        {preuve.lienLibelle}{" "}
                        <span aria-hidden="true" style={{ color: "var(--acc)" }}>
                          {FLECHE}
                        </span>
                      </span>
                    ) : null}
                  </div>
                );
                /* Sans cible sûre, la carte se rend en bloc et non en lien :
                   un `href="#"` donnerait au clavier une cible qui ne mène
                   nulle part. */
                return preuve.lienHref &&
                  liensSurs([
                    { libelle: preuve.titre, href: preuve.lienHref },
                  ]).length > 0 ? (
                  <Link
                    key={preuve.titre}
                    href={preuve.lienHref}
                    prefetch={false}
                    data-reveal=""
                    className={styles.cartePreuve}
                    style={CARTE_PREUVE}
                  >
                    {corps}
                  </Link>
                ) : (
                  <div
                    key={preuve.titre}
                    data-reveal=""
                    style={CARTE_PREUVE}
                  >
                    {corps}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------- 09 Questions, l. 212 à 231 */}
      {questions.length > 0 ? (
        <section style={SECTION}>
          <div
            className={styles.deuxColonnes}
            style={{ ...LARGEUR, ...GRILLE_QUESTIONS }}
          >
            <div className={styles.colonneFixe} style={COLONNE_FIXE}>
              <SurTitre>{SURTITRE_QUESTIONS}</SurTitre>
              <h2 style={TITRE_QUESTIONS}>{TITRE_QUESTIONS_TEXTE}</h2>
              <div style={QUESTIONS_INTRO}>{INTRO_QUESTIONS}</div>
              {tel && telephone ? (
                <a
                  href={tel}
                  className={styles.boutonClair}
                  style={BOUTON_TELEPHONE_PETIT}
                >
                  {telephone}
                </a>
              ) : null}
            </div>
            <div style={PILE_CARTES}>
              {questions.map((q) => (
                <div key={q.question} data-reveal="" style={CARTE_QUESTION}>
                  <div style={QUESTION}>{q.question}</div>
                  <p style={REPONSE}>
                    <TexteRiche texte={q.reponse} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------- Maillage, l. 234 à 250 */}
      {cartes.length > 0 ? (
        <section style={SECTION}>
          <div style={LARGEUR}>
            <SurTitre>{SURTITRE_MAILLAGE}</SurTitre>
            <div style={GRILLE_MAILLAGE}>
              {cartes.map((carte) => (
                <Link
                  key={carte.href}
                  href={carte.href}
                  prefetch={false}
                  data-reveal=""
                  className={styles.carteLien}
                  style={CARTE_LIEN}
                >
                  <div style={LIEN_CORPS}>
                    <div style={LIEN_ENTETE}>
                      <span style={LIEN_TITRE}>{carte.libelle}</span>
                      <span aria-hidden="true" style={LIEN_FLECHE}>
                        {FLECHE}
                      </span>
                    </div>
                    {carte.contexte ? (
                      <span style={LIEN_CONTEXTE}>{carte.contexte}</span>
                    ) : null}
                    <span style={LIEN_CHEMIN}>{carte.href}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------- 10 Appel final, l. 252 à 287 */}
      {appelFinal ? (
        <section style={SECTION_PANNEAU_FINAL}>
          <div
            className={styles.panneauLarge}
            data-reveal=""
            style={PANNEAU_FINAL}
          >
            <span aria-hidden="true" style={LUEUR_FINALE} />
            <div style={{ position: "relative" }}>
              <SurTitre>{SURTITRE_FINAL}</SurTitre>
              <h2 style={TITRE_FINAL}>{appelFinal.question}</h2>
              {appelFinal.rappel ? (
                <p style={TEXTE_FINAL}>{appelFinal.rappel}</p>
              ) : null}
              {tel && telephone ? (
                <a
                  href={tel}
                  className={styles.boutonSombre}
                  style={BOUTON_FINAL}
                >
                  {telephone}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Ce que le corpus porte et que les douze sections n'accueillent pas.
          Vide sur les 42 pages d'aujourd'hui : le gabarit couvre tout. */}
      {reste.map((section, i) => (
        <Bloc key={`${section.type}-${i}`} section={section} />
      ))}

      {maillage}
    </>
  );
}
