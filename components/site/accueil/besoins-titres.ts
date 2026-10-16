/**
 * Le sur-titre et le titre de « Partez de votre besoin », écrits une fois.
 *
 * Servis au pavage du bureau (`BentoBesoins`, composant client) et à la FAQ du
 * téléphone (`BesoinsMobile`, composant serveur). Module NEUTRE, sans directive
 * et sans autre import : une constante lue dans un module « use client »
 * arriverait au serveur en référence client, pas en texte, et ce module-ci
 * n'alourdit pas le paquet client.
 */
export const SURTITRE_BESOINS = "Partez de votre besoin";
export const TITRE_BESOINS = "Dites la phrase qui ressemble le plus à votre situation.";
