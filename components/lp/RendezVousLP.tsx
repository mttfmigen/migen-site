"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "./conversion-lp.module.css";
import { BOUTON_HEROS, HerosServiceLP } from "./HerosServiceLP";
import { CLE_RENDEZ_VOUS, prerempliDe, urlCalendly } from "./lead-lp";

/**
 * /lp/rendez-vous/ : là où le formulaire mène après l'envoi.
 *
 * L'AGENDA EST CELUI DE LA LP EN LIGNE, Calendly `thomas-puthod-migen/30min`,
 * prérempli du nom et du courriel saisis, comme `routes/fr.rendez-vous.tsx` de
 * migen-forge-nucleus. Jamais le faux agenda de la maquette V3 (cinq jours
 * écrits en dur, « Confirmer le rendez-vous » qui ne réservait rien).
 *
 * Il est intégré dans la page (Mehdi, 16/10 : « intègre mieux l'agenda ») :
 * un simple `<iframe>`, sans le script de Calendly, dans la carte des LP qui
 * chevauche le héros. La mise en page et ses raisons vivent dans
 * conversion-lp.module.css ; ici, la hauteur et le prérempli.
 *
 * L'adresse porte le nom et le courriel lus dans `sessionStorage` : elle n'est
 * posée qu'après le montage, jamais dans le HTML servi. Texte de
 * `/fr/rendez-vous` de `window.__LP`, lu dans `lib/lp/pages.json`.
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

const ORIGINE_CALENDLY = new URL(urlCalendly(null)).origin;

/** En dessous, une annonce de chargement (Calendly envoie 26 puis 2 px avant sa vraie hauteur) : ignorée. */
const PLANCHER = 400;

/** Sans annonce de Calendly passé ce délai (il l'envoie vers 3 s), le bouton de secours passe au premier plan. */
const ATTENTE_MS = 8000;

/** La hauteur de sa page que Calendly annonce (`"711px"`), ou `null` pour tout autre message. */
function hauteurAnnoncee(evenement: MessageEvent): number | null {
  if (evenement.origin !== ORIGINE_CALENDLY) return null;
  const donnee = evenement.data as { event?: unknown; payload?: { height?: unknown } } | null;
  if (donnee?.event !== "calendly.page_height") return null;
  const hauteur = Number.parseInt(String(donnee.payload?.height), 10);
  return hauteur >= PLANCHER ? hauteur : null;
}

const SECOURS_DISCRET: CSSProperties = { marginTop: 8, padding: "0 12px" };
const SECOURS_VISIBLE: CSSProperties = { ...BOUTON_HEROS, marginTop: 16, border: "none", cursor: "pointer" };

export function RendezVousLP({ photo, surtitre, titre, chapo }: { photo: string; surtitre: string; titre: string; chapo: string }) {
  const cadre = useRef<HTMLIFrameElement>(null);
  /* `null` tant que Calendly n'a rien annoncé : la hauteur de départ est celle du CSS. */
  const [hauteur, setHauteur] = useState<number | null>(null);
  const [attenteEcoulee, setAttenteEcoulee] = useState(false);
  useEffect(() => {
    const ecoute = (evenement: MessageEvent) => {
      const annoncee = hauteurAnnoncee(evenement);
      if (annoncee !== null) setHauteur(annoncee);
    };
    window.addEventListener("message", ecoute);
    /* Après l'écoute, pour ne manquer aucune annonce. */
    if (cadre.current) cadre.current.src = urlCalendly(prerempli(), true);
    const minuterie = window.setTimeout(() => setAttenteEcoulee(true), ATTENTE_MS);
    return () => {
      window.removeEventListener("message", ecoute);
      window.clearTimeout(minuterie);
    };
  }, []);
  /* Calendly bloqué (pare-feu, bloqueur, réseau) : la carte reste blanche, le message dit quoi faire. */
  const muet = attenteEcoulee && hauteur === null;
  return (
    <div className={styles.rendezVous}>
      <HerosServiceLP photo={photo} surtitre={surtitre} titre={titre} chapo={chapo} />
      <div className={styles.zoneAgenda}>
        <div className={styles.carteAgenda}>
          {hauteur === null ? (
            <p role="status" className={styles.etatAgenda}>
              {muet ? "L’agenda ne s’affiche pas ? Ouvrez-le dans un onglet avec le bouton juste en dessous." : "Chargement de l’agenda…"}
            </p>
          ) : null}
          <iframe
            ref={cadre}
            title="Agenda de réservation Calendly"
            className={styles.cadreAgenda}
            style={hauteur === null ? undefined : { height: hauteur }}
          />
        </div>
        <button
          type="button"
          onClick={ouvreAgenda}
          className={muet ? styles.envoi : styles.retour}
          style={muet ? SECOURS_VISIBLE : SECOURS_DISCRET}
        >
          Ouvrir l’agenda dans un onglet <span aria-hidden="true">→</span>
          <span className="sr-only"> (nouvel onglet)</span>
        </button>
      </div>
    </div>
  );
}
