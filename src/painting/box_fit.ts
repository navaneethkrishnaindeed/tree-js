export const BoxFit = {
  fill: "fill",
  contain: "contain",
  cover: "cover",
  fitWidth: "fitWidth",
  fitHeight: "fitHeight",
  none: "none",
  scaleDown: "scaleDown",
} as const;

export type BoxFit = (typeof BoxFit)[keyof typeof BoxFit];

export function boxFitToObjectFit(fit: BoxFit): string {
  if (fit === BoxFit.scaleDown) {
    return "scale-down";
  }
  if (fit === BoxFit.fitWidth || fit === BoxFit.fitHeight) {
    return "cover";
  }
  return fit;
}
