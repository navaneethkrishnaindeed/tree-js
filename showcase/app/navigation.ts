import type { RouterComponent } from "../../src";

let router: RouterComponent | undefined;
const listeners = new Set<() => void>();

export function bindRouter(instance: RouterComponent): void {
  router = instance;
  window.addEventListener("popstate", notify);
}

export function currentPath(): string {
  return router?.state?.path ?? window.location.pathname;
}

export function onNavigate(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function go(path: string): void {
  router?.go(path);
  notify();
}

export function replace(path: string): void {
  router?.replace(path);
  notify();
}
