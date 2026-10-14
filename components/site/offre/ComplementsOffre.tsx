import { Fragment, type CSSProperties } from "react";

import { LARGEUR, VERRE } from "@/components/site/blocs/habillage";
import type { BlocComplement } from "@/types/offre";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import { resumeDe } from "@/components/site/blocs/resume-de-section";
import TexteRiche from "@/components/site/blocs/TexteRiche";

import EtiquettePli from "./EtiquettePli";
import styles from "./PageOffre.module.css";

/** Au-delà, une phrase n'est plus un intitulé de carte. */
const LONGUEUR_ETIQUETTE = 80;

/**
 * Écran « Complément N » de la maquette, porté le 07/10 depuis
 * `maquette/rendu/offres--residence--prestataire-ou-salarie.html`
 * (`data-screen-label="Complément 4"`, blocs 540 à 550).
 *
 * POURQUOI CE COMPOSANT N'EXISTAIT PAS. Les six offres NOMMÉES
 * (`/offres/residence/`, `/offres/zero-arret/`, …) n'ont pas cet écran : la
 * page pilote validée le 06/10 rend 17 sections, sans lui. Les SOUS-pages du
 * gabarit 03 en ont un ou deux : la maquette y verse la prose de la section du
 * corpus dont elle a déjà pris le tableau ailleurs (ici le titre H3 et les
 * deux paragraphes de « ## L'offre », dont les sept lignes de tableau sont
 * rendues par `PointsOffre`). Sans cet écran, ce texte payé disparaissait.
 *
 * MODIFICATION D'UN COMPOSANT PARTAGÉ PAR LES 22 PAGES : ajout seul, aucune
 * retouche des composants existants. Sans donnée, rien n'est rendu, donc les
 * 21 autres pages ne bougent pas.
 *
 * LA MAQUETTE N'A QU'UN EMPLACEMENT MONTÉ ICI, celui de « Complément 4 »,
 * entre la bande d'appel de l'offre et le déroulé. `/offres/residence/cahier-des-charges/`
 * en déclare un second (« Complément 5 », après le déroulé) : ce sera UNE
 * ligne de plus dans `PageOffre`, à ajouter par la page qui en a besoin, pas
 * un champ mort posé d'avance.
 */

export interface ProprietesComplementsOffre {
  blocs: readonly BlocComplement[];
  /**
   * CE QUE CE COMPLÉMENT SUIT DANS LA PAGE, et pourquoi la carte en dépend.
   *
   * La forme « ligne de clôture » décrite plus bas ne vaut que derrière une
   * SECTION DE CONTENU : elle ferme ce qui précède. Derrière la BANDE D'APPEL,
   * elle n'a rien à fermer, et le résultat est un texte gris collé 18 px sous
   * un appel à l'action qui ne le concerne pas.
   *
   * MESURÉ EN PRODUCTION LE 14/10, `/travaux-industriels/` à 1280 px : la
   * section « Complément 4 » fait 90 px et ne porte AUCUNE carte, là où la
   * maquette vivante en rend une de 1120 × 143 dans une section de 191 px.
   * À 390 px : 162 px servis contre 349 px attendus. C'est exactement le bloc
   * que Mehdi nomme « mal disposé » le 12/10, et la cause est ici.
   *
   * Défaut à « section » : les quatre appels existants gardent leur forme, et
   * seul celui qui suit la bande d'appel la déclare.
   */
  suit?: "section" | "bandeAppel";
  /**
   * MASQUÉ SOUS 881 PX, parce que la carte qu'il prolonge le porte déjà en
   * tête de son corps (`ComplementsDansCarte`), comme la maquette mobile v2
   * (« Nos domaines… » dans « 02 L'offre », « Chaque étape a un livrable… »
   * dans « 03 Le déroulé »). Au-dessus de 880 px, rien ne change.
   */
  doublonMobile?: boolean;
}

/**
 * LE MÊME COMPLÉMENT, DANS LE CORPS DE LA CARTE QU'IL PROLONGE, au téléphone
 * seulement (`data-mobile-seulement`). La maquette mobile v2 n'en fait pas une
 * carte orpheline : c'est le premier paragraphe de la carte, et donc son
 * résumé quand elle est repliée (`premierTexte`). Le bureau garde l'écran
 * « Complément N » de sa capture ; les mots sont les mêmes.
 */
