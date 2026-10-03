export interface ScrollPosition {
  pixels: number;
  minScrollExtent: number;
  maxScrollExtent: number;
  viewportDimension: number;
  axis: "horizontal" | "vertical";
}

type ScrollListener = (position: ScrollPosition) => void;

class ScrollControllerImpl {
  offset = 0;
  private element?: HTMLElement;
  private readonly listeners: ScrollListener[] = [];
  private readonly onDomScroll = (): void => {
    this.syncFromElement();
  };

  attach(element: HTMLElement): void {
    this.detach();
    this.element = element;
    element.addEventListener("scroll", this.onDomScroll, { passive: true });
    this.syncFromElement();
  }

  detach(): void {
    this.element?.removeEventListener("scroll", this.onDomScroll);
    this.element = undefined;
  }

  addListener(listener: ScrollListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: ScrollListener): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  jumpTo(offset: number): void {
    if (!this.element) {
      this.offset = offset;
      return;
    }
    if (this.element.scrollHeight > this.element.clientHeight) {
      this.element.scrollTop = offset;
    } else {
      this.element.scrollLeft = offset;
    }
    this.syncFromElement();
  }

  animateTo(offset: number): void {
    if (!this.element) {
      this.offset = offset;
      return;
    }
    const vertical = this.element.scrollHeight > this.element.clientHeight;
    this.element.scrollTo({
      top: vertical ? offset : this.element.scrollTop,
      left: vertical ? this.element.scrollLeft : offset,
      behavior: "smooth",
    });
  }

  get position(): ScrollPosition {
    return this.readPosition();
  }

  private syncFromElement(): void {
    const next = this.readPosition();
    this.offset = next.pixels;
    for (const listener of this.listeners) {
      listener(next);
    }
    this.element?.dispatchEvent(
      new CustomEvent("ui-scroll", { bubbles: true, detail: next }),
    );
  }

  private readPosition(): ScrollPosition {
    const element = this.element;
    if (!element) {
      return {
        pixels: this.offset,
        minScrollExtent: 0,
        maxScrollExtent: 0,
        viewportDimension: 0,
        axis: "vertical",
      };
    }
    const vertical = element.scrollHeight - element.clientHeight >= element.scrollWidth - element.clientWidth;
    return {
      pixels: vertical ? element.scrollTop : element.scrollLeft,
      minScrollExtent: 0,
      maxScrollExtent: Math.max(
        0,
        vertical
          ? element.scrollHeight - element.clientHeight
          : element.scrollWidth - element.clientWidth,
      ),
      viewportDimension: vertical ? element.clientHeight : element.clientWidth,
      axis: vertical ? "vertical" : "horizontal",
    };
  }
}

export type ScrollController = ScrollControllerImpl;

export function ScrollController(): ScrollController {
  return new ScrollControllerImpl();
}
