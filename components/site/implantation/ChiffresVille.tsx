import {
  CARTE_CHIFFRE,
  CHIFFRE_LIBELLE,
  CHIFFRE_VALEUR,
  GRILLE_CHIFFRES,
  SECTION_CHIFFRES,
} from "@/components/site/offre/habillage-offre";

import stylesVille from "./PageVille.module.css";

/**
 * « 01 Chiffres » des gabarits 04 Ville, 06 Département et du hub
 * `/implantations/`. Sur bureau, la carte de verre de la capture, autant de
 * colonnes que de chiffres. Sous 881 px, « Chiffres clés » et des tuiles
 * 2 x 2 (dc.html `isStats`) : le socle partagé (`data-chiffres-mobile`,
 * `data-tuiles-chiffres`, `app/globals.css`) retire la carte de verre et pose
 * les tuiles. Le titre est celui de la section du corpus (« ## Chiffres
 * clés », sur les 75 fichiers de la famille), rendu au téléphone seulement :
 * la capture de bureau n'en dessine aucun.
 */
/**
 * « + 120 Collaborateurs » (Bordeaux) : le MOT qui suit le nombre passe, au
 * téléphone, en petit sous la valeur, comme le libellé de la tuile de la
 * maquette (« +120 », puis « collaborateurs : … »). Même texte, même ligne sur
 * bureau : un `<span>` en ligne ne change aucun pixel.
 */
function Valeur({ valeur }: { valeur: string }) {
  const m = valeur.match(/^([+−-]?\s?[\d\s.,]+%?)\s+(\p{L}.*)$/u);
  if (!m) return <>{valeur}</>;
  return (
    <>
      {m[1]} <span className={stylesVille.uniteChiffre}>{m[2]}</span>
    </>
  );
}

export default function ChiffresVille({
  chiffres,
}: {
  chiffres: readonly { valeur: string; libelle: string }[];
}) {
  if (chiffres.length === 0) return null;
  return (
    <section data-chiffres-mobile="" style={SECTION_CHIFFRES}>
      <h2 data-mobile-seulement="" data-tuiles-titre="">
        Chiffres clés
      </h2>
      <div
        className="mg-rmulti"
        data-tuiles-chiffres=""
        style={{ ...GRILLE_CHIFFRES, gridTemplateColumns: `repeat(${chiffres.length},minmax(0,1fr))` }}
      >
        {chiffres.map((chiffre, rang) => (
          <div
            key={`${chiffre.valeur}-${chiffre.libelle}`}
            style={rang > 0 ? { ...CARTE_CHIFFRE, borderLeft: "1px solid var(--line)" } : CARTE_CHIFFRE}
          >
            <div style={CHIFFRE_VALEUR}>
              <Valeur valeur={chiffre.valeur} />
            </div>
            <div style={CHIFFRE_LIBELLE}>{chiffre.libelle}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
