var platform = typeof browser === 'undefined'
  ? chrome
  : browser

const script = document.createElement('script')
script.type = 'module'
script.src = platform.runtime.getURL('toolbar/bundle.min.js')
document.body.appendChild(script)

const liaison = document.createElement('liaison-app')

document.body.prepend(liaison)

platform.runtime.onMessage.addListener(request => {
  if (request.action === 'COLOR_MODE')
    liaison.setAttribute('color-mode', request.params.mode)
  else if (request.action === 'COLOR_SCHEME')
    liaison.setAttribute("color-scheme", request.params.mode)
})
