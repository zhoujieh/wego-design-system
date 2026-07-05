Demo 页 page 名称：`KuiklyLoadingDemo`

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MjZjMzM5M2Y1NTE4MjNkMWQxNTMwZjQ3OTNhNmRiMDNfZHVPeVFRWnV2SjhTNTRId1ZXZnFDV2RGclAwand5bVdfVG9rZW46TWFEdmJXQzl4bzhRUjB4endYM2NvMEFKbmJlXzE3NzY3NzQzNDk6MTc3Njc3Nzk0OV9WNA)

Loading —— 居中浮层提示组件，用于加载中、操作成功、失败、警告等场景。图标区域自动根据类型切换：`LOADING` 使用 PAG 帧动画，其它类型使用对应的 iconFont 图标。

```Kotlin
// 推荐：通过 BaseVisuals 调用
val id = BaseVisuals.showLoadingToast(
    pageId = ctx.pagerId,
    text = "加载中...",
    type = LoadingToastType.LOADING
)
// ... 异步操作完成后 ...
DialogUtil.cancelDialogImmediately(ctx.pagerId, id)
```

`Loading` 本身是一个纯 UI 组件（`Loading { ... }` DSL），不负责弹出、动画、关闭等逻辑——这些由 `DialogUtil` 管理。**绝大多数场景下你不会直接使用** **`Loading`** **DSL**，而是通过 `BaseVisuals.showLoadingToast(...)` 调用。

## API

### `BaseVisuals.showLoadingToast` 参数

| **name**                  | **type**           | **功能**                                                 | **default value**                  |
| ------------------------- | ------------------ | -------------------------------------------------------- | ---------------------------------- |
| `pageId`🌟                 | `String`           | 页面 ID（必填）                                          | /                                  |
| `text`                    | `String`           | 文本内容                                                 | `""`                               |
| `type`🌟                   | `LoadingToastType` | Loading 类型：`LOADING` / `SUCCESS`/ `WARNING` / `ERROR` | `LoadingToastType.LOADING`         |
| `cancelByClickingOutside` | `Boolean`          | 点击遮罩是否关闭（默认 `false` 防止误触）                | `false`                            |
| `zIndex`                  | `Int`              | 弹窗层级                                                 | `DialogConfig.toastDefault.zIndex` |
| `conflicting`             | `Boolean`          | 是否与其它 Toast 冲突（新 Loading 显示时会关闭旧的）     | `true`                             |

返回 `DialogId`，用于手动关闭：

```Kotlin
val loadingId = BaseVisuals.showLoadingToast(pagerId, "加载中...")
// ...
DialogUtil.cancelDialogImmediately(pagerId, loadingId)
```

### 枚举类 `LoadingToastType`

| 值        | 图标                    | 典型用途    |
| --------- | ----------------------- | ----------- |
| `LOADING` | PAG 加载动画（三个点）  | 请求进行中  |
| `SUCCESS` | `goutoast`（对勾）      | 操作成功    |
| `WARNING` | `tanhao-mian`（感叹号） | 警告 / 提醒 |
| `ERROR`   | `chatoast`（叉号）      | 操作失败    |

## 参考代码

### 加载中 → 自动关闭

最常见用法：发起异步操作前显示 Loading，操作完成后手动关闭。

```Kotlin
val loadingId = BaseVisuals.showLoadingToast(
    pageId = ctx.pagerId,
    text = "加载中...",
    type = LoadingToastType.LOADING
)

ctx.lifecycleScope.launch {
    delay(2000) // 模拟异步操作
    DialogUtil.cancelDialogImmediately(ctx.pagerId, loadingId)
}
```

### 成功 / 失败 / 警告提示

短暂弹出一个状态提示（约 1.5–2 秒后关闭）。

```Kotlin
// 成功val id = BaseVisuals.showLoadingToast(
    ctx.pagerId,
    text = "操作成功",
    type = LoadingToastType.SUCCESS
)
ctx.lifecycleScope.launch {
    delay(1500)
    DialogUtil.cancelDialogImmediately(ctx.pagerId, id)
}

// 失败
BaseVisuals.showLoadingToast(
    ctx.pagerId,
    text = "操作失败",
    type = LoadingToastType.ERROR
)

// 警告
BaseVisuals.showLoadingToast(
    ctx.pagerId,
    text = "请注意",
    type = LoadingToastType.WARNING
)
```

