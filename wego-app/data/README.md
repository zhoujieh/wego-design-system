# 微购原型统一数据资源

`prototype-db.js` 是所有交互原型共用的本地静态数据库。新增或修改业务场景时，优先从这里取商品、素材、发布者和文案，不在场景 `scene.js` 里临时编商品资料。

## 维护位置

- 统一数据库：`wego-app/data/prototype-db.js`
- 图片资源：`wego-app/lib/assets/image/{category}/...`
- 业务迭代里的文案说明：仅作为某次识别、供稿或范围确认记录，不作为运行时权威数据源

## 数据分层

- `categories`：一级品类与子类定义。以后鞋子、包袋等品类先在这里登记。
- `assets`：图片素材资产。负责说明图片目录、主图、图组性质和视觉标签。
- `products`：完整商品信息。负责商品名称、价格、属性、规格、卖点、详情说明和关联素材。
- `publishers`：原型用发布者、店铺或个人账号。
- `dynamicCopy`：面向动态卡片和详情页的运营文案，必须绑定 `product_id` 或 `asset_id`。

## 规则

- 场景只引用 `product_id`、`asset_id`、`publisher_id`，不得按图片数组下标拼文案。
- 商品文案必须和第一张封面所属资产一致。
- 不写真实品牌名、真实材质成分、库存、折扣、明星姓名和功效承诺，除非业务侧明确提供。
- 新增鞋子等品类时，先补 `categories`，再补 `assets` 和 `products`，最后让场景消费。
- 本地直接打开 `index.html` 时不能依赖 `fetch()` 读取 JSON；统一数据库用 `<script>` 加载并挂到 `window.WEGO_PROTOTYPE_DB`。
