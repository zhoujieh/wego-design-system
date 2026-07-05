# SnackBar

Demo 页 page 名称：`KuiklySnackBarDemo`

## 概览

SnackBar —— 弹出式消息提示组件，用于展示一条行内的提示或警告消息。从左到右由 **图标 + 文本 + 可选链接 + 可选关闭按钮** 组成，整体高度随文本自适应，支持滑入/滑出动画（默认只是一个组成型组件）。

```Kotlin
SnackBar {
    attr {
        iconPreset = IconPresets.INFO
        title = "这是一条提示消息"
        level = SnackBarLevel.WEAK
    }
}
```

SnackBar 有三种等级（`SnackBarLevel`），每个等级有自己的文字色、关闭图标色和背景色：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MDdhZWE0Nzc0YTU1M2EyYzQyZjBhYjA5YjU1NGQ2OGJfdGJhbkFuek9xZE9obU54eHFHaWU5NWxoWTlNNVpYVDZfVG9rZW46SlJxUWJwRzlEb2dMNGJ4djc5eWNyMkdhbjRnXzE3NzY3NzY3ODg6MTc3Njc4MDM4OF9WNA)

| 等级     | 典型用途          |
| -------- | ----------------- |
| `WEAK`   | 一般性通知、说明  |
| `MEDIUM` | 注意 / 提醒       |
| `STRONG` | 警告 / 需立即处理 |

SnackBar 本身是一个纯 UI 组件，**不自动管理弹出和关闭，但内置滑入动画（****`enableAnimation = true`****）**。通常搭配 `positionAbsolute()` 、使用内置的滑入动画（`enableAnimation = true`），此时点击关闭按钮时可以自动触发退出动画。但视图的最终移除需要外部配合 `onAnimComplete` 回调处理。

## API

### SnackBar 属性（`SnackBarViewAttr`）

| **name**                   | **type**        | **功能**                                                     | **default value**    |
| -------------------------- | --------------- | ------------------------------------------------------------ | -------------------- |
| `title` ****响应式*** 🌟    | `String`        | 提示文本（最多 2 行，超出省略）                              | `""`                 |
| `level` ****响应式*** 🌟    | `SnackBarLevel` | 提示等级：`WEAK` / `MEDIUM` / `STRONG`                       | `SnackBarLevel.WEAK` |
| `icon` ****响应式***       | `String`        | 左侧图标 iconFont 名称；**优先级高于****`iconPreset`**       | `""`                 |
| `iconPreset` ****响应式*** | `IconPresets`   | 左侧图标预设（`icon` 为空时使用）                            | `IconPresets.INFO`   |
| `hasLink` ****响应式*** 🌟  | `Boolean`       | 是否显示右侧链接按钮                                         | `false`              |
| `linkText`                 | `String`        | 链接按钮文本                                                 | `"去看看"`           |
| `hasClose` 🌟               | `Boolean`       | 是否显示右侧关闭按钮（×）                                    | `false`              |
| `autoClose`                | `Boolean`       | 点击关闭按钮后是否自动触发退出动画（需配合 `enableAnimation`）；为 `false` 时仅触发 `onClose` 回调，由外部控制隐藏 | `true`               |
| `enableAnimation` 🌟        | `Boolean`       | 是否启用滑入/滑出动画                                        | `false`              |
| `animateFrom`              | `Boolean`       | 动画方向：`true` = 从顶部滑入，`false` = 从底部滑入          | `true`               |
| `animationDuration`        | `Float`         | 动画时长（秒）                                               | `0.25f`              |

#### 属性方法

| **方法**              | **功能**                   |
| --------------------- | -------------------------- |
| `animateFromTop()`    | 设置 `animateFrom = true`  |
| `animateFromBottom()` | 设置 `animateFrom = false` |

### SnackBar 事件（`SnackBarViewEvent`）

| **name**         | **type**            | **功能**                                                     |
| ---------------- | ------------------- | ------------------------------------------------------------ |
| `onClickLink`    | `() -> Unit`        | 点击链接按钮                                                 |
| `onClose`        | `() -> Unit`        | 点击关闭按钮                                                 |
| `onAnimComplete` | `(Boolean) -> Unit` | 动画完成回调（仅 `enableAnimation = true` 时触发）。参数 `true` = 出现动画完成，`false` = 隐藏动画完成 |

### 公开方法

通过 `ref` 获取 `SnackBarView` 实例后可调用：

| **方法** | **功能**                                                   |
| -------- | ---------------------------------------------------------- |
| `hide()` | 程序化触发退出动画（仅在 `enableAnimation = true` 时有效） |

