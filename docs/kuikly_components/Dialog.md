Demo 页 page 名称：`KuiklyDialogDemo`

> 由于历史兼容性原因，本组件某些 API 比较繁琐，例如“contentLink2End”

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGVkYjEyMmQ0ZTY2MWJmMGQ1ZTdhYWFlYTE0YTNjNjNfMnp1YldReXRibTZrUEt0em5VTXBMODFwbUU3ZmhWelRfVG9rZW46UTNmQWJDN09wbzJFSW14TjBDOGNVQzBnbnhiXzE3NzY0OTc2OTA6MTc3NjUwMTI5MF9WNA)

Dialog - 居中弹出的通用对话框，用于确认关键操作、提示重要信息或展示带链接的说明文本。

```Kotlin
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "确认删除？",
    content = "删除后无法恢复，请谨慎操作",
    leftBtnText = "取消",
    rightBtnText = "删除",
    rightBtnColor = DialogTextColor.RED.color,
    onConfirm = {
        BaseVisuals.showSimpleSuccessToast(ctx.pagerId, "已删除")
    }
)
```

Dialog 是一个纯 UI 组件（`Dialog { ... }` DSL），自身不负责弹出、动画、关闭，交给 `DialogUtil` 统一管理。**绝大多数场景下你不会直接使用** **`Dialog`** **DSL**，而是通过 `BaseVisuals.showTextDialog(...)` 调用。

Dialog 自适应高度，宽度固定 300f。结构从上到下是：

1. **标题行** — 标题文本 + 可选的状态图标（绿 / 红 / 黄）
2. **内容区**（可选）— 富文本正文，支持至多 2 处可点击链接
3. **自定义区**（可选）— 任意 `ViewBuilder` ，上图中红色部分
4. **按钮行** — 支持左 / 右双按钮，或仅右侧单按钮

## API

### `BaseVisuals.showTextDialog` 参数

| **name**                  | **type**           | **功能**                                                     | **default value**                           |
| ------------------------- | ------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| `pageId`🌟                 | `String`           | 页面 ID（必填）                                              | /                                           |
| `title`🌟                  | `String`           | 标题文本                                                     | `""`                                        |
| `titleIcon`               | `DialogTitleIcon?` | 标题左侧状态图标：`GREEN` / `RED` / `YELLO`，`null` 不显示   | `null`                                      |
| `content`🌟                | `String`           | 正文文本（居中显示）                                         | `""`                                        |
| `contentLink`🌟            | `String`           | 正文中的第一个可点击链接（蓝色文本，拼接在 `content` 之后）  | `""`                                        |
| `contentLinkEnd`🌟         | `String`           | 第一个链接之后的补充文本                                     | `""`                                        |
| `contentLink2`            | `String`           | 第二个可点击链接                                             | `""`                                        |
| `contentLinkEnd2`         | `String`           | 第二个链接之后的补充文本                                     | `""`                                        |
| `customContent`           | `ViewBuilder?`     | 在正文下方额外显示的自定义内容区                             | `null`                                      |
| `disableContentPadding`   | `Boolean`          | 是否禁用内容区左右的 20f padding                             | `false`                                     |
| `leftBtnText`🌟            | `String?`          | 左侧按钮文本。`null` 时**不显示**左侧按钮（仅显示右侧单按钮） | `"取消"`                                    |
| `rightBtnText`🌟           | `String`           | 右侧按钮文本（超过 5 字自动截断）                            | `"确认"`                                    |
| `leftBtnColor`            | `Color`            | 左侧按钮文字颜色                                             | `DialogTextColor.BLACK.color`               |
| `rightBtnColor`           | `Color`            | 右侧按钮文字颜色                                             | `DialogTextColor.BLUE.color`                |
| `cancelOnBack`            | `Boolean`          | 是否可以通过返回键关闭                                       | `false`                                     |
| `cancelByClickingOutside` | `Boolean`          | 是否可以通过点击遮罩关闭                                     | `true`                                      |
| `closeAfterClick`         | `Boolean`          | 点击左 / 右按钮后是否自动关闭                                | `true`                                      |
| `closeAfterClickLink`🌟    | `Boolean`          | 点击链接后是否自动关闭                                       | `false`                                     |
| `onConfirm`               | `(() -> Unit)?`    | 右侧按钮点击回调                                             | `null`                                      |
| `onDismiss`               | `(() -> Unit)?`    | 左侧按钮点击回调                                             | `null`                                      |
| `onClickLink`             | `(() -> Unit)?`    | `contentLink` 点击回调                                       | `null`                                      |
| `onClickLink2`            | `(() -> Unit)?`    | `contentLink2` 点击回调                                      | `null`                                      |
| `zIndex`                  | `Int`              | 弹窗层级                                                     | `DialogConfig.dialogDefault.zIndex`（2000） |
| `conflicting`             | `Boolean`          | 是否与其它 `conflicting=true` 的 Dialog 冲突（单例模式）     | `false`                                     |

