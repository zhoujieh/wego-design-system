# RenderList

## 概览

`renderList`: 列表渲染组件，替代 Kuikly 自带的 `vfor`, `vforIndex`, `vforLazy`。

```Kotlin
renderList({ ctx.someObservableList }, isLazy = false) { item, index, count ->
    View {
        Image {
            attr {
                src("https://picsum.photos/200/300")
            }
        }
        Text {
            attr {
                text("$item, $index, $count")
            }
        }
    }
}
```

## API

| **name**      | **type**                                                     | **功能**                                             | **default** |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ----------- |
| `list`        | `() -> ObservableList`                                       | 要遍历的 Observable 列表                             | **(必填)**  |
| `isLazy`      | `Boolean`                                                    | （仅在 ListView 中调用 renderList 时生效）是否懒加载 | `false`     |
| `maxLoadItem` | `Int`                                                        | （仅在 `isLazy` = `true` 时生效）懒加载虚拟节点个数  | 30          |
| `renderItem`  | `ViewContainer<*,*>.(item: T, index: Int, count: Int) -> Unit` | 渲染 item 的 lambda                                  | **(必填)**  |

## 组件特性

### 自动处理平台特性

- H5 不能使用 vforLazy

### 便捷函数

- 可以使用 `renderLazyList` 渲染懒加载列表
- 若非 `ObservableList`（一次性遍历），可以使用 `List` 的扩展函数 `render`：

```Kotlin
ctx.stack.render { item, index, count -> // stack 为一个普通 List 对象
    View {
        Text {
            attr {
                text(label)
                fontSize(BreadcrumbConstants.CRUMB_FONT_SIZE)
                fontWeightMedium()
                color(
                    if (index == ctx.focusedIndex) WGColor.text_100
                    else WGColor.text_80
                )
                lines(1)
                textOverFlowTail()
            }
        }
    }
}
            
```