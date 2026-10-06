import {
  CHAPEAU,
  colonnes,
  ENTETE,
  LARGEUR,
  LUEUR,
  SECTION,
  TITRE2,
} from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { ContenuOffre } from "@/types/offre";

import { lienSur } from "./LiensOffre";
import {
  BANDE_REGLE,
  BANDE_REGLE_SURTITRE,
  BANDE_REGLE_TEXTE,
  COMPARATIF_COLONNE,
  COMPARATIF_COLONNE_PHARE,
  COMPARATIF_PUCE,
  COMPARATIF_TITRE,
  JALON_CARTE,
  JALON_REPERE,
  JALON_TEXTE,
  PREMIER_MOIS_APPEL,
  PREMIER_MOIS_APPEL_BOUTON,
  PREMIER_MOIS_APPEL_TEXTE,
  PREMIER_MOIS_APPEL_TITRE,
  PREMIER_MOIS_CARTE,
  PREMIER_MOIS_NUMERO,
  PREMIER_MOIS_TEXTE,
  SURTITRE_OFFRE,
} from "./habillage-offre";

import CarteFormule from "./CarteFormule";
import TableauFormules from "./TableauFormules";

import styles from "./PageOffre.module.css";

/**
 * Les QUATRE sections que la maquette réserve à l'offre Zéro Arrêt
 * (`sc-if value="{{ of.isZero }}"`, l. 4096 à 4210 de `site-final.html`).
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * ELLES SONT PORTÉES, TEXTE COMPRIS, DEPUIS LA DÉCISION DE MEHDI DU 05/10.
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Elles avaient été laissées sans donnée, donc non rendues, parce que la
 * maquette y écrit ce que le contrat du projet (CLAUDE.md, section 9) refuse :
 *
 *   · « Comment ça marche » (l. 4773) : « Une panne signalée avant 16 h »,
 *     « Intervention la nuit suivante », « 14 h 30 », « 16 h 00 », « 22 h 00 »,
 *     et « il relève de la régie classique ». Ce sont des DÉLAIS CHIFFRÉS
 *     d'intervention, et « régie » est un mot proscrit.
 *   · « Les formules · engagement 12 mois » (l. 4789) : « Prix mensuel fixe »,
 *     « Recevoir le tarif », trois formules tarifaires, « Mise en service
 *     offerte » contre « Facturée ». AUCUN PRIX nulle part. Et pas de
 *     contournement en « à partir de » : c'est le même prix, habillé.
 *   · « Le comparatif » (l. 4836) : « Délai garanti par contrat » et « Six
 *     semaines d'absence par an ». Un délai contractuel chiffré, et un chiffre
 *     RH que rien dans le corpus ne confirme.
 *   · « Le premier mois » (l. 4867) : « une réponse écrite sous 48 h ». Seul
 *     « rappel dans l'heure » est autorisé.
 *
 * LA RÈGLE DU 05/10 FAIT PRIMER LA MAQUETTE : « tu respectes AU MOT POUR MOT la
 * maquette ». Ces formulations sont donc portées telles quelles, et inscrites
 * dans `docs/RESERVES-CONTENU.md` pour arbitrage avant que migen.fr pointe sur
 * le déploiement. Le site n'est pas public : robots fermés, déploiement derrière
 * le SSO Vercel.
 *
 * Chaque composant renvoie toujours `null` sans donnée : la maquette ne dessine
 * ces quatre sections QUE sur `/offres/zero-arret/`, et `produit_gabarit_offre`
 * n'écrit leur texte que là. Leur absence ailleurs est le dessin, pas un trou.
 */

/* ------------------------------------------------- 1. « Comment ça marche » */

