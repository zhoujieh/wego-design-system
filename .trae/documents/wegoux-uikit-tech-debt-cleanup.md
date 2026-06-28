# wegoux UI Kit — 业务设置拆分计划

## 概要

将 `ui_kits/app/index.html` 中的业务设置页（BizSettingsScreen + biz-* CSS）拆分为独立的 UI Kit 文件 `ui_kits/app/biz-settings.html`，并用已注册组件重写 biz-* 演示样式。

修改 3 个文件，新建 1 个文件。

---

## 当前状态

`index.html` 中包含 4 个页面：首页（HomeScreen）、商品详情（DetailScreen）、我的（ProfileScreen）、业务设置（BizSettingsScreen）。

BizSettingsScreen 使用了 17 个未注册的 `biz-*` CSS 类（biz-navbar、biz-cell、biz-switch、biz-cell-checkbox 等），这些样式占约 270 行 CSS。根据 `quality-report.json`，这些属于 `inventedComponents`。

## 目标

- 新建 `biz-settings.html`，用已注册组件重写业务设置页面
- 从 `index.html` 中移除 BizSettingsScreen 及其 biz-* CSS
- 更新 `quality-report.json` 反映拆分结果

---

## 实施步骤

### 第一步：新建 biz-settings.html

**文件**：`ui_kits/app/biz-settings.html`

结构框架：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>业务设置 - 岗位权限</title>
<link rel="stylesheet" href="../../colors_and_type.css">
<link rel="stylesheet" href="../../components.css">
<link rel="stylesheet" href="../../iconfont.css">
<style>
  /* 页面脚手架 + phone-frame + 辅助布局（不含 biz-*） */
</style>
</head>
<body>
  <div class="uikit-shell">
    <div class="phone-frame">
      <div class="phone-screen" id="root"></div>
    </div>
  </div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    // React 组件
  </script>
</body>
</html>
```

**注意**：不引入 Lucide CDN，图标使用 wego-iconfont。

### 第二步：biz-settings.html — 页面组件重写

将 BizSettingsScreen 拆分为以下注册组件映射：

#### 2.1 导航栏：biz-navbar → navbar

```jsx
<div className="navbar" style={{flexShrink:0}}>
  <div className="navbar__body navbar__body--spaced">
    <div className="navbar__left">
      <span className="navbar__left-text" onClick={onBack}>取消</span>
    </div>
    <div className="navbar__center">
      <span className="navbar__title">岗位权限设置</span>
    </div>
    <div className="navbar__right">
      <div className="navbar__action navbar__action--button">
        <button className="navbar__action-btn" onClick={onSave}>保存</button>
      </div>
    </div>
  </div>
</div>
```

#### 2.2 业务信息行：biz-business-* → avatar + chip + link

```jsx
<div style={{display:'flex',alignItems:'center',gap:'var(--space-8)',padding:'var(--space-16)',background:'var(--color-bg-surface)'}}>
  <div style={{display:'flex',alignItems:'center',gap:'var(--space-4)',flex:1,minWidth:0}}>
    <div className="avatar avatar--24 avatar--initials">车</div>
    <span style={{fontSize:'var(--font-size-16)',fontWeight:'var(--font-weight-medium)',color:'var(--color-text-primary)'}}>车车</span>
    <span className="chip chip--sm chip--success chip--filled">管理员</span>
  </div>
  <a className="link link--inline" style={{fontSize:'var(--font-size-14)',flexShrink:0}}>切换岗位</a>
</div>
```

#### 2.3 分组标题：biz-section-title → 保留为纯排版类

无需改动，`biz-section-title` 是纯排版工具类（12px 灰色文字），不涉及组件语义。在 biz-settings.html 的 `<style>` 中定义：
```css
.section-title { font-size: var(--font-size-12); color: var(--color-text-tertiary); padding: var(--space-16) var(--space-16) var(--space-8); }
```

#### 2.4 单行 cell（仅文字右侧）：biz-cell → cell

```jsx
<div className="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable">
  <div className="cell__body">
    <div className="cell__content">
      <div className="cell__title-row"><span className="cell__title">业绩归属</span></div>
    </div>
    <div className="cell__action">
      <span className="cell__action-text">查看归属设置</span>
    </div>
  </div>
</div>
```

多个 cell 需用 section-group 包裹以实现白色连续背景和分割线。

#### 2.5 开关行（总开关）：biz-switch → switch

每组 section 的总开关行：
```jsx
<div className="section-group">
  <div className="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" onClick={toggle}>
    <div className="cell__body">
      <div className="cell__content">
        <div className="cell__title-row"><span className="cell__title">选款与上架</span></div>
      </div>
      <div className="cell__action">
        <div className={`switch${on ? ' switch--on' : ' switch--off'}`}>
          <div className="switch__thumb"></div>
        </div>
      </div>
    </div>
  </div>
</div>
<div className="section-gap"></div>
```

**注意**：switch 组件尺寸为 52x32px，比原 biz-switch(44x24px) 大。cell 组件已原生适配，无需额外处理。

#### 2.6 checkbox 行（权限子项）：biz-cell-checkbox → checkbox

```jsx
<div className="section-group">
  <div className="cell cell--double cell--divider-right-edge cell--bg-white cell--clickable" onClick={toggle}>
    <div className="cell__select">
      <div className={`checkbox${checked ? ' checkbox--checked' : ''}`}>
        <div className="checkbox__inner"></div>
        {checked && (
          <div className="checkbox__icon">
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.41406 6.5L1.41406 3.5L0 4.91406L4.41406 9.32812L12.3281 1.41406L10.9141 0L4.41406 6.5Z" fill="white"/>
            </svg>
          </div>
        )}
      </div>
    </div>
    <div className="cell__body">
      <div className="cell__content">
        <div className="cell__title-row"><span className="cell__title">允许查看上家的联系方式</span></div>
      </div>
    </div>
  </div>
  {/* 更多 checkbox 行... */}
