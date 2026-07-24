(function registerWegoPrototypeDb() {
  var imageBase = './lib/assets/image/';
  var avatarBase = imageBase + 'avatar/';

  function clothingDir(id) {
    return imageBase + 'clothing/clothing_' + id + '/';
  }

  function asset(id, dirId, primaryImage, productType, visualTags, colorTags, seasonTags, galleryPattern, confidence, imageCount) {
    return {
      asset_id: id,
      category: 'clothing',
      subcategory: 'womenswear',
      product_type: productType,
      source_dir: clothingDir(dirId),
      image_count: imageCount,
      primary_image: clothingDir(dirId) + primaryImage,
      gallery_pattern: galleryPattern,
      confidence: confidence,
      visual_tags: visualTags,
      color_tags: colorTags,
      season_tags: seasonTags
    };
  }

  function product(id, assetId, title, price, attributes, specs, sellingPoints, detailSections, feedText) {
    var linkedAsset = assets.find(function (item) { return item.asset_id === assetId; });
    return {
      product_id: id,
      asset_id: assetId,
      category: 'clothing',
      title: title,
      name: title,
      price: price,
      currency: 'CNY',
      unit: '件',
      attributes: attributes,
      specs: specs,
      sku_options: specs.sizes.concat([specs.fit]),
      selling_points: sellingPoints,
      detail_sections: detailSections,
      feed_text: feedText,
      image_list: linkedAsset ? [linkedAsset.primary_image] : []
    };
  }

  function media(id, type, src, duration) {
    var item = { media_id: id, media_type: type, poster_or_src: src };
    if (duration) item.duration_label = duration;
    return item;
  }

  function productById(id) {
    return products.find(function (item) { return item.product_id === id; });
  }

  function assetImage(productId) {
    var item = productById(productId);
    var linkedAsset = item && assets.find(function (assetItem) { return assetItem.asset_id === item.asset_id; });
    return linkedAsset ? linkedAsset.primary_image : '';
  }

  var assets = [
    asset('clothing-ruffle-square-neck-top', 1, 'clothing_1_1.jpg', '方领上衣', ['荷叶边', '方领', '短袖', '上身图'], ['白色', '浅蓝'], ['春夏'], 'outfit-set', 'high', 14),
    asset('clothing-rose-short-sleeve-blazer', 2, 'clothing_2_1.jpg.jpg', '短袖西装外套', ['短袖西装', '玫红色', '外套', '通勤'], ['玫红'], ['春夏'], 'single-product', 'high', 10),
    asset('clothing-blue-plaid-overshirt', 3, '1663740989357_27184.jpg', '格纹衬衫', ['蓝色格纹', '宽松衬衫', '叠穿'], ['蓝色', '白色'], ['春秋'], 'outfit-set', 'high', 18),
    asset('clothing-khaki-workwear-set', 4, '1663741015639_25492.jpg', '卡其工装套装', ['卡其', '工装', '衬衫', '长裤', '细节图'], ['卡其'], ['春秋'], 'mixed-reference', 'medium', 13),
    asset('clothing-red-contrast-cardigan', 5, '1663741055068_1251.jpg', '撞色短外套', ['红色外套', '撞色袖口', '金色扣点', '短款'], ['红色', '白色'], ['秋冬'], 'single-product', 'high', 18),
    asset('clothing-navy-short-sleeve-blazer', 6, 'img_1708defc_20240216_i1708092817_2182_1.jpg.jpg', '短袖西装外套', ['藏蓝西装', '短袖', '通勤', '单扣'], ['藏蓝'], ['春夏'], 'single-product', 'high', 10),
    asset('clothing-black-gold-button-blazer', 7, '1663741042720_27285.jpg', '金扣西装外套', ['黑色西装', '金色纽扣', '袖口细节'], ['黑色', '金色'], ['秋冬'], 'single-product', 'high', 9),
    asset('clothing-oatmeal-linen-blazer', 8, 'img_1708defc_20240216_i1708092817_8695_6.jpg.jpg', '亚麻感短袖西装', ['米杏外套', '短袖西装', '连衣裙搭配'], ['米杏', '白色'], ['春夏'], 'outfit-set', 'high', 9),
    asset('clothing-black-sporty-sweatshirt-set', 9, '1663740558494_61057.jpg', '运动感宽松上衣', ['黑色宽松上衣', '短装搭配', '街头感'], ['黑色'], ['春秋'], 'outfit-set', 'medium', 9),
    asset('clothing-basic-knit-tops', 10, '1663740458796_1630.jpg', '基础针织上衣', ['针织上衣', '多色', '基础款', '通勤'], ['白色', '灰色', '绿色', '咖色'], ['春秋'], 'multi-color', 'high', 9),
    asset('clothing-pink-cotton-shirt', 11, '1663741015635_49035.jpg', '粉色休闲衬衫', ['粉色衬衫', '休闲', '叠穿'], ['粉色'], ['春夏'], 'outfit-set', 'high', 5),
    asset('clothing-houndstooth-knit-set', 12, '1663741493015_827.jpg', '千鸟格针织套装', ['千鸟格', '针织', '短款上衣', '半裙'], ['黑色', '白色'], ['春秋'], 'outfit-set', 'medium', 8),
    asset('clothing-colorful-graffiti-denim-set', 13, '1664276865081_87837.jpg', '彩色涂鸦套装', ['彩色涂鸦', '牛仔感', '套装', '个性'], ['彩色', '绿色', '紫色'], ['春秋'], 'outfit-set', 'high', 9),
    asset('clothing-green-plaid-set', 14, '1664276960204_98573.jpg', '绿色格纹套装', ['绿色格纹', '短外套', '半裙', '套装'], ['绿色', '黑色'], ['春秋'], 'outfit-set', 'high', 9),
    asset('clothing-beige-logo-pullover', 15, '1664277250601_83668.jpg', '米色宽松卫衣', ['字母卫衣', '宽松', '街头', '短裤搭配'], ['米色', '黑色'], ['秋冬'], 'outfit-set', 'high', 9)
  ];

  var products = [
    product('prod-clothing-001', 'clothing-ruffle-square-neck-top', '荷叶边方领短袖上衣', 139, { color: ['白色'], style: ['轻甜', '清爽'], silhouette: '合身短款', season: '春夏', material_note: '轻薄梭织感' }, { sizes: ['S', 'M', 'L'], fit: '正常码', care: '建议轻柔洗涤' }, ['方领修饰颈部线条', '荷叶边增加层次', '适合搭配牛仔下装'], ['适合日常约会和周末出行。', '重点展示领口、袖口和上身比例。'], '方领和荷叶边让基础白上衣更有轻盈感，搭浅色牛仔裤就能完成清爽出门造型。'),
    product('prod-clothing-002', 'clothing-rose-short-sleeve-blazer', '玫红短袖西装外套', 199, { color: ['玫红'], style: ['通勤', '亮色'], silhouette: '宽松短袖', season: '春夏', material_note: '挺括外套感' }, { sizes: ['S', 'M', 'L'], fit: '略宽松', care: '深浅色分开洗护' }, ['亮色提升识别度', '短袖结构更适合夏季', '可叠搭背心或连衣裙'], ['适合通勤和聚会场景。', '主图优先选择上身或挂拍图。'], '玫红短袖西装把通勤外套做得更亮眼，内搭背心或连衣裙都能撑起利落层次。'),
    product('prod-clothing-003', 'clothing-blue-plaid-overshirt', '蓝色格纹宽松衬衫', 159, { color: ['蓝色', '白色'], style: ['休闲', '学院'], silhouette: '宽松长袖', season: '春秋', material_note: '衬衫面料感' }, { sizes: ['M', 'L', 'XL'], fit: '宽松', care: '低温熨烫' }, ['宽松可外穿', '格纹识别度高', '适合叠穿'], ['可作为外套或单穿衬衫。', '动态文案可强调周末和日常搭配。'], '蓝色格纹衬衫自带休闲感，宽松版型适合当外套叠穿，日常和周末都好搭。'),
    product('prod-clothing-004', 'clothing-khaki-workwear-set', '卡其休闲工装衬衫长裤组', 229, { color: ['卡其'], style: ['工装', '休闲'], silhouette: '直线轮廓', season: '春秋', material_note: '偏挺括' }, { sizes: ['S', 'M', 'L'], fit: '正常码', care: '按浅色衣物洗护' }, ['卡其色耐看', '细节图丰富', '适合成套或拆分搭配'], ['目录含上身、裤装和水洗标等混合参考。', '落商品页前需要确认主售卖单品。'], '卡其色工装感单品强调干净轮廓，近景细节适合补充面料、走线和穿搭质感。'),
    product('prod-clothing-005', 'clothing-red-contrast-cardigan', '红色撞色短外套', 239, { color: ['红色', '白色'], style: ['复古', '精致'], silhouette: '短款', season: '秋冬', material_note: '针织或毛呢感' }, { sizes: ['S', 'M', 'L'], fit: '合身', care: '建议悬挂收纳' }, ['红白撞色醒目', '金色扣点增强细节', '适合节日主题'], ['适合作为活动款或上新主推。', '详情页可突出袖口和扣点细节。'], '红色短外套配白色翻边和金色扣点，适合做节日、约会或轻复古主题动态。'),
    product('prod-clothing-006', 'clothing-navy-short-sleeve-blazer', '藏蓝短袖西装外套', 209, { color: ['藏蓝'], style: ['通勤', '简洁'], silhouette: '短袖宽松', season: '春夏', material_note: '挺括西装感' }, { sizes: ['S', 'M', 'L'], fit: '略宽松', care: '建议挂烫整理' }, ['保留正式感', '短袖更轻松', '适合半正式场合'], ['可搭条纹内搭或浅色裤装。', '首页文案避免写职业限定。'], '藏蓝短袖西装保留正式感，又比长袖外套更轻松，适合夏季通勤和半正式场合。'),
    product('prod-clothing-007', 'clothing-black-gold-button-blazer', '黑色金扣西装外套', 269, { color: ['黑色', '金色'], style: ['利落', '精致'], silhouette: '短款西装', season: '秋冬', material_note: '挺括外套感' }, { sizes: ['S', 'M', 'L'], fit: '合身', care: '避免重压金属扣' }, ['金扣细节突出', '黑色易搭', '适合精致通勤'], ['详情页优先展示扣子和袖口。', '文案重点是轮廓和细节。'], '黑色西装配金色扣饰，重点突出肩线和袖口细节，适合表达精致、利落的穿搭风格。'),
    product('prod-clothing-008', 'clothing-oatmeal-linen-blazer', '米杏色亚麻感短袖西装', 219, { color: ['米杏', '白色'], style: ['柔和', '通勤', '度假'], silhouette: '宽松短袖', season: '春夏', material_note: '亚麻肌理感' }, { sizes: ['S', 'M', 'L'], fit: '宽松', care: '避免长时间暴晒' }, ['颜色柔和', '适合叠穿裙装', '轻通勤场景友好'], ['上身图适合动态卡片。', '可和白裙素材组成笔记。'], '米杏色外套和白色裙装组合更柔和，适合通勤、约会和轻度假场景。'),
    product('prod-clothing-009', 'clothing-black-sporty-sweatshirt-set', '黑色运动感宽松上衣', 189, { color: ['黑色'], style: ['街头', '运动'], silhouette: '宽松中长款', season: '春秋', material_note: '卫衣或运动面料感' }, { sizes: ['M', 'L', 'XL'], fit: '宽松', care: '反面洗涤' }, ['黑色显利落', '适合短装搭配', '街头感强'], ['目录以穿搭图为主。', '商品页需要补充清晰单品图时再上新素材。'], '黑色宽松上衣搭短装和靴子，整体更街头，适合做酷感、轻运动主题内容。'),
    product('prod-clothing-010', 'clothing-basic-knit-tops', '基础多色针织上衣', 129, { color: ['白色', '灰色', '绿色', '咖色'], style: ['基础', '通勤'], silhouette: '合身长袖', season: '春秋', material_note: '针织纹理' }, { sizes: ['S', 'M', 'L'], fit: '正常码', care: '平铺晾干' }, ['多色可选', '基础百搭', '适合胶囊衣橱'], ['适合做多色上新动态。', '商品详情可展示色卡式图片。'], '基础针织上衣用白、灰、绿、咖等中性色覆盖多种搭配，适合做一衣多色和日常胶囊衣橱内容。'),
    product('prod-clothing-011', 'clothing-pink-cotton-shirt', '粉色休闲衬衫', 149, { color: ['粉色'], style: ['休闲', '校园'], silhouette: '宽松长袖', season: '春夏', material_note: '棉感衬衫' }, { sizes: ['S', 'M', 'L'], fit: '宽松', care: '低温熨烫' }, ['颜色明快', '可外穿叠搭', '日常适配度高'], ['动态可突出粉色带来的明亮感。', '避免写真实品牌。'], '粉色衬衫让基础叠穿更明快，可以敞开当薄外套，也能单穿做轻松校园感。'),
    product('prod-clothing-012', 'clothing-houndstooth-knit-set', '黑白千鸟格针织套装', 259, { color: ['黑色', '白色'], style: ['复古', '甜酷'], silhouette: '短款上衣配半裙', season: '春秋', material_note: '针织纹理' }, { sizes: ['S', 'M', 'L'], fit: '合身', care: '避免勾丝' }, ['千鸟格识别度高', '成套搭配省心', '适合拍照场景'], ['图片含公开街拍感素材，业务接入前确认授权。', '文案不出现人物姓名。'], '黑白千鸟格有强识别度，短款针织和半裙组合适合突出复古、甜酷和成套搭配。'),
    product('prod-clothing-013', 'clothing-colorful-graffiti-denim-set', '彩色涂鸦牛仔套装', 299, { color: ['彩色', '绿色', '紫色'], style: ['个性', '活动款'], silhouette: '宽松套装', season: '春秋', material_note: '牛仔夹克感' }, { sizes: ['S', 'M', 'L'], fit: '宽松', care: '深浅色分开洗护' }, ['色彩醒目', '成套造型完整', '适合上新主推'], ['适合活动款首屏卡片。', '详情页可展示多角度上身。'], '高饱和彩色涂鸦让整套造型很醒目，适合上新、活动款和个性穿搭主题。'),
    product('prod-clothing-014', 'clothing-green-plaid-set', '绿色格纹短外套半裙套装', 279, { color: ['绿色', '黑色'], style: ['年轻', '个性'], silhouette: '短外套配半裙', season: '春秋', material_note: '格纹梭织感' }, { sizes: ['S', 'M', 'L'], fit: '合身', care: '低温熨烫' }, ['绿色格纹吸睛', '套装比例清晰', '适合拍照内容'], ['动态卡片适合用全身图。', '可作为绿色主题搭配。'], '绿色格纹套装视觉冲击强，短外套和半裙组合适合突出年轻、个性和拍照出片。'),
    product('prod-clothing-015', 'clothing-beige-logo-pullover', '米色宽松字母卫衣', 169, { color: ['米色', '黑色'], style: ['街头', '舒适'], silhouette: '宽松套头', season: '秋冬', material_note: '卫衣感' }, { sizes: ['M', 'L', 'XL'], fit: '宽松', care: '反面洗涤' }, ['宽松舒适', '字母图案有识别度', '适合短裤和靴子搭配'], ['适合秋季轻外套内容。', '文案避免暗示真实品牌。'], '米色宽松卫衣搭黑色短裤和厚底靴，适合做舒适、街头和秋季轻外套内容。')
  ];

  function user(id, merchantName, avatarFile, groupId, pyInitial, statuses, productTotal, newCount, merchantType, region, categories, isSelf) {
    return {
      user_id: id,
      merchant_id: 'merchant-' + id.replace(/^pub-/, '').replace(/^user-/, ''),
      merchant_name: merchantName,
      display_name: merchantName,
      avatar: avatarBase + avatarFile,
      account_type: 'merchant',
      merchant_type: merchantType,
      publisher_type: 'shop',
      group_id: groupId,
      py_initial: pyInitial,
      shop_statuses: statuses,
      publisher_statuses: statuses,
      product_total: productTotal,
      new_count: newCount,
      region: region,
      main_categories: categories,
      is_self: Boolean(isSelf)
    };
  }

  var users = [
    user('user-self', '微购优选商行', 'avatar_083.jpg', 'g-self', 'W', ['verified', 'starred'], 128, 6, '综合买手商家', '杭州', ['服装', '鞋包'], true),
    user('pub-01', '云朵服饰商行', 'avatar_001.jpg', 'g-key', 'Y', ['live', 'verified'], 86, 5, '女装商家', '广州', ['服装'], false),
    user('pub-02', '青禾女装档口', 'avatar_008.jpg', 'g-key', 'Q', ['new', 'starred'], 64, 8, '女装档口', '广州十三行', ['服装'], false),
    user('pub-03', '漫川生活集合店', 'avatar_016.jpg', 'g-coop', 'M', ['new', 'verified'], 72, 4, '生活方式集合店', '杭州', ['服装', '配饰'], false),
    user('pub-04', '拾光买手店', 'avatar_024.jpg', 'g-key', 'S', ['starred', 'verified'], 58, 3, '买手店', '上海', ['服装', '包袋'], false),
    user('pub-05', '微光面料商行', 'avatar_032.jpg', 'g-follow', 'W', ['new', 'starred'], 41, 7, '面料选品商家', '绍兴柯桥', ['服装'], false),
    user('pub-06', '棉岛基础款服饰店', 'avatar_040.jpg', 'g-coop', 'M', ['verified'], 93, 2, '基础款供应商', '佛山', ['服装'], false),
    user('pub-07', '白茶手作服饰店', 'avatar_048.jpg', 'g-key', 'B', ['live', 'new'], 37, 6, '原创手作服饰', '苏州', ['服装', '配饰'], false),
    user('pub-08', '森屿童装铺', 'avatar_056.jpg', 'g-follow', 'S', ['starred'], 55, 1, '童装商家', '湖州织里', ['服装'], false),
    user('pub-09', '云间集女装店', 'avatar_064.jpg', 'g-coop', 'Y', ['verified'], 77, 0, '女装集合店', '成都', ['服装'], false),
    user('pub-10', '朝晚穿搭服饰店', 'avatar_072.jpg', 'g-follow', 'Z', ['new'], 46, 5, '穿搭内容商家', '武汉', ['服装'], false),
    user('pub-11', '野橘原创女装店', 'avatar_011.jpg', 'g-key', 'Y', ['new', 'verified'], 39, 4, '原创女装商家', '厦门', ['服装'], false),
    user('pub-12', '南风衣局服饰店', 'avatar_012.jpg', 'g-coop', 'N', ['starred'], 68, 2, '外套品类商家', '广州', ['服装'], false),
    user('pub-13', '禾木鞋履店', 'avatar_013.jpg', 'g-follow', 'H', ['verified'], 52, 3, '鞋履商家', '温州', ['鞋子'], false),
    user('pub-14', '麦田包袋集合店', 'avatar_014.jpg', 'g-coop', 'M', ['new'], 31, 4, '包袋集合店', '广州', ['包袋'], false),
    user('pub-15', '岚山配饰铺', 'avatar_015.jpg', 'g-follow', 'L', ['starred'], 44, 1, '配饰商家', '义乌', ['配饰'], false)
  ];

  var friendGroups = [
    { group_id: 'g-key', group_name: '重点商家', description: '高频合作或重点关注的商家账号', sort_order: 1 },
    { group_id: 'g-coop', group_name: '常合作商家', description: '稳定供货、互转或日常协作的商家账号', sort_order: 2 },
    { group_id: 'g-follow', group_name: '待跟进商家', description: '已添加但仍需确认合作关系的商家账号', sort_order: 3 }
  ];

  var currentUser = users.find(function (item) { return item.is_self; }) || users[0];

  function publisherFromUser(item) {
    return {
      publisher_id: item.user_id,
      publisher_name: item.merchant_name,
      publisher_avatar: item.avatar,
      publisher_type: 'shop',
      publisher_statuses: item.publisher_statuses,
      merchant_id: item.merchant_id,
      merchant_type: item.merchant_type,
      region: item.region,
      main_categories: item.main_categories
    };
  }

  function friendFromUser(item) {
    return {
      friend_id: item.user_id,
      user_id: item.user_id,
      merchant_id: item.merchant_id,
      nickname: item.merchant_name,
      merchant_name: item.merchant_name,
      display_name: item.display_name,
      avatar: item.avatar,
      py_initial: item.py_initial,
      group_id: item.group_id,
      new_count: item.new_count,
      product_total: item.product_total,
      merchant_type: item.merchant_type,
      region: item.region,
      main_categories: item.main_categories,
      account_type: item.account_type,
      relation_type: 'merchant_friend',
      relation_status: 'active'
    };
  }

  var publishers = users.filter(function (item) { return !item.is_self; }).map(publisherFromUser);
  var friends = users.filter(function (item) { return !item.is_self; }).map(friendFromUser);

  var dynamics = [
    { dynamic_id: 'dyn-01', publisher_id: 'pub-01', published_at: '刚刚', published_order: 15, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-001').feed_text, media_list: [media('m-01', 'video', assetImage('prod-clothing-001'), '00:18')], related_product_ids: ['prod-clothing-001'] },
    { dynamic_id: 'dyn-02', publisher_id: 'pub-02', published_at: '8 分钟前', published_order: 14, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-002').feed_text, media_list: [media('m-02', 'image', assetImage('prod-clothing-002'))], related_product_ids: ['prod-clothing-002'] },
    { dynamic_id: 'dyn-03', publisher_id: 'pub-03', published_at: '20 分钟前', published_order: 13, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-003').feed_text, media_list: [media('m-03', 'image', assetImage('prod-clothing-003'))], related_product_ids: ['prod-clothing-003'] },
    { dynamic_id: 'dyn-04', publisher_id: 'pub-04', published_at: '今天 10:30', published_order: 12, content_type: 'note', category_id: 'clothing', text_content: productById('prod-clothing-004').feed_text, media_list: [media('m-04', 'video', assetImage('prod-clothing-004'), '00:34')], related_product_ids: ['prod-clothing-004'] },
    { dynamic_id: 'dyn-05', publisher_id: 'pub-02', published_at: '今天 09:15', published_order: 11, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-005').feed_text, media_list: [media('m-05', 'image', assetImage('prod-clothing-005'))], related_product_ids: ['prod-clothing-005'] },
    { dynamic_id: 'dyn-06', publisher_id: 'pub-01', published_at: '昨天 18:40', published_order: 10, content_type: 'note', category_id: 'clothing', text_content: productById('prod-clothing-006').feed_text, media_list: [media('m-06', 'image', assetImage('prod-clothing-006'))], related_product_ids: ['prod-clothing-006'] },
    { dynamic_id: 'dyn-07', publisher_id: 'pub-04', published_at: '昨天', published_order: 9, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-007').feed_text, media_list: [media('m-07', 'video', assetImage('prod-clothing-007'), '00:16')], related_product_ids: ['prod-clothing-007'] },
    { dynamic_id: 'dyn-08', publisher_id: 'pub-03', published_at: '2 天前', published_order: 8, content_type: 'note', category_id: 'clothing', text_content: productById('prod-clothing-008').feed_text, media_list: [media('m-08', 'image', assetImage('prod-clothing-008'))], related_product_ids: ['prod-clothing-008'] },
    { dynamic_id: 'dyn-09', publisher_id: 'pub-01', published_at: '3 天前', published_order: 7, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-009').feed_text, media_list: [media('m-09', 'image', assetImage('prod-clothing-009'))], related_product_ids: ['prod-clothing-009'] },
    { dynamic_id: 'dyn-10', publisher_id: 'pub-02', published_at: '本周一', published_order: 6, content_type: 'note', category_id: 'clothing', text_content: productById('prod-clothing-010').feed_text, media_list: [media('m-10', 'image', assetImage('prod-clothing-010'))], related_product_ids: ['prod-clothing-010'] },
    { dynamic_id: 'dyn-11', publisher_id: 'pub-07', published_at: '上周日', published_order: 5, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-013').feed_text, media_list: [media('m-11', 'image', assetImage('prod-clothing-013'))], related_product_ids: ['prod-clothing-013'] },
    { dynamic_id: 'dyn-12', publisher_id: 'pub-05', published_at: '上周六', published_order: 4, content_type: 'product', category_id: 'clothing', text_content: productById('prod-clothing-014').feed_text, media_list: [media('m-12', 'image', assetImage('prod-clothing-014'))], related_product_ids: ['prod-clothing-014'] }
  ];

  window.WEGO_PROTOTYPE_DB = {
    schema_version: 1,
    categories: {
      clothing: { label: '服装', subcategories: ['womenswear', 'tops', 'outerwear', 'sets', 'knitwear'] },
      shoes: { label: '鞋子', subcategories: ['sneakers', 'loafers', 'sandals', 'boots', 'flats'] },
      bags: { label: '包袋', subcategories: ['tote', 'crossbody', 'shoulder', 'backpack'] },
      accessories: { label: '配饰', subcategories: ['jewelry', 'hat', 'scarf', 'belt'] },
      home: { label: '家居', subcategories: ['textile', 'decor', 'storage'] },
      beauty: { label: '美妆', subcategories: ['skincare', 'makeup', 'fragrance'] },
      other: { label: '其他', subcategories: [] }
    },
    assets: assets,
    products: products,
    current_user_id: currentUser.user_id,
    currentUser: currentUser,
    users: users,
    friendGroups: friendGroups,
    friends: friends,
    publishers: publishers,
    dynamics: dynamics,
    dynamicCopy: products.map(function (item) {
      return {
        copy_id: 'copy-' + item.product_id,
        product_id: item.product_id,
        asset_id: item.asset_id,
        feed_text: item.feed_text,
        detail_intro: item.detail_sections[0],
        search_keywords: item.selling_points.concat([item.title])
      };
    })
  };
})();
