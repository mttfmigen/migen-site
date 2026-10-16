import Link from "next/link";

import TelephoneHeros from "@/components/site/offre/TelephoneHeros";

import s from "./mobile-apropos.module.css";

/**
 * LE HAUT DE PAGE DE LA MAQUETTE MOBILE V2, pour les pages natives.
 *
 * `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` (« dc.html ») ouvre
 * chaque page sur le même haut (L102 à L116) : fil d'Ariane, photo de tête,
 * sur-titre « Migen · N min de lecture », titre de la page, « Décrire mon
 * besoin » et le téléphone côte à côte, puis le sommaire replié. Nos héros de
 * bureau portent déjà le titre et le chapô ; ces pièces-ci leur ajoutent ce
 * qui manque au téléphone, aux places de la maquette.
 *
 * TOUT EST `data-mobile-seulement` : au-dessus de 880 px, `app/globals.css`
 * les masque, et la page de bureau ne bouge d'aucun pixel.
 *
 * CHAQUE CHAÎNE EST CELLE DE LA MAQUETTE : « Accueil » (L489, premier niveau
 * du fil), « Migen » et « min de lecture » (L485 à L487, `KICK` des pages
 * `/a-propos/` et `readMin`), « Décrire mon besoin » (L412, `cta.label`),
 * « Sommaire » (L116). Le numéro de téléphone est celui de l'en-tête du site,
 * rendu par `TelephoneHeros`.
 *
 * Composant serveur, module sans directive.
 */

/** dc.html L489 : le fil, « Accueil › » puis la page courante. */
export function FilMobile({ page }: { page: string }) {
  return (
    <nav aria-label="Fil d’Ariane" data-mobile-seulement="" className={s.filMobile}>
      <Link href="/">Accueil</Link>
      <span aria-hidden="true">›</span>
      <span aria-current="page">{page}</span>
    </nav>
  );
}

/**
 * dc.html L485 à L487 : `KICK["01"]` vaut « Migen » sous /a-propos/ et
 * /partenaires/, suivi de ` · ${readMin} min de lecture`. `minutes` est le
 * `readMin` de la maquette pour la page (mots / 230, au moins 2).
 */
export function SurtitreMobile({ minutes }: { minutes: number }) {
  return (
    <div data-mobile-seulement="" className={s.surtitreMobile}>
      Migen · {minutes} min de lecture
    </div>
  );
}

/** dc.html L111 : le bouton d'action et le téléphone, côte à côte. */
export function ActionsMobile() {
  return (
    <div data-mobile-seulement="" className={s.actionsMobile}>
      <Link href="/contact/">Décrire mon besoin</Link>
      <TelephoneHeros />
    </div>
  );
}

/** Une carte numérotée de la page, telle que le sommaire la cite. */
export interface EntreeSommaire {
  /** L'ancre posée sur la carte (`SectionRepliee`, prop `id`). */
  id: string;
  /** Le titre de la carte, la même constante que sa bascule. */
  titre: string;
}

/**
 * dc.html L116 : « Sommaire », replié. Les entrées sont les cartes numérotées,
 * dans l'ordre où le téléphone les montre : leur numéro est donc celui de la
 * carte. SANS COMPTEUR depuis le 16/10 : Mehdi a fait retirer les « N
 * parties », « N points » et « · 55 ». La maquette V3 en porte encore
 * (« · 14 », « · 15 ») : c'est la consigne de Mehdi qui l'emporte ici.
 */
export function SommaireMobile({ entrees }: { entrees: readonly EntreeSommaire[] }) {
  if (!entrees.length) return null;
  return (
    <details data-mobile-seulement="" className={s.sommaire}>
      <summary>
        <span className={s.sommaireTitre}>Sommaire</span>
        <span aria-hidden="true" className={s.sommaireChevron}>
          ›
        </span>
      </summary>
      <ol>
        {entrees.map((entree, rang) => (
          <li key={entree.id}>
            <a href={`#${entree.id}`}>
              <span className={s.sommaireNumero}>
                {String(rang + 1).padStart(2, "0")}
              </span>
              <span>{entree.titre}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** dc.html L131 (`isRel`, `relL`) : l'étiquette des liens de lecture. */
export function ALireAussi() {
  return (
    <span data-mobile-seulement="" className={s.aLireAussi}>
      À lire aussi
    </span>
  );
}
