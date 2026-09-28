export const BoxFit = {
  fill: "fill",
  contain: "contain",
  cover: "cover",
  fitWidth: "fitWidth",
  fitHeight: "fitHeight",
  none: "none",
  scaleDown: "scale-down",
} as const;

export type BoxFit = (typeof BoxFit)[keyof typeof BoxFit];