### 模拟异步请求：Loading → 成功

请求进行中展示 Loading；请求完成后关闭 Loading，再显示一个成功 / 失败 Toast。

```Kotlin
val loadingId = BaseVisuals.showLoadingToast(ctx.pagerId, text = "提交中...")

ctx.lifecycleScope.launch {
    delay(2000)
    DialogUtil.cancelDialogImmediately(ctx.pagerId, loadingId)

    val successId = BaseVisuals.showLoadingToast(
        ctx.pagerId,
        text = "提交成功",
        type = LoadingToastType.SUCCESS
    )
    delay(1500)
    DialogUtil.cancelDialogImmediately(ctx.pagerId, successId)
}
```

### 仅图标（无文字）

不传 `text` 时只显示图标，容器会收缩至最小宽度 96pt。

```Kotlin
BaseVisuals.showLoadingToast(ctx.pagerId, type = LoadingToastType.LOADING)
```

### 直接使用 Loading DSL

一般不需要，但如果你要自己搭配 `DialogUtil.showCenterDialog` 控制 Loading 布局 / 样式：

```Kotlin
DialogUtil.showCenterDialog(
    pageId,
    DialogConfig.dialogDefault.copy(
        disableAnimation = true,
        cancelByClickingOutside = false,
        maskLayerColor = Color.TRANSPARENT,
        isCanClickBackground = true
    )
) {
    Loading(attr = {
        text = "加载中..."
        loadingToastType = LoadingToastType.LOADING
    })
}
```

## 组件特性

### 组件布局

Loading 自适应宽度（最小宽度 96pt）、固定高度 96pt。从上到下依次是：

1. **图标区**（24x24）— 根据 `type` 显示 PAG 加载动画或对应的 iconFont
2. **文本**（14pt 白字）— 可选

默认布局：

- 容器：`bg_toast_96` 深色半透明背景 + 8pt 圆角 + 16pt 水平 padding
- 吞噬点击事件，点击不会穿透到下层

### 不会自动关闭

与 Toast 不同，Loading **不会自动关闭**——`BaseVisuals.showLoadingToast` 返回 `DialogId` 后，调用方需要自行决定合适的关闭时机：

- 异步请求完成 → `DialogUtil.cancelDialogImmediately(pageId, loadingId)`
- 超时兜底 → `lifecycleScope.launch { delay(timeout); cancel(...) }`

如果忘记关闭，Loading 会一直留在界面上。

### 冲突控制（`conflicting`）

`conflicting = true`（默认）时，新的 Loading / Toast 会自动关闭上一个冲突的弹窗（内部复用 `universalToastId`）。这意味着：

- **Loading 和 Toast 会互相冲突**——显示 Toast 会关闭先前的 Loading，反之亦然。
- 如果希望 Loading 不被后续 Toast 关闭，传入 `conflicting = false`。

### 图标切换无动画

`loadingToastType` 是响应式属性，切换类型时图标会立即更新（使用 `vbind` 重建内部节点）：

- `LOADING` → 使用 PAG 组件渲染 `component/loading_white.pag`
- `SUCCESS` / `WARNING` / `ERROR` → 使用对应的 iconFont

### 默认遮罩

`showLoadingToast` 使用 `DialogConfig.dialogDefault` 的基础上覆盖了以下参数：

- `disableAnimation = true` — 进入无动画
- `maskLayerColor = Color.TRANSPARENT` — 无遮罩
- `cancelByClickingOutside = false` — 点击外部不关闭
- `isCanClickBackground = true` — 允许点击背后元素（因为没有遮罩）
- `isCanCancelBackEvent = false` — 返回键不关闭

这样 Loading 看起来只是一个"浮在界面上方的小提示"，不阻塞用户与背景的交互。如果需要遮罩，可以自己组合 `DialogUtil.showCenterDialog` + `Loading` 使用。

### DialogContainer 依赖

Loading 通过 `DialogUtil` 显示，页面 `body()` 中必须包含 `DialogContainer`。

详见 [DialogContainer](https://slowisfast.feishu.cn/wiki/LX2TwmVUcipKoqkAYJjcuaWGnBc)。