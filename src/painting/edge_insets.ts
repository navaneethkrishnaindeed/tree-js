export class EdgeInsets {
  constructor(
    readonly top: number,
    readonly right: number,
    readonly bottom: number,
    readonly left: number,
  ) {}

  static readonly zero = new EdgeInsets(0, 0, 0, 0);

  static all(value: number): EdgeInsets {
    return new EdgeInsets(value, value, value, value);
  }

  static symmetric(options: {
    horizontal?: number;
    vertical?: number;
  }): EdgeInsets {
    const horizontal = options.horizontal ?? 0;
    const vertical = options.vertical ?? 0;
    return new EdgeInsets(vertical, horizontal, vertical, horizontal);
  }

  static only(options: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }): EdgeInsets {
    return new EdgeInsets(
      options.top ?? 0,
      options.right ?? 0,
      options.bottom ?? 0,
      options.left ?? 0,
    );
  }

  toCss(): string {
    if (
      this.top === this.right &&
      this.right === this.bottom &&
      this.bottom === this.left
    ) {
      return `${this.top}px`;
    }
    if (this.top === this.bottom && this.left === this.right) {
      return `${this.top}px ${this.right}px`;
    }
    return `${this.top}px ${this.right}px ${this.bottom}px ${this.left}px`;
  }

  inspect(): string {
    if (
      this.top === this.right &&
      this.right === this.bottom &&
      this.bottom === this.left
    ) {
      return `EdgeInsets.all(${this.top})`;
    }
    if (this.top === this.bottom && this.left === this.right) {
      return `EdgeInsets.symmetric(horizontal: ${this.right}, vertical: ${this.top})`;
    }
    return `EdgeInsets.only(top: ${this.top}, right: ${this.right}, bottom: ${this.bottom}, left: ${this.left})`;
  }

  toTreeValue(): Record<string, number> {
    return {
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
  }
}
