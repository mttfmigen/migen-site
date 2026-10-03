"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";

import { VERRE } from "@/components/site/blocs/habillage";

import styles from "./PlanDuSite.module.css";

/**
 * Le plan du site, habillage de la maquette locale
 * (`maquette/accueil-rendu.html`, lignes 2926 à 2948, écran « Plan du site »).
 *
 * POURQUOI CE COMPOSANT EST CLIENT alors que le contrat demande « serveur par
 * défaut » : la maquette porte un champ de recherche (`cQ`, `onCQ`,
 * `planCount`), donc un état. Le filtre a sa raison d'être ici, le plan compte
 * plus de cent entrées. Le référencement n'y perd rien : Next rend les
 * composants client côté serveur au premier passage, et Google reçoit donc la
 * liste complète en HTML. La lecture de la base, elle, reste dans la page.
 *
 * CE QUE LA MAQUETTE NE DIT PAS, et qui vient donc de la base. La maquette
 * liste vingt et un mots dans sept cartes de démonstration (`planFams`, avec
 * ses `hint-placeholder-count`). Un plan du site qui liste des exemples ne sert
 * personne. Les rubriques, leurs pages et leurs comptes sont lus dans la table
 * `pages`, statut publié seulement : le plan ne peut donc pas annoncer une page
 * que le site ne sert pas, et il se met à jour tout seul à chaque publication.
 *
 * LE LIBELLÉ DE RUBRIQUE EST DÉDUIT DU CHEMIN, et ce n'est pas un pis-aller :
 * `titre_h1` d'une page de niveau 1 est une phrase de vente (« Un siège à Lyon,
 * dix hubs de techniciens, des interventions partout en France. »), illisible
 * dans la pastille en capitales de la maquette. Le premier segment du chemin,
 * lui, est court, vrai, et déjà la rubrique. Inventer un libellé court serait
 * de la donnée inventée.
 *
 * REGROUPEMENT PAR SEGMENT, et non par `parent_id` : seize pages publiées ont
 * un parent qui ne l'est pas (`/preuves/eiffage/`, `/ressources/fiches-pratiques/`,
 * `/offres/retrofit/remise-en-etat/`...). Un regroupement par `parent_id` les
 * perdrait, alors que le site les sert. Le chemin, lui, dit toujours la
 * rubrique.
 */

/** Une page du plan, telle que la page serveur la lit. */
export interface EntreePlan {
  path: string;
  titre_h1: string;
}

export interface PlanDuSiteProps {
  /** Les pages publiées, dans l'ordre de leur chemin. */
  pages: EntreePlan[];
}

/* ------------------------------------------------------------- regroupement */

interface Rubrique {
  segment: string;
  libelle: string;
  pages: EntreePlan[];
}

/** « bureau-etudes » devient « bureau etudes ». Les capitales sont en CSS. */
function libelleRubrique(segment: string): string {
  return segment.replace(/-/g, " ");
}

/**
 * Sans accents et en minuscules : « metier » doit trouver « métier », sinon le
 * champ de recherche ne sert qu'à ceux qui tapent les accents.
 */
function aplati(texte: string): string {
  return texte
    .normalize("NFD")
    // Les diacritiques combinants, et non `\p{Diacritic}` : la cible du projet
    // est ES2017, qui ne garantit pas les échappements de propriété Unicode.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Les pages groupées par premier segment de chemin.
 *
 * L'ordre des rubriques suit celui des chemins reçus, et celui des pages dans
 * une rubrique aussi : la racine de la rubrique (« /offres/ ») arrive donc
 * avant ses filles, et deux visites de la page donnent le même plan.
 */
export function rubriques(pages: EntreePlan[]): Rubrique[] {
  const parSegment = new Map<string, Rubrique>();
  for (const page of pages) {
    const segment = page.path.split("/").filter(Boolean)[0];
    if (!segment) continue; // L'accueil n'a pas de rubrique.
    const connue = parSegment.get(segment);
    if (connue) connue.pages.push(page);
    else {
      parSegment.set(segment, {
        segment,
        libelle: libelleRubrique(segment),
        pages: [page],
      });
    }
  }
  return [...parSegment.values()];
}

/* ---------------------------------------------------------------- habillage */

/** Maquette 2928 : le dégagement de la barre de navigation fixe. */
const DEGAGEMENT: CSSProperties = { paddingTop: 96 };

/** Maquette 2929. Le `maxWidth` reste littéral : les marges mobiles de
    `app/globals.css` visent `section[style*="max-width:1200px"]`. */
const SECTION_TETE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "56px 40px 0",
};

