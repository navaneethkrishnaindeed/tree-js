export class ColorFilter {
  constructor(readonly cssFilter: string) {}

  toCss(): string {
    return this.cssFilter;
  }

  inspect(): string {
    return `ColorFilter(${this.cssFilter})`;
  }

  toTreeValue(): string {
    return this.cssFilter;
  }

  static grayscale(amount = 1): ColorFilter {
    return new ColorFilter(`grayscale(${amount})`);
  }

  static brightness(amount: number): ColorFilter {
    return new ColorFilter(`brightness(${amount})`);
  }

  static contrast(amount: number): ColorFilter {
    return new ColorFilter(`contrast(${amount})`);
  }

  static hueRotate(degrees: number): ColorFilter {
    return new ColorFilter(`hue-rotate(${degrees}deg)`);
  }

  static blur(sigma: number): ColorFilter {
    return new ColorFilter(`blur(${sigma}px)`);
  }

  static saturate(amount: number): ColorFilter {
    return new ColorFilter(`saturate(${amount})`);
  }

  static opacity(amount: number): ColorFilter {
    return new ColorFilter(`opacity(${amount})`);
  }
}
