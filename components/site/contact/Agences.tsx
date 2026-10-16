import Link from "next/link";
import type { CSSProperties } from "react";

import SectionPliableMobile, {
  ENTETE_DANS_BASCULE,
} from "@/components/site/blocs/SectionPliableMobile";

import {
  HAUTEUR_CARTE,
  HUBS_CARTE,
  LARGEUR_CARTE,
  TRACE_FRANCE,
  TRACE_VOISINS,
} from "./carte-france";
import styles from "./Contact.module.css";

/**
 * « Nos agences » : la liste des implantations.
 * Porté de `maquette/accueil-rendu.html`, lignes 3012 à 3021.
 *
 * DEUX ÉCARTS À LA MAQUETTE, tous les deux imposés.
 *
 * 1. La maquette annonçait « Cinq agences en France, deux à l'international »
 *    et listait Écully, Paris, Strasbourg, Nantes, Toulouse. Le contrat de
 *    projet tient quatre agences, Lyon (siège à Limonest, agence à Écully),
 *    Montréal, Dubaï et Madrid, plus dix hubs de techniciens. Les villes
 *    françaises listées sont des hubs, pas des agences.
 *    09/10 : le siège est revenu à Limonest, décision de Mehdi qui renverse
 *    celle du 07/10. Écully reste, mais comme AGENCE, ce que la maquette ne
 *    dit nulle part : cette ligne-là est donc à nous, pas à elle. Renversée le
 *    matin du 16/10, la décision a été rétablie le soir (« L'agence est à
 *    Ecully, siège à Limonest »).
 * 2. LA CARTE DE FRANCE EST REVENUE LE 16/10, sans d3 ni CDN. La maquette
 *    dispose la section sur deux colonnes, `1.15fr .85fr` : la carte à
 *    gauche, la liste à droite. Son composant (`MigenAgences`) téléchargeait un
 *    atlas mondial à chaque affichage ; le tracé est désormais figé une fois
 *    par `scripts/genere-carte-france.mjs` dans `carte-france.ts`, la page ne
 *    charge rien. La carte porte les dix hubs du site, Lyon mis en avant avec
 *    la mention du siège à Limonest, et non les cinq villes de la maquette.
 *    Ses étiquettes sont lues par le lecteur d'écran via `aria-label`, car la
 *    liste à droite ne nomme pas les hubs.
 *
 * 3. CE QUI FERME LA PAGE A CHANGÉ LE 12/10. Cette section portait
 *    `padding:var(--sec) 0 var(--sec)`, la fermeture de page de la maquette,
 *    parce qu'elle en était la dernière. Depuis que la bande technicien passe
 *    après elle (arbitrage de Mehdi), elle est une section INTERMÉDIAIRE : son
 *    bas revient à 0, et c'est `PourLesTechniciens` qui ferme. Mesuré en
 *    production avant correction : 120 / 120 / 240 / 0 px entre contenus, la
 *    carte candidature collée au pied de page.
 *
 * 4. SOUS 881 PX, LA SECTION EST UNE RANGÉE REPLIÉE, comme « Après votre
 *    demande » : l'écran contact de la maquette mobile v2 n'a pas de liste
 *    d'agences, et « replier, jamais retirer » la garde, fermée. L'en-tête
 *    passe tel quel dans la bascule, le bureau ne bouge pas. Voir
 *    `ApresDemande.tsx` et `Contact.module.css`. La V3 mobile n'a pas de bloc
 *    agences non plus : la carte reste dans le repli, au-dessus de la liste.
 */

/** Au-dessus de « Lyon », sur la carte : le siège est à Limonest. Dessous, la
 *  mention touchait « Bordeaux » au téléphone (étiquettes agrandies). */
const MENTION_SIEGE_CARTE = "Siège à Limonest";

interface Agence {
  readonly nom: string;
  /** Vide quand la maquette n'en donne aucune : rien d'inventé. */
  readonly adresse: string;
}

const AGENCES: readonly Agence[] = [
  { nom: "Siège, Limonest", adresse: "1 rue des Vergers, 69760 Limonest" },
  { nom: "Agence, Écully", adresse: "129 chemin du Moulin Carron, 69130 Écully" },
  { nom: "Dubaï", adresse: "Level 20, 48 Burj Tower, Downtown" },
  { nom: "Montréal", adresse: "2020 route Transcanadienne, Dorval, Québec" },
  { nom: "Madrid", adresse: "" },
];

/** La carte de verre de la maquette, partagée par la carte et la liste. */
const VERRE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

const DESCRIPTION_CARTE = `Carte de France des hubs de techniciens : ${HUBS_CARTE.map(
  (hub) => (hub.siege ? `${hub.nom}, siège à Limonest` : hub.nom),
).join(", ")}.`;

/** Le dessin de `MigenAgences` (maquette V3), sur un tracé figé. */
/** Décalage de l'étiquette par rapport au point, et son ancrage, selon `cote`. */
const PLACE_ETIQUETTE = {
  d: [13, 4, "start"],
  g: [-12, 4, "end"],
  h: [0, -12, "middle"],
  b: [0, 20, "middle"],
} as const;

