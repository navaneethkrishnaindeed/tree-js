# tree-js

A small TypeScript UI component system with a **Flutter/Dart-like constructor API** that renders to the **native browser DOM and CSS**.

It is not a Flutter port. There is no `StatelessWidget`, `StatefulWidget`, `State`, `BuildContext`, React, JSX, or virtual DOM. You compose configurable UI objects and mount them.

```ts
const app = Scaffold({
  appBar: AppBar({
    title: Text({ text: "Home" }),
  }),
  body: ListView({
    children: [
      ListTile({
        leading: Icon({ icon: Icons.person }),
        title: Text({ text: "Account" }),
      }),
    ],
  }),
  floatingActionButton: FloatingActionButton({
    child: Icon({ icon: Icons.add }),
    onPressed: () => console.log("fab"),
  }),
});

app.mount(document.body);
```

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # typecheck + production bundle
npm run preview  # serve the production build
```

## Project structure

```text
tree-js/
  src/
    index.ts                 Public exports
    core/                    UIComponent, style translator, mount/toTree
    painting/                EdgeInsets, colors, decorations, text styles, icons, theme
    layout/                  FontWeight, alignments, FlexFit, FAB locations
    components/              primitives (Container, Row, Text, Icon, ...)
    material/                Scaffold, AppBar, Drawer, FAB, BottomNavigationBar
  demo/
    index.html
    main.ts                  Runnable example
    style.css                Page chrome only (not component CSS)
  package.json
  tsconfig.json
  vite.config.ts
```

## How the object model works

1. **Factories** such as `Container({...})` and `Text({...})` return class instances that extend `UIComponent`.
2. Nested factories build an inspectable **component tree** in memory (`Column` holds `Text` and `Button`, and so on).
3. `mount(parent)` walks that tree once with `document.createElement` / `appendChild`.
4. Each node translates its props into **inline CSS** (`element.style`) so you never write a stylesheet per component.
5. Constructor events (`onPressed`, `onChanged`) bind to native DOM events (`click`, `input`).

```text
TypeScript constructors
        ↓
Component tree (UIComponent instances)
        ↓
UI renderer (createElement + style translation)
        ↓
Native DOM  +  inline CSS
```

Custom pieces are ordinary functions that return components. There is no widget lifecycle:

```ts
function Card(title: string, child: UIComponent) {
  return Container({
    padding: EdgeInsets.all(16),
    child: Column({
      children: [Text({ text: title }), child],
    }),
  });
}
```

## Component tree example

`app.debugDump()` prints a readable tree (also shown at the bottom of the demo):

```text
Container padding=EdgeInsets.all(24) alignment=Alignment.topCenter
  Container width=448
    Column gap=24
      Container padding=EdgeInsets.all(24)
        Column gap=16 crossAxisAlignment=flex-start
          Text text="Hello World" style=TextStyle(fontSize: 32, fontWeight: 700)
          Text text="A constructor-driven UI system..." style=TextStyle(fontSize: 15, color: #757575)
          Button text="Get Started" onPressed=Function
      Container width=400 padding=EdgeInsets.all(20) decoration=BoxDecoration(...)
        Column gap=12 crossAxisAlignment=flex-start
          Text text="Account"
          Text text="Manage your account settings."
          SizedBox height=4
          TextField placeholder="Enter name" width="100%" onChanged=Function
          Row mainAxisAlignment=space-between width="100%"
            Text text="Name"
            Text text="Value"
          Button text="Save" onPressed=Function
      ...
```

`app.toTree()` returns the same structure as nested objects for programmatic inspection.

## Generated DOM

Every node is a real HTML element with a `data-ui` attribute. Approximate output:

```html
<div data-ui="Container" style="padding: 24px; display: flex; ...">
  <div data-ui="Container" style="width: 448px;">
    <div data-ui="Column" style="display: flex; flex-direction: column; gap: 24px;">
      <div data-ui="Container" style="padding: 24px;">
        <div data-ui="Column" style="display: flex; flex-direction: column; gap: 16px;">
          <span data-ui="Text" style="font-size: 32px; font-weight: 700;">Hello World</span>
          <button data-ui="Button" type="button" style="background-color: #2196F3; ...">
            Get Started
          </button>
        </div>
      </div>
      <input data-ui="TextField" placeholder="Enter name" />
      <img data-ui="Image" alt="Placeholder" />
    </div>
  </div>
</div>
```

Open DevTools: this is a normal web page, not a canvas or fake document.

## Components and DOM mapping

| Factory | Element |
| --- | --- |
| `Container` | `<div>` |
| `Row` / `Column` | `<div>` with flex row/column |
| `Align` / `Center` | `<div>` with flex alignment |
| `Expanded` / `Flexible` / `Spacer` | flex-grow wrapper |
| `Stack` | `<div>` with `position: relative` |
| `Positioned` | absolutely positioned child of `Stack` |
| `Text` | `<span>` |
| `Button` | `<button>` |
| `IconButton` | `<button>` |
| `TextField` | `<input>` or `<textarea>` if `multiline` |
| `Image` | `<img>` |
| `Icon` | inline SVG |
| `Padding` / `SizedBox` | `<div>` |
| `ListView` | scrollable `<div>` |
| `ListTile` | flex row `<div>` |
| `Card` | elevated `<div>` |
| `Divider` | horizontal rule `<div>` |
| `Scaffold` | page shell `<div>` |
| `AppBar` | `<header>` |
| `Drawer` | `<aside>` |
| `FloatingActionButton` | `<button>` |
| `BottomNavigationBar` | `<nav>` |

Numbers are CSS pixels (`16` → `16px`). Strings pass through (`"100%"`, `"2rem"`).

## Utility classes

```ts
EdgeInsets.all(16)
EdgeInsets.symmetric({ horizontal: 20, vertical: 10 })
EdgeInsets.only({ top: 10, left: 20 })

BorderRadius.circular(12)
Border.all({ color: Colors.grey, width: 1 })

BoxDecoration({
  color: Colors.white,
  borderRadius: BorderRadius.circular(8),
  boxShadow: BoxShadow({ offsetY: 8, blurRadius: 24 }),
})

TextStyle({
  fontSize: 18,
  fontWeight: FontWeight.bold,
  color: Colors.black,
})

MainAxisAlignment.spaceBetween
CrossAxisAlignment.center
Alignment.topLeft
Icons.home
ThemeData.light()
FloatingActionButtonLocation.endFloat
```

Invalid props fail at compile time. `fontSize` belongs on `TextStyle`, not on `Text`:

```ts
Text({
  text: "Hello",
  style: TextStyle({ fontSize: 20 }),
});
```

## Design boundaries

Intentionally not included: Flutter widget lifecycle, React/JSX, virtual DOM, Redux, hooks, and app-wide state. Props are static in this prototype; the `UIComponent` base is documented so getters or reactive values can be added later without changing constructors.
