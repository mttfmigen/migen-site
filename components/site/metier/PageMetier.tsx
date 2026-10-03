import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import Bloc from "@/components/site/blocs/Bloc";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { ContenuMetier } from "@/types/metier";

import styles from "./PageMetier.module.css";
import Corps from "./Corps";
import { Boutons, CarteAction, Pastilles, Puces, Visuel } from "./pieces";

/**
 * Gabarits MÉTIER et DOMAINE, portés de « Migen - Site final.dc.html »,
 * lignes 5452 à 5541 et 5543 à 5600.
 *
 * Ils servent `/carriere/<metier>/` et `/expertises/<domaine>/`, soit 45 URL de
 * l'inventaire, qui passaient toutes par le gabarit de VENTE : dix sections
 * commerciales sur une fiche métier, c'est ce que le client a vu et nommé
 * « les pages expertise ne sont pas les mêmes ».
 *
 * Composant SERVEUR. Aucun état, aucun écouteur : les survols sont dans le
 * module CSS, et les révélations au défilement sont posées en `data-reveal`,
 * animées par `components/site/Moteurs.tsx`, déjà monté dans la mise en page
 * racine. Rien à animer ici.
 *
 * UN SEUL GABARIT POUR LES DEUX PAGES : voir la raison dans `types/metier.ts`.
 * Ce qui diffère réellement est isolé par le discriminant `gabarit`, quatre fois
 * en tout : la grille du héros, l'échelle du H1, le bloc de listes, et les
 * libellés des pastilles.
 */

/** Rythme des sections intermédiaires de la maquette, haut ET bas. */
const SECTION_PLEINE: CSSProperties = { padding: "var(--sec) 0 var(--sec)" };

export interface ProprietesPageMetier {
  titre: string;
  contenu: ContenuMetier;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce fichier asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageMetier({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageMetier) {
  const metier = contenu.gabarit === "metier";
  const photo = contenu.photo;

  // Le bloc de listes du héros secondaire. Il ne s'affiche que s'il a de la
  // matière : une section vide vaut moins qu'une section absente.
  const listes = metier
    ? (contenu.missions?.length ?? 0) +
      (contenu.competences?.length ?? 0) +
      (contenu.habilitations?.length ?? 0)
    : (contenu.traitements?.length ?? 0);

  const enTeteHero = (
    <div>
      <div style={{ ...SURTITRE, marginBottom: 20 }}>
        {metier ? "Métier" : "Domaine d'activité"}
      </div>
      <h1
        style={{
          font: `600 calc(clamp(36px,${metier ? "4.2vw,62px" : "4.4vw,66px"}) * var(--ts))/1.03 var(--ft)`,
          letterSpacing: "-.045em",
          margin: 0,
          maxWidth: "18ch",
          textWrap: "balance",
        }}
      >
        {titre}
      </h1>
      {contenu.chapeau ? (
        <p
          className={styles.corpus}
          style={{
            font: `400 ${metier ? "17.5px/1.65" : "18.5px/1.6"} var(--fb)`,
            color: "var(--ink2)",
            margin: "24px 0 0",
            maxWidth: metier ? "48ch" : "56ch",
          }}
        >
          <TexteRiche texte={contenu.chapeau} />
        </p>
      ) : null}
      {contenu.boutons?.length ? <Boutons boutons={contenu.boutons} /> : null}
    </div>
  );

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={{ ...LARGEUR, padding: "24px 40px 0" }}>
          {filAriane}
        </section>

        {/* ------------------------------------------------------------ héros */}
        <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
          {metier && photo ? (
            <div
              className="mg-r2"
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr .9fr",
                gap: 52,
                alignItems: "start",
              }}
            >
              {enTeteHero}
              <Visuel photo={photo} cadre={{ height: 380 }} />
            </div>
          ) : (
            enTeteHero
          )}
        </section>

