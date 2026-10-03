import { Hub } from "pipe_x";
import type { IntroPhase } from "../../../common/ui/intro_stage";

export class SplashHub extends Hub {
  readonly phase = this.pipe<IntroPhase>("n", { key: "phase" });
  private readonly timers: number[] = [];

  constructor() {
    super();
    this.timers.push(
      window.setTimeout(() => {
        if (!this.disposed) {
          this.phase.value = "flash";
        }
      }, 1600),
    );
    this.timers.push(
      window.setTimeout(() => {
        if (!this.disposed) {
          this.phase.value = "done";
        }
      }, 2600),
    );
  }

  skip(): void {
    this.phase.value = "done";
  }

  protected override onDispose(): void {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
    }
    this.timers.length = 0;
  }
}
