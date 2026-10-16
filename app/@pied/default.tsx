import LienReglages from "@/components/consentement/LienReglages";
import PiedDePage from "@/components/site/PiedDePage";

/**
 * Le pied de page du site, sur toutes les pages sauf les landing pages.
 *
 * POURQUOI UN EMPLACEMENT (route parallèle) et non une condition : le pied est
 * un composant serveur, et la mise en page racine ne connaît pas le chemin.
 * Sous /lp/, l'emplacement rend `lp/[[...slug]]/page.tsx`, qui est vide ;
 * partout ailleurs, il rend ce fichier. Le pied n'est donc même pas calculé
 * pour une LP, au lieu d'être caché dans une page qui le transporterait.
 *
 * Un emplacement GARDE SON DERNIER RENDU lors d'une navigation dans le
 * navigateur vers une adresse qu'il ne connaît pas : passé d'une LP au site
 * par un `next/link` (la politique de confidentialité du formulaire), le pied
 * restait vide, mesuré le 16/10. `page.tsx` et `[...slug]/page.tsx`, qui
 * rendent ce même pied, donnent à l'emplacement une page pour TOUTE adresse :
 * il se recalcule à chaque navigation. Ce fichier reste le repli d'un
 * chargement direct.
 *
 * Le lien CNIL de réglage du consentement lui est PASSÉ au lieu d'être réécrit
 * dedans : une seule implémentation du bouton, et le pied de page reste un
 * composant serveur alors que le lien est un composant client.
 */
export default function PiedDuSite() {
  return <PiedDePage reglagesConsentement={<LienReglages />} />;
}
