import Image from "next/image";
import Link from "next/link";

import { appliqueDecisions } from "@/lib/decisions-copie";
import { entreeDe, type EntreeIndex } from "@/components/site/cocon/maillage-mobile";
import { IconeFleche } from "@/components/site/mobile/BarreCollanteMobile";
import { CIBLE_CONTACT } from "@/components/site/mobile/conversion-donnees";
import { logoEnFond } from "@/components/site/preuve/CarrouselRealisations";
import { libelleCas } from "@/components/site/preuve/noms-clients";

import styles from "./PreuvesHub.module.css";
import type { CartePreuve, VuePreuves } from "./vues-preuves";

/**
 * Les sections du hub /preuves/ dans la maquette MOBILE v2 (corpus
 * `Preuves/preuves.md`, une section `##` par type de besoin, puis « Les
 * derniers publiés ») : une carte numérotée repliable chacune, la première
 * ouverte, « Le besoin : … » puis le rail des études. Sous 880 px seulement :
 * au bureau, le filtre à onglets reste seul (`FiltrePreuves`).
 */

/** Les titres `##` du corpus, mot pour mot, par libellé d'onglet. */
const TITRES_MAQUETTE: Readonly<Record<string, string>> = {
  "Maintenance en continu": "Maintenance en continu, technicien intégré au site",
  "Préventif programmé": "Préventif programmé et renforts d’arrêt",
  "Montage et démarrage": "Montage, démarrage et construction",
  Dépannage: "Dépannage, remise en état et contrat de parc",
};

/** Le h1 d'une étude de l'index, passé par les décisions de copie. */
function h1De(entree: EntreeIndex): string {
  return appliqueDecisions(entree.h1.replace(/\s+/g, " ").trim(), entree.url);
}

/**
 * « Les derniers publiés » de la V3 : la colonne « Ce qui a été fait » du
 * tableau du corpus (`Preuves/preuves.md`, mot pour mot), par étude. Une
 * étude récente sans ligne ici passe en « À lire aussi », comme Amazon dans
 * le corpus.
 */
const FAIT: Readonly<Record<string, string>> = {
  "/preuves/atena-port-la-rochelle/": "2 techniciens sur site, dont 1 en long terme, en cours",
  "/preuves/vignal-systems/": "1 technicien de nuit + 1 technicien en 2x8, en cours",
  "/preuves/jacquet-brossard/": "3x8 (2 techniciens) + 2x8 (1 technicien), en cours",
  "/preuves/motherson/": "2x8",
  "/preuves/savoye-migration-automates-norvege/": "2 machines migrées en 2 week-ends",
  "/preuves/dimomaint/": "Alliance terrain et GMAO",
  "/preuves/savoye/": "Techniciens formés aux équipements Savoye",
  "/preuves/suez-remise-en-etat/": "Renfort électromécanique 6 mois, environnement à risque chimique",
  "/preuves/danone-lignes-de-production/": "Deux techniciens en 3x8, lignes liquides et poudre",
  "/preuves/gls-maintenance-curative/": "Curatif et surveillance continue des équipements logistiques",
  "/preuves/vpk/": "Technicien polyvalent, préventif et curatif",
  "/preuves/eriks/": "Responsable maintenance en renfort pendant une transition",
};

/** Le bouton qui ferme « Les derniers publiés » dans le corpus. */
const BOUTON_DERNIERS = "Parler à un chargé d'affaires";

/** Une carte du rail : toute la carte est le lien, « Lire le cas → » de la V3 (`linkT`). */
function CarteRail({ carte }: { carte: CartePreuve }) {
  return (
    <Link href={carte.url} prefetch={false} className={styles.carteRail}>
      <span className={styles.photoRail}>
        {carte.photo ? (
          <Image src={carte.photo} alt="" fill sizes="250px" style={{ objectFit: "cover" }} />
        ) : null}
        {carte.logo ? (
          <span className={styles.logoRail}>
            <span role="img" aria-label={carte.client} style={logoEnFond(carte.logo, carte.logoInverse, 72, 18)} />
          </span>
        ) : (
          <span className={styles.nomCache}>{carte.client}</span>
        )}
      </span>
      <span className={styles.resumeRail}>{carte.resume}</span>{" "}
      <span className={styles.lienRail}>
        Lire le cas <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export function sectionsMobilesPreuves(vues: readonly VuePreuves[], recents: readonly string[]) {
  const categories = vues.slice(1).map((vue, rang) => (
    <details
      key={vue.libelle}
      data-mobile-seulement=""
      data-carte-numerotee=""
      open={rang === 0}
      className={styles.sectionMobile}
    >
      <summary>
        <span data-carte-titre="">{TITRES_MAQUETTE[vue.libelle] ?? vue.libelle}</span>
        <span aria-hidden="true">›</span>
        <p>{vue.besoin}</p>
      </summary>
      <div>
        <p className={styles.besoinMobile}>{vue.besoin}</p>
        <div className={styles.rail}>
          {[...vue.une, ...vue.grille].map((carte) => (
            <CarteRail key={carte.url} carte={carte} />
          ))}
        </div>
      </div>
    </details>
  ));
  const publies = recents
    .map((url) => entreeDe(url))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const derniers =
    publies.length > 0 ? (
      <details
        key="derniers"
        data-mobile-seulement=""
        data-carte-numerotee=""
        className={styles.sectionMobile}
      >
        <summary>
          <span data-carte-titre="">Les derniers publiés</span>
          <span aria-hidden="true">›</span>
          {/* L'accroche de la V3 : le premier élément de la liste, son titre
              ENTIER sans « Étude de cas », client en casse normale (dc.html
              `teaseOf`, `cleanCase`) ; la feuille partagée borne l'accroche à
              trois lignes. */}
          <p>{libelleCas(h1De(publies[0]))}</p>
        </summary>
        <div>
          {/* Le tableau du corpus au dessin de la V3 (`isTb`), le lien du cas
              en première cellule ; puis « À lire aussi » et le bouton. */}
          <div className={styles.tableauRecents}>
            <div className={styles.enteteRecents}>Cas · Ce qui a été fait</div>
            {publies
              .filter((x) => FAIT[x.url])
              .map((x) => (
                <div key={x.url} className={styles.ligneRecente}>
                  <Link href={x.url} prefetch={false} className={styles.lienRecent}>
                    {libelleCas(h1De(x))}
                  </Link>
                  <div>
                    <div className={styles.enteteCellule}>Ce qui a été fait</div>
                    <div className={styles.faitRecent}>{FAIT[x.url]}</div>
                  </div>
                </div>
              ))}
          </div>
          {publies
            .filter((x) => !FAIT[x.url])
            .map((x) => (
              <div key={x.url} className={styles.lireAussi}>
                <div className={styles.enteteCellule}>À lire aussi</div>
                <Link href={x.url} prefetch={false} className={styles.pastilleLire}>
                  {libelleCas(h1De(x))} <span aria-hidden="true">›</span>
                </Link>
              </div>
            ))}
          <Link href={CIBLE_CONTACT} prefetch={false} className={styles.boutonFleche}>
            <span>{BOUTON_DERNIERS}</span>
            <span className={styles.pastilleFleche}>
              <IconeFleche />
            </span>
          </Link>
        </div>
      </details>
    ) : null;
  return [...categories, derniers].filter(Boolean);
}
