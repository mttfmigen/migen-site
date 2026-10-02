/**
 * Rendu du champ `pages.contenu` (jsonb).
 *
 * Provisoire et volontairement pauvre : le rendu définitif viendra avec la
 * maquette, qui dira quels blocs existent. Inventer ici un format de blocs
 * élaboré condamnerait à le défaire. On ne traite donc que les deux formes
 * qu'un import de contenu peut raisonnablement produire aujourd'hui, une
 * chaîne ou une liste de chaînes, et on n'affiche rien pour le reste plutôt
 * que d'afficher du jsonb brut au visiteur.
 */
function paragraphes(contenu: unknown): string[] {
  if (typeof contenu === "string") return [contenu];
  if (Array.isArray(contenu)) {
    return contenu.filter((bloc): bloc is string => typeof bloc === "string");
  }
  return [];
}

export default function Corps({ contenu }: { contenu: unknown }) {
  const textes = paragraphes(contenu);
  if (textes.length === 0) return null;

  return (
    <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {textes.map((texte, i) => (
        <p key={i}>{texte}</p>
      ))}
    </div>
  );
}
