import Image from "next/image";
import type { ReactNode } from "react";

import { resumeDe } from "@/components/site/blocs/resume-de-section";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import TexteRiche, { estCheminInterne } from "@/components/site/blocs/TexteRiche";
import { continueLeTitre } from "@/components/site/blocs/TitreEtSuite";
import { logoClient } from "@/components/site/casclients/vues-preuves";
import PastillesCocon from "@/components/site/cocon/PastillesCocon";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import AvecConversionMobile from "@/components/site/mobile/AvecConversionMobile";
import {
  CIBLE_CONTACT,
  rappelFinalVisible,
  varianteDe,
  type LibelleCible,
} from "@/components/site/mobile/conversion-donnees";
import RappelFinalMobile from "@/components/site/mobile/RappelFinalMobile";
import {
  coupePunchline,
  etiquetteEtude,
  fusionneLigne,
  majusculeInitiale,
  numerote,
} from "@/components/site/offre/texte-offre";
import { accrocheDuDeroule } from "@/components/site/offre/DerouleOffre";
import { accrocheDeLOffre } from "@/components/site/offre/PointsOffre";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";
import type { Preuve, Section, TypeSection } from "@/types/contenu";
import type { ContenuSecteurOffre } from "@/types/secteur";

import s from "./MobileSecteur.module.css";

/**
 * LE GABARIT « 08 SECTEUR » AU TÉLÉPHONE, TEL QUE LA MAQUETTE MOBILE V2 LE REND
 * (`maquette/mobile-v2/maquette/Migen - Mobile v2.dc.html`, `renderVals()`,
 * blocs `isDetails`/`isH`, `isKv`, `isOl`, `isTitle`, `isQ`).
 *
 * POURQUOI UN RENDU À PART, ET PAS LES ÉCRANS DE BUREAU RESTYLÉS. Les six écrans
 * de contenu de la page (problème, offre, déroulé, garanties, références,
 * questions) sont des composants d'AUTRES gabarits (offre, domaine, hub
 * d'offres) : les redessiner de l'extérieur, c'était battre leurs styles en
 * ligne un par un, et casser à leur prochaine retouche. Ici, la même donnée
 * (`contenu.sections`) est rendue une seconde fois, au dessin de la maquette,
 * sous `data-mobile-seulement` ; les écrans de bureau quittent l'écran sous
 * 881 px (`PageSecteur.module.css`, `.bureauSeulement`). CHAQUE TEXTE QU'ILS
 * PORTENT EST RENDU ICI, mot pour mot : sur-titres en sur-titre de carte,
 * titres de bureau en phrase clé, compteurs (« 7 points », « 6 étapes ») en
 * étiquette de liste, bouton « Démarrer par l'audit », lien « Poser ma
 * question ». Au-dessus de 880 px, rien de ce fichier n'existe à l'écran.
 * Les sur-titres de bureau (« Votre problématique », « Notre méthode »,
 * « Notre parti pris ») et la bande « 07 Appel » ne sont PAS repris : la
 * maquette n'en dessine aucun, et leur texte reste servi par l'écran de bureau.
 *
 * Les références ont leur rail à elles (`RailReferences`, dc.html
 * `isRefList`) ; `ReferencesOffre` reste servi par l'écran de bureau.
 *
 * Les cartes sont des `SectionPliableMobile` : servies OUVERTES (Google lit
 * tout), refermées au montage sous 881 px, sauf la première et les références,
 * que la maquette ouvre (dc.html, `dI++ < nOpen` et `isRef`).
 */

function sectionDeType<T extends TypeSection>(
  sections: readonly Section[],
  type: T,
): Extract<Section, { type: T }> | undefined {
  return sections.find((x) => x.type === type) as Extract<Section, { type: T }> | undefined;
}

/** La photo du haut de page : une photo que la page porte déjà sur bureau. */
export function photoDeTete(contenu: ContenuSecteurOffre): string | undefined {
  const preuves = sectionDeType(contenu.sections, "preuves");
  return (
    contenu.problemePhoto ??
    contenu.expertises?.[0]?.photo ??
    preuves?.preuves.find((p) => p.photo)?.photo ??
    undefined
  );
}

