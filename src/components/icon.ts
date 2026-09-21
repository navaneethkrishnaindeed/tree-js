import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import type { IconData } from "../painting/icons";

export interface IconProps {
  icon: IconData;
  size?: Dimension;
  color?: string;
}

export class IconComponent extends UIComponent {
  readonly kind = "Icon";

  constructor(readonly props: IconProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      icon: this.props.icon,
      size: this.props.size,
      color: this.props.color,
    });
  }

  createElement(): HTMLElement {
    const size = this.props.size ?? 24;
    const host = createHost("span");
    host.style.display = "inline-flex";
    host.style.alignItems = "center";
    host.style.justifyContent = "center";
    host.style.lineHeight = "0";
    host.style.color = this.props.color ?? "currentColor";
    host.style.width = toCssSize(size);
    host.style.height = toCssSize(size);
    host.setAttribute("aria-hidden", "true");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("fill", "currentColor");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", this.props.icon.path);
    svg.appendChild(path);
    host.appendChild(svg);
    return host;
  }
}

export function Icon(props: IconProps): IconComponent {
  return new IconComponent(props);
}
