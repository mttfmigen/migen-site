/**
 * LA RÉPARTITION DES VILLES ENTRE HUBS ET RÉGIONS, de la maquette mobile v2
 * (dc.html L440 à 447). Module NEUTRE, sorti de `NosHubsMobile.tsx` le 16/10 :
 * l'accueil l'emploie aussi, et l'importer depuis le composant aurait chargé
 * la feuille de `/implantations/` sur l'accueil.
 */
import type { ZoneHubLocal } from "@/types/implantation";
import type { NosVilles as DonneesNosVilles } from "@/types/implantations";

/**
 * LES VILLES « PROCHES » QUE LA MAQUETTE RATTACHE À UN HUB après ses enfants,
 * dans cet ordre (dc.html L440 `ZN` et `mobile-home-data.js` `near`). Les
 * entrées de Lyon, Paris, Strasbourg, Nantes et Marseille n'y sont pas : elles
 * visent des enfants du hub, que `findCity` ne retrouve pas (adresse à trois
 * segments), et n'ajoutent donc rien.
 */
const PROCHES: Record<string, readonly string[]> = {
  "/implantations/toulouse/": ["albi", "tarbes", "agen"],
  "/implantations/bordeaux/": ["bayonne", "la-rochelle", "angouleme", "agen", "niort"],
  "/implantations/maintenance-industrielle-metz/": ["nancy", "reims", "troyes"],
  "/implantations/maintenance-industrielle-dijon/": ["besancon", "chalon-sur-saone", "belfort-montbeliard", "vesoul"],
};

/** dc.html `findCity` : une ville de premier niveau dont l'adresse porte ce nom. */
function villeDuNom(villes: readonly ZoneHubLocal[], nom: string): ZoneHubLocal | undefined {
  return villes.find((ville) => {
    const q = ville.href.split("/").filter(Boolean);
    if (q[0] !== "implantations" || q.length !== 2) return false;
    const s = q[1].replace(/^maintenance-industrielle-/, "");
    return s === nom || s.startsWith(`${nom}-`);
  });
}

/**
 * LA RÉPARTITION DE LA MAQUETTE (dc.html L443 à 447, `usedC`) : une ville
 * n'est montrée qu'UNE fois. Chaque hub prend, dans l'ordre, ses enfants puis
 * ses proches encore libres ; les régions ne gardent que les villes qu'aucun
 * hub n'a prises, et une région vide disparaît (Grand Est, Bourgogne-Franche-
 * Comté : toutes leurs villes sont sous Metz et Dijon). Une zone de la donnée
 * que la maquette ne connaît pas reste en fin de rail : rien n'est retiré, une
 * ville écartée d'une liste est visible dans une autre.
 *
 * Partagée par `/implantations/` (`NosHubsMobile`) et l'accueil mobile
 * (`accueil/HubsMobileAccueil.tsx`), qui montrent les mêmes hubs et les mêmes
 * régions.
 */
export function repartition(villes: DonneesNosVilles): Pick<DonneesNosVilles, "hubs" | "regions"> {
  const prises = new Set(villes.hubs.map((hub) => hub.href));
  const toutes = [...villes.hubs.flatMap((hub) => hub.zones ?? []), ...villes.regions.flatMap((r) => r.villes)];
  const hubs = villes.hubs.map((hub) => {
    const zones = hub.zones ?? [];
    const candidates = [
      ...zones.filter((zone) => zone.href.startsWith(hub.href)),
      ...(PROCHES[hub.href] ?? []).map((nom) => villeDuNom(toutes, nom)),
      ...zones,
    ];
    const retenues = candidates.filter((zone): zone is ZoneHubLocal => {
      if (!zone || prises.has(zone.href)) return false;
      prises.add(zone.href);
      return true;
    });
    return { ...hub, zones: retenues };
  });
  const regions = villes.regions
    .map((region) => ({ ...region, villes: region.villes.filter((ville) => !prises.has(ville.href)) }))
    .filter((region) => region.villes.length > 0);
  return { hubs, regions };
}
