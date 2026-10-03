import type { CSSProperties } from "react";

import { VERRE } from "@/components/site/blocs/habillage";

/**
 * Cas concret de retrofit : photo légendée à gauche, deux chiffres à droite.
 * Portée de `maquette/accueil-rendu.html`, lignes 5792 à 5814.
 *
 * Composant serveur.
 *
 * UN ÉCART. La maquette écrivait « Le client avait un devis de remplacement à
 * sept chiffres ; le retrofit a coûté un dixième ». Le contrat interdit tout
 * prix affiché, et un ordre de grandeur en est un. Le rapport de coût reste dit
 * par l'indicateur du pilier 03, sans montant.
 *
 * L'IMAGE arrive en prop : la maquette pointait un identifiant d'actif Claude
 * Design (« 738c047c-… »), pas un fichier. La valeur par défaut est la photo
 * d'armoire électrique du dépôt, la plus proche du sujet (migration d'automate,
 * reprise des schémas). À remplacer par la vraie photo du chantier quand elle
 * sera fournie.
 */

export interface ProprietesCasRetrofit {
  image?: string;
  imageAlt?: string;
}

const CHIFFRE: CSSProperties = {
  font: "600 calc(38px * var(--ts))/1 var(--ft)",
  letterSpacing: "-.05em",
  color: "var(--acc)",
};

const LIBELLE_CHIFFRE: CSSProperties = {
  font: "400 14px/1.55 var(--fb)",
  color: "var(--ink2)",
  marginTop: 10,
};

const CARTE_CHIFFRE: CSSProperties = {
  ...VERRE,
  padding: "26px 28px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const CHIFFRES: readonly { valeur: string; libelle: string }[] = [
  {
    valeur: "−30 %",
    libelle:
      "d’arrêts non planifiés chez nos clients sous contrat préventif, après un an",
  },
  {
    valeur: "+8 ans",
    libelle: "de durée de vie gagnée en moyenne sur une machine rétrofitée",
  },
];

export default function CasRetrofit({
  image = "/assets/web/sv-armoire.jpg",
  imageAlt = "Installation industrielle rétrofitée",
}: ProprietesCasRetrofit) {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.32fr .68fr",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              borderRadius: "var(--rad)",
              overflow: "hidden",
              position: "relative",
              minHeight: 320,
              background: "var(--ph)",
            }}
          >
            {/* `img` et non `next/image` : les dimensions intrinsèques du
                fichier de remplacement ne sont pas connues. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={imageAlt}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.05)",
                opacity: "var(--ph-op)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top,rgba(18,17,16,.88) 0%,rgba(18,17,16,.18) 58%,rgba(18,17,16,.38) 100%)",
              }}
            />
            <div
              style={{
                position: "relative",
                padding: "28px 30px 30px",
                minHeight: 320,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 12,
                }}
              >
                Cas concret · Retrofit
              </div>
              <div
                style={{
                  font: "600 calc(clamp(20px,2.2vw,28px) * var(--ts))/1.16 var(--ft)",
                  letterSpacing: "-.035em",
                  color: "#fff",
                  marginBottom: 12,
                  maxWidth: "28ch",
                }}
              >
                Une ligne de 1998 remise en service au lieu d’être remplacée
              </div>
              <p
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.76)",
                  margin: 0,
                  maxWidth: "52ch",
                }}
              >
                Migration d’automate, reprise complète des schémas, mise en
                conformité. Le client tenait un devis de remplacement complet,
                le retrofit a coûté bien moins, et la ligne tourne depuis trois
                ans.
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(2,minmax(0,1fr))",
              gap: 14,
            }}
          >
            {CHIFFRES.map((chiffre) => (
              <div key={chiffre.valeur} style={CARTE_CHIFFRE}>
                <div style={CHIFFRE}>{chiffre.valeur}</div>
                <div style={LIBELLE_CHIFFRE}>{chiffre.libelle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
