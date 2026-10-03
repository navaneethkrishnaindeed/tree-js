class TweenImpl {
  constructor(
    readonly begin: number,
    readonly end: number,
  ) {}

  transform(t: number): number {
    return this.begin + (this.end - this.begin) * t;
  }

  lerp(t: number): number {
    return this.transform(t);
  }
}

export type Tween = TweenImpl;

export function Tween(props: { begin: number; end: number }): Tween {
  return new TweenImpl(props.begin, props.end);
}

export function lerpDouble(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
