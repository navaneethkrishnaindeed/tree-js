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

export interface TextFieldProps {
  placeholder?: string;
  value?: string;
  onChanged?: (value: string) => void;
  multiline?: boolean;
  width?: Dimension;
  padding?: EdgeInsets;
}

export class TextFieldComponent extends UIComponent {
  readonly kind = "TextField";

  constructor(readonly props: TextFieldProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      placeholder: this.props.placeholder,
      value: this.props.value,
      multiline: this.props.multiline,
      width: this.props.width,
      padding: this.props.padding,
      onChanged: this.props.onChanged,
    });
  }

  createElement(): HTMLElement {
    const element = this.props.multiline
      ? createHost("textarea")
      : createHost("input");

    if (!this.props.multiline) {
      (element as HTMLInputElement).type = "text";
    }

    if (this.props.placeholder !== undefined) {
      (element as HTMLInputElement).placeholder = this.props.placeholder;
    }
    if (this.props.value !== undefined) {
      (element as HTMLInputElement).value = this.props.value;
    }

    const padding =
      this.props.padding ?? EdgeInsets.symmetric({ horizontal: 12, vertical: 10 });

    applyBoxStyles(element, {
      width: this.props.width,
      padding,
      decoration: BoxDecoration({
        color: Colors.white,
        border: Border.all({ color: Colors.grey400, width: 1 }),
        borderRadius: BorderRadius.circular(8),
      }),
    });
    element.style.fontFamily = "inherit";
    element.style.fontSize = toCssSize(14);
    element.style.outline = "none";

    if (this.props.multiline) {
      (element as HTMLTextAreaElement).rows = 4;
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
