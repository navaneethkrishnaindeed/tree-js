import { createHost } from "../core/dom";
import { applyBoxStyles } from "../core/style";
import type { Dimension, UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface BoxConstraints {
  minWidth?: Dimension;
  maxWidth?: Dimension;
  minHeight?: Dimension;
  maxHeight?: Dimension;
}

export function BoxConstraints(props: BoxConstraints = {}): BoxConstraints {
  return props;
}

export interface ConstrainedBoxProps {
  constraints?: BoxConstraints;
  minWidth?: Dimension;
  maxWidth?: Dimension;
  minHeight?: Dimension;
  maxHeight?: Dimension;
  child?: UINode;
}

function resolveConstraints(props: ConstrainedBoxProps): BoxConstraints {
  return {
    minWidth: props.constraints?.minWidth ?? props.minWidth,
    maxWidth: props.constraints?.maxWidth ?? props.maxWidth,
    minHeight: props.constraints?.minHeight ?? props.minHeight,
    maxHeight: props.constraints?.maxHeight ?? props.maxHeight,
  };
}

export class ConstrainedBoxComponent extends UIComponent {
  readonly kind = "ConstrainedBox";

  constructor(readonly props: ConstrainedBoxProps) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    applyBoxStyles(element, resolveConstraints(this.props));
    this.props.child?.mount(element);
    return element;
  }
}

export function ConstrainedBox(props: ConstrainedBoxProps): ConstrainedBoxComponent {
  return new ConstrainedBoxComponent(props);
}

export interface FractionallySizedBoxProps {
  widthFactor?: number;
  heightFactor?: number;
  child?: UINode;
}

export class FractionallySizedBoxComponent extends UIComponent {
  readonly kind = "FractionallySizedBox";

  constructor(readonly props: FractionallySizedBoxProps = {}) {
    super();
  }

  override childNodes(): UINode[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.widthFactor !== undefined) {
      element.style.width = `${this.props.widthFactor * 100}%`;
    }
    if (this.props.heightFactor !== undefined) {
      element.style.height = `${this.props.heightFactor * 100}%`;
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function FractionallySizedBox(props: FractionallySizedBoxProps = {}): FractionallySizedBoxComponent {
  return new FractionallySizedBoxComponent(props);
}
