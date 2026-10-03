import { ColorScheme, FontWeight, TextStyle, ThemeData } from "../../../src";

export const NfColors = {
  black: "#141414",
  pureBlack: "#000000",
  red: "#E50914",
  redDark: "#B20710",
  white: "#FFFFFF",
  muted: "#B3B3B3",
  grey: "#808080",
  card: "#2F2F2F",
  input: "#333333",
} as const;

export const NfFont = `"Helvetica Neue", Helvetica, Arial, sans-serif`;

export const netflixTheme = ThemeData({
  primaryColor: NfColors.red,
  colorScheme: ColorScheme({
    primary: NfColors.red,
    onPrimary: NfColors.white,
    secondary: "#54B9C5",
    onSecondary: NfColors.pureBlack,
    surface: NfColors.card,
    onSurface: NfColors.white,
    background: NfColors.black,
    onBackground: NfColors.white,
    error: NfColors.red,
    onError: NfColors.white,
  }),
});

export function nfText(
  options: {
    size?: number;
    weight?: string;
    color?: string;
    letterSpacing?: number;
    align?: "left" | "center" | "right";
  } = {},
) {
  return TextStyle({
    fontFamily: NfFont,
    fontSize: options.size ?? 16,
    fontWeight: options.weight ?? FontWeight.normal,
    color: options.color ?? NfColors.white,
    letterSpacing: options.letterSpacing,
    textAlign: options.align,
  });
}

export const nfHeadline = nfText({ size: 42, weight: FontWeight.w800 });
export const nfTitle = nfText({ size: 22, weight: FontWeight.w700 });
export const nfBody = nfText({ size: 15, color: NfColors.muted });
export const nfCaption = nfText({ size: 13, color: NfColors.muted });
