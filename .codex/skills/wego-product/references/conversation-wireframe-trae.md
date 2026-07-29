# Trae 会话线框适配

> 角色：只负责把产品阶段临时线框模型渲染到 Trae；简报后必生成门禁、帧结构、更新和交接以[产品阶段会话线框](./conversation-wireframe.md)为准。

## 能力检测与加载

当前宿主同时提供 `dynamic-ui` 与 `PureShowWidget` 时：

1. 完整读取 Trae 全局 `dynamic-ui` 技能。
2. 读取其 `micro-interaction` 场景和 `visual-tokens`。
3. 将同一份临时线框模型渲染为一个交互片段。
4. 调用 `PureShowWidget` 在当前会话内展示。

`dynamic-ui` 和 `PureShowWidget` 是可选宿主能力，不是 `wego-product` 的硬依赖。缺少任一能力时按产品线框方法退回文本分镜，不提示安装、不阻断简报流程。不得在本仓库记录 Trae 的本机绝对路径。

## 渲染合同

- 使用动态 UI 的自定义 `explanation-panel` 作为静态骨架。
- 默认帧在 JavaScript 执行前也必须可理解。
- 最终只使用一个脚本绑定交互。
- 使用宿主主题合同、语义 HTML 和键盘可操作控件。
- 按模型的 `control` 只使用一种控制概念：单一 stepper、单一 tabs 或单一 toggle。
- 一个 widget 只呈现一条主路径和 2–6 个帧；超过 6 帧按业务子流程拆分。

禁止实现真正的多页 router、调用接口、持久化状态或组合多个独立控制概念。不得把 Trae 模板、Token、技能源码或宿主代码复制到微购仓库；Trae 与 Codex 只要求业务语义一致，不要求像素一致。
