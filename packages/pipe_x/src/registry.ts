import type { Hub } from "./hub";
import type { AnyPipe } from "./pipe";

type InspectablePipe = AnyPipe;

const hubs = new Set<Hub>();
const pipes = new Set<InspectablePipe>();
const listeners = new Set<() => void>();
let enabled = false;

function emit(): void {
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch (error) {
      console.error("PipeXDev observer failed", error);
    }
  }
}

export const PipeXDev = {
  get isEnabled(): boolean {
    return enabled;
  },

  enable(): void {
    enabled = true;
  },

  disable(): void {
    enabled = false;
    hubs.clear();
    pipes.clear();
    emit();
  },

  registerHub(hub: Hub): void {
    if (!enabled || hub.disposed) {
      return;
    }
    hubs.add(hub);
    emit();
  },

  unregisterHub(hub: Hub): void {
    if (hubs.delete(hub)) {
      emit();
    }
  },

  registerPipe(pipe: InspectablePipe): void {
    if (!enabled || pipe.disposed) {
      return;
    }
    pipes.add(pipe);
    emit();
  },

  unregisterPipe(pipe: InspectablePipe): void {
    if (pipes.delete(pipe)) {
      emit();
    }
  },

  touch(_target?: Hub | InspectablePipe): void {
    if (!enabled) {
      return;
    }
    emit();
  },

  listHubs(): Hub[] {
    return [...hubs].filter((hub) => !hub.disposed);
  },

  listPipes(): InspectablePipe[] {
    return [...pipes].filter((pipe) => !pipe.disposed);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function inspect(target: Hub | InspectablePipe): void {
  if ("disposed" in target && target.disposed) {
    return;
  }
  PipeXDev.enable();
  if ("pipe" in target && typeof (target as Hub).pipe === "function") {
    PipeXDev.registerHub(target as Hub);
    return;
  }
  PipeXDev.registerPipe(target as InspectablePipe);
}
