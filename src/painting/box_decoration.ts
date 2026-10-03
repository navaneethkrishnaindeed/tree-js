import { Border } from "./border";
import { BorderRadius } from "./border_radius";
import { boxShadowsToCss, type BoxShadow } from "./box_shadow";
import { BoxShape } from "./enums";
import type { Gradient } from "./gradient";

export interface BoxDecorationProps {
  color?: string;
  gradient?: Gradient;
  border?: Border;
  borderRadius?: BorderRadius;
  boxShadow?: BoxShadow | BoxShadow[];
  shape?: BoxShape;
}

class BoxDecorationImpl {
  constructor(readonly props: BoxDecorationProps) {}

  applyTo(style: CSSStyleDeclaration): void {
    if (this.props.gradient) {
      style.backgroundImage = this.props.gradient.toCss();
    } else if (this.props.color !== undefined) {
      style.backgroundColor = this.props.color;
    }
    if (this.props.color !== undefined && this.props.gradient) {
      style.backgroundColor = this.props.color;
    }
    this.props.border?.applyTo(style);
    if (this.props.shape === BoxShape.circle) {
      style.borderRadius = "50%";
    } else if (this.props.borderRadius) {
      style.borderRadius = this.props.borderRadius.toCss();
    }
    if (this.props.boxShadow) {
      style.boxShadow = boxShadowsToCss(this.props.boxShadow);
    }
  }

  inspect(): string {
    const parts: string[] = [];
    if (this.props.gradient) {
      parts.push(`gradient: ${this.props.gradient.inspect()}`);
    }
    if (this.props.color !== undefined) {
      parts.push(`color: ${this.props.color}`);
    }
    if (this.props.borderRadius) {
      parts.push(`borderRadius: ${this.props.borderRadius.inspect()}`);
    }
    if (this.props.border) {
      parts.push(`border: ${this.props.border.inspect()}`);
    }
    if (this.props.boxShadow) {
      parts.push("boxShadow: ...");
    }
    return `BoxDecoration(${parts.join(", ")})`;
  }

  toTreeValue(): unknown {
    return {
      color: this.props.color,
      border: this.props.border?.toTreeValue(),
      borderRadius: this.props.borderRadius?.toTreeValue(),
      boxShadow: this.props.boxShadow,
    };
  }
}

export type BoxDecoration = BoxDecorationImpl;

export function BoxDecoration(props: BoxDecorationProps): BoxDecoration {
  return new BoxDecorationImpl(props);
}
