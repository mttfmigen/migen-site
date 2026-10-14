import type { CSSProperties } from "react";

import {
  carteDe,
  enfantsDe,
  entreeDe,
  gabaritDe,
  soeursDe,
  titreEnfants,
  TITRE_SOEURS,
  TITRES_RANGEE_HAUTE,
  voirLesAutres,
  type PastilleCocon,
} from "./maillage-mobile";

/**
 * LE BLOC DE PASTILLES DU MAILLAGE, maquette mobile v2.
 *
 * RELEVÉ DANS `maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html` :
 *
 *   L125 (boîte haute, sous le héros, margin:20px 18px 0) et L134 (boîte
 *   basse, margin:22px 18px 0), au balisage identique :
 *
 *   <section style="margin:20px 18px 0">
 *     <h2 style="margin:0 0 10px;font:600 11px var(--fb);letter-spacing:.14em;
 *       text-transform:uppercase;color:#ff7c3c">{{ t }} · {{ n }}</h2>
 *     <div style="display:grid;gap:6px">
 *       <a href="{{ k.href }}" style="display:flex;justify-content:space-between;
 *         align-items:center;gap:12px;padding:13px 15px;border-radius:16px;
 *         background:#fff;border:1px solid rgba(28,27,25,.08)">
 *         <span style="min-width:0">
 *           <span style="display:block;font:600 14px/1.35 var(--ft);
 *             letter-spacing:-.015em;color:#1c1b19">{{ k.l }}</span>
 *           <span style="display:block;margin-top:2px;font:400 12px var(--fb);
 *             color:#77736d">{{ k.m }}</span>   <!-- « N min de lecture » -->
 *         </span>
 *         <span style="flex:none;color:#ff7c3c;font:400 20px/1 var(--fb)">›</span>
 *       </a> … 8 premières pastilles …
 *     </div>
 *     <details data-open="0" style="margin-top:6px">  <!-- au-delà de 8 -->
 *       <summary style="display:flex;justify-content:center;align-items:center;
 *         min-height:46px;border-radius:999px;border:1px dashed rgba(28,27,25,.18);
 *         font:600 13.5px var(--fb);color:#b4490f;cursor:pointer">
 *         Voir les {{ n - 8 }} autres pages</summary>
 *       <div style="display:grid;gap:6px;margin-top:6px"> … le reste … </div>
 *     </details>
 *   </section>
 *
 *   Les titres et leur cascade : L498-506. Les données : `./maillage-mobile`,
 *   qui porte ses propres sources. Les puces du héros (L110, gabarits 07 et
 *   05) sont un AUTRE élément, propriété du haut de page, pas de ce bloc.
 *
 * REPLIER, JAMAIS RETIRER : au-delà de 8 pastilles, le reste vit dans un
 * `<details>` natif, exactement comme la maquette (L125). Tous les liens
 * restent dans le DOM, repliés ou non ; la porte `verification-pastilles.mjs`
 * le mesure et sait refuser un lien retiré.
 *
 * `data-mobile-seulement` : les 248 captures bureau (`maquette/rendu/`) ne
 * portent ni « Dans la même rubrique » ni « Voir les N autres pages »
 * (mesuré le 14/10 : zéro occurrence sur l'ensemble). Le bloc est donc un
 * apport de la maquette MOBILE et n'existe que sous 881 px, par la règle
 * déjà posée dans `app/globals.css` (`@media (min-width: 881px)`).
 *
 * COMPOSANT SERVEUR, aucun « use client » : pas d'état, pas d'événement, le
 * `<details>` se plie tout seul. La porte vérifie l'absence de directive.
 *
 * CONTRAT FIGÉ, d'autres lots l'importent : `{ chemin, variante? }`.
 *   variante absente   la cascade de la maquette (L498-506) : les enfants
 *                      s'il y en a et que le gabarit n'est pas 07 (le métier
 *                      met ses enfants en puces de héros, L487), sinon les
 *                      sœurs, sinon rien.
 *   « enfants »        la boîte des enfants, ou rien s'il n'y en a pas.
 *   « soeurs »         « Dans la même rubrique », ou rien.
 */

