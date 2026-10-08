import ListeMaillage, { type GroupeLiens } from "@/components/cocon/ListeMaillage";
import { maillage } from "@/lib/contenu";
import { estEditorial } from "@/types/editorial";
import type { LignePage } from "@/types/lignes";

/**
 * Maillage interne, composant serveur.
 *
 * Les liens sont des cartes cliquables et non des liens noyés dans un
 * paragraphe : la cible du lien reste visible et le maillage se lit au premier
 * coup d'œil, pour le visiteur comme pour un robot.
 *
 * Ce fichier ne fait que lire la base. L'habillage, porté de la maquette, est
 * dans `ListeMaillage.tsx` : il se rend sans base, donc il se contrôle sans
 * base (`components/cocon/verification-maillage.tsx`).
 */
/**
 * LES SEULES PAGES OÙ LA MAQUETTE MONTRE CE BLOC, transcrites le 07/10 des 210
 * captures : « Pages liées » y apparaît 3 fois sur 210, et Mehdi a tranché le
 * soir même en désignant ce bloc sur l'aperçu : il n'existe pas ailleurs.
 * Le composant reste monté par les douze gabarits, c'est LUI qui refuse de se
 * rendre hors de cette liste : un seul endroit à tenir à jour si la maquette
 * l'ajoute à d'autres pages.
 */
const PAGES_AVEC_MAILLAGE = new Set([
  "/ressources/",
  "/guides/choisir-une-entreprise-de-maintenance/",
  "/guides/reussir-un-transfert-industriel/",
]);

export default async function Maillage({ page }: { page: LignePage }) {
  if (!PAGES_AVEC_MAILLAGE.has(page.path)) return null;
  /* 08/10 : ces trois pages portent leurs « Pages liées » mot pour mot de la
     capture, dans leur vue `edito`, rendue par `PageEditoriale` à sa place
     (avant le formulaire `#cx-form`, l'ordre de la capture). Le maillage
     calculé ne s'y ajoute pas ; il ne reste qu'un repli si la vue manque. */
  if (estEditorial(page.contenu) && page.contenu.edito) return null;
  const { parent, enfants, soeurs } = await maillage(page);

  /*
   * UN SEUL GROUPE, SANS INTERTITRE, et c'est une correction de fond.
   *
   * Ce bloc portait trois intitulés : « Remonter d'un niveau », « Dans cette
   * rubrique », « Pages voisines ». Mesuré le 07/10 sur les 210 captures de la
   * maquette : ces trois phrases y apparaissent ZÉRO fois. Nous les avions
   * écrites nous-mêmes, et la règle du dépôt est que rien ne s'invente.
   *
   * Là où la maquette porte ce bloc (3 pages sur 210 : /ressources/ et les deux
   * guides), elle liste à plat sous « Pages liées », sans sous-rubrique.
   *
   * LES LIENS NE BOUGENT PAS. Ils sont tous rendus, dans l'ordre parent, puis
   * enfants, puis soeurs : le cocon garde ses liens internes, qui sont la
   * raison d'être de l'arborescence. Seule la copie inventée disparaît.
   *
   * RESTE À TRANCHER PAR MEHDI : la maquette ne met ce bloc que sur 3 pages,
   * nous le montons sur douze gabarits. Le retirer alignerait le site sur la
   * maquette mais supprimerait plusieurs centaines de liens internes. Arbitrage
   * posé le 07/10, non tranché.
   */
  const groupes: GroupeLiens[] = [
    { liens: [...(parent ? [parent] : []), ...enfants, ...soeurs] },
  ];

  return <ListeMaillage groupes={groupes} />;
}
