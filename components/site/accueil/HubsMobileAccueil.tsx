import Image from "next/image";
import Link from "next/link";

import { ALT_DU_HUB, PHOTO_DU_HUB } from "@/components/site/implantations/photos-hubs";
import { repartition } from "@/components/site/implantations/repartition-hubs";
import type { NosVilles } from "@/types/implantations";

import m from "./AccueilMobile.module.css";

/**
 * « Des hubs partout en France », VISIBLE au téléphone : la section de la
 * maquette V3 « Site mobile » sous la dernière carte de l'accueil. Un carrousel
 * des dix hubs (Lyon porte « Hub · Siège »), leurs villes en pastilles, puis
 * « Villes couvertes par nos techniciens itinérants », une région repliée par
 * ligne, SANS compteur de villes (Mehdi a fait retirer ces compteurs).
 *
 * TOUT VIENT DE LA DONNÉE DE `/implantations/` (`contenu.villes`), répartie
 * par le même calcul que la page des implantations (`repartition-hubs.ts`) :
 * aucun hub ni aucune ville n'est écrit ici. Les photos sont celles des hubs
 * déjà servies par le site (`photos-hubs.ts`), jamais celles de la V3.
 *
 * Le rail de bureau (`HubsAccueil`) s'efface à cette largeur. Le carrousel
 * défile au doigt et au clavier : il prend le focus (flèches), et chacun de
 * ses liens le fait défiler jusqu'à lui.
 */
export default function HubsMobileAccueil({ villes }: { villes: NosVilles }) {
  const { hubs, regions } = repartition(villes);
  return (
    <section data-mobile-seulement="" className={m.hubs} aria-labelledby="hubs-mobile-titre">
      <div className={m.gouttiere}>
        <p className={m.surtitre}>Nos hubs</p>
        <h2 id="hubs-mobile-titre" className={m.titreSection}>
          Des hubs partout en France
        </h2>
      </div>

      <ul className={m.rail} tabIndex={0} aria-labelledby="hubs-mobile-titre">
        {hubs.map((hub) => {
          const photo = PHOTO_DU_HUB[hub.hub];
          return (
            <li key={hub.href} className={m.hub}>
              <div className={m.hubPhoto}>
                {photo ? (
                  <Image
                    src={photo}
                    alt={ALT_DU_HUB[hub.hub] ?? ""}
                    fill
                    sizes="(max-width: 880px) 250px, 1px"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
                <span aria-hidden="true" className={m.hubVoile} />
                <Link href={hub.href} prefetch={false} className={m.hubLien}>
                  <span className={m.hubGenre}>
                    {hub.href === "/implantations/lyon/" ? "Hub · Siège" : "Hub"}
                  </span>
                  <span className={m.hubNom}>{hub.hub}</span>
                </Link>
              </div>
              {hub.zones?.length ? (
                <ul className={`${m.pastilles} ${m.hubZones}`}>
                  {hub.zones.map((zone) => (
                    <li key={zone.href}>
                      <Link href={zone.href} prefetch={false} className={m.pastille}>
                        <span>{zone.libelle}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {regions.length ? (
        <div className={m.itinerants}>
          <h3 className={m.itinerantsTitre}>Villes couvertes par nos techniciens itinérants</h3>
          <div className={m.rangees}>
            {regions.map((region) => (
              <details key={region.region} className={m.rangee}>
                <summary>
                  {region.region}
                  <span aria-hidden="true" className={m.chevron}>
                    ›
                  </span>
                </summary>
                <ul className={`${m.pastilles} ${m.rangeeCorps}`}>
                  {region.villes.map((ville) => (
                    <li key={ville.href}>
                      <Link href={ville.href} prefetch={false} className={m.pastille}>
                        <span>{ville.libelle}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
