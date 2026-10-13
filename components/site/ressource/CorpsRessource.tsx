import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { BlocRessource, PartieRessource } from "@/types/ressource";

import styles from "./Ressource.module.css";
import * as H from "./habillage";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

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
        <Link key={debut} href={href} prefetch={false} style={lien}>
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

function Bloc({ bloc }: { bloc: BlocRessource }) {
  switch (bloc.type) {
    case "paragraphe":
      return (
        <p style={H.PROSE}>
          <EnLigne texte={bloc.texte} lien={H.LIEN_PROSE} />
        </p>
      );
    case "intertitre":
      return <h3 style={H.TITRE3}>{bloc.texte}</h3>;
    case "puces":
      return (
        <ul role="list" style={H.PUCES}>
          {bloc.items.map((item, i) => (
            <li key={i} style={H.PUCE}>
              <span aria-hidden="true" style={H.COCHE}>
                ✓
              </span>
              <span>
                <EnLigne texte={item} lien={H.LIEN_PUCE} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "etapes":
      // `ol` : l'ordre est le propos d'une procédure, la liste l'annonce. La
      // pastille, qui le répète à l'écran, est masquée au lecteur d'écran.
      return (
        <ol role="list" style={H.ETAPES}>
          {bloc.items.map((item, i) => (
            <li key={i} style={H.ETAPE}>
              <span aria-hidden="true" style={H.ETAPE_NUMERO}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div style={H.ETAPE_TEXTE}>
                <EnLigne texte={item} lien={H.LIEN_ETAPE} />
              </div>
            </li>
          ))}
        </ol>
      );
    case "tableau":
      return (
        <div
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
                    <td key={j} style={H.TABLEAU_CELLULE}>
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
        <p style={H.ENCADRE}>
          <EnLigne texte={bloc.texte} lien={H.LIEN_PUCE} gras={H.GRAS_ENCADRE} />
        </p>
      );
  }
}

function BandeAppel() {
  return (
    <div style={H.BANDE}>
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
 * LE RÉSUMÉ D'UNE PARTIE REPLIÉE, suivant la règle de la maquette mobile :
 * `summary = punch | items joints par " · " | premier paragraphe`.
 *
 * On prend le premier contenu qui dise quelque chose, dans cet ordre : les
 * intertitres, les puces, les étapes, puis le premier paragraphe. Rien n'est
 * fabriqué : le résumé est toujours du texte déjà présent dans la partie.
 *
 * LE MARKDOWN EST RETIRÉ, et c'est un défaut que la porte du gabarit a
 * attrapé sur la première version de ce résumé : le corpus écrit
 * « **Mesurer la durée d'indisponibilité** » et « [la GMAO](/x/) », que le
 * résumé affichait tels quels. L'audit du 09/10 est clair, aucune page ne doit
 * montrer de Markdown. Le résumé est du texte nu : le gras et les liens n'y
 * ont pas leur place de toute façon, il tient sur deux lignes coupées.
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
  const intertitres = partie.blocs
    .filter((b): b is { type: "intertitre"; texte: string } => b.type === "intertitre")
    .map((b) => texteNu(b.texte))
    .filter(Boolean);
  if (intertitres.length) return intertitres.join(" · ");

  const listes = partie.blocs.flatMap((b) =>
    b.type === "puces" || b.type === "etapes" ? b.items.map(texteNu) : [],
  );
  if (listes.length) return listes.filter(Boolean).join(" · ");

  const prose = partie.blocs.find(
    (b): b is { type: "paragraphe"; texte: string } => b.type === "paragraphe",
  );
  return prose ? texteNu(prose.texte) : "";
}

export default function CorpsRessource({
  avant = [],
  parties = [],
}: {
  avant?: BlocRessource[];
  parties?: PartieRessource[];
}) {
  if (avant.length === 0 && parties.length === 0) return null;

  return (
    <section data-screen-label="Article · corps" style={H.SECTION_CORPS}>
      <div className={styles.deux} style={H.GRILLE_CORPS}>
        <nav aria-label={H.COPIE.sommaire} className={styles.sommaire} style={H.SOMMAIRE}>
          <div style={H.SOMMAIRE_TITRE}>{H.COPIE.sommaire}</div>
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
          <a href="#mr-cta" style={H.SOMMAIRE_BOUTON}>
            {H.COPIE.expert}
          </a>
        </nav>
        {/* `styles.colonne` ne porte AUCUN dessin : il sert d'ancre à la règle
            qui annule, au-dessus de 880 px, les pixels que le repli mobile
            ajoutait (voir `Ressource.module.css`). */}
        <div className={styles.colonne} style={H.COLONNE}>
          {avant.map((bloc, i) => (
            <Bloc key={`a${i}`} bloc={bloc} />
          ))}
          {/* CHAQUE PARTIE SE REPLIE AU TÉLÉPHONE, SAUF LA PREMIÈRE.
              C'est la règle de la maquette mobile, `MigenMobile.dc.html` :
              `isOpen = si < 1 || secOpen[...]`, la première section reste
              ouverte et les suivantes sont repliées sous un résumé.
              Mehdi, le 12/10 : « tu n'as pas déployé toute la maquette mobile,
              il n'y a que quelques pages ». Mesure du même jour : 1 567
              sections auraient dû se replier, 141 le faisaient, et les 41
              pages ressource n'en avaient aucune.
              Le titre `<h2>` EXISTANT sert d'en-tête : on n'en fabrique pas un
              second, et l'ancre `#mr-s<n>` du sommaire reste sur lui pour que
              les liens du sommaire continuent de tomber au bon endroit.
              Sur ordinateur rien ne change, le repli n'a lieu qu'en dessous de
              880 px. */}
          {parties.map((partie, k) => {
            const titre = (
              <h2 id={`mr-s${k + 1}`} style={H.TITRE2}>
                <span style={H.TITRE2_NUMERO}>{numero(k)}</span>
                {partie.titre}
              </h2>
            );
            const corps = (
              <>
                {partie.blocs.map((bloc, i) => (
                  <Bloc key={i} bloc={bloc} />
                ))}
              </>
            );
            return (
              <Fragment key={k}>
                {k === 0 ? (
                  <>
                    {titre}
                    {corps}
                  </>
                ) : (
                  /* LA BASCULE PORTE UNE ETIQUETTE, PAS LE `<h2>` DE LA PARTIE.
                     Le titre et son numero restent dans le corps du bloc, a leur
                     place et a la taille de leur capture ; l'etiquette n'existe
                     que sous 880 px et s'efface des que la partie est ouverte.
                     Voir `habillage.ETIQUETTE_SURTITRE` pour le pourquoi, et
                     `Ressource.module.css` pour le seuil. L'ancre `#mr-s<n>` du
                     sommaire reste sur le `<h2>` : les liens du sommaire tombent
                     au meme endroit qu'avant. */
                  <SectionPliableMobile
                    enTete={
                      <span data-mobile-seulement="" className={styles.etiquettePli}>
                        <span style={H.ETIQUETTE_SURTITRE}>{numero(k)}</span>
                        <span style={H.ETIQUETTE_TITRE}>{partie.titre}</span>
                      </span>
                    }
                    resume={resumeDeLaPartie(partie)}
                  >
                    {titre}
                    {corps}
                  </SectionPliableMobile>
                )}
                {k === 1 ? <BandeAppel /> : null}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
