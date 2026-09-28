export class CustomClipper {
  constructor(readonly clipPath: string) {}

  toCss(): string {
    return this.clipPath;
  }

  inspect(): string {
    return `CustomClipper(${this.clipPath})`;
  }

  toTreeValue(): string {
    return this.clipPath;
  }

  static rect(): CustomClipper {
    return new CustomClipper("inset(0)");
  }

  static circle(radius = "50%"): CustomClipper {
    return new CustomClipper(`circle(${radius} at 50% 50%)`);
  }

  static oval(): CustomClipper {
    return new CustomClipper("ellipse(50% 50% at 50% 50%)");
  }

  static rrect(radius: number): CustomClipper {
    return new CustomClipper(`inset(0 round ${radius}px)`);
  }

  static polygon(points: string): CustomClipper {
    return new CustomClipper(`polygon(${points})`);
  }

  static path(d: string): CustomClipper {
    return new CustomClipper(`path('${d}')`);
  }
}
