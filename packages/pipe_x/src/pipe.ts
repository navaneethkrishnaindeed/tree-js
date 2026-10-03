import { formatPipeGraph, type PipeGraph, type PipeRef, type SubscriberInfo } from "./graph";
import { PipeXDev } from "./registry";

let nextPipeId = 1;

export interface PipeSubscriber {
  notify(): void;
  readonly subscriberKind: string;
  readonly subscriberName?: string;
}

export interface PipeOptions {
  name?: string;
  autoDispose?: boolean;
}

// Invariant in T (private listeners). Use this for heterogeneous pipe lists.
export type AnyPipe = Pipe<any>;

export class Pipe<T> {
  readonly id = `pipe_${nextPipeId++}`;
  readonly name: string;

  private _value: T;
  private _disposed = false;
  private _autoDispose: boolean;
  private _hubOwned = false;
  private _hubName?: string;
  private _notifying = false;
  private readonly subscribers: PipeSubscriber[] = [];
  private readonly listeners: Array<(value: T) => void> = [];
  private readonly _dependents: AnyPipe[] = [];
  private readonly _dependencies: AnyPipe[] = [];

  constructor(initialValue: T, options: PipeOptions = {}) {
    this._value = initialValue;
    this.name = options.name ?? this.id;
    this._autoDispose = options.autoDispose ?? true;
    PipeXDev.registerPipe(this);
  }

  get value(): T {
    this.assertAlive("read");
    return this._value;
  }

  set value(next: T) {
    this.assertAlive("write");
    if (Object.is(this._value, next)) {
      return;
    }
    this._value = next;
    this.notifySubscribers();
  }

  pump(next: T): void {
    this.assertAlive("pump");
    this._value = next;
    this.notifySubscribers();
  }

  get disposed(): boolean {
    return this._disposed;
  }

  get subscriberCount(): number {
    return this.subscribers.length;
  }

  get hubName(): string | undefined {
    return this._hubName;
  }

  addListener(listener: (value: T) => void): void {
    if (this._disposed) {
      return;
    }
    this.listeners.push(listener);
  }

  removeListener(listener: (value: T) => void): void {
    if (this._disposed) {
      return;
    }
    const index = this.listeners.lastIndexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
    this.maybeAutoDispose();
  }

  attach(subscriber: PipeSubscriber): void {
    if (this._disposed) {
      return;
    }
    this.subscribers.push(subscriber);
  }

  detach(subscriber: PipeSubscriber): void {
    if (this._disposed) {
      return;
    }
    const index = this.subscribers.lastIndexOf(subscriber);
    if (index >= 0) {
      this.subscribers.splice(index, 1);
    }
    this.maybeAutoDispose();
  }

  /** Used by ComputedPipe to record graph edges. */
  linkDependency(dependency: AnyPipe): void {
    if (!this._dependencies.includes(dependency)) {
      this._dependencies.push(dependency);
    }
    if (!dependency._dependents.includes(this)) {
      dependency._dependents.push(this);
    }
  }

  unlinkDependency(dependency: AnyPipe): void {
    const depIndex = this._dependencies.indexOf(dependency);
    if (depIndex >= 0) {
      this._dependencies.splice(depIndex, 1);
    }
    const selfIndex = dependency._dependents.indexOf(this);
    if (selfIndex >= 0) {
      dependency._dependents.splice(selfIndex, 1);
    }
  }

  markHubOwned(hubName: string): void {
    this._hubOwned = true;
    this._hubName = hubName;
    this._autoDispose = false;
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }
    if (this._notifying) {
      queueMicrotask(() => this.dispose());
      return;
    }
    this._disposed = true;
    PipeXDev.unregisterPipe(this);
    for (const dependency of [...this._dependencies]) {
      this.unlinkDependency(dependency);
    }
    this.subscribers.length = 0;
    this.listeners.length = 0;
  }

  toGraph(): PipeGraph {
    const subscribers: SubscriberInfo[] = this.subscribers.map((subscriber) => ({
      kind: subscriber.subscriberKind,
      name: subscriber.subscriberName ?? subscriber.subscriberKind,
    }));
    for (let i = 0; i < this.listeners.length; i += 1) {
      subscribers.push({ kind: "listener", name: "listener" });
    }
    const toRef = (pipe: AnyPipe): PipeRef => ({
      id: pipe.id,
      name: pipe.name,
    });
    return {
      id: this.id,
      name: this.name,
      kind: this.graphKind(),
      value: this._disposed ? undefined : this._value,
      hub: this._hubName,
      subscriberCount: this.subscribers.length,
      subscribers,
      dependencies: this._dependencies.map(toRef),
      dependents: this._dependents.map(toRef),
    };
  }

  debugDump(): string {
    return formatPipeGraph(this.toGraph());
  }

  protected graphKind(): PipeGraph["kind"] {
    return "Pipe";
  }

  protected notifySubscribers(): void {
    if (this._notifying) {
      return;
    }
    this._notifying = true;
    try {
      for (const subscriber of [...this.subscribers]) {
        subscriber.notify();
      }
      for (const listener of [...this.listeners]) {
        listener(this._value);
      }
    } finally {
      this._notifying = false;
      PipeXDev.touch(this);
    }
  }

  private maybeAutoDispose(): void {
    if (
      !this._autoDispose ||
      this._hubOwned ||
      this.subscribers.length > 0 ||
      this.listeners.length > 0 ||
      this._notifying
    ) {
      return;
    }
    queueMicrotask(() => {
      if (
        !this._disposed &&
        this.subscribers.length === 0 &&
        this.listeners.length === 0 &&
        !this._notifying
      ) {
        this.dispose();
      }
    });
  }

  private assertAlive(action: string): void {
    if (this._disposed) {
      throw new Error(`Cannot ${action} a disposed Pipe (${this.name})`);
    }
  }
}
