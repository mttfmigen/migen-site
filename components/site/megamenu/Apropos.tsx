import Image from "next/image";
import Link from "next/link";

import s from "../Entete.module.css";
import {
  APROPOS_ENGAGEMENTS,
  APROPOS_ENTREPRISE,
  VILLES,
} from "../entete-donnees";
import { PASTILLE, PUCE, RangeeDecrite, SurTitre } from "./blocs";

/** Cartouche blanc des labels, dimensions reprises une à une de la maquette. */
function Cartouche({
  src,
  alt,
  largeur,
  hauteur,
  ronde,
}: {
  src: string;
  alt: string;
  largeur: number;
  hauteur: number;
  ronde?: boolean;
}) {
  return (
    <span
      style={{
        width: ronde ? 30 : 64,
        height: 30,
        borderRadius: ronde ? 999 : 8,
        background: "#fff",
        border: "1px solid var(--line)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: ronde ? 1 : "3px 6px",
        flex: "none",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={largeur}
        height={hauteur}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </span>
  );
}

/** Panneau « À propos » : l'entreprise, les engagements, les implantations. */
export default function PanneauApropos() {
  return (
    <div
      className="mg-r2"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr .9fr",
        gap: 32,
      }}
    >
      <div>
        <SurTitre marge={14}>L’entreprise</SurTitre>
        <div style={{ display: "grid", gap: 1 }}>
          {APROPOS_ENTREPRISE.map((lien) => (
            <RangeeDecrite key={lien.href} {...lien} />
          ))}
        </div>
      </div>
      <div>
        <SurTitre marge={14}>Nos engagements</SurTitre>
        <div style={{ display: "grid", gap: 1 }}>
          {APROPOS_ENGAGEMENTS.map((lien) => (
            <RangeeDecrite key={lien.href} {...lien} />
          ))}
        </div>
        <div
          style={{
            height: 1,
            background: "var(--line)",
            margin: "14px 11px 12px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 11px",
          }}
        >
          <Cartouche
            src="/assets/logos/mase.png"
            alt="MASE"
            largeur={52}
            hauteur={24}
          />
          <Cartouche
            src="/assets/logos/ecovadis.webp"
            alt="EcoVadis"
            largeur={28}
            hauteur={28}
            ronde
          />
          <span style={{ font: "400 11.5px var(--fb)", color: "var(--ink4)" }}>
            2 accidents avec arrêt en 2025
          </span>
        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              font: "600 11px var(--fb)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--acc)",
            }}
          >
            Nos implantations
          </div>
          <Link
            href="/lp/"
            className={s.lienDiscret}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              font: "600 10.5px var(--fb)",
              letterSpacing: ".06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span style={PASTILLE} />
            Modèle de LP
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {VILLES.map((ville) => (
            <Link
              key={ville.href}
              href={ville.href}
              className={s.lienListe}
              style={PUCE}
            >
              {ville.libelle}
            </Link>
          ))}
        </div>
        <div
          style={{
            font: "400 12px/1.5 var(--fb)",
            color: "var(--ink3)",
            marginBottom: 12,
          }}
        >
          Agences à Montréal, Dubaï et Madrid.
        </div>
        <Link
          href="/implantations/"
          className={s.lienAccent}
          style={{ font: "600 13.5px var(--fb)" }}
        >
          Villes et départements →
        </Link>
      </div>
    </div>
  );
}
