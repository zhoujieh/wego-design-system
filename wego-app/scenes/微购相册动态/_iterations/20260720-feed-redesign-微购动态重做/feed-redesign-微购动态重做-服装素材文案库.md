# 微购动态服装素材文案库

> 用途：给业务侧维护动态页、商品详情和后续品类素材时使用。以下商品识别来自当前本地图片资源的人工视觉判断，不能当作真实品牌、真实材质或真实库存事实；正式业务接入时以商家供稿为准。

## 数据类型

```ts
type ProductCategory = "clothing" | "shoes" | "bags" | "accessories" | "home" | "beauty" | "other";

type MediaAssetKind = "image" | "video";

type ContentAsset = {
  asset_id: string;
  category: ProductCategory;
  subcategory: string;
  product_type: string;
  source_dir: string;
  image_count: number;
  primary_image: string;
  gallery_pattern: "single-product" | "outfit-set" | "multi-color" | "mixed-reference";
  confidence: "high" | "medium" | "low";
  visual_tags: string[];
  color_tags: string[];
  season_tags: string[];
};

type ContentAssetCopy = {
  asset_id: string;
  display_name: string;
  feed_text: string;
  detail_intro: string;
  selling_points: string[];
  search_keywords: string[];
  usage_notes: string[];
};
```

### 字段约定

- `asset_id` 使用稳定 kebab-case，新增鞋子等品类时不要复用旧 ID。
- `category` 是一级品类；鞋子新增时使用 `shoes`，并在 `subcategory` 写 `sneakers`、`loafers`、`sandals` 等。
- `product_type` 用业务可读中文名，面向运营筛选和文案管理，不绑定 UI 展示。
- `source_dir` 指向当前素材目录；同一目录下图片应描述同一商品或同一套搭配。
- `gallery_pattern` 标识图片组性质，`mixed-reference` 表示目录里有陈列、上身、细节或多款参考混合，落页面前要人工挑选主图。
- `copy` 不写真实品牌名、真实面料成分、明星姓名、库存、折扣和功效承诺。

## 15 个服装素材

