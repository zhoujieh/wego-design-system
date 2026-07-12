window.WEGO_APP_ROUTES = [
  {
    routeId: 'album-feed',
    scene: '相册动态',
    script: './scenes/相册动态/scene.js',
    style: './scenes/相册动态/scene.css',
    entry: {
      type: 'host-tab',
      tab: 'dongtai',
      label: '动态'
    }
  },
  {
    routeId: 'album-product-detail',
    scene: '相册动态',
    script: './scenes/相册动态/scene.js',
    style: './scenes/相册动态/scene.css',
    entry: {
      type: 'push',
      label: '商品详情'
    }
  },
  {
    routeId: 'album-image-viewer',
    scene: '相册动态',
    script: './scenes/相册动态/scene.js',
    style: './scenes/相册动态/scene.css',
    entry: {
      type: 'push',
      label: '图片查看'
    }
  }
];
