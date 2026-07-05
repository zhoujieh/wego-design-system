window.WEGO_APP_ROUTES = [
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
  }
];
