window.WEGO_APP_ROUTES = [
  {
    routeId: 'dynamic-product-feed',
    scene: '动态商品流',
    script: './scenes/动态商品流/scene.js',
    style: './scenes/动态商品流/scene.css',
    entry: {
      tab: 'dongtai',
      type: 'host-tab',
      label: '动态'
    },
    presentation: {
      type: 'host-tab',
      transition: 'none',
      coversTabBar: false
    }
  },
  {
    routeId: 'dynamic-product-detail',
    scene: '商品详情',
    script: './scenes/动态商品流/scene.js',
    style: './scenes/动态商品流/scene.css',
    entry: {
      tab: 'dongtai'
    },
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    }
  }
];
