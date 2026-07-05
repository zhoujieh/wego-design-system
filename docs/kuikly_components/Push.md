# Push

Demo 页 page 名称：`KPushDemoPage`

## 概览

Push —— 消息型气泡组件

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=OWU0MzBlYzQ5ZmYxNzQ1MzliMDliMzZjYjZkYWM3MmNfaDIxUkwzeHBtc00xSXh1MjQ1b1Rwa09lZ3V5bGVxTmVfVG9rZW46RlBPbGJrWnpWb291dmJ4STE4ZmNlVUxybldiXzE3NzY3NzU2ODQ6MTc3Njc3OTI4NF9WNA)

搭配 `DialogUtil` 使用，可实现类似系统推送通知：从顶部滑入，带左侧头像、标题、副标题和可选的右侧操作区，支持下滑关闭、自动定时关闭、点击跳转。典型场景：即时消息推送、订单通知、活动提醒等。

```Kotlin
// 推荐：通过 BaseVisuals 调用（弹出式）
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://example.com/avatar.jpg",
    title = "张三",
    subtitle = "给你发送了一条消息",
    actionText = "查看",
    onClick = { /* 点击气泡 */ },
    onActionClick = { /* 点击操作按钮 */ }
)
```

Push 既可以作为**弹出式**（通过 `BaseVisuals.showPush(...)` 从顶部滑入，`DialogUtil` 统一管理动画/关闭）；或者手动使用 `DialogUtil.showTopDialog()` 搭配`KPush {}`以使用其响应式属性。

Push 容器高度自适应、最大宽度 480pt。结构从左到右：

