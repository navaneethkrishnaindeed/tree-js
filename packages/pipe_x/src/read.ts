import type { Hub } from "./hub";

export type HubConstructor<T extends Hub> = new (...args: any[]) => T;

const stacks = new Map<Function, Hub[]>();

export function provideHub(hub: Hub): void {
  const ctor = hub.constructor;
  const stack = stacks.get(ctor) ?? [];
  stack.push(hub);
  stacks.set(ctor, stack);
}

export function unprovideHub(hub: Hub): void {
  const ctor = hub.constructor;
  const stack = stacks.get(ctor);
  if (!stack) {
    return;
  }
  const index = stack.lastIndexOf(hub);
  if (index >= 0) {
    stack.splice(index, 1);
  }
  if (stack.length === 0) {
    stacks.delete(ctor);
  }
}

export function read<T extends Hub>(type: HubConstructor<T>): T {
  const stack = stacks.get(type);
  const hub = stack?.[stack.length - 1];
  if (!hub) {
    throw new Error(`No HubProvider for ${type.name}`);
  }
  return hub as T;
}
