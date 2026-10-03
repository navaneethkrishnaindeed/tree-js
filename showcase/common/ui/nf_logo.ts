import {
  CustomPaint,
  FontWeight,
  InkWell,
  Row,
  SizedBox,
  Text,
  type UIComponent,
} from "../../../src";
import { NfColors, nfText } from "../theme/nf_theme";

function paintMark(
  canvas: CanvasRenderingContext2D,
  size: { width: number; height: number },
): void {
  const { width: w, height: h } = size;
  canvas.clearRect(0, 0, w, h);
  canvas.fillStyle = NfColors.red;
  canvas.fillRect(0, 0, w * 0.22, h);
  canvas.fillRect(w * 0.78, 0, w * 0.22, h);
  canvas.beginPath();
  canvas.moveTo(w * 0.02, 0);
  canvas.lineTo(w * 0.28, 0);
  canvas.lineTo(w * 0.98, h);
  canvas.lineTo(w * 0.72, h);
  canvas.closePath();
  canvas.fill();
}

export function NfMark(props: { size?: number } = {}): UIComponent {
  const height = props.size ?? 36;
  const width = Math.round(height * 0.72);
  return CustomPaint({
    width,
    height,
    painter: paintMark,
  });
}

export function NfLogo(props: { size?: number; onTap?: () => void } = {}): UIComponent {
  const size = props.size ?? 28;
  const row = Row({
    gap: 8,
    children: [
      NfMark({ size }),
      Text({
        text: "NETFLIX",
        style: nfText({
          size: Math.round(size * 0.72),
          weight: FontWeight.w900,
          color: NfColors.red,
          letterSpacing: 1.5,
        }),
      }),
    ],
  });
  if (!props.onTap) {
    return row;
  }
  return InkWell({
    onTap: props.onTap,
    child: row,
  });
}

export function NfWordmark(): UIComponent {
  return SizedBox({
    child: Text({
      text: "NETFLIX",
      style: nfText({
        size: 44,
        weight: FontWeight.w900,
        color: NfColors.red,
        letterSpacing: 6,
        align: "center",
      }),
    }),
  });
}
