import {
  Alignment,
  BoxFit,
  IgnorePointer,
  Image,
  type UIComponent,
} from "../../../src";

export function HeroImage(props: {
  src: string;
  alt?: string;
  alignment?: Alignment;
}): UIComponent {
  return IgnorePointer({
    child: Image({
      src: props.src,
      alt: props.alt,
      width: "100%",
      height: "100%",
      fit: BoxFit.cover,
      alignment: props.alignment ?? new Alignment(0, -0.64),
    }),
  });
}
