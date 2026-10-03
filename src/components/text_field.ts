import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles } from "../core/style";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Border } from "../painting/border";
import { BorderRadius } from "../painting/border_radius";
import { BoxDecoration } from "../painting/box_decoration";
import { Colors } from "../painting/colors";
import { EdgeInsets } from "../painting/edge_insets";
import type { TextStyle } from "../painting/text_style";

export interface InputDecoration {
  hintText?: string;
  filled?: boolean;
  fillColor?: string;
  border?: Border;
  borderRadius?: BorderRadius;
  contentPadding?: EdgeInsets;
  obscureText?: boolean;
}

export function InputDecoration(props: InputDecoration): InputDecoration {
  return props;
}

export interface TextFieldProps {
  placeholder?: string;
  value?: string;
  onChanged?: (value: string) => void;
  multiline?: boolean;
  width?: Dimension;
  padding?: EdgeInsets;
  decoration?: InputDecoration;
  obscureText?: boolean;
  keyboardType?: "text" | "email" | "number" | "password" | "tel" | "url";
  maxLines?: number;
  style?: TextStyle;
}

export class TextFieldComponent extends UIComponent {
  readonly kind = "TextField";

  constructor(readonly props: TextFieldProps = {}) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      placeholder: this.props.placeholder,
      value: this.props.value,
      multiline: this.props.multiline,
      width: this.props.width,
      onChanged: this.props.onChanged,
    });
  }

  createElement(): HTMLElement {
    const decoration = this.props.decoration;
    const obscure = this.props.obscureText ?? decoration?.obscureText ?? false;
    const element = this.props.multiline
      ? createHost("textarea")
      : createHost("input");

    if (!this.props.multiline) {
      const input = element as HTMLInputElement;
      if (obscure || this.props.keyboardType === "password") {
        input.type = "password";
      } else if (this.props.keyboardType && this.props.keyboardType !== "text") {
        input.type = this.props.keyboardType === "email" ? "email" : this.props.keyboardType === "number" ? "number" : this.props.keyboardType === "tel" ? "tel" : this.props.keyboardType === "url" ? "url" : "text";
      } else {
        input.type = "text";
      }
    }

    const hint = decoration?.hintText ?? this.props.placeholder;
    if (hint !== undefined) {
      (element as HTMLInputElement).placeholder = hint;
    }
    if (this.props.value !== undefined) {
      (element as HTMLInputElement).value = this.props.value;
    }

    const padding =
      decoration?.contentPadding ??
      this.props.padding ??
      EdgeInsets.symmetric({ horizontal: 12, vertical: 10 });

    applyBoxStyles(element, {
      width: this.props.width,
      padding,
      decoration: BoxDecoration({
        color: decoration?.filled === false ? "transparent" : decoration?.fillColor ?? Colors.white,
        border: decoration?.border ?? Border.all({ color: Colors.grey400, width: 1 }),
        borderRadius: decoration?.borderRadius ?? BorderRadius.circular(8),
      }),
    });
    element.style.fontFamily = "inherit";
    element.style.fontSize = toCssSize(14);
    element.style.outline = "none";
    this.props.style?.applyTo(element.style);

    if (this.props.multiline) {
      (element as HTMLTextAreaElement).rows = this.props.maxLines ?? 4;
      element.style.resize = "vertical";
    }

    if (this.props.onChanged) {
      element.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        this.props.onChanged?.(target.value);
      });
    }

    return element;
  }
}

export function TextField(props: TextFieldProps = {}): TextFieldComponent {
  return new TextFieldComponent(props);
}
