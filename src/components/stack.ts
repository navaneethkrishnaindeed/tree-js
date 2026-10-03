import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChildren } from "../core/patch";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";
import { Alignment } from "../painting/alignment";
import { Clip, StackFit, type StackFit as StackFitValue } from "../painting/enums";
import { AnimatedPositionedComponent } from "./animated";
import { PositionedComponent } from "./positioned";

export interface StackProps extends Pick<
  BoxStyleProps,
  "width" | "height" | "decoration" | "color" | "overflow" | "clipBehavior"
> {
  alignment?: Alignment;
  fit?: StackFitValue | "loose" | "expand";
  children?: UIComponent[];
}

export class StackComponent extends UIComponent {
  readonly kind = "Stack";
  props: StackProps;
  private children: UIComponent[];

  constructor(props: StackProps) {
    super();
    this.props = props;
    this.children = props.children ?? [];
  }

  override childNodes(): UIComponent[] {
    return this.children;
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
      clipBehavior: this.props.clipBehavior ?? Clip.hardEdge,
    });
    element.style.position = "relative";
    const expand = this.props.fit === StackFit.expand;
    if (expand) {
      if (this.props.width === undefined) {
        element.style.width = "100%";
      }
      if (this.props.height === undefined) {
        element.style.height = "100%";
      }
    }

    const alignment = this.props.alignment ?? Alignment.topLeft;
    for (const child of this.children) {
      this.placeChild(child, child.mount(element), alignment, expand);
    }
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof StackComponent) || !this.host) {
      return false;
    }
    applyBoxStyles(this.host, {
      width: next.props.width,
      height: next.props.height,
      decoration: next.props.decoration,
      color: next.props.color,
      overflow: next.props.overflow,
      clipBehavior: next.props.clipBehavior ?? Clip.hardEdge,
    });
    const expand = next.props.fit === StackFit.expand;
    const alignment = next.props.alignment ?? Alignment.topLeft;
    this.children = replaceChildren(
      this.host,
      this.children,
      next.props.children ?? [],
    ) as UIComponent[];
    for (const child of this.children) {
      if (child.host) {
        this.placeChild(child, child.host, alignment, expand);
      }
    }
    this.props = { ...next.props, children: this.children };
    return true;
  }

  private placeChild(
    child: UIComponent,
    childElement: HTMLElement,
    alignment: Alignment,
    expand: boolean,
  ): void {
    if (
      !(child instanceof PositionedComponent) &&
      !(child instanceof AnimatedPositionedComponent)
    ) {
      alignment.applyAbsolute(childElement.style);
      if (expand) {
        childElement.style.width = "100%";
        childElement.style.height = "100%";
      }
    }
  }
}

export function Stack(props: StackProps): StackComponent {
  return new StackComponent(props);
}
