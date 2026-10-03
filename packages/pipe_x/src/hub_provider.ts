import type { Hub } from "./hub";
import type { Mountable } from "./mountable";
import { provideHub, unprovideHub } from "./read";
import { HubRuntime, type HubScope } from "./runtime";
import { SlotHost } from "./slot";

export interface HubProviderProps<T extends Hub> {
  create?: () => T;
  value?: T;
  scope?: HubScope;
  child: (hub: T) => Mountable;
}

export class HubProviderComponent<T extends Hub> extends SlotHost {
  readonly kind = "HubProvider";
  private hub?: T;
  private scope: HubScope = "local";
  private ownsHub = false;

  constructor(readonly props: HubProviderProps<T>) {
    super();
  }

  protected override onMount(): void {
    this.scope = this.props.scope ?? "local";
    if (this.props.value) {
      this.hub = this.props.value;
      this.ownsHub = false;
    } else if (this.props.create) {
      this.hub = HubRuntime.obtain(this.props.create, this.scope);
      this.ownsHub = this.scope === "local";
    } else {
      throw new Error("HubProvider requires create() or value");
    }
    provideHub(this.hub);
    this.swapChild(this.props.child(this.hub));
  }

  protected override onUnmount(): void {
    if (!this.hub) {
      return;
    }
    unprovideHub(this.hub);
    if (this.ownsHub) {
      HubRuntime.release(this.hub, this.scope);
    }
    this.hub = undefined;
    this.ownsHub = false;
  }

  protected override inspectProps(): Record<string, unknown> {
    return { hub: this.hub?.name, scope: this.scope };
  }
}

export function HubProvider<T extends Hub>(
  props: HubProviderProps<T>,
): HubProviderComponent<T> {
  return new HubProviderComponent(props);
}

HubProvider.value = function value<T extends Hub>(props: {
  value: T;
  child: (hub: T) => Mountable;
  scope?: HubScope;
}): HubProviderComponent<T> {
  return new HubProviderComponent({
    value: props.value,
    child: props.child,
    scope: props.scope,
  });
};

export interface MultiHubProviderProps {
  hubs: Array<Hub | (() => Hub)>;
  child: () => Mountable;
}

export class MultiHubProviderComponent extends SlotHost {
  readonly kind = "MultiHubProvider";
  private readonly instances: Hub[] = [];
  private readonly created: Hub[] = [];

  constructor(readonly props: MultiHubProviderProps) {
    super();
  }

  protected override onMount(): void {
    for (const entry of this.props.hubs) {
      if (typeof entry === "function") {
        const hub = HubRuntime.obtain(entry, "local");
        this.instances.push(hub);
        this.created.push(hub);
      } else {
        this.instances.push(entry);
      }
    }
    for (const hub of this.instances) {
      provideHub(hub);
    }
    this.swapChild(this.props.child());
  }

  protected override onUnmount(): void {
    for (const hub of this.instances) {
      unprovideHub(hub);
    }
    for (const hub of this.created) {
      HubRuntime.release(hub, "local");
    }
    this.instances.length = 0;
    this.created.length = 0;
  }

  protected override inspectProps(): Record<string, unknown> {
    return { hubs: this.instances.map((hub) => hub.name) };
  }
}

export function MultiHubProvider(
  props: MultiHubProviderProps,
): MultiHubProviderComponent {
  return new MultiHubProviderComponent(props);
}
