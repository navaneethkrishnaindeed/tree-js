export interface BoxShadowProps {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blurRadius?: number;
  spreadRadius?: number;
}

class BoxShadowImpl {
  constructor(readonly props: BoxShadowProps) {}

  toCss(): string {
    const {
      offsetX = 0,
      offsetY = 0,
      blurRadius = 0,
      spreadRadius = 0,
      color = "rgba(0, 0, 0, 0.25)",
    } = this.props;
    return `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
  }

  inspect(): string {
    const { offsetX = 0, offsetY = 0, blurRadius = 0, color } = this.props;
    return `BoxShadow(offsetX: ${offsetX}, offsetY: ${offsetY}, blurRadius: ${blurRadius}${color ? `, color: ${color}` : ""})`;
  }

  toTreeValue(): BoxShadowProps {
    return { ...this.props };
  }
}

export type BoxShadow = BoxShadowImpl;

export function BoxShadow(props: BoxShadowProps): BoxShadow {
  return new BoxShadowImpl(props);
}

export function boxShadowsToCss(shadow: BoxShadow | BoxShadow[]): string {
  const list = Array.isArray(shadow) ? shadow : [shadow];
  return list.map((item) => item.toCss()).join(", ");
}
