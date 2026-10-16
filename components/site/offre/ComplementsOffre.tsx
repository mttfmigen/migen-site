import { Fragment, type CSSProperties } from "react";

import { LARGEUR } from "@/components/site/blocs/habillage";
import type { Tableau } from "@/types/contenu";
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
  titreCarte,
  chapo = false,
}: {
  blocs?: readonly BlocComplement[];
  /** Le chapô de la carte, avant sa liste : son premier paragraphe en tête (V3 `lead`). */
  chapo?: boolean;
  /**
   * Le titre de la carte propre à la page (V3, `TITRES_CARTES_MOBILE`) : le
   * complément qui commence par lui ne le répète pas dans son corps.
   */
  titreCarte?: string;
}) {
  const retenus = sansTitreDeCarte(
    (blocs ?? []).filter((bloc) => !!bloc.titre || !!bloc.texte || !!bloc.puces?.length || !!bloc.tableau),
    titreCarte,
  );
  if (retenus.length === 0) return null;
  const intitule = !titreCarte && intituleEnTete(retenus);
  return (
    /* V3 « Site mobile » (16/10) : un intertitre du corpus prend le filet et
       la typographie des intertitres de carte (`intertitreMobile`), une liste
       devient les petites cartes numérotées des points (`data-mm-kv`). */
    <div data-mobile-seulement="" data-mm-chapo={chapo ? "" : undefined}>
      {retenus.map((bloc, rang) => (
        <Fragment key={bloc.titre ?? `${rang}`}>
          {bloc.titre ? (
            <p className={styles.intertitreMobile}>{bloc.titre}</p>
          ) : rang === 0 && intitule ? (
            <p data-mm-lead="">{bloc.texte}</p>
          ) : null}
          {bloc.tableau ? <TableauComplement tableau={bloc.tableau} /> : null}
          {bloc.texte && !(rang === 0 && intitule && !bloc.titre) ? (
            <p data-mm-paragraphe="">
              <TexteRiche texte={bloc.texte} />
            </p>
          ) : null}
          {bloc.puces?.length ? (
            <div data-mm-kv="" data-mm-compteur="">
              {bloc.puces.map((puce) => (
                <div key={puce.accroche ?? puce.texte}>
                  {puce.accroche ? <p data-mm-kv-titre="">{puce.accroche}</p> : null}
                  <p data-mm-kv-texte="">
                    <TexteRiche texte={puce.texte} />
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

/** Le complément sans son premier bloc quand celui-ci est le titre de la carte. */
function sansTitreDeCarte(
  blocs: readonly BlocComplement[],
  titreCarte?: string,
): readonly BlocComplement[] {
  const tete = blocs[0];
  const estLeTitre =
    !!titreCarte && !!tete && !tete.titre && !tete.puces?.length && tete.texte?.trim() === titreCarte.trim();
  return estLeTitre ? blocs.slice(1) : blocs;
}

/**
 * LE COMPLÉMENT D'UNE CARTE TITRÉE PAR LA PAGE, COUPÉ EN DEUX (V3, 16/10) :
 * quand il commence par le titre de la carte, il reprend la section du corpus
 * depuis son titre, et les paragraphes qui suivent, jusqu'au premier
 * intertitre ou à la première liste, sont son chapô, que la V3 rend AVANT la
 * liste de la carte (« Six façons de nous confier vos machines »,
 * `/entreprise-maintenance-industrielle/`). Sinon, tout suit la liste.
 */
export function decoupeComplement(
  blocs: readonly BlocComplement[] | undefined,
  titreCarte?: string,
): { chapo: readonly BlocComplement[]; suite: readonly BlocComplement[] } {
  const tous = blocs ?? [];
  const reste = sansTitreDeCarte(tous, titreCarte);
  if (reste === tous) return { chapo: [], suite: tous };
  const coupe = reste.findIndex((bloc) => !!bloc.titre || !!bloc.puces?.length);
  const fin = coupe === -1 ? reste.length : coupe;
  return { chapo: reste.slice(0, fin), suite: reste.slice(fin) };
}

/**
 * UNE PHRASE COURTE EN TÊTE DE PLUSIEURS BLOCS EST UN INTITULÉ, pas un
 * paragraphe (« Six façons de nous confier vos machines »,
 * `/entreprise-maintenance-industrielle/`) : même règle que l'étiquette de
 * `ComplementsOffre`, `LONGUEUR_ETIQUETTE`.
 */
function intituleEnTete(retenus: readonly BlocComplement[]): boolean {
  return retenus.length > 1 && estCourt(retenus[0]);
}

/** Une phrase courte, seule dans son bloc : la forme d'un intitulé. */
function estCourt(bloc: BlocComplement): boolean {
  return (
    !bloc.titre &&
    !bloc.puces?.length &&
    !!bloc.texte &&
    bloc.texte.length <= LONGUEUR_ETIQUETTE
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
  const retenus = (blocs ?? []).filter((bloc) => !bloc.horsResume && (bloc.titre || bloc.texte));
  const reste = intituleEnTete(retenus) ? retenus.slice(1) : retenus;
  return reste.map((bloc) => bloc.texte?.trim()).find(Boolean) || undefined;
}

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

const FILET: CSSProperties = {
  width: 16,
  height: 3,
  borderRadius: 999,
  background: "var(--acc)",
  flex: "0 0 auto",
  transform: "translateY(-4px)",
};

const COCHE: CSSProperties = {
  color: "var(--acc)",
  flex: "0 0 auto",
  fontWeight: 600,
};

const ACCROCHE: CSSProperties = { fontWeight: 600, color: "var(--ink)" };

/** V3 `listMod` : une phrase de 140 caractères au plus, juste avant une liste
 *  sans titre, est l'intitulé de cette liste. */
const LONGUEUR_TETE_V3 = 140;

/** V3 `mgx-cd` : 4 cartes sur deux colonnes, sinon jusqu'à trois. */
function colonnesV3(nombre: number): number {
  return nombre === 4 ? 2 : Math.min(nombre, 3);
}

/** Le paragraphe seul, sans titre, qui annonce la liste du bloc suivant. */
function estTeteV3(bloc: BlocComplement, suivant?: BlocComplement): boolean {
  return (
    !bloc.titre &&
    !bloc.puces?.length &&
    !bloc.tableau &&
    !!bloc.texte &&
    bloc.texte.length <= LONGUEUR_TETE_V3 &&
    !!suivant?.puces?.length &&
    !suivant.titre
  );
}

export default function ComplementsOffre({
  blocs,
  suit = "section",
  doublonMobile = false,
}: ProprietesComplementsOffre) {
  const masque = doublonMobile ? { "data-doublon-mobile": "" } : {};
  const retenus = blocs.filter(
    (bloc) => !!bloc.titre || !!bloc.texte || !!bloc.puces?.length || !!bloc.tableau,
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

  /* V3 « Site PC » (16/10) : au bureau, le complément quitte sa carte en
     verre (paragraphes nus, comme la V3), ses titres passent à l'échelle des
     sections et chaque point d'une liste devient une carte numérotée
     (`PageOffre.module.css`, `.complementV3`). La ligne de clôture, plus
     haut, garde sa forme. Sous 881 px, rien ne change. */
  const carte = (
    /* La carte en verre (bloc 542), le bloc, la liste à coches (blocs 628 à
       639) et la puce sont dessinés par le module (`.complementCarte`…), pas
       en ligne : le dessin V3 de bureau les remplace sans `!important`. */
    <div className={`${styles.complementCarte} ${styles.complementV3}`}>
      {retenus.map((bloc, rang) => (
        <div
          key={bloc.titre ?? `${rang}`}
          {...(rang === 0 && etiquette && !bloc.titre ? { "data-doublon-mobile": "" } : {})}
          {...(estTeteV3(bloc, retenus[rang + 1]) ? { "data-v3-tete": "" } : {})}
          className={styles.complementBloc}
          style={bloc.tableau ? { gridColumn: "1 / -1" } : undefined}
        >
          {bloc.titre ? (
            <div
              {...(rang === 0 && etiquette ? { "data-doublon-mobile": "" } : {})}
              className={styles.titreV3}
            >
              <span aria-hidden="true" style={FILET} />
              <h3>{bloc.titre}</h3>
            </div>
          ) : null}
          {/* Le tableau suit le titre : le corpus écrit sa conclusion APRÈS lui
              (« Aucune colonne ne gagne dans l'absolu », prestataire-ou-salarie). */}
          {bloc.tableau ? <TableauComplement tableau={bloc.tableau} /> : null}
          {/* `TexteRiche`, comme au téléphone (`ComplementsDansCarte`) : aucun
              texte de complément ne portait de Markdown au 16/10, le rendu des
              pages existantes ne change donc pas ; le comparatif de
              prestataire-ou-salarie y garde son lien vers le guide. */}
          {bloc.texte ? (
            <p className={styles.complementTexte}>
              <TexteRiche texte={bloc.texte} />
            </p>
          ) : null}
          {bloc.puces?.length ? (
            <div
              className={`${styles.complementListe} ${styles.cartesV3}`}
              data-colonnes={colonnesV3(bloc.puces.length)}
            >
              {bloc.puces.map((puce, numero) => (
                <div key={puce.accroche ?? puce.texte} className={styles.complementPuce}>
                  <span aria-hidden="true" className={styles.numeroV3}>
                    {String(numero + 1).padStart(2, "0")}
                  </span>
                  {/* Masquée aux technologies d'assistance : la coche est
                      un ornement de liste, elle n'énonce rien. */}
                  <span aria-hidden="true" className={styles.cocheV3} style={COCHE}>
                    ✓
                  </span>
                  {/* Au bureau, l'accroche devient le titre de la carte et le
                      texte son corps, capitale initiale comprise (V3 `cap`).
                      Sauf quand le texte CONTINUE la phrase de l'accroche
                      (`suitAccroche`, « **Transfert industriel** est le mot
                      que… ») : la couper en deux la viderait de son sens, la
                      carte garde la phrase entière. */}
                  <span>
                    {puce.accroche ? (
                      <strong
                        style={ACCROCHE}
                        className={puce.suitAccroche ? undefined : styles.titreCarteV3}
                      >
                        {puce.accroche}
                      </strong>
                    ) : null}
                    {puce.accroche ? " " : null}
                    <span className={puce.suitAccroche ? undefined : styles.corpsCarteV3}>
                      <TexteRiche texte={puce.texte} />
                    </span>
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
    <section
      {...masque}
      className={`${styles.complementMobile} ${styles.sectionV3}`}
    >
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

const TABLE: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
};
const TH: CSSProperties = {
  textAlign: "left",
  padding: "10px 14px",
  font: "600 10.5px var(--fb)",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--ink3)",
  borderBottom: "1px solid var(--line)",
};
const TD: CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "top",
  borderBottom: "1px solid var(--line)",
};

/**
 * Le tableau d'un complément : les colonnes du corpus, toutes, la première en
 * gras. Sous 881 px chaque ligne devient une carte et chaque cellule porte
 * l'intitulé de sa colonne (`data-libelle`, feuille du module), le dessin des
 * tableaux en cartes de la maquette mobile v2.
 */
function TableauComplement({ tableau }: { tableau: Tableau }) {
  return (
    <div
      className={styles.tableauComplement}
      tabIndex={0}
      role="region"
      aria-label="Tableau, défilement horizontal possible"
    >
      <table style={TABLE}>
        <thead>
          <tr>
            {tableau.entetes.map((entete) => (
              <th key={entete} scope="col" style={TH}>
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableau.lignes.map((ligne) => (
            <tr key={ligne[0]}>
              {ligne.map((cellule, rang) => (
                <td
                  key={tableau.entetes[rang] ?? rang}
                  data-libelle={rang > 0 ? tableau.entetes[rang] : undefined}
                  style={rang === 0 ? { ...TD, fontWeight: 600, color: "var(--ink)" } : TD}
                >
                  <TexteRiche texte={cellule} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
