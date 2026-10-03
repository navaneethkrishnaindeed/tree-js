import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChild } from "../core/patch";
import { toCssSize, type Dimension, type UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface SizedBoxProps {
  width?: Dimension;
  height?: Dimension;
  child?: UIComponent;
}

export class SizedBoxComponent extends UIComponent {
  readonly kind = "SizedBox";
  props: SizedBoxProps;
  private child?: UIComponent;

  constructor(props: SizedBoxProps) {
    super();
    this.props = props;
    this.child = props.child;
  }

  override childNodes(): UIComponent[] {
    return this.child ? [this.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      width: this.props.width,
      height: this.props.height,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    if (this.props.width !== undefined && this.props.child === undefined) {
      element.style.flexShrink = "0";
    }
    if (this.props.height !== undefined && this.props.child === undefined) {
      element.style.flexShrink = "0";
    }
    this.child?.mount(element);
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof SizedBoxComponent) || !this.host) {
      return false;
    }
    if (next.props.width !== undefined) {
      this.host.style.width = toCssSize(next.props.width);
    }
    if (next.props.height !== undefined) {
      this.host.style.height = toCssSize(next.props.height);
    }
    this.child = replaceChild(this.host, this.child, next.props.child) as UIComponent | undefined;
    this.props = { ...next.props, child: this.child };
    return true;
  }
}

export function SizedBox(props: SizedBoxProps): SizedBoxComponent {
  return new SizedBoxComponent(props);
}

export namespace SizedBox {
  export function expand(props: { child?: UIComponent } = {}): SizedBoxComponent {
    return SizedBox({ width: "100%", height: "100%", child: props.child });
  }

  export function shrink(props: { child?: UIComponent } = {}): SizedBoxComponent {
    return SizedBox({ width: 0, height: 0, child: props.child });
  }

  export function square(size: number, child?: UIComponent): SizedBoxComponent {
    return SizedBox({ width: size, height: size, child });
  }
}
