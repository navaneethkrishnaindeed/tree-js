import {
  Alignment,
  AppBar,
  Border,
  BorderRadius,
  BottomNavigationBar,
  BottomNavigationBarItem,
  BoxDecoration,
  Button,
  Card,
  Colors,
  Column,
  Container,
  CrossAxisAlignment,
  Divider,
  Drawer,
  DrawerHeader,
  EdgeInsets,
  Expanded,
  FloatingActionButton,
  FontWeight,
  Icon,
  IconButton,
  Icons,
  Image,
  ListTile,
  ListView,
  MainAxisAlignment,
  Padding,
  Row,
  Scaffold,
  SizedBox,
  Stack,
  Text,
  TextField,
  TextStyle,
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
          console.log("started");
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

const app = Scaffold({
  appBar: AppBar({
    title: Text({
      text: "tree-js",
      style: TextStyle({
        fontSize: 20,
        fontWeight: FontWeight.bold,
      }),
    }),
    actions: [
      IconButton({
        icon: Icon({ icon: Icons.search }),
        tooltip: "Search",
        color: Colors.white,
        onPressed: () => {
          console.log("search");
        },
      }),
    ],
  }),
  drawer: Drawer({
    child: Column({
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DrawerHeader({
          child: Text({
            text: "Menu",
            style: TextStyle({
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            }),
          }),
        }),
        ListTile({
          leading: Icon({ icon: Icons.home }),
          title: Text({ text: "Home" }),
          onTap: () => {
            console.log("home");
          },
        }),
        ListTile({
          leading: Icon({ icon: Icons.person }),
          title: Text({ text: "Account" }),
          onTap: () => {
            console.log("account");
          },
        }),
        Divider(),
        ListTile({
          leading: Icon({ icon: Icons.settings }),
          title: Text({ text: "Settings" }),
          onTap: () => {
            console.log("settings");
          },
        }),
      ],
    }),
  }),
  body: ListView({
    padding: EdgeInsets.all(24),
    children: [
      Container({
        alignment: Alignment.topCenter,
        child: Column({
          gap: 24,
          children: [
            hero,
            accountCard,
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
      }),
    ],
  }),
  floatingActionButton: FloatingActionButton({
    child: Icon({ icon: Icons.add, color: Colors.white }),
    tooltip: "Create",
    onPressed: () => {
      console.log("fab");
    },
  }),
  bottomNavigationBar: BottomNavigationBar({
    items: [
      BottomNavigationBarItem({
        icon: Icon({ icon: Icons.home }),
        label: "Home",
      }),
      BottomNavigationBarItem({
        icon: Icon({ icon: Icons.person }),
        label: "Account",
      }),
      BottomNavigationBarItem({
        icon: Icon({ icon: Icons.settings }),
        label: "Settings",
      }),
    ],
    onTap: (index) => {
      console.log("tab", index);
    },
  }),
});

const root = document.querySelector("#app");
if (!root) {
  throw new Error("Missing #app mount point");
}

app.mount(root);
console.log(app.debugDump());
console.log(app.toTree());

const dump = document.createElement("section");
dump.className = "debug-panel";
dump.innerHTML = "<h2>Component tree</h2>";
const pre = document.createElement("pre");
pre.textContent = app.debugDump();
dump.appendChild(pre);
document.body.appendChild(dump);
