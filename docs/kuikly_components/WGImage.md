# WGImage

## 概览

WGImage - 基础图片组件（推荐使用）

⚠️这不是一个样式组件，而是 Kuikly 官方 `Image` 组件的替代。支持多种功能如点击态、淡入动画、重试机制、设置背景颜色。

```Kotlin
WGImage {
    attr {
        allSize = 16f
        url = "https://picsum.photos/id/1/200/300"
    }
}
```

## API

### 属性 (Attr)

| **name**                       | **type**                     | **功能**                                                                 | **default value**                |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| `allSize` *响应式               | `Float`                      | 正方形尺寸（当需要显示正方形图片时使用，优先级高于分别设置的宽高）       | `0f`                             |
| `imageWidth` *响应式            | `Float`                      | 图片宽度（当 allSize 为 0 时生效）                                       | `0f`                             |
| `imageHeight` *响应式           | `Float`                      | 图片高度（当 allSize 为 0 时生效）                                       | `0f`                             |
| `url` *响应式                   | `String`                     | 网络图片URL（优先级最高）                                                | `""`                             |
| `commonAssetPath`              | `String`                     | 通用资源图片路径（当 url 为空时使用，优先级高于 pageAssetPath）           | `""`                             |
| `pageAssetPath`                | `String`                     | 页面级资源图片路径（当 url 和 commonAssetPath 都为空时使用）              | `""`                             |
| `isRgb565`                     | `Boolean`                    | 是否使用 Rgb565 格式图片，优化内存                                       | `true`                           |
| `clickable`                    | `Boolean`                    | 是否使用点击态（若使用则与 click、pan 等事件冲突）                       | `false`                          |
| `customTouchStateColor`        | `Color`                      | 自定义点击态蒙层颜色（仅在 `clickable = true` 时生效）                   | `WGColor.bg_modal_30`           |
| `additionalImageAttr`          | `ImageAttr.() -> Unit`       | 额外的图片属性配置回调，允许对内部 Image 组件进行更详细的配置             | `{}` (空 lambda)                 |
| `initialBackgroundColor`       | `Color`                      | 初始背景色（图片加载前显示）                                             | `Color(0xFFEBEBED)`                    |
| `useTransparentBackground()`   | N/A                          | （方法）将初始背景色设为透明                                             | N/A                              |
| `useFadeInAnimation`           | `Boolean`                    | 是否使用淡入动画。设为 `false` 时直接显示图片，下方淡入相关配置均失效     | `true`                           |
| `customKey`                    | `String`                     | 完全自定义的图片 key；相同 key 不会重复做淡入动画                        | `""`                             |
| `useUrlAsKey`                  | `Boolean`                    | 使用 URL 作为 key（默认行为）                                            | `true`                           |
| `sceneKey`                     | `Any`                        | 区分场景的 key（仅在 `useUrlAsKey = true` 时生效），避免全局取消同一张图片的淡入效果 | `""`                   |
| `duplicateSceneIndependentKey` | `Boolean`                    | 复制一份仅使用 URL（不包含 sceneKey）的缓存（仅在 sceneKey 非空时生效）  | `false`                          |

### 事件 (Event)

| **name**         | **type**                       | **功能**                         |
| ---------------- | ------------------------------ | -------------------------------- |
| `click`          | `(ClickParams) -> Unit`        | 点击事件（需设置 `clickable = true` 或注册此事件才会消耗点击） |
| `loadSuccess`    | `(LoadSuccessParams) -> Unit`  | 图片加载成功后的回调             |
| `loadFailure`    | `(LoadFailureParams) -> Unit`  | 图片加载失败后的回调             |
| `loadResolution` | `(LoadResolutionParams) -> Unit` | 图片分辨率信息回调              |

### 公开方法

| **方法**                   | **说明**                                       |
| -------------------------- | ---------------------------------------------- |
| `setSize(width, height)`   | 动态设置图片尺寸（height 可选，默认等于 width） |
| `setUrl(url)`              | 动态设置图片 URL                               |

### 静态方法 (Companion)

