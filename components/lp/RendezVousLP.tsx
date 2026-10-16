"use client";

import { useSyncExternalStore, type CSSProperties } from "react";

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
 * UN LIEN ET NON UN CADRE INTÉGRÉ : la LP en ligne charge le script de
 * Calendly dans la page, donc un tiers et ses traceurs avant tout accord. Ici
 * rien de Calendly ne se charge tant que le visiteur ne clique pas ; il part
 * alors chez Calendly, qui l'informe lui-même.
 *
 * Texte de `/fr/rendez-vous` de `window.__LP`, filtré : la seconde phrase du
 * chapô portait « sans engagement », elle est retirée.
 */

/* Le stockage n'est lu qu'au navigateur : au serveur et à l'hydratation,
   l'agenda vide ; le préremplissage arrive ensuite. */
const sansAbonnement = () => () => {};
function lit(): string | null {
  try {
    return window.sessionStorage.getItem(CLE_RENDEZ_VOUS);
  } catch {
    return null;
  }
}
const rienAuServeur = () => null;

/* La carte du créneau, à la place de l'agenda de la maquette. */
const CARTE: CSSProperties = {
  maxWidth: 460,
  marginLeft: "auto",
  width: "100%",
  boxSizing: "border-box",
  padding: 24,
  borderRadius: 26,
  background: "#fff",
  boxShadow: "0 30px 80px -40px rgba(0,0,0,.45)",
  border: "1px solid rgba(28,27,25,.06)",
  display: "grid",
  gap: 16,
};

const TITRE_CARTE: CSSProperties = {
  margin: 0,
  font: "700 20px/1.2 var(--ft)",
  letterSpacing: "-.02em",
  color: "#1c1b19",
};

const BOUTON: CSSProperties = {
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 15px var(--fb)",
  textDecoration: "none",
};

const NOTE: CSSProperties = {
  margin: 0,
  textAlign: "center",
  font: "400 12px var(--fb)",
  color: "#77736d",
};

export function RendezVousLP() {
  const brut = useSyncExternalStore(sansAbonnement, lit, rienAuServeur);
  const agenda = urlCalendly(prerempliDe(brut));

  return (
    <HerosServiceLP
      photo="/assets/web/team-grind-sparks.jpg"
      surtitre="Demande bien reçue"
      titre={"Dernière étape : réservez votre échange."}
      chapo="Choisissez le créneau qui vous arrange avec un expert Migen."
      carte={
        <div style={CARTE}>
          <h2 style={TITRE_CARTE}>Choisissez votre créneau · 30 min</h2>
          <a href={agenda} target="_blank" rel="noopener noreferrer" className={styles.envoi} style={BOUTON}>
            Réserver mon créneau <span aria-hidden="true">→</span>
            <span className={styles.lecteur}> (nouvel onglet)</span>
          </a>
          <p style={NOTE}>L’agenda s’ouvre chez Calendly.</p>
        </div>
      }
    />
  );
}
