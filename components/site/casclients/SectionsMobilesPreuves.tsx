import Image from "next/image";
import Link from "next/link";

import { appliqueDecisions } from "@/lib/decisions-copie";
import { courtLibelle, entreeDe, type EntreeIndex } from "@/components/site/cocon/maillage-mobile";
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

/** Le lien d'une carte : le h1 de l'étude (dc.html, `t: x.h1`), sinon le nom
    du client. Libellé de la maquette V3 (`caseLbl`) : sans « Étude de cas »,
    client en casse normale. */
function titreEtude(carte: CartePreuve): string {
  const entree = entreeDe(carte.url);
  return entree ? libelleCas(h1De(entree)) : carte.client;
}

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
        ) : null}
      </span>
      <span className={styles.resumeRail}>{carte.resume}</span>{" "}
      <span className={styles.lienRail}>
        {titreEtude(carte)} <span aria-hidden="true">→</span>
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
              ENTIER sans « Étude de cas » (dc.html `teaseOf`, `cleanCase`).
              `courtLibelle` le coupait à 54 signes (« …qui reviennent
              sur… ») ; la feuille partagée borne l'accroche à trois lignes. */}
          <p>{h1De(publies[0]).replace(/^Étude de cas\s+/i, "")}</p>
        </summary>
        <div>
          <ul className={styles.listeRecents}>
            {publies.map((x) => (
              <li key={x.url}>
                <Link href={x.url} prefetch={false}>
                  {courtLibelle(x)} <span aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
    ) : null;
  return [...categories, derniers].filter(Boolean);
}
