import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
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

export interface RouterProps {
  routes: RouteComponent[];
  initialPath?: string;
  notFound?: (state: RouterState) => UIComponent;
  redirect?: (state: RouterState) => string | null | undefined;
  onChange?: (state: RouterState) => void;
}

interface RouteMatch {
  chain: RouteComponent[];
  params: Record<string, string>;
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

function leafBuilder(chain: RouteComponent[]): RouteComponent | undefined {
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    if (chain[i].props.builder) {
      return chain[i];
    }
  }
  return undefined;
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

export class RouterComponent extends UIComponent {
  readonly kind = "Router";

  private page?: UIComponent;
  private current?: RouterState;
  private applying = false;

  constructor(readonly props: RouterProps) {
    super();
  }

  private readonly onPopState = (): void => {
    this.syncFromLocation();
  };

  override childNodes(): UIComponent[] {
    return this.page ? [this.page] : [];
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
    return element;
  }

  override mount(parent: Element | DocumentFragment): HTMLElement {
    const element = super.mount(parent);
    window.addEventListener("popstate", this.onPopState);
    const start = this.props.initialPath
      ? parseLocation(this.props.initialPath)
      : windowLocation();
    this.apply(start.pathname, start.search, this.props.initialPath ? "replace" : "none");
    return element;
  }

  override unmount(): void {
    window.removeEventListener("popstate", this.onPopState);
    super.unmount();
    this.page = undefined;
    this.current = undefined;
  }

  go(path: string): void {
    this.navigate(path, "push");
  }

  replace(path: string): void {
    this.navigate(path, "replace");
  }

  pop(): void {
    this.assertMounted("pop");
    window.history.back();
  }

  private navigate(path: string, mode: "push" | "replace"): void {
    this.assertMounted(mode === "push" ? "go" : "replace");
    const next = parseLocation(path);
    this.apply(next.pathname, next.search, mode);
  }

  private syncFromLocation(): void {
    if (!this.host || this.applying) {
      return;
    }
    const { pathname, search } = windowLocation();
    this.apply(pathname, search, "none");
  }

  private apply(
    pathname: string,
    search: string,
    mode: "push" | "replace" | "none",
    hops = 0,
  ): void {
    if (!this.host) {
      return;
    }
    if (hops > MAX_REDIRECTS) {
      this.render(makeState(pathname, search), new NotFoundComponent(pathname));
      return;
    }

    let state = makeState(pathname, search);
    const globalRedirect = this.props.redirect?.(state);
    if (globalRedirect) {
      const next = parseLocation(globalRedirect);
      this.apply(next.pathname, next.search, mode === "none" ? "replace" : mode, hops + 1);
      return;
    }

    const matched = matchRoutes(this.props.routes, pathname);
    if (matched) {
      state = makeState(pathname, search, matched.params);
      for (const route of matched.chain) {
        const redirected = route.props.redirect?.(state);
        if (redirected) {
          const next = parseLocation(redirected);
          this.apply(next.pathname, next.search, mode === "none" ? "replace" : mode, hops + 1);
          return;
        }
      }
    }

    const href = toHref(pathname, search);
    const sameLocation =
      this.current !== undefined &&
      locationKey(this.current.path, this.current.uri.search) ===
        locationKey(pathname, search);

    if (mode === "push" && !sameLocation) {
      window.history.pushState(null, "", href);
    } else if (mode === "replace" && window.location.pathname + window.location.search !== href) {
      window.history.replaceState(null, "", href);
    }

    const page = this.buildPage(state, matched);
    this.render(state, page);
  }

  private buildPage(state: RouterState, matched: RouteMatch | null): UIComponent {
    if (matched) {
      const leaf = leafBuilder(matched.chain);
      const page = leaf?.props.builder?.(state);
      if (page) {
        return page;
      }
    }
    return this.props.notFound?.(state) ?? new NotFoundComponent(state.path);
  }

  private render(state: RouterState, page: UIComponent): void {
    this.applying = true;
    try {
      this.page?.unmount();
      this.page = page;
      this.current = state;
      page.mount(this.host!);
      this.props.onChange?.(state);
    } finally {
      this.applying = false;
    }
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
