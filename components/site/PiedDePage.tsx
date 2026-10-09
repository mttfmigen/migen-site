import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import styles from "./PiedDePage.module.css";

/*
 * Pied de page, porté depuis « Migen - Site final.dc.html », lignes 7181 à 7289.
 *
 * Composant SERVEUR : aucun état, aucun écouteur. Il part donc en HTML complet,
 * ce qui est le but d'un pied de page, à la fois pour le crawl et pour le
 * premier rendu.
 *
 * POURQUOI les couleurs et les polices des liens vivent dans le module CSS et
 * non en style en ligne, contrairement au reste de la maquette : la maquette
 * exprime ses survols par `style-hover`, que son éditeur applique en écrasant
 * le style en ligne. En React, un style en ligne gagne contre TOUTE règle CSS.
 * Une couleur de base posée en ligne rendrait le `:hover` du module inopérant.
 * Les valeurs restent recopiées à l'identique, elles ont seulement changé de
 * fichier. Les conteneurs, qui n'ont pas de survol, gardent leur style en ligne.
 *
 * POURQUOI `prefetch={false}` sur chaque lien interne : en production, `Link`
 * précharge toute destination qui entre dans le viewport. Un pied de page de
 * une cinquantaine de liens déclencherait autant de requêtes sur chaque page du site,
 * contre le principe numéro un du projet. La navigation côté client, elle, est
 * conservée.
 */

interface Lien {
  readonly libelle: string;
  readonly href: string;
  /** « Toutes nos pages » : seul lien en orange et en gras, blanc au survol. */
  readonly accent?: boolean;
}

interface Colonne {
  readonly titre: string;
  readonly liens: readonly Lien[];
}

/*
 * Les trois colonnes de la maquette (`maquette/site-final-autonome.html`),
 * libellés et ordre mot pour mot. Chaque destination est une page qui répond
 * sur ce site : `verification-pied-de-page.tsx` les demande une à une. Le
 * 08/10, les quatre libellés jusque-là retirés faute de page ont la leur :
 * l'offre Full service, le test technicien, le plan du site et le Diagnostic
 * Zéro arrêt (l'outil, servi sous le domaine du site par `next.config.ts`).
 */
const COLONNES: readonly Colonne[] = [
  {
    titre: "Offres",
    liens: [
      { libelle: "migen© Résidence", href: "/offres/residence/" },
      { libelle: "Diagnostic Zéro arrêt", href: "/diagnostic-zero-arret/" },
      { libelle: "migen© Full service", href: "/offres/full-service/" },
      { libelle: "migen© Zéro arrêt", href: "/offres/zero-arret/" },
      { libelle: "migen© Arrêt technique", href: "/offres/arret-technique/" },
      { libelle: "migen© Bureau d’études", href: "/offres/bureau-etudes/" },
      { libelle: "migen© Travaux industriels", href: "/travaux-industriels/" },
      { libelle: "Partenaires", href: "/partenaires/" },
    ],
  },
  {
    titre: "Expertises",
    liens: [
      { libelle: "Mécanique", href: "/expertises/mecanique/" },
      { libelle: "Électrotechnique", href: "/expertises/electromecanique/" },
      { libelle: "Automatisme", href: "/expertises/automatisme/" },
      { libelle: "Robotique", href: "/expertises/robotique/" },
      { libelle: "Soudure & tuyauterie", href: "/expertises/soudure/" },
      { libelle: "Nos métiers", href: "/expertises/" },
    ],
  },
  {
    titre: "migen©",
    liens: [
      { libelle: "Accueil", href: "/" },
      { libelle: "Nous connaître", href: "/nous-connaitre/" },
      { libelle: "Nos valeurs", href: "/valeurs/" },
      { libelle: "Engagements RSE", href: "/rse/" },
      { libelle: "Équipe", href: "/a-propos/equipe/" },
      { libelle: "Réalisations", href: "/preuves/" },
      { libelle: "Ressources", href: "/ressources/" },
      { libelle: "Carrière", href: "/carriere/" },
      { libelle: "Test technicien", href: "/test-technicien/" },
      { libelle: "Toutes nos pages", href: "/plan-du-site/", accent: true },
      /* Deuxième entrée vers /carriere/, comme dans la maquette (même verbe
         `goCarriere`) : deux intentions de recherche, une seule page. */
      { libelle: "Offres d’emploi", href: "/carriere/" },
      {
        libelle: "LinkedIn",
        href: "https://www.linkedin.com/company/migen-service/",
      },
    ],
  },
];

/*
 * Une entrée du maillage. `href` est optionnelle : la maquette écrit ce bloc en
 * texte mort, le site le rend cliquable quand la page existe, et garde le mot
 * en simple texte quand elle n'existe pas. Un mot clé non cliquable sert moins
 * qu'un lien, mais un lien mort posé sur les 225 pages du site coûte plus.
 */
interface Entree {
  readonly libelle: string;
  readonly href?: string;
}

