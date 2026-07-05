# DialogContainer & DialogUtil

## 概览

```Plain
BaseVisuals（业务快捷方法）
    ↓ 调用
DialogUtil（静态工具类）
    ↓ 委托
DialogHelper（每个页面一个实例）
    ↓ 管理
DialogContainer（弹窗容器组件，渲染弹窗堆栈）
    ↓ 渲染
DialogItemView（单个弹窗项，负责动画和手势）
```

### DialogContainer

`DialogContainer` 是弹窗系统的核心容器组件，负责管理和渲染页面中的所有弹窗（Toast、Dialog、ActionSheet、ModalFrame、Popover、Push 等）。每个页面只需在 `body()` 中放置一个 `DialogContainer`，即可通过 `DialogUtil` 或 `BaseVisuals` 在任意位置弹出弹窗。

### DialogUtil

`DialogUtil` 是弹窗系统的对外静态工具类，封装了底层弹窗管理逻辑，提供显示 / 取消弹窗的 API。

> ### BaseVisuals

> `BaseVisuals`对象中基于 `DialogUtil` 封装了更高层业务工具类，提供 Toast、Dialog、ActionSheet、ModalFrame 等常见弹窗的快捷调用方法。

## API

1. ### 在页面中放置 DialogContainer

```Kotlin
import com.truedian.wg.core.components.organism.dialogUtil.DialogContainer


@Page("MyPage")
class MyPage : BasePager() {
    override fun body(): ViewBuilder {
        val ctx = this
        return {
            // 弹窗容器（必须放置，推荐作为最外层容器）
            DialogContainer {
                attr {
                    // 通常设置为页面高度减去底部导航栏 (navigationBarHeight是BasePager属性)
                    height(pagerData.pageViewHeight - ctx.navigationBarHeight)
                    marginBottom(ctx.navigationBarHeight)
                }

                // 页面的其它内容放在 DialogContainer 内部
                Text {
                    attr { text("页面内容") }
                }
            }
        }
    }
}
```

> **注意**：`DialogContainer` 使用绝对定位覆盖整个区域，弹窗在其上层渲染；页面内容直接放在 `DialogContainer` 大括号内部。

1. ### 通过 BaseVisuals 显示常见弹窗

大多数场景下，直接使用 `BaseVisuals` 的静态方法即可，无需直接操作 `DialogUtil`。

```Kotlin
import com.truedian.wg.core.components.visual.BaseVisuals
```

**Toast（成功提示）：**

```Kotlin
BaseVisuals.showSimpleSuccessToast(pagerId, "操作成功")
```

**Toast（失败提示）：**

```Kotlin
BaseVisuals.showFailedToast(pagerId, "网络异常")
```

**Toast（带引导按钮）：**

```Kotlin
BaseVisuals.showGuideToast(
    pageId = pagerId,
    message = "已复制到剪贴板",
    actionText = "去粘贴",
    onActionClick = { /* 跳转 */ }
)
```

**Loading Toast：**

```Kotlin
val loadingId = BaseVisuals.showLoadingToast(pagerId, "加载中...")
// ... 异步操作完成后 ...
DialogUtil.cancelDialogImmediately(pagerId, loadingId)
```

**文本 Dialog（确认弹窗）：**

```Kotlin
BaseVisuals.showTextDialog(
    pageId = pagerId,
    title = "确认删除？",
    content = "删除后不可恢复",
    leftBtnText = "取消",
    rightBtnText = "删除",
    onConfirm = { /* 执行删除 */ },
    onDismiss = { /* 用户取消 */ }
)
```

**ActionSheet：**

```Kotlin
BaseVisuals.showActionSheet(
    pageId = pagerId,
    actionSheetDataList = listOf(
        ActionSheetItemData("编辑"),
        ActionSheetItemData("删除", isDestructive = true)
    ),
    onActionClick = { index, item -> /* 处理点击 */ }
)
```

**ModalFrame（底部半屏弹窗）：**

```Kotlin
BaseVisuals.showModalFrame(
    pageId = pagerId,
    titleText = "选择分类",
    content = { /* 自定义内容 */ },
    onClose = { /* 关闭回调 */ }
)
```

