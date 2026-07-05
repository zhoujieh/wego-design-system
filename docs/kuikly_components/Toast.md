# Toast

Demo 页 page 名称：`KToastPage`

## 概览

触发 Toast 显示：

```Kotlin
BaseVisuals.showGuideToast(
    pagerId,
    message = "下载成功，文字已复制",
    actionText = "去微信",
    onActionClick = {
        /** 跳转微信 */
    }
)
```

样式包括简单 Toast、引导型 Toast：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YjllODkzNTgyODdjNmYyY2M1ZjBmMTdhYzQ5MjNmMjFfR05wUllIb1FXamo4ZFcxclNsOTM4Mkp1OThwU0JyU3FfVG9rZW46UHZUYWI2bjJHb2tWSGZ4WVZQQWNSU1Rqbk1mXzE3NzU3ODc5OTk6MTc3NTc5MTU5OV9WNA)

> Toast 组件不直接使用 `KToast` / `KToastAction` DSL，而是通过 `BaseVisuals` 的静态方法调用。组件内部会通过 `DialogUtil` 统一管理弹出、动画、自动关闭等逻辑。

## API

BaseVisuals 提供了三种显示 Toast 的方法：

| 方法                     | 说明                                |
| ------------------------ | ----------------------------------- |
| `showSimpleSuccessToast` | 显示简单 Toast                      |
| `showFailedToast`        | 显示失败 Toast                      |
| `showGuideToast`         | 显示引导 Toast，默认包含左侧图标 |

---

### `BaseVisuals.showSimpleSuccessToast`

最基础的 Toast，仅显示一行文本。

| **name**      | **type**  | **功能**                                                     | **default value**                  |
| ------------- | --------- | ------------------------------------------------------------ | ---------------------------------- |
| `pageId`      | `String`  | 当前的 pageId                                                | **无（必须声明）**                 |
| `message`     | `String`  | 要显示的消息                                                 | **无（必须声明）**                 |
| `duration`    | `Int`     | 自定义显示时间（淡出之前的存在时间，毫秒）                   | `4000`                             |
| `zIndex`      | `Int`     | 自定义 zIndex                                                | `DialogConfig.toastDefault.zIndex` |
| `conflicting` | `Boolean` | 是否和其它 `conflicting=true` 的 Toast 冲突（单例模式） | `true`                             |

效果示例：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=OWZkZWIxYjg3YzRjNGJkZmM5YjJhZjFiMDg3MmFiZDJfS242VmpBemduQUVQdTlmaVhZempFTW16WTFrbjZqZGhfVG9rZW46WFhkTGI0dWh6b0pKVTl4UnRvOGNxSVFkblJmXzE3NzU3ODc5OTk6MTc3NTc5MTU5OV9WNA)

#### 参考代码

```Kotlin
// 基本用法
BaseVisuals.showSimpleSuccessToast(
    pageId = pagerId,
    message = "操作成功"
)

// 自定义时长
BaseVisuals.showSimpleSuccessToast(
    pageId = pagerId,
    message = "保存成功",
    duration = 2000
)
```

---

### `BaseVisuals.showFailedToast`

和 `showSimpleSuccessToast` 样式相同，但提供了文字模板，会自动拼接为 `"{action}失败：{message}"` 格式。

| **name**      | **type**  | **功能**                                                     | **default value**                  |
| ------------- | --------- | ------------------------------------------------------------ | ---------------------------------- |
| `pageId`      | `String`  | 当前的 pageId                                                | **无（必须声明）**                 |
| `message`     | `String`  | 要显示的失败原因                                             | **无（必须声明）**                 |
| `action`      | `String?` | 失败的动作名称（为 `null` 时显示"操作"）                     | `null`（显示为"操作"）             |
| `duration`    | `Int`     | 自定义显示时间（毫秒）                                       | `4500`                             |
| `zIndex`      | `Int`     | 自定义 zIndex                                                | `DialogConfig.toastDefault.zIndex` |
| `conflicting` | `Boolean` | 是否和其它 `conflicting=true` 的 Toast 冲突（单例模式） | `true`                             |

效果示例（action = "保存", message = "服务器繁忙，请稍后重试"）：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YzNhNzAxZDQyYTBkNjMxMTBjMWI0YTA0MGM0M2U2ZmJfcTFvVXRVQjVTaHNKTDNVTFZPR283MEhXSVVTYUFJSzZfVG9rZW46R1ZzTmJTbTNwb294UzN4RnM2S2MwTmV4bnFjXzE3NzU3ODc5OTk6MTc3NTc5MTU5OV9WNA)

#### 参考代码

```Kotlin
// 基本用法
BaseVisuals.showFailedToast(
    pageId = pagerId,
    message = "网络连接失败",
    action = "网络请求"
)
// 显示文本：「网络请求失败：网络连接失败」

// 不指定 action（默认显示"操作"）
BaseVisuals.showFailedToast(
    pageId = pagerId,
    message = "服务器繁忙，请稍后重试"
)
// 显示文本：「操作失败：服务器繁忙，请稍后重试」
```

