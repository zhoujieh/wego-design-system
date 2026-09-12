# 优化 phone-body 内容上间距与退出动画

## 摘要

1. **phone-body 内容上间距**：将 scaffold.css、UI Kit、所有场景级 phone-body 的 `padding-top` 统一从 0/12px 改为 8px（`var(--spacer-8)`），并在布局与间距规范中新增通用规则条目。
2. **页面跳转/弹窗退出动画**：补齐当前缺失的退出动画，进入动画保留现有 CSS animation，退出动画改用 transition 双向过渡方案（与 UI Kit 预览页对齐），消费已定义的 `--ease-exit` 和 `--duration-slow` token。

## 当前状态分析

### 任务1：phone-body padding-top

| 文件 | 当前值 | 目标值 |
|------|--------|--------|
| `.codex/skills/wego-design/scaffold.css` `.phone-body` | 0px | 8px |
| `.codex/skills/wego-design/ui_kits/biz-rule-config/index.html` `.phone-body` | 0px | 8px |
| `wego-app/scenes/系统设置/scene.css` `.system-settings-body` | 12px | 8px |
| `wego-app/scenes/价格权限管理/scene.css` `.price-list-body` / `.price-perm-body` | 12px | 8px |

### 任务2：退出动画

- **进入动画**：已实现，使用 CSS `animation` + keyframes（`wego-scene-enter`、`wego-sheet-enter`）
- **退出动画**：完全缺失，关闭时直接 `hidden=true` + `replaceChildren()` 瞬间消失
- **设计规范要求**：`交互设计原则.md` 第 100-102 行明确要求"退出：反向动画，动画结束后清空 overlay 内容"
- **已准备的 token**：`--ease-exit: cubic-bezier(0.4, 0, 1, 1)`（未使用）、`--duration-slow: 350ms`（定义但未用于退出）

## 实施步骤

### 步骤1：统一 phone-body padding-top 为 8px

**文件1**：`.codex/skills/wego-design/scaffold.css`（第 167-174 行）
- 修改 `.phone-body` 规则，新增 `padding-top: var(--spacer-8)`

**文件2**：`.codex/skills/wego-design/ui_kits/biz-rule-config/index.html`（第 41-50 行）
- 修改 `.phone-body` 规则，新增 `padding-top: var(--spacer-8)`

**文件3**：`wego-app/scenes/系统设置/scene.css`（第 16 行）
- 将 `padding: var(--spacer-12) 0 ...` 改为 `padding: var(--spacer-8) 0 ...`

**文件4**：`wego-app/scenes/价格权限管理/scene.css`（第 26 行）
- 将 `padding: var(--spacer-12) 0 ...` 改为 `padding: var(--spacer-8) 0 ...`

### 步骤2：在布局与间距规范中新增通用规则

**文件**：`.codex/skills/wego-design/specs/布局与间距规范.md`
- 在"页面边距"章节下新增"phone-body 内容上间距"规则条目，明确 `padding-top: var(--spacer-8)`

### 步骤3：实现退出动画（transition 方案）

**文件1**：`wego-app/css/app.css`
- 新增 `.app-scene-layer--exit` 类：`transition: transform var(--duration-slow) var(--ease-exit), opacity var(--duration-slow) var(--ease-exit); transform: translateX(16px); opacity: 0;`
- 修改 `.app-overlay-layer--sheet .app-overlay-panel` 和 `.app-overlay-layer--full-screen-modal .app-overlay-panel`：新增退出状态的 transition 规则
- 新增 `.app-overlay-panel--exit` 类：`transition: transform var(--duration-slow) var(--ease-exit); transform: translateY(100%);`
- 修改 `.app-scene-layer[hidden]` 和 `.app-overlay-layer[hidden]`：保留 display:none，但退出动画时不立即设置 hidden，改为先加 exit 类

**文件2**：`wego-app/js/app.js`
- 改造 `clearSceneLayer()`（第 105-110 行）：先加 `--exit` 类触发退出动画，监听 `transitionend` 后再 `hidden=true` + `replaceChildren()`
- 改造 `closeOverlay()`（第 170-174 行）：同上，对 overlay panel 加 `--exit` 类，监听 `transitionend`
- 改造 `closeTopLayer()`（第 176-183 行）：确保调用改造后的 closeOverlay 和 clearSceneLayer

### 步骤4：更新 metadata version

**文件**：`.codex/skills/wego-design/metadata.json`
- 将 `version` 从 307 递增到 308

## 关键决策

1. **退出动画采用 transition 方案**：保留现有进入动画的 CSS animation，退出动画改用 transition 双向过渡，与 UI Kit 预览页对齐，消费已定义的 `--ease-exit` token。
2. **phone-body padding-top 全量统一**：scaffold.css（权威源）、UI Kit、所有场景级 phone-body 统一为 8px，确保设计系统一致性。

## 验证步骤

1. 运行 `node scripts/validate-wego-design.mjs` 通过守门
2. 在浏览器中打开 `wego-app/index.html`，验证：
   - phone-body 顶部内容与 navbar 之间有 8px 间距
   - 页面 push 跳转有进入动画（右滑淡入）和退出动画（右滑淡出）
   - 全屏模态弹窗有进入动画（底部上滑）和退出动画（底部下滑）
   - 退出动画结束后页面/弹窗正常关闭，无残留
3. 检查各场景页面（系统设置、价格权限管理）顶部间距一致为 8px
