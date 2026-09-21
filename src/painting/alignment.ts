/**
 * Alignment in 2D space.
 * x: -1 left, 0 center, 1 right
 * y: -1 top, 0 center, 1 bottom
 */
export class Alignment {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  static readonly topLeft = new Alignment(-1, -1);
  static readonly topCenter = new Alignment(0, -1);
  static readonly topRight = new Alignment(1, -1);
  static readonly centerLeft = new Alignment(-1, 0);
  static readonly center = new Alignment(0, 0);
  static readonly centerRight = new Alignment(1, 0);
  static readonly bottomLeft = new Alignment(-1, 1);
  static readonly bottomCenter = new Alignment(0, 1);
  static readonly bottomRight = new Alignment(1, 1);

  toJustifyContent(): string {
    if (this.x < 0) {
      return "flex-start";
    }
    if (this.x > 0) {
      return "flex-end";
    }
    return "center";
  }

  toAlignItems(): string {
    if (this.y < 0) {
      return "flex-start";
    }
    if (this.y > 0) {
      return "flex-end";
    }
    return "center";
  }

  applyAbsolute(style: CSSStyleDeclaration): void {
    style.position = "absolute";

    if (this.x < 0) {
      style.left = "0";
    } else if (this.x > 0) {
      style.right = "0";
    } else {
      style.left = "50%";
    }

    if (this.y < 0) {
      style.top = "0";
    } else if (this.y > 0) {
      style.bottom = "0";
    } else {
      style.top = "50%";
    }

    const translateX = this.x === 0 ? "-50%" : "0";
    const translateY = this.y === 0 ? "-50%" : "0";
    if (this.x === 0 || this.y === 0) {
      style.transform = `translate(${translateX}, ${translateY})`;
    }
  }

  inspect(): string {
    if (this.x === 0 && this.y === 0) {
      return "Alignment.center";
    }
    if (this.x === -1 && this.y === -1) {
      return "Alignment.topLeft";
    }
    if (this.x === 0 && this.y === -1) {
      return "Alignment.topCenter";
    }
    if (this.x === 1 && this.y === -1) {
      return "Alignment.topRight";
    }
    if (this.x === -1 && this.y === 0) {
      return "Alignment.centerLeft";
    }
    if (this.x === 1 && this.y === 0) {
      return "Alignment.centerRight";
    }
    if (this.x === -1 && this.y === 1) {
      return "Alignment.bottomLeft";
    }
    if (this.x === 0 && this.y === 1) {
      return "Alignment.bottomCenter";
    }
    if (this.x === 1 && this.y === 1) {
      return "Alignment.bottomRight";
    }
    return `Alignment(${this.x}, ${this.y})`;
  }

  toTreeValue(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
