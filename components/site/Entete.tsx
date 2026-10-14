"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import MegaMenu from "./MegaMenu";
import s from "./Entete.module.css";
import TiroirMobile from "./TiroirMobile";
import {
  NAV_CARRIERE,
  NAV_LP,
  NAV_PANNEAUX,
  type PanneauId,
  TELEPHONE_LP,
  TELEPHONE_SITE,
} from "./entete-donnees";

export interface EnteteProps {
  /**
   * Variante landing page : ancres dans la page, numéro et appel à l'action
   * propres à la LP. Faux par défaut, parce que 222 pages sur 223 sont des
   * pages de site et une seule est une landing page.
   */
  landingPage?: boolean;
  /**
   * Cible du « Diagnostic gratuit » du panneau Offres. Aucune URL de ce nom
   * n'existe dans l'inventaire : sans valeur, l'entrée ne s'affiche pas.
   */
  hrefDiagnostic?: string;
}

/** Style commun des entrées de la barre, hors couleurs (voir le module CSS). */
const ITEM_NAV: React.CSSProperties = {
  border: "none",
  padding: "9px 13px",
  borderRadius: 999,
  font: "500 14px var(--fb)",
  cursor: "pointer",
};

const SEPARATEUR: React.CSSProperties = {
  width: 1,
  height: 26,
  background:
    "linear-gradient(to bottom,transparent,var(--line) 30%,var(--line) 70%,transparent)",
  flex: "none",
  margin: "0 6px",
};

/** L'entrée de la rubrique courante : son adresse préfixe le chemin, que
 *  celui-ci porte ou non son slash final. */
function estActive(chemin: string, href: string): boolean {
  return `${chemin}/`.startsWith(href);
}

/**
 * Barre de navigation flottante : la capsule en verre dépoli, les quatre
 * mega-menus et le tiroir tactile.
 *
 * Composant client, et il doit l'être : survols, ouverture des panneaux,
 * tiroir, Échap et piège de focus sont tous des comportements de navigateur.
 *
 * La capsule rentre quand on descend et revient quand on remonte ou que le
 * curseur approche du haut : c'est `Moteurs.tsx` qui la pilote, par le
 * sélecteur `.mg-island > header` de la maquette. Ce balisage doit donc rester.
 * Un panneau ouvert (`aria-expanded="true"`) la garde affichée.
 */
