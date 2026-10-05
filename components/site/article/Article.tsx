import Link from "next/link";
import Image from "next/image";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { ContenuArticle, SectionArticle } from "@/types/article";

import styles from "./Article.module.css";
import {
  BANDE_APPEL,
  BLOC_SECTION,
  BOUTON_APPEL,
  CHAPEAU,
  FIL_ARIANE,
  GRILLE_SOMMAIRE,
  HEROS_ARTICLE,
  LARGEUR,
  NUMERO,
  NUMERO_SECTION,
  PASTILLE,
  POINT_APPEL,
  POINT_PASTILLE,
  RAPPEL,
  SECTION_APPEL,
  SECTION_CORPS,
  SECTION_HEROS,
  SOMMAIRE,
  SOMMAIRE_LIEN,
  SOMMAIRE_TITRE,
  TEXTE_APPEL,
  TITRE1,
  TITRE2,
  VISUEL,
  VISUEL_ARTICLE,
  caseVisuel,
  grilleHeros,
  numerote,
} from "./habillage";
import { AppelSombre, Motifs, sectionAlimentee } from "./Motifs";

/**
 * Gabarit d'ARTICLE, porté de `maquette/gabarit-01-article.html`, écran
 * « Gabarit 01 Article et fiche ».
 *
 * CE FICHIER FAIT FOI, et il n'avait jamais été lu. Le portage précédent
 * s'appuyait sur « Migen - Site final.dc.html », lignes 5759 à 5824, le seul
 * fichier que le client avait envoyé en message. Écart, motif par motif :
 *
 *   le héros          un titre en colonne de lecture, puis une image en pleine
 *                     largeur DESSOUS  ->  DEUX COLONNES, texte à gauche,
 *                     visuel de 340px à droite, aligné en bas
 *   la nature         une ligne de surtitre orange « GUIDE · 8 MIN »
 *                     ->  UNE PASTILLE DE VERRE À POINT ORANGE
 *   les sections      « 1. Un titre »  ->  « 01 » EN CHASSE FIXE ORANGE
 *                     AU-DESSUS du titre, et un filet entre deux sections
 *   le sommaire       une liste nue dans la colonne  ->  UNE CARTE DE VERRE
 *                     COLLANTE de 240px, numéros en chasse fixe
 *   l'appel de fin    un panneau sombre dans la colonne  ->  il reste, c'est le
 *                     motif « isCta » du corps, PLUS une bande de verre de fin
 *                     de page avec le téléphone et le rappel
 *
 * CE QUE LA MAQUETTE DESSINE ET QUI NE SE REND PAS. Le gabarit porte une
 * section de foire aux questions à deux colonnes et une section de maillage en
 * cartes. `articles.contenu` ne porte ni question ni lien de maillage, et la
 * route ne passe pas de maillage à ce gabarit. Ces deux sections ne sont donc
 * PAS écrites : une section que le corpus n'alimente pas ne se rend pas du
 * tout, et une coque écrite d'avance finit branchée sur une donnée inventée.
 * Les valeurs mesurées restent dans `habillage.ts`, le jour où la donnée
 * arrive. Voir `RESERVES-CONTENU.md`.
 *
 * Composant SERVEUR : rien n'y est interactif. Le sommaire tient par
 * `position:sticky`, pas par du JavaScript, et les ancres sont des liens.
 * `Article.module.css` le repasse en statique sous 900px, où le collant
 * n'aurait nulle part où coller, exactement comme le fait la maquette.
 */

const FIL_SEPARATEUR = { color: "var(--ink4)" } as const;

export interface ProprietesArticle {
  titre: string;
  contenu: ContenuArticle;
  /** Date de publication, au format ISO. Vient de `articles.published_at`. */
  publieLe?: string | null;
  auteur?: string | null;
  /** Cible du bouton d'appel quand le contenu n'en donne pas. */
  hrefContact?: string;
  /**
   * La rubrique du fil d'Ariane. La maquette écrit « Accueil / Ressources /
   * le titre » : le deuxième maillon est la rubrique de l'article.
   */
  rubrique?: { libelle: string; href: string };
}

/** Une section du corps, avec son numéro et ses blocs. */
function SectionCorps({
  section,
  rang,
  derniere,
}: {
  section: SectionArticle;
  rang: number;
  derniere: boolean;
}) {
  return (
    <div
      id={section.id}
      style={
        derniere
          ? { ...BLOC_SECTION, borderBottom: "none", marginBottom: 0, paddingBottom: 0 }
          : BLOC_SECTION
      }
    >
      <div style={NUMERO_SECTION}>{numerote(rang)}</div>
      <h2 style={TITRE2}>{section.titre}</h2>
      <Motifs blocs={section.blocs} />
    </div>
  );
}

