import Link from "next/link";
import type { CSSProperties } from "react";

import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { resumeDe } from "@/components/site/blocs/resume-de-section";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import { varianteDe } from "@/components/site/mobile/conversion-donnees";
import type { BlocRayon, VueRubrique } from "@/types/editorial";

import styles from "./PageEditoriale.module.css";
import RayonsRubrique from "./RayonsRubrique";

/**
 * La vue « RUBRIQUE » : `MigenRessource.dc.html` en mode hub, les cinq
 * sous-rubriques de `/ressources/`. Références : `maquette/rendu/
 * ressources--<rayon>.html`. Sections, dans l'ordre de la capture : héros,
 * rayons, guide, questions fréquentes (sur photo), appel.
 *
 * La page n'a ni fil d'Ariane du cocon, ni formulaire de bas de page, ni
 * maillage : la capture n'en montre aucun, l'appel final mène à `/contact/`.
 *
 * LA COUCHE MOBILE V2 (14/10). La mesure des onze gabarits à 390 px a rendu
 * ce gabarit 2,3 à 3,1 fois plus haut que la maquette mobile : AUCUN repli,
 * là où la maquette replie TOUTES les sections de contenu du gabarit 11
 * (`nOpen = (g === "11" …) ? 0 : …` dans son dc.html) et sert le maillage en
 * pastilles. D'où, SOUS 881 PX SEULEMENT :
 *   · chaque carte du guide se replie (`SectionPliableMobile`, zéro ouverte) ;
 *   · le catalogue et la FAQ, sections de bureau, se replient aussi (G3) ;
 *   · les pastilles du cocon : « Tous les contenus » (boîte haute, sous le
 *     héros) et « Dans la même rubrique » (boîte basse) ;
 *   · le rappel final `#etre-rappele` de la maquette, sans cadence : le
 *     dc.html n'en pose aucune sur le gabarit 11 (`pushCtas`, L453).
 * Ces apports ne se rendent que si la route passe `chemin`. Au-dessus de
 * 881 px, RIEN ne change : la capture reste la référence,
 * `verification-editorial.tsx` la mesure.
 */

