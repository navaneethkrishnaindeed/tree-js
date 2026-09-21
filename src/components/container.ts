import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import { UIComponent } from "../core/UIComponent";

export interface ContainerProps extends BoxStyleProps {
  child?: UIComponent;
}

export class ContainerComponent extends UIComponent {
  readonly kind = "Container";

  constructor(readonly props: ContainerProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    const rest = { ...this.props } as Record<string, unknown>;
    delete rest.child;
    return omitUndefined(rest);
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyBoxStyles(element, this.props);
    this.props.child?.mount(element);
    return element;
  }
}

export function Container(props: ContainerProps): ContainerComponent {
  return new ContainerComponent(props);
}
