import { applyCssTransition, Curves, type Curve } from "../animation/curves";
import type { Duration } from "../animation/duration";
import { Duration as createDuration } from "../animation/duration";
import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { replaceChild } from "../core/patch";
import { applyBoxStyles, type BoxStyleProps } from "../core/style";
import type { UINode } from "../core/types";
import { toCssSize } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";
import type { PositionedProps } from "./positioned";

export interface AnimatedProps {
  duration?: Duration;
  curve?: Curve;
}

function defaultDuration(duration?: Duration): Duration {
  return duration ?? createDuration({ milliseconds: 250 });
}

export interface AnimatedContainerProps extends BoxStyleProps, AnimatedProps {
  child?: UIComponent;
}

export class AnimatedContainerComponent extends UIComponent {
  readonly kind = "AnimatedContainer";
  props: AnimatedContainerProps;

  constructor(props: AnimatedContainerProps) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    const rest = { ...this.props } as Record<string, unknown>;
    delete rest.child;
    return omitUndefined(rest);
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(
      element,
      defaultDuration(this.props.duration),
      this.props.curve,
      "background-color, padding, margin, width, height, border-radius, opacity, transform",
    );
    applyBoxStyles(element, this.props);
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedContainerProps>): void {
    this.props = { ...this.props, ...next };
    if (!this.host) {
      return;
    }
    applyCssTransition(
      this.host,
      defaultDuration(this.props.duration),
      this.props.curve,
      "background-color, padding, margin, width, height, border-radius, opacity, transform",
    );
    applyBoxStyles(this.host, this.props);
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof AnimatedContainerComponent) || !this.host) {
      return false;
    }
    const incoming = next.props.child;
    this.update({ ...next.props, child: this.props.child });
    this.props.child = replaceChild(this.host, this.props.child, incoming) as UIComponent | undefined;
    return true;
  }
}

export function AnimatedContainer(props: AnimatedContainerProps): AnimatedContainerComponent {
  return new AnimatedContainerComponent(props);
}

export interface AnimatedOpacityProps extends AnimatedProps {
  opacity?: number;
  child?: UIComponent;
}

export class AnimatedOpacityComponent extends UIComponent {
  readonly kind = "AnimatedOpacity";
  props: AnimatedOpacityProps;

  constructor(props: AnimatedOpacityProps) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      opacity: this.props.opacity,
      duration: this.props.duration,
      curve: this.props.curve,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve, "opacity");
    element.style.opacity = String(this.props.opacity ?? 1);
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedOpacityProps>): void {
    this.props = { ...this.props, ...next };
    if (this.host) {
      applyCssTransition(this.host, defaultDuration(this.props.duration), this.props.curve, "opacity");
      this.host.style.opacity = String(this.props.opacity ?? 1);
    }
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof AnimatedOpacityComponent) || !this.host) {
      return false;
    }
    const incoming = next.props.child;
    this.update({ ...next.props, child: this.props.child });
    this.props.child = replaceChild(this.host, this.props.child, incoming) as UIComponent | undefined;
    return true;
  }
}

export function AnimatedOpacity(props: AnimatedOpacityProps): AnimatedOpacityComponent {
  return new AnimatedOpacityComponent(props);
}

export interface AnimatedPaddingProps extends AnimatedProps {
  padding?: BoxStyleProps["padding"];
  child?: UIComponent;
}

export class AnimatedPaddingComponent extends UIComponent {
  readonly kind = "AnimatedPadding";
  props: AnimatedPaddingProps;

  constructor(props: AnimatedPaddingProps) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      padding: this.props.padding,
      duration: this.props.duration,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve, "padding");
    if (this.props.padding) {
      element.style.padding = this.props.padding.toCss();
    }
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedPaddingProps>): void {
    this.props = { ...this.props, ...next };
    if (this.host && this.props.padding) {
      applyCssTransition(this.host, defaultDuration(this.props.duration), this.props.curve, "padding");
      this.host.style.padding = this.props.padding.toCss();
    }
  }
}

export function AnimatedPadding(props: AnimatedPaddingProps): AnimatedPaddingComponent {
  return new AnimatedPaddingComponent(props);
}

export interface AnimatedAlignProps extends AnimatedProps {
  alignment?: Alignment;
  child?: UIComponent;
}

export class AnimatedAlignComponent extends UIComponent {
  readonly kind = "AnimatedAlign";
  props: AnimatedAlignProps;

