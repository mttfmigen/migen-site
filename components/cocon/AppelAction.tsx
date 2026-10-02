import type { TypeCta } from "@/types/lignes";

/**
 * Appel à l'action de fin de page.
 *
 * Le libellé suit `pages.cta_type` : une page de dépannage ne demande pas la
 * même chose qu'une page de recrutement. Aucun délai chiffré ni aucune
 * promesse commerciale n'est écrit ici, ce sont des interdits de rédaction du
 * projet.
 */
const APPELS: Record<TypeCta, { titre: string; bouton: string }> = {
  devis: { titre: "Chiffrer votre besoin", bouton: "Demander un devis" },
  intervention: {
    titre: "Faire intervenir un technicien",
    bouton: "Demander une intervention",
  },
  rappel: {
    titre: "Parler à un interlocuteur",
    bouton: "Demander un rappel",
  },
  diagnostic: {
    titre: "Faire le point sur votre maintenance",
    bouton: "Demander un diagnostic",
  },
  candidature: {
    titre: "Rejoindre les équipes Migen",
    bouton: "Déposer une candidature",
  },
};

export default function AppelAction({ cta }: { cta: TypeCta }) {
  const appel = APPELS[cta];

  return (
    <aside className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {appel.titre}
      </h2>
      <a
        href="#formulaire"
        className="mt-4 inline-flex h-11 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {appel.bouton}
      </a>
    </aside>
  );
}
