import type { TuileBascule, VueBascule } from "../AvantApresBascule";
import Carrousel from "./Carrousel";
import v3 from "./accueil-v3.module.css";

type Chiffre = Extract<TuileBascule, { forme: "chiffre" }>;
type Temoin = Exclude<TuileBascule, Chiffre>;

/**
 * Le nom, puis son contexte en gris, sur toutes les cartes comme dans la V3.
 * Une tuile photo porte les deux dans `qui` : « Responsable maintenance ·
 * Agroalimentaire, Rhône » se coupe au premier « · ».
 */
function signature(t: Temoin): [string, string | undefined] {
  if (t.forme === "citation") return [t.qui, t.role];
  const coupe = t.qui.indexOf(" · ");
  return coupe < 0 ? [t.qui, undefined] : [t.qui.slice(0, coupe), t.qui.slice(coupe + 3)];
}

/**
 * « LE JOUR ET LA NUIT » AU TÉLÉPHONE, comme la V3 : les chiffres de la vue en
 * tuiles, puis ses citations en carrousel à points. Les mêmes tuiles que la
 * mosaïque de bureau, rangées autrement : rien n'est ajouté ni retiré, et le
 * texte vient de `avant-apres-donnees.ts`. Les photos de la mosaïque ne sont
 * pas reprises, la V3 n'en montre pas.
 *
 * `data-mobile-seulement` : au-dessus de 880 px, ce bloc n'existe pas.
 */
export default function BasculeMobile({
  vue,
  etiquette,
}: {
  vue: VueBascule;
  etiquette: string;
}) {
  const chiffres = vue.tuiles.filter((t): t is Chiffre => t.forme === "chiffre");
  const temoins = vue.tuiles.filter((t): t is Temoin => t.forme !== "chiffre");

  return (
    <div data-mobile-seulement="">
      {chiffres.length > 0 ? (
        <div className={v3.tuiles}>
          {chiffres.map((t) => (
            <div key={t.cle} className={v3.tuile}>
              <p className={v3.tuileValeur}>{t.chiffre}</p>
              <p className={v3.tuileTexte}>{t.corps}</p>
              <p className={v3.tuileSource}>{t.source}</p>
            </div>
          ))}
        </div>
      ) : null}
      {temoins.length > 0 ? (
        // Une clé par vue : « Avant » puis « Avec » remonte le carrousel, qui
        // repart de sa première citation au lieu de garder sa position.
        <Carrousel key={vue.titre} etiquette={etiquette}>
          {temoins.map((t) => {
            const [qui, contexte] = signature(t);
            return (
              <figure key={t.cle} className={v3.avis}>
                <span aria-hidden="true" className={v3.guillemet}>
                  &ldquo;
                </span>
                <blockquote className={v3.citation}>{t.citation}</blockquote>
                <figcaption className={v3.signature}>
                  <span aria-hidden="true" className={v3.initiale}>
                    {t.forme === "citation" ? t.initiales : qui.charAt(0)}
                  </span>
                  <p className={v3.qui}>{qui}</p>
                  {contexte ? <p className={v3.contexte}>{contexte}</p> : null}
                </figcaption>
              </figure>
            );
          })}
        </Carrousel>
      ) : null}
    </div>
  );
}
