import { ensureFrameworkStyles } from "./framework_style";
import { formatProp, omitUndefined, toTreeValue } from "./inspect";
import type { Key } from "./key";
import { readKey } from "./key";
import type { ComponentTreeNode, UINode } from "./types";

/**
 * Base class for every UI node.
 *
 * This is a configurable component object (properties, styles, children,
 * events) — not Flutter's Widget/State/BuildContext model.
 *
 * Future reactivity can wrap prop values (for example `text: () => user.name`)
 * without changing the constructor API. v1 treats all props as static.
 */
export abstract class UIComponent implements UINode {
  abstract readonly kind: string;
  key?: Key;

  constructor(props?: { key?: Key }) {
    this.key = props?.key;
  }

  mount(parent: Element | DocumentFragment): HTMLElement {
    ensureFrameworkStyles();
    if (this.host) {
      this.unmount();
    }
    const element = this.createElement();
    this.host = element;
    this.key = readKey(this);
    element.setAttribute("data-ui", this.kind);
    parent.appendChild(element);
    return element;
  }

  /** Same-kind rebuild: subclasses patch live DOM instead of remounting. */
  patchFrom(_next: UINode): boolean {
    return false;
  }

  /** Remove this node and its descendants from the DOM and clear `host`. */
  unmount(): void {
    for (const child of this.childNodes()) {
      try {
        child.unmount();
      } catch (error) {
        console.error(`Failed to unmount ${child.kind}`, error);
      }
    }
    this.host?.replaceChildren();
    this.host?.remove();
    this.host = undefined;
  }

  /** Set after `mount()`. Used by animated widgets to patch live CSS. */
  host?: HTMLElement;

  abstract createElement(): HTMLElement;

  childNodes(): UINode[] {
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
