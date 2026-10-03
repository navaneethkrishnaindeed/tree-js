import { Hub } from "pipe_x";
import { currentPath, onNavigate } from "./navigation";

export class ChromeHub extends Hub {
  readonly solid = this.pipe(false, { key: "solid" });
  readonly path = this.pipe(currentPath(), { key: "path" });
  private readonly stopNavigate: () => void;

  constructor() {
    super();
    this.stopNavigate = onNavigate(() => {
      this.path.value = currentPath();
    });
  }

  protected override onDispose(): void {
    this.stopNavigate();
  }
}
