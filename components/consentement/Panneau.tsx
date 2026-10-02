"use client";

import { type CSSProperties, useState } from "react";

import {
  FINALITES,
  type Finalite,
  LIBELLES,
  LIEN_CONFIDENTIALITE,
  TOUT_REFUSE,
  choixUniforme,
} from "@/lib/consentement";

import Action from "./Action";
import styles from "./Panneau.module.css";
import { enregistre, useConsentement } from "./etat";

/*
 * HABILLAGE : d'où vient chaque valeur.
 *
 * La maquette validée (`maquette/accueil-rendu.html`) ne contient AUCUN bandeau
 * de consentement, et aucune case à cocher : il n'y a donc rien à porter. Cet
 * écran est composé avec son vocabulaire, motif par motif, numéro de ligne par
 * numéro de ligne.
 *
 *   · ligne 1711 : le cadre de rangées. `display:grid;gap:1px;
 *     background:var(--line);border:1px solid var(--line);
 *     border-radius:var(--rad-s);overflow:hidden`. Les séparateurs ne sont pas
 *     des bordures, ce sont les 1px de fond qui traversent la grille.
 *   · ligne 1712 : la rangée elle-même, `background:var(--card);padding:12px 15px`.
 *   · ligne 902 : la rangée tactile, `min-height:44px;display:flex;
 *     align-items:center`. C'est la cible du doigt.
 *   · ligne 953 : la rangée cliquable, `border-radius` et
 *     `transition:background var(--tr)`, teintée `var(--chip)` au survol.
 *   · ligne 1195 : `border-radius:12px`, le rayon des champs de la maquette.
 *   · ligne 1202 : `font:600 15px var(--fb)`, le texte d'un bouton ou d'un
 *     intitulé porteur.
 *   · ligne 1325 : `font:400 14px/1.55 var(--fb);color:var(--ink2)`, le courant.
 *   · ligne 1202 : `font:400 11.5px/1.5 var(--fb)`, la mention de bas de carte.
 *   · ligne 1162 : `gap:14px`, l'écart d'une rangée à deux éléments.
 *   · ligne 1190 : `margin-bottom:20px`, le pas vertical entre deux blocs.
 *   · ligne 2468 : le lien, `color:var(--acc-ink);text-decoration:underline;
 *     text-underline-offset:3px`.
 *
 * DEUX ÉCARTS ASSUMÉS, tous deux au nom de l'accessibilité (contrat, règle 5).
 *
 *   · SURFACE OPAQUE, PAS DE VERRE. La carte de verre de la maquette
 *     (`rgba(255,255,255,var(--gl-a))`, soit 58,2 % de blanc) laisse passer ce
 *     qui défile derrière : le fond effectif du texte n'est pas connu. Mesuré,
 *     `var(--ink2)` tient 5,36:1 quand la page derrière est claire (`--bg`) mais
 *     tombe à 2,06:1 quand elle est sombre (`--foot`). Le bandeau flotte
 *     au-dessus de n'importe quelle section du site, dont les cartes
 *     anthracite : le pire cas est donc le cas réel. Toutes les surfaces de cet
 *     écran sont donc `var(--card)`, opaque, comme les champs de la maquette
 *     ligne 1195 posés sur sa carte de verre. Le contraste devient calculable,
 *     et il l'est dans `verification-panneau.tsx`.
 *   · `var(--ink2)` à la place du `var(--ink4)` de la maquette pour les petites
 *     mentions (ligne 1202). `--ink4` mesure 2,48:1 sur `--card` : la maquette
 *     ne passe pas 4,5:1 à cet endroit, on ne reprend pas sa faute.
 */

/** Le cadre : un trait de `--line` entre chaque rangée (maquette l.1711). */
const CADRE: CSSProperties = {
  display: "grid",
  gap: 1,
  background: "var(--line)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad-s)",
  overflow: "hidden",
  marginTop: 20,
};

/** La liste des finalités, même motif de grille que le cadre. */
const LISTE: CSSProperties = {
  display: "grid",
  gap: 1,
  background: "var(--line)",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

const RANGEE: CSSProperties = {
  background: "var(--card)",
  padding: "8px 15px 16px",
};

/**
 * La bascule : intitulé et case sur une même ligne de 44px de haut, cliquable
 * d'un bord à l'autre. Les 44px viennent de la maquette (l.902) et dépassent
 * les 24px exigés par le critère 2.5.8 de la WCAG 2.2.
 */
const BASCULE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  minHeight: 44,
  margin: "0 -8px",
  padding: "0 8px",
  borderRadius: 12,
  cursor: "pointer",
  font: "600 15px var(--fb)",
  color: "var(--ink)",
  transition: "background var(--tr)",
};

