import Image from "next/image";
import type { CSSProperties } from "react";

import SigleMigen from "./SigleMigen";

/**
 * Le premier client, l'origine du nom, le logo.
 *
 * Maquette, lignes 5282 à 5350. Quatre blocs dans une seule section : la photo
 * légendée, le panneau sombre qui épelle M-I-G-EN, les deux cartes de verre, le
 * panneau du logo.
 */

const VERRE: CSSProperties = {
  borderRadius: "var(--rad)",
  background: "rgba(255,255,255,var(--gl-a))",
  backdropFilter: "blur(var(--gl-b)) saturate(150%)",
  WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
  border: "1px solid var(--gbd)",
  boxShadow: "0 1px 1px rgba(0,0,0,.04),0 22px 50px -32px rgba(0,0,0,.3)",
  padding: "32px 34px",
};

const RANGEE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 14,
};

export default function OrigineDuNom() {
  return (
    <section style={{ padding: "var(--sec) 0 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 52,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: 32,
              overflow: "hidden",
              minHeight: 480,
              background: "var(--ph)",
            }}
          >
            <Image
              src="/assets/web/team-duo.jpg"
              alt="Les premiers techniciens migen sur un site client"
              fill
              sizes="(max-width: 900px) 100vw, 540px"
              style={{
                objectFit: "cover",
                filter: "saturate(var(--sat)) contrast(1.05)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top,rgba(18,17,16,.78),rgba(18,17,16,0) 55%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 24,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  padding: "7px 13px",
                  borderRadius: 999,
                  background: "var(--acc)",
                  color: "#fff",
                }}
              >
                Avril 2021
              </span>
              <span
                style={{
                  font: "600 11px var(--fb)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  padding: "7px 13px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.9)",
                  color: "#1c1b19",
                }}
              >
                Lyon
              </span>
            </div>
            <div
              style={{ position: "absolute", left: 26, right: 26, bottom: 24 }}
            >
              <div
                style={{
                  font: "600 calc(clamp(20px,2vw,26px) * var(--ts))/1.25 var(--ft)",
                  letterSpacing: "-.03em",
                  color: "#fff",
                  maxWidth: "22ch",
                }}
              >
                23 ans, un cursus d&rsquo;automatisme, deux ans à travailler
                seul.
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                font: "600 11.5px var(--fb)",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 16,
              }}
            >
              Le premier client
            </div>
            <h2
              style={{
                font: "600 calc(clamp(28px,3.2vw,44px) * var(--ts))/1.06 var(--ft)",
                letterSpacing: "-.04em",
                color: "var(--ink)",
                margin: "0 0 20px",
                maxWidth: "18ch",
                textWrap: "balance",
              }}
            >
              Le nom est arrivé avant l&rsquo;entreprise.
            </h2>
            <p
              style={{
                font: "400 16.5px/1.75 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 16px",
                maxWidth: "52ch",
              }}
            >
              Il a 23 ans, il sort d&rsquo;un cursus d&rsquo;automatisme et il
              travaille seul depuis deux ans. Des industriels le rappellent,
              parce qu&rsquo;il répond et qu&rsquo;il revient. Un jour,
              l&rsquo;un d&rsquo;eux veut lui confier plus que ses bras&nbsp;: un
              contrat. Et un contrat, ça se signe avec une société.
            </p>
            <p
              style={{
                font: "400 16.5px/1.75 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "52ch",
              }}
            >
              La société n&rsquo;existe pas encore. Il faut répondre maintenant,
              sur cet appel, sans hésiter, parce qu&rsquo;hésiter sur le nom de
              sa propre entreprise, c&rsquo;est perdre le client.
            </p>
          </div>
        </div>

        <SigleMigen />

        <div
          data-reveal=""
          className="mg-r2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <div style={VERRE}>
            <div
              style={{
                font: "600 11px var(--fb)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--acc)",
                marginBottom: 14,
              }}
            >
              La suite
            </div>
            <p
              style={{
                font: "400 15.5px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "52ch",
              }}
            >
              Le client a signé. L&rsquo;entreprise s&rsquo;est construite dans
              cet ordre-là&nbsp;: les clients d&rsquo;abord, la structure
              ensuite. Un technicien, puis deux, puis des amis recrutés un par un
              parce qu&rsquo;il fallait tenir les sites. Aucune levée de fonds,
              aucun plan de croissance, juste des lignes qui ne devaient pas
              s&rsquo;arrêter.
            </p>
          </div>
          <div
            style={{
              ...VERRE,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ ...RANGEE, marginBottom: 10 }}>
              <span
                style={{
                  font: "600 calc(clamp(34px,4vw,52px) * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.055em",
                  color: "var(--acc)",
                }}
              >
                1
              </span>
              <span style={{ font: "400 15px var(--fb)", color: "var(--ink3)" }}>
                technicien en avril 2021
              </span>
            </div>
            <div
              style={{
                height: 1,
                background: "var(--line)",
                margin: "10px 0 14px",
              }}
            />
            <div style={RANGEE}>
              <span
                style={{
                  font: "600 calc(clamp(34px,4vw,52px) * var(--ts))/1 var(--ft)",
                  letterSpacing: "-.055em",
                  color: "var(--ink)",
                }}
              >
                +120
              </span>
              <span style={{ font: "400 15px var(--fb)", color: "var(--ink3)" }}>
                aujourd&rsquo;hui, cinq ans plus tard
              </span>
            </div>
          </div>
        </div>

        <div
          data-reveal=""
          style={{
            borderRadius: "var(--rad)",
            background: "var(--panel)",
            padding: "40px 44px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 440,
              height: 440,
              right: -180,
              top: -200,
              background:
                "radial-gradient(circle,rgba(255,124,60,.24),transparent 68%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="mg-r2"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: ".34fr 1.66fr",
              gap: 48,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: 20,
                }}
              >
                Le logo, lui, a été choisi
              </div>
              {/* Hauteur fixée, largeur libre : `img` et non `next/image`. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo-migen-white.png"
                alt="Monogramme migen"
                style={{ height: 78, width: "auto", display: "block" }}
              />
            </div>
            <div>
              <div
                style={{
                  font: "600 calc(clamp(20px,2.2vw,28px) * var(--ts))/1.2 var(--ft)",
                  letterSpacing: "-.035em",
                  color: "#fff",
                  margin: "0 0 18px",
                  maxWidth: "24ch",
                }}
              >
                Deux triangles de Penrose, et l&rsquo;archétype du magicien.
              </div>
              <p
                style={{
                  font: "400 16.5px/1.75 var(--fb)",
                  color: "rgba(255,255,255,.72)",
                  margin: "0 0 16px",
                  maxWidth: "62ch",
                }}
              >
                Le «&nbsp;M&nbsp;» est bâti sur des figures que l&rsquo;œil
                accepte immédiatement et qui ne peuvent pas exister. Le
                magicien, dans les archétypes de marque, est celui qui fait
                advenir ce qu&rsquo;on lui a dit impossible.
              </p>
              <p
                style={{
                  font: "400 16.5px/1.75 var(--fb)",
                  color: "rgba(255,255,255,.72)",
                  margin: 0,
                  maxWidth: "62ch",
                }}
              >
                Ce n&rsquo;est pas une métaphore gratuite&nbsp;: c&rsquo;est ce
                qu&rsquo;on nous dit au téléphone. «&nbsp;Cette machine est
                morte.&nbsp;» «&nbsp;Cet arrêt ne tiendra jamais en quatre
                jours.&nbsp;» «&nbsp;Personne ne trouvera un automaticien avant
                mars.&nbsp;» Le logo est là pour nous rappeler que c&rsquo;est
                précisément le travail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
