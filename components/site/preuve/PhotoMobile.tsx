import Image, { getImageProps, type ImageProps } from "next/image";

/**
 * LA PHOTO DU BUREAU, ET SOUS 880 PX CELLE DE LA MAQUETTE MOBILE.
 *
 * `<picture>` et sa `<source media>` : le navigateur choisit une seule des
 * deux, et ne télécharge que celle-là. Au-dessus de 880 px, l'`<img>` est
 * exactement celle que rendait `next/image` (mêmes `src`, `srcSet`, `sizes`,
 * style), le bureau ne bouge donc pas d'un pixel. Sans photo mobile, c'est
 * `next/image` tel quel, préchargement compris.
 *
 * `priority` devient `fetchPriority="high"` sans préchargement : un
 * préchargement de la photo du bureau la ferait aussi télécharger au
 * téléphone, qui ne l'affiche pas.
 */
export default function PhotoMobile({ mobile, ...props }: ImageProps & { mobile?: string }) {
  if (!mobile || mobile === props.src) return <Image {...props} />;
  const { props: bureau } = getImageProps(props);
  const {
    props: { srcSet },
  } = getImageProps({ ...props, src: mobile, sizes: "100vw" });
  return (
    <picture>
      <source media="(max-width: 880px)" srcSet={srcSet} sizes="100vw" />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...bureau} />
    </picture>
  );
}
