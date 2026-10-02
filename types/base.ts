/**
 * Types du schéma Supabase.
 *
 * Écrits à la main tant que le projet Supabase n'existe pas. Dès qu'il est
 * créé et les migrations appliquées, ce fichier se régénère :
 *
 *   bun run types:base
 *
 * Les noms de colonnes suivent la base, donc le français du brief. Les types
 * dérivés exposés au reste de l'application vivent dans `types/contenu.ts`.
 */

export type StatutPublication = "draft" | "review" | "published";
export type TypeCta = "devis" | "intervention" | "rappel" | "diagnostic" | "candidature";
export type TypeSchema =
  | "WebPage"
  | "Service"
  | "Article"
  | "FAQPage"
  | "CollectionPage"
  | "Organization";
export type PlateformeAds = "google" | "linkedin" | "openai";
export type SourceIngestion =
  | "gsc"
  | "ga4"
  | "google_ads"
  | "linkedin_ads"
  | "openai_ads"
  | "hubspot";
export type StatutIngestion = "en_cours" | "succes" | "echec";

export interface LignePage {
  id: string;
  parent_id: string | null;
  niveau: number;
  slug: string;
  path: string;
  titre_h1: string;
  contenu: unknown;
  mot_cle_principal: string | null;
  mots_cles_secondaires: string[];
  persona_cible: string[];
  cta_type: TypeCta;
  statut: StatutPublication;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LigneArticle {
  id: string;
  slug: string;
  titre: string;
  contenu: unknown;
  page_pilier_id: string | null;
  mot_cle_principal: string | null;
  score_thot: number | null;
  thot_analysis_id: string | null;
  auteur: string | null;
  statut: StatutPublication;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LigneSeo {
  id: string;
  page_id: string | null;
  article_id: string | null;
  meta_title: string;
  meta_description: string;
  canonical: string | null;
  og_image: string | null;
  noindex: boolean;
  schema_type: TypeSchema;
  created_at: string;
  updated_at: string;
}

export interface LigneCasClient {
  id: string;
  slug: string;
  client: string;
  secteur: string | null;
  logo: string | null;
  probleme: string | null;
  intervention: string | null;
  resultats: string | null;
  chiffres_cles: unknown;
  statut: StatutPublication;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LigneRedirection {
  id: string;
  source: string;
  destination: string;
  code: number;
  actif: boolean;
  created_at: string;
}

export interface LigneConsentement {
  id: string;
  visitor_id: string;
  choix: Record<string, boolean>;
  version_bandeau: string;
  user_agent: string | null;
  created_at: string;
}

export interface LigneLead {
  id: string;
  id_hubspot: string | null;
  date: string;
  page_entree: string | null;
  page_conversion: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  formulaire: string;
  statut_deal: string | null;
  montant_deal_centimes: number | null;
  created_at: string;
  updated_at: string;
}

export interface LigneIngestion {
  id: string;
  source: SourceIngestion;
  started_at: string;
  ended_at: string | null;
  statut: StatutIngestion;
  lignes_ecrites: number | null;
  erreur: string | null;
}

/** Table en lecture seule pour le client : insertion et mise à jour côté serveur. */
type Table<Ligne, Insert = Partial<Ligne>> = {
  Row: Ligne;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export interface BaseDeDonnees {
  public: {
    Tables: {
      pages: Table<LignePage>;
      articles: Table<LigneArticle>;
      seo: Table<LigneSeo>;
      business_cases: Table<LigneCasClient>;
      redirects: Table<LigneRedirection>;
      consent_logs: Table<
        LigneConsentement,
        Omit<LigneConsentement, "id" | "created_at">
      >;
      leads: Table<LigneLead>;
      ingestion_runs: Table<LigneIngestion>;
      metrics_gsc_daily: Table<{
        date: string;
        page_path: string;
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
        ingested_at: string;
      }>;
      metrics_ga4_daily: Table<{
        date: string;
        page_path: string;
        source: string;
        medium: string;
        campaign: string;
        sessions: number;
        engaged_sessions: number;
        conversions: number;
        ingested_at: string;
      }>;
      metrics_ads_daily: Table<{
        date: string;
        plateforme: PlateformeAds;
        campagne: string;
        impressions: number;
        clics: number;
        cout_centimes: number;
        conversions: number;
        ingested_at: string;
      }>;
      membres_console: Table<{ user_id: string; email: string; cree_le: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      statut_publication: StatutPublication;
      type_cta: TypeCta;
      type_schema: TypeSchema;
      plateforme_ads: PlateformeAds;
      source_ingestion: SourceIngestion;
      statut_ingestion: StatutIngestion;
    };
    CompositeTypes: Record<string, never>;
  };
}
