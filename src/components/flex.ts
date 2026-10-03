import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import type { Key } from "../core/key";
import { replaceChildren } from "../core/patch";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import { toCssSize, type Dimension, type UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import {
  CrossAxisAlignment,
  MainAxisAlignment,
  type CrossAxisAlignment as CrossAxisAlignmentValue,
  type MainAxisAlignment as MainAxisAlignmentValue,
} from "../layout/axis";
import { MainAxisSize, type MainAxisSize as MainAxisSizeValue } from "../layout/flex";
import { VerticalDirection } from "../painting/enums";

export interface FlexProps extends Pick<
  BoxStyleProps,
  "width" | "height" | "padding" | "margin" | "decoration" | "color"
> {
  key?: Key;
  mainAxisAlignment?: MainAxisAlignmentValue;
  crossAxisAlignment?: CrossAxisAlignmentValue;
  mainAxisSize?: MainAxisSizeValue;
  verticalDirection?: VerticalDirection;
  gap?: Dimension;
  children?: UINode[];
}

export class FlexComponent extends UIComponent {
  readonly kind: "Row" | "Column";
  props: FlexProps;
  private children: UINode[];

  constructor(
    readonly direction: "row" | "column",
    props: FlexProps,
  ) {
    super(props);
    this.kind = direction === "row" ? "Row" : "Column";
    this.props = props;
    this.children = props.children ?? [];
  }

  override childNodes(): UINode[] {
    return this.children;
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
    const reverse = this.props.verticalDirection === VerticalDirection.up;
    element.style.flexDirection =
      this.direction === "row" ? "row" : reverse ? "column-reverse" : "column";
    element.style.justifyContent =
      this.props.mainAxisAlignment ?? MainAxisAlignment.start;
    element.style.alignItems =
      this.props.crossAxisAlignment ?? CrossAxisAlignment.center;
    if (this.props.gap !== undefined) {
      element.style.gap = toCssSize(this.props.gap);
    }
    if ((this.props.mainAxisSize ?? MainAxisSize.max) === MainAxisSize.min) {
      element.style.flexGrow = "0";
      element.style.flexShrink = "0";
    }
    for (const child of this.children) {
      this.prepareChild(child.mount(element));
    }
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof FlexComponent) || next.kind !== this.kind || !this.host) {
      return false;
    }
    applyBoxStyles(this.host, next.props);
    this.host.style.display = "flex";
    const reverse = next.props.verticalDirection === VerticalDirection.up;
    this.host.style.flexDirection =
      this.direction === "row" ? "row" : reverse ? "column-reverse" : "column";
    this.host.style.justifyContent =
      next.props.mainAxisAlignment ?? MainAxisAlignment.start;
    this.host.style.alignItems =
      next.props.crossAxisAlignment ?? CrossAxisAlignment.center;
    if (next.props.gap !== undefined) {
      this.host.style.gap = toCssSize(next.props.gap);
    }
    this.children = replaceChildren(this.host, this.children, next.props.children ?? []);
    for (const child of this.children) {
      if (child.host) {
        this.prepareChild(child.host);
      }
    }
    this.props = { ...next.props, children: this.children };
    this.key = next.key ?? next.props.key;
    return true;
  }

  private prepareChild(childElement: HTMLElement): void {
    if (!childElement.style.minWidth) {
      childElement.style.minWidth = "0";
    }
    if (!childElement.style.minHeight) {
      childElement.style.minHeight = "0";
    }
  }
}

export function Row(props: FlexProps): FlexComponent {
  return new FlexComponent("row", props);
}

export function Column(props: FlexProps): FlexComponent {
  return new FlexComponent("column", props);
}