</div>
<div className="section-gap"></div>
```

对于带副标题的 checkbox 行：
```jsx
<div className="cell cell--double cell--divider-right-edge cell--bg-white cell--clickable" onClick={toggle}>
  <div className="cell__select">
    <div className={`checkbox${checked ? ' checkbox--checked' : ''}`}>
      <div className="checkbox__inner"></div>
      {checked && (...)}
    </div>
  </div>
  <div className="cell__body">
    <div className="cell__content">
      <div className="cell__title-row"><span className="cell__title">允许已归属粉丝被其他员工划分</span></div>
      <div className="cell__subtitle">粉丝从其他员工处访问店铺或开单，将会更改归属到对应员工</div>
    </div>
  </div>
</div>
```

#### 2.7 下拉选择行：biz-cell-selector → cell__action + iconfont

```jsx
<div className="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable">
  <div className="cell__body">
    <div className="cell__content">
      <div className="cell__title-row"><span className="cell__title">权限范围</span></div>
    </div>
    <div className="cell__action">
      <span className="cell__action-text">仅自己带来的粉丝</span>
      <i className="wego-iconfont-s icon-xiajiantou16 cell__arrow"></i>
    </div>
  </div>
</div>
```

禁用态下拉：
```jsx
<div className="cell__action">
  <span className="cell__action-text" style={{color:'var(--color-text-tertiary)'}}>未分配</span>
  <i className="wego-iconfont-s icon-youjiantou16 cell__arrow" style={{color:'var(--color-text-tertiary)'}}></i>
</div>
```

### 第三步：从 index.html 中移除业务设置

1. 删除 `<style>` 块中的 `biz-*` CSS 规则（行 289-561，共约 270 行）
2. 删除 `BizSettingsScreen` 组件函数（约 350 行 JSX）
3. 删除 `App` 中 `bizSettings` screen 的路由逻辑
4. 删除 ProfileScreen 中的 `onBizSettings` prop 和"业务设置"菜单项

### 第四步：更新 quality-report.json

```json
{
  "kitType": "app",
  "screensGenerated": 3,
  "coreComponentsUsed": ["bottom-nav", "button", "card", "chip", "badge", "avatar", "input"],
  "supportComponentsUsed": [],
  "previewClassReuseRate": 0.52,
  "reuseAssessment": "业务设置已拆分为独立 biz-settings.html。主 UI Kit 仍待后续清理 Lucide 图标和 phone-header。",
  "inventedComponents": ["phone-status", "phone-header", "phone-indicator"],
  "recommendedRefactors": {
    "phone-header": "navbar"
  },
  "interactiveStatesRendered": ["active", "disabled", "selected"],
  "primaryActionPerScreen": true,
  "mockDataDensity": {
    "productCards": 3,
    "settingRows": 0,
    "tableRows": 0,
    "chartPoints": 0
  },
  "warnings": [
    "UI Kit 是移动端应用 Showcase，不是可直接复制的页面模板。",
    "部分演示图标来自 Lucide CDN；基础组件完善后将统一替换为 iconfont。"
  ]
}
```

关键变化：
- `screensGenerated`: 4 → 3
- `inventedComponents`: 移除 `biz-cell`、`biz-switch`、`biz-cell-checkbox`、`product-media-placeholder`
- `mockDataDensity.settingRows`: 12 → 0
- `recommendedRefactors`: 移除 biz-* 相关项
- `warnings`: 更新为反映过渡状态

### 第五步：更新 metadata.json

version: 91 → 92

---

## 文件变更汇总

| 文件 | 操作 | 说明 |
|------|------|------|
| `ui_kits/app/biz-settings.html` | 新建 | 业务设置独立 UI Kit，用注册组件重写 |
| `ui_kits/app/index.html` | 修改 | 删除 BizSettingsScreen + biz-* CSS + 路由逻辑 |
| `ui_kits/app/quality-report.json` | 修改 | 更新 inventedComponents、screensGenerated |
| `metadata.json` | 修改 | version 91 → 92 |

---

## 变更同步矩阵

| 检查项 | 操作 |
|--------|------|
| `components.css` | 无需变更（navbar/cell/switch/checkbox 样式已存在） |
| `components/index.json` | 无需变更 |
| `iconfont.css` | 无需变更 |
| `uikit-plan.json` | 检查：selectedFrameNames 需补充 biz-settings.html |
| `library-consumption.json` | 无需变更 |
| `quality-report.json` | 更新 |
| `metadata.json` | version 91 → 92 |
| `README.md` | 检查：文件清单需补充 biz-settings.html |
| `SKILL.md` | 检查：UI Kit 路径表需补充 biz-settings.html |

---

## 后续待办（本次不做）

- Lucide CDN 图标替换为 iconfont
- 底部导航改为复用组件原生 tab
- phone-header 替换为 navbar

---

## 验证步骤

1. `grep -n "biz-" ui_kits/app/index.html` — 应返回空
2. `grep -n "BizSettings" ui_kits/app/index.html` — 应返回空
3. biz-settings.html：核对 navbar、cell、switch、checkbox 的 class 名与组件契约一致
4. biz-settings.html：确认所有 checkbox/switch 的 onClick 交互正常
5. biz-settings.html：确认未引用 Lucide CDN，图标来自 iconfont
