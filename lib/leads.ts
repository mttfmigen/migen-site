import "server-only";

import { ecritureServeur } from "@/lib/supabase";
import type { LigneLead } from "@/types/base";
import type { Attribution } from "@/lib/utm";

/**
 * Copie d'attribution d'un lead dans Supabase.
 *
 * LA TABLE `leads` NE REÇOIT AUCUNE DONNÉE NOMINATIVE : ni nom, ni prénom, ni
 * adresse e-mail, ni téléphone, ni message. L'identité du contact vit dans
 * HubSpot et nulle part ailleurs. Ce qui est écrit ici ne sert qu'à répondre à
 * une question : quelle page et quelle campagne ont produit cette demande.
 *
 * Le type ci-dessous est la garantie à la compilation : il n'a pas de champ où
 * mettre une identité. Ajouter un tel champ demanderait de modifier ce fichier,
 * donc de lire ce commentaire.
 */
export interface CopieLead extends Attribution {
  /** Identifiant du formulaire envoyé, en slug. */
  formulaire: string;
}

/**
 * Écrit la copie d'attribution.
 *
 * Lève en cas d'échec : c'est à l'appelant de décider si l'échec concerne le
 * visiteur. Perdre l'attribution d'un lead déjà déposé dans HubSpot ne justifie
 * pas de lui annoncer un échec.
 */
/**
 * Les colonnes réellement écrites, prélevées sur la ligne du schéma. C'est ici
 * que la vérification de types a lieu : une colonne renommée, supprimée ou dont
 * le type change en base fait échouer la compilation de ce fichier.
 */
type InsertionLead = Pick<
  LigneLead,
  | "date"
  | "formulaire"
  | "page_entree"
  | "page_conversion"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
>;

export async function enregistreCopieLead(copie: CopieLead): Promise<void> {
  const ligne: InsertionLead = {
    date: new Date().toISOString(),
    formulaire: copie.formulaire,
    page_entree: copie.page_entree ?? null,
    page_conversion: copie.page_conversion ?? null,
    utm_source: copie.utm_source ?? null,
    utm_medium: copie.utm_medium ?? null,
    utm_campaign: copie.utm_campaign ?? null,
    utm_term: copie.utm_term ?? null,
    utm_content: copie.utm_content ?? null,
  };

  // CONTOURNEMENT, cause réelle hors de ce fichier : `types/base.ts` déclare ses
  // lignes avec `interface`, et une interface n'a pas de signature d'index
  // implicite. `BaseDeDonnees["public"]` ne satisfait donc pas la contrainte
  // `GenericSchema` de supabase-js, qui réduit alors le `Schema` du client à
  // `never` : chaque `Insert` devient `never`, d'où l'échec de compilation sur
  // toute écriture. Remplacer `export interface LigneX {` par
  // `export type LigneX = {` dans types/base.ts supprime la cause et permet de
  // retirer l'assertion ci-dessous. La génération officielle
  // (`bun run types:base`) produit déjà des `type`, donc le problème disparaît
  // aussi le jour où le projet Supabase existe.
  // L'objet `ligne` reste vérifié colonne par colonne : l'assertion ne porte
  // que sur le générique effondré, pas sur le contenu écrit.
  const { error } = await ecritureServeur()
    .from("leads")
    .insert(ligne as never);

  if (error) {
    throw new Error(`Écriture du lead (${copie.formulaire}) : ${error.message}`);
  }
}
