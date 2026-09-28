export function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

export function splitPath(path: string): string[] {
  const normalized = normalizePath(path);
  if (normalized === "/") {
    return [];
  }
  return normalized.slice(1).split("/");
}

export function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseQuery(search: string): Record<string, string> {
  const query: Record<string, string> = {};
  const raw = search.startsWith("?") ? search.slice(1) : search;
  if (!raw) {
    return query;
  }
  const params = new URLSearchParams(raw);
  params.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

export function parseLocation(path: string): { pathname: string; search: string } {
  const url = new URL(path, "http://local.invalid");
  return {
    pathname: normalizePath(url.pathname),
    search: url.search,
  };
}

export function locationKey(pathname: string, search: string): string {
  return `${normalizePath(pathname)}${search}`;
}

/**
 * Match a route pattern against a pathname.
 *
 * `:param` captures a segment. `*` as the last segment captures the rest.
 * `prefix: true` leaves unmatched trailing segments in `rest` for nested routes.
 */
export function matchPattern(
  pattern: string,
  pathname: string,
  options: { prefix?: boolean } = {},
): { params: Record<string, string>; rest: string } | null {
  const pat = splitPath(pattern);
  const loc = splitPath(pathname);
  const params: Record<string, string> = {};
  let i = 0;
  let j = 0;

  while (i < pat.length) {
    const segment = pat[i];
    if (segment === "*") {
      params["*"] = loc.slice(j).map(decodeSegment).join("/");
      j = loc.length;
      i += 1;
      break;
    }
    if (j >= loc.length) {
      return null;
    }
    if (segment.startsWith(":") && segment.length > 1) {
      params[segment.slice(1)] = decodeSegment(loc[j]);
    } else if (segment !== loc[j]) {
      return null;
    }
    i += 1;
    j += 1;
  }

  if (!options.prefix && j !== loc.length) {
    return null;
  }

  const restSegments = loc.slice(j);
  const rest = restSegments.length === 0 ? "/" : `/${restSegments.join("/")}`;
  return { params, rest };
}
