import {
  Alignment,
  Border,
  BoxDecoration,
  BoxShape,
  Container,
  EdgeInsets,
  Icon,
  IconButton,
  type IconData,
  type UIComponent,
} from "../../../src";

export function NfCircleIcon(props: {
  icon: IconData;
  onTap?: () => void;
  tooltip?: string;
}): UIComponent {
  return IconButton({
    tooltip: props.tooltip,
    size: 36,
    padding: EdgeInsets.all(0),
    onPressed: props.onTap,
    icon: Container({
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration({
        color: "rgba(0,0,0,0.38)",
        shape: BoxShape.circle,
        border: Border.all({ color: "rgba(255,255,255,0.45)", width: 1 }),
      }),
      child: Icon({ icon: props.icon, size: 20, color: "#ffffff" }),
    }),
  });
}