interface GroupeMaillage {
  readonly titre: string;
  readonly entrees: readonly Entree[];
}

/*
 * Maillage SEO, quatre colonnes, mot pour mot et dans l'ordre de la maquette.
 * Une entrée sans page à elle reste du texte : « Habilitations » entière, et
 * Bas-Rhin, Nord, Drôme, que le site couvre sans page de département (l'Alsace,
 * Lille et Valence en ont une, mais pointer le mot vers elles serait déduire).
 */
const MAILLAGE: readonly GroupeMaillage[] = [
  {
    titre: "Villes",
    entrees: [
      { libelle: "Paris", href: "/implantations/paris/" },
      { libelle: "Lyon", href: "/implantations/lyon/" },
      { libelle: "Nantes", href: "/implantations/nantes/" },
      { libelle: "Strasbourg", href: "/implantations/strasbourg/" },
      { libelle: "Toulouse", href: "/implantations/toulouse/" },
      { libelle: "Bordeaux", href: "/implantations/bordeaux/" },
      { libelle: "Rennes", href: "/implantations/nantes/rennes/" },
      { libelle: "Grenoble", href: "/implantations/lyon/grenoble/" },
      { libelle: "Rouen", href: "/implantations/paris/rouen/" },
      { libelle: "Brest", href: "/implantations/nantes/brest/" },
    ],
  },
  {
    titre: "Départements",
    entrees: [
      { libelle: "Rhône", href: "/implantations/lyon/rhone/" },
      { libelle: "Bas-Rhin" },
      { libelle: "Haute-Garonne", href: "/implantations/toulouse/haute-garonne/" },
      { libelle: "Nord" },
      { libelle: "Loire-Atlantique", href: "/implantations/nantes/loire-atlantique/" },
      { libelle: "Drôme" },
      { libelle: "Charente", href: "/implantations/toulouse/charente/" },
      { libelle: "Essonne", href: "/implantations/paris/essonne/" },
      { libelle: "Gironde", href: "/implantations/toulouse/gironde/" },
      { libelle: "Haute-Savoie", href: "/implantations/lyon/haute-savoie/" },
    ],
  },
  {
    titre: "Secteurs",
    entrees: [
      { libelle: "Centre logistique", href: "/secteurs/logistique/" },
      { libelle: "Industrie lourde", href: "/secteurs/industrie-lourde/" },
      { libelle: "Métallique", href: "/secteurs/industrie-metallique/" },
      { libelle: "Automobile", href: "/secteurs/automobile/" },
      { libelle: "Aéronautique", href: "/secteurs/aeronautique/" },
      { libelle: "Pharmaceutique", href: "/secteurs/pharmaceutique/" },
      { libelle: "Chimie", href: "/secteurs/chimie/" },
      { libelle: "Agroalimentaire", href: "/secteurs/agroalimentaire/" },
    ],
  },
  {
    titre: "Habilitations",
    entrees: [
      { libelle: "CACES 486" },
      { libelle: "CACES 489" },
      { libelle: "Habilitations électriques" },
      { libelle: "Travail en hauteur" },
      { libelle: "Risques chimiques" },
      { libelle: "Accès Z.A.C" },
    ],
  },
];

/* Adresse du siège : celle de la maquette, mot pour mot, et c'est elle qui est
   juste. Elle avait été remplacée par Écully le 07/10 ; Mehdi a tranché le
   09/10 que le siège est bien à Limonest et qu'Écully est l'agence. La
   maquette l'écrit ainsi sur 96 de ses 244 captures. */
const ADRESSE_SIEGE = "1 rue des Vergers, 69760 Limonest";

const styleCadre: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 40px",
};

const styleTitreColonne: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.4)",
  marginBottom: 16,
};

const styleTitreMaillage: CSSProperties = {
  font: "600 10.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.32)",
  marginBottom: 12,
};

const styleBarreBasse: CSSProperties = {
  paddingTop: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  flexWrap: "wrap",
};

const styleMentionBasse: CSSProperties = {
  font: "400 12.5px var(--fb)",
  color: "rgba(255,255,255,.34)",
};

export interface ProprietesPiedDePage {
  /** Variante réduite de la landing page : marque, un appel à l'action, barre légale. */
  landingPage?: boolean;
  /**
   * Lien CNIL de réglage du consentement, inséré dans la barre basse.
   * Il vient de l'appelant (`LienReglages`, composant client) au lieu d'être
   * dupliqué ici : une seule implémentation du bouton pour tout le site.
   */
  reglagesConsentement?: ReactNode;
}

/**
 * Un lien du pied de page.
 *
 * Interne : `Link`, pour la navigation côté client, sans préchargement. Externe
 * ou ancre de la même page : balise brute, `Link` n'y apporterait rien.
 */
