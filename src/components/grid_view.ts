import { createHost } from "../core/dom";
import { applyScrollbarMode } from "../core/framework_style";
import { omitUndefined } from "../core/inspect";
import type { Key } from "../core/key";
import { toCssSize, type Dimension, type UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { ScrollbarMode, type ScrollbarMode as ScrollbarModeValue } from "../painting/enums";
import type { EdgeInsets } from "../painting/edge_insets";
import { ScrollController } from "../scrolling/scroll_controller";

export interface GridViewProps {
  key?: Key;
  crossAxisCount?: number;
  children?: UINode[];
  itemCount?: number;
  itemBuilder?: (index: number) => UINode;
  crossAxisSpacing?: Dimension;
  mainAxisSpacing?: Dimension;
  childAspectRatio?: number;
  padding?: EdgeInsets;
  shrinkWrap?: boolean;
  controller?: ScrollController;
  scrollbar?: boolean | ScrollbarModeValue;
}

function showBar(value: GridViewProps["scrollbar"]): boolean {
  return value === true || value === ScrollbarMode.shown;
}

export class GridViewComponent extends UIComponent {
  readonly kind = "GridView";
  props: GridViewProps;
  private viewport?: HTMLElement;
  private inner?: HTMLElement;
  private mounted = new Map<number, UINode>();
  private observer?: ResizeObserver;

  constructor(props: GridViewProps = {}) {
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
      crossAxisCount: this.props.crossAxisCount,
      itemCount: this.props.itemCount ?? this.props.children?.length,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const columns = this.props.crossAxisCount ?? 2;
    applyScrollbarMode(element, showBar(this.props.scrollbar));
    if (this.props.padding) {
      element.style.padding = this.props.padding.toCss();
    }
    element.style.minWidth = "0";
    element.style.minHeight = "0";

    if (this.props.shrinkWrap || !this.props.itemBuilder) {
      element.style.display = "grid";
      element.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
      element.style.columnGap = toCssSize(this.props.crossAxisSpacing ?? 8);
      element.style.rowGap = toCssSize(this.props.mainAxisSpacing ?? 8);
      if (!this.props.shrinkWrap) {
        element.style.overflowY = "auto";
        element.style.flex = "1";
        element.style.height = element.style.height || "100%";
      }
      const count = this.props.itemCount ?? this.props.children?.length ?? 0;
      for (let index = 0; index < count; index++) {
        const child = this.props.itemBuilder?.(index) ?? this.props.children?.[index];
        if (!child) {
          continue;
        }
        const cell = child.mount(element);
        if (this.props.childAspectRatio) {
          cell.style.aspectRatio = String(this.props.childAspectRatio);
        }
        this.mounted.set(index, child);
      }
      this.viewport = element;
      this.props.controller?.attach(element);
      return element;
    }

    element.style.overflowY = "auto";
    element.style.overflowX = "hidden";
    element.style.flex = "1";
    element.style.height = "100%";
    const inner = createHost("div");
    inner.style.position = "relative";
    inner.style.width = "100%";
    element.appendChild(inner);
    this.viewport = element;
    this.inner = inner;
    this.props.controller?.attach(element);
    element.addEventListener("scroll", () => this.syncWindow(), { passive: true });
    this.observer = new ResizeObserver(() => this.syncWindow());
    this.observer.observe(element);
    queueMicrotask(() => this.syncWindow());
    return element;
  }

  override unmount(): void {
    this.observer?.disconnect();
    this.props.controller?.detach();
    for (const child of this.mounted.values()) {
      try {
        child.unmount();
      } catch {
        // ignore
      }
    }
    this.mounted.clear();
    super.unmount();
  }

  private syncWindow(): void {
    const viewport = this.viewport;
    const inner = this.inner;
    if (!viewport || !inner || !this.props.itemBuilder) {
      return;
    }
    const columns = this.props.crossAxisCount ?? 2;
    const count = this.props.itemCount ?? 0;
    const gap = typeof this.props.crossAxisSpacing === "number" ? this.props.crossAxisSpacing : 8;
    const rowGap = typeof this.props.mainAxisSpacing === "number" ? this.props.mainAxisSpacing : 8;
    const width = viewport.clientWidth;
    const colW = Math.max(1, (width - gap * (columns - 1)) / columns);
    const ratio = this.props.childAspectRatio ?? 1;
    const rowH = colW / ratio;
    const rows = Math.ceil(count / columns);
    const total = rows * rowH + Math.max(0, rows - 1) * rowGap;
    inner.style.height = `${total}px`;
    const scroll = viewport.scrollTop;
    const startRow = Math.max(0, Math.floor(scroll / (rowH + rowGap)) - 1);
    const endRow = Math.min(rows, Math.ceil((scroll + viewport.clientHeight) / (rowH + rowGap)) + 1);
    const start = startRow * columns;
    const end = Math.min(count, endRow * columns);

    for (const [index, node] of this.mounted) {
      if (index < start || index >= end) {
        node.unmount();
        this.mounted.delete(index);
      }
    }
    for (let index = start; index < end; index++) {
      if (this.mounted.has(index)) {
        continue;
      }
      const child = this.props.itemBuilder(index);
      const host = child.mount(inner);
      const col = index % columns;
      const row = Math.floor(index / columns);
      host.style.position = "absolute";
      host.style.width = `${colW}px`;
      host.style.height = `${rowH}px`;
      host.style.left = `${col * (colW + gap)}px`;
      host.style.top = `${row * (rowH + rowGap)}px`;
      this.mounted.set(index, child);
    }
  }
}

export function GridView(props: GridViewProps = {}): GridViewComponent {
  return new GridViewComponent(props);
}

export namespace GridView {
  export function count(props: GridViewProps & { crossAxisCount: number }): GridViewComponent {
    return GridView(props);
  }

  export function builder(
    props: GridViewProps & { itemCount: number; itemBuilder: (index: number) => UINode; crossAxisCount: number },
  ): GridViewComponent {
    return GridView(props);
  }
}
