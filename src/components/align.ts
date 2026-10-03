import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChild } from "../core/patch";
import type { UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";

export interface AlignProps {
  alignment?: Alignment;
  widthFactor?: number;
  heightFactor?: number;
  child?: UIComponent;
}

export class AlignComponent extends UIComponent {
  readonly kind: "Align" | "Center";
  props: AlignProps;
  private child?: UIComponent;

  constructor(
    props: AlignProps,
    kind: "Align" | "Center" = "Align",
  ) {
    super();
    this.kind = kind;
    this.props = props;
    this.child = props.child;
  }

  override childNodes(): UIComponent[] {
    return this.child ? [this.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      alignment: this.props.alignment,
      widthFactor: this.props.widthFactor,
      heightFactor: this.props.heightFactor,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const alignment = this.props.alignment ?? Alignment.center;
    element.style.display = "flex";
    element.style.justifyContent = alignment.toJustifyContent();
    element.style.alignItems = alignment.toAlignItems();
    element.style.width =
      this.props.widthFactor !== undefined
        ? `${this.props.widthFactor * 100}%`
        : this.props.widthFactor === undefined && this.props.heightFactor === undefined
          ? "auto"
          : "100%";
    if (this.props.heightFactor !== undefined) {
      element.style.height = `${this.props.heightFactor * 100}%`;
    }
    this.child?.mount(element);
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof AlignComponent) || next.kind !== this.kind || !this.host) {
      return false;
    }
    const alignment = next.props.alignment ?? Alignment.center;
    this.host.style.justifyContent = alignment.toJustifyContent();
    this.host.style.alignItems = alignment.toAlignItems();
    this.child = replaceChild(this.host, this.child, next.props.child) as UIComponent | undefined;
    this.props = { ...next.props, child: this.child };
    return true;
  }
}

export function Align(props: AlignProps): AlignComponent {
  return new AlignComponent(props);
}

export interface CenterProps {
  widthFactor?: number;
  heightFactor?: number;
  child?: UIComponent;
}

export function Center(props: CenterProps = {}): AlignComponent {
  return new AlignComponent(
    {
      alignment: Alignment.center,
      widthFactor: props.widthFactor,
      heightFactor: props.heightFactor,
      child: props.child,
    },
    "Center",
  );
}
