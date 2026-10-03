export const Axis = {
  horizontal: "horizontal",
  vertical: "vertical",
} as const;
export type Axis = (typeof Axis)[keyof typeof Axis];

export const StackFit = {
  loose: "loose",
  expand: "expand",
  passthrough: "passthrough",
} as const;
export type StackFit = (typeof StackFit)[keyof typeof StackFit];

export const Clip = {
  none: "none",
  hardEdge: "hardEdge",
  antiAlias: "antiAlias",
  antiAliasWithSaveLayer: "antiAliasWithSaveLayer",
} as const;
export type Clip = (typeof Clip)[keyof typeof Clip];

export const BoxShape = {
  rectangle: "rectangle",
  circle: "circle",
} as const;
export type BoxShape = (typeof BoxShape)[keyof typeof BoxShape];

export const TextAlign = {
  left: "left",
  right: "right",
  center: "center",
  justify: "justify",
  start: "start",
  end: "end",
} as const;
export type TextAlign = (typeof TextAlign)[keyof typeof TextAlign];

export const FontStyle = {
  normal: "normal",
  italic: "italic",
} as const;
export type FontStyle = (typeof FontStyle)[keyof typeof FontStyle];

export const TextDecoration = {
  none: "none",
  underline: "underline",
  overline: "overline",
  lineThrough: "line-through",
} as const;
export type TextDecoration = (typeof TextDecoration)[keyof typeof TextDecoration];

export const HitTestBehavior = {
  deferToChild: "deferToChild",
  opaque: "opaque",
  translucent: "translucent",
} as const;
export type HitTestBehavior = (typeof HitTestBehavior)[keyof typeof HitTestBehavior];

export const DismissDirection = {
  endToStart: "endToStart",
  startToEnd: "startToEnd",
  horizontal: "horizontal",
  vertical: "vertical",
  up: "up",
  down: "down",
  none: "none",
} as const;
export type DismissDirection = (typeof DismissDirection)[keyof typeof DismissDirection];

export const BorderStyle = {
  none: "none",
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
} as const;
export type BorderStyle = (typeof BorderStyle)[keyof typeof BorderStyle];

export const VerticalDirection = {
  down: "down",
  up: "up",
} as const;
export type VerticalDirection = (typeof VerticalDirection)[keyof typeof VerticalDirection];

export const ImageRepeat = {
  noRepeat: "no-repeat",
  repeat: "repeat",
  repeatX: "repeat-x",
  repeatY: "repeat-y",
} as const;
export type ImageRepeat = (typeof ImageRepeat)[keyof typeof ImageRepeat];

export const ScrollbarMode = {
  hidden: "hidden",
  shown: "shown",
} as const;
export type ScrollbarMode = (typeof ScrollbarMode)[keyof typeof ScrollbarMode];

export const WrapAlignment = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
} as const;
export type WrapAlignment = (typeof WrapAlignment)[keyof typeof WrapAlignment];

export const WrapCrossAlignment = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
} as const;
export type WrapCrossAlignment =
  (typeof WrapCrossAlignment)[keyof typeof WrapCrossAlignment];

export function applyClip(style: CSSStyleDeclaration, clip?: Clip): void {
  if (clip === undefined || clip === Clip.none) {
    return;
  }
  style.overflow = "hidden";
  if (clip === Clip.antiAlias || clip === Clip.antiAliasWithSaveLayer) {
    style.setProperty("-webkit-mask-image", "-webkit-radial-gradient(white, black)");
  }
}

export function objectPositionFromAlignment(x: number, y: number): string {
  const px = ((x + 1) / 2) * 100;
  const py = ((y + 1) / 2) * 100;
  return `${px}% ${py}%`;
}
