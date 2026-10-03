import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";
import { TextOverflow } from "../painting/text_overflow";
import type { TextStyle } from "../painting/text_style";
import { applyTextOverflow } from "./rich_text";

export interface TextProps {
  text: string;
  style?: TextStyle;
  maxLines?: number;
  overflow?: TextOverflow;
  softWrap?: boolean;
  textAlign?: import("../painting/enums").TextAlign;
}

export class TextComponent extends UIComponent {
  readonly kind = "Text";
  props: TextProps;

  constructor(props: TextProps) {
    super();
    this.props = props;
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      text: this.props.text,
      style: this.props.style,
      maxLines: this.props.maxLines,
      overflow: this.props.overflow,
      softWrap: this.props.softWrap,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("span");
    element.textContent = this.props.text;
    this.props.style?.applyTo(element.style);
    if (this.props.textAlign) {
      element.style.textAlign = this.props.textAlign;
      element.style.display = "block";
    }
    applyTextOverflow(
      element,
      this.props.overflow,
      this.props.maxLines,
      this.props.softWrap,
    );
    return element;
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof TextComponent) || !this.host) {
      return false;
    }
    this.props = next.props;
    this.host.textContent = this.props.text;
    if (this.props.style) {
      this.props.style.applyTo(this.host.style);
    }
    if (this.props.textAlign) {
      this.host.style.textAlign = this.props.textAlign;
      this.host.style.display = "block";
    }
    applyTextOverflow(
      this.host,
      this.props.overflow,
      this.props.maxLines,
      this.props.softWrap,
    );
    return true;
  }
}

export function Text(props: TextProps): TextComponent {
  return new TextComponent(props);
}
