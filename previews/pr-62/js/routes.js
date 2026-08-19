window.WEGO_APP_ROUTES = [
{
  routeId: 'agent-resale',
  entry: {
    type: 'cell-entry',
    label: '代理商帮卖弹窗',
    group: 'workspace-tools',
    tab: 'workspace'
  },
  style: './scenes/帮卖分销/scene.css',
  script: './scenes/帮卖分销/scene.js'
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
}
];
