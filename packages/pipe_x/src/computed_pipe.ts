import type { PipeGraph } from "./graph";
import { Pipe, type AnyPipe, type PipeOptions } from "./pipe";

export interface ComputedPipeOptions<T> extends PipeOptions {
  dependencies: AnyPipe[];
  compute: () => T;
}

export class ComputedPipe<T> extends Pipe<T> {
  readonly dependencies: AnyPipe[];
  private readonly compute: () => T;
  private readonly onDep = (): void => {
    this.recompute();
  };

  constructor(options: ComputedPipeOptions<T>) {
    super(options.compute(), {
      name: options.name,
      autoDispose: options.autoDispose ?? false,
    });
    this.dependencies = options.dependencies;
    this.compute = options.compute;
    for (const dependency of this.dependencies) {
      this.linkDependency(dependency);
      dependency.addListener(this.onDep);
    }
  }

  override get value(): T {
    return super.value;
  }

  override set value(_next: T) {
    throw new Error(`Cannot set value on ComputedPipe (${this.name})`);
  }

  private recompute(): void {
    super.value = this.compute();
  }

  override dispose(): void {
    for (const dependency of this.dependencies) {
      dependency.removeListener(this.onDep);
      this.unlinkDependency(dependency);
    }
    super.dispose();
  }

  protected override graphKind(): PipeGraph["kind"] {
    return "ComputedPipe";
  }
}