### 枚举类 `SnackBarLevel`

| 值       | 文字色         | 关闭图标色 | 背景色       | 描述 |
| -------- | -------------- | ---------- | ------------ | ---- |
| `WEAK`   | `text_80`      | `text_80`  | `bg_gray_03` | 弱   |
| `MEDIUM` | `yellow_1_100` | `text_80`  | `bg_gray_03` | 中   |
| `STRONG` | `red_100`      | `red_100`  | `red_10`     | 强   |

## 参考代码

### 基础用法：三种等级

```Kotlin
// 弱提示
SnackBar {
    attr {
        iconPreset = IconPresets.INFO
        title = "这是一条弱提示消息，用于一般性通知"
        level = SnackBarLevel.WEAK
    }
}

// 中等提示
SnackBar {
    attr {
        iconPreset = IconPresets.WARNING
        title = "这是一条中等提示消息，请注意查看"
        level = SnackBarLevel.MEDIUM
    }
}

// 强提示
SnackBar {
    attr {
        iconPreset = IconPresets.ERROR
        title = "这是一条强提示消息，需要立即处理！"
        level = SnackBarLevel.STRONG
    }
}
```

### 带链接按钮

`hasLink = true` 时右侧会显示一个蓝色链接按钮，点击触发 `onClickLink`：

```Kotlin
SnackBar {
    attr {
        iconPreset = IconPresets.INFO
        title = "发现新版本，点击右侧链接查看详情"
        level = SnackBarLevel.WEAK
        hasLink = true
        linkText = "去看看"
    }
    event {
        onClickLink = { /* 处理链接点击 */ }
    }
}
```

### 带关闭按钮（外部控制显隐）

最常见的用法：通过外部 `observable` 变量控制 SnackBar 是否渲染，点击关闭按钮时将其置为 `false`：

```Kotlin
private var showWithClose by observable(true)

// ...bodyif (ctx.showWithClose) {
    SnackBar {
        attr {
            iconPreset = IconPresets.WARNING
            title = "点击右侧关闭按钮可以关闭此提示"
            level = SnackBarLevel.MEDIUM
            hasClose = true
        }
        event {
            onClose = {
                ctx.showWithClose = false
            }
        }
    }
}
```

### 启用滑入/滑出动画

`enableAnimation = true` 后，SnackBar 在首次渲染时自动从 `animateFrom` 指定的方向滑入。点击关闭按钮（`autoClose = true`时）会触发反向滑出，配合 `onAnimComplete` 回调在动画完成后彻底移除视图：

```Kotlin
private var showWithAnimation by observable(false)

// ...body
View {
    attr {
        margin(left = 16f, right = 16f)
    }
    vif({ ctx.showWithAnimation }) {
        SnackBar {
            attr {
                iconPreset = IconPresets.SUCCESS
                title = "从顶部滑入的动画提示消息"
                level = SnackBarLevel.WEAK
                hasClose = true
                enableAnimation = true
                animateFromTop()
                animationDuration = 0.3f
            }
            event {
                onClose = {
                    // 等待退出动画完成后移除视图
                    setTimeout(250) {
                        ctx.showWithAnimation = false
                    }
                }
            }
        }
    }
}

// 触发显示
WGButton {
    attr { text = "Show" }
    event { onClick { ctx.showWithAnimation = true } }
}
```

> **推荐做法**：使用 `onAnimComplete` 替代 `setTimeout`：

```Kotlin
event {
    onAnimComplete { isEnter ->
        if (!isEnter) ctx.showWithAnimation = false
    }
}
```

### 程序化触发退出动画（hide）

通过 `ref` 拿到 `SnackBarView` 实例后调用 `hide()` 可以主动触发退出动画：

```Kotlin
private var snackBarRef: ViewRef<SnackBarView>? = null// ...body
SnackBar {
    ref { ctx.snackBarRef = it }
    attr {
        enableAnimation = true
        title = "由外部控制隐藏"
        hasClose = false
    }
}

WGButton {
    attr { text = "手动隐藏" }
    event {
        onClick {
            ctx.snackBarRef?.view?.hide()
        }
    }
}
```

### 手动控制 autoClose（禁用自动退出动画）

设置 `autoClose = false` 后，点击关闭按钮**只会**触发 `onClose`，不会自动开始退出动画。适用于需要先做异步操作（如确认弹窗、网络请求）再决定是否隐藏的场景：

