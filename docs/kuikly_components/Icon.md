# Icon

## 概览

Icon 组件用于渲染 Iconfont 图标。

```Kotlin
Icon {
    attr {
        iconName("add")
        iconSize(20f)
        iconColor(ColorManager.text_100)
    }
}
```

## API

| **name**    | **type**                          | **功能**                                   | **default value**       |
| ----------- | --------------------------------- | ------------------------------------------ | ----------------------- |
| `iconSize`  | `Float`                           | 图标大小，默认 20px                        | `20f`                   |
| `iconColor` | `Color`                           | 图标文本颜色                               | `ColorManager.text_100` |
| `iconName`  | `String` (图标的 iconFont 字符串) | 图标的名字参考值：`"saoyiyao"`（扫一扫） `"jia16"`（加号） | `""` (空字符串)         |

## 组件特性


### 避免误差

使用 Icon 组件可以避免使用 Text 组件直接显示 iconfont 图标时在 iOS、H5 上出现偏移量的问题。建议所有 iconfont 图标都使用 Icon 组件渲染。

### 无响应式

该组件为静态组件，没有响应式属性。如果需要变更 icon，需要在外部绑定 `vbind` 并重新渲染：

```Kotlin
vbind({ctx.attr.icon}){
    Icon {
        attr {
            iconName(ctx.attr.icon)
            iconSize(ctx.effectiveIconSize)
            iconColor(ctx.getTextColor())
        }
    }
}
```
