# Cell

Demo 页 page 名称：`KuiklyCellDemo`

## 概览

Cell - 通用列表单元格组件

```Kotlin
Cell {
    attr {
        titleText = "跳转页面"
        actionType = CellActionType.JUMP_TO
        showTitleBadge = BadgeType.DOT // 在标题右侧显示红点
    }
    event {
        onCellClick {
            // 处理点击
        }
    }
}
```

一个 Cell 从左到右由四个区域组成：**选择区** → **头像区** → **内容区**（标题 + 副标题） → **操作区**。每个区域都可以按需开启或关闭。右侧操作区支持 5 种类型：

| 类型      | 说明                           |
| --------- | ------------------------------ |
| `JUMP_TO` | 箭头跳转，可带文字和红点       |
| `TEXT`    | 纯文本                         |
| `SWITCH`  | 开关                           |
| `BUTTON`  | 按钮（使用 WGButton SCALE_32） |
| `CUSTOM`  | 自定义内容 / 不显示            |

## API

### Cell 属性（`CellAttr`）

#### 选择区 & 头像区（左侧）

| **name**             | **type**       | **功能**                                                     | **default value** |
| -------------------- | -------------- | ------------------------------------------------------------ | ----------------- |
| `showBackSpace`🌟     | `Boolean?`     | 退格区：`false` = 不显示，`true` = 空白占位（36px），`null` = 显示短横线“-” | `false`           |
| `selectAreaContent`🌟 | `ViewBuilder?` | 选择区内容插槽（固定 36px 宽），可放置 CheckBox 等           | `null`            |
| `avatarContent`🌟     | `ViewBuilder?` | 头像区内容插槽，右侧自动加 12px 间距                         | `null`            |

#### 内容区（标题 + 副标题）

| **name**                | **type**                     | **功能**                           | **default value** |
| ----------------------- | ---------------------------- | ---------------------------------- | ----------------- |
| `titleText`🌟            | `String`                     | 主标题文本                         | `""`              |
| `titleIcon`             | `String`                     | 标题右侧的图标（iconFont 名称）    | `""`              |
| `titleCustomContent`    | `ViewBuilder?`               | 标题区自定义内容插槽               | `null`            |
| `showTitleBadge`🌟       | `BadgeType?`                 | 标题区 Badge 类型，`null` 不显示   | `null`            |
| `titleBadgeContent`     | `String`                     | 标题区 badge 文本内容              | `""`              |
| `titleBadgeAttr`        | `(BadgeAttr.() -> Unit)?`    | 标题区 badge 的额外配置            | `null`            |
| `subtitleText`🌟         | `String`                     | 副标题文本                         | `""`              |
| `subtitleCustomContent` | `(RichTextView.() -> Unit)?` | 自定义副标题富文本（可添加链接等） | `null`            |

#### 操作区（右侧）

| **name**              | **type**                  | **功能**                                                     | **default value**       |
| --------------------- | ------------------------- | ------------------------------------------------------------ | ----------------------- |
| `actionType`🌟         | `CellActionType`          | 操作区类型，见上方枚举说明                                   | `CellActionType.CUSTOM` |
| `actionText`🌟         | `String`                  | 操作区文本。对 `TEXT`/`JUMP_TO` 为文本内容，对 `BUTTON` 为按钮文字 | `""`                    |
| `actionTextColor`     | `Color?`                  | 操作区文本颜色（适用于 `TEXT`/`JUMP_TO`）                    | `null`                  |
| `showActionBadge`     | `BadgeType?`              | 操作区红点/徽章类型，`null` 不显示                           | `null`                  |
| `actionBadgeContent`  | `String`                  | 操作区 badge 文本内容                                        | `""`                    |
| `actionBadgeAttr`     | `(BadgeAttr.() -> Unit)?` | 操作区 badge 的额外属性配置                                  | `null`                  |
| `switchOn`            | `Boolean`                 | `SWITCH` 类型时的初始开关状态                                | `false`                 |
| `actionCustomContent` | `ViewBuilder?`            | `CUSTOM` 类型时的自定义操作区内容                            | `null`                  |

#### 其它配置

| **name**        | **type**    | **功能**                                                     | **default value** |
| --------------- | ----------- | ------------------------------------------------------------ | ----------------- |
| `showDivider` 🌟 | `Boolean?`  | 底部分割线：`true` = 显示（右侧到头），`null` = 显示（右侧保留 16px 间距），`false` = 不显示 | `true`            |
| `isClickable`   | `Boolean`   | 是否有点击态                                                 | `true`            |
| `cellColor`     | `CellColor` | Cell 颜色预设（含点击态），见下方枚举说明                    | `CellColor.WHITE` |

### Cell 事件（`CellEvent`）

