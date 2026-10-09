import type { ReactNode } from "react";
import Link from "next/link";

import LienReglages from "@/components/consentement/LienReglages";
import { TELEPHONE_SITE } from "@/components/site/entete-donnees";
import { CONSERVATION_JOURS, FINALITES, LIBELLES } from "@/lib/consentement";

import styles from "./PolitiqueConfidentialite.module.css";

/**
 * Politique de confidentialité, écran « Confidentialité » de la maquette
 * (lignes 7799 à 7851 de `maquette/accueil-rendu.html`).
 *
 * POURQUOI CETTE PAGE EST UNE ROUTE STATIQUE et non une ligne de la table
 * `pages` : elle n'est pas un gabarit de vente en dix sections, c'est une mise
 * en page unique, un sommaire collant à côté d'un article. Aucune autre page ne
 * la réemploie, comme l'accueil.
 *
 * POURQUOI ELLE NE PEUT PAS ÊTRE UN SIMPLE COPIER-COLLER DE LA MAQUETTE : la
 * mention RGPD de `components/formulaire/FormulaireContact.tsx` y renvoie depuis
 * CHAQUE formulaire du site, en annonçant « droits et durées de conservation ».
 * Ce que cette page affirme doit donc correspondre à ce que le code fait. Trois
 * endroits de la maquette ne le faisaient pas, et sont corrigés ici :
 *
 *   · la liste des champs collectés nommait « localisation du site, nature du
 *     besoin, délai souhaité et volume estimé », quatre champs que le
 *     formulaire n'a pas (voir `CHAMPS_CONTACT` dans
 *     `components/formulaire/validation.ts`) ;
 *   · les finalités soumises au consentement s'arrêtaient à la mesure
 *     d'audience, alors que le bandeau en demande QUATRE. Elles ne sont plus
 *     recopiées mais LUES dans `lib/consentement.ts`, la même constante que le
 *     bandeau affiche : la page ne peut plus dériver de ce qui est réellement
 *     demandé, ni oublier un destinataire ;
 *   · le partage HubSpot / table `leads` n'était pas dit, alors que c'est le
 *     fait le plus structurant du traitement (voir `lib/leads.ts`).
 *
 * Tout le reste du texte est celui de la maquette.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * 09/10, LES ÉTIQUETTES DE CHANTIER SONT RETIRÉES. Audit de Nathan Jorez :
 * la page portait un bandeau « Ce texte est en cours de validation juridique »
 * et cinq réserves adressées au projet, pas au visiteur. Une politique de
 * confidentialité qui s'annonce elle-même non validée ne vaut pas mieux que pas
 * de politique, et elle est citée par la mention RGPD de CHAQUE formulaire.
 *
 *   1. LE BANDEAU EST RETIRÉ. Décision de Mehdi, 09/10.
 *   2. LE POINT DE CONTACT N'EST PLUS « à compléter ». Aucune adresse de
 *      courriel n'est connue, et on n'en invente pas. Les deux endroits qui la
 *      réclamaient (responsable du traitement, exercice des droits) renvoient
 *      vers le formulaire de `/contact/` et donnent le numéro du site, qui sont
 *      deux moyens de contact réels et vérifiables au dépôt.
 *   3. LES DURÉES NE PORTENT PLUS « restent à valider » NI « restent à
 *      arbitrer ». Ces réserves étaient justes et elles sont CONSERVÉES, à leur
 *      place : `docs/RESERVES-CONTENU.md` et l'en-tête de `lib/consentement.ts`
 *      pour la durée du choix. Les écrire au visiteur ne lui apprenait rien
 *      d'utile et décrédibilisait tout le reste de la page.
 *
 * CE QUE CELA NE RÈGLE PAS, et qui reste à la main de Mehdi : les trois durées
 * de conservation (3 ans, 2 ans, durée légale) sont celles de la maquette et
 * personne ne les a validées ; la purge de la preuve de consentement à six mois
 * est écrite en commentaire dans `supabase/migrations/0002_consentement.sql`,
 * donc non armée. La page annonce la politique, le code ne l'applique pas encore.
 * ────────────────────────────────────────────────────────────────────────────
 */

export const TITRE_H1 = "Politique de confidentialité";

/** Le meta title ne reprend JAMAIS le H1 : l'un se lit dans les résultats, l'autre sur la page. */
export const TITRE_SEO = "Données personnelles et cookies sur migen.fr";

