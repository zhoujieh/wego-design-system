# ActionBar

Demo 页 page 名称：`KuiklyActionBarDemo`

## 概览

ActionBar —— 操作栏组件

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmFiMGM2YTFhZTY3ZWMyYTM0OGNmNjcwODRjYjVhM2VfZkt3bkVJeW5FRVpOZ09wcXBFc0piNHZvR0dRcHhLOVpfVG9rZW46QTFtemJuYmw2b0h5QWV4eTNIMWNyWmhwbnlnXzE3NzY3NjI5MzU6MTc3Njc2NjUzNV9WNA)

接收一组 `ActionBarItemData`，按顺序渲染为一排可点击的操作项。常见用途是页面底部的固定操作栏（如"加入购物车 / 立即购买"）、列表项底部的操作区（如"分享 / 编辑 / 删除"）等。

```Kotlin
ActionBar {
    attr {
        flex(1f)
        includeBottomSafeArea = falsedata.addAll(mutableListOf(
            ActionBarItemData(
                id = "cancel",
                text = "取消",
                onClick = { /* ... */ }
            ),
            ActionBarItemData(
                id = "confirm",
                text = "确认",
                color = Color(WGColor.green_1_100),
                onClick = { /* ... */ }
            )
        ))
    }
}
```

## API

### ActionBarItemData（操作项数据类）

| **name**               | **type**                      | **功能**                                                     | **default value**            |
| ---------------------- | ----------------------------- | ------------------------------------------------------------ | ---------------------------- |
| `id`🌟                  | `String`                      | 唯一标识符（业务自定义，组件不强制校验唯一性）               | *(必填)*                     |
| `text`🌟                | `String`                      | 操作项文本；空字符串时不渲染 Text 组件                       | *(必填)*                     |
| `color`                | `Color`                       | 文字/图标颜色                                                | `Color(WGColor.text_100)`    |
| `iconName`             | `String?`                     | 左侧图标的 iconFont 名称；为 `null` 时不显示图标             | `null`                       |
| `isHighlighted`        | `Boolean`                     | 是否为高亮/激活态，为 `true` 时文字和图标颜色变为 `customHighlightColor` | `false`                      |
| `customHighlightColor` | `Color`                       | 高亮态颜色                                                   | `Color(WGColor.green_1_100)` |
| `customView`           | `ViewBuilder?`                | 完全自定义内容，设置后会替代默认的图标 + 文本渲染            | `null`                       |
| `onClick`🌟             | `(ActionBarItemData) -> Unit` | 点击回调，参数为当前项数据                                   | `{}`                         |

### ActionBar 属性（`ActionBarViewAttr`）

| **name**                | **type**                            | **功能**                                                     | **default value**  |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------ | ------------------ |
| `data`🌟****响应式***    | `ObservableList<ActionBarItemData>` | 操作项列表（按顺序渲染）                                     | `observableList()` |
| `includeBottomSafeArea` | `Boolean`                           | 是否在操作行下方追加底部安全区高度的空白（适用于页面底部固定的 ActionBar） | `true`             |
| `autoFold`🌟             | `Boolean`                           | 当 `data.size > 4` 时，是否将第 3 项起折叠为"更多"按钮；点击"更多"会以 PopViewSelect 形式展开 |                    |

### ActionBar 事件（`ActionBarViewEvent`）

ActionBar 本身不暴露业务事件（点击逻辑通过每个 `ActionBarItemData` 的 `onClick` 回调处理）。`ActionBarViewEvent` 内部的 `onHeightExceeded` 仅用于子项高度协调，外部无需处理。

## 参考代码

### 基础用法：双按钮

最常见的用法，通常用于底部确认栏：

```Kotlin
View {
    attr {
        height(48f)
        flexDirectionRow()
    }
    ActionBar {
        attr {
            flex(1f)
            includeBottomSafeArea = falsedata.addAll(mutableListOf(
                ActionBarItemData(
                    id = "cancel",
                    text = "取消",
                    onClick = { /* 取消 */ }
                ),
                ActionBarItemData(
                    id = "confirm",
                    text = "确认",
                    color = Color(WGColor.green_1_100),
                    onClick = { /* 确认 */ }
                )
            ))
        }
    }
}
```

### 带图标的操作项

每项左侧显示一个 iconFont 图标：

