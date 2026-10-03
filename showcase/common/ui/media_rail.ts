import {
  Axis,
  Column,
  CrossAxisAlignment,
  EdgeInsets,
  FontWeight,
  ListView,
  Padding,
  Text,
  type UIComponent,
} from "../../../src";
import { nfText } from "../theme/nf_theme";

export function MediaRail(props: {
  title: string;
  children?: UIComponent[];
  itemExtent?: number;
  height?: number;
}): UIComponent {
  const height = props.height ?? 220;
  return Column({
    width: "100%",
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Padding({
        padding: EdgeInsets.only({ left: 60, right: 60, top: 12, bottom: 4 }),
        child: Text({
          text: props.title,
          style: nfText({ size: 18, weight: FontWeight.w700, color: "#E5E5E5" }),
        }),
      }),
      ListView({
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric({ horizontal: 60, vertical: 24 }),
        itemExtent: props.itemExtent,
        height,
        width: "100%",
        children: props.children,
      }),
    ],
  });
}
