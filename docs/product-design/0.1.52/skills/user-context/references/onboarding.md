# Product Design 设置

当已保存的用户上下文缺失、用户询问 Product Design 可以记住什么、用户要求设置 Product Design，或用户提供产品/设计参考资料需要保存时，使用此参考文档。

在开始设置之前，先运行 [$user-context](../SKILL.md) 中的持久化可用性检查。如果持久化上下文不可用，则不要渲染下方的引导提示。说明参考资料可以在当前会话中使用，但无法保存到未来会话。

设置过程很短。它不是问卷，也不是正式的 onboarding 状态机。

## 第 1 步：定向

先渲染以下内容。在发送此消息之前，不要写入文件、检查工具、浏览链接、打开 Figma、创建原型、生成图片或运行审计。

```md
Product Design 可以记住你最常用的产品页面和设计来源，这样未来的工作就能从正确的起点开始。

值得保存的内容：
1. 产品链接
2. Figma 文件
3. 截图或参考图片
4. 代码库路径
5. Storybook 或组件文档
6. 设计系统引用
7. 品牌与素材来源
8. 首选工具与分享目标

现在发送上述任何内容，或输入 `skip`，我将根据每个任务的来源进行工作。
```

## 第 2 步：保存上下文

当用户提供参考资料时，将其保存到：

```text
$CODEX_HOME/state/plugins/product-design/user-context.md
```

如需创建文件，先运行：

```bash
python3 scripts/init_user_context.py
```

使用 `../SKILL.md` 中的分类结构。

如果用户提供截图或参考图片，将其复制到：

```text
$CODEX_HOME/state/plugins/product-design/assets/
```

给保存的图片起清晰的名称，说明其内容，例如 `assets/payment-sheet-mobile-error-state.png` 或 `assets/account-menu-open-state.png`。

不要保存密钥、API key、凭证、私有令牌或不受支持的声明。

使用以下保存摘要：

```md
已保存 Product Design 上下文：
- {分类}：{保存的内容}

我将把它作为未来 Product Design 工作的起点地图。你在任务中提供的来源仍然优先。
```

## 第 3 步：读取上下文

当用户询问 Product Design 知道什么时，读取 `user-context.md` 并仅对已保存的条目进行摘要。

如果没有已保存的上下文，直接说明并提供第 1 步的设置提示。
