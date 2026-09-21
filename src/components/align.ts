import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";

export interface AlignProps {
  alignment?: Alignment;
  widthFactor?: number;
  heightFactor?: number;
  child?: UIComponent;
}

export class AlignComponent extends UIComponent {
  readonly kind: "Align" | "Center";

  constructor(
    readonly props: AlignProps,
    kind: "Align" | "Center" = "Align",
  ) {
    super();
    this.kind = kind;
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      alignment: this.props.alignment,
      widthFactor: this.props.widthFactor,
      heightFactor: this.props.heightFactor,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    const alignment = this.props.alignment ?? Alignment.center;
    element.style.display = "flex";
    element.style.justifyContent = alignment.toJustifyContent();
    element.style.alignItems = alignment.toAlignItems();
    element.style.width =
      this.props.widthFactor !== undefined
        ? `${this.props.widthFactor * 100}%`
        : "100%";
    if (this.props.heightFactor !== undefined) {
      element.style.height = `${this.props.heightFactor * 100}%`;
    } else {
      element.style.minHeight = "100%";
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function Align(props: AlignProps): AlignComponent {
  return new AlignComponent(props);
}

export interface CenterProps {
  widthFactor?: number;
  heightFactor?: number;
  child?: UIComponent;
}

export function Center(props: CenterProps = {}): AlignComponent {
  return new AlignComponent(
    {
      alignment: Alignment.center,
      widthFactor: props.widthFactor,
      heightFactor: props.heightFactor,
      child: props.child,
    },
    "Center",
  );
}
