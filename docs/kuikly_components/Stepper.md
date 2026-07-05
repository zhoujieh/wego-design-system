Demo 页 page 名称：`StepperHorizontalDemoPage`、`StepperVerticalDemoPage`

## 概览

Stepper —— 步骤进度指示器组件，用于展示多步骤流程（如订单流转、审批流程、表单进度）的完成状态。文件 `Stepper.kt` 中同时定义了：

- **`StepperHorizontal`** —— 水平方向排列（可滚动），节点 + 连接线独立一行，标题 / 副标题在节点正下方居中：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjI3OWY5NGM1YTJlN2Q2NjMwNjA1Njk0NDZjMWEyNjBfVENCdElRcUtPeWZPRWdUMkxZWTFDOTBCNFFEY24xajZfVG9rZW46VEZMc2J1Ymx4bzZMcEx4Q3I3dWMyNHFsbjFmXzE3NzY3NzEzNTE6MTc3Njc3NDk1MV9WNA)

- **`StepperVertical`** —— 垂直方向排列，节点在左、标题/副标题在右，连接线用绝对定位从当前节点延伸到下一行。

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MzVjYTdkZTExMmM1OWZjYzdlMTA1YzNjYzcwMmM1OGNfd3Jnb2t1UEl4ZUZhVklWdE1qR1hQSEJpRFJZQ0RPN0NfVG9rZW46RkE1QmJnTVZ3bzhnM214TldzRWNZdlJGblBTXzE3NzY3NzEzNTE6MTc3Njc3NDk1MV9WNA)

```Kotlin
private var orderSteps by observableList<StepperItem>()

// ...created
orderSteps.addAll(listOf(
    StepperItem(this).apply { title = "已下单"; subtitle = "2024-01-01"; isActive = true },
    StepperItem(this).apply { title = "已发货"; subtitle = "进行中";   isActive = null },
    StepperItem(this).apply { title = "运输中"; isActive = false },
    StepperItem(this).apply { title = "已送达"; isActive = false },
))

// ...body（水平）
StepperHorizontal {
    attr {
        itemWidth = pagerData.pageViewWidth / ctx.orderSteps.size
        items.addAll(ctx.orderSteps)
    }
}

// ...body（垂直）
StepperVertical {
    attr {
        items.addAll(ctx.orderSteps)
    }
}
```

> **注意**：`StepperItem` 构造器需要传入 `pagerScope`（通常传 `this`），因为内部字段（`title` / `subtitle` / `isActive`）都是 `pagerScope.observable` 响应式字段，修改它们会自动触发 UI 更新。

管理 active 的 item，可以通过`StepperItem.isActive`：

| `StepperItem.isActive` 值 | 含义              | 节点外观       |
| ------------------------- | ----------------- | -------------- |
| `true`                    | 已完成            | 绿色对勾图标 ✓ |
| `null`                    | 当前 / 进行中     | 绿色数字徽章   |
| `false`                   | 未激活 / 尚未到达 | 灰色数字徽章   |

此外也可以通过 Stepper 的 `activeIndex` 属性可以统一驱动所有 item 的激活状态（当 item 的 `isActive = false`（默认值）时生效）：

- `index < activeIndex` → 已完成（对勾）
- `index == activeIndex` → 进行中（绿色徽章）
- `index > activeIndex` → 未激活（灰色徽章）
- `activeIndex >= items.size` → 全部显示为对勾

## API

### StepperItem（步骤项数据类）

通过 `StepperItem(pagerScope)` 创建，字段为响应式。

| **name**             | **type**   | **功能**                                             | **default value** |
| -------------------- | ---------- | ---------------------------------------------------- | ----------------- |
| `title` 🌟            | `String`   | 节点下方（水平）或右侧（垂直）的主标签               | `""`              |
| `subtitle`           | `String`   | `title` 下方的次级标签。传入 `""` 隐藏副标题行       | `""`              |
| `isActive` 🌟（可选） | `Boolean?` | `true` = 已完成 / `null` = 进行中 / `false` = 未激活 | `false`           |

> 如果已通过 `activeIndex` 驱动激活状态，不需要设置单个 item 的 `isActive`。

### StepperHorizontal

水平步骤进度指示器。

#### 布局结构