const VISIBLES_AVANT_REPLI = 8; /* dc.html L377 : first = slice(0, 8) */

const SECTION_HAUTE: CSSProperties = { margin: "20px 18px 0" }; /* L125 */
const SECTION_BASSE: CSSProperties = { margin: "22px 18px 0" }; /* L134 */

const TITRE_BOITE: CSSProperties = {
  margin: "0 0 10px",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#ff7c3c",
};

const GRILLE: CSSProperties = { display: "grid", gap: 6 };

const GRILLE_REPLIEE: CSSProperties = {
  display: "grid",
  gap: 6,
  marginTop: 6,
};

const PASTILLE: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "13px 15px",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(28,27,25,.08)",
  textDecoration: "none",
};

const CORPS: CSSProperties = { minWidth: 0 };

const LIBELLE: CSSProperties = {
  display: "block",
  font: "600 14px/1.35 var(--ft)",
  letterSpacing: "-.015em",
  color: "#1c1b19",
};

const MINUTES: CSSProperties = {
  display: "block",
  marginTop: 2,
  font: "400 12px var(--fb)",
  color: "#77736d",
};

const CHEVRON: CSSProperties = {
  flex: "none",
  color: "#ff7c3c",
  font: "400 20px/1 var(--fb)",
};

const REPLI: CSSProperties = { marginTop: 6 };

const REPLI_ETIQUETTE: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 46,
  borderRadius: 999,
  border: "1px dashed rgba(28,27,25,.18)",
  font: "600 13.5px var(--fb)",
  color: "#b4490f",
  cursor: "pointer",
};

function Pastille({ carte }: { carte: PastilleCocon }) {
  return (
    <a href={carte.href} style={PASTILLE}>
      <span style={CORPS}>
        <span style={LIBELLE}>{carte.libelle}</span>
        {carte.minutes ? <span style={MINUTES}>{carte.minutes}</span> : null}
      </span>
      <span style={CHEVRON} aria-hidden="true">
        ›
      </span>
    </a>
  );
}

export interface PastillesCoconProps {
  /** Le chemin de la page, avec slash final (« /expertises/automatisme/ »). */
  chemin: string;
  variante?: "enfants" | "soeurs";
}

export default function PastillesCocon({
  chemin,
  variante,
}: PastillesCoconProps) {
  const entree = entreeDe(chemin);
  /* La cascade de la maquette (L498) ne calcule rien pour une page hors
     index ; une variante explicite, elle, répond à l'appelant qui sait. */
  if (!variante && !entree) return null;

  const enfants =
    variante === "soeurs"
      ? []
      : variante === "enfants" || !entree || gabaritDe(entree) !== "07"
        ? enfantsDe(chemin)
        : []; /* L505 : le gabarit 07 met ses enfants en puces de héros. */

  const liste = enfants.length > 0 ? enfants : variante === "enfants" ? [] : soeursDe(chemin);
  if (liste.length === 0) return null;

  const titre = enfants.length > 0 ? titreEnfants(chemin) : TITRE_SOEURS;
  const cartes = liste.map(carteDe);
  const premieres = cartes.slice(0, VISIBLES_AVANT_REPLI);
  const suite = cartes.slice(VISIBLES_AVANT_REPLI);

  return (
    <section
      data-pastilles-cocon=""
      data-mobile-seulement=""
      style={TITRES_RANGEE_HAUTE.includes(titre) ? SECTION_HAUTE : SECTION_BASSE}
    >
      <h2 style={TITRE_BOITE}>
        {titre} · {cartes.length}
      </h2>
      <div style={GRILLE}>
        {premieres.map((carte) => (
          <Pastille key={carte.href} carte={carte} />
        ))}
      </div>
      {suite.length > 0 ? (
        <details style={REPLI}>
          <summary style={REPLI_ETIQUETTE}>{voirLesAutres(suite.length)}</summary>
          <div style={GRILLE_REPLIEE}>
            {suite.map((carte) => (
              <Pastille key={carte.href} carte={carte} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
