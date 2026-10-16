"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import v3 from "./accueil-v3.module.css";

/**
 * LE CARROUSEL À POINTS DE LA V3 (« Site mobile », bloc `isRevs`), au
 * téléphone seulement.
 *
 * LA PISTE EST L'ÉLÉMENT DE L'APPELANT. Ses classe, style et attributs passent
 * tels quels : au-dessus de 880 px, c'est la grille de bureau d'avant, au
 * pixel, et les points (`data-mobile-seulement`) n'existent pas. En dessous,
 * `.piste` en fait une rangée qui défile au doigt, aimantée carte par carte.
 *
 * AU CLAVIER : la piste est une région nommée et focalisable (les flèches la
 * font défiler), et chaque point est un bouton nommé « {etiquette}, 2 sur 3 ».
 * La piste ne prend le focus qu'au téléphone : sur bureau, elle ne défile pas,
 * un arrêt de tabulation n'y mènerait à rien.
 */
interface Proprietes extends HTMLAttributes<HTMLDivElement> {
  /** Nom de la région et préfixe du nom de chaque point. */
  etiquette: string;
  children: ReactNode;
}

const TELEPHONE = "(max-width: 880px)";

export default function Carrousel({
  etiquette,
  className,
  children,
  ...reste
}: Proprietes) {
  const piste = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);
  const [telephone, setTelephone] = useState(false);
  const total = Children.count(children);

  useEffect(() => {
    const requete = window.matchMedia(TELEPHONE);
    const applique = () => setTelephone(requete.matches);
    applique();
    requete.addEventListener("change", applique);
    return () => requete.removeEventListener("change", applique);
  }, []);

  const enfants = () => Array.from(piste.current?.children ?? []) as HTMLElement[];

  function suitDefilement() {
    const element = piste.current;
    const [premier, second] = enfants();
    if (!element || !premier) return;
    const pas = second ? second.offsetLeft - premier.offsetLeft : premier.offsetWidth;
    // La dernière carte ne peut pas s'aimanter à gauche : en butée, elle est la courante.
    const enButee = element.scrollLeft >= element.scrollWidth - element.clientWidth - 2;
    setActif(enButee ? total - 1 : Math.round(element.scrollLeft / Math.max(1, pas)));
  }

  function va(rang: number) {
    const [premier] = enfants();
    const cible = enfants()[rang];
    if (!premier || !cible) return;
    const doux = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    piste.current?.scrollTo({
      left: cible.offsetLeft - premier.offsetLeft,
      behavior: doux ? "smooth" : "auto",
    });
  }

  return (
    <>
      <div
        {...reste}
        ref={piste}
        className={[className, v3.piste].filter(Boolean).join(" ")}
        onScroll={suitDefilement}
        {...(telephone
          ? { role: "region", "aria-label": etiquette, tabIndex: 0 }
          : {})}
      >
        {children}
      </div>
      {total > 1 ? (
        <div data-mobile-seulement="" className={v3.points}>
          {Array.from({ length: total }, (_, rang) => (
            <button
              key={rang}
              type="button"
              aria-label={`${etiquette}, ${rang + 1} sur ${total}`}
              aria-current={rang === actif ? "true" : undefined}
              onClick={() => va(rang)}
            >
              <span />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