export function ComplementsDansCarte({
  blocs,
}: {
  blocs?: readonly BlocComplement[];
}) {
  const retenus = (blocs ?? []).filter(
    (bloc) => !!bloc.titre || !!bloc.texte || !!bloc.puces?.length,
  );
  if (retenus.length === 0) return null;
  const intitule = intituleEnTete(retenus);
  return (
    <div data-mobile-seulement="">
      {retenus.map((bloc, rang) => (
        <Fragment key={bloc.titre ?? `${rang}`}>
          {bloc.titre || (rang === 0 && intitule) ? (
            <p data-mm-lead="">{bloc.titre ?? bloc.texte}</p>
          ) : null}
          {bloc.texte && !(rang === 0 && intitule && !bloc.titre) ? (
            <p data-mm-paragraphe="">
              <TexteRiche texte={bloc.texte} />
            </p>
          ) : null}
          {bloc.puces?.map((puce) => (
            <p key={puce.accroche ?? puce.texte} data-mm-paragraphe="">
              {puce.accroche ? <strong>{puce.accroche}</strong> : null}
              {puce.accroche ? " " : null}
              {puce.texte}
            </p>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * UNE PHRASE COURTE EN TÊTE DE PLUSIEURS BLOCS EST UN INTITULÉ, pas un
 * paragraphe (« Six façons de nous confier vos machines »,
 * `/entreprise-maintenance-industrielle/`) : même règle que l'étiquette de
 * `ComplementsOffre`, `LONGUEUR_ETIQUETTE`.
 */
function intituleEnTete(retenus: readonly BlocComplement[]): boolean {
  const premier = retenus[0];
  return (
    retenus.length > 1 &&
    !premier.titre &&
    !premier.puces?.length &&
    !!premier.texte &&
    premier.texte.length <= LONGUEUR_ETIQUETTE
  );
}

/**
 * Le premier PARAGRAPHE d'un complément : le résumé de la carte qui le porte
 * (dc.html `teaseOf`). Un intitulé en tête ne compte pas, comme dans la
 * maquette qui en fait le titre de la carte.
 */
export function premierTexte(
  blocs?: readonly BlocComplement[],
): string | undefined {
  const retenus = (blocs ?? []).filter((bloc) => bloc.titre || bloc.texte);
  const reste = intituleEnTete(retenus) ? retenus.slice(1) : retenus;
  return reste.map((bloc) => bloc.texte?.trim()).find(Boolean) || undefined;
}

const SECTION_COMPLEMENT: CSSProperties = { padding: "48px 0 0" };

/** La bande d'une ligne de clôture : elle ferme, elle n'ouvre pas. */
const SECTION_CLOTURE: CSSProperties = { padding: "18px 0 0" };

/** Le texte d'une ligne de clôture, à l'échelle d'une note, pas d'un corps. */
const TEXTE_CLOTURE: CSSProperties = {
  font: "400 14.5px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: 0,
  maxWidth: "78ch",
  textWrap: "pretty",
};

/** Bloc 542 : la carte en verre, en colonnes qui se replient à 420 px. */
const CARTE: CSSProperties = {
  ...VERRE,
  padding: "30px 34px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
  gap: "4px 44px",
};

/** Bloc 546 : le filet orange et le titre, alignés sur la ligne de base. */
const RANGEE_TITRE: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "baseline",
  marginBottom: 10,
};

const FILET: CSSProperties = {
  width: 16,
  height: 3,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "0 0 auto",
  transform: "translateY(-4px)",
};

const TITRE: CSSProperties = {
  font: "600 17px/1.35 var(--ft)",
  letterSpacing: "-.02em",
  margin: 0,
};

const TEXTE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: 0,
  maxWidth: "66ch",
  textWrap: "pretty",
};

/* Blocs 628 à 639 : la variante À COCHES du même bloc, relevée le 07/10 sur
   `maquette/rendu/offres--residence--cahier-des-charges.html` (« Complément 5 »,
   « Les 4 erreurs qui coûtent cher »). Même carte, même titre, corps en liste. */
const LISTE: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 10 };

const PUCE: CSSProperties = {
  display: "flex",
  gap: 11,
  font: "400 15px/1.6 var(--fb)",
  color: "var(--ink1)",
};

const COCHE: CSSProperties = {
  color: "var(--acc)",
  flex: "0 0 auto",
  fontWeight: 600,
};

const ACCROCHE: CSSProperties = { fontWeight: 600, color: "var(--ink)" };

export default function ComplementsOffre({
  blocs,
  suit = "section",
  doublonMobile = false,
}: ProprietesComplementsOffre) {
  const masque = doublonMobile ? { "data-doublon-mobile": "" } : {};
  const retenus = blocs.filter(
    (bloc) => !!bloc.titre || !!bloc.texte || !!bloc.puces?.length,
  );
  if (retenus.length === 0) return null;

  /**
   * UNE PHRASE SEULE N'EST PAS UN BLOC, c'est une ligne de clôture.
   *
   * POURQUOI. Mehdi, le 12/10, sur `/offres/bureau-etudes/` : « Ni celui ci ou
   * il y a juste une phrase : Chaque étape a un livrable défini et un point de
   * validation. Vous restez maître des choix. » Et avant cela, deux fois, « le
   * bloc est clairement mal disposé ».
   *
   * CE QUE ÇA COÛTAIT : 48 px de section, une carte de verre à 30 px de
   * rembourrage, la phrase, puis 32 px. Environ 130 px de hauteur et un cadre
   * qui fait passer une ligne pour un bloc de contenu, juste après une section
   * qui, elle, en est un.
   *
   * CE QUI EST CONFORME À LA CAPTURE, et il faut le dire : la maquette écrit
   * bien cette phrase à cet endroit, dans ce cadre. Ce n'est donc PAS un défaut
   * de portage, c'est un arbitrage de Mehdi contre sa propre maquette, comme
   * celui qu'il a pris le même jour sur `/contact/` et sur `/implantations/`.
   *
   * CE QUI CHANGE, et seulement cela : la forme. Le texte n'est ni réécrit ni
   * déplacé, il ferme la section qui le précède au lieu d'en ouvrir une
   * nouvelle. Dès qu'il y a un titre, une puce, ou un second bloc, la carte
   * revient telle quelle.
   *
   * CE QU'ELLE NE COUVRE PAS, corrigé le 14/10 : « il ferme la section qui le
   * précède » suppose qu'une section le précède. À l'emplacement
   * « Complément 4 », ce qui précède est la BANDE D'APPEL, et une ligne de
   * clôture y clôt un bouton. Le texte y perdait sa carte, passait en gris
   * 14,5 px et venait se coller 18 px sous la bande : le lecteur n'y voit plus
   * un bloc de la page mais la légende de l'appel à l'action.
   *
   * CE QUE ÇA TOUCHAIT, compté sur les fiches du dépôt le 14/10 : 34 blocs
   * perdaient leur carte, dont 27 à cet emplacement, longs de 72 à 250
   * caractères. L'arbitrage de Mehdi portait sur UNE phrase de 90. Les 7 autres
   * suivent bien une section de contenu et gardent la forme qu'il a demandée,
   * « Chaque étape a un livrable défini… » comprise.
   */
  const ligneDeCloture =
    suit === "section" &&
    retenus.length === 1 &&
    !!retenus[0].texte &&
    !retenus[0].titre &&
    !retenus[0].puces?.length;

  if (ligneDeCloture) {
    return (
      <section {...masque} className={styles.complementMobile} style={SECTION_CLOTURE}>
        <div style={LARGEUR}>
          <p style={TEXTE_CLOTURE}>{retenus[0].texte}</p>
        </div>
      </section>
    );
  }

  /* AU TÉLÉPHONE, UN COMPLÉMENT DE PLUSIEURS BLOCS SE REPLIE, comme la section
     qu'il prolonge : son premier intitulé (titre, ou phrase courte qui en tient
     lieu, « Six façons de nous confier vos machines ») devient l'étiquette de
     la carte, et son doublon du corps s'efface sous 880 px. Plus de 1 000 px
     de texte déplié entre deux cartes repliées, sur
     `/entreprise-maintenance-industrielle/` (14/10). Au-dessus de 880 px,
     rien ne change. */
  const premier = retenus[0];
  const etiquette =
    retenus.length > 1
      ? premier.titre ??
        (premier.texte && !premier.puces?.length && premier.texte.length <= LONGUEUR_ETIQUETTE
          ? premier.texte
          : undefined)
      : undefined;

  const carte = (
    <div style={CARTE}>
      {retenus.map((bloc, rang) => (
        <div
          key={bloc.titre ?? `${rang}`}
          {...(rang === 0 && etiquette && !bloc.titre ? { "data-doublon-mobile": "" } : {})}
          style={{ minWidth: 0, paddingBottom: 18 }}
        >
          {bloc.titre ? (
            <div
              {...(rang === 0 && etiquette ? { "data-doublon-mobile": "" } : {})}
              style={RANGEE_TITRE}
            >
              <span aria-hidden="true" style={FILET} />
              <h3 style={TITRE}>{bloc.titre}</h3>
            </div>
          ) : null}
          {bloc.texte ? <p style={TEXTE}>{bloc.texte}</p> : null}
          {bloc.puces?.length ? (
            <div style={LISTE}>
              {bloc.puces.map((puce) => (
                <div key={puce.accroche ?? puce.texte} style={PUCE}>
                  {/* Masquée aux technologies d'assistance : la coche est
                      un ornement de liste, elle n'énonce rien. */}
                  <span aria-hidden="true" style={COCHE}>
                    ✓
                  </span>
                  <span>
                    {puce.accroche ? (
                      <strong style={ACCROCHE}>{puce.accroche}</strong>
                    ) : null}
                    {puce.accroche ? " " : null}
                    {puce.texte}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  return (
    <section {...masque} className={styles.complementMobile} style={SECTION_COMPLEMENT}>
      <div style={LARGEUR}>
        {etiquette ? (
          <SectionPliableMobile
            numero={false}
            enTete={<EtiquettePli titre={etiquette} />}
            resume={resumeDe(retenus.slice(1).map((bloc) => bloc.titre))}
          >
            {carte}
          </SectionPliableMobile>
        ) : (
          carte
        )}
      </div>
    </section>
  );
}
