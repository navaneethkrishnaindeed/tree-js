import { Colors } from "./colors";

export interface ColorSchemeProps {
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  surface: string;
  onSurface: string;
  background: string;
  onBackground: string;
  error: string;
  onError: string;
}

class ColorSchemeImpl {
  constructor(readonly props: ColorSchemeProps) {}

  get primary(): string {
    return this.props.primary;
  }
  get onPrimary(): string {
    return this.props.onPrimary;
  }
  get secondary(): string {
    return this.props.secondary;
  }
  get onSecondary(): string {
    return this.props.onSecondary;
  }
  get surface(): string {
    return this.props.surface;
  }
  get onSurface(): string {
    return this.props.onSurface;
  }
  get background(): string {
    return this.props.background;
  }
  get onBackground(): string {
    return this.props.onBackground;
  }
  get error(): string {
    return this.props.error;
  }
  get onError(): string {
    return this.props.onError;
  }

  inspect(): string {
    return `ColorScheme(primary: ${this.primary})`;
  }

  toTreeValue(): ColorSchemeProps {
    return { ...this.props };
  }
}

export type ColorScheme = ColorSchemeImpl;

export function ColorScheme(props: ColorSchemeProps): ColorScheme {
  return new ColorSchemeImpl(props);
}

export namespace ColorScheme {
  export function light(): ColorScheme {
    return ColorScheme({
      primary: Colors.blue,
      onPrimary: Colors.white,
      secondary: Colors.lightBlue,
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: "#1A1A1A",
      background: Colors.grey100,
      onBackground: "#1A1A1A",
      error: Colors.red,
      onError: Colors.white,
    });
  }

  export function dark(): ColorScheme {
    return ColorScheme({
      primary: "#90CAF9",
      onPrimary: "#0D47A1",
      secondary: "#81D4FA",
      onSecondary: "#01579B",
      surface: "#121212",
      onSurface: Colors.white,
      background: "#121212",
      onBackground: Colors.white,
      error: "#EF9A9A",
      onError: "#B71C1C",
    });
  }
}

export interface ThemeDataProps {
  colorScheme?: ColorScheme;
  primaryColor?: string;
}

class ThemeDataImpl {
  readonly colorScheme: ColorScheme;
  readonly primaryColor: string;

  constructor(readonly props: ThemeDataProps = {}) {
    this.colorScheme = props.colorScheme ?? ColorScheme.light();
    this.primaryColor = props.primaryColor ?? this.colorScheme.primary;
  }

  inspect(): string {
    return `ThemeData(primaryColor: ${this.primaryColor})`;
  }

  toTreeValue(): unknown {
    return {
      primaryColor: this.primaryColor,
      colorScheme: this.colorScheme.toTreeValue(),
    };
  }

  applyTo(element: HTMLElement): void {
    const scheme = this.colorScheme;
    element.style.setProperty("--ui-primary", scheme.primary);
    element.style.setProperty("--ui-on-primary", scheme.onPrimary);
    element.style.setProperty("--ui-secondary", scheme.secondary);
    element.style.setProperty("--ui-on-secondary", scheme.onSecondary);
    element.style.setProperty("--ui-surface", scheme.surface);
    element.style.setProperty("--ui-on-surface", scheme.onSurface);
    element.style.setProperty("--ui-background", scheme.background);
    element.style.setProperty("--ui-on-background", scheme.onBackground);
    element.style.setProperty("--ui-error", scheme.error);
    element.style.setProperty("--ui-on-error", scheme.onError);
  }
}

export type ThemeData = ThemeDataImpl;

export function ThemeData(props: ThemeDataProps = {}): ThemeData {
  return new ThemeDataImpl(props);
}

export namespace ThemeData {
  export function light(): ThemeData {
    return ThemeData({ colorScheme: ColorScheme.light() });
  }

  export function dark(): ThemeData {
    return ThemeData({ colorScheme: ColorScheme.dark() });
  }
}
