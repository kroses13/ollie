export const OLLIE_GRID_WIDTH = 24;
export const OLLIE_GRID_HEIGHT = 18;
export const OLLIE_PROP_GRID_WIDTH = 32;
export const OLLIE_LAPTOP_GRID_WIDTH = 36;

export const OLLIE_PIXEL_ROLES = Object.freeze({
  O: "outline",
  B: "body",
  S: "shade",
  H: "highlight",
  E: "eye",
  C: "sucker",
  P: "prop-grey",
  R: "prop-handle",
});

export const OLLIE_POSE = Object.freeze({
  IDLE: "idle",
  LOOK_LEFT: "look-left",
  LOOK_RIGHT: "look-right",
  THINKING: "thinking",
  HOLDING_HAMMER: "holding-hammer",
  HAMMER_STRIKE: "hammer-strike",
  WORKING_LAPTOP: "working-laptop",
  SLEEPING: "sleeping",
});

export const OLLIE_POSE_LAYOUTS = Object.freeze({
  [OLLIE_POSE.IDLE]: Object.freeze({ width: 24, height: 18 }),
  [OLLIE_POSE.LOOK_LEFT]: Object.freeze({ width: 24, height: 18 }),
  [OLLIE_POSE.LOOK_RIGHT]: Object.freeze({ width: 24, height: 18 }),
  [OLLIE_POSE.THINKING]: Object.freeze({ width: 24, height: 18 }),
  [OLLIE_POSE.HOLDING_HAMMER]: Object.freeze({ width: 32, height: 18 }),
  [OLLIE_POSE.HAMMER_STRIKE]: Object.freeze({ width: 32, height: 18 }),
  [OLLIE_POSE.WORKING_LAPTOP]: Object.freeze({ width: 36, height: 18 }),
  [OLLIE_POSE.SLEEPING]: Object.freeze({ width: 24, height: 18 }),
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

function parseGrid(
  rows,
  gridName,
  width = OLLIE_GRID_WIDTH,
  height = OLLIE_GRID_HEIGHT,
) {
  if (rows.length !== height) {
    throw new Error(`${gridName} must have ${height} rows.`);
  }

  return Object.freeze(
    rows.map((row, y) => {
      if (row.length !== width) {
        throw new Error(
          `${gridName} row ${y} must have ${width} cells.`,
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

function mergeGrids(...grids) {
  return Object.freeze(
    Array.from({ length: OLLIE_GRID_HEIGHT }, (_, y) =>
      Object.freeze(
        Array.from(
          { length: OLLIE_GRID_WIDTH },
          (_, x) => grids.findLast((grid) => grid[y][x])?.[y][x] ?? null,
        ),
      ),
    ),
  );
}

function createGridVariant(sourceGrid, changes) {
  const grid = sourceGrid.map((row) => [...row]);
  changes.forEach(([x, y, roleCode]) => {
    grid[y][x] = roleCode ? OLLIE_PIXEL_ROLES[roleCode] : null;
  });
  return Object.freeze(grid.map((row) => Object.freeze(row)));
}

function extendGrid(sourceGrid, width, height = OLLIE_GRID_HEIGHT) {
  return Object.freeze(
    Array.from({ length: height }, (_, y) =>
      Object.freeze(
        Array.from({ length: width }, (_, x) => sourceGrid[y]?.[x] ?? null),
      ),
    ),
  );
}

function mergeCanvasGrids(width, height, ...grids) {
  return Object.freeze(
    Array.from({ length: height }, (_, y) =>
      Object.freeze(
        Array.from(
          { length: width },
          (_, x) => grids.findLast((grid) => grid[y]?.[x])?.[y]?.[x] ?? null,
        ),
      ),
    ),
  );
}

function authoredRow(...segments) {
  return authoredCanvasRow(OLLIE_GRID_WIDTH, ...segments);
}

function authoredCanvasRow(width, ...segments) {
  const cells = Array(width).fill(".");
  segments.forEach(([start, roles]) => {
    [...roles].forEach((role, offset) => {
      cells[start + offset] = role;
    });
  });
  return cells.join("");
}

export const OLLIE_IDLE_GRID = parseGrid(IDLE_BODY_ROWS, "OLLIE_IDLE_GRID");
export const OLLIE_ACTION_TENTACLE_GRID = parseGrid(
  ACTION_TENTACLE_ROWS,
  "OLLIE_ACTION_TENTACLE_GRID",
);

const OLLIE_COMPLETE_IDLE_GRID = mergeGrids(
  OLLIE_IDLE_GRID,
  OLLIE_ACTION_TENTACLE_GRID,
);

export const OLLIE_LOOK_LEFT_GRID = createGridVariant(
  OLLIE_COMPLETE_IDLE_GRID,
  [
    [6, 6, "B"],
    [6, 7, "B"],
    [13, 6, "B"],
    [13, 7, "B"],
    [5, 6, "E"],
    [5, 7, "E"],
    [11, 6, "E"],
    [11, 7, "E"],
    [18, 10, "B"],
    [19, 10, "O"],
  ],
);

export const OLLIE_LOOK_RIGHT_GRID = createGridVariant(
  OLLIE_COMPLETE_IDLE_GRID,
  [
    [6, 6, "B"],
    [6, 7, "B"],
    [13, 6, "B"],
    [13, 7, "B"],
    [8, 6, "E"],
    [8, 7, "E"],
    [15, 6, "E"],
    [15, 7, "E"],
    [18, 10, "O"],
    [19, 10, null],
  ],
);

export const OLLIE_THINKING_GRID = createGridVariant(
  OLLIE_COMPLETE_IDLE_GRID,
  [
    [6, 6, "B"],
    [6, 7, "B"],
    [13, 6, "B"],
    [13, 7, "B"],
    [8, 7, "E"],
    [8, 8, "E"],
    [14, 7, "E"],
    [14, 8, "E"],
    [18, 10, null],
    [19, 10, null],
    [18, 11, "O"],
    [19, 11, "B"],
    [20, 11, "O"],
    [19, 12, "O"],
  ],
);

const HOLDING_HAMMER_PROP_ROWS = [
  authoredCanvasRow(32, [24, "OOOOOO"]),
  authoredCanvasRow(32, [23, "OPPPPPPO"]),
  authoredCanvasRow(32, [23, "OPHPPPPO"]),
  authoredCanvasRow(32, [24, "OOOOOO"]),
  authoredCanvasRow(32, [26, "ORRO"]),
  authoredCanvasRow(32, [25, "ORRO"]),
  authoredCanvasRow(32, [24, "ORRO"]),
  authoredCanvasRow(32, [23, "ORRO"]),
  authoredCanvasRow(32, [21, "OOBBO"]),
  authoredCanvasRow(32, [19, "OOBBBO"]),
  authoredCanvasRow(32, [18, "OBBBBO"]),
  authoredCanvasRow(32, [18, "OOO"]),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
];

const HAMMER_STRIKE_PROP_ROWS = [
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32),
  authoredCanvasRow(32, [18, "OOOOOO"]),
  authoredCanvasRow(32, [18, "OBBBB"], [23, "RRO"]),
  authoredCanvasRow(32, [18, "OBBBBO"], [23, "ORRO"]),
  authoredCanvasRow(32, [18, "OOOOOO"], [24, "ORRO"]),
  authoredCanvasRow(32, [25, "ORRO"]),
  authoredCanvasRow(32, [27, "OOOOO"]),
  authoredCanvasRow(32, [27, "OPPPO"]),
  authoredCanvasRow(32, [27, "OPHPO"]),
  authoredCanvasRow(32, [27, "OPPPO"]),
  authoredCanvasRow(32, [27, "OOOOO"]),
];

const LAPTOP_PROP_ROWS = [
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36, [25, "OOOOOOOOO"]),
  authoredCanvasRow(36, [24, "OPPPPPPPPPO"]),
  authoredCanvasRow(36, [24, "OPPPPPPPPPO"]),
  authoredCanvasRow(36, [24, "OPPPPHPPPPO"]),
  authoredCanvasRow(36, [24, "OPPPHHHPPPO"]),
  authoredCanvasRow(36, [24, "OPPPPHPPPPO"]),
  authoredCanvasRow(36, [24, "OPPPPPPPPPO"]),
  authoredCanvasRow(36, [24, "OPPPPPPPPPO"]),
  authoredCanvasRow(36, [23, "OOOOOOOOOOOO"]),
  authoredCanvasRow(36),
];

const EXTENDED_IDLE_BODY_GRID = extendGrid(
  OLLIE_IDLE_GRID,
  OLLIE_PROP_GRID_WIDTH,
);
const LAPTOP_LEANING_BODY_GRID = Object.freeze(
  Array.from({ length: OLLIE_GRID_HEIGHT }, (_, y) =>
    Object.freeze(
      Array.from({ length: OLLIE_LAPTOP_GRID_WIDTH }, (_, x) => {
        const sourceX = y <= 10 ? x - 1 : x;
        return OLLIE_IDLE_GRID[y]?.[sourceX] ?? null;
      }),
    ),
  ),
);
const LAPTOP_ENGAGED_BODY_GRID = createGridVariant(
  LAPTOP_LEANING_BODY_GRID,
  [
    [7, 6, "B"],
    [7, 7, "B"],
    [14, 6, "B"],
    [14, 7, "B"],
    [9, 6, "E"],
    [9, 7, "E"],
    [16, 6, "E"],
    [16, 7, "E"],
  ],
);
const LAPTOP_WORKING_TENTACLE_ROWS = [
  ...Array.from({ length: 9 }, () => authoredCanvasRow(36)),
  authoredCanvasRow(36, [20, "OOBBO"]),
  authoredCanvasRow(36, [20, "OBBBBO"]),
  authoredCanvasRow(36, [19, "OOBBBBO"]),
  authoredCanvasRow(36, [20, "OOBBBO"]),
  authoredCanvasRow(36, [21, "OOBO"]),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
  authoredCanvasRow(36),
];

export const OLLIE_HOLDING_HAMMER_GRID = mergeCanvasGrids(
  OLLIE_PROP_GRID_WIDTH,
  OLLIE_GRID_HEIGHT,
  EXTENDED_IDLE_BODY_GRID,
  parseGrid(
    HOLDING_HAMMER_PROP_ROWS,
    "HOLDING_HAMMER_PROP_ROWS",
    OLLIE_PROP_GRID_WIDTH,
  ),
);

export const OLLIE_HAMMER_STRIKE_GRID = mergeCanvasGrids(
  OLLIE_PROP_GRID_WIDTH,
  OLLIE_GRID_HEIGHT,
  EXTENDED_IDLE_BODY_GRID,
  parseGrid(
    HAMMER_STRIKE_PROP_ROWS,
    "HAMMER_STRIKE_PROP_ROWS",
    OLLIE_PROP_GRID_WIDTH,
  ),
);

export const OLLIE_WORKING_LAPTOP_GRID = mergeCanvasGrids(
  OLLIE_LAPTOP_GRID_WIDTH,
  OLLIE_GRID_HEIGHT,
  LAPTOP_ENGAGED_BODY_GRID,
  parseGrid(LAPTOP_PROP_ROWS, "LAPTOP_PROP_ROWS", OLLIE_LAPTOP_GRID_WIDTH),
  parseGrid(
    LAPTOP_WORKING_TENTACLE_ROWS,
    "LAPTOP_WORKING_TENTACLE_ROWS",
    OLLIE_LAPTOP_GRID_WIDTH,
  ),
);

const SLEEPING_ROWS = [
  authoredRow([20, "OOO"]),
  authoredRow([22, "O"]),
  authoredRow([21, "O"]),
  authoredRow([20, "OOO"]),
  authoredRow([8, "OOOOOOOO"]),
  authoredRow([6, "OOBBBBBBBBOO"]),
  authoredRow([2, "OOO"], [5, "OBHBBBBBBBBBBO"], [19, "OOO"]),
  authoredRow([1, "OSSO"], [5, "BBBBBBBBBBBBBB"], [19, "OSSO"]),
  authoredRow([1, "OSCS"], [5, "BBBEEBBBBEEBBB"], [19, "SCSO"]),
  authoredRow([2, "OOO"], [5, "BBBBBBBBBBBBBB"], [19, "OOO"]),
  authoredRow([3, "OOSSSBBBBBBSSSOO"]),
  IDLE_BODY_ROWS[11],
  IDLE_BODY_ROWS[12],
  IDLE_BODY_ROWS[13],
  IDLE_BODY_ROWS[14],
  IDLE_BODY_ROWS[15],
  IDLE_BODY_ROWS[16],
  IDLE_BODY_ROWS[17],
];

export const OLLIE_SLEEPING_GRID = createGridVariant(
  parseGrid(SLEEPING_ROWS, "OLLIE_SLEEPING_GRID"),
  [
    [19, 12, "B"],
    [20, 12, "O"],
    [18, 13, "O"],
    [19, 13, "S"],
    [20, 13, "C"],
    [21, 13, "O"],
    [18, 14, "O"],
    [19, 14, "S"],
    [20, 14, "C"],
    [21, 14, "O"],
    [18, 15, "O"],
    [19, 15, "S"],
    [20, 15, "S"],
    [21, 15, "O"],
    [19, 16, "O"],
    [20, 16, "O"],
    [21, 16, "O"],
  ],
);

export const OLLIE_POSE_GRIDS = Object.freeze({
  [OLLIE_POSE.LOOK_LEFT]: OLLIE_LOOK_LEFT_GRID,
  [OLLIE_POSE.LOOK_RIGHT]: OLLIE_LOOK_RIGHT_GRID,
  [OLLIE_POSE.THINKING]: OLLIE_THINKING_GRID,
  [OLLIE_POSE.HOLDING_HAMMER]: OLLIE_HOLDING_HAMMER_GRID,
  [OLLIE_POSE.HAMMER_STRIKE]: OLLIE_HAMMER_STRIKE_GRID,
  [OLLIE_POSE.WORKING_LAPTOP]: OLLIE_WORKING_LAPTOP_GRID,
  [OLLIE_POSE.SLEEPING]: OLLIE_SLEEPING_GRID,
});