```Kotlin
SnackBar {
    attr {
        title = "点击 × 需先确认"
        hasClose = true
        autoClose = false
        enableAnimation = true
    }
    event {
        onClose = {
            // 先弹确认框，确认后再手动 hide
            BaseVisuals.showTextDialog(
                pageId = ctx.pagerId,
                title = "是否关闭？",
                onConfirm = { ctx.snackBarRef?.view?.hide() }
            )
        }
    }
}
```

### 自定义图标

`icon` 直接传入 iconFont 名称（优先级高于 `iconPreset`）：

```Kotlin
SnackBar {
    attr {
        icon = "yuanjia"
        title = "使用自定义 iconFont 图标"
        level = SnackBarLevel.WEAK
    }
}
```

### STRONG 等级 + 链接（安全提示）

```Kotlin
SnackBar {
    attr {
        iconPreset = IconPresets.ERROR
        title = "账号存在安全风险，请立即处理"
        level = SnackBarLevel.STRONG
        hasLink = true
        linkText = "立即处理"
    }
    event {
        onClickLink = { /* 跳转到安全中心 */ }
    }
}
```

## 组件特性

### 动画机制

SnackBar 不像 Toast / Dialog 那样通过 `DialogUtil` 统一管理——它本质上就是一段静态布局。是否显示、何时移除，都需要业务方通过 `observable` 变量 + `vif` / 条件渲染控制。但它自带一段动画，需要通过 `enableAnimation = true` 启用。

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MmRlZTdjOGIyYTdmZjNkODEwODIzYjhlYTExMjUwZGZfYTZyaUg1b1NHZU5IY2ViM0NmU3ZuTlZHeFhJTmpUdEJfVG9rZW46RDhBamI2UTJ5bzlvb1N4RU1GaWN4UUU5bktFXzE3NzY3NzY3ODg6MTc3Njc4MDM4OF9WNA)

此时：

1. 组件内部维护一个 `animated` 变量（`false` = 偏移状态，`true` = 就位）
2. `didAppear` 时将 `animated` 置 `true`，触发滑入动画（`Animation.easeInOut`）
3. 点击关闭按钮且 `autoClose = true`，或者外部调用 `hide()` 时，将 `animated` 置 `false`，触发滑出动画
4. 动画完成时触发 `onAnimComplete(animated)`，参数 `true` 表示入场动画完成，`false` 表示离场动画完成

建议：如果希望离场后移除视图，在 `onAnimComplete` 中判断参数为 `false` 时销毁容器（而不是用 `setTimeout`）。

### 布局规格

- **图标**：16 × 16，右间距 8f，颜色跟随 `level.textColor`
- **文本**：`WGFont.medium(14f)` 字重 Medium、字号 14f，最多 2 行，颜色跟随 `level.textColor`
- **容器**：左 padding 16f，右 padding 8f；文本上下各 padding 12f
- **关闭按钮**：16×16 的 × 图标（`IconPresets.ERROR`），点击区域 padding 12f × 8f；颜色跟随 `level.closeIconColor`
- **链接按钮**：蓝色文字（`WGColor.text_link_100`），字重 Medium，字号 14f
- 若**不显示关闭按钮**（`hasClose = false`），会在末尾添加 `Spacer(8f)` 补足右侧间距

### hasLink 与 hasClose 可共存

两者是独立开关，可以同时启用。链接按钮始终在关闭按钮左侧。

### 文本颜色即等级色

SnackBar 里的文本和图标颜色完全由 `level` 决定，**不支持单独自定义**。如果设计稿要求非标准配色，需要修改 `SnackBarLevel` 枚举或自行封装新的组件。

### 与 Toast / Push 的区别

| 特性     | **SnackBar**                   | [Toast](https://slowisfast.feishu.cn/wiki/BsJewoTm6ipjPSkveOCcgzyBn6g) | [Push](https://slowisfast.feishu.cn/wiki/NEQxweIWFiXjcEkoM46ckiYankk) |
| -------- | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 弹窗管理 | 无（需要外部 observable 控制） | 由 `DialogUtil` 管理                                         | 由 `DialogUtil` 管理                                         |
| 自动关闭 | 无（需自行实现）               | 有（`duration` 毫秒后）                                      | 有（默认 5000ms）                                            |
| 位置     | 行内嵌入布局                   | 页面底部浮层                                                 | 页面顶部浮层                                                 |
| 动画     | 可选滑入/滑出                  | 淡入淡出 + 弹性                                              | 滑入 + 下滑关闭手势                                          |
| 典型场景 | 绝对定位的状态/警告条          | 操作结果的短暂提示                                           | 类系统推送通知                                               |