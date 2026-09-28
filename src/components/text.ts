import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { TextOverflow } from "../painting/text_overflow";
import type { TextStyle } from "../painting/text_style";
import { applyTextOverflow } from "./rich_text";

export interface TextProps {
  text: string;
  style?: TextStyle;
  maxLines?: number;
  overflow?: TextOverflow;
  softWrap?: boolean;
}

export class TextComponent extends UIComponent {
  readonly kind = "Text";

  constructor(readonly props: TextProps) {
    super();
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
    applyTextOverflow(
      element,
      this.props.overflow,
      this.props.maxLines,
      this.props.softWrap,
    );
    return element;
  }
}

export function Text(props: TextProps): TextComponent {
  return new TextComponent(props);
}
