"use client";

import Image from "next/image";
import Link from "next/link";
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
    const ferme = panneau;
    setPanneau(null);
    if (ferme) {
      barre.current
        ?.querySelector<HTMLElement>(`[data-panneau="${ferme}"]`)
        ?.focus();
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
        <header
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
                <button
                  key={entree.id}
                  type="button"
                  data-panneau={entree.id}
                  aria-expanded={panneau === entree.id}
                  aria-controls="mg-megamenu"
                  className={s.itemNav}
                  style={ITEM_NAV}
                  onMouseEnter={() => setPanneau(entree.id)}
                  onClick={(evenement) => {
                    // À la souris, `mouseenter` a déjà ouvert le panneau avant
                    // que le clic n'arrive : basculer ici le refermait dans la
                    // foulée, et l'entrée paraissait morte. Le clic ne referme
                    // donc que pour le clavier et le tactile, qui n'ont pas de
                    // survol pour ouvrir à leur place.
                    const sansSurvol =
                      evenement.detail === 0 ||
                      (evenement.nativeEvent as PointerEvent).pointerType !==
                        "mouse";
                    setPanneau((actuel) =>
                      actuel === entree.id && sansSurvol ? null : entree.id,
                    );
                  }}
                >
                  {entree.libelle}
                </button>
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
            <button
              type="button"
              className="mg-burger"
              aria-label="Menu"
              aria-expanded={tiroir}
              aria-controls="mg-tiroir"
              onClick={() => {
                setPanneau(null);
                setTiroir((ouvert) => !ouvert);
              }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "var(--chip)",
                border: "none",
                cursor: "pointer",
                flexDirection: "column",
                gap: 4,
                padding: 0,
                flex: "none",
              }}
            >
              <span style={BARRE_BURGER} />
              <span style={BARRE_BURGER} />
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

      {tiroir && (
        <TiroirMobile
          landingPage={landingPage}
          onFermer={() => setTiroir(false)}
          telephone={telephone}
          hrefCta={hrefCta}
          libelleCta={libelleCta}
        />
      )}
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

const BARRE_BURGER: React.CSSProperties = {
  display: "block",
  width: 15,
  height: 1.5,
  background: "var(--ink)",
};
