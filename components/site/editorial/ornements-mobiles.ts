/**
 * LE RETRAIT DES ORNEMENTS DU TÉLÉPHONE, EN UN SEUL ENDROIT.
 *
 * POURQUOI CE FICHIER EXISTE. Les portes de la famille éditoriale comparent
 * le texte servi au texte de la CAPTURE, et la capture est une capture de
 * BUREAU. Les ornements du repli mobile, le chevron, le résumé de deux lignes
 * et l'étiquette de la bascule, portent tous `data-mobile-seulement` : ils
 * sont masqués au-dessus de 880 px et la capture n'a donc aucune raison de
 * les porter. Les laisser dans la comparaison fait signaler « texte
 * différent » sur un ornement que personne ne voit à cette largeur.
 *
 * ET POURQUOI IL EST PARTAGÉ. `verification-ressource.tsx` et
 * `verification-editorial.tsx` en avaient chacune sa version. Celle du
 * gabarit ressource était PARESSEUSE : `<(\w+)…>[\s\S]*?<\/\1>` s'arrête au
 * premier `</span>` rencontré. Tant que les ornements du gabarit étaient des
 * feuilles, un chevron et un résumé, elle suffisait. Le 13/10 la bascule du
 * gabarit a reçu une ÉTIQUETTE, et l'étiquette est un `<span>` QUI EN
 * CONTIENT DEUX, le numéro et le titre : la version paresseuse n'en retirait
 * que la moitié, laissait le titre dans le texte comparé, et la porte
 * refusait 35 pages sur 35 pour une faute qui n'était pas dans la page mais
 * dans sa propre lecture.
 *
 * Deux lectures du même HTML qui divergent au premier ajustement, c'est la
 * panne suivante : il n'y en a donc plus qu'une.
 */

/**
 * Le HTML privé de tout élément marqué `data-mobile-seulement`, ses
 * descendants compris.
 *
 * TROIS CAS, et chacun a sa raison :
 *   · élément auto-fermant : on retire la balise, il n'a pas de contenu ;
 *   · élément imbriqué : on compte les balises ouvrantes et fermantes de même
 *     nom pour trouver SA fermeture, et pas celle d'un enfant ;
 *   · balise jamais refermée : ON NE RETIRE RIEN et on s'arrête. Couper au
 *     hasard emporterait la moitié du document et rendrait la comparaison
 *     muette, ce qui est pire qu'un faux signalement : une porte qui ne
 *     compare plus rien est verte pour de mauvaises raisons.
 */
export function sansOrnementsMobiles(html: string): string {
  const marque = /<(\w+)\b[^>]*\sdata-mobile-seulement\b[^>]*?(\/?)>/;
  let sortie = html;
  for (;;) {
    const depart = marque.exec(sortie);
    if (!depart) return sortie;
    const [ouvrant, balise, autoFerme] = depart;
    const debut = depart.index;
    if (autoFerme === "/") {
      sortie = `${sortie.slice(0, debut)} ${sortie.slice(debut + ouvrant.length)}`;
      continue;
    }
    const jetons = new RegExp(`<${balise}\\b[^>]*?(\\/?)>|</${balise}>`, "g");
    jetons.lastIndex = debut;
    let profondeur = 0;
    let fin = -1;
    let jeton: RegExpExecArray | null;
    while ((jeton = jetons.exec(sortie)) !== null) {
      if (jeton[0].startsWith("</")) {
        profondeur -= 1;
        if (profondeur === 0) {
          fin = jeton.index + jeton[0].length;
          break;
        }
      } else if (jeton[1] !== "/") {
        profondeur += 1;
      }
    }
    if (fin < 0) return sortie;
    sortie = `${sortie.slice(0, debut)} ${sortie.slice(fin)}`;
  }
}
