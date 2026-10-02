import Link from "next/link";

import { maillage, type Lien } from "@/lib/contenu";
import type { LignePage } from "@/types/base";

/**
 * Maillage interne, composant serveur.
 *
 * Les liens sont des cartes cliquables et non des liens noyés dans un
 * paragraphe : la cible du lien reste visible et le maillage se lit au premier
 * coup d'œil, pour le visiteur comme pour un robot.
 */
export default async function Maillage({ page }: { page: LignePage }) {
  const { parent, enfants, soeurs } = await maillage(page);

  const groupes: { titre: string; liens: Lien[] }[] = [
    { titre: "Remonter d'un niveau", liens: parent ? [parent] : [] },
    { titre: "Dans cette rubrique", liens: enfants },
    { titre: "Pages voisines", liens: soeurs },
  ];
  const remplis = groupes.filter((groupe) => groupe.liens.length > 0);
  if (remplis.length === 0) return null;

  return (
    <nav aria-label="Pages liées" className="mt-12 space-y-8">
      {remplis.map((groupe) => (
        <section key={groupe.titre}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {groupe.titre}
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {groupe.liens.map((lien) => (
              <li key={lien.path}>
                <Link
                  href={lien.path}
                  className="block rounded-lg border border-zinc-200 p-4 text-base font-medium text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                >
                  {lien.titre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
