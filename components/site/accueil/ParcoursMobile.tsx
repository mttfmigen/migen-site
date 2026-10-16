import Link from "next/link";

import { PROBLEMES } from "@/lib/parcours-mobile";

import s from "./ParcoursMobile.module.css";

/**
 * « Qu'est-ce qui vous bloque ? », TÉLÉPHONE SEULEMENT, juste sous le héros.
 *
 * MAQUETTE V3 « SITE MOBILE » (validée par Mehdi le 16/10) : six CARTES-LIENS.
 * Le visiteur dit ce qui le bloque, la carte ouvre directement la page de
 * l'offre qui y répond ; le nom de l'offre et sa flèche sont lisibles avant le
 * toucher. La phrase d'introduction est le sous-titre du héros
 * (`Hero.tsx`) : la section n'en porte pas une seconde.
 *
 * LE NOM ACCESSIBLE DU LIEN est la phrase du visiteur suivie du nom de l'offre.
 * Le numéro, la flèche et le chevron sont décoratifs (`aria-hidden`).
 *
 * Sur bureau la section ne s'affiche pas (`.parcours`), la grille d'offres
 * reste l'entrée en matière. Aucun formulaire ici : la barre basse le garde.
 */
export default function ParcoursMobile() {
  return (
    <section className={s.parcours} aria-labelledby="parcours-mobile-titre">
      <h2 id="parcours-mobile-titre" className={s.titre}>
        Qu&rsquo;est-ce qui vous bloque&nbsp;?
      </h2>

      <ul className={s.liste}>
        {PROBLEMES.map((probleme) => (
          <li key={probleme.numero}>
            <Link href={probleme.href} prefetch={false} className={s.carte}>
              <span aria-hidden="true" className={s.numero}>
                {probleme.numero}
              </span>
              <span className={s.texte}>
                <span className={s.question}>{probleme.question}</span>
                <span className={s.offre}>
                  {probleme.offre}
                  <span aria-hidden="true"> →</span>
                </span>
              </span>
              <span aria-hidden="true" className={s.chevron}>
                &rsaquo;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
