import { createHost } from "../core/dom";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";
import { ThemeData } from "../painting/theme";

const themeStack: ThemeData[] = [];
const themeHosts = new WeakMap<HTMLElement, ThemeData>();

export class ThemeComponent extends UIComponent {
  readonly kind = "Theme";

  constructor(readonly props: { data: ThemeData; child?: UINode }) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "contents";
    this.props.data.applyTo(element);
    themeHosts.set(element, this.props.data);
    themeStack.push(this.props.data);
    this.props.child?.mount(element);
    return element;
  }

  override unmount(): void {
    const index = themeStack.lastIndexOf(this.props.data);
    if (index >= 0) {
      themeStack.splice(index, 1);
    }
    super.unmount();
  }
}

export function Theme(props: { data: ThemeData; child?: UINode }): ThemeComponent {
  return new ThemeComponent(props);
}

export namespace Theme {
  export function of(from?: UIComponent | HTMLElement): ThemeData {
    if (from instanceof HTMLElement) {
      const host = from.closest("[data-ui=\"Theme\"]") as HTMLElement | null;
      if (host) {
        const stored = themeHosts.get(host);
        if (stored) {
          return stored;
        }
      }
    } else if (from?.host) {
      return Theme.of(from.host);
    }
    return themeStack[themeStack.length - 1] ?? ThemeData.light();
  }
}