/**
 * Case à cocher NATIVE, à sa taille, sans `role="switch"`.
 *
 * Son état se lit par la FORME, le crochet dessiné par le navigateur, pas
 * seulement par une couleur : c'est ce qu'exige le critère 1.4.1 de la WCAG, et
 * c'est ce dont a besoin un visiteur daltonien. `accent-color` vaut `var(--ink)`
 * et non `var(--acc)` : l'orange de marque mesure 2,56:1 sur `--card`, sous les
 * 3:1 exigés pour la limite d'un élément d'interface (WCAG 1.4.11), là où
 * l'encre en donne 17,21:1.
 */
const CASE: CSSProperties = {
  flex: "none",
  width: 24,
  height: 24,
  margin: 0,
  accentColor: "var(--ink)",
  cursor: "pointer",
};

const TEXTE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  margin: "2px 0 0",
};

const MENTION: CSSProperties = {
  font: "400 11.5px/1.5 var(--fb)",
  color: "var(--ink2)",
  margin: "8px 0 0",
};

/** Dernière rangée du cadre, donc sur la même surface opaque que les autres. */
const NOTE: CSSProperties = {
  ...MENTION,
  background: "var(--card)",
  padding: "14px 15px",
  margin: 0,
};

const LIEN: CSSProperties = {
  color: "var(--acc-ink)",
  textDecoration: "underline",
  textDecorationColor: "var(--acc)",
  textUnderlineOffset: 3,
};

/** Les deux sorties, côte à côte, repliées l'une sous l'autre à l'étroit. */
const ACTIONS: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 20,
};

/**
 * Détail par finalité : une case à cocher et une phrase par finalité, dans le
 * langage du visiteur. Rien n'est accordé par défaut, y compris la mesure
 * d'audience : le site ne dépose aucun traceur avant un clic explicite.
 *
 * LES QUATRE FINALITÉS VIENNENT DE `lib/consentement.ts`, libellés compris, et
 * aucune n'est techniquement nécessaire : le site fonctionne entièrement sans
 * traceur. Il n'y a donc ici aucune case verrouillée, et il ne faut pas en
 * ajouter une : une finalité présentée comme « nécessaire » alors qu'elle sert
 * la mesure ou la publicité est précisément ce que la CNIL sanctionne.
 */
export default function Panneau() {
  const { choix } = useConsentement();
  const [brouillon, setBrouillon] = useState(choix?.choix ?? TOUT_REFUSE);

  function bascule(finalite: Finalite, accorde: boolean): void {
    setBrouillon({ ...brouillon, [finalite]: accorde });
  }

  return (
    <div>
      <div style={CADRE}>
        <ul style={LISTE}>
          {FINALITES.map((finalite) => {
            const id = `finalite-${finalite}`;
            return (
              <li key={finalite} style={RANGEE}>
                <label
                  htmlFor={id}
                  className={styles.bascule}
                  style={BASCULE}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {LIBELLES[finalite].titre}
                  </span>
                  <input
                    type="checkbox"
                    id={id}
                    checked={brouillon[finalite]}
                    onChange={(evenement) =>
                      bascule(finalite, evenement.currentTarget.checked)
                    }
                    /* La description et les destinataires sont rattachés à la
                       case, pas fondus dans son nom : un lecteur d'écran
                       annonce « Publicité, case à cocher » puis la phrase, au
                       lieu d'un seul bloc de trois lignes. */
                    aria-describedby={`${id}-texte ${id}-destinataires`}
                    style={CASE}
                  />
                </label>
                <p id={`${id}-texte`} style={TEXTE}>
                  {LIBELLES[finalite].texte}
                </p>
                {/* Les destinataires sont nommés finalité par finalité :
                    accorder sans savoir à qui les données partent n'est pas un
                    choix éclairé. La liste vient de LIBELLES, qui suit les
                    scripts que Tags.tsx peut charger. */}
                <p id={`${id}-destinataires`} style={MENTION}>
                  Destinataires : {LIBELLES[finalite].destinataires.join(", ")}
                </p>
              </li>
            );
          })}
        </ul>

        <p style={NOTE}>
          Durées de conservation, droits d&apos;accès et de suppression :{" "}
          <a href={LIEN_CONFIDENTIALITE} className={styles.lien} style={LIEN}>
            politique de confidentialité
          </a>
          .
        </p>
      </div>

      {/* Deux sorties de poids égal : refuser reste à un seul clic, même ici.
          Les deux passent par `Action`, donc par la même et unique règle de
          style. Aucun des deux n'est « principal ». */}
      <div style={ACTIONS}>
        <Action
          libelle="Tout refuser"
          onClick={() => enregistre(choixUniforme(false))}
        />
        <Action
          libelle="Enregistrer mes choix"
          onClick={() => enregistre(brouillon)}
        />
      </div>
    </div>
  );
}
