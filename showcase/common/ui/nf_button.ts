import {
  Border,
  BorderRadius,
  BoxDecoration,
  Button,
  EdgeInsets,
  FontWeight,
  TextStyle,
  type ButtonComponent,
} from "../../../src";
import { NfColors, NfFont } from "../theme/nf_theme";

export function NfButton(props: {
  text: string;
  onPressed?: () => void;
  variant?: "filled" | "outline" | "ghost" | "light" | "glass";
  pill?: boolean;
}): ButtonComponent {
  const variant = props.variant ?? "filled";
  const filled = variant === "filled";
  const outline = variant === "outline";
  const light = variant === "light";
  const glass = variant === "glass";
  const radius = props.pill ? 999 : 4;
  return Button({
    text: props.text,
    onPressed: props.onPressed,
    padding: EdgeInsets.symmetric({
      horizontal: props.pill ? 26 : 22,
      vertical: props.pill ? 12 : 10,
    }),
    style: TextStyle({
      fontFamily: NfFont,
      fontSize: 15,
      fontWeight: FontWeight.w700,
      color: light ? NfColors.pureBlack : NfColors.white,
    }),
    decoration: BoxDecoration({
      color: filled
        ? NfColors.red
        : light
          ? NfColors.white
          : glass
            ? "rgba(109,109,110,0.72)"
            : "transparent",
      borderRadius: BorderRadius.circular(radius),
      border: outline
        ? Border.all({ color: NfColors.white, width: 1 })
        : filled
          ? Border.all({ color: NfColors.red, width: 1 })
          : undefined,
    }),
  });
}