/** La photo 16/10 du haut de page (dc.html, `hero.hasImg`). */
export function PhotoTeteMobile({ photo }: { photo?: string }) {
  if (!photo) return null;
  return (
    <div data-mobile-seulement="" className={s.photoTete}>
      {/* `sizes` : au-dessus de 880 px le cadre n'est pas affiché. « 1vw » et
          non « 1px » : Next ne garde dans le srcset que les largeurs >= 640 x
          le plus petit vw cité ; avec « 1px » le bureau chargeait le 640 px,
          que Chrome resservait à la première carte « Expertises » de même
          photo (bureau différent de la référence). Avec « 1vw », 16 px. */}
      <Image
        src={photo}
        alt={altPhoto(photo)}
        fill
        priority
        sizes="(max-width: 880px) 100vw, 1vw"
        style={{ objectFit: "cover", objectPosition: cadragePhoto(photo, 16 / 10) }}
      />
    </div>
  );
}

/** Le bouton téléphone à côté de l'appel à l'action (dc.html, `hero.tel`). */
export function TelephoneMobile() {
  return (
    <a data-mobile-seulement="" href={TELEPHONE_SITE.href} className={s.telephone}>
      {TELEPHONE_SITE.affichage}
    </a>
  );
}

/* ------------------------------------------------------------- les blocs */

interface Ligne {
  cle: string;
  h?: ReactNode;
  d?: ReactNode;
}

