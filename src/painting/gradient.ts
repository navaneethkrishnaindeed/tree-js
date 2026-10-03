import type { Alignment } from "./alignment";

export interface GradientStop {
  color: string;
  stop?: number;
}

type AxisPoint = Alignment | { x: number; y: number };

function stopsToCss(colors: string[], stops?: number[]): string {
  if (!stops || stops.length !== colors.length) {
    return colors.join(", ");
  }
  return colors.map((color, index) => `${color} ${Math.round(stops[index]! * 100)}%`).join(", ");
}

export interface LinearGradientProps {
  colors: string[];
  stops?: number[];
  begin?: AxisPoint;
  end?: AxisPoint;
}

class LinearGradientImpl {
  constructor(readonly props: LinearGradientProps) {}

  toCss(): string {
    const begin = this.props.begin ?? { x: 0, y: -1 };
    const end = this.props.end ?? { x: 0, y: 1 };
    const angle =
      (Math.atan2(end.y - begin.y, end.x - begin.x) * 180) / Math.PI + 90;
    return `linear-gradient(${angle}deg, ${stopsToCss(this.props.colors, this.props.stops)})`;
  }

  inspect(): string {
    return `LinearGradient(${this.props.colors.join(", ")})`;
  }

  toTreeValue(): unknown {
    return { type: "linear", ...this.props };
  }
}

export type LinearGradient = LinearGradientImpl;

export function LinearGradient(props: LinearGradientProps): LinearGradient {
  return new LinearGradientImpl(props);
}

export interface RadialGradientProps {
  colors: string[];
  stops?: number[];
  radius?: number;
}

class RadialGradientImpl {
  constructor(readonly props: RadialGradientProps) {}

  toCss(): string {
    const radius = Math.round((this.props.radius ?? 0.5) * 100);
    return `radial-gradient(circle ${radius}%, ${stopsToCss(this.props.colors, this.props.stops)})`;
  }

  inspect(): string {
    return `RadialGradient(${this.props.colors.join(", ")})`;
  }

  toTreeValue(): unknown {
    return { type: "radial", ...this.props };
  }
}

export type RadialGradient = RadialGradientImpl;

export function RadialGradient(props: RadialGradientProps): RadialGradient {
  return new RadialGradientImpl(props);
}

export type Gradient = LinearGradient | RadialGradient;

export function isGradient(value: unknown): value is Gradient {
  return value instanceof LinearGradientImpl || value instanceof RadialGradientImpl;
}
