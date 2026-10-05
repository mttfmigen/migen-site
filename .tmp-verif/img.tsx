import { renderToStaticMarkup } from "react-dom/server";
import Article from "@/components/site/article/Article";
const h = renderToStaticMarkup(
  <Article titre="T" contenu={{ chapeau: "c", sections: [], image: { src: "/assets/web/sv-armoire.jpg", alt: "a" } }} />,
);
const i = h.indexOf("<img");
console.log(h.slice(i - 260, i + 600));
