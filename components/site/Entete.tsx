"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import MegaMenu from "./MegaMenu";
import s from "./Entete.module.css";
import { IconeTelephone } from "./mobile/BarreCollanteMobile";
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
   * Cible du « Diagnostic gratuit » du panneau Offres : l'outil réécrit par
   * `next.config.ts`, passé par `app/layout.tsx`. Sans valeur, l'entrée ne
   * s'affiche pas.
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

/**
 * Barre de navigation flottante : l'îlot en verre dépoli, les cinq mega-menus
 * et le tiroir tactile.
 *
 * Composant client, et il doit l'être : survols, ouverture des panneaux,
 * tiroir, Échap et piège de focus sont tous des comportements de navigateur.
 *
 * Deux écarts assumés avec la maquette. Les entrées à panneau sont de vrais
 * boutons qui ouvrent le panneau au clic, et ne naviguent donc plus : le lien
 * vers la page pilier vit à l'intérieur du panneau (navigation au clavier). Et
 * le bouton de bascule de thème, en `display:none` dans la maquette, est
 * affiché à la même place : le README de passation exige un choix de thème
 * mémorisé (voir BasculeTheme).
 */
export default function Entete({
  landingPage = false,
  hrefDiagnostic,
}: EnteteProps) {
  const [panneau, setPanneau] = useState<PanneauId | null>(null);
  const [tiroir, setTiroir] = useState(false);
  const barre = useRef<HTMLDivElement>(null);

  const telephone = landingPage ? TELEPHONE_LP : TELEPHONE_SITE;
  const hrefCta = landingPage ? "#lp-contact" : "/contact/";
  const libelleCta = landingPage ? "Obtenir un devis" : "Décrire mon besoin";

  /** Ferme le panneau et rend le focus à l'entrée qui l'avait ouvert. */
  function fermerPanneauAuClavier() {
    // Le focus D'ABORD : rendu à l'entrée, il la rouvrirait (son onFocus) si
    // la fermeture passait avant lui, quand Échap part d'un lien du panneau.
    if (panneau) {
      barre.current
        ?.querySelector<HTMLElement>(`[data-panneau="${panneau}"]`)
        ?.focus();
    }
    setPanneau(null);
  }

  function surTouche(evenement: React.KeyboardEvent) {
    if (evenement.key === "Escape" && panneau) {
      evenement.preventDefault();
      fermerPanneauAuClavier();
      return;
    }
    if (evenement.key === "Tab" && panneau) passerParLePanneau(evenement);
  }

  /**
   * Le feuillet est rendu APRÈS toute la barre : sans ce relais, Tab depuis une
   * entrée ouverte passait à l'entrée suivante, qui ouvre son propre panneau,
   * et les liens des quatre premiers panneaux n'étaient jamais atteints au
   * clavier (relevé le 14/10 sur Ressources). Tab entre dans le panneau, en
   * ressort vers l'entrée suivante ; Maj+Tab revient à l'entrée.
   */
  function passerParLePanneau(evenement: React.KeyboardEvent) {
    const entree = barre.current?.querySelector<HTMLElement>(
      `[data-panneau="${panneau}"]`,
    );
    const liens = [
      ...(barre.current?.querySelectorAll<HTMLElement>(
        "#mg-megamenu a[href], #mg-megamenu button",
      ) ?? []),
    ];
    const ici = evenement.target;
    const cible = evenement.shiftKey
      ? ici === liens[0] && entree
      : ici === entree
        ? liens[0]
        : ici === liens.at(-1) && entree?.nextElementSibling;
    if (cible instanceof HTMLElement) {
      evenement.preventDefault();
      cible.focus();
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
        <header
          className="mg-barre"
          style={{
            width: "max-content",
            maxWidth: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "4px 4px 4px 6px",
            borderRadius: 999,
            pointerEvents: "auto",
            willChange: "transform",
            transition:
              "transform 460ms cubic-bezier(.22,.72,.2,1),opacity 260ms ease",
            background: "var(--gsol)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 16px 38px -16px rgba(0,0,0,.36)",
          }}
        >
          <Link
            href="/"
            className={s.logo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flex: "none",
              padding: "7px 12px 7px 10px",
              borderRadius: 999,
            }}
          >
            <Image
              src="/assets/logo-migen-mark.png"
              alt=""
              width={21}
              height={21}
              priority
              style={{ height: 21, width: "auto", display: "block" }}
            />
            <span
              style={{
                font: "600 17.5px/1 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
              }}
            >
              migen
            </span>
            <span
              className="mg-copyright"
              style={{
                font: "500 9px/1 var(--fb)",
                color: "var(--ink4)",
                alignSelf: "flex-start",
                marginTop: 1,
              }}
            >
              ©
            </span>
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
                  className={s.itemNav}
                  style={{
                    ...ITEM_NAV,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => setPanneau(entree.id)}
                  onFocus={() => setPanneau(entree.id)}
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
                className={s.itemNav}
                style={{
                  ...ITEM_NAV,
                  display: "inline-flex",
                  alignItems: "center",
                }}
                onMouseEnter={() => setPanneau(null)}
                onFocus={() => setPanneau(null)}
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
            {/* <BasculeTheme /> : éteint comme dans la maquette, voir globals.css. */}
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
            {landingPage ? (
              <a href={hrefCta} className={s.cta} style={STYLE_CTA}>
                {libelleCta}
              </a>
            ) : (
              <Link href={hrefCta} className={s.cta} style={STYLE_CTA}>
                {libelleCta}
              </Link>
            )}
            {/* Le rond téléphone de la maquette mobile V3 (en-tête, T1), validé
                par Mehdi le 16/10. Il n'existe que sous 880 px (`.mg-tel-rond`,
                `app/globals.css`) et reste dans la barre menu ouvert : c'est le
                tiroir qui n'a pas de téléphone, pas la barre. Numéro et nom
                accessible suivent la variante, la LP garde donc le sien. */}
            <a
              href={telephone.href}
              className="mg-tel-rond"
              aria-label={`Appeler migen au ${telephone.affichage}`}
            >
              <IconeTelephone couleur="#1c1b19" />
            </a>
            <button
              type="button"
              className="mg-burger"
              aria-expanded={tiroir}
              aria-controls="mg-tiroir"
              onClick={() => {
                setPanneau(null);
                setTiroir((ouvert) => !ouvert);
              }}
              // La pilule anthracite écrite « Menu », « Fermer » quand le tiroir
              // est ouvert. Elle n'existe que sous 880 px (`.mg-burger`,
              // `app/globals.css`). Mesures de la V3 depuis le 16/10 : 44 px de
              // haut comme le rond voisin, 76 px de large au moins.
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                minWidth: 76,
                padding: "0 18px",
                borderRadius: 999,
                background: "#1c1b19",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                font: "600 14px var(--fb)",
                flex: "none",
              }}
            >
              {tiroir ? "Fermer" : "Menu"}
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
