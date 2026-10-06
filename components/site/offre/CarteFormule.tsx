import type { CSSProperties } from "react";

import TexteRiche from "@/components/site/blocs/TexteRiche";
import type { FormuleOffre } from "@/types/offre";

import { lienSur } from "./LiensOffre";
import {
  FORMULE_BOUTON,
  FORMULE_BOUTON_PHARE,
  FORMULE_CARTE,
  FORMULE_CARTE_PHARE,
  FORMULE_LISTE,
  FORMULE_LUEUR,
  FORMULE_NOM,
  FORMULE_PASTILLE,
  FORMULE_PUCE,
  FORMULE_RANG,
  FORMULE_RESUME,
} from "./habillage-offre";

import styles from "./PageOffre.module.css";

/**
 * Une carte de formule de la section « Les formules » (maquette
 * `site-final.html`, l. 4100 à 4145).
 *
 * EXTRAITE DE `BlocsZeroArret.tsx` parce que `Formules` dépassait les cinquante
 * lignes que le contrat du dépôt fixe à une fonction, le tableau comparatif
 * ayant été ajouté sous les cartes. Aucune valeur n'a changé au passage : la
 * carte PHARE (celle de la formule recommandée) est en panneau anthracite avec
 * sa lueur orange, sa pastille « Recommandé » et son bouton orange ; les deux
 * autres sont en verre avec un bouton en pastille claire.
 */

/** La colonne interne, posée AU-DESSUS de la lueur de la carte phare. */
const COLONNE: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

export default function CarteFormule({ formule }: { formule: FormuleOffre }) {
  const phare = formule.recommandee === true;
  const bouton = lienSur(formule.bouton);

  return (
    <div
      style={phare ? FORMULE_CARTE_PHARE : FORMULE_CARTE}
    >
      {phare ? <div style={FORMULE_LUEUR} /> : null}
      <div style={COLONNE}>
        {phare ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span style={{ ...FORMULE_RANG, marginBottom: 0 }}>
              {formule.rang}
            </span>
            <span style={FORMULE_PASTILLE}>Recommandé</span>
          </div>
        ) : (
          <div style={FORMULE_RANG}>{formule.rang}</div>
        )}

        <div
          style={{
            ...FORMULE_NOM,
            color: phare ? "#fff" : "var(--ink)",
          }}
        >
          {formule.nom}
        </div>
        <p
          style={{
            ...FORMULE_RESUME,
            color: phare
              ? "rgba(255,255,255,.6)"
              : "var(--ink2)",
          }}
        >
          <TexteRiche texte={formule.resume} />
        </p>

        {formule.inclus.length > 0 ? (
          <div
            style={{
              ...FORMULE_LISTE,
              borderTop: phare
                ? "1px solid rgba(255,255,255,.12)"
                : "1px solid var(--line)",
            }}
          >
            {formule.inclus.map((ligne) => (
              <div
                key={ligne}
                style={{
                  ...FORMULE_PUCE,
                  color: phare
                    ? "rgba(255,255,255,.78)"
                    : "var(--ink1)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ color: "var(--acc)", flex: "none" }}
                >
                  +
                </span>
                <span>
                  <TexteRiche texte={ligne} />
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {bouton ? (
          <a
            href={bouton.href}
            className={
              phare
                ? styles.boutonPrincipal
                : styles.boutonSecondaire
            }
            style={
              phare ? FORMULE_BOUTON_PHARE : FORMULE_BOUTON
            }
          >
            {bouton.libelle}
          </a>
        ) : null}
      </div>
    </div>
  );
}
