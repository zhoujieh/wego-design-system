window.WEGO_APP_ROUTES = [
  {
    routeId: 'dynamic-feed',
    scene: '微购相册动态',
    entry: { type: 'host-tab', tab: 'dongtai', label: '动态' },
    script: 'scenes/微购相册动态/scene.js',
    style: 'scenes/微购相册动态/scene.css'
  },
  {
    routeId: 'my-page',
    scene: '微购相册我的',
    entry: { type: 'host-tab', tab: 'my', label: '我的' },
    script: 'scenes/微购相册我的/scene.js',
    style: 'scenes/微购相册我的/scene.css'
  }
];