export default function Article({
  titre,
  contenu,
  publieLe,
  auteur,
  hrefContact = "/contact/",
  rubrique = { libelle: "Ressources", href: "/ressources/" },
}: ProprietesArticle) {
  // Une section que le corpus n'alimente pas ne se rend pas du tout, et ne
  // consomme donc pas de numéro : la numérotation porte sur ce qui se rend.
  const sections = contenu.sections.filter((s) => s.titre && sectionAlimentee(s.blocs));

  /* La pastille de nature. La maquette n'en dessine qu'une, courte. Le corpus
     porte aussi la durée de lecture, que la maquette ne montre nulle part : on
     ne la supprime pas, elle rejoint la pastille. Le texte du corpus ne se
     perd jamais, c'est la règle du projet. */
  const nature = [
    contenu.categorie,
    contenu.minutesLecture ? `${contenu.minutesLecture} min de lecture` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const dateLisible = publieLe
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(publieLe))
    : null;

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={SECTION_HEROS}>
          <div style={FIL_ARIANE}>
            <Link href="/" style={FIL_SEPARATEUR} prefetch={false}>
              Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={rubrique.href} style={FIL_SEPARATEUR} prefetch={false}>
              {rubrique.libelle}
            </Link>
            <span aria-hidden="true">/</span>
            <span style={{ color: "var(--ink1)" }}>{titre}</span>
          </div>

          <div
            className="mg-r2"
            style={grilleHeros(contenu.image ? HEROS_ARTICLE : "minmax(0,1fr)")}
          >
            <div>
              {nature ? (
                <span style={PASTILLE}>
                  <span aria-hidden="true" style={POINT_PASTILLE} />
                  {nature}
                </span>
              ) : null}
              <h1 style={TITRE1}>{titre}</h1>
              {contenu.chapeau ? (
                <p style={CHAPEAU}>
                  <TexteRiche texte={contenu.chapeau} />
                </p>
              ) : null}
            </div>

            {/* La case de visuel ne se rend QUE s'il y a un visuel : la
                maquette y pose un fond de remplacement, qui sans image serait
                un rectangle gris de 340px au milieu du héros. */}
            {contenu.image ? (
              <div style={caseVisuel(VISUEL_ARTICLE)}>
                <Image
                  src={contenu.image.src}
                  alt={contenu.image.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 420px"
                  priority
                  style={VISUEL}
                />
              </div>
            ) : null}
          </div>
        </section>

        {sections.length > 0 ? (
          <section style={SECTION_CORPS}>
            <div className="mg-r2" style={{ ...LARGEUR, ...GRILLE_SOMMAIRE }}>
              {/* Le sommaire se déduit des sections : jamais saisi deux fois,
                  donc jamais désynchronisé du corps. */}
              <nav
                aria-label="Sommaire de l'article"
                className={styles.sommaire}
                style={SOMMAIRE}
              >
                <div style={SOMMAIRE_TITRE}>Sommaire</div>
                {sections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={styles.lienSommaire}
                    style={SOMMAIRE_LIEN}
                  >
                    <span style={NUMERO}>{numerote(i + 1)}</span>
                    {section.titre}
                  </a>
                ))}
                {auteur ? (
                  <p className={styles.signature}>Écrit par {auteur}</p>
                ) : null}
                {dateLisible ? (
                  <p className={styles.signature}>Publié le {dateLisible}</p>
                ) : null}
              </nav>

              <div className={styles.corps} style={{ minWidth: 0 }}>
                {sections.map((section, i) => (
                  <SectionCorps
                    key={section.id}
                    section={section}
                    rang={i + 1}
                    derniere={!contenu.cta && i === sections.length - 1}
                  />
                ))}

                {contenu.cta ? (
                  <AppelSombre
                    texte={`**${contenu.cta.titre}** ${contenu.cta.texte}`}
                    bouton={contenu.cta.bouton}
                    href={contenu.cta.href ?? hrefContact}
                    telephone="04 78 33 72 05"
                  />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* La bande d'appel est du CHROME : sa copie est celle de la maquette,
            elle ne dépend d'aucune donnée, et elle est le seul chemin vers le
            contact sur une page d'article, que la route ne dote pas de
            formulaire. La phrase de rappel est la SEULE formulation de délai
            que le contrat autorise. */}
        <section style={SECTION_APPEL}>
          <div style={LARGEUR}>
            <div style={BANDE_APPEL}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span aria-hidden="true" style={POINT_APPEL} />
                <span style={TEXTE_APPEL}>{RAPPEL}</span>
              </div>
              <a
                href={hrefContact}
                className={styles.boutonAppel}
                style={BOUTON_APPEL}
              >
                Décrire mon besoin
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
