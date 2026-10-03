import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles } from "../core/style";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";
import { FontWeight } from "../layout/font_weight";
import { BorderRadius } from "../painting/border_radius";
import { BoxDecoration } from "../painting/box_decoration";
import { Colors } from "../painting/colors";
import { EdgeInsets } from "../painting/edge_insets";
import { TextStyle, type TextStyle as TextStyleValue } from "../painting/text_style";

export interface ButtonProps {
  text?: string;
  child?: UIComponent;
  onPressed?: () => void;
  style?: TextStyleValue;
  padding?: EdgeInsets;
  decoration?: BoxDecoration;
  disabled?: boolean;
}

export class ButtonComponent extends UIComponent {
  readonly kind = "Button";

  constructor(readonly props: ButtonProps) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      text: this.props.text,
      style: this.props.style,
      padding: this.props.padding,
      decoration: this.props.decoration,
      disabled: this.props.disabled,
      onPressed: this.props.onPressed,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("button");
    element.type = "button";
    if (this.props.disabled) {
      element.disabled = true;
    }

    const decoration =
      this.props.decoration ??
      BoxDecoration({
        color: Colors.blue,
        borderRadius: BorderRadius.circular(8),
      });
    const padding = this.props.padding ?? EdgeInsets.symmetric({
      horizontal: 16,
      vertical: 10,
    });

    applyBoxStyles(element, { decoration, padding });
    element.style.border = element.style.border || "none";
    element.style.cursor = this.props.disabled ? "not-allowed" : "pointer";
    element.style.fontFamily = "inherit";
    element.style.display = "inline-flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.gap = "8px";

    const textStyle =
      this.props.style ??
      TextStyle({
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      });
    textStyle.applyTo(element.style);

    if (this.props.child) {
      this.props.child.mount(element);
    } else {
      element.textContent = this.props.text ?? "";
    }

    if (this.props.onPressed && !this.props.disabled) {
      element.addEventListener("click", this.props.onPressed);
    }

    return element;
  }
}

export function Button(props: ButtonProps): ButtonComponent {
  return new ButtonComponent(props);
}
