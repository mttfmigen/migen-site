import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { LARGEUR, SECTION } from "@/components/site/blocs/habillage";

import styles from "./PageDomaine.module.css";

/**
 * Section « Offres du secteur » du gabarit 09 Domaine, relevée dans
 * `maquette/rendu/expertises--robotique.html` (section 11) : un bento de trois
 * colonnes où un panneau photographique de deux rangs porte « Nos offres »,
 * le H2 « Six façons de travailler ensemble, selon votre besoin » et le bouton
 * « Décrire mon besoin → » vers le formulaire de la page ; la carte
 * « migen© Résidence » s'étire sur deux colonnes avec sa photo à droite, et
 * les cinq autres offres suivent en tuiles photographiques.
 *
 * LA COPIE EST FIXE, ET C'EST MESURÉ : identique au caractère près sur les
 * 11 captures du gabarit (empreinte MD5 5d126b35, relevé du 07/10). Elle vit
 * donc ici, pas dans la donnée de chaque page.
 *
 * LES PHOTOS : la capture les sert en `blob:`. Identifiées le 07/10 en
 * hachant les octets servis par la maquette vivante (localhost:4352) puis en
 * les rapprochant de `public/assets/web/` : les sept empreintes y existaient
 * déjà (fichiers `mq-<empreinte>.jpg`, plus `team-grind-sparks` recoupé par
 * son alt). Aucun remplacement « au plus proche ».
 *
 * LES SURVOLS viennent des classes générées de la maquette vivante, relevées
 * le 07/10 : `scp9` (grande carte, translateY(-3px)), `scp18` (tuiles,
 * translateX(4px)), `scp6` (bouton, brightness(.93)). Posés en `:hover` et
 * `:focus-visible` dans `PageDomaine.module.css`.
 */

interface CarteOffreDomaine {
  numero: string;
  titre: string;
  texte: string;
  href: string;
  photo: string;
}

/** Les cinq tuiles sous la carte Résidence, mot pour mot depuis la capture. */
const TUILES: readonly CarteOffreDomaine[] = [
  {
    numero: "02",
    titre: "migen© Full service",
    texte: "Toute votre maintenance dans un seul contrat, avec un seul interlocuteur.",
    href: "/offres/full-service/",
    photo: "/assets/web/mq-f10bb16f54d0.jpg",
  },
  {
    numero: "03",
    titre: "migen© Zéro arrêt",
    texte:
      "Le préventif le samedi, le dépannage la nuit : la production n’est jamais touchée.",
    href: "/offres/zero-arret/",
    photo: "/assets/web/mq-0699d4d92e7e.jpg",
  },
  {
    numero: "04",
    titre: "migen© Arrêt technique",
    texte: "Votre arrêt annuel préparé, dimensionné et tenu à la date annoncée.",
    href: "/offres/arret-technique/",
    photo: "/assets/web/mq-e6322efcd358.jpg",
  },
  {
    numero: "05",
    titre: "migen© Bureau d’études",
    texte: "Schémas, conception, mise en conformité machine, par des gens de terrain.",
    href: "/offres/bureau-etudes/",
    photo: "/assets/web/mq-948c28bcda08.jpg",
  },
  {
    numero: "06",
    titre: "migen© Travaux industriels",
    texte: "Transfert, montage, démantèlement, levage, jusqu’à la remise en production.",
    href: "/travaux-industriels/",
    photo: "/assets/web/mq-dcd9cac6ffbf.jpg",
  },
] as const;

const PANNEAU_PHOTO: CSSProperties = {
  gridRow: "span 2",
  position: "relative",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  minHeight: 470,
  background: "rgb(42, 41, 39)",
  boxShadow: "rgba(0,0,0,.5) 0 30px 70px -40px",
};

const VOILE_PANNEAU: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(rgba(28,27,25,.2) 0%,rgba(28,27,25,.08) 32%,rgba(28,27,25,.88) 100%)",
};

const SURTITRE_PANNEAU: CSSProperties = {
  font: "600 11.5px var(--fb)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgb(255, 124, 60)",
  marginBottom: 12,
};

const TITRE_PANNEAU: CSSProperties = {
  font: "600 calc(clamp(24px,2.4vw,32px) * var(--ts))/1.1 var(--ft)",
  letterSpacing: "-.035em",
  color: "#fff",
  margin: "0 0 12px",
  textWrap: "balance",
};

const BOUTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 20px",
  borderRadius: 999,
  background: "rgb(255, 124, 60)",
  // Contraste AA : blanc sur l'orange de marque, 2,56:1. L'orange ne bouge pas,
  // l'encre change : --ink dessus, 6,72:1.
  color: "var(--sur-acc)",
  font: "600 14px var(--fb)",
  whiteSpace: "nowrap",
  boxShadow: "rgba(255,124,60,.85) 0 10px 24px -12px",
  transition: "filter var(--tr)",
};

