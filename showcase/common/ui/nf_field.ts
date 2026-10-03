import {
  Border,
  BorderRadius,
  EdgeInsets,
  InputDecoration,
  TextField,
  type UIComponent,
} from "../../../src";
import { NfColors, nfText } from "../theme/nf_theme";

export function NfField(props: {
  placeholder?: string;
  value?: string;
  obscure?: boolean;
  onChanged?: (value: string) => void;
}): UIComponent {
  return TextField({
    placeholder: props.placeholder,
    value: props.value,
    obscureText: props.obscure,
    keyboardType: props.obscure ? "password" : "email",
    width: "100%",
    onChanged: props.onChanged,
    style: nfText({ size: 16, color: NfColors.white }),
    decoration: InputDecoration({
      hintText: props.placeholder,
      filled: true,
      fillColor: NfColors.input,
      borderRadius: BorderRadius.circular(4),
      border: Border.all({ color: NfColors.input, width: 0 }),
      contentPadding: EdgeInsets.symmetric({ horizontal: 16, vertical: 14 }),
    }),
  });
}
