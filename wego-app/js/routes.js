window.WEGO_APP_ROUTES = [
  {
    routeId: 'dongtai',
    scene: '动态商品流',
    entry: { type: 'host-tab', tab: 'dongtai' },
    script: './scenes/动态商品流/scene.js',
    style: './scenes/动态商品流/scene.css'
  },
  {
    routeId: 'dongtai-product',
    scene: '动态商品流',
    entry: { type: 'push', parentEntry: 'dongtai', label: '产品详情' },
    script: './scenes/动态商品流/scene.js',
    style: './scenes/动态商品流/scene.css'
  },
  {
    routeId: 'wode',
    scene: '我的',
    entry: { type: 'host-tab', tab: 'my' },
    script: './scenes/我的/scene.js',
    style: './scenes/我的/scene.css'
  }
];
