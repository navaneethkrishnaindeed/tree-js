import { Container, Route, Router, Text, Theme } from "../../src";
import { read } from "pipe_x";
import { NfColors, netflixTheme, nfText } from "../common/theme/nf_theme";
import { SessionHub } from "../modules/auth/application/session_hub";
import { loginPage } from "../modules/auth/ui/login_page";
import { browsePage } from "../modules/browse/ui/browse_page";
import { MyListHub } from "../modules/mylist/application/my_list_hub";
import { myListPage } from "../modules/mylist/ui/my_list_page";
import { searchPage } from "../modules/search/ui/search_page";
import { splashPage } from "../modules/splash/ui/splash_page";
import { titlePage } from "../modules/title/ui/title_page";
import { watchPage } from "../modules/title/ui/watch_page";
import { ChromeHub } from "./chrome_hub";
import { bindRouter } from "./navigation";
import { appShell } from "./shell";

export function bootstrap(): void {
  const router = Router({
    hubs: {
      global: [() => new SessionHub(), () => new MyListHub(), () => new ChromeHub()],
    },
    routes: [
      Route({ path: "/", redirect: () => "/splash" }),
      Route({ path: "/splash", builder: () => splashPage() }),
      Route({
        path: "/login",
        redirect: () => (read(SessionHub).isSignedIn ? "/browse" : undefined),
        builder: () => loginPage(),
      }),
      Route({
        path: "/",
        redirect: () => (read(SessionHub).isSignedIn ? undefined : "/login"),
        builder: () => appShell(),
        routes: [
          Route({ path: "/browse", builder: () => browsePage() }),
          Route({ path: "/title/:id", builder: (state) => titlePage(state.params.id) }),
          Route({ path: "/watch/:id", builder: (state) => watchPage(state.params.id) }),
          Route({ path: "/search", builder: () => searchPage() }),
          Route({ path: "/my-list", builder: () => myListPage() }),
        ],
      }),
    ],
    notFound: () =>
      Container({
        width: "100%",
        height: "100%",
        color: NfColors.black,
        child: Text({
          text: "Not found",
          style: nfText({ size: 18, color: NfColors.muted }),
        }),
      }),
  });
  bindRouter(router);
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Missing #app");
  }
  Theme({ data: netflixTheme, child: router }).mount(root);
}
