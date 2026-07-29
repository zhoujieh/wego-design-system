# 微购 App 原型与设计系统

这是一个由 AI 工作流驱动的中文移动端原型仓库。复制仓库后，可以直接向 Codex 或 Trae 描述业务需求，由仓库内置技能完成需求确认、参考线框、设计系统消费、交互实现和验证。

[查看当前线上原型](https://zhoujieh.github.io/wego-design-system/)

## 1. 获取仓库

准备 Git 和 Node.js 24（与 CI 一致），然后执行：

```bash
git clone https://github.com/zhoujieh/wego-design-system.git
cd wego-design-system
npm ci
```

App 本身是纯静态页面，只想查看原型时无需安装依赖；`npm ci` 用于运行维护脚本和浏览器采样工具。

## 2. 预览现有原型

直接用浏览器打开 `wego-app/index.html`。电脑端会显示手机壳，手机端使用同一页面并铺满 viewport。

场景使用 hash 路由，例如：

```text
wego-app/index.html#/my-permission-management
```

已有路由可在 `wego-app/js/routes.js` 查看。若浏览器限制本地文件，也可以在仓库根目录启动静态服务：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/wego-app/`，使用完按 `Ctrl+C` 停止服务。

## 3. 让 AI 创建或修改原型

在 Codex 或 Trae 中打开仓库根目录，直接描述业务目标，不需要先指定文件、组件或布局。为了减少来回澄清，尽量说明入口、页面首要任务、主要操作、用户可见结果和必要状态。

例如：

```text
帮我做一个商品批量改价原型。入口在工作台，用户选择多个商品后按固定金额或比例调价，
提交前需要预览变化，提交后展示成功和部分失败两种结果。
```

仓库会按固定链路工作：

1. `wego-product` 澄清业务事实并形成 `prototype_brief`。
2. AI 根据当前简报生成参考线框，与简报一起交给你确认。
3. 你明确确认简报后，`wego-design` 才开始设计和实现。
4. AI 更新场景、路由、设计决策证据并运行守卫。
5. 你打开 `wego-app/index.html#/route-id` 验收交互；反馈继续复用当前未冻结迭代。

常见请求的入口如下：

| 你要做什么 | 如何提出 |
| --- | --- |
| 新页面、新场景或新流程 | 直接描述业务目标、入口、操作和结果 |
| 修改已有场景的需求 | 说明场景或路由，以及业务范围如何变化 |
| 调整已确认场景的交互或视觉 | 说明场景、当前问题和期望效果 |
| 修改组件、Token、Preview 或 UI Kit | 明确说明要维护设计系统本体 |
| 冻结一次迭代 | 明确给出迭代并要求“冻结” |

技能路由见 [`.codex/skills/README.md`](.codex/skills/README.md)，AI 必须遵守的仓库硬规则见 [`AGENTS.md`](AGENTS.md)。

## 4. 了解产物

| 路径 | 用途 |
| --- | --- |
| `wego-app/index.html` | 唯一 App 入口 |
| `wego-app/scenes/{中文业务场景}/` | 场景脚本、样式和设计决策 |
| `wego-app/scenes/{主业务场景}/_iterations/` | 简报、阶段状态与明确冻结后的快照 |
| `.codex/skills/` | 产品、设计和设计系统技能的权威来源 |
| `.trae/skills/` | 指向 `.codex/skills/` 的 Trae 入口 |
| `scripts/` | 验证、迭代记录、资源同步和清理工具 |

`wego-app/lib/` 是设计系统部署副本，不要直接修改；组件聚合样式 `components.css` 也由脚本生成。完整维护边界以 `AGENTS.md` 为准。

## 5. 验证改动

普通改动优先运行统一验证：

```bash
node scripts/validate-wego-design.mjs
```

设计系统或工作流改动运行严格系统验证：

```bash
node scripts/validate-wego-design.mjs --scope=system --strict
```

正式合并前可运行全量严格验证：

```bash
node scripts/validate-wego-design.mjs --scope=full --strict
```

各脚本的职责和按需命令见 [`scripts/README.md`](scripts/README.md)。

## 6. 发布自己的副本

仓库已配置 GitHub Pages 工作流。把副本推送到 GitHub，并为该仓库启用 GitHub Pages 后，`main` 分支中的 `wego-app/` 或部署配置发生变化时会自动验证和发布；实际访问地址以工作流显示的 deployment URL 为准。

产品阶段的参考线框只在当前 AI 会话中用于确认，不会进入仓库或 GitHub Pages。