```Kotlin
ActionBar {
    attr {
        flex(1f)
        includeBottomSafeArea = falsedata.addAll(mutableListOf(
            ActionBarItemData(
                id = "share",
                text = "分享",
                iconName = "yuanjia",
                onClick = { /* ... */ }
            ),
            ActionBarItemData(
                id = "edit",
                text = "编辑",
                iconName = "yuanjia",
                onClick = { /* ... */ }
            ),
            ActionBarItemData(
                id = "delete",
                text = "删除",
                iconName = "yuanjia",
                color = Color(WGColor.red_100),
                onClick = { /* ... */ }
            )
        ))
    }
}
```

### 高亮态（如"已收藏"）

`isHighlighted = true` 时，文字和图标颜色切换为 `customHighlightColor`。适合表示"已选中 / 已激活"的状态：

```Kotlin
ActionBar {
    attr {
        flex(1f)
        includeBottomSafeArea = falsedata.addAll(mutableListOf(
            ActionBarItemData(
                id = "like",
                text = "已收藏",
                iconName = "yuanjia",
                isHighlighted = true,
                customHighlightColor = Color(WGColor.green_1_100),
                onClick = { /* 取消收藏 */ }
            ),
            ActionBarItemData(
                id = "buy",
                text = "立即购买",
                color = Color(WGColor.green_1_100),
                onClick = { /* 立即购买 */ }
            )
        ))
    }
}
```

### 自动折叠（超过 4 项）

