export const OLLIE_GRID_WIDTH = 24;
export const OLLIE_GRID_HEIGHT = 18;

export const OLLIE_PIXEL_ROLES = Object.freeze({
  O: "outline",
  B: "body",
  S: "shade",
  H: "highlight",
  E: "eye",
  C: "sucker",
});

// Each character is one square SVG pixel. A dot is an empty cell.
// The right-side curl is excluded and supplied by OLLIE_ACTION_TENTACLE_GRID so
// future motion can target it without rebuilding or swapping the idle asset.
const IDLE_BODY_ROWS = [
  "........OOOOOOOO........",
  "......OOBBBBBBBBOO......",
  ".....OBHBBBBBBBBBBO.....",
  "..OOOBBBBBBBBBBBBBBO....",
  ".OSSOHBBBBBBBBBBBBBBO...",
  "OSSSBBBBBBBBBBBBBBBBO...",
  "OSCCSBEBBBBBBEBBBBBBO...",
  "OSSCSBEBBBBBBEBBBBBBO...",
  ".OOOBBBBBBBBBBBBBBBBO...",
  "..OOSBBBBBBBBBBBBBBBO...",
  "...OSSSBBBBBBBBBBBBO....",
  "...OOSBSBBSBBSBBSBBO....",
  "..OBBOSBBOBBOBBOBBBO....",
  "..OBBOHBBOSBOHBOBBBO....",
  "..OBBOBBBOSBOBBOSBBO....",
  "..OOOBBBOHBOHBBOSBBO....",
  "....OOOOBBBOBBOOOO......",
  "........OOOOOOO.........",
];

const ACTION_TENTACLE_ROWS = [
  "........................",
  "........................",
  "........................",
  "...................OOOO.",
  "...................OSSOO",
  "...................BSSSO",
  "...................BSCCO",
  "...................BSCSO",
  "...................BOOO.",
  "...................BO...",
  "..................OO....",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
  "........................",
];

function parseGrid(rows, gridName) {
  if (rows.length !== OLLIE_GRID_HEIGHT) {
    throw new Error(`${gridName} must have ${OLLIE_GRID_HEIGHT} rows.`);
  }

  return Object.freeze(
    rows.map((row, y) => {
      if (row.length !== OLLIE_GRID_WIDTH) {
        throw new Error(
          `${gridName} row ${y} must have ${OLLIE_GRID_WIDTH} cells.`,
        );
      }

      return Object.freeze(
        [...row].map((cell) => {
          if (cell === ".") {
            return null;
          }

          const role = OLLIE_PIXEL_ROLES[cell];
          if (!role) {
            throw new Error(`${gridName} contains unknown pixel role "${cell}".`);
          }

          return role;
        }),
      );
    }),
  );
}

export const OLLIE_IDLE_GRID = parseGrid(IDLE_BODY_ROWS, "OLLIE_IDLE_GRID");
export const OLLIE_ACTION_TENTACLE_GRID = parseGrid(
  ACTION_TENTACLE_ROWS,
  "OLLIE_ACTION_TENTACLE_GRID",
);
