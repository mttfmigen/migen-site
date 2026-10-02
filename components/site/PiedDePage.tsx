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
 * quarante-huit liens déclencherait autant de requêtes sur chaque page du site,
 * contre le principe numéro un du projet. La navigation côté client, elle, est
 * conservée.
 */

interface Lien {
  readonly libelle: string;
  readonly href: string;
}

interface Colonne {
  readonly titre: string;
  readonly liens: readonly Lien[];
}

/*
 * Destinations relevées dans `docs/urls-site-actuel.json`, jamais déduites.
 * Les libellés de la maquette dont aucune URL de l'inventaire ne correspond ont
 * été retirés plutôt que pointés au hasard : un lien de pied de page en 404 est
 * vu par tout le crawl. Les manques sont listés dans le rapport de portage.
 */
const COLONNES: readonly Colonne[] = [
  {
    titre: "Offres",
    liens: [
      { libelle: "migen© Résidence", href: "/offres/residence/" },
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
      { libelle: "Équipe", href: "/equipe/" },
      { libelle: "Réalisations", href: "/realisations/" },
      { libelle: "Ressources", href: "/ressources/" },
      { libelle: "Carrière", href: "/carriere/" },
      {
        libelle: "LinkedIn",
        href: "https://www.linkedin.com/company/migen-service/",
      },
    ],
  },
];

/*
 * Maillage SEO. La maquette le posait en texte mort, séparé par des points
 * médians : un mot clé non cliquable dans un pied de page ne sert personne. Les
 * entrées conservées sont celles dont la page existe, les autres sont tombées.
 * La colonne « Habilitations » de la maquette n'apparaît pas : aucune de ses six
 * entrées n'a de page. Elle revient d'elle-même le jour où ces pages existent.
 */
const MAILLAGE: readonly Colonne[] = [
  {
    titre: "Villes",
    liens: [
      { libelle: "Paris", href: "/implantations/paris/" },
      { libelle: "Lyon", href: "/implantations/lyon/" },
      { libelle: "Nantes", href: "/implantations/nantes/" },
      { libelle: "Strasbourg", href: "/implantations/strasbourg/" },
      { libelle: "Toulouse", href: "/implantations/toulouse/" },
      { libelle: "Bordeaux", href: "/implantations/toulouse/bordeaux/" },
      { libelle: "Rennes", href: "/implantations/nantes/rennes/" },
      { libelle: "Grenoble", href: "/implantations/lyon/grenoble/" },
      { libelle: "Rouen", href: "/implantations/paris/rouen/" },
      { libelle: "Brest", href: "/implantations/nantes/brest/" },
    ],
  },
  {
    titre: "Départements",
    liens: [
      { libelle: "Rhône", href: "/implantations/lyon/rhone/" },
      { libelle: "Haute-Garonne", href: "/implantations/toulouse/haute-garonne/" },
      { libelle: "Loire-Atlantique", href: "/implantations/nantes/loire-atlantique/" },
      { libelle: "Charente", href: "/implantations/toulouse/charente/" },
      { libelle: "Essonne", href: "/implantations/paris/essonne/" },
      { libelle: "Gironde", href: "/implantations/toulouse/gironde/" },
      { libelle: "Haute-Savoie", href: "/implantations/lyon/haute-savoie/" },
    ],
  },
  {
    titre: "Secteurs",
    liens: [
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
];

/* Adresse du siège : celle de la maquette, mot pour mot. */
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
              {/* « mise à disposition », mot de la maquette, est un interdit de
                  copie du projet. Reformulé, sans rien promettre de plus. */}
              <span
                style={{
                  font: "400 14px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.52)",
                  maxWidth: "46ch",
                }}
              >
                Maintenance industrielle et renfort de techniciens qualifiés sur votre site.
                4 agences, dix hubs de techniciens.
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
                  <LienSite key={lien.href + lien.libelle} href={lien.href} className={styles.lienNav}>
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
          {MAILLAGE.map((groupe) => (
            <nav key={groupe.titre} aria-label={groupe.titre}>
              <div style={styleTitreMaillage}>{groupe.titre}</div>
              <div style={{ font: "400 13px/1.9 var(--fb)", color: "rgba(255,255,255,.44)" }}>
                {groupe.liens.map((lien, index) => (
                  <span key={lien.href}>
                    {index > 0 ? " · " : null}
                    <LienSite href={lien.href} className={styles.lienMaillage}>
                      {lien.libelle}
                    </LienSite>
                  </span>
                ))}
              </div>
            </nav>
          ))}
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