```Plain
┌────────────────────────────────────┐
│  [节点] ────── [节点] ────── [节点]  │   ← 节点 + 连接线行
└────────────────────────────────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│   标题    │ │  标题    │ │   标题    │   ← 标题行
│  副标题   │ │  副标题   │ │  副标题   │   ← 副标题行
└──────────┘ └──────────┘ └──────────┘

<-itemWidth-><-itemWidth-><-itemWidth->
```

顶部节点行和底部标题行是两个独立的 View，各自 `vforIndex` 渲染。连接线连续贯通、不会断裂。

#### 属性（`StepperHorizontalViewAttr`）

| **name**                 | **type**                      | **功能**                                                     | **default value**          |
| ------------------------ | ----------------------------- | ------------------------------------------------------------ | -------------------------- |
| `items` 🌟                | `ObservableList<StepperItem>` | 步骤有序列表                                                 | `observableList()`         |
| `itemWidth` 🌟            | `Float`                       | 每个步骤列（节点 + 标签区域）的宽度。**若要填满整个 page 宽度**，使用：`pagerViewWidth / items.size` | `60f`                      |
| `activeIndex`🌟（可选）   | `Int`                         | 当前 active 的 index（-1 表示不使用）                        | `-1`                       |
| `flexDirection`          | `FlexDirection`               | `ROW` / `ROW_REVERSE` 正向或反向排列                         | `FlexDirection.ROW`        |
| `activeColor`            | `Color`                       | 已激活节点和连接线的颜色                                     | `ColorManager.green_1_100` |
| `inactiveColor`          | `Color`                       | 未激活节点的徽章颜色和未激活文字颜色                         | `ColorManager.text_30`     |
| `inactiveConnectorColor` | `Color`                       | 未激活连接线的颜色                                           | `ColorManager.bg_line_08`  |
| `titleColor`             | `Color`                       | 标题文字的颜色                                               | `ColorManager.text_100`    |
| `subtitleColor`          | `Color`                       | 副标题文字的颜色                                             | `ColorManager.text_80`     |

#### 事件（`StepperHorizontalViewEvent`）

当前版本不对外暴露任何事件（继承自空的 `ComposeEvent()`）。

### StepperVertical

垂直步骤进度指示器。

#### 布局结构

```Plain
┌──────────┬─────────────────────────────┐
│ [Node 1] │  Title 1                    │
│    │     │  Subtitle 1                 │
├──────────┼─────────────────────────────┤
│    │     │                             │
│ [Node 2] │  Title 2                    │
│    │     │  Subtitle 2                 │
├──────────┼─────────────────────────────┤
│          │                             │
│ [Node 3] │  Title 3                    │
└──────────┴─────────────────────────────┘
```

- 每个步骤是一个水平行（ROW），左侧节点列 + 右侧内容列
- 连接线通过绝对定位覆盖在节点列，底部延伸到行末端
- 连接线高度通过 `layoutFrameDidChange` 实时追踪当前行的实际高度来计算，因此标题 / 副标题无论多少行，连接线都能正确延伸

#### 属性（`StepperVerticalViewAttr`）

| **name**                 | **type**                      | **功能**                                     | **default value**          |
| ------------------------ | ----------------------------- | -------------------------------------------- | -------------------------- |
| `items` 🌟                | `ObservableList<StepperItem>` | 步骤有序列表                                 | `observableList()`         |
| `isMini` 🌟               | `Boolean`                     | 迷你模式：节点更小、间距更紧、忽略副标题     | `false`                    |
| `activeIndex`🌟（可选）   | `Int`                         | 当前 active 的 index（-1 表示不使用）        | `-1`                       |
| `flexDirection`          | `FlexDirection`               | `COLUMN`（上→下）/ `COLUMN_REVERSE`（下→上） | `FlexDirection.COLUMN`     |
| `activeColor`            | `Color`                       | 已激活节点和连接线的颜色                     | `ColorManager.green_1_100` |
| `inactiveColor`          | `Color`                       | 未激活节点和文字的颜色                       | `ColorManager.text_30`     |
| `inactiveConnectorColor` | `Color`                       | 未激活连接线的颜色                           | `ColorManager.bg_line_08`  |
| `titleColor`             | `Color`                       | 标题文字的颜色                               | `ColorManager.text_100`    |
| `subtitleColor`          | `Color`                       | 副标题文字的颜色                             | `ColorManager.text_80`     |

