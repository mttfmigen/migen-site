import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION, SURTITRE } from "@/components/site/blocs/habillage";
import type { NosVilles as DonneesNosVilles } from "@/types/implantations";

import styles from "./PageImplantations.module.css";

/**
 * L'écran « Nos villes » de `maquette/rendu/implantations.html` (section 13),
 * propre au hub : les dix cartes de hub et leurs zones, puis « Au-delà des
 * hubs », les villes des techniciens itinérants par région. Styles relevés
 * sur le gabarit de `MigenExpertise.dc.html` (`hubGroups`, `roamRegions`) ;
 * les survols (`style-hover`) vivent dans le module CSS, avec les propriétés
 * qu'ils changent, sinon le style en ligne les écraserait.
 */

const TITRE: CSSProperties = {
  font: "600 calc(clamp(28px,3vw,42px) * var(--ts))/1.08 var(--ft)",
  letterSpacing: "-.04em",
  margin: "0 0 10px",
  maxWidth: "24ch",
  textWrap: "balance",
};

const CHAPEAU: CSSProperties = {
  font: "400 16px/1.65 var(--fb)",
  color: "var(--ink2)",
  margin: "0 0 28px",
  maxWidth: "62ch",
};

const CARTE_HUB: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  padding: 10,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const LIEN_HUB: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "16px 16px",
  borderRadius: "calc(var(--rad) - 6px)",
  background: "var(--panel)",
  color: "#fff",
  transition: "filter var(--tr)",
};

const FLECHE: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "#ff7c3c",
  /* La flèche héritait le `#fff` de `LIEN_HUB`, soit 2,56:1 sur le rond
     orange. L'encre posée explicitement donne 6,72:1. */
  color: "var(--ink)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  font: "400 16px var(--fb)",
  flex: "none",
};

const ZONE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 36,
  padding: "0 13px",
  borderRadius: 999,
  background: "#fff",
  font: "500 13.5px var(--fb)",
  whiteSpace: "nowrap",
  transition: "border-color var(--tr),color var(--tr)",
};

const CARTE_REGION: CSSProperties = {
  borderRadius: "var(--rad-s)",
  background: "#fff",
  border: "1px solid var(--line)",
  padding: "20px 22px 18px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const VILLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "5px 0",
  font: "400 14px var(--fb)",
  transition: "color var(--tr)",
};

export default function NosVilles({ villes }: { villes: DonneesNosVilles }) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div style={SURTITRE}>Nos implantations</div>
        <h2 style={TITRE}>{villes.titre}</h2>
        <p style={CHAPEAU}>{villes.chapeau}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}>
          {villes.hubs.map((hub) => (
            <div key={hub.href} style={CARTE_HUB}>
              <Link href={hub.href} prefetch={false} className={styles.hub} style={LIEN_HUB}>
                <span>
                  <span
                    style={{
                      display: "block",
                      font: "600 11px var(--fb)",
                      letterSpacing: ".13em",
                      textTransform: "uppercase",
                      color: "#ff7c3c",
                      marginBottom: 4,
                    }}
                  >
                    Hub
                  </span>
                  <span style={{ font: "600 20px/1.2 var(--ft)", letterSpacing: "-.025em" }}>{hub.hub}</span>
                </span>
                <span aria-hidden="true" style={FLECHE}>
                  →
                </span>
              </Link>
              {hub.zones?.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 6px 4px" }}>
                  {hub.zones.map((zone) => (
                    <Link key={zone.href} href={zone.href} prefetch={false} className={styles.zone} style={ZONE}>
                      {zone.libelle}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <div>
              <div style={{ ...SURTITRE, marginBottom: 10 }}>Au-delà des hubs</div>
              <h3
                style={{
                  font: "600 calc(clamp(22px,2.3vw,30px) * var(--ts))/1.15 var(--ft)",
                  letterSpacing: "-.035em",
                  margin: 0,
                  maxWidth: "26ch",
                  textWrap: "balance",
                }}
              >
                {villes.itinerantsTitre}
              </h3>
            </div>
            <p style={{ font: "400 14.5px/1.6 var(--fb)", color: "var(--ink2)", margin: 0, maxWidth: "40ch" }}>
              {villes.itinerantsTexte}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
            {villes.regions.map((region) => (
              <div key={region.region} style={CARTE_REGION}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ font: "600 15px var(--ft)", letterSpacing: "-.02em", color: "var(--ink)" }}>
                    {region.region}
                  </span>
                  <span
                    style={{
                      font: "600 11px var(--fb)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--ink4)",
                    }}
                  >
                    {`${region.villes.length} villes`}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 14px" }}>
                  {region.villes.map((ville) => (
                    <Link key={ville.href} href={ville.href} prefetch={false} className={styles.ville} style={VILLE}>
                      <span
                        aria-hidden="true"
                        style={{ width: 5, height: 5, borderRadius: 999, background: "#ff7c3c", flex: "none", opacity: 0.75 }}
                      />
                      {ville.libelle}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
