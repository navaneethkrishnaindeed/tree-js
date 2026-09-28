export const Curves = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  fastOutSlowIn: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export type Curve = (typeof Curves)[keyof typeof Curves] | string;

export function applyCssTransition(
  element: HTMLElement,
  duration?: { toCss(): string } | undefined,
  curve?: Curve,
  property = "all",
): void {
  const time = duration?.toCss() ?? "250ms";
  element.style.transition = `${property} ${time} ${curve ?? Curves.easeInOut}`;
}