function CarteFrance() {
  return (
    <svg
      viewBox={`0 0 ${LARGEUR_CARTE} ${HAUTEUR_CARTE}`}
      role="img"
      aria-label={DESCRIPTION_CARTE}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <clipPath id="carte-agences-cadre">
          <rect x="0" y="0" width={LARGEUR_CARTE} height={HAUTEUR_CARTE} />
        </clipPath>
        <linearGradient id="carte-agences-france" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--map-a)" />
          <stop offset="100%" stopColor="var(--map-b)" />
        </linearGradient>
      </defs>
      <g clipPath="url(#carte-agences-cadre)">
        <path
          d={TRACE_VOISINS}
          fill="var(--chip)"
          stroke="var(--line)"
          strokeWidth="1"
        />
        <path
          d={TRACE_FRANCE}
          fill="url(#carte-agences-france)"
          stroke="var(--ink4)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      {HUBS_CARTE.map((hub) => {
        const [dx, dy, ancre] = PLACE_ETIQUETTE[hub.cote];
        const xTexte = hub.x + dx;
        return (
          <g key={hub.nom}>
            <circle
              cx={hub.x}
              cy={hub.y}
              r={hub.siege ? 17 : 13}
              fill="var(--acc)"
              opacity=".1"
            />
            <circle
              cx={hub.x}
              cy={hub.y}
              r={hub.siege ? 6.5 : 4.5}
              fill="var(--acc)"
              stroke="var(--card)"
              strokeWidth="2"
            />
            <text
              x={xTexte}
              y={hub.y + dy}
              textAnchor={ancre}
              style={{
                font: "600 12px var(--ft)",
                fill: hub.siege ? "var(--ink)" : "var(--ink2)",
                letterSpacing: "-.01em",
              }}
            >
              {hub.nom}
              {hub.siege ? (
                <tspan
                  x={xTexte}
                  dy="-16"
                  style={{ font: "500 10.5px var(--fb)", fill: "var(--ink3)" }}
                >
                  {MENTION_SIEGE_CARTE}
                </tspan>
              ) : null}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const RANGEE: CSSProperties = {
  padding: "16px 0",
  borderTop: "1px solid var(--line)",
};

export default function Agences() {
  const enTete = (
    <div
      className="mg-r2"
      style={{
        ...ENTETE_DANS_BASCULE,
        display: "grid",
        gridTemplateColumns: "1.1fr .9fr",
        gap: 56,
        alignItems: "end",
        marginBottom: 34,
      }}
    >
      <div>
        <div
          className={styles.surTitrePli}
          style={{
            font: "600 11.5px var(--fb)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--acc)",
            marginBottom: 16,
          }}
        >
          Nos agences
        </div>
        <h2
          className={styles.titrePli}
          style={{
            font: "600 calc(clamp(30px,3.3vw,48px) * var(--ts))/1.06 var(--ft)",
            letterSpacing: "-.04em",
            margin: 0,
            maxWidth: "22ch",
            textWrap: "balance",
          }}
        >
          Quatre agences, dix hubs de techniciens.
        </h2>
      </div>
      <p
        className={styles.chapoPli}
        style={{
          font: "400 16.5px/1.7 var(--fb)",
          color: "var(--ink2)",
          margin: 0,
          maxWidth: "46ch",
        }}
      >
        Le technicien part du hub le plus proche de votre site, jamais du siège.
      </p>
    </div>
  );

  return (
    <section
      className={styles.sectionPliee}
      style={{ padding: "var(--sec) 0 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <SectionPliableMobile enTete={enTete}>
            <div
              className={`mg-r2 ${styles.grilleAgences}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.15fr .85fr",
                gap: 14,
                alignItems: "stretch",
              }}
            >
              <div
                className={styles.carteAgences}
                style={{ ...VERRE, padding: 22 }}
              >
                <CarteFrance />
              </div>
              <div
                className={styles.listeAgencesMobile}
                style={{ ...VERRE, padding: "12px 30px 18px" }}
              >
                {AGENCES.map((agence) => (
                  <div key={agence.nom} style={RANGEE}>
                    <div
                      style={{
                        font: "600 15px var(--ft)",
                        letterSpacing: "-.02em",
                        color: "var(--ink)",
                      }}
                    >
                      {agence.nom}
                    </div>
                    {agence.adresse ? (
                      <div
                        style={{
                          font: "400 13.5px/1.55 var(--fb)",
                          color: "var(--ink3)",
                          marginTop: 3,
                        }}
                      >
                        {agence.adresse}
                      </div>
                    ) : null}
                  </div>
                ))}
                <div style={RANGEE}>
                  <Link
                    href="/implantations/"
                    style={{
                      font: "600 13.5px var(--fb)",
                      color: "var(--acc)",
                      // Seul dans sa rangée, donc une cible tactile à lui : mesuré
                      // à 19 px de haut sur téléphone, sous les 24 px du critère
                      // 2.5.8 de la WCAG 2.2. Le remplissage agrandit la zone de
                      // contact sans déplacer le texte.
                      display: "inline-block",
                      padding: "3px 0",
                    }}
                  >
                    Toutes les implantations et les hubs
                  </Link>
                </div>
              </div>
            </div>
          </SectionPliableMobile>
        </div>
      </div>
    </section>
  );
}
