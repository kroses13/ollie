import { mkdir, writeFile } from "node:fs/promises";
import {
  OLLIE_POSE_GRIDS,
  OLLIE_POSE_LAYOUTS,
} from "../content/ollie-grid.js";

const OUTPUT_DIRECTORY = new URL("../assets/ollie-poses/", import.meta.url);
const DEFAULT_PALETTE = Object.freeze({
  outline: "#302831",
  body: "#ffc8c8",
  shade: "#ed8588",
  highlight: "#ffe3d5",
  eye: "#302831",
  sucker: "#fff0c9",
  "prop-grey": "#a9adb7",
  "prop-handle": "#8b5a3c",
});

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

for (const [pose, grid] of Object.entries(OLLIE_POSE_GRIDS)) {
  const svg = renderSvg(pose, grid);
  await writeFile(new URL(`${pose}.svg`, OUTPUT_DIRECTORY), svg, "utf8");
}

function renderSvg(pose, grid) {
  const layout = OLLIE_POSE_LAYOUTS[pose];
  const rects = [];
  grid.forEach((row, y) => {
    row.forEach((role, x) => {
      if (!role) {
        return;
      }
      rects.push(
        `    <rect x="${x}" y="${y}" width="1" height="1" class="ollie-pixel ollie-pixel--${role}" data-role="${role}"/>`,
      );
    });
  });

  const styles = Object.entries(DEFAULT_PALETTE)
    .map(([role, colour]) => `    --ollie-${role}: ${colour};`)
    .join("\n");
  const rules = Object.keys(DEFAULT_PALETTE)
    .map(
      (role) =>
        `    .ollie-pixel--${role} { fill: var(--ollie-${role}); }`,
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" shape-rendering="crispEdges" role="img" aria-label="Ollie ${pose}">
  <!-- Generated from the hand-authored structured grids in content/ollie-grid.js. -->
  <style>
  :root {
${styles}
  }
${rules}
  </style>
  <g id="ollie-pose-${pose}" data-pose="${pose}">
${rects.join("\n")}
  </g>
</svg>
`;
}