#### 迷你模式（`isMini`）

| 维度     | 普通模式           | 迷你模式                     |
| -------- | ------------------ | ---------------------------- |
| 节点大小 | 20f                | 16f                          |
| 节点列宽 | 36f                | 32f                          |
| 行间距   | 上下各 16f         | 上下各 12f                   |
| 节点间距 | 节点上下各 2f 空隙 | 紧贴连接线（0f）             |
| 标题字号 | 16f、weight 400    | 14f、weight 500              |
| 副标题   | 显示               | **忽略**（即使非空也不渲染） |

#### 事件（`StepperVerticalViewEvent`）

当前版本不对外暴露任何事件。

## 参考代码

### 水平：基础订单流程

最常见的场景：在顶部导航后展示一个满宽的订单进度条。

```Kotlin
private var orderSteps by observableList<StepperItem>()

override fun created() {
    super.created()
    orderSteps.addAll(listOf(
        StepperItem(this).apply { title = "已下单"; subtitle = "2024-01-01"; isActive = true  },
        StepperItem(this).apply { title = "已发货"; subtitle = "进行中";    isActive = null  },
        StepperItem(this).apply { title = "运输中"; subtitle = "";         isActive = false },
        StepperItem(this).apply { title = "已送达"; subtitle = "";         isActive = false },
    ))
}

// ...body
Scroller {
    attr {
        height(120f)
        flexDirectionRow()
        alignItemsCenter()
        width(pagerData.pageViewWidth)
        backgroundColor(Color.WHITE)
        padding(16f)
    }
    StepperHorizontal {
        attr {
            itemWidth = pagerData.pageViewWidth / ctx.orderSteps.size
            items.addAll(ctx.orderSteps)
        }
    }
}
```

### 水平：使用 activeIndex

不给单个 item 设置 `isActive`，而是通过统一的 `activeIndex` 控制：

```Kotlin
StepperHorizontal {
    attr {
        activeIndex = 1  // 索引 0 = 已完成 ✓，索引 1 = 当前步骤
        itemWidth = pagerData.pageViewWidth / ctx.steps.size
        items.addAll(ctx.steps)
    }
}
```

### 水平：反向排列

```Kotlin
StepperHorizontal {
    attr {
        flexDirection = FlexDirection.ROW_REVERSE
        activeIndex = 2
        itemWidth = pagerData.pageViewWidth / ctx.steps.size
        items.addAll(ctx.steps)
    }
}
```

### 垂直：普通模式（带副标题）

```Kotlin
private var orderSteps by observableList<StepperItem>()

// ...created
orderSteps.addAll(listOf(
    StepperItem(this).apply { title = "已下单"; subtitle = "2024-01-01 10:00"; isActive = true  },
    StepperItem(this).apply { title = "已发货"; subtitle = "2024-01-02 14:30"; isActive = null  },
    StepperItem(this).apply { title = "运输中"; subtitle = "预计 2024-01-04 到达"; isActive = false },
    StepperItem(this).apply { title = "已送达"; subtitle = "";              isActive = false },
))

// ...body
View {
    attr {
        backgroundColor(Color.WHITE)
        padding(left = 16f, right = 16f, top = 0f, bottom = 0f)
    }
    StepperVertical {
        attr {
            items.addAll(ctx.orderSteps)
        }
    }
}
```

### 垂直：迷你模式（忽略副标题）

```Kotlin
StepperVertical {
    attr {
        isMini = true           // 字号变小、行间距更紧
        items.addAll(ctx.miniSteps)
    }
}
```

即便 `miniSteps` 里的 item 有 `subtitle`，在 `isMini = true` 时也不会显示。

### 垂直：activeIndex 驱动

```Kotlin
StepperVertical {
    attr {
        activeIndex = 2  // 索引 0、1 已完成（对勾），索引 2 当前
        items.addAll(ctx.steps)  // items 不需设置 isActive
    }
}
```

### 垂直：反向排列 + activeIndex

```Kotlin
StepperVertical {
    attr {
        isMini = true
        activeIndex = 2
        flexDirection(FlexDirection.COLUMN_REVERSE)
        items.addAll(ctx.reversedSteps)
    }
}
```

### 长文本自适应（垂直）

`StepperVertical` 内部通过 `layoutFrameDidChange` 监听每行高度，连接线高度会自动跟随标题 / 副标题的多行高度伸展。因此不需要任何额外配置：

