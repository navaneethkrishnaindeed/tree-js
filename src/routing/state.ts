export interface RouterState {
  /** Pathname only, e.g. `/account/12`. */
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  uri: URL;
}
