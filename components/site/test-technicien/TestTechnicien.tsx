"use client";

import { useEffect, useRef, useState } from "react";

import Accueil from "./Accueil";
import { QUESTIONS } from "./donnees-test";
import Question from "./Question";
import Resultat from "./Resultat";

/**
 * Le test technique public, première section de l'écran « Test technicien »
 * de la maquette (gabarit `isTest`). Trois états, comme `tStep` : 0 l'accueil,
 * 1 à 8 la question, au-delà le résultat et le corrigé.
 *
 * Tout reste dans cet état local : rien n'est envoyé, rien n'est stocké, ni
 * dans l'URL ni dans le navigateur. La maquette le promet sous le formulaire.
 */
export default function TestTechnicien() {
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<readonly (number | undefined)[]>([]);
  const cible = useRef<HTMLDivElement>(null);
  const boutonCommencer = useRef<HTMLButtonElement>(null);
  const etapeVue = useRef(etape);

  // L'élément cliqué disparaît à chaque changement d'état : sans ce report du
  // focus, le clavier et le lecteur d'écran repartiraient du haut de la page.
  // Comparé à l'étape déjà vue, pas à un drapeau de premier rendu : le mode
  // strict rejoue l'effet au montage. `preventScroll` garde le défilement de
  // la maquette.
  useEffect(() => {
    if (etapeVue.current === etape) return;
    etapeVue.current = etape;
    (etape === 0 ? boutonCommencer : cible).current?.focus({ preventScroll: true });
  }, [etape]);

  const commence = () => {
    setReponses([]);
    setEtape(1);
  };

  const choisit = (option: number) => {
    setReponses((avant) => {
      const suivantes = [...avant];
      suivantes[etape - 1] = option;
      return suivantes;
    });
    setEtape(etape + 1);
  };

  const recule = () => setEtape((e) => Math.max(1, e - 1));

  const recommence = () => {
    setReponses([]);
    setEtape(0);
  };

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}>
      {etape === 0 && <Accueil onCommence={commence} refCommence={boutonCommencer} />}
      {etape >= 1 && etape <= QUESTIONS.length && (
        <Question
          key={etape}
          rang={etape - 1}
          choisie={reponses[etape - 1]}
          onChoisit={choisit}
          onRecule={recule}
          refQuestion={cible}
        />
      )}
      {etape > QUESTIONS.length && (
        <Resultat reponses={reponses} onRecommence={recommence} refScore={cible} />
      )}
    </section>
  );
}
