import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { ThemeData } from "../painting/theme";

export interface AppBarProps {
  title?: UIComponent;
  leading?: UIComponent;
  actions?: UIComponent[];
  backgroundColor?: string;
  foregroundColor?: string;
  elevation?: number;
  centerTitle?: boolean;
  toolbarHeight?: Dimension;
  bottom?: UIComponent;
}

export class AppBarComponent extends UIComponent {
  readonly kind = "AppBar";

  constructor(readonly props: AppBarProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return [
      this.props.leading,
      this.props.title,
      ...(this.props.actions ?? []),
      this.props.bottom,
    ].filter((child): child is UIComponent => child !== undefined);
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      backgroundColor: this.props.backgroundColor,
      foregroundColor: this.props.foregroundColor,
      elevation: this.props.elevation,
      centerTitle: this.props.centerTitle,
      toolbarHeight: this.props.toolbarHeight,
    });
  }

  createElement(): HTMLElement {
    const theme = ThemeData.light();
    const background = this.props.backgroundColor ?? theme.colorScheme.primary;
    const foreground = this.props.foregroundColor ?? theme.colorScheme.onPrimary;
    const height = this.props.toolbarHeight ?? 56;
    const elevation = this.props.elevation ?? 4;

    const element = createHost("header");
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.flexShrink = "0";
    element.style.backgroundColor = background;
    element.style.color = foreground;
    element.style.boxShadow =
      elevation > 0
        ? `0 ${Math.min(elevation, 4)}px ${8 + elevation}px rgba(15, 23, 42, 0.18)`
        : "none";
    element.style.zIndex = "4";

    const toolbar = createHost("div");
    toolbar.style.display = "flex";
    toolbar.style.alignItems = "center";
    toolbar.style.minHeight = toCssSize(height);
    toolbar.style.padding = "0 4px";
    toolbar.style.gap = "4px";
    toolbar.style.color = foreground;

    if (this.props.leading) {
      this.props.leading.mount(toolbar);
    } else {
      const spacer = createHost("div");
      spacer.style.width = "12px";
      toolbar.appendChild(spacer);
    }

    const titleWrap = createHost("div");
    titleWrap.style.flex = "1";
    titleWrap.style.minWidth = "0";
    titleWrap.style.display = "flex";
    titleWrap.style.alignItems = "center";
    titleWrap.style.justifyContent = this.props.centerTitle ? "center" : "flex-start";
    titleWrap.style.padding = "0 8px";
    titleWrap.style.color = foreground;
    if (this.props.title) {
      this.props.title.mount(titleWrap);
    }
    toolbar.appendChild(titleWrap);

    for (const action of this.props.actions ?? []) {
      action.mount(toolbar);
    }

    element.appendChild(toolbar);
    this.props.bottom?.mount(element);
    return element;
  }
}

export function AppBar(props: AppBarProps = {}): AppBarComponent {
  return new AppBarComponent(props);
}
