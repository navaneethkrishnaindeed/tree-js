import {
  Alignment,
  AnimatedContainer,
  AnimatedScale,
  BorderRadius,
  BoxFit,
  ClipRRect,
  Colors,
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

export function Poster(props: {
  id: number;
  name: string;
  image?: string;
  width?: number;
  height?: number;
  onTap?: () => void;
}): UIComponent {
  const width = props.width ?? 130;
  const height = props.height ?? 195;
  const face = ClipRRect({
    borderRadius: BorderRadius.circular(4),
    child: props.image
      ? Image({
          src: props.image,
          width,
          height,
          fit: BoxFit.cover,
          alt: props.name,
        })
      : Container({
          width,
          height,
          color: NfColors.card,
          alignment: Alignment.center,
          child: Text({
            text: props.name.slice(0, 1).toUpperCase(),
            style: nfText({ size: 36, weight: FontWeight.bold, color: Colors.white }),
          }),
        }),
  });
  const scaled = AnimatedScale({
    scale: 1,
    alignment: Alignment.bottomCenter,
    duration: Duration({ milliseconds: 180 }),
    child: face,
  });
  const shell = AnimatedContainer({
    width,
    height,
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
