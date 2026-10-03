import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles } from "../core/style";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { WrapAlignment, WrapCrossAlignment } from "../painting/enums";

export interface WrapProps {
  children?: UIComponent[];
  spacing?: Dimension;
  runSpacing?: Dimension;
  alignment?: WrapAlignment;
  crossAxisAlignment?: WrapCrossAlignment;
}

export class WrapComponent extends UIComponent {
  readonly kind = "Wrap";

  constructor(readonly props: WrapProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.children ?? [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      spacing: this.props.spacing,
      runSpacing: this.props.runSpacing,
      alignment: this.props.alignment,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "flex";
    element.style.flexWrap = "wrap";
    element.style.justifyContent = this.props.alignment ?? WrapAlignment.start;
    element.style.alignItems = this.props.crossAxisAlignment ?? WrapCrossAlignment.start;
    element.style.gap = `${toCssSize(this.props.runSpacing ?? 0)} ${toCssSize(this.props.spacing ?? 8)}`;
    for (const child of this.props.children ?? []) {
      child.mount(element);
    }
    return element;
  }
}

export function Wrap(props: WrapProps = {}): WrapComponent {
  return new WrapComponent(props);
}

export interface AspectRatioProps {
  aspectRatio: number;
  child?: UIComponent;
}

export class AspectRatioComponent extends UIComponent {
  readonly kind = "AspectRatio";

  constructor(readonly props: AspectRatioProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ aspectRatio: this.props.aspectRatio });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.aspectRatio = String(this.props.aspectRatio);
    element.style.width = "100%";
    this.props.child?.mount(element);
    return element;
  }
}

export function AspectRatio(props: AspectRatioProps): AspectRatioComponent {
  return new AspectRatioComponent(props);
}

export interface OverflowBoxProps {
  minWidth?: Dimension;
  maxWidth?: Dimension;
  minHeight?: Dimension;
  maxHeight?: Dimension;
  child?: UIComponent;
}

export class OverflowBoxComponent extends UIComponent {
  readonly kind = "OverflowBox";

  constructor(readonly props: OverflowBoxProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.overflow = "visible";
    applyBoxStyles(element, {
      minWidth: this.props.minWidth,
      maxWidth: this.props.maxWidth,
      minHeight: this.props.minHeight,
      maxHeight: this.props.maxHeight,
    });
    this.props.child?.mount(element);
    return element;
  }
}

export function OverflowBox(props: OverflowBoxProps = {}): OverflowBoxComponent {
  return new OverflowBoxComponent(props);
}

export interface VisibilityProps {
  visible?: boolean;
  maintainSize?: boolean;
  child?: UIComponent;
}

export class VisibilityComponent extends UIComponent {
  readonly kind = "Visibility";

  constructor(readonly props: VisibilityProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      visible: this.props.visible,
      maintainSize: this.props.maintainSize,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const visible = this.props.visible !== false;
    if (!visible && this.props.maintainSize) {
      element.style.visibility = "hidden";
    } else if (!visible) {
      element.style.display = "none";
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function Visibility(props: VisibilityProps = {}): VisibilityComponent {
  return new VisibilityComponent(props);
}

export interface OffstageProps {
  offstage?: boolean;
  child?: UIComponent;
}

export class OffstageComponent extends UIComponent {
  readonly kind = "Offstage";

  constructor(readonly props: OffstageProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.offstage !== false) {
      element.style.display = "none";
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function Offstage(props: OffstageProps = {}): OffstageComponent {
  return new OffstageComponent(props);
}
