import { HubRuntime, provideHub, unprovideHub, type Hub } from "pipe_x";
import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { UINode } from "../core/types";
import { findOutlet, type OutletComponent } from "./outlet";
import {
  locationKey,
  matchPattern,
  normalizePath,
  parseLocation,
  parseQuery,
} from "./path";
import type { RouteComponent } from "./route";
import type { RouterState } from "./state";

const MAX_REDIRECTS = 16;

export interface RouterHubs {
  global?: Array<() => Hub>;
}

export interface RouterProps {
  routes: RouteComponent[];
  hubs?: RouterHubs;
  initialPath?: string;
  notFound?: (state: RouterState) => UINode;
  redirect?: (state: RouterState) => string | null | undefined;
  onChange?: (state: RouterState) => void;
}

interface RouteMatch {
  chain: RouteComponent[];
  params: Record<string, string>;
}

interface MountedSegment {
  route?: RouteComponent;
  node: UINode;
  outlet?: OutletComponent;
}

function windowHref(): string {
  return `${normalizePath(window.location.pathname)}${window.location.search}`;
}

function windowLocation(): { pathname: string; search: string } {
  return {
    pathname: normalizePath(window.location.pathname),
    search: window.location.search,
  };
}

function toHref(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

function makeState(
  pathname: string,
  search: string,
  params: Record<string, string> = {},
): RouterState {
  return {
    path: pathname,
    params,
    query: parseQuery(search),
    uri: new URL(toHref(pathname, search), window.location.origin),
  };
}

function matchRoutes(
  routes: RouteComponent[],
  pathname: string,
  inherited: Record<string, string> = {},
): RouteMatch | null {
  for (const route of routes) {
    const matched = matchRoute(route, pathname, inherited);
    if (matched) {
      return matched;
    }
  }
  return null;
}

function matchRoute(
  route: RouteComponent,
  pathname: string,
  inherited: Record<string, string>,
): RouteMatch | null {
  const children = route.props.routes ?? [];
  if (children.length > 0) {
    const prefix = matchPattern(route.props.path, pathname, { prefix: true });
    if (!prefix) {
      return null;
    }
    const params = { ...inherited, ...prefix.params };
    const childMatch = matchRoutes(children, prefix.rest, params);
    if (childMatch) {
      return { chain: [route, ...childMatch.chain], params: childMatch.params };
    }
    if ((prefix.rest === "/" || prefix.rest === "") && route.props.builder) {
      return { chain: [route], params };
    }
    return null;
  }

  const full = matchPattern(route.props.path, pathname, { prefix: false });
  if (!full) {
    return null;
  }
  return { chain: [route], params: { ...inherited, ...full.params } };
}

function mountableRoutes(chain: RouteComponent[]): RouteComponent[] {
  return chain.filter((route) => route.props.builder);
}

function isLayout(route: RouteComponent): boolean {
  return Boolean(route.props.builder && (route.props.routes?.length ?? 0) > 0);
}

function firstDiff(previous: Array<RouteComponent | undefined>, next: RouteComponent[]): number {
  const limit = Math.min(previous.length, next.length);
  for (let i = 0; i < limit; i += 1) {
    if (previous[i] !== next[i]) {
      return i;
    }
  }
  return limit;
}

function nodeHost(node?: UINode): HTMLElement | undefined {
  if (!node || !("host" in node)) {
    return undefined;
  }
  return (node as { host?: HTMLElement }).host;
}

class NotFoundComponent extends UIComponent {
  readonly kind = "NotFound";

  constructor(private readonly message: string) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return { path: this.message };
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.textContent = `Not found: ${this.message}`;
    element.style.padding = "24px";
    element.style.fontFamily = "inherit";
    return element;
  }
}

/**
 * SPA router: the Router stays mounted, layouts stay mounted, and `Outlet`
 * swaps the matched leaf. `go` / `replace` write the URL then always commit.
 * Browser back/forward only read the URL.
 */
export class RouterComponent extends UIComponent {
  readonly kind = "Router";

  private mounted: MountedSegment[] = [];
  private readonly globalHubs: Hub[] = [];
  private current?: RouterState;
  private committing = false;
  private pendingCommit = false;
  private pendingForce = false;

  constructor(readonly props: RouterProps) {
    super();
  }

  private readonly onPopState = (): void => {
    this.commit(false);
  };

  override childNodes(): UINode[] {
    return this.mounted[0] ? [this.mounted[0].node] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    const params = this.current?.params;
    return omitUndefined({
      path: this.current?.path,
      params: params && Object.keys(params).length > 0 ? params : undefined,
    });
  }

  get state(): RouterState | undefined {
    return this.current;
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.width = "100%";
    element.style.height = "100%";
    return element;
  }

  override mount(parent: Element | DocumentFragment): HTMLElement {
    const element = super.mount(parent);
    this.mountGlobalHubs();
    window.addEventListener("popstate", this.onPopState);
    if (this.props.initialPath) {
      this.writeLocation(this.props.initialPath, "replace");
    }
    this.commit(true);
    return element;
  }

  override unmount(): void {
    window.removeEventListener("popstate", this.onPopState);
    this.detachFrom(0);
    this.disposeGlobalHubs();
    super.unmount();
    this.current = undefined;
    this.committing = false;
    this.pendingCommit = false;
    this.pendingForce = false;
  }

  private mountGlobalHubs(): void {
    for (const create of this.props.hubs?.global ?? []) {
      const hub = HubRuntime.obtain(create, "global");
      HubRuntime.registerGlobal(hub);
      provideHub(hub);
      this.globalHubs.push(hub);
    }
  }

