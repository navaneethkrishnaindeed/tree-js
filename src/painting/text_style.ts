import { toCssSize, type Dimension } from "../core/types";

export interface TextStyleProps {
  fontSize?: Dimension;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  letterSpacing?: Dimension;
  lineHeight?: number | string;
  textAlign?: "left" | "center" | "right" | "justify";
  decoration?: "none" | "underline" | "line-through" | "overline";
}

class TextStyleImpl {
  constructor(readonly props: TextStyleProps) {}

  applyTo(style: CSSStyleDeclaration): void {
    if (this.props.fontSize !== undefined) {
      style.fontSize = toCssSize(this.props.fontSize);
    }
    if (this.props.fontWeight !== undefined) {
      style.fontWeight = this.props.fontWeight;
    }
    if (this.props.color !== undefined) {
      style.color = this.props.color;
    }
    if (this.props.fontFamily !== undefined) {
      style.fontFamily = this.props.fontFamily;
    }
    if (this.props.fontStyle !== undefined) {
      style.fontStyle = this.props.fontStyle;
    }
    if (this.props.letterSpacing !== undefined) {
      style.letterSpacing = toCssSize(this.props.letterSpacing);
    }
    if (this.props.lineHeight !== undefined) {
      style.lineHeight =
        typeof this.props.lineHeight === "number"
          ? String(this.props.lineHeight)
          : this.props.lineHeight;
    }
    if (this.props.textAlign !== undefined) {
      style.textAlign = this.props.textAlign;
    }
    if (this.props.decoration !== undefined) {
      style.textDecoration = this.props.decoration;
    }
  }

  inspect(): string {
    const parts: string[] = [];
    if (this.props.fontSize !== undefined) {
      parts.push(`fontSize: ${this.props.fontSize}`);
    }
    if (this.props.fontWeight !== undefined) {
      parts.push(`fontWeight: ${this.props.fontWeight}`);
    }
    if (this.props.color !== undefined) {
      parts.push(`color: ${this.props.color}`);
    }
    return `TextStyle(${parts.join(", ")})`;
  }

  toTreeValue(): TextStyleProps {
    return { ...this.props };
  }
}

export type TextStyle = TextStyleImpl;

export function TextStyle(props: TextStyleProps): TextStyle {
  return new TextStyleImpl(props);
}
