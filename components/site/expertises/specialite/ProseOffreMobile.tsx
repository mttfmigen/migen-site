import type { CSSProperties } from "react";

import { LARGEUR } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import stylesOffre from "@/components/site/offre/PageOffre.module.css";
import type { Paragraphe } from "@/types/contenu";

/**
 * LA PROSE DE « L'offre », RENDUE AU TÉLÉPHONE SEULEMENT (gabarit 05).
 *
 * CE QU'ELLE RÉPARE, mesuré le 14/10 contre les fiches du corpus : chacune des
 * 19 fiches du gabarit 05 écrit, après le tableau de l'offre, un paragraphe de
 * maillage de 31 à 56 mots portant 3 à 5 liens internes (57 liens au total).
 * Le relais `supabase/import/gabarits-maquette/` ne les portait pas : perdus
 * sur les 19 pages, ils sont REMIS dans la donnée (`sections[offre].prose`,
 * champ que `types/contenu.ts` déclare déjà) par
 * `scripts/restaure-prose-gabarit-05.mjs`, verbatim depuis la fiche.
 *
 * POURQUOI MOBILE SEULEMENT. Les deux références ne disent pas la même chose :
 *   - la capture de BUREAU ne rend PAS ce paragraphe (`offre/PointsOffre.tsx`
 *     le déclare : « TROU SIGNALÉ … conformément à la référence ») ;
 *   - la maquette MOBILE v2, qui lit la fiche elle-même
 *     (`migen-mobile-parse.js`), le rend, avec ses liens.
 * `data-mobile-seulement` sert donc les deux à la fois : le texte et ses liens
 * sont dans le DOM à toutes les largeurs (règle « replier, jamais retirer »,
 * et c'est ce que Google lit), visibles sous 881 px, masqués au-dessus — le
 * rendu de bureau ne change pas d'un pixel.
 *
 * LE DESSIN est celui des paragraphes de section de la maquette mobile
 * (dc.html L130, blocs `isP` : 400 15px/1.6 var(--fb), encre secondaire,
 * liens soulignés en graisse 600 — portés par `texteAvecLiens`).
 */

const PARAGRAPHE: CSSProperties = {
  margin: "14px 0 0",
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
  maxWidth: "66ch",
  textWrap: "pretty",
};

export default function ProseOffreMobile({
  prose,
}: {
  prose: readonly Paragraphe[];
}) {
  const pleins = prose.filter((p) => (p.texte ?? "").trim() !== "");
  if (pleins.length === 0) return null;

  return (
    <section data-mobile-seulement="" data-prose-offre-mobile="">
      <div style={LARGEUR}>
        {pleins.map((paragraphe) => (
          <p
            key={paragraphe.texte}
            className={stylesOffre.texteAvecLiens}
            style={PARAGRAPHE}
          >
            {paragraphe.accroche ? (
              <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                {paragraphe.accroche}{" "}
              </strong>
            ) : null}
            <TexteRiche texte={paragraphe.texte} />
          </p>
        ))}
      </div>
    </section>
  );
}
