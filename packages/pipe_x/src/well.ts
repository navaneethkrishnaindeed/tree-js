import type { Mountable } from "./mountable";
import type { AnyPipe, PipeSubscriber } from "./pipe";
import { SlotHost } from "./slot";

export interface WellProps {
  pipes: AnyPipe[];
  builder: () => Mountable;
  name?: string;
}

export class WellComponent extends SlotHost implements PipeSubscriber {
  readonly kind = "Well";
  readonly subscriberKind = "Well";

  constructor(readonly props: WellProps) {
    super();
  }

  get subscriberName(): string {
    return this.props.name ?? `Well(${this.props.pipes.map((pipe) => pipe.name).join(",")})`;
  }

  notify(): void {
    if (this.props.pipes.some((pipe) => pipe.disposed)) {
      return;
    }
    this.render();
  }

  protected override onMount(): void {
    for (const pipe of this.props.pipes) {
      pipe.attach(this);
    }
    this.render();
  }

  protected override onUnmount(): void {
    for (const pipe of this.props.pipes) {
      pipe.detach(this);
    }
  }

  protected override inspectProps(): Record<string, unknown> {
    return {
      pipes: this.props.pipes.map((pipe) => pipe.name),
      name: this.props.name,
    };
  }

  private render(): void {
    if (this.props.pipes.some((pipe) => pipe.disposed)) {
      return;
    }
    this.swapChild(this.props.builder());
  }
}

export function Well(props: WellProps): WellComponent {
  return new WellComponent(props);
}
