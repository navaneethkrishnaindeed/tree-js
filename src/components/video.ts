import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { toCssSize, type Dimension } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { BoxFit, boxFitToObjectFit, type BoxFit as BoxFitValue } from "../painting/box_fit";

export interface VideoProps {
  src: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  fit?: BoxFitValue | "cover" | "contain";
  width?: Dimension;
  height?: Dimension;
}

export class VideoComponent extends UIComponent {
  readonly kind = "Video";

  constructor(readonly props: VideoProps) {
    super();
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({ ...this.props });
  }

  createElement(): HTMLElement {
    const element = createHost("video");
    element.src = this.props.src;
    element.controls = this.props.controls ?? true;
    element.autoplay = this.props.autoplay ?? false;
    element.muted = this.props.muted ?? this.props.autoplay ?? false;
    element.loop = this.props.loop ?? false;
    element.playsInline = true;
    element.style.width = toCssSize(this.props.width ?? "100%");
    element.style.height = toCssSize(this.props.height ?? "100%");
    element.style.objectFit = boxFitToObjectFit(
      (this.props.fit as BoxFitValue | undefined) ?? BoxFit.cover,
    );
    element.style.background = "#000000";
    element.style.display = "block";
    return element;
  }
}

export function Video(props: VideoProps): VideoComponent {
  return new VideoComponent(props);
}
