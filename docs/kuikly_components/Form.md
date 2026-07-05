# Form

Demo 页 page 名称：`KuiklyFormDemoPage`

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmUyODg3ZTdlY2FjMmVlOTU3NWVkNzY3YjE1ODM2OGRfSzZSN3I4eWVlOHlDSkJrckVOSEJVU0RHck1RQkNabUtfVG9rZW46RUdycmI0SzM4b0c4WUl4aEdUV2N2TFFPbk9nXzE3NzY2Njc5OTQ6MTc3NjY3MTU5NF9WNA)

Form —— 表单容器组件，接收一组 `FormCellConfig`，按顺序渲染为多个 `FormBody` 单元格。提供统一的取值（`getValues()`）和校验（`validateAll()`）能力。

```Kotlin
private var formRef: ViewRef<FormView>? = null
private var cellConfigs by observable<FormCellConfig>()

// ...created
cellConfigs.addAll(
    listOf(
        FormCellConfig(
            id = "name",
            label = { Span { text("姓名") } },
            action = FormActionConfig.Text(
                placeholder = "请输入姓名",
                validationRules = listOf { value ->
                    if (value.isBlank()) FormValidationResult.error("姓名不能为空")
                    else FormValidationResult.OK
                },
            ),
        ),
        FormCellConfig(
            id = "amount",
            label = { Span { text("金额"); color(Color(WGColor.text_100)) } },
            action = FormActionConfig.Money(),
            rightButton = FormRightButton.Link(text = "全部", onClick = { /* ... */ }),
        ),
    )
)

// ...body
Form {
    ref { ctx.formRef = it }
    attr {
        cellConfigs = ctx.cellConfigs
    }
}

// 提交时
WGButton {
    event {
        onClick {
            val validation = ctx.formRef?.view?.validateAll() ?: emptyMap()
            if (validation.values.all { it.isValid }) {
                val values = ctx.formRef?.view?.getValues() ?: emptyMap()
                // values = {"name": "张三", "amount": "100"}
            }
        }
    }
}
```

Form 有两层结构：

- **`Form`**（容器）— 管理一组 `FormCellConfig`，提供整体的取值和校验 API
- **`FormBody`**（单元格）— 渲染单个 `FormCellConfig`，可以单独使用

每个单元格从左到右由四部分组成：**标签区** → **操作区** → **右侧按钮（可选）**，底部可显示**计数/错误文本**。

## FormCellConfig（单元格配置）

每个单元格由一个 `FormCellConfig` 定义。

| **name**       | **type**                  | **功能**                                                | **default value**       |
| -------------- | ------------------------- | ------------------------------------------------------- | ----------------------- |
| `id`🌟          | `String`                  | 唯一标识符，用于 `getValues()` 返回的 Map key           | *(必填)*                |
| `label`🌟       | `RichTextView.() -> Unit` | 标签自定义内容（使用 `Span {}` 添加内容）               | *(必填)*                |
| `action`🌟      | `FormActionConfig`        | 操作区配置，见下方枚举                                  | *(必填)*                |
| `rightButton`  | `FormRightButton?`        | 可选右侧按钮，见下方枚举                                | `null`                  |
| `layout`       | `FormLayout`              | 布局模式：`HORIZONTAL` / `VERTICAL`                     | `FormLayout.HORIZONTAL` |
| `labelWidth`   | `Float?`                  | 水平模式下标签区固定宽度；`null` 使用默认 96pt          | `null`                  |
| `height`       | `Float?`                  | 单元格高度；为 `null` 时高度自适应（上下 padding 16dp） | `null`                  |
| `errorMessage` | `String?`                 | 外部传入的初始错误信息；非空时显示错误状态              | `null`                  |

## FormActionConfig（操作区配置）🌟

`FormActionConfig` 是 sealed class，提供 6 种预设，以渲染不同的输入单元格。

### `FormActionConfig.Text` — 纯文本输入

| **name**                       | **type**                                 | **功能**                                                     | **default value**        |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------------------ | ------------------------ |
| `placeholder`                  | `String`                                 | 占位提示文本                                                 | `""`                     |
| `maxLength`                    | `Int?`                                   | 最大字符数；`null` = 不限制，`-1`（默认）= 使用默认值        | `-1`（见下方"实际生效"） |
| `showCountThreshold`           | `Int?`                                   | 已输入字符长度 ≥ 该值时，显示 `当前/最大` 计数；`null` = 不显示；可以设置为 1，即只要有输入就显示 | `35`（见下方"实际生效"） |
| `multiline`                    | `Boolean`                                | 是否多行（TextArea）                                         | `false`                  |
| `initialText`                  | `String`                                 | 初始文本                                                     | `""`                     |
| `blurOnReturn`                 | `Boolean`                                | 回车自动失焦                                                 | `false`                  |
| `additionalInputAttributes`    | `(InputAttr.() -> Unit)?`                | 单行时注入到底层 `Input` 的额外属性                          | `null`                   |
| `additionalTextAreaAttributes` | `(TextAreaAttr.() -> Unit)?`             | 多行时注入到底层 `TextArea` 的额外属性                       | `null`                   |
| `validationRules`              | `List<(String) -> FormValidationResult>` | 校验规则列表，按顺序执行，第一个失败的规则返回错误           | `emptyList()`            |

