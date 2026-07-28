---
name: user-context
description: 加载或管理 Product Design 已保存的用户上下文。当用户要求设置 Product Design、开始使用、上手引导、保存产品或设计来源、查看 Product Design 记住了什么、更新已保存的上下文或记住 Product Design 偏好时使用。示例包括产品链接、Figma 文件、截图、参考图片、代码库路径、Storybook、Token、设计系统、品牌素材和一般产品/设计备注。
---

# User Context（用户上下文）

用户上下文存储设计师经常使用的产品和设计引用，这样未来的 Product Design 工作就能从正确的来源开始。

当用户要求以下操作时使用此技能：

- 设置 Product Design
- 开始使用 Product Design
- 上手引导 Product Design
- 保存产品或设计来源
- 查看 Product Design 记住了什么
- 更新已保存的产品或设计上下文
- 记住 Product Design 偏好
- 设置我的插件

## Critical Overrides（关键覆盖）

- 继续之前先查阅插件路由 [$index](../index/SKILL.md)。
- 遵循 [$critical-overrides](../../references/critical-overrides.md)。
- 在提供上手引导或为未来会话保存上下文之前，确认本地 shell 访问可用、`$CODEX_HOME` 可以解析，且 `$CODEX_HOME/state/plugins/product-design/` 存在并可写，或其父目录可创建。如果 `user-context.md` 已存在，也要确认它可写。
- 如果任何检查无法完成或失败，则持久化上下文不可用。不要提供保存上下文的上手引导，也不要声称新上下文已保存到未来会话。如果用户要求保存某些内容，说明它可以在当前会话中使用，但无法保存到未来会话。

## Saved User Context（已保存的用户上下文）

如果 `user-context.md` 存在，默认使用它。

使用已保存的产品链接、Figma 文件、截图、参考图片、代码库路径、Storybook、Token、设计系统、品牌素材、组件引用、浏览器偏好和分享目标作为 Product Design 工作的基础。

构思、原型、审计、克隆和评审应与已保存的产品上下文匹配，除非用户要求不同的内容。

当工作流需要视觉基础时，在 ImageGen、构思、原型、审计和评审工作中附加或包含相关的已保存截图、参考图片、Token、设计语言和设计系统引用。

## State File（状态文件）

已保存的上下文存放于此：

```text
$CODEX_HOME/state/plugins/product-design/user-context.md
```

已保存的截图和参考图片存放在其旁边：

```text
$CODEX_HOME/state/plugins/product-design/assets/
```

如果文件不存在，正常继续，除非用户要求设置 Product Design、保存上下文，或当前任务因缺失产品/设计上下文而被阻塞。

## Preflight（预检）

当任何 Product Design 工作流需要已保存的上下文时，运行：

```bash
python3 scripts/user_context_preflight.py
```

将返回的已保存条目作为任务的起始上下文。

如果脚本报告没有已保存的上下文，则从当前用户提示继续，除非需要设置上下文。

在预检期间不要浏览、打开或检查每一个已保存的引用。只检查当前任务需要的已保存引用。

## Setup（设置）

当用户要求设置 Product Design、询问 Product Design 可以记住什么、询问 Product Design 知道关于其产品的什么，或提供产品/设计参考资料需要保存时，使用 [references/onboarding.md](references/onboarding.md)。

对于仅设置的请求，说明 Product Design 可以记住什么，并请求有用的来源。

调整上下文收集请求以匹配用户的请求。首次设置与更新现有上下文不同。

在设置期间不要检查工作区、安装依赖、搭建原型、生成图片、运行审计或开始实现。

在用户提供了要保存的引用后，运行：

```bash
python3 scripts/init_user_context.py
```

然后将引用添加到创建的 `user-context.md` 中。

## Save（保存）

保存有用、持久的 Product Design 上下文：

- 产品链接
- Figma 文件
- 截图和参考图片
- 代码库路径
- Storybook 和组件文档
- 设计 Token 和主题来源
- 品牌、Logo、图标、插画、图片和素材来源
- 首选浏览器、截图工具和分享目标
- 使未来 Product Design 工作更准确的团队约定

当用户提供要保存的截图或参考图片时，将它们复制到 `user-context.md` 旁边的 `assets/` 中，并从保存的条目中链接它们。

给每张保存的图片一个清晰、描述性的文件名，说明图片内容。使用未来 Product Design 运行无需打开文件就能理解的名称。

好的图片名称：

```text
assets/chatgpt-settings-modal-dark-mode.png
assets/payment-sheet-mobile-error-state.png
assets/product-dashboard-sidebar-navigation.png
assets/storybook-primary-button-states.png
assets/brand-logo-lockup-purple-gradient.png
assets/onboarding-flow-welcome-step.png
assets/checkout-confirmation-screen.png
assets/account-menu-open-state.png
```

不要保存密钥、凭证、API key、私有令牌、复制的客户数据或任何不应持久化的内容。

使用此结构：

```md
# {分类}

- 描述：{这个分类是什么，以及未来 Product Design 运行应该在什么时候使用它}

## 已保存的链接与上下文

{已保存的引用或事实}
- 添加日期：YYYY-MM-DD。
- 文件：assets/{清晰描述性名称}.png
- 有用上下文：{此引用代表什么}
- 未来用途：{未来 Product Design 工作应如何使用它}
```

仅当保存的条目有本地图片文件时才包含 `文件：`。

当分类还没有已保存的引用时，准确使用：

```md
状态：未提供
```

保持已保存上下文的精选性。优先选择少数高价值的引用，而不是倾倒每一个可能的 URL 或文件。

## Read（读取）

- 不要将 `状态：未提供` 视为事实。
- 当本地 shell 访问可用时，通读 `scripts/user_context_preflight.py`。
- 使用已保存的上下文作为默认基础，然后只检查当前任务需要的内容。
