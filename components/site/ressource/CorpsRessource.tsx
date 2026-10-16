import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import { cibleDuLien } from "@/lib/redirections";
import type { BlocRessource, PartieRessource } from "@/types/ressource";

import styles from "./Ressource.module.css";
import * as H from "./habillage";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";

/**
 * La section « Article · corps » de `MigenRessource.dc.html` : le sommaire
 * collant à gauche, la colonne de lecture à droite, ses parties numérotées et
 * la bande d'appel posée après la DEUXIÈME partie (`if (k === 1)` de la
 * maquette).
 *
 * Composant SERVEUR, aucun JavaScript : le sommaire est fait d'ancres réelles,
 * le décalage sous l'en-tête est porté par `scroll-margin-top` sur chaque H2.
 */

/** `segs()` de la maquette : lien gras, lien, gras. Rien d'autre. */
const MOTIF = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

/**
 * Le texte en ligne, dans l'écriture que la maquette donne au contexte.
 *
 * POURQUOI PAS `TexteRiche` : il rend le gras en `<strong>` nu (graisse 700 du
 * navigateur, la maquette pose 600 et l'encre) et le lien sans style, et il
 * enveloppe `**[lien](/x/)**` dans un gras que la maquette ne pose pas. Sa
 * règle de sécurité est reprise telle quelle : seul un chemin interne devient
 * un lien, le reste est rendu en texte.
 *
 * LA RÉCURSION DU 09/10, et c'est la cause racine de douze des vingt-six
 * chaînes de Markdown visibles relevées par l'audit de Nathan Jorez.
 *
 * Le corpus écrit « **Le [dépannage industriel](/offres/depannage-industriel/)** » :
 * un gras qui COMMENCE PAR DU TEXTE et contient un lien. La première branche
 * de `MOTIF` exige `**[`, elle ne s'applique donc pas ; la troisième,
 * `\*\*([^*]+)\*\*`, avale tout le gras d'un coup et ne redescendait pas dans
 * son contenu. Résultat à l'écran : « Le [dépannage industriel](/offres/…) »,
 * crochets et chemin compris, sur douze puces de cinq pages ressource.
 *
 * `blocs/TexteRiche.tsx` avait eu exactement ce défaut, corrigé par récursion ;
 * la même correction est appliquée ici. Elle termine : `[^*]+` interdit
 * l'astérisque, donc le contenu réinjecté ne peut plus porter de `**` et ne
 * peut matcher que la deuxième branche, le lien nu.
 *
 * ÉCART ASSUMÉ À LA MAQUETTE, et c'est elle qui avait le défaut : son rendu
 * figé écrit `<strong …><span class="sc-interp">Le [dépannage
 * industriel](/offres/depannage-industriel/)</span></strong>`
 * (`maquette/rendu/ressources--articles--plan-de-maintenance.html`). Son
 * `segs()` ne redescend pas non plus dans son gras. Nous nous en écartons sur
 * la foi de l'audit : le dessin et les mots sont ceux de la capture, seule la
 * syntaxe disparaît, et les douze liens du cocon redeviennent cliquables.
 */
export function EnLigne({
  texte,
  lien,
  gras = H.GRAS,
}: {
  texte: string;
  lien: CSSProperties;
  gras?: CSSProperties;
}) {
  const morceaux: ReactNode[] = [];
  let curseur = 0;
  for (const m of texte.matchAll(MOTIF)) {
    const debut = m.index ?? 0;
    if (debut > curseur) morceaux.push(texte.slice(curseur, debut));
    curseur = debut + m[0].length;
    const libelle = m[1] ?? m[3];
    const href = m[2] ?? m[4];
    if (libelle === undefined) {
      morceaux.push(
        <strong key={debut} style={gras}>
          {/* RÉCURSION : le gras peut contenir un lien (voir l'en-tête). */}
          <EnLigne texte={m[5]} lien={lien} gras={gras} />
        </strong>,
      );
    } else if (estCheminInterne(href)) {
      morceaux.push(
        <Link key={debut} href={cibleDuLien(href)} prefetch={false} style={lien}>
          {libelle}
        </Link>,
      );
    } else {
      morceaux.push(libelle);
    }
  }
  if (curseur < texte.length) morceaux.push(texte.slice(curseur));
  return <>{morceaux}</>;
}

