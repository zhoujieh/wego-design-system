# ModalFrame

> 本组件动画和手势交互逻辑稍显复杂，系 Kuikly 框架限制导致，请耐心阅读。

Demo 页 page 名称：`KuiklyModalDemo`

## 概览

ModalFrameX 是一个功能完整的**可拖拽模态框组件**，自带手势交互和动画逻辑：向上拖动可扩展到全屏，向下拖动可关闭；能够自动处理返回手势。适合承载商品详情、表单填写、带滚动的列表等内容场景。

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YjdmNTRmZDE4YjlmZTk5NDc2YTI3NGEyYmRiNmNhNGNfTTF4aXQ1d2JYb1dVaVg1WXA2RDQ5MEdjejBNbU00V2tfVG9rZW46SlhONmJIajhCb2NYZWd4VFJ3dWN0Y0xhbm1jXzE3NzYzMjUzMzA6MTc3NjMyODkzMF9WNA)

通常通过 `BaseVisuals.showModalFrameX()` 调用：

```Kotlin
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.5f,
    titleBar = {
        NavBar {
            attr {
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "弹窗标题")
            }
        }
    },
    content = {
        // 你的内容
    }
)
```

ModalFrameX 必须使用 NavBar 并且配合紧密。NavBar 设置 `linkToParentNavBar = true` 后会自动：

- 点击返回/关闭按钮时关闭弹窗
- 从 NavBar 区域也能触发下拉手势
- 全屏吸顶后，自动把下拉箭头切换成叉号（`linkDefaultButtons = true` 时，默认如此，如果明确声明了左侧按钮则不生效）
- NavBar 高度从 64px 切换到 44px

## API

### 通过 BaseVisuals 调用

| **name**                  | **type**                      | **功能**                                            | **default**   |
| ------------------------- | ----------------------------- | --------------------------------------------------- | ------------- |
| `pageId`🌟                 | `String`                      | 页面 ID（必填）                                     | —             |
| `content`🌟                | `ViewBuilder`                 | 内容区域（必填）                                    | —             |
| `modalHeight`🌟            | `Float`                       | 初始模态框高度（不含底部安全区）（必填）            | —             |
| `titleBar`🌟               | `ViewBuilder?`                | 标题栏（通常是 NavBar）                             | `null`        |
| `enableDrag`              | `Boolean?`                    | 拖拽模式，见下方说明                                | `true`        |
| `zIndex`                  | `Int`                         | 弹窗层级                                            | `100`         |
| `animationTime`           | `Float`                       | 弹入/弹出动画时长（秒）                             | `0.25f`       |
| `cancelByClickingOutside` | `Boolean`                     | 点击外部是否关闭                                    | `true`        |
| `bgColorTra`              | `MaskColor`                   | 背景遮罩颜色                                        | `bg_modal_60` |
| `horizontalScrollerView`🌟 | `Ref<ScrollerView>`           | 需要兼容的水平滑动 Scroller                         | `Ref()`       |
| `verticalScrollerView`🌟   | `Ref<ScrollerView>`           | 需要兼容的垂直滑动 Scroller                         | `Ref()`       |
| `onVisibilityChange`🌟     | `(Boolean) -> Unit`           | 弹窗可见性变化回调                                  | `null`        |
| `onAnimComplete`          | `(visible, expanded) -> Unit` | 动画完成回调（visible=是否可见, expanded=是否全屏） | `null`        |

返回值是 `Ref<ModalFrameXView>`，可以用来手动控制弹窗（比如调用 `expandToFull()` 或 `hide()`）。

#### `enableDrag` 配置

| 值      | 行为                                                         |
| ------- | ------------------------------------------------------------ |
| `true`  | 允许拖拽。向上拖到全屏，向下拖关闭（H5 不生效）              |
| `false` | 禁用拖拽，停留在半屏。可以通过代码调用 `expandToFull()` 手动全屏 |
| `null`  | 弹出后自动扩展至全屏（不需要用户拖拽）                       |

## 参考代码

### 基础示例

最简单的用法：搭配 NavBar，一个半屏弹窗，可以向上拖展开、向下拖关闭。

```Kotlin
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.5f,
    titleBar = {
        NavBar {
            attr {
                leftButtonType = NavBarLeftButtonType.CLOSE
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "基础示例")
            }
        }
    },
    content = {
        View {
            attr { flex(1f); padding(16f); allCenter() }
            Text {
                attr {
                    text("向上拖动可扩展到全屏\n向下拖动可关闭")
                    fontSize(16f)
                    textAlignCenter()
                }
            }
        }
    }
)
```

### 带操作按钮和可滚动内容

NavBar 右侧可以放操作按钮，内容区可以放 Scroller。

