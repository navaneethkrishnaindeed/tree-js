import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import {
  FloatingActionButtonLocation,
  type FloatingActionButtonLocation as FabLocation,
} from "../layout/fab_location";
import { ThemeData } from "../painting/theme";
import { Icon } from "../components/icon";
import { IconButton } from "../components/icon_button";
import { Icons } from "../painting/icons";
import { AppBar, AppBarComponent } from "./app_bar";

export interface ScaffoldProps {
  appBar?: UIComponent;
  body?: UIComponent;
  floatingActionButton?: UIComponent;
  floatingActionButtonLocation?: FabLocation;
  drawer?: UIComponent;
  endDrawer?: UIComponent;
  bottomNavigationBar?: UIComponent;
  backgroundColor?: string;
  theme?: ThemeData;
}

export class ScaffoldComponent extends UIComponent {
  readonly kind = "Scaffold";

  constructor(readonly props: ScaffoldProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return [
      this.props.appBar,
      this.props.body,
      this.props.floatingActionButton,
      this.props.drawer,
      this.props.endDrawer,
      this.props.bottomNavigationBar,
    ].filter((child): child is UIComponent => child !== undefined);
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      floatingActionButtonLocation: this.props.floatingActionButtonLocation,
      backgroundColor: this.props.backgroundColor,
      theme: this.props.theme,
    });
  }

  createElement(): HTMLElement {
    const theme = this.props.theme ?? ThemeData.light();
    const element = createHost("div");
    theme.applyTo(element);
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.minHeight = "100vh";
    element.style.position = "relative";
    element.style.backgroundColor =
      this.props.backgroundColor ?? theme.colorScheme.background;
    element.style.color = theme.colorScheme.onBackground;
    element.style.overflow = "hidden";

    const content = createHost("div");
    content.style.flex = "1";
    content.style.minHeight = "0";
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.position = "relative";

    let openDrawer: (() => void) | undefined;

    const mountDrawer = (
      drawer: UIComponent,
      side: "start" | "end",
    ): { open: () => void } => {
      const scrim = createHost("div");
      scrim.style.position = "absolute";
      scrim.style.inset = "0";
      scrim.style.backgroundColor = "rgba(15, 23, 42, 0.45)";
      scrim.style.opacity = "0";
      scrim.style.pointerEvents = "none";
      scrim.style.transition = "opacity 200ms ease";
      scrim.style.zIndex = "20";

      const panel = drawer.mount(element);
      panel.style.position = "absolute";
      panel.style.top = "0";
      panel.style.bottom = "0";
      panel.style[side === "start" ? "left" : "right"] = "0";
      panel.style.zIndex = "21";
      panel.style.transition = "transform 200ms ease";
      panel.style.transform =
        side === "start" ? "translateX(-105%)" : "translateX(105%)";

      const open = (): void => {
        panel.style.transform = "translateX(0)";
        scrim.style.opacity = "1";
        scrim.style.pointerEvents = "auto";
      };
      const close = (): void => {
        panel.style.transform =
          side === "start" ? "translateX(-105%)" : "translateX(105%)";
        scrim.style.opacity = "0";
        scrim.style.pointerEvents = "none";
      };

      scrim.addEventListener("click", close);
      panel.addEventListener("click", (event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('[data-ui="ListTile"]')) {
          close();
        }
      });
      element.appendChild(scrim);
      return { open };
    };

    const appBar = this.resolveAppBar(() => openDrawer?.());
    appBar?.mount(element);

    const bodySlot = createHost("main");
    bodySlot.style.flex = "1";
    bodySlot.style.minHeight = "0";
    bodySlot.style.overflow = "auto";
    bodySlot.style.position = "relative";
    this.props.body?.mount(bodySlot);
    content.appendChild(bodySlot);
    element.appendChild(content);

    this.props.bottomNavigationBar?.mount(element);

    if (this.props.drawer) {
      openDrawer = mountDrawer(this.props.drawer, "start").open;
    }
    if (this.props.endDrawer) {
      mountDrawer(this.props.endDrawer, "end");
    }

    if (this.props.floatingActionButton) {
      const fab = this.props.floatingActionButton.mount(element);
      fab.style.position = "absolute";
      fab.style.zIndex = "6";
      this.applyFabLocation(
        fab,
        this.props.floatingActionButtonLocation ?? FloatingActionButtonLocation.endFloat,
        Boolean(this.props.bottomNavigationBar),
      );
    }

    return element;
  }

  private resolveAppBar(openDrawer?: () => void): UIComponent | undefined {
    const appBar = this.props.appBar;
    if (!appBar) {
      return undefined;
    }
    if (!(appBar instanceof AppBarComponent)) {
      return appBar;
    }
    if (appBar.props.leading || !this.props.drawer || !openDrawer) {
      return appBar;
    }
    return AppBar({
      ...appBar.props,
      leading: IconButton({
        icon: Icon({
          icon: Icons.menu,
          color: appBar.props.foregroundColor ?? ThemeData.light().colorScheme.onPrimary,
        }),
        color: appBar.props.foregroundColor ?? ThemeData.light().colorScheme.onPrimary,
        tooltip: "Open navigation",
        onPressed: openDrawer,
      }),
    });
  }

  private applyFabLocation(
    fab: HTMLElement,
    location: FabLocation,
    hasBottomNav: boolean,
  ): void {
    const floatOffset = hasBottomNav ? "88px" : "16px";
    const dockOffset = hasBottomNav ? "28px" : "16px";

    fab.style.left = "auto";
    fab.style.right = "auto";
    fab.style.bottom = floatOffset;
    fab.style.transform = "none";

    switch (location) {
      case FloatingActionButtonLocation.startFloat:
        fab.style.left = "16px";
        break;
      case FloatingActionButtonLocation.centerFloat:
        fab.style.left = "50%";
        fab.style.transform = "translateX(-50%)";
        break;
      case FloatingActionButtonLocation.endDocked:
        fab.style.right = "16px";
        fab.style.bottom = dockOffset;
        break;
      case FloatingActionButtonLocation.centerDocked:
        fab.style.left = "50%";
        fab.style.transform = "translateX(-50%)";
        fab.style.bottom = dockOffset;
        break;
      default:
        fab.style.right = "16px";
        break;
    }
  }
}

export function Scaffold(props: ScaffoldProps = {}): ScaffoldComponent {
  return new ScaffoldComponent(props);
}
