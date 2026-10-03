import type { BorderStyle } from "./enums";

export interface BorderSide {
  color?: string;
  width?: number;
  style?: "solid" | "dashed" | "dotted" | "none" | BorderStyle;
}

function sideToCss(side: BorderSide): string {
  const width = side.width ?? 1;
  const style = side.style ?? "solid";
  const color = side.color ?? "#000000";
  return `${width}px ${style} ${color}`;
}

function sidesEqual(a: BorderSide, b: BorderSide): boolean {
  return a.color === b.color && a.width === b.width && a.style === b.style;
}

export class Border {
  constructor(
    readonly top: BorderSide,
    readonly right: BorderSide,
    readonly bottom: BorderSide,
    readonly left: BorderSide,
  ) {}

  static all(side: BorderSide): Border {
    return new Border(side, side, side, side);
  }

  static only(options: {
    top?: BorderSide;
    right?: BorderSide;
    bottom?: BorderSide;
    left?: BorderSide;
  }): Border {
    const none: BorderSide = { width: 0, style: "none" };
    return new Border(
      options.top ?? none,
      options.right ?? none,
      options.bottom ?? none,
      options.left ?? none,
    );
  }

  applyTo(style: CSSStyleDeclaration): void {
    if (
      sidesEqual(this.top, this.right) &&
      sidesEqual(this.right, this.bottom) &&
      sidesEqual(this.bottom, this.left)
    ) {
      style.border = sideToCss(this.top);
      return;
    }
    style.borderTop = sideToCss(this.top);
    style.borderRight = sideToCss(this.right);
    style.borderBottom = sideToCss(this.bottom);
    style.borderLeft = sideToCss(this.left);
  }

  inspect(): string {
    if (
      sidesEqual(this.top, this.right) &&
      sidesEqual(this.right, this.bottom) &&
      sidesEqual(this.bottom, this.left)
    ) {
      return `Border.all(width: ${this.top.width ?? 1}, color: ${this.top.color ?? "#000000"})`;
    }
    return "Border.only(...)";
  }

  toTreeValue(): unknown {
    return {
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
  }
}
