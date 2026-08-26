window.WEGO_APP_ROUTES = [
{
  routeId: 'agent-resale',
  entry: {
    type: 'cell-entry',
    label: '代理商帮卖弹窗',
    group: 'dongtai-tools',
    tab: 'dongtai'
  },
  style: './scenes/帮卖分销/scene.css',
  script: './scenes/帮卖分销/scene.js'
},
{
  routeId: 'album-product-feed',
  entry: {
    type: 'host-tab',
    tab: 'dongtai'
  },
  style: './scenes/动态/scene.css',
  script: './scenes/动态/scene.js'
},
{
  routeId: 'app-center',
  entry: {
    type: 'grid-entry',
    label: '全部应用',
    group: 'workspace-tools',
    tab: 'workspace',
    icon: './lib/assets/icons/app-center/全部应用.svg'
  },
  style: './scenes/应用中心/scene.css',
  script: './scenes/应用中心/scene.js'
},
{
  routeId: 'component-preview',
  entry: {
    type: 'cell-entry',
    label: '组件预览',
    group: 'workspace-tools',
    tab: 'workspace'
  },
  style: './scenes/组件预览/scene.css',
  script: './scenes/组件预览/scene.js'
},
{
  routeId: 'friend-list',
  entry: {
    type: 'host-tab',
    tab: 'haoyou'
  },
  style: './scenes/好友列表/scene.css',
  script: './scenes/好友列表/scene.js'
},
{
  routeId: 'my',
  entry: {
    type: 'host-tab',
    tab: 'my'
  },
  style: './scenes/我的/scene.css',
  script: './scenes/我的/scene.js'
},
{
  routeId: 'publish-product',
  entry: {
    type: 'cell-entry',
    label: '发布产品',
    group: 'dongtai-tools',
    tab: 'dongtai'
  },
  style: './scenes/发布产品/scene.css',
  script: './scenes/发布产品/scene.js'
},
{
  routeId: 'scene-manager',
  entry: {
    type: 'cell-entry',
    label: '场景管理',
    group: 'workspace-tools',
    tab: 'workspace'
  },
  style: './scenes/场景管理/scene.css',
  script: './scenes/场景管理/scene.js'
},
{
  routeId: 'workspace',
  entry: {
    type: 'host-tab',
    tab: 'workspace'
  },
  style: './scenes/工作台/scene.css',
  script: './scenes/工作台/scene.js'
},
{
  routeId: 'workspace-order-create',
  entry: {
    type: 'grid-entry',
    label: '收银开单',
    group: 'workspace-tools',
    tab: 'workspace',
    icon: './lib/assets/icons/app-center/销售单.svg'
  },
  style: './scenes/开单/scene.css',
  script: './scenes/开单/scene.js'
}
];
