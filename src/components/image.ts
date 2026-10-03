import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension, type UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";
import { BoxFit, boxFitToObjectFit, type BoxFit as BoxFitValue } from "../painting/box_fit";
import { objectPositionFromAlignment } from "../painting/enums";

export interface ImageProps {
  src: string;
  width?: Dimension;
  height?: Dimension;
  alt?: string;
  fit?: BoxFitValue | "cover" | "contain" | "fill" | "none" | "scale-down";
  alignment?: Alignment;
  cacheWidth?: number;
  cacheHeight?: number;
}

function resolveFit(fit: ImageProps["fit"]): string | undefined {
  if (fit === undefined) {
    return undefined;
  }
  if (fit === "scale-down") {
    return "scale-down";
  }
  if (
    fit === BoxFit.fill ||
    fit === BoxFit.contain ||
    fit === BoxFit.cover ||
    fit === BoxFit.fitWidth ||
    fit === BoxFit.fitHeight ||
    fit === BoxFit.none ||
    fit === BoxFit.scaleDown
  ) {
    return boxFitToObjectFit(fit);
  }
  return fit;
}

export class ImageComponent extends UIComponent {
  readonly kind = "Image";
  props: ImageProps;

  constructor(props: ImageProps) {
    super();
    this.props = props;
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ ...this.props });
  }

  createElement(): HTMLElement {
    const element = createHost("img");
    this.paint(element);
    return element;
  }

  private paint(element: HTMLImageElement): void {
    element.src = this.props.src;
    element.alt = this.props.alt ?? "";
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    const fit = resolveFit(this.props.fit);
    if (fit) {
      element.style.objectFit = fit;
    }
    if (this.props.fit === BoxFit.fitWidth) {
      element.style.width = "100%";
      element.style.height = "auto";
    }
    if (this.props.fit === BoxFit.fitHeight) {
      element.style.height = "100%";
      element.style.width = "auto";
    }
    if (this.props.alignment) {
      element.style.objectPosition = objectPositionFromAlignment(
        this.props.alignment.x,
        this.props.alignment.y,
      );
    }
    if (this.props.cacheWidth) {
      element.width = this.props.cacheWidth;
    }
    if (this.props.cacheHeight) {
      element.height = this.props.cacheHeight;
    }
    element.style.display = "block";
  }

  override patchFrom(next: UINode): boolean {
    if (!(next instanceof ImageComponent) || !this.host) {
      return false;
    }
    this.props = next.props;
    this.paint(this.host as HTMLImageElement);
    return true;
  }
}

export function Image(props: ImageProps): ImageComponent {
  return new ImageComponent(props);
}
