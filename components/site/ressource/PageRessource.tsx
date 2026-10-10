import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FilArianeVue } from "@/components/cocon/FilAriane";
import type { ContenuRessource, LectureRessource } from "@/types/ressource";
import type { Question } from "@/types/contenu";

import CorpsRessource, { EnLigne } from "./CorpsRessource";
import styles from "./Ressource.module.css";
import * as H from "./habillage";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * Le gabarit « 01 Article et fiche » : `MigenRessource.dc.html`, branche
 * `isArticle`, rendu contre `maquette/rendu/ressources--<rayon>--<page>.html`.
 *
 * Cinq sections, et seulement elles, dans l'ordre de la capture :
 *   Ressources · héros, Article · corps, Questions fréquentes, À lire
 *   ensuite, Ressources · appel.
 *
 * CE QUE LA PAGE NE REND PLUS, et pourquoi. Le fil d'Ariane du cocon, le
 * formulaire de bas de page et la grille de maillage que la route passe en
 * `filAriane` et `maillage` : la capture n'en porte aucun. Son fil est DANS le
 * héros (rendu ici par `FilArianeVue`, la rangée du site, sur le libellé du
 * rayon et le titre court de la maquette), son maillage est « Sur le même
 * sujet », son appel final mène à `/contact/`. Les deux props restent typées
 * pour que la route compile ; rien ne les monte, donc rien ne les exécute.
 *
 * Composant SERVEUR. Le seul comportement est natif : `<details name>` pour la
 * FAQ à une question ouverte (consigne du README), ancres pour le sommaire.
 */

/** `p.short` de la maquette : 46 signes, puis une ellipse. */
function titreCourt(titre: string): string {
  return titre.length > 46 ? `${titre.slice(0, 46)}…` : titre;
}

/**
 * La carte du livre blanc, à la place de la photo.
 *
 * ÉCART DÉCLARÉ : la maquette simule l'envoi (« C’est envoyé. ») sans rien
 * envoyer, et aucun PDF n'existe. Ici le dessin est celui de la capture, mais
 * le bouton mène au formulaire de contact réel. Les champs n'ont pas de `name` :
 * rien de ce qui est saisi ne part dans l'adresse.
 */
function CarteLivre() {
  return (
    <div id="mr-dl" style={H.CARTE_LIVRE}>
      <div style={H.SURTITRE_LIVRE}>{H.COPIE.livreSurtitre}</div>
      <div style={H.TITRE_LIVRE}>{H.COPIE.livreTitre}</div>
      <form action={H.CONTACT} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder={H.COPIE.livreEmail}
          aria-label={H.COPIE.livreEmail}
          style={H.CHAMP}
        />
        <input
          type="text"
          placeholder={H.COPIE.livreEntreprise}
          aria-label={H.COPIE.livreEntreprise}
          style={H.CHAMP}
        />
        <button type="submit" style={H.BOUTON_LIVRE}>
          {H.COPIE.livreBouton}
        </button>
        <span style={{ font: "400 12px var(--fb)", color: "var(--ink4)" }}>
          {H.COPIE.livreMention}
        </span>
      </form>
    </div>
  );
}

