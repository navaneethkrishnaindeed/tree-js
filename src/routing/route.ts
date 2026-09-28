import type { UIComponent } from "../core/UIComponent";
import type { RouterState } from "./state";

export interface RouteProps {
  path: string;
  builder?: (state: RouterState) => UIComponent;
  redirect?: (state: RouterState) => string | null | undefined;
  routes?: RouteComponent[];
}

export class RouteComponent {
  readonly kind = "Route";

  constructor(readonly props: RouteProps) {}
}

export function Route(props: RouteProps): RouteComponent {
  return new RouteComponent(props);
}
