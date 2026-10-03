import Link from "next/link";

import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche, {
  estCheminInterne,
} from "@/components/site/blocs/TexteRiche";
import {
  LARGEUR,
  PANNEAU,
  SECTION,
  VERRE,
  colonnes,
} from "@/components/site/blocs/habillage";
import type { CarteOffre, EnTeteOffres } from "@/types/offres";

import styles from "./PageOffres.module.css";
import {
  BOUTON_CARTE,
  BOUTON_CARTE_ACCENT,
  LUEUR_CARTE,
  NUMERO_OFFRE,
  SURTITRE_OFFRES,
  TITRE2_OFFRES,
  numero,
} from "./habillage";

/**
 * Les offres, en cartes numérotées. Maquette lignes 1990 à 2050.
 *
 * Trois colonnes qui se replient par `.mg-rmulti`, cartes de verre, et la
 * deuxième en panneau anthracite avec sa lueur orange : la maquette réserve ce
 * traitement à une seule carte, et le contenu le porte par `accent`.
 *
 * LE COMPTE. La maquette se contredit quatre fois sur cette page : « Six façons
 * de nous confier votre industrie » en H1, « Sept offres, ça fait un
 * catalogue » dans sa note, « Les cinq offres » en surtitre ici, « Aucune des
 * six ne colle ? » en fin de page, pour cinq cartes réellement dessinées. La
 * base, elle, porte dix pages publiées sous `/offres/`, et le corpus de ce hub
 * en écrit huit entrées qui les couvrent toutes. Aucun de ces comptes n'est
 * donc recopié : le surtitre ne compte plus, et ce sont les cartes du corpus
 * qui disent combien il y en a.
 *
 * CE QUE LA MAQUETTE ÉCRIT EN DUR ET QUI NE PART PAS. Le chiffre d'appui en
 * pied de carte (« 6 mois de durée minimale », « J−90 de rétroplanning »,
 * « 2 ingénieurs intégrés », « Samedi & nuit »), la pastille « Abonnement », et
 * « prix mensuel fixe » dans le texte de la deuxième carte. Le corpus de cette
 * page ne fournit aucun de ces appuis, et un prix est interdit par le contrat
 * de rédaction. La ligne de pied n'est donc pas rendue, et `marginTop: "auto"`
 * passe au bouton : les cartes gardent leurs boutons alignés en bas, ce que la
 * maquette obtenait par cette ligne.
 */
export default function Offres({
  offres,
}: {
  offres: { entete: EnTeteOffres; cartes: CarteOffre[]; lienLibelle?: string };
}) {
  const { entete, cartes, lienLibelle } = offres;
  if (cartes.length === 0) return null;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <div style={SURTITRE_OFFRES}>{entete.surtitre}</div>
          <h2 style={{ ...TITRE2_OFFRES, maxWidth: "24ch", marginBottom: 30 }}>
            <TexteRiche texte={entete.titre} />
          </h2>

          <div className="mg-rmulti" style={colonnes(3)}>
            {cartes.map((carte, i) => {
              const clair = carte.accent === true;
              /* Une cible qui n'est pas un chemin interne ne devient pas un
                 bouton : la carte se rend sans lui plutôt que de mener à `#`.
                 Même règle que `TexteRiche` sur le maillage du corpus. */
              const cible =
                carte.href && estCheminInterne(carte.href) ? carte.href : null;

              const corps = (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={NUMERO_OFFRE}>{numero(i)}</span>
                  </div>

                  <div
                    style={{
                      font: "600 calc(21px * var(--ts)) var(--ft)",
                      letterSpacing: "-.035em",
                      color: clair ? "#fff" : "var(--ink)",
                      marginBottom: 9,
                    }}
                  >
                    {carte.titre}
                  </div>

                  {[carte.texte, carte.benefice]
                    .filter((t): t is string => !!t)
                    .map((texte) => (
                      <p
                        key={texte}
                        className={clair ? blocs.corpusClair : blocs.corpus}
                        style={{
                          font: "400 14.5px/1.6 var(--fb)",
                          color: clair ? "rgba(255,255,255,.62)" : "var(--ink2)",
                          margin: "0 0 18px",
                        }}
                      >
                        <TexteRiche texte={texte} />
                      </p>
                    ))}

                  {cible ? (
                    <Link
                      href={cible}
                      prefetch={false}
                      className={styles.boutonCarte}
                      style={{
                        ...(clair ? BOUTON_CARTE_ACCENT : BOUTON_CARTE),
                        marginTop: "auto",
                      }}
                    >
                      {lienLibelle ?? "Voir l'offre"}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </>
              );

              return clair ? (
                <div
                  key={carte.titre}
                  style={{
                    ...PANNEAU,
                    display: "flex",
                    flexDirection: "column",
                    padding: "28px 28px 30px",
                  }}
                >
                  <div aria-hidden="true" style={LUEUR_CARTE} />
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {corps}
                  </div>
                </div>
              ) : (
                <div
                  key={carte.titre}
                  style={{
                    ...VERRE,
                    display: "flex",
                    flexDirection: "column",
                    padding: "28px 28px 30px",
                  }}
                >
                  {corps}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
