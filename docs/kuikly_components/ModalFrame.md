# ModalFrame

Demo 页 page 名称：`KuiklyModalDemo`

## 概览

ModalFrame - 底部模态框组件

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MGRkZWJlYzczOGQ2N2M3MzdmZWVhODg5NTMxOGZhM2VfTlhIRjlHOHFCM3BpU09aQjdMMk9lOVpOM2lPTlBvRmtfVG9rZW46SzVveGJZVXlvb0szc0x4d21zY2NXQzNvbnVoXzE3NzYzMjUxOTE6MTc3NjMyODc5MV9WNA)

ModalFrame 是一个纯 UI 组件，可高度自定义化，支持搭配 NavBar 或使用固定样式的标题和副标题。

你不会直接使用 `ModalFrame` 组件，而是通过 `BaseVisuals.showModalFrame()` 来调用：

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "确认删除",
    contentText = "删除后无法恢复，确定要删除吗？",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "删除",
        cancelText = "取消"
    ),
    onConfirmClick = {
        BaseVisuals.showSimpleSuccessToast(ctx.pagerId, "已删除")
    }
)
```

ModalFrame 自适应高度。它的结构从上到下是：

1. **标题区** — 默认文字标题，也可以传入 NavBar 等自定义组件
2. **内容区** — 默认文字内容，也可以传入自定义布局
3. **操作区** — 由 [ActionArea](https://slowisfast.feishu.cn/wiki/Cjcew8yUBir9XokTZ0Dc6jJinhe) 组件负责，支持按钮、链接按钮、ActionSheet 样式取消按钮

## API

`BaseVisuals.showModalFrame()` 参数：

| **name**                  | **type**            | **功能**                                                     | **default** |
| ------------------------- | ------------------- | ------------------------------------------------------------ | ----------- |
| `pageId` 🌟                 | `String`            | 页面 ID（必填）                                              | /           |
| `titleText` 🌟              | `String`            | 标题文字                                                     | `""`        |
| `contentText` 🌟            | `String`            | 副标题文字                                                   | `""`        |
| `titleBar` 🌟               | `ViewBuilder?`      | 自定义标题栏（如 NavBar），传入后会替代 titleText 和 contentText | `null`      |
| `content` 🌟                | `ViewBuilder?`      | 自定义内容区                                                 | `null`      |
| `contentMarginDisabled`   | `Boolean`           | 内容区是否禁用左右 padding                                   | `true`      |
| `isCenter` 🌟               | `Boolean`           | 标题和内容是否居中（false 为左对齐）                         | `true`      |
| `actionAreaConfig`        | `ActionAreaConfig?` | 操作区域配置，详见[ActionArea](https://slowisfast.feishu.cn/wiki/Cjcew8yUBir9XokTZ0Dc6jJinhe)文档 | `null`      |
| `zIndex`                  | `Int`               | 弹窗层级                                                     | `1000`      |
| `animationTime`           | `Float`             | 动画时长（秒）                                               | `0.25f`     |
| `cancelByClickingOutside` | `Boolean`           | 点击外部蒙版是否关闭                                         | `true`      |
| `onConfirmClick` 🌟         | `() -> Unit`        | 确认按钮点击回调                                             | `null`      |
| `onCancelClick` 🌟          | `() -> Unit`        | 取消按钮点击回调                                             | `null`      |
| `linkBtn1Click`           | `() -> Unit`        | 链接按钮 1 点击回调                                          | `null`      |
| `linkBtn2Click`           | `() -> Unit`        | 链接按钮 2 点击回调                                          | `null`      |
| `onClose`                 | `() -> Unit`        | 关闭回调                                                     | `null`      |

返回值是 `DialogId`，可用于手动关闭弹窗：

```Kotlin
val dialogId = BaseVisuals.showModalFrame(...)
DialogUtil.cancelDialog(pageId, dialogId) // 手动关闭
```

## 参考代码

### 底部取消栏

和 ActionSheet 样式相同，显示一整行“取消”。

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "提示",
    contentText = "这是一个 ActionSheet 样式的单按钮模态框",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.CANCEL // 默认显示 “取消”
    ),
    onCancelClick = {
        // 处理点击
    }
)
```

### 双按钮（确认 + 取消）