function Questions({ questions }: { questions: Question[] }) {
  return (
    <section data-screen-label="Questions fréquentes" style={H.SECTION_SUITE}>
      <div className={styles.faq} style={H.FAQ_CARTE}>
        <Image src={H.FAQ_PHOTO} alt={altPhoto(H.FAQ_PHOTO)} fill sizes="1120px" style={{ objectFit: "cover" }} />
        <div aria-hidden="true" style={H.FAQ_VOILE} />
        <div style={{ position: "relative" }}>
          <div style={H.SURTITRE}>{H.COPIE.faqSurtitre}</div>
          <h2 style={{ ...H.TITRE_SECTION, margin: "0 0 24px", color: "#fff" }}>
            {H.COPIE.faqTitre}
          </h2>
          <div style={H.FAQ_LISTE}>
            {questions.map((q, i) => (
              <details
                key={q.question}
                name="faq-ressource"
                open={i === 0}
                className={styles.question}
                style={{ borderTop: i === 0 ? "none" : H.FAQ_FILET }}
              >
                <summary style={H.FAQ_QUESTION}>
                  {q.question}
                  <span aria-hidden="true" className={styles.plus} style={H.FAQ_PLUS}>
                    +
                  </span>
                </summary>
                <p style={H.FAQ_REPONSE}>{q.reponse}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Lectures({
  lectures,
  rayon,
}: {
  lectures: LectureRessource[];
  rayon?: ContenuRessource["rayon"];
}) {
  const libelle = (rayon && H.RAYONS[rayon]?.libelle) || "ressources";
  return (
    <section data-screen-label="À lire ensuite" style={H.SECTION_SUITE}>
      <div style={H.LECTURES_TETE}>
        <div>
          <div style={H.SURTITRE}>{H.COPIE.lecturesSurtitre}</div>
          <h2 style={H.TITRE_SECTION}>{H.COPIE.lecturesTitre}</h2>
        </div>
        <Link href={rayon ? `/ressources/${rayon}/` : "/ressources/"} style={H.LECTURES_LIEN}>
          {`Tous les ${libelle.toLowerCase()} →`}
        </Link>
      </div>
      <div style={H.LECTURES_GRILLE}>
        {lectures.map((lecture) => {
          const format = H.RAYONS[lecture.href.split("/")[2] as keyof typeof H.RAYONS]?.format;
          return (
            <Link key={lecture.href} href={lecture.href} style={H.LECTURE}>
              <div style={H.LECTURE_PHOTO}>
                <Image
                  src={lecture.image}
                  alt={altPhoto(lecture.image)}
                  fill
                  sizes="(max-width: 900px) 100vw, 380px"
                  style={{
                    objectFit: "cover",
                    /* Cadre 364x150, ratio 2,43, le plus large du site : un
                       portrait y perdait 73 % de sa hauteur. */
                    objectPosition: cadragePhoto(lecture.image, 364 / 150),
                    filter: "saturate(var(--sat,.55))",
                  }}
                />
              </div>
              <div style={H.LECTURE_TEXTE}>
                <span style={H.LECTURE_FORMAT}>
                  {`${format ?? "Ressource"} · ${lecture.minutes} min`}
                </span>
                <span style={H.LECTURE_TITRE}>{lecture.titre}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Appel() {
  return (
    <section id="mr-cta" data-screen-label="Ressources · appel" style={H.SECTION_APPEL}>
      <div className={styles.deux} style={H.APPEL}>
        <div aria-hidden="true" style={H.APPEL_LUEUR} />
        <div style={{ position: "relative" }}>
          <div style={H.APPEL_SURTITRE}>{H.COPIE.appelSurtitre}</div>
          <h2 className={styles.appelTitre} style={H.APPEL_TITRE}>
            {H.COPIE.appelTitre}
          </h2>
          <p style={H.APPEL_TEXTE}>{H.COPIE.appelTexte}</p>
        </div>
        <div style={H.APPEL_BOUTONS}>
          <Link href={H.CONTACT} style={H.APPEL_BOUTON}>
            {H.COPIE.decrire}
          </Link>
          <a href={H.TELEPHONE.href} style={H.APPEL_TELEPHONE}>
            {H.TELEPHONE.libelle}
          </a>
        </div>
      </div>
    </section>
  );
}

export interface ProprietesPageRessource {
  titre: string;
  contenu: ContenuRessource;
  /** Passés par la route, non rendus : voir l'en-tête du fichier. */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageRessource({ titre, contenu }: ProprietesPageRessource) {
  const { rayon, chapo = [], parties = [], questions = [], aLire = [] } = contenu;
  const rayonVu = rayon ? H.RAYONS[rayon] : undefined;
  const livre = rayon === "livres-blancs";

  /* Un paragraphe du chapo vidé par le contrat (phrase interdite retirée,
     déclarée dans `retraits`) reste dans la donnée en chaîne vide : c'est la
     sortie de `maquette-ressource.ts`. Dans la maquette il remplissait la
     colonne, plus haute que la photo, et le titre tenait le haut de la rangée.
     Sans lui la colonne devient la plus courte et le centrage de la grille
     ferait descendre le titre (29 px sur indicateurs-maintenance) : elle
     s'ancre alors en haut, la photo reste centrée sur la rangée. */
  const paragraphes = chapo.filter(Boolean);
  const colonneTexte = paragraphes.length < chapo.length ? H.COLONNE_ANCREE : undefined;

  const etapes = [
    { titre: "Ressources", path: "/ressources/" },
    ...(rayonVu ? [{ titre: rayonVu.libelle, path: `/ressources/${rayon}/` }] : []),
    { titre: titreCourt(titre), path: null },
  ];

  return (
    <div className="mg-site">
      <main style={{ paddingTop: H.HAUT_DE_PAGE }}>
        <section data-screen-label="Ressources · héros" style={H.SECTION_HEROS}>
          <div style={{ marginBottom: 26 }}>
            <FilArianeVue etapes={etapes} />
          </div>
          <div className={styles.deux} style={H.GRILLE_HEROS}>
            <div style={colonneTexte}>
              {rayonVu ? (
                <span style={H.PASTILLE}>
                  <span style={H.POINT} />
                  {rayonVu.format}
                </span>
              ) : null}
              <h1 style={H.TITRE1}>{titre}</h1>
              {paragraphes.map((paragraphe, i) => (
                <p key={i} style={H.CHAPO}>
                  <EnLigne texte={paragraphe} lien={H.LIEN_PROSE} />
                </p>
              ))}
              <div style={H.SIGNATURE}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden="true" style={H.MONOGRAMME}>
                    M
                  </span>
                  {H.COPIE.signature}
                </span>
                {contenu.minutes ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{`${contenu.minutes} min de lecture`}</span>
                  </>
                ) : null}
                {parties.length > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{`${parties.length} parties`}</span>
                  </>
                ) : null}
              </div>
            </div>
            {livre ? (
              <CarteLivre />
            ) : contenu.image ? (
              <div style={H.PHOTO_HEROS}>
                <Image
                  src={contenu.image}
                  alt={altPhoto(contenu.image)}
                  fill
                  preload
                  sizes="(max-width: 980px) 100vw, 520px"
                  style={{ objectFit: "cover", filter: H.FILTRE_PHOTO }}
                />
              </div>
            ) : null}
          </div>
        </section>

        <CorpsRessource avant={contenu.avant} parties={parties} />

        {questions.length > 0 ? <Questions questions={questions} /> : null}

        {aLire.length > 0 ? <Lectures lectures={aLire} rayon={rayon} /> : null}

        <Appel />
      </main>
    </div>
  );
}