        {/* Le domaine porte son visuel dans une mosaïque, avec la liste de ce
            qu'il traite en carte de verre à côté. */}
        {!metier && (photo || contenu.traitements?.length) ? (
          <section style={{ ...LARGEUR, padding: "44px 40px 0" }}>
            <div
              data-reveal=""
              className="mg-rmulti"
              style={{
                display: "grid",
                gridTemplateColumns: photo
                  ? "repeat(3,minmax(0,1fr))"
                  : "minmax(0,1fr)",
                gap: 16,
              }}
            >
              {photo ? (
                <Visuel
                  photo={photo}
                  cadre={{ gridColumn: "span 2", minHeight: 340 }}
                />
              ) : null}
              {contenu.traitements?.length ? (
                <div
                  style={{
                    ...VERRE,
                    boxShadow: "none",
                    padding: "32px 34px",
                  }}
                >
                  <div
                    id="mg-traitements"
                    style={{
                      ...SURTITRE,
                      letterSpacing: ".12em",
                      marginBottom: 18,
                    }}
                  >
                    Ce que nous traitons
                  </div>
                  <Puces
                    items={contenu.traitements}
                    id="mg-traitements"
                    police="14.5px/1.5"
                    gap={9}
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ------------------------- le corpus que la maquette ne dessine pas
            Rendu par les blocs du gabarit de vente, portés de la maquette eux
            aussi : la page garde l'ouverture et la fermeture de la maquette, et
            le texte rédigé tient entre les deux. Voir `reste` dans
            `types/metier.ts`. */}
        {!metier && contenu.reste?.length
          ? contenu.reste.map((section, i) => (
              // L'index suffit comme clé : l'ordre du tableau EST le gabarit.
              <Bloc key={`${section.type}-${i}`} section={section} />
            ))
          : null}

        {/* ------------------------------------- missions et compétences (métier) */}
        {metier && listes > 0 ? (
          <section style={{ padding: "var(--sec) 0 0" }}>
            <div style={LARGEUR}>
              <div
                data-reveal=""
                className="mg-r2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 70,
                  alignItems: "start",
                }}
              >
                <div>
                  {contenu.missions?.length ? (
                    <>
                      <div
                        id="mg-missions"
                        style={{ ...SURTITRE, marginBottom: 18 }}
                      >
                        Missions
                      </div>
                      <Puces
                        items={contenu.missions}
                        id="mg-missions"
                        police="15.5px/1.55"
                        gap={10}
                      />
                    </>
                  ) : null}
                </div>
                <div>
                  {contenu.competences?.length ? (
                    <>
                      <div
                        id="mg-competences"
                        style={{ ...SURTITRE, marginBottom: 18 }}
                      >
                        Compétences attendues
                      </div>
                      <Pastilles
                        items={contenu.competences}
                        id="mg-competences"
                        orange={false}
                        marge={26}
                      />
                    </>
                  ) : null}
                  {contenu.habilitations?.length ? (
                    <>
                      <div
                        id="mg-habilitations"
                        style={{ ...SURTITRE, marginBottom: 18 }}
                      >
                        Habilitations utiles
                      </div>
                      <Pastilles
                        items={contenu.habilitations}
                        id="mg-habilitations"
                        orange
                        marge={0}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ------------------------ le corpus que la maquette ne dessine pas
            Les quatre sections de la maquette tiennent en 155 mots et ne
            consomment que trois listes du corpus. Le reste, de 30 à 76 blocs
            de texte rédigé par page, se rend ici, dans la colonne de lecture du
            gabarit article de la maquette. Voir `corps` dans `types/metier.ts`. */}
        {metier && contenu.corps?.length ? (
          <Corps blocs={contenu.corps} />
        ) : null}

        {/* --------------------------------- autres entrées, puis appel à l'action
            Le gabarit métier les sépare en deux sections, le domaine les tient
            dans une seule révélation. C'est la maquette, recopiée telle quelle. */}
        {contenu.autres?.length || contenu.cta ? (
          <section style={SECTION_PLEINE}>
            <div style={LARGEUR}>
              <div data-reveal="">
                {contenu.autres?.length ? (
                  <>
                    <div
                      id="mg-autres"
                      style={{ ...SURTITRE, marginBottom: 16 }}
                    >
                      {metier ? "Autres métiers" : "Les autres domaines"}
                    </div>
                    <ul
                      aria-labelledby="mg-autres"
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        // Le métier referme sa section ici, le domaine enchaîne
                        // sur la carte d'appel à l'action, 44px plus bas.
                        margin: metier ? 0 : "0 0 44px",
                        padding: 0,
                        listStyle: "none",
                      }}
                    >
                      {contenu.autres.map((lien) => (
                        <li key={lien.href}>
                          <Link
                            href={lien.href}
                            prefetch={false}
                            className={styles.pastilleLien}
                            style={{
                              display: "inline-block",
                              font: "500 14px var(--fb)",
                              padding: "10px 18px",
                              borderRadius: 999,
                              background: "var(--gsol)",
                              border: "1px solid var(--line)",
                              color: "var(--ink1)",
                              transition: "background var(--tr)",
                            }}
                          >
                            {lien.libelle}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {/* Le métier ouvre une seconde section pour sa carte : elle est
                    donc rendue hors de cette révélation, plus bas. */}
                {!metier && contenu.cta ? (
                  <CarteAction contenu={contenu.cta} rembourrage={56} />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {metier && contenu.cta ? (
          <section style={SECTION_PLEINE}>
            <div style={LARGEUR}>
              <div data-reveal="">
                <CarteAction contenu={contenu.cta} rembourrage={52} />
              </div>
            </div>
          </section>
        ) : null}

        {maillage}
      </main>
    </div>
  );
}

