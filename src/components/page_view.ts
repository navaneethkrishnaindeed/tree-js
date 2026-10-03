import { createHost } from "../core/dom";
import { applyScrollbarMode } from "../core/framework_style";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { ScrollbarMode, type ScrollbarMode as ScrollbarModeValue } from "../painting/enums";
import { ScrollController } from "../scrolling/scroll_controller";

export interface PageViewProps {
  children?: UIComponent[];
  height?: Dimension;
  onPageChanged?: (index: number) => void;
  controller?: ScrollController;
  viewportFraction?: number;
  scrollbar?: boolean | ScrollbarModeValue;
}

export class PageViewComponent extends UIComponent {
  readonly kind = "PageView";

  constructor(readonly props: PageViewProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.children ?? [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      height: this.props.height,
      viewportFraction: this.props.viewportFraction,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "flex";
    element.style.overflowX = "auto";
    element.style.overflowY = "hidden";
    element.style.scrollSnapType = "x mandatory";
    element.style.scrollBehavior = "smooth";
    applyScrollbarMode(
      element,
      this.props.scrollbar === true || this.props.scrollbar === ScrollbarMode.shown,
    );
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    const fraction = this.props.viewportFraction ?? 1;
    const pages = this.props.children ?? [];
    pages.forEach((child) => {
      const page = createHost("div");
      page.style.minWidth = `${fraction * 100}%`;
      page.style.scrollSnapAlign = "start";
      page.style.flexShrink = "0";
      child.mount(page);
      element.appendChild(page);
    });
    this.props.controller?.attach(element);
    if (this.props.onPageChanged) {
      element.addEventListener("scroll", () => {
        const index = Math.round(element.scrollLeft / Math.max(element.clientWidth * fraction, 1));
        this.props.onPageChanged?.(index);
      });
    }
    return element;
  }

  override unmount(): void {
    this.props.controller?.detach();
    super.unmount();
  }
}

export function PageView(props: PageViewProps = {}): PageViewComponent {
  return new PageViewComponent(props);
}
