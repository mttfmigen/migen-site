#!/usr/bin/env python3
"""
Découpe l'écriture d'une page en instructions assez courtes pour passer.

POURQUOI : la couche de permissions qui encadre `execute_sql` refuse toute
instruction au-delà d'environ huit kilo-octets, sans message Postgres, avant
même que la requête n'atteigne la base. Les pages éditoriales pèsent de seize à
vingt-quatre kilo-octets : aucune ne passait d'un bloc.

COMMENT : on vide d'abord le tableau, puis on l'allonge par morceaux.
    update pages set contenu = '{"gabarit":"editorial","blocs":[]}' where path = ...
    update pages set contenu = jsonb_set(contenu, '{blocs}', (contenu->'blocs') || '[...]') where path = ...
Chaque morceau est dimensionné pour rester sous le plafond. L'ordre du tableau
est préservé : `||` sur un tableau jsonb concatène à la fin.

La première instruction est idempotente, les suivantes ne le sont pas : rejouer
un import partiel sans repartir de la première dupliquerait des blocs. D'où le
découpage par page, et pas par lot.
"""

from __future__ import annotations

import json
import pathlib
import re

PLAFOND = 3800  # octets par instruction. Mesuré : des refus à 6 123 o, aucun sous 3 728 o.


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def instructions(url: str, contenu: dict, cle: str, entete: dict) -> list[str]:
    """La liste des instructions SQL pour une page, dans l'ordre d'exécution."""
    elements = contenu[cle]
    base = dict(entete)
    base[cle] = []
    out = [
        "update pages set contenu = "
        + q(json.dumps(base, ensure_ascii=False, separators=(",", ":")))
        + "::jsonb where path = " + q(url) + ";"
    ]

    morceau: list = []
    def vide():
        if not morceau:
            return
        out.append(
            "update pages set contenu = jsonb_set(contenu, '{" + cle + "}', "
            "(contenu->'" + cle + "') || "
            + q(json.dumps(morceau, ensure_ascii=False, separators=(",", ":")))
            + "::jsonb) where path = " + q(url) + ";"
        )
        morceau.clear()

    for element in elements:
        pese = len(json.dumps(element, ensure_ascii=False).encode())
        if morceau and sum(
            len(json.dumps(m, ensure_ascii=False).encode()) for m in morceau
        ) + pese > PLAFOND:
            vide()
        morceau.append(element)
        # Un seul élément plus lourd que le plafond : il part seul, et ce sera
        # refusé. On le signale plutôt que de le découper, car couper un bloc
        # au milieu produirait du contenu incohérent.
        if pese > PLAFOND:
            vide()
    vide()
    return out


def ecris(analyse: pathlib.Path, dossier: pathlib.Path, cle: str) -> None:
    pages = [
        r for r in json.loads(analyse.read_text())
        if r.get("url") and r["contenu"].get(cle)
    ]
    dossier.mkdir(parents=True, exist_ok=True)
    for ancien in dossier.glob("*.sql"):
        ancien.unlink()

    trop_gros = []
    for r in sorted(pages, key=lambda x: x["url"]):
        nom = re.sub(r"[^a-z0-9]+", "-", r["url"].strip("/").lower()).strip("-")
        entete = {k: v for k, v in r["contenu"].items() if k != cle}
        lignes = instructions(r["url"], r["contenu"], cle, entete)
        mc = (r.get("mot_cle") or "").strip()
        if mc and mc.lower() not in {"null", "none"} and not mc.lower().startswith(("aucun", "cta:")):
            lignes.append(
                "update pages set mot_cle_principal = coalesce(mot_cle_principal, "
                + q(mc) + ") where path = " + q(r["url"]) + ";"
            )
        (dossier / f"{nom}.sql").write_text("\n".join(lignes) + "\n")
        for l in lignes:
            if len(l.encode()) > PLAFOND + 600:
                trop_gros.append((r["url"], len(l.encode())))

    tailles = [
        len(l.encode())
        for f in dossier.glob("*.sql")
        for l in f.read_text().split("\n") if l.strip()
    ]
    print(f"{len(pages)} pages -> {dossier}")
    print(f"  {len(tailles)} instructions, la plus longue {max(tailles)} o, médiane {sorted(tailles)[len(tailles)//2]} o")
    if trop_gros:
        print(f"  ATTENTION, {len(trop_gros)} instructions au-dessus du plafond :")
        for u, o in trop_gros[:5]:
            print(f"     {u} : {o} o")


if __name__ == "__main__":
    base = pathlib.Path("supabase/import")
    ecris(base / "editorial-analyse.json", base / "editorial", "blocs")
    ecris(base / "corpus-analyse.json", base / "contenu", "sections")
