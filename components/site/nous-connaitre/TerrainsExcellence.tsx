import Image from "next/image";
import Link from "next/link";

/**
 * Nos terrains d'excellence : une carte de verre en deux colonnes.
 *
 * Maquette, ligne 5281. Seul lien interne vivant de cet écran avec
 * `/implantations/` : `/secteurs/` répond 200, il est donc posé.
 */

const FORT = { fontWeight: 600, color: "var(--ink)" } as const;

export default function TerrainsExcellence() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          className="mg-r2"
          style={{
            borderRadius: "var(--rad)",
            background: "rgba(255,255,255,var(--gl-a))",
            backdropFilter: "blur(var(--gl-b)) saturate(150%)",
            WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
            border: "1px solid var(--gbd)",
            boxShadow:
              "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
            padding: 28,
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div style={{ padding: "16px 12px 16px 16px" }}>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 14,
              }}
            >
              Notre force
            </div>
            <h2
              style={{
                font: "600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
                letterSpacing: "-.04em",
                color: "var(--ink)",
                margin: "0 0 18px",
              }}
            >
              Nos terrains d&rsquo;excellence
            </h2>
            <p
              style={{
                font: "400 16px/1.75 var(--fb)",
                color: "var(--ink1)",
                margin: "0 0 14px",
              }}
            >
              Chaque secteur a ses équipements, ses contraintes et ses règles.
              Nos techniciens ne sont pas généralistes.{" "}
              <strong style={FORT}>
                Ils connaissent vos machines, vos normes et vos cadences, parce
                qu&rsquo;ils y travaillent tous les jours.
              </strong>
            </p>
            <p
              style={{
                font: "400 16px/1.75 var(--fb)",
                color: "var(--ink1)",
                margin: "0 0 22px",
              }}
            >
              C&rsquo;est cette expérience terrain qui nous permet
              d&rsquo;envoyer{" "}
              <strong style={FORT}>
                le bon profil, opérationnel dès le premier jour
              </strong>{" "}
              sur votre site.
            </p>
            <Link
              href="/secteurs/"
              style={{ font: "600 14.5px var(--fb)", color: "#ff7c3c" }}
            >
              Voir nos secteurs →
            </Link>
          </div>
          <div
            style={{
              borderRadius: "calc(var(--rad) - 8px)",
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "var(--ph)",
              position: "relative",
            }}
          >
            <Image
              src="/assets/web/team-duo.jpg"
              alt="Deux techniciens Migen devant un poste de travail"
              fill
              sizes="(max-width: 900px) 100vw, 540px"
              loading="lazy"
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.04)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
