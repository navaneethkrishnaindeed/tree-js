import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { FlexFit } from "../layout/flex";

export interface FlexibleProps {
  flex?: number;
  fit?: FlexFit;
  child?: UIComponent;
}

export class FlexibleComponent extends UIComponent {
  readonly kind: "Expanded" | "Flexible";

  constructor(
    readonly props: FlexibleProps,
    kind: "Expanded" | "Flexible" = "Flexible",
  ) {
    super();
    this.kind = kind;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
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
    this.props.child?.mount(element);
    return element;
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
