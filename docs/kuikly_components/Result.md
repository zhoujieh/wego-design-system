# Result

Demo 页 page 名：KuiklyResultDemo（导航页）、KuiklyResult40Demo、KuiklyResult60Demo、KuiklyResult80Demo、KuiklyResult40SearchDemo、KuiklyResult80SearchDemo

## 概览

Result —— 结果页组件，可用于成功、失败、搜索无结果等。

```Kotlin
View {
    attr {
        size(420f, 670f)
        backgroundColor(Color.WHITE)
        flexDirectionColumn()
    }
    Result {
        attr {
            flex(1f) // 必须包裹在 flexDirectionColumn 容器下
            resultType = ResultType.RESULT_60
            resultImgPreset = ResultImgPreset.SUCCESS
            resultMessageConfig = ResultMessageConfig(
                title = "操作成功",
                contentStart = "你的申请已提交"
            )
            resultOperateConfig = ResultOperateConfig(
                showConfirmBtn = true,
                confirmBtnText = "完成"
            )
        }
    }
}
```

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=NTQ0ZjE3ZTczMzRlODBhZDhmMWE5MzgzOTE5ODY2MzZfVTBlTWFWUTUyVGRPTmRXN0tLajZOQ0Mxb1NEVWJKQmtfVG9rZW46S1RDSWJRMjRWbzlXSDJ4eGQ3dmNDUUxDbmNiXzE3NzYwNDIyNTQ6MTc3NjA0NTg1NF9WNA)

组件包含两个核心区域：

- **消息区域**（图片 + 标题 + 说明文本 + 自定义区域）
- **操作区域**（确认/取消按钮 + 底部链接 + 自定义底部区域）

支持 5 种布局类型，适配不同场景下的高度分配需求：

