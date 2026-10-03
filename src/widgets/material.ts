import { Container } from "../components/container";
import { Column, Row } from "../components/flex";
import { Expanded } from "../components/flex_child";
import { GestureDetector, MouseRegion } from "../components/gesture";
import { Image } from "../components/image";
import { Positioned } from "../components/positioned";
import { Stack } from "../components/stack";
import { createHost } from "../core/dom";
import { replaceChild } from "../core/patch";
import type { UINode } from "../core/types";
import { UIComponent } from "../core/UIComponent";
import { Alignment } from "../painting/alignment";
import { BoxDecoration } from "../painting/box_decoration";
import { BoxShadow } from "../painting/box_shadow";
import { Colors } from "../painting/colors";
import { BoxShape, Clip, StackFit } from "../painting/enums";
import { EdgeInsets } from "../painting/edge_insets";
import { CrossAxisAlignment, MainAxisAlignment } from "../layout/axis";
import { Theme } from "./theme";

export function CircleAvatar(props: {
  radius?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  child?: UIComponent;
} = {}): UIComponent {
  const radius = props.radius ?? 20;
  const size = radius * 2;
  return Container({
    width: size,
    height: size,
    alignment: Alignment.center,
    clipBehavior: Clip.hardEdge,
    decoration: BoxDecoration({
      color: props.backgroundColor ?? Colors.grey,
      shape: BoxShape.circle,
    }),
    child: props.backgroundImage
      ? Image({
          src: props.backgroundImage,
          width: size,
          height: size,
          fit: "cover",
        })
      : props.child,
  });
}

export function InkWell(props: {
  onTap?: () => void;
  onHover?: () => void;
  child?: UIComponent;
} = {}): UIComponent {
  return MouseRegion({
    cursor: "pointer",
    onEnter: props.onHover,
    child: GestureDetector({
      onTap: props.onTap,
      child: props.child,
    }),
  });
}

export interface AppBarProps {
  title?: UIComponent;
  leading?: UIComponent;
  actions?: UIComponent[];
  backgroundColor?: string;
  elevation?: number;
  toolbarHeight?: number;
}

export class AppBarComponent extends UIComponent {
  readonly kind = "AppBar";
  private child?: UIComponent;

  constructor(readonly props: AppBarProps = {}) {
    super();
  }

  override childNodes(): UINode[] {
    return this.child ? [this.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "contents";
    this.child = this.build();
    this.child.mount(element);
    return element;
  }

  private build(): UIComponent {
    const theme = Theme.of();
    const height = this.props.toolbarHeight ?? 56;
    const color = this.props.backgroundColor ?? theme.primaryColor;
    const elevation = this.props.elevation ?? 4;
    const leadingAndTitle = [
      ...(this.props.leading ? [this.props.leading] : []),
      ...(this.props.title ? [this.props.title] : []),
    ];
    return Container({
      width: "100%",
      height,
      padding: EdgeInsets.symmetric({ horizontal: 8 }),
      decoration: BoxDecoration({
        color,
        boxShadow: BoxShadow({
          offsetY: Math.max(1, elevation / 2),
          blurRadius: elevation,
          color: "rgba(0,0,0,0.24)",
        }),
      }),
      child: Row({
        width: "100%",
        height,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row({
            gap: 12,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: leadingAndTitle,
          }),
          Row({
            gap: 4,
            children: this.props.actions ?? [],
          }),
        ],
      }),
    });
  }
}

export function AppBar(props: AppBarProps = {}): AppBarComponent {
  return new AppBarComponent(props);
}

export interface ScaffoldProps {
  appBar?: UIComponent;
  body?: UIComponent;
  floatingActionButton?: UIComponent;
  bottomNavigationBar?: UIComponent;
  backgroundColor?: string;
}

export class ScaffoldComponent extends UIComponent {
  readonly kind = "Scaffold";
  private child?: UIComponent;

  constructor(readonly props: ScaffoldProps) {
    super();
  }

  override childNodes(): UINode[] {
    return this.child ? [this.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "contents";
    this.child = this.build();
    this.child.mount(element);
    return element;
  }

  private build(): UIComponent {
    const background = this.props.backgroundColor ?? Theme.of().colorScheme.background;
    const column = Column({
      width: "100%",
      height: "100%",
      children: [
        ...(this.props.appBar ? [this.props.appBar] : []),
        Expanded({
          child: this.props.body ?? Container({}),
        }),
        ...(this.props.bottomNavigationBar ? [this.props.bottomNavigationBar] : []),
      ],
    });
    if (!this.props.floatingActionButton) {
      return Container({
        width: "100%",
        height: "100%",
        color: background,
        child: column,
      });
    }
    return Container({
      width: "100%",
      height: "100%",
      color: background,
      child: Stack({
        fit: StackFit.expand,
        children: [
          column,
          Positioned({
            right: 16,
            bottom: 16,
            child: this.props.floatingActionButton,
          }),
        ],
      }),
    });
  }
}

export function Scaffold(props: ScaffoldProps): ScaffoldComponent {
  return new ScaffoldComponent(props);
}

class FutureBuilderComponent<T> extends UIComponent {
  readonly kind = "FutureBuilder";
  private snapshot: { waiting: boolean; data?: T; error?: unknown } = { waiting: true };
  private child?: UINode;

  constructor(
    readonly props: {
      future: Promise<T>;
      builder: (snapshot: { waiting: boolean; data?: T; error?: unknown }) => UINode;
    },
  ) {
    super();
  }

  override childNodes(): UINode[] {
    return this.child ? [this.child] : [];
  }

  createElement(): HTMLElement {
    const element = createHost("div");
    element.style.display = "contents";
    this.child = this.props.builder(this.snapshot);
    this.child.mount(element);
    void this.props.future
      .then((data) => {
        this.snapshot = { waiting: false, data };
        this.rebuild(element);
      })
      .catch((error: unknown) => {
        this.snapshot = { waiting: false, error };
        this.rebuild(element);
      });
    return element;
  }

  private rebuild(element: HTMLElement): void {
    this.child = replaceChild(
      element,
      this.child,
      this.props.builder(this.snapshot),
    );
  }
}

export function FutureBuilder<T>(props: {
  future: Promise<T>;
  builder: (snapshot: { waiting: boolean; data?: T; error?: unknown }) => UINode;
}): UIComponent {
  return new FutureBuilderComponent(props);
}
