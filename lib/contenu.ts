import "server-only";

import { cache } from "react";

import { lectureContenu } from "@/lib/supabase";
import type { LigneArticle, LignePage, LigneSeo } from "@/types/base";

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
    .order("path")
    .returns<{ path: string; updated_at: string }[]>();

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
    .in("path", chemins)
    .returns<{ path: string; titre_h1: string }[]>();

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
      .maybeSingle()
      .returns<Noeud | null>();
    if (error) throw new Error(`Parent de ${page.path} : ${error.message}`);
    return data;
  };

  const lireEnfants = async (): Promise<Noeud[]> => {
    const { data, error } = await client
      .from("pages")
      .select("path, titre_h1")
      .eq("parent_id", page.id)
      .order("path")
      .returns<Noeud[]>();
    if (error) throw new Error(`Enfants de ${page.path} : ${error.message}`);
    return data ?? [];
  };

  const lireFratrie = async (): Promise<NoeudIdentifie[]> => {
    if (!page.parent_id) return [];
    const { data, error } = await client
      .from("pages")
      .select("id, path, titre_h1")
      .eq("parent_id", page.parent_id)
      .order("path")
      .returns<NoeudIdentifie[]>();
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

/** « depannage-industriel » devient « Depannage industriel ». Repli de libellé. */
function humanise(segment: string): string {
  const mot = segment.replace(/-/g, " ");
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}
