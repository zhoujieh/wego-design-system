# 微购 App 原型与设计系统

这是一个由 AI 工作流驱动的中文移动端原型仓库。向 Codex 或 Trae 描述业务需求后，仓库内置技能会完成需求确认、页面设计、设计系统消费、交互实现和验证。

[查看当前线上原型](https://zhoujieh.github.io/wego-design-system/)

## 获取与预览

需要 Git 和 Node.js 24：

```bash
git clone https://github.com/zhoujieh/wego-design-system.git
cd wego-design-system
npm ci
```

直接打开 `wego-app/index.html`，或从 `wego-app/js/routes.js` 选择 hash 路由：

```text
wego-app/index.html#/my-permission-management
```

浏览器限制本地文件时，可临时运行：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/wego-app/`，使用后停止服务。

## 让 AI 创建或修改原型

直接描述业务目标、入口、页面首要任务、主要操作、可见结果和必要状态，不需要指定组件或布局。例如：

```text
帮我做一个商品批量改价原型。入口在工作台，用户选择多个商品后按固定金额或比例调价，
提交前需要预览变化，提交后展示成功和部分失败两种结果。
```

固定链路为：

1. `wego-product` 澄清业务事实并形成 `prototype_brief`。
2. 你确认简报后，`wego-design` 完成页面设计、正式组件消费和交互实现。
3. 自动守卫检查源码一致性，真实浏览器检查视口、布局和核心交互。
4. 你通过 `wego-app/index.html#/route-id` 验收；反馈复用当前未冻结迭代。

组件、Token、Preview、UI Kit、守卫或工作流本体由 `wego-uxsystem-iterate` 维护。技能路由见 [`.codex/skills/README.md`](.codex/skills/README.md)，仓库硬约束见 [`AGENTS.md`](AGENTS.md)。

参考图只提供视觉方向，用户线框图只提供结构，高保真 Figma 约束指定 Frame 的结构视觉；它们不能替代已确认简报或补造业务事实。系统不主动生成线框图或文本分镜。

## 主要路径

| 路径 | 用途 |
| --- | --- |
| `wego-app/index.html` | 唯一 App 入口 |
| `wego-app/scenes/{中文业务场景}/` | 场景脚本与样式 |
| `wego-app/scenes/{主业务场景}/_iterations/` | 简报、迭代状态和明确冻结后的快照 |
| `.codex/skills/` | 三个技能及设计系统权威源 |
| `scripts/` | 验证、迭代记录、同步和清理工具 |

`wego-app/lib/` 是设计系统部署副本，`components.css` 是生成物，二者都不直接修改。

## 验证

```bash
node scripts/validate-wego-design.mjs
node scripts/validate-wego-design.mjs --scope=system --strict
node scripts/validate-wego-design.mjs --scope=full --strict
```

按改动范围选择命令，脚本职责见 [`scripts/README.md`](scripts/README.md)。

仓库已配置 GitHub Pages 工作流；启用 Pages 后，以工作流显示的 deployment URL 为准。
