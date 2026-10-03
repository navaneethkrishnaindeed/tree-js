import type { PipeGraph } from "./graph";
import { Pipe, type PipeOptions } from "./pipe";

export abstract class AsyncValue<T> {
  abstract readonly status: "loading" | "data" | "error" | "refreshing";
  abstract readonly isLoading: boolean;
  abstract readonly hasData: boolean;
  abstract readonly hasError: boolean;
  abstract readonly valueOrNull: T | undefined;
  abstract readonly errorOrNull: unknown;
  abstract get requireValue(): T;

  abstract when<R>(handlers: {
    loading: () => R;
    data: (value: T) => R;
    onError: (error: unknown, stack?: string) => R;
  }): R;
}

export class AsyncLoading<T> extends AsyncValue<T> {
  readonly status = "loading" as const;
  readonly isLoading = true;
  readonly hasData = false;
  readonly hasError = false;
  readonly valueOrNull = undefined;
  readonly errorOrNull = undefined;

  get requireValue(): T {
    throw new Error("AsyncValue has no data yet");
  }

  when<R>(handlers: {
    loading: () => R;
    data: (value: T) => R;
    onError: (error: unknown, stack?: string) => R;
  }): R {
    return handlers.loading();
  }
}

export class AsyncData<T> extends AsyncValue<T> {
  readonly status = "data" as const;
  readonly isLoading = false;
  readonly hasData = true;
  readonly hasError = false;
  readonly errorOrNull = undefined;

  constructor(readonly value: T) {
    super();
  }

  get valueOrNull(): T {
    return this.value;
  }

  get requireValue(): T {
    return this.value;
  }

  when<R>(handlers: {
    loading: () => R;
    data: (value: T) => R;
    onError: (error: unknown, stack?: string) => R;
  }): R {
    return handlers.data(this.value);
  }
}

export class AsyncError<T> extends AsyncValue<T> {
  readonly status = "error" as const;
  readonly isLoading = false;
  readonly hasData = false;
  readonly hasError = true;
  readonly valueOrNull = undefined;

  constructor(
    readonly error: unknown,
    readonly stack?: string,
  ) {
    super();
  }

  get errorOrNull(): unknown {
    return this.error;
  }

  get requireValue(): T {
    throw this.error;
  }

  when<R>(handlers: {
    loading: () => R;
    data: (value: T) => R;
    onError: (error: unknown, stack?: string) => R;
  }): R {
    return handlers.onError(this.error, this.stack);
  }
}

export class AsyncRefreshing<T> extends AsyncValue<T> {
  readonly status = "refreshing" as const;
  readonly isLoading = true;
  readonly hasData = true;
  readonly hasError = false;
  readonly errorOrNull = undefined;

  constructor(readonly value: T) {
    super();
  }

  get valueOrNull(): T {
    return this.value;
  }

  get requireValue(): T {
    return this.value;
  }

  when<R>(handlers: {
    loading: () => R;
    data: (value: T) => R;
    onError: (error: unknown, stack?: string) => R;
  }): R {
    return handlers.data(this.value);
  }
}

export interface AsyncPipeOptions extends PipeOptions {
  immediate?: boolean;
}

export class AsyncPipe<T> extends Pipe<AsyncValue<T>> {
  private readonly factory: () => Promise<T>;
  private generation = 0;

  constructor(factory: () => Promise<T>, options: AsyncPipeOptions = {}) {
    super(new AsyncLoading<T>(), options);
    this.factory = factory;
    if (options.immediate ?? true) {
      void this.refresh();
    }
  }

  static withInitialValue<T>(
    initialValue: T,
    factory: () => Promise<T>,
    options: PipeOptions = {},
  ): AsyncPipe<T> {
    const pipe = new AsyncPipe(factory, { ...options, immediate: false });
    pipe.setData(initialValue);
    return pipe;
  }

  get isLoading(): boolean {
    return this.value.isLoading;
  }

  get hasData(): boolean {
    return this.value.hasData;
  }

  get hasError(): boolean {
    return this.value.hasError;
  }

  get dataOrNull(): T | undefined {
    return this.value.valueOrNull;
  }

  get errorOrNull(): unknown {
    return this.value.errorOrNull;
  }

  async refresh(): Promise<void> {
    const current = this.value;
    if (current.hasData && current.valueOrNull !== undefined) {
      this.pump(new AsyncRefreshing(current.valueOrNull));
    } else {
      this.pump(new AsyncLoading<T>());
    }
    const token = ++this.generation;
    try {
      const data = await this.factory();
      if (token !== this.generation || this.disposed) {
        return;
      }
      this.pump(new AsyncData(data));
    } catch (error) {
      if (token !== this.generation || this.disposed) {
        return;
      }
      const stack = error instanceof Error ? error.stack : undefined;
      this.pump(new AsyncError<T>(error, stack));
    }
  }

  async reset(): Promise<void> {
    this.pump(new AsyncLoading<T>());
    await this.refresh();
  }

  setData(data: T): void {
    this.pump(new AsyncData(data));
  }

  setError(error: unknown): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.pump(new AsyncError<T>(error, stack));
  }

  setLoading(): void {
    this.pump(new AsyncLoading<T>());
  }

  protected override graphKind(): PipeGraph["kind"] {
    return "AsyncPipe";
  }
}
