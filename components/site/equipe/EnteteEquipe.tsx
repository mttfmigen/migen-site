import { H1 } from "./equipe-donnees";

/**
 * Le héros de l'écran équipe : surtitre, H1, chapeau. Relevé sur la capture
 * `maquette/rendu/a-propos--equipe.html`. Sorti de la page pour que le
 * contrôle le monte comme les autres sections.
 */
export default function EnteteEquipe() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "70px 40px 0" }}>
      <div
        style={{
          font: "600 11.5px var(--fb)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          // Contraste AA : l'orange de marque donnait 2,29:1 sur ce fond clair, --acc-ink donne 7,98:1.
          color: "var(--acc-ink)",
          marginBottom: 20,
        }}
      >
        Équipe &amp; direction
      </div>
      <h1
        style={{
          font: "600 calc(clamp(38px,4.6vw,70px) * var(--ts))/1.03 var(--ft)",
          letterSpacing: "-.045em",
          margin: 0,
          maxWidth: "19ch",
          textWrap: "balance",
        }}
      >
        {H1}
      </h1>
      <p
        style={{
          font: "400 18.5px/1.6 var(--fb)",
          color: "var(--ink2)",
          margin: "24px 0 0",
          maxWidth: "56ch",
        }}
      >
        Une direction et des responsables qui décident vite et
        s&rsquo;engagent personnellement, cent vingt techniciens sur le
        terrain. De la première visite au bilan de mission, vous avez
        toujours un nom en face de vous.
      </p>
    </section>
  );
}
