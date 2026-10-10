import type { CSSProperties, ReactNode } from "react";

/**
 * Le mot du dirigeant : portrait, manifeste, cinq blocs numérotés, citation.
 *
 * Maquette, lignes 5253 à 5280.
 *
 * LE PORTRAIT N'EST PAS RENDU. La maquette appelle un fichier qui n'a pas été
 * livré avec elle (identifiant `3df77672-…`), et aucune photo de `public/assets`
 * ne représente la personne nommée. Un visage emprunté sous un nom propre
 * serait une donnée inventée, donc le cadre orange de la maquette reste seul en
 * attendant le vrai fichier.
 */

const CADRE_TEXTE: CSSProperties = {
  font: "400 15px/1.7 var(--fb)",
  color: "var(--ink1)",
  textWrap: "pretty",
};

const PARAGRAPHE: CSSProperties = { margin: "0 0 12px" };

const FORT: CSSProperties = { fontWeight: 600, color: "var(--ink)" };

interface BlocNumerote {
  numero: string;
  titre: string;
  corps: ReactNode;
}

/** Les quatre blocs à filet noir. Le cinquième a son propre gabarit. */
const BLOCS: readonly BlocNumerote[] = [
  {
    numero: "01",
    titre: "Une règle simple",
    corps: (
      <>
        <p style={PARAGRAPHE}>
          Depuis le premier jour, une règle guide notre manière de travailler
          :{" "}
          <strong style={FORT}>
            ne jamais demander à quelqu&rsquo;un de faire ce que je ne ferais
            pas moi-même.
          </strong>
        </p>
        <p style={PARAGRAPHE}>
          Ça veut dire prendre sa part quand ça se complique, être présent quand
          il faut l&rsquo;être et ne jamais laisser quelqu&rsquo;un porter seul
          un problème, qu&rsquo;il soit client ou membre de l&rsquo;équipe.
        </p>
      </>
    ),
  },
  {
    numero: "02",
    titre: "Un mot pour nos clients",
    corps: (
      <>
        <p style={PARAGRAPHE}>
          Notre objectif tient en un mot : <strong style={FORT}>la tranquillité.</strong>
        </p>
        <p style={PARAGRAPHE}>
          En maintenance, si un client pense à son prestataire, c&rsquo;est
          souvent qu&rsquo;il y a un problème. Notre rôle : faire en sorte que ça
          tourne, prendre les sujets en main et régler les problèmes avant
          qu&rsquo;ils ne deviennent critiques.
        </p>
        <p style={PARAGRAPHE}>
          On teste, on avance, on corrige, on recommence. Si quelque chose peut
          être mieux fait, on le change.
        </p>
      </>
    ),
  },
  {
    numero: "03",
    titre: "Des équipes qui progressent",
    corps: (
      <>
        <p style={PARAGRAPHE}>
          Cette manière de penser, on l&rsquo;applique aussi à nos équipes.
        </p>
        <p style={PARAGRAPHE}>
          Je n&rsquo;ai jamais cru qu&rsquo;un diplôme devait décider à lui seul
          jusqu&rsquo;où quelqu&rsquo;un pouvait aller. Je préfère largement
          quelqu&rsquo;un qui a envie d&rsquo;apprendre, qui prend des
          responsabilités et qui progresse.
        </p>
      </>
    ),
  },
  {
    numero: "04",
    titre: "Réussir, et en profiter",
    corps: (
      <>
        <p style={PARAGRAPHE}>
          Je ne veux pas construire une entreprise où tout tourne uniquement
          autour de la performance. On veut réussir, aller loin, mais aussi
          profiter, célébrer, voyager et créer des souvenirs ensemble.
        </p>
        <p style={PARAGRAPHE}>
          La Colombie, les Canaries, une mine d&rsquo;émeraude… Dans
          l&rsquo;industrie, ce n&rsquo;est pas vraiment la norme. Et ça nous va
          très bien.
        </p>
      </>
    ),
  },
];

