export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          auteur: string | null
          contenu: Json
          created_at: string
          id: string
          mot_cle_principal: string | null
          page_pilier_id: string | null
          published_at: string | null
          score_thot: number | null
          slug: string
          statut: Database["public"]["Enums"]["statut_publication"]
          thot_analysis_id: string | null
          titre: string
          updated_at: string
        }
        Insert: {
          auteur?: string | null
          contenu?: Json
          created_at?: string
          id?: string
          mot_cle_principal?: string | null
          page_pilier_id?: string | null
          published_at?: string | null
          score_thot?: number | null
          slug: string
          statut?: Database["public"]["Enums"]["statut_publication"]
          thot_analysis_id?: string | null
          titre: string
          updated_at?: string
        }
        Update: {
          auteur?: string | null
          contenu?: Json
          created_at?: string
          id?: string
          mot_cle_principal?: string | null
          page_pilier_id?: string | null
          published_at?: string | null
          score_thot?: number | null
          slug?: string
          statut?: Database["public"]["Enums"]["statut_publication"]
          thot_analysis_id?: string | null
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_page_pilier_id_fkey"
            columns: ["page_pilier_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_cases: {
        Row: {
          chiffres_cles: Json
          client: string
          created_at: string
          id: string
          intervention: string | null
          logo: string | null
          probleme: string | null
          published_at: string | null
          resultats: string | null
          secteur: string | null
          slug: string
          statut: Database["public"]["Enums"]["statut_publication"]
          updated_at: string
        }
        Insert: {
          chiffres_cles?: Json
          client: string
          created_at?: string
          id?: string
          intervention?: string | null
          logo?: string | null
          probleme?: string | null
          published_at?: string | null
          resultats?: string | null
          secteur?: string | null
          slug: string
          statut?: Database["public"]["Enums"]["statut_publication"]
          updated_at?: string
        }
        Update: {
          chiffres_cles?: Json
          client?: string
          created_at?: string
          id?: string
          intervention?: string | null
          logo?: string | null
          probleme?: string | null
          published_at?: string | null
          resultats?: string | null
          secteur?: string | null
          slug?: string
          statut?: Database["public"]["Enums"]["statut_publication"]
          updated_at?: string
        }
        Relationships: []
      }
      consent_logs: {
        Row: {
          choix: Json
          created_at: string
          id: string
          user_agent: string | null
          version_bandeau: string
          visitor_id: string
        }
        Insert: {
          choix: Json
          created_at?: string
          id?: string
          user_agent?: string | null
          version_bandeau: string
          visitor_id: string
        }
        Update: {
          choix?: Json
          created_at?: string
          id?: string
          user_agent?: string | null
          version_bandeau?: string
          visitor_id?: string
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          ended_at: string | null
          erreur: string | null
          id: string
          lignes_ecrites: number | null
          source: Database["public"]["Enums"]["source_ingestion"]
          started_at: string
          statut: Database["public"]["Enums"]["statut_ingestion"]
        }
        Insert: {
          ended_at?: string | null
          erreur?: string | null
          id?: string
          lignes_ecrites?: number | null
          source: Database["public"]["Enums"]["source_ingestion"]
          started_at?: string
          statut?: Database["public"]["Enums"]["statut_ingestion"]
        }
        Update: {
          ended_at?: string | null
          erreur?: string | null
          id?: string
          lignes_ecrites?: number | null
          source?: Database["public"]["Enums"]["source_ingestion"]
          started_at?: string
          statut?: Database["public"]["Enums"]["statut_ingestion"]
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          date: string
          formulaire: string
          id: string
          id_hubspot: string | null
          montant_deal_centimes: number | null
          page_conversion: string | null
          page_entree: string | null
          statut_deal: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          formulaire: string
          id?: string
          id_hubspot?: string | null
          montant_deal_centimes?: number | null
          page_conversion?: string | null
          page_entree?: string | null
          statut_deal?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          formulaire?: string
          id?: string
          id_hubspot?: string | null
          montant_deal_centimes?: number | null
          page_conversion?: string | null
          page_entree?: string | null
          statut_deal?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      membres_console: {
        Row: {
          cree_le: string
          email: string
          user_id: string
        }
        Insert: {
          cree_le?: string
          email: string
          user_id: string
        }
        Update: {
          cree_le?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      metrics_ads_daily: {
        Row: {
          campagne: string
          clics: number
          conversions: number
          cout_centimes: number
          date: string
          impressions: number
          ingested_at: string
          plateforme: Database["public"]["Enums"]["plateforme_ads"]
        }
        Insert: {
          campagne: string
          clics?: number
          conversions?: number
          cout_centimes?: number
          date: string
          impressions?: number
          ingested_at?: string
          plateforme: Database["public"]["Enums"]["plateforme_ads"]
        }
        Update: {
          campagne?: string
          clics?: number
          conversions?: number
          cout_centimes?: number
          date?: string
          impressions?: number
          ingested_at?: string
          plateforme?: Database["public"]["Enums"]["plateforme_ads"]
        }
        Relationships: []
      }
      metrics_ga4_daily: {
        Row: {
          campaign: string
          conversions: number
          date: string
          engaged_sessions: number
          ingested_at: string
          medium: string
          page_path: string
          sessions: number
          source: string
        }
        Insert: {
          campaign?: string
          conversions?: number
          date: string
          engaged_sessions?: number
          ingested_at?: string
          medium?: string
          page_path: string
          sessions?: number
          source?: string
        }
        Update: {
          campaign?: string
          conversions?: number
          date?: string
          engaged_sessions?: number
          ingested_at?: string
          medium?: string
          page_path?: string
          sessions?: number
          source?: string
        }
        Relationships: []
      }
      metrics_gsc_daily: {
        Row: {
          clicks: number
          ctr: number
          date: string
          impressions: number
          ingested_at: string
          page_path: string
          position: number
          query: string
        }
        Insert: {
          clicks?: number
          ctr?: number
          date: string
          impressions?: number
          ingested_at?: string
          page_path: string
          position?: number
          query: string
        }
        Update: {
          clicks?: number
          ctr?: number
          date?: string
          impressions?: number
          ingested_at?: string
          page_path?: string
          position?: number
          query?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          contenu: Json
          created_at: string
          cta_type: Database["public"]["Enums"]["type_cta"]
          id: string
          mot_cle_principal: string | null
          mots_cles_secondaires: string[]
          niveau: number
          parent_id: string | null
          path: string
          persona_cible: string[]
          published_at: string | null
          slug: string
          statut: Database["public"]["Enums"]["statut_publication"]
          titre_h1: string
          updated_at: string
        }
        Insert: {
          contenu?: Json
          created_at?: string
          cta_type?: Database["public"]["Enums"]["type_cta"]
          id?: string
          mot_cle_principal?: string | null
          mots_cles_secondaires?: string[]
          niveau: number
          parent_id?: string | null
          path: string
          persona_cible?: string[]
          published_at?: string | null
          slug: string
          statut?: Database["public"]["Enums"]["statut_publication"]
          titre_h1: string
          updated_at?: string
        }
        Update: {
          contenu?: Json
          created_at?: string
          cta_type?: Database["public"]["Enums"]["type_cta"]
          id?: string
          mot_cle_principal?: string | null
          mots_cles_secondaires?: string[]
          niveau?: number
          parent_id?: string | null
          path?: string
          persona_cible?: string[]
          published_at?: string | null
          slug?: string
          statut?: Database["public"]["Enums"]["statut_publication"]
          titre_h1?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          actif: boolean
          code: number
          created_at: string
          destination: string
          id: string
          source: string
        }
        Insert: {
          actif?: boolean
          code?: number
          created_at?: string
          destination: string
          id?: string
          source: string
        }
        Update: {
          actif?: boolean
          code?: number
          created_at?: string
          destination?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      seo: {
        Row: {
          article_id: string | null
          canonical: string | null
          created_at: string
          id: string
          meta_description: string
          meta_title: string
          noindex: boolean
          og_image: string | null
          page_id: string | null
          schema_type: Database["public"]["Enums"]["type_schema"]
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          canonical?: string | null
          created_at?: string
          id?: string
          meta_description: string
          meta_title: string
          noindex?: boolean
          og_image?: string | null
          page_id?: string | null
          schema_type?: Database["public"]["Enums"]["type_schema"]
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          canonical?: string | null
          created_at?: string
          id?: string
          meta_description?: string
          meta_title?: string
          noindex?: boolean
          og_image?: string | null
          page_id?: string | null
          schema_type?: Database["public"]["Enums"]["type_schema"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: true
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      choix_sont_booleens: { Args: { choix: Json }; Returns: boolean }
      est_membre_console: { Args: never; Returns: boolean }
    }
    Enums: {
      finalite_consentement:
        | "mesure_audience"
        | "publicite"
        | "personnalisation"
      plateforme_ads: "google" | "linkedin" | "openai"
      source_ingestion:
        | "gsc"
        | "ga4"
        | "google_ads"
        | "linkedin_ads"
        | "openai_ads"
        | "hubspot"
      statut_ingestion: "en_cours" | "succes" | "echec"
      statut_publication: "draft" | "review" | "published"
      type_cta:
        | "devis"
        | "intervention"
        | "rappel"
        | "diagnostic"
        | "candidature"
      type_schema:
        | "WebPage"
        | "Service"
        | "Article"
        | "FAQPage"
        | "CollectionPage"
        | "Organization"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      finalite_consentement: [
        "mesure_audience",
        "publicite",
        "personnalisation",
      ],
      plateforme_ads: ["google", "linkedin", "openai"],
      source_ingestion: [
        "gsc",
        "ga4",
        "google_ads",
        "linkedin_ads",
        "openai_ads",
        "hubspot",
      ],
      statut_ingestion: ["en_cours", "succes", "echec"],
      statut_publication: ["draft", "review", "published"],
      type_cta: [
        "devis",
        "intervention",
        "rappel",
        "diagnostic",
        "candidature",
      ],
      type_schema: [
        "WebPage",
        "Service",
        "Article",
        "FAQPage",
        "CollectionPage",
        "Organization",
      ],
    },
  },
} as const
