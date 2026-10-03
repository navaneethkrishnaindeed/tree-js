import { Well } from "pipe_x";
import {
  Alignment,
  AnimatedContainer,
  BorderRadius,
  BoxDecoration,
  Container,
  CrossAxisAlignment,
  Duration,
  EdgeInsets,
  FontWeight,
  Icon,
  Icons,
  InkWell,
  MainAxisAlignment,
  Padding,
  Row,
  Text,
} from "../../../src";
import { go } from "../../app/navigation";
import type { ChromeHub } from "../../app/chrome_hub";
import { NfColors, nfText } from "../theme/nf_theme";

interface NavItem {
  label: string;
  path: string;
  pill?: boolean;
  match: (path: string) => boolean;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    path: "/browse",
    pill: true,
    match: (path) =>
      path === "/browse" || path.startsWith("/title/") || path.startsWith("/watch/"),
  },
  { label: "Shows", path: "/browse", match: () => false },
  { label: "Movies", path: "/browse", match: () => false },
  { label: "Games", path: "/browse", match: () => false },
  { label: "New & Popular", path: "/browse", match: () => false },
  { label: "My List", path: "/my-list", match: (path) => path === "/my-list" },
  {
    label: "Browse by Languages",
    path: "/search",
    match: (path) => path === "/search",
  },
];

function navLink(item: NavItem, path: string) {
  const active = item.match(path);
  return InkWell({
    onTap: () => go(item.path),
    child: Container({
      padding: EdgeInsets.symmetric({ horizontal: 10, vertical: 6 }),
      decoration: BoxDecoration({
        color: active && item.pill ? "#4D4D4D" : "transparent",
        borderRadius: BorderRadius.circular(20),
      }),
      child: Text({
        text: item.label,
        style: nfText({
          size: 14,
          weight: active ? FontWeight.w700 : FontWeight.w500,
          color: active ? NfColors.white : "#E5E5E5",
        }),
      }),
    }),
  });
}

function avatar() {
  return Container({
    width: 32,
    height: 32,
    alignment: Alignment.center,
    decoration: BoxDecoration({
      color: "#54B9C5",
      borderRadius: BorderRadius.circular(4),
    }),
    child: Text({
      text: "☺",
      style: nfText({ size: 16, color: NfColors.pureBlack }),
    }),
  });
}

export function NfAppBar(props: { onSignOut: () => void; chrome: ChromeHub }) {
  return Well({
    pipes: [props.chrome.solid, props.chrome.path],
    builder: () =>
      AnimatedContainer({
        duration: Duration({ milliseconds: 280 }),
        width: "100%",
        zIndex: 30,
        color: props.chrome.solid.value ? "rgba(15,15,15,0.96)" : "transparent",
        child: Row({
          width: "100%",
          height: 68,
          padding: EdgeInsets.symmetric({ horizontal: 48 }),
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row({
              gap: 14,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                InkWell({
                  onTap: () => go("/browse"),
                  child: Text({
                    text: "NETFLIX",
                    style: nfText({
                      size: 22,
                      weight: FontWeight.w900,
                      color: NfColors.red,
                      letterSpacing: 1.2,
                    }),
                  }),
                }),
                ...navItems.map((item) => navLink(item, props.chrome.path.value)),
              ],
            }),
            Row({
              gap: 18,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                InkWell({
                  onTap: () => go("/search"),
                  child: Icon({ icon: Icons.search, size: 22, color: NfColors.white }),
                }),
                Icon({ icon: Icons.notifications, size: 22, color: NfColors.white }),
                InkWell({
                  onTap: props.onSignOut,
                  child: Padding({
                    padding: EdgeInsets.only({ left: 4 }),
                    child: avatar(),
                  }),
                }),
              ],
            }),
          ],
        }),
      }),
  });
}
