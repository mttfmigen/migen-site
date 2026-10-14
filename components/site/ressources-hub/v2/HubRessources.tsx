"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CandidatureTechniciens from "./CandidatureTechniciens";

import { BandeauDiagnostic, BlocFormulaire, ProcessSelection } from "./BlocsBas";
import { ALaUne, CarteGrille, CarteListe, MONO, PourBienDemarrer } from "./Cartes";
import ColonneFiltres from "./ColonneFiltres";
import { CONTENUS_ENTREPRISES, CONTENUS_TECHNICIENS } from "./donnees";
import type { ContenuRessource } from "./donnees";
import { colonnes, filtre, FILTRES_AU_REPOS, pastilles } from "./filtrage";
import type { CleTri, Espace, Filtres } from "./filtrage";
import s from "./hub.module.css";

/**
 * Le hub /ressources/, maquette « Ressources v2 » (`page-dc.jsx` et
 * `markup-indent.html`). La maquette fait foi, au mot et au pixel ; ce qui
 * s'en écarte est délibéré et listé ici :
 *   · l'en-tête et le pied sont ceux du site, pas la barre et le pied dessinés ;
 *   · chaque carte est un vrai lien ; un clic simple sur un article l'ouvre
 *     dans le lecteur latéral, à sa vraie URL (route interceptée
 *     `app/ressources/@lecteur`), là où la maquette posait une ancre `#/...` ;
 *   · le rendu serveur sert les 28 cartes des deux espaces : le filtre ne fait
 *     que masquer (Google lit tout, sans JavaScript) ;
 *   · le formulaire est celui du site (aucun champ nouveau), la candidature
 *     Techniciens est celle de la maquette, branchée sur /api/candidature ;
 *   · le test technicien pointe vers /test-technicien/ (l'URL de la maquette
 *     répond 404) ; « Sans engagement » est retiré (mot interdit du site).
 */

const ARTICLE = /^\/ressources\/articles\/[^/]+\/$/;
const PAR_URL = new Map(CONTENUS_ENTREPRISES.map((x) => [x.url, x] as const));
const UNE = [
  "/ressources/articles/cout-arret-de-production/",
  "/ressources/articles/ia-maintenance/",
  "/ressources/articles/organiser-service-maintenance/",
].map((u) => PAR_URL.get(u) as ContenuRessource);
const METIER = CONTENUS_TECHNICIENS.find((x) => x.url === "/carriere/technicien-de-maintenance/") as ContenuRessource;
const SOUS_GUIDES = CONTENUS_TECHNICIENS.filter((g) => g.url !== METIER.url && g.url.startsWith(METIER.url));
const CONTENUS: Record<Espace, readonly ContenuRessource[]> = { ent: CONTENUS_ENTREPRISES, tech: CONTENUS_TECHNICIENS };

const segment = (on: boolean): CSSProperties => ({
  border: "none",
  padding: "7px 11px",
  borderRadius: 9,
  cursor: "pointer",
  font: "600 12px var(--fb)",
  whiteSpace: "nowrap",
  transition: "all .2s",
  backgroundColor: on ? "var(--card)" : "transparent",
  color: on ? "var(--ink)" : "var(--ink2)",
  boxShadow: on ? "0 6px 16px -10px rgba(0,0,0,.35)" : "none",
});
const RAIL: CSSProperties = { display: "flex", gap: 2, padding: 3, borderRadius: 12, background: "var(--chip)" };

/** Largeurs du navigateur, lues comme la maquette (`mainW`). `null` au rendu serveur. */
function useLargeur() {
  const [l, setL] = useState<{ largeur: number; vw: number } | null>(null);
  useEffect(() => {
    const lis = () => setL({ largeur: document.documentElement.clientWidth || window.innerWidth, vw: window.innerWidth });
    lis();
    window.addEventListener("resize", lis);
    return () => window.removeEventListener("resize", lis);
  }, []);
  return l;
}

