import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChild } from "../core/patch";
import type { UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import type { EdgeInsets } from "../painting/edge_insets";

export interface PaddingProps {
  padding: EdgeInsets;
  child?: UIComponent;
}

export class PaddingComponent extends UIComponent {
  readonly kind = "Padding";
  props: PaddingProps;
  private child?: UIComponent;

  constructor(props: PaddingProps) {
    super();
    this.props = props;
    this.child = props.child;
  }

  override childNodes(): UIComponent[] {
    return this.child ? [this.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      padding: this.props.padding,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.padding = this.props.padding.toCss();
    this.child?.mount(element);
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof PaddingComponent) || !this.host) {
      return false;
    }
    this.host.style.padding = next.props.padding.toCss();
    this.child = replaceChild(this.host, this.child, next.props.child) as UIComponent | undefined;
    this.props = { ...next.props, child: this.child };
    return true;
  }
}

export function Padding(props: PaddingProps): PaddingComponent {
  return new PaddingComponent(props);
}
