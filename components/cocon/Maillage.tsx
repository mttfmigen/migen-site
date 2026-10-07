import ListeMaillage, { type GroupeLiens } from "@/components/cocon/ListeMaillage";
import { maillage } from "@/lib/contenu";
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
export default async function Maillage({ page }: { page: LignePage }) {
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
