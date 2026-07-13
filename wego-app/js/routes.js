window.WEGO_APP_ROUTES = [
  {
    routeId: 'dynamic-home',
    scene: '动态首页',
    entry: {
      type: 'host-tab',
      tab: 'dongtai'
    },
    script: './scenes/动态首页/scene.js',
    style: './scenes/动态首页/scene.css'
  },
  {
    routeId: 'my-tab',
    scene: '我的tab',
    entry: {
      type: 'host-tab',
      tab: 'my'
    },
    script: './scenes/我的tab/scene.js',
    style: './scenes/我的tab/scene.css'
  }
];
