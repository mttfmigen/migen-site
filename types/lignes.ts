/**
 * Noms français des lignes du schéma.
 *
 * `types/base.ts` est REGÉNÉRÉ depuis la base (`bun run types:base`) : il est
 * écrasé à chaque fois et ne doit donc rien porter d'écrit à la main. Ce
 * fichier-ci est la couche stable que le reste de l'application importe. Si
 * une colonne change en base, la régénération casse ici, à un seul endroit,
 * plutôt que dans quinze fichiers.
 */

import type { Database, Enums, Tables } from "@/types/base";

export type BaseDeDonnees = Database;

export type LignePage = Tables<"pages">;
export type LigneArticle = Tables<"articles">;
export type LigneSeo = Tables<"seo">;
export type LigneCasClient = Tables<"business_cases">;
export type LigneRedirection = Tables<"redirects">;
export type LigneConsentement = Tables<"consent_logs">;
export type LigneLead = Tables<"leads">;
export type LigneIngestion = Tables<"ingestion_runs">;

export type StatutPublication = Enums<"statut_publication">;
export type TypeCta = Enums<"type_cta">;
export type TypeSchema = Enums<"type_schema">;
export type PlateformeAds = Enums<"plateforme_ads">;
export type SourceIngestion = Enums<"source_ingestion">;
export type StatutIngestion = Enums<"statut_ingestion">;