| **name**                   | **type**                          | **功能**                                          |
| -------------------------- | --------------------------------- | ------------------------------------------------- |
| `onCellClick`              | `() -> Unit`                      | 点击 Cell 主体区                                  |
| `onSelectClick`            | `(checked: Boolean) -> Unit`      | 点击选择区                                        |
| `onTitleClick`             | `() -> Unit`                      | 点击标题区                                        |
| `onTitleIconClick`         | `() -> Unit`                      | 点击标题旁的图标                                  |
| `onActionClick`            | `() -> Unit`                      | 点击操作区（适用于 `JUMP_TO`/`TEXT`/`BUTTON`）    |
| `onActionSwitch`           | `(Boolean) -> Unit`               | 操作区`SWITCH` 类型开关变化回调，参数为最新状态   |
| `onActionSwitchRefCreated` | `(ViewRef<WGSwitchView>) -> Unit` | 操作区`SWITCH` 视图创建时回调，可用于外部控制开关 |
| `onActionButtonRefCreated` | `(ViewRef<WGButtonView>) -> Unit` | 操作区`BUTTON` 视图创建时回调，可用于外部控制按钮 |

### 枚举类 `CellColor`

| 值                | 背景色     | 点击态背景色 |
| ----------------- | ---------- | ------------ |
| `CellColor.WHITE` | 白色       | bg_gray_06   |
| `CellColor.GREY`  | bg_gray_03 | bg_gray_10   |

### 公开方法

| **方法**                  | **功能**                    |
| ------------------------- | --------------------------- |
| `turnSwitch(on: Boolean)` | 外部控制 Switch 的开/关状态 |

## 参考代码

### 最简用法：标题 + 箭头跳转

```Kotlin
Cell {
    attr {
        titleText = "跳转页面"
        actionType = CellActionType.JUMP_TO
    }
    event {
        onCellClick {
            // 处理跳转
        }
    }
}
```

### 带文字的跳转 + 红点徽章

```Kotlin
Cell {
    attr {
        titleText = "消息中心"
        actionType = CellActionType.JUMP_TO
        actionText = "查看详情"
        showActionBadge = BadgeType.DOT
    }
    event {
        onCellClick {
            // 跳转到消息中心
        }
    }
}
```

### 带数字徽章的跳转

```Kotlin
Cell {
    attr {
        titleText = "通知"
        actionType = CellActionType.JUMP_TO
        actionText = "通知"
        showActionBadge = BadgeType.NUMBER
        actionBadgeContent = "99"
    }
}
```

### 右侧开关（Switch）

```Kotlin
Cell {
    attr {
        titleText = "推送通知"
        subtitleText = "开启后将接收推送通知"
        actionType = CellActionType.SWITCH
        switchOn = false
    }
    event {
        onActionSwitch { isOn ->
            // isOn: 当前开关状态
        }
    }
}
```

### 右侧按钮（Button）

```Kotlin
Cell {
    attr {
        titleText = "操作按钮"
        actionType = CellActionType.BUTTON
        actionText = "编辑"
    }
    event {
        onActionClick {
            // 处理按钮点击
        }
    }
}
```

### 右侧文本（TEXT）

```Kotlin
Cell {
    attr {
        titleText = "文本操作区"
        actionType = CellActionType.TEXT
        actionText = "上次选择"
    }
    event {
        onActionClick {
            // 点击了文本
        }
    }
}
```

### 标题带图标 + 标题红点

```Kotlin
// 标题右侧图标
Cell {
    attr {
        titleText = "带图标的标题"
        titleIcon = "yuanjia"
        actionType = CellActionType.JUMP_TO
    }
    event {
        onTitleIconClick {
            // 点击了图标
        }
    }
}

// 标题红点
Cell {
    attr {
        titleText = "标题红点"
        showTitleBadge = BadgeType.DOT
        actionType = CellActionType.JUMP_TO
    }
}

// 标题文字徽章
Cell {
    attr {
        titleText = "标题文字徽章"
        showTitleBadge = BadgeType.BUBBLE
        titleBadgeContent = "NEW"
        actionType = CellActionType.JUMP_TO
    }
}
```

### 标题区自定义内容插槽

```Kotlin
Cell {
    attr {
        titleText = "自定义标题区"
        titleCustomContent = {
            View {
                attr {
                    size(32f, 16f)
                    borderRadius(4f)
                    backgroundColor(ColorManager.green_1_100)
                    allCenter()
                }
                Text {
                    attr {
                        text("HOT")
                        fontSize(10f)
                        color(Color.WHITE)
                    }
                }
            }
        }
        actionType = CellActionType.JUMP_TO
    }
}
```

### 副标题（纯文本 & 自定义富文本）

