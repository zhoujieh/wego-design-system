window.WEGO_APP_ROUTES = [
  {
    routeId: 'album-product-feed',
    scene: '微购相册动态',
    script: 'scenes/微购相册动态/scene.js',
    style: 'scenes/微购相册动态/scene.css',
    entry: {
      type: 'host-tab',
      tab: 'dongtai',
      label: '动态'
    }
  },
  {
    routeId: 'friend-list',
    scene: '好友列表',
    script: 'scenes/好友列表/scene.js',
    style: 'scenes/好友列表/scene.css',
    entry: {
      type: 'host-tab',
      tab: 'haoyou',
      label: '好友'
    }
  },
  {
    routeId: 'dynamic-detail',
    scene: '动态详情',
    script: 'scenes/动态详情/scene.js',
    style: 'scenes/动态详情/scene.css'
  },
  {
    routeId: 'product-detail',
    scene: '商品详情',
    script: 'scenes/商品详情/scene.js',
    style: 'scenes/商品详情/scene.css'
  },
  {
    routeId: 'my',
    scene: '我的',
    script: 'scenes/我的/scene.js',
    style: 'scenes/我的/scene.css',
    entry: {
      type: 'host-tab',
      tab: 'my',
      label: '我的'
    }
  },
  {
    routeId: 'app-center',
    scene: '应用中心',
    script: 'scenes/应用中心/scene.js',
    style: 'scenes/应用中心/scene.css'
  }
];
