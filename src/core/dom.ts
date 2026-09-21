export function createHost<K extends keyof HTMLElementTagNameMap>(
  tag: K,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.style.boxSizing = "border-box";
  return el;
}