/**
 * Une puce qui OUVRE sur un gras : `**Libellé** : suite`. La coupure tombe
 * JUSTE après le gras, là où le texte change déjà de graisse : au bureau, la
 * suite (« : » compris) reste un seul morceau de texte, posé au pixel près
 * comme avant. Une coupure après les deux-points décalait la ligne d'un
 * soupçon de pixel (bureau différent sur cout-arret-de-production).
 */
const PUCE_KV = /^(\*\*[^*]+\*\*)(\s*[\s\S]*)$/;

/** La suite d'un libellé qui commence par « : » : le téléphone masque ces deux-points. */
const SUITE_DEUX_POINTS = /^ : \S/;

/** La règle `kv` de la maquette mobile v2 : deux puces ou plus, 60 % en gras de tête. */
export function estListeKv(items: string[]): boolean {
  if (items.length < 2) return false;
  return items.filter((item) => PUCE_KV.test(item)).length >= Math.ceil(items.length * 0.6);
}

/**
 * Le libellé (le gras seul) et la suite (sa ponctuation comprise), SANS UN CARACTÈRE DE MOINS :
 * `titre + suite === item`. Une puce sans gras de tête reste entière.
 */
export function decoupeKv(item: string): { titre: string; suite: string } {
  const m = PUCE_KV.exec(item);
  return m ? { titre: m[1], suite: m[2] } : { titre: item, suite: "" };
}

