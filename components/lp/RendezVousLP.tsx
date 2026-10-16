"use client";

import type { CSSProperties } from "react";

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
 * UN BOUTON ET NON UN LIEN, NI UN CADRE INTÉGRÉ :
 *   · pas de cadre : la LP en ligne charge le script de Calendly dans la page,
 *     donc un tiers et ses traceurs avant tout accord ; ici rien de Calendly
 *     ne se charge tant que le visiteur ne clique pas ;
 *   · pas de `<a href>` : l'adresse de l'agenda porte le nom et le courriel, et
 *     la mesure améliorée de GA4 (Tag Manager chargé) relève l'adresse de
 *     chaque lien sortant cliqué. L'agenda s'ouvre donc par `window.open`, au
 *     clic, et l'adresse n'existe dans la page qu'à ce moment-là.
 *
 * Texte de `/fr/rendez-vous` de `window.__LP`, lu dans `lib/lp/pages.json`
 * (surtitre, titre, chapô). Le titre de la carte est celui du gabarit V3,
 * « Choisissez votre créneau · 30 min », sans sa durée chiffrée, retirée comme
 * dans le chapô et la description. Le bouton reprend les mots du titre de la
 * page (« Réservez votre échange »).
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
  border: "none",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 15px var(--fb)",
  cursor: "pointer",
};

export function RendezVousLP({ photo, surtitre, titre, chapo }: { photo: string; surtitre: string; titre: string; chapo: string }) {
  return (
    <HerosServiceLP
      photo={photo}
      surtitre={surtitre}
      titre={titre}
      chapo={chapo}
      carte={
        <div style={CARTE}>
          <h2 style={TITRE_CARTE}>Choisissez votre créneau</h2>
          <button type="button" onClick={ouvreAgenda} className={styles.envoi} style={BOUTON}>
            Réservez votre échange <span aria-hidden="true">→</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </button>
        </div>
      }
    />
  );
}
