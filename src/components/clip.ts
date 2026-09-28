import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import type { BorderRadius } from "../painting/border_radius";
import { CustomClipper } from "../painting/clipper";

function clipHost(child: UIComponent | undefined, apply: (el: HTMLElement) => void): HTMLElement {
  const element = createHost("div");
  element.style.overflow = "hidden";
  apply(element);
  child?.mount(element);
  return element;
}

export interface ClipRectProps {
  child?: UIComponent;
}

export class ClipRectComponent extends UIComponent {
  readonly kind = "ClipRect";

  constructor(readonly props: ClipRectProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    return clipHost(this.props.child, () => undefined);
  }
}

export function ClipRect(props: ClipRectProps = {}): ClipRectComponent {
  return new ClipRectComponent(props);
}

export interface ClipRRectProps {
  borderRadius?: BorderRadius;
  child?: UIComponent;
}

export class ClipRRectComponent extends UIComponent {
  readonly kind = "ClipRRect";

  constructor(readonly props: ClipRRectProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ borderRadius: this.props.borderRadius });
  }

  createElement(): HTMLElement {
    return clipHost(this.props.child, (element) => {
      if (this.props.borderRadius) {
        element.style.borderRadius = this.props.borderRadius.toCss();
      }
    });
  }
}

export function ClipRRect(props: ClipRRectProps = {}): ClipRRectComponent {
  return new ClipRRectComponent(props);
}

export interface ClipOvalProps {
  child?: UIComponent;
}

export class ClipOvalComponent extends UIComponent {
  readonly kind = "ClipOval";

  constructor(readonly props: ClipOvalProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    return clipHost(this.props.child, (element) => {
      element.style.borderRadius = "50%";
    });
  }
}

export function ClipOval(props: ClipOvalProps = {}): ClipOvalComponent {
  return new ClipOvalComponent(props);
}

export interface ClipPathProps {
  clipper?: CustomClipper;
  child?: UIComponent;
}

export class ClipPathComponent extends UIComponent {
  readonly kind = "ClipPath";

  constructor(readonly props: ClipPathProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ clipper: this.props.clipper });
  }

  createElement(): HTMLElement {
    const clipper = this.props.clipper ?? CustomClipper.rect();
    return clipHost(this.props.child, (element) => {
      element.style.overflow = "visible";
      element.style.clipPath = clipper.toCss();
    });
  }
}

export function ClipPath(props: ClipPathProps = {}): ClipPathComponent {
  return new ClipPathComponent(props);
}
