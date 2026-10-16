import type { EtapeMethode } from "../MethodeQuatreEtapes";
import v3 from "./accueil-v3.module.css";

/**
 * LA MÉTHODE AU TÉLÉPHONE : la frise verticale de la V3 (bloc `isTl`), les
 * quatre étapes déroulées avec leur encart « Vous / Résultat ».
 *
 * Au bureau, la méthode montre une étape à la fois derrière quatre boutons ;
 * au téléphone, tout est lisible d'un seul défilement. Le texte est celui de
 * `methode-etapes-donnees.ts`, mot pour mot. Le repère de temps n'apparaît que
 * là où les données en portent un : les durées chiffrées de la V3 (« 2 à 5
 * jours », « 1 à 2 semaines ») sont retirées des données et ne reviennent pas.
 *
 * `data-mobile-seulement` : au-dessus de 880 px, la frise n'existe pas.
 */
export default function FriseEtapes({ etapes }: { etapes: readonly EtapeMethode[] }) {
  return (
    <ol data-mobile-seulement="" className={v3.frise}>
      {etapes.map((etape, rang) => (
        <li key={etape.cle} className={v3.etape}>
          <div className={v3.etapeRail} aria-hidden="true">
            <span className={v3.etapeNumero}>{etape.numero}</span>
            {rang < etapes.length - 1 ? <span className={v3.etapeFil} /> : null}
          </div>
          <div className={v3.etapeCorps}>
            {etape.quand ? <div className={v3.etapeQuand}>{etape.quand}</div> : null}
            <p className={v3.etapeTitre}>{etape.titre}</p>
            <p className={v3.etapeTexte}>{etape.corps}</p>
            <dl className={v3.encart}>
              <div>
                <dt>Vous</dt>
                <dd>{etape.votreCote}</dd>
              </div>
              <div>
                <dt data-resultat="">Résultat</dt>
                <dd>{etape.resultat}</dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
}
