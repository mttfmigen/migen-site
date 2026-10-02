import type { LigneArticle, LignePage, LigneSeo } from "@/types/base";

import { urlAbsolue, urlImage } from "@/lib/seo/url";

/**
 * Fabriques de données structurées schema.org.
 *
 * Chaque fabrique rend un objet, jamais une chaîne : la sérialisation est un
 * sujet de rendu, et elle a sa fonction dédiée, `jsonLdTexte`.
 *
 * Les types sont écrits à la main plutôt qu'importés d'une bibliothèque de
 * typage schema.org : cinq formes suffisent, et une dépendance de plus pour
 * cela ne se justifie pas.
 */

interface Contexte {
  "@context": "https://schema.org";
}

interface Adresse {
  "@type": "PostalAddress";
  addressLocality: string;
  addressRegion: string;
  addressCountry: "FR";
}

interface CorpsOrganisation {
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  telephone: string;
  address: Adresse;
}

export type Organisation = Contexte & CorpsOrganisation;

export interface ElementFilAriane {
  titre: string;
  /** `null` pour un niveau intermédiaire sans page publiée. */
  chemin: string | null;
}

export interface FilArianeJsonLd extends Contexte {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[];
}

export interface ServiceJsonLd extends Contexte {
  "@type": "Service";
  name: string;
  url: string;
  description?: string;
  provider: CorpsOrganisation;
  areaServed: { "@type": "Country"; name: "France" };
}

export interface ArticleJsonLd extends Contexte {
  "@type": "Article";
  headline: string;
  url: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified: string;
  author: { "@type": "Person"; name: string } | CorpsOrganisation;
  publisher: CorpsOrganisation;
}

/**
 * ADRESSE PROVISOIRE, À COMPLÉTER PAR MIGEN.
 *
 * Seule la commune est connue avec certitude. La voie et le code postal ne sont
 * volontairement pas renseignés : publier une adresse postale inventée dans des
 * données structurées serait une fausse donnée servie à Google.
 */
const ADRESSE_PLACEHOLDER: Adresse = {
  "@type": "PostalAddress",
  addressLocality: "Écully",
  addressRegion: "Auvergne-Rhône-Alpes",
  addressCountry: "FR",
};

/** Forme internationale du numéro affiché sur le site, 04 78 33 72 05. */
const TELEPHONE = "+33 4 78 33 72 05";

const LOGO = "/logo-migen.png";

/**
 * Le corps de l'organisation, sans `@context`.
 *
 * Un nœud imbriqué (le `provider` d'un service, le `publisher` d'un article) ne
 * doit pas répéter le contexte : seul le nœud racine le porte.
 */
function corpsOrganisation(): CorpsOrganisation {
  return {
    "@type": "Organization",
    name: "Migen",
    url: urlAbsolue("/"),
    logo: urlAbsolue(LOGO),
    telephone: TELEPHONE,
    address: ADRESSE_PLACEHOLDER,
  };
}

/** L'organisation, en nœud racine. À poser une fois, dans la mise en page. */
export function organisation(): Organisation {
  return { "@context": "https://schema.org", ...corpsOrganisation() };
}

/**
 * Le fil d'Ariane.
 *
 * Un niveau sans page publiée garde sa position et son libellé mais n'expose
 * pas d'`item` : schema.org l'autorise, et cela vaut mieux qu'un lien vers une
 * page absente.
 */
export function filAriane(items: ElementFilAriane[]): FilArianeJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.titre,
      ...(item.chemin ? { item: urlAbsolue(item.chemin) } : {}),
    })),
  };
}

/** Une page d'offre, décrite en service. */
export function service(page: LignePage, seo: LigneSeo | null): ServiceJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.titre_h1,
    url: seo?.canonical ?? urlAbsolue(page.path),
    ...(seo?.meta_description ? { description: seo.meta_description } : {}),
    provider: corpsOrganisation(),
    areaServed: { "@type": "Country", name: "France" },
  };
}

/**
 * Un article.
 *
 * Le chemin est passé par l'appelant : il dépend de la page pilier, que cette
 * fabrique n'a pas à aller chercher en base (voir `cheminArticle`).
 */
export function article(
  ligne: LigneArticle,
  seo: LigneSeo | null,
  chemin: string,
): ArticleJsonLd {
  const editeur = corpsOrganisation();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ligne.titre,
    url: seo?.canonical ?? urlAbsolue(chemin),
    ...(seo?.meta_description ? { description: seo.meta_description } : {}),
    ...(seo?.og_image ? { image: urlImage(seo.og_image) } : {}),
    ...(ligne.published_at ? { datePublished: ligne.published_at } : {}),
    dateModified: ligne.updated_at,
    author: ligne.auteur
      ? { "@type": "Person", name: ligne.auteur }
      : editeur,
    publisher: editeur,
  };
}

/**
 * Le texte à placer dans un `<script type="application/ld+json">`.
 *
 * Échapper `<` suffit à rendre impossible la fermeture prématurée de la balise
 * (`</script>` dans une chaîne du contenu), donc toute injection par ce canal.
 * React n'échappe rien à l'intérieur de `dangerouslySetInnerHTML`, c'est donc
 * bien ici que la protection doit vivre.
 */
export function jsonLdTexte(donnees: object): string {
  return JSON.stringify(donnees).replace(/</g, "\\u003c");
}
