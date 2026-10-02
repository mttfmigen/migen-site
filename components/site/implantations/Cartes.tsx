import Link from "next/link";

import TexteRiche, {
  estCheminInterne,
} from "@/components/site/blocs/TexteRiche";
import { colonnes } from "@/components/site/blocs/habillage";
import type {
  ChiffreImplantation,
  LienImplantation,
} from "@/types/implantations";

import { INTITULE_CARTE, LIEN_COUVERTURE, VERRE_IMPL } from "./habillage";
import styles from "./PageImplantations.module.css";

/** Une carte de la bande de réassurance. */
export function CarteChiffre({ chiffre }: { chiffre: ChiffreImplantation }) {
  return (
    <div style={{ ...VERRE_IMPL, padding: "24px 26px" }}>
      <div
        style={{
          font: "600 calc(34px * var(--ts))/1 var(--ft)",
          letterSpacing: "-.05em",
          // La maquette n'accentue qu'un chiffre sur quatre.
          color: chiffre.accent ? "var(--acc)" : undefined,
        }}
      >
        <TexteRiche texte={chiffre.valeur} />
      </div>
      <div
        style={{
          font: "400 13.5px/1.5 var(--fb)",
          color: "var(--ink2)",
          marginTop: 8,
        }}
      >
        <TexteRiche texte={chiffre.libelle} />
      </div>
    </div>
  );
}

/** Une colonne de liens du maillage : les villes, ou les départements. */
export function CarteLiens({
  libelle,
  liens,
}: {
  libelle: string;
  liens: readonly LienImplantation[];
}) {
  return (
    <div style={{ ...VERRE_IMPL, padding: "30px 32px 32px" }}>
      <div style={INTITULE_CARTE}>{libelle}</div>
      <div className="mg-rmulti" style={{ ...colonnes(2), gap: "4px 20px" }}>
        {liens.map((lien, i) =>
          estCheminInterne(lien.href) ? (
            // `prefetch={false}` : vingt liens par page, précharger vingt
            // routes pour une navigation incertaine coûte plus qu'il ne rend.
            <Link
              key={`${i}-${lien.href}`}
              href={lien.href}
              prefetch={false}
              className={styles.lienCouverture}
              style={LIEN_COUVERTURE}
            >
              {lien.libelle}
            </Link>
          ) : (
            // Cible refusée : le libellé reste lisible, la cible est jetée.
            // Même règle que `TexteRiche` et que `proxy.ts` : un contenu
            // éditorial n'expédie pas un visiteur hors du domaine.
            <span
              key={`${i}-${lien.libelle}`}
              style={{ ...LIEN_COUVERTURE, color: "var(--ink1)" }}
            >
              {lien.libelle}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