**Push****（顶部消息气泡）：**

```Kotlin
BaseVisuals.showPush(
    pageId = pagerId,
    avatarUrl = "https://example.com/avatar.jpg",
    title = "张三",
    subtitle = "给你发送了一条消息",
    onClick = { /* 点击跳转 */ }
)
```

1. ### 通过 DialogUtil 直接控制弹窗

当 `BaseVisuals` 的封装不满足需求时，可以直接使用 `DialogUtil`：

```Kotlin
import com.truedian.wg.core.components.organism.dialogUtil.DialogUtil
import com.truedian.wg.core.components.organism.dialogUtil.internal.DialogConfig
```

**显示居中弹窗：**

```Kotlin
val dialogId = DialogUtil.showCenterDialog(
    pagerId,
    DialogConfig.dialogDefault // 使用和 Dialog 基础组件相同的参数
) {
    // 这里放任何自定义组件
    MyCustomDialogView {
        attr { /* ... */ }
    }
}
```

**显示底部弹窗：**

```Kotlin
val dialogId = DialogUtil.showBottomDialog(
    pagerId,
    DialogConfig.actionSheetDefault
) {
    MyCustomBottomSheet {
        attr { /* ... */ }
    }
}
```

**显示顶部弹窗：**

```Kotlin
val dialogId = DialogUtil.showTopDialog(
    pagerId,
    DialogConfig.pushDefault.copy(
        topDistance = pagerData.statusBarHeight + 8f,
        fadeOutDelayS = 5f
    )
) {
    MyNotificationBanner {
        attr { /* ... */ }
    }
}
```

**取消弹窗：**

```Kotlin
// 带动画关闭
DialogUtil.cancelDialog(pagerId, dialogId)

// 立即关闭（无动画）
DialogUtil.cancelDialogImmediately(pagerId, dialogId)

// 关闭最新的弹窗（不传 dialogId）
DialogUtil.cancelDialog(pagerId)
```

#### DialogConfig 配置项

| **参数**                   | **类型**               | **说明**                                               | **默认值** |
| -------------------------- | ---------------------- | ------------------------------------------------------ | ---------- |
| `animationTime`            | `Float`                | 动画时长（秒）                                         | `0.3f`     |
| `maskLayerColor`           | `Color`                | 遮罩层颜色                                             | 半透明黑色 |
| `cancelByClickingOutside`🌟 | `Boolean`              | 点击遮罩层是否关闭弹窗                                 | `true`     |
| `isCanSlideCancelOutSide`🌟 | `Boolean`              | 滑动遮罩层是否关闭弹窗                                 | `false`    |
| `isCanCancelBackEvent`🌟    | `Boolean`              | （安卓、鸿蒙）返回键是否关闭弹窗会拦截返回键的默认行为 | `false`    |
| `isCanClickBackground`🌟    | `Boolean`              | 弹窗打开时是否可点击背景元素                           | `false`    |
| `onCancel`🌟                | `(() -> Unit)?`        | 弹窗关闭中的回调                                       | `null`     |
| `onAnimComplete`           | `((Boolean) -> Unit)?` | 动画完成回调（`true` = 显示，`false` = 隐藏）          | `null`     |
| `zIndex`🌟                  | `Int`                  | 弹窗层级                                               | `500`      |
| (以下为高级动画配置)       |                        |                                                        |            |
| `bottomDistance`           | `Float`                | 底部弹窗离底部的距离                                   | `0f`       |
| `topDistance`              | `Float`                | 顶部弹窗离顶部的距离                                   | `0f`       |
| `useFadeEffect`            | `Boolean`              | 是否使用淡入淡出效果                                   | `false`    |
| `fadeOutDelayS`            | `Float?`               | 若使用淡入淡出效果，淡出效果触发的延迟（秒）           | `null`     |
| `translateDistance`        | `Float?`               | 自定义平移距离（默认平移一个组件高度）                 | `null`     |
| `disableAnimation`         | `Boolean`              | 禁用动画（如 Loading 场景）                            | `false`    |

此外，`DialogConfig.Companion` 提供了常用的预设配置：

