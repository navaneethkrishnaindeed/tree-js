import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";

export interface IFrameProps {
  src: string;
  title?: string;
  allow?: string;
  width?: Dimension;
  height?: Dimension;
}

export class IFrameComponent extends UIComponent {
  readonly kind = "IFrame";

  constructor(readonly props: IFrameProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ ...this.props });
  }

  createElement(): HTMLElement {
    const element = createHost("iframe");
    element.src = this.props.src;
    element.title = this.props.title ?? "Frame";
    element.allow =
      this.props.allow ??
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    element.allowFullscreen = true;
    element.referrerPolicy = "strict-origin-when-cross-origin";
    element.style.width = toCssSize(this.props.width ?? "100%");
    element.style.height = toCssSize(this.props.height ?? "100%");
    element.style.border = "0";
    element.style.background = "#000000";
    element.style.display = "block";
    return element;
  }
}

export function IFrame(props: IFrameProps): IFrameComponent {
  return new IFrameComponent(props);
}
