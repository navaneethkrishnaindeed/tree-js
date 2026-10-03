import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { DismissDirection } from "../painting/enums";

export interface DismissibleProps {
  child?: UIComponent;
  onDismissed?: () => void;
  direction?: DismissDirection | "endToStart" | "startToEnd" | "horizontal";
}

export class DismissibleComponent extends UIComponent {
  readonly kind = "Dismissible";

  constructor(readonly props: DismissibleProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      direction: this.props.direction,
      onDismissed: this.props.onDismissed,
    });
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.touchAction = "pan-y";
    element.style.transition = "transform 200ms ease, opacity 200ms ease";
    this.props.child?.mount(element);

    let startX = 0;
    let dragging = false;

    element.addEventListener("pointerdown", (event) => {
      dragging = true;
      startX = event.clientX;
      element.style.transition = "none";
    });
    element.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      const dx = event.clientX - startX;
      const direction = this.props.direction ?? "horizontal";
      if (direction === "endToStart" && dx > 0) {
        return;
      }
      if (direction === "startToEnd" && dx < 0) {
        return;
      }
      element.style.transform = `translateX(${dx}px)`;
    });
    const finish = (event: PointerEvent): void => {
      if (!dragging) {
        return;
      }
      dragging = false;
      element.style.transition = "transform 200ms ease, opacity 200ms ease";
      const dx = event.clientX - startX;
      if (Math.abs(dx) > element.offsetWidth * 0.4) {
        element.style.transform = `translateX(${dx > 0 ? 100 : -100}%)`;
        element.style.opacity = "0";
        window.setTimeout(() => {
          element.style.display = "none";
          this.props.onDismissed?.();
        }, 200);
      } else {
        element.style.transform = "translateX(0)";
      }
    };
    element.addEventListener("pointerup", finish);
    element.addEventListener("pointercancel", finish);
    return element;
  }
}

export function Dismissible(props: DismissibleProps = {}): DismissibleComponent {
  return new DismissibleComponent(props);
}

export interface DraggableProps {
  child?: UIComponent;
  data?: string;
  onDragStarted?: () => void;
}

export class DraggableComponent extends UIComponent {
  readonly kind = "Draggable";

  constructor(readonly props: DraggableProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.draggable = true;
    element.style.cursor = "grab";
    element.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", this.props.data ?? "");
      this.props.onDragStarted?.();
    });
    this.props.child?.mount(element);
    return element;
  }
}

export function Draggable(props: DraggableProps = {}): DraggableComponent {
  return new DraggableComponent(props);
}

export interface DragTargetProps {
  child?: UIComponent;
  onAccept?: (data: string) => void;
}

export class DragTargetComponent extends UIComponent {
  readonly kind = "DragTarget";

  constructor(readonly props: DragTargetProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    element.addEventListener("drop", (event) => {
      event.preventDefault();
      const data = event.dataTransfer?.getData("text/plain") ?? "";
      this.props.onAccept?.(data);
    });
    this.props.child?.mount(element);
    return element;
  }
}

export function DragTarget(props: DragTargetProps = {}): DragTargetComponent {
  return new DragTargetComponent(props);
}

export interface InteractiveViewerProps {
  child?: UIComponent;
  minScale?: number;
  maxScale?: number;
}

export class InteractiveViewerComponent extends UIComponent {
  readonly kind = "InteractiveViewer";

  constructor(readonly props: InteractiveViewerProps = {}) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.child ? [this.props.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.overflow = "hidden";
    element.style.touchAction = "none";
    const inner = createHost("div");
    inner.style.transformOrigin = "0 0";
    this.props.child?.mount(inner);
    element.appendChild(inner);

    let scale = 1;
    let x = 0;
    let y = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const min = this.props.minScale ?? 0.5;
    const max = this.props.maxScale ?? 4;

    const paint = (): void => {
      inner.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    };

    element.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
    });
    element.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      x += event.clientX - lastX;
      y += event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      paint();
    });
    element.addEventListener("pointerup", () => {
      dragging = false;
    });
    element.addEventListener("wheel", (event) => {
      event.preventDefault();
      const next = scale + (event.deltaY < 0 ? 0.1 : -0.1);
      scale = Math.min(max, Math.max(min, next));
      paint();
    }, { passive: false });

    return element;
  }
}

export function InteractiveViewer(props: InteractiveViewerProps = {}): InteractiveViewerComponent {
  return new InteractiveViewerComponent(props);
}
