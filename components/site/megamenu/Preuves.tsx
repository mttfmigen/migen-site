import Image from "next/image";
import Link from "next/link";

import s from "../Entete.module.css";
import { CAS, CHIFFRES } from "../entete-donnees";
import { altPhoto } from "@/lib/descriptions-photos";

/** Panneau « Cas clients » : trois vignettes d'étude, puis le bloc chiffres. */
export default function PanneauPreuves() {
  return (
    <div
      className="mg-r2"
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr .9fr",
        gap: 22,
        alignItems: "stretch",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              font: "600 11px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
            }}
          >
            Études de cas
          </span>
          <Link
            href="/preuves/"
            className={s.lienFort}
            style={{ font: "600 13px var(--fb)" }}
          >
            Toutes les études →
          </Link>
        </div>
        <div
          className="mg-rq3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 10,
          }}
        >
          {CAS.map((cas) => (
            <Link
              key={cas.href}
              href={cas.href}
              className={s.carteCas}
              style={{
                position: "relative",
                display: "block",
                height: 190,
                borderRadius: 18,
                overflow: "hidden",
                background: "#1c1b19",
              }}
            >
              <Image
                src={cas.image}
                alt={altPhoto(cas.image)}
                fill
                sizes="(max-width: 1000px) 50vw, 340px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) brightness(.7)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top,rgba(18,17,16,.9),rgba(18,17,16,.1) 65%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                }}
              >
                <div
                  style={{ font: "700 15px var(--ft)", letterSpacing: ".02em" }}
                >
                  {cas.client}
                </div>
                <div
                  style={{
                    font: "600 12.5px var(--fb)",
                    color: "rgba(255,255,255,.85)",
                    marginTop: 2,
                  }}
                >
                  {cas.sousTitre}
                </div>
                <div
                  style={{
                    font: "400 12px/1.45 var(--fb)",
                    color: "rgba(255,255,255,.65)",
                    marginTop: 6,
                  }}
                >
                  {cas.resume}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div
        style={{
          borderRadius: 20,
          background: "#1c1b19",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            right: -110,
            top: -120,
            background:
              "radial-gradient(circle,rgba(255,124,60,.3),transparent 66%)",
          }}
        />
        <div
          className="mg-rq2"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {CHIFFRES.map((chiffre) => (
            <div key={chiffre.libelle}>
              <div
                style={{
                  font: "600 24px var(--ft)",
                  letterSpacing: "-.04em",
                  color: chiffre.accent ? "var(--acc)" : "#fff",
                }}
              >
                {chiffre.valeur}
              </div>
              <div
                style={{
                  font: "400 12px var(--fb)",
                  color: "rgba(255,255,255,.6)",
                }}
              >
                {chiffre.libelle}
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/preuves/"
          className={s.ctaPanneau}
          style={{
            position: "relative",
            marginTop: "auto",
            display: "inline-flex",
            justifyContent: "center",
            padding: "12px 18px",
            borderRadius: 999,
            font: "600 13.5px var(--fb)",
          }}
        >
          Voir nos réalisations
        </Link>
      </div>
    </div>
  );
}
