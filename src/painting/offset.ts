class OffsetImpl {
  constructor(
    readonly dx: number,
    readonly dy: number,
  ) {}

  inspect(): string {
    return `Offset(${this.dx}, ${this.dy})`;
  }

  toTreeValue(): { dx: number; dy: number } {
    return { dx: this.dx, dy: this.dy };
  }
}

export type Offset = OffsetImpl;

export function Offset(dx: number, dy: number): Offset {
  return new OffsetImpl(dx, dy);
}

export namespace Offset {
  export const zero = Offset(0, 0);
}
