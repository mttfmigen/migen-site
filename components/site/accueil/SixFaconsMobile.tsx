import Image from "next/image";
import Link from "next/link";

import { photoDeLaPage } from "@/lib/photo-par-page";

import { BESOINS } from "./bento-besoins-donnees";
import { GARANTIES_RESIDENCE, LIENS, OFFRES_ACCUEIL, type CleOffre } from "./GrilleOffres";
import m from "./AccueilMobile.module.css";

/**
 * « Six façons de travailler ensemble », TOUJOURS VISIBLE au téléphone : le
 * bloc sombre de la maquette V3 « Site mobile », six cartes photo (Résidence
 * en pleine largeur avec ses quatre garanties, étiquettes « Contrat unique »
 * et « Abonnement », un lien d'action par carte).
 *
 * LE TEXTE EST CELUI DE LA GRILLE DE BUREAU (`OFFRES_ACCUEIL`), qui s'efface à
 * cette largeur. La V3 écrit pour Zéro arrêt une phrase de prix mensuel fixe :
 * elle n'est pas reprise (voir `GrilleOffres.tsx`).
 *
 * LA PHOTO D'UNE CARTE EST CELLE DE LA PAGE QU'ELLE OUVRE, la règle du pavage
 * « Partez de votre besoin » depuis le 12/10 : sa photo validée pour la même
 * offre quand il en a une (Résidence compris, voir `bento-besoins-donnees`),
 * sinon la première photo du registre que la page sert (`photoDeLaPage`).
 * Aucune image de la V3 n'est reprise.
 *
 * LE LIEN D'ACTION COUVRE LA CARTE ENTIÈRE (`.offreLien::after`) : la cible
 * tactile est la carte, le nom accessible est l'action, décrite par le titre.
 */
function photoDe(cle: CleOffre): string | null {
  const href = LIENS[cle];
  return BESOINS.find((besoin) => besoin.href === href)?.img ?? photoDeLaPage(href);
}

export default function SixFaconsMobile() {
  return (
    <section data-mobile-seulement="" className={m.six} aria-labelledby="six-facons-titre">
      <span aria-hidden="true" className={m.halo} />
      <div className={m.sixTete}>
        <p className={m.surtitre}>Nos offres</p>
        <h2 id="six-facons-titre" className={m.sixTitre}>
          Six façons de travailler ensemble
        </h2>
        <p className={m.sixChapo}>De la présence continue à l’étude et aux travaux.</p>
      </div>

      <ul className={m.sixGrille}>
        {OFFRES_ACCUEIL.map((offre) => {
          const large = offre.cle === "residence";
          const photo = photoDe(offre.cle);
          const idTitre = `six-facons-${offre.cle}`;
          return (
            <li key={offre.cle} className={large ? `${m.offre} ${m.offreLarge}` : m.offre}>
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes={large ? "(max-width: 880px) 92vw, 1px" : "(max-width: 880px) 46vw, 1px"}
                  className={m.offrePhoto}
                />
              ) : null}
              <span aria-hidden="true" className={m.offreVoile} />
              <span className={m.offreHaut}>
                <span aria-hidden="true" className={m.offreNumero}>
                  {offre.numero}
                </span>
                {offre.etiquette ? <span className={m.offreEtiquette}>{offre.etiquette}</span> : null}
              </span>
              <div className={m.offreCorps}>
                <h3 id={idTitre} className={m.offreTitre}>
                  {offre.titre}
                </h3>
                <p className={m.offreTexte}>{offre.texte}</p>
                {large ? (
                  <ul className={m.offrePoints}>
                    {GARANTIES_RESIDENCE.map((garantie) => (
                      <li key={garantie}>
                        <span aria-hidden="true" className={m.coche}>
                          ✓
                        </span>
                        <span>{garantie}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Link
                  href={LIENS[offre.cle]}
                  prefetch={false}
                  className={m.offreLien}
                  aria-describedby={idTitre}
                >
                  {offre.action.replace(/\s*→$/, "")}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <p className={m.sixDevise}>Innovation, performance, impact.</p>
    </section>
  );
}
