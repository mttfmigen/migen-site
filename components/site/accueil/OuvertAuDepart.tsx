"use client";

import { useEffect, useRef, type ReactNode } from "react";

import m from "./AccueilMobile.module.css";

/**
 * LA PREMIÈRE CARTE DE L'ACCUEIL EST OUVERTE AU DÉPART, comme dans la maquette
 * V3 « Site mobile » (« 01 Certifications », dépliée à l'arrivée).
 *
 * `SectionPliableMobile` referme chaque carte au montage, sous 881 px. Cette
 * enveloppe rouvre la sienne juste après, dans le même passage d'effets (ceux
 * des enfants passent avant ceux du parent) : rien n'est peint entre les deux.
 * Le visiteur peut ensuite la refermer, comme toute carte. La feuille montre
 * son contenu dès le premier affichage (`.ouvertAuDepart`), pour que
 * l'hydratation ne décale rien.
 *
 * Une enveloppe plutôt qu'une option de la section : la carte appartient à un
 * autre chantier, et la règle « la première est ouverte » est celle de la page.
 */
export default function OuvertAuDepart({ children }: { children: ReactNode }) {
  const enveloppe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carte = enveloppe.current?.querySelector<HTMLDetailsElement>("details[data-pliable-mobile]");
    if (carte) carte.open = true;
  }, []);

  return (
    <div ref={enveloppe} className={m.ouvertAuDepart}>
      {children}
    </div>
  );
}
