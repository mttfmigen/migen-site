import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Rend le Markdown en ligne que porte le corpus : les liens et le gras.
 *
 * POURQUOI CE COMPOSANT EXISTE. Le corpus écrit son maillage interne dans le
 * texte, « confiez votre [contrat de maintenance](/offres/zero-arret/) », et il
 * en compte près de six cents. Rendu tel quel, ce texte affiche ses crochets et
 * ses parenthèses au visiteur, et le cocon perd tous ses liens d'un coup : ce
 * maillage est la raison d'être de l'arborescence.
 *
 * POURQUOI PAS UNE BIBLIOTHÈQUE. Deux constructions suffisent, le lien et le
 * gras, et elles ne sont pas près de changer : le corpus est écrit, relu et
 * figé. Un rendu Markdown complet embarquerait un analyseur de plusieurs
 * dizaines de kilo-octets pour deux motifs, et ouvrirait la porte au HTML brut
 * dans un contenu éditorial, donc à l'injection.
 *
 * SÉCURITÉ. Seuls les chemins INTERNES sont rendus en lien. Un `javascript:`,
 * un `//autre-site`, un `http://`, un antislash : le libellé est rendu en texte
 * et la cible est jetée. La règle est la même que celle de `proxy.ts` sur la
 * colonne `redirects.destination`, et pour la même raison : un contenu
 * éditorial n'a pas à pouvoir expédier un visiteur ailleurs sous l'autorité du
 * domaine. React échappe déjà le texte, il n'y a aucun `dangerouslySetInnerHTML`
 * ici et il ne doit jamais y en avoir.
 */

/** `[libellé](/chemin/)` ou `**gras**`, dans l'ordre où ils apparaissent. */
const MOTIF = /\[([^\]]+)\]\(([^)]*)\)|\*\*([^*]+)\*\*/g;

/**
 * La cible est-elle un chemin interne, et rien d'autre ?
 *
 * Un seul slash en tête, pas de `//` qui ferait changer d'hôte, pas
 * d'antislash que l'analyseur d'URL lirait comme un séparateur.
 */
export function estCheminInterne(href: string): boolean {
  return (
    href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")
  );
}

export function enRichesse(texte: string | null | undefined): ReactNode[] {
  // Le texte vient d'un `jsonb` : un champ optionnel absent arrive en
  // `undefined`, et un champ nul en `null`. Ce composant est la feuille de
  // l'arbre de rendu, appelée depuis une quinzaine d'endroits : y planter le
  // garde coûte une ligne et évite que l'oubli d'un `?` dans un bloc fasse
  // tomber le rendu de la page entière. Le build l'a appris à ses dépens.
  if (!texte) return [];

  const morceaux: ReactNode[] = [];
  let curseur = 0;
  let n = 0;

  // `matchAll` plutôt qu'une boucle sur `exec` : pas d'état `lastIndex`
  // partagé entre deux appels, donc pas de rendu qui dépend du précédent.
  for (const m of texte.matchAll(MOTIF)) {
    const debut = m.index ?? 0;
    if (debut > curseur) morceaux.push(texte.slice(curseur, debut));
    curseur = debut + m[0].length;

    const [, libelle, href, gras] = m;

    if (gras !== undefined) {
      // RÉCURSION, et ce n'est pas du zèle : le corpus écrit
      // « **[cahier des charges](/offres/residence/cahier-des-charges/)** »,
      // un lien DANS le gras. L'alternance du motif capture le gras d'abord et
      // ne redescend pas dedans : seize liens du cocon sortaient en texte, avec
      // leurs crochets, sur six pages. Le gras ne peut pas contenir de gras,
      // la récursion s'arrête donc au premier niveau.
      morceaux.push(<strong key={`g${n++}`}>{enRichesse(gras)}</strong>);
      continue;
    }

    if (href !== undefined && estCheminInterne(href)) {
      morceaux.push(
        // `prefetch={false}` : une page de vente porte jusqu'à huit liens
        // internes, les précharger toutes ferait huit requêtes pour une
        // navigation que le visiteur ne fera peut-être pas.
        <Link key={`l${n++}`} href={href} prefetch={false}>
          {libelle}
        </Link>,
      );
      continue;
    }

    // Cible refusée : on garde le libellé, on jette le lien. Le texte reste
    // lisible, et rien ne sort du domaine.
    morceaux.push(libelle ?? m[0]);
  }

  if (curseur < texte.length) morceaux.push(texte.slice(curseur));
  return morceaux;
}

export default function TexteRiche({
  texte,
}: {
  texte: string | null | undefined;
}) {
  return <>{enRichesse(texte)}</>;
}
