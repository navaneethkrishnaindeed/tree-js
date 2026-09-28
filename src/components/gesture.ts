import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { Offset } from "../painting/offset";

export interface GestureDetectorProps {
  child?: UIComponent;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPanStart?: (offset: Offset) => void;
  onPanUpdate?: (offset: Offset) => void;
  onPanEnd?: () => void;
}

export class GestureDetectorComponent extends UIComponent {
  readonly kind = "GestureDetector";

  constructor(readonly props: GestureDetectorProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      onTap: this.props.onTap,
      onDoubleTap: this.props.onDoubleTap,
      onLongPress: this.props.onLongPress,
      onPanStart: this.props.onPanStart,
      onPanUpdate: this.props.onPanUpdate,
      onPanEnd: this.props.onPanEnd,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.touchAction = "none";
    this.props.child?.mount(element);

    let longPressTimer: number | undefined;
    let longPressFired = false;
    let lastTap = 0;
    let dragging = false;

    const clearLongPress = (): void => {
      if (longPressTimer !== undefined) {
        window.clearTimeout(longPressTimer);
        longPressTimer = undefined;
      }
    };

    element.addEventListener("pointerdown", (event) => {
      dragging = true;
      longPressFired = false;
      this.props.onPanStart?.(Offset(event.offsetX, event.offsetY));
      longPressTimer = window.setTimeout(() => {
        longPressFired = true;
        longPressTimer = undefined;
        this.props.onLongPress?.();
      }, 500);
    });

    element.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      clearLongPress();
      this.props.onPanUpdate?.(Offset(event.offsetX, event.offsetY));
    });

    const end = (): void => {
      if (!dragging) {
        return;
      }
      dragging = false;
      this.props.onPanEnd?.();
    };

    element.addEventListener("pointerup", () => {
      clearLongPress();
      end();
      if (longPressFired) {
        return;
      }
      const now = Date.now();
      if (now - lastTap < 300) {
        this.props.onDoubleTap?.();
        lastTap = 0;
        return;
      }
      lastTap = now;
      this.props.onTap?.();
    });
    element.addEventListener("pointerleave", () => {
      clearLongPress();
      end();
    });

    return element;
  }
}

export function GestureDetector(props: GestureDetectorProps = {}): GestureDetectorComponent {
  return new GestureDetectorComponent(props);
}

export interface IgnorePointerProps {
  ignoring?: boolean;
  child?: UIComponent;
}

export class IgnorePointerComponent extends UIComponent {
  readonly kind = "IgnorePointer";

  constructor(readonly props: IgnorePointerProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.ignoring !== false) {
      element.style.pointerEvents = "none";
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function IgnorePointer(props: IgnorePointerProps = {}): IgnorePointerComponent {
  return new IgnorePointerComponent(props);
}

export interface AbsorbPointerProps {
  absorbing?: boolean;
  child?: UIComponent;
}

export class AbsorbPointerComponent extends UIComponent {
  readonly kind = "AbsorbPointer";

  constructor(readonly props: AbsorbPointerProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    this.props.child?.mount(element);
    if (this.props.absorbing !== false) {
      for (const child of Array.from(element.children)) {
        (child as HTMLElement).style.pointerEvents = "none";
      }
    }
    return element;
  }
}

export function AbsorbPointer(props: AbsorbPointerProps = {}): AbsorbPointerComponent {
  return new AbsorbPointerComponent(props);
}

export interface MouseRegionProps {
  cursor?: string;
  onEnter?: () => void;
  onExit?: () => void;
  onHover?: () => void;
  child?: UIComponent;
}

export class MouseRegionComponent extends UIComponent {
  readonly kind = "MouseRegion";

  constructor(readonly props: MouseRegionProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    if (this.props.cursor) {
      element.style.cursor = this.props.cursor;
    }
    if (this.props.onEnter) {
      element.addEventListener("mouseenter", this.props.onEnter);
    }
    if (this.props.onExit) {
      element.addEventListener("mouseleave", this.props.onExit);
    }
    if (this.props.onHover) {
      element.addEventListener("mousemove", this.props.onHover);
    }
    this.props.child?.mount(element);
    return element;
  }
}

export function MouseRegion(props: MouseRegionProps = {}): MouseRegionComponent {
  return new MouseRegionComponent(props);
}