```Kotlin
// 纯文本副标题
Cell {
    attr {
        titleText = "带副标题"
        subtitleText = "这是一段副标题描述文字，可以换行显示更多内容"
        actionType = CellActionType.JUMP_TO
    }
}

// 自定义富文本副标题（可含链接）
Cell {
    attr {
        titleText = "自定义副标题"
        subtitleCustomContent = {
            Span {
                text("普通文字 ")
                fontSize(12f)
                color(ColorManager.text_80)
            }
            Span {
                text("链接文字")
                fontSize(12f)
                color(ColorManager.text_link_100)
            }
        }
        actionType = CellActionType.JUMP_TO
    }
}
```

### 左侧带选择区（CheckBox / 图标）

```Kotlin
// 带 CheckBox
Cell {
    attr {
        selectAreaContent = {
            WGCheckBox {
                attr { checked = false }
                event { onCheckChange { } }
            }
        }
        titleText = "带复选框"
        actionType = CellActionType.JUMP_TO
    }
    event {
        onSelectClick { checked ->
            // 点击了选择区域
        }
    }
}

// 带图标
Cell {
    attr {
        selectAreaContent = {
            Icon {
                attr {
                    iconSize(24f)
                    iconName("yuanjia")
                    iconColor(ColorManager.text_link_100)
                }
            }
        }
        titleText = "带图标选择区"
        actionType = CellActionType.JUMP_TO
    }
}
```

### 左侧带头像

```Kotlin
Cell {
    attr {
        avatarContent = {
            View {
                attr {
                    size(40f, 40f)
                    borderRadius(20f)
                    backgroundColor(ColorManager.bg_gray_06)
                    allCenter()
                }
                Text {
                    attr {
                        text("头")
                        fontSize(16f)
                        color(ColorManager.text_80)
                    }
                }
            }
        }
        titleText = "带头像"
        subtitleText = "Avatar 区域自动添加 12px 右侧间距"
        actionType = CellActionType.JUMP_TO
    }
}
```

### 退格区 + CheckBox + 头像（完整左侧配置）

```Kotlin
Cell {
    attr {
        showBackSpace = null // 显示短横线
        selectAreaContent = {
            WGCheckBox {
                attr { checked = false }
                event { onCheckChange { } }
            }
        }
        avatarContent = {
            View {
                attr {
                    size(40f, 40f)
                    borderRadius(20f)
                    backgroundColor(ColorManager.bg_gray_06)
                    allCenter()
                }
                Text {
                    attr {
                        text("头")
                        fontSize(16f)
                        color(ColorManager.text_80)
                    }
                }
            }
        }
        titleText = "带头像、带退格区、带 CheckBox"
    }
}
```

### 自定义操作区

```Kotlin
Cell {
    attr {
        titleText = "自定义操作区"
        subtitleText = "actionType = CUSTOM"
        actionType = CellActionType.CUSTOM
        actionCustomContent = {
            View {
                attr {
                    flexDirectionRow()
                    alignItemsCenter()
                    paddingRight(16f)
                }
                Text {
                    attr {
                        text("更多")
                        fontSize(14f)
                        color(ColorManager.text_link_100)
                    }
                }
            }
        }
    }
}
```

### 灰色背景

```Kotlin
Cell {
    attr {
        titleText = "灰色背景"
        subtitleText = "cellColor = CellColor.GREY"
        cellColor = CellColor.GREY
        actionType = CellActionType.JUMP_TO
    }
}
```

## 组件特性

### 四区域布局

Cell 内部水平排列四个区域，每个区域可独立配置：

```Plain
| 选择区(36px) | 头像区(+12px 间距) | 内容区(flex 1) | 操作区 |
```

- **选择区**：固定 36px 宽，可放 CheckBox、Icon 等。通过 `selectAreaContent` 开启。
- **退格区**：同样 36px 宽，在选择区左侧。通过 `showBackSpace` 控制（`true` 空白、`null` 短横线、`false` 不显示）。
- **头像区**：自适应宽度，右侧自动加 12px 间距。通过 `avatarContent` 开启。
- **内容区**：`flex(1)` 填充剩余空间，包含标题行和副标题。
- **操作区**：根据 `actionType` 渲染不同内容。

### 点击态

`isClickable = true` 时，整个 Cell 有按下变色效果（touchDown/touchUp）。点击态颜色由 `cellColor` 决定。

### 分割线

`showDivider` 三种状态：

- `true`（默认）：显示底部分割线，右侧贴边
- `null`：显示底部分割线，右侧保留 16px 间距
- `false`：不显示分割线

分割线左侧会自动计算缩进（跳过选择区和退格区）。

### 宽度优先级与自动裁剪

当标题和操作区的总宽度超出 Cell 可用空间时，组件会在首次布局后自动计算可用空间，优先压缩操作区宽度以保证标题的可读性。极端情况下操作区会保留最小宽度（箭头跳转至少 32px）。