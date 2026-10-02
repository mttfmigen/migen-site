import type { CSSProperties } from "react";
import Link from "next/link";

import styles from "./ListeRubriques.module.css";

/**
 * Les rubriques du site en cartes-liens. Composant serveur, purement
 * présentationnel : il reçoit ses rubriques, il n'en lit aucune.
 *
 * POURQUOI CE FICHIER EXISTE, séparé de `RubriquesNiveau1.tsx` : celui-là lit
 * la base, donc importe `lib/supabase`, qui porte `import "server-only"`. Un
 * contrôle ne peut pas le rendre hors du serveur Next, et l'habillage serait
 * resté invérifiable. La règle du contrat (« les données viennent en props »)
 * est aussi ce qui rend l'habillage contrôlable sans base de données :
 * `components/cocon/verification-rubriques.tsx` rend celui-ci directement.
 *
 * HABILLAGE. Le gabarit vient de la maquette locale
 * (`maquette/accueil-rendu.html`) : la carte-lien des réalisations, lignes 1536
 * à 1544, et la grille de cartes du rendu de contenu, ligne 2606. Les valeurs
 * sont en style en ligne, comme la maquette les porte ; les survols et les
 * états sont dans `ListeRubriques.module.css`. Aucune couleur littérale : la
 * charte passe par ses jetons, posés dans `app/globals.css`.
 */

/** Une rubrique : son chemin et le titre de sa page. */
export interface Rubrique {
  path: string;
  titre_h1: string;
}

export interface ListeRubriquesProps {
  rubriques: Rubrique[];
  /** Nom accessible du bloc de navigation. */
  libelle: string;
}

/**
 * Grille de cartes de la maquette, ligne 2606 :
 * `repeat(auto-fit,minmax(220px,1fr))` et non les trois colonnes de la grille
 * des offres (ligne 1212).
 *
 * POURQUOI : `mg-rmulti`, qui replie les trois colonnes des offres, se règle
 * sur la largeur de la FENÊTRE. Ce composant-ci ne vit pas en pleine largeur,
 * il vit dans la colonne de la page 404, large de 768 px au plus. Trois
 * colonnes y seraient tenues même sur un écran de bureau. `auto-fit` se règle
 * sur le conteneur : la grille est juste dans la colonne étroite d'aujourd'hui
 * comme en pleine largeur si le composant déménage.
 */
const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "12px",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

/**
 * La carte-lien, maquette 1537 (le châssis) et 1539 (son remplissage).
 *
 * Les deux niveaux de la maquette sont fusionnés en un seul élément : son
 * châssis n'avait deux boîtes que pour détourer une photo, et il n'y a pas de
 * photo ici. La ligne titre-flèche reprend l'alignement de la grille des
 * offres, ligne 1241.
 *
 * Le lien EST la carte, et non un bouton posé dedans comme sur les cartes
 * d'offre : il n'y a ni texte de présentation ni libellé d'action à mettre en
 * face d'une rubrique, et les inventer est interdit. Un seul arrêt de
 * tabulation par rubrique, et toute la surface cliquable.
 *
 * Ni `box-shadow` ni `transform` ici : le module CSS les porte, et un style en
 * ligne battrait son survol.
 */
const CARTE: CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: "var(--rad)",
  padding: "24px 26px 28px",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "14px",
  transition: "transform var(--tr),box-shadow var(--tr)",
  flex: 1,
};

/** Titre de la carte-lien, maquette 1541. */
const TITRE: CSSProperties = {
  font: "600 19px/1.3 var(--ft)",
  letterSpacing: "-.025em",
};

/**
 * La flèche, maquette 1533.
 *
 * `--acc-ink` et non `--acc`, seul écart assumé à la maquette : l'orange de
 * marque sur le blanc de la carte donne 2,6:1, sous le 3:1 du critère 1.4.11
 * et loin du 4,5:1 du 1.4.3. `--acc-ink` donne 8,9:1 sur le même fond, et
 * c'est la déclinaison que la maquette emploie elle-même pour ses liens dans
 * le texte. Les deux rapports sont calculés dans le contrôle, pas supposés.
 */
const FLECHE: CSSProperties = {
  font: "600 15px var(--fb)",
  color: "var(--acc-ink)",
  flex: "none",
};

/* Le `<li>` en flex et la carte en `flex:1` : les cartes d'une même ligne
   gardent la même hauteur quand un titre passe sur deux lignes. */
const CASE: CSSProperties = { display: "flex" };

/**
 * Aucun titre de section n'est rendu ici : l'appelant porte le sien, et deux
 * titres pour une seule liste désordonnent le plan de la page.
 */
export default function ListeRubriques({ rubriques, libelle }: ListeRubriquesProps) {
  if (rubriques.length === 0) return null;

  return (
    <nav aria-label={libelle}>
      <ul style={GRILLE}>
        {rubriques.map((rubrique) => (
          <li key={rubrique.path} style={CASE}>
            <Link href={rubrique.path} className={styles.carte} style={CARTE}>
              <span style={TITRE}>{rubrique.titre_h1}</span>
              <span style={FLECHE} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
