/**
 * Titre et description de repli de la page contact.
 *
 * Posés ici et non dans `app/contact/page.tsx` pour une raison de contrôle :
 * Next refuse un export nommé arbitraire depuis un fichier de page, et le
 * contrôle a besoin de comparer le titre au H1 sans appeler Supabase.
 *
 * LE TITRE N'EST JAMAIS LE H1. Il se lit dans la page de résultats, le H1 se lit
 * sur la page : le titre porte l'intention de recherche, le H1 la promesse.
 */

export const TITRE_SEO =
  "Contact Migen, demander des techniciens de maintenance industrielle";

export const DESCRIPTION_SEO =
  "Décrivez la ligne à tenir : un chargé d’affaires vous rappelle dans l’heure, " +
  "sélectionne les techniciens adaptés et vous les présente avant toute intervention.";
