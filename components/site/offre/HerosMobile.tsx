import Image from "next/image";

import { FilArianeMobile } from "@/components/site/expertises/mobile";
import { cadragePhoto } from "@/lib/cadrage-photos";
import { altPhoto } from "@/lib/descriptions-photos";

/**
 * LE HAUT DE PAGE DE LA MAQUETTE MOBILE V2 (dc.html L104 à L111), pour les
 * gabarits Offre et hub Offres : fil d'Ariane, puis photo de tête. Les deux
 * n'existent que sous 881 px (`data-mobile-seulement`) ; le reste du héros
 * (sur-titre, H1, boutons, chapô) est celui du bureau, remis dans l'ordre de
 * la maquette par `data-heros-colonne` (`app/globals.css`).
 *
 * LA PHOTO EST UNE PHOTO QUE LA PAGE PORTE DÉJÀ SUR BUREAU, jamais une
 * nouvelle : l'appelant passe celle de son bloc « Votre problématique », ou à
 * défaut celle de sa FAQ, et ce bloc la masque alors au téléphone. Elle
 * change de place, elle ne se double pas.
 *
 * Le fil reprend `FilArianeMobile` du gabarit Expertises : le calcul de la
 * maquette (dc.html L495 à L497) depuis l'index du client, sans rien rédiger.
 */
export default function HerosMobile({
  chemin,
  photo,
}: {
  chemin?: string;
  photo?: string | null;
}) {
  return (
    <>
      {chemin ? <FilArianeMobile chemin={chemin} /> : null}
      {photo ? (
        <div data-heros-photo="" data-mobile-seulement="">
          <Image
            src={photo}
            alt={altPhoto(photo)}
            fill
            sizes="(max-width: 880px) 100vw, 1px"
            style={{ objectFit: "cover", objectPosition: cadragePhoto(photo, 16 / 10) }}
          />
        </div>
      ) : null}
    </>
  );
}
