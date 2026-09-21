import { Border } from "./border";
import { BorderRadius } from "./border_radius";
import { boxShadowsToCss, type BoxShadow } from "./box_shadow";

export interface BoxDecorationProps {
  color?: string;
  border?: Border;
  borderRadius?: BorderRadius;
  boxShadow?: BoxShadow | BoxShadow[];
}

class BoxDecorationImpl {
  constructor(readonly props: BoxDecorationProps) {}

  applyTo(style: CSSStyleDeclaration): void {
    if (this.props.color !== undefined) {
      style.backgroundColor = this.props.color;
    }
    this.props.border?.applyTo(style);
    if (this.props.borderRadius) {
      style.borderRadius = this.props.borderRadius.toCss();
    }
    if (this.props.boxShadow) {
      style.boxShadow = boxShadowsToCss(this.props.boxShadow);
    }
  }

  inspect(): string {
    const parts: string[] = [];
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
