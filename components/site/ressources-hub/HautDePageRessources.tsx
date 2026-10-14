import Link from "next/link";

import { CIBLE_CONTACT, CIBLE_POSTULER } from "@/components/site/mobile/conversion-donnees";

import styles from "./HautDePageRessources.module.css";

/**
 * Le haut de page « sur mesure » du hub /ressources/, version mobile v2.
 *
 * LA RÉFÉRENCE : la maquette mobile v2 (`maquette/mobile-v2/maquette/Migen -
 * Mobile v2.dc.html`, bloc `isResTop`). Son LISEZMOI l'écrit : « Accueil,
 * Ressources et Contact ont un haut de page sur mesure ». Pour /ressources/,
 * ce haut de page porte un kicker « Ressources migen », le H1 de la page et
 * une phrase d'annonce, puis la bibliothèque.
 *
 * CE QUE CE COMPOSANT PORTE, ET RIEN D'AUTRE : le kicker et la phrase
 * d'annonce, les deux textes que la production ne servait pas (mesuré le
 * 14/10 sur https://migen-site.vercel.app/ressources/ : aucun des deux dans
 * le `<main>`). Le H1, le fil d'Ariane et le chapô restent au héros du
 * gabarit guide, qui les rend déjà ; la bibliothèque filtrable et ses
 * filtres sont le travail d'un lot antérieur et ne sont pas touchés. Le bloc
 * se pose entre les deux, au-dessus de la bibliothèque, et n'est VISIBLE que
 * sous 881 px (voir le module CSS) : le rendu de bureau ne bouge d'aucun
 * pixel, le texte, lui, est dans le DOM aux deux largeurs.
 *
 * AUCUN H1 ICI, et c'est voulu : la page a le sien, un deuxième casserait la
 * structure du document. La porte `verification-haut-de-page.tsx` compte les
 * H1 du rendu complet et exige qu'il n'y en ait qu'un.
 *
 * Composant SERVEUR, aucun JavaScript embarqué.
 */

/**
 * Les deux libellés, VERBATIM depuis la maquette mobile v2. L'apostrophe de
 * « qu’elles » est typographique, comme dans la source : la porte compare ces
 * chaînes au fichier de la maquette, une copie approximative la fait tomber.
 */
export const KICKER_RESSOURCES = "Ressources migen";
export const SOUS_TITRE_RESSOURCES =
  "Méthodes, organisation, GMAO, intelligence artificielle : écrit par nos équipes, à partir de ce qu’elles voient sur les sites industriels.";

export default function HautDePageRessources() {
  return (
    <section className={styles.haut} aria-label="Ressources migen">
      <p className={styles.kicker}>{KICKER_RESSOURCES}</p>
      <p className={styles.sousTitre}>{SOUS_TITRE_RESSOURCES}</p>
    </section>
  );
}

/**
 * LE PANNEAU SOMBRE QUI FERME LE HAUT DE PAGE MOBILE, même bloc `isResTop` de
 * la maquette mobile v2 : surtitre `res.ctaK`, phrase `res.ctaT`, bouton
 * `res.ctaL` vers `res.ctaH`, une variante par espace. Les chaînes sont
 * VERBATIM (apostrophe typographique comprise).
 *
 * CE N'EST PAS LA CADENCE DE CONVERSION. La maquette n'en pose aucune sur
 * /ressources/ (`pushCtas` sort tout de suite, dc.html L453) ni de rappel
 * final (`showEndCta`, L576) : ce panneau-ci est le seul appel de la page,
 * et il appartient à son haut de page sur mesure, sous la bibliothèque.
 *
 * Une seule cible s'écarte de la maquette, et l'écart est celui de toute la
 * couche mobile : l'ancre `#postuler-chez-migen` n'existe pas sur le site,
 * la section de candidature s'appelle `#postuler` (`CIBLE_POSTULER`).
 *
 * TÉLÉPHONE SEULEMENT (`data-mobile-seulement`, masqué au-dessus de 880 px
 * par `app/globals.css`) : le bureau ne change pas d'un pixel.
 */
export const APPEL_RESSOURCES = {
  entreprises: {
    surtitre: "Diagnostic Zéro arrêt",
    phrase:
      "Combien vous coûtent vraiment vos arrêts ? Un chargé d’affaires vous rappelle avec une estimation.",
    bouton: "Demander mon diagnostic",
    href: CIBLE_CONTACT,
  },
  techniciens: {
    surtitre: "Rejoindre migen",
    phrase: "Rejoignez les 120 collaborateurs de migen.",
    bouton: "Postuler chez Migen",
    href: CIBLE_POSTULER,
  },
} as const;

export function AppelRessourcesMobile({
  espace,
}: {
  espace: keyof typeof APPEL_RESSOURCES;
}) {
  const appel = APPEL_RESSOURCES[espace];
  return (
    <aside data-mobile-seulement="" className={styles.appel} aria-label={appel.surtitre}>
      <p className={styles.appelSurtitre}>{appel.surtitre}</p>
      <p className={styles.appelPhrase}>{appel.phrase}</p>
      <Link href={appel.href} prefetch={false} className={styles.appelBouton}>
        {appel.bouton}
      </Link>
    </aside>
  );
}
