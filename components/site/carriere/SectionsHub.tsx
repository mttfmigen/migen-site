import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import { LARGEUR, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { BandeFiche, CarteFiche } from "@/types/metier";

import type { HubCarriere, SectionEtapesHub } from "./donnees-hub";
import styles from "./HubCarriere.module.css";

/**
 * Les écrans du hub `/carriere/` que le gabarit 07 (`SectionsFicheMetier`)
 * ne dessine pas : étapes à cinq et bandeau « 10 % », refus, hubs, avis,
 * « Pour aller plus loin » avec sa photo. Chaque valeur de dessin est
 * recopiée de `MigenCarriere.dc.html` (blocs `isSteps`, `isFunnel`, `isNo`,
 * `isHubs`, `isAvis`, `hasCallout`, `rel`) et se retrouve dans la capture
 * `maquette/rendu/carriere.html`.
 */

const MONO_ORDINAL = (i: number) => String(i + 1).padStart(2, "0");

const TITRE2: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  color: "var(--ink)",
  textWrap: "balance",
};

/** Un paragraphe du corpus, liens et gras rendus. */
export function Paragraphe({ texte, style }: { texte: string; style: CSSProperties }) {
  return (
    <p className={styles.texteLie} style={{ textWrap: "pretty", ...style }}>
      <TexteRiche texte={texte} />
    </p>
  );
}

/** Rythme vertical de la maquette, révélation au défilement (`Moteurs.tsx`). */
export function Enveloppe({ children, fin = false }: { children: ReactNode; fin?: boolean }) {
  return (
    <section style={{ padding: `var(--sec) 0 ${fin ? "var(--sec)" : "0"}` }}>
      <div data-reveal="">{children}</div>
    </section>
  );
}

/** Le bouton orange qui vise le formulaire de la page. */
export function BoutonPostuler({ libelle = "Postuler" }: { libelle?: string }) {
  return (
    <a
      href="#postuler"
      className={styles.boutonOrange}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "15px 26px",
        borderRadius: 999,
        background: "var(--acc)",
        color: "#fff",
        font: "600 15px var(--fb)",
        whiteSpace: "nowrap",
        boxShadow: "0 12px 30px -12px rgba(255,124,60,.9)",
      }}
    >
      {libelle}
    </a>
  );
}

