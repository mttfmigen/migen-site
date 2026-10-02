import type { Metadata } from "next";
import Link from "next/link";

import RubriquesNiveau1 from "@/components/cocon/RubriquesNiveau1";

export const metadata: Metadata = {
  title: "Page introuvable",
  // Une 404 ne doit pas entrer dans l'index.
  robots: { index: false, follow: true },
};

export default function PageIntrouvable() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
        L&apos;adresse demandée ne correspond à aucune page du site. Le lien
        suivi est peut-être incomplet, ou la page a changé d&apos;adresse.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="text-base text-zinc-900 underline underline-offset-4 hover:no-underline dark:text-zinc-100"
        >
          Revenir à l&apos;accueil
        </Link>
      </p>
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Les rubriques du site
        </h2>
        <div className="mt-3">
          <RubriquesNiveau1 />
        </div>
      </div>
    </main>
  );
}
