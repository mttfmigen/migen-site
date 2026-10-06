import Image from "next/image";
import type { CSSProperties } from "react";

import {
  CHAPEAU,
  ENTETE,
  LARGEUR,
  SECTION,
  TITRE2,
} from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { ContenuOffre } from "@/types/offre";

import BandeAppel from "./BandeAppel";
import {
  INC_GRILLE,
  INC_LIGNE,
  INC_PANNEAU_PORTE,
  INC_PANNEAU_VOUS,
  INC_PUCE_PORTE,
  INC_PUCE_VOUS,
  INC_RANGEE_MARQUE,
  INC_TITRE_PANNEAU,
  SURTITRE_OFFRE,
} from "./habillage-offre";

/**
 * Section 8 de la maquette, « Ce qui est inclus » (l. 4277 à 4285 de
 * `maquette/site-final.html`).
 *
 * CE QUE LA MAQUETTE DESSINE, ET QUE LE SITE NE RENDAIT PAS DU TOUT : un en-tête
 * à deux colonnes, puis DEUX PANNEAUX face à face, puis une barrette en verre.
 * À gauche, en verre, la marque migen© suivie de « Ce que migen© porte » et de
 * cinq lignes à pastille orange pleine ; à droite, plat et bordé, « Ce qui reste
 * chez vous » et quatre lignes à pastille claire. Le site servait à la place le
 * tableau prestation / bénéfice de `blocs/Offre.tsx`, qui est un autre dessin.
 *
 * TOUT LE TEXTE VIENT D'`OFFERS`, et le commentaire précédent disait l'inverse.
 * Il affirmait que « Ce qui reste chez vous », `of.incT` et `of.incP`
 * « n'existent ni dans la maquette ni dans le corpus », faute d'avoir vu que la
 * maquette porte sa propre donnée à sa ligne 7748. Les liaisons sont résolues
 * depuis `maquette/offres-maquette.json` : `incTitre` ← `of.incT`,
 * `incChapeau` ← `of.incP`, `porte` ← les CINQ lignes `of.us0` à `of.us4`,
 * `resteChezVous` ← les QUATRE lignes `of.you0` à `of.you3`.
 *
 * LE PANNEAU DE DROITE N'EST PAS RENDU QUAND SA MATIÈRE MANQUE, et ça n'arrive
 * plus que sur les douze pages de `/offres/` SANS clé dans `OFFERS` : le corpus
 * n'écrit nulle part ce qui reste chez le client, et quatre lignes inventées
 * engageraient migen© sur ce qu'elle NE fait PAS. La grille passe alors à une
 * colonne, et le panneau de gauche prend toute la largeur.
 *
 * LE TABLEAU PRESTATION / BÉNÉFICE DU CORPUS N'EST PAS PERDU : `PageOffre` le
 * rend entre la section 12 et la 13, avec les autres sections rédigées que la
 * maquette ne montre pas, sous le surtitre « Le périmètre » (maquette l. 1881).
 */

/** Une ligne de liste : la pastille, puis le texte. */
function Ligne({
  texte,
  puce,
  marque,
}: {
  texte: string;
  puce: CSSProperties;
  marque: string;
}) {
  return (
    <div style={INC_LIGNE}>
      <span aria-hidden="true" style={puce}>
        {marque}
      </span>
      <span>
        <TexteRiche texte={texte} />
      </span>
    </div>
  );
}

export default function CeQuiEstInclus({ contenu }: { contenu: ContenuOffre }) {
  const porte = contenu.porte ?? [];
  const vous = contenu.resteChezVous ?? [];
  if (porte.length === 0 && vous.length === 0) return null;

  const deuxPanneaux = porte.length > 0 && vous.length > 0;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div className="mg-r2" style={ENTETE}>
            <div>
              <div style={SURTITRE_OFFRE}>Ce qui est inclus</div>
              {contenu.incTitre ? (
                <h2 style={TITRE2}>{contenu.incTitre}</h2>
              ) : null}
            </div>
            {contenu.incChapeau ? (
              <p style={CHAPEAU}>
                <TexteRiche texte={contenu.incChapeau} />
              </p>
            ) : null}
          </div>

          <div
            className="mg-r2"
            style={
              deuxPanneaux
                ? INC_GRILLE
                : { ...INC_GRILLE, gridTemplateColumns: "minmax(0,1fr)" }
            }
          >
            {porte.length > 0 ? (
              <div style={INC_PANNEAU_PORTE}>
                <div style={INC_RANGEE_MARQUE}>
                  {/*
                    La marque en tête du panneau, comme la maquette (l. 4281).
                    `alt=""` parce qu'elle est décorative : le titre juste à côté
                    nomme déjà la marque, un lecteur d'écran l'entendrait deux
                    fois.
                  */}
                  <Image
                    src="/assets/logo-migen-mark.png"
                    alt=""
                    width={22}
                    height={22}
                    style={{ height: 22, width: "auto" }}
                  />
                  <span style={INC_TITRE_PANNEAU}>Ce que migen© porte</span>
                </div>
                {porte.map((ligne) => (
                  <Ligne
                    key={ligne}
                    texte={ligne}
                    puce={INC_PUCE_PORTE}
                    marque="✓"
                  />
                ))}
              </div>
            ) : null}

            {vous.length > 0 ? (
              <div style={INC_PANNEAU_VOUS}>
                <div style={{ ...INC_TITRE_PANNEAU, marginBottom: 14 }}>
                  Ce qui reste chez vous
                </div>
                {vous.map((ligne) => (
                  <Ligne
                    key={ligne}
                    texte={ligne}
                    puce={INC_PUCE_VOUS}
                    marque="→"
                  />
                ))}
              </div>
            ) : null}
          </div>

          {contenu.incBande ? (
            <BandeAppel texte={contenu.incBande} bouton={contenu.incBouton} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
