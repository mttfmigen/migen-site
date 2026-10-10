"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Les moteurs d'animation de la maquette, portés à l'identique.
 *
 * POURQUOI UN SEUL COMPOSANT, monté une fois dans la mise en page racine : la
 * maquette les tient dans sa classe de logique, et ils travaillent tous sur le
 * DOM ENTIER par sélecteur d'attribut, pas sur un sous-arbre. Les répartir dans
 * les composants multiplierait les écouteurs de défilement et les boucles
 * d'animation par le nombre de sections, pour le même résultat.
 *
 * POURQUOI EN JAVASCRIPT ET PAS EN CSS : la première version du portage avait
 * remplacé la révélation au défilement par `animation-timeline: view()`. C'était
 * plus court, et c'était faux : la maquette ne révèle que ce qui était SOUS la
 * ligne au moment où le visiteur arrive, laisse le reste tranquille, échelonne
 * les barres de répartition, et fait rentrer la capsule de navigation quand on
 * descend. Rien de tout cela ne s'exprime en CSS seul, et le résultat se voyait :
 * « ça ressemble pas du tout à la maquette, y'a pas les animations ».
 *
 * TROIS MOTEURS, tous repris de « Migen - Site final.dc.html » :
 *   · startAutoRails   (lignes 7316 à 7331)  les rails qui défilent seuls
 *   · sweep / armReveal (lignes 7498 à 7598) la révélation et les barres
 *   · paintBar / paintFab (lignes 7384 à 7415) la capsule et la pastille
 *
 * CONTRAT D'ACCESSIBILITÉ, tenu par construction : rien n'est masqué en CSS.
 * C'est le JAVASCRIPT qui pose `opacity: 0`, et seulement sur ce qui est sous
 * la ligne de déclenchement. Sans JavaScript, la page s'affiche entière. Et
 * `prefers-reduced-motion` coupe tout : les rails ne partent pas, rien n'est
 * masqué, les barres sont posées à leur largeur finale.
 */

/** Ligne de déclenchement : 92 % de la hauteur de fenêtre, comme la maquette. */
const LIGNE = 0.92;

/** Vitesse des rails, en pixels par image. Valeur de la maquette. */
const VITESSE_RAIL = 0.45;

const SELECTEUR_RAILS = ".mg-autorail, .g3-offrail, .g3-refrail";

type Rail = HTMLElement & { _x?: number; _drag?: boolean };

