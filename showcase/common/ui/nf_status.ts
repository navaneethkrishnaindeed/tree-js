import {
  Alignment,
  Center,
  Column,
  Container,
  EdgeInsets,
  FontWeight,
  Text,
  type UIComponent,
} from "../../../src";
import { NfColors, nfText } from "../theme/nf_theme";
import { NfButton } from "./nf_button";

export function NfLoading(label = "Loading..."): UIComponent {
  return Container({
    padding: EdgeInsets.all(24),
    alignment: Alignment.center,
    child: Text({
      text: label,
      style: nfText({ size: 14, color: NfColors.muted }),
    }),
  });
}

export function NfError(props: { message: string; onRetry?: () => void }): UIComponent {
  return Center({
    child: Column({
      gap: 12,
      children: [
        Text({
          text: props.message,
          style: nfText({ size: 14, color: NfColors.red }),
        }),
        ...(props.onRetry
          ? [NfButton({ text: "Try again", onPressed: props.onRetry, variant: "outline" })]
          : []),
      ],
    }),
  });
}

export function NfEmpty(message: string): UIComponent {
  return Container({
    alignment: Alignment.center,
    padding: EdgeInsets.all(32),
    child: Text({
      text: message,
      style: nfText({ size: 16, color: NfColors.muted, weight: FontWeight.w500 }),
    }),
  });
}
