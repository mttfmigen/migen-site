"use client";

import { useEffect, useRef, type CSSProperties } from "react";

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
 * L'AGENDA EST INTÉGRÉ DANS LA PAGE, en cadre (demande de Mehdi le 16/10 :
 * « la LP rendez-vous doit intégrer l'iframe Calendly »), comme la LP en
 * ligne. Un simple `<iframe>`, sans le script de Calendly : le visiteur vient
 * d'envoyer sa demande pour réserver ce créneau, et c'est Calendly qui le
 * sert. Son adresse porte le nom et le courriel du préremplissage : elle n'est
 * posée qu'après le montage (lecture de `sessionStorage`), jamais dans le
 * HTML servi. Le bouton qui ouvre l'agenda dans un onglet reste dessous, si
 * le cadre ne se charge pas (bloqueur, réseau).
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
  maxWidth: 520,
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

const CADRE: CSSProperties = {
  width: "100%",
  height: 700,
  border: 0,
  borderRadius: 16,
  background: "#fff",
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
  const cadre = useRef<HTMLIFrameElement>(null);
  /* L'adresse est posée sur le cadre après le montage : elle porte le nom et
     le courriel lus dans `sessionStorage`, absents du HTML servi. */
  useEffect(() => {
    if (cadre.current) cadre.current.src = urlCalendly(prerempli(), true);
  }, []);
  return (
    <HerosServiceLP
      photo={photo}
      surtitre={surtitre}
      titre={titre}
      chapo={chapo}
      carte={
        <div style={CARTE}>
          <h2 style={TITRE_CARTE}>Choisissez votre créneau</h2>
          <iframe ref={cadre} title="Agenda de réservation Calendly" style={CADRE} />
          <button type="button" onClick={ouvreAgenda} className={styles.envoi} style={BOUTON}>
            Ouvrir l’agenda dans un onglet <span aria-hidden="true">→</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </button>
        </div>
      }
    />
  );
}