**实际生效**：

- `maxLength = -1` 时：单行默认 50，多行默认 500
- `showCountThreshold`：多行时始终显示计数（强制为 0），单行时按传入值决定

### `FormActionConfig.Number` — 数字输入

| **name**                    | **type**                                 | **功能**              | **default value**                  |
| --------------------------- | ---------------------------------------- | --------------------- | ---------------------------------- |
| `placeholder`               | `String`                                 | 占位提示文本          | `"0"`                              |
| `initialText`               | `String`                                 | 初始文本              | `""`                               |
| `inputFilter`               | `(String) -> String`                     | 输入过滤规则          | `InputSimpleView.filterOnlyNumber` |
| `blurOnReturn`              | `Boolean`                                | 回车自动失焦          | `true`                             |
| `additionalInputAttributes` | `(InputAttr.() -> Unit)?`                | 底层 Input 的额外属性 | `null`                             |
| `validationRules`           | `List<(String) -> FormValidationResult>` | 校验规则列表          | `emptyList()`                      |

### `FormActionConfig.Money` — 金额输入

显示 "¥" 前缀，内置小数点过滤规则（最多一个小数点，小数点后最多两位）。

| **name**                    | **type**                                 | **功能**              | **default value** |
| --------------------------- | ---------------------------------------- | --------------------- | ----------------- |
| `placeholder`               | `String`                                 | 占位提示文本          | `"0.00"`          |
| `initialText`               | `String`                                 | 初始文本              | `""`              |
| `blurOnReturn`              | `Boolean`                                | 回车自动失焦          | `true`            |
| `currencySymbol`            | `String`                                 | 货币符号              | `"¥"`             |
| `additionalInputAttributes` | `(InputAttr.() -> Unit)?`                | 底层 Input 的额外属性 | `null`            |
| `validationRules`           | `List<(String) -> FormValidationResult>` | 校验规则列表          | `emptyList()`     |

> ¥ 符号的颜色会自动跟随输入状态：未输入时同 placeholder 色（text_30），输入后变为 text_100。¥ 与数字之间无间距。

### `FormActionConfig.Phone` — 手机号输入

显示左侧可编辑区号（49dp 宽）+ 分隔线 + 手机号输入。手机号输入限制为最多 11 位数字。

| **name**                    | **type**                                 | **功能**              | **default value** |
| --------------------------- | ---------------------------------------- | --------------------- | ----------------- |
| `placeholder`               | `String`                                 | 手机号占位文本        | `""`              |
| `initialText`               | `String`                                 | 初始手机号            | `""`              |
| `regionCode`                | `String`                                 | 初始区号              | `""`              |
| `regionPlaceholder`         | `String`                                 | 区号占位文本          | `"+86"`           |
| `blurOnReturn`              | `Boolean`                                | 回车自动失焦          | `true`            |
| `additionalInputAttributes` | `(InputAttr.() -> Unit)?`                | 底层 Input 的额外属性 | `null`            |
| `validationRules`           | `List<(String) -> FormValidationResult>` | 校验规则列表          | `emptyList()`     |

### `FormActionConfig.Select` — 右箭头选择

显示文本 + 右箭头图标，点击触发选择回调（由调用方负责弹出 ActionSheet 等）。

| **name**      | **type**        | **功能**                 | **default value** |
| ------------- | --------------- | ------------------------ | ----------------- |
| `placeholder` | `String`        | 未选择时的提示文本       | `"请选择"`        |
| `displayText` | `String`        | 当前选中项的显示文本     | `""`              |
| `onClick`     | `(() -> Unit)?` | 点击操作区的回调         | `null`            |
| `arrowIcon`   | `String`        | 右侧箭头的 iconFont 名称 | `"youjiantou16"`  |

> Select 只读展示，不做校验（`validate()` 始终返回通过）。需要用户选中某个值时，请通过 `formRef?.view?.setText(id, value)` 回写。

