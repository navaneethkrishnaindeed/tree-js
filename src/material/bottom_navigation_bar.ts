import { createHost } from "../core/dom";
import { omitUndefined } from "../core/inspect";
import { UIComponent } from "../core/UIComponent";
import { FontWeight } from "../layout/font_weight";
import { Colors } from "../painting/colors";
import { ThemeData } from "../painting/theme";
import { TextStyle } from "../painting/text_style";
import { Text } from "../components/text";

export interface BottomNavigationBarItemProps {
  icon: UIComponent;
  label: string;
  activeIcon?: UIComponent;
}

class BottomNavigationBarItemImpl {
  constructor(readonly props: BottomNavigationBarItemProps) {}

  inspect(): string {
    return `BottomNavigationBarItem(label: ${this.props.label})`;
  }

  toTreeValue(): unknown {
    return { label: this.props.label };
  }
}

export type BottomNavigationBarItem = BottomNavigationBarItemImpl;

export function BottomNavigationBarItem(
  props: BottomNavigationBarItemProps,
): BottomNavigationBarItem {
  return new BottomNavigationBarItemImpl(props);
}

export interface BottomNavigationBarProps {
  items: BottomNavigationBarItem[];
  currentIndex?: number;
  onTap?: (index: number) => void;
  backgroundColor?: string;
  selectedItemColor?: string;
  unselectedItemColor?: string;
}

export class BottomNavigationBarComponent extends UIComponent {
  readonly kind = "BottomNavigationBar";

  constructor(readonly props: BottomNavigationBarProps) {
    super();
  }

  override childNodes(): UIComponent[] {
    return this.props.items.flatMap((item) => [
      item.props.icon,
      ...(item.props.activeIcon ? [item.props.activeIcon] : []),
    ]);
  }

  protected override inspectProps(): Record<string, unknown> {
    return omitUndefined({
      currentIndex: this.props.currentIndex,
      backgroundColor: this.props.backgroundColor,
      selectedItemColor: this.props.selectedItemColor,
      unselectedItemColor: this.props.unselectedItemColor,
      items: this.props.items,
      onTap: this.props.onTap,
    });
  }

  createElement(): HTMLElement {
    const theme = ThemeData.light();
    const selectedColor =
      this.props.selectedItemColor ?? theme.colorScheme.primary;
    const unselectedColor = this.props.unselectedItemColor ?? Colors.grey600;
    let currentIndex = this.props.currentIndex ?? 0;

    const element = createHost("nav");
    element.style.display = "flex";
    element.style.flexShrink = "0";
    element.style.backgroundColor =
      this.props.backgroundColor ?? theme.colorScheme.surface;
    element.style.borderTop = `1px solid ${Colors.grey300}`;
    element.style.minHeight = "56px";
    element.style.zIndex = "4";

    const buttons: HTMLButtonElement[] = [];

    const paint = (): void => {
      buttons.forEach((button, index) => {
        const selected = index === currentIndex;
        button.style.color = selected ? selectedColor : unselectedColor;
        const iconSlot = button.querySelector("[data-slot='icon']") as HTMLElement | null;
        const activeSlot = button.querySelector("[data-slot='active-icon']") as HTMLElement | null;
        if (iconSlot && activeSlot) {
          iconSlot.style.display = selected ? "none" : "flex";
          activeSlot.style.display = selected ? "flex" : "none";
        }
        const label = button.querySelector("[data-slot='label']") as HTMLElement | null;
        if (label) {
          label.style.fontWeight = selected ? FontWeight.w600 : FontWeight.normal;
        }
      });
    };

    this.props.items.forEach((item, index) => {
      const button = createHost("button");
      button.type = "button";
      button.style.flex = "1";
      button.style.border = "none";
      button.style.background = "transparent";
      button.style.cursor = "pointer";
      button.style.display = "flex";
      button.style.flexDirection = "column";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.gap = "4px";
      button.style.padding = "6px 8px";
      button.style.fontFamily = "inherit";

      const iconSlot = createHost("span");
      iconSlot.dataset.slot = "icon";
      iconSlot.style.display = "flex";
      item.props.icon.mount(iconSlot);
      button.appendChild(iconSlot);

      if (item.props.activeIcon) {
        const activeSlot = createHost("span");
        activeSlot.dataset.slot = "active-icon";
        activeSlot.style.display = "none";
        item.props.activeIcon.mount(activeSlot);
        button.appendChild(activeSlot);
      }

      const labelHost = createHost("span");
      labelHost.dataset.slot = "label";
      Text({
        text: item.props.label,
        style: TextStyle({ fontSize: 12 }),
      }).mount(labelHost);
      button.appendChild(labelHost);

      button.addEventListener("click", () => {
        currentIndex = index;
        paint();
        this.props.onTap?.(index);
      });

      buttons.push(button);
      element.appendChild(button);
    });

    paint();
    return element;
  }
}

export function BottomNavigationBar(
  props: BottomNavigationBarProps,
): BottomNavigationBarComponent {
  return new BottomNavigationBarComponent(props);
}
