import Link from "next/link";

import { FormulaireContact } from "@/components/formulaire/FormulaireContact";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  ANCRE_FORMULAIRE,
  LARGEUR,
  SECTION,
  SURTITRE,
  lienTelephone,
} from "@/components/site/blocs/habillage";
import type {
  SectionCta,
  SectionCtaFinal,
  SectionObjections,
  SectionPreuves,
} from "@/types/contenu";
import type { CarteLien } from "@/types/secteur";

import { CHROME, HUBS, clientDePreuve, photoDeRang } from "./contenu-maquette";
import { cibleSure } from "./PucesLiens";
/* BOUTON et COLLANT sont déclarés dans la première moitié : le bouton orange est
   le même qu'au héros, et la colonne collante est le motif de « 03 Problème » et
   « 05 Déroulé » autant que de « 09 Questions ». Importés, pas redéclarés. */
import { BOUTON, COLLANT } from "./habillage-gabarit08";
import * as H from "./habillage-gabarit08-preuve";
import styles from "./PageSecteur.module.css";

/**
 * Les SIX dernières sections du gabarit 08 SECTEUR : réassurance, preuve,
 * conversion. Suite de `BlocsSecteur.tsx`, même règle.
 *
 * « Réassurance », « 07 Appel », « 08 Références », « 09 Questions »,
 * « Maillage », « 10 Appel final ». L'ordre et le tri restent décidés par
 * `PageSecteur.tsx` : ce fichier ne fait que dessiner.
 */

/** Le surtitre orange, motif commun à cinq de ces six sections. */
function Surtitre({ children }: { children: string }) {
  return <div style={SURTITRE}>{children}</div>;
}

/* ------------------------------------------------------- Réassurance */

/**
 * La bande de réassurance, INVARIANTE d'une page de secteur à l'autre.
 *
 * ELLE NE LIT PAS LE CORPUS, et c'est assumé. Son texte est écrit en dur dans le
 * fichier de maquette validé par le client : certifications, taux de sélection,
 * astreinte, quatre agences, dix hubs. C'est du chrome de gabarit, au même titre
 * que l'en-tête et le pied de page, et non une section de contenu dont le corpus
 * pourrait décider. La règle « une section que le corpus n'alimente pas ne se
 * rend pas » vise les sections de CONTENU : appliquée ici, elle retirerait des
 * treize pages un panneau que la maquette dessine, pour un texte qui ne manque
 * nulle part puisque le client l'a écrit lui-même.
 *
 * Les chiffres sont ceux du contrat (`CLAUDE.md` section 9) : quatre agences,
 * dix hubs. Rien n'est inventé, et `verification-secteur.tsx` relit chaque
 * chaîne dans le fichier de maquette.
 */
