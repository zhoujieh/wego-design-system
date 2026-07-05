# Footer & LoadMoreItemView

Demo 页 page 名称：`KuiklyFooterDemo`

## 概览

Footer 是列表底部状态指示组件，用于展示"加载更多"、"加载中"、"没有更多内容"和"加载失败"等状态。

LoadMoreItemView 在 Footer 基础上封装了 `FooterRefresh`，提供开箱即用的上拉加载更多能力。

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=OGEwZTcwZTdhZjM5NGM1MGJjNmFmZWFlMGUzYmFhMTNfU3lOS2kzT0FLaVhJeFhqRGFoN25LelI1VHdwUDJydU1fVG9rZW46VzNwaGJWSUZNb3Q5d054OWM1SWNNR1ltbnliXzE3NzYyNTYyODE6MTc3NjI1OTg4MV9WNA)

**两个组件的关系：**

- `Footer` — 纯 UI 展示组件（如上图），根据 `FooterType` 显示不同状态的文案和动画
- `LoadMoreItemView` — 功能组件，内部组合 `FooterRefresh`（Kuikly 框架）+ `Footer`，自动管理刷新状态并触发加载回调

```Kotlin
// 推荐：使用 LoadMoreItemView（一行搞定上拉加载）
List {
    attr { flex(1f) }
    // ... 列表内容 ...
    LoadMoreItemView {
        attr {
            footerRefreshState = ctx.viewModel.loadMoreState
        }
        event {
            onLoadMore = { ctx.viewModel.loadNextPage() }
        }
    }
}
```

> **推荐做法：** 在 List 中需要上拉加载更多时，优先使用 `LoadMoreItemView`；仅在需要手动控制 `FooterRefresh` 或单独展示加载状态时才使用 `Footer`。

## FooterType 枚举

| 值           | 说明         | 显示内容                                       |
| ------------ | ------------ | ---------------------------------------------- |
| `LOAD_MORE`  | 初始状态     | "继续上滑，加载更多"                           |
| `LOADING`    | 加载中       | PAG 加载动画 “···”                             |
| `NO_MORE`    | 无更多数据   | 装饰线 + "没有更多内容啦"                      |
| `ERROR`      | 加载失败     | 错误图标 + "加载失败，" + 可点击 "点击重试"    |
| `STOCK`      | 库存不足预警 | 装饰线 + "库存小于 N 件时预警" + "去修改" 链接 |
| `STOCK_OVER` | 库存积压预警 | 装饰线 + "库存大于 N 件时预警" + "去修改" 链接 |
| `ORDER_TIME` | 滞销预警     | 装饰线 + "滞销超过 N 天时预警" + "去修改" 链接 |

## Footer（纯 UI 组件）

### Footer 属性（`FooterAttr`）

| **name**          | **type**     | **功能**                                     | **default value**      |
| ----------------- | ------------ | -------------------------------------------- | ---------------------- |
| `footerType`🌟     | `FooterType` | Footer 显示状态类型                          | `FooterType.LOAD_MORE` |
| `height`          | `Float`      | Footer 高度                                  | `40f`                  |
| `minStock`        | `Int?`       | 库存不足预警阈值（仅 `STOCK` 类型使用）      | `null`                 |
| `maxStock`        | `Int?`       | 库存积压预警阈值（仅 `STOCK_OVER` 类型使用） | `null`                 |
| `unsalableDayNum` | `Int?`       | 滞销天数阈值（仅 `ORDER_TIME` 类型使用）     | `null`                 |

### Footer 事件（`FooterEvent`）

| **name**     | **type**     | **功能**                       |
| ------------ | ------------ | ------------------------------ |
| `retryClick` | `() -> Unit` | 错误状态下点击"点击重试"的回调 |

### 基本用法

```Kotlin
// 直接指定类型
Footer {
    attr {
        footerType = FooterType.LOADING
    }
}

// 错误状态 + 重试回调
Footer {
    attr {
        footerType = FooterType.ERROR
    }
    event {
        retryClick {
            // 处理重试
        }
    }
}
```

## LoadMoreItemView

### LoadMoreItemView 属性（`LoadMoreItemViewAttr`）

| **name**                         | **type**             | **功能**                                            | **default value**         |
| -------------------------------- | -------------------- | --------------------------------------------------- | ------------------------- |
| `footerRefreshState`🌟***响应式** | `FooterRefreshState` | 控制刷新状态，驱动 Footer 显示和 FooterRefresh 行为 | `FooterRefreshState.IDLE` |

### LoadMoreItemView 事件（`LoadMoreItemViewEvent`）

| **name**      | **type**     | **功能**                                                   |
| ------------- | ------------ | ---------------------------------------------------------- |
| `onLoadMore`🌟 | `() -> Unit` | 触发加载更多时的回调（当状态变为 `REFRESHING` 时自动调用） |

### FooterRefreshState 与 FooterType 的映射

LoadMoreItemView 内部自动将 `FooterRefreshState` 映射为 `FooterType`：

| FooterRefreshState | FooterType  | 说明                             |
| ------------------ | ----------- | -------------------------------- |
| `IDLE`             | `LOAD_MORE` | 空闲状态，显示"继续上滑"         |
| `REFRESHING`       | `LOADING`   | 加载中，显示加载动画             |
| `NONE_MORE_DATA`   | `NO_MORE`   | 无更多数据，显示"没有更多内容"   |
| `FAILURE`          | `ERROR`     | 加载失败，显示错误信息和重试按钮 |

