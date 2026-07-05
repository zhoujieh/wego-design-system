# Spacer

## 概览

通用的间距组件，直接通过 `Spacer()` 调用：

```TypeScript
View {
    attr {
        flexDirectionRow()
    }
    
    WGButton {
        attr {
            text = "注册外部数据库"
        }
    }
    
    Spacer(8f) // 自动横向间距
    
    WGButton {
        attr {
            text = "下载外部数据库"
        }
    }
    
    Spacer(8f)
    
    WGButton {
        attr {
            text = "创建表"
        }
    }
}
```

## API

Spacer 方法参数

| **name** | **type** | **功能** | **default** |
| -------- | -------- | -------- | ----------- |
| `size`   | `Float`  | 间距大小 | `8f`        |

## 组件行为

Spacer 会自动判断所处的容器的 flexDirection

- 如果是 Column 则创建 长*宽 为 0.5dp * size 大小的 View
- 如果是 Row 则创建 长*宽 为 size * 0.5dp 大小的 View