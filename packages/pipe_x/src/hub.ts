import { AsyncPipe, type AsyncPipeOptions } from "./async";
import { ComputedPipe } from "./computed_pipe";
import { formatHubGraph, type HubGraph } from "./graph";
import { Pipe, type AnyPipe, type PipeOptions } from "./pipe";
import { PipeXDev } from "./registry";

export interface HubPipeOptions {
  key?: string;
}

export abstract class Hub {
  private _disposed = false;
  private readonly pipes = new Map<string, AnyPipe>();
  private autoKey = 0;
  private readonly hubListeners: Array<() => void> = [];
  private readonly listenerCleanups = new Map<() => void, Array<() => void>>();

  constructor() {
    PipeXDev.registerHub(this);
  }

  get disposed(): boolean {
    return this._disposed;
  }

  get name(): string {
    return this.constructor.name;
  }

  get subscriberCount(): number {
    let total = 0;
    for (const pipe of this.pipes.values()) {
      total += pipe.subscriberCount;
    }
    return total;
  }

  pipe<T>(initialValue: T, options: HubPipeOptions = {}): Pipe<T> {
    this.checkNotDisposed();
    const created = new Pipe(initialValue, {
      name: options.key,
      autoDispose: false,
    });
    return this.registerPipe(created, options.key);
  }

  computedPipe<T>(options: {
    dependencies: AnyPipe[];
    compute: () => T;
    key?: string;
  }): ComputedPipe<T> {
    this.checkNotDisposed();
    const created = new ComputedPipe({
      dependencies: options.dependencies,
      compute: options.compute,
      name: options.key,
      autoDispose: false,
    });
    return this.registerPipe(created, options.key);
  }

  asyncPipe<T>(
    factory: () => Promise<T>,
    options: AsyncPipeOptions & HubPipeOptions = {},
  ): AsyncPipe<T> {
    this.checkNotDisposed();
    const { key, ...pipeOptions } = options;
    const created = new AsyncPipe(factory, {
      ...pipeOptions,
      name: key ?? pipeOptions.name,
      autoDispose: false,
    });
    return this.registerPipe(created, key);
  }

  asyncPipeWithInitial<T>(
    initialValue: T,
    factory: () => Promise<T>,
    options: PipeOptions & HubPipeOptions = {},
  ): AsyncPipe<T> {
    this.checkNotDisposed();
    const created = AsyncPipe.withInitialValue(initialValue, factory, {
      name: options.key ?? options.name,
      autoDispose: false,
    });
    return this.registerPipe(created, options.key);
  }

  registerPipe<P extends AnyPipe>(pipe: P, key?: string): P {
    this.checkNotDisposed();
    if (pipe.disposed) {
      throw new Error("Cannot register a disposed Pipe on a Hub");
    }
    const pipeKey = key ?? `_auto_${this.autoKey++}`;
    this.pipes.set(pipeKey, pipe);
    pipe.markHubOwned(this.name);
    for (const listener of this.hubListeners) {
      const bound = (): void => {
        listener();
      };
      pipe.addListener(bound);
      const cleanups = this.listenerCleanups.get(listener) ?? [];
      cleanups.push(() => pipe.removeListener(bound));
      this.listenerCleanups.set(listener, cleanups);
    }
    return pipe;
  }

  addListener(callback: () => void): () => void {
    if (this._disposed) {
      return () => {};
    }
    this.hubListeners.push(callback);
    const cleanups: Array<() => void> = [];
    for (const pipe of this.pipes.values()) {
      const bound = (): void => {
        callback();
      };
      pipe.addListener(bound);
      cleanups.push(() => pipe.removeListener(bound));
    }
    this.listenerCleanups.set(callback, cleanups);
    return () => {
      const index = this.hubListeners.indexOf(callback);
      if (index >= 0) {
        this.hubListeners.splice(index, 1);
      }
      for (const cleanup of this.listenerCleanups.get(callback) ?? []) {
        cleanup();
      }
      this.listenerCleanups.delete(callback);
    };
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    PipeXDev.unregisterHub(this);
    for (const pipe of this.pipes.values()) {
      pipe.dispose();
    }
    this.pipes.clear();
    this.hubListeners.length = 0;
    this.listenerCleanups.clear();
    this.onDispose();
  }

  toGraph(): HubGraph {
    return {
      name: this.name,
      pipes: [...this.pipes.values()].map((pipe) => pipe.toGraph()),
    };
  }

  debugDump(): string {
    return formatHubGraph(this.toGraph());
  }

  protected onDispose(): void {}

  protected checkNotDisposed(): void {
    if (this._disposed) {
      throw new Error(`Hub ${this.name} is already disposed`);
    }
  }
}
