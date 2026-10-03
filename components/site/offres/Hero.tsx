import Image from "next/image";

import blocs from "@/components/site/blocs/Blocs.module.css";
import TexteRiche from "@/components/site/blocs/TexteRiche";
import {
  BOUTON_ACTION,
  BOUTON_SECONDAIRE,
  lienTelephone,
} from "@/components/site/blocs/habillage";
import type { ContenuOffres } from "@/types/offres";

import { SURTITRE_OFFRES } from "./habillage";

/**
 * Le bandeau d'ouverture du hub, maquette lignes 1887 à 1911.
 *
 * Deux colonnes `1.08fr .92fr`, le discours à gauche, un cadre visuel à droite
 * dont le bas porte les repères en incrustation.
 *
 * CE QUE LA MAQUETTE ÉCRIT ICI ET QUI NE PART PAS :
 *
 *   · « Six façons de nous confier votre industrie. » en H1. Le H1 vient de
 *     `pages.titre_h1`, et le compte est faux : la maquette dessine cinq
 *     cartes, se dit « Six façons » puis « Sept offres » puis « Les cinq
 *     offres », quand la base porte dix pages sous `/offres/`. Le corpus, lui,
 *     écrit « Plusieurs façons de nous confier vos machines » et ne compte pas.
 *   · « +200 clients industriels » en incrustation. Le compte tenu est
 *     « plus de 120 clients, dont plus de 80 réguliers », et c'est la section
 *     `chiffres` du corpus qui le porte, d'où `reperes`.
 *   · « cinq à sept ans d'expérience » dans le chapeau, que le corpus de cette
 *     page n'écrit pas : son chapeau le remplace en entier.
 *
 * LE SECOND BOUTON. La maquette laisse sa place vide à côté de « Trouver la
 * bonne offre », une ancre vers la mosaïque. Le corpus fournit un libellé
 * d'action et un téléphone : les deux sont rendus, l'ancre de la maquette étant
 * un élément de navigation sans texte client derrière.
 */
export default function Hero({
  titre,
  surtitre,
  chapeau,
  actions,
  telephone,
  phraseDelai,
  reperes,
  visuel,
}: {
  titre: string;
} & Pick<
  ContenuOffres,
  "surtitre" | "chapeau" | "actions" | "telephone" | "phraseDelai" | "reperes" | "visuel"
>) {
  const colonne = (
    <div>
      {surtitre ? <div style={SURTITRE_OFFRES}>{surtitre}</div> : null}

      <h1
        style={{
          font: "600 calc(clamp(36px,4.2vw,62px) * var(--ts))/1.03 var(--ft)",
          letterSpacing: "-.045em",
          color: "var(--ink)",
          margin: 0,
          maxWidth: "18ch",
          textWrap: "balance",
        }}
      >
        {titre}
      </h1>

      {chapeau ? (
        <p
          className={blocs.corpus}
          style={{
            font: "400 17.5px/1.65 var(--fb)",
            color: "var(--ink2)",
            margin: "24px 0 0",
            maxWidth: "50ch",
          }}
        >
          <TexteRiche texte={chapeau} />
        </p>
      ) : null}

      {actions?.length || telephone ? (
        <div
          style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}
        >
          {actions?.map((action) => (
            <a
              key={action.href + action.libelle}
              href={action.href}
              className={blocs.boutonAction}
              style={BOUTON_ACTION}
            >
              {action.libelle}
            </a>
          ))}
          {telephone ? (
            <a
              href={lienTelephone(telephone)}
              className={blocs.boutonSecondaire}
              style={BOUTON_SECONDAIRE}
            >
              {telephone}
            </a>
          ) : null}
        </div>
      ) : null}

      {phraseDelai ? (
        <div
          style={{
            marginTop: 34,
            paddingTop: 26,
            borderTop: "1px solid var(--line)",
          }}
        >
          <p
            className={blocs.corpus}
            style={{
              font: "400 15px/1.7 var(--fb)",
              color: "var(--ink2)",
              margin: 0,
              maxWidth: "52ch",
            }}
          >
            <TexteRiche texte={phraseDelai} />
          </p>
        </div>
      ) : null}
    </div>
  );

  /* Le cadre de droite ne se rend que s'il a quelque chose à montrer : sans
     repère et sans visuel, c'est un rectangle gris de 320px de haut. La page
     passe alors en une colonne pleine largeur, comme le fait déjà le héros du
     gabarit de vente sans son encart. */
  const cadre =
    reperes?.length || visuel ? (
      <div
        style={{
          borderRadius: "var(--rad)",
          overflow: "hidden",
          position: "relative",
          minHeight: 320,
          background: "var(--ph)",
        }}
      >
        {visuel ? (
          <Image
            src={visuel.src}
            alt={visuel.alt}
            fill
            sizes="(max-width: 1000px) 100vw, 46vw"
            style={{
              objectFit: "cover",
              filter: "saturate(var(--sat)) contrast(1.05)",
              opacity: "var(--ph-op)",
            }}
          />
        ) : null}

        {/* Le dégradé n'est pas décoratif ici : sans visuel, c'est lui qui
            assombrit le bas du cadre et garde les repères blancs lisibles sur
            le fond `--ph`, qui est un gris clair. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(18,17,16,.74),rgba(18,17,16,0) 56%)",
          }}
        />

        {reperes?.length ? (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "26px 28px",
              display: "flex",
              alignItems: "center",
              gap: 22,
              flexWrap: "wrap",
            }}
          >
            {reperes.map((repere, i) => (
              <div
                key={repere.valeur + repere.libelle}
                style={{ display: "flex", alignItems: "center", gap: 22 }}
              >
                {/* Le filet vertical de la maquette, entre deux repères. */}
                {i > 0 ? (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 1,
                      height: 32,
                      background: "rgba(255,255,255,.16)",
                    }}
                  />
                ) : null}
                <div style={{ maxWidth: "20ch" }}>
                  <div
                    style={{
                      font: "600 calc(22px * var(--ts)) var(--ft)",
                      letterSpacing: "-.04em",
                      color: "#fff",
                    }}
                  >
                    {repere.valeur}
                  </div>
                  <div
                    style={{
                      font: "400 12px var(--fb)",
                      color: "rgba(255,255,255,.6)",
                      marginTop: 2,
                    }}
                  >
                    {repere.libelle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <section
      style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}
    >
      {cadre ? (
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.08fr .92fr",
            gap: 52,
            alignItems: "start",
          }}
        >
          {colonne}
          {cadre}
        </div>
      ) : (
        colonne
      )}
    </section>
  );
}
