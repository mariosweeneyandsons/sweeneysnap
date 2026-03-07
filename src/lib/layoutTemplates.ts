export interface LayoutSlot {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  category: "grid" | "creative";
  columns: number;
  rows: number;
  slots: LayoutSlot[];
}

function gridTemplate(cols: number, rows: number): LayoutTemplate {
  const slots: LayoutSlot[] = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      slots.push({ colStart: c, rowStart: r, colSpan: 1, rowSpan: 1 });
    }
  }
  return {
    id: `grid-${cols}x${rows}`,
    name: `${cols}x${rows}`,
    category: "grid",
    columns: cols,
    rows,
    slots,
  };
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // Grid templates
  gridTemplate(1, 1),
  gridTemplate(2, 1),
  gridTemplate(1, 2),
  gridTemplate(2, 2),
  gridTemplate(3, 2),
  gridTemplate(2, 3),
  gridTemplate(3, 3),
  gridTemplate(4, 3),
  gridTemplate(4, 4),
  gridTemplate(5, 5),

  // Creative templates
  {
    id: "featured",
    name: "Featured",
    category: "creative",
    columns: 3,
    rows: 3,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 }, // large featured
      { colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
      { colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "hero-side",
    name: "Hero + Side",
    category: "creative",
    columns: 3,
    rows: 2,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 }, // hero left
      { colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "magazine",
    name: "Magazine",
    category: "creative",
    columns: 4,
    rows: 3,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 }, // large top-left
      { colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 4, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 3, rowStart: 2, colSpan: 2, rowSpan: 1 }, // wide mid-right
      { colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 4, rowStart: 3, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "mosaic-mix",
    name: "Mosaic Mix",
    category: "creative",
    columns: 4,
    rows: 3,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 }, // tall left
      { colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 }, // wide top
      { colStart: 4, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 1 },
      { colStart: 3, rowStart: 2, colSpan: 2, rowSpan: 2 }, // large bottom-right
      { colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "bubble",
    name: "Bubble",
    category: "creative",
    columns: 4,
    rows: 3,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 1 }, // wide top-left
      { colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 4, rowStart: 1, colSpan: 1, rowSpan: 2 }, // tall right
      { colStart: 1, rowStart: 2, colSpan: 1, rowSpan: 1 },
      { colStart: 2, rowStart: 2, colSpan: 2, rowSpan: 2 }, // large center-bottom
      { colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 4, rowStart: 3, colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: "scattered",
    name: "Scattered",
    category: "creative",
    columns: 5,
    rows: 4,
    slots: [
      { colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 }, // large top-left
      { colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
      { colStart: 4, rowStart: 1, colSpan: 2, rowSpan: 1 }, // wide top-right
      { colStart: 3, rowStart: 2, colSpan: 2, rowSpan: 1 },
      { colStart: 5, rowStart: 2, colSpan: 1, rowSpan: 2 }, // tall right
      { colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 2 }, // tall bottom-left
      { colStart: 2, rowStart: 3, colSpan: 2, rowSpan: 2 }, // large bottom-center
      { colStart: 4, rowStart: 3, colSpan: 1, rowSpan: 1 },
      { colStart: 4, rowStart: 4, colSpan: 2, rowSpan: 1 }, // wide bottom-right
    ],
  },
];

export function getLayoutTemplate(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((t) => t.id === id);
}
