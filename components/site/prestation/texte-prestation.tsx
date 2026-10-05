import type { ReactNode } from "react";

import { lienTelephone } from "./habillage-prestation";

/**
 * Les transformations de texte que le DESSIN de la maquette impose au corpus.
 *
 * POURQUOI ELLES EXISTENT. Le corpus a été découpé par des parseurs : une
 * étape commence en minuscule parce que sa phrase d'origine était « décrivez la
 * panne : domaine, niveau d'urgence… », une réalisation n'a pas de point final
 * parce qu'elle était un fragment de liste. La maquette, elle, écrit « Domaine,
 * niveau d'urgence… » et « Lyon, depuis février 2024, relation toujours
 * active. ». L'écart n'est pas un écart de texte, c'est le même texte mis en
 * forme : la capitale et le point appartiennent au dessin.
 *
 * CE QU'ELLES NE FONT PAS. Elles ne réécrivent aucun mot, ne traduisent rien,
 * n'ajoutent ni ne retirent de contenu. Une transformation qui changerait le
 * sens serait de l'invention, et le projet l'interdit.
 *
 * La règle R36 du référentiel client (« Typographie française ») demande une
 * espace insécable avant « : ; ? ! ». Le corpus écrit une espace ordinaire :
 * c'est le détail qui trahit un site traduit, et c'est au rendu de le corriger.
 */

/** Première lettre en capitale. Le reste est laissé tel quel. */
export function capitale(texte: string): string {
  if (!texte) return texte;
  return texte[0].toLocaleUpperCase("fr-FR") + texte.slice(1);
}

/** Garantit une ponctuation finale, sans en ajouter une seconde. */
export function phrase(texte: string): string {
  const net = texte.trimEnd();
  if (!net) return net;
  return /[.!?…:»)]$/.test(net) ? net : `${net}.`;
}

/**
 * Espace insécable avant les ponctuations hautes, et à l'intérieur des
 * guillemets français.
 *
 * L'espace n'est posée que si le caractère précédent est une espace ordinaire :
 * « 24/24 » ne doit pas devenir « 24/24 » coupé, et un « http://… » ne doit pas
 * voir ses deux-points déplacés.
 */
export function insecable(texte: string): string {
  return texte
    .replace(/ ([:;?!])/g, " $1")
    .replace(/« /g, "« ")
    .replace(/ »/g, " »");
}

/** Capitale, ponctuation finale et typographie française, dans cet ordre. */
export function soigne(texte: string): string {
  return insecable(phrase(capitale(texte)));
}

/**
 * Découpe une accroche en titre et en suite, sur la première phrase.
 *
 * La maquette scinde la punchline du corpus : « La ligne est arrêtée
 * maintenant. » devient le H2, et « Chaque heure d'immobilisation coûte cher… »
 * le paragraphe en dessous. Le site rendait les deux dans le H2, ce qui donnait
 * un titre de trois lignes que la règle R19 du client interdit.
 *
 * Sans point suivi d'une espace, tout part dans le titre et la suite est vide :
 * une punchline d'une seule phrase se rend donc sans paragraphe, pas avec un
 * paragraphe vide.
 */
export function scinde(texte: string): { titre: string; suite: string } {
  const coupe = texte.search(/\.\s+/);
  if (coupe === -1) return { titre: insecable(texte.trim()), suite: "" };
  return {
    titre: insecable(texte.slice(0, coupe + 1).trim()),
    suite: insecable(texte.slice(coupe + 1).trim()),
  };
}

/**
 * Rend un texte en transformant le numéro de téléphone en lien `tel:`.
 *
 * La maquette l'écrit ainsi partout où elle cite le numéro dans une phrase
 * (« Ou appelez le 04 78 33 72 05. »). Sur mobile, un numéro qui n'est pas un
 * lien oblige à le recopier à la main : la règle R28 du client demande
 * explicitement un `tel:`.
 *
 * Le numéro est cherché TEL QUE LE CORPUS L'ÉCRIT, pas par une expression
 * rationnelle sur les chiffres : un millésime (« 2024 ») ou un nombre de pages
 * ne doit jamais devenir un lien d'appel.
 */
export function avecTelephone(texte: string, telephone: string): ReactNode {
  const propre = insecable(texte);
  if (!telephone || !propre.includes(telephone)) return propre;
  const morceaux = propre.split(telephone);
  return morceaux.flatMap((morceau, i) =>
    i === 0
      ? [morceau]
      : [
          <a
            key={`tel-${i}`}
            href={lienTelephone(telephone)}
            style={{ fontWeight: 600, color: "var(--ink)" }}
          >
            {telephone}
          </a>,
          morceau,
        ],
  );
}
