import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { BoxFit } from "../painting/box_fit";

export interface FittedBoxProps {
  fit?: BoxFit;
  width?: Dimension;
  height?: Dimension;
  child?: UIComponent;
}

export class FittedBoxComponent extends UIComponent {
  readonly kind = "FittedBox";

  constructor(readonly props: FittedBoxProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      fit: this.props.fit,
      width: this.props.width,
      height: this.props.height,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.overflow = "hidden";
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    const child = this.props.child?.mount(element);
    if (child) {
      const fit = this.props.fit ?? BoxFit.contain;
      if (fit === BoxFit.cover) {
        child.style.width = "100%";
        child.style.height = "100%";
        child.style.objectFit = "cover";
      } else if (fit === BoxFit.fill) {
        child.style.width = "100%";
        child.style.height = "100%";
        child.style.objectFit = "fill";
      } else if (fit === BoxFit.none) {
        child.style.objectFit = "none";
      } else {
        child.style.maxWidth = "100%";
        child.style.maxHeight = "100%";
        child.style.objectFit = fit === BoxFit.scaleDown ? "scale-down" : "contain";
      }
    }
    return element;
  }
}

export function FittedBox(props: FittedBoxProps = {}): FittedBoxComponent {
  return new FittedBoxComponent(props);
}
