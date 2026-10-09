import Link from "next/link";

import { PROBLEMES } from "@/lib/parcours-mobile";

import s from "./ParcoursMobile.module.css";

/**
 * « Un parcours guidé par le problème, pas par le menu. »
 *
 * C'est la première phrase de la maquette mobile du client
 * (`design_handoff_migen_site/maquette/MigenMobile.dc.html`), et son README la
 * reprend : « le visiteur part de son problème, les blocs se déplient pour
 * rester courts sans perdre le texte utile au référencement ». Sur un
 * téléphone, un menu à cinq groupes et quarante entrées ne se parcourt pas :
 * le visiteur sait ce qui le bloque, pas quelle offre porte ce nom.
 *
 * TROIS CHOIX DE PORTAGE.
 *
 * 1. UN ACCORDÉON NATIF, PAS UNE MACHINE À ÉTATS. La maquette enchaîne des
 *    écrans pleins (`screen: "home" | "prob" | …`) parce qu'elle simule un
 *    téléphone dans une page de présentation. Le site, lui, EST le téléphone :
 *    six `<details name="parcours-mobile">` donnent le même « une seule
 *    réponse à la fois », avec le clavier, le rôle et l'annonce
 *    « développé / réduit » du navigateur, et sans une ligne d'état.
 *
 * 2. TOUT LE TEXTE EST DANS LE HTML SERVI, replié par le navigateur et non
 *    retiré du document. Les six réponses sont du contenu utile : les laisser
 *    sortir du DOM, comme le fait la maquette avec ses `sc-if`, contredirait
 *    son propre README.
 *
 * 3. IL NE TOUCHE PAS AU FORMULAIRE, consigne de Mehdi du 09/10. Le parcours
 *    s'arrête à un lien vers la page de l'offre qui répond vraiment ; le
 *    formulaire reste atteint par la barre basse, qui ne quitte jamais
 *    l'écran. Aucun champ, aucune étape, aucun envoi.
 *
 * La copie vient de `lib/parcours-mobile.ts`, où les retraits imposés par le
 * contrat de rédaction sont déclarés un par un.
 */
export default function ParcoursMobile() {
  return (
    <section className={s.parcours} aria-labelledby="parcours-mobile-titre">
      <div className={s.kicker}>Par où commencer</div>
      <h2 id="parcours-mobile-titre" className={s.titre}>
        Qu&rsquo;est-ce qui vous bloque&nbsp;?
      </h2>
      <p className={s.chapo}>
        Dites-nous ce qui coince, nous vous montrons la réponse et la page qui
        la détaille.
      </p>

      <div className={s.liste}>
        {PROBLEMES.map((probleme) => (
          <details
            key={probleme.numero}
            /* `name` partagé : le navigateur referme la réponse précédente,
               sans script. C'est le « une seule à la fois » de la maquette. */
            name="parcours-mobile"
            className={s.probleme}
          >
            <summary className={s.question}>
              <span>
                <span className={s.numero}>{probleme.numero}</span>
                <span className={s.libelle}>{probleme.question}</span>
              </span>
              <span aria-hidden="true" className={s.chevron}>
                &rsaquo;
              </span>
            </summary>

            <div className={s.reponse}>
              <p className={s.douleur}>{probleme.douleur}</p>
              <p className={s.phrase}>{probleme.reponse}</p>

              <ul className={s.points}>
                {probleme.points.map((point) => (
                  <li key={point} className={s.point}>
                    <span aria-hidden="true" className={s.coche}>
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {probleme.stats.length > 0 ? (
                <div className={s.stats}>
                  {probleme.stats.map((stat) => (
                    <div key={stat.libelle}>
                      <span className={s.statValeur}>{stat.valeur}</span>
                      <span className={s.statLibelle}>{stat.libelle}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* UN SEUL APPEL À L'ACTION ICI, et c'est une correction vue à
                  l'écran : « Décrire mon besoin » figure DÉJÀ dans la barre
                  basse, qui ne quitte jamais l'écran sous 881 px. Le mettre
                  aussi dans la carte l'affichait deux fois, à dix pixels
                  d'intervalle. `Entete.module.css` documente le même piège
                  pour l'îlot du haut. La carte emmène donc vers la page qui
                  détaille l'offre, la barre basse garde le formulaire. */}
              <div className={s.actions}>
                <Link href={probleme.href} prefetch={false} className={s.lienOffre}>
                  Voir l&rsquo;offre {probleme.offre}
                  <span aria-hidden="true">&rsaquo;</span>
                </Link>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
