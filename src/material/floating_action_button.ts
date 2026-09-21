import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { ThemeData } from "../painting/theme";

export interface FloatingActionButtonProps {
  child?: UIComponent;
  onPressed?: () => void;
  tooltip?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  mini?: boolean;
  disabled?: boolean;
  label?: UIComponent;
}

export class FloatingActionButtonComponent extends UIComponent {
  readonly kind = "FloatingActionButton";

  constructor(readonly props: FloatingActionButtonProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return [this.props.child, this.props.label].filter(
      (child): child is UIComponent => child !== undefined,
    );
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      tooltip: this.props.tooltip,
      backgroundColor: this.props.backgroundColor,
      foregroundColor: this.props.foregroundColor,
      mini: this.props.mini,
      disabled: this.props.disabled,
      onPressed: this.props.onPressed,
    });
  }

  createElement(): HTMLElement {
    const theme = ThemeData.light();
    const extended = this.props.label !== undefined;
    const mini = this.props.mini === true && !extended;
    const size = mini ? 40 : 56;

    const element = createHost("button");
    element.type = "button";
    if (this.props.tooltip) {
      element.title = this.props.tooltip;
    }
    if (this.props.disabled) {
      element.disabled = true;
    }

    element.style.display = "inline-flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
    element.style.gap = "8px";
    element.style.border = "none";
    element.style.cursor = this.props.disabled ? "not-allowed" : "pointer";
    element.style.backgroundColor =
      this.props.backgroundColor ?? theme.colorScheme.primary;
    element.style.color =
      this.props.foregroundColor ?? theme.colorScheme.onPrimary;
    element.style.boxShadow = "0 6px 16px rgba(33, 150, 243, 0.4)";
    element.style.flexShrink = "0";

    if (extended) {
      element.style.height = "48px";
      element.style.padding = "0 20px";
      element.style.borderRadius = "24px";
    } else {
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.borderRadius = "50%";
      element.style.padding = "0";
    }

    this.props.child?.mount(element);
    this.props.label?.mount(element);

    if (this.props.onPressed && !this.props.disabled) {
      element.addEventListener("click", this.props.onPressed);
    }

    return element;
  }
}

export function FloatingActionButton(
  props: FloatingActionButtonProps = {},
): FloatingActionButtonComponent {
  return new FloatingActionButtonComponent(props);
}

export namespace FloatingActionButton {
  export function extended(
    props: FloatingActionButtonProps & { label: UIComponent },
  ): FloatingActionButtonComponent {
    return FloatingActionButton(props);
  }
}