export function Reassurance() {
  return (
    <section style={SECTION}>
      <div
        className={styles.deuxColonnes}
        data-reveal=""
        style={{
          ...LARGEUR,
          display: "grid",
          gridTemplateColumns: H.REASSURANCE_GRILLE,
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <div style={H.REASSURANCE_CARTE}>
          <div style={{ ...SURTITRE, marginBottom: 22 }}>
            {CHROME.certificationsSurtitre}
          </div>
          <div style={H.CERTIF_GRILLE}>
            {CHROME.certifications.map((certif) => (
              <div key={certif.nom} style={H.CERTIF_CARTE}>
                <div style={H.CERTIF_NOM}>{certif.nom}</div>
                <div style={H.CERTIF_TEXTE}>{certif.texte}</div>
              </div>
            ))}
          </div>
          <p style={H.CERTIF_MENTION}>{CHROME.certificationsMention}</p>
        </div>

        <div style={H.QUI_CARTE}>
          <div style={{ ...SURTITRE, marginBottom: 0 }}>
            {CHROME.quiSurtitre}
          </div>
          <div style={H.QUI_BANDE}>
            <span style={H.QUI_CHIFFRE}>{CHROME.quiChiffre}</span>
            <span style={H.QUI_TEXTE}>{CHROME.quiTexte}</span>
          </div>
          <div style={H.QUI_PAIRE}>
            {CHROME.quiFaits.map((fait) => (
              <div key={fait.titre}>
                <div style={H.QUI_FAIT_TITRE}>{fait.titre}</div>
                <div style={H.QUI_FAIT_TEXTE}>{fait.texte}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={H.HUBS_TITRE}>{CHROME.hubsTitre}</div>
            <div style={H.HUBS_RANGEE}>
              {HUBS.map((hub) => (
                <span key={hub} style={H.HUB_PUCE}>
                  {hub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 07 Appel */

export function Appel({
  cta,
  telephone,
}: {
  cta: SectionCta;
  telephone: string;
}) {
  /* Le rappel du corpus contient le numéro en clair. La maquette le coupe en
     trois pour que le numéro devienne cliquable au milieu de la phrase, sans
     réécrire celle-ci. Sans numéro dedans, la phrase sort entière. */
  const indice = telephone ? cta.rappel?.indexOf(telephone) ?? -1 : -1;
  const avant = indice >= 0 ? cta.rappel!.slice(0, indice) : (cta.rappel ?? "");
  const apres = indice >= 0 ? cta.rappel!.slice(indice + telephone.length) : "";

  const cible =
    cta.href && cibleSure(cta.href) ? cta.href : ANCRE_FORMULAIRE;

  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="" style={H.APPEL_BANDE}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={H.APPEL_QUESTION}>{cta.question}</div>
            {cta.rappel ? (
              <div style={H.APPEL_RAPPEL}>
                {avant}
                {indice >= 0 ? (
                  <a
                    href={lienTelephone(telephone)}
                    style={{ fontWeight: 600, color: "var(--ink)" }}
                  >
                    {telephone}
                  </a>
                ) : null}
                {apres}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {cta.bouton ? (
              <a
                href={cible}
                className={styles.boutonPrincipal}
                style={BOUTON}
              >
                {cta.bouton}
              </a>
            ) : null}
            {telephone ? (
              <a href={lienTelephone(telephone)} style={H.APPEL_TEL}>
                {telephone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 08 Références */

export function References({ preuves }: { preuves: SectionPreuves }) {
  /* Une preuve sans cible sûre se rend en CARTE NON CLIQUABLE : son texte est
     du corpus et il reste, mais aucun lien n'est fabriqué vers une cible qu'on
     n'a pas. C'est la même règle que `PucesLiens`, appliquée à une carte. */
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <Surtitre>{CHROME.refsSurtitre}</Surtitre>
          <h2 style={H.REFS_TITRE2}>{CHROME.refsTitre}</h2>
          <div className={styles.troisColonnes} style={H.REFS_GRILLE}>
            {preuves.preuves.map((preuve, i) => {
              const lien =
                preuve.lienHref && cibleSure(preuve.lienHref)
                  ? preuve.lienHref
                  : null;
              const client = clientDePreuve(preuve.lienLibelle);
              const corps = (
                <>
                  <div style={H.REF_PHOTO}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoDeRang(i)}
                      alt=""
                      width={380}
                      height={180}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "saturate(var(--sat)) contrast(1.05)",
                      }}
                    />
                  </div>
                  <div style={H.REF_CORPS}>
                    {client ? (
                      <span style={H.REF_CLIENT}>{client}</span>
                    ) : null}
                    <span style={H.REF_TITRE}>{preuve.titre}</span>
                    {preuve.texte ? (
                      <span style={H.REF_TEXTE}>
                        <TexteRiche texte={preuve.texte} />
                      </span>
                    ) : null}
                    {lien && preuve.lienLibelle ? (
                      <span style={H.REF_LIBELLE}>
                        {preuve.lienLibelle}{" "}
                        <span style={{ color: "var(--acc)" }} aria-hidden="true">
                          &rarr;
                        </span>
                      </span>
                    ) : null}
                  </div>
                </>
              );

              return lien ? (
                <Link
                  key={preuve.titre}
                  href={lien}
                  prefetch={false}
                  className={styles.carteLevee}
                  style={H.REF_CARTE}
                >
                  {corps}
                </Link>
              ) : (
                <div key={preuve.titre} style={H.REF_CARTE}>
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

/* -------------------------------------------------------- 09 Questions */

export function Questions({
  objections,
  telephone,
}: {
  objections: SectionObjections;
  telephone: string;
}) {
  return (
    <section style={SECTION}>
      <div
        className={styles.deuxColonnes}
        data-reveal=""
        style={{
          ...LARGEUR,
          display: "grid",
          gridTemplateColumns: H.QUESTIONS_GRILLE,
          gap: 56,
          alignItems: "start",
        }}
      >
        <div className={styles.collant} style={COLLANT}>
          <Surtitre>{CHROME.questionsSurtitre}</Surtitre>
          <h2 style={H.QUESTIONS_TITRE2}>{CHROME.questionsTitre}</h2>
          <div style={H.QUESTIONS_RELANCE}>{CHROME.questionsRelance}</div>
          {telephone ? (
            <a href={lienTelephone(telephone)} style={H.QUESTIONS_TEL}>
              {telephone}
            </a>
          ) : null}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {objections.questions.map((question) => (
            <div key={question.question} style={H.CARTE_QUESTION}>
              <div style={H.QUESTION_TITRE}>{question.question}</div>
              <p style={H.QUESTION_REPONSE}>
                <TexteRiche texte={question.reponse} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Maillage */

export function Maillage({ cartes }: { cartes: readonly CarteLien[] }) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div data-reveal="">
          <Surtitre>{CHROME.maillageSurtitre}</Surtitre>
          <div style={H.MAILLAGE_GRILLE}>
            {cartes.map((carte, i) => (
              <Link
                key={carte.href}
                href={carte.href}
                prefetch={false}
                className={styles.carteLevee}
                style={H.MAILLAGE_CARTE}
              >
                <div style={H.MAILLAGE_PHOTO}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={carte.image ?? photoDeRang(i, 3)}
                    alt=""
                    width={320}
                    height={130}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "saturate(var(--sat))",
                    }}
                  />
                </div>
                <div style={H.MAILLAGE_CORPS}>
                  <div style={H.MAILLAGE_ENTETE}>
                    <span style={H.MAILLAGE_TITRE}>{carte.titre}</span>
                    <span style={H.MAILLAGE_FLECHE} aria-hidden="true">
                      &rarr;
                    </span>
                  </div>
                  {carte.texte ? (
                    <span style={H.MAILLAGE_TEXTE}>{carte.texte}</span>
                  ) : null}
                  <span style={H.MAILLAGE_CHEMIN}>{carte.href}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ 10 Appel final */

export function AppelFinal({
  ctaFinal,
  intitule,
  delai,
  telephone,
  formulaire,
}: {
  ctaFinal: SectionCtaFinal;
  /** Le titre de la carte du formulaire : c'est le CTA du héros, `p.cta`. */
  intitule: string;
  delai: string;
  telephone: string;
  /** Identifiant d'analyse de la soumission, repris par HubSpot. */
  formulaire: string;
}) {
  return (
    <section style={H.FINAL_SECTION}>
      <div
        className={styles.panneauRembourre}
        data-reveal=""
        style={H.FINAL_PANNEAU}
      >
        <div style={H.FINAL_LUEUR} />
        <div
          className={styles.deuxColonnes}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: H.FINAL_GRILLE,
            gap: 44,
            alignItems: "center",
            textAlign: "left",
          }}
        >
          <div>
            <Surtitre>{CHROME.finalSurtitre}</Surtitre>
            {ctaFinal.question ? (
              <h2 style={H.FINAL_TITRE2}>{ctaFinal.question}</h2>
            ) : null}
            {delai ? <p style={H.FINAL_TEXTE}>{delai}</p> : null}
            {telephone ? (
              <a
                href={lienTelephone(telephone)}
                className={styles.boutonSombre}
                style={H.FINAL_TEL}
              >
                {telephone}
              </a>
            ) : null}
          </div>

          {/* L'ancre `#formulaire` de TOUTE la page est ici : c'est la cible des
              boutons du héros et de « 07 Appel ». */}
          <div id="formulaire" style={H.FINAL_CARTE}>
            <div style={H.FINAL_CARTE_ENTETE}>
              <div style={H.FINAL_CARTE_TITRE}>{intitule}</div>
              <div style={H.FINAL_CARTE_MENTION}>{CHROME.finalMention}</div>
            </div>
            {/*
              LE FORMULAIRE EST CELUI DU SITE, pas une copie du sien.
              `components/formulaire/FormulaireContact.tsx` porte déjà la
              validation, l'envoi vers HubSpot, la capture UTM et l'état
              d'accusé de réception, et `scripts/verifie-formulaire.tsx` le
              compare champ par champ à la maquette. Redessiner les sept champs
              ici aurait donné un second formulaire à maintenir et un seul des
              deux branché.
            */}
            <FormulaireContact formulaire={formulaire} />
          </div>
        </div>
      </div>
    </section>
  );
}
