import type { Hub } from "./hub";
import type { HubConstructor } from "./read";

export type HubScope = "local" | "global";

const globals = new Map<Function, Hub>();

export const HubRuntime = {
  obtain<T extends Hub>(create: () => T, scope: HubScope = "local"): T {
    const created = create();
    if (scope !== "global") {
      return created;
    }
    const existing = globals.get(created.constructor);
    if (existing && existing !== created && !existing.disposed) {
      created.dispose();
      return existing as T;
    }
    globals.set(created.constructor, created);
    return created;
  },

  registerGlobal(hub: Hub): void {
    if (hub.disposed) {
      throw new Error(`Cannot register a disposed Hub (${hub.name}) as global`);
    }
    globals.set(hub.constructor, hub);
  },

  peekGlobal<T extends Hub>(type: HubConstructor<T>): T | undefined {
    const hub = globals.get(type);
    if (!hub || hub.disposed) {
      return undefined;
    }
    return hub as T;
  },

  release(hub: Hub, scope: HubScope = "local"): void {
    if (scope === "global" || hub.disposed) {
      return;
    }
    hub.dispose();
  },

  disposeGlobals(): void {
    for (const hub of globals.values()) {
      if (!hub.disposed) {
        hub.dispose();
      }
    }
    globals.clear();
  },
};