export function CommentCaMarche({ contenu }: { contenu: ContenuOffre }) {
  const jalons = contenu.commentCaMarcheJalons ?? [];
  if (jalons.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{ ...ENTETE, gap: 52, marginBottom: 28 }}
          >
            <div>
              {contenu.commentCaMarcheSurtitre ? (
                <div style={SURTITRE_OFFRE}>
                  {contenu.commentCaMarcheSurtitre}
                </div>
              ) : null}
              {contenu.commentCaMarcheTitre ? (
                <h2 style={TITRE2}>{contenu.commentCaMarcheTitre}</h2>
              ) : null}
            </div>
            {contenu.commentCaMarcheChapeau ? (
              <p
                style={{
                  ...CHAPEAU,
                  font: "400 15.5px/1.7 var(--fb)",
                  maxWidth: "44ch",
                }}
              >
                <TexteRiche texte={contenu.commentCaMarcheChapeau} />
              </p>
            ) : null}
          </div>

          <div
            className="mg-rmulti"
            style={colonnes(Math.min(jalons.length, 3))}
          >
            {jalons.map((jalon) => (
              <div key={`${jalon.repere}-${jalon.texte}`} style={JALON_CARTE}>
                <div style={JALON_REPERE}>{jalon.repere}</div>
                <div style={JALON_TEXTE}>
                  <TexteRiche texte={jalon.texte} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 2. « Les formules » */

export function Formules({ contenu }: { contenu: ContenuOffre }) {
  const formules = contenu.formules ?? [];
  const regle = contenu.formulesRegle;
  if (formules.length === 0 && !regle) return null;

  const rangRecommandee = formules.findIndex((f) => f.recommandee === true);

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          {contenu.formulesSurtitre || contenu.formulesTitre ? (
            <div className="mg-r2" style={ENTETE}>
              <div>
                {contenu.formulesSurtitre ? (
                  <div style={SURTITRE_OFFRE}>{contenu.formulesSurtitre}</div>
                ) : null}
                {contenu.formulesTitre ? (
                  <h2 style={TITRE2}>{contenu.formulesTitre}</h2>
                ) : null}
              </div>
              {contenu.formulesChapeau ? (
                <p style={CHAPEAU}>
                  <TexteRiche texte={contenu.formulesChapeau} />
                </p>
              ) : null}
            </div>
          ) : null}

          {formules.length > 0 ? (
            <div
              className="mg-rmulti"
              style={{
                ...colonnes(Math.min(formules.length, 3)),
                gap: 14,
                alignItems: "stretch",
              }}
            >
              {formules.map((formule) => (
                <CarteFormule key={formule.nom} formule={formule} />
              ))}
            </div>
          ) : null}

          {/*
            Le tableau ligne par ligne de la maquette (l. 4147). Il était la
            SEULE donnée de la page à n'avoir aucun lecteur : `formulesTableau`
            était écrit dans le JSON, déclaré dans `types/offre.ts`, et le mot
            n'apparaissait nulle part ailleurs dans le dépôt.
          */}
          {contenu.formulesTableau ? (
            <TableauFormules
              tableau={contenu.formulesTableau}
              // La colonne mise en avant est celle de la formule recommandée.
              // `+ 1` parce que la première colonne du tableau porte les
              // libellés de ligne, pas une formule.
              colonnePhare={
                rangRecommandee >= 0 ? rangRecommandee + 1 : undefined
              }
            />
          ) : null}

          {regle ? (
            <div style={BANDE_REGLE}>
              {contenu.formulesRegleSurtitre ? (
                <span style={BANDE_REGLE_SURTITRE}>
                  {contenu.formulesRegleSurtitre}
                </span>
              ) : null}
              <span style={BANDE_REGLE_TEXTE}>
                <TexteRiche texte={regle} />
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 3. « Le comparatif » */

export function Comparatif({ contenu }: { contenu: ContenuOffre }) {
  const colonnesComparatif = contenu.comparatif;
  if (!colonnesComparatif) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {colonnesComparatif.map((colonne, rang) => {
            const phare = rang === 1;
            return (
              <div
                key={colonne.titre}
                style={phare ? COMPARATIF_COLONNE_PHARE : COMPARATIF_COLONNE}
              >
                {phare ? <div style={LUEUR} /> : null}
                <div style={{ position: "relative" }}>
                  <div style={SURTITRE_OFFRE}>{colonne.surtitre}</div>
                  <div
                    style={
                      phare
                        ? { ...COMPARATIF_TITRE, color: "#fff" }
                        : COMPARATIF_TITRE
                    }
                  >
                    {colonne.titre}
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {colonne.points.map((point) => (
                      <div
                        key={point}
                        style={{
                          ...COMPARATIF_PUCE,
                          color: phare
                            ? "rgba(255,255,255,.78)"
                            : "var(--ink2)",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            color: phare ? "var(--acc)" : "var(--ink4)",
                            flex: "none",
                          }}
                        >
                          {phare ? "✓" : "×"}
                        </span>
                        <span>
                          <TexteRiche texte={point} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 4. « Le premier mois » */

export function PremierMois({ contenu }: { contenu: ContenuOffre }) {
  const etapes = contenu.premierMoisEtapes ?? [];
  const appel = contenu.premierMoisAppelTitre || contenu.premierMoisAppelTexte;
  if (etapes.length === 0 && !appel) return null;

  const bouton = lienSur(contenu.premierMoisAppelBouton);

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          {contenu.premierMoisSurtitre ? (
            <div style={SURTITRE_OFFRE}>{contenu.premierMoisSurtitre}</div>
          ) : null}
          {contenu.premierMoisTitre ? (
            <h2 style={TITRE2}>{contenu.premierMoisTitre}</h2>
          ) : null}

          {etapes.length > 0 ? (
            <div
              className="mg-rmulti"
              style={{
                ...colonnes(Math.min(etapes.length, 3)),
                marginTop: 28,
              }}
            >
              {etapes.map((etape, rang) => (
                <div key={etape} style={PREMIER_MOIS_CARTE}>
                  <div style={PREMIER_MOIS_NUMERO}>
                    {String(rang + 1).padStart(2, "0")}
                  </div>
                  <div style={PREMIER_MOIS_TEXTE}>
                    <TexteRiche texte={etape} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {appel ? (
            <div style={PREMIER_MOIS_APPEL}>
              <div style={{ flex: 1, minWidth: 280 }}>
                {contenu.premierMoisAppelSurtitre ? (
                  <div
                    style={{ ...SURTITRE_OFFRE, fontSize: 11, marginBottom: 10 }}
                  >
                    {contenu.premierMoisAppelSurtitre}
                  </div>
                ) : null}
                {contenu.premierMoisAppelTitre ? (
                  <div style={PREMIER_MOIS_APPEL_TITRE}>
                    {contenu.premierMoisAppelTitre}
                  </div>
                ) : null}
                {contenu.premierMoisAppelTexte ? (
                  <p style={PREMIER_MOIS_APPEL_TEXTE}>
                    <TexteRiche texte={contenu.premierMoisAppelTexte} />
                  </p>
                ) : null}
              </div>
              {bouton ? (
                <a
                  href={bouton.href}
                  className={styles.boutonPrincipal}
                  style={PREMIER_MOIS_APPEL_BOUTON}
                >
                  {bouton.libelle}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
