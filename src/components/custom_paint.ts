import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface Size {
  width: number;
  height: number;
}

export type CustomPainter = (
  canvas: CanvasRenderingContext2D,
  size: Size,
) => void;

export interface CustomPaintProps {
  painter?: CustomPainter;
  width?: Dimension;
  height?: Dimension;
  child?: UIComponent;
}

export class CustomPaintComponent extends UIComponent {
  readonly kind = "CustomPaint";

  constructor(readonly props: CustomPaintProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      width: this.props.width,
      height: this.props.height,
      painter: this.props.painter,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.position = "relative";
    element.style.width = toCssSize(this.props.width ?? 120);
    element.style.height = toCssSize(this.props.height ?? 120);

    const canvas = document.createElement("canvas");
    const width = typeof this.props.width === "number" ? this.props.width : 120;
    const height = typeof this.props.height === "number" ? this.props.height : 120;
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const context = canvas.getContext("2d");
    if (context && this.props.painter) {
      this.props.painter(context, { width, height });
    }
    element.appendChild(canvas);

    if (this.props.child) {
      const overlay = createHost("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      this.props.child.mount(overlay);
      element.appendChild(overlay);
    }
    return element;
  }
}

export function CustomPaint(props: CustomPaintProps = {}): CustomPaintComponent {
  return new CustomPaintComponent(props);
}
