import Link from "next/link";
import type { ReactNode } from "react";

import {
  COLONNE_COLLANTE,
  FIL_ARIANE,
  GRILLE_TITRE_CORPS,
  HEROS_ETUDE,
  LARGEUR,
  PASTILLE,
  POINT_PASTILLE,
  SECTION_ETUDE,
  SECTION_HEROS,
  SURTITRE,
  TITRE1,
  TITRE2_ETUDE,
  grilleHeros,
  numerote,
} from "@/components/site/article/habillage";
import { Motifs, sectionAlimentee } from "@/components/site/article/Motifs";
import articleStyles from "@/components/site/article/Article.module.css";
import type { ContenuFiche } from "@/types/fiche";

/**
 * Gabarit d'ÉTUDE DE CAS, les 28 pages `/preuves/<client>/`.
 *
 * Porté de `maquette/gabarit-02-etude-de-cas.html`, écran « Gabarit 02 Étude de
 * cas ». CE FICHIER FAIT FOI, et il n'avait jamais été lu : le portage
 * précédent s'appuyait sur « Migen - Site final.dc.html », lignes 6126 à 6209,
 * le seul fichier que le client avait envoyé en message. C'est l'écart que le
 * client a nommé. Motif par motif :
 *
 *   le héros       carte d'identité du chantier à droite du titre
 *                  ->  PASTILLE « ÉTUDE DE CAS » À POINT ORANGE, titre, et un
 *                      visuel de 400px à droite
 *   le corps       une mosaïque de visuels, puis TROIS CARTES CÔTE À CÔTE
 *                  (contexte / ce que nous avons fait / résultat)
 *                  ->  UNE SUITE DE SECTIONS NUMÉROTÉES, chacune ancrable, son
 *                      numéro et son titre dans une COLONNE COLLANTE à gauche,
 *                      son corps à droite dans les motifs partagés
 *   la fiche       une liste libellé / valeur dans le héros
 *                  ->  UN TABLEAU « ÉLÉMENT / DÉTAIL », section « Le dispositif »
 *   le résultat    des chiffres sur panneau anthracite
 *                  ->  UNE LISTE À COCHES en carte de verre, comme le reste
 *   la fin         un pavé « Un cas comparable chez vous ? », copie inventée
 *                  ->  l'appel final du gabarit attend une donnée que le corpus
 *                      ne porte pas : il ne se rend pas, voir plus bas
 *
 * CE QUE LA MAQUETTE DESSINE ET QUI NE SE REND PAS. L'appel final, une carte
 * blanche à liseré orange sous le surtitre « Votre besoin », n'a de contenu que
 * `finalBlocks` : une phrase propre au cas, que le corpus des 28 études ne
 * porte pas. La section ne se rend donc pas, et le chemin vers le contact reste
 * le formulaire que la route pose par `maillage`. Écrire la carte avec une
 * phrase générique serait exactement la faute d'origine : le pavé « Un cas
 * comparable chez vous ? » qu'elle remplace était de la copie inventée, absente
 * de la maquette comme du corpus. Valeurs mesurées conservées dans
 * `habillage.ts`. Voir `RESERVES-CONTENU.md`.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Les colonnes de titre
 * tiennent par `position:sticky`, repassées en statique sous 900px par
 * `Article.module.css`, comme le fait la maquette.
 */

const FIL_LIEN = { color: "var(--ink4)" } as const;

/** La nature de la page, telle que la maquette l'écrit dans sa pastille. */
const NATURE = "Étude de cas";

export interface ProprietesPageFiche {
  titre: string;
  contenu: ContenuFiche;
  /**
   * Fil d'Ariane et maillage interne, fournis par la page.
   *
   * POURQUOI EN PROPS : ce sont des composants serveur ASYNCHRONES qui
   * interrogent la base. Les appeler ici rendrait ce fichier asynchrone pour
   * deux éléments de chrome, et il ne serait plus montable hors base, donc plus
   * vérifiable sans Supabase.
   *
   * LE FIL D'ARIANE PASSE DANS LE HÉROS, à la place que la maquette lui donne,
   * et non dans une section à lui au-dessus.
   */
  filAriane?: ReactNode;
  maillage?: ReactNode;
}

export default function PageFiche({
  titre,
  contenu,
  filAriane,
  maillage,
}: ProprietesPageFiche) {
  /* Une section sans titre ou que le corpus n'alimente pas ne se rend pas du
     tout, et ne consomme donc pas de numéro : la numérotation porte sur ce qui
     se rend. « Le déroulé », que la maquette dessine en quatrième et que le
     corpus n'alimente pas, ne laisse pas de trou dans la suite 01, 02, 03. */
  const sections = (contenu.sections ?? []).filter(
    (section) => section.titre && sectionAlimentee(section.blocs),
  );

  return (
    <div className="mg-site">
      <main style={{ paddingTop: 96 }}>
        <section style={SECTION_HEROS}>
          {filAriane ? <div style={FIL_ARIANE}>{filAriane}</div> : null}

          <div className="mg-r2" style={grilleHeros(HEROS_ETUDE)}>
            <div>
              <span style={PASTILLE}>
                <span aria-hidden="true" style={POINT_PASTILLE} />
                {NATURE}
              </span>
              <h1 style={TITRE1}>{titre}</h1>
            </div>
            {/* La maquette pose ici un visuel de 400px sur fond de
                remplacement. Le corpus des 28 études ne porte AUCUNE image :
                la case ne se rend pas, un rectangle gris de 400px dans le héros
                n'étant pas une mise en page mais un trou. La deuxième colonne
                de la grille disparaît avec elle. */}
          </div>
        </section>

        {sections.map((section, i) => (
          <section key={section.id} id={section.id} style={SECTION_ETUDE}>
            <div className="mg-r2" style={{ ...LARGEUR, ...GRILLE_TITRE_CORPS }}>
              <div className={articleStyles.collant} style={COLONNE_COLLANTE}>
                <div style={SURTITRE}>{numerote(i + 1)}</div>
                <h2 style={TITRE2_ETUDE}>{section.titre}</h2>
              </div>
              <div className={articleStyles.corps} style={{ minWidth: 0 }}>
                <Motifs blocs={section.blocs} />
              </div>
            </div>
          </section>
        ))}

        {maillage}
      </main>
    </div>
  );
}

/**
 * Le fil d'Ariane de la maquette, pour un montage hors base.
 *
 * La route passe le vrai, déduit de la hiérarchie. Celui-ci sert au contrôle et
 * à l'aperçu : il porte les mêmes maillons que la maquette, « Accueil /
 * Preuves / le titre ».
 */
export function FilArianeEtude({ titre }: { titre: string }) {
  return (
    <>
      <Link href="/" style={FIL_LIEN} prefetch={false}>
        Accueil
      </Link>
      <span aria-hidden="true">/</span>
      <Link href="/preuves/" style={FIL_LIEN} prefetch={false}>
        Preuves
      </Link>
      <span aria-hidden="true">/</span>
      <span style={{ color: "var(--ink1)" }}>{titre}</span>
    </>
  );
}
