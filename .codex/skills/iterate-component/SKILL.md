---
name: "iterate-component"
description: "用于迭代 wegoux 已注册组件或发布新组件。适用于调整组件契约、预览页标记区样式、组件同步关系、components.css 生成链路与正式迭代守门。"
---

# 组件迭代 Skill

用于 `wegoux` 组件的正式迭代。目标是把组件修改流程收敛成稳定、可复用、可审计的标准动作，而不是临时改一个文件就结束。

## 触发场景

- 迭代已注册组件，例如“迭代 button 契约和样式”“调整 cell 组件边界”
- 发布新组件，例如“新增 coupon-card 组件并注册”
- 同步组件契约与预览页，例如“把 input 的结构和 preview 对齐”
- 拦截错误入口，例如“顺手改一下 components.css”

## 固定读取顺序

每次开始前按这个顺序读取：

1. `wegoux/SKILL.md`
2. `wegoux/README.md`
3. `wegoux/library-consumption.json`
4. `wegoux/uikit-plan.json`
5. `wegoux/components/index.json`
6. `wegoux/components/{slug}.json`
7. `wegoux/preview/component-{slug}.html`

按任务继续补读：

- 涉及 Token：读 `wegoux/colors_and_type.css` 和 `wegoux/css.json`
- 涉及 UI Kit：读 `wegoux/ui_kits/app/index.html` 和对应 `quality-report.json`
- 涉及图标：读 `wegoux/iconfont.css`、`wegoux/assets/fonts/`、`wegoux/assets/icons/`
- 涉及规范或文案：读 `wegoux/specs/` 对应文件

## 任务分流

优先判断当前任务属于哪一类：

- 已注册组件迭代
- 新增组件发布
- 涉及 Token
- 涉及 UI Kit
- 涉及图标

详细步骤读 `references/workflow.md`，变更同步面读 `references/sync-matrix.md`。

## 预检清单

进入编辑前，先检查：

- preview 里是否有 inline style 承担了组件语义；有的话优先判断为契约漂移
- 当前变体是否过散，是否应该先收敛成少数稳定公开类型
- 是否涉及默认挂载方式、宿主关系、嵌套方式等组件边界变化
- 是否会连带影响 UI Kit、README、顶层设计库 SKILL 或消费契约
- 如果是视觉细节迭代，是否需要打开 preview 做一次真实浏览器核对，而不是只看 CSS

## 强制守门

- 禁止直接手改 `wegoux/components.css`
- 组件样式优先改 `wegoux/preview/component-{slug}.html` 中 `/* @component-css-start */` 与 `/* @component-css-end */` 之间的样式
- 组件契约与 preview 结构、状态、变体、Token 消费必须同步
- 如果 preview 里出现“靠 inline style 才成立的类型或形态”，必须优先收回正式 class 或契约
- 如果组件正式暴露了 CSS 自定义属性，允许在 preview / UI Kit 用 inline style 演示变量覆盖，但必须先把变量写进组件契约
- 涉及 Token 时，必须同步 `wegoux/css.json`
- 修改 `wegoux/css.json` 后，必须执行 `python3 -c "import json; json.load(open('wegoux/css.json'))"`
- 组件样式有变动时，必须在仓库根执行 `node wegoux/scripts/extract-components-css.mjs wegoux`
- 正式迭代必须递增 `wegoux/metadata.json` 的 `version`

## 输入约定

收到任务后，先在心里补齐这几个输入：

- 组件 slug
- 变更类型
- 是否涉及 Token
- 是否为新增组件
- 是否需要同步 UI Kit

缺少时先从仓库里推断；实在推断不了，再向用户确认。

## 输出约定

每轮回复都必须包含：

- 改了什么
- 验证了什么
- 剩余风险

如果信息不足，先列缺口，再说明你基于什么假设继续。

推荐模板：

- 改了什么：列出本轮改动的组件、文档、脚本链路
- 验证了什么：列出执行过的脚本、校验、回归检查
- 剩余风险：列出暂未覆盖的宿主场景、旧调用兼容性或待后续补齐项

## 特别提醒

- `wegoux/components/index.json` 是已发布组件权威来源
- `navbar-action-button` 是嵌入式组件，不要误当成独立预览页组件
- `button` 案例参考读 `references/button-example.md`
- 若用户要求直接改 `wegoux/components.css`，应明确拦截并改走 preview 标记区 + 提取脚本流程
- 遇到默认角标挂载与行内模式这类定位规则时，要明确它们是两套行为，不要混用
- 遇到圆角、切角、滚动、偏移这类强视觉反馈改动时，优先做一次浏览器核对，再结束本轮
