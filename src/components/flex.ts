import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import {
  CrossAxisAlignment,
  MainAxisAlignment,
  type CrossAxisAlignment as CrossAxisAlignmentValue,
  type MainAxisAlignment as MainAxisAlignmentValue,
} from "../layout/axis";

export interface FlexProps extends Pick<
  BoxStyleProps,
  "width" | "height" | "padding" | "margin" | "decoration" | "color"
> {
  mainAxisAlignment?: MainAxisAlignmentValue;
  crossAxisAlignment?: CrossAxisAlignmentValue;
  gap?: Dimension;
  children?: UIComponent[];
}

export class FlexComponent extends UIComponent {
  readonly kind: "Row" | "Column";

  constructor(
    readonly direction: "row" | "column",
    readonly props: FlexProps,
  ) {
    super();
    this.kind = direction === "row" ? "Row" : "Column";
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
    applyBoxStyles(element, this.props);
    element.style.display = "flex";
    element.style.flexDirection = this.direction;
    element.style.justifyContent =
      this.props.mainAxisAlignment ?? MainAxisAlignment.start;
    element.style.alignItems =
      this.props.crossAxisAlignment ?? CrossAxisAlignment.center;
    if (this.props.gap !== undefined) {
      element.style.gap = toCssSize(this.props.gap);
    }
    for (const child of this.props.children ?? []) {
      child.mount(element);
    }
    return element;
  }
}

export function Row(props: FlexProps): FlexComponent {
  return new FlexComponent("row", props);
}

export function Column(props: FlexProps): FlexComponent {
  return new FlexComponent("column", props);
}
