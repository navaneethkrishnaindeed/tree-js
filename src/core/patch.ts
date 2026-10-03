import type { UINode } from "./types";

export function tryPatchNode(prev: UINode, next: UINode): boolean {
  if (prev.kind !== next.kind) {
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

export function replaceChild(
  parent: HTMLElement,
  prev: UINode | undefined,
  next: UINode | undefined,
): UINode | undefined {
  if (prev && next && tryPatchNode(prev, next)) {
    return prev;
  }
  prev?.unmount();
  next?.mount(parent);
  return next;
}

export function replaceChildren(
  parent: HTMLElement,
  prev: UINode[],
  next: UINode[],
): UINode[] {
  const result: UINode[] = [];
  const count = Math.max(prev.length, next.length);
  for (let index = 0; index < count; index++) {
    const older = prev[index];
    const incoming = next[index];
    if (older && incoming && tryPatchNode(older, incoming)) {
      result.push(older);
      continue;
    }
    older?.unmount();
    if (incoming) {
      incoming.mount(parent);
      result.push(incoming);
    }
  }
  return result;
}
