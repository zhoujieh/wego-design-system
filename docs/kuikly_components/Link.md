# Link

Demo 页 page 名称：`KuiklyLinkDemo`

## 概览

Link 提供两种链接组件：

- **`Link`**（`LinkView`）— 独立的 ComposeView 链接组件，具有点击态（下图中右侧的按钮）

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MTNhODEyYWFhNzcwYWM2ZjYyYzJhNjRjYzU5ODE5MjBfT3c2YURxUTFmQmRPdnI4ZFlYQnVqR2dDU3ZjMkFZaUZfVG9rZW46TVg2OWJ6YTlGb1lrUEN4aXU2UWN3RTJEbmlmXzE3NzY2ODcwMjM6MTc3NjY5MDYyM19WNA)

```Kotlin
// 独立使用
Link {
    attr {
        text = "View details"
        icon = "jia16"   // 可选左侧图标
        disabled = false
    }
    event {
        onClick { /* 处理点击 */ }
    }
}
```

- **`LinkSpan`** — 可在 `RichText` 中使用的内联链接 Span（下图中的“点击事件”）

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=NTQyODBhMWMwYjNiNThlOTIxYzRhMmNmNjhhNWI0YmJfODc5ZmNZVFhHYU5LZG5qVWNLa1JOOG84UlpKNTVHTzFfVG9rZW46UUlvQ2JRNTdab2JSM1p4WTJXN2NKOWhubkVmXzE3NzY2ODcwMjM6MTc3NjY5MDYyM19WNA)

```Kotlin
// 在 RichText 中使用
RichText {
    attr { fontSize(14f) }
    Span {
        text("请阅读 ")
        color(ColorManager.text_80)
    }
    LinkSpan("服务协议", fontSize = 14f) {
        // 处理链接点击
    }
}
```

默认规格：

- 颜色：`text_link_100`（蓝色）
- 字重：500（Medium）
- 字号：14
- 容器高度：固定 20
- 按下态背景：`bg_gray_06`
- 禁用态：文字和图标不透明度 20%

## API

### LinkSpan（RichText 内联链接）

直接在 `RichTextView` 上调用的函数：

```Kotlin
fun RichTextView.LinkSpan(
    text: String,
    fontSize: Float = WGFont.TEXT_BODY,
    lineHeight: Float = fontSize * 1.5f,
    onClick: (ClickParams) -> Unit
)
```

| **name**     | **type**                | **功能** | **default value**         |
| ------------ | ----------------------- | -------- | ------------------------- |
| `text` 🌟     | `String`                | 链接文本 | *(必填)*                  |
| `fontSize`   | `Float`                 | 字号     | `WGFont.TEXT_BODY`（14f） |
| `lineHeight` | `Float`                 | 行高     | `fontSize * 1.5f`         |
| `onClick` 🌟  | `(ClickParams) -> Unit` | 点击回调 | *(必填)*                  |

LinkSpan 的样式固定为：颜色 `text_link_100`，字重 500。

### LinkView 属性（`LinkViewAttr`）

| **name**              | **type**  | **功能**                                   | **default value** |
| --------------------- | --------- | ------------------------------------------ | ----------------- |
| `text` *响应式* 🌟     | `String`  | 链接文本                                   | `""`              |
| `icon` *响应式*       | `String`  | 左侧图标的 iconFont 名称；为空时不显示图标 | `""`              |
| `disabled` *响应式* 🌟 | `Boolean` | 是否禁用（文字和图标不透明度降为 20%）     | `false`           |

### LinkView 事件（`LinkViewEvent`）

| **name**    | **type**     | **功能**                 |
| ----------- | ------------ | ------------------------ |
| `onClick` 🌟 | `() -> Unit` | 点击回调（禁用时不触发） |

> 请勿使用原生的 `click` 方法（已标记 `@Deprecated`），应使用 `onClick`。

## 参考代码

### 纯文本链接

```Kotlin
Link {
    attr { text = "View details" }
    event { onClick { /* 处理点击 */ } }
}
```

### 带左侧图标

```Kotlin
Link {
    attr {
        text = "Add item"
        icon = "jia16"
    }
    event { onClick { /* 处理点击 */ } }
}
```

### 禁用状态

```Kotlin
// 禁用 — 纯文本
Link {
    attr {
        text = "View details"
        disabled = true
    }
}

// 禁用 — 带图标
Link {
    attr {
        text = "Add item"
        icon = "jia16"
        disabled = true
    }
}
```

### 在 RichText 中使用 LinkSpan

```Kotlin
RichText {
    attr { fontSize(14f) }
    Span {
        text("普通文字 ")
        color(ColorManager.text_80)
    }
    LinkSpan("可点击链接") { clickParams ->
        // 处理链接点击
    }
    Span {
        text(" 后续文字")
        color(ColorManager.text_80)
    }
}
```

### 自定义字号的 LinkSpan

```Kotlin
RichText {
    attr { fontSize(16f) }
    Span {
        text("请阅读 ")
        fontSize(16f)
    }
    LinkSpan("用户协议", fontSize = 16f, lineHeight = 24f) {
        // 跳转到协议页
    }
}
```

## 组件特性

### 点击态

LinkView 内置了按下态处理：

- 按下时背景变为 `bg_gray_06`
- 松手后背景恢复透明
- 禁用时不响应按下态

### 禁用态

`disabled = true` 时：

- 文字和图标的 `opacity` 降为 `0.2f`
- 点击事件（`onClick`）不触发
- 无按下态效果

### 图标规格

左侧图标尺寸固定 16x16，与文字间距 4dp，颜色同文字（`text_link_100`）。禁用时图标同样降低不透明度。

### LinkView 与 LinkSpan 的区别

| 特性     | `Link`（LinkView） | `LinkSpan`           |
| -------- | ------------------ | -------------------- |
| 使用场景 | 独立使用           | 在 RichText 内联使用 |
| 点击态   | 有（背景变灰）     | 无                   |
| 禁用态   | 支持               | 不支持               |
| 图标支持 | 支持左侧图标       | 不支持               |
| 容器高度 | 固定 20            | 跟随 RichText 行高   |