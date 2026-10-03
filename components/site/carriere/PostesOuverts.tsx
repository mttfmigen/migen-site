/**
 * « Offres d'emploi », maquette lignes 3310 à 3345.
 *
 * POURQUOI AUCUNE CARTE D'OFFRE N'EST RENDUE. La maquette alimente cette grille
 * par `<sc-for list="{{ jobs }}">`, et ses cartes tirent jusqu'à leur habillage
 * d'expressions que la maquette ne montre pas (`{{ j.wrapCss }}`,
 * `{{ j.typeCss }}`). La maquette ferme d'ailleurs la section par
 * « Intitulés et localisations d'exemple · à remplacer par vos offres
 * réelles ». Il n'y a donc ni offre ni habillage à reprendre : six fausses
 * annonces d'emploi valent moins que rien. La grille reste vide, et le bloc
 * ci-dessous dit la vérité au visiteur en l'envoyant vers le formulaire.
 *
 * Les filtres (`{{ jobFilters }}`) et le compteur (`{{ jobsCount }}`) suivent le
 * même raisonnement : sans offres, ils ne filtrent ni ne comptent rien.
 *
 * ÉCARTS À LA MAQUETTE :
 *   · elle promet un rappel sous un délai chiffré, interdit de copie ;
 *   · elle annonce un dépôt « dans notre outil de recrutement ». Le formulaire
 *     posé plus bas est celui du site, qui transmet la demande à l'équipe. Tant
 *     que la candidature n'arrive pas dans l'outil de recrutement, la page ne
 *     doit pas le dire.
 */

export default function PostesOuverts() {
  return (
    <section
      id="postes"
      style={{ padding: "var(--sec) 0 0", scrollMarginTop: 110 }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div data-reveal="">
          <div
            className="mg-r2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "56px",
              alignItems: "end",
              marginBottom: "26px",
            }}
          >
            <div>
              <div
                style={{
                  font: "600 11.5px var(--fb)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  marginBottom: "16px",
                }}
              >
                {"Offres d’emploi"}
              </div>
              <h2
                style={{
                  font: "600 calc(clamp(28px,3.2vw,46px) * var(--ts))/1.06 var(--ft)",
                  letterSpacing: "-.04em",
                  margin: 0,
                  maxWidth: "20ch",
                  textWrap: "balance",
                }}
              >
                {"Nos postes ouverts, mis à jour chaque semaine."}
              </h2>
            </div>
            <p
              style={{
                font: "400 16px/1.7 var(--fb)",
                color: "var(--ink2)",
                margin: 0,
                maxWidth: "44ch",
              }}
            >
              {
                "Vous postulez directement ici, en quatre minutes. Pas de compte à créer, pas de redirection : le formulaire transmet votre candidature à notre équipe de recrutement, qui vous rappelle."
              }
            </p>
          </div>

          <div
            style={{
              borderRadius: "var(--rad)",
              background: "rgba(255,255,255,var(--gl-a))",
              backdropFilter: "blur(var(--gl-b)) saturate(150%)",
              WebkitBackdropFilter: "blur(var(--gl-b)) saturate(150%)",
              border: "1px solid var(--gbd)",
              padding: "30px 34px 32px",
            }}
          >
            <div
              style={{
                font: "600 17px var(--ft)",
                letterSpacing: "-.025em",
                marginBottom: "8px",
              }}
            >
              Aucune offre publiée sur cette page pour le moment
            </div>
            <p
              style={{
                font: "400 14.5px/1.6 var(--fb)",
                color: "var(--ink2)",
                margin: "0 0 18px",
                maxWidth: "62ch",
              }}
            >
              {
                "Nous recrutons en continu sur les métiers de la maintenance industrielle. Déposez votre candidature : un recruteur reprend contact avec vous, même sans offre à votre nom."
              }
            </p>
            <a
              href="#candidater"
              style={{
                font: "600 14.5px var(--fb)",
                color: "var(--acc-ink)",
                textDecoration: "underline",
              }}
            >
              Déposer ma candidature
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
