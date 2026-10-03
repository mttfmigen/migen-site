import type { CSSProperties } from "react";

import styles from "./PageMarques.module.css";
import type { FamilleMarques, Marque } from "./marques-donnees";
import { FAMILLES } from "./marques-donnees";

/**
 * Les sept rangées de constructeurs, dans une seule carte en verre.
 *
 * Maquette, `maquette/accueil-rendu.html` lignes 2886 à 2919. Composant serveur,
 * aucune animation : la maquette ne pose ici ni `data-reveal` ni survol.
 *
 * LES BORDURES SONT CELLES DE LA MAQUETTE, qui les écrit de deux façons : les
 * cinq premières rangées portent un filet BAS, la sixième n'en porte aucun, la
 * septième porte un filet HAUT. Le rendu est le même qu'avec six filets bas,
 * mais la règle est recopiée telle quelle plutôt que normalisée.
 */

export interface ProprietesFamilles {
  familles?: readonly FamilleMarques[];
}

const FILET = "1px solid var(--line)";

/** La tuile blanche qui accueille un logo, ou son nom à défaut. */
const TUILE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 72,
  padding: "0 14px",
  borderRadius: 14,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.07)",
  minWidth: 0,
};

/**
 * Nom rendu en texte quand le fichier du logo n'est pas dans le dépôt.
 *
 * La maquette ne prévoit pas ce cas : elle a ses images. Les deux valeurs
 * choisies, 13px et `var(--fb)`, sont celles du fil d'Ariane de cette même
 * page (ligne 2880) ; ne rien afficher aurait fait disparaître treize
 * constructeurs, et afficher une image absente aurait donné treize cadres
 * cassés.
 */
const NOM_SANS_LOGO: CSSProperties = {
  font: "600 13px/1.3 var(--fb)",
  color: "var(--ink1)",
  textAlign: "center",
  overflowWrap: "anywhere",
};

function Tuile({ marque }: { marque: Marque }) {
  return (
    <span title={marque.nom} style={TUILE}>
      {marque.logo ? (
        // `img` et non `next/image` : les dimensions intrinsèques de ces
        // soixante-sept fichiers ne sont pas connues du dépôt.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={marque.logo}
          alt={marque.nom}
          loading="lazy"
          style={{
            maxHeight: 34,
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <span style={NOM_SANS_LOGO}>{marque.nom}</span>
      )}
    </span>
  );
}

export default function Familles({ familles = FAMILLES }: ProprietesFamilles) {
  return (
    <section style={{ padding: "48px 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          style={{
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
            borderRadius: "var(--rad)",
            padding: "4px 32px",
          }}
        >
          {familles.map((famille, index) => {
            const derniere = index === familles.length - 1;
            const avantDerniere = index === familles.length - 2;
            return (
              <div
                key={famille.cle}
                className="mg-r2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px minmax(0,1fr)",
                  gap: 32,
                  alignItems: "start",
                  padding: "26px 0",
                  borderTop: derniere ? FILET : undefined,
                  borderBottom:
                    derniere || avantDerniere ? undefined : FILET,
                }}
              >
                <div style={{ paddingTop: 22 }}>
                  {/* Un `div` et non un `h2`, comme la maquette l'écrit, et
                      ce n'est pas un oubli : `app/globals.css` impose
                      `font-size: clamp(26px,7.4vw,34px) !important` à tout
                      `h2` sous 760px, règle juste pour les titres de section
                      en 3vw, ruineuse pour une étiquette de rangée en 17px.
                      Ces sept intitulés sont des libellés de colonne, pas des
                      titres : la hiérarchie de la page tient dans son seul
                      `h1`. */}
                  <div
                    style={{
                      font: "600 17px/1.3 var(--ft)",
                      letterSpacing: "-.02em",
                    }}
                  >
                    {famille.titre}
                  </div>
                </div>
                <div
                  className={styles.grilleLogos}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill,minmax(150px,1fr))",
                    gap: 10,
                  }}
                >
                  {famille.marques.map((marque) => (
                    <Tuile key={marque.nom} marque={marque} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
