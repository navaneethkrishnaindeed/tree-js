import { createHost } from "../core/dom";
import { applyScrollbarMode } from "../core/framework_style";
import { omitUndefined } from "../core/inspect";
import type { Key } from "../core/key";
import { applyBoxStyles } from "../core/style";
import type { Dimension, UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Axis, ScrollbarMode, type ScrollbarMode as ScrollbarModeValue } from "../painting/enums";
import { EdgeInsets } from "../painting/edge_insets";
import { ScrollController } from "../scrolling/scroll_controller";

export interface ListViewProps {
  key?: Key;
  children?: UINode[];
  itemCount?: number;
  itemBuilder?: (index: number) => UINode;
  separatorBuilder?: (index: number) => UINode;
  scrollDirection?: Axis;
  padding?: EdgeInsets;
  shrinkWrap?: boolean;
  height?: Dimension;
  width?: Dimension;
  itemExtent?: number;
  cacheExtent?: number;
  controller?: ScrollController;
  scrollbar?: boolean | ScrollbarModeValue;
}

function showScrollbar(value: ListViewProps["scrollbar"]): boolean {
  return value === true || value === ScrollbarMode.shown;
}

export class ListViewComponent extends UIComponent {
  readonly kind = "ListView";
  props: ListViewProps;
  private viewport?: HTMLElement;
  private inner?: HTMLElement;
  private mounted = new Map<number, UINode>();

  constructor(props: ListViewProps = {}) {
    super();
    this.props = props;
    this.key = props.key;
  }

  override childNodes(): UINode[] {
    if (this.props.itemBuilder) {
      return [...this.mounted.values()];
    }
    return this.props.children ?? [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      itemCount: this.props.itemCount ?? this.props.children?.length,
      scrollDirection: this.props.scrollDirection,
      shrinkWrap: this.props.shrinkWrap,
      itemExtent: this.props.itemExtent,
      scrollbar: this.props.scrollbar,
    });
  }

  private observer?: ResizeObserver;

  createElement(): HTMLElement {
    const horizontal = this.props.scrollDirection === Axis.horizontal;
    const element = createHost("div");
    applyBoxStyles(element, {
      padding: this.props.padding,
      height: this.props.height,
      width: this.props.width,
    });
    element.style.display = "flex";
    element.style.flexDirection = horizontal ? "row" : "column";
    element.style.alignItems = "stretch";
    applyScrollbarMode(element, showScrollbar(this.props.scrollbar));

    if (this.props.shrinkWrap) {
      element.style.overflow = "visible";
      this.mountAll(element, horizontal);
      this.viewport = element;
      return element;
    }

    element.style.overflowX = horizontal ? "auto" : "hidden";
    element.style.overflowY = horizontal ? "hidden" : "auto";
    element.style.minWidth = "0";
    element.style.minHeight = "0";
    if (horizontal) {
      element.style.flex = this.props.height === undefined ? "1" : "0 0 auto";
      if (!this.props.width) {
        element.style.width = "100%";
      }
    } else {
      element.style.flex = this.props.height === undefined ? "1" : "0 0 auto";
      if (!this.props.height) {
        element.style.height = "100%";
      }
    }

    const inner = createHost("div");
    inner.style.display = "flex";
    inner.style.flexDirection = horizontal ? "row" : "column";
    inner.style.position = "relative";
    inner.style.flex = "0 0 auto";
    element.appendChild(inner);

    this.viewport = element;
    this.inner = inner;
    this.props.controller?.attach(element);
    element.addEventListener("scroll", () => this.syncWindow(), { passive: true });
    this.observer = new ResizeObserver(() => this.syncWindow());
    this.observer.observe(element);

    if (this.windowed()) {
      queueMicrotask(() => this.syncWindow());
    } else {
      this.mountAll(inner, horizontal);
    }
    return element;
  }

  override unmount(): void {
    this.observer?.disconnect();
    this.props.controller?.detach();
    this.clearMounted();
    super.unmount();
  }

  private count(): number {
    return this.props.itemCount ?? this.props.children?.length ?? 0;
  }

  private windowed(): boolean {
    return this.props.itemExtent !== undefined && !this.props.separatorBuilder;
  }

  private itemAt(index: number): UINode | undefined {
    if (this.props.itemBuilder) {
      const child = this.props.itemBuilder(index);
      child.key = child.key ?? index;
      return child;
    }
    return this.props.children?.[index];
  }

  private mountAll(parent: HTMLElement, horizontal: boolean): void {
    const count = this.count();
    for (let index = 0; index < count; index++) {
      const item = this.itemAt(index);
      if (!item) {
        continue;
      }
      const host = item.mount(parent);
      host.style.flex = "0 0 auto";
      if (this.props.itemExtent !== undefined) {
        if (horizontal) {
          host.style.width = `${this.props.itemExtent}px`;
        } else {
          host.style.height = `${this.props.itemExtent}px`;
        }
      }
      this.mounted.set(index, item);
      if (this.props.separatorBuilder && index < count - 1) {
        this.props.separatorBuilder(index).mount(parent);
      }
    }
  }

  private clearMounted(): void {
    for (const child of this.mounted.values()) {
      try {
        child.unmount();
      } catch {
        // ignore
      }
    }
    this.mounted.clear();
  }

  private syncWindow(): void {
    const viewport = this.viewport;
    const inner = this.inner;
    const extent = this.props.itemExtent;
    if (!viewport || !inner || extent === undefined) {
      return;
    }
    const horizontal = this.props.scrollDirection === Axis.horizontal;
    const count = this.count();
    const cache = this.props.cacheExtent ?? extent * 2;
    const scroll = horizontal ? viewport.scrollLeft : viewport.scrollTop;
    const size = horizontal ? viewport.clientWidth : viewport.clientHeight;
    const start = Math.max(0, Math.floor((scroll - cache) / extent));
    const end = Math.min(count, Math.ceil((scroll + size + cache) / extent));
    const total = count * extent;
    if (horizontal) {
      inner.style.width = `${total}px`;
      inner.style.height = "100%";
    } else {
      inner.style.height = `${total}px`;
      inner.style.width = "100%";
    }

    for (const [index, node] of this.mounted) {
      if (index < start || index >= end) {
        node.unmount();
        this.mounted.delete(index);
      }
    }

    inner.style.paddingTop = "0";
    inner.style.paddingLeft = "0";

    for (let index = start; index < end; index++) {
      if (this.mounted.has(index)) {
        continue;
      }
      const item = this.itemAt(index);
      if (!item) {
        continue;
      }
      const host = item.mount(inner);
      host.style.position = "absolute";
      host.style.flex = "0 0 auto";
      if (horizontal) {
        host.style.width = `${extent}px`;
        host.style.height = "100%";
        host.style.left = `${index * extent}px`;
        host.style.top = "0";
      } else {
        host.style.height = `${extent}px`;
        host.style.width = "100%";
        host.style.top = `${index * extent}px`;
        host.style.left = "0";
      }
      this.mounted.set(index, item);
    }
  }
}

export function ListView(props: ListViewProps = {}): ListViewComponent {
  return new ListViewComponent(props);
}

export namespace ListView {
  export function builder(props: ListViewProps & { itemCount: number; itemBuilder: (index: number) => UINode }): ListViewComponent {
    return ListView(props);
  }

  export function separated(
    props: ListViewProps & {
      itemCount: number;
      itemBuilder: (index: number) => UINode;
      separatorBuilder: (index: number) => UINode;
    },
  ): ListViewComponent {
    return ListView(props);
  }
}