function mouvementReduit(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* LE REGLAGE EST SUIVI EN CONTINU, plus lu une seule fois au montage. Mesure
   du 09/10 : le rail des hubs avancait encore de 27 px par seconde apres que
   le visiteur avait active « reduire les animations », et seul un rechargement
   complet l'arretait. Ce composant est monte UNE FOIS dans la mise en page
   racine : la lecture au montage survivait donc aussi a toutes les
   navigations internes. Meme motif que `accueil/CarteEtapes.tsx`. */
function abonneMouvementReduit(prevenir: () => void) {
  const requete = window.matchMedia("(prefers-reduced-motion: reduce)");
  requete.addEventListener("change", prevenir);
  return () => requete.removeEventListener("change", prevenir);
}

export default function Moteurs() {
  /* Le troisieme argument rend `false` cote serveur : le rendu serveur ne
     masque rien, c'est le JavaScript qui arme. */
  const reduit = useSyncExternalStore(
    abonneMouvementReduit,
    mouvementReduit,
    () => false,
  );

  useEffect(() => {
    const menages: (() => void)[] = [];

    /* Le visiteur vient de demander moins d'animations : on DESARME ce que la
       passe precedente avait masque. Sans cela, des blocs deja armes et encore
       sous la ligne resteraient a `opacity: 0` jusqu'au prochain defilement. */
    if (reduit) {
      document.querySelectorAll<HTMLElement>("[data-armed]").forEach((el) => {
        el.removeAttribute("data-armed");
        el.style.opacity = "1";
        el.style.transform = "none";
        const pct = el.getAttribute("data-bar");
        if (pct !== null) el.style.width = `${pct}%`;
      });
    }

    // ------------------------------------------------- rails qui défilent seuls
    if (!reduit) {
      let raf = 0;
      const pas = () => {
        document.querySelectorAll<Rail>(SELECTEUR_RAILS).forEach((r) => {
          // Un rail qui tient dans sa largeur n'a rien à faire défiler. Au
          // survol, au FOCUS CLAVIER et pendant un glissement, la main du
          // visiteur gagne.
          //
          // `:focus-within` n'est pas un ajout de confort. Mesure du 09/10 :
          // le rail avançait de 27 px par seconde pendant qu'un lien de carte
          // portait le focus, et poussait donc hors de l'écran la carte que
          // l'on venait d'atteindre. Le pointeur, dans cette même condition,
          // l'arrêtait déjà : la cause était l'absence du clavier, rien
          // d'autre. WCAG 2.2.2.
          //
          // La case de pause est cherchée dans la SECTION du rail, jamais
          // dedans : un contrôle placé dans le conteneur qui défile serait
          // emporté par le défilement et compterait dans `scrollWidth`, que la
          // première condition lit.
          if (
            r.scrollWidth <= r.clientWidth + 4 ||
            r.matches(":hover, :focus-within") ||
            r._drag ||
            r.closest("section")?.querySelector(".mg-pause-case:checked")
          ) {
            return;
          }
          r._x = (r._x ?? r.scrollLeft) + VITESSE_RAIL;
          if (r._x >= r.scrollWidth - r.clientWidth - 1) r._x = 0;
          r.scrollLeft = r._x;
        });
        raf = requestAnimationFrame(pas);
      };

      const surPointeur = (ev: PointerEvent) => {
        const cible = ev.target as Element | null;
        const r = cible?.closest?.(SELECTEUR_RAILS) as Rail | null;
        if (!r) return;
        r._drag = true;
        const relache = () => {
          r._drag = false;
          // On reprend là où le visiteur a lâché, sinon le rail saute.
          r._x = r.scrollLeft;
          document.removeEventListener("pointerup", relache);
        };
        document.addEventListener("pointerup", relache);
      };

      document.addEventListener("pointerdown", surPointeur);
      raf = requestAnimationFrame(pas);
      menages.push(() => {
        cancelAnimationFrame(raf);
        document.removeEventListener("pointerdown", surPointeur);
      });
    }

    // ------------------------------------- révélation au défilement et barres
    //
    // L'ÉTAT VIT SUR LES NOEUDS (`data-seen`, `data-armed`), jamais dans un
    // ensemble de références : React remplace les noeuds à chaque rendu, et une
    // collection capturée laisserait des blocs à `opacity: 0` pour toujours.
    // C'est le commentaire que porte la maquette, et la raison est la même ici.
    const balayage = (): number => {
      const ligne = window.innerHeight * LIGNE;
      let armes = 0;

      // Les barres de répartition : remises à zéro tant qu'elles sont sous la
      // ligne, puis elles filent à leur largeur cible, en escalier.
      document.querySelectorAll<HTMLElement>("[data-bar]").forEach((el) => {
        const dessous = el.getBoundingClientRect().top > ligne;
        if (!el.hasAttribute("data-seen")) {
          el.setAttribute("data-seen", "1");
          if (!reduit && dessous) {
            el.style.width = "0%";
            el.setAttribute("data-armed", "1");
          }
        }
        if (el.hasAttribute("data-armed") && !dessous) {
          el.removeAttribute("data-armed");
          const pct = el.getAttribute("data-bar");
          const rang = Number(el.getAttribute("data-bar-i") || 0);
          window.setTimeout(() => {
            el.style.width = `${pct}%`;
          }, 90 + rang * 110);
        } else if (el.hasAttribute("data-armed")) {
          armes += 1;
        }
      });

      // 1. On révèle d'abord, sans condition : un bloc au-dessus de la ligne
      //    redevient visible avant que quoi que ce soit d'autre ne tourne.
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.getBoundingClientRect().top < ligne) {
          if (el.hasAttribute("data-armed")) {
            el.style.opacity = "1";
            el.style.transform = "none";
            el.removeAttribute("data-armed");
          }
        } else if (el.hasAttribute("data-armed")) {
          armes += 1;
        }
      });

      // 2. On arme ensuite, et seulement ce qui est encore sous la ligne et
      //    n'a jamais été examiné.
      if (!reduit) {
        document
          .querySelectorAll<HTMLElement>("[data-reveal]:not([data-seen])")
          .forEach((n) => {
            n.setAttribute("data-seen", "1");
            if (n.getBoundingClientRect().top <= ligne) return;
            n.style.opacity = "0";
            n.style.transform = "translateY(22px)";
            n.style.transition =
              "opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)";
            n.setAttribute("data-armed", "1");
            armes += 1;
          });
      }

      return armes;
    };

    // --------------------------------- capsule de navigation et pastille d'appel
    let dernierY = window.scrollY;
    let barreRentree = false;
    let curseurEnHaut = false;
    let barrePeinte: boolean | null = null;
    let pastillePeinte: boolean | null = null;

    const peinsPastille = () => {
      const fab = document.querySelector<HTMLElement>(".mg-fab");
      if (!fab) return;
      const pied = document.querySelector("footer");
      // Visible dès qu'on a quitté le héros, masquée au pied de page, qui porte
      // déjà son propre appel à l'action.
      const presDuPied =
        !!pied && pied.getBoundingClientRect().top < window.innerHeight - 40;
      const montre = window.scrollY > 620 && !presDuPied;
      if (montre === pastillePeinte) return;
      pastillePeinte = montre;
      fab.style.opacity = montre ? "1" : "0";
      fab.style.transform = montre
        ? "translateY(0) scale(1)"
        : "translateY(14px) scale(.96)";
      fab.style.pointerEvents = montre ? "auto" : "none";
    };

    const peinsBarre = () => {
      peinsPastille();
      const barre = document.querySelector<HTMLElement>(".mg-island > header");
      if (!barre) return;
      // Un menu ou un tiroir ouvert garde la capsule : elle porte le bouton qui
      // vient de l'ouvrir. L'attribut est posé par l'en-tête.
      const ouvert =
        document.querySelector('.mg-island [aria-expanded="true"]') !== null;
      const cache = barreRentree && !curseurEnHaut && !ouvert && !reduit;
      if (cache === barrePeinte) return;
      barrePeinte = cache;
      barre.style.transform = cache ? "translateY(-150%)" : "translateY(0)";
      barre.style.opacity = cache ? "0" : "1";
      barre.style.pointerEvents = cache ? "none" : "auto";
      // Rentrée, la capsule ne doit plus intercepter les clics du contenu.
      if (barre.parentElement) {
        barre.parentElement.style.pointerEvents = cache ? "none" : "auto";
      }
    };

    const surDefilement = () => {
      const y = window.scrollY;
      const descend = y > dernierY + 4;
      const monte = y < dernierY - 4;
      if (descend && y > 140) barreRentree = true;
      else if (monte || y <= 140) barreRentree = false;
      if (descend || monte) dernierY = y;
      peinsBarre();
    };

    // La capsule revient dès que le curseur approche du haut de la page.
    const surSouris = (ev: MouseEvent) => {
      const haut = ev.clientY < 96;
      if (haut === curseurEnHaut) return;
      curseurEnHaut = haut;
      peinsBarre();
    };

    // ------------------------------------------------------------ la boucle
    let raf: number | null = null;
    const tour = () => {
      raf = null;
      surDefilement();
      const armes = balayage();
      // On continue tant que quelque chose est armé OU qu'un candidat n'a
      // jamais été examiné : le rendu différé de Next fait apparaître des
      // noeuds bien après le montage.
      const neuf = document.querySelector(
        "[data-reveal]:not([data-seen]), [data-bar]:not([data-seen])",
      );
      if (armes > 0 || neuf) raf = requestAnimationFrame(tour);
    };
    const relance = () => {
      if (raf === null) raf = requestAnimationFrame(tour);
    };

    window.addEventListener("scroll", relance, { passive: true });
    window.addEventListener("resize", relance);
    window.addEventListener("mousemove", surSouris, { passive: true });

    // Un observateur de mutations relance la boucle quand de nouveaux noeuds
    // arrivent : une navigation côté client remplace tout le contenu.
    const observateur = new MutationObserver(relance);
    observateur.observe(document.body, { childList: true, subtree: true });

    relance();

    menages.push(() => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", relance);
      window.removeEventListener("resize", relance);
      window.removeEventListener("mousemove", surSouris);
      observateur.disconnect();
    });

    return () => menages.forEach((m) => m());
  }, [reduit]);

  return null;
}