export const DESCRIPTION_SEO =
  "Ce que Migen collecte quand vous remplissez un formulaire, qui le reçoit, " +
  "combien de temps il est conservé, et comment exercer vos droits.";

/** Seule cible interne de la page. Vérifiée à 200 avant d'être posée. */
export const CHEMIN_MENTIONS = "/mentions-legales/";

/**
 * Le moyen d'écrire au responsable du traitement, 09/10.
 *
 * La maquette écrit « Contact : [adresse courriel du référent données] » et
 * « Écrivez à [adresse courriel] ». AUCUNE adresse n'est connue, et inventer
 * celle d'un point de contact RGPD serait pire que de ne pas en donner : le
 * visiteur écrirait dans le vide. Le formulaire de `/contact/` et le numéro du
 * site sont deux voies réelles, vérifiables au dépôt, et c'est ce que les deux
 * endroits portent désormais.
 *
 * À REMPLACER par l'adresse du référent dès que Mehdi la fournit : l'article 13
 * du RGPD demande un point de contact du responsable du traitement, et un
 * formulaire commercial n'en est qu'un substitut acceptable.
 */
export const CHEMIN_CONTACT = "/contact/";

/**
 * Date de la dernière révision du TEXTE de la page, pas de son code. La maquette
 * laisse « Dernière mise à jour : à compléter » ; une politique de
 * confidentialité sans date ne dit pas au visiteur ce qu'il lit. À REMETTRE À
 * JOUR À CHAQUE FOIS QUE LE TEXTE CHANGE, et seulement alors.
 */
export const DATE_MISE_A_JOUR = "9 octobre 2026";

const LARGEUR = { maxWidth: "1200px", margin: "0 auto" } as const;

const H2 = {
  font: "600 calc(24px * var(--ts))/1.25 var(--ft)",
  letterSpacing: "-.03em",
  margin: "0 0 14px",
  scrollMarginTop: "100px",
} as const;

const P = {
  font: "400 16px/1.75 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 22px",
} as const;

/** Même paragraphe, mais suivi d'un second : la maquette resserre l'interligne. */
const P_SUIVI = { ...P, margin: "0 0 12px" } as const;

const LIGNE = {
  display: "flex",
  gap: "11px",
  font: "400 16px/1.6 var(--fb)",
  color: "var(--ink1)",
} as const;

const COCHE = { color: "var(--acc)", flex: "none" } as const;

interface Partie {
  id: string;
  titre: string;
  corps: ReactNode;
}

/** Une coche de liste. Décorative : le texte de la ligne porte le sens. */
function Coche() {
  return (
    <span style={COCHE} aria-hidden="true">
      ✓
    </span>
  );
}

/**
 * Les six parties, dans l'ordre de la maquette. Le sommaire et les titres sont
 * rendus depuis CETTE liste et pas saisis deux fois : un sommaire recopié finit
 * par annoncer une section qui n'existe plus.
 */
