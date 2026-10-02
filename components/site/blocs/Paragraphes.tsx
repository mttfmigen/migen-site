import type { Paragraphe } from "@/types/contenu";
import { PROSE, PROSE_FORT } from "./habillage";

/**
 * Les paragraphes longs du corpus, avec leur gras d'attaque.
 *
 * Partagé par les sections qui en portent (chiffres, offre) plutôt que recopié :
 * c'est le seul endroit du gabarit où du texte suivi est rendu, et il doit
 * l'être partout de la même façon.
 */
export default function Paragraphes({
  paragraphes,
  largeur = "74ch",
}: {
  paragraphes?: Paragraphe[];
  largeur?: string;
}) {
  if (!paragraphes || paragraphes.length === 0) return null;

  return (
    <div style={{ marginTop: 26, maxWidth: largeur }}>
      {paragraphes.map((paragraphe) => (
        <p key={paragraphe.texte} style={PROSE}>
          {paragraphe.accroche ? (
            <strong style={PROSE_FORT}>{paragraphe.accroche} </strong>
          ) : null}
          {paragraphe.texte}
        </p>
      ))}
    </div>
  );
}