/** La bande orange pâle qui ferme une section (`hasCallout`). */
function Bande({ bande }: { bande?: BandeFiche }) {
  if (!bande?.texte) return null;
  return (
    <div style={{ ...LARGEUR, margin: "28px auto 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 22,
          flexWrap: "wrap",
          padding: "24px 28px 24px 32px",
          borderRadius: 28,
          background: "var(--acc-w)",
          border: "1.5px solid rgba(255,124,60,.3)",
        }}
      >
        <div
          className={styles.texteLie}
          style={{
            font: "500 16px/1.6 var(--fb)",
            color: "var(--ink)",
            flex: "1 1 0%",
            minWidth: 260,
            maxWidth: "70ch",
          }}
        >
          <TexteRiche texte={bande.texte} />
        </div>
        <BoutonPostuler />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- étapes */

/** `stepGrid` de la maquette : six colonnes pour cinq étapes (2+2+2 puis 3+3). */
function colonnes(n: number): number {
  if (n === 5) return 6;
  if (n === 4) return 4;
  if (n % 3 === 0) return 3;
  return Math.min(Math.max(n, 1), 4);
}

export function EtapesHub({ section }: { section: SectionEtapesHub }) {
  const { surtitre, titre, intros, etapes, entonnoir, bande } = section;
  if (!etapes.length) return null;
  const n = etapes.length;
  return (
    <Enveloppe>
      <div style={LARGEUR}>
        <div style={{ maxWidth: 720, marginBottom: 34 }}>
          <div style={SURTITRE}>{surtitre}</div>
          <h2 style={{ ...TITRE2, margin: "0 0 18px", maxWidth: "22ch" }}>{titre}</h2>
          {intros?.map((t) => (
            <Paragraphe
              key={t}
              texte={t}
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 14px",
                maxWidth: "62ch",
              }}
            />
          ))}
        </div>
        <div
          className={styles.etapes}
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: `repeat(${colonnes(n)},minmax(0,1fr))`,
          }}
        >
          {etapes.map((etape, i) => (
            <div
              key={etape.titre}
              className={n % 2 === 1 && i === n - 1 ? styles.dernierImpair : undefined}
              style={{
                ...(n === 5 ? { gridColumn: `span ${i < 3 ? 2 : 3}` } : {}),
                ...VERRE,
                borderRadius: 24,
                boxShadow: "0 22px 50px -32px rgba(0,0,0,.3)",
                position: "relative",
                padding: "24px 24px 26px",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: "var(--acc)",
                    color: "#fff",
                    font: "600 13px/38px var(--fb)",
                    textAlign: "center",
                    flex: "0 0 auto",
                  }}
                >
                  {MONO_ORDINAL(i)}
                </span>
                <span
                  style={{
                    flex: "1 1 0%",
                    height: 2,
                    borderRadius: 999,
                    background: "linear-gradient(90deg,rgba(255,124,60,.5),rgba(255,124,60,0))",
                  }}
                />
              </div>
              <div
                style={{
                  font: "600 16.5px/1.35 var(--ft)",
                  letterSpacing: "-.02em",
                  marginBottom: 8,
                }}
              >
                {etape.titre}
              </div>
              <div style={{ font: "400 14px/1.6 var(--fb)", color: "var(--ink2)" }}>
                <TexteRiche texte={etape.texte} />
              </div>
            </div>
          ))}
        </div>
        {entonnoir ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 30,
              padding: "22px 28px",
              borderRadius: 28,
              background: "var(--panel)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                font: "600 44px/1 var(--ft)",
                letterSpacing: "-.05em",
                color: "var(--acc)",
              }}
            >
              10&nbsp;%
            </span>
            <span
              style={{
                font: "400 15px/1.55 var(--fb)",
                color: "rgba(255,255,255,.72)",
                flex: "1 1 0%",
                minWidth: 220,
              }}
            >
              des techniciens sont retenus. Les résultats des entretiens vous sont partagés.
            </span>
          </div>
        ) : null}
      </div>
      <Bande bande={bande} />
    </Enveloppe>
  );
}

/* ------------------------------------------------------------------ refus */

export function Refus({
  surtitre,
  titre,
  intros,
  refus,
}: {
  surtitre: string;
  titre: string;
  intros?: string[];
  refus: CarteFiche[];
}) {
  if (!refus.length) return null;
  return (
    <Enveloppe>
      <div style={{ padding: "0 24px" }}>
        <div
          className={styles.pad}
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "var(--panel)",
            borderRadius: 40,
            padding: 56,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 520,
              height: 520,
              right: -200,
              top: -260,
              background: "radial-gradient(circle,rgba(255,124,60,.26),transparent 68%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div style={SURTITRE}>{surtitre}</div>
            <h2 style={{ ...TITRE2, color: "#fff", margin: "0 0 18px", maxWidth: "22ch" }}>
              {titre}
            </h2>
            {intros?.map((t) => (
              <Paragraphe
                key={t}
                texte={t}
                style={{
                  font: "400 16px/1.7 var(--fb)",
                  color: "rgba(255,255,255,.66)",
                  margin: "0 0 14px",
                  maxWidth: "60ch",
                }}
              />
            ))}
            <div
              className={styles.deuxColonnes}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "26px 40px",
                marginTop: 22,
              }}
            >
              {refus.map((r) => (
                <div
                  key={r.titre}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "34px minmax(0,1fr)",
                    gap: 14,
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,.14)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      background: "rgba(255,255,255,.1)",
                      color: "var(--acc)",
                      font: "600 15px/34px var(--fb)",
                      textAlign: "center",
                    }}
                  >
                    ×
                  </span>
                  <div>
                    <div
                      style={{
                        font: "600 17px/1.35 var(--ft)",
                        color: "#fff",
                        marginBottom: 6,
                      }}
                    >
                      {r.titre}
                    </div>
                    <div
                      style={{
                        font: "400 14px/1.6 var(--fb)",
                        color: "rgba(255,255,255,.62)",
                      }}
                    >
                      {r.texte}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Enveloppe>
  );
}

