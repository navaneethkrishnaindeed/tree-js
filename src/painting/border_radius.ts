export class BorderRadius {
  constructor(
    readonly topLeft: number,
    readonly topRight: number,
    readonly bottomRight: number,
    readonly bottomLeft: number,
  ) {}

  static readonly zero = new BorderRadius(0, 0, 0, 0);

  static circular(radius: number): BorderRadius {
    return new BorderRadius(radius, radius, radius, radius);
  }

  static all(radius: number): BorderRadius {
    return BorderRadius.circular(radius);
  }

  static only(options: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  }): BorderRadius {
    return new BorderRadius(
      options.topLeft ?? 0,
      options.topRight ?? 0,
      options.bottomRight ?? 0,
      options.bottomLeft ?? 0,
    );
  }

  toCss(): string {
    if (
      this.topLeft === this.topRight &&
      this.topRight === this.bottomRight &&
      this.bottomRight === this.bottomLeft
    ) {
      return `${this.topLeft}px`;
    }
    return `${this.topLeft}px ${this.topRight}px ${this.bottomRight}px ${this.bottomLeft}px`;
  }

  inspect(): string {
    if (
      this.topLeft === this.topRight &&
      this.topRight === this.bottomRight &&
      this.bottomRight === this.bottomLeft
    ) {
      return `BorderRadius.circular(${this.topLeft})`;
    }
    return `BorderRadius.only(topLeft: ${this.topLeft}, topRight: ${this.topRight}, bottomRight: ${this.bottomRight}, bottomLeft: ${this.bottomLeft})`;
  }

  toTreeValue(): Record<string, number> {
    return {
      topLeft: this.topLeft,
      topRight: this.topRight,
      bottomRight: this.bottomRight,
      bottomLeft: this.bottomLeft,
    };
  }
}