  constructor(props: AnimatedAlignProps) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      alignment: this.props.alignment,
      duration: this.props.duration,
    });
  }

  private paint(element: HTMLElement): void {
    const alignment = this.props.alignment ?? Alignment.center;
    element.style.display = "flex";
    element.style.justifyContent = alignment.toJustifyContent();
    element.style.alignItems = alignment.toAlignItems();
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve);
    this.paint(element);
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedAlignProps>): void {
    this.props = { ...this.props, ...next };
    if (this.host) {
      applyCssTransition(this.host, defaultDuration(this.props.duration), this.props.curve);
      this.paint(this.host);
    }
  }
}

export function AnimatedAlign(props: AnimatedAlignProps): AnimatedAlignComponent {
  return new AnimatedAlignComponent(props);
}

export interface AnimatedPositionedProps extends PositionedProps, AnimatedProps {}

export class AnimatedPositionedComponent extends UIComponent {
  readonly kind = "AnimatedPositioned";
  props: AnimatedPositionedProps;

  constructor(props: AnimatedPositionedProps) {
    super();
    this.props = props;
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    const rest = { ...this.props } as Record<string, unknown>;
    delete rest.child;
    return omitUndefined(rest);
  }

  private paint(element: HTMLElement): void {
    element.style.position = "absolute";
    if (this.props.top !== undefined) {
      element.style.top = toCssSize(this.props.top);
    }
    if (this.props.right !== undefined) {
      element.style.right = toCssSize(this.props.right);
    }
    if (this.props.bottom !== undefined) {
      element.style.bottom = toCssSize(this.props.bottom);
    }
    if (this.props.left !== undefined) {
      element.style.left = toCssSize(this.props.left);
    }
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve);
    this.paint(element);
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedPositionedProps>): void {
    this.props = { ...this.props, ...next };
    if (this.host) {
      applyCssTransition(this.host, defaultDuration(this.props.duration), this.props.curve);
      this.paint(this.host);
    }
  }
}

export function AnimatedPositioned(props: AnimatedPositionedProps): AnimatedPositionedComponent {
  return new AnimatedPositionedComponent(props);
}

export interface AnimatedSizeProps extends AnimatedProps {
  child?: UIComponent;
  width?: BoxStyleProps["width"];
  height?: BoxStyleProps["height"];
}

export class AnimatedSizeComponent extends UIComponent {
  readonly kind = "AnimatedSize";
  props: AnimatedSizeProps;

  constructor(props: AnimatedSizeProps = {}) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.overflow = "hidden";
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve, "height, width");
    this.props.child?.mount(element);
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    return element;
  }

  update(next: Partial<AnimatedSizeProps>): void {
    this.props = { ...this.props, ...next };
    if (!this.host) {
      return;
    }
    applyCssTransition(this.host, defaultDuration(this.props.duration), this.props.curve, "height, width");
    if (this.props.width !== undefined) {
      this.host.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      this.host.style.height = toCssSize(this.props.height);
    } else {
      this.host.style.height = `${this.host.scrollHeight}px`;
    }
  }
}

export function AnimatedSize(props: AnimatedSizeProps = {}): AnimatedSizeComponent {
  return new AnimatedSizeComponent(props);
}

export const CrossFadeState = {
  showFirst: "showFirst",
  showSecond: "showSecond",
} as const;

export type CrossFadeState = (typeof CrossFadeState)[keyof typeof CrossFadeState];

export interface AnimatedCrossFadeProps extends AnimatedProps {
  firstChild?: UIComponent;
  secondChild?: UIComponent;
  crossFadeState?: CrossFadeState;
}

export class AnimatedCrossFadeComponent extends UIComponent {
  readonly kind = "AnimatedCrossFade";
  props: AnimatedCrossFadeProps;
  private firstHost?: HTMLElement;
  private secondHost?: HTMLElement;

  constructor(props: AnimatedCrossFadeProps) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return [this.props.firstChild, this.props.secondChild].filter(
      (child): child is UIComponent => child !== undefined,
    );
  }

  private paint(): void {
    const showFirst = (this.props.crossFadeState ?? CrossFadeState.showFirst) === CrossFadeState.showFirst;
    if (this.firstHost) {
      this.firstHost.style.opacity = showFirst ? "1" : "0";
      this.firstHost.style.pointerEvents = showFirst ? "auto" : "none";
    }
    if (this.secondHost) {
      this.secondHost.style.opacity = showFirst ? "0" : "1";
      this.secondHost.style.pointerEvents = showFirst ? "none" : "auto";
    }
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.position = "relative";
    this.firstHost = createHost("div");
    this.secondHost = createHost("div");
    applyCssTransition(this.firstHost, defaultDuration(this.props.duration), this.props.curve, "opacity");
    applyCssTransition(this.secondHost, defaultDuration(this.props.duration), this.props.curve, "opacity");
    this.secondHost.style.position = "absolute";
    this.secondHost.style.inset = "0";
    this.props.firstChild?.mount(this.firstHost);
    this.props.secondChild?.mount(this.secondHost);
    element.appendChild(this.firstHost);
    element.appendChild(this.secondHost);
    this.paint();
    return element;
  }

  update(next: Partial<AnimatedCrossFadeProps>): void {
    this.props = { ...this.props, ...next };
    this.paint();
  }
}

