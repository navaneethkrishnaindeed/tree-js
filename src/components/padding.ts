import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { EdgeInsets } from "../painting/edge_insets";

export interface PaddingProps {
  padding: EdgeInsets;
  child?: UIComponent;
}

export class PaddingComponent extends UIComponent {
  readonly kind = "Padding";

  constructor(readonly props: PaddingProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      padding: this.props.padding,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.padding = this.props.padding.toCss();
    this.props.child?.mount(element);
    return element;
  }
}

export function Padding(props: PaddingProps): PaddingComponent {
  return new PaddingComponent(props);
}
