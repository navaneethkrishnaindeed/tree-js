import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Colors } from "../painting/colors";
import { EdgeInsets } from "../painting/edge_insets";

export interface IconButtonProps {
  icon: UIComponent;
  onPressed?: () => void;
  tooltip?: string;
  color?: string;
  disabled?: boolean;
  size?: Dimension;
  padding?: EdgeInsets;
}

export class IconButtonComponent extends UIComponent {
  readonly kind = "IconButton";

  constructor(readonly props: IconButtonProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return [this.props.icon];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      tooltip: this.props.tooltip,
      color: this.props.color,
      disabled: this.props.disabled,
      size: this.props.size,
      onPressed: this.props.onPressed,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("button");
    element.type = "button";
    if (this.props.tooltip) {
      element.title = this.props.tooltip;
    }
    if (this.props.disabled) {
      element.disabled = true;
    }

    const size = this.props.size ?? 48;
    element.style.width = toCssSize(size);
    element.style.height = toCssSize(size);
    element.style.padding = (this.props.padding ?? EdgeInsets.all(12)).toCss();
    element.style.border = "none";
    element.style.background = "transparent";
    element.style.borderRadius = "50%";
    element.style.cursor = this.props.disabled ? "not-allowed" : "pointer";
    element.style.display = "inline-flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.color = this.props.color ?? Colors.grey800;
    element.style.flexShrink = "0";

    this.props.icon.mount(element);

    if (this.props.onPressed && !this.props.disabled) {
      element.addEventListener("click", this.props.onPressed);
    }

    return element;
  }
}

export function IconButton(props: IconButtonProps): IconButtonComponent {
  return new IconButtonComponent(props);
}