/** Maquette 2939. */
const SECTION_GRILLE: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "48px 40px var(--sec)",
};

/**
 * Maquette 2930, en `--acc-ink` là où elle écrit `--acc`.
 *
 * L'orange de marque (#ff7c3c) ne vaut que 2,6:1 sur le fond crème, pour un
 * texte de 11,5 px : sous le plancher de 4,5:1 du critère WCAG 1.4.3.
 * `--acc-ink` (#7d3309) en vaut 8:1, et garde l'orange de la charte. C'est le
 * remède déjà retenu par `app/not-found.tsx` et par `ListeRubriques.tsx`.
 */
const SURTITRE: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc-ink)",
  marginBottom: 18,
};

/** Maquette 2931. */
const TITRE: CSSProperties = {
  font: "600 calc(clamp(34px,4.2vw,58px) * var(--ts))/1.04 var(--ft)",
  letterSpacing: "-.045em",
  color: "var(--ink)",
  margin: "0 0 28px",
  maxWidth: "18ch",
};

/** Maquette 2932 : la même carte en verre que partout, en pilule. */
const CHAMP: CSSProperties = {
  ...VERRE,
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "16px 22px",
  borderRadius: 999,
  maxWidth: 720,
};

/** Maquette 2934. */
const SAISIE: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  font: "400 16px var(--fb)",
  color: "var(--ink)",
};

/**
 * Maquette 2935, en `--ink2` là où elle écrit `--ink4`.
 *
 * `--ink4` (#a8a49d) donne 2,2:1 sur le fond du site : le compte serait
 * illisible. `--ink2` (#6a6764) en donne 5:1. Même correction que
 * `components/cocon/FilAriane.module.css` et que le panneau de consentement.
 */
const COMPTE: CSSProperties = {
  font: "500 12.5px var(--fb)",
  color: "var(--ink2)",
  whiteSpace: "nowrap",
};

/**
 * Maquette 2940, avec UN SEUL ÉCART, et il vient des données réelles.
 *
 * La maquette écrit `grid-template-columns:repeat(auto-fill,minmax(250px,1fr))`
 * et `align-items:start`, sur sept familles de démonstration de six entrées
 * chacune (`hint-placeholder-count="6"`). Les vraies rubriques vont de UNE page
 * (« ressources ») à QUARANTE-TROIS (« implantations »). Dans une grille, la
 * hauteur d'une rangée est celle de sa carte la plus haute : la carte d'une page
 * posée sur la même rangée que celle de quarante-trois laisse deux mille pixels
 * de vide sous elle. Mesuré, pas supposé.
 *
 * Les colonnes CSS empilent les cartes sans rangées : chacune reprend là où la
 * précédente s'arrête, et il n'y a plus de trou. La LARGEUR de colonne et la
 * GOUTTIÈRE restent celles de la maquette, 250 px et 14 px, donc le mur de
 * cartes est le même. Seule la façon de les ranger change, et la maquette ne
 * pouvait pas la décider : elle ne connaissait pas ces écarts.
 *
 * `breakInside` est sur la carte, pas ici : voir `CARTE`.
 */
const GRILLE: CSSProperties = {
  columnWidth: 250,
  columnGap: 14,
  listStyle: "none",
  margin: 0,
  padding: 0,
};

/** Maquette 2942. L'espacement vertical reprend la gouttière de la maquette. */
const CARTE: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad)",
  padding: "24px 22px 22px",
  breakInside: "avoid",
  marginBottom: 14,
};

/** Maquette 2943, la ligne libellé + compte de la carte. */
const TETE_CARTE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 12,
  padding: "0 8px 10px",
  borderBottom: "1px solid var(--line)",
};

/** Maquette 2943 : 11 px, pas 11,5, la déclaration y est écrasée sur place. */
const LIBELLE_RUBRIQUE: CSSProperties = {
  ...SURTITRE,
  fontSize: 11,
  marginBottom: 0,
};

/** Maquette 2943, compteur monospace. `--ink2` : voir `COMPTE`. */
const COMPTE_RUBRIQUE: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--ink2)",
};

