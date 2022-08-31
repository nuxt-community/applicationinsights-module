const path = require('path')
const deepMerge = require('deepmerge')
const AppInsights = require('applicationinsights')
const logger = require('consola').withScope('nuxt:appInsights')
const { requestHandler, errorHandler } = require('./serverHandlers')

module.exports = function appInsights (moduleOptions) {
  const defaults = {
    instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY || false,
    serverConnectionString: process.env.APPINSIGHTS_CONNECTION_STRING || false,
    disabled: process.env.APPINSIGHTS_DISABLED || false,
    initialize: process.env.APPINSIGHTS_INITIALIZE || true,
    disableClientSide: process.env.APPINSIGHTS_DISABLE_CLIENT_SIDE || false,
    disableServerSide: process.env.APPINSIGHTS_DISABLE_SERVER_SIDE || false,
    trackPageView: process.env.APPINSIGHTS_TRACK_PAGE_VIEW || true,
    serverConfig: {},
    clientConfig: {}
  }
  const { nuxt } = this

  const publicRuntimeConfig = (nuxt.options.publicRuntimeConfig || {}).appInsights || {}

  const topLevelOptions = this.options.appInsights || {}
  const options = deepMerge.all([defaults, topLevelOptions, moduleOptions, publicRuntimeConfig])

  if (options.disabled) {
    logger.info('Errors will not be logged because the disable option has been set')
    return
  }

  if (!options.instrumentationKey) {
    logger.info('Errors will not be logged because no instrumentationKey has been provided')
    return
  }

  // Register the client plugin
  if (!options.disableClientSide) {
    this.addTemplate({
      src: path.resolve(__dirname, 'appinsights-vue.js'),
      fileName: 'appinsights-vue.js'
    })
    this.addPlugin({
      src: path.resolve(__dirname, 'appinsights.client.js'),
      fileName: 'appinsights.client.js',
      mode: 'client',
      options: {
        config: {
          instrumentationKey: options.instrumentationKey,
          ...options.clientConfig
        },
        initialize: options.initialize,
        trackPageView: options.trackPageView
      }
    })
  }

  // Register the server plugin
  if (!options.disableServerSide) {
    const privateRuntimeConfig = (nuxt.options.privateRuntimeConfig || {}).appInsights || {}

    const optionsServer = deepMerge.all([options, privateRuntimeConfig])

    if (!optionsServer.serverConnectionString) {
      logger.info('Server errors will not be logged because no serverConnectionString provided')
      return
    }

    const appInsightsServer = AppInsights.setup(optionsServer.serverConnectionString)

    // Initialize AppInsights
    for (const [key, value] of Object.entries(optionsServer.serverConfig)) {
      AppInsights.defaultClient.config[key] = value
    }

    if (optionsServer.initialize) {
      appInsightsServer.start()
    }
    const appInsightsClient = AppInsights.defaultClient

    logger.success('Started logging errors to AppInsights')

    this.addPlugin({
      src: path.resolve(__dirname, 'appinsights.server.js'),
      fileName: 'appinsights.server.js',
      mode: 'server'
    })

    this.nuxt.hook('render:setupMiddleware', app => app.use(requestHandler(appInsightsClient)))
    this.nuxt.hook('render:errorMiddleware', app => app.use(errorHandler(appInsightsClient)))
    this.nuxt.hook('generate:routeFailed', ({ errors }) => {
      errors.forEach(({ error }) => {
        appInsightsClient.trackException({ exception: error })
      })
    })
  }
}
