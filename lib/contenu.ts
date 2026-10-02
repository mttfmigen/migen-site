import "server-only";

import { cache } from "react";

import { cheminArticle } from "@/lib/seo/url";
import { lectureContenu } from "@/lib/supabase";
import type { LigneArticle, LignePage, LigneSeo } from "@/types/lignes";

/**
 * Lecture du cocon : une page, son SEO, son fil d'Ariane et son maillage.
 *
 * Toutes ces fonctions sont appelées au build (SSG) ou à la revalidation (ISR).
 * Aucune n'est destinée au navigateur.
 */

export interface PageComplete {
  page: LignePage;
  seo: LigneSeo | null;
}

export interface Lien {
  path: string;
  titre: string;
}

export interface Maillage {
  parent: Lien | null;
  enfants: Lien[];
  soeurs: Lien[];
}

/** Un chemin canonique : minuscules, slash au début et à la fin, sans doublon. */
export function cheminCanonique(segments: string[] | string): string {
  const brut = Array.isArray(segments) ? segments.join("/") : segments;
  const propre = brut
    .toLowerCase()
    .split("/")
    .filter(Boolean)
    .join("/");
  return propre ? `/${propre}/` : "/";
}

/**
 * La page publiée servie à ce chemin, avec son bloc SEO.
 *
 * Enveloppée dans `cache()` de React : chaque rendu l'appelle deux fois, une
 * fois depuis `generateMetadata` et une fois depuis le composant. Sans
 * déduplication, c'est un aller-retour Supabase de trop par page, au build comme
 * à chaque revalidation. Le cache est propre à un rendu, il n'introduit donc
 * aucune donnée périmée entre deux requêtes.
 */
export const pageParChemin = cache(
  async (path: string): Promise<PageComplete | null> => {
    const { data, error } = await lectureContenu()
      .from("pages")
      .select("*, seo(*)")
      .eq("path", path)
      .maybeSingle();

    if (error) throw new Error(`Lecture de ${path} : ${error.message}`);
    if (!data) return null;

    // La jointure remonte un tableau quand la relation n'est pas déclarée 1-1.
    const { seo, ...page } = data as LignePage & {
      seo: LigneSeo | LigneSeo[] | null;
    };
    return {
      page,
      seo: Array.isArray(seo) ? (seo[0] ?? null) : seo,
    };
  },
);

/** Tous les chemins publiés, pour `generateStaticParams` et le plan du site. */
export async function cheminsPublies(): Promise<
  { path: string; updated_at: string }[]
> {
  const { data, error } = await lectureContenu()
    .from("pages")
    .select("path, updated_at")
    .order("path");

  if (error) throw new Error(`Liste des chemins : ${error.message}`);
  return data ?? [];
}

/**
 * Fil d'Ariane, déduit du chemin et non d'une table dédiée.
 *
 * Un niveau intermédiaire sans page publiée apparaît sans lien plutôt que de
 * mener à une 404 : le visiteur voit la hiérarchie, il ne tombe pas dedans.
 */
export async function filAriane(
  path: string,
): Promise<{ titre: string; path: string | null }[]> {
  const segments = path.split("/").filter(Boolean);
  const chemins = segments.map(
    (_, i) => `/${segments.slice(0, i + 1).join("/")}/`,
  );
  if (chemins.length === 0) return [];

  const { data, error } = await lectureContenu()
    .from("pages")
    .select("path, titre_h1")
    .in("path", chemins);

  if (error) throw new Error(`Fil d'Ariane de ${path} : ${error.message}`);

  const connues = new Map((data ?? []).map((p) => [p.path, p.titre_h1]));
  return chemins.map((c, i) => {
    const titre = connues.get(c);
    return {
      titre: titre ?? humanise(segments[i]),
      path: titre ? c : null,
    };
  });
}

/**
 * Maillage interne : le parent, les enfants, et deux à quatre sœurs.
 *
 * Les sœurs sont prises dans l'ordre du chemin autour de la page courante, pas
 * au hasard : deux visites de la même page proposent les mêmes liens, et le
 * maillage reste stable d'un build à l'autre.
 */
