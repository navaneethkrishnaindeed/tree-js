import {
  Alignment,
  AnimatedContainer,
  AspectRatio,
  BackdropFilter,
  Border,
  BorderRadius,
  BoxDecoration,
  Button,
  Card,
  ClipOval,
  ClipPath,
  ClipRRect,
  ColorFilter,
  ColorFiltered,
  Colors,
  Column,
  Container,
  CrossAxisAlignment,
  Curves,
  CustomClipper,
  CustomPaint,
  Divider,
  Duration,
  EdgeInsets,
  Expanded,
  FontWeight,
  GestureDetector,
  GridView,
  Icon,
  Icons,
  Image,
  ListTile,
  MainAxisAlignment,
  Padding,
  PageView,
  RichText,
  Route,
  Router,
  Row,
  SizedBox,
  Stack,
  Text,
  TextField,
  TextOverflow,
  TextSpan,
  TextStyle,
  Transform,
  Wrap,
  type UIComponent,
} from "../src";

const placeholderSrc =
  "data:image/svg+xml," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="100">
      <rect fill="#90CAF9" width="160" height="100"/>
      <text x="80" y="55" text-anchor="middle" fill="#1565C0"
        font-family="sans-serif" font-size="14">Image</text>
    </svg>
  `);

const hero = Container({
  padding: EdgeInsets.all(24),
  child: Column({
    gap: 16,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text({
        text: "Hello World",
        style: TextStyle({
          fontSize: 32,
          fontWeight: FontWeight.bold,
        }),
      }),
      Text({
        text: "A constructor-driven UI system that renders to real DOM and CSS.",
        style: TextStyle({
          fontSize: 15,
          color: Colors.grey600,
        }),
      }),
      Button({
        text: "Get Started",
        onPressed: () => {
          router.go("/advanced");
        },
      }),
    ],
  }),
});

const accountCard = Card({
  elevation: 2,
  margin: EdgeInsets.zero,
  child: Container({
    width: 400,
    padding: EdgeInsets.all(20),
    child: Column({
      gap: 12,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text({
          text: "Account",
          style: TextStyle({
            fontSize: 22,
            fontWeight: FontWeight.bold,
          }),
        }),
        Text({
          text: "Manage your account settings.",
          style: TextStyle({
            fontSize: 14,
            color: Colors.grey,
          }),
        }),
        SizedBox({ height: 4 }),
        TextField({
          placeholder: "Enter name",
          width: "100%",
          onChanged: (value) => {
            console.log(value);
          },
        }),
        Row({
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          width: "100%",
          children: [
            Text({
              text: "Name",
              style: TextStyle({ color: Colors.grey600, fontSize: 13 }),
            }),
            Expanded({
              child: Text({
                text: "Value",
                style: TextStyle({
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  textAlign: "right",
                }),
              }),
            }),
          ],
        }),
        Button({
          text: "Save",
          onPressed: () => {
            console.log("save");
          },
        }),
      ],
    }),
  }),
});

const menuCard = Card({
  elevation: 2,
  margin: EdgeInsets.zero,
  child: Container({
    width: 400,
    child: Column({
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding({
          padding: EdgeInsets.only({ top: 16, left: 16, right: 16, bottom: 8 }),
          child: Text({
            text: "Menu",
            style: TextStyle({
              fontSize: 18,
              fontWeight: FontWeight.bold,
            }),
          }),
        }),
        ListTile({
          leading: Icon({ icon: Icons.home }),
          title: Text({ text: "Home" }),
          onTap: () => {
            router.go("/");
          },
        }),
        ListTile({
          leading: Icon({ icon: Icons.person }),
          title: Text({ text: "Account" }),
          onTap: () => {
            router.go("/account/12");
          },
        }),
        ListTile({
          leading: Icon({ icon: Icons.info }),
          title: Text({ text: "Advanced" }),
          onTap: () => {
            router.go("/advanced");
          },
        }),
        Divider(),
        ListTile({
          leading: Icon({ icon: Icons.settings }),
          title: Text({ text: "Settings" }),
          onTap: () => {
            router.go("/settings");
          },
        }),
      ],
    }),
  }),
});

const overlayCard = Container({
  width: 400,
  child: Stack({
    width: "100%",
    height: 140,
    alignment: Alignment.bottomRight,
    children: [
      Container({
        width: "100%",
        height: 140,
        decoration: BoxDecoration({
          color: Colors.indigo,
          borderRadius: BorderRadius.circular(16),
        }),
        child: Padding({
          padding: EdgeInsets.all(16),
          child: Column({
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text({
                text: "Stacked overlay",
                style: TextStyle({
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                }),
              }),
              SizedBox({ height: 8 }),
              Image({
                src: placeholderSrc,
                width: 120,
                height: 64,
                alt: "Placeholder",
                fit: "cover",
              }),
            ],
          }),
        }),
      }),
      Padding({
        padding: EdgeInsets.all(12),
        child: Button({
          text: "Continue",
          onPressed: () => {
            console.log("continue");
          },
          decoration: BoxDecoration({
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
          }),
          style: TextStyle({
            color: Colors.indigo,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          }),
        }),
      }),
    ],
  }),
});

const animatedBox = AnimatedContainer({
  width: 88,
  height: 88,
  duration: Duration({ milliseconds: 280 }),
  curve: Curves.easeInOut,
  decoration: BoxDecoration({
    color: Colors.blue,
    borderRadius: BorderRadius.circular(12),
  }),
});

const advanced = Card({
  elevation: 2,
  margin: EdgeInsets.zero,
  child: Container({
    width: 400,
    padding: EdgeInsets.all(16),
    child: Column({
      gap: 16,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text({
          text: "Advanced",
          style: TextStyle({ fontSize: 22, fontWeight: FontWeight.bold }),
        }),
        Text({
          text: "Clip, transform, animation, gestures, wrap, grid, and paint.",
          style: TextStyle({ fontSize: 13, color: Colors.grey600 }),
        }),
        Row({
          gap: 12,
          children: [
            ClipRRect({
              borderRadius: BorderRadius.circular(16),
              child: Image({
                src: placeholderSrc,
                width: 72,
                height: 72,
                fit: "cover",
              }),
            }),
            ClipOval({
              child: Container({
                width: 72,
                height: 72,
                color: Colors.teal,
                alignment: Alignment.center,
                child: Text({
                  text: "Oval",
                  style: TextStyle({ color: Colors.white, fontWeight: FontWeight.bold }),
                }),
              }),
            }),
            ClipPath({
              clipper: CustomClipper.polygon("50% 0%, 100% 100%, 0% 100%"),
              child: Container({ width: 72, height: 72, color: Colors.orange }),
            }),
          ],
        }),
        Transform.rotate({
          angle: -0.12,
          child: Container({
            padding: EdgeInsets.symmetric({ horizontal: 12, vertical: 8 }),
            color: Colors.indigo,
            child: Text({
              text: "Transform.rotate",
              style: TextStyle({ color: Colors.white, fontWeight: FontWeight.w600 }),
            }),
          }),
        }),
        GestureDetector({
          onTap: () => {
            const wide = animatedBox.host?.style.width === "220px";
            animatedBox.update({
              width: wide ? 88 : 220,
              decoration: BoxDecoration({
                color: wide ? Colors.blue : Colors.deepOrange,
                borderRadius: BorderRadius.circular(wide ? 12 : 44),
              }),
            });
          },
          child: Column({
            gap: 8,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text({
                text: "Tap the box to run AnimatedContainer.update()",
                style: TextStyle({ fontSize: 13, color: Colors.grey600 }),
              }),
              animatedBox,
            ],
          }),
        }),
        RichText({
          text: TextSpan({
            children: [
              TextSpan({
                text: "Rich ",
                style: TextStyle({ fontWeight: FontWeight.bold, fontSize: 14 }),
              }),
              TextSpan({
                text: "text ",
                style: TextStyle({ color: Colors.blue, fontSize: 14 }),
              }),
              TextSpan({
                text: "with mixed styles.",
                style: TextStyle({ fontSize: 14, color: Colors.grey800 }),
              }),
            ],
          }),
        }),
        Text({
          text: "Ellipsis overflow on a single line that is intentionally too long to fit.",
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle({ fontSize: 13 }),
        }),
        Wrap({
          spacing: 8,
          runSpacing: 8,
          children: ["Clip", "Motion", "Grid", "Paint", "Wrap"].map((label) =>
            Container({
              padding: EdgeInsets.symmetric({ horizontal: 10, vertical: 6 }),
              decoration: BoxDecoration({
                color: Colors.grey200,
                borderRadius: BorderRadius.circular(16),
              }),
              child: Text({ text: label, style: TextStyle({ fontSize: 12 }) }),
            }),
          ),
        }),
        GridView.count({
          crossAxisCount: 3,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          children: [Colors.blue, Colors.teal, Colors.orange].map((color) =>
            Container({
              height: 48,
              decoration: BoxDecoration({
                color,
                borderRadius: BorderRadius.circular(8),
              }),
            }),
          ),
        }),
        CustomPaint({
          width: 160,
          height: 80,
          painter: (canvas, size) => {
            canvas.fillStyle = "#2196F3";
            canvas.beginPath();
            canvas.arc(size.width / 2, size.height / 2, 24, 0, Math.PI * 2);
            canvas.fill();
          },
        }),
        Stack({
          width: "100%",
          height: 80,
          children: [
            Container({ width: "100%", height: 80, color: Colors.indigo }),
            BackdropFilter({
              sigmaX: 8,
              child: Container({
                width: "100%",
                height: 80,
                color: "rgba(255,255,255,0.25)",
                alignment: Alignment.center,
                child: Text({
                  text: "BackdropFilter",
                  style: TextStyle({
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  }),
                }),
              }),
            }),
          ],
        }),
        ColorFiltered({
          colorFilter: ColorFilter.grayscale(1),
          child: Text({
            text: "ColorFiltered grayscale",
            style: TextStyle({ fontSize: 13, color: Colors.red }),
          }),
        }),
        AspectRatio({
          aspectRatio: 16 / 5,
          child: Container({
            color: Colors.lightBlue,
            alignment: Alignment.center,
            child: Text({
              text: "16:5 AspectRatio",
              style: TextStyle({ color: Colors.white, fontWeight: FontWeight.w600 }),
            }),
          }),
        }),
        PageView({
          height: 72,
          children: ["Page 1", "Page 2", "Page 3"].map((label) =>
            Container({
              color: Colors.grey200,
              alignment: Alignment.center,
              child: Text({
                text: `${label} (swipe)`,
                style: TextStyle({ fontWeight: FontWeight.w600 }),
              }),
            }),
          ),
        }),
      ],
    }),
  }),
});

function homePage(): UIComponent {
  return Container({
    padding: EdgeInsets.all(24),
    alignment: Alignment.topCenter,
    child: Column({
      gap: 24,
      children: [
        hero,
        menuCard,
        overlayCard,
        Container({
          width: 400,
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration({
            color: Colors.white,
            border: Border.all({ color: Colors.grey300, width: 1 }),
            borderRadius: BorderRadius.circular(12),
          }),
          child: Text({
            text: "Inspect this page in DevTools — every node is a real DOM element with data-ui attributes and inline CSS.",
            style: TextStyle({
              fontSize: 13,
              color: Colors.grey800,
            }),
          }),
        }),
      ],
    }),
  });
}

function pageChrome(child: UIComponent): UIComponent {
  return Container({
    padding: EdgeInsets.all(24),
    alignment: Alignment.topCenter,
    child: Column({
      gap: 16,
      children: [
        Row({
          gap: 8,
          children: [
            Button({
              text: "Home",
              onPressed: () => {
                router.go("/");
              },
            }),
          ],
        }),
        child,
      ],
    }),
  });
}

function accountPage(id: string): UIComponent {
  return pageChrome(
    Column({
      gap: 16,
      children: [
        Text({
          text: `Route param id=${id}`,
          style: TextStyle({ fontSize: 13, color: Colors.grey600 }),
        }),
        accountCard,
      ],
    }),
  );
}

function advancedPage(): UIComponent {
  return pageChrome(advanced);
}

function settingsPage(): UIComponent {
  return pageChrome(
    Card({
      elevation: 2,
      margin: EdgeInsets.zero,
      child: Container({
        width: 400,
        padding: EdgeInsets.all(20),
        child: Column({
          gap: 12,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text({
              text: "Settings",
              style: TextStyle({ fontSize: 22, fontWeight: FontWeight.bold }),
            }),
            Text({
              text: "A second route. Use the browser back button or Home.",
              style: TextStyle({ fontSize: 14, color: Colors.grey }),
            }),
          ],
        }),
      }),
    }),
  );
}

function notFoundPage(path: string): UIComponent {
  return pageChrome(
    Column({
      gap: 12,
      children: [
        Text({
          text: "Not found",
          style: TextStyle({ fontSize: 22, fontWeight: FontWeight.bold }),
        }),
        Text({
          text: `No route matched ${path}`,
          style: TextStyle({ fontSize: 14, color: Colors.grey600 }),
        }),
      ],
    }),
  );
}

const dump = document.createElement("section");
dump.className = "debug-panel";
dump.innerHTML = "<h2>Component tree</h2>";
const pre = document.createElement("pre");
dump.appendChild(pre);
document.body.appendChild(dump);

const router = Router({
  routes: [
    Route({ path: "/", builder: () => homePage() }),
    Route({ path: "/home", redirect: () => "/" }),
    Route({
      path: "/account/:id",
      builder: (state) => accountPage(state.params.id ?? ""),
    }),
    Route({ path: "/advanced", builder: () => advancedPage() }),
    Route({ path: "/settings", builder: () => settingsPage() }),
  ],
  notFound: (state) => notFoundPage(state.path),
  onChange: (state) => {
    pre.textContent = router.debugDump();
    console.log("route", state.path, state.params);
    console.log(router.debugDump());
    console.log(router.toTree());
  },
});

const root = document.querySelector("#app");
if (!root) {
  throw new Error("Missing #app mount point");
}

router.mount(root);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    router.unmount();
    dump.remove();
  });
}
