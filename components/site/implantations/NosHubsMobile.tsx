import Image from "next/image";
import Link from "next/link";

import { courtLibelle, entreeDe } from "@/components/site/cocon/maillage-mobile";
import type { ZoneHubLocal } from "@/types/implantation";
import type { NosVilles as DonneesNosVilles } from "@/types/implantations";

import styles from "./PageImplantations.module.css";
import { ALT_DU_HUB, PHOTO_DU_HUB } from "./photos-hubs";

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
 * Le libellé d'une pastille, celui de la V3 (`zc` : `short(x)`, le libellé
 * court de l'index, « Dunkerque et le port », « Nice et Alpes-Maritimes ») ;
 * hors index, le libellé de la donnée. Le même que « Dans la même rubrique ».
 */
function libelleDe(zone: ZoneHubLocal): string {
  const entree = entreeDe(zone.href);
  return entree ? courtLibelle(entree) : zone.libelle;
}

/**
 * LA RÉPARTITION DE LA MAQUETTE (dc.html L443 à 447, `usedC`) : une ville
 * n'est montrée qu'UNE fois. Chaque hub prend, dans l'ordre, ses enfants puis
 * ses proches encore libres ; les régions ne gardent que les villes qu'aucun
 * hub n'a prises, et une région vide disparaît (Grand Est, Bourgogne-Franche-
 * Comté : toutes leurs villes sont sous Metz et Dijon). Une zone de la donnée
 * que la maquette ne connaît pas reste en fin de rail : rien n'est retiré, une
 * ville écartée d'une liste est visible dans une autre.
 */
function repartition(villes: DonneesNosVilles): Pick<DonneesNosVilles, "hubs" | "regions"> {
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

/**
 * « Nos hubs » de la maquette mobile v2, TÉLÉPHONE SEULEMENT
 * (`data-mobile-seulement`), dc.html L127 `isHubs` : hors carte, sur-titre et
 * titre, rail de cartes (photo de 150 px avec bandeau « Hub · Siège » et nom,
 * bassins en pastilles sous la photo), puis « Villes couvertes par nos
 * techniciens itinérants », une ligne repliée par région.
 *
 * Tout vient de la donnée de la page (`villes`) ; les quatre libellés fixes
 * sont ceux de la maquette. Le bloc de bureau (`NosVilles`), même donnée,
 * s'efface sous 881 px : ses liens restent dans le DOM.
 */
export default function NosHubsMobile({ villes: donnees }: { villes: DonneesNosVilles }) {
  const villes = repartition(donnees);
  return (
    <section data-mobile-seulement="" className={styles.hubsMobile}>
      <div className={styles.hubsMobileTete}>
        <div className={styles.hubsMobileSurtitre}>Nos hubs</div>
        <h2 className={styles.hubsMobileTitre}>Des hubs partout en France</h2>
      </div>
      <div className={styles.hubsMobileRail}>
        {villes.hubs.map((hub) => {
          const photo = PHOTO_DU_HUB[hub.hub];
          return (
            <div key={hub.href} className={styles.hubsMobileCarte}>
              <Link href={hub.href} prefetch={false} className={styles.hubsMobilePhoto}>
                {photo ? (
                  <Image src={photo} alt={ALT_DU_HUB[hub.hub] ?? ""} fill sizes="250px" style={{ objectFit: "cover" }} />
                ) : null}
                <span aria-hidden="true" className={styles.hubsMobileVoile} />
                <span className={styles.hubsMobileBandeau}>
                  <span className={styles.hubsMobileGenre}>
                    {hub.href === "/implantations/lyon/" ? "Hub · Siège" : "Hub"}
                  </span>
                  <span className={styles.hubsMobileNom}>{hub.hub}</span>
                </span>
              </Link>
              {hub.zones?.length ? (
                <div className={styles.hubsMobileZones}>
                  {hub.zones.map((zone) => (
                    <Link key={zone.href} href={zone.href} prefetch={false} className={styles.hubsMobilePastille}>
                      {libelleDe(zone)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {villes.regions.length ? (
        <div className={styles.hubsMobileItinerants}>
          <h3 className={styles.hubsMobileItinerantsTitre}>Villes couvertes par nos techniciens itinérants</h3>
          <div className={styles.hubsMobileRegions}>
            {villes.regions.map((region) => (
              <details key={region.region} className={styles.hubsMobileRegion}>
                <summary>
                  <span className={styles.hubsMobileRegionNom}>{region.region}</span>
                  {/* Sans le compteur de villes de la V3 : aucun compteur
                      au téléphone (décision de Mehdi). */}
                  <span aria-hidden="true" className={styles.hubsMobileChevron}>
                    ›
                  </span>
                </summary>
                <div className={styles.hubsMobileZones}>
                  {region.villes.map((ville) => (
                    <Link key={ville.href} href={ville.href} prefetch={false} className={styles.hubsMobilePastille}>
                      {libelleDe(ville)}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
