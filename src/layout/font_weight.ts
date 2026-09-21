export const FontWeight = {
  w100: "100",
  w200: "200",
  w300: "300",
  w400: "400",
  w500: "500",
  w600: "600",
  w700: "700",
  w800: "800",
  w900: "900",
  normal: "400",
  bold: "700",
} as const;

export type FontWeight = (typeof FontWeight)[keyof typeof FontWeight];
