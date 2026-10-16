"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "./conversion-lp.module.css";
import { HerosServiceLP } from "./HerosServiceLP";
import { CLE_RENDEZ_VOUS, prerempliDe, urlCalendly } from "./lead-lp";

/**
 * /lp/rendez-vous/ : là où le formulaire mène après l'envoi.
 *
 * L'AGENDA EST CELUI DE LA LP EN LIGNE, Calendly `thomas-puthod-migen/30min`,
 * prérempli du nom et du courriel saisis, comme `routes/fr.rendez-vous.tsx` de
 * migen-forge-nucleus. Jamais le faux agenda de la maquette V3 (cinq jours
 * écrits en dur, « Confirmer le rendez-vous » qui ne réservait rien).
 *
 * L'AGENDA EST INTÉGRÉ DANS LA PAGE (demandes de Mehdi du 16/10, « la LP
 * rendez-vous doit intégrer l'iframe Calendly », puis « intègre mieux
 * l'agenda ») : héros court et centré, puis le cadre, centré dans la grille,
 * qui chevauche le bas du héros. Un simple `<iframe>`, sans le script de
 * Calendly. Ce que Calendly sert, relevé au navigateur le 16/10 :
 *   · au-dessus de 650 px de cadre, une carte bordée de 680 px au plus,
 *     centrée, à 66 px du haut, sur un fond TRANSPARENT : la carte de Calendly
 *     est la carte de la page, posée à cheval sur le héros, sans carte autour
 *     (une carte blanche de 1100 px l'encadrait d'un second bord, pour rien :
 *     Calendly n'élargit jamais la sienne). Le cadre s'arrête à 760 px : au-delà
 *     de 1000 px environ, Calendly passe à une carte de 400 px qui
 *     s'élargit au choix du jour ;
 *   · en dessous, une page blanche pleine, sans bord : le cadre devient la
 *     carte (arrondi ici, ombre et filet dans conversion-lp.module.css).
 *
 * HAUTEUR : Calendly annonce celle de sa page (`calendly.page_height`, envoyé
 * au parent quand l'adresse porte `embed_type=Inline`) ; le cadre la prend,
 * sans défilement interne. Seul ce qui vient de https://calendly.com est lu.
 * Pendant le chargement, Calendly annonce 26 puis 2 px : le plancher tient le
 * cadre ouvert.
 *
 * Un seul titre au-dessus de l'agenda, celui de la page : Calendly titre déjà
 * son étape (« Choisissez un jour », « Sélectionnez la date et l'heure »). L'adresse porte le nom et le courriel
 * du préremplissage : elle n'est posée qu'après le montage (lecture de
 * `sessionStorage`), jamais dans le HTML servi. Le bouton qui ouvre l'agenda
 * dans un onglet reste dessous, discret, si le cadre ne se charge pas
 * (bloqueur, réseau).
 *
 * Texte de `/fr/rendez-vous` de `window.__LP`, lu dans `lib/lp/pages.json`
 * (surtitre, titre, chapô).
 */

/* Le stockage peut lever (navigation privée, stockage bloqué) : l'agenda s'ouvre alors vide. */
function prerempli() {
  try {
    return prerempliDe(window.sessionStorage.getItem(CLE_RENDEZ_VOUS));
  } catch {
    return null;
  }
}

const ouvreAgenda = () => window.open(urlCalendly(prerempli()), "_blank", "noopener,noreferrer");

const ORIGINE_CALENDLY = "https://calendly.com";

/** La plus petite page de Calendly relevée (602 px, le calendrier au téléphone) :
    hauteur de départ du cadre, et plancher. */
const HAUTEUR_MIN = 600;

/** La hauteur annoncée par Calendly (`"711px"`), ou `null` pour tout autre message. */
function hauteurAnnoncee(evenement: MessageEvent): number | null {
  if (evenement.origin !== ORIGINE_CALENDLY) return null;
  const donnee = evenement.data as { event?: unknown; payload?: { height?: unknown } } | null;
  if (donnee?.event !== "calendly.page_height") return null;
  const hauteur = Number.parseInt(String(donnee.payload?.height), 10);
  return Number.isFinite(hauteur) ? Math.max(HAUTEUR_MIN, hauteur) : null;
}

/* Le chevauchement du héros (marge négative ici, rembourrage du héros dans
   `.rendezVous`) et le repli au téléphone vivent dans conversion-lp.module.css. */
const ZONE: CSSProperties = { position: "relative", padding: "0 40px 48px", textAlign: "center" };

const CADRE: CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: 760,
  margin: "-184px auto 0",
  border: 0,
  borderRadius: 26,
};

/* Le bouton discret du formulaire (« Retour »), même survol. */
const SECOURS: CSSProperties = {
  minHeight: 44,
  marginTop: 8,
  padding: "0 12px",
  border: "none",
  background: "none",
  font: "600 13px var(--fb)",
  color: "#6a6764",
  cursor: "pointer",
};

export function RendezVousLP({ photo, surtitre, titre, chapo }: { photo: string; surtitre: string; titre: string; chapo: string }) {
  const cadre = useRef<HTMLIFrameElement>(null);
  const [hauteur, setHauteur] = useState(HAUTEUR_MIN);
  useEffect(() => {
    const ecoute = (evenement: MessageEvent) => {
      const annoncee = hauteurAnnoncee(evenement);
      if (annoncee !== null) setHauteur(annoncee);
    };
    window.addEventListener("message", ecoute);
    /* L'adresse est posée après le montage, et après l'écoute : elle porte le
       nom et le courriel lus dans `sessionStorage`, absents du HTML servi. */
    if (cadre.current) cadre.current.src = urlCalendly(prerempli(), true);
    return () => window.removeEventListener("message", ecoute);
  }, []);
  return (
    <div className={styles.rendezVous}>
      <HerosServiceLP photo={photo} surtitre={surtitre} titre={titre} chapo={chapo} centre />
      <div className={styles.zoneAgenda} style={ZONE}>
        <iframe
          ref={cadre}
          title="Agenda de réservation Calendly"
          className={styles.cadreAgenda}
          style={{ ...CADRE, height: hauteur }}
        />
        <button type="button" onClick={ouvreAgenda} className={styles.retour} style={SECOURS}>
          Ouvrir l’agenda dans un onglet <span aria-hidden="true">→</span>
          <span className="sr-only"> (nouvel onglet)</span>
        </button>
      </div>
    </div>
  );
}