### `FormActionConfig.Custom` — 完全自定义

| **name**        | **type**                     | **功能**                          | **default value**             |
| --------------- | ---------------------------- | --------------------------------- | ----------------------------- |
| `content`       | `ViewBuilder`                | 自定义视图构建器                  | *(必填)*                      |
| `valueProvider` | `() -> String`               | 取值函数；`getValue()` 调用时触发 | `{ "" }`                      |
| `validator`     | `() -> FormValidationResult` | 校验函数                          | `{ FormValidationResult.OK }` |

## FormRightButton（右侧按钮配置）

`FormRightButton` 是 sealed class，3 种样式，显示在单元格右侧，`margin-left = 24pt`。

### `FormRightButton.Link`

文字链接样式。

| **name**   | **type**        | **功能** |
| ---------- | --------------- | -------- |
| `text`     | `String`        | 链接文本 |
| `icon`     | `String`        | 左侧图标 |
| `disabled` | `Boolean`       | 是否禁用 |
| `onClick`  | `(() -> Unit)?` | 点击回调 |

### `FormRightButton.Button`

WGButton 样式（`SCALE_32`）。

| **name**               | **type**                  | **功能**           |
| ---------------------- | ------------------------- | ------------------ |
| `text`🌟                | `String`                  | 按钮文字           |
| `disabled`             | `Boolean`                 | 是否禁用           |
| `onClick`              | `(() -> Unit)?`           | 点击回调           |
| `additionalButtonAttr` | `WGButtonAttr.() -> Unit` | 额外 WGButton 属性 |

### `FormRightButton.IconText`

上图标下文字按钮（类似 NavBar 操作项）。

| **name**    | **type**        | **功能**           | **default value** |
| ----------- | --------------- | ------------------ | ----------------- |
| `text`🌟     | `String`        | 底部文字           | *(必填)*          |
| `icon`🌟     | `String`        | 图标 iconFont 名称 | *(必填)*          |
| `iconColor` | `Color?`        | 图标颜色           | `text_80`         |
| `textColor` | `Color?`        | 文字颜色           | `text_80`         |
| `iconSize`  | `Float`         | 图标大小           | `20f`             |
| `textSize`  | `Float`         | 文字大小           | `10f`             |
| `onClick`   | `(() -> Unit)?` | 点击回调           | `null`            |

## FormValidationResult（FormActionConfig.Custom 使用）

校验结果数据类。

```Kotlin
data class FormValidationResult(
    val isValid: Boolean,
    val errorMessage: String? = null,
)
```

提供两个快捷构造：

```Kotlin
FormValidationResult.OK                    // 通过
FormValidationResult.error("错误信息")      // 失败
```

## Form API

### Form 属性（`FormViewAttr`）

| **name**                    | **type**                        | **功能**                                                     | **default value** |
| --------------------------- | ------------------------------- | ------------------------------------------------------------ | ----------------- |
| `cellConfigs`🌟****响应式*** | `Observableist<FormCellConfig>` | 表单单元格配置列表（按顺序渲染）                             | `emptyList()`     |
| `showDivider`               | `Boolean?`                      | 单元格之间分隔线：`true` = 显示，`false` = 不显示，`null` = 显示但右侧保留 16pt 间距 | `true`            |

### Form 事件（`FormViewEvent`）

| **name**            | **type**                           | **功能**                 |
| ------------------- | ---------------------------------- | ------------------------ |
| `onCellValueChange` | `(FormCellConfig, String) -> Unit` | 任意单元格的值发生变化   |
| `onCellFocus`       | `(FormCellConfig) -> Unit`         | 任意单元格输入框获得焦点 |
| `onCellBlur`        | `(FormCellConfig) -> Unit`         | 任意单元格输入框失去焦点 |

### Form 公开方法

通过 `ref` 获取 `FormView` 实例后可调用：

| **方法**                 | **功能**                                             |
| ------------------------ | ---------------------------------------------------- |
| `getValues()`            | 获取所有单元格的当前值，返回 `Map<id, value>`        |
| `getValue(id)`           | 获取指定单元格的当前值，找不到时返回 `null`          |
| `validateAll()`🌟         | 校验所有单元格，返回 `Map<id, FormValidationResult>` |
| `validate(id)`           | 校验指定单元格                                       |
| `setText(id, text)`      | 程序化设置指定单元格的文本                           |
| `focus(id)` / `blur(id)` | 聚焦/失焦指定单元格                                  |
| `setError(id, message)`  | 为指定单元格设置错误信息                             |
| `clearError(id)`         | 清除指定单元格的错误状态                             |
| `clearAllErrors()`       | 清除所有单元格的错误状态                             |

