import styles from "./PageOffre.module.css";

/**
 * L'ÉTIQUETTE DE LA BASCULE D'UN BLOC REPLIABLE PARTAGÉ : le titre de la
 * carte numérotée de la maquette mobile v2, dans le `<summary>`.
 *
 * Elle n'existe que sous 881 px (`styles.etiquettePli`, `data-mobile-seulement`).
 * Au-dessus, la bascule entière est retirée par `.blocPliablePartage`, et le
 * sur-titre et le `<h2>` de la capture de bureau restent seuls, à leur place.
 *
 * LE TITRE RESTE AFFICHÉ CARTE OUVERTE, comme dans la maquette (dc.html L130 :
 * le `<h2>` de la carte est dans le `<summary>`, ouvert ou fermé). Jusqu'au
 * 14/10 il s'effaçait à l'ouverture : la carte ouverte au chargement montrait
 * un en-tête vide, le seul numéro, et son titre partait dans le corps, hors du
 * rembourrage de la carte. Signalé sur tous les gabarits qui partagent ces
 * blocs. Quand le corps répète le même texte, c'est lui qui s'efface
 * (`data-doublon-mobile`), pas l'étiquette. `data-etiquette-permanente` le
 * dit à la feuille ; les étiquettes écrites à la main par d'autres gabarits
 * avec la seule classe `etiquettePli` gardent l'ancien comportement.
 *
 * Typographie : celle de la carte partagée (`data-carte-surtitre`,
 * `data-carte-titre`, `app/globals.css`), valeurs de dc.html L130.
 */
export default function EtiquettePli({
  surtitre,
  titre,
}: {
  /** Facultatif : le sur-titre de la carte (dc.html `sx.kick`). */
  surtitre?: string;
  /** Le titre de la carte (dc.html `sx.t`). */
  titre: string;
  /** Gardé pour les appelants : la carte n'est plus jamais sombre au téléphone. */
  couleur?: string;
}) {
  return (
    <span
      data-mobile-seulement=""
      data-etiquette-permanente=""
      className={styles.etiquettePli}
    >
      {surtitre ? <span data-carte-surtitre="">{surtitre}</span> : null}
      <span data-carte-titre="">{titre}</span>
    </span>
  );
}
