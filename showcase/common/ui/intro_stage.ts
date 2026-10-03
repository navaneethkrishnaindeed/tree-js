import {
  AnimatedOpacity,
  AnimatedScale,
  Center,
  Container,
  Duration,
  Positioned,
  Stack,
  StackFit,
  type UIComponent,
} from "../../../src";
import { NfColors } from "../theme/nf_theme";
import { NfButton } from "./nf_button";
import { NfMark } from "./nf_logo";

export type IntroPhase = "n" | "flash" | "done";

export function IntroStage(props: {
  phase: IntroPhase;
  onSkip: () => void;
}): UIComponent {
  const slam = props.phase === "n";
  const flash = props.phase === "flash";
  return Stack({
    fit: StackFit.expand,
    width: "100%",
    height: "100vh",
    color: NfColors.pureBlack,
    children: [
      Center({
        child: AnimatedScale({
          scale: slam ? 1.35 : 1,
          duration: Duration({ milliseconds: 420 }),
          child: AnimatedOpacity({
            opacity: flash ? 0 : 1,
            duration: Duration({ milliseconds: 180 }),
            child: NfMark({ size: 168 }),
          }),
        }),
      }),
      Positioned({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        child: AnimatedOpacity({
          opacity: flash ? 1 : 0,
          duration: Duration({ milliseconds: 160 }),
          child: Container({
            width: "100%",
            height: "100%",
            color: NfColors.red,
          }),
        }),
      }),
      Positioned({
        right: 24,
        bottom: 24,
        child: NfButton({
          text: "Skip",
          variant: "ghost",
          onPressed: props.onSkip,
        }),
      }),
    ],
  });
}
