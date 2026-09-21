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