const CARTE_LARGE: CSSProperties = {
  gridColumn: "span 2",
  display: "grid",
  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)",
  borderRadius: "var(--rad)",
  overflow: "hidden",
  background: "var(--panel)",
  boxShadow: "rgba(0,0,0,.5) 0 24px 56px -32px",
  transition: "transform var(--tr)",
};

const TUILE: CSSProperties = {
  position: "relative",
  display: "block",
  minHeight: 236,
  borderRadius: "var(--rad-s)",
  overflow: "hidden",
  background: "rgb(42, 41, 39)",
  transition: "transform var(--tr),box-shadow var(--tr)",
};

const VOILE_TUILE: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(rgba(28,27,25,.08) 15%,rgba(28,27,25,.86) 100%)",
};

const FLECHE_TUILE: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "rgba(255,255,255,.92)",
  color: "rgb(28, 27, 25)",
  display: "grid",
  placeItems: "center",
  font: "600 15px var(--fb)",
};

const NUMERO: CSSProperties = {
  font: "600 11px ui-monospace,Menlo,monospace",
  color: "rgb(255, 124, 60)",
};

export default function OffresDomaine() {
  return (
    <section style={SECTION}>
      <div style={LARGEUR}>
        <div
          className={styles.obento}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 12,
          }}
        >
          {/* Le panneau photographique, deux rangs de haut. */}
          <div className={styles.obA} style={PANNEAU_PHOTO}>
            <Image
              src="/assets/web/mq-17e2f3bce95f.jpg"
              alt="Technicien de maintenance migen en intervention"
              fill
              sizes="(max-width: 1000px) 100vw, 380px"
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.06)",
              }}
            />
            <div aria-hidden="true" style={VOILE_PANNEAU} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 30 }}>
              <div style={SURTITRE_PANNEAU}>Nos offres</div>
              <h2 style={TITRE_PANNEAU}>
                Six façons de travailler ensemble, selon votre besoin
              </h2>
              <p
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.82)",
                  margin: "0 0 20px",
                }}
              >
                Une présence continue, un contrat global, un abonnement hors
                production, un arrêt à préparer, une étude ou un chantier.
              </p>
              <a href="#mgx-form" className={styles.boutonBesoin} style={BOUTON}>
                Décrire mon besoin →
              </a>
            </div>
          </div>

          {/* 01 · Résidence, deux colonnes de large, photo à droite. */}
          <Link
            href="/offres/residence/"
            prefetch={false}
            className={`${styles.obB} ${styles.carteLarge}`}
            style={CARTE_LARGE}
          >
            <div
              style={{
                padding: "30px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <span style={NUMERO}>01</span>
              <span
                style={{
                  font: "600 calc(24px * var(--ts))/1.15 var(--ft)",
                  letterSpacing: "-.035em",
                  color: "#fff",
                }}
              >
                migen© Résidence
              </span>
              <span
                style={{
                  font: "400 14.5px/1.6 var(--fb)",
                  color: "rgba(255,255,255,.76)",
                  maxWidth: "44ch",
                }}
              >
                Des techniciens en résidence sur votre site, intégrés à votre
                équipe, validés par vous avant leur arrivée.
              </span>
              <span
                style={{
                  marginTop: "auto",
                  paddingTop: 14,
                  font: "600 14px var(--fb)",
                  color: "rgb(255, 124, 60)",
                }}
              >
                Voir l’offre →
              </span>
            </div>
            <div
              style={{
                position: "relative",
                minHeight: 230,
                background: "rgb(42, 41, 39)",
              }}
            >
              <Image
                src="/assets/web/mq-2a6115ec9fe0.jpg"
                alt=""
                fill
                sizes="(max-width: 1000px) 100vw, 360px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.05)",
                }}
              />
            </div>
          </Link>

          {/* 02 à 06, en tuiles photographiques. */}
          {TUILES.map((offre) => (
            <Link
              key={offre.href}
              href={offre.href}
              prefetch={false}
              className={styles.tuileOffre}
              style={TUILE}
            >
              <Image
                src={offre.photo}
                alt=""
                fill
                sizes="(max-width: 1000px) 100vw, 380px"
                style={{
                  objectFit: "cover",
                  filter: "saturate(var(--sat)) contrast(1.05)",
                }}
              />
              <div aria-hidden="true" style={VOILE_TUILE} />
              <span aria-hidden="true" style={FLECHE_TUILE}>
                →
              </span>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={NUMERO}>{offre.numero}</span>
                <span
                  style={{
                    font: "600 17px/1.25 var(--ft)",
                    letterSpacing: "-.02em",
                    color: "#fff",
                  }}
                >
                  {offre.titre}
                </span>
                <span
                  style={{
                    font: "400 13.5px/1.45 var(--fb)",
                    color: "rgba(255,255,255,.82)",
                  }}
                >
                  {offre.texte}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