点击失败状态时，组件会自动调用 `beginRefresh()` 重新触发加载。

## 参考代码

### 最常见用法：List 中使用 LoadMoreItemView

```Kotlin
// ViewModelclass MyViewModel(pagerScope: PagerScope) {
    var loadMoreState by pagerScope.observable(FooterRefreshState.IDLE)
    var items by pagerScope.observableList<Item>()

    fun loadNextPage() {
        async {
            val response = postFormRequest(ApiPaths.MY_API)
                .bodyParams(jsonOf("page" with currentPage))
                .send<MyResponse>()

            if (response.success && response.data?.success == true) {
                val newItems = response.data?.result?.items ?: emptyList()
                items.addAll(newItems)
                loadMoreState = if (newItems.size < PAGE_SIZE)
                    FooterRefreshState.NONE_MORE_DATA
                else
                    FooterRefreshState.IDLE
            } else {
                loadMoreState = FooterRefreshState.FAILURE
            }
        }
    }
}

// View
List {
    attr { flex(1f) }
    
    renderList({ ctx.viewModel.items }) { item, _, _ ->
        ItemCard {
            attr { this.item = item }
        }
    }
    
    LoadMoreItemView {
        attr {
            footerRefreshState = ctx.viewModel.loadMoreState
        }
        event {
            onLoadMore = { ctx.viewModel.loadNextPage() }
        }
    }
}
```

### 条件显示 LoadMoreItemView

当列表数据较少（如仅一页）时可隐藏加载更多组件：

```Kotlin
vif({ !ctx.viewModel.isOnlyOnePageData }) {
    LoadMoreItemView {
        attr {
            width(pagerData.pageViewWidth)
            footerRefreshState = if (ctx.hasSelected)
                ctx.viewModel.loadMoreState
            else
                FooterRefreshState.IDLE
        }
        event {
            onLoadMore = {
                ctx.viewModel.loadNextPage()
            }
        }
    }
}
```

### 直接使用 Footer 作为页面级 Loading 指示器

不在列表中，而是作为页面内容的加载占位：

```Kotlin
vif({ ctx.viewModel.items == null }) {
    View {
        attr {
            width(pagerData.pageViewWidth * 0.9f)
            height(pagerData.pageViewHeight)
            absolutePosition(0f, 0f)
            allCenter()
        }
        Footer50() // 或 Footer { attr { footerType = FooterType.LOADING } }
    }
}
```

### 直接使用 Footer 在 List 中手动管理状态

当需要更精细的控制（如根据业务逻辑决定显示内容），可直接使用 Footer + `vif`：

```Kotlin
List {
    attr { flex(1f) }
    
    // ... 列表内容 ...// 加载中
    vif({ ctx.viewModel.isLoadingMore }) {
        Footer {
            attr { footerType = FooterType.LOADING }
        }
    }
    // 无更多数据（且列表足够长时才显示）
    velseif({ !ctx.viewModel.hasMoreData && ctx.viewModel.items.size > 10 }) {
        Footer {
            attr { footerType = FooterType.NO_MORE }
        }
    }
}
```

### 使用 Footer 展示库存预警状态

```Kotlin
Footer {
    attr {
        footerType = FooterType.STOCK
        minStock = 10
    }
}

Footer {
    attr {
        footerType = FooterType.STOCK_OVER
        maxStock = 500
    }
}

Footer {
    attr {
        footerType = FooterType.ORDER_TIME
        unsalableDayNum = 30
    }
}
```

### Legacy 写法：手动 FooterRefresh + Footer 快捷函数

> 不推荐新代码使用此模式，应使用 `LoadMoreItemView` 替代。

```Kotlin
FooterRefresh {
    val footerRefreshView = this
    attr {
        height(50f)
        allCenter()
        flexDirectionRow()
    }
    event {
        refreshStateDidChange {
            ctx.footerRefreshState = it
            if (it == FooterRefreshState.REFRESHING) {
                ctx.loadMore()
            }
        }
    }
    vbind({ ctx.footerRefreshState }) {
        vif({ ctx.footerRefreshState == FooterRefreshState.IDLE }) {
            Footer0()
        }
        velseif({ ctx.footerRefreshState == FooterRefreshState.REFRESHING }) {
            Footer50()
        }
        velseif({ ctx.footerRefreshState == FooterRefreshState.NONE_MORE_DATA }) {
            Footer100()
        }
        velseif({ ctx.footerRefreshState == FooterRefreshState.FAILURE }) {
            Footer_error { ctx.loadMore() }
        }
    }
}
```

## 组件特性

### LoadMoreItemView 的自动行为

- 当 `footerRefreshState` 设为 `IDLE` 时，内部调用 `endRefresh(SUCCESS)` 结束刷新
- 当离底部距离达到 `preloadDistance` 的时候，会刷新状态变为 `REFRESHING` 、同时自动触发 `onLoadMore` 回调
- 当设为 `NONE_MORE_DATA` 时，调用 `endRefresh(NONE_MORE_DATA)`
- 当设为 `FAILURE` 时，调用 `endRefresh(FAILURE)`
- 用户点击失败状态区域时，自动调用 `beginRefresh()` 重新触发加载