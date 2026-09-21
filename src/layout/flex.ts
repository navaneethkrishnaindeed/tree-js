export const FlexFit = {
  tight: "tight",
  loose: "loose",
} as const;

export type FlexFit = (typeof FlexFit)[keyof typeof FlexFit];

export const MainAxisSize = {
  min: "min",
  max: "max",
} as const;

export type MainAxisSize = (typeof MainAxisSize)[keyof typeof MainAxisSize];
