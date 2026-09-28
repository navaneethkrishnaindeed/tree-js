import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { ColorFilter } from "../painting/color_filter";

export interface OpacityProps {
  opacity?: number;
  child?: UIComponent;
}

export class OpacityComponent extends UIComponent {
  readonly kind = "Opacity";

  constructor(readonly props: OpacityProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ opacity: this.props.opacity });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.opacity = String(this.props.opacity ?? 1);
    this.props.child?.mount(element);
    return element;
  }
}

export function Opacity(props: OpacityProps = {}): OpacityComponent {
  return new OpacityComponent(props);
}

export interface BackdropFilterProps {
  sigmaX?: number;
  sigmaY?: number;
  child?: UIComponent;
}

export class BackdropFilterComponent extends UIComponent {
  readonly kind = "BackdropFilter";

  constructor(readonly props: BackdropFilterProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      sigmaX: this.props.sigmaX,
      sigmaY: this.props.sigmaY,
    });
  }

  createElement(): HTMLElement {
    const blur = this.props.sigmaX ?? this.props.sigmaY ?? 8;
    const element = createHost("div");
    element.style.setProperty("backdrop-filter", `blur(${blur}px)`);
    element.style.setProperty("-webkit-backdrop-filter", `blur(${blur}px)`);
    this.props.child?.mount(element);
    return element;
  }
}

export function BackdropFilter(props: BackdropFilterProps = {}): BackdropFilterComponent {
  return new BackdropFilterComponent(props);
}

export interface ColorFilteredProps {
  colorFilter?: ColorFilter;
  child?: UIComponent;
}

export class ColorFilteredComponent extends UIComponent {
  readonly kind = "ColorFiltered";

  constructor(readonly props: ColorFilteredProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ colorFilter: this.props.colorFilter });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.colorFilter) {
      element.style.filter = this.props.colorFilter.toCss();
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function ColorFiltered(props: ColorFilteredProps = {}): ColorFilteredComponent {
  return new ColorFilteredComponent(props);
}

export interface ShaderMaskProps {
  shader?: string;
  child?: UIComponent;
}

export class ShaderMaskComponent extends UIComponent {
  readonly kind = "ShaderMask";

  constructor(readonly props: ShaderMaskProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const shader =
      this.props.shader ?? "linear-gradient(to bottom, #000, transparent)";
    element.style.setProperty("mask-image", shader);
    element.style.setProperty("-webkit-mask-image", shader);
    this.props.child?.mount(element);
    return element;
  }
}

export function ShaderMask(props: ShaderMaskProps = {}): ShaderMaskComponent {
  return new ShaderMaskComponent(props);
}