| **预设**             | **zIndex** | **适用场景**     |
| -------------------- | ---------- | ---------------- |
| `toastDefault`       | 3000       | Toast 提示       |
| `pushDefault`        | 3000       | 顶部消息推送气泡 |
| `dialogDefault`      | 2000       | 居中确认弹窗     |
| `actionSheetDefault` | 1000       | 底部 ActionSheet |
| `popoverDefault`     | 4000       | Popover 气泡     |

使用预设时，通过 `copy()` 覆盖需要修改的参数：

```Kotlin
DialogConfig.toastDefault.copy(
    bottomDistance = 72f + pagerData.safeAreaInsets.bottom,
    fadeOutDelayS = 3f
)
```

## 实际使用示例

以下是 `PersonalAlbumPage` 中的使用方式（位于 `PersonalAlbumPage.kt`）：

```Kotlin
@Page(PageConfig.PersonalAlbum.HOME_PAGE)
internal class PersonalAlbumPage : BasePager() {

    override fun body(): ViewBuilder {
        val ctx = thisreturn {
            attr {
                padding(bottom = ctx.wgNavigationBarHeight)
            }

            // 弹窗容器作为最外层，管理所有弹窗
            DialogContainer {
                attr {
                    height(pagerData.pageViewHeight - ctx.wgNavigationBarHeight)
                }

                // 页面主体内容...
                vbind({ ctx.personalAlbumViewModel.requestExceptionCode with ctx.personalAlbumViewModel.hasGotCache }) {
                    vif({ ctx.personalAlbumViewModel.isShowExceptionPage() }) {
                        ExceptionPage { /* ... */ }
                    }
                    velse {
                        // 正常页面内容...
                    }
                }
            }
        }
    }
}
```

页面中的业务组件可以在任意位置通过 `BaseVisuals` 或 `DialogUtil` 弹出弹窗，只要当前页面包含了 `DialogContainer`：

```Kotlin
// 在 ViewModel 或组件的事件回调中：
BaseVisuals.showSimpleSuccessToast(pagerId, "保存成功")

// 或使用 DialogUtil 显示自定义弹窗：
DialogUtil.showBottomDialog(pagerId, DialogConfig.actionSheetDefault) {
    MyCustomSheet { /* ... */ }
}
```

## 内部实现

- `DialogContainer`（`InternalDialogContainer`）在 `created()` 时通过 `DialogHelperManager` 注册一个 `DialogHelper` 实例，在 `viewDestroyed()` 时自动注销，避免内存泄漏。
- `DialogHelper` 内部维护一个 `ObservableList<DialogStackItem>` 弹窗堆栈，支持多个弹窗同时存在。
- `DialogContainer` 的 `body()` 通过 `vfor` 遍历弹窗堆栈，为每个弹窗渲染一个 `DialogItemView`。
- `DialogItemView` 根据 `DialogPosition`（Center / Bottom / Top / RelativeOtherView）提供不同的进出场动画和手势交互（底部弹窗支持下滑关闭，顶部弹窗支持上滑关闭）。
- 原文档（authored by @陈少平 ）：[弹窗系统 ( Dialog ) 设计与使用文档](https://slowisfast.feishu.cn/wiki/H35FwNqb6inyEOkdtMxcTEcpnZ4?from=from_lark_index_search&ccm_open_type=from_lark_index_search&disposable_login_token=eyJ1c2VyX2lkIjoiNzUyNDEzODk4ODY2Njc0ODkzMCIsImRldmljZV9sb2dpbl9pZCI6Ijc2MTQ4Njc4MTY2NDYxODM4OTIiLCJ0aW1lc3RhbXAiOjE3NzYzMzIwNTAsInVuaXQiOiJldV9uYyIsInB3ZF9sZXNzX2xvZ2luX2F1dGgiOiIxIiwidmVyc2lvbiI6InYzIiwidGVuYW50X2JyYW5kIjoiZmVpc2h1IiwicGtnX2JyYW5kIjoi6aOe5LmmIn0%3D.7487d95bc7dbb06a10f03040393636b466dddba1c6323383e94159fb913c6661)