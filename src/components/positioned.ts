import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension, type UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface PositionedProps {
  top?: Dimension;
  right?: Dimension;
  bottom?: Dimension;
  left?: Dimension;
  width?: Dimension;
  height?: Dimension;
  child?: UINode;
}

export class PositionedComponent extends UIComponent {
  readonly kind = "Positioned";

  constructor(readonly props: PositionedProps) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      top: this.props.top,
      right: this.props.right,
      bottom: this.props.bottom,
      left: this.props.left,
      width: this.props.width,
      height: this.props.height,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.position = "absolute";
    if (this.props.top !== undefined) {
      element.style.top = toCssSize(this.props.top);
    }
    if (this.props.right !== undefined) {
      element.style.right = toCssSize(this.props.right);
    }
    if (this.props.bottom !== undefined) {
      element.style.bottom = toCssSize(this.props.bottom);
    }
    if (this.props.left !== undefined) {
      element.style.left = toCssSize(this.props.left);
    }
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function Positioned(props: PositionedProps): PositionedComponent {
  return new PositionedComponent(props);
}

export namespace Positioned {
  export function fill(props: { child?: UINode } = {}): PositionedComponent {
    return Positioned({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      child: props.child,
    });
  }
}