/* ------------------------------------------------------------------- hubs */

/** L'en-tête à deux colonnes des hubs : titre à gauche, chapeau à droite. */
function EnteteDeuxColonnes({
  surtitre,
  titre,
  colonnes: gabarit,
  ecart,
  largeurTitre,
  droite,
}: {
  surtitre: string;
  titre: string;
  colonnes: string;
  ecart: number;
  largeurTitre: string;
  droite: ReactNode;
}) {
  return (
    <div
      className={styles.deuxColonnes}
      style={{
        display: "grid",
        gridTemplateColumns: gabarit,
        gap: ecart,
        alignItems: "end",
        marginBottom: 30,
      }}
    >
      <div>
        <div style={SURTITRE}>{surtitre}</div>
        <h2 style={{ ...TITRE2, margin: 0, maxWidth: largeurTitre }}>{titre}</h2>
      </div>
      <div>{droite}</div>
    </div>
  );
}

export function Hubs({
  surtitre,
  titre,
  intro,
  hubs,
}: {
  surtitre: string;
  titre: string;
  intro: string;
  hubs: HubCarriere[];
}) {
  if (!hubs.length) return null;
  return (
    <Enveloppe>
      <div style={LARGEUR}>
        <EnteteDeuxColonnes
          surtitre={surtitre}
          titre={titre}
          colonnes="minmax(0,1fr) minmax(0,1fr)"
          ecart={40}
          largeurTitre="18ch"
          droite={
            <Paragraphe
              texte={intro}
              style={{
                font: "400 15.5px/1.65 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 10px",
              }}
            />
          }
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
            gap: 12,
          }}
        >
          {hubs.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              prefetch={false}
              className={styles.carteHub}
              style={{
                position: "relative",
                display: "block",
                height: 300,
                borderRadius: 24,
                overflow: "hidden",
                background: "#1c1b19",
                color: "#fff",
                transition: "transform var(--tr)",
              }}
            >
              <Image
                src={hub.photo}
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 380px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat,.6)) brightness(.8)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top,rgba(18,17,16,.92) 0%,rgba(18,17,16,.1) 65%)",
                }}
              />
              {hub.siege ? (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "#ff7c3c",
                    color: "#fff",
                    font: "600 11.5px var(--fb)",
                  }}
                >
                  Siège
                </span>
              ) : null}
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
                <div
                  style={{
                    font: "600 11px var(--fb)",
                    letterSpacing: ".13em",
                    textTransform: "uppercase",
                    color: "#ff7c3c",
                    marginBottom: 6,
                  }}
                >
                  Hub
                </div>
                <div
                  style={{
                    font: "600 24px/1.1 var(--ft)",
                    letterSpacing: "-.03em",
                    marginBottom: 6,
                  }}
                >
                  {hub.nom}
                </div>
                <div
                  style={{
                    font: "400 13.5px/1.5 var(--fb)",
                    color: "rgba(255,255,255,.78)",
                    marginBottom: 10,
                  }}
                >
                  {hub.zone}
                </div>
                <span style={{ font: "600 13.5px var(--fb)", color: "#ff7c3c" }}>
                  Voir le hub →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Enveloppe>
  );
}

/* ------------------------------------------------------------------- avis */

