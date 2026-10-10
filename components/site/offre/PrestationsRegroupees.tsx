import Link from "next/link";
import { useId, type CSSProperties } from "react";

import { LARGEUR, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { PrestationRegroupee, PrestationsRegroupees as Donnees } from "@/types/offre";

import { cibleSure } from "./LiensOffre";
import { numerote } from "./texte-offre";

import styles from "./PageOffre.module.css";

/**
 * Section « Offres regroupées » de la RÉFÉRENCE, bloc `data-dc-tpl="856"` de
 * `maquette/rendu/offres--zero-arret.html` : surtitre « Également dans cette
 * offre », H2 « Les prestations regroupées ici », lien « Décrire mon besoin → »
 * vers `#besoin`, puis une carte en verre par prestation absorbée, repliée,
 * numérotée, avec son « + ».
 *
 * À QUOI ELLE SERT. La maquette déclare des redirections d'offres
 * (`remapOffer`, voir `docs/PASSATION.md` §2) : `/offres/depannage-industriel/`
 * est servie par `/offres/zero-arret/`. Le contenu de la page absorbée n'est pas
 * perdu, il est rangé ici, replié. C'est le cocon de la page, donc sa substance
 * de référencement : il est rendu dans le DOM, fermé par défaut, comme dans la
 * capture.
 *
 * COMPOSANT AJOUTÉ LE 07/10 POUR /offres/zero-arret/, et c'est le seul écart de
 * structure entre sa capture (18 sections) et celle de la page pilote
 * `/offres/residence/` (17 sections). IL EST INERTE SANS DONNÉE : `PageOffre`
 * ne le monte que si `contenu.prestationsRegroupees` existe, donc aucune des
 * 21 autres pages du gabarit 03 ne change de rendu. Les pages qui portent la
 * même section dans leur propre capture n'ont qu'à remplir le champ.
 *
 * Le résumé est tronqué à une ligne, comme la capture (`-webkit-line-clamp: 1`
 * sur le bloc 870) : le texte entier reste dans le DOM.
 */

export interface ProprietesPrestationsRegroupees {
  donnees: Donnees;
}

const ENTETE: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 18,
};

const TITRE: CSSProperties = {
  font: "600 calc(clamp(22px,2.2vw,28px) * var(--ts))/1.15 var(--ft)",
  letterSpacing: "-.03em",
  margin: 0,
};

/** Le lien de bas de pli vers la page réelle de la prestation (07/10). */
const LIEN_PRESTATION: CSSProperties = {
  font: "600 14px var(--fb)",
  /* Sur le verre clair du pli : 2,45:1 en `--acc`, 8,57:1 en `--acc-ink`. */
  color: "var(--acc-ink)",
};

const LIEN: CSSProperties = {
  font: "600 14.5px var(--fb)",
  /* Sur le fond crème de la section : 2,29:1 en `--acc`, 7,98:1 en `--acc-ink`. */
  color: "var(--acc-ink)",
  whiteSpace: "nowrap",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
  gap: 12,
  alignItems: "start",
};

const PLI: CSSProperties = {
  ...VERRE,
  borderRadius: "var(--rad-s)",
  overflow: "hidden",
};

const RESUME: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "grid",
  gridTemplateColumns: "36px minmax(0,1fr) 28px",
  gap: 14,
  alignItems: "center",
  padding: "16px 18px",
};

const BADGE: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 11,
  /* Le fond teinté garde l'orange de marque ; le chiffre dessus passe de
     2,22:1 (`--acc`) à 7,75:1 (`--acc-ink`). */
  background: "var(--acc-w)",
  color: "var(--acc-ink)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "600 12px ui-monospace,Menlo,monospace",
};

const INTITULE: CSSProperties = {
  display: "block",
  font: "600 15.5px/1.3 var(--ft)",
  letterSpacing: "-.02em",
  color: "var(--ink)",
};

const RESUME_TEXTE: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  font: "400 13px/1.5 var(--fb)",
  color: "var(--ink3)",
  marginTop: 2,
};

const PLUS: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "var(--chip)",
  color: "var(--ink1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  font: "400 18px/1 var(--fb)",
  transition: "transform var(--tr),background var(--tr)",
};

const CORPS: CSSProperties = {
  padding: "16px 18px 4px",
  borderTop: "1px solid var(--line)",
  maxHeight: 420,
  overflowY: "auto",
  scrollbarWidth: "thin",
};

const TITRE_BLOC: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  margin: 0,
};

/** Les paragraphes sans puce d'un bloc (`prose`). Relevé de la maquette qui
    tourne (08/10, /travaux-industriels/) : 15,5px/1.7, 66ch. */
const PROSE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "66ch",
  textWrap: "pretty",
};

const FILET: CSSProperties = {
  width: 16,
  height: 3,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "0 0 auto",
  transform: "translateY(-4px)",
};

const PUCE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const COCHE: CSSProperties = {
  /* La coche PORTE du sens (« inclus »), ce n'est pas un filet décoratif :
     2,45:1 en `--acc`, 8,57:1 en `--acc-ink` sur le verre du pli. */
  color: "var(--acc-ink)",
  flex: "0 0 auto",
  fontWeight: 600,
};

const CADRE_TABLEAU: CSSProperties = {
  overflowX: "auto",
  borderRadius: "var(--rad-s)",
  border: "1px solid var(--line)",
  background: "var(--card)",
};

const ENTETE_COLONNE: CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  /* En-tête de colonne, sur `--card` blanc : 2,56:1 en `--acc`, 8,94:1 en
     `--acc-ink`. */
  color: "var(--acc-ink)",
  borderBottom: "1px solid var(--line)",
};

