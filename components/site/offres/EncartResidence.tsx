import Image from "next/image";
import type { CSSProperties } from "react";

import SectionPliableMobile from "@/components/site/blocs/SectionPliableMobile";
import {
  LARGEUR,
  SECTION,
  SURTITRE,
  VERRE,
} from "@/components/site/blocs/habillage";
import styles from "@/components/site/offre/PliSansTitre.module.css";
import type { EncartOffres } from "@/types/offres";

import { BoutonFleche } from "./DeuxApproches";

/**
 * « Offres · Résidence » de la capture `maquette/rendu/offres.html` (blocs
 * 1097 à 1110) : une carte de verre à gauche (surtitre, titre, accroche, deux
 * paragraphes, bouton), la photo à droite, deux colonnes égales.
 *
 * LA PHOTO est celle que sert la maquette qui tourne (un `blob:`, invisible
 * dans la capture) : octets relevés le 08/10 et rapprochés de la photothèque,
 * c'est `public/assets/web/sv-armoire.jpg`.
 *
 * REPLIÉ AU TÉLÉPHONE (décision de Mehdi du 14/10) sous le titre qu'il lui a
 * donné, « Votre technicien intégré à votre site », mot pour mot. L'encart
 * n'a pas de titre de section à lui (son `encart.titre` est dessiné en `div`,
 * comme dans la capture) ; au-dessus de 880 px le titre ajouté ne se voit pas
 * (`offre/PliSansTitre.module.css`) et rien ne change.
 */

const TEXTE: CSSProperties = {
  font: "400 15.5px/1.7 var(--fb)",
  color: "var(--ink1)",
  margin: "0 0 12px",
};

export default function EncartResidence({ encart }: { encart: EncartOffres }) {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <SectionPliableMobile
          enTete={<h2 className={styles.titre}>Votre technicien intégré à votre site</h2>}
        >
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                ...VERRE,
                padding: "44px 40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ ...SURTITRE, marginBottom: 14 }}>{encart.surtitre}</div>
              <div
                style={{
                  font: "600 calc(clamp(26px,2.6vw,36px) * var(--ts))/1.12 var(--ft)",
                  letterSpacing: "-.04em",
                  color: "var(--ink)",
                  marginBottom: 14,
                }}
              >
                {encart.titre}
              </div>
              <div
                style={{
                  font: "600 17px/1.4 var(--ft)",
                  color: "var(--ink)",
                  marginBottom: 14,
                }}
              >
                {encart.accroche}
              </div>
              {encart.paragraphes.map((texte, rang) => (
                <p
                  key={texte}
                  style={
                    rang === encart.paragraphes.length - 1
                      ? { ...TEXTE, margin: "0 0 26px" }
                      : TEXTE
                  }
                >
                  {texte}
                </p>
              ))}
              <div>
                <BoutonFleche lien={encart.bouton} />
              </div>
            </div>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--rad)",
                overflow: "hidden",
                minHeight: 440,
                background: "var(--ph)",
              }}
            >
              <Image
                src={encart.photo}
                alt={encart.alt}
                fill
                sizes="(max-width: 900px) 100vw, 560px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.04)",
                }}
              />
            </div>
          </div>
        </SectionPliableMobile>
      </div>
    </section>
  );
}