1. **头像区**（可选）— 支持单 / 双头像，方形 / 圆形样式
2. **文本区**（标题 + 副标题）
3. **右侧区**（可选，按优先级从高到低）：
   1. 自定义内容（`actionContent`）
   2. 操作按钮（`actionText`，使用 LIGHT 样式的 [WGButton](https://slowisfast.feishu.cn/wiki/MQ3xwpaXAigg0UkRVMycoWsSnbc)）
   3. 引导箭头（`showGuideArrow`）

外观：半透明白底（`bg_white_100` + 0.88 不透明度）+ 高斯模糊 + 16pt 圆角 + 白色边框 + 轻微阴影。

## API

### `BaseVisuals.showPush` 参数

| **name**                      | **type**                 | **功能**                                                     | **default value**                 |
| ----------------------------- | ------------------------ | ------------------------------------------------------------ | --------------------------------- |
| `pageId`🌟                     | `String`                 | 页面 ID（必填）                                              | /                                 |
| `avatarUrl`🌟                  | `String`                 | 左侧主头像 URL                                               | `""`                              |
| `avatarUrl2`🌟                 | `String`                 | 次头像 URL（非空时显示双头像）                               | `""`                              |
| `useRoundAvatar`🌟             | `Boolean`                | 是否使用圆形头像（否则方形带圆角）                           | `false`                           |
| `title`🌟                      | `String`                 | 标题文本                                                     | `""`                              |
| `subtitle`🌟                   | `String`                 | 副标题文本                                                   | `""`                              |
| `showGuideArrow`              | `Boolean`                | 是否显示右侧引导箭头（优先级低于 `actionText` / `actionContent`） | `false`                           |
| `actionText`                  | `String`                 | 右侧操作按钮文本（非空时显示 WGButton）                      | `""`                              |
| `actionContent`               | `ViewBuilder?`           | 右侧自定义内容（优先级最高）                                 | `null`                            |
| `titleMaxLines`               | `Int`                    | 标题最大行数                                                 | `1`                               |
| `subtitleMaxLines`            | `Int`                    | 副标题最大行数                                               | `2`                               |
| `closeAfterClick`             | `Boolean`                | 点击气泡后是否关闭                                           | `true`                            |
| `closeAfterClickActionButton` | `Boolean`                | 点击操作按钮后是否关闭                                       | `true`                            |
| `avatarImageAttr1`            | `WGImageAttr.() -> Unit` | 主头像的 WGImage 额外属性配置                                | `{}`                              |
| `avatarImageAttr2`            | `WGImageAttr.() -> Unit` | 次头像的 WGImage 额外属性配置                                | `{}`                              |
| `duration`                    | `Int`                    | 自动关闭时长（毫秒）                                         | `5000`                            |
| `zIndex`                      | `Int`                    | 弹窗层级                                                     | `DialogConfig.pushDefault.zIndex` |
| `conflicting`                 | `Boolean`                | 是否与其它 Push 冲突（新 Push 显示时会关闭旧的）             | `true`                            |
| `onClick`                     | `(() -> Unit)?`          | 点击整个气泡的回调                                           | `null`                            |
| `onActionClick`               | `(() -> Unit)?`          | 点击右侧操作按钮的回调                                       | `null`                            |

返回 `DialogId`，可用于手动关闭：

```Kotlin
val pushId = BaseVisuals.showPush(...)
DialogUtil.cancelDialog(pageId, pushId)
```

### PushAttr

| **name**                      | **type**                 | **功能**                       | **default** |
| ----------------------------- | ------------------------ | ------------------------------ | ----------- |
| `avatarUrl1`****响应式***     | `String`                 | 主头像 URL                     | `""`        |
| `avatarUrl2`****响应式***     | `String`                 | 次头像 URL（非空时显示双头像） | `""`        |
| `useRoundAvatar`****响应式*** | `Boolean`                | 是否使用圆形头像               | `false`     |
| `title`****响应式***          | `String`                 | 标题文本                       | `""`        |
| `subtitle`****响应式***       | `String`                 | 副标题文本                     | `""`        |
| `showGuideArrow`****响应式*** | `Boolean`                | 是否显示右侧引导箭头           | `false`     |
| `actionText`****响应式***     | `String`                 | 右侧操作按钮文本               | `""`        |
| `actionContent`               | `ViewBuilder?`           | 右侧自定义内容                 | `null`      |
| `titleMaxLines`               | `Int`                    | 标题最大行数                   | `1`         |
| `subtitleMaxLines`            | `Int`                    | 副标题最大行数                 | `2`         |
| `avatarImageAttr1`            | `WGImageAttr.() -> Unit` | 主头像的 WGImage 额外属性配置  | `{}`        |
| `avatarImageAttr2`            | `WGImageAttr.() -> Unit` | 次头像的 WGImage 额外属性配置  | `{}`        |

### PushEvent

| **name**        | **type**                     | **功能**                 |
| --------------- | ---------------------------- | ------------------------ |
| `onClick`       | `() -> Unit`                 | 点击整个气泡             |
| `onActionClick` | `() -> Unit`                 | 点击右侧操作按钮         |
| `pan`           | `(PanGestureParams) -> Unit` | Pan 手势（用于下滑关闭） |

> 右侧区优先级：`actionContent` > `actionText` > `showGuideArrow`。设置高优先级字段时，低优先级字段会被忽略。

## 参考代码

### 最简单的 Push

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://picsum.photos/80/80?random=1",
    title = "李四",
    subtitle = "你好，在吗？"
)
```

### 带操作按钮

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://picsum.photos/80/80?random=2",
    title = "新订单通知",
    subtitle = "你有一笔新订单需要处理",
    actionText = "处理",
    onActionClick = {
        BaseVisuals.showSimpleSuccessToast(ctx.pagerId, "已点击操作按钮")
    }
)
```

### 带引导箭头

点击整个气泡跳转（常见：点击查看活动详情）。

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://picsum.photos/80/80?random=3",
    title = "活动提醒",
    subtitle = "点击查看活动详情",
    showGuideArrow = true,
    onClick = { /* 跳转 */ }
)
```

### 无头像（系统通知）

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    title = "系统通知",
    subtitle = "你的会员即将到期，请及时续费以免影响使用",
    actionText = "续费",
    onActionClick = { /* 续费 */ }
)
```

### 圆形头像 + 长文本

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://picsum.photos/80/80?random=4",
    useRoundAvatar = true,
    title = "客服消息",
    subtitle = "尊敬的用户您好，您反馈的问题我们已经收到，正在处理中，请耐心等待...",
    subtitleMaxLines = 2
)
```

### 双头像（群聊消息）

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://picsum.photos/80/80?random=5",
    avatarUrl2 = "https://picsum.photos/80/80?random=6",
    useRoundAvatar = true,
    title = "群聊消息",
    subtitle = "双头像推送通知样式"
)
```

### 冲突控制

