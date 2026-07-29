# 产品阶段会话线框

> 角色：产品线框的唯一业务方法。线框必须在完整 `prototype_brief` 草案形成后生成，用于帮助用户确认该版本简报；不是正式原型、设计输入、迭代产物或独立确认状态。

## 简报后必生成门禁

固定按以下顺序执行：

1. 先澄清业务事实并形成完整的 `prototype_brief` 草案，解决全部 `open_questions`。
2. 再从当前简报生成对应线框；每个进入 `submit-brief → confirm-brief` 的简报版本都必须生成，不得跳过。
3. 线框生成后，用 `submit-brief --wireframe-generated-for-revision <scope_revision>` 绑定当前范围提交快照，并向用户共同展示简报摘要与线框供确认。
4. 用户反馈改变简报中的页面、入口、路径、状态或可见结果时，先更新简报，再重新生成当前版本的线框。

纯文案、纯数据规则、后端逻辑、实现修复或设计系统变化若不创建或变更 `prototype_brief`，不进入本流程；一旦由 `wego-product` 创建或变更简报，就必须执行上述线框门禁。线框不能替代业务澄清。缺少任何会改变页面结构的事实时必须先询问并完成简报；不得先画假设线框，也不得用历史场景、组件能力、同类产品或 AI 推测补齐。

## 最小业务事实

完整 `prototype_brief` 草案必须先具备：

- 用户目标。
- 业务入口。
- 页面首要任务。
- 主要操作。
- 操作后的用户可见结果。
- 已知且会改变页面内容或操作的必要状态。

其中任何一项缺失或仍有多种会改变页面结构的答案时，先记录为 `open_questions` 并询问用户；问题解决并写回简报后，才生成线框。

## 临时线框模型

模型只存在于当前产品阶段上下文，不写入迭代、简报或仓库文件：

```json
{
  "schema_version": 1,
  "flow_id": "publish-product",
  "control": "stepper",
  "frames": [
    {
      "frame_id": "product-list-default",
      "surface_name": "商品列表",
      "state_id": "default",
      "primary_task": "选择需要发布的商品",
      "content_groups": ["搜索区", "商品列表", "主要操作区"],
      "actions": [
        {
          "label": "打开商品",
          "target_frame_id": "product-detail-default",
          "visible_result": "进入所选商品详情"
        }
      ]
    }
  ]
}
```

固定约束：

- `control` 只能是 `stepper`、`tabs` 或 `toggle` 之一。
- 每个线框必须使用且只使用一个控制概念，不组合 stepper、tabs、筛选器和状态开关。
- 每个 widget 只表达一条主路径，每条主路径包含 2–6 个页面或状态帧。
- 超过 6 帧时按业务子流程拆成多个线框，不缩小文字、不模拟完整 App 或完整路由。
- 每个 `target_frame_id` 必须引用当前模型中的帧。
- 模型不得包含组件名、CSS、Token、坐标、尺寸、颜色或最终视觉样式。

## 页面与状态拆帧

- 有先后顺序的跨页面关键路径使用 `stepper`。
- 同一页面的多个互斥状态或互斥方案使用 `tabs`。
- 仅比较前后两个状态使用 `toggle`。
- 页面帧描述当前 surface 的首要任务、内容分组、主要操作及可见结果；状态帧只拆分会改变内容或操作的业务状态。
- 返回关系影响理解主路径时写入相关帧的操作和结果；不为了模拟导航而加入无业务意义的帧。

## 线框更新

以下反馈必须先写回 `prototype_brief`，并使当前线框失效；随后必须基于更新后的简报重新生成：

- 页面集合或业务入口变化。
- 页面关系、返回路径或主要操作变化。
- 关键路径、完成结果或会改变页面的状态变化。
- 用户指出页面理解不正确。

纯措辞、低风险可逆假设和不影响线框语义的实现细节不触发重新生成。`submit-brief` 前和用户确认时展示的线框必须对应当前简报版本；线框仍处于失效状态时不得提交或确认。不得增加“线框已确认”、`wireframe_confirmation` 或其他独立确认状态，也不得由线框直接运行 `confirm-brief`。

## 宿主渲染与降级

- Trae 宿主按[Trae 适配](./conversation-wireframe-trae.md)渲染。
- Codex 宿主按[Codex 适配](./conversation-wireframe-codex.md)渲染。
- Trae 与 Codex 共享本文件定义的临时模型和业务语义，只允许渲染器不同。
- 当前宿主没有可用渲染器时，不提示安装插件、不阻断主链路，改为输出紧凑文本分镜：

```text
[1/3 商品列表·默认]
内容：搜索区、商品列表
操作：打开商品
结果：进入商品详情
```

文本分镜仍须遵守单一控制概念、单一主路径和 2–6 帧边界。

## 共同确认与交接

线框必须只从当前 `prototype_brief` 的现有字段派生：

- 页面和功能范围 → `included` / `excluded`
- 业务入口 → `entry_points`
- 页面与操作顺序 → `critical_paths`
- 实现深度和可见结果 → `prototype_boundaries`
- 页面状态和触发结果 → `states`
- 必须展示或修改的数据 → `data_contract`
- 可逆假设 → `assumptions`
- 未解决问题 → `open_questions`；非空时不得生成线框

生成完成后，运行 `submit-brief --wireframe-generated-for-revision <scope_revision>`，向用户共同展示简报摘要和对应线框。该命令只持久化当前范围的提交哈希，不保存线框内容或建立线框确认状态。用户提出反馈时，先用 `invalidate --stage=brief` 使当前提交失效，再修改 Markdown `prototype_brief`，按当前版本重新生成线框并再次提交；不得直接在线框上修改业务事实。用户明确确认后才能运行 `confirm-brief` 并进入 `wego-design`。

不得保存临时线框模型、HTML、CSS、JavaScript、宿主工具名、线框截图或文件路径，也不得从线框外观提取组件、Token、正式布局或视觉样式。正式确认对象仍绑定 `prototype_brief`；线框只让用户看见并核对当前简报表达的页面、入口、路径、状态与结果，不扩展正式 Schema。

## 参考边界

会话线框全部是简报确认参考，不能被当作低成本正式设计，也不得机械照搬。它帮助用户确认页面范围、入口、路径、状态和可见结果；具体组件、布局尺度、颜色、排版与视觉表达由设计阶段依据已确认简报和设计系统重新组织。用户若另行明确确认某项视觉要求，必须先写入 `prototype_brief`，再重新生成对应线框并按正式简报约束处理。
