import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import Bloc from "@/components/site/blocs/Bloc";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { ContenuMetier } from "@/types/metier";

import styles from "./PageMetier.module.css";
import Gabarit07 from "./Gabarit07";
import { Boutons, CarteAction, Puces, Visuel } from "./pieces";

/**
 * Aiguillage des gabarits MÉTIER et DOMAINE.
 *
 * DEUX GABARITS, DEUX FICHIERS DE MAQUETTE. Ce fichier a longtemps rendu les
 * deux avec le même dessin, celui de « Migen - Site final.dc.html », parce qu'on
 * les croyait jumeaux. Ils ne le sont pas :
 *
 *   · `gabarit: "metier"`, soit `/carriere/<metier>/`, 13 pages, est dessiné par
 *     « Migen - Gabarit 07 Metier.dc.html » et rendu par `Gabarit07.tsx`. Voir
 *     l'en-tête de ce fichier pour ce que ce dessin change.
 *   · `gabarit: "domaine"`, soit `/expertises/<domaine>/`, 19 pages, garde le
 *     dessin porté de « Site final » : héros, mosaïque « Ce que nous traitons »,
 *     pastilles des autres domaines, carte de fin.
 *
 * Composant SERVEUR. Aucun état, aucun écouteur : les survols sont dans le
 * module CSS, et les révélations au défilement sont posées en `data-reveal`,
 * animées par `components/site/Moteurs.tsx`, déjà monté dans la mise en page
 * racine.
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
  if (contenu.gabarit === "metier") {
    return (
      <Gabarit07
        titre={titre}
        contenu={contenu}
        filAriane={filAriane}
        maillage={maillage}
      />
    );
  }

  const photo = contenu.photo;

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={{ ...LARGEUR, padding: "24px 40px 0" }}>
          {filAriane}
        </section>

        {/* ------------------------------------------------------------ héros */}
        <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 20 }}>
              Domaine d&apos;activité
            </div>
            <h1
              style={{
                font: "600 calc(clamp(36px,4.4vw,66px) * var(--ts))/1.03 var(--ft)",
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
                  font: "400 18.5px/1.6 var(--fb)",
                  color: "var(--ink2)",
                  margin: "24px 0 0",
                  maxWidth: "56ch",
                }}
              >
                <TexteRiche texte={contenu.chapeau} />
              </p>
            ) : null}
            {contenu.boutons?.length ? (
              <Boutons boutons={contenu.boutons} />
            ) : null}
          </div>
        </section>

        {/* Le domaine porte son visuel dans une mosaïque, avec la liste de ce
            qu'il traite en carte de verre à côté. */}
        {photo || contenu.traitements?.length ? (
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
                <div style={{ ...VERRE, boxShadow: "none", padding: "32px 34px" }}>
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
        {contenu.reste?.length
          ? contenu.reste.map((section, i) => (
              // L'index suffit comme clé : l'ordre du tableau EST le gabarit.
              <Bloc key={`${section.type}-${i}`} section={section} />
            ))
          : null}

        {/* ---------------------- autres domaines, puis appel à l'action */}
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
                      Les autres domaines
                    </div>
                    <ul
                      aria-labelledby="mg-autres"
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        margin: "0 0 44px",
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

                {contenu.cta ? (
                  <CarteAction contenu={contenu.cta} rembourrage={56} />
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