`autoFold = true`（默认）且 `data.size > 4` 时，第 3 项起被折叠成"更多"按钮。点击"更多"会在上方弹出一个 [PopViewSelect](https://vscode-remote+ssh-002dremote-002b7b22686f73744e616d65223a223130302e3132322e3134392e3530222c2275736572223a226131227d.vscode-resource.vscode-cdn.net/Volumes/Vincent/Projects/wsxc_newarch_rn/android/kuikly_shared/kuikly_doc/basic_components/PopViewSelect.md) 列出被折叠的项目：

```Kotlin
View {
    attr {
        height(72f)  // 超过 4 项时建议使用 72f 高度
        flexDirectionRow()
    }
    ActionBar {
        attr {
            flex(1f)
            includeBottomSafeArea = false
            autoFold = true  // 默认即为 truedata.addAll(mutableListOf(
                ActionBarItemData(id = "a1", text = "操作一", iconName = "yuanjia", onClick = { /* ... */ }),
                ActionBarItemData(id = "a2", text = "操作二", iconName = "yuanjia", onClick = { /* ... */ }),
                ActionBarItemData(id = "a3", text = "操作三长文本", iconName = "yuanjia", onClick = { /* ... */ }),
                ActionBarItemData(id = "a4", text = "操作四", iconName = "yuanjia", onClick = { /* ... */ }),
                ActionBarItemData(id = "a5", text = "操作五", iconName = "yuanjia", onClick = { /* ... */ }),
            ))
        }
    }
}
```

### 禁用自动折叠

`autoFold = false` 时即使超过 4 项也会全部直接展示：

```Kotlin
ActionBar {
    attr {
        flex(1f)
        includeBottomSafeArea = false
        autoFold = falsedata.addAll(mutableListOf(
            ActionBarItemData(id = "b1", text = "A", onClick = { /* ... */ }),
            ActionBarItemData(id = "b2", text = "B", onClick = { /* ... */ }),
            ActionBarItemData(id = "b3", text = "C", onClick = { /* ... */ }),
            ActionBarItemData(id = "b4", text = "D", onClick = { /* ... */ }),
            ActionBarItemData(id = "b5", text = "E", onClick = { /* ... */ })
        ))
    }
}
```

### 自定义视图（customView）

当默认的图标 + 文字样式无法满足需求时，使用 `customView` 完全接管项目内容。典型场景：放一个圆角按钮、一个富样式的文本等：

```Kotlin
ActionBar {
    attr {
        flex(1f)
        includeBottomSafeArea = falsedata.addAll(mutableListOf(
            ActionBarItemData(
                id = "custom1"
                customView = {
                    View {
                        attr {
                            size(80f, 32f)
                            borderRadius(16f)
                            backgroundColor(Color(WGColor.green_1_100))
                            allCenter()
                        }
                        Text {
                            attr {
                                text("加入购物车")
                                fontSize(13f)
                                color(Color.WHITE)
                            }
                        }
                    }
                },
                onClick = { /* ... */ }
            ),
            ActionBarItemData(
                id = "custom2",
                text = "",
                customView = {
                    View {
                        attr {
                            size(80f, 32f)
                            borderRadius(16f)
                            backgroundColor(Color(WGColor.red_10))
                            allCenter()
                        }
                        Text {
                            attr {
                                text("立即抢购")
                                fontSize(13f)
                                color(Color.WHITE)
                            }
                        }
                    }
                },
                onClick = { /* ... */ }
            )
        ))
    }
}
```

### 页面底部固定的 ActionBar

最常见的使用场景：固定在页面底部作为操作栏。此时 `includeBottomSafeArea = true` 会自动适配 iOS / 鸿蒙的底部安全区：

```Kotlin
ActionBar {
    attr {
        zIndex(200)
        backgroundColor(Color.WHITE)
        width(pagerData.pageViewWidth)
        absolutePosition(bottom = 0f)
        includeBottomSafeArea = true  // 自动处理底部安全区
        data.addAll(mutableListOf(
            ActionBarItemData(
                id = "pin_cart",
                text = "加入购物车",
                iconName = "yuanjia",
                onClick = { /* ... */ }
            ),
            ActionBarItemData(
                id = "pin_buy",
                text = "立即购买",
                color = Color(WGColor.green_1_100),
                iconName = "yuanjia",
                onClick = { /* ... */ }
            )
        ))
    }
}
```

> 将这个 ActionBar 放在页面最外层使用 `absolutePosition(bottom = 0f)` 固定到底部，并给上方的可滚动内容预留一段底部 padding，避免被 ActionBar 遮挡。

## 组件特性

### 布局结构

ActionBar 的结构：

- **操作行** — 横向排列的 `ActionBarItemData` 项，每项默认 `flex(1f)` 等分宽度，项之间有一根 0.6×16 的竖向分割线
- **底部安全区**（可选）— `includeBottomSafeArea = true`（默认）时，自动在操作行下方添加一条等于 `pagerData.safeAreaInsets.bottom` 的空白

每个操作项的结构：

- 默认渲染为 **图标 + 文本**（图标可选，通过 `iconName` 指定 iconFont）
- 点击有按下态（背景变 `bg_gray_06`）
- 文本超出容器宽度时自动截断为 2 行并省略
- 可以通过 `customView` 完全替换默认的图标 + 文本渲染

### 自动折叠机制

当 `autoFold = true` 且 `data.size > 4` 时：

1. 前 3 项正常直接渲染在操作行中
2. 从第 4 项起（下标 3 到 `size - 1`）全部折叠到最后一个"更多"按钮
3. "更多"按钮使用固定的 `yuanjia` 图标和"更多"文本
4. 点击"更多"时，通过 [PopViewSelect](https://vscode-remote+ssh-002dremote-002b7b22686f73744e616d65223a223130302e3132322e3134392e3530222c2275736572223a226131227d.vscode-resource.vscode-cdn.net/Volumes/Vincent/Projects/wsxc_newarch_rn/android/kuikly_shared/kuikly_doc/basic_components/PopViewSelect.md) 在上方（`PopViewLocation.TOP`、`PopViewHorizontalAlign.CENTER`）弹出折叠项的列表，`popItemWidth = 96f`，`selectMode = false`
5. 被折叠项目的 `iconName` 会透传为 PopViewSelect 项的 `leftIcon`

若 `data.size == 4`，所有项都会直接展示，不会触发折叠。

### 分割线

除最后一项外，其它每项右侧都会渲染一条 `0.6 × 16` 的竖向灰色分割线（`bg_line_08` 颜色）。分割线计入当前项的渲染宽度。当折叠为"更多"时，"更多"按钮作为新的最后一项，不显示右侧分割线。

### 高度自适应

每个操作项的默认高度由内容决定：

- 只有图标、没有文字：高度由图标高度决定
- 只有文字（未换行）：高度约 24pt（`lineHeight(24f)`）
- 文字换行（2 行）：高度约 48pt

当任意一项的文字长度超出自身列宽导致需要换行时，组件会自动触发 `onHeightExceeded`，**所有项**（包括"更多"按钮）会同步切换到固定 72pt 高度，避免行内子项高度不一致。

因此，使用时**建议外层父容器留出足够高度**：

- 单行文本的情况下，48pt 高度即可
- 可能出现多行或搭配折叠时，推荐 72pt

### 点击态态

点击某一项时，该项背景会变为 `bg_gray_06`（浅灰）。使用 `touchDown` / `touchUp` / `touchCancel` 事件处理按下态。customView 模式下，按下态效果仍然生效（作用于容器）。

### customView

设置 `customView` 的项目会**完全忽略** `text` / `iconName` / `color` / `isHighlighted` / `customHighlightColor`。当需要根据状态切换样式时，需要在 `customView` 内部自行通过 observable 变量 + `vbind` 实现。

另外，customView 的内部会被包在一个 `flex(1f) + allCenter()` 的容器里，子元素会水平垂直居中。