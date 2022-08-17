# Prism Icons

## 安装与更新

```bash
# install
yarn add @prism/ui-icons

# upgrade
yarn up @prism/ui-icons
```

## Component Interface

```ts
interface Props extends SVGAttributes<SVGElement> {
  color?: string;
  size?: string | number;
  fills?: string[];
}

export type Icon = FC<Props>;
```

## 使用

```tsx
import { ArrowRight, ArrowLeft } from "@prism/ui-icons";

function App() {
  return (
    <div className="App">
      <ArrowLeft fills={["red", "orange"]} />
      <ArrowRight color="cyan" />
    </div>
  );
}
```
