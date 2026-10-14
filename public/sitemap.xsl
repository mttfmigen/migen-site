<?xml version="1.0" encoding="UTF-8"?>
<!--
  Feuille de style du plan de site XML de migen.fr : rend l'index et les
  sous-plans lisibles dans un navigateur, en français. Les robots lisent le XML
  brut et ne la chargent pas. Voir docs/PLAN-DU-SITE-XML.md.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  exclude-result-prefixes="s image">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <!-- 2026-10-14T09:26:53+00:00 devient 14/10/2026 09:26 (UTC) -->
  <xsl:template name="date">
    <xsl:param name="valeur"/>
    <xsl:if test="$valeur">
      <xsl:value-of select="concat(substring($valeur, 9, 2), '/', substring($valeur, 6, 2), '/', substring($valeur, 1, 4), ' ', substring($valeur, 12, 5))"/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/">
    <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex, follow"/>
        <title>Plan du site XML | Migen</title>
        <style>
          :root { color-scheme: light; }
          body { margin: 0; background: #f6f6f4; color: #1d1d1b; font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
          main { max-width: 1100px; margin: 0 auto; padding: 32px 16px 48px; }
          h1 { font-size: 26px; margin: 0 0 8px; }
          p { margin: 0 0 16px; color: #4a4a46; max-width: 70ch; }
          .compte { font-weight: 600; color: #1d1d1b; }
          .tableau { overflow-x: auto; background: #fff; border: 1px solid #e2e2dd; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #ecece8; vertical-align: top; }
          th { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #6b6b66; background: #fafaf8; }
          tr:last-child td { border-bottom: 0; }
          td.adresse { width: 60%; overflow-wrap: anywhere; }
          @media (max-width: 600px) {
            th, td { padding: 8px 10px; }
            th { font-size: 11px; }
            td.adresse { width: 70%; }
          }
          td.nombre, th.nombre { text-align: right; white-space: nowrap; }
          td.date { white-space: nowrap; color: #4a4a46; }
          a { color: #c2410c; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <main>
          <h1>Plan du site XML</h1>
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <p>
                Ce fichier sert aux moteurs de recherche. Il liste les plans du site de Migen :
                <span class="compte"><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> plans</span>.
                Ouvrez-en un pour voir ses pages.
              </p>
              <div class="tableau">
                <table>
                  <thead>
                    <tr><th>Plan</th><th>Dernière modification (UTC)</th></tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="s:sitemapindex/s:sitemap">
                      <tr>
                        <td class="adresse"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                        <td class="date"><xsl:call-template name="date"><xsl:with-param name="valeur" select="s:lastmod"/></xsl:call-template></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:when>
            <xsl:otherwise>
              <p>
                Ce fichier sert aux moteurs de recherche. Il compte
                <span class="compte"><xsl:value-of select="count(s:urlset/s:url)"/> adresses</span>.
                <a href="/sitemap_index.xml">Retour à l'index des plans</a>.
              </p>
              <div class="tableau">
                <table>
                  <thead>
                    <tr><th>Adresse</th><th class="nombre">Images</th><th>Dernière modification (UTC)</th></tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="s:urlset/s:url">
                      <tr>
                        <td class="adresse"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                        <td class="nombre"><xsl:value-of select="count(image:image)"/></td>
                        <td class="date"><xsl:call-template name="date"><xsl:with-param name="valeur" select="s:lastmod"/></xsl:call-template></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
