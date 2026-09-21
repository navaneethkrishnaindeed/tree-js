import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles } from "../core/style";
import { UIComponent } from "../core/UIComponent";
import { EdgeInsets } from "../painting/edge_insets";
import type { Dimension } from "../core/types";

export interface ListViewProps {
  children?: UIComponent[];
  padding?: EdgeInsets;
  shrinkWrap?: boolean;
  height?: Dimension;
}

export class ListViewComponent extends UIComponent {
  readonly kind = "ListView";

  constructor(readonly props: ListViewProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.children ?? [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      padding: this.props.padding,
      shrinkWrap: this.props.shrinkWrap,
      height: this.props.height,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyBoxStyles(element, {
      padding: this.props.padding,
      height: this.props.height,
    });
    element.style.display = "flex";
    element.style.flexDirection = "column";
    if (!this.props.shrinkWrap) {
      element.style.overflowY = "auto";
      element.style.flex = "1";
      element.style.minHeight = "0";
      element.style.height = element.style.height || "100%";
    }
    for (const child of this.props.children ?? []) {
      child.mount(element);
    }
    return element;
  }
}

export function ListView(props: ListViewProps = {}): ListViewComponent {
  return new ListViewComponent(props);
}
