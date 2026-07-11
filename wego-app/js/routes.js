window.WEGO_APP_ROUTES = [
  {
    routeId: 'quick-publish-product',
    scene: '快捷发布产品',
    script: './scenes/快捷发布产品/scene.js',
    style: './scenes/快捷发布产品/scene.css',
    entry: {
      tab: 'dongtai',
      group: 'dongtai-navbar-publish',
      label: '快捷发布',
      type: 'custom'
    }
  },
  /*
   * AI 生成新业务场景时按 route_id upsert:
   * {
   *   routeId: 'my-permission-management',
   *   scene: '权限管理',
   *   script: './scenes/权限管理/scene.js',
   *   style: './scenes/权限管理/scene.css',
   *   entry: {
   *     tab: 'my',
   *     group: 'my-settings',
   *     label: '权限管理',
   *     type: 'cell',
   *     parentEntry: '设置'
   *   }
   * }
   */
  {
    routeId: 'workspace-merchant-workbench',
    scene: '商家工作台',
    script: './scenes/商家工作台/scene.js',
    style: './scenes/商家工作台/scene.css',
    entry: {
      tab: 'workspace',
      group: 'workspace-tab',
      label: '商家工作台',
      type: 'host-tab'
    }
  },
  /*
   * 内部入口：『全部应用』挂在商家工作台常用应用区内，不从宿主分组挂载。
   * entry.group 指向不存在的容器名，app.js mountRouteEntries 的 if(!group) return 会优雅跳过宿主挂载，
   * 避免与商家工作台内部入口重复；该 route 仅通过商家工作台 scene.js 中 ctx.navigate('workspace-app-center') 触发。
   */
  {
    routeId: 'workspace-app-center',
    scene: '全部应用',
    script: './scenes/商家工作台/scene.js',
    style: './scenes/商家工作台/scene.css',
    entry: {
      tab: 'workspace',
      group: 'workspace-app-center-internal',
      label: '全部应用',
      type: 'cell'
    }
  },
  {
    routeId: 'my-price-management',
    scene: '价格权限管理',
    script: './scenes/价格权限管理/scene.js',
    style: './scenes/价格权限管理/scene.css',
    entry: {
      tab: 'my',
      group: 'my-app-center',
      label: '价格管理',
      type: 'grid-entry',
      icon: './lib/icons/app-center/价格管理.svg'
    }
  },
  {
    routeId: 'my-system-settings',
    scene: '系统设置',
    script: './scenes/系统设置/scene.js',
    style: './scenes/系统设置/scene.css',
    entry: {
      tab: 'my',
      group: 'my-settings',
      label: '设置',
      type: 'cell'
    }
  },
  /*
   * 内部入口：『产品与笔记』挂在系统设置列表内，不从宿主 my-settings 分组挂载。
   * entry.group 指向不存在的容器名，app.js mountRouteEntries 的 if(!group) return 会优雅跳过宿主挂载，
   * 避免与系统设置内部入口重复；该 route 仅通过系统设置 scene.js 中 ctx.navigate('my-product-note') 触发。
   */
  {
    routeId: 'my-product-note',
    scene: '产品与笔记',
    script: './scenes/产品与笔记/scene.js',
    style: './scenes/产品与笔记/scene.css',
    entry: {
      tab: 'my',
      group: 'my-system-settings-internal',
      label: '产品与笔记',
      type: 'cell'
    }
  },
  {
    routeId: 'my-inventory-management',
    scene: '库存管理',
    script: './scenes/库存管理/scene.js',
    style: './scenes/库存管理/scene.css',
    entry: {
      tab: 'my',
      group: 'my-app-center',
      label: '库存管理',
      type: 'grid-entry',
      icon: './lib/icons/app-center/库存管理.svg'
    }
  },
  /*
   * 内部入口：『补货计划』挂在商家工作台常用应用区，不从宿主 workspace 分组挂载。
   * entry.group 指向不存在的容器名，避免与商家工作台内部入口重复；
   * 该 route 仅通过商家工作台 scene.js 中 ctx.navigate('restock-plan') 触发。
   */
  {
    routeId: 'restock-plan',
    scene: '补货计划',
    script: './scenes/补货计划/scene.js',
    style: './scenes/补货计划/scene.css',
    entry: {
      tab: 'workspace',
      group: 'workspace-workbench-internal',
      label: '补货计划',
      type: 'cell'
    }
  },
  /*
   * 内部入口：『补货商品选择』仅由补货计划场景内部 push 打开，不从宿主直接挂载。
   */
  {
    routeId: 'restock-product-picker',
    scene: '补货商品选择',
    script: './scenes/补货商品选择/scene.js',
    style: './scenes/补货商品选择/scene.css',
    entry: {
      tab: 'workspace',
      group: 'restock-plan-internal',
      label: '补货商品选择',
      type: 'cell'
    }
  },
  {
    routeId: 'my-warehouse-management',
    scene: '仓库管理',
    script: './scenes/仓库管理/scene.js',
    style: './scenes/仓库管理/scene.css',
    entry: {
      tab: 'my',
      group: 'my-app-center',
      label: '仓库管理',
      type: 'grid-entry',
      icon: './lib/icons/app-center/配货管理.svg'
    }
  },
  /*
   * 内部入口：『交易设置』挂在系统设置列表内，不从宿主 my-settings 分组挂载。
   * entry.group 指向不存在的容器名，app.js mountRouteEntries 的 if(!group) return 会优雅跳过宿主挂载，
   * 避免与系统设置内部入口重复；该 route 仅通过系统设置 scene.js 中 ctx.navigate('my-trade-settings') 触发。
   */
  {
    routeId: 'my-trade-settings',
    scene: '交易设置',
    script: './scenes/交易设置/scene.js',
    style: './scenes/交易设置/scene.css',
    entry: {
      tab: 'my',
      group: 'my-system-settings-internal',
      label: '交易设置',
      type: 'cell'
    }
  },
  {
    routeId: 'friends',
    scene: '好友',
    script: './scenes/好友/scene.js',
    style: './scenes/好友/scene.css',
    entry: {
      tab: 'haoyou',
      group: 'friends-tab',
      label: '好友',
      type: 'host-tab'
    }
  }
];

(function loadProductFeed() {
  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './css/products.css';
  document.head.appendChild(style);

  var script = document.createElement('script');
  script.src = './js/products.js';
  document.body.appendChild(script);

  var feedScript = document.createElement('script');
  feedScript.src = './js/dynamic-feed.js';
  document.body.appendChild(feedScript);
})();