const TEXTE_GUIDE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 12px",
};
const LIGNE_LISTE: CSSProperties = {
  display: "flex",
  gap: 10,
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

function Bloc({ bloc }: { bloc: BlocRayon }) {
  switch (bloc.type) {
    case "p":
      return (
        <p style={TEXTE_GUIDE}>
          <TexteRiche texte={bloc.texte} />
        </p>
      );
    case "ul":
    case "ol":
      return (
        <div className={styles.liste} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8, margin: "4px 0 12px" }}>
          {bloc.items.map((item, i) => (
            <div key={`${i}-${item.slice(0, 16)}`} style={LIGNE_LISTE}>
              <span
                aria-hidden={bloc.type === "ul" ? true : undefined}
                style={
                  bloc.type === "ul"
                    ? { color: "var(--acc)", flex: "none" }
                    : {
                        font: "600 11px ui-monospace,Menlo,monospace",
                        color: "var(--acc)",
                        flex: "none",
                        paddingTop: 3,
                      }
                }
              >
                {bloc.type === "ul" ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <TexteRiche texte={item} />
              </span>
            </div>
          ))}
        </div>
      );
    case "tableau":
      /* SOUS 881 PX, UNE CARTE PAR LIGNE, motif « tableau » du LISEZMOI de
         la maquette mobile v2, copié de `blocs/Offre.tsx` et adapté au vrai
         `<table>` : règles dans `PageEditoriale.module.css`, toutes sous
         `@media (max-width: 880px)`. Rien ne quitte le DOM. */
      return (
        <div
          className={styles.tableauEnCartes}
          data-tableau-en-cartes=""
          style={{ overflowX: "auto", margin: "6px 0 12px" }}
          tabIndex={0}
          role="region"
          aria-label="Tableau, défilement horizontal possible"
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {bloc.lignes.map((ligne, r) => (
                <tr key={`l${r}`}>
                  {ligne.map((cellule, i) => (
                    <td
                      key={`c${i}`}
                      style={{
                        padding: "9px 8px",
                        borderTop: "1px solid var(--line)",
                        font: "400 13.5px/1.5 var(--fb)",
                        color: "var(--ink1)",
                        verticalAlign: "top",
                      }}
                    >
                      {cellule}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "citation":
      return (
        <div
          style={{
            margin: "6px 0 12px",
            padding: "14px 16px",
            borderRadius: 14,
            background: "var(--acc-w)",
            font: "500 14px/1.6 var(--fb)",
            color: "var(--ink)",
          }}
        >
          <TexteRiche texte={bloc.texte} />
        </div>
      );
  }
}

const BOUTON_FIN: CSSProperties = {
  padding: "16px 30px",
  borderRadius: 999,
  color: "#fff",
  font: "600 16px var(--fb)",
};

/* L'ÉTIQUETTE DE LA BASCULE D'UNE CARTE DU GUIDE, motif du gabarit guide
   (`Guide.tsx`, `ETIQUETTE_SURTITRE` / `ETIQUETTE_TITRE`) : elle n'existe que
   sous 880 px (`.etiquettePli`), le vrai `<h2>` de la carte reste dans le
   corps, à sa place et à sa taille de capture. Le titre reprend l'échelle du
   titre d'une section repliée de la maquette mobile v2 (dc.html, `<summary>`
   des `isDetails` : `600 16.5px/1.3`, `-.025em`) : l'étiquette n'existe que
   là, le `<h2>` de bureau garde ses 22 px. */
const ETIQUETTE_NUMERO_CARTE: CSSProperties = {
  display: "block",
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "var(--acc)",
  marginBottom: 6,
};

const ETIQUETTE_TITRE_CARTE: CSSProperties = {
  display: "block",
  font: "600 16.5px/1.3 var(--ft)",
  letterSpacing: "-.025em",
  color: "var(--ink)",
};

/* Le sur-titre et le titre de la FAQ, textes de la capture : rendus dans la
   section ET repris par l'étiquette de son repli, une seule source. */
const SURTITRE_FAQ = "Questions fréquentes";
const TITRE_FAQ = "Vos questions, nos réponses";

const ETIQUETTE_SURTITRE_FAQ: CSSProperties = {
  display: "block",
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--acc)",
  marginBottom: 6,
};

/**
 * LE RÉSUMÉ D'UNE CARTE REPLIÉE, règle `teaseOf` de la maquette mobile : le
 * premier bloc de prose ou de liste, dans l'ordre du document. Rien n'est
 * rédigé : le résumé est toujours du texte déjà présent dans la carte, et
 * `SectionPliableMobile` le réduit en texte nu avant de le peindre.
 */
function resumeDeCarte(blocs: BlocRayon[]): string | undefined {
  for (const bloc of blocs) {
    if (bloc.type === "p") return resumeDe([bloc.texte]);
    if (bloc.type === "ul" || bloc.type === "ol") return resumeDe(bloc.items);
  }
  return undefined;
}

export default function Rubrique({
  titre,
  vue,
  chemin,
}: {
  titre: string;
  vue: VueRubrique;
  /** Le chemin de la page, passé par la route : il porte les apports mobiles. */
  chemin?: string;
}) {
  const numero = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div className="mg-site">
      {/* `corpsRubrique` est la PORTÉE des règles de ce gabarit
          (`PageEditoriale.module.css`) : au-dessus de 880 px, ses bascules
          n'existent pas du tout ; en dessous, ses replis se dessinent en
          cartes et son héros se compacte. */}
      <main className={styles.corpsRubrique} style={{ paddingTop: 62 }}>
        <RayonsRubrique
          titre={titre}
          vue={vue}
          apresHeros={
            /* La boîte HAUTE du maillage mobile, « Tous les contenus »
               (dc.html, `kidsTop` du gabarit 11), SOUS LE HÉROS ET AVANT LE
               CATALOGUE replié, comme la maquette la pose : rendue ici, côté
               serveur, et passée toute faite au composant client. */
            chemin ? (
              <div className={styles.pastilles}>
                <PastillesCocon chemin={chemin} variante="enfants" />
              </div>
            ) : null
          }
        />

        {vue.guide.length > 0 ? (
          <section
            data-screen-label="Ressources · guide"
            className={styles.sectionRubrique}
            style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 0" }}
          >
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}
            >
              {/* CHAQUE CARTE SE REPLIE AU TÉLÉPHONE, ET AUCUNE NE RESTE
                  OUVERTE : règle du gabarit 11 dans la maquette mobile v2,
                  `nOpen = (g === "11" …) ? 0 : …`. Mesure du 14/10 : zéro
                  repli servi, hauteur x2,3 à x3,1 contre la maquette. Le
                  `<h2>` et le numéro de la carte RESTENT dans son corps, à
                  leur taille de capture ; la bascule ne porte qu'une
                  étiquette de téléphone (motif de `Guide.tsx`, vérifié par
                  `controleEtiquettes`). Sur bureau, rien ne change : la
                  bascule n'existe pas (`.corpsRubrique`, module CSS). */}
              {vue.guide.map((carte, i) => (
                <div
                  key={carte.titre}
                  className={styles.carteGuide}
                  style={{
                    borderRadius: "var(--rad)",
                    background: "#fff",
                    border: "1px solid var(--line)",
                    padding: "28px 28px 24px",
                  }}
                >
                  <SectionPliableMobile
                    enTete={
                      <span data-mobile-seulement="" className={styles.etiquettePli}>
                        <span style={ETIQUETTE_NUMERO_CARTE}>{numero(i)}</span>
                        <span style={ETIQUETTE_TITRE_CARTE}>{carte.titre}</span>
                      </span>
                    }
                    resume={resumeDeCarte(carte.blocs)}
                  >
                    <div
                      style={{
                        font: "600 11px ui-monospace,Menlo,monospace",
                        color: "var(--acc)",
                        marginBottom: 12,
                      }}
                    >
                      {numero(i)}
                    </div>
                    <h2 style={{ font: "600 22px/1.25 var(--ft)", letterSpacing: "-.03em", margin: "0 0 14px" }}>
                      {carte.titre}
                    </h2>
                    {carte.blocs.map((bloc, k) => (
                      <Bloc key={`${bloc.type}-${k}`} bloc={bloc} />
                    ))}
                  </SectionPliableMobile>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {vue.questions.length > 0 ? (
          <section
            data-screen-label="Questions fréquentes"
            className={styles.sectionRubrique}
            style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 40px 0" }}
          >
            {/* G3 : LA FAQ, SECTION DE BUREAU, SE REPLIE AU TÉLÉPHONE. La
                maquette mobile v2 la sert en section repliée comme les autres
                (gabarit 11, `nOpen = 0`). Rien ne quitte le DOM : la bascule
                ne porte qu'une étiquette de téléphone, le sur-titre, le `<h2>`
                et les questions restent dans le corps ; sur bureau la bascule
                n'existe pas (`.corpsRubrique`). */}
            <SectionPliableMobile
              enTete={
                /* Sur-titre puis titre de la section, comme sa capture :
                   l'étiquette finit par le texte du `<h2>`, règle de
                   `controleEtiquettes` pour chaque bloc repliable. */
                <span data-mobile-seulement="" className={styles.etiquettePli}>
                  <span style={ETIQUETTE_SURTITRE_FAQ}>{SURTITRE_FAQ}</span>
                  <span style={ETIQUETTE_TITRE_CARTE}>{TITRE_FAQ}</span>
                </span>
              }
              resume={resumeDe(vue.questions.map((f) => f.question))}
            >
            <div className={styles.faqPhoto} style={{ maxWidth: "none", margin: "0 auto" }}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 14,
                }}
              >
                {SURTITRE_FAQ}
              </div>
              <h2
                style={{
                  font: "600 clamp(26px,2.8vw,38px)/1.1 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: "0 0 24px",
                }}
              >
                {TITRE_FAQ}
              </h2>
              <div
                style={{
                  borderRadius: "var(--rad)",
                  overflow: "hidden",
                  background: "rgba(255,255,255,.1)",
                  backdropFilter: "blur(22px) saturate(150%)",
                  WebkitBackdropFilter: "blur(22px) saturate(150%)",
                  border: "1px solid rgba(255,255,255,.18)",
                }}
              >
                {vue.questions.map((f, i) => (
                  <details
                    key={f.question}
                    name="faq-rubrique"
                    /* LA PREMIÈRE QUESTION EST OUVERTE, comme la capture des
                       six rayons l'écrit : `open` sur le premier `<details>`
                       et sur lui seul. Sans lui, la section rendait 624 px là
                       où la capture en déclare 695 sur
                       /ressources/fiches-pratiques/ (mesuré le 12/10), et sa
                       première réponse restait invisible. Le groupe `name`
                       garde l'exclusivité. */
                    open={i === 0}
                    style={{ borderTop: i ? "1px solid var(--line)" : "none" }}
                  >
                    <summary
                      style={{
                        listStyle: "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        padding: "20px 24px",
                        font: "600 16px/1.4 var(--ft)",
                        letterSpacing: "-.015em",
                      }}
                    >
                      {f.question}
                      <span
                        aria-hidden="true"
                        className={styles.plus}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          background: "rgba(28,27,25,.055)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "none",
                          font: "400 18px/1 var(--fb)",
                          transition: "transform .2s,background .2s",
                        }}
                      >
                        +
                      </span>
                    </summary>
                    <p
                      style={{
                        font: "400 15px/1.7 var(--fb)",
                        color: "var(--ink2)",
                        margin: 0,
                        padding: "0 24px 20px",
                        maxWidth: "72ch",
                      }}
                    >
                      {f.reponse}
                    </p>
                  </details>
                ))}
              </div>
            </div>
            </SectionPliableMobile>
          </section>
        ) : null}

        {/* La boîte BASSE du maillage mobile, « Dans la même rubrique » :
            le dc.html la pousse quand la boîte basse est encore vide
            (`if (!kidsBottom.has) { sib … }`), et le gabarit 11 met ses
            enfants en boîte HAUTE, donc ses sœurs ferment la page. Puis le
            rappel final `#etre-rappele`, que la maquette pose sous elle
            (`showEndCta`, L576) ; aucune cadence avant lui sur ce gabarit.
            L'appel de bureau `#mr-cta` reste en dessous, tel quel. */}
        {chemin ? (
          <>
            <div className={styles.pastilles}>
              <PastillesCocon chemin={chemin} variante="soeurs" />
            </div>
            <div className={styles.rappel}>
              <RappelFinalMobile variante={varianteDe(chemin, "11")} />
            </div>
          </>
        ) : null}

        <section
          id="mr-cta"
          data-screen-label="Ressources · appel"
          className={styles.sectionAppel}
          style={{ padding: "96px 24px 120px" }}
        >
          <div
            className={`${styles.grille2} ${styles.appelCompact}`}
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              borderRadius: 40,
              background: "var(--panel)",
              padding: 56,
              position: "relative",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 560,
                height: 560,
                left: -200,
                top: -280,
                background: "radial-gradient(circle,rgba(255,124,60,.28),transparent 66%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 16,
                }}
              >
                Passer de la lecture à l’action
              </div>
              <div
                style={{
                  font: "600 clamp(26px,3vw,40px)/1.1 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "#fff",
                  marginBottom: 14,
                  maxWidth: "22ch",
                }}
              >
                Un technicien qualifié sur votre site, au bon moment.
              </div>
              <div style={{ font: "400 15.5px/1.6 var(--fb)", color: "rgba(255,255,255,.64)", maxWidth: "48ch" }}>
                Décrivez votre besoin : un chargé d’affaires vous rappelle dans l’heure, du lundi au vendredi de
                8h00 à 18h30.
              </div>
            </div>
            <div style={{ position: "relative", display: "grid", gap: 10, justifyItems: "start" }}>
              <Link href="/contact/" prefetch={false} style={{ ...BOUTON_FIN, background: "var(--acc)" }}>
                Décrire mon besoin
              </Link>
              <a
                href="tel:+33478337205"
                style={{
                  ...BOUTON_FIN,
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.2)",
                }}
              >
                04 78 33 72 05
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
