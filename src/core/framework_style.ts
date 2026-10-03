let injected = false;

export function ensureFrameworkStyles(): void {
  if (injected || typeof document === "undefined") {
    return;
  }
  injected = true;
  const style = document.createElement("style");
  style.setAttribute("data-ui", "framework-style");
  style.textContent = `
[data-ui-scroll="hidden"] {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
[data-ui-scroll="hidden"]::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
`.trim();
  document.head.appendChild(style);
}

export function applyScrollbarMode(
  element: HTMLElement,
  shown: boolean,
): void {
  ensureFrameworkStyles();
  element.setAttribute("data-ui-scroll", shown ? "shown" : "hidden");
}