---

### `BaseVisuals.showGuideToast`

带图标和操作按钮的引导型 Toast，样式与简单 Toast 完全不同。左侧默认显示对勾图标，右侧可配置引导按钮。

| **name**          | **type**            | **功能**                                                         | **default value**                  |
| ----------------- | ------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| `pageId`          | `String`            | 当前的 pageId                                                    | **无（必须声明）**                 |
| `message`         | `String`            | 要显示的消息                                                     | **无（必须声明）**                 |
| `actionText`      | `String?`           | 右侧引导按钮文本。为 `null` 或空字符串时不显示操作按钮           | `null`                             |
| `onActionClick`   | `() -> Unit`        | 点击引导按钮的回调                                               | `{}`                               |
| `actionStyle`     | `ActionButtonStyle` | 引导按钮样式，见下方枚举说明                                     | `ActionButtonStyle.WEAK`           |
| `iconPreset`      | `IconPresets`       | Toast 左侧图标预设                                               | `IconPresets.SUCCESS`（对勾）      |
| `customIconUri`   | `String`            | 自定义左侧图标 URI（覆盖 `iconPreset`）                         | `""`                               |
| `duration`        | `Int`               | 自定义显示时间（毫秒）                                           | `4500`                             |
| `zIndex`          | `Int`               | 自定义 zIndex                                                    | `DialogConfig.toastDefault.zIndex` |
| `conflicting`     | `Boolean`           | 是否和其它 `conflicting=true` 的 Toast 冲突（单例模式）     | `true`                             |

效果示例：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTJlNzQ0YzE1YzNjOGY1OGE2Y2UwMDNlMmFlOTAxY2JfZFFTM0J0eW9lb01nYjdFTDZhSzRIMmZOSzNFNGdPdW5fVG9rZW46QmNEMmJCZVhub055Zmh4M0I5VWNrdjQ1bmhjXzE3NzU3ODkwMTg6MTc3NTc5MjYxOF9WNA)

#### 枚举类 `ActionButtonStyle`

| 值         | 描述                                                   |
| ---------- | ------------------------------------------------------ |
| `None`     | 无操作按钮                                             |
| `WEAK`     | 弱样式 — 灰色文字 + 右侧箭头图标，点击高亮为半透明灰色 |
| `STRONG`   | 强样式 — 绿色文字，点击时背景高亮为半透明绿色           |

## 参考代码

```Kotlin
// 显示简单 Toast
BaseVisuals.showSimpleSuccessToast(
    pageId = pagerId,
    message = "置顶成功",
)

// 显示失败 Toast
BaseVisuals.showFailedToast(
    pageId = pagerId,
    action = "删除"
    message = errMsg,
) // 显示“删除失败：[errMsg]”

// 带 WEAK 引导按钮（默认样式，灰色文字 + 箭头）
BaseVisuals.showGuideToast(
    pageId = pagerId,
    message = "收藏成功",
    actionText = "去收藏夹",
    onActionClick = {
        // 跳转到收藏夹页面
    }
)

// 带 STRONG 引导按钮（绿色文字）
BaseVisuals.showGuideToast(
    pageId = pagerId,
    message = "添加成功",
    actionText = "查看",
    onActionClick = {
        // 跳转到查看页面
    },
    actionStyle = ActionButtonStyle.STRONG
)

// 仅图标，不显示操作按钮
BaseVisuals.showGuideToast(
    pageId = pagerId,
    message = "操作完成",
    actionText = null,
    onActionClick = {}
)
```

## 组件特性

### 自动关闭

所有 Toast 都会在显示 `duration` 毫秒后自动开始淡出动画并关闭。淡出动画约 500ms。无需手动管理 Toast 的关闭。

### 冲突控制（`conflicting`）

当 `conflicting = true`（默认）时，新 Toast 会自动关闭上一个 `conflicting` 的 Toast，保证同时只有一个 Toast 显示。

如果需要同时显示多个 Toast，可以将 `conflicting` 设置为 `false`：

```Kotlin
BaseVisuals.showSimpleSuccessToast(
    pageId = pagerId,
    message = "这是非冲突模式的 Toast",
    conflicting = false
)
```

### 前置条件：DialogContainer

Toast 依赖 `DialogContainer` 进行显示。确保页面的 `body()` 中包含 `DialogContainer`：

```Kotlin
override fun body(): ViewBuilder {
    val ctx = this
    return {
        DialogContainer {
            // 页面实际内容
        }
    }
}
```

### 位置与动画

- 所有 Toast 从底部弹出，距页面底部 72px + 安全区高度。
- 引导型 Toast（`showGuideToast`）内部使用 `KToastAction` 组件搭配 `DialogUtil` 管理，使用弹性入场动画（spring animation）。
- 简单 Toast（`showSimpleSuccessToast` / `showFailedToast`）内部使用 `KToast` 组件，搭配 `DialogConfig` 的 `useFadeEffect` 淡入淡出。
