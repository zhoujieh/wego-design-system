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
  }
];