const PARTIES: readonly Partie[] = [
  {
    id: "p1",
    titre: "Responsable du traitement",
    corps: (
      /* 09/10 : LE RESPONSABLE DU TRAITEMENT EST NOMMÉ PAR SA DÉNOMINATION
         SOCIALE. La maquette écrit « migen© », une marque. L'article 13 du RGPD
         demande l'identité du responsable, et une marque n'est pas une personne
         morale : on ne sait pas à qui on écrit. La dénomination vient de
         `docs/IDENTITE-LEGALE.md` (extrait Pappers transmis par Mehdi, recoupé
         avec l'annuaire des entreprises de l'État, voir les mentions légales).
         L'ADRESSE, elle, reste celle de la maquette mot pour mot, et le contrôle
         continue de l'exiger ainsi. */
      <p style={P}>
        MIGEN SERVICE (migen©), 1 rue des Vergers, Bâtiment 3, 69760 Limonest.
        Pour toute question sur vos données,{" "}
        {/* Souligné, comme la mention RGPD du formulaire : le style global des
            liens ne pose ni soulignement ni couleur distincte. */}
        <Link href={CHEMIN_CONTACT} className="underline">
          écrivez-nous depuis la page Contact
        </Link>{" "}
        ou appelez le {TELEPHONE_SITE.affichage}.
      </p>
    ),
  },
  {
    id: "p2",
    titre: "Données collectées",
    corps: (
      <>
        <p style={P_SUIVI}>
          Via le formulaire «&nbsp;Décrire mon besoin&nbsp;»&nbsp;: entreprise,
          prénom, nom, adresse e-mail, téléphone avec son indicatif, et le
          message que vous rédigez.
        </p>
        <p style={P_SUIVI}>
          Votre demande est enregistrée dans{" "}
          <strong style={{ fontWeight: 600 }}>HubSpot</strong>, notre outil
          commercial, en qualité de sous-traitant&nbsp;: c&apos;est le seul
          endroit où vivent votre nom, votre adresse e-mail, votre téléphone et
          votre message. La copie que nous gardons de notre côté ne porte aucune
          de ces données, seulement la page et la campagne qui ont produit la
          demande.
        </p>
        <p style={P}>
          Via les candidatures&nbsp;: CV, parcours, habilitations, mobilité. Les
          candidatures sont collectées et traitées dans{" "}
          <strong style={{ fontWeight: 600 }}>Teamtailor</strong>, notre outil de
          recrutement, en qualité de sous-traitant. Aucune donnée sensible
          n&apos;est demandée.
        </p>
      </>
    ),
  },
  {
    id: "p3",
    titre: "Finalités & bases légales",
    corps: (
      <>
        <div style={{ display: "grid", gap: "10px", margin: "0 0 22px" }}>
          <div style={LIGNE}>
            <Coche />
            Répondre à une demande commerciale&nbsp;: intérêt légitime
          </div>
          <div style={LIGNE}>
            <Coche />
            Étudier une candidature&nbsp;: intérêt légitime
          </div>
          {/* Les quatre finalités du bandeau, avec leurs destinataires, lues
              dans la constante que le bandeau affiche. Recopiées ici, elles
              auraient vieilli le jour où une finalité change. */}
          {FINALITES.map((finalite) => (
            <div key={finalite} style={LIGNE}>
              <Coche />
              <span>
                {LIBELLES[finalite].titre}&nbsp;: consentement, révocable à tout
                moment. {LIBELLES[finalite].destinataires.length > 1
                  ? "Destinataires"
                  : "Destinataire"}
                &nbsp;: {LIBELLES[finalite].destinataires.join(", ")}
              </span>
            </div>
          ))}
        </div>
        <p style={P}>
          Aucune de ces quatre finalités n&apos;est active avant votre accord, et
          refuser n&apos;enlève rien au site&nbsp;: les formulaires fonctionnent
          et vous obtenez une réponse.
        </p>
      </>
    ),
  },
  {
    id: "p4",
    titre: "Durées de conservation",
    corps: (
      <>
        {/* 09/10 : « Ces trois durées restent à valider » retiré. La réserve
            est juste et elle est conservée dans `docs/RESERVES-CONTENU.md`,
            § 2 : aucune purge n'applique ces durées, qui vivent dans HubSpot.
            Elle n'a rien à dire au visiteur, à qui la page annonce une
            politique, pas l'état d'avancement du chantier. */}
        <p style={P_SUIVI}>
          Prospects&nbsp;: 3 ans à compter du dernier contact. Candidatures non
          retenues&nbsp;: 2 ans. Documents contractuels&nbsp;: durée légale
          applicable.
        </p>
        {/* 09/10 : « elles restent à arbitrer » retiré, même raison. La réserve
            sur CONSERVATION_JOURS vit en tête de `lib/consentement.ts`, et celle
            sur la purge de la preuve dans `0002_consentement.sql`. Les 180 jours
            annoncés ici sont, eux, EXACTEMENT ce que le code pose. */}
        <p style={P}>
          Votre choix de traceurs est conservé {CONSERVATION_JOURS} jours dans un
          cookie déposé par ce site, et la preuve de ce choix six mois de notre
          côté. Cette preuve ne porte ni votre nom, ni votre adresse IP.
        </p>
      </>
    ),
  },
  {
    id: "p5",
    titre: "Vos droits",
    corps: (
      <p style={P}>
        Vous disposez d&apos;un droit d&apos;accès, de rectification,
        d&apos;effacement, de limitation, d&apos;opposition et de portabilité.{" "}
        <Link href={CHEMIN_CONTACT} className="underline">
          Écrivez-nous depuis la page Contact
        </Link>{" "}
        ou appelez le {TELEPHONE_SITE.affichage}&nbsp;; une réponse vous sera
        apportée sous un mois. Vous pouvez également saisir la CNIL.
      </p>
    ),
  },
  {
    id: "p6",
    titre: "Cookies",
    corps: (
      <>
        <p style={P_SUIVI}>
          Seuls les cookies strictement nécessaires sont déposés sans
          consentement. Les cookies de mesure d&apos;audience ne sont activés
          qu&apos;après acceptation via le bandeau. Vous pouvez modifier votre
          choix à tout moment.
        </p>
        {/* Le bouton du pied de page, réemployé : une seule implémentation du
            réglage, et cette page reste un composant serveur. */}
        <p style={{ ...P, color: "var(--acc-ink)" }}>
          <LienReglages />
        </p>
      </>
    ),
  },
];