/** Maquette 2944. */
const LISTE: CSSProperties = {
  display: "grid",
  gap: 1,
  listStyle: "none",
  margin: 0,
  padding: 0,
};

/**
 * La rangée de la maquette 2944 n'expose pas son style : il est calculé
 * (`{{ p.css }}`). Seul son survol est écrit, « background:var(--acc-w);
 * color:var(--acc-ink) », et c'est lui qui est porté dans le module CSS. Le
 * repos reprend donc la rangée de liste de la maquette, ligne 1055 (les
 * panneaux du menu) : mêmes 9 px sur 11, même rayon de 11, même transition, et
 * la typographie de son titre. Rien d'inventé, et rien de recopié de mémoire.
 *
 * L'interlignage est le seul ajout : un `titre_h1` tient sur trois lignes dans
 * une colonne de 250 px, et la maquette n'avait que des libellés d'un mot.
 */
const RANGEE: CSSProperties = {
  display: "block",
  padding: "9px 11px",
  borderRadius: 11,
  font: "600 14px/1.45 var(--ft)",
  letterSpacing: "-.022em",
  transition: "background var(--tr),color var(--tr)",
};

/* ----------------------------------------------------------------- composant */

export default function PlanDuSite({ pages }: PlanDuSiteProps) {
  const [requete, setRequete] = useState("");

  const groupes = useMemo(() => {
    const toutes = rubriques(pages);
    const cherche = aplati(requete.trim());
    if (!cherche) return toutes;
    // Le chemin est cherché autant que le titre : « lyon » doit trouver
    // « /implantations/lyon/ » même si son H1 ne nomme pas la ville.
    return toutes
      .map((rubrique) => ({
        ...rubrique,
        pages: rubrique.pages.filter((page) =>
          aplati(`${page.titre_h1} ${page.path}`).includes(cherche),
        ),
      }))
      .filter((rubrique) => rubrique.pages.length > 0);
  }, [pages, requete]);

  const visibles = groupes.reduce((total, r) => total + r.pages.length, 0);

  return (
    // `mg-site` n'est pas décoratif : les règles de `app/globals.css` qui
    // rattrapent les marges, l'échelle du H1 et les arrondis sous 760px sont
    // toutes préfixées par cette classe, et c'est elle qui pose le fond crème.
    <div className="mg-site">
      <main style={DEGAGEMENT}>
        <section style={SECTION_TETE}>
          <div style={SURTITRE}>Plan du site</div>
          <h1 style={TITRE}>Toutes nos pages, au même endroit.</h1>
          {/* Le `<label>` enveloppant est celui de la maquette, et il sert :
              toute la pilule donne le focus au champ. La maquette ne lui donne
              qu'un texte indicatif, ce qui ne fait pas un nom accessible (le
              texte indicatif disparaît à la première frappe), d'où l'`aria-label`
              sur la saisie. */}
          <label style={CHAMP}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink3)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ flex: "none" }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4.3-4.3" />
            </svg>
            <input
              type="search"
              aria-label="Chercher une page du site"
              placeholder="Une ville, un métier, une expertise…"
              value={requete}
              onChange={(evenement) => setRequete(evenement.target.value)}
              style={SAISIE}
            />
            {/* Annoncé poliment : le compte change à chaque frappe, c'est la
                seule confirmation qu'un lecteur d'écran reçoit du filtre. */}
            <span style={COMPTE} aria-live="polite">
              {visibles} {visibles > 1 ? "pages" : "page"}
            </span>
          </label>
        </section>
        <section style={SECTION_GRILLE}>
          {groupes.length === 0 ? (
            <p style={{ font: "400 16.5px/1.7 var(--fb)", color: "var(--ink1)", margin: 0 }}>
              Aucune page ne correspond à cette recherche.
            </p>
          ) : (
            <ul style={GRILLE}>
              {groupes.map((rubrique) => (
                <li key={rubrique.segment} style={CARTE}>
                  <div style={TETE_CARTE}>
                    <h2 style={LIBELLE_RUBRIQUE}>{rubrique.libelle}</h2>
                    <span style={COMPTE_RUBRIQUE}>{rubrique.pages.length}</span>
                  </div>
                  <ul style={LISTE}>
                    {rubrique.pages.map((page) => (
                      <li key={page.path}>
                        <Link
                          href={page.path}
                          style={RANGEE}
                          className={styles.rangee}
                        >
                          {page.titre_h1}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
