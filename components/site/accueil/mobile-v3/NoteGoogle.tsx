import v3 from "./accueil-v3.module.css";

const ORANGE = "var(--acc)";
const VIDE = "rgba(127,127,127,.28)";

/** Le fond d'une étoile de rang `k` (1 à 5) pour la note `note` (V3 `isRating`). */
function fondEtoile(k: number, note: number): string {
  if (note >= k) return ORANGE;
  if (note > k - 1) return `linear-gradient(90deg,${ORANGE} ${Math.round((note - k + 1) * 100)}%,${VIDE} 0)`;
  return VIDE;
}

/**
 * LA NOTE GOOGLE DE LA V3 (bloc `isRating`) : le chiffre, cinq étoiles, et
 * « Note moyenne sur Google ». Au téléphone seulement.
 *
 * ELLE NE S'AFFICHE QUE SI LE SITE PORTE DÉJÀ UNE NOTE : `note` est celle que
 * la section des avis affiche au bureau (« 4,6 / 5 »). Sans note lisible,
 * rien n'est rendu : aucune note n'est inventée.
 *
 * Les étoiles sont une image nommée par la note elle-même (« 4,6 sur 5 ») ;
 * le chiffre, qui dit la même chose, est masqué aux lecteurs d'écran pour ne
 * pas l'annoncer deux fois.
 */
export default function NoteGoogle({ note }: { note: string }) {
  const [chiffre, sur] = note.split("/").map((morceau) => morceau.trim());
  const valeur = Number.parseFloat((chiffre ?? "").replace(",", "."));
  if (!Number.isFinite(valeur) || !sur) return null;

  return (
    <div data-mobile-seulement="" className={v3.note}>
      <div aria-hidden="true" className={v3.noteChiffre}>
        {chiffre}
        <span>/{sur}</span>
      </div>
      <div className={v3.noteDetail}>
        <span role="img" aria-label={`${chiffre} sur ${sur}`} className={v3.etoiles}>
          {[1, 2, 3, 4, 5].map((k) => (
            <span key={k} style={{ background: fondEtoile(k, valeur) }} />
          ))}
        </span>
        <span>Note moyenne sur Google</span>
      </div>
    </div>
  );
}