export default function HubRessources() {
  const router = useRouter();
  const [espace, setEspace] = useState<Espace>("ent");
  const [f, setF] = useState<Filtres>(FILTRES_AU_REPOS);
  const [tri, setTri] = useState<CleTri>("pert");
  const [vue, setVue] = useState<"grid" | "list">("grid");
  const [ouvert, setOuvert] = useState(false);
  const [etape, setEtape] = useState(2);
  const recherche = useRef<HTMLInputElement>(null);
  const fenetre = useLargeur();
  const ent = espace === "ent";

  // Cmd/Ctrl + K donne le focus à la recherche, comme la maquette.
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        recherche.current?.focus();
      }
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, []);

  const live = CONTENUS[espace];
  const items = filtre(live, f, tri, espace);
  const rang = new Map(items.map((x, i) => [x.url, i] as const));
  const chips = pastilles(f, espace);
  const auRepos = chips.length === 0;
  const n = items.length;
  const grille = fenetre ? colonnes(n, fenetre.largeur, fenetre.vw) : null;

  const majFiltres = (p: Partial<Filtres>) => setF((x) => ({ ...x, ...p }));
  const reinitialise = () => setF(FILTRES_AU_REPOS);
  const changeEspace = (e: Espace) => {
    setEspace(e);
    setF(FILTRES_AU_REPOS);
    if (window.scrollY > 400) window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const retire = (cle: string) => {
    if (cle === "cat") majFiltres({ cat: "all" });
    else if (cle === "dur") majFiltres({ dur: "all" });
    else if (cle === "q") majFiltres({ q: "" });
    else if (cle.startsWith("th:")) majFiltres({ ths: f.ths.filter((t) => t !== cle.slice(3)) });
    else majFiltres({ tags: f.tags.filter((t) => t !== cle.slice(4)) });
  };

  /** Une carte : visible si retenue, dans l'ordre du tri ; sinon masquée mais présente. */
  const carte = (x: ContenuRessource, sien: Espace) => {
    const i = sien === espace ? rang.get(x.url) : undefined;
    const visible = i !== undefined;
    const large = visible && vue === "grid" && !!grille?.large && i === n - 1;
    const style: CSSProperties = { order: i ?? 0, display: visible ? (vue === "grid" ? "flex" : "grid") : "none" };
    return vue === "grid" ? (
      <CarteGrille key={x.url} x={x} large={large} style={style} />
    ) : (
      <CarteListe key={x.url} x={x} style={style} />
    );
  };

  /** Clic simple sur un article : lecteur latéral, sans quitter le hub. */
  const ouvreLecteur = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href || a.target || !ARTICLE.test(href)) return;
    e.preventDefault();
    router.push(href, { scroll: false });
  };

  return (
    <div className={s.rs} data-hub-ressources="" onClick={ouvreLecteur}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -300,
          right: -220,
          width: 820,
          height: 820,
          borderRadius: 999,
          background: "radial-gradient(circle,rgba(255,124,60,.17),rgba(255,124,60,0) 62%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 160,
          left: -300,
          width: 680,
          height: 680,
          borderRadius: 999,
          background: "radial-gradient(circle,rgba(150,156,168,.2),rgba(150,156,168,0) 64%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        className={s.dots}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 900,
          pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(#000,transparent)",
          maskImage: "linear-gradient(#000,transparent)",
        }}
      />
      <div
        className={s.app}
        style={{
          position: "relative",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "92px 24px 0",
          display: "grid",
          gridTemplateColumns: "292px minmax(0,1fr)",
          gap: 28,
          alignItems: "start",
        }}
      >
        <ColonneFiltres
          espace={espace}
          live={live}
          filtres={f}
          nbActifs={chips.length}
          ouvert={ouvert}
          onEspace={changeEspace}
          onBascule={() => setOuvert((o) => !o)}
          onFiltres={majFiltres}
          onReinitialise={reinitialise}
        />
        <main style={{ minWidth: 0 }}>
          <header className={s.in} style={{ position: "relative", padding: "6px 0 0" }}>
            <nav
              aria-label="Fil d’Ariane"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                font: `500 12px ${MONO}`,
                color: "var(--ink3)",
              }}
            >
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 7, height: 7, borderRadius: 999, background: "#ff7c3c", boxShadow: "0 0 12px rgba(255,124,60,.8)" }}
                />
                migen
              </Link>
              <span aria-hidden="true">/</span>
              <span>ressources</span>
              <span aria-hidden="true">/</span>
              <span style={{ color: "var(--ink1)" }}>{ent ? "entreprises" : "techniciens"}</span>
            </nav>
            <h1
              style={{
                font: "600 clamp(36px,4.6vw,66px)/.97 var(--ft)",
                letterSpacing: "-.056em",
                margin: "18px 0 0",
                textWrap: "balance",
              }}
            >
              {ent ? "Le terrain, " : "Votre métier, "}
              <span style={{ color: "var(--ink3)" }}>{ent ? "mis par écrit." : "votre prochain poste."}</span>
            </h1>
            <p
              style={{
                font: "400 16.5px/1.6 var(--fb)",
                color: "var(--ink1)",
                margin: "16px 0 0",
                maxWidth: "62ch",
                textWrap: "pretty",
              }}
            >
              {ent
                ? "Méthodes, organisation, GMAO, intelligence artificielle : écrit par nos équipes, à partir de ce qu’elles voient sur les sites industriels."
                : "Fiches métiers, salaires, formations et notre process de sélection : tout pour faire carrière dans la maintenance industrielle."}
            </p>
            <label
              style={{
                marginTop: 26,
                display: "flex",
                alignItems: "center",
                gap: 14,
                minHeight: 62,
                padding: "0 10px 0 22px",
                borderRadius: 20,
                background: "var(--glass)",
                backdropFilter: "blur(22px) saturate(160%)",
                WebkitBackdropFilter: "blur(22px) saturate(160%)",
                border: "1px solid var(--gbd)",
                boxShadow: "var(--shadow)",
                cursor: "text",
              }}
            >
              <span aria-hidden="true" style={{ position: "relative", width: 18, height: 18, flex: "none" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 11,
                    height: 11,
                    border: "2px solid var(--ink2)",
                    borderRadius: 999,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 12,
                    width: 7,
                    height: 2,
                    background: "var(--ink2)",
                    borderRadius: 2,
                    transform: "rotate(45deg)",
                    transformOrigin: "0 50%",
                  }}
                />
              </span>
              <input
                ref={recherche}
                id="rs-q"
                type="search"
                value={f.q}
                onChange={(e) => majFiltres({ q: e.target.value })}
                placeholder={ent ? "Rechercher : GMAO, préventive, coût d’un arrêt…" : "Rechercher : salaire, alternance, automaticien…"}
                aria-label="Rechercher dans les ressources"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  background: "none",
                  outline: "none",
                  font: "400 16px var(--fb)",
                  color: "var(--ink)",
                }}
              />
              <span
                aria-live="polite"
                style={{
                  flex: "none",
                  padding: "7px 10px",
                  borderRadius: 10,
                  background: "var(--chip)",
                  font: `600 11.5px ${MONO}`,
                  color: "var(--ink2)",
                }}
              >
                {n}
                {n > 1 ? " résultats" : " résultat"}
              </span>
              <span
                aria-hidden="true"
                className={s.kbd}
                style={{
                  flex: "none",
                  padding: "6px 9px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  font: `600 11px ${MONO}`,
                  color: "var(--ink3)",
                }}
              >
                ⌘K
              </span>
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px 16px",
                marginTop: 14,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, minHeight: 34 }}>
                {auRepos ? (
                  <span style={{ font: "500 12.5px var(--fb)", color: "var(--ink3)" }}>
                    {ent
                      ? "Filtrez par format, sujet, temps de lecture ou mot-clé."
                      : "Filtrez par format, temps de lecture ou compétence."}
                  </span>
                ) : null}
                {chips.map((c) => (
                  <button
                    key={c.cle}
                    type="button"
                    className={s.fade}
                    aria-label={`Retirer le filtre ${c.libelle}`}
                    onClick={() => retire(c.cle)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 7px 6px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,124,60,.45)",
                      background: "var(--accw)",
                      color: "var(--acci)",
                      font: "600 12.5px var(--fb)",
                      cursor: "pointer",
                    }}
                  >
                    {c.libelle}
                    <span
                      aria-hidden="true"
                      style={{ position: "relative", width: 18, height: 18, borderRadius: 999, background: "rgba(255,124,60,.2)", flex: "none" }}
                    >
                      <span style={{ position: "absolute", left: 4, top: 8, width: 10, height: 1.5, background: "currentColor", transform: "rotate(45deg)" }} />
                      <span style={{ position: "absolute", left: 4, top: 8, width: 10, height: 1.5, background: "currentColor", transform: "rotate(-45deg)" }} />
                    </span>
                  </button>
                ))}
                {!auRepos ? (
                  <button
                    type="button"
                    onClick={reinitialise}
                    style={{
                      border: "none",
                      background: "none",
                      padding: "7px 6px",
                      font: "600 12.5px var(--fb)",
                      color: "var(--ink2)",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Tout effacer
                  </button>
                ) : null}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <div role="group" aria-label="Trier" style={RAIL}>
                  {(
                    [
                      ["pert", "Pertinence"],
                      ["court", "Plus courts"],
                      ["long", "Plus longs"],
                    ] as const
                  ).map(([k, l]) => (
                    <button key={k} type="button" aria-pressed={tri === k} onClick={() => setTri(k)} style={segment(tri === k)}>
                      {l}
                    </button>
                  ))}
                </div>
                <div role="group" aria-label="Affichage" style={RAIL}>
                  {(
                    [
                      ["grid", "Grille"],
                      ["list", "Liste"],
                    ] as const
                  ).map(([k, l]) => (
                    <button key={k} type="button" aria-pressed={vue === k} onClick={() => setVue(k)} style={segment(vue === k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <ALaUne une={UNE} hidden={!(ent && auRepos)} />
          <PourBienDemarrer metier={METIER} guides={SOUS_GUIDES} hidden={!(!ent && auRepos)} />

          <section id="rs-all" aria-labelledby="rs-all-titre" style={{ position: "relative", padding: "48px 0 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <h2
                id="rs-all-titre"
                style={{ font: "600 clamp(22px,2.2vw,28px)/1.1 var(--ft)", letterSpacing: "-.04em", margin: 0 }}
              >
                {auRepos ? (ent ? "Toute la bibliothèque" : "Toutes les fiches") : "Résultats"}
              </h2>
              <span style={{ font: `500 11.5px ${MONO}`, color: "var(--ink3)" }}>
                {n} sur {live.length}
              </span>
            </div>
            {n === 0 ? (
              <div
                className={s.fade}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: 28,
                  borderRadius: 24,
                  background: "var(--card)",
                  border: "1px dashed var(--line)",
                }}
              >
                <span style={{ font: "400 15px/1.6 var(--fb)", color: "var(--ink2)" }}>
                  Aucun contenu ne correspond à ces filtres.
                </span>
                <button
                  type="button"
                  onClick={reinitialise}
                  style={{
                    border: "none",
                    padding: "11px 18px",
                    borderRadius: 999,
                    background: "var(--knob)",
                    color: "var(--knobfg)",
                    font: "600 13px var(--fb)",
                    cursor: "pointer",
                  }}
                >
                  Réinitialiser
                </button>
              </div>
            ) : null}
            <div
              className={vue === "grid" && !grille ? s.grilleRepli : undefined}
              style={{
                display: "grid",
                gap: vue === "grid" ? 12 : 8,
                gridTemplateColumns:
                  vue === "grid" && grille ? `repeat(${grille.cols},minmax(0,1fr))` : vue === "list" ? "minmax(0,1fr)" : undefined,
              }}
            >
              {CONTENUS_ENTREPRISES.map((x) => carte(x, "ent"))}
              {CONTENUS_TECHNICIENS.map((x) => carte(x, "tech"))}
            </div>
          </section>

          {ent ? (
            <>
              <BandeauDiagnostic />
              <BlocFormulaire />
            </>
          ) : (
            <>
              <ProcessSelection etape={etape} onEtape={setEtape} />
              <CandidatureTechniciens />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
