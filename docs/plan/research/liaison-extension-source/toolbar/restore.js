var platform = typeof browser === 'undefined'
  ? chrome
  : browser

var restore = () => {
  const liaison = document.createElement('liaison-app')
  document.body.prepend(liaison)
}

restore()
