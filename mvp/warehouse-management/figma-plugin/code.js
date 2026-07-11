// MVP001｜仓库管理 Figma MCP 写入插件
//
// 使用方法：
// 1. 将本文件夹（figma-plugin/）保存到本地任意位置
// 2. 打开 Figma 桌面端，打开目标文件：MVP001｜仓库管理｜Figma MCP 写入测试
// 3. 菜单：Plugins → Development → Import plugin from manifest...
// 4. 选择本文件夹中的 manifest.json
// 5. 菜单：Plugins → Development → MVP001 仓库管理 Figma 写入 → Run
// 6. 等待弹出「写入完成」提示
//
// 幂等规则：同名 Page 更新，同名 Frame 更新，禁止重复创建。

const PLAN = {
  iteration_id: "mvp001",
  page_name: "MVP001｜仓库管理",
  sections: [
    { id: "S00", name: "00 需求概览" },
    { id: "S01", name: "01 交互流程总览" },
    { id: "S02", name: "02 页面状态" },
    { id: "S03", name: "03 状态说明" }
  ],
  overview: [
    "MVP001｜仓库管理 Figma MCP 写入验证",
    "",
    "目标：验证从真实仓库内容生成可执行 Figma 写入计划的链路",
    "来源：zhoujieh/wego-design-system 仓库管理场景",
    "路由：my-warehouse-management",
    "",
    "覆盖范围：",
    "• 5 条用户流程（F01-F05）",
    "• 4 个页面（列表页/新增页/编辑页/删除弹窗）",
    "• 9 个关键状态（S01-S09）",
    "• 9 个 Figma Frame，每个含 6 项交互说明",
    "",
    "不包含：其他业务场景、库存管理、订单流程"
  ],
  flows: [
    { id: "F01", name: "仓库列表浏览流程", type: "main", start: "我的 Tab 应用中心点击仓库管理入口", end: "用户停留在列表页浏览仓库资料" },
    { id: "F02", name: "新增仓库流程", type: "main", start: "列表页点击 navbar 右侧「新建」按钮", end: "新仓库插入列表顶部，toast 提示「仓库已新增」" },
    { id: "F03", name: "编辑仓库流程", type: "branch", start: "列表页点击某张仓库卡片的更多按钮", end: "对应仓库在列表原位更新，toast 提示「仓库已更新」" },
    { id: "F04", name: "删除仓库流程", type: "branch", start: "列表页点击某张仓库卡片的更多按钮", end: "对应仓库从列表移除，toast 提示「仓库已删除」" },
    { id: "F05", name: "空状态新增流程", type: "branch", start: "列表为空时点击「新增仓库」按钮", end: "首个仓库出现在列表中，toast 提示「仓库已新增」" }
  ],
  states: [
    {
      frame: "mvp001-F01-S01-仓库管理列表页-列表默认态",
      name: "列表默认态", flow: "F01", screen: "仓库管理列表页",
      trigger: "从我的 Tab 应用中心进入仓库管理",
      visual: "展示 navbar、摘要区（已接入仓库 3 个，启用中 3 个，默认发货仓 1 个）、3 张仓库卡片",
      data: "加载 STATE.warehouses 数组",
      next: "浏览卡片、点击新建、点击更多按钮",
      edge: "仓库全部停用时摘要启用数显示 0；默认仓被取消时默认仓数显示 0"
    },
    {
      frame: "mvp001-F05-S02-仓库管理列表页-空状态",
      name: "空状态", flow: "F05", screen: "仓库管理列表页",
      trigger: "仓库列表为空（STATE.warehouses.length === 0）",
      visual: "列表区域替换为空状态组件：圆形品牌色图标 + 「还没有仓库」标题 + 引导文案 + 「新增仓库」按钮",
      data: "无数据加载",
      next: "点击「新增仓库」按钮进入 F05 流程",
      edge: "删除最后一个仓库后进入此状态"
    },
    {
      frame: "mvp001-F03-S03-仓库管理列表页-操作菜单展开态",
      name: "操作菜单展开态", flow: "F03", screen: "仓库管理列表页",
      trigger: "点击某张仓库卡片的更多按钮（data-action=toggle-menu）",
      visual: "该卡片更多按钮下方展开操作菜单，带向上箭头小三角，含「编辑」和「删除」（danger 红色）两项",
      data: "STATE.openMenuId 设为该仓库 id",
      next: "点击编辑（进入 F03）、点击删除（进入 F04）、点击空白处关闭菜单",
      edge: "再次点击同一更多按钮可收起菜单；点击其他卡片更多按钮切换菜单"
    },
    {
      frame: "mvp001-F02-S04-新增仓库页-新增初始态",
      name: "新增仓库初始态", flow: "F02", screen: "新增仓库页",
      trigger: "点击 navbar「新建」按钮或空状态「新增仓库」按钮",
      visual: "full-screen-modal 从底部滑入，展示空表单含默认值（类型=直营网仓、服务范围=多渠道履约、时效=24小时内发货、温层=常温、安全库存=10、单日上限=500），标题「新增仓库」",
      data: "createDraft(null) 生成空 draft",
      next: "填写表单、点击保存、点击取消",
      edge: "取消时有修改会弹出放弃确认 dialog"
    },
    {
      frame: "mvp001-F03-S05-编辑仓库页-编辑已有数据态",
      name: "编辑已有数据态", flow: "F03", screen: "编辑仓库页",
      trigger: "点击操作菜单中的「编辑」",
      visual: "full-screen-modal 打开，表单回填已有仓库全部字段，标题「编辑仓库」，封面图使用已有 imageUrl 或按名称生成示意图",
      data: "createDraft(currentWarehouse) 生成带数据的 draft",
      next: "修改字段、点击保存、点击取消",
      edge: "取消时有修改会弹出放弃确认 dialog"
    },
    {
      frame: "mvp001-F02-S06-新增仓库页-表单校验失败态",
      name: "表单校验失败态", flow: "F02", screen: "新增仓库页",
      trigger: "点击保存但必填项缺失或电话格式错误",
      visual: "表单保持当前内容，顶部 toast 提示具体校验失败原因",
      data: "无数据持久化",
      next: "根据 toast 提示补充必填项后重新保存",
      edge: "四种失败场景：名称空→「请先填写仓库名称」、联系人空→「请先填写仓库联系人」、电话非11位→「联系电话需要填写 11 位手机号」、地址空→「请先填写仓库地址」"
    },
    {
      frame: "mvp001-F02-S07-仓库管理列表页-保存成功态",
      name: "保存成功态", flow: "F02", screen: "仓库管理列表页",
      trigger: "点击保存且校验通过",
      visual: "编辑 modal 关闭，列表页显示 toast「仓库已新增」或「仓库已更新」，列表回填（新增项 unshift 置顶，编辑项原位更新）",
      data: "persistWarehouse 写入 STATE.warehouses；若设为默认仓则同步取消其他默认标记",
      next: "继续浏览列表、新增、编辑或删除",
      edge: "设为默认仓时其他仓库默认标记被自动取消"
    },
    {
      frame: "mvp001-F04-S08-删除确认弹窗-删除确认态",
      name: "删除确认态", flow: "F04", screen: "删除确认弹窗",
      trigger: "点击操作菜单中的「删除」",
      visual: "列表上方弹出 dialog：标题「确认删除仓库？」、内容文案含仓库名称、底部两按钮「取消」（dismiss）+「删除」（danger）",
      data: "无数据变更，等待用户确认",
      next: "点击删除确认、点击取消返回列表",
      edge: "点击遮罩或取消按钮不删除任何数据"
    },
    {
      frame: "mvp001-F04-S09-仓库管理列表页-删除完成态",
      name: "删除完成态", flow: "F04", screen: "仓库管理列表页",
      trigger: "在删除确认 dialog 中点击「删除」",
      visual: "dialog 关闭，列表移除对应卡片，toast 提示「仓库已删除」",
      data: "STATE.warehouses filter 移除对应 id 的仓库",
      next: "继续浏览列表、新增、编辑或删除",
      edge: "删除最后一个仓库后列表进入空状态 S02"
    }
  ]
};

