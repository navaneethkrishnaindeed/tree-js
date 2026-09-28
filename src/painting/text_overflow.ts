export const TextOverflow = {
  clip: "clip",
  ellipsis: "ellipsis",
  fade: "fade",
  visible: "visible",
} as const;

export type TextOverflow = (typeof TextOverflow)[keyof typeof TextOverflow];
