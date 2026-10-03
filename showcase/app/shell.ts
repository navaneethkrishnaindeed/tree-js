import { read } from "pipe_x";
import {
  Clip,
  Outlet,
  Positioned,
  ScrollController,
  SingleChildScrollView,
  Stack,
  StackFit,
} from "../../src";
import { go } from "./navigation";
import { ChromeHub } from "./chrome_hub";
import { NfAppBar } from "../common/ui/nf_app_bar";
import { NfColors } from "../common/theme/nf_theme";
import { SessionHub } from "../modules/auth/application/session_hub";

export function appShell() {
  const chrome = read(ChromeHub);
  const controller = ScrollController();
  controller.addListener((position) => {
    const next = position.pixels > 24;
    if (chrome.solid.value !== next) {
      chrome.solid.value = next;
    }
  });
  return Stack({
    fit: StackFit.expand,
    height: "100%",
    clipBehavior: Clip.hardEdge,
    color: NfColors.black,
    children: [
      SingleChildScrollView({
        controller,
        width: "100%",
        height: "100%",
        child: Outlet(),
      }),
      Positioned({
        top: 0,
        left: 0,
        right: 0,
        child: NfAppBar({
          chrome,
          onSignOut: () => {
            read(SessionHub).signOut();
            go("/login");
          },
        }),
      }),
    ],
  });
}
