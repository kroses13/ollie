import { createOllieSvg } from "../content/companion-view.js";

const heroPreview = document.querySelector("#hero-preview");
const heroSvg = createOllieSvg({ className: "hero-svg" });
heroPreview.append(heroSvg);

const sizePreviews = document.querySelector("#size-previews");

[24, 32, 48].forEach((width) => {
  const card = document.createElement("article");
  card.className = "size-card";

  const svg = createOllieSvg();
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String((width * 18) / 24));

  const label = document.createElement("p");
  label.textContent = `${width}px wide`;

  card.append(svg, label);
  sizePreviews.append(card);
});
