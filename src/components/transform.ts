import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";
import { Offset } from "../painting/offset";

export interface TransformProps {
  transform?: string;
  origin?: Alignment;
  child?: UIComponent;
  angle?: number;
  scale?: number;
  offset?: Offset;
}

function originCss(origin?: Alignment): string {
  if (!origin) {
    return "center";
  }
  const x = ((origin.x + 1) / 2) * 100;
  const y = ((origin.y + 1) / 2) * 100;
  return `${x}% ${y}%`;
}

function buildTransform(props: TransformProps): string {
  if (props.transform) {
    return props.transform;
  }
  const parts: string[] = [];
  if (props.offset) {
    parts.push(`translate(${props.offset.dx}px, ${props.offset.dy}px)`);
  }
  if (props.angle !== undefined) {
    parts.push(`rotate(${(props.angle * 180) / Math.PI}deg)`);
  }
  if (props.scale !== undefined) {
    parts.push(`scale(${props.scale})`);
  }
  return parts.join(" ") || "none";
}

export class TransformComponent extends UIComponent {
  readonly kind = "Transform";

  constructor(readonly props: TransformProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      transform: this.props.transform,
      angle: this.props.angle,
      scale: this.props.scale,
      offset: this.props.offset,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.transformOrigin = originCss(this.props.origin);
    element.style.transform = buildTransform(this.props);
    this.props.child?.mount(element);
    return element;
  }
}

export function Transform(props: TransformProps = {}): TransformComponent {
  return new TransformComponent(props);
}

export namespace Transform {
  export function rotate(props: { angle: number; origin?: Alignment; child?: UIComponent }): TransformComponent {
    return Transform({ angle: props.angle, origin: props.origin, child: props.child });
  }

  export function scale(props: { scale: number; origin?: Alignment; child?: UIComponent }): TransformComponent {
    return Transform({ scale: props.scale, origin: props.origin, child: props.child });
  }

  export function translate(props: { offset: Offset; child?: UIComponent }): TransformComponent {
    return Transform({ offset: props.offset, child: props.child });
  }
}

export interface RotatedBoxProps {
  quarterTurns?: number;
  child?: UIComponent;
}

export class RotatedBoxComponent extends UIComponent {
  readonly kind = "RotatedBox";

  constructor(readonly props: RotatedBoxProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ quarterTurns: this.props.quarterTurns });
  }

  createElement(): HTMLElement {
    const turns = this.props.quarterTurns ?? 0;
    const element = createHost("div");
    element.style.display = "inline-flex";
    element.style.transform = `rotate(${(turns % 4) * 90}deg)`;
    this.props.child?.mount(element);
    return element;
  }
}

export function RotatedBox(props: RotatedBoxProps = {}): RotatedBoxComponent {
  return new RotatedBoxComponent(props);
}