function Bloc({ bloc }: { bloc: BlocRessource }) {
  switch (bloc.type) {
    case "paragraphe":
      return (
        <p className={styles.prose} style={H.PROSE}>
          <EnLigne texte={bloc.texte} lien={H.LIEN_PROSE} />
        </p>
      );
    case "intertitre":
      return (
        <h3 className={styles.intertitre} style={H.TITRE3}>
          {bloc.texte}
        </h3>
      );
    case "puces": {
      /* LES LISTES « LIBELLÉ : TEXTE » DEVIENNENT DES PETITES CARTES
         NUMÉROTÉES au téléphone, règle `kv` de la maquette mobile v2
         (dc.html, `blockV`) : au moins deux puces, dont 60 % commencent par
         un gras. Le texte est le MÊME, coupé en deux étendues en ligne
         (libellé, suite) : au-dessus de 880 px elles se lisent d'un trait,
         comme avant ; dessous, `Ressource.module.css` les pose l'une sous
         l'autre dans leur carte. Le numéro est un compteur CSS. */
      const kv = estListeKv(bloc.items);
      return (
        <ul
          role="list"
          className={kv ? `${styles.puces} ${styles.kv}` : styles.puces}
          style={H.PUCES}
        >
          {bloc.items.map((item, i) => {
            const morceaux = kv ? decoupeKv(item) : null;
            return (
              <li key={i} style={H.PUCE}>
                <span aria-hidden="true" className={styles.coche} style={H.COCHE}>
                  ✓
                </span>
                <span>
                  {morceaux ? (
                    <>
                      <span className={styles.kvTitre}>
                        <EnLigne texte={morceaux.titre} lien={H.LIEN_PUCE} />
                      </span>
                      {morceaux.suite ? (
                        <span
                          className={
                            SUITE_DEUX_POINTS.test(morceaux.suite)
                              ? `${styles.kvTexte} ${styles.kvDeuxPoints}`
                              : styles.kvTexte
                          }
                        >
                          <EnLigne texte={morceaux.suite} lien={H.LIEN_PUCE} />
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <EnLigne texte={item} lien={H.LIEN_PUCE} />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
    case "etapes":
      // `ol` : l'ordre est le propos d'une procédure, la liste l'annonce. La
      // pastille, qui le répète à l'écran, est masquée au lecteur d'écran.
      return (
        <ol role="list" className={styles.etapes} style={H.ETAPES}>
          {bloc.items.map((item, i) => (
            <li key={i} style={H.ETAPE}>
              <span aria-hidden="true" className={styles.etapeNumero} style={H.ETAPE_NUMERO}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.etapeTexte} style={H.ETAPE_TEXTE}>
                <EnLigne texte={item} lien={H.LIEN_ETAPE} />
              </div>
            </li>
          ))}
        </ol>
      );
    case "tableau":
      /* SOUS 881 PX, UNE CARTE PAR LIGNE, motif « tableau » du LISEZMOI de la
         maquette mobile v2 (bloc `isTb` : chaque ligne devient une carte à
         bord et fond propres). Le motif est COPIÉ de `blocs/Offre.tsx`
         (`tableauEnCartes`), adapté à un vrai `<table>` : rien ne quitte le
         DOM, aucune cellule n'est dupliquée, c'est le même texte restylé.
         Mesure du 14/10 : tableaux bruts à 390 px sur le gabarit 01. Les
         règles vivent dans `Ressource.module.css`, TOUTES sous
         `@media (max-width: 880px)` : au-dessus, pas un pixel ne change.
         `data-tableau-en-cartes` est la prise de mesure de la porte, comme
         chez `Offre.tsx` : une classe de module est hachée au build. */
      return (
        <div
          className={styles.tableauEnCartes}
          data-tableau-en-cartes=""
          style={H.TABLEAU_CADRE}
          tabIndex={0}
          role="region"
          aria-label="Tableau, défilement horizontal possible"
        >
          <table style={H.TABLEAU}>
            <thead>
              <tr>
                {bloc.entetes.map((entete, i) => (
                  <th key={i} scope="col" style={H.TABLEAU_ENTETE}>
                    {entete}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloc.lignes.map((ligne, i) => (
                <tr key={i}>
                  {ligne.map((cellule, j) => (
                    /* `data-libelle` : l'en-tête de la colonne, que la
                       carte du téléphone écrit au-dessus de la valeur
                       (dc.html, `isTb`, `c.h`) en contenu généré. Un
                       attribut ne se peint pas : rien ne bouge sur bureau. */
                    <td
                      key={j}
                      data-libelle={j > 0 ? bloc.entetes[j] : undefined}
                      style={H.TABLEAU_CELLULE}
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
    case "encadre":
      return (
        <p className={styles.encadre} style={H.ENCADRE}>
          <EnLigne texte={bloc.texte} lien={H.LIEN_PUCE} gras={H.GRAS_ENCADRE} />
        </p>
      );
    case "galerie":
      return (
        <div style={GALERIE}>
          {bloc.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.largeur}
              height={image.hauteur}
              sizes="(max-width: 880px) 50vw, 260px"
              style={{ width: "100%", height: "auto", borderRadius: 12 }}
            />
          ))}
        </div>
      );
  }
}

/** Les photos d'un billet repris : une grille qui passe à deux colonnes au téléphone. */
const GALERIE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 10,
  margin: "8px 0 24px",
};

function BandeAppel() {
  return (
    <div className={styles.bande} style={H.BANDE}>
      {/* `bandeTexte` et `bandeBouton` ne portent AUCUN dessin : ils servent
          d'ancres aux règles qui, sous 620 px, donnent la ligne entière au
          texte et laissent le libellé du bouton se couper, au lieu de les
          faire sortir de l'écran de 52 et 20 px (voir `Ressource.module.css`).
          Les styles en ligne restent ceux de la capture, au pixel. */}
      <div className={styles.bandeTexte} style={H.BANDE_TEXTE}>
        <strong style={{ color: "#fff", fontWeight: 600 }}>{H.COPIE.bandeQuestion}</strong>
        {H.COPIE.bandeSuite}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={H.CONTACT} className={styles.bandeBouton} style={H.BANDE_BOUTON}>
          {H.COPIE.decrire}
        </Link>
        <a href={H.TELEPHONE.href} className={styles.bandeBouton} style={H.BANDE_TELEPHONE}>
          {H.TELEPHONE.libelle}
        </a>
      </div>
    </div>
  );
}

const numero = (i: number) => String(i + 1).padStart(2, "0");

/**
 * LE RÉSUMÉ D'UNE PARTIE REPLIÉE, règle `teaseOf` de la maquette mobile v2
 * (dc.html) : le PREMIER bloc qui soit un paragraphe ou une liste à puces ;
 * un paragraphe donne son texte, une liste sa première puce. Corrigé le 14/10 :
 * la version précédente préférait intertitres et puces au paragraphe, et
 * « Estimer le coût d'un arrêt de production n'a rien de sorcier » cédait la
 * place à « Mesurer la durée d'indisponibilité » (cout-arret-de-production,
 * parties 03, 06, 07, 08). Rien n'est fabriqué : c'est du texte de la partie.
 *
 * LE MARKDOWN EST RETIRÉ : l'audit du 09/10 est clair, aucune page ne doit
 * montrer de Markdown. Le résumé est du texte nu, coupé sur deux lignes.
 */
function texteNu(brut: string): string {
  return brut
    .replace(/\*\*\[([^\]]+)\]\([^)]*\)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function resumeDeLaPartie(partie: PartieRessource): string {
  const premier = partie.blocs.find(
    (b): b is Extract<BlocRessource, { type: "paragraphe" | "puces" }> =>
      b.type === "paragraphe" || b.type === "puces",
  );
  if (!premier) return "";
  return texteNu(premier.type === "paragraphe" ? premier.texte : premier.items[0] ?? "");
}

export default function CorpsRessource({
  avant = [],
  parties = [],
  chemin,
  photoHeros,
  faq,
}: {
  avant?: BlocRessource[];
  parties?: PartieRessource[];
  /** Le chemin de la page : sans lui, aucune cadence de conversion mobile. */
  chemin?: string;
  /** La photo du héros, écartée du tirage du photo + CTA de la cadence. */
  photoHeros?: string;
  /** Le titre de la FAQ quand la page en a une : dernière entrée du sommaire
      mobile (dc.html, `toc` prend aussi le titre de la FAQ). */
  faq?: string;
}) {
  if (avant.length === 0 && parties.length === 0) return null;

  /* LA BANDE D'APPEL DE BUREAU, posée après la deuxième partie. Au téléphone,
     la cadence pose la photo + CTA juste après cette même partie : la bande
     passe donc en TÊTE DE LA TROISIÈME, pour que la photo suive la partie 02
     comme dans la maquette (dc.html, `pushCtas`). Sur bureau la photo
     n'existe pas : l'ordre affiché est le même qu'avant. */
  const rangBande = parties.length > 2 ? 2 : 1;

  const blocsDesParties = parties.map((partie, k) => {
    const titre = (
      <h2 id={`mr-s${k + 1}`} className={styles.titrePartie} style={H.TITRE2}>
        <span style={H.TITRE2_NUMERO}>{numero(k)}</span>
        {partie.titre}
      </h2>
    );
    return (
      <Fragment key={k}>
        {k === rangBande && rangBande === 2 ? <BandeAppel /> : null}
        {/* CHAQUE PARTIE EST UNE CARTE BLANCHE NUMÉROTÉE au téléphone, la
            première comprise (dc.html, `isDetails` + `isH`) : son TITRE est
            dans la carte, à côté du numéro (compteur CSS de la carte
            partagée), et il y reste ouverte comme fermée. Le `<h2>` de la
            partie reste dans le corps, porteur de l'ancre `#mr-s<n>` et du
            plan du document ; au téléphone il ne se peint plus, son texte
            étant celui de l'étiquette (doublon, `Ressource.module.css`).
            Les DEUX premières restent ouvertes (`nOpen = 2` du gabarit 01),
            repliables. Sur bureau, rien ne change : bascule masquée, corps
            en `display: contents`. */}
        <SectionPliableMobile
          enTete={
            <span data-mobile-seulement="" className={styles.etiquettePli}>
              <span data-carte-titre="">{partie.titre}</span>
            </span>
          }
          resume={resumeDeLaPartie(partie)}
          toujoursOuvert={k < 2}
        >
          {titre}
          {partie.blocs.map((bloc, i) => (
            <Bloc key={i} bloc={bloc} />
          ))}
        </SectionPliableMobile>
        {k === rangBande && rangBande === 1 ? <BandeAppel /> : null}
      </Fragment>
    );
  });

  return (
    <section data-screen-label="Article · corps" className={styles.sectionCorps} style={H.SECTION_CORPS}>
      <div className={styles.deux} style={H.GRILLE_CORPS}>
        <nav aria-label={H.COPIE.sommaire} className={styles.sommaire} style={H.SOMMAIRE}>
          {/* G3 : LE SOMMAIRE, BLOC DE BUREAU, SE REPLIE AU TÉLÉPHONE au lieu
              d'y disparaître. Il était `display: none` sous 980 px ; la
              maquette mobile v2 le sert replié sous « Sommaire »
              (dc.html, `hasToc`, `<details data-open="0">`). Le titre
              EXISTANT sert d'en-tête de la bascule, il n'est pas doublé. Le
              compte « N parties » du téléphone est retiré le 16/10 (Mehdi :
              plus aucun compteur). Sur bureau la bascule se lit comme avant
              (chevron et résumé masqués, arrêt de tabulation retiré par le
              composant partagé). */}
          <SectionPliableMobile
            numero={false}
            enTete={
              <div className={styles.sommaireTitre} style={H.SOMMAIRE_TITRE}>
                {H.COPIE.sommaire}
              </div>
            }
          >
            {parties.map((partie, i) => (
              <a
                key={i}
                href={`#mr-s${i + 1}`}
                className={styles.entree}
                style={H.SOMMAIRE_ENTREE}
              >
                <span style={H.NUMERO_MONO}>{numero(i)}</span>
                {partie.titre}
              </a>
            ))}
            {faq ? (
              <a data-mobile-seulement="" href="#mr-faq" className={styles.entree} style={H.SOMMAIRE_ENTREE}>
                <span style={H.NUMERO_MONO}>{numero(parties.length)}</span>
                {faq}
              </a>
            ) : null}
            {/* Absent du sommaire de la maquette mobile v2, et sa cible
                `#mr-cta` y est repliée : masqué au téléphone. */}
            <a href="#mr-cta" className={styles.doublonMobile} style={H.SOMMAIRE_BOUTON}>
              {H.COPIE.expert}
            </a>
          </SectionPliableMobile>
        </nav>
        {/* `styles.colonne` ne porte AUCUN dessin : il sert d'ancre à la règle
            qui annule, au-dessus de 880 px, les pixels que le repli mobile
            ajoutait (voir `Ressource.module.css`). */}
        <div className={styles.colonne} style={H.COLONNE}>
          {avant.map((bloc, i) => (
            <Bloc key={`a${i}`} bloc={bloc} />
          ))}
          {/* CHAQUE PARTIE SE REPLIE AU TÉLÉPHONE, SAUF LES DEUX PREMIÈRES.
              C'est la règle de la maquette mobile v2 pour le gabarit 01, et
              elle est ÉCRITE dans `Migen - Mobile v2.dc.html` :
              `nOpen = g === "01" ? 2 : …`, puis `op = isRef || dI++ < nOpen`.
              Les DEUX premières sections de contenu restent ouvertes, les
              suivantes sont repliées sous un résumé.
              CORRIGÉ LE 14/10 : la version précédente n'en laissait qu'UNE
              (`k === 0`), règle des autres gabarits. La mesure des onze
              gabarits à 390 px l'a vue : le gabarit 01 était le seul à rendre
              MOINS haut que la maquette (-12 %), tout le reste étant replié.
              Mehdi, le 12/10 : « tu n'as pas déployé toute la maquette mobile,
              il n'y a que quelques pages ». Mesure du même jour : 1 567
              sections auraient dû se replier, 141 le faisaient, et les 41
              pages ressource n'en avaient aucune.
              Le titre `<h2>` EXISTANT sert d'en-tête : on n'en fabrique pas un
              second, et l'ancre `#mr-s<n>` du sommaire reste sur lui pour que
              les liens du sommaire continuent de tomber au bon endroit.
              Sur ordinateur rien ne change, le repli n'a lieu qu'en dessous de
              880 px. */}
          {/* LA CADENCE DE CONVERSION DE LA MAQUETTE MOBILE V2, gabarit 01,
              variante « article » (« Passer à l'action ») : photo + CTA après
              la 2e partie, bandeau « Être rappelé » après la 5e, la 8e…
              Tout ce qu'elle ajoute est masqué au-dessus de 880 px. Le rappel
              final est posé par `PageRessource`, sous les pastilles, là où la
              maquette le met. */}
          {chemin ? (
            <AvecConversionMobile
              chemin={chemin}
              gabarit="01"
              photoHeros={photoHeros}
              rappelFinal={false}
            >
              {blocsDesParties}
            </AvecConversionMobile>
          ) : (
            blocsDesParties
          )}
        </div>
      </div>
    </section>
  );
}
