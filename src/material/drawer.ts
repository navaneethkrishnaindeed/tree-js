import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { ThemeData } from "../painting/theme";

export interface DrawerProps {
  child?: UIComponent;
  width?: Dimension;
  backgroundColor?: string;
  elevation?: number;
}

export class DrawerComponent extends UIComponent {
  readonly kind = "Drawer";

  constructor(readonly props: DrawerProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      width: this.props.width,
      backgroundColor: this.props.backgroundColor,
      elevation: this.props.elevation,
    });
  }

  createElement(): HTMLElement {
    const theme = ThemeData.light();
    const element = createHost("aside");
    element.style.width = toCssSize(this.props.width ?? 304);
    element.style.maxWidth = "85vw";
    element.style.height = "100%";
    element.style.backgroundColor =
      this.props.backgroundColor ?? theme.colorScheme.surface;
    element.style.boxShadow =
      (this.props.elevation ?? 16) > 0
        ? "4px 0 24px rgba(15, 23, 42, 0.2)"
        : "none";
    element.style.overflowY = "auto";
    element.style.display = "flex";
    element.style.flexDirection = "column";
    this.props.child?.mount(element);
    return element;
  }
}

export function Drawer(props: DrawerProps = {}): DrawerComponent {
  return new DrawerComponent(props);
}

export interface DrawerHeaderProps {
  child?: UIComponent;
  decoration?: { color?: string };
}

export class DrawerHeaderComponent extends UIComponent {
  readonly kind = "DrawerHeader";

  constructor(readonly props: DrawerHeaderProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      color: this.props.decoration?.color,
    });
  }

  createElement(): HTMLElement {
    const theme = ThemeData.light();
    const element = createHost("div");
    element.style.padding = "16px";
    element.style.minHeight = "160px";
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.justifyContent = "flex-end";
    element.style.backgroundColor =
      this.props.decoration?.color ?? theme.colorScheme.primary;
    element.style.color = theme.colorScheme.onPrimary;
    this.props.child?.mount(element);
    return element;
  }
}

export function DrawerHeader(props: DrawerHeaderProps = {}): DrawerHeaderComponent {
  return new DrawerHeaderComponent(props);
}
