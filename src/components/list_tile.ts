import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { Colors } from "../painting/colors";
import { EdgeInsets } from "../painting/edge_insets";

export interface ListTileProps {
  leading?: UIComponent;
  title?: UIComponent;
  subtitle?: UIComponent;
  trailing?: UIComponent;
  onTap?: () => void;
  selected?: boolean;
  dense?: boolean;
}

export class ListTileComponent extends UIComponent {
  readonly kind = "ListTile";

  constructor(readonly props: ListTileProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return [
      this.props.leading,
      this.props.title,
      this.props.subtitle,
      this.props.trailing,
    ].filter((child): child is UIComponent => child !== undefined);
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      selected: this.props.selected,
      dense: this.props.dense,
      onTap: this.props.onTap,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.gap = "16px";
    element.style.padding = this.props.dense
      ? EdgeInsets.symmetric({ horizontal: 16, vertical: 8 }).toCss()
      : EdgeInsets.symmetric({ horizontal: 16, vertical: 12 }).toCss();
    element.style.backgroundColor = this.props.selected
      ? "rgba(33, 150, 243, 0.12)"
      : "transparent";
    element.style.cursor = this.props.onTap ? "pointer" : "default";
    element.style.width = "100%";

    if (this.props.leading) {
      this.props.leading.mount(element);
    }

    const textColumn = createHost("div");
    textColumn.style.flex = "1";
    textColumn.style.minWidth = "0";
    textColumn.style.display = "flex";
    textColumn.style.flexDirection = "column";
    textColumn.style.gap = "2px";
    this.props.title?.mount(textColumn);
    this.props.subtitle?.mount(textColumn);
    element.appendChild(textColumn);

    this.props.trailing?.mount(element);

    if (this.props.onTap) {
      element.addEventListener("click", this.props.onTap);
    }

    element.addEventListener("mouseenter", () => {
      if (!this.props.selected) {
        element.style.backgroundColor = Colors.grey100;
      }
    });
    element.addEventListener("mouseleave", () => {
      element.style.backgroundColor = this.props.selected
        ? "rgba(33, 150, 243, 0.12)"
        : "transparent";
    });

    return element;
  }
}

export function ListTile(props: ListTileProps): ListTileComponent {
  return new ListTileComponent(props);
}
