import Image from "next/image";
import Link from "next/link";

import type { NosVilles as DonneesNosVilles } from "@/types/implantations";

import styles from "./PageImplantations.module.css";
import { ALT_DU_HUB, PHOTO_DU_HUB } from "./photos-hubs";
import { repartition } from "./repartition-hubs";

/**
 * « Nos hubs » de la maquette mobile v2, TÉLÉPHONE SEULEMENT
 * (`data-mobile-seulement`), dc.html L127 `isHubs` : hors carte, sur-titre et
 * titre, rail de cartes (photo de 150 px avec bandeau « Hub · Siège » et nom,
 * bassins en pastilles sous la photo), puis « Villes couvertes par nos
 * techniciens itinérants », une ligne repliée par région avec son compteur.
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
                      {zone.libelle}
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
                  <span className={styles.hubsMobileRegionDroite}>
                    <span className={styles.hubsMobileRegionCompte}>{region.villes.length}</span>
                    <span aria-hidden="true" className={styles.hubsMobileChevron}>
                      ›
                    </span>
                  </span>
                </summary>
                <div className={styles.hubsMobileZones}>
                  {region.villes.map((ville) => (
                    <Link key={ville.href} href={ville.href} prefetch={false} className={styles.hubsMobilePastille}>
                      {ville.libelle}
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
