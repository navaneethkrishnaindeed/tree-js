import { createHost } from "../core/dom";
import { applyScrollbarMode } from "../core/framework_style";
import { applyBoxStyles } from "../core/style";
import type { Dimension, UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Axis, ScrollbarMode, type ScrollbarMode as ScrollbarModeValue } from "../painting/enums";
import type { EdgeInsets } from "../painting/edge_insets";
import { ScrollController } from "../scrolling/scroll_controller";

export interface SingleChildScrollViewProps {
  child?: UINode;
  scrollDirection?: Axis;
  padding?: EdgeInsets;
  controller?: ScrollController;
  scrollbar?: boolean | ScrollbarModeValue;
  height?: Dimension;
  width?: Dimension;
}

export class SingleChildScrollViewComponent extends UIComponent {
  readonly kind = "SingleChildScrollView";

  constructor(readonly props: SingleChildScrollViewProps = {}) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const horizontal = this.props.scrollDirection === Axis.horizontal;
    const element = createHost("div");
    applyBoxStyles(element, {
      padding: this.props.padding,
      height: this.props.height,
      width: this.props.width,
    });
    element.style.overflowX = horizontal ? "auto" : "hidden";
    element.style.overflowY = horizontal ? "hidden" : "auto";
    element.style.minWidth = "0";
    element.style.minHeight = "0";
    if (!horizontal && this.props.height === undefined) {
      element.style.height = "100%";
    }
    applyScrollbarMode(
      element,
      this.props.scrollbar === true || this.props.scrollbar === ScrollbarMode.shown,
    );
    this.props.controller?.attach(element);
    this.props.child?.mount(element);
    return element;
  }

  override unmount(): void {
    this.props.controller?.detach();
    super.unmount();
  }
}

export function SingleChildScrollView(props: SingleChildScrollViewProps = {}): SingleChildScrollViewComponent {
  return new SingleChildScrollViewComponent(props);
}
