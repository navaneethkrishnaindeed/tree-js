import type { Hub } from "./hub";
import type { Mountable } from "./mountable";
import { read, type HubConstructor } from "./read";
import { SlotHost } from "./slot";

export interface HubListenerProps<T extends Hub> {
  type?: HubConstructor<T>;
  hub?: T;
  listenWhen: (hub: T) => boolean;
  onConditionMet: () => void;
  child: Mountable;
}

export class HubListenerComponent<T extends Hub> extends SlotHost {
  readonly kind = "HubListener";
  private remove?: () => void;
  private previous = false;

  constructor(readonly props: HubListenerProps<T>) {
    super();
  }

  protected override onMount(): void {
    const hub = this.resolveHub();
    this.previous = this.props.listenWhen(hub);
    this.remove = hub.addListener(() => {
      const matched = this.props.listenWhen(hub);
      if (matched && !this.previous) {
        this.props.onConditionMet();
      }
      this.previous = matched;
    });
    this.swapChild(this.props.child);
  }

  protected override onUnmount(): void {
    this.remove?.();
    this.remove = undefined;
  }

  protected override inspectProps(): Record<string, unknown> {
    return { hub: this.resolveHubSafe() };
  }

  private resolveHub(): T {
    if (this.props.hub) {
      return this.props.hub;
    }
    if (this.props.type) {
      return read(this.props.type);
    }
    throw new Error("HubListener requires hub or type");
  }

  private resolveHubSafe(): string | undefined {
    try {
      return this.resolveHub().name;
    } catch {
      return undefined;
    }
  }
}

export function HubListener<T extends Hub>(
  props: HubListenerProps<T>,
): HubListenerComponent<T> {
  return new HubListenerComponent(props);
}
