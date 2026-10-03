import type { Mountable } from "./mountable";
import type { Pipe, PipeSubscriber } from "./pipe";
import { SlotHost } from "./slot";

export interface SinkProps<T> {
  pipe: Pipe<T>;
  builder: (value: T) => Mountable;
  name?: string;
}

export class SinkComponent<T> extends SlotHost implements PipeSubscriber {
  readonly kind = "Sink";
  readonly subscriberKind = "Sink";

  constructor(readonly props: SinkProps<T>) {
    super();
  }

  get subscriberName(): string {
    return this.props.name ?? `Sink(${this.props.pipe.name})`;
  }

  notify(): void {
    if (this.props.pipe.disposed) {
      return;
    }
    this.render();
  }

  protected override onMount(): void {
    this.props.pipe.attach(this);
    this.render();
  }

  protected override onUnmount(): void {
    this.props.pipe.detach(this);
  }

  protected override inspectProps(): Record<string, unknown> {
    return { pipe: this.props.pipe.name, name: this.props.name };
  }

  private render(): void {
    if (this.props.pipe.disposed) {
      return;
    }
    this.swapChild(this.props.builder(this.props.pipe.value));
  }
}

export function Sink<T>(props: SinkProps<T>): SinkComponent<T> {
  return new SinkComponent(props);
}
