# ActionArea

##  概览

ActionArea 是弹窗底部的操作区域组件，负责渲染确认/取消按钮、链接按钮、或 ActionSheet 样式的取消按钮。它被 [ModalFrame](https://slowisfast.feishu.cn/wiki/VRcLwtiiTiNY6Rkbxadc0kOvnVh) 内部使用，一般不需要直接调用——但了解它的配置有助于正确使用 ModalFrame 的 `actionAreaConfig`。

在 `BaseVisuals.showModalFrame()` 中，可以通过 `ActionAreaConfig` 来配置操作区域：

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "标题",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "确认",
        cancelText = "取消",
        linkBtn1Text = "查看帮助",
        closeAfterConfirm = true
    ),
    onConfirmClick = { /* ... */ },
    onCancelClick = { /* ... */ },
    linkBtn1Click = { /* ... */ }
)
```

ActionArea 支持三种布局模式：

| 模式      | 效果                                                   |
| --------- | ------------------------------------------------------ |
| `NONE`    | 只有底部安全区高度的空白                               |
| `BUTTONS` | 确认/取消按钮 + 可选的链接按钮                         |
| `CANCEL`  | ActionSheet 样式的取消按钮（独占一行，上方有灰色间隔） |

## API (`ActionAreaConfig`)

| **name**              | **type**                  | **功能**                                  | **default** |
| --------------------- | ------------------------- | ----------------------------------------- | ----------- |
| `type`                | `ActionAreaType`          | 布局模式（`NONE` / `BUTTONS` / `CANCEL`） | `CANCEL`    |
| `confirmText`         | `String?`                 | 确认按钮文本（不填则不显示）              | `null`      |
| `cancelText`          | `String?`                 | 取消按钮文本（不填则不显示）              | `null`      |
| `linkBtn1Text`        | `String?`                 | 链接按钮 1 文本                           | `null`      |
| `linkBtn2Text`        | `String?`                 | 链接按钮 2 文本                           | `null`      |
| `confirmButtonConfig` | `WGButtonAttr.() -> Unit` | 确认按钮的高级配置（可自定义按钮样式）    | `null`      |
| `cancelButtonConfig`  | `WGButtonAttr.() -> Unit` | 取消按钮的高级配置                        | `null`      |
| `closeAfterConfirm`   | `Boolean`                 | 点击确认/取消后是否自动关闭弹窗           | `true`      |

## 三种模式详解

### BUTTONS 模式

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=Nzk4YmMwZTBmYmViYTg2ZjIxMDRjZDQzY2EwYjA0NGNfaWNkcE52cnp4SjJzTnh5Q2JzdGhwU21PVzd0bURMbDNfVG9rZW46WGlxMmI5TmZIbzZLVTl4M3h2NWNPdFJkbmxkXzE3NzYzMjUyNTI6MTc3NjMyODg1Ml9WNA)

最常用的模式。确认按钮（PRIMARY 样式）和取消按钮（SECONDARY 样式）横向排列。

- 只设 `confirmText` → 单个确认按钮（如上图）
- 同时设 `confirmText` + `cancelText` → 双按钮（确认在右，取消在左）
- 设了 `linkBtn1Text` / `linkBtn2Text` → 按钮下方显示链接文字，中间有分隔线

```Kotlin
// 双按钮 + 链接
actionAreaConfig = ActionAreaConfig(
    type = ActionAreaType.BUTTONS,
    confirmText = "确认",
    cancelText = "取消",
    linkBtn1Text = "查看帮助",
    linkBtn2Text = "联系客服"
)
```

### CANCEL 模式

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MTRhZWE1MjU3NWU3N2UwNGUwNWQ1M2ZjNTM5NDM2OWVfVHl6MVBkZkFsM0RON1J4VVNxSW04YVlqMnB5WTFGd29fVG9rZW46UThISGJTcUNabzhuWWJ4N1R4ZWNaVUtSblJoXzE3NzYzMjUyNTI6MTc3NjMyODg1Ml9WNA)

ActionSheet 风格的取消按钮。按钮会撑满整行，上方有 8px 灰色间隔，视觉效果像是和上方内容分开。适合只需要一个"取消"或"关闭"操作的场景。

```Kotlin
actionAreaConfig = ActionAreaConfig(
    type = ActionAreaType.CANCEL,
    cancelText = "知道了"
)
```

### NONE 模式

不显示任何按钮，只保留底部安全区高度（iOS/鸿蒙设备）。

```Kotlin
actionAreaConfig = ActionAreaConfig(type = ActionAreaType.NONE)
```

## 组件特性

### closeAfterConfirm

默认情况下，点击确认或取消按钮后，ActionArea 会触发 `onRequestClose` 事件，由父级组件（ModalFrame → DialogUtil）负责关闭弹窗。

如果你不想让按钮点击后自动关闭（比如需要先做异步校验），设置 `closeAfterConfirm = false`：

```Kotlin
actionAreaConfig = ActionAreaConfig(
    type = ActionAreaType.BUTTONS,
    confirmText = "提交",
    closeAfterConfirm = false  // 点击后不关闭，需要你手动关闭
)
```

### 直接使用 ActionArea 组件

虽然不常见，但你也可以在自己的自定义布局里直接使用 ActionArea：

```Kotlin
ActionArea {
    attr {
        width(pagerData.pageViewWidth)
        type = ActionAreaType.BUTTONS
        confirmText = "确定"
        cancelText = "我再想想"
    }
    event {
        onConfirmClick { /* ... */ }
        onCancelClick { /* ... */ }
        onRequestClose { /* 通常由父级监听，用来关闭弹窗 */ }
    }
}
```

#### ActionArea 属性（`ActionAreaAttr`）

| **name**                    | **type**                  | **功能**                                      | **default** |
| --------------------------- | ------------------------- | --------------------------------------------- | ----------- |
| `type`                      | `ActionAreaType`          | 布局模式                                      | `NONE`      |
| `confirmText`               | `String?`                 | 确认按钮文本                                  | `null`      |
| `cancelText`                | `String?`                 | 取消按钮文本                                  | `null`      |
| `linkBtn1Text`              | `String?`                 | 链接按钮 1 文本                               | `null`      |
| `linkBtn2Text`              | `String?`                 | 链接按钮 2 文本                               | `null`      |
| `confirmButtonConfig`       | `WGButtonAttr.() -> Unit` | 确认按钮高级配置                              | `null`      |
| `cancelButtonConfig`        | `WGButtonAttr.() -> Unit` | 取消按钮高级配置                              | `null`      |
| `cancelButtonBottomPadding` | `Float?`                  | 取消按钮底部 padding（默认为 iOS 安全区高度） | `null`      |
| `closeAfterConfirm`         | `Boolean`                 | 点击按钮后是否触发关闭                        | `true`      |

#### ActionArea 事件（`ActionAreaEvent`）

| **name**         | **type**     | **功能**                                                  |
| ---------------- | ------------ | --------------------------------------------------------- |
| `onConfirmClick` | `() -> Unit` | 确认按钮点击                                              |
| `onCancelClick`  | `() -> Unit` | 取消按钮点击                                              |
| `linkBtn1Click`  | `() -> Unit` | 链接按钮 1 点击                                           |
| `linkBtn2Click`  | `() -> Unit` | 链接按钮 2 点击                                           |
| `onRequestClose` | `() -> Unit` | 请求关闭父级（内部使用，ModalFrame 的关闭逻辑依赖此事件） |