import { createHost } from "../core/dom";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";

export interface SafeAreaProps {
  child?: UINode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export class SafeAreaComponent extends UIComponent {
  readonly kind = "SafeArea";

  constructor(readonly props: SafeAreaProps = {}) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.boxSizing = "border-box";
    if (this.props.top !== false) {
      element.style.paddingTop = "env(safe-area-inset-top)";
    }
    if (this.props.right !== false) {
      element.style.paddingRight = "env(safe-area-inset-right)";
    }
    if (this.props.bottom !== false) {
      element.style.paddingBottom = "env(safe-area-inset-bottom)";
    }
    if (this.props.left !== false) {
      element.style.paddingLeft = "env(safe-area-inset-left)";
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function SafeArea(props: SafeAreaProps = {}): SafeAreaComponent {
  return new SafeAreaComponent(props);
}
