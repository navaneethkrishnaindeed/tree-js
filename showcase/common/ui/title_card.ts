import {
  Alignment,
  AnimatedContainer,
  AnimatedScale,
  BorderRadius,
  BoxFit,
  ClipRRect,
  Container,
  Duration,
  FontWeight,
  GestureDetector,
  Image,
  MouseRegion,
  Text,
  type UIComponent,
} from "../../../src";
import { NfColors, nfText } from "../theme/nf_theme";

export function TitleCard(props: {
  id: number;
  name: string;
  image?: string;
  onTap?: () => void;
}): UIComponent {
  const face = ClipRRect({
    borderRadius: BorderRadius.circular(4),
    child: props.image
      ? Image({
          src: props.image,
          width: 240,
          height: 135,
          fit: BoxFit.cover,
          alignment: new Alignment(0, -0.6),
          alt: props.name,
        })
      : Container({
          width: 240,
          height: 135,
          color: NfColors.card,
          alignment: Alignment.center,
          child: Text({
            text: props.name,
            style: nfText({ size: 13, weight: FontWeight.w700, align: "center" }),
          }),
        }),
  });
  const scaled = AnimatedScale({
    scale: 1,
    alignment: Alignment.center,
    duration: Duration({ milliseconds: 180 }),
    child: face,
  });
  const shell = AnimatedContainer({
    width: 240,
    height: 135,
    position: "relative",
    zIndex: 0,
    duration: Duration({ milliseconds: 180 }),
    child: scaled,
  });
  return MouseRegion({
    cursor: "pointer",
    onEnter: () => {
      scaled.update({ scale: 1.08 });
      shell.update({ zIndex: 6 });
    },
    onExit: () => {
      scaled.update({ scale: 1 });
      shell.update({ zIndex: 0 });
    },
    child: GestureDetector({
      onTap: props.onTap,
      child: shell,
    }),
  });
}