| 类型（`ResultType`） | 说明                                                         | 典型场景             |
| -------------------- | ------------------------------------------------------------ | -------------------- |
| `RESULT_60`          | **消息区 6 : 操作区 4 的 flex 比例**                         | 全屏成功页           |
| `RESULT_80`          | **底部留白 20%，剩余内容居中对齐**所以，在登高的容器下，RESULT_80 比 RESULT_60 更小，详见[设计稿](https://www.figma.com/design/AlpAnYeZ8kFeL3hTjbQ5Jz/📓-V1-组件开发说明文档?node-id=2-6) | 全屏失败/空状态页    |
| `RESULT_40`          | 固定间距，内容包裹                                           | 嵌入式结果展示       |
| `RESULT_80_SEARCH`   | 同 RESULT_80，默认搜索图标                                   | 搜索无结果（全屏）   |
| `RESULT_40_SEARCH`   | 同 RESULT_40，默认搜索图标                                   | 搜索无结果（嵌入式） |

> `Result60`、`Result80`、`Result40` 等旧组件已标记 `@deprecated`，请统一使用 `Result` 并通过 `resultType` 配置。

## API

### Result 属性（`ResultAttr`）

| name                    | type                  | 功能                                            | default value           |
| ----------------------- | --------------------- | ----------------------------------------------- | ----------------------- |
| `resultType`            | `ResultType`          | 布局类型，决定整体高度分配策略                  | `ResultType.RESULT_60`  |
| `resultImg` ***响应式** | `String`              | 自定义图片路径（支持 URL 和 commonAssets 路径） | `""`                    |
| `resultImgPreset`       | `ResultImgPreset?`    | 图片预设，快速设置常见图标                      | `null`                  |
| `resultMessageConfig`   | `ResultMessageConfig` | 消息区域配置                                    | `ResultMessageConfig()` |
| `resultOperateConfig`   | `ResultOperateConfig` | 操作区域配置                                    | `ResultOperateConfig()` |

### 枚举类 `ResultType`

| 值                 | 描述                                                      |
| ------------------ | --------------------------------------------------------- |
| `RESULT_60`        | 6:4 柔性比例布局，消息区和操作区各自垂直居中              |
| `RESULT_80`        | 消息区动态定位至 40% 高度处，操作区固定底部，适合全屏展示 |
| `RESULT_40`        | 固定 padding（上下 40dp），内容自然排列，适合嵌入局部容器 |
| `RESULT_80_SEARCH` | 同 RESULT_80，默认预设搜索无结果图片，无操作区            |
| `RESULT_40_SEARCH` | 同 RESULT_40，默认预设搜索无结果图片，无操作区            |

### 枚举类 `ResultImgPreset`

| 值                 | 描述           | 图片资源                            |
| ------------------ | -------------- | ----------------------------------- |
| `NOT_FOUND`        | 通用无结果图标 | `component/result_message_icon.png` |
| `SEARCH_NOT_FOUND` | 搜索无结果图标 | `component/result_search_icon.png`  |
| `SUCCESS`          | 成功打勾图标   | `component/result_yes_icon.png`     |

### `ResultMessageConfig` 消息区域配置

| name                | type               | 功能                               | default value           |
| ------------------- | ------------------ | ---------------------------------- | ----------------------- |
| `isShowPicture`     | `Boolean`          | 是否显示图片                       | `true`                  |
| `resultImgHeight`   | `ResultImgHeight?` | 图片尺寸预设                       | `null`（使用默认 72dp） |
| `isShowTitle`       | `Boolean`          | 是否显示标题                       | `true`                  |
| `title`             | `String`           | 标题文字（单行，超出截断）         | `""`                    |
| `isShowContent`     | `Boolean`          | 是否显示说明文本                   | `true`                  |
| `contentStart`      | `String`           | 说明文本 —— 前段普通文字           | `""`                    |
| `contentLink`       | `String`           | 说明文本 —— 中段链接文字（可点击） | `""`                    |
| `contentEnd`        | `String`           | 说明文本 —— 后段普通文字           | `""`                    |
| `contentLink2`      | `String`           | 第二行链接文字（可选，独立一行）   | `""`                    |
| `isShowCus`         | `Boolean`          | 是否显示自定义区域                 | `false`                 |
| `cusArea`           | `ViewBuilder?`     | 自定义布局区域（位于说明文本下方） | `null`                  |
| `contentLinkClick`  | `(() -> Unit)?`    | 链接文字点击回调                   | `null`                  |
| `contentLink2Click` | `(() -> Unit)?`    | 第二行链接点击回调                 | `null`                  |

> 说明文本支持「普通文字 + 链接 + 普通文字」的混排格式，最多显示 3 行。若需要第二个可点击链接，使用 `contentLink2` 会单独换行展示。

### 枚举类 `ResultImgHeight`

图片尺寸预设，控制消息区域图片的高度和宽度（正方形）：

| 值          | 图片尺寸           |
| ----------- | ------------------ |
| `HEIGHT72`  | 72 x 72 dp（默认） |
| `HEIGHT120` | 120 x 120 dp       |

### `ResultOperateConfig` 操作区域配置

| name               | type            | 功能                                             | default value |
| ------------------ | --------------- | ------------------------------------------------ | ------------- |
| `showConfirmBtn`   | `Boolean`       | 是否显示确认按钮（绿色大按钮）                   | `false`       |
| `confirmBtnText`   | `String`        | 确认按钮文本                                     | `""`          |
| `confirmBtnIcon`   | `String`        | 确认按钮图标                                     | `""`          |
| `showCancelBtn`    | `Boolean`       | 是否显示取消按钮（灰色大按钮）                   | `false`       |
| `cancelBtnText`    | `String`        | 取消按钮文本                                     | `""`          |
| `cancelBtnIcon`    | `String`        | 取消按钮图标                                     | `""`          |
| `showLinkButtons`  | `Boolean`       | 是否显示底部链接按钮                             | `false`       |
| `linkBtn1Text`     | `String`        | 左侧链接按钮文本                                 | `""`          |
| `linkBtn2Text`     | `String`        | 右侧链接按钮文本（非空时显示分隔线和第二个链接） | `""`          |
| `onConfirmClick`   | `(() -> Unit)?` | 确认按钮点击回调                                 | `null`        |
| `onCancelClick`    | `(() -> Unit)?` | 取消按钮点击回调                                 | `null`        |
| `linkBtn1Click`    | `(() -> Unit)?` | 左侧链接点击回调                                 | `null`        |
| `linkBtn2Click`    | `(() -> Unit)?` | 右侧链接点击回调                                 | `null`        |
| `customBottomArea` | `ViewBuilder?`  | 自定义底部区域                                   | `nul`         |

## 参考代码

### 操作成功页（RESULT_60）

适用于全屏结果展示，操作成功后的确认页面：

```Kotlin
Result {
    attr {
        flex(1f)
        resultType = ResultType.RESULT_60
        resultImgPreset = ResultImgPreset.SUCCESS
        resultMessageConfig = ResultMessageConfig(
            title = "提交成功",
            contentStart = "你的申请已提交，预计 ",
            contentLink = "3个工作日",
            contentEnd = " 内审核完成"
        )
        resultOperateConfig = ResultOperateConfig(
            showConfirmBtn = true,
            confirmBtnText = "完成",
            onConfirmClick = { /* e.g. 返回上一页 */ },
            showCancelBtn = true,
            cancelBtnText = "查看详情",
            onCancelClick = { /* e.g. 跳转详情页 */ }
        )
    }
}
```

### 空状态页（RESULT_80）

全屏展示无数据状态，消息区域自动居中到视觉舒适位置：

```Kotlin
Result {
    attr {
        flex(1f)
        resultType = ResultType.RESULT_80
        resultImgPreset = ResultImgPreset.NOT_FOUND
        resultMessageConfig = ResultMessageConfig(
            title = "暂无数据",
            contentStart = "当前没有可展示的内容"
        )
        resultOperateConfig = ResultOperateConfig(
            showConfirmBtn = true,
            confirmBtnText = "刷新",
            onConfirmClick = { /* 重新加载 */ }
        )
    }
}
```

### 搜索无结果（RESULT_40_SEARCH）

嵌入式展示，适合放在搜索结果列表区域内：

```Kotlin
Result {
    attr {
        resultType = ResultType.RESULT_40_SEARCH
        resultImgPreset = ResultImgPreset.SEARCH_NOT_FOUND
        resultMessageConfig = ResultMessageConfig(
            title = "未找到相关结果",
            contentStart = "试试 ",
            contentLink = "换个关键词",
            contentLinkClick = { /* 清空搜索框 */ }
        )
    }
}
```

### 带自定义区域

在消息区域下方插入自定义内容：

```Kotlin
Result {
    attr {
        flex(1f)
        resultType = ResultType.RESULT_60
        resultImgPreset = ResultImgPreset.SUCCESS
        resultMessageConfig = ResultMessageConfig(
            title = "支付成功",
            contentStart = "订单号：20250410001",
            isShowCus = true,
            cusArea = {
                // 自定义区域内容
                Text {
                    attr {
                        text("金额：¥128.00")
                        fontSize(14f)
                        color(ColorManager.text_100)
                    }
                }
            }
        )
        resultOperateConfig = ResultOperateConfig(
            showConfirmBtn = true,
            confirmBtnText = "完成",
            onConfirmClick = { /* ... */ },
            showLinkButtons = true,
            linkBtn1Text = "查看订单",
            linkBtn1Click = { /* ... */ },
            linkBtn2Text = "联系客服",
            linkBtn2Click = { /* ... */ }
        )
    }
}
```

### 使用大尺寸图片

```Kotlin
Result {
    attr {
        resultType = ResultType.RESULT_80
        flex(1f)
        resultImg = "https://example.com/custom_result.png"
        resultMessageConfig = ResultMessageConfig(
            resultImgHeight = ResultImgHeight.HEIGHT120,
            title = "自定义图片",
            contentStart = "这是一个使用 120dp 大尺寸图片的示例"
        )
    }
}
```

### 底部链接按钮

操作区底部支持最多两个文字链接，中间用分隔线分开：

```Kotlin
resultOperateConfig = ResultOperateConfig(
    showConfirmBtn = true,
    confirmBtnText = "返回首页",
    onConfirmClick = { /* ... */ },
    showLinkButtons = true,
    linkBtn1Text = "重新提交",
    linkBtn1Click = { /* ... */ },
    linkBtn2Text = "查看帮助",
    linkBtn2Click = { /* ... */ }
)
```

## 组件特性

### 高度计算逻辑

Result 组件**不同** **`resultType`** **下的高度分配方式不同**。这直接影响消息区域在页面中的视觉位置。

#### RESULT_60 —— 固定比例（6:4）

最简单的模式。外层容器 `flex(1f)` 撑满父级，内部两个子 View 分别 `flex(6f)` 和 `flex(4f)`：

```Plain
┌─────────────────────────┐
│                         │
│      flex(6f)           │  ← 消息区域（图片+标题+文本）
│    消息区域（居中）        │     内部 allCenter()
│                         │
├─────────────────────────┤
│      flex(4f)           │  ← 操作区域（按钮+链接）
│    操作区域（居中）       │     内部 allCenter()
│                         │
└─────────────────────────┘
```

消息区域始终占据 60% 的高度，操作区域占 40%，各自内部居中。不做任何动态计算，适合信息量固定的成功结果页。

#### RESULT_80 / RESULT_80_SEARCH —— 动态居中

外层 `flex(1f)` 撑满父级，内部分为两部分：

- 上部：`flex` 无固定比例，通过 `padding(top = topDistanceDp)` 把消息区域推到正确位置
- 下部：`flex(1f)` + `margin(top = 40dp)`

```Plain
┌─────────────────────────┐ ← totalHeight
│    padding-top          │ ← topDistanceDp（动态计算）
│  ┌───────────────────┐  │
│  │   消息区域         │  │ ← infoAreaHeight
│  │  （图片+标题+文本）  │  │
│  └───────────────────┘  │
│         40dp gap        │
│  ┌───────────────────┐  │
│  │   操作区域         │  │ ← 按钮/链接/自定义区域
│  │  （底部对齐）       │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

#### RESULT_40 / RESULT_40_SEARCH —— 固定间距

最轻量的模式。外层不设 `flex(1f)`（不撑满父级），仅设置 `padding(top = 40dp, bottom = 40dp)`：

```Plain
┌─────────────────────────┐
│  padding-top: 40dp      │
│  ┌───────────────────┐  │
│  │   消息区域         │  │ ← 内容自然高度
│  └───────────────────┘  │
│         40dp gap        │
│  ┌───────────────────┐  │
│  │   操作区域         │  │ ← 内容自然高度
│  └───────────────────┘  │
│  padding-bottom: 40dp   │
└─────────────────────────┘
```

整体高度由内容决定，不做拉伸。适合嵌入列表项或局部容器中。

#### 各类型对比总结

| 特性           | RESULT_60          | RESULT_80                  | RESULT_40         |
| -------------- | ------------------ | -------------------------- | ----------------- |
| 是否撑满父级   | 是 (`flex(1f)`)    | 是 (`flex(1f)`)            | 否（内容高度）    |
| 消息区定位方式 | 固定比例居中       | 动态计算 topDistance       | 固定 40dp padding |
| 适用场景       | 全屏成功页         | 全屏空状态/失败页          | 嵌入式结果卡片    |
| 响应式高度调整 | 无需（比例自适应） | 有（重新计算 topDistance） | 无需（内容驱动）  |

### 说明文本富文本

说明文本区域使用 `RichText` 组件实现，支持：

- `contentStart`（普通文字）+ `contentLink`（蓝色可点击链接）+ `contentEnd`（普通文字）三段拼接
- 最多 3 行，超出省略
- `contentLink2` 独立成行，作为第二个可点击链接（⚠️目前暂不支持 `contentLink2` 直接作为 Span 跟在后面，因此很难实现[链接省略号 + 链接文字]，如“暂未查找到该商品，需要去已下架搜“一颗勇往直前的心...”吗？）

> H5 平台下，由于 `Span` 的点击事件不生效，`contentLinkClick` 会上移到 `RichText` 层级处理。

### 操作区按钮

- **确认按钮**：绿色大按钮（`ButtonColor.GREEN`，`ButtonSize.LARGE_48`）
- **取消按钮**：灰色大按钮（`ButtonColor.GREY`，`ButtonSize.LARGE_48`）
- 两个按钮之间间距 16dp
- **底部链接**：两个文字链接，中间有 0.5dp 宽的灰色分隔线，高度 12dp
- 链接文字支持点击态