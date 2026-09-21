import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface ImageProps {
  src: string;
  width?: Dimension;
  height?: Dimension;
  alt?: string;
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export class ImageComponent extends UIComponent {
  readonly kind = "Image";

  constructor(readonly props: ImageProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ ...this.props });
  }

  createElement(): HTMLElement {
    const element = createHost("img");
    element.src = this.props.src;
    element.alt = this.props.alt ?? "";
    if (this.props.width !== undefined) {
      element.style.width = toCssSize(this.props.width);
    }
    if (this.props.height !== undefined) {
      element.style.height = toCssSize(this.props.height);
    }
    if (this.props.fit !== undefined) {
      element.style.objectFit = this.props.fit;
    }
    element.style.display = "block";
    return element;
  }
}

export function Image(props: ImageProps): ImageComponent {
  return new ImageComponent(props);
}
