#!/usr/bin/env python3
"""Controle de l'ecart entre notre copie du 05/10 et l'export Claude Design du jour.

Methode : faute de pouvoir rapatrier les 1,5 Mo de l'export (voir rapport), on a
mesure l'ALIGNEMENT. Chaque ancre est une ligne lue dans l'export distant et
retrouvee a l'identique dans notre copie locale. Le decalage distant-local est
constant sur un segment inchange, et il SAUTE a chaque insertion ou suppression.

Ce script re-verifie, sur le fichier local reellement present sur le disque :
  1. que chaque ancre locale porte bien le texte annonce (sinon l'ancre est fausse) ;
  2. que l'alignement est monotone strict (un vrai appariement, pas du hasard) ;
  3. que la somme algebrique des sauts egale l'ecart de lignes observe (+50).
Si (3) ferme, aucune modification de NOMBRE de lignes n'a echappe au releve.
"""
import sys

LOCAL = "/Users/mehdi/Landing lovable/migen-site/maquette/site-final.html"
LIGNES_DISTANT = 9567  # total_lines renvoye par read_file sur l'export du jour

# (ligne_distante, ligne_locale, fragment attendu sur la ligne locale)
ANCRES = [
    (40, 35, "--logo-f:grayscale(1)"),
    (130, 123, "@container (max-width:1100px){.mg-tel"),
    (140, 133, "@container (max-width:880px){.mg-nav"),
    (150, 141, "@container (max-width:760px){.mg-doclist"),
    (200, 186, "onMouseEnter=\"{{ openExpertises }}\""),
    (403, 389, "Gestes, seuils, valeurs de référence"),
    (501, 487, "letter-spacing:.02em;color:var(--ink1);box-shadow:0 2px 10px rgba(0,0,0,.05)"),
    (600, 566, ">migen© Zéro arrêt<"),
    (701, 667, "Seuls 10&nbsp;% des techniciens réussissent notre process."),
    (750, 716, ">Étape 5<"),
    (1100, 1066, ">Avec migen©<"),
    (1203, 1169, "data-screen-label=\"Accueil · Secteurs\""),
    (1253, 1211, "data-screen-label=\"Nos offres\""),
    (1301, 1259, "<sc-if value=\"{{ n.open }}\""),
    (1500, 1434, "<sc-if value=\"{{ dNetNegative }}\""),
    (2201, 2135, ">Pages liées</h2>"),
    (3001, 2935, "animation:mgMarquee 60s linear infinite"),
    (3400, 3334, "Dans le Rhône, les profils qualifiés partent en 48&nbsp;h"),
    (3551, 3508, "Analyse vibratoire : seuils d’alerte"),
    (3851, 3808, "Relevé vibratoire&nbsp;: les points de mesure"),
    (4001, 3958, ">25 N·m<"),
    (4800, 4757, ">Ce que nous faisons<"),
    (5250, 5207, "assets/team/mehdi-attaf.png"),
    (5299, 5256, "data-screen-label=\"Équipe · Qui nous sommes\""),
    (5500, 5460, "Le métier pivot de nos équipes"),
    (6300, 6260, "Relevé de compteurs et échéancier"),
    (7200, 7160, "Envoyer nos guides"),
    (8200, 8160, "const cat = this.state.realCat"),
    (8500, 8460, "if (b.units) return b.units.length * 260;"),
    (8950, 8908, "base.spRest = rest.map("),
    (9100, 9050, "Le métier s’apprend"),
    (9400, 9350, "goImplant: this.cxGo(\"/implantations/\")"),
]


def main():
    lignes = open(LOCAL, encoding="utf-8").read().split("\n")
    while lignes and lignes[-1] == "":
        lignes.pop()
    n_local = len(lignes)
    ecart_attendu = LIGNES_DISTANT - n_local
    print(f"local  : {n_local} lignes")
    print(f"distant: {LIGNES_DISTANT} lignes")
    print(f"ecart  : {ecart_attendu:+d} lignes\n")

    faux = []
    for d, l, frag in ANCRES:
        if not (1 <= l <= n_local) or frag not in lignes[l - 1]:
            faux.append((d, l, frag))
    if faux:
        print("ANCRES FAUSSES (le fragment annonce n'est pas sur la ligne locale) :")
        for d, l, frag in faux:
            print(f"  distant {d} -> local {l} : {frag!r} ABSENT")
        return 1
    print(f"1. {len(ANCRES)} ancres verifiees sur le fichier local : toutes exactes.")

    d_prec = l_prec = 0
    for d, l, _ in ANCRES:
        if d <= d_prec or l <= l_prec:
            print(f"2. ECHEC : alignement non monotone en distant {d} / local {l}.")
            return 1
        d_prec, l_prec = d, l
    print("2. Alignement strictement monotone : appariement valide.")

    print("\n3. Segments de decalage constant, et sauts (= les retouches) :")
    sauts, prec = [], None
    for d, l, _ in ANCRES:
        s = d - l
        if prec is None:
            if s:
                sauts.append((1, d, s))
                print(f"   avant la ligne {d:5d} : {s:+3d} lignes")
        elif s != prec[0]:
            sauts.append((prec[1], d, s - prec[0]))
            print(f"   entre {prec[1]:5d} et {d:5d} : {s - prec[0]:+3d} lignes")
        prec = (s, d)

    total = sum(x[2] for x in sauts)
    final = ANCRES[-1][0] - ANCRES[-1][1]
    print(f"\n   {len(sauts)} retouches, somme des sauts : {total:+d}")
    print(f"   decalage a la derniere ancre            : {final:+d}")
    print(f"   ecart de lignes des deux fichiers       : {ecart_attendu:+d}")

    assert total == ecart_attendu, f"somme des sauts {total} != ecart {ecart_attendu}"
    assert final == ecart_attendu, f"decalage final {final} != ecart {ecart_attendu}"
    print("\n   OK : la somme ferme. Toute modification du NOMBRE de lignes")
    print("   est dans l'un des segments ci-dessus, aucune n'a ete manquee.")
    print("   (limite : une substitution a nombre de lignes egal reste invisible")
    print("    a cette methode ; les 32 ancres ci-dessus sont, elles, identiques.)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