- 返回 `DialogId`（Int），可用于手动关闭弹窗。
- `content`、`contentLink`、`contentEnd`、`contentLink2`、`contentEnd2` 会**顺序拼接**显示在同一段富文本里，居中对齐、字号 16f、行高 24f。

### 枚举类 `DialogTitleIcon`

标题左侧的 24x24 状态图标。资源位于 `commonAssets/component/` 下。

| 值      | 图片路径                                | 含义                                                         |
| ------- | --------------------------------------- | ------------------------------------------------------------ |
| `GREEN` | `component/dialog_title_icon_green.png` | 成功 / 提示                                                  |
| `RED`   | `component/dialog_title_icon_red.png`   | 警告 / 危险                                                  |
| `YELLO` | `component/dialog_title_icon_yello.png` | 注意 / 中性提示（注意拼写是 `YELLO` 而不是 `YELLOW`，历史原因） |

### 枚举类 `DialogTextColor`

按钮文字（`leftBtnColor` / `rightBtnColor`）可选的预设颜色。当然你也可以使用 WGColor。

| 值      | 颜色                | 常见用途                           |
| ------- | ------------------- | ---------------------------------- |
| `BLUE`  | `#285B9A`（蓝）     | 默认的右侧确认按钮颜色             |
| `GREEN` | `#03C160`（品牌绿） | 正向确认（如“去开通”、“立即体验”） |
| `BLACK` | `#1E2028`（近黑）   | 默认的左侧取消按钮颜色             |
| `RED`   | `#FA5051`（红）     | 危险操作（如“删除”、“清空”）       |

> 传入颜色时都需要 `.color`，例如 `rightBtnColor = DialogTextColor.RED.color`。

## 参考代码

### 最简单的文本对话框

```Kotlin
// 双按钮
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "标题",
    content = "是否确认执行该操作？",
    onConfirm = { /* 确认 */ }
)

// 仅右侧单按钮（知道了 / 我知道了）
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "温馨提示",
    content = "这是一条需要用户阅读的提示",
    leftBtnText = null, // 关键：不显示左侧按钮
    rightBtnText = "知道了"
)
```

### 带状态图标

```Kotlin
// 绿色成功图标
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "操作成功",
    titleIcon = DialogTitleIcon.GREEN,
    content = "您的订单已提交成功",
    leftBtnText = null,
    rightBtnText = "好的"
)

// 红色警告图标
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "无法删除",
    titleIcon = DialogTitleIcon.RED,
    content = "该项目正在使用中，无法删除",
    leftBtnText = null,
    rightBtnText = "知道了"
)
```

### 带可点击链接

链接在正文里以蓝色文字显示，点击后触发回调：

```Kotlin
// 单个链接
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "协议更新",
    content = "我们的 ",
    contentLink = "服务协议",
    contentLinkEnd = " 已更新，请查阅后继续",
    closeAfterClickLink = true, // 点击链接后关闭对话框
    onClickLink = {
        // 跳转到协议页
    }
)

// 两个链接
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "用户授权",
    content = "请阅读 ",
    contentLink = "用户协议",
    contentLinkEnd = " 和 ",
    contentLink2 = "隐私政策",
    contentLinkEnd2 = "后继续",
    onClickLink = { /* 打开用户协议 */ },
    onClickLink2 = { /* 打开隐私政策 */ }
)
```

### 危险操作（红色右侧按钮）

```Kotlin
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "确认删除？",
    content = "删除后无法恢复",
    leftBtnText = "取消",
    rightBtnText = "删除",
    rightBtnColor = DialogTextColor.RED.color,
    onConfirm = {
        // 执行删除
    }
)
```

