# 修复 UI Kit 页面高度被撑满问题

## 摘要

Commit `1d006af` 将 phone-frame 展示外壳样式从 `index.html` 内联 `<style>` 提取到 `scaffold.css`，并首次在 UI Kit 页面中引入 `scaffold.css`。这一改动引入了 `html, body { min-height: 100% }` 规则，与 `.uikit-shell { min-height: 100vh }` 以及新的视口相关 phone-frame 高度叠加，在 Trae 的 iframe 渲染上下文中形成了一条不可收缩的最小高度链，导致页面被撑得很高。

## 当前状态分析

### 变更前后对比

| 维度 | 变更前（旧） | 变更后（新，有 bug） |
|---|---|---|
| scaffold.css 是否加载 | 否 | 是 |
| html/body min-height | 无约束 | `min-height: 100%`（scaffold.css 第 12 行） |
| .uikit-shell min-height | `100vh`（内联） | `100vh` + `100dvh`（scaffold.css） |
| .phone-frame height | 固定 `780px` | `min(780px, calc(100vh - 32px))` + dvh 回退 |
| 响应式 phone-frame 高度 | `auto` + `min-height: 100vh` | `calc(100vh - 16px)` **无上限** |

### 根因：三重 min-height 级联放大

在 Trae iframe 渲染中：

1. `html { min-height: 100% }` → 百分比相对于 iframe 初始包含块（可能远超视口）
2. `body { min-height: 100% }` → 锁定为 html 高度
3. `.uikit-shell { min-height: 100vh }` → 第三层约束

三层叠加使页面总高度被锁定在极大值上。

在 ≤640px 窄宽度场景中，`.phone-frame` 的响应式规则去掉了 `min()` 上限保护，phone-frame 自身也被拉伸到全视口高度，进一步恶化。

### 涉及的组件变更

- bottom-nav 新增 `overflow: visible`（为 badge 角标不被裁切，合理）
- bottom-nav 契约更新为固定五项（合理）
- 底部导航 UI kit 实现重写（合理）

这些组件变更本身不会导致页面高度问题。根因纯粹在 scaffold.css 的展示外壳样式。

## 修复方案

### 修改 1：`wegoux/ui_kits/app/index.html` — 重置 html/body min-height

**文件**：`wegoux/ui_kits/app/index.html`  
**位置**：内联 `<style>` 块顶部（第 14 行之前）  
**内容**：新增规则

```css
/* 在 iframe 中不允许 scaffold.css 的 min-height: 100% 撑满页面 */
html, body { min-height: auto; }
```

**目的**：UI Kit 是展示页面，不需要 html/body 强制最小高度。`.uikit-shell` 本身的 flex 居中布局就足够了。

### 修改 2：`wegoux/scaffold.css` — phone-frame 恢复固定高度

**文件**：`wegoux/scaffold.css`  
**位置**：第 127-131 行 `.phone-frame` 规则  
**当前**：
```css
.phone-frame {
  height: min(780px, calc(100vh - var(--spacer-32)));
  height: min(780px, calc(100dvh - var(--spacer-32)));
}
```
**改为**：
```css
.phone-frame {
  height: 780px;
}
```

**目的**：手机模拟框是 Showcase 演示元素，尺寸应代表真实手机屏幕（780px），不跟随视口变化。避免 `100vh`/`100dvh` 在 iframe 中解析值不稳定。

### 修改 3：`wegoux/scaffold.css` — 响应式规则加安全上限

**文件**：`wegoux/scaffold.css`  
**位置**：第 182-195 行 `@media (max-width: 640px)` 规则  
**当前**：
```css
@media (max-width: 640px) {
  .phone-frame {
    height: calc(100vh - var(--spacer-16));
    height: calc(100dvh - var(--spacer-16));
    ...
  }
}
```
**改为**：
```css
@media (max-width: 640px) {
  .phone-frame {
    height: 100vh;
    height: 100dvh;
    max-height: 900px;
    ...
  }
}
```

**目的**：真实移动设备上的 `100vh`/`100dvh` 是可靠的。加上 `max-height: 900px` 防止在窄宽度但极高的 iframe 中撑爆。

## 假设与决策

- **不修改 `html, body` 在 scaffold.css 中的 `min-height: 100%`**：组件预览页（preview/component-*.html）依赖此规则。直接改会影响所有预览页，风险大。改在 UI Kit 内联覆盖更安全。
- **phone-frame 回到固定 780px**：780px 是移动端展示的合理尺寸，无需视口跟随。
- **保留 bottom-nav `overflow: visible`**：这是为 badge 角标所做的正确改动，不影响高度。
- **不修改 `uikit-plan.json`、`library-consumption.json` 等**：本次修复仅涉及 CSS 展示层，不影响组件契约。

## 验证步骤

1. 在 Trae 中打开 UI Kit 页面，确认页面不再被撑得很高
2. 确认 phone-frame 居中显示，大小正常（约 780px 高）
3. 确认底部导航栏正常显示、badge 角标不被裁切
4. 在浏览器中打开 `wegoux/ui_kits/app/index.html`，确认手机框架正常
5. 确认各组件预览页（preview/component-*.html）未受影响
