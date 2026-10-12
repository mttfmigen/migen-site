import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./Contact.module.css";

/**
 * « Vous êtes technicien ? » : la seule bande de `/contact/` qui ne parle pas
 * à un industriel, et elle le dit.
 *
 * POURQUOI ELLE EXISTE À PART. Mehdi, le 12/10 : « elle est mal constituée, il
 * faut la refaire, tu parles d'un besoin et tu enchaînes sur un bouton qui
 * renvoie vers l'espace candidat ». La maquette pose bien cette carte au milieu
 * de « Après votre demande » (il l'a confirmé) : la carte est d'elle, c'est son
 * EMPLACEMENT qui ment. On décrivait à un industriel ce qui suit sa demande,
 * puis on l'invitait à postuler, au même poids visuel que « Décrire mon
 * besoin », la conversion que la page existe pour servir.
 *
 * CE QUI EST REPRIS MOT POUR MOT de la maquette : le sur-titre « Vous êtes
 * technicien ? », le titre « Postulez directement en ligne », la flèche et
 * l'habillage de verre. Rien n'est refabriqué de ce qu'elle contient déjà.
 *
 * CE QUI EST À NOUS, et pourquoi.
 *
 *   · La troisième ligne. La maquette écrit « Quatre écrans, réponse sous
 *     48 h ouvrées. » Deux raisons de ne pas la passer : « 48 h » est un délai
 *     chiffré, interdit par le contrat (§9, seul « rappel dans l'heure » est
 *     autorisé), et notre formulaire de candidature tient sur UN écran, pas
 *     quatre. La purge de la seule mention « 48 h » avait laissé « Quatre
 *     écrans. » en ligne, un moignon de phrase qui n'annonce rien et qui était
 *     faux. La ligne dit maintenant à qui la page s'adresse et où aller.
 *   · La pleine largeur. La grille de la maquette est `1fr 1fr` pour une seule
 *     carte : la moitié droite reste vide. Seule dans sa section, la carte
 *     prend toute la largeur.
 *   · Le sur-titre et le titre deviennent un vrai `<h2>` : la bande est une
 *     section du document, elle doit figurer dans sa structure. Dans la
 *     maquette c'étaient deux `div`, parce que la carte vivait sous le `h2` de
 *     « Après votre demande ».
 */

/** L'habillage de verre de la maquette, recopié valeur par valeur. */
const VERRE_CARTE: CSSProperties = {
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  borderRadius: "var(--rad)",
};

export default function PourLesTechniciens() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <Link
            href="/carriere/"
            className={styles.carteLien}
            style={{
              ...VERRE_CARTE,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              padding: "26px 30px",
            }}
          >
            <div>
              <div
                style={{
                  font: "600 10.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 8,
                }}
              >
                Vous êtes technicien&nbsp;?
              </div>
              <h2
                style={{
                  font: "600 calc(22px * var(--ts)) var(--ft)",
                  letterSpacing: "-.035em",
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                Postulez directement en ligne
              </h2>
              <p
                style={{
                  font: "400 13.5px/1.5 var(--fb)",
                  color: "var(--ink2)",
                  margin: "4px 0 0",
                  maxWidth: "58ch",
                }}
              >
                Cette page reçoit les demandes des industriels. Les postes
                ouverts et le formulaire de candidature sont dans l&rsquo;espace
                recrutement.
              </p>
            </div>
            <span
              aria-hidden="true"
              style={{
                font: "600 20px var(--fb)",
                color: "var(--acc)",
                flex: "none",
              }}
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
