import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import { IconeFleche } from "@/components/site/mobile/BarreCollanteMobile";
import type { LienOffre } from "@/types/offre";

import { cibleSure } from "./LiensOffre";
import type { FinGaranties } from "./maquette-mobile-offre";
import styles from "./PageOffre.module.css";

/**
 * Section « 07 Appel » de la capture (`maquette/rendu/offres--residence.html`) :
 * la bande-question autonome entre les garanties et les références. La question
 * vient du corpus (`brefBande` du relais), la sous-ligne « Rappel dans
 * l'heure. » est le texte fixe du gabarit, le bouton vise le panneau du héros.
 *
 * LA SOUS-LIGNE EST DEVENUE UNE DONNÉE LE 07/10, et elle garde sa valeur d'avant
 * quand la page n'en fournit pas : les SOUS-pages du gabarit 03 y écrivent autre
 * chose. Relevé sur `maquette/rendu/offres--retrofit--remise-en-etat.html`
 * (bloc 706) : « Faire expertiser ma machine Un chargé d'affaires vous rappelle
 * dans l'heure et organise l'état des lieux. » La maquette y recolle elle-même
 * le libellé du bouton devant sa mention ; c'est son rendu, et la référence fait
 * foi (décision de Mehdi du 05/10, un synonyme est une faute).
 *
 * MODIFICATION D'UN COMPOSANT PARTAGÉ PAR LES 22 PAGES : la prop est optionnelle
 * et son défaut est le texte d'avant, donc les pages qui ne la passent pas
 * rendent exactement ce qu'elles rendaient.
 */

export interface ProprietesAppelOffre {
  question: string;
  bouton?: LienOffre;
  /** La sous-ligne. Absente, c'est « Rappel dans l'heure. » de la page pilote. */
  mention?: string;
}

const BANDE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 26,
  flexWrap: "wrap",
  padding: "34px 34px 34px 42px",
  borderRadius: 36,
  background: "var(--acc-w)",
  border: "1.5px solid rgba(255,124,60,.3)",
};

const QUESTION: CSSProperties = {
  font: "600 calc(clamp(22px,2.4vw,30px) * var(--ts))/1.22 var(--ft)",
  letterSpacing: "-.034em",
  marginBottom: 10,
  maxWidth: "32ch",
  textWrap: "balance",
};

const SOUS_LIGNE: CSSProperties = {
  font: "400 14.5px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "15px 26px",
  borderRadius: 999,
  background: "var(--acc)",
  color: "#fff",
  font: "600 15px var(--fb)",
  /* Le `nowrap` cède sous 880 px : voir `.boutonPrincipal` dans
     PageOffre.module.css, le libellé sortait de l'écran sur 118 pages. */
  whiteSpace: "nowrap",
  boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
};

