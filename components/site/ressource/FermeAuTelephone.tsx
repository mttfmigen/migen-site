"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * LA LISTE DE LA FAQ, QUI REFERME SES QUESTIONS AU TÉLÉPHONE SEULEMENT.
 *
 * La FAQ du gabarit 01 ouvre sa première question, et c'est la capture de
 * BUREAU qui le dit (voir `Questions` dans `PageRessource`). La maquette
 * mobile v2, elle, sert toutes les questions repliées (questions de la FAQ en
 * `<details name="faq">`, aucune ouverte) : sous 880 px, la première réponse
 * ouverte coûtait 300 à 400 px d'écran avant la deuxième question.
 *
 * MÊME MÉCANIQUE QUE `blocs/SectionPliableMobile` : le HTML servi garde
 * `open` (Google et les contrôles lisent tout), un effet le retire après
 * montage et sous 880 px seulement, donc aucun écart d'hydratation et aucun
 * changement sur bureau. Rien n'est retiré du DOM.
 *
 * C'EST LE CONTENEUR DE LA LISTE LUI-MÊME, avec son style, et non une
 * enveloppe en plus : une `<div>` en `display: contents` intercalée faisait
 * mesurer à `verification-responsive.mjs` des questions « dans un conteneur
 * de 0 px ».
 */
export default function FermeAuTelephone({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) {
  const liste = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 880px)").matches) return;
    liste.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((d) => {
      d.open = false;
    });
  }, []);

  return (
    <div ref={liste} style={style}>
      {children}
    </div>
  );
}