/** « Libellé : texte » en petites cartes numérotées (dc.html, `isKv`). */
function ListeKv({ lignes, entete }: { lignes: readonly Ligne[]; entete?: ReactNode }) {
  return (
    <div className={s.kv}>
      {entete ? <div className={s.enteteListe}>{entete}</div> : null}
      {lignes.map((ligne, rang) => (
        <div key={ligne.cle} className={s.kvCarte}>
          <span className={s.kvNumero}>{numerote(rang)}</span>
          <div className={s.kvCorps}>
            {ligne.h ? <div className={s.kvTitre}>{ligne.h}</div> : null}
            {ligne.d ? <div className={ligne.h ? s.kvTexte : s.kvTitre}>{ligne.d}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Une carte blanche numérotée, son titre DANS la carte (dc.html, `isH`). */
function Carte({
  titre,
  resume,
  ouverte = false,
  children,
}: {
  titre: string;
  resume?: string;
  ouverte?: boolean;
  children: ReactNode;
}) {
  return (
    <SectionPliableMobile
      toujoursOuvert={ouverte}
      resume={resume}
      enTete={
        <h2 data-carte-titre="">{titre}</h2>
      }
    >
      {children}
    </SectionPliableMobile>
  );
}

/**
 * Le paragraphe d'ouverture de « Nos références » que le corpus de la maquette
 * porte et que la fiche n'a pas (`secteurs--pharmaceutique.md`, mot pour mot).
 * ponytail: table par chemin, à descendre dans `SectionPreuves` (champ
 * `chapeau`) le jour où une deuxième page en a un.
 */
const INTRO_REFERENCES: Readonly<Record<string, string>> = {
  "/secteurs/pharmaceutique/":
    "Nous ne publions pas de cas client pharmaceutique : nos clients du secteur ne nous y autorisent pas. Voici des environnements qui partagent vos exigences, hygiène, traçabilité et discipline documentaire, sur des cas réellement documentés.",
};

/**
 * Le paragraphe qui suit le tableau de « L'offre » dans le corpus de la
 * maquette (`secteurs--<secteur>.md`, mot pour mot). La fiche l'a perdu à
 * l'import (`offre.prose` absent) et le bureau ne le rend pas (sa capture non
 * plus, voir `PointsOffre`) ; la maquette mobile le rend sous les points et en
 * fait le résumé de la carte repliée (dc.html `teaseOf`, premier paragraphe).
 * ponytail: table par chemin, à retirer quand la fiche portera `offre.prose`.
 */
const PROSE_OFFRE: Readonly<Record<string, string>> = {
  "/secteurs/agroalimentaire/":
    "En appui, notre [bureau d'études](/offres/bureau-etudes/) chiffre les améliorations : mise en conformité d'une machine, reprise d'un poste goulot, automatisation d'une opération manuelle arrivée à sa limite.",
  "/secteurs/automobile/":
    "En appui, l'ingénierie de notre [bureau d'études](/offres/bureau-etudes/) chiffre les améliorations : reprise d'un poste goulot, mise en conformité d'une machine, adaptation d'une installation à un nouveau modèle.",
  "/secteurs/chimie/":
    "Pour les modifications, notre [bureau d'études](/offres/bureau-etudes/) prépare des dossiers techniques au niveau attendu par vos études de dangers et votre gestion des modifications.",
};

/**
 * Une puce « **accroche** : texte » telle que le corpus l'écrit, pour le résumé
 * d'une carte repliée (dc.html `teaseOf`, premier élément de liste). La fiche
 * a perdu le deux-points et mis une majuscule au texte (`suitAccroche`
 * absent) : on rend le séparateur du corpus et sa minuscule, sauf sigle.
 */
function puceDuCorpus(p: { accroche?: string; texte: string; suitAccroche?: boolean }): string {
  if (!p.accroche) return p.texte;
  if (p.suitAccroche) return `${p.accroche} ${p.texte}`;
  const texte = /^\p{Lu}\p{Ll}/u.test(p.texte) ? p.texte.charAt(0).toLowerCase() + p.texte.slice(1) : p.texte;
  return `${p.accroche} : ${texte}`;
}

/** Les logos clairs que la maquette inverse (dc.html `logoOf`, `lg.inv`). */
const LOGOS_INVERSES = /groupe-atlantic|ogf|orthus/;

/**
 * Le rail des références tel que la maquette le dessine (dc.html `isRefList`) :
 * photo et pastille du logo, titre, suite en minuscule, puis le libellé long
 * du corpus en lien (« Étude de cas DANONE : lignes de production → »). Aucun
 * texte neuf : titre, suite et libellé sont les champs de la fiche. La photo
 * est celle de la fiche ; sans elle, le fond gris de la maquette, jamais une
 * photo d'un autre chantier.
 */
function RailReferences({ preuves }: { preuves: readonly Preuve[] }) {
  const cartes = preuves.filter((p) => !!p.lienHref && estCheminInterne(p.lienHref));
  return (
    <div className={s.rail}>
      {cartes.map((preuve) => {
        const client = etiquetteEtude(preuve);
        const logo = client ? logoClient(client) : "";
        // La suite du corpus, sans sa ponctuation d'attache, point final
        // compris comme dans la maquette (« site de Steenvoorde. »).
        const nue = preuve.texte?.replace(/^\s*[:.,–—-]\s*/u, "").trim();
        const suite = nue && !/[.!?]$/.test(nue) ? `${nue}.` : nue;
        return (
          <div key={preuve.lienHref} className={s.carteRef}>
            <div className={s.carteRefPhoto}>
              {preuve.photo ? (
                <Image
                  src={preuve.photo}
                  alt={altPhoto(preuve.photo)}
                  fill
                  sizes="252px"
                  style={{ objectFit: "cover", objectPosition: cadragePhoto(preuve.photo, 252 / 118) }}
                />
              ) : null}
              {client ? (
                <span className={s.carteRefLogo}>
                  {logo ? (
                    <Image
                      src={logo}
                      alt={client}
                      width={64}
                      height={16}
                      unoptimized
                      style={LOGOS_INVERSES.test(logo) ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
                    />
                  ) : (
                    client
                  )}
                </span>
              ) : null}
            </div>
            <div className={s.carteRefCorps}>
              <div className={s.carteRefTitre}>
                <TexteRiche texte={preuve.titre} />
              </div>
              {suite ? (
                <div className={s.carteRefSuite}>
                  <TexteRiche texte={suite} />
                </div>
              ) : null}
              <a href={preuve.lienHref} className={s.carteRefLien}>
                {preuve.lienLibelle ?? "Toutes nos réalisations"} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ la page */

export interface ProprietesSectionsMobilesSecteur {
  contenu: ContenuSecteurOffre;
  chemin: string;
  photoHeros?: string;
  bouton?: LibelleCible;
}

/**
 * Les cinq cartes numérotées et leur cadence de conversion, la FAQ en liste,
 * puis l'appel « 07 » en bandeau. Ordre de la maquette : 01 Le problème,
 * 02 L'offre, photo + CTA, 03 Le déroulé, 04 Ce que nous garantissons,
 * 05 Nos références, bandeau « Une question sur votre site ? », Questions
 * fréquentes.
 */
export default function SectionsMobilesSecteur({ contenu, chemin, photoHeros, bouton }: ProprietesSectionsMobilesSecteur) {
  const { sections } = contenu;
  const probleme = sectionDeType(sections, "probleme");
  const offre = sectionDeType(sections, "offre");
  const deroule = sectionDeType(sections, "deroule");
  const garanties = sectionDeType(sections, "garanties");
  const preuves = sectionDeType(sections, "preuves");
  const objections = sectionDeType(sections, "objections");
  const ctaFinal = sectionDeType(sections, "ctaFinal");
  const points = offre?.lignes.map(fusionneLigne) ?? [];
  const prose = offre?.prose?.length
    ? offre.prose.map((p) => [p.accroche && `**${p.accroche}**`, p.texte].filter(Boolean).join(" "))
    : PROSE_OFFRE[chemin]
      ? [PROSE_OFFRE[chemin]]
      : [];
  const complements = (contenu.complementOffre ?? []).filter((b) => b.titre || b.texte || b.puces?.length);
  const titreDeroule = contenu.derouleTitre ?? "Un appel. Un plan. Une ligne qui repart.";

  const cartes: ReactNode[] = [
    probleme ? (
      <Carte
        key="probleme"
        titre="Le problème"
        ouverte
        resume={probleme.punchline || resumeDe(probleme.puces.map((p) => p.accroche ?? p.texte))}
      >
        <p className={s.phraseCle}>
          {[coupePunchline(probleme.punchline).titre, coupePunchline(probleme.punchline).suite].filter(Boolean).join(" ")}
        </p>
        <ListeKv
          lignes={probleme.puces.map((p) => ({
            cle: p.accroche ?? p.texte,
            h: p.accroche ? <TexteRiche texte={p.accroche} /> : undefined,
            d: <TexteRiche texte={p.texte} />,
          }))}
        />
      </Carte>
    ) : null,

    offre ? (
      /* L'accroche de la V3 (`accrocheDeLOffre`) : la première cellule du
         tableau, puis seulement la prose qui le suit. */
      <Carte key="offre" titre="L’offre" resume={accrocheDeLOffre(offre, [...prose, complements[0]?.texte])}>
        <p className={s.phraseCle}>Ce que nous faisons, et ce que ça change pour vous</p>
        {/* Sans compteur « N points » : retiré à la demande de Mehdi le 15/10. */}
        <ListeKv
          lignes={points.map((p) => ({
            cle: p.titre,
            h: <TexteRiche texte={p.titre} />,
            d: (
              <>
                {p.complement ? (
                  <>
                    <TexteRiche texte={p.complement} />{" "}
                  </>
                ) : null}
                <TexteRiche texte={p.benefice} />
              </>
            ),
          }))}
        />
        {prose.map((texte) => (
          <p key={texte} className={s.texte}>
            <TexteRiche texte={texte} />
          </p>
        ))}
        {complements.map((bloc, rang) => (
          <div key={bloc.titre ?? `complement-${rang}`}>
            {bloc.titre ? <h3 className={s.intertitre}>{bloc.titre}</h3> : null}
            {bloc.texte ? <p className={s.texte}>{bloc.texte}</p> : null}
            {bloc.puces?.length ? (
              <ul className={s.puces}>
                {bloc.puces.map((puce) => (
                  <li key={puce.accroche ?? puce.texte}>
                    {puce.accroche ? <strong>{puce.accroche} </strong> : null}
                    {puce.texte}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </Carte>
    ) : null,

    deroule ? (
      <Carte key="deroule" titre="Le déroulé" resume={accrocheDuDeroule(deroule)}>
        <p className={s.phraseCle}>{titreDeroule}</p>
        <div className={s.enteteListe}>
          <span>{deroule.etapes.length}</span> étapes
        </div>
        <ol className={s.frise}>
          {deroule.etapes.map((etape, rang) => (
            <li key={etape.titre}>
              <span className={s.friseNumero}>{numerote(rang)}</span>
              <span className={s.friseTexte}>
                {etape.texte && continueLeTitre(etape.texte) ? (
                  <>
                    <strong>{etape.titre}</strong>
                    <TexteRiche texte={etape.texte} />
                  </>
                ) : (
                  <>
                    <strong className={s.friseTitre}>{etape.titre}</strong>
                    {etape.texte ? <TexteRiche texte={majusculeInitiale(etape.texte)} /> : null}
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
        <div className={s.rangeeBouton}>
          <a href="#besoin" className={s.bouton}>
            Démarrer par l’audit
          </a>
        </div>
      </Carte>
    ) : null,

    garanties ? (
      <Carte
        key="garanties"
        titre="Ce que nous garantissons"
        resume={garanties.puces[0] ? puceDuCorpus(garanties.puces[0]) : undefined}
      >
        <ListeKv
          lignes={garanties.puces.map((p) => ({
            cle: p.accroche ?? p.texte,
            h: p.accroche,
            d: p.suitAccroche ? p.texte : majusculeInitiale(p.texte),
          }))}
        />
      </Carte>
    ) : null,

    preuves?.preuves.length ? (
      <Carte key="references" titre="Nos références" ouverte>
        {INTRO_REFERENCES[chemin] ? <p className={s.chapeau}>{INTRO_REFERENCES[chemin]}</p> : null}
        <RailReferences preuves={preuves.preuves} />
      </Carte>
    ) : null,
  ].filter(Boolean);

  return (
    <div data-mobile-seulement="" className={s.racine}>
      <AvecConversionMobile chemin={chemin} gabarit="08" photoHeros={photoHeros} bouton={bouton} rappelFinal={false}>
        {cartes}
      </AvecConversionMobile>

      {objections?.questions.length ? (
        <section className={s.faq}>
          {/* dc.html `isTitle` : le seul titre « Questions fréquentes ». Le
              titre et le lien de bureau restent servis par `QuestionsPhoto`. */}
          <h2 data-faq-titre="">Questions fréquentes</h2>
          <div data-faq-liste="">
            {objections.questions.map((q) => (
              <details key={q.question} name="faq-secteur">
                <summary>
                  <h3>
                    <TexteRiche texte={q.question} />
                  </h3>
                  <span aria-hidden="true">+</span>
                </summary>
                <div>
                  <p>
                    <TexteRiche texte={q.reponse ?? ""} />
                  </p>
                </div>
              </details>
            ))}
            {/* La 7e question de la maquette : la question de clôture du
                corpus, sa réponse est l'appel et le téléphone du corpus
                (dc.html, `x.faq`, dernier élément). */}
            {ctaFinal?.question ? (
              <details name="faq-secteur">
                <summary>
                  <h3>
                    <TexteRiche texte={ctaFinal.question} />
                  </h3>
                  <span aria-hidden="true">+</span>
                </summary>
                <div>
                  <p>
                    <a href={ctaFinal.href ?? CIBLE_CONTACT}>{ctaFinal.bouton}</a> ·{" "}
                    <a href={TELEPHONE_SITE.href}>{TELEPHONE_SITE.affichage}</a>
                  </p>
                  {ctaFinal.rappel ? <p>{ctaFinal.rappel}</p> : null}
                </div>
              </details>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* dc.html L134 puis L138 : « Dans la même rubrique », puis le rappel
          final « Être rappelé ». Les écrans de bureau sans dessin mobile
          (`annexe` de `PageSecteur`) viennent APRÈS, repliés. */}
      <PastillesCocon chemin={chemin} />
      {rappelFinalVisible(chemin) ? <RappelFinalMobile variante={varianteDe(chemin, "08")} /> : null}
    </div>
  );
}