function LienSite({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} prefetch={false}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export default function PiedDePage({
  landingPage = false,
  reglagesConsentement,
}: ProprietesPiedDePage) {
  /* Calculée et non figée à 2026 comme la maquette : un millésime périmé en
     janvier est un défaut visible sur toutes les pages. */
  const annee = new Date().getFullYear();

  if (landingPage) {
    return (
      <footer style={{ background: "var(--foot)", color: "#fff", padding: "52px 0 30px" }}>
        <div style={styleCadre}>
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 36,
              alignItems: "center",
              paddingBottom: 30,
              borderBottom: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <Image src="/assets/logo-migen-white.png" alt="migen" width={24} height={24} />
              {/* La maquette ouvre par « Maintenance industrielle et mise à
                  disposition de techniciens qualifiés. » : interdit de copie,
                  la phrase est retirée, pas reformulée. */}
              <span
                style={{
                  font: "400 14px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.52)",
                  maxWidth: "46ch",
                }}
              >
                4 agences, hubs de techniciens dans toute la France.
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, flex: "none", flexWrap: "wrap" }}>
              <LienSite href="#lp-contact" className={styles.appelLanding}>
                Obtenir un devis
              </LienSite>
            </div>
          </div>
          <div
            style={{
              paddingTop: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <span style={styleMentionBasse}>
              © {annee} migen© · {ADRESSE_SIEGE}
            </span>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <LienSite href="/mentions-legales/" className={styles.lienBas}>
                Mentions légales
              </LienSite>
              <LienSite href="/confidentialite/" className={styles.lienBas}>
                Confidentialité
              </LienSite>
              {reglagesConsentement ? (
                <span className={styles.reglages}>{reglagesConsentement}</span>
              ) : null}
              <LienSite href="/" className={styles.lienBas}>
                migen.fr
              </LienSite>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer style={{ background: "var(--foot)", color: "#fff", padding: "80px 0 34px" }}>
      <div style={styleCadre}>
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 56,
            borderBottom: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Image src="/assets/logo-migen-white.png" alt="migen" width={26} height={26} />
            </div>
            <p
              style={{
                font: "400 14.5px/1.65 var(--fb)",
                color: "rgba(255,255,255,.52)",
                margin: "0 0 22px",
                maxWidth: "34ch",
              }}
            >
              Prestataire de maintenance industrielle, partout en France. Innovation,
              performance, impact.
            </p>
            <LienSite href="/contact/" className={styles.appelSite}>
              Décrire mon besoin
            </LienSite>
          </div>

          {COLONNES.map((colonne) => (
            <nav key={colonne.titre} aria-label={colonne.titre}>
              <div style={styleTitreColonne}>{colonne.titre}</div>
              <div style={{ display: "grid", gap: 9 }}>
                {colonne.liens.map((lien) => (
                  <LienSite
                    key={lien.href + lien.libelle}
                    href={lien.href}
                    className={lien.accent ? styles.lienPlan : styles.lienNav}
                  >
                    {lien.libelle}
                  </LienSite>
                ))}
              </div>
            </nav>
          ))}
        </div>

        <div
          className="mg-rq3"
          style={{
            padding: "34px 0",
            borderBottom: "1px solid rgba(255,255,255,.1)",
            display: "grid",
            gridTemplateColumns: `repeat(${MAILLAGE.length}, 1fr)`,
            gap: 36,
          }}
        >
          {MAILLAGE.map((groupe) => {
            const contenu = (
              <>
                <div style={styleTitreMaillage}>{groupe.titre}</div>
                <div style={{ font: "400 13px/1.9 var(--fb)", color: "rgba(255,255,255,.44)" }}>
                  {groupe.entrees.map((entree, index) => (
                    <span key={entree.libelle}>
                      {index > 0 ? " · " : null}
                      {entree.href ? (
                        <LienSite href={entree.href} className={styles.lienMaillage}>
                          {entree.libelle}
                        </LienSite>
                      ) : (
                        entree.libelle
                      )}
                    </span>
                  ))}
                </div>
              </>
            );
            /* `nav` annonce un ensemble de liens : une colonne qui n'en porte
               aucun reste un bloc de texte, comme dans la maquette. */
            return groupe.entrees.some((entree) => entree.href) ? (
              <nav key={groupe.titre} aria-label={groupe.titre}>
                {contenu}
              </nav>
            ) : (
              <div key={groupe.titre}>{contenu}</div>
            );
          })}
        </div>

        <div style={styleBarreBasse}>
          <div style={styleMentionBasse}>
            © {annee} migen© · Siège {ADRESSE_SIEGE}
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
            <LienSite href="/mentions-legales/" className={styles.lienBas}>
              Mentions légales
            </LienSite>
            <LienSite href="/confidentialite/" className={styles.lienBas}>
              Confidentialité
            </LienSite>
            {reglagesConsentement ? (
              <span className={styles.reglages}>{reglagesConsentement}</span>
            ) : null}
            <LienSite href="https://industrielibre.com/missions" className={styles.lienBas}>
              Une mission freelance
            </LienSite>
          </div>
        </div>
      </div>
    </footer>
  );
}
