import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { TextStyle } from "../painting/text_style";

export interface TextProps {
  text: string;
  style?: TextStyle;
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
    });
  }

  createElement(): HTMLElement {
    const element = createHost("span");
    element.textContent = this.props.text;
    this.props.style?.applyTo(element.style);
    return element;
  }
}

export function Text(props: TextProps): TextComponent {
  return new TextComponent(props);
}
