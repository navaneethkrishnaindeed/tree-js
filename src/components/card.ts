import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { applyBoxStyles } from "../core/style";
import { UIComponent } from "../core/UIComponent";
import { BorderRadius } from "../painting/border_radius";
import { BoxDecoration } from "../painting/box_decoration";
import { BoxShadow } from "../painting/box_shadow";
import { Colors } from "../painting/colors";
import { EdgeInsets } from "../painting/edge_insets";

export interface CardProps {
  child?: UIComponent;
  color?: string;
  elevation?: number;
  margin?: EdgeInsets;
}

export class CardComponent extends UIComponent {
  readonly kind = "Card";

  constructor(readonly props: CardProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      color: this.props.color,
      elevation: this.props.elevation,
      margin: this.props.margin,
    });
  }

  createElement(): HTMLElement {
    const elevation = this.props.elevation ?? 1;
    const element = createHost("div");
    applyBoxStyles(element, {
      margin: this.props.margin ?? EdgeInsets.all(4),
      decoration: BoxDecoration({
        color: this.props.color ?? Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: BoxShadow({
          offsetY: Math.max(1, elevation),
          blurRadius: 4 + elevation * 4,
          color: "rgba(15, 23, 42, 0.12)",
        }),
      }),
    });
    this.props.child?.mount(element);
    return element;
  }
}

export function Card(props: CardProps = {}): CardComponent {
  return new CardComponent(props);
}
