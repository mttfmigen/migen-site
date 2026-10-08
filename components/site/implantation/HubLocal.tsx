import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE, VERRE } from "@/components/site/blocs/habillage";
import type { HubLocal as DonneesHubLocal } from "@/types/implantation";

import styles from "./PageVille.module.css";

/**
 * Écran « Hub local » du gabarit 04 Ville, relevé sur les captures du 07/10
 * (`maquette/rendu/implantations--lyon.html`, blocs 403 à 435, et
 * `implantations--maintenance-industrielle-angers.html`) et sur sa source,
 * `MigenExpertise.dc.html` (`sc-if isCity`). À gauche le panneau sombre à
 * photo (badge, nom du hub, phrase, bouton, téléphone), à droite les cartes
 * du bassin, dessous la bande des zones en pastilles.
 *
 * Le téléphone et le préfixe « Aperçu Envato · » sont la copie fixe du
 * gabarit, identique sur les 66 captures. Tout le reste vient de la page.
 */

/** La ligne commune du site, écrite en dur par la maquette sur les 66 captures. */
const TELEPHONE = "04 78 33 72 05";
const TELEPHONE_HREF = "tel:+33478337205";

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,44px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.045em",
  margin: "0 0 28px",
  maxWidth: "26ch",
  textWrap: "balance",
  color: "var(--ink)",
};

const GRILLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)",
  gap: 14,
  alignItems: "stretch",
};

const PANNEAU: CSSProperties = {
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "#1c1b19",
  minHeight: 420,
};

const CREDIT: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  padding: "5px 10px",
  borderRadius: 999,
  background: "rgba(0,0,0,.45)",
  color: "rgba(255,255,255,.85)",
  font: "500 10.5px var(--fb)",
  backdropFilter: "blur(8px)",
};

const VOILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top,rgba(18,17,16,.94) 8%,rgba(18,17,16,.25) 70%)",
};

const BAS: CSSProperties = {
  position: "absolute",
  left: 28,
  right: 28,
  bottom: 28,
  color: "#fff",
};

const BADGE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.14)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  font: "600 12px var(--fb)",
  marginBottom: 16,
  whiteSpace: "nowrap",
};

const PUCE: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  background: "#ff7c3c",
};

const NOM: CSSProperties = {
  font: "600 calc(clamp(26px,2.6vw,34px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.04em",
  marginBottom: 10,
};

const TEXTE: CSSProperties = {
  font: "400 15px/1.6 var(--fb)",
  color: "rgba(255,255,255,.8)",
  margin: "0 0 20px",
  maxWidth: "42ch",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "13px 20px",
  borderRadius: 999,
  background: "#ff7c3c",
  color: "#fff",
  font: "600 14.5px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "0 10px 24px -12px rgba(255,124,60,.7)",
};

const TEL: CSSProperties = {
  font: "600 14.5px var(--fb)",
  color: "#fff",
  padding: "13px 6px",
};

const CARTES: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: 14,
  alignContent: "stretch",
};

const CARTE: CSSProperties = {
  ...VERRE,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "22px 22px 20px",
  color: "var(--ink)",
  transition: "transform var(--tr)",
};

const CARTE_SURTITRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".13em",
  textTransform: "uppercase",
  color: "var(--acc)",
};

const CARTE_TITRE: CSSProperties = {
  font: "600 19px/1.25 var(--ft)",
  letterSpacing: "-.025em",
};

const CARTE_TEXTE: CSSProperties = {
  font: "400 14px/1.6 var(--fb)",
  color: "var(--ink2)",
};

const CARTE_LIEN: CSSProperties = {
  marginTop: "auto",
  paddingTop: 12,
  borderTop: "1px solid var(--line)",
  font: "600 13.5px var(--fb)",
};

const BANDE_ZONES: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "10px 14px",
  marginTop: 14,
  padding: "18px 22px",
  borderRadius: "var(--rad)",
  background: "rgba(255,255,255,var(--gl-a))",
  border: "1px solid var(--gbd)",
};

const ZONES_TITRE: CSSProperties = {
  font: "600 11px var(--fb)",
  letterSpacing: ".13em",
  textTransform: "uppercase",
  color: "var(--ink3)",
  whiteSpace: "nowrap",
};

const ZONE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid var(--line)",
  font: "500 13.5px var(--fb)",
  color: "var(--ink1)",
  whiteSpace: "nowrap",
  transition: "border-color var(--tr),color var(--tr)",
};

export default function HubLocal({ hub }: { hub: DonneesHubLocal }) {
  const zones = hub.zones ?? [];
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={{ ...SURTITRE, marginBottom: 14 }}>{hub.surtitre}</div>
        <h2 style={TITRE}>{hub.titre}</h2>
        <div className="mg-r2" style={GRILLE}>
          <div style={PANNEAU}>
            <Image
              src={hub.photo}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 520px"
              // Les photos Envato sont des aperçus distants dont la licence
              // reste à vérifier (passation) : servies telles quelles, sans
              // passer par l'optimiseur ni ouvrir son domaine dans la config.
              unoptimized={hub.photo.startsWith("http")}
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) brightness(.7)",
              }}
            />
            {hub.credit ? (
              <span style={CREDIT}>Aperçu Envato · {hub.credit}</span>
            ) : null}
            <div aria-hidden="true" style={VOILE} />
            <div style={BAS}>
              <span style={BADGE}>
                <span aria-hidden="true" style={PUCE} />
                {hub.badge}
              </span>
              <div style={NOM}>{hub.nom}</div>
              <p style={TEXTE}>{hub.texte}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <Link href="/contact/" prefetch={false} className={styles.boutonHub} style={BOUTON}>
                  {hub.bouton}
                  <span aria-hidden="true">→</span>
                </Link>
                <a href={TELEPHONE_HREF} className={styles.telHub} style={TEL}>
                  {TELEPHONE}
                </a>
              </div>
            </div>
          </div>
          <div style={CARTES}>
            {hub.cartes.map((carte) => (
              <Link
                key={carte.href}
                href={carte.href}
                prefetch={false}
                className={styles.carteHub}
                style={CARTE}
              >
                <span style={CARTE_SURTITRE}>{carte.surtitre}</span>
                <span style={CARTE_TITRE}>{carte.titre}</span>
                <span style={CARTE_TEXTE}>{carte.texte}</span>
                <span style={CARTE_LIEN}>
                  {carte.lien} <span style={{ color: "var(--acc)" }}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        {zones.length > 0 ? (
          <div style={BANDE_ZONES}>
            {hub.zonesTitre ? <span style={ZONES_TITRE}>{hub.zonesTitre}</span> : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {zones.map((zone) => (
                <Link
                  key={zone.href}
                  href={zone.href}
                  prefetch={false}
                  className={styles.zoneHub}
                  style={ZONE}
                >
                  {zone.libelle}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
