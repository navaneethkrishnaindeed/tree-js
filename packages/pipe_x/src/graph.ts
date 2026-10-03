export interface SubscriberInfo {
  kind: string;
  name: string;
}

export interface PipeRef {
  id: string;
  name: string;
}

export interface PipeGraph {
  id: string;
  name: string;
  kind: "Pipe" | "ComputedPipe" | "AsyncPipe";
  value: unknown;
  hub?: string;
  subscriberCount: number;
  subscribers: SubscriberInfo[];
  dependencies: PipeRef[];
  dependents: PipeRef[];
}

export interface HubGraph {
  name: string;
  pipes: PipeGraph[];
}

function preview(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return JSON.stringify(value.length > 40 ? `${value.slice(0, 37)}...` : value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "function") {
    return "Function";
  }
  try {
    const text = JSON.stringify(value);
    if (text === undefined) {
      return String(value);
    }
    return text.length > 48 ? `${text.slice(0, 45)}...` : text;
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function formatPipeGraph(graph: PipeGraph, indent = 0): string {
  const pad = "  ".repeat(indent);
  const lines = [
    `${pad}${graph.kind} ${graph.name} = ${preview(graph.value)}`,
  ];
  if (graph.hub) {
    lines.push(`${pad}  hub=${graph.hub}`);
  }
  if (graph.dependencies.length > 0) {
    lines.push(
      `${pad}  deps=[${graph.dependencies.map((dep) => dep.name).join(", ")}]`,
    );
  }
  if (graph.dependents.length > 0) {
    lines.push(
      `${pad}  dependents=[${graph.dependents.map((dep) => dep.name).join(", ")}]`,
    );
  }
  if (graph.subscribers.length > 0) {
    lines.push(
      `${pad}  subscribers=[${graph.subscribers.map((sub) => sub.name).join(", ")}]`,
    );
  }
  return lines.join("\n");
}

export function formatHubGraph(graph: HubGraph): string {
  if (graph.pipes.length === 0) {
    return `Hub ${graph.name}`;
  }
  return [
    `Hub ${graph.name}`,
    ...graph.pipes.map((pipe) => formatPipeGraph(pipe, 1)),
  ].join("\n");
}
