import { LARGEUR } from "@/components/site/blocs/habillage";
import { Bloc } from "@/components/site/editorial/PageEditoriale";
import editorial from "@/components/site/editorial/PageEditoriale.module.css";
import type { BlocEditorial } from "@/types/editorial";

/**
 * Le corpus rédigé que les quatre sections de la maquette ne peuvent pas
 * porter, rendu SOUS elles.
 *
 * POURQUOI CE COMPOSANT EXISTE. Le gabarit métier de la maquette
 * (« accueil-rendu.html », lignes 6128 à 6214) tient en 155 mots : un héros,
 * une rangée de missions, deux rangées de pastilles, les autres métiers, une
 * carte de fin. Le corpus de ces pages porte de 30 à 76 blocs : diplômes,
 * alternance, financement, conditions de travail, marché de l'emploi,
 * questions fréquentes. Les quatre sections de la maquette n'en consomment que
 * trois listes. Tout le reste est du texte rédigé, relu et payé, et c'est la
 * substance du référencement de la page.
 *
 * POURQUOI CETTE MISE EN PAGE ET PAS UNE AUTRE. C'est celle du gabarit ARTICLE
 * de la maquette (lignes 5759 à 5824) : même largeur de lecture, même sommaire
 * collant à gauche, mêmes blocs. `PageEditoriale` l'emploie déjà pour ce même
 * corpus, et `Bloc` lui est importé plutôt que recopié : un second rendu du
 * même texte divergerait au premier ajustement de charte.
 *
 * Composant SERVEUR. Le sommaire tient par `position: sticky`, les ancres sont
 * des liens : aucun JavaScript.
 */
export default function Corps({ blocs }: { blocs: BlocEditorial[] }) {
  // Pas de blocs, pas de section : une section vide vaut moins qu'une section
  // absente, et c'est la règle de tout ce gabarit.
  if (blocs.length === 0) return null;

  // Le sommaire se déduit des titres de niveau 2, jamais saisi deux fois.
  // Sous trois entrées il n'aide personne et la colonne reste pleine largeur.
  const sommaire = blocs.filter(
    (b): b is Extract<BlocEditorial, { type: "titre" }> =>
      b.type === "titre" && b.niveau === 2,
  );

  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns:
              sommaire.length >= 3 ? ".32fr .68fr" : "minmax(0,1fr)",
            gap: 60,
            alignItems: "start",
          }}
        >
          {sommaire.length >= 3 ? (
            <nav
              aria-label="Sommaire de la fiche"
              style={{ position: "sticky", top: 110 }}
            >
              <p
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  margin: "0 0 16px",
                }}
              >
                Sur cette page
              </p>
              <ol
                style={{
                  display: "grid",
                  gap: 9,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {sommaire.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className={editorial.lienSommaire}
                      style={{ font: "500 14px/1.5 var(--fb)" }}
                    >
                      {t.texte}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <article className={editorial.corps} style={{ maxWidth: "74ch" }}>
            {blocs.map((bloc, i) => (
              // L'index suffit comme clé : l'ordre du tableau EST le texte, il
              // ne se réarrange pas.
              <Bloc key={`${bloc.type}-${i}`} bloc={bloc} />
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
