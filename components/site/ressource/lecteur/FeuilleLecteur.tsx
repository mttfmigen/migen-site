"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import s from "./lecteur.module.css";

/**
 * La feuille du lecteur, maquette « Ressources v2 » : voile flouté, feuille
 * fixe à droite, barre collante (lien à copier, « Fermer », progression
 * orange). Échap et le voile ferment. Fermer = retour à /ressources/, là où la
 * maquette retirait son ancre `#/ressources/...` : ici l'adresse ouverte est
 * la vraie URL de la page, qui sert la page complète si on la recharge.
 */
export default function FeuilleLecteur({ url, children }: { url: string; children: ReactNode }) {
  const router = useRouter();
  const feuille = useRef<HTMLElement>(null);
  const [progression, setProgression] = useState(0);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    const fermer = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", fermer);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    feuille.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", fermer);
      document.body.style.overflow = avant;
    };
  }, [router]);

  useEffect(() => {
    if (!copie) return;
    const t = setTimeout(() => setCopie(false), 1600);
    return () => clearTimeout(t);
  }, [copie]);

  const copier = () => {
    navigator.clipboard?.writeText(`https://migen.fr${url}`).catch(() => undefined);
    setCopie(true);
  };

  return (
    <>
      <div
        className={s.voile}
        onClick={() => router.back()}
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
        <div
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
            onClick={() => router.back()}
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
    </>
  );
}