export default function Entete({
  landingPage = false,
  hrefDiagnostic,
}: EnteteProps) {
  const [panneau, setPanneau] = useState<PanneauId | null>(null);
  const [tiroir, setTiroir] = useState(false);
  const barre = useRef<HTMLDivElement>(null);
  const chemin = usePathname() ?? "";

  const telephone = landingPage ? TELEPHONE_LP : TELEPHONE_SITE;
  const hrefCta = landingPage ? "#lp-contact" : "/contact/";
  const libelleCta = landingPage ? "Obtenir un devis" : "Décrire mon besoin";

  /** Vrai le temps de rendre le focus après Échap : ce focus-là ne doit pas
   *  rouvrir le panneau que l'on vient de fermer. */
  const focusRendu = useRef(false);

  /** Ferme le panneau et rend le focus à l'entrée qui l'avait ouvert. */
  function fermerPanneauAuClavier() {
    const ferme = panneau;
    setPanneau(null);
    if (ferme) {
      focusRendu.current = true;
      barre.current
        ?.querySelector<HTMLElement>(`[data-panneau="${ferme}"]`)
        ?.focus();
      focusRendu.current = false;
    }
  }

  function surTouche(evenement: React.KeyboardEvent) {
    if (evenement.key === "Escape" && panneau) {
      evenement.preventDefault();
      fermerPanneauAuClavier();
    }
  }

  return (
    <div
      className="mg-topwrap"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 80,
        padding: "14px 24px 0",
        pointerEvents: "none",
      }}
    >
      <div
        ref={barre}
        className="mg-island"
        onMouseLeave={() => setPanneau(null)}
        onKeyDown={surTouche}
        style={{
          position: "relative",
          // La maquette n'empile pas l'îlot : le fond assombri du tiroir, lui,
          // porte un z-index. Sans valeur ici, il recouvrirait la pilule et le
          // bouton de fermeture deviendrait inatteignable.
          zIndex: 50,
          maxWidth: 1200,
          margin: "0 auto",
          pointerEvents: "auto",
        }}
      >
        <header className={s.capsule}>
          <Link href="/" className={s.logo}>
            <Image
              src="/assets/logo-migen-mark.png"
              alt=""
              width={21}
              height={21}
              priority
              className={s.logoMarque}
            />
            <span className={s.logoMot}>migen</span>
            <span className={s.logoCopyright}>©</span>
          </Link>

          <span className="mg-nav" style={SEPARATEUR} />

          {landingPage ? (
            <nav
              className="mg-nav"
              aria-label="Sur cette page"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: "none",
              }}
            >
              {NAV_LP.map((lien) => (
                <a
                  key={lien.href}
                  href={lien.href}
                  className={s.itemNav}
                  style={{
                    ...ITEM_NAV,
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  {lien.libelle}
                </a>
              ))}
            </nav>
          ) : (
            <nav
              className="mg-nav"
              aria-label="Navigation principale"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: "none",
              }}
            >
              {NAV_PANNEAUX.map((entree) => (
                <Link
                  key={entree.id}
                  href={entree.href}
                  data-panneau={entree.id}
                  aria-expanded={panneau === entree.id}
                  aria-controls="mg-megamenu"
                  aria-current={
                    estActive(chemin, entree.href) ? "page" : undefined
                  }
                  className={s.itemNav}
                  style={{
                    ...ITEM_NAV,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => setPanneau(entree.id)}
                  onFocus={() => {
                    if (!focusRendu.current) setPanneau(entree.id);
                  }}
                  onClick={(evenement) => {
                    // UN VRAI LIEN DEPUIS LE 11/10. À la souris, le clic suit
                    // le lien : c'est ce que Mehdi demandait, une entrée de
                    // menu mène à sa page de niveau un.
                    //
                    // Au CLAVIER et au TACTILE il n'y a pas de survol pour
                    // ouvrir le panneau à la place du clic. Le premier appui
                    // ouvre donc le panneau sans naviguer, le second suit le
                    // lien : sans cela, ces deux entrées perdraient l'accès au
                    // méga-menu, qui est la seule porte vers les sous-pages.
                    const sansSurvol =
                      evenement.detail === 0 ||
                      (evenement.nativeEvent as PointerEvent).pointerType !==
                        "mouse";
                    if (sansSurvol && panneau !== entree.id) {
                      evenement.preventDefault();
                      setPanneau(entree.id);
                      return;
                    }
                    setPanneau(null);
                  }}
                >
                  {entree.libelle}
                </Link>
              ))}
              <Link
                href={NAV_CARRIERE.href}
                aria-current={
                  estActive(chemin, NAV_CARRIERE.href) ? "page" : undefined
                }
                className={s.itemNav}
                style={{
                  ...ITEM_NAV,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                onMouseEnter={() => setPanneau(null)}
              >
                {NAV_CARRIERE.libelle}
              </Link>
            </nav>
          )}

          <span className="mg-nav" style={SEPARATEUR} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flex: "none",
            }}
          >
            {/* <BasculeTheme /> : éteint comme dans la maquette, voir globals.css.
                Le numéro ne reste que sur la landing page : la barre du site
                du 14/10 n'en porte plus (décision de Mehdi). Il reste joignable
                par le tiroir, la barre d'action mobile et /contact/. */}
            {landingPage ? (
              <>
                <a
                  href={telephone.href}
                  className={`mg-tel ${s.tel}`}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 999,
                    font: "500 13.5px var(--fb)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {telephone.affichage}
                </a>
                <a href={hrefCta} className={s.cta} style={STYLE_CTA}>
                  {libelleCta}
                </a>
              </>
            ) : (
              <Link href={hrefCta} className={s.cta} style={STYLE_CTA}>
                {libelleCta}
              </Link>
            )}
            {/* Au téléphone, la barre de `MigenMobile.dc.html` : un rond
                « Appeler » et le bouton de menu anthracite. */}
            <a
              href={telephone.href}
              aria-label={`Appeler le ${telephone.affichage}`}
              className={s.appel}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            <button
              type="button"
              className={`mg-burger ${s.burger}`}
              aria-label="Menu"
              aria-expanded={tiroir}
              aria-controls="mg-tiroir"
              onClick={() => {
                setPanneau(null);
                setTiroir((ouvert) => !ouvert);
              }}
            >
              <span aria-hidden="true">{tiroir ? "×" : "≡"}</span>
            </button>
          </div>
        </header>

        {panneau && (
          <MegaMenu
            panneau={panneau}
            libelle={
              NAV_PANNEAUX.find((entree) => entree.id === panneau)?.libelle ??
              ""
            }
            hrefDiagnostic={hrefDiagnostic}
          />
        )}
      </div>

      <TiroirMobile
        ouvert={tiroir}
        landingPage={landingPage}
        onFermer={() => setTiroir(false)}
        telephone={telephone}
        hrefCta={hrefCta}
        libelleCta={libelleCta}
      />
    </div>
  );
}

const STYLE_CTA: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 17px",
  borderRadius: 999,
  font: "600 13.5px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 8px 20px -10px rgba(255,124,60,.85)",
};