function Bloc({
  numero,
  titre,
  children,
  filet = "var(--ink)",
}: {
  numero: string;
  titre: string;
  children: ReactNode;
  filet?: string;
}) {
  return (
    <div style={{ paddingTop: 18, borderTop: `2px solid ${filet}` }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            font: "600 11px ui-monospace,Menlo,monospace",
            // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
            color: "var(--acc-ink)",
          }}
        >
          {numero}
        </span>
        <span
          style={{
            font: "600 18px/1.3 var(--ft)",
            letterSpacing: "-.02em",
            color: "var(--ink)",
          }}
        >
          {titre}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function MotDuDirigeant() {
  return (
    <section style={{ padding: "var(--sec,96px) 0 0" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gap: 44,
        }}
      >
        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,280px) minmax(0,1fr)",
            gap: 44,
            alignItems: "center",
          }}
        >
          <div
            style={{
              borderRadius: "var(--rad,28px)",
              overflow: "hidden",
              aspectRatio: "1/1",
              background: "#ff7c3c",
            }}
          />
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
                color: "var(--acc-ink)",
                marginBottom: 16,
              }}
            >
              Le mot du dirigeant
            </div>
            <h2
              style={{
                font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.08 var(--ft)",
                letterSpacing: "-.045em",
                color: "var(--ink)",
                margin: "0 0 18px",
                maxWidth: "20ch",
                textWrap: "balance",
              }}
            >
              Quand j&rsquo;ai créé Migen, je n&rsquo;avais aucune envie de
              faire comme les autres.
            </h2>
            <p
              style={{
                font: "400 16.5px/1.65 var(--fb)",
                color: "var(--ink1)",
                margin: "0 0 16px",
                maxWidth: "62ch",
              }}
            >
              Je ne voulais pas d&rsquo;une entreprise de maintenance de plus,
              avec les mêmes codes, les mêmes discours et les mêmes habitudes.
              Alors on a tout repris de zéro.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                "Une feuille blanche.",
                "Nos propres règles.",
                "Et personne pour nous expliquer notre métier.",
              ].map((chip, i) => (
                <span
                  key={chip}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: i === 2 ? "var(--acc)" : "var(--ink)",
                    // Contraste AA : la troisième pastille est la seule sur
                    // l'orange de marque, et le blanc n'y donne que 2,56:1.
                    // L'orange ne bouge pas, l'encre change : --ink dessus,
                    // 6,72:1. Les deux autres restent blanches sur --ink.
                    color: i === 2 ? "var(--sur-acc)" : "#fff",
                    font: "600 13.5px var(--fb)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
            <div style={{ font: "600 15px var(--ft)", color: "var(--ink)" }}>
              Nathan Jorez{" "}
              <span
                style={{
                  font: "400 13.5px var(--fb)",
                  color: "var(--ink3)",
                  marginLeft: 6,
                }}
              >
                Fondateur et dirigeant
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 28,
          }}
        >
          {BLOCS.slice(0, 3).map((b) => (
            <Bloc key={b.numero} numero={b.numero} titre={b.titre}>
              <div style={CADRE_TEXTE}>{b.corps}</div>
            </Bloc>
          ))}
        </div>

        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,.8fr)",
            gap: 32,
            alignItems: "center",
            padding: "36px 40px",
            borderRadius: "var(--rad,28px)",
            background: "var(--panel,#1c1b19)",
          }}
        >
          <div>
            <div
              style={{
                font: "600 11px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 14,
              }}
            >
              Ce qu&rsquo;un client nous a dit un jour
            </div>
            <blockquote
              style={{
                font: "600 calc(clamp(22px,2.4vw,32px) * var(--ts))/1.25 var(--ft)",
                letterSpacing: "-.035em",
                color: "#fff",
                margin: 0,
              }}
            >
              «&nbsp;Un investissement des équipes hors du commun, capables de
              soulever des montagnes.&nbsp;»
            </blockquote>
          </div>
          <div
            style={{
              font: "400 15px/1.7 var(--fb)",
              color: "rgba(255,255,255,.72)",
            }}
          >
            Cette phrase, on l&rsquo;a gardée. Elle résume ce qu&rsquo;on attend
            de Migen : des équipes qui s&rsquo;engagent vraiment, qui vont au
            bout et qui cherchent une solution quand les autres commencent à
            dire que c&rsquo;est impossible.
          </div>
        </div>

        <div
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 32,
          }}
        >
          <Bloc numero={BLOCS[3].numero} titre={BLOCS[3].titre}>
            <div style={CADRE_TEXTE}>{BLOCS[3].corps}</div>
          </Bloc>
          <Bloc numero="05" titre="Notre ambition" filet="var(--acc)">
            <div
              style={{
                font: "600 calc(clamp(40px,4.4vw,60px) * var(--ts))/1 var(--ft)",
                letterSpacing: "-.05em",
                // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
                color: "var(--acc-ink)",
                marginBottom: 12,
              }}
            >
              1&nbsp;000 en 2030
            </div>
            <div
              style={{
                font: "400 15px/1.7 var(--fb)",
                color: "var(--ink1)",
                marginBottom: 14,
              }}
            >
              Pas 1&nbsp;000 personnes sur une fiche de paie, mais 1&nbsp;000
              personnes qui partagent cette manière de travailler et cette
              conviction qu&rsquo;on peut encore faire les choses autrement.
            </div>
            <div
              style={{
                font: "600 17px/1.4 var(--ft)",
                letterSpacing: "-.02em",
                color: "var(--ink)",
              }}
            >
              Si quelque chose n&rsquo;a jamais été fait, c&rsquo;est peut-être
              justement une bonne raison d&rsquo;essayer.
            </div>
          </Bloc>
        </div>
      </div>
    </section>
  );
}
