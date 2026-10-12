import type { Metadata } from "next";

import type { LigneSeo } from "@/types/lignes";

import { copieConforme } from "@/lib/decisions-copie";
import { urlAbsolue } from "@/lib/seo/url";
import { vignetteDeLaPage } from "@/lib/seo/vignette";

/**
 * Transformation d'une ligne `seo` en objet `Metadata` de Next.
 *
 * Le canonique est toujours posé, avec le slash final du chemin servi : laisser
 * Next le déduire ouvrirait la porte à deux URL pour une même page.
 */

const NOM_DU_SITE = "Migen";

export interface EntreeMetadonnees {
  /** La ligne `seo` de la page ou de l'article, quand elle existe. */
  seo: LigneSeo | null;
  /** Le chemin servi, avec slash final. */
  chemin: string;
  /**
   * Titre de repli si la ligne `seo` est absente : `titre_h1` pour une page,
   * `titre` pour un article.
   */
  titreRepli: string;
}

export function metadonneesSeo({
  seo,
  chemin,
  titreRepli,
}: EntreeMetadonnees): Metadata {
  const canonical = seo?.canonical ?? urlAbsolue(chemin);

  // Repli, et non cas normal : toute page publiée doit avoir sa ligne `seo`.
  // On sert alors le H1 comme titre, ce qui est un pis-aller : le meta title ne
  // doit pas dupliquer le H1. La porte de vérification du dépôt est là pour
  // signaler ces pages, elle n'est pas remplacée par ce repli.
  // La table `seo` date d'avant les décisions de copie (« candidats », 24/24…).
  const title = copieConforme(seo?.meta_title ?? titreRepli);
  const description = seo?.meta_description ? copieConforme(seo.meta_description) : undefined;
  // La vignette de partage n'est JAMAIS vide : à défaut de `og_image` et de
  // photo de couverture, c'est la vignette par défaut. Voir `lib/seo/vignette.ts`
  // pour l'ordre de priorité et pourquoi il ne peut pas vivre dans la mise en
  // page racine.
  const images = vignetteDeLaPage(chemin, seo?.og_image);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: NOM_DU_SITE,
      title,
      description,
      url: canonical,
      images,
    },
    // `follow` reste vrai même sur une page exclue de l'index : le robot suit
    // le maillage et découvre les pages indexables en aval.
    robots: { index: !seo?.noindex, follow: true },
  };
}
