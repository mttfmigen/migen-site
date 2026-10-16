import Link from "next/link";

import type { Besoin } from "./BentoBesoins";
import { SURTITRE_BESOINS, TITRE_BESOINS } from "./besoins-titres";
import m from "./AccueilMobile.module.css";

/**
 * « Partez de votre besoin », TÉLÉPHONE SEULEMENT : la FAQ de la maquette V3
 * « Site mobile », juste après « Nos réalisations » et sans numéro. Chaque
 * phrase du visiteur est une carte « + » ; ouverte, elle donne la réponse,
 * le détail, les points, le cadre et le lien vers l'offre.
 *
 * MÊMES DONNÉES QUE LE PAVAGE DU BUREAU (`BESOINS`), qui s'efface à cette
 * largeur : les retraits de copie déjà déclarés dans `bento-besoins-donnees`
 * (« régie », « clé en main », délais chiffrés) valent ici aussi. La V3 écrit
 * « Cadre : Clé en main · Délai : Étude sous 3 semaines » : rien n'en est
 * repris, seules les lignes que le site garde sont montrées.
 *
 * Le dessin vient du motif partagé de la maquette mobile (`data-faq-liste`,
 * `data-faq-surtitre`, `data-faq-titre`, `app/globals.css`) ; le `name` commun
 * n'ouvre qu'une carte à la fois. Composant serveur, `<details>` natifs.
 */
export default function BesoinsMobile({ besoins }: { besoins: readonly Besoin[] }) {
  return (
    <section data-mobile-seulement="" className={m.besoins} aria-labelledby="besoins-mobile-titre">
      <p data-faq-surtitre="">{SURTITRE_BESOINS}</p>
      <h2 id="besoins-mobile-titre" data-faq-titre="">
        {TITRE_BESOINS}
      </h2>
      <div data-faq-liste="">
        {besoins.map((besoin) => {
          const cadre = (
            [
              ["Cadre", besoin.cadre],
              ["Délai", besoin.delai],
              ["Durée", besoin.duree],
            ] as const
          )
            .filter(([, valeur]) => valeur)
            .map(([cle, valeur]) => `${cle} : ${valeur}`)
            .join(" · ");
          return (
            <details key={besoin.id} name="besoins-mobile">
              <summary>
                <span>{besoin.need}</span>
                <span aria-hidden="true">+</span>
              </summary>
              <div>
                <p>{besoin.answer}</p>
                <p>{besoin.detail}</p>
                <ul className={m.besoinPoints}>
                  {besoin.points.map((point) => (
                    <li key={point}>
                      <span aria-hidden="true" className={m.coche}>
                        ✓
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {cadre ? <p className={m.besoinCadre}>{cadre}</p> : null}
                <Link href={besoin.href} prefetch={false} className={m.besoinLien}>
                  {besoin.cta}
                </Link>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
