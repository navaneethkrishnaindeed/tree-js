import type { HubGraph, PipeGraph } from "./graph";
import { PipeXDev } from "./registry";

export { inspect, PipeXDev } from "./registry";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function preview(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "string") {
    return value.length > 32 ? `${value.slice(0, 29)}...` : value;
  }
  try {
    const text = JSON.stringify(value);
    if (text === undefined) {
      return String(value);
    }
    return text.length > 40 ? `${text.slice(0, 37)}...` : text;
  } catch {
    return String(value);
  }
}

function renderPipe(graph: PipeGraph, focusedId?: string): string {
  const selected = graph.id === focusedId ? " pipe-x-node--focus" : "";
  const deps = graph.dependencies.map((dep) => dep.name).join(", ");
  const outs = [
    ...graph.dependents.map((dep) => dep.name),
    ...graph.subscribers.map((sub) => sub.name),
  ].join(", ");
  return `
    <button type="button" class="pipe-x-node${selected}" data-pipe-id="${escapeHtml(graph.id)}">
      <strong>${escapeHtml(graph.kind)} ${escapeHtml(graph.name)}</strong>
      <span>= ${escapeHtml(preview(graph.value))}</span>
      ${deps ? `<small>← ${escapeHtml(deps)}</small>` : ""}
      ${outs ? `<small>→ ${escapeHtml(outs)}</small>` : ""}
    </button>
  `;
}

function renderHub(graph: HubGraph, focusedId?: string): string {
  return `
    <div class="pipe-x-hub">
      <div class="pipe-x-hub-title">${escapeHtml(graph.name)}</div>
      ${graph.pipes.map((pipe) => renderPipe(pipe, focusedId)).join("")}
    </div>
  `;
}

let host: HTMLElement | undefined;
let unsubscribe: (() => void) | undefined;
let selectedKey = "";
let focusedPipeId = "";
let showDump = false;
let drawing = false;

function currentSelection(): { key: string; graph: HubGraph | PipeGraph; dump: string } | undefined {
  const hubs = PipeXDev.listHubs();
  const pipes = PipeXDev.listPipes().filter((pipe) => !pipe.hubName);
  const items: Array<{ key: string; graph: HubGraph | PipeGraph; dump: string }> = [];
  for (const hub of hubs) {
    try {
      items.push({
        key: `hub:${hub.name}`,
        graph: hub.toGraph(),
        dump: hub.debugDump(),
      });
    } catch {
      // Hub disappeared while drawing.
    }
  }
  for (const pipe of pipes) {
    try {
      items.push({
        key: `pipe:${pipe.id}`,
        graph: pipe.toGraph(),
        dump: pipe.debugDump(),
      });
    } catch {
      // Pipe disappeared while drawing.
    }
  }
  if (items.length === 0) {
    return undefined;
  }
  return items.find((item) => item.key === selectedKey) ?? items[0];
}

function draw(): void {
  if (!host || drawing) {
    return;
  }
  drawing = true;
  try {
    const options = [
      ...PipeXDev.listHubs().map((hub) => ({ key: `hub:${hub.name}`, label: `Hub ${hub.name}` })),
      ...PipeXDev.listPipes()
        .filter((pipe) => !pipe.hubName)
        .map((pipe) => ({ key: `pipe:${pipe.id}`, label: `Pipe ${pipe.name}` })),
    ];
    const current = currentSelection();
    if (current) {
      selectedKey = current.key;
    }

    const graphHtml = current
      ? "pipes" in current.graph
        ? renderHub(current.graph, focusedPipeId)
        : renderPipe(current.graph, focusedPipeId)
      : `<p class="pipe-x-empty">No hubs or standalone pipes registered. Call inspect(hub) or enable the overlay before creating them.</p>`;

    host.innerHTML = `
    <div class="pipe-x-overlay-bar">
      <strong>pipe_x graph</strong>
      <select class="pipe-x-select">
        ${options
          .map(
            (option) =>
              `<option value="${escapeHtml(option.key)}"${option.key === selectedKey ? " selected" : ""}>${escapeHtml(option.label)}</option>`,
          )
          .join("")}
      </select>
      <label><input type="checkbox" class="pipe-x-dump-toggle"${showDump ? " checked" : ""}/> dump</label>
    </div>
    <div class="pipe-x-graph">${graphHtml}</div>
    ${showDump && current ? `<pre class="pipe-x-dump">${escapeHtml(current.dump)}</pre>` : ""}
  `;

    host.querySelector<HTMLSelectElement>(".pipe-x-select")?.addEventListener("change", (event) => {
      selectedKey = (event.target as HTMLSelectElement).value;
      focusedPipeId = "";
      draw();
    });
    host.querySelector<HTMLInputElement>(".pipe-x-dump-toggle")?.addEventListener("change", (event) => {
      showDump = (event.target as HTMLInputElement).checked;
      draw();
    });
    host.querySelectorAll<HTMLButtonElement>("[data-pipe-id]").forEach((button) => {
      button.addEventListener("click", () => {
        focusedPipeId = button.dataset.pipeId ?? "";
        const pipe = PipeXDev.listPipes().find((item) => item.id === focusedPipeId);
        if (pipe && !pipe.hubName) {
          selectedKey = `pipe:${pipe.id}`;
        }
        draw();
      });
    });
  } finally {
    drawing = false;
  }
}

function ensureStyles(): void {
  if (document.getElementById("pipe-x-dev-style")) {
    return;
  }
  const style = document.createElement("style");
  style.id = "pipe-x-dev-style";
  style.textContent = `
    .pipe-x-overlay {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 9999;
      width: min(420px, calc(100vw - 32px));
      max-height: min(70vh, 520px);
      overflow: auto;
      background: #0f172a;
      color: #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .pipe-x-overlay-bar {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid #334155;
      position: sticky;
      top: 0;
      background: #0f172a;
    }
    .pipe-x-overlay-bar strong { flex: 1; }
    .pipe-x-select {
      background: #1e293b;
      color: inherit;
      border: 1px solid #475569;
      border-radius: 6px;
      padding: 2px 6px;
    }
    .pipe-x-graph { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .pipe-x-hub-title { font-weight: 700; margin-bottom: 6px; color: #93c5fd; }
    .pipe-x-node {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      width: 100%;
      text-align: left;
      background: #1e293b;
      color: inherit;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
    }
    .pipe-x-node--focus { border-color: #38bdf8; }
    .pipe-x-node small { color: #94a3b8; }
    .pipe-x-empty { margin: 0; color: #94a3b8; }
    .pipe-x-dump {
      margin: 0;
      padding: 12px;
      border-top: 1px solid #334155;
      white-space: pre-wrap;
      color: #cbd5e1;
    }
  `;
  document.head.appendChild(style);
}

export const PipeXDevOverlay = {
  mount(parent: Element = document.body): HTMLElement {
    PipeXDev.enable();
    this.unmount();
    ensureStyles();
    host = document.createElement("aside");
    host.className = "pipe-x-overlay";
    host.setAttribute("data-ui", "PipeXDevOverlay");
    parent.appendChild(host);
    unsubscribe = PipeXDev.subscribe(() => {
      draw();
    });
    draw();
    return host;
  },

  unmount(): void {
    unsubscribe?.();
    unsubscribe = undefined;
    host?.remove();
    host = undefined;
  },
};

export function mountDevOverlay(parent?: Element): HTMLElement {
  return PipeXDevOverlay.mount(parent);
}
