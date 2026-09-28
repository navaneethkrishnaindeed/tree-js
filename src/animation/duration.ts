class DurationImpl {
  constructor(readonly inMilliseconds: number) {}

  toCss(): string {
    return `${this.inMilliseconds}ms`;
  }

  inspect(): string {
    return `Duration(${this.inMilliseconds}ms)`;
  }

  toTreeValue(): number {
    return this.inMilliseconds;
  }
}

export type Duration = DurationImpl;

export function Duration(props: { milliseconds?: number; seconds?: number } = {}): Duration {
  const milliseconds =
    (props.milliseconds ?? 0) + Math.round((props.seconds ?? 0) * 1000);
  return new DurationImpl(milliseconds);
}

export namespace Duration {
  export const zero = Duration({ milliseconds: 0 });
}
