# Prism Icons

## 安装

``` bash
npm i ui-icons -S 
```

## 使用

``` tsx
import React, { Suspense } from 'react'
import ArrowLeft from "ui-icons/ArrowLeft"
import { ArrowRight } from "ui-icons"

const LazyIcon = React.lazy(() => import("ui-icons/ArrowUp"))
function App() {
  return (
    <div className="App">
      <ArrowLeft/>
      <ArrowRight />
      <Suspense fallback={"fallback"}>
        <LazyIcon />
      </Suspense>
    </div>
  )
}
```