  private disposeGlobalHubs(): void {
    for (const hub of this.globalHubs) {
      unprovideHub(hub);
    }
    this.globalHubs.length = 0;
    HubRuntime.disposeGlobals();
  }

  go(path: string): void {
    this.assertMounted("go");
    this.writeLocation(path, "push");
    this.commit(true);
  }

  replace(path: string): void {
    this.assertMounted("replace");
    this.writeLocation(path, "replace");
    this.commit(true);
  }

  pop(): void {
    this.assertMounted("pop");
    window.history.back();
  }

  private writeLocation(path: string, mode: "push" | "replace"): void {
    const next = parseLocation(path);
    const href = toHref(next.pathname, next.search);
    if (windowHref() === href) {
      return;
    }
    if (mode === "push") {
      window.history.pushState({ path: href }, "", href);
    } else {
      window.history.replaceState({ path: href }, "", href);
    }
  }

  private commit(force: boolean): void {
    if (!this.host) {
      return;
    }
    if (this.committing) {
      this.pendingCommit = true;
      this.pendingForce = this.pendingForce || force;
      return;
    }
    this.committing = true;
    try {
      do {
        const forceNow = force || this.pendingForce;
        this.pendingCommit = false;
        this.pendingForce = false;
        this.commitFromLocation(forceNow);
      } while (this.pendingCommit && this.host);
    } finally {
      this.committing = false;
    }
  }

  private commitFromLocation(force: boolean): void {
    if (!this.host) {
      return;
    }

    for (let hops = 0; hops <= MAX_REDIRECTS; hops += 1) {
      const { pathname, search } = windowLocation();
      let state = makeState(pathname, search);

      const globalRedirect = this.props.redirect?.(state);
      if (globalRedirect) {
        this.writeLocation(globalRedirect, "replace");
        continue;
      }

      const matched = matchRoutes(this.props.routes, pathname);
      if (matched) {
        state = makeState(pathname, search, matched.params);
        let redirected = false;
        for (const route of matched.chain) {
          const target = route.props.redirect?.(state);
          if (target) {
            this.writeLocation(target, "replace");
            redirected = true;
            break;
          }
        }
        if (redirected) {
          continue;
        }
      }

      const nextRoutes = matched ? mountableRoutes(matched.chain) : [];
      if (!force && this.chainMatches(nextRoutes, state)) {
        this.current = state;
        return;
      }

      this.applyChain(state, nextRoutes, force);
      return;
    }

    const fallback = windowLocation();
    this.applyChain(makeState(fallback.pathname, fallback.search), [], true);
  }

  private chainMatches(nextRoutes: RouteComponent[], state: RouterState): boolean {
    if (
      !this.current ||
      locationKey(this.current.path, this.current.uri.search) !==
        locationKey(state.path, state.uri.search)
    ) {
      return false;
    }
    if (this.mounted.length !== nextRoutes.length) {
      return false;
    }
    return this.mounted.every((segment, index) => {
      const host = nodeHost(segment.node);
      return (
        segment.route === nextRoutes[index] &&
        Boolean(host && (this.host?.contains(host) || host === this.host))
      );
    });
  }

  private applyChain(
    state: RouterState,
    nextRoutes: RouteComponent[],
    force: boolean,
  ): void {
    let from = firstDiff(
      this.mounted.map((segment) => segment.route),
      nextRoutes,
    );
    if (force && from === nextRoutes.length && nextRoutes.length > 0) {
      from = nextRoutes.length - 1;
    }
    if (nextRoutes.length === 0) {
      from = 0;
    }

    this.detachFrom(from);

    if (nextRoutes.length === 0) {
      const page =
        this.props.notFound?.(state) ?? new NotFoundComponent(state.path);
      this.attach(page, undefined);
    } else {
      for (let i = from; i < nextRoutes.length; i += 1) {
        const route = nextRoutes[i];
        const node = route.props.builder?.(state);
        if (!node) {
          continue;
        }
        if (isLayout(route)) {
          const outlet = findOutlet(node);
          if (!outlet) {
            throw new Error(
              `Layout route "${route.props.path}" must contain Outlet()`,
            );
          }
          this.attach(node, route, outlet);
        } else {
          this.attach(node, route);
        }
      }
    }

    this.current = state;
    this.props.onChange?.(state);
  }

  private attach(
    node: UINode,
    route?: RouteComponent,
    outlet?: OutletComponent,
  ): void {
    const parent = this.mounted[this.mounted.length - 1];
    if (parent?.outlet) {
      parent.outlet.setPage(node);
    } else {
      this.host?.replaceChildren();
      node.mount(this.host!);
    }
    this.mounted.push({ route, node, outlet });
  }

  private detachFrom(index: number): void {
    if (index >= this.mounted.length) {
      return;
    }
    const parent = index === 0 ? undefined : this.mounted[index - 1];
    try {
      if (parent?.outlet) {
        parent.outlet.setPage(undefined);
      } else {
        this.mounted[index]?.node.unmount();
        this.host?.replaceChildren();
      }
    } catch (error) {
      console.error("Router failed to unmount route", error);
      this.host?.replaceChildren();
    }
    this.mounted.length = index;
  }

  private assertMounted(method: string): void {
    if (!this.host) {
      throw new Error(`Router.${method}() called before mount()`);
    }
  }
}

export function Router(props: RouterProps): RouterComponent {
  return new RouterComponent(props);
}
