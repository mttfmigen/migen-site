import Link from "next/link";

import { filAriane } from "@/lib/contenu";

/**
 * Fil d'Ariane du cocon, composant serveur.
 *
 * `filAriane()` rend `path: null` pour un niveau sans page publiée : ce niveau
 * s'affiche en texte. Le visiteur voit la hiérarchie complète sans pouvoir
 * cliquer vers une 404.
 */
export default async function FilAriane({ path }: { path: string }) {
  const etapes = await filAriane(path);
  if (etapes.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 text-zinc-500 dark:text-zinc-400">
        <li>
          <Link href="/" className="underline-offset-2 hover:underline">
            Accueil
          </Link>
        </li>
        {etapes.map((etape, i) => {
          const dernier = i === etapes.length - 1;
          return (
            <li
              key={etape.path ?? `niveau-${i}`}
              className="flex items-center gap-x-2"
            >
              {/* Séparateur décoratif : masqué aux lecteurs d'écran, qui
                  annoncent déjà la structure de la liste. */}
              <span aria-hidden="true">/</span>
              {etape.path && !dernier ? (
                <Link
                  href={etape.path}
                  className="underline-offset-2 hover:underline"
                >
                  {etape.titre}
                </Link>
              ) : (
                <span
                  aria-current={dernier ? "page" : undefined}
                  className={
                    dernier ? "text-zinc-900 dark:text-zinc-100" : undefined
                  }
                >
                  {etape.titre}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
