import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Colors } from "../painting/colors";

export interface DividerProps {
  height?: Dimension;
  thickness?: number;
  color?: string;
  indent?: number;
  endIndent?: number;
}

export class DividerComponent extends UIComponent {
  readonly kind = "Divider";

  constructor(readonly props: DividerProps = {}) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ ...this.props });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.height = toCssSize(this.props.height ?? 16);
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.paddingLeft = `${this.props.indent ?? 0}px`;
    element.style.paddingRight = `${this.props.endIndent ?? 0}px`;

    const line = createHost("div");
    line.style.width = "100%";
    line.style.height = `${this.props.thickness ?? 1}px`;
    line.style.backgroundColor = this.props.color ?? Colors.grey300;
    element.appendChild(line);
    return element;
  }
}

export function Divider(props: DividerProps = {}): DividerComponent {
  return new DividerComponent(props);
}