## FormBody API

`FormBody` 可以单独使用，不依赖 `Form` 容器。

### FormBody 属性（`FormBodyViewAttr`）

| **name**      | **type**          | **功能**                                             |
| ------------- | ----------------- | ---------------------------------------------------- |
| `cellConfig`🌟 | `FormCellConfig?` | 单元格配置。由 `Form` 内部设置；单独使用时需手动传入 |

### FormBody 事件（`FormBodyViewEvent`）

| **name**        | **type**                           | **功能**       |
| --------------- | ---------------------------------- | -------------- |
| `onValueChange` | `(FormCellConfig, String) -> Unit` | 操作区值变化   |
| `onFocus`       | `(FormCellConfig) -> Unit`         | 输入框获得焦点 |
| `onBlur`        | `(FormCellConfig) -> Unit`         | 输入框失去焦点 |

### FormBody 公开方法

| **方法**             | **功能**                   |
| -------------------- | -------------------------- |
| `getValue()`         | 获取当前值                 |
| `validate()`         | 执行校验并设置 `errorText` |
| `setText(text)`      | 程序化设置文本             |
| `focus()` / `blur()` | 聚焦/失焦                  |
| `clearError()`       | 清除错误状态               |
| `errorText`          | 错误信息属性（读写）       |

## 参考代码

### 完整业务表单（转账场景）

包含文本、手机号、金额、选择器、多行备注，提交时统一校验：

```Kotlin
private var formRef: ViewRef<FormView>? = null

// ...body
Form {
    ref { ctx.formRef = it }
    attr {
        cellConfigs.addAll(listOf(
            FormCellConfig(
                id = "payee",
                label = { Span { text("收款人"); color(Color(WGColor.text_100)) } },
                action = FormActionConfig.Text(
                    placeholder = "请输入收款人姓名",
                    validationRules = listOf { value ->
                        if (value.isBlank()) FormValidationResult.error("收款人不能为空")
                        else FormValidationResult.OK
                    },
                ),
            ),
            FormCellConfig(
                id = "phone",
                label = { Span { text("手机号"); color(Color(WGColor.text_100)) } },
                action = FormActionConfig.Phone(
                    placeholder = "请输入手机号",
                    validationRules = listOf { value ->
                        if (value.length != 11) FormValidationResult.error("请输入 11 位手机号")
                        else FormValidationResult.OK
                    },
                ),
            ),
            FormCellConfig(
                id = "amount",
                label = { Span { text("金额"); color(Color(WGColor.text_100)) } },
                action = FormActionConfig.Money(
                    validationRules = listOf { value ->
                        val num = value.toDoubleOrNull()
                        when {
                            num == null || num <= 0 -> FormValidationResult.error("请输入有效金额")
                            num > 50000 -> FormValidationResult.error("单笔最多 50,000 元")
                            else -> FormValidationResult.OK
                        }
                    },
                ),
                rightButton = FormRightButton.Link(
                    text = "全部",
                    onClick = { ctx.formRef?.view?.setText("amount", "50000") },
                ),
            ),
            FormCellConfig(
                id = "type",
                label = { Span { text("类型"); color(Color(WGColor.text_100)) } },
                action = FormActionConfig.Select(
                    placeholder = "请选择",
                    onClick = { ctx.formRef?.view?.setText("type", "即时到账") },
                ),
            ),
            FormCellConfig(
                id = "note",
                label = { Span { text("备注"); color(Color(WGColor.text_100)) } },
                action = FormActionConfig.Text(
                    placeholder = "选填，最多 500 字",
                    multiline = true,
                ),
            ),
        ))
    }
}

// 提交按钮
WGButton {
    attr { text = "提交" }
    event {
        onClick {
            val validation = ctx.formRef?.view?.validateAll() ?: emptyMap()
            if (validation.values.all { it.isValid }) {
                val values = ctx.formRef?.view?.getValues() ?: emptyMap()
                // 处理提交
            }
        }
    }
}
```

### 垂直布局（多行描述）

```Kotlin
Form {
    attr {
        cellConfigs = listOf(
            FormCellConfig(
                id = "description",
                label = { Span { text("详细描述"); color(Color(WGColor.text_100)) } },
                action = FormActionConfig.Text(
                    placeholder = "请输入详细描述",
                    multiline = true,
                ),
                layout = FormLayout.VERTICAL,
            ),
        )
    }
}
```

### 固定高度 TextArea