export async function maillage(page: LignePage, maxSoeurs = 4): Promise<Maillage> {
  const client = lectureContenu();

  type Noeud = { path: string; titre_h1: string };
  type NoeudIdentifie = Noeud & { id: string };

  // Chaque lecture est enveloppée dans sa propre fonction : les constructeurs
  // de requête de Supabase ne sont pas des promesses ordinaires, et les mêler
  // à un repli `Promise.resolve` dans un `Promise.all` rend le type illisible.
  const lireParent = async (): Promise<Noeud | null> => {
    if (!page.parent_id) return null;
    const { data, error } = await client
      .from("pages")
      .select("path, titre_h1")
      .eq("id", page.parent_id)
      .maybeSingle();
    if (error) throw new Error(`Parent de ${page.path} : ${error.message}`);
    return data;
  };

  const lireEnfants = async (): Promise<Noeud[]> => {
    const { data, error } = await client
      .from("pages")
      .select("path, titre_h1")
      .eq("parent_id", page.id)
      .order("path");
    if (error) throw new Error(`Enfants de ${page.path} : ${error.message}`);
    return data ?? [];
  };

  const lireFratrie = async (): Promise<NoeudIdentifie[]> => {
    if (!page.parent_id) return [];
    const { data, error } = await client
      .from("pages")
      .select("id, path, titre_h1")
      .eq("parent_id", page.parent_id)
      .order("path");
    if (error) throw new Error(`Fratrie de ${page.path} : ${error.message}`);
    return data ?? [];
  };

  const [parent, enfants, fratrie] = await Promise.all([
    lireParent(),
    lireEnfants(),
    lireFratrie(),
  ]);

  const vers = (n: Noeud): Lien => ({ path: n.path, titre: n.titre_h1 });

  // Fenêtre glissante autour de la page courante, et non un tirage au hasard :
  // deux visites de la même page proposent les mêmes sœurs, et le maillage
  // reste stable d'un build à l'autre.
  const soeurs = fratrie.filter((s) => s.id !== page.id);
  const depart = Math.max(0, fratrie.findIndex((s) => s.id === page.id));
  const fenetre = soeurs
    .slice(depart, depart + maxSoeurs)
    .concat(soeurs.slice(0, Math.max(0, depart + maxSoeurs - soeurs.length)))
    .slice(0, maxSoeurs);

  return {
    parent: parent ? vers(parent) : null,
    enfants: enfants.map(vers),
    soeurs: fenetre.map(vers),
  };
}

/** Les articles publiés rattachés à une page pilier. */
export async function articlesDuPilier(pageId: string): Promise<LigneArticle[]> {
  const { data, error } = await lectureContenu()
    .from("articles")
    .select("*")
    .eq("page_pilier_id", pageId)
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Articles du pilier ${pageId} : ${error.message}`);
  return data ?? [];
}

/**
 * L'article publié servi à ce chemin, s'il y en a un.
 *
 * L'URL d'un article SUIT SON PILIER, règle posée par `cheminArticle()` dans
 * `lib/seo/url.ts` : un article rattaché à « /offres/depannage-industriel/ »
 * est servi à « /offres/depannage-industriel/mon-article/ ». Le silo du cocon
 * se lit donc dans l'URL, ce qu'un préfixe plat « /blog/ » perdrait.
 *
 * DEUX GARDES, et elles comptent :
 *   · la route essaie `pages` AVANT d'appeler cette fonction. Une page gagne
 *     donc toujours contre un article de même chemin, et aucun article ne peut
 *     masquer une rubrique ;
 *   · le pilier lu en base doit correspondre au chemin demandé. Sans cette
 *     vérification, un article de slug « astreinte » répondrait sous n'importe
 *     quel parent, et le même contenu serait servi à plusieurs URL.
 */
export const articleParChemin = cache(
  async (
    path: string,
  ): Promise<{ article: LigneArticle; seo: LigneSeo | null } | null> => {
    const segments = path.split("/").filter(Boolean);
    // Un article a toujours un pilier : au moins un segment avant son slug.
    if (segments.length < 2) return null;

    const slug = segments[segments.length - 1];
    const cheminPilier = `/${segments.slice(0, -1).join("/")}/`;

    const { data, error } = await lectureContenu()
      .from("articles")
      .select("*, seo(*), pilier:pages!articles_page_pilier_id_fkey(path)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`Lecture de l'article ${slug} : ${error.message}`);
    if (!data) return null;

    const { seo, pilier, ...article } = data as LigneArticle & {
      seo: LigneSeo | LigneSeo[] | null;
      pilier: { path: string } | { path: string }[] | null;
    };
    const chemin = Array.isArray(pilier) ? pilier[0]?.path : pilier?.path;
    if (chemin !== cheminPilier) return null;

    return { article, seo: Array.isArray(seo) ? (seo[0] ?? null) : seo };
  },
);

/**
 * Les chemins des articles publiés, pour le rendu statique et le plan du site.
 *
 * Un article sans pilier publié est OMIS : son URL n'est pas déductible, et
 * l'annoncer au plan du site livrerait une URL morte à Google.
 */
export async function cheminsArticles(): Promise<
  { path: string; updated_at: string; noindex: boolean }[]
> {
  const { data, error } = await lectureContenu()
    .from("articles")
    .select("slug, updated_at, seo(noindex), pilier:pages!articles_page_pilier_id_fkey(path)")
    .order("slug");

  if (error) throw new Error(`Liste des articles : ${error.message}`);

  return (data ?? []).flatMap((a) => {
    const brut = a as unknown as {
      slug: string;
      updated_at: string;
      seo: { noindex: boolean } | { noindex: boolean }[] | null;
      pilier: { path: string } | { path: string }[] | null;
    };
    const pilier = Array.isArray(brut.pilier) ? brut.pilier[0] : brut.pilier;
    if (!pilier?.path) return [];
    const seo = Array.isArray(brut.seo) ? brut.seo[0] : brut.seo;
    return [
      {
        path: cheminArticle(brut.slug, pilier.path),
        updated_at: brut.updated_at,
        noindex: seo?.noindex ?? false,
      },
    ];
  });
}

/** « depannage-industriel » devient « Depannage industriel ». Repli de libellé. */
function humanise(segment: string): string {
  const mot = segment.replace(/-/g, " ");
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}