底部显示两个 WGButton，右侧为确认按钮（绿色），左侧为取消按钮（灰色）

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "确认删除",
    contentText = "删除后无法恢复，确定要删除吗？",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS, // 显示 WGButton
        confirmText = "删除",
        cancelText = "取消"
    ),
    onCancelClick = { /* 取消 */ },
    onConfirmClick = { /* 确认 */ }
)
```

### 带链接按钮

链接按钮显示在确认/取消按钮下方，最多 2 个。

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "链接按钮示例",
    contentText = "演示新增的链接按钮功能",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "确认",
        linkBtn1Text = "查看详情", // 添加链接按钮
        linkBtn2Text = "了解更多"
    ),
    onConfirmClick = { /* 确认 */ },
    linkBtn1Click = { /* 查看详情 */ },
    linkBtn2Click = { /* 了解更多 */ }
)
```

### 左对齐文本

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    isCenter = false, // 左对齐
    titleText = "重要提示",
    contentText = "当内容较多时，比如这里，我马上就要说很多很多话，但是你可以发现，左对齐可以提供更好的阅读体验。",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "立即处理",
        cancelText = "稍后再说"
    )
)
```

### 自定义内容区

`content` 可以放任意自定义布局；不包括标题副标题、ActionArea。

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "选择数量",
    content = {
        View {
            attr { padding(16f); flexDirectionRow(); justifyContentSpaceBetween() }
            // ... 自定义 UI
        }
    },
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "确定",
        cancelText = "取消"
    )
)
```

> 若想不显示标题，可以完全不传入值；若想使 ActionArea 为空（只保留安全区），需要传入 `type = ActionAreaType.NONE`。

### 配合 NavBar 使用

ModalFrame 也支持用 NavBar 替代默认标题栏。通过 `titleBar` 传入 NavBar，并设置 `linkToParentNavBar = true` 。

```Kotlin
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleBar = {
        NavBar {
            attr {
                linkToParentNavBar = true
                text = "自定义标题栏"
                isCenter = true
            }
        }
    },
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "确认",
        linkBtn1Text = "查看帮助"
    ),
    onConfirmClick = { /* ... */ },
    linkBtn1Click = { /* ... */ }
)
```

### 禁止点击外部关闭 & 按钮不自动关闭

```Kotlin
// 禁止点击外部关闭
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "强制操作",
    contentText = "必须选择一个选项才能继续",
    cancelByClickingOutside = false,
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "选项 B",
        cancelText = "选项 A"
    )
)

// 点击按钮后不自动关闭（多步骤操作等场景）
BaseVisuals.showModalFrame(
    pageId = ctx.pagerId,
    titleText = "多步骤操作",
    actionAreaConfig = ActionAreaConfig(
        type = ActionAreaType.BUTTONS,
        confirmText = "执行",
        closeAfterConfirm = false  // 关键
    )
)
```

## 组件特性

### ModalFrame 高度

ModalFrame 高度自适应，不可传入高度。若需要滚动，可在 content 传入一个高度固定的 ScrollerView。

### ModalFrame vs ModalFrameX

ModalFrame 是纯 UI 组件，依赖于 DialogUtil。

|               | ModalFrame                    | ModalFrameX                    |
| ------------- | ----------------------------- | ------------------------------ |
| **定位**      | 纯 UI 组件，简单弹窗          | 交互复杂的可拖拽弹窗           |
| **动画/手势** | 由 DialogUtil 处理            | 自身实现完整的手势和动画       |
| **高度**      | 自适应                        | 固定初始高度，可拖拽扩展至全屏 |
| **操作区**    | 内置 ActionArea               | 无内置操作区，自由定制 content |
| **NavBar**    | 可选，可直接传入标题 / 副标题 | 基本必须配合使用               |

如果你需要可以拖拽到全屏的弹窗，请看 [ModalFrameX](https://slowisfast.feishu.cn/wiki/UnJxw9VQhiUIzrk0sJkcfGNYn2b)。

### 搭配 NavBar 时的自动行为

ModalFrame 是通过 DialogUtil 管理的，NavBar 设置`linkToParentNavBar`后，会找到包裹 ModalFrame 的父级 `DialogItemView` 并调用对应方法：

- 点击 NavBar 的返回按钮自动关闭弹窗；
- 拖动 NavBar 时触发 ModalFrame 的拖动效果。

### 底部安全区

ModalFrame 通过 ActionArea 同时处理安全区和底部按钮。ActionArea 文档