export default function AppelOffre({
  question,
  bouton,
  mention,
}: ProprietesAppelOffre) {
  return (
    /* Absent de la maquette mobile v2 : au téléphone, après ses sections
       (`data-mobile-apres-sections`, socle de `app/globals.css`).
       `data-appel-offre` : la poignée par laquelle les gabarits d'offre le
       masquent au téléphone, où le bandeau « Une question sur votre site ? »
       de la cadence tient sa place (`PageOffre.module.css`). */
    <section data-mobile-apres-sections="" data-appel-offre="" style={SECTION}>
      <div style={LARGEUR}>
        <div data-mm-appel="" style={BANDE}>
          {/* `min(280px, 100%)` ET NON `280px`, et c'est la correction du
              13/10 mesurée au navigateur. Les 280 px viennent de la capture :
              ils empêchent la question de se réduire à une colonne de deux
              mots quand le bouton est large, et sur grand écran rien ne
              change. Mais un `min-width` en pixels ne cède JAMAIS : à 320 px
              la bande n'offre que 240 px, et ce bloc en réclamait 280. Il
              sortait de la page de 43 px sur les onze pages mesurées, cinq
              gabarits, et la fin de la question était coupée par le rognage de
              `.mg-site`. Avec `min()`, le plancher reste 280 px tant que la
              place existe et devient la largeur disponible quand elle manque. */}
          <div style={{ flex: "1 1 0%", minWidth: "min(280px, 100%)" }}>
            <div data-mm-appel-question="" style={QUESTION}>
              <TexteRiche texte={question} />
            </div>
            <div data-mm-appel-ligne="" style={SOUS_LIGNE}>{mention ?? "Rappel dans l’heure."}</div>
          </div>
          {bouton?.libelle && bouton.href && cibleSure(bouton.href) ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={bouton.href}
                className={styles.boutonPrincipal}
                style={BOUTON}
              >
                {bouton.libelle}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------- maquette V3 (16/10) */

/* V3 `data-cta`, relevé à 402 px : 50 px de haut, 0 6px 0 20px, 600 14.5px,
   pastille flèche de 38 px à droite. Même dessin que le photo + CTA
   (`mobile/PhotoCtaMobile`). */
const BOUTON_FLECHE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  minHeight: 50,
  margin: "8px 0 14px",
  padding: "0 6px 0 20px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px/1.25 var(--fb)",
  boxShadow: "0 12px 26px -14px rgba(255,124,60,.9)",
  textDecoration: "none",
};

const PASTILLE_FLECHE: CSSProperties = {
  flex: "none",
  width: 38,
  height: 38,
  borderRadius: 999,
  background: "rgba(255,255,255,.2)",
  display: "grid",
  placeItems: "center",
};

/**
 * LE BOUTON ORANGE À PASTILLE FLÈCHE DE LA V3, dans une carte du téléphone
 * (fin des garanties, réponse de la dernière question). L'appelant le pose
 * dans un élément `data-mobile-seulement`.
 */
export function BoutonFleche({ href, libelle }: { href: string; libelle: string }) {
  const contenu = (
    <>
      <span>{libelle}</span>
      <span aria-hidden="true" style={PASTILLE_FLECHE}>
        <IconeFleche />
      </span>
    </>
  );
  return href.startsWith("#") ? (
    <a href={href} style={BOUTON_FLECHE}>
      {contenu}
    </a>
  ) : (
    <Link href={href} prefetch={false} style={BOUTON_FLECHE}>
      {contenu}
    </Link>
  );
}

/**
 * L'APPEL « 07 » DANS LA CARTE « CE QUE NOUS GARANTISSONS », comme la V3 :
 * la question (`brefBande`), puis l'appel du corpus (`FinGaranties`). Au
 * téléphone seulement : l'appel « 07 » de bureau y est masqué
 * (`[data-appel-offre]`), il dit les mêmes mots. `#besoin`, le panneau du
 * héros, devient `#mgx-form`, comme le photo + CTA (`CadenceOffre`).
 */
export function AppelDansCarte({
  question,
  bouton,
  fin,
}: {
  question?: string;
  bouton?: LienOffre;
  fin: FinGaranties;
}) {
  if (!question) return null;
  const cible = bouton?.href === "#besoin" ? "#mgx-form" : bouton?.href;
  return (
    <div data-mobile-seulement="" className={`${styles.appelDansCarte} ${styles.texteAvecLiens}`}>
      <p data-appel-question="">
        <TexteRiche texte={question} />
      </p>
      <CorpsAppel
        fin={fin}
        bouton={bouton?.libelle && cible && cibleSure(cible) ? { href: cible, libelle: bouton.libelle } : undefined}
      />
    </div>
  );
}

/** Le numéro ne se coupe pas en fin de ligne (« 04 78 33 72 » puis « 05 »). */
function numeroInsecable(texte: string): string {
  return texte.replace(/04 78 33 72 05/g, "04\u00a078\u00a033\u00a072\u00a005");
}

/**
 * LE CORPS D'UN APPEL DE LA V3, dans l'un de ses trois dessins
 * (`FinGaranties`) : le bouton orange à pastille flèche, l'encart orangé, puis
 * les phrases du corpus. Servi par la fin des garanties (`AppelDansCarte`) et
 * par la réponse de la dernière question de la FAQ (`offres/QuestionsPhoto`).
 */
export function CorpsAppel({
  fin,
  bouton,
}: {
  fin: FinGaranties;
  bouton?: { href: string; libelle: string };
}) {
  return (
    <>
      {fin.bouton && bouton ? <BoutonFleche href={bouton.href} libelle={bouton.libelle} /> : null}
      {fin.encart ? (
        <blockquote data-mm-encart="" className={styles.encartReferences}>
          <TexteRiche texte={numeroInsecable(fin.encart)} />
        </blockquote>
      ) : null}
      {fin.textes?.map((texte) => (
        <p key={texte} data-mm-texte="">
          <TexteRiche texte={numeroInsecable(texte)} />
        </p>
      ))}
    </>
  );
}