| **方法**                   | **说明**                                       |
| -------------------------- | ---------------------------------------------- |
| `WGImageView.clearCache()`          | 清除所有淡入动画缓存                  |
| `WGImageView.clearCacheIf(predicate)` | 按条件清除淡入动画缓存             |

除此之外，外层容器还支持其它基本属性，如 `absolutePosition()`、`borderRadius()` 可设置图片圆角等。

> ⚠️ 注意不要用基本属性中的 `width()` / `height()` 方法，尤其不要使用 `size()` 方法，而应该使用 `allSize`、`imageWidth` 或 `imageHeight` 赋值。

**错误示例**

```kotlin
WGImage {
    size(100f, 100f) // ❌ 没有效果
}
```

**正确示例**

```kotlin
WGImage {
    allSize = 100f
}
```

## 组件特性

### 淡入动画与缓存

组件默认启用淡入动画（`useFadeInAnimation = true`）。淡入动画的去重逻辑：

1. 默认使用 `url` 作为 key（`useUrlAsKey = true`）
2. 可设置 `sceneKey` 区分不同场景，避免同一张图片在所有场景中都跳过淡入
3. 可设置 `customKey` 完全自定义 key
4. 已加载过的 key 会被缓存，再次出现时不会重复淡入

### 加载失败重试

图片加载失败时会自动显示占位图（`component/goods_placeholder_img.png`），最多重试 1 次。

### 点击态

设置 `clickable = true` 后，点击时会在图片上方显示一层半透明蒙层，颜色可通过 `customTouchStateColor` 自定义。

### 动态更新

可通过 `setSize()` 和 `setUrl()` 方法在图片加载完成后动态更新尺寸和 URL。也可以直接修改 `attr.url`，组件会自动检测变化并重新加载。

## 示例代码

### 基础用法 - 正方形网络图片

```Kotlin
WGImage {
    attr {
        allSize = 16f
        url = "https://picsum.photos/id/1/200/300"
    }
}
```

### 自定义宽高

```Kotlin
WGImage {
    attr {
        imageWidth = IMG_WIDTH
        imageHeight = IMG_HEIGHT
        url = ctx.attr.iconMiniCode
        marginTop(40f)
        marginBottom(40f)
    }
}
```

### 本地资源图片 + 透明背景

```Kotlin
WGImage {
    attr {
        allSize = 12f
        margin(left = 4f, right = 4f)
        commonAssetPath = "personalAlbum/goods_imgs_bofang_icon.png"
        useTransparentBackground()
    }
}
```

### 带点击态

```Kotlin
WGImage {
    attr {
        allSize = 48f
        url = "https://example.com/avatar.jpg"
        clickable = true
        borderRadius(24f)
    }
    event {
        click {
            // 处理点击
        }
    }
}
```

### 监听加载事件

```Kotlin
WGImage {
    attr {
        imageWidth = 100f
        imageHeight = 100f
        url = "https://example.com/image.jpg"
    }
    event {
        loadSuccess { params ->
            // 图片加载成功
        }
        loadFailure { params ->
            // 图片加载失败
        }
    }
}
```

### 关闭淡入动画

```Kotlin
WGImage {
    attr {
        allSize = 32f
        url = "https://example.com/icon.png"
        useFadeInAnimation = false
        useTransparentBackground()
    }
}
```

### 区分场景的淡入缓存

```Kotlin
WGImage {
    attr {
        imageWidth = 80f
        imageHeight = 80f
        url = item.imageUrl
        sceneKey = "product_list"  // 同一张图片在不同场景各自淡入一次
    }
}
```

### 额外图片属性配置

```Kotlin
WGImage {
    attr {
        allSize = 64f
        url = "https://example.com/photo.jpg"
        additionalImageAttr = {
            resizeContain()  // 覆盖默认的 resizeCover
        }
    }
}
```

### 在响应式上下文中使用

由于组件内部有一定响应式能力，`url` 变化会自动触发重载。如果需要外部控制整体重渲染：

```Kotlin
vbind({ ctx.adjustableHeight }) {
    WGImage {
        attr {
            imageWidth = 40f
            imageHeight = ctx.adjustableHeight
            url = "https://picsum.photos/id/1/200/300"
        }
    }
}
```