const CELLULE: CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "top",
  borderTop: "1px solid var(--line)",
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const RESUME_QUESTION: CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "11px 0",
  font: "600 14px/1.4 var(--ft)",
};

const PLUS_QUESTION: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "var(--chip)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  font: "400 15px/1 var(--fb)",
  transition: "transform var(--tr),background var(--tr)",
};

const REPONSE_QUESTION: CSSProperties = {
  font: "400 13.5px/1.6 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 12px",
};

/** Le corps d'un pli : les blocs de la prestation absorbée, puis sa FAQ. */
function CorpsPrestation({ prestation }: { prestation: PrestationRegroupee }) {
  // README : une seule question ouverte à la fois, un groupe par prestation.
  // Les cartes de prestation elles-mêmes restent indépendantes.
  const groupe = useId();
  return (
    <div style={CORPS}>
      {(prestation.blocs ?? []).map((bloc, rangBloc) => (
        <div
          key={bloc.titre ?? `bloc-${rangBloc}`}
          style={{ minWidth: 0, paddingBottom: 18 }}
        >
          {/* Titre OPTIONNEL depuis le 07/10 : la capture de
              `/travaux-industriels/` intercale des paragraphes sans titre
              entre deux blocs titrés. */}
          {bloc.titre ? (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "baseline",
                marginBottom: 10,
              }}
            >
              <span aria-hidden="true" style={FILET} />
              <h3 style={TITRE_BLOC}>{bloc.titre}</h3>
            </div>
          ) : null}

          {bloc.prose?.length ? (
            <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
              {bloc.prose.map((paragraphe) => (
                <p key={paragraphe} style={PROSE}>
                  {paragraphe}
                </p>
              ))}
            </div>
          ) : null}

          {bloc.puces?.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {bloc.puces.map((puce) => (
                <div key={puce.accroche ?? puce.texte} style={PUCE}>
                  <span aria-hidden="true" style={COCHE}>
                    ✓
                  </span>
                  <span>
                    {puce.accroche ? (
                      <strong style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {puce.accroche}
                      </strong>
                    ) : null}
                    {puce.accroche ? " " : null}
                    <span>{puce.texte}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {bloc.tableau ? (
            <div style={CADRE_TABLEAU}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 480,
                }}
              >
                <thead>
                  <tr>
                    {bloc.tableau.entetes.map((entete) => (
                      <th key={entete} scope="col" style={ENTETE_COLONNE}>
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloc.tableau.lignes.map(([prestationFaite, benefice]) => (
                    <tr key={prestationFaite}>
                      <td style={CELLULE}>{prestationFaite}</td>
                      <td style={CELLULE}>{benefice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ))}

      {prestation.questions?.length ? (
        <div style={{ padding: "6px 0 14px" }}>
          <div
            style={{
              ...SURTITRE,
              font: "600 10.5px var(--fb)",
              letterSpacing: ".12em",
              marginBottom: 8,
            }}
          >
            Questions fréquentes
          </div>
          {prestation.questions.map((question) => (
            <details
              key={question.question}
              className={styles.pliQuestion}
              name={groupe}
              style={{ borderTop: "1px solid var(--line)" }}
            >
              <summary style={RESUME_QUESTION}>
                <span>{question.question}</span>
                <span
                  aria-hidden="true"
                  className={styles.pliPlus}
                  style={PLUS_QUESTION}
                >
                  +
                </span>
              </summary>
              <p style={REPONSE_QUESTION}>{question.reponse}</p>
            </details>
          ))}
        </div>
      ) : null}

      {/* Le lien vers la page que cette prestation a SUR LE SITE. Écart assumé
          à la maquette, expliqué dans `PrestationRegroupee.href` : la maquette
          replie le contenu entier de la page qu'elle redirige, le site sert
          cette page à son URL et le pli y renvoie plutôt que de la recopier.
          Sans `href`, rien n'est rendu de plus. Ajouté le 07/10 pour
          `/offres/bureau-etudes/`. */}
      {prestation.href && cibleSure(prestation.href) ? (
        <p style={{ padding: "2px 0 16px" }}>
          <Link href={prestation.href} prefetch={false} style={LIEN_PRESTATION}>
            {prestation.hrefLibelle ?? prestation.titre} →
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function PrestationsRegroupees({
  donnees,
}: ProprietesPrestationsRegroupees) {
  const prestations = donnees.prestations ?? [];
  if (prestations.length === 0) return null;

  const lien =
    donnees.lien && cibleSure(donnees.lien.href) ? donnees.lien : undefined;

  return (
    <section style={{ padding: "64px 0 0" }}>
      <div style={LARGEUR}>
        <div style={ENTETE}>
          <div>
            <div style={{ ...SURTITRE, marginBottom: 10 }}>
              Également dans cette offre
            </div>
            <h2 style={TITRE}>Les prestations regroupées ici</h2>
          </div>
          {lien ? (
            <a href={lien.href} style={LIEN}>
              {lien.libelle} →
            </a>
          ) : null}
        </div>

        <div style={GRILLE}>
          {prestations.map((prestation, rang) => (
            <details
              key={prestation.titre}
              className={styles.pliQuestion}
              style={PLI}
            >
              <summary style={RESUME}>
                <span style={BADGE}>{numerote(rang)}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={INTITULE}>{prestation.titre}</span>
                  <span style={RESUME_TEXTE}>{prestation.resume}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={styles.pliPlus}
                  style={PLUS}
                >
                  +
                </span>
              </summary>
              <CorpsPrestation prestation={prestation} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
