import type { Metadata } from "next";

import type { LigneSeo } from "@/types/lignes";

import { copieConforme } from "@/lib/decisions-copie";
import { urlAbsolue, urlImage } from "@/lib/seo/url";

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
  const image = seo?.og_image ? urlImage(seo.og_image) : undefined;

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
      images: image ? [{ url: image }] : undefined,
    },
    // `follow` reste vrai même sur une page exclue de l'index : le robot suit
    // le maillage et découvre les pages indexables en aval.
    robots: { index: !seo?.noindex, follow: true },
  };
}