```Kotlin
val longTextSteps = listOf(
    StepperItem(this).apply {
        title = "订单提交成功，系统正在处理中"
        subtitle = "您的订单已成功提交，系统正在处理中。订单号：WG2024010100001，请耐心等待商家确认。如有任何问题，请联系客服热线 400-123-4567。"
        isActive = true
    },
    // ... 更多步骤
)

StepperVertical {
    attr {
        items.addAll(longTextSteps)
    }
}
```

## 组件特性

### 反向排列

`StepperHorizontal`、`StepperVertical`均可反向排列。

- 当 `StepperHorizontal` 的 `attr` 中设置 `flexDirection(FlexDirection.ROW_REVERSE)`，连接节点的顺序会变成**从右到左**排列；
- 当 `StepperVertical` 的 `attr` 中设置 `flexDirection(FlexDirection.COLUMN_REVERSE)`，连接节点的顺序会变成**从下到上**排列。

### 两种激活方式

Stepper 支持**两种互相独立**的激活态驱动方式：

1. **单项驱动**：给每个 `StepperItem` 设置 `isActive = true/null/false`
2. **索引驱动**：设置容器的 `activeIndex`

具体规则（以水平组件为例，垂直组件规则一致）：

| item.isActive | index vs activeIndex   | 节点渲染                 |
| ------------- | ---------------------- | ------------------------ |
| `true`        | （忽略）               | 绿色对勾                 |
| `null`        | （忽略）               | 绿色数字徽章             |
| `false`       | `index < activeIndex`  | 绿色对勾（被认为已完成） |
| `false`       | `index == activeIndex` | 绿色数字徽章（进行中）   |
| `false`       | `index > activeIndex`  | 灰色数字徽章（未激活）   |

### 两种方向组件的布局差异

| 特性            | `StepperHorizontal`                                   | `StepperVertical`                                    |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| 步骤宽度 / 高度 | 固定列宽 `itemWidth`                                  | 行高由内容自适应（通过 `layoutFrameDidChange` 追踪） |
| 连接线实现      | 节点行里的普通 View（**静态宽度**）                   | **绝对定位 +** **动态****高度**（见下方）            |
| 长文本支持      | 受 `itemWidth` 限制，标题 1 行省略号、副标题最多 3 行 | 不受限，标题和副标题均自动换行                       |
| 迷你模式        | 不支持                                                | 支持 `isMini`                                        |
| 反向排列        | `ROW_REVERSE`                                         | `COLUMN_REVERSE`                                     |

### `StepperVertical` 连接线高度计算

连接线通过绝对定位放置在节点列上：

- `top = itemMarginY + NODE_SIZE + nodeMarginY`（节点底部 + 间隙）
- `height = rowHeight - NODE_SIZE - 2 * nodeMarginY`

`rowHeight` 由每行的 `layoutFrameDidChange` 实时写入 `rowHeights` 列表，并通过 `rowHeightsUpdated` 观察值触发 `vbind` 重渲染连接线。

### `StepperItem` 的 `pagerScope`

`StepperItem` 的构造器强制要求传入 `pagerScope`：

```Kotlin
class StepperItem(pagerScope: PagerScope) {
    var title: String by pagerScope.observable("")
    var subtitle: String by pagerScope.observable("")
    var isActive: Boolean? by pagerScope.observable(false)
}
```

这意味着在 `Pager` / `ComposeView` 内构造时传 `this` 即可，在组件之外（例如顶层函数）构造会编译失败。这么设计是为了让修改 `title` / `subtitle` / `isActive` 能 使用 observable。

### 与其它进度指示组件的区别

| 组件                                                         | 典型场景                       | 特点                                      |
| ------------------------------------------------------------ | ------------------------------ | ----------------------------------------- |
| **StepperHorizontal**                                        | 订单流程、表单步骤（顶部条形） | 节点 + 连接线水平铺开，标题居中           |
| **StepperVertical**                                          | 物流时间线、审批流水           | 节点在左，标题 / 副标题在右，支持多行内容 |
| [Breadcrumb](https://slowisfast.feishu.cn/wiki/OnrNwKGAuiAKT9kVsfacicLKnce) | 面包屑导航                     | 文本 + 分隔符，强调"当前所处位置"，可点击 |