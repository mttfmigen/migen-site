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

  const groupes: GroupeLiens[] = [
    { titre: "Remonter d'un niveau", liens: parent ? [parent] : [] },
    { titre: "Dans cette rubrique", liens: enfants },
    { titre: "Pages voisines", liens: soeurs },
  ];

  return <ListeMaillage groupes={groupes} />;
}
