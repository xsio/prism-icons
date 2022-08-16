# Prism Icons

## 安装/更新

```bash
yarn add @prism/ui-icons
```

更新

```bash
yarn up @prism/ui-icons
```

## 使用

```tsx
import { ArrowLeft, ArrowRight } from "@prism/ui-icons";

function App() {
  return (
    <div className="App">
      <ArrowLeft color="cyan" />
      {/* 多色 */}
      <ArrowRight fills={["orange", "cyan"]} />
    </div>
  );
}
```
