import Link from "next/link";

import { familles } from "./tout-le-site";
import m from "./AccueilMobile.module.css";

/**
 * « Tout le site », TÉLÉPHONE SEULEMENT, juste avant le formulaire : une
 * rangée repliée par famille de pages, sans nombre de pages (voir
 * `tout-le-site.ts` pour le calcul et ses écarts à la V3). `<details>` natifs,
 * fermés au départ ; les liens restent dans le HTML servi.
 */
export default function ToutLeSite() {
  return (
    <nav data-mobile-seulement="" className={m.toutLeSite} aria-labelledby="tout-le-site-titre">
      <h2 id="tout-le-site-titre" className={m.titreSection}>
        Tout le site
      </h2>
      <div className={m.rangees}>
        {familles().map((famille) => (
          <details key={famille.libelle} className={m.rangee}>
            <summary>
              {famille.libelle}
              <span aria-hidden="true" className={m.chevron}>
                ›
              </span>
            </summary>
            <ul className={m.liens}>
              {famille.liens.map((lien) => (
                <li key={lien.href}>
                  <Link href={lien.href} prefetch={false}>
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </nav>
  );
}
