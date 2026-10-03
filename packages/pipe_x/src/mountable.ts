export interface Mountable {
  mount(parent: Element | DocumentFragment): HTMLElement;
  unmount(): void;
  readonly kind?: string;
  key?: string | number | symbol;
  patchFrom?(next: Mountable): boolean;
}

export function tryPatch(prev: Mountable, next: Mountable): boolean {
  if (prev.kind === undefined || next.kind === undefined || prev.kind !== next.kind) {
    return false;
  }
  if ((prev.key ?? undefined) !== (next.key ?? undefined)) {
    return false;
  }
  if (typeof prev.patchFrom !== "function") {
    return false;
  }
  return prev.patchFrom(next);
}

export interface SlotNode extends Mountable {
  readonly kind: string;
  host?: HTMLElement;
  childNodes(): SlotNode[];
  toTree(): { kind: string; props: Record<string, unknown>; children: ReturnType<SlotNode["toTree"]>[] };
  debugDump(indent?: number): string;
}

export function isSlotNode(value: Mountable): value is SlotNode {
  return (
    "kind" in value &&
    typeof (value as SlotNode).kind === "string" &&
    typeof (value as SlotNode).childNodes === "function"
  );
}

export function createOutlet(kind: string): HTMLElement {
  const element = document.createElement("div");
  element.setAttribute("data-ui", kind);
  element.style.display = "contents";
  return element;
}
