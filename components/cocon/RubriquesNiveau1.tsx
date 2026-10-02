import Link from "next/link";

import { lectureContenu } from "@/lib/supabase";

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
 */
export default async function RubriquesNiveau1() {
  const { data, error } = await lectureContenu()
    .from("pages")
    .select("path, titre_h1")
    .eq("niveau", 1)
    .order("path")
    // `.returns` est nécessaire tant que `types/base.ts` est écrit à la main :
    // sans les métadonnées attendues par supabase-js, un `select` résout les
    // lignes en `never`. Même contournement que dans `lib/contenu.ts`.
    .returns<{ path: string; titre_h1: string }[]>();

  if (error) {
    console.error("Rubriques de niveau 1 indisponibles :", error.message);
    return null;
  }

  const rubriques = data ?? [];
  if (rubriques.length === 0) return null;

  return (
    <nav aria-label="Rubriques du site">
      <ul className="space-y-2">
        {rubriques.map((rubrique) => (
          <li key={rubrique.path}>
            <Link
              href={rubrique.path}
              className="text-base text-zinc-900 underline underline-offset-4 hover:no-underline dark:text-zinc-100"
            >
              {rubrique.titre_h1}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