export default function PolitiqueConfidentialite() {
  return (
    <main style={{ paddingTop: "96px" }}>
      <section style={{ ...LARGEUR, padding: "70px 40px 0" }}>
        <h1
          style={{
            font: "600 calc(clamp(32px,3.6vw,52px) * var(--ts))/1.06 var(--ft)",
            letterSpacing: "-.04em",
            margin: 0,
            maxWidth: "22ch",
            textWrap: "balance",
          }}
        >
          {TITRE_H1}
        </h1>
        <p
          style={{
            font: "400 16px/1.6 var(--fb)",
            color: "var(--ink4)",
            margin: "18px 0 0",
          }}
        >
          Dernière mise à jour&nbsp;: {DATE_MISE_A_JOUR}
        </p>
      </section>

      <section style={{ padding: "48px 0 var(--sec)" }}>
        <div style={{ ...LARGEUR, padding: "0 40px" }}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: ".32fr .68fr",
              gap: "60px",
              alignItems: "start",
            }}
          >
            <nav
              aria-label="Sommaire de la politique de confidentialité"
              style={{ position: "sticky", top: "110px" }}
            >
              <p
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  margin: "0 0 16px",
                }}
              >
                Sommaire
              </p>
              <ol
                style={{
                  display: "grid",
                  gap: "9px",
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {PARTIES.map((partie) => (
                  <li key={partie.id}>
                    <a
                      href={`#${partie.id}`}
                      className={styles.lienSommaire}
                      style={{ font: "500 14px/1.5 var(--fb)" }}
                    >
                      {partie.titre}
                    </a>
                  </li>
                ))}
              </ol>
              <div
                style={{
                  height: "1px",
                  background: "var(--line)",
                  margin: "24px 0",
                }}
              />
              {/* La maquette écrit ce lien en `href="#"` avec un gestionnaire
                  de clic interne à son éditeur. La cible réelle est
                  /mentions-legales/, vérifiée à 200 avant d'être posée : un lien
                  mort sur une page citée par le pied de page de tout le site est
                  exactement le défaut qu'on répare ici. */}
              <Link
                href={CHEMIN_MENTIONS}
                className={styles.lienSommaire}
                style={{ font: "600 14px var(--fb)" }}
              >
                Mentions légales →
              </Link>
            </nav>

            <article style={{ maxWidth: "72ch" }}>
              {/* 09/10, L'ENCART D'AVERTISSEMENT EST RETIRÉ. Décision de Mehdi,
                  sur l'audit de Nathan Jorez.

                  La maquette porte ici « Gabarit RGPD : à faire valider par
                  votre DPO ou votre conseil avant publication », une note
                  adressée au client. Elle avait été réécrite pour le visiteur
                  (« Ce texte est en cours de validation juridique »), ce qui
                  restait une étiquette de chantier sur une page citée par la
                  mention RGPD de chaque formulaire du site : annoncer que la
                  politique n'est pas validée retire sa valeur à tout ce qu'elle
                  dit par ailleurs.

                  Les réserves qu'il portait ne sont pas perdues, elles sont à
                  leur place : `docs/RESERVES-CONTENU.md` § 2 pour les durées, et
                  l'en-tête de `lib/consentement.ts` pour la durée du choix.
                  `verification-confidentialite.tsx` vérifie des deux côtés que
                  la maquette le porte encore et que le rendu ne le porte plus. */}
              {PARTIES.map((partie) => (
                <section key={partie.id}>
                  <h2 id={partie.id} style={H2}>
                    {partie.titre}
                  </h2>
                  {partie.corps}
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>

      <div style={{ height: "var(--sec)" }} />
    </main>
  );
}
