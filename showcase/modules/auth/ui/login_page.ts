import { HubProvider, Sink } from "pipe_x";
import {
  Alignment,
  Center,
  Column,
  Container,
  CrossAxisAlignment,
  EdgeInsets,
  FontWeight,
  Padding,
  Text,
} from "../../../../src";
import { NfColors, nfText } from "../../../common/theme/nf_theme";
import { NfButton } from "../../../common/ui/nf_button";
import { NfField } from "../../../common/ui/nf_field";
import { NfWordmark } from "../../../common/ui/nf_logo";
import { LoginHub } from "../application/login_hub";

export function loginPage() {
  return HubProvider({
    create: () => new LoginHub(),
    child: (hub) =>
      Container({
        width: "100%",
        height: "100%",
        color: NfColors.pureBlack,
        alignment: Alignment.center,
        child: Center({
          child: Container({
            width: 420,
            padding: EdgeInsets.all(40),
            color: "rgba(0,0,0,0.75)",
            child: Column({
              gap: 16,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding({
                  padding: EdgeInsets.only({ bottom: 12 }),
                  child: NfWordmark(),
                }),
                Text({
                  text: "Sign In",
                  style: nfText({ size: 28, weight: FontWeight.w700 }),
                }),
                NfField({
                  placeholder: "Email",
                  onChanged: (value) => {
                    hub.email.value = value;
                  },
                }),
                NfField({
                  placeholder: "Password",
                  obscure: true,
                  onChanged: (value) => {
                    hub.password.value = value;
                  },
                }),
                Sink({
                  pipe: hub.error,
                  builder: (error) =>
                    Text({
                      text: error ?? " ",
                      style: nfText({ size: 13, color: NfColors.red }),
                    }),
                }),
                NfButton({
                  text: "Sign In",
                  onPressed: () => hub.submit(),
                }),
                Text({
                  text: "Use any email and a password of 4+ characters, or demo / demo.",
                  style: nfText({ size: 13, color: NfColors.muted }),
                }),
              ],
            }),
          }),
        }),
      }),
  });
}
