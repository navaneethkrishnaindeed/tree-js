import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";
import type { ScrollPosition } from "./scroll_controller";

export type ScrollNotification = ScrollPosition;

export class NotificationListenerComponent extends UIComponent {
  readonly kind = "NotificationListener";

  constructor(
    readonly props: {
      onNotification?: (notification: ScrollNotification) => boolean | void;
      child?: UINode;
    },
  ) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ onNotification: this.props.onNotification });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "contents";
    const handler = (event: Event): void => {
      const custom = event as CustomEvent<ScrollNotification>;
      if (!custom.detail) {
        return;
      }
      const stop = this.props.onNotification?.(custom.detail);
      if (stop) {
        event.stopPropagation();
      }
    };
    element.addEventListener("ui-scroll", handler);
    this.props.child?.mount(element);
    return element;
  }
}

export function NotificationListener(props: {
  onNotification?: (notification: ScrollNotification) => boolean | void;
  child?: UINode;
}): NotificationListenerComponent {
  return new NotificationListenerComponent(props);
}
