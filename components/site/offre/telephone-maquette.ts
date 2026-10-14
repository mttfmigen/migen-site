/**
 * LE TÉLÉPHONE QUE LA MAQUETTE MOBILE ÉCRIT, et lui seul.
 *
 * SOURCE, relevée et non supposée : `maquette/mobile-v2/maquette/Migen -
 * Mobile v2.dc.html` L493 compose son héros avec
 * `tel: "tel:" + ((P && P.phone) || "04 78 33 72 05")` et
 * `telL: (P && P.phone) || "04 78 33 72 05"`, et son écran photo-CTA (L127)
 * écrit `href="tel:0478337205"`. Le corpus lui-même porte ce numéro 753 fois
 * (`mobile-v2-data.js`, compte du 14/10). Ce n'est donc pas une donnée
 * inventée : c'est le numéro que le client écrit.
 *
 * LE HREF EST EN +33, comme l'en-tête du site (`Entete`, `tel:+33478337205`,
 * relevé sur la production le 14/10) : deux formes de lien pour un même numéro
 * seraient deux entrées distinctes dans les analyses d'appel.
 *
 * MODULE NEUTRE, sans directive : lisible d'un composant serveur comme d'un
 * composant client, même raison que `blocs/resume-de-section.ts`.
 */
export const TELEPHONE_AFFICHE = "04 78 33 72 05";
export const TELEPHONE_HREF = "tel:+33478337205";
