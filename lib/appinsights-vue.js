// taken from bugsnag sources
const formatComponentName = (vm, includeFile) => {
  if (vm.$root === vm) { return '<Root>' }
  const options = typeof vm === 'function' && vm.cid != null
    ? vm.options
    : vm._isVue
      ? vm.$options || vm.constructor.options
      : vm || {}
  let name = options.name || options._componentTag
  const file = options.__file
  if (!name && file) {
    const match = file.match(/([^/\\]+)\.vue$/)
    name = match && match[1]
  }

  return (
    (name ? ('<' + (classify(name)) + '>') : '<Anonymous>') +
    (file && includeFile !== false ? (' at ' + file) : '')
  )
}

const classify = str =>
  str.replace(/(?:^|[-_])(\w)/g, c => c.toUpperCase()).replace(/[-_]/g, '')

export const setupVueErrorHandling = (vm, appInsights) => {
  const oldErrorHandler = vm.config.errorHandler

  vm.config.errorHandler = (err, vm, info) => {
    appInsights.trackException(
      {
        exception: err,
        properties: {
          errorInfo: info,
          component: vm ? formatComponentName(vm, true) : undefined,
          props: vm ? vm.$options.propsData : undefined
        }
      })
    appInsights.flush()
    if (typeof oldErrorHandler === 'function') {
      oldErrorHandler.call(vm, err, vm, info)
    }
  }
}

export const setupPageTracking = (router, appInsights) => {
  router.beforeEach((route, from, next) => {
    appInsights.startTrackPage(route.name)
    next()
  })

  router.afterEach((route) => {
    appInsights.stopTrackPage(route.name)
  })
}
