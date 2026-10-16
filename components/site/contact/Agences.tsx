import Link from "next/link";
import type { CSSProperties } from "react";

import SectionPliableMobile, {
  ENTETE_DANS_BASCULE,
} from "@/components/site/blocs/SectionPliableMobile";

import styles from "./Contact.module.css";

/**
 * « Nos agences » : la liste des implantations.
 * Porté de `maquette/accueil-rendu.html`, lignes 3012 à 3021.
 *
 * DEUX ÉCARTS À LA MAQUETTE, tous les deux imposés.
 *
 * 1. La maquette annonçait « Cinq agences en France, deux à l'international »
 *    et listait Écully, Paris, Strasbourg, Nantes, Toulouse. Le contrat de
 *    projet tient quatre agences, Lyon (siège à Écully), Montréal, Dubaï et
 *    Madrid, plus dix hubs de techniciens. Les villes françaises listées sont
 *    des hubs, pas des agences.
 *    16/10 : LE SIÈGE EST À ÉCULLY, décision de Mehdi (« Le siège est à
 *    Ecully mets le de partout ») qui renverse celle du 09/10. Il n'y a plus
 *    d'agence d'Écully distincte du siège, ni de ligne Limonest.
 * 2. La carte interactive de la maquette (`x-import MigenAgences`) demande une
 *    bibliothèque de cartographie que le contrat interdit d'installer. La liste
 *    prend donc toute la largeur, et le lien vers les implantations tient le
 *    rôle de navigation que la carte assurait.
 *
 *    ÉCART DE DISPOSITION MESURÉ LE 12/10, ET IL N'EST PAS RÉPARABLE SANS
 *    ARBITRAGE. La maquette vivante dispose cette section sur DEUX colonnes,
 *    `grid-template-columns:1.15fr .85fr;gap:14px;align-items:stretch` : la
 *    carte de France à gauche (hauteur 440px), la liste à droite. Le site rend
 *    UNE colonne de 1120px. Le composant de la maquette
 *    (`maquette/MigenAgences.jsx`) tient sur `d3`, `topojson` et un atlas
 *    mondial téléchargé depuis un CDN à l'exécution : trois choses que le
 *    contrat refuse (§3.1, aucun chargement de contenu côté navigateur).
 *    Remplir cette colonne gauche par autre chose serait inventer un bloc que
 *    la maquette ne décrit pas. L'écart est donc DÉCLARÉ, mesuré, et rendu
 *    visible par la porte, qui échoue si quelqu'un le supprime du commentaire
 *    sans l'avoir réparé. À Mehdi de trancher : carte reconstruite sans CDN,
 *    ou une colonne assumée.
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
 *    `ApresDemande.tsx` et `Contact.module.css`.
 */

interface Agence {
  readonly nom: string;
  /** Vide quand la maquette n'en donne aucune : rien d'inventé. */
  readonly adresse: string;
}

const AGENCES: readonly Agence[] = [
  { nom: "Siège, Écully", adresse: "129 chemin du Moulin Carron, 69130 Écully" },
  { nom: "Dubaï", adresse: "Level 20, 48 Burj Tower, Downtown" },
  { nom: "Montréal", adresse: "2020 route Transcanadienne, Dorval, Québec" },
  { nom: "Madrid", adresse: "" },
];

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
        Le technicien part du hub le plus proche de votre site, jamais du
        siège.
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
              className={styles.listeAgencesMobile}
              style={{
                background: "rgba(255,255,255,var(--gl-a))",
                backdropFilter: "blur(var(--gl-b)) saturate(150%)",
                WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
                border: "1px solid var(--gbd)",
                boxShadow:
                  "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
                borderRadius: "var(--rad)",
                padding: "12px 30px 18px",
              }}
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
          </SectionPliableMobile>
        </div>
      </div>
    </section>
  );
}
