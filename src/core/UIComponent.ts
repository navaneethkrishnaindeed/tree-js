import { formatProp, omitUndefined, toTreeValue } from "./inspect";
import type { ComponentTreeNode } from "./types";

/**
 * Base class for every UI node.
 *
 * This is a configurable component object (properties, styles, children,
 * events) — not Flutter's Widget/State/BuildContext model.
 *
 * Future reactivity can wrap prop values (for example `text: () => user.name`)
 * without changing the constructor API. v1 treats all props as static.
 */
export abstract class UIComponent {
  abstract readonly kind: string;

  mount(parent: Element | DocumentFragment): HTMLElement {
    const element = this.createElement();
    element.setAttribute("data-ui", this.kind);
    parent.appendChild(element);
    return element;
  }

  abstract createElement(): HTMLElement;

  childNodes(): UIComponent[] {
    return [];
  }

  protected inspectProps(): Record<string, unknown> {
    return {};
  }

  toTree(): ComponentTreeNode {
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.inspectProps())) {
      props[key] = toTreeValue(value);
    }
    return {
      kind: this.kind,
      props,
      children: this.childNodes().map((child) => child.toTree()),
    };
  }

  debugDump(indent = 0): string {
    const pad = "  ".repeat(indent);
    const props = omitUndefined(this.inspectProps());
    const propText = Object.entries(props)
      .map(([key, value]) => `${key}=${formatProp(value)}`)
      .join(" ");
    const header = propText ? `${this.kind} ${propText}` : this.kind;
    const children = this.childNodes();
    if (children.length === 0) {
      return `${pad}${header}`;
    }
    return [
      `${pad}${header}`,
      ...children.map((child) => child.debugDump(indent + 1)),
    ].join("\n");
  }
}
