"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import s from "./lecteur.module.css";
import { DERNIERE_CARTE, OUVERTS_PAR_LE_HUB } from "./ouverts";

/**
 * La feuille du lecteur, maquette « Ressources v2 » : voile flouté, feuille
 * fixe à droite, barre collante (lien à copier, « Fermer », progression
 * orange). Échap et le voile ferment. Fermer = retour à /ressources/, là où la
 * maquette retirait son ancre `#/ressources/...` : ici l'adresse ouverte est
 * la vraie URL de la page, qui sert la page complète si on la recharge.
 */
const FOCUSABLES =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

/** Rend inertes les frères de chaque ancêtre du lecteur ; renvoie la remise en état. */
function inerteAutour(el: HTMLElement): () => void {
  const poses: HTMLElement[] = [];
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
    for (const frere of Array.from(n.parentElement?.children ?? [])) {
      if (frere !== n && frere instanceof HTMLElement && !frere.inert) {
        frere.inert = true;
        poses.push(frere);
      }
    }
  }
  return () => poses.forEach((x) => (x.inert = false));
}

/**
 * Ouvert par une carte : Précédent revient au hub. Ouvert par « À lire
 * ensuite » : reculer rouvrirait l'article d'avant, on ferme vers le hub,
 * comme la maquette (`closeRd` pousse l'adresse du hub).
 */
function fermerVersLeHub(router: ReturnType<typeof useRouter>, url: string) {
  if (DERNIERE_CARTE.url === url) router.back();
  else router.push("/ressources/", { scroll: false });
}

export default function FeuilleLecteur({
  url,
  depuisLeHubSeulement = false,
  children,
}: {
  url: string;
  /** Vrai : une navigation qui ne vient pas d'une carte du hub ouvre la page entière. */
  depuisLeHubSeulement?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const racine = useRef<HTMLDivElement>(null);
  const feuille = useRef<HTMLElement>(null);
  const [progression, setProgression] = useState(0);
  const [copie, setCopie] = useState(false);
  const [actif] = useState(() => !depuisLeHubSeulement || OUVERTS_PAR_LE_HUB.has(url));

  // replace, pas assign : la navigation douce a déjà inscrit l'adresse, un
  // assign en ajoutait une seconde et Précédent restait sur la même page.
  useEffect(() => {
    if (!actif) window.location.replace(url);
  }, [actif, url]);

  const fermer = () => fermerVersLeHub(router, url);

  // Fond inerte, focus piégé dans la feuille puis rendu à la carte, Échap ferme.
  useEffect(() => {
    if (!actif || !racine.current) return;
    const carte = document.activeElement as HTMLElement | null;
    const debloque = inerteAutour(racine.current);
    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fermerVersLeHub(router, url);
        return;
      }
      if (e.key !== "Tab" || !feuille.current) return;
      const liste = Array.from(feuille.current.querySelectorAll<HTMLElement>(FOCUSABLES)).filter(
        (x) => x.offsetParent !== null,
      );
      if (!liste.length) return;
      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      if (e.shiftKey && (document.activeElement === premier || document.activeElement === feuille.current)) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    window.addEventListener("keydown", clavier);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    feuille.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", clavier);
      document.body.style.overflow = avant;
      debloque();
      if (carte?.isConnected) carte.focus({ preventScroll: true });
    };
  }, [actif, router, url]);

  useEffect(() => {
    if (!copie) return;
    const t = setTimeout(() => setCopie(false), 1600);
    return () => clearTimeout(t);
  }, [copie]);

  const copier = () => {
    navigator.clipboard?.writeText(`https://migen.fr${url}`).catch(() => undefined);
    setCopie(true);
  };

  if (!actif) return null;

  return (
    <div ref={racine}>
      <div
        className={s.voile}
        onClick={fermer}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          background: "rgba(14,13,12,.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      <aside
        ref={feuille}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Lecture de la ressource"
        data-lecteur-ressource=""
        className={s.feuille}
        onScroll={(e) => {
          const el = e.currentTarget;
          setProgression(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight));
        }}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          bottom: 12,
          zIndex: 81,
          width: "min(860px, calc(100% - 24px))",
          overflowY: "auto",
          borderRadius: 30,
          background: "var(--card)",
          color: "var(--ink)",
          boxShadow: "0 40px 100px -40px rgba(0,0,0,.65)",
          outline: "none",
        }}
      >
        {/* `data-libelle-lecteur` : les mots de la barre sont au lecteur, pas à la page. */}
        <div
          data-libelle-lecteur=""
          style={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px 12px 16px",
            background: "var(--glass)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            onClick={copier}
            title="Copier le lien de la page"
            style={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid var(--line)",
              background: "var(--card)",
              padding: "6px 6px 6px 14px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                font: "500 12.5px ui-monospace,Menlo,monospace",
                color: "var(--ink2)",
              }}
            >
              migen.fr{url}
            </span>
            <span
              style={{
                flex: "none",
                padding: "6px 11px",
                borderRadius: 999,
                background: "var(--accw)",
                color: "var(--acci)",
                font: "600 11.5px var(--fb)",
              }}
            >
              {copie ? "Lien copié" : "Copier"}
            </span>
          </button>
          <button
            type="button"
            onClick={fermer}
            style={{
              flex: "none",
              border: "none",
              padding: "10px 16px",
              borderRadius: 999,
              background: "var(--chip)",
              color: "var(--ink)",
              font: "600 13px var(--fb)",
              cursor: "pointer",
            }}
          >
            Fermer
          </button>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              bottom: -1,
              height: 2,
              background: "#ff7c3c",
              transition: "width .1s linear",
              width: `${Math.round(progression * 100)}%`,
            }}
          />
        </div>
        {children}
      </aside>
    </div>
  );
}
