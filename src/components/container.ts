import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChild } from "../core/patch";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import type { UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface ContainerProps extends BoxStyleProps {
  child?: UIComponent;
}

export class ContainerComponent extends UIComponent {
  readonly kind = "Container";
  props: ContainerProps;
  private child?: UIComponent;

  constructor(props: ContainerProps) {
    super(props);
    this.props = props;
    this.child = props.child;
  }

  override childNodes(): UIComponent[] {
    return this.child ? [this.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    const rest = { ...this.props } as Record<string, unknown>;
    delete rest.child;
    return omitUndefined(rest);
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyBoxStyles(element, this.props);
    this.child?.mount(element);
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof ContainerComponent) || !this.host) {
      return false;
    }
    applyBoxStyles(this.host, next.props);
    this.child = replaceChild(this.host, this.child, next.props.child) as UIComponent | undefined;
    this.props = { ...next.props, child: this.child };
    this.key = next.key ?? next.props.key;
    return true;
  }
}

export function Container(props: ContainerProps): ContainerComponent {
  return new ContainerComponent(props);
}
