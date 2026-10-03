import { createOutlet, isSlotNode, tryPatch, type Mountable, type SlotNode } from "./mountable";

export abstract class SlotHost implements SlotNode {
  abstract readonly kind: string;
  host?: HTMLElement;
  protected child?: Mountable;

  mount(parent: Element | DocumentFragment): HTMLElement {
    if (this.host) {
      this.unmount();
    }
    const element = createOutlet(this.kind);
    this.host = element;
    parent.appendChild(element);
    this.onMount();
    return element;
  }

  unmount(): void {
    this.swapChild(undefined);
    this.onUnmount();
    this.host?.replaceChildren();
    this.host?.remove();
    this.host = undefined;
  }

  childNodes(): SlotNode[] {
    return this.child && isSlotNode(this.child) ? [this.child] : [];
  }

  toTree(): {
    kind: string;
    props: Record<string, unknown>;
    children: ReturnType<SlotNode["toTree"]>[];
  } {
    return {
      kind: this.kind,
      props: this.inspectProps(),
      children: this.childNodes().map((child) => child.toTree()),
    };
  }

  debugDump(indent = 0): string {
    const pad = "  ".repeat(indent);
    const props = this.inspectProps();
    const propText = Object.entries(props)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${String(value)}`)
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

  protected inspectProps(): Record<string, unknown> {
    return {};
  }

  protected swapChild(next?: Mountable): void {
    if (this.child && next && tryPatch(this.child, next)) {
      return;
    }
    this.child?.unmount();
    this.child = next;
    if (next && this.host) {
      next.mount(this.host);
    }
  }

  protected onMount(): void {}

  protected onUnmount(): void {}
}
