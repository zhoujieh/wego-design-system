# 移动端运行时组件

## 轮播

`Carousel` 是水平集合的标准组件：卡片、图片、媒体、可滑动项以及芯片或筛选轨道。直接将其放在 `MobileScroll` 内部；使用者不应添加手势包装器或指针处理程序。

```tsx
<MobileScroll>
  <section>
    <Carousel
      ariaLabel="Event details"
      className="event-carousel"
      contentClassName="event-carousel-track"
    >
      {cards}
    </Carousel>
  </section>
</MobileScroll>
```

运行时按轴解析嵌套手势。水平意图保留在 `Carousel` 中；垂直意图交给父级 `MobileScroll`。在水平手势被接管后，轻微的垂直漂移不会移动、橡皮筋回弹或给父级增加动量。点击保持可点击，而完成的拖动会抑制项点击。

不要对轮播或普通轨道使用 `data-scroll-drag="ignore"`。这是一个强制的退出选项，会阻止所有方向的父级滚动。不要在运行时的 JavaScript 动量之上叠加 CSS 滚动吸附。如果以后需要添加吸附，它应该是一个组件选项，以便一个系统拥有释放动作。

## 键盘关联表面

对所有文本输入使用 `KeyboardInput`、`KeyboardTextarea` 或 `MobileTextField`。从 `useKeyboardInsets().bottomInset` 定位编辑器、搜索表面或其他键盘关联 UI。该内边距相对于应用视口：Android 在键盘关闭时的视口已经在导航栏上方结束，而 iOS 仍然需要其叠加的主屏幕指示器内边距；两个平台在键盘打开时都返回键盘高度。永远不要只将这些表面固定到 `keyboardHeight`。当该表面关闭时，在更新其自身打开状态之前，在同一事件中调用 `keyboard.hide()`。

## 底部面板

`BottomSheet` 在打开前会收起键盘，并默认以动画形式进入和退出。通过 `onOpenChange` 控制其 `open` 状态；不需要消费者添加退出动画包装器。
