import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface SizedBoxProps {
  width?: Dimension;
  height?: Dimension;
  child?: UIComponent;
}

export class SizedBoxComponent extends UIComponent {
  readonly kind = "SizedBox";

  constructor(readonly props: SizedBoxProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      width: this.props.width,
      height: this.props.height,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    if (this.props.width !== undefined && this.props.child === undefined) {
      element.style.flexShrink = "0";
    }
    if (this.props.height !== undefined && this.props.child === undefined) {
      element.style.flexShrink = "0";
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function SizedBox(props: SizedBoxProps): SizedBoxComponent {
  return new SizedBoxComponent(props);
}
