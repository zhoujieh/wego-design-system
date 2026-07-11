# Skill 包结构规则

> 角色：技能包结构方法。读取条件：调整技能入口或资源目录时；入口正文只保留白名单契约。

创建、审查或调整五个工作流技能包时读取。

## 适用场景

- 修改任一技能的职责、输入、流程、输出、门禁或交接。
- SKILL 同时承载详细 schema、长示例、迁移说明或专项清单。
- 新增参考资料、模板、脚本、字体、图标或其他技能资源。
- 修复入口膨胀、断链、重复规则、元数据过期或资源角色混乱。

## 不适用场景

- 只修改业务场景 `_spec`、scene 或样式，且不改变工作流规则。
- 组件 JSON、Preview、Token CSS、UI Kit 等设计系统领域资产的普通内容迭代。
- 短小单路径技能没有独立加载价值时，不强制拆分 reference。

## 标准结构

```text
skill-name/
├── SKILL.md
├── agents/openai.yaml
├── references/       # 按需加载的详细规则
├── scripts/          # 可确定执行的重复操作
└── assets/           # 输出模板、字体、图标等资源
```

领域技能可增加稳定、机器消费的专用目录，但必须在入口或 library map 中说明角色和权威关系。

## 拆分原则

保留在 SKILL：触发边界、职责、必要输入、读取路由、主流程、核心门禁、最低输出、交接和禁止事项。

移入 references：完整字段字典、兼容迁移、长示例、专项实现、专项验收和模式变体。一个 reference 服务一个清晰主题，并从 SKILL 直接链接。

移入 assets：模板、字体、图标、图片和会被复制进最终产物的样板。

移入 scripts：反复执行、易错且需要稳定结果的生成、校验和转换逻辑。

## 例外与回退

- 拆分后若核心门禁变得不可见，把最小决策规则移回 SKILL，详细解释仍留 reference。
- 移动稳定领域资产会破坏路径或同步链路时保持原路径，并在地图中登记。
- reference 只有在当前任务命中其读取条件时才加载；不确定时先读目录入口描述，不批量加载全部资料。

## 验收

- frontmatter 只含 `name`、`description`，name 与目录一致。
- SKILL 少于 500 行，所有 Markdown 相对链接可解析。
- references 均从 SKILL 直接可达，且没有平级 README 或 templates。
- `agents/openai.yaml` 与入口触发边界一致。
- 生成脚本、同步矩阵和验证器不引用已删除路径。
- 代表性任务能够沿 product → design → ux → tests 交接，工作流问题能进入 iterate → candidate → confirmation → promotion → verification 循环。