```Kotlin
FormCellConfig(
    id = "goodsDesc",
    label = { Span { text("商品描述"); color(Color(WGColor.text_100)) } },
    action = FormActionConfig.Text(
        placeholder = "请输入",
        multiline = true,
        maxLength = 200,
    ),
    layout = FormLayout.VERTICAL,
    height = 120f,  // 有固定高度 → TextArea 固定高度模式
)
```

### 自定义操作区（Counter）

使用 `FormActionConfig.Custom` 嵌入任意组件：

```Kotlin
FormCellConfig(
    id = "qty",
    label = { Span { text("采购数量"); color(Color(WGColor.text_100)) } },
    action = FormActionConfig.Custom(
        content = {
            Counter {
                attr {
                    minNumber = 1
                    maxNumber = 100
                }
            }
        },
        valueProvider = { /* 返回当前值的函数 */ "" },
    ),
)
```

### 右侧按钮样式

```Kotlin
// Link 样式
rightButton = FormRightButton.Link(text = "查看", onClick = { /* ... */ })

// WGButton 样式
rightButton = FormRightButton.Button(text = "新增", onClick = { /* ... */ })

// 上图标下文字
rightButton = FormRightButton.IconText(
    icon = "saoyisao",
    text = "扫码",
    onClick = { /* ... */ },
)
```

### 单独使用 FormBody

不使用 `Form` 容器，只用单个 `FormBody`：

```Kotlin
private var bodyRef: ViewRef<FormBodyView>? = null// ...body
FormBody {
    ref { ctx.bodyRef = it }
    attr {
        cellConfig = FormCellConfig(
            id = "qty",
            label = { Span { text("库存数量"); color(Color(WGColor.text_100)) } },
            action = FormActionConfig.Number(
                placeholder = "请输入",
                validationRules = listOf { value ->
                    val n = value.toIntOrNull()
                    when {
                        n == null -> FormValidationResult.error("请输入数字")
                        n < 1 -> FormValidationResult.error("最少为 1")
                        n > 9999 -> FormValidationResult.error("最多 9999")
                        else -> FormValidationResult.OK
                    }
                },
            ),
            rightButton = FormRightButton.Button(
                text = "校验",
                onClick = {
                    val result = ctx.bodyRef?.view?.validate()
                    // result.isValid 判断是否通过
                },
            ),
        )
    }
}
```

## 组件特性

### 显示计数/错误信息

计数文本（`N/Max`）和错误文本都绝对定位在单元格底部，距底部 3pt：

- **水平模式**：与操作区左对齐（`16 + labelWidth + 24`）
- **垂直模式**：与操作区左对齐（距容器左边 16pt）

**显示优先级**：错误信息 > 计数。即当有错误时不显示计数。

### maxLength 和 showCountThreshold 的默认行为

Text 操作区的计数行为比较特殊：

| 场景                         | `maxLength` 实际值 | 计数显示条件                   |
| ---------------------------- | ------------------ | ------------------------------ |
| 单行、默认（maxLength = -1） | 50                 | 输入 ≥ 35 字符时显示           |
| 多行、默认（maxLength = -1） | 500                | 始终显示（threshold 强制为 0） |
| 显式传 `maxLength = 20`      | 20                 | 按传入的 `showCountThreshold`  |
| 显式传 `maxLength = null`    | 不限               | 不显示计数                     |

### Label（标签）样式

- 标签使用 `RichText` 渲染，最多显示 2 行，超出省略。
- 标签字号默认 16pt，行高 24pt

### 内容过滤

#### 手机号区号

- 手机号输入自带 11 位数字限制（`filterPhone`）
- 如果用户输入了区号，则额外在 `getValue()` 中返回区号，如 “+1 09893243”；如果没有输入区号，则只会返回手机号，如 “17799097490”

#### 金额过滤

金额输入内置的 `filterMoney`：

- 只允许数字和至多一个小数点
- 小数点后最多 2 位
- 不允许负数

### 校验与错误清除

- 调用 `validate()` / `validateAll()` 后，如果校验失败，`errorText` 会自动被设为错误信息并显示
- 用户修改输入框内容时，`errorText` 会自动清空（清除错误状态）
- 也可以手动调用 `clearError(id)` / `clearAllErrors()` / `setError(id, msg)` 控制

### 水平布局规格

- 左右 padding：16pt
- 上下 padding：16pt
- 标签区宽度：默认 96pt（可通过 `labelWidth` 覆盖）
- 标签区与操作区间距：24pt
- 右侧按钮左间距：24pt
- 单元格之间分隔线：0.5pt 细线，可通过 `showDivider` 控制

### 垂直布局规格

- 左右 padding：16pt
- 标签区上 padding：16pt
- 操作区上 padding：4pt、下 padding：16pt