### 带自定义内容区

`customContent` 可以在正文下方插入任意布局。典型场景：展示详情卡片、输入框、预览图等。

```Kotlin
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "扣费提示",
    content = "此次操作将产生以下费用：",
    customContent = {
        View {
            attr {
                flex(1f)
                height(56f)
                borderRadius(8f)
                flexDirectionRow()
                backgroundColor(ColorManager.orange_10)
                allCenter()
            }
            Text {
                attr {
                    text("¥ 9.90")
                    color(ColorManager.orange_100)
                    fontSize(18f)
                    fontWeightBold()
                }
            }
        }
    },
    leftBtnText = "取消",
    rightBtnText = "确认扣费",
    onConfirm = { /* 扣费 */ }
)
```

### 禁止用户轻易关闭

关键操作的确认弹窗，应禁用点击遮罩关闭和返回键关闭，强制用户通过按钮选择：

```Kotlin
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "重要确认",
    content = "请仔细阅读并选择一项",
    cancelByClickingOutside = false, // 点击外部不关闭
    cancelOnBack = false,            // 返回键不关闭（默认即为 false）
    leftBtnText = "取消",
    rightBtnText = "确认"
)
```

### 手动管理 DialogId

```Kotlin
// 保存 dialogId 以便后续关闭var currentDialogId: DialogId? = null

currentDialogId = BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "正在处理",
    content = "请稍候...",
    leftBtnText = null,
    rightBtnText = "取消操作",
    closeAfterClick = false, // 点击后不自动关闭
    onConfirm = {
        // 业务操作成功后，再手动关闭
        currentDialogId?.let {
            DialogUtil.cancelDialogImmediately(ctx.pagerId, it)
        }
    }
)
```

## 组件特性

### 依赖 DialogContainer

Dialog 通过 `DialogUtil` 显示，依赖页面 `body()` 中的 `DialogContainer`：

### 不显示左侧按钮

将 `leftBtnText = null`（不是 `""`）即可。此时 Dialog 只显示右侧按钮，宽度撑满整行，按钮中间的分隔线也会去掉。这是"单按钮确认弹窗"的标准做法。

### 单例 / 多开控制（`conflicting`）

- `conflicting = true`：新对话框会关闭上一个 `conflicting` 的对话框，保证同时只有一个。
- `conflicting = false`（默认）：允许多个 Dialog 叠加显示。注意 zIndex 相同时，新的会盖在旧的上面。

```Kotlin
// 重要提示类：保证只有一个
BaseVisuals.showTextDialog(
    pageId = ctx.pagerId,
    title = "错误",
    conflicting = true,
    // ...
)
```

### 关闭行为

| 场景                     | 默认行为                                     |
| ------------------------ | -------------------------------------------- |
| 点击左侧按钮             | 触发 `onDismiss`，关闭                       |
| 点击右侧按钮             | 触发 `onConfirm`，关闭                       |
| 点击遮罩                 | 直接关闭（取决于 `cancelByClickingOutside`） |
| 点击返回键（Android 等） | 直接关闭（取决于 `cancelOnBack`）            |
| 点击链接                 | 触发对应 `onClickLink`，**默认不关闭**       |

三个"关闭后动作"的参数互相独立：

- `closeAfterClick`（默认 `true`）：点击左 / 右按钮后是否自动关闭
- `closeAfterClickLink`（默认 `false`）：点击链接后是否自动关闭

> 如果 `closeAfterClick = false`，你需要在 `onConfirm` / `onDismiss` 回调里手动调用 `DialogUtil.cancelDialogImmediately(pageId, dialogId)`。

### 右侧按钮文字长度限制

Dialog 内部对右侧按钮文本调用了 `truncateText(rightText, 5)`，**超过 5 个字符会被自动截断**（显示为 `XXXXX...`）。

### 默认遮罩与动画

使用 `DialogConfig.dialogDefault`：

- **遮罩颜色**：半透明黑（`bg_modal_30`）
- **动画时长**：0.2s
- **点击遮罩关闭**：`true`
- **返回键关闭**：`false`
- **zIndex**：2000

如需调整，使用方式二或调用 `showTextDialog` 的对应参数。