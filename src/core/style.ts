import { Alignment } from "../painting/alignment";
import type { BoxDecoration } from "../painting/box_decoration";
import { applyClip, type Clip } from "../painting/enums";
import type { EdgeInsets } from "../painting/edge_insets";
import type { Key } from "./key";
import { toCssSize, type Dimension, type Overflow, type Position } from "./types";

export interface BoxStyleProps {
  key?: Key;
  width?: Dimension;
  height?: Dimension;
  minWidth?: Dimension;
  maxWidth?: Dimension;
  minHeight?: Dimension;
  maxHeight?: Dimension;
  padding?: EdgeInsets;
  margin?: EdgeInsets;
  color?: string;
  decoration?: BoxDecoration;
  alignment?: Alignment;
  opacity?: number;
  overflow?: Overflow;
  clipBehavior?: Clip;
  position?: Position;
  display?: string;
  zIndex?: number;
}

export function applyBoxStyles(
  element: HTMLElement,
  props: BoxStyleProps,
): void {
  const { style } = element;

  if (props.width !== undefined) {
    style.width = toCssSize(props.width);
  }
  if (props.height !== undefined) {
    style.height = toCssSize(props.height);
  }
  if (props.minWidth !== undefined) {
    style.minWidth = toCssSize(props.minWidth);
  }
  if (props.maxWidth !== undefined) {
    style.maxWidth = toCssSize(props.maxWidth);
  }
  if (props.minHeight !== undefined) {
    style.minHeight = toCssSize(props.minHeight);
  }
  if (props.maxHeight !== undefined) {
    style.maxHeight = toCssSize(props.maxHeight);
  }
  if (props.padding) {
    style.padding = props.padding.toCss();
  }
  if (props.margin) {
    style.margin = props.margin.toCss();
  }
  if (props.decoration) {
    props.decoration.applyTo(style);
  } else if (props.color !== undefined) {
    style.backgroundColor = props.color;
  }
  if (props.opacity !== undefined) {
    style.opacity = String(props.opacity);
  }
  if (props.overflow !== undefined) {
    style.overflow = props.overflow;
  }
  applyClip(style, props.clipBehavior);
  if (props.position !== undefined) {
    style.position = props.position;
  }
  if (props.zIndex !== undefined) {
    style.zIndex = String(props.zIndex);
  }
  if (props.display !== undefined) {
    style.display = props.display;
  } else if (props.alignment) {
    style.display = "flex";
    style.justifyContent = props.alignment.toJustifyContent();
    style.alignItems = props.alignment.toAlignItems();
  }
}
