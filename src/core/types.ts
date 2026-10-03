import type { Key } from "./key";

/** A CSS size: numbers are treated as px, strings pass through (`"100%"`, `"2rem"`). */
export type Dimension = number | string;

export type Overflow = "visible" | "hidden" | "scroll" | "auto";

export type Position = "static" | "relative" | "absolute" | "fixed" | "sticky";

export function toCssSize(value: Dimension): string {
  return typeof value === "number" ? `${value}px` : value;
}

export interface ComponentTreeNode {
  kind: string;
  props: Record<string, unknown>;
  children: ComponentTreeNode[];
}

/** Anything that can sit in a parent slot, including pipe_x Sink / Well. */
export interface UINode {
  readonly kind: string;
  key?: Key;
  host?: HTMLElement;
  mount(parent: Element | DocumentFragment): HTMLElement;
  unmount(): void;
  childNodes(): UINode[];
  toTree(): ComponentTreeNode;
  debugDump(indent?: number): string;
  patchFrom?(next: UINode): boolean;
}