| asset_id | source_dir | 识别商品 | 推荐主图 | 文案 |
| --- | --- | --- | --- | --- |
| `clothing-ruffle-square-neck-top` | `wego-app/lib/assets/image/clothing/clothing_1/` | 白色荷叶边方领上衣，搭浅色牛仔裤 | `clothing_1_1.jpg` | 方领和荷叶边让基础白上衣更有轻盈感，搭浅色牛仔裤就能完成清爽出门造型。 |
| `clothing-rose-short-sleeve-blazer` | `wego-app/lib/assets/image/clothing/clothing_2/` | 玫红短袖西装外套 | `clothing_2_1.jpg.jpg` | 玫红短袖西装把通勤外套做得更亮眼，内搭背心或连衣裙都能撑起利落层次。 |
| `clothing-blue-plaid-overshirt` | `wego-app/lib/assets/image/clothing/clothing_3/` | 蓝色格纹宽松衬衫 | `1663740989357_27184.jpg` | 蓝色格纹衬衫自带休闲感，宽松版型适合当外套叠穿，日常和周末都好搭。 |
| `clothing-khaki-workwear-set` | `wego-app/lib/assets/image/clothing/clothing_4/` | 卡其休闲工装衬衫与长裤素材组 | `1663741015639_25492.jpg` | 卡其色工装感单品强调干净轮廓，近景细节适合补充面料、走线和穿搭质感。 |
| `clothing-red-contrast-cardigan` | `wego-app/lib/assets/image/clothing/clothing_5/` | 红色撞色短外套 | `1663741055068_1251.jpg` | 红色短外套配白色翻边和金色扣点，适合做节日、约会或轻复古主题动态。 |
| `clothing-navy-short-sleeve-blazer` | `wego-app/lib/assets/image/clothing/clothing_6/` | 藏蓝短袖西装外套 | `img_1708defc_20240216_i1708092817_2182_1.jpg.jpg` | 藏蓝短袖西装保留正式感，又比长袖外套更轻松，适合夏季通勤和半正式场合。 |
| `clothing-black-gold-button-blazer` | `wego-app/lib/assets/image/clothing/clothing_7/` | 黑色金扣西装外套 | `1663741042720_27285.jpg` | 黑色西装配金色扣饰，重点突出肩线和袖口细节，适合表达精致、利落的穿搭风格。 |
| `clothing-oatmeal-linen-blazer` | `wego-app/lib/assets/image/clothing/clothing_8/` | 米杏色亚麻感短袖西装外套 | `img_1708defc_20240216_i1708092817_8695_6.jpg.jpg` | 米杏色外套和白色裙装组合更柔和，适合通勤、约会和轻度假场景。 |
| `clothing-black-sporty-sweatshirt-set` | `wego-app/lib/assets/image/clothing/clothing_9/` | 黑色运动感宽松上衣与短装搭配 | `1663740558494_61057.jpg` | 黑色宽松上衣搭短装和靴子，整体更街头，适合做酷感、轻运动主题内容。 |
| `clothing-basic-knit-tops` | `wego-app/lib/assets/image/clothing/clothing_10/` | 基础针织上衣多色素材组 | `1663740458796_1630.jpg` | 基础针织上衣用白、灰、绿、咖等中性色覆盖多种搭配，适合做一衣多色和日常胶囊衣橱内容。 |
| `clothing-pink-cotton-shirt` | `wego-app/lib/assets/image/clothing/clothing_11/` | 粉色休闲衬衫 | `1663741015635_49035.jpg` | 粉色衬衫让基础叠穿更明快，可以敞开当薄外套，也能单穿做轻松校园感。 |
| `clothing-houndstooth-knit-set` | `wego-app/lib/assets/image/clothing/clothing_12/` | 黑白千鸟格针织套装 | `1663741493015_827.jpg` | 黑白千鸟格有强识别度，短款针织和半裙组合适合突出复古、甜酷和成套搭配。 |
| `clothing-colorful-graffiti-denim-set` | `wego-app/lib/assets/image/clothing/clothing_13/` | 彩色涂鸦牛仔套装 | `1664276865081_87837.jpg` | 高饱和彩色涂鸦让整套造型很醒目，适合上新、活动款和个性穿搭主题。 |
| `clothing-green-plaid-set` | `wego-app/lib/assets/image/clothing/clothing_14/` | 绿色格纹短外套与半裙套装 | `1664276960204_98573.jpg` | 绿色格纹套装视觉冲击强，短外套和半裙组合适合突出年轻、个性和拍照出片。 |
| `clothing-beige-logo-pullover` | `wego-app/lib/assets/image/clothing/clothing_15/` | 米色宽松字母卫衣 | `1664277250601_83668.jpg` | 米色宽松卫衣搭黑色短裤和厚底靴，适合做舒适、街头和秋季轻外套内容。 |

## 推荐结构化数据

```json
[
  {
    "asset_id": "clothing-ruffle-square-neck-top",
    "category": "clothing",
    "subcategory": "tops",
    "product_type": "方领上衣",
    "source_dir": "wego-app/lib/assets/image/clothing/clothing_1/",
    "image_count": 14,
    "primary_image": "wego-app/lib/assets/image/clothing/clothing_1/clothing_1_1.jpg",
    "gallery_pattern": "outfit-set",
    "confidence": "high",
    "visual_tags": ["荷叶边", "方领", "短袖", "上身图"],
    "color_tags": ["白色", "浅蓝"],
    "season_tags": ["春夏"],
    "copy": {
      "display_name": "荷叶边方领短袖上衣",
      "feed_text": "方领和荷叶边让基础白上衣更有轻盈感，搭浅色牛仔裤就能完成清爽出门造型。",
      "detail_intro": "适合日常约会和周末出行的轻甜上衣，重点展示领口、袖口和上身比例。",
      "selling_points": ["方领修饰颈部线条", "荷叶边增加层次", "适合搭配牛仔下装"],
      "search_keywords": ["白色上衣", "方领", "荷叶边", "短袖", "牛仔裤搭配"],
      "usage_notes": ["可用于动态卡片、商品详情主图和穿搭笔记"]
    }
  }
]
```

## 后续品类接入

新增鞋子、包袋等品类时复用同一结构：

- 图片目录使用 `wego-app/lib/assets/image/{category}/{asset_id}/` 或现有资源同步规则指定的位置。
- 文案必须先绑定 `asset_id`，再被动态、商品、笔记引用，避免页面里按图片下标拼文案。
- 一个动态可以引用多个 `asset_id`，但首页卡片主文案必须和第一张封面所属 `asset_id` 一致。
- 对识别不确定或目录混合多款商品的素材，`confidence` 标为 `medium` 或 `low`，落业务页面前人工确认主商品。
