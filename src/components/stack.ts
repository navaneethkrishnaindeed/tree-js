import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";
import { PositionedComponent } from "./positioned";

export interface StackProps extends Pick<
  BoxStyleProps,
  "width" | "height" | "decoration" | "color" | "overflow"
> {
  alignment?: Alignment;
  fit?: "loose" | "expand";
  children?: UIComponent[];
}

export class StackComponent extends UIComponent {
  readonly kind = "Stack";

  constructor(readonly props: StackProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.children ?? [];
  }

  protected override inspectProps(): Record<string, unknown> {
    const rest = { ...this.props } as Record<string, unknown>;
    delete rest.children;
    return omitUndefined(rest);
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyBoxStyles(element, {
      width: this.props.width,
      height: this.props.height,
      decoration: this.props.decoration,
      color: this.props.color,
      overflow: this.props.overflow,
    });
    element.style.position = "relative";
    if (this.props.fit === "expand") {
      if (this.props.width === undefined) {
        element.style.width = "100%";
      }
      if (this.props.height === undefined) {
        element.style.height = "100%";
      }
    }

    const alignment = this.props.alignment ?? Alignment.topLeft;
    for (const child of this.props.children ?? []) {
      const childElement = child.mount(element);
      if (!(child instanceof PositionedComponent)) {
        alignment.applyAbsolute(childElement.style);
        if (this.props.fit === "expand") {
          childElement.style.width = "100%";
          childElement.style.height = "100%";
        }
      }
    }
    return element;
  }
}

export function Stack(props: StackProps): StackComponent {
  return new StackComponent(props);
}