// ============ 颜色定义 ============
const COLORS = {
  pageBg: { r: 0.96, g: 0.96, b: 0.96 },
  sectionBg: { r: 1, g: 1, b: 1 },
  sectionHeaderBg: { r: 0.95, g: 0.95, b: 0.97 },
  frameBg: { r: 1, g: 1, b: 1 },
  frameHeaderBg: { r: 0.98, g: 0.99, b: 1 },
  mockupBg: { r: 0.94, g: 0.95, b: 0.97 },
  annotationBg: { r: 1, g: 1, b: 1 },
  textPrimary: { r: 0.12, g: 0.13, b: 0.16 },
  textSecondary: { r: 0.4, g: 0.42, b: 0.48 },
  textBrand: { r: 0.03, g: 0.76, b: 0.38 },
  border: { r: 0.88, g: 0.89, b: 0.92 },
  labelBg: { r: 0.93, g: 0.96, b: 1 }
};

// ============ 工具函数 ============
function findOrCreatePage(name) {
  let page = figma.root.children.find(p => p.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  return page;
}

function findNodeByName(parent, name) {
  if (!parent.children) return null;
  return parent.children.find(c => c.name === name) || null;
}

function createSectionFrame(page, name, x, y, width, height) {
  let frame = findNodeByName(page, name);
  if (frame) {
    // 更新现有
    frame.x = x;
    frame.y = y;
    frame.resize(width, height);
    // 清空现有子节点
    frame.children.forEach(child => child.remove());
    return { frame, created: false };
  }
  frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.fills = [{ type: "SOLID", color: COLORS.sectionBg }];
  frame.cornerRadius = 12;
  frame.clipsContent = false;
  page.appendChild(frame);
  return { frame, created: true };
}

function createText(parent, content, x, y, fontSize, color, fontWeight, width) {
  const text = figma.createText();
  text.x = x;
  text.y = y;
  text.characters = content;
  text.fontSize = fontSize;
  text.fills = [{ type: "SOLID", color: color }];
  if (width) text.textAutoResize = "WIDTH_AND_HEIGHT";
  parent.appendChild(text);
  return text;
}

function createMultilineText(parent, lines, x, y, fontSize, color, lineHeight, fontWeight) {
  const text = figma.createText();
  text.x = x;
  text.y = y;
  text.fontSize = fontSize;
  text.fills = [{ type: "SOLID", color: color }];
  text.lineHeight = { value: lineHeight, unit: "PIXELS" };
  parent.appendChild(text);
  // 逐行设置
  text.characters = lines.join("\n");
  return text;
}

// ============ 主函数 ============
async function main() {
  // 加载字体
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  const stats = {
    page_created: false,
    page_updated: false,
    sections_created: [],
    sections_updated: [],
    frames_created: [],
    frames_updated: [],
    skipped: [],
    warnings: []
  };

  // 1. 创建或更新 Page
  let page = figma.root.children.find(p => p.name === PLAN.page_name);
  if (page) {
    stats.page_updated = true;
    // 清空 page 下所有顶层节点
    page.children.forEach(child => child.remove());
  } else {
    page = figma.createPage();
    page.name = PLAN.page_name;
    stats.page_created = true;
  }
  figma.currentPage = page;

  // 2. 创建 4 个 Section Frame
  const sectionLayouts = [
    { name: "00 需求概览", x: 0, y: 0, w: 1200, h: 700 },
    { name: "01 交互流程总览", x: 0, y: 800, w: 1200, h: 900 },
    { name: "02 页面状态", x: 0, y: 1800, w: 1400, h: 3800 },
    { name: "03 状态说明", x: 0, y: 5700, w: 1200, h: 1200 }
  ];

  const sectionFrames = {};
  for (const layout of sectionLayouts) {
    const result = createSectionFrame(page, layout.name, layout.x, layout.y, layout.w, layout.h);
    sectionFrames[layout.name] = result.frame;
    if (result.created) {
      stats.sections_created.push(layout.name);
    } else {
      stats.sections_updated.push(layout.name);
    }
  }

  // 3. 填充「00 需求概览」
  const s00 = sectionFrames["00 需求概览"];
  createText(s00, "00 需求概览", 40, 32, 24, COLORS.textPrimary, "Bold");
  createMultilineText(s00, PLAN.overview, 40, 80, 14, COLORS.textSecondary, 22, "Regular");

  // 4. 填充「01 交互流程总览」
  const s01 = sectionFrames["01 交互流程总览"];
  createText(s01, "01 交互流程总览", 40, 32, 24, COLORS.textPrimary, "Bold");

  let flowY = 80;
  for (const flow of PLAN.flows) {
    // 流程标题
    createText(s01, flow.id + " " + flow.name + "（" + flow.type + "）", 40, flowY, 16, COLORS.textBrand, "Semi Bold");
    flowY += 28;
    // 起点
    createText(s01, "起点：" + flow.start, 60, flowY, 13, COLORS.textSecondary, "Regular");
    flowY += 22;
    // 终点
    createText(s01, "终点：" + flow.end, 60, flowY, 13, COLORS.textSecondary, "Regular");
    flowY += 22;
    // 分隔线
    const line = figma.createRectangle();
    line.x = 40;
    line.y = flowY;
    line.resize(1120, 1);
    line.fills = [{ type: "SOLID", color: COLORS.border }];
    s01.appendChild(line);
    flowY += 20;
  }

  // 5. 填充「02 页面状态」（9 个 Frame，3×3 网格）
  const s02 = sectionFrames["02 页面状态"];
  createText(s02, "02 页面状态", 40, 32, 24, COLORS.textPrimary, "Bold");

  const frameWidth = 420;
  const frameHeight = 1120;
  const colSpacing = 30;
  const rowSpacing = 30;
  const gridStartX = 40;
  const gridStartY = 80;

  for (let i = 0; i < PLAN.states.length; i++) {
    const state = PLAN.states[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const fx = gridStartX + col * (frameWidth + colSpacing);
    const fy = gridStartY + row * (frameHeight + rowSpacing);

    // 检查是否已存在同名 Frame（在 s02 下查找）
    let stateFrame = findNodeByName(s02, state.frame);
    if (stateFrame) {
      // 更新位置和尺寸，清空子节点
      stateFrame.x = fx;
      stateFrame.y = fy;
      stateFrame.resize(frameWidth, frameHeight);
      stateFrame.children.forEach(child => child.remove());
      stats.frames_updated.push(state.frame);
    } else {
      stateFrame = figma.createFrame();
      stateFrame.name = state.frame;
      stateFrame.x = fx;
      stateFrame.y = fy;
      stateFrame.resize(frameWidth, frameHeight);
      stateFrame.fills = [{ type: "SOLID", color: COLORS.frameBg }];
      stateFrame.cornerRadius = 8;
      stateFrame.clipsContent = true;
      s02.appendChild(stateFrame);
      stats.frames_created.push(state.frame);
    }

    // Frame 内部布局
    // 5.1 顶部标题区
    const headerBg = figma.createRectangle();
    headerBg.x = 0;
    headerBg.y = 0;
    headerBg.resize(frameWidth, 48);
    headerBg.fills = [{ type: "SOLID", color: COLORS.frameHeaderBg }];
    headerBg.cornerRadius = 8;
    stateFrame.appendChild(headerBg);

    createText(stateFrame, state.frame, 16, 14, 12, COLORS.textPrimary, "Bold");

    // 5.2 状态标签
    const labelBg = figma.createRectangle();
    labelBg.x = 16;
    labelBg.y = 60;
    labelBg.resize(80, 24);
    labelBg.fills = [{ type: "SOLID", color: COLORS.labelBg }];
    labelBg.cornerRadius = 4;
    stateFrame.appendChild(labelBg);
    createText(stateFrame, state.flow + " · " + state.screen, 20, 65, 10, COLORS.textBrand, "Medium");

    createText(stateFrame, "状态名称：" + state.name, 16, 96, 14, COLORS.textPrimary, "Semi Bold");

    // 5.3 模拟预览区
    const mockup = figma.createFrame();
    mockup.x = 16;
    mockup.y = 124;
    mockup.resize(frameWidth - 32, 400);
    mockup.fills = [{ type: "SOLID", color: COLORS.mockupBg }];
    mockup.cornerRadius = 8;
    stateFrame.appendChild(mockup);

    createText(mockup, "（状态预览区域）", 20, 20, 13, COLORS.textSecondary, "Regular");
    createText(mockup, state.name, 20, 48, 16, COLORS.textPrimary, "Medium");
    createMultilineText(mockup, state.visual.split("，").slice(0, 4), 20, 80, 12, COLORS.textSecondary, 18, "Regular");

    // 5.4 说明区域
    const annotY = 540;
    createText(stateFrame, "— 交互说明 —", 16, annotY, 12, COLORS.textSecondary, "Medium");

    const annotItems = [
      { label: "触发条件", value: state.trigger },
      { label: "页面变化", value: state.visual },
      { label: "数据变化", value: state.data },
      { label: "下一步动作", value: state.next },
      { label: "边界情况", value: state.edge }
    ];

    let itemY = annotY + 28;
    for (const item of annotItems) {
      // 标签
      createText(stateFrame, item.label, 16, itemY, 11, COLORS.textBrand, "Semi Bold");
      itemY += 18;
      // 值（自动换行处理：按宽度截断）
      const valueLines = wrapText(item.value, 38);
      createMultilineText(stateFrame, valueLines, 16, itemY, 11, COLORS.textPrimary, 16, "Regular");
      itemY += valueLines.length * 16 + 12;
    }
  }

  // 6. 填充「03 状态说明」
  const s03 = sectionFrames["03 状态说明"];
  createText(s03, "03 状态说明", 40, 32, 24, COLORS.textPrimary, "Bold");

  const stateSummary = [
    "S01 列表默认态 → 展示 3 条仓库卡片与摘要统计",
    "S02 空状态 → 无仓库时展示空状态组件与新增引导",
    "S03 操作菜单展开态 → 某张卡片下方展开编辑/删除菜单",
    "S04 新增仓库初始态 → 空表单含默认值，标题「新增仓库」",
    "S05 编辑已有数据态 → 表单回填已有仓库数据，标题「编辑仓库」",
    "S06 表单校验失败态 → 保存时必填项缺失，toast 提示具体原因",
    "S07 保存成功态 → 保存后返回列表，toast 提示成功并回填",
    "S08 删除确认态 → 弹出删除确认 dialog，等待用户选择",
    "S09 删除完成态 → 确认删除后列表移除该项，toast 提示已删除",
    "",
    "Frame 命名格式：mvp001-{flow_id}-{state_id}-{screen_name}",
    "每个 Frame 含 6 项说明：状态名称/触发条件/页面变化/数据变化/下一步动作/边界情况"
  ];
  createMultilineText(s03, stateSummary, 40, 80, 13, COLORS.textSecondary, 20, "Regular");

  // 7. 输出统计
  const message = "写入完成！\n" +
    "页面：" + (stats.page_created ? "新建" : "更新") + " " + PLAN.page_name + "\n" +
    "Section：" + stats.sections_created.length + " 新建，" + stats.sections_updated.length + " 更新\n" +
    "Frame：" + stats.frames_created.length + " 新建，" + stats.frames_updated.length + " 更新\n" +
    "跳过：" + stats.skipped.length + "，警告：" + stats.warnings.length;

  figma.notify(message, { timeout: 8000 });

  // 将 stats 存到 figma.root 上供后续读取（通过 pluginData）
  figma.root.setPluginData("mvp001_stats", JSON.stringify(stats));

  figma.closePlugin();
}

// 简单文本换行
function wrapText(text, maxChars) {
  if (!text) return [""];
  const lines = [];
  let current = "";
  for (let i = 0; i < text.length; i++) {
    current += text[i];
    if (current.length >= maxChars && (text[i] === "，" || text[i] === "。" || text[i] === "；" || text[i] === " " || text[i] === "、")) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

main().catch(err => {
  figma.notify("写入失败：" + err.message, { error: true, timeout: 10000 });
  figma.closePlugin();
});
