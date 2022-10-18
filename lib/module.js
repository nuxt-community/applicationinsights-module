const path = require('path')
const { fileURLToPath } = require('url')
const AppInsights = require('applicationinsights')
const deepMerge = require('deepmerge')

const { defineNuxtModule, getNuxtVersion, logger, addTemplate, addPluginTemplate, hasNuxtCompatibility } = require('@nuxt/kit')
const { requestHandler, errorHandler } = require('./serverHandlers')

const DEFAULTS = {
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
module.exports = defineNuxtModule({
  meta: {
    name: '@nuxtjs/applicationinsights',
    configKey: 'appInsights',
    compatibility: {
      nuxt: '^2.0.0 || ^3.0.0-rc.7'
    }
  },
  defaults: DEFAULTS,
  async setup (_options, nuxt) {
    const options = deepMerge.all([_options, (nuxt.options.runtimeConfig ? nuxt.options.runtimeConfig.public.appInsights : (nuxt.options.publicRuntimeConfig || {}).appInsights) || {}, (nuxt.options.runtimeConfig ? nuxt.options.runtimeConfig.appInsights : (nuxt.options.privateRuntimeConfig || {}).appInsights) || {}])
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
      addTemplate({
        src: path.resolve(__dirname, 'appinsights-vue.js'),
        fileName: 'appinsights-vue.js'
      })
      addPluginTemplate({
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
      if (!options.serverConnectionString) {
        logger.info('Server errors will not be logged because no serverConnectionString provided')
        return
      }

      if (await hasNuxtCompatibility({ bridge: true })) {
        addTemplate({
          src: path.resolve(__dirname, 'runtime/appinsights.init.js'),
          fileName: 'appinsights.init.js'
        })
        addPluginTemplate({
          src: path.resolve(__dirname, 'runtime/appinsights.server.js'),
          fileName: 'appinsights.server.js',
          mode: 'server',
          options
        })
        nuxt.hook('nitro:config', (config) => {
          // Add a nitro plugin that will run the validator for us on each request
          config.plugins = config.plugins || []
          config.plugins.push(fileURLToPath(new URL('./runtime/nitro', import.meta.url)))
          config.virtual = config.virtual || {}
          config.virtual['#appinsights-config'] = `export default ${JSON.stringify(options)}`
          config.virtual['#existing-error-handler'] = `import errorHandler from '${config.errorHandler}';export default errorHandler`
          config.errorHandler = fileURLToPath(new URL('./runtime/errorHandler', import.meta.url))
        })
      } else {
        const appInsightsServer = AppInsights.setup(options.serverConnectionString)

        // Initialize AppInsights
        for (const [key, value] of Object.entries(options.serverConfig)) {
          AppInsights.defaultClient.config[key] = value
        }

        if (options.initialize) {
          appInsightsServer.start()
        }
        const appInsightsClient = AppInsights.defaultClient

        logger.success('Started logging errors to AppInsights')

        addPluginTemplate({
          src: path.resolve(__dirname, 'appinsights.server.js'),
          fileName: 'appinsights.server.js',
          mode: 'server'
        })

        nuxt.hook('render:setupMiddleware', app => app.use(requestHandler(appInsightsClient)))
        nuxt.hook('render:errorMiddleware', app => app.use(errorHandler(appInsightsClient)))
        nuxt.hook('generate:routeFailed', ({ errors }) => {
          errors.forEach(({ error }) => {
            appInsightsClient.trackException({ exception: error })
          })
        })
      }
    }
  }
})
