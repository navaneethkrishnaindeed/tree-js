import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { TextOverflow } from "../painting/text_overflow";
import type { TextStyle } from "../painting/text_style";

export interface TextSpanProps {
  text?: string;
  style?: TextStyle;
  children?: TextSpanImpl[];
  onTap?: () => void;
}

class TextSpanImpl {
  constructor(readonly props: TextSpanProps) {}

  inspect(): string {
    return `TextSpan(${this.props.text ?? "..."})`;
  }

  toTreeValue(): unknown {
    return { text: this.props.text };
  }

  mount(parent: HTMLElement): void {
    if (this.props.text !== undefined && !this.props.children?.length) {
      const span = createHost("span");
      span.textContent = this.props.text;
      this.props.style?.applyTo(span.style);
      if (this.props.onTap) {
        span.style.cursor = "pointer";
        span.addEventListener("click", this.props.onTap);
      }
      parent.appendChild(span);
      return;
    }
    const span = createHost("span");
    this.props.style?.applyTo(span.style);
    if (this.props.text) {
      span.append(this.props.text);
    }
    for (const child of this.props.children ?? []) {
      child.mount(span);
    }
    parent.appendChild(span);
  }
}

export type TextSpan = TextSpanImpl;

export function TextSpan(props: TextSpanProps): TextSpan {
  return new TextSpanImpl(props);
}

export interface RichTextProps {
  text: TextSpan;
}

export class RichTextComponent extends UIComponent {
  readonly kind = "RichText";

  constructor(readonly props: RichTextProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ text: this.props.text });
  }

  createElement(): HTMLElement {
    const element = createHost("span");
    this.props.text.mount(element);
    return element;
  }
}

export function RichText(props: RichTextProps): RichTextComponent {
  return new RichTextComponent(props);
}

export interface SelectableTextProps {
  text: string;
  style?: TextStyle;
}

export class SelectableTextComponent extends UIComponent {
  readonly kind = "SelectableText";

  constructor(readonly props: SelectableTextProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ text: this.props.text, style: this.props.style });
  }

  createElement(): HTMLElement {
    const element = createHost("span");
    element.textContent = this.props.text;
    element.style.userSelect = "text";
    this.props.style?.applyTo(element.style);
    return element;
  }
}

export function SelectableText(props: SelectableTextProps): SelectableTextComponent {
  return new SelectableTextComponent(props);
}

export function applyTextOverflow(
  element: HTMLElement,
  overflow?: TextOverflow,
  maxLines?: number,
  softWrap?: boolean,
): void {
  if (softWrap === false) {
    element.style.whiteSpace = "nowrap";
  }
  if (maxLines === 1 || overflow === TextOverflow.ellipsis) {
    element.style.overflow = "hidden";
    element.style.textOverflow = "ellipsis";
    element.style.whiteSpace = "nowrap";
  } else if (maxLines && maxLines > 1) {
    element.style.display = "-webkit-box";
    element.style.overflow = "hidden";
    element.style.setProperty("-webkit-box-orient", "vertical");
    element.style.setProperty("-webkit-line-clamp", String(maxLines));
  } else if (overflow === TextOverflow.clip) {
    element.style.overflow = "hidden";
  } else if (overflow === TextOverflow.fade) {
    element.style.overflow = "hidden";
    element.style.maskImage = "linear-gradient(to right, #000 70%, transparent)";
  }
}
