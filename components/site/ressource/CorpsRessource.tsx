import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import type { BlocRessource, PartieRessource } from "@/types/ressource";

import styles from "./Ressource.module.css";
import * as H from "./habillage";

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
        <div style={H.TABLEAU_CADRE}>
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
      <div style={H.BANDE_TEXTE}>
        <strong style={{ color: "#fff", fontWeight: 600 }}>{H.COPIE.bandeQuestion}</strong>
        {H.COPIE.bandeSuite}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={H.CONTACT} style={H.BANDE_BOUTON}>
          {H.COPIE.decrire}
        </Link>
        <a href={H.TELEPHONE.href} style={H.BANDE_TELEPHONE}>
          {H.TELEPHONE.libelle}
        </a>
      </div>
    </div>
  );
}

const numero = (i: number) => String(i + 1).padStart(2, "0");

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
        <div style={H.COLONNE}>
          {avant.map((bloc, i) => (
            <Bloc key={`a${i}`} bloc={bloc} />
          ))}
          {parties.map((partie, k) => (
            <Fragment key={k}>
              <h2 id={`mr-s${k + 1}`} style={H.TITRE2}>
                <span style={H.TITRE2_NUMERO}>{numero(k)}</span>
                {partie.titre}
              </h2>
              {partie.blocs.map((bloc, i) => (
                <Bloc key={i} bloc={bloc} />
              ))}
              {k === 1 ? <BandeAppel /> : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
