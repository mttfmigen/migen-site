import Link from "next/link";

import { TELEPHONE_LP } from "@/components/site/entete-donnees";
import type { PageLP } from "@/lib/lp/pages";

import styles from "./conversion-lp.module.css";
import { BOUTON_HEROS, BOUTON_VERRE, HerosServiceLP } from "./HerosServiceLP";

/**
 * /lp/merci/ : la page `/fr/merci` de `window.__LP` (maquette V3), lue dans
 * `lib/lp/pages.json` comme toutes les LP, donc filtrée par les règles de
 * copie et tenue par `verifie:lp-donnees`. Le bouton principal est `mainCta`
 * vers `mainHref` (la LP France), comme dans la maquette.
 */
export function MerciLP({ page }: { page: PageLP }) {
  return (
    <HerosServiceLP
      photo={page.img}
      surtitre={page.kick}
      titre={page.h1b}
      chapo={page.chapo}
      points={page.more}
      actions={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
          <Link href={page.mainHref} className={styles.envoi} style={BOUTON_HEROS}>
            {page.mainCta} <span aria-hidden="true">→</span>
          </Link>
          <a href={TELEPHONE_LP.href} style={BOUTON_VERRE}>
            Appeler le {TELEPHONE_LP.affichage}
          </a>
        </div>
      }
    />
  );
}