export function Avis({
  surtitre,
  titre,
  intro,
  avis,
  fin,
}: {
  surtitre: string;
  titre: string;
  intro: string;
  avis: { texte: string; libelle: string }[];
  fin?: string;
}) {
  if (!avis.length) return null;
  return (
    <Enveloppe>
      <div style={LARGEUR}>
        <EnteteDeuxColonnes
          surtitre={surtitre}
          titre={titre}
          colonnes="1.05fr .95fr"
          ecart={48}
          largeurTitre="20ch"
          droite={
            <Paragraphe
              texte={intro}
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "52ch",
              }}
            />
          }
        />
        <div
          className={styles.avis}
          style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 14 }}
        >
          {avis.map((a, i) => {
            const sombre = i === 0;
            return (
              <div
                key={a.libelle}
                style={{
                  gridColumn: `span ${avis.length === 5 && i >= 3 ? 3 : 2}`,
                  position: "relative",
                  ...(sombre ? { background: "var(--panel)" } : VERRE),
                  borderRadius: 28,
                  padding: "28px 28px 26px",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    font: "600 52px/.7 var(--ft)",
                    color: "var(--acc)",
                    display: "block",
                    marginBottom: 14,
                  }}
                >
                  “
                </span>
                <p
                  style={{
                    font: "500 17px/1.5 var(--fb)",
                    color: sombre ? "#fff" : "var(--ink)",
                    margin: "0 0 16px",
                    textWrap: "pretty",
                  }}
                >
                  {a.texte}
                </p>
                <div
                  style={{
                    font: "600 10.5px var(--fb)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: sombre ? "rgba(255,255,255,.55)" : "var(--ink3)",
                  }}
                >
                  {a.libelle}
                </div>
              </div>
            );
          })}
        </div>
        {fin ? (
          <div
            className={styles.deuxColonnes}
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "1.2fr .8fr",
              gap: 32,
              alignItems: "center",
              padding: "30px 34px",
              borderRadius: 28,
              background: "var(--acc-w)",
              border: "1px solid rgba(255,124,60,.28)",
            }}
          >
            <div>
              <Paragraphe
                texte={fin}
                style={{
                  font: "400 15.5px/1.7 var(--fb)",
                  color: "var(--ink1)",
                  margin: 0,
                  maxWidth: "66ch",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <a
                href="#postuler"
                className={styles.boutonOrange}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "14px 24px",
                  borderRadius: 999,
                  background: "var(--acc)",
                  color: "#fff",
                  font: "600 15px var(--fb)",
                  whiteSpace: "nowrap",
                }}
              >
                Voir les postes ouverts
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </Enveloppe>
  );
}

/* --------------------------------------------- « Pour aller plus loin » */

/** Les cartes-photos de fin, du hub ET des 13 fiches métier (même dessin).
 *  Sans photo dans la donnée, le cadre `var(--ph)` reste vide. */
export function LiensPhoto({ items }: { items: { libelle: string; href: string; photo?: string }[] }) {
  if (!items.length) return null;
  return (
    <Enveloppe fin>
      <div style={LARGEUR}>
        <div style={SURTITRE}>Pour aller plus loin</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
            gap: 14,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={styles.carteLien}
              style={{
                ...VERRE,
                borderRadius: 24,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "transform var(--tr)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 140,
                  background: "var(--ph)",
                  overflow: "hidden",
                }}
              >
                {item.photo ? (
                  <Image
                    src={item.photo}
                    alt=""
                    fill
                    sizes="300px"
                    style={{ objectFit: "cover", filter: "saturate(var(--sat))" }}
                  />
                ) : null}
              </div>
              <div
                style={{
                  padding: "18px 20px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    font: "600 16px/1.3 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {item.libelle}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "var(--acc)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    // La maquette n'en pose aucun : `normal`, pas les 24 px hérités.
                    lineHeight: "normal",
                  }}
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Enveloppe>
  );
}