```Kotlin
// conflicting = true（默认）：新 Push 会关闭旧 Push
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    title = "冲突消息",
    subtitle = "这条消息会替换上一条",
    conflicting = true
)

// conflicting = false：允许多个 Push 共存
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    title = "独立消息",
    subtitle = "这条消息不会替换其它 Push",
    conflicting = false
)
```

### 自定义右侧内容（actionContent）

当操作按钮满足不了需求时，用 `actionContent` 完全接管右侧：

```Kotlin
BaseVisuals.showPush(
    pageId = ctx.pagerId,
    avatarUrl = "https://picsum.photos/80/80?random=7",
    title = "抢购提醒",
    subtitle = "限时活动即将开始",
    actionContent = {
        View {
            attr {
                size(60f, 32f)
                borderRadius(16f)
                backgroundColor(ColorManager.red_100)
                allCenter()
            }
            Text {
                attr {
                    text("立抢")
                    fontSize(13f)
                    color(Color.WHITE)
                }
            }
        }
    }
)
```

### 长时间显示（不自动关闭）

显式设置 `duration` 即可。若要完全由调用方控制关闭时机，可以传入非常大的 `duration`：

```Kotlin
val pushId = BaseVisuals.showPush(
    pageId = ctx.pagerId,
    title = "持续提示",
    subtitle = "等待用户操作",
    duration = Int.MAX_VALUE
)

// 条件满足时手动关闭
DialogUtil.cancelDialog(ctx.pagerId, pushId)
```

### 使用 KPush DSL

需要利用 KPush 中的响应式属性时，使用 `DialogUtil` + `KPush {}`：

```Kotlin
var title by observable("这是一条可变消息")

// 某个 event 中
val ctx = this
var currentDialogItemView: InternalDialogItemView? = null
val pushId = DialogUtil.showTopDialog(
    pagerId,
    DialogConfig.pushDefault.copy(
        topDistance = pagerData.statusBarHeight + 8f,
        fadeOutDelayS = 5f
    )
) {
    KPush {
        attr {
            this.title = ctx.title
        }
        event {
            onClick {
                ctx.title = ctx.title + "!"
            }
            onActionClick {
                DialogUtil.cancelDialog(pagerId)
            }
            pan {
                currentDialogItemView?.handleTopPanGesture(it)
            }
        }
    }
}

setTimeout(pagerId) {
    currentDialogItemView = DialogUtil.getDialogItemView(pagerId, pushId)
}
```

## 组件特性

### 头像布局（4 种组合）

| `avatarUrl2` 是否为空 | `useRoundAvatar` | 效果                                  |
| --------------------- | ---------------- | ------------------------------------- |
| 是                    | `false`          | 单个方形头像（36×36，小边框）         |
| 是                    | `true`           | 单个圆形头像（40×40）                 |
| 否                    | `false`          | 双方形头像（左上 32×32 + 右下 32×32） |
| 否                    | `true`           | 双圆形头像（左上 36×36 + 右下 36×36） |

双头像时主头像（`avatarUrl1`）在左上、次头像（`avatarUrl2`）在右下，使用绝对定位错位叠加，带白色边框。

### 从顶部滑入动画

`BaseVisuals.showPush` 使用 `DialogConfig.pushDefault` 的基础上覆盖：

- `topDistance = statusBarHeight + 8f`（贴近状态栏下方，留 8pt 间距）
- `fadeOutDelayS = duration / 1000f`

淡入淡出 + 向下平移的组合动画由 `DialogItemView` 处理，不需要手动配置。

### 下滑关闭手势

Push 内部监听 `pan` 事件并调用 `DialogItemView.handleTopPanGesture()`，用户从 Push 上向上滑动可以关闭气泡。此能力由 `DialogUtil` 的 Top 弹窗定位自动提供，无需额外配置。

### 冲突控制（`conflicting`）

`conflicting = true`（默认）时，`BaseVisuals` 内部通过 `universalPushId` 保证同时只有一个 Push。新 Push 显示时会关闭旧的。关闭时使用 `cancelDialogImmediately`（无动画），所以视觉上是瞬间替换。

需要多个 Push 叠加时传入 `conflicting = false`。

### DialogContainer 依赖

`BaseVisuals.showPush` 通过 `DialogUtil` 显示，页面 `body()` 中必须包含 `DialogContainer`。详见 [DialogContainer](https://slowisfast.feishu.cn/wiki/LX2TwmVUcipKoqkAYJjcuaWGnBc)。