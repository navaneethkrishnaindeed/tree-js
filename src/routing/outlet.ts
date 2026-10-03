import { createHost } from "../core/dom";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";

/**
 * Slot in a layout route where the matched child page mounts.
 *
 * A `Route` with both `builder` and `routes` is a layout. Its builder must
 * include `Outlet()` so the Router can swap the leaf without remounting chrome.
 */
export class OutletComponent extends UIComponent {
  readonly kind = "Outlet";
  private child?: UINode;

  override childNodes(): UINode[] {
    return this.child ? [this.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.width = "100%";
    return element;
  }

  setPage(page?: UINode): void {
    const previous = this.child;
    this.child = undefined;
    try {
      previous?.unmount();
    } catch (error) {
      console.error("Outlet failed to unmount page", error);
    }
    this.host?.replaceChildren();
    this.child = page;
    if (page && this.host) {
      page.mount(this.host);
    }
  }

  override unmount(): void {
    this.setPage(undefined);
    super.unmount();
  }
}

export function Outlet(): OutletComponent {
  return new OutletComponent();
}

/**
 * Walk a layout tree that already exists at construction time.
 * `HubProvider` / `Sink` / `Well` only grow children on mount, so `Outlet()`
 * must be a constructor-time descendant of the layout builder's return value.
 */
export function findOutlet(node: UINode): OutletComponent | undefined {
  if (node instanceof OutletComponent) {
    return node;
  }
  for (const child of node.childNodes()) {
    const found = findOutlet(child);
    if (found) {
      return found;
    }
  }
  return undefined;
}
