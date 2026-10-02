import { lectureContenu } from "@/lib/supabase";

import ListeRubriques from "./ListeRubriques";

/**
 * Les rubriques de premier niveau, composant serveur.
 *
 * Partagé par l'accueil et la page 404 : les deux ont besoin de la même porte
 * d'entrée vers le cocon.
 *
 * La requête est écrite ici faute de fonction dédiée dans `lib/contenu.ts`,
 * hors du périmètre de ce lot. Elle a sa place là-bas le jour où ce fichier
 * est modifiable.
 *
 * L'erreur est absorbée volontairement : la 404 doit rester servie même si la
 * base est injoignable, sinon une page introuvable devient une erreur 500.
 * Elle est journalisée côté serveur, jamais tue.
 *
 * L'habillage est dans `ListeRubriques.tsx`, qui ne lit rien : voir le
 * commentaire de ce fichier pour la raison de la coupure.
 */
export default async function RubriquesNiveau1() {
  const { data, error } = await lectureContenu()
    .from("pages")
    .select("path, titre_h1")
    .eq("niveau", 1)
    .order("path");

  if (error) {
    console.error("Rubriques de niveau 1 indisponibles :", error.message);
    return null;
  }

  return <ListeRubriques rubriques={data ?? []} libelle="Rubriques du site" />;
}
