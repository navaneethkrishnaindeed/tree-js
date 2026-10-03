import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChild } from "../core/patch";
import type { UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { FlexFit } from "../layout/flex";

export interface FlexibleProps {
  flex?: number;
  fit?: FlexFit;
  child?: UINode;
}

export class FlexibleComponent extends UIComponent {
  readonly kind: "Expanded" | "Flexible";
  props: FlexibleProps;
  private child?: UINode;

  constructor(
    props: FlexibleProps,
    kind: "Expanded" | "Flexible" = "Flexible",
  ) {
    super();
    this.kind = kind;
    this.props = props;
    this.child = props.child;
  }

  override childNodes(): UINode[] {
    return this.child ? [this.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      flex: this.props.flex,
      fit: this.props.fit,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const flex = this.props.flex ?? 1;
    const fit = this.props.fit ?? (this.kind === "Expanded" ? FlexFit.tight : FlexFit.loose);
    element.style.flexGrow = String(flex);
    element.style.flexShrink = "1";
    element.style.flexBasis = fit === FlexFit.tight ? "0%" : "auto";
    element.style.minWidth = "0";
    element.style.minHeight = "0";
    this.child?.mount(element);
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof FlexibleComponent) || next.kind !== this.kind || !this.host) {
      return false;
    }
    const flex = next.props.flex ?? 1;
    const fit = next.props.fit ?? (this.kind === "Expanded" ? FlexFit.tight : FlexFit.loose);
    this.host.style.flexGrow = String(flex);
    this.host.style.flexBasis = fit === FlexFit.tight ? "0%" : "auto";
    this.child = replaceChild(this.host, this.child, next.props.child);
    this.props = { ...next.props, child: this.child };
    return true;
  }
}

export function Flexible(props: FlexibleProps): FlexibleComponent {
  return new FlexibleComponent(props, "Flexible");
}

export function Expanded(props: FlexibleProps): FlexibleComponent {
  return new FlexibleComponent(
    { ...props, fit: props.fit ?? FlexFit.tight },
    "Expanded",
  );
}

export interface SpacerProps {
  flex?: number;
}

export class SpacerComponent extends UIComponent {
  readonly kind = "Spacer";

  constructor(readonly props: SpacerProps = {}) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ flex: this.props.flex });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const flex = this.props.flex ?? 1;
    element.style.flexGrow = String(flex);
    element.style.flexShrink = "0";
    element.style.flexBasis = "0";
    return element;
  }
}

export function Spacer(props: SpacerProps = {}): SpacerComponent {
  return new SpacerComponent(props);
}