```Kotlin
val scrollerRef = Ref<ScrollerView<*,*>>()
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.6f,
    titleBar = {
        NavBar {
            attr {
                leftButtonType = NavBarLeftButtonType.CLOSE
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "商品详情")
                actionComponent1 = {
                    NavBarActionButton {
                        attr {
                            navBarActionButtonConfig = NavBarActionButtonConfig(
                                operateIcon = "fenxiang",
                                onClick = { /* 分享 */ }
                            )
                            actionType = NavBarActionType.ICON
                        }
                    }
                }
            }
        }
    },
    verticalScrollerView = scrollerRef,
    content = {
        Scroller {
            ref { scrollerRef.value = this }
            attr { flex(1f); padding(16f) }
            for (i in 1..10) {
                View {
                    attr { height(60f); allCenter() }
                    Text { attr { text("内容项 $i") } }
                }
            }
        }
    },
    onVisibilityChange = { visible ->
        KLog.i("Demo", "可见性: $visible")
    }
)
```

### 禁用拖动

不允许用户拖拽，但可以用代码手动全屏。

```Kotlin
var ref: Ref<ModalFrameXView>? = null
ref = BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = 400f,
    enableDrag = false,
    titleBar = {
        NavBar {
            attr {
                leftButtonType = NavBarLeftButtonType.CLOSE
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "固定高度")
            }
        }
    },
    content = {
        WGButton {
            attr { text = "手动全屏" }
            event {
                onClick { ref?.value?.expandToFull() }
            }
        }
    }
)
```

### 自动全屏（enableDrag = null）

弹出后直接展开到全屏，无需用户拖拽。

```Kotlin
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.5f,
    enableDrag = null,  // 自动全屏
    titleBar = {
        NavBar {
            attr {
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "自动全屏")
            }
        }
    },
    content = { /* ... */ }
)
```

### 表单场景（禁止点击外部关闭）

```Kotlin
val scrollerRef = Ref<ScrollerView<*, *>>()
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.7f,
    cancelByClickingOutside = false,
    verticalScrollerView = scrollerRef,
    titleBar = {
        NavBar {
            attr {
                linkToParentNavBar = true
                text = "填写表单"
                isCenter = true // 无左侧返回按钮，同时居中显示标题
                actionComponent1 = {
                    NavBarActionButton {
                        attr {
                            navBarActionButtonConfig = NavBarActionButtonConfig(
                                text = "提交",
                                onClick = { /* 提交表单 */ }
                            )
                            actionType = NavBarActionType.TEXT
                        }
                    }
                }
            }
        }
    },
    content = {
        Scroller {
            ref { scrollerRef.value = this }
            attr { flex(1f); padding(16f); flexDirectionColumn() }
            // 表单字段...
        }
    }
)
```

## 组件特性

### NavBar 联动

NavBar 和 ModalFrameX 通过 `ModalFrameInterface` 接口联动。NavBar 设置 `linkToParentNavBar = true` 后：

1. NavBar 在 `viewDidLayout` 时通过 `getDomParent<ModalFrameInterface>()` 找到父级的 ModalFrameXView
2. 点击返回按钮时调用 `parentModalFrameXView.hide()`
3. NavBar 区域的 pan 手势会转发给 `parentModalFrameXView.handlePanGesture(params)`
4. `linkDefaultButtons = true` 时，监听 `isExpanded` 状态：
   1. 半屏：显示下拉箭头（`DROP` 按钮），NavBar 高度 64px
   2. **全屏吸顶后：切换为圆形叉号（****`CLOSE_ROUND`****）**，NavBar 高度 44px

### 手势交互细节

ModalFrameX 内置了完整的拖拽手势识别：

- **向上拖动**：扩展模态框高度，超过阈值**或速度足够快时**自动全屏
- **向下拖动**：通过 transform 实现位移效果，超过 20% 高度**或速度足够快时**关闭
- **iOS 右滑左侧返回**：全屏状态下，从屏幕左侧边缘右滑可关闭（类似 iOS 返回手势）
- **水平/垂直滑动**：当绑定了 `horizontalScrollerView` 时，水平分量明显大于垂直分量时，手势会模拟水平滚动，否则会触发默认的上划效果。详见下方 Scroller 协调机制

### Scroller 协调机制

半屏状态下，如果内容里有 `Scroller`，直接滚动会和拖拽手势冲突。ModalFrameX 需要把 Scroller 的 ref 传给 `verticalScrollerView` 或 `horizontalScrollerView` 。此时：

1. 半屏时锁住 Scroller 的滚动（`scrollEnable = false`）
2. 垂直方向的滑动由 pan 手势统一处理：
   1. 若垂直分量较大，则会优先触发上划拖拽手势；
   2. 若水平分量较大，则会优先触发 `horizontalScrollerView` 的水平滑动
3. 全屏后解锁 Scroller（`scrollEnable = true`），恢复正常滚动，上述 pan 手势实效

## ModalFrame vs ModalFrameX

**简单确认弹窗用 ModalFrame，复杂内容交互用 ModalFrameX**。

详细对比见 [ModalFrame](https://slowisfast.feishu.cn/wiki/VRcLwtiiTiNY6Rkbxadc0kOvnVh)。