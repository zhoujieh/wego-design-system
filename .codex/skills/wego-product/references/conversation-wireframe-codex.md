# Codex 会话线框适配

> 角色：只负责把产品阶段临时线框模型渲染到 Codex；业务触发、帧结构、更新和交接以[产品阶段会话线框](./conversation-wireframe.md)为准。

## 能力检测与加载

当前宿主提供 `visualize` 时：

1. 完整读取 `visualize` 技能。
2. 将同一份临时线框模型渲染为 HTML fragment。
3. 写入当前任务的 visualization 目录，不写入微购仓库或业务迭代目录。
4. 输出 `::codex-inline-vis` 指令，在当前会话内展示。

`visualize` 是可选宿主能力，不是 `wego-product` 的硬依赖。能力不可用时按产品线框方法退回文本分镜，不提示安装、不阻断简报流程。

## 渲染合同

- 使用一个当前页面画布，并按模型的 `control` 只使用一种控制概念：单一 stepper、单一 tabs 或单一 toggle。
- 默认帧必须无需交互即可理解，切换控件使用语义 HTML 并支持键盘操作。
- 保持 320–736px 宽度可用，内容不得靠缩小文字容纳。
- 交互全部使用 fragment 内的本地临时状态。
- 禁止使用 `fetch`、XHR、真正路由、接口或持久化。
- 一个 fragment 只呈现一条主路径和 2–6 个帧；超过 6 帧按业务子流程拆分。

不得把 visualization 文件路径、HTML、CSS、JavaScript 或 `visualize` 工具名写入 `prototype_brief`。Trae 与 Codex 只要求业务帧、操作和可见结果语义一致，不要求像素一致。
