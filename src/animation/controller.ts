import { Duration } from "./duration";

export type AnimationStatus = "dismissed" | "forward" | "reverse" | "completed";

type TickListener = (value: number) => void;

export class AnimationControllerImpl {
  value = 0;
  status: AnimationStatus = "dismissed";
  private frame = 0;
  private readonly listeners: TickListener[] = [];
  private readonly durationMs: number;

  constructor(readonly props: { duration?: Duration; lowerBound?: number; upperBound?: number } = {}) {
    this.durationMs = props.duration?.inMilliseconds ?? 250;
  }

  addListener(listener: TickListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: TickListener): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  forward(): void {
    this.animateTo(this.props.upperBound ?? 1, "forward");
  }

  reverse(): void {
    this.animateTo(this.props.lowerBound ?? 0, "reverse");
  }

  stop(): void {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  dispose(): void {
    this.stop();
    this.listeners.length = 0;
  }

  private animateTo(target: number, status: AnimationStatus): void {
    this.stop();
    this.status = status;
    const start = this.value;
    const startTime = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - startTime) / Math.max(this.durationMs, 1));
      this.value = start + (target - start) * t;
      for (const listener of this.listeners) {
        listener(this.value);
      }
      if (t < 1) {
        this.frame = requestAnimationFrame(tick);
      } else {
        this.status = target >= (this.props.upperBound ?? 1) ? "completed" : "dismissed";
        this.frame = 0;
      }
    };
    this.frame = requestAnimationFrame(tick);
  }
}

export type AnimationController = AnimationControllerImpl;

export function AnimationController(props: {
  duration?: Duration;
  lowerBound?: number;
  upperBound?: number;
} = {}): AnimationController {
  return new AnimationControllerImpl(props);
}