export function AnimatedCrossFade(props: AnimatedCrossFadeProps): AnimatedCrossFadeComponent {
  return new AnimatedCrossFadeComponent(props);
}

export interface AnimatedSwitcherProps extends AnimatedProps {
  child?: UIComponent;
}

export class AnimatedSwitcherComponent extends UIComponent {
  readonly kind = "AnimatedSwitcher";
  props: AnimatedSwitcherProps;
  private slot?: HTMLElement;

  constructor(props: AnimatedSwitcherProps = {}) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    this.slot = createHost("div");
    applyCssTransition(this.slot, defaultDuration(this.props.duration), this.props.curve ?? Curves.easeInOut, "opacity");
    this.props.child?.mount(this.slot);
    element.appendChild(this.slot);
    return element;
  }

  update(next: Partial<AnimatedSwitcherProps>): void {
    this.props = { ...this.props, ...next };
    if (!this.slot) {
      return;
    }
    const slot = this.slot;
    slot.style.opacity = "0";
    window.setTimeout(() => {
      slot.replaceChildren();
      this.props.child?.mount(slot);
      slot.style.opacity = "1";
    }, 120);
  }
}

export function AnimatedSwitcher(props: AnimatedSwitcherProps = {}): AnimatedSwitcherComponent {
  return new AnimatedSwitcherComponent(props);
}

export interface AnimatedScaleProps extends AnimatedProps {
  scale?: number;
  alignment?: Alignment;
  child?: UIComponent;
}

export class AnimatedScaleComponent extends UIComponent {
  readonly kind = "AnimatedScale";
  props: AnimatedScaleProps;

  constructor(props: AnimatedScaleProps = {}) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve, "transform");
    const origin = this.props.alignment ?? Alignment.center;
    element.style.transformOrigin = `${((origin.x + 1) / 2) * 100}% ${((origin.y + 1) / 2) * 100}%`;
    element.style.transform = `scale(${this.props.scale ?? 1})`;
    element.style.willChange = "transform";
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedScaleProps>): void {
    this.props = { ...this.props, ...next };
    if (this.host) {
      applyCssTransition(this.host, defaultDuration(this.props.duration), this.props.curve, "transform");
      this.host.style.transform = `scale(${this.props.scale ?? 1})`;
    }
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof AnimatedScaleComponent) || !this.host) {
      return false;
    }
    const incoming = next.props.child;
    this.update({ ...next.props, child: this.props.child });
    this.props.child = replaceChild(this.host, this.props.child, incoming) as UIComponent | undefined;
    return true;
  }
}

export function AnimatedScale(props: AnimatedScaleProps = {}): AnimatedScaleComponent {
  return new AnimatedScaleComponent(props);
}

export interface AnimatedSlideProps extends AnimatedProps {
  offset?: { dx: number; dy: number };
  child?: UIComponent;
}

export class AnimatedSlideComponent extends UIComponent {
  readonly kind = "AnimatedSlide";
  props: AnimatedSlideProps;

  constructor(props: AnimatedSlideProps = {}) {
    super();
    this.props = props;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyCssTransition(element, defaultDuration(this.props.duration), this.props.curve, "transform");
    const offset = this.props.offset ?? { dx: 0, dy: 0 };
    element.style.transform = `translate(${offset.dx * 100}%, ${offset.dy * 100}%)`;
    element.style.willChange = "transform";
    this.props.child?.mount(element);
    return element;
  }

  update(next: Partial<AnimatedSlideProps>): void {
    this.props = { ...this.props, ...next };
    if (this.host) {
      const offset = this.props.offset ?? { dx: 0, dy: 0 };
      this.host.style.transform = `translate(${offset.dx * 100}%, ${offset.dy * 100}%)`;
    }
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof AnimatedSlideComponent) || !this.host) {
      return false;
    }
    const incoming = next.props.child;
    this.update({ ...next.props, child: this.props.child });
    this.props.child = replaceChild(this.host, this.props.child, incoming) as UIComponent | undefined;
    return true;
  }
}

export function AnimatedSlide(props: AnimatedSlideProps = {}): AnimatedSlideComponent {
  return new AnimatedSlideComponent(props);
}

