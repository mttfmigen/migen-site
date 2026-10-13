"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import replis from "./replis-accueil.module.css";
import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";

/**
 * Bandeau « On … ? », où le verbe tourne.
 *
 * La liste et la position de départ viennent de la logique de la maquette :
 *   VERBS = ["installe", "maintient", "répare", "dépanne"]   et   verbIdx: 0
 * Elle n'était pas dans la fenêtre de balisage, d'où la prop laissée ouverte à
 * l'écriture. Elle est maintenant renseignée, et le défaut n'est plus vide.
 *
 * Le PREMIER verbe est rendu côté serveur : Google et un visiteur sans
 * JavaScript lisent une phrase complète, « On installe ? », jamais « On  ? ».
 * La rotation n'est qu'un supplément, et elle s'arrête si le visiteur a demandé
 * moins d'animations (WCAG 2.3.3).
 */
export const VERBES = ["installe", "maintient", "répare", "dépanne"] as const;

/** Cadence de la maquette : `setInterval(..., 2200)` dans son montage. */
const CADENCE_MS = 2200;

/**
 * Le verbe à afficher maintenant.
 *
 * Rend TOUJOURS le premier au premier passage, serveur comme client : un
 * `useState` initialisé au hasard produirait un HTML serveur différent du
 * premier rendu client, et React signalerait une incohérence d'hydratation.
 */
function useVerbeCourant(verbes: readonly string[]): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (verbes.length < 2) return;
    /* LE REGLAGE EST RELU A CHAQUE PAS, plus une seule fois au montage : sinon
       un visiteur qui active « reduire les animations » pendant sa visite garde
       la rotation jusqu'au rechargement complet. */
    const requete = window.matchMedia("(prefers-reduced-motion: reduce)");

    const minuterie = window.setInterval(() => {
      if (requete.matches) return;
      /* WCAG 2.2.2 s'applique aussi a l'information qui se met a jour seule.
         `data-cible` evite que l'arret de la bande de logos, plus bas sur la
         meme page, arrete aussi le verbe, et l'inverse. */
      if (document.querySelector('.mg-pause-case[data-cible="verbe"]:checked')) {
        return;
      }
      setIndex((i) => (i + 1) % verbes.length);
    }, CADENCE_MS);
    return () => window.clearInterval(minuterie);
  }, [verbes.length]);

  return verbes[index] ?? verbes[0] ?? "";
}

export interface ProprietesBandeauVerbe {
  /** Les verbes affichés en orange, à tour de rôle. */
  verbes?: readonly string[];
}

export default function BandeauVerbe({
  verbes = VERBES,
}: ProprietesBandeauVerbe) {
  const verbe = useVerbeCourant(verbes);

  /*
   * LE TITRE DE LA BASCULE EST LA PHRASE ELLE-MÊME, et elle tourne.
   *
   * CETTE SECTION N'A PAS DE `<h2>` : son titre, dans la maquette de bureau,
   * c'est « On installe ? », dont le verbe change toutes les 2,2 secondes.
   * C'est donc lui que porte la bascule, à l'identique, et RIEN N'EST ÉCRIT
   * POUR L'OCCASION : inventer un titre de section serait écrire à la place de
   * Mehdi.
   *
   * La phrase est construite ici UNE SEULE FOIS et sert aux deux endroits,
   * l'en-tête d'origine et la bascule : aucune des deux ne peut dériver de
   * l'autre. L'espace devant le point d'interrogation est celui du composant
   * d'origine, une espace ordinaire, pas une insécable.
   */
  const phrase = `On ${verbe} ?`;

  return (
    <section className={replis.repli} style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <SectionPliableMobile titre={phrase}>
        <div
          data-reveal=""
          style={{
            display: "flex",
            alignItems: "center",
            gap: "44px",
            flexWrap: "wrap",
            padding: "52px 56px",
            borderRadius: "36px",
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 26px 60px -36px rgba(0,0,0,.34)",
          }}
        >
          {/* Marque décorative : le nom de l'entreprise est déjà dans le texte. */}
          <Image
            src="/assets/logo-migen-mark.png"
            alt=""
            width={500}
            height={500}
            style={{ height: "64px", width: "64px", flex: "none" }}
          />
          {/* `min(280px, 100%)` et non `280px` : la largeur minimale d'un
              enfant de flexbox l'empêche de rétrécir, et elle ne connaît pas
              la place disponible. Mesuré le 12/10, bandeau de consentement
              refusé, après hydratation : à 320 px le bloc sortait de 57 px de
              `.mg-site`, à 360 px de 17 px, et `.mg-site` étant en
              `overflow-x: clip`, le texte était COUPÉ sans qu'aucune barre de
              défilement ne le signale. 320 px moins les 40 px de marge de page
              et les 56 px de remplissage de la carte de chaque côté laissent
              128 px : la borne les dépassait de 152 px à elle seule.
              `min()` garde les 280 px partout où ils tiennent, donc le rendu
              de la maquette à 390 px et au-dessus ne bouge pas d'un pixel. */}
          <div style={{ flex: 1, minWidth: "min(280px, 100%)" }}>
            <div
              className={replis.enTeteBureau}
              style={{
                font: "600 calc(clamp(30px,3.4vw,50px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.04em",
              }}
            >
              On {verbe && <span style={{ color: "var(--acc)" }}>{verbe}</span>}
              {" ?"}
            </div>
            <p
              style={{
                font: "400 16.5px/1.65 var(--fb)",
                color: "var(--ink2)",
                margin: "14px 0 0",
                maxWidth: "62ch",
              }}
            >
              {
                "TPE, PME, ETI : avec nos différents services de prestation, vous bénéficiez d'une expertise toujours adaptée pour résoudre vos problèmes de maintenance industrielle."
              }
            </p>
          </div>
        </